import random

from decimal import Decimal, InvalidOperation

from rest_framework.decorators import api_view

from myapp.handler import APIResponse
from myapp.models import Thing, ThingSku, Order, OrderItem
from myapp.utils import md5value


def _parse_decimal(value, default=Decimal('0')):
    if value is None:
        return default
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return default


def _gen_order_no():
    # 18~22 位左右的可读订单号
    return f"OD{md5value(str(random.random()))[:10].upper()}{random.randint(1000, 9999)}"


@api_view(['POST'])
def create(request):
    """游客下单：items + email/phone + currency

    items: [{"thingId": 1, "quantity": 2}]
    """

    items = request.data.get('items') or []
    currency = (request.data.get('currency') or 'USD').upper()
    email = (request.data.get('email') or '').strip()
    phone = (request.data.get('phone') or '').strip()

    if not isinstance(items, list) or len(items) == 0:
        return APIResponse(code=1, msg='items不能为空')

    if not email and not phone:
        return APIResponse(code=1, msg='邮箱或电话至少填写一个')

    if currency not in ['USD', 'EUR', 'GBP', 'CNY']:
        currency = 'USD'

    shipping_fee = _parse_decimal(request.data.get('shippingFee'), Decimal('0'))

    subtotal = Decimal('0')
    order_items = []

    for it in items:
        thing_id = it.get('thingId') or it.get('id')
        sku_id = it.get('skuId')
        qty = it.get('quantity') or 1
        try:
            qty = int(qty)
        except Exception:
            qty = 1
        if qty <= 0:
            qty = 1

        try:
            thing = Thing.objects.get(pk=thing_id)
        except Thing.DoesNotExist:
            return APIResponse(code=1, msg=f'产品不存在: {thing_id}')

        sku = None
        if sku_id:
            try:
                sku = ThingSku.objects.get(pk=sku_id, thing=thing)
            except ThingSku.DoesNotExist:
                return APIResponse(code=1, msg=f'SKU不存在: {sku_id}')

        # 下单时库存预校验（支付扣减时仍会二次校验）
        if str(thing.track_stock) == '1':
            if sku:
                if sku.status != '0':
                    return APIResponse(code=1, msg='SKU已下架')
                if int(sku.stock or 0) < qty:
                    return APIResponse(code=1, msg='库存不足')
            else:
                if int(thing.stock or 0) < qty:
                    return APIResponse(code=1, msg='库存不足')

        unit_price = _parse_decimal((sku.price if sku and sku.price is not None else thing.price), Decimal('0'))
        line_total = unit_price * Decimal(qty)
        subtotal += line_total

        order_items.append({
            'thing': thing,
            'sku': sku,
            'sku_snapshot': sku.attrs if sku and sku.attrs is not None else None,
            'title_snapshot': thing.title,
            'cover_snapshot': (sku.cover if sku and sku.cover else thing.cover),
            'unit_price': unit_price,
            'quantity': qty,
            'line_total': line_total,
        })

    total = subtotal + shipping_fee

    order_no = _gen_order_no()
    query_token = md5value(order_no)

    order = Order.objects.create(
        order_no=order_no,
        status='pending',
        currency=currency,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        total=total,
        customer_email=email,
        customer_phone=phone,
        query_token=query_token,
    )

    for oi in order_items:
        OrderItem.objects.create(
            order=order,
            thing=oi['thing'],
            sku=oi['sku'],
            sku_snapshot=str(oi['sku_snapshot']) if oi['sku_snapshot'] is not None else None,
            title_snapshot=oi['title_snapshot'],
            cover_snapshot=oi['cover_snapshot'],
            unit_price=oi['unit_price'],
            quantity=oi['quantity'],
            line_total=oi['line_total'],
        )

    return APIResponse(code=0, msg='创建成功', data={
        'orderNo': order.order_no,
        'token': order.query_token,
        'status': order.status,
        'currency': order.currency,
        'subtotal': str(order.subtotal),
        'shippingFee': str(order.shipping_fee),
        'total': str(order.total),
    })


@api_view(['GET'])
def query(request):
    order_no = (request.GET.get('orderNo') or '').strip()
    token = (request.GET.get('token') or '').strip()

    if not order_no or not token:
        return APIResponse(code=1, msg='orderNo与token不能为空')

    try:
        order = Order.objects.get(order_no=order_no, query_token=token)
    except Order.DoesNotExist:
        return APIResponse(code=1, msg='订单不存在或token不正确')

    items = list(OrderItem.objects.filter(order=order).values(
        'id',
        'thing_id',
        'title_snapshot',
        'cover_snapshot',
        'unit_price',
        'quantity',
        'line_total',
    ))

    for it in items:
        it['unit_price'] = str(it['unit_price'])
        it['line_total'] = str(it['line_total'])

    return APIResponse(code=0, msg='查询成功', data={
        'orderNo': order.order_no,
        'status': order.status,
        'currency': order.currency,
        'subtotal': str(order.subtotal),
        'shippingFee': str(order.shipping_fee),
        'total': str(order.total),
        'email': order.customer_email,
        'phone': order.customer_phone,
        'items': items,
        'createTime': order.create_time.strftime('%Y-%m-%d %H:%M:%S') if order.create_time else None,
    })
