from rest_framework.decorators import api_view, authentication_classes

from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.models import Order, OrderItem, Payment


@api_view(['GET'])
@authentication_classes([AdminTokenAuthtication])
def list_api(request):
    keyword = request.GET.get('keyword', '')
    status = request.GET.get('status', '')

    qs = Order.objects.all().order_by('-create_time')
    if keyword:
        qs = qs.filter(order_no__contains=keyword)
    if status:
        qs = qs.filter(status=status)

    data = list(qs.values(
        'id',
        'order_no',
        'status',
        'currency',
        'subtotal',
        'shipping_fee',
        'total',
        'customer_email',
        'customer_phone',
        'create_time',
    ))

    for it in data:
        it['subtotal'] = str(it['subtotal'])
        it['shipping_fee'] = str(it['shipping_fee'])
        it['total'] = str(it['total'])
        it['create_time'] = it['create_time'].strftime('%Y-%m-%d %H:%M:%S') if it['create_time'] else None

    return APIResponse(code=0, msg='查询成功', data=data)


@api_view(['GET'])
@authentication_classes([AdminTokenAuthtication])
def detail(request):
    order_id = request.GET.get('id')
    if not order_id:
        return APIResponse(code=1, msg='id不能为空')

    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return APIResponse(code=1, msg='订单不存在')

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

    payments = list(Payment.objects.filter(order=order).values(
        'id',
        'provider',
        'status',
        'provider_ref',
        'create_time',
        'update_time',
    ))

    for p in payments:
        p['create_time'] = p['create_time'].strftime('%Y-%m-%d %H:%M:%S') if p['create_time'] else None
        p['update_time'] = p['update_time'].strftime('%Y-%m-%d %H:%M:%S') if p['update_time'] else None

    return APIResponse(code=0, msg='查询成功', data={
        'id': order.id,
        'orderNo': order.order_no,
        'status': order.status,
        'currency': order.currency,
        'subtotal': str(order.subtotal),
        'shippingFee': str(order.shipping_fee),
        'total': str(order.total),
        'email': order.customer_email,
        'phone': order.customer_phone,
        'createTime': order.create_time.strftime('%Y-%m-%d %H:%M:%S') if order.create_time else None,
        'items': items,
        'payments': payments,
    })


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
def update_status(request):
    order_id = request.data.get('id')
    status = request.data.get('status')

    if not order_id or not status:
        return APIResponse(code=1, msg='id/status不能为空')

    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return APIResponse(code=1, msg='订单不存在')

    status = str(status)
    if status not in ['fulfilled', 'completed']:
        return APIResponse(code=1, msg='非法状态')

    if status == 'fulfilled' and order.status != 'paid':
        return APIResponse(code=1, msg='仅已支付订单可标记发货')

    if status == 'completed' and order.status != 'fulfilled':
        return APIResponse(code=1, msg='仅已发货订单可标记完成')

    order.status = status
    order.save(update_fields=['status', 'update_time'])
    return APIResponse(code=0, msg='更新成功', data={'id': order.id, 'status': order.status})
