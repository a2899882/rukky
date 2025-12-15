import json
import os

import requests
import stripe
from django.db import transaction
from django.conf import settings
from rest_framework.decorators import api_view

from myapp.handler import APIResponse
from myapp.models import Order, Payment, ShopSettings, OrderItem, Thing, ThingSku


def _public_base_url():
    public_base = os.getenv('PUBLIC_BASE_URL') or getattr(settings, 'BASE_HOST_URL', '').rstrip('/')
    return (public_base or '').rstrip('/')


def _paypal_api_base():
    paypal_env = (os.getenv('PAYPAL_ENV') or 'sandbox').lower()
    return 'https://api-m.sandbox.paypal.com' if paypal_env != 'live' else 'https://api-m.paypal.com'


def _paypal_get_access_token():
    client_id = os.getenv('PAYPAL_CLIENT_ID')
    client_secret = os.getenv('PAYPAL_CLIENT_SECRET')
    if not client_id or not client_secret:
        return None, 'PayPal 未配置（缺少 PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET）'

    api_base = _paypal_api_base()
    try:
        resp = requests.post(
            f"{api_base}/v1/oauth2/token",
            auth=(client_id, client_secret),
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            data={'grant_type': 'client_credentials'},
            timeout=20,
        )
    except Exception:
        return None, 'PayPal token 请求失败'

    if resp.status_code >= 300:
        return None, 'PayPal token 请求失败'

    data = resp.json()
    return data.get('access_token'), None


def _deduct_inventory_for_order(order_id):
    """Best-effort inventory deduction.

    Returns: (ok: bool, msg: Optional[str])
    """

    with transaction.atomic():
        try:
            order = Order.objects.select_for_update().get(pk=order_id)
        except Order.DoesNotExist:
            return False, '订单不存在'

        if str(getattr(order, 'inventory_deducted', '2')) == '1':
            return True, None

        items = list(OrderItem.objects.select_related('thing', 'sku').filter(order=order))
        for it in items:
            thing = it.thing
            if not thing:
                continue

            if str(getattr(thing, 'track_stock', '2')) != '1':
                continue

            qty = int(it.quantity or 0)
            if qty <= 0:
                continue

            if it.sku_id:
                sku = ThingSku.objects.select_for_update().get(pk=it.sku_id)
                if sku.status != '0':
                    return False, 'SKU已下架'
                if int(sku.stock or 0) < qty:
                    return False, '库存不足'
                sku.stock = int(sku.stock or 0) - qty
                sku.save(update_fields=['stock', 'update_time'])
            else:
                t = Thing.objects.select_for_update().get(pk=thing.id)
                if int(t.stock or 0) < qty:
                    return False, '库存不足'
                t.stock = int(t.stock or 0) - qty
                t.save(update_fields=['stock'])

        order.inventory_deducted = '1'
        order.save(update_fields=['inventory_deducted', 'update_time'])
        return True, None


@api_view(['POST'])
def stripe_create_session(request):
    """Stripe Checkout Session"""

    order_no = request.data.get('orderNo')
    token = request.data.get('token')

    if not order_no or not token:
        return APIResponse(code=1, msg='orderNo与token不能为空')

    try:
        order = Order.objects.get(order_no=order_no, query_token=token)
    except Order.DoesNotExist:
        return APIResponse(code=1, msg='订单不存在或token不正确')

    if order.status != 'pending':
        return APIResponse(code=1, msg='订单状态不允许支付')

    s = ShopSettings.get_solo()
    if s and s.enable_stripe != '1':
        return APIResponse(code=1, msg='Stripe 已在后台关闭')

    stripe_key = os.getenv('STRIPE_SECRET_KEY')
    if not stripe_key:
        return APIResponse(code=1, msg='Stripe 未配置（缺少 STRIPE_SECRET_KEY）')

    stripe.api_key = stripe_key

    public_base = _public_base_url()
    if not public_base:
        return APIResponse(code=1, msg='缺少 PUBLIC_BASE_URL')

    success_url = f"{public_base}/payment/stripe/success?orderNo={order.order_no}&token={order.query_token}&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{public_base}/payment/stripe/cancel?orderNo={order.order_no}&token={order.query_token}"

    payment = Payment.objects.create(order=order, provider='stripe', status='created')

    session = stripe.checkout.Session.create(
        mode='payment',
        success_url=success_url,
        cancel_url=cancel_url,
        client_reference_id=order.order_no,
        metadata={
            'order_no': order.order_no,
            'payment_id': str(payment.id),
        },
        line_items=[
            {
                'quantity': 1,
                'price_data': {
                    'currency': order.currency.lower(),
                    'unit_amount': int(order.total * 100),
                    'product_data': {
                        'name': f"Order {order.order_no}",
                    },
                },
            }
        ],
    )

    payment.provider_ref = session.id
    payment.status = 'pending'
    payment.raw = json.dumps({'session_id': session.id})
    payment.save(update_fields=['provider_ref', 'status', 'raw', 'update_time'])

    return APIResponse(code=0, msg='创建成功', data={
        'paymentId': payment.id,
        'provider': 'stripe',
        'checkoutUrl': session.url,
    })


@api_view(['POST'])
def stripe_confirm(request):
    order_no = request.data.get('orderNo')
    token = request.data.get('token')
    session_id = request.data.get('sessionId')

    if not order_no or not token or not session_id:
        return APIResponse(code=1, msg='orderNo/token/sessionId不能为空')

    try:
        order = Order.objects.get(order_no=order_no, query_token=token)
    except Order.DoesNotExist:
        return APIResponse(code=1, msg='订单不存在或token不正确')

    stripe_key = os.getenv('STRIPE_SECRET_KEY')
    if not stripe_key:
        return APIResponse(code=1, msg='Stripe 未配置（缺少 STRIPE_SECRET_KEY）')

    stripe.api_key = stripe_key

    # 幂等：已支付直接返回
    if order.status == 'paid':
        return APIResponse(code=0, msg='确认成功', data={'orderNo': order.order_no, 'status': order.status})

    session = stripe.checkout.Session.retrieve(session_id)

    if session.get('payment_status') != 'paid':
        return APIResponse(code=1, msg='支付未完成')

    # 校验订单号与金额/币种
    meta = session.get('metadata') or {}
    ref_order_no = meta.get('order_no') or session.get('client_reference_id')
    if ref_order_no and ref_order_no != order.order_no:
        return APIResponse(code=1, msg='订单校验失败')

    currency = (session.get('currency') or '').upper()
    amount_total = session.get('amount_total')
    try:
        expected_amount = int(order.total * 100)
    except Exception:
        expected_amount = None
    if currency and currency != order.currency:
        return APIResponse(code=1, msg='币种校验失败')
    if expected_amount is not None and amount_total is not None and int(amount_total) != expected_amount:
        return APIResponse(code=1, msg='金额校验失败')

    Payment.objects.filter(order=order, provider='stripe', provider_ref=session_id).update(status='paid')
    if order.status != 'paid':
        ok, msg = _deduct_inventory_for_order(order.id)
        if not ok:
            order.status = 'paid'
            order.save(update_fields=['status', 'update_time'])
            return APIResponse(code=1, msg=msg or '库存扣减失败，请联系商家处理')
        order.status = 'paid'
        order.save(update_fields=['status', 'update_time'])

    return APIResponse(code=0, msg='确认成功', data={'orderNo': order.order_no, 'status': order.status})


@api_view(['POST'])
def stripe_webhook(request):
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    if not webhook_secret:
        return APIResponse(code=1, msg='Stripe 未配置（缺少 STRIPE_WEBHOOK_SECRET）')

    stripe_key = os.getenv('STRIPE_SECRET_KEY')
    if not stripe_key:
        return APIResponse(code=1, msg='Stripe 未配置（缺少 STRIPE_SECRET_KEY）')
    stripe.api_key = stripe_key

    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    try:
        event = stripe.Webhook.construct_event(payload=payload, sig_header=sig_header, secret=webhook_secret)
    except Exception:
        return APIResponse(code=1, msg='Webhook signature verify failed', status=400)

    if event.get('type') == 'checkout.session.completed':
        session = event['data']['object']
        order_no = (session.get('metadata') or {}).get('order_no') or session.get('client_reference_id')
        session_id = session.get('id')

        if order_no and session_id:
            try:
                order = Order.objects.get(order_no=order_no)
                # 校验金额/币种
                currency = (session.get('currency') or '').upper()
                amount_total = session.get('amount_total')
                expected_amount = int(order.total * 100)
                if currency and currency != order.currency:
                    return APIResponse(code=1, msg='币种校验失败', status=400)
                if amount_total is not None and int(amount_total) != expected_amount:
                    return APIResponse(code=1, msg='金额校验失败', status=400)

                Payment.objects.filter(order=order, provider='stripe', provider_ref=session_id).update(status='paid')
                if order.status != 'paid':
                    ok, msg = _deduct_inventory_for_order(order.id)
                    if not ok:
                        order.status = 'paid'
                        order.save(update_fields=['status', 'update_time'])
                        return APIResponse(code=1, msg=msg or '库存扣减失败', status=400)
                    order.status = 'paid'
                    order.save(update_fields=['status', 'update_time'])
            except Order.DoesNotExist:
                pass

    return APIResponse(code=0, msg='ok')


@api_view(['POST'])
def paypal_create_order(request):
    """PayPal create order"""

    order_no = request.data.get('orderNo')
    token = request.data.get('token')

    if not order_no or not token:
        return APIResponse(code=1, msg='orderNo与token不能为空')

    try:
        order = Order.objects.get(order_no=order_no, query_token=token)
    except Order.DoesNotExist:
        return APIResponse(code=1, msg='订单不存在或token不正确')

    if order.status != 'pending':
        return APIResponse(code=1, msg='订单状态不允许支付')

    s = ShopSettings.get_solo()
    if s and s.enable_paypal != '1':
        return APIResponse(code=1, msg='PayPal 已在后台关闭')

    token, err = _paypal_get_access_token()
    if err:
        return APIResponse(code=1, msg=err)

    public_base = _public_base_url()
    if not public_base:
        return APIResponse(code=1, msg='缺少 PUBLIC_BASE_URL')

    api_base = _paypal_api_base()

    payment = Payment.objects.create(order=order, provider='paypal', status='created')

    resp = requests.post(
        f"{api_base}/v2/checkout/orders",
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'},
        json={
            'intent': 'CAPTURE',
            'purchase_units': [
                {
                    'reference_id': order.order_no,
                    'amount': {
                        'currency_code': order.currency,
                        'value': str(order.total),
                    },
                }
            ],
            'application_context': {
                'return_url': f"{public_base}/payment/paypal/success?orderNo={order.order_no}&q={order.query_token}",
                'cancel_url': f"{public_base}/payment/paypal/cancel?orderNo={order.order_no}&q={order.query_token}",
            },
        },
        timeout=20,
    )

    if resp.status_code >= 300:
        payment.status = 'failed'
        payment.raw = resp.text
        payment.save(update_fields=['status', 'raw', 'update_time'])
        return APIResponse(code=1, msg='PayPal create order failed')

    data = resp.json()
    paypal_order_id = data.get('id')
    approve_url = ''
    for link in data.get('links') or []:
        if link.get('rel') == 'approve':
            approve_url = link.get('href')
            break

    payment.provider_ref = paypal_order_id
    payment.status = 'pending'
    payment.raw = json.dumps(data)
    payment.save(update_fields=['provider_ref', 'status', 'raw', 'update_time'])

    return APIResponse(code=0, msg='创建成功', data={
        'paymentId': payment.id,
        'provider': 'paypal',
        'approveUrl': approve_url,
        'paypalOrderId': paypal_order_id,
    })


@api_view(['POST'])
def paypal_capture(request):
    order_no = request.data.get('orderNo')
    token = request.data.get('token')
    paypal_order_id = request.data.get('paypalOrderId')

    if not order_no or not token or not paypal_order_id:
        return APIResponse(code=1, msg='orderNo/token/paypalOrderId不能为空')

    try:
        order = Order.objects.get(order_no=order_no, query_token=token)
    except Order.DoesNotExist:
        return APIResponse(code=1, msg='订单不存在或token不正确')

    # 幂等：已支付直接返回
    if order.status == 'paid':
        return APIResponse(code=0, msg='确认成功', data={'orderNo': order.order_no, 'status': order.status})

    token, err = _paypal_get_access_token()
    if err:
        return APIResponse(code=1, msg=err)

    api_base = _paypal_api_base()
    resp = requests.post(
        f"{api_base}/v2/checkout/orders/{paypal_order_id}/capture",
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'},
        timeout=20,
    )

    if resp.status_code >= 300:
        Payment.objects.filter(order=order, provider='paypal', provider_ref=paypal_order_id).update(status='failed', raw=resp.text)
        return APIResponse(code=1, msg='PayPal capture failed')

    data = resp.json()
    status = (data.get('status') or '').upper()
    if status != 'COMPLETED':
        Payment.objects.filter(order=order, provider='paypal', provider_ref=paypal_order_id).update(status='pending', raw=json.dumps(data))
        return APIResponse(code=1, msg='PayPal 未完成')

    # 校验金额/币种（取第一笔 purchase unit）
    try:
        pu = (data.get('purchase_units') or [])[0]
        amount = (pu.get('payments') or {}).get('captures')
        if amount:
            cap = amount[0]
            money = cap.get('amount') or {}
            currency_code = (money.get('currency_code') or '').upper()
            value = money.get('value')
            if currency_code and currency_code != order.currency:
                return APIResponse(code=1, msg='币种校验失败')
            if value is not None and str(value) != str(order.total):
                return APIResponse(code=1, msg='金额校验失败')
    except Exception:
        # 校验失败不直接放行
        return APIResponse(code=1, msg='PayPal 校验失败')

    Payment.objects.filter(order=order, provider='paypal', provider_ref=paypal_order_id).update(status='paid', raw=json.dumps(data))
    if order.status != 'paid':
        ok, msg = _deduct_inventory_for_order(order.id)
        if not ok:
            order.status = 'paid'
            order.save(update_fields=['status', 'update_time'])
            return APIResponse(code=1, msg=msg or '库存扣减失败，请联系商家处理')
        order.status = 'paid'
        order.save(update_fields=['status', 'update_time'])

    return APIResponse(code=0, msg='确认成功', data={'orderNo': order.order_no, 'status': order.status})
