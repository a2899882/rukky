# Create your views here.

import json
from decimal import Decimal, InvalidOperation

from rest_framework.decorators import api_view, authentication_classes
from rest_framework.pagination import PageNumberPagination

from myapp import utils
from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.models import Category, Thing, ThingSku
from myapp.permission.permission import isDemoAdminUser, check_if_demo
from myapp.serializers import ThingSerializer, UpdateThingSerializer
from myapp.utils import after_call, clear_cache


def _format_sku_label(attrs):
    if not attrs:
        return ''
    if isinstance(attrs, dict):
        return ' / '.join([f"{k}:{v}" for k, v in attrs.items()])
    if isinstance(attrs, list):
        return ' / '.join([str(x) for x in attrs])
    return str(attrs)


def _sync_skus(thing, skus_payload):
    """Sync SKU list for a thing.

    skus_payload: list of {id?, sku_code?, attrs?, price?, stock?, cover?, status?}
    """
    if not isinstance(skus_payload, list):
        return

    existing = {str(s.id): s for s in ThingSku.objects.filter(thing=thing)}
    keep_ids = set()

    for row in skus_payload:
        if not isinstance(row, dict):
            continue

        sku_id = row.get('id')
        sku_obj = None
        if sku_id is not None and str(sku_id) in existing:
            sku_obj = existing[str(sku_id)]
            keep_ids.add(str(sku_obj.id))
        else:
            sku_obj = ThingSku.objects.create(thing=thing)
            keep_ids.add(str(sku_obj.id))

        sku_obj.sku_code = row.get('sku_code') or row.get('skuCode') or sku_obj.sku_code
        sku_obj.attrs = row.get('attrs')
        sku_obj.price = row.get('price') if row.get('price') is not None else sku_obj.price
        try:
            if row.get('stock') is not None:
                sku_obj.stock = int(row.get('stock') or 0)
        except Exception:
            pass
        sku_obj.cover = row.get('cover') if row.get('cover') is not None else sku_obj.cover
        status = str(row.get('status') or '')
        if status in ['0', '1']:
            sku_obj.status = status
        sku_obj.save()

    # delete removed
    for sid, sku in existing.items():
        if sid not in keep_ids:
            sku.delete()


def _parse_decimal(value, default=Decimal('0')):
    if value is None:
        return default
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return default


class MyPageNumberPagination(PageNumberPagination):
    page_size = 10  # 每页的默认项
    page_size_query_param = 'pageSize'  # 允许通过 URL 参数设置每页的大小
    max_page_size = 100  # 最大页尺寸


@api_view(['GET'])
def list_api(request):
    if request.method == 'GET':
        keyword = request.GET.get("keyword", None)
        c = request.GET.get("c", None)
        if keyword:
            things = Thing.objects.filter(title__contains=keyword).order_by('-create_time')
        elif c:
            category = Category.objects.get(pk=c)
            things = category.category_thing.all()
        else:
            things = Thing.objects.all().order_by('-create_time')

        # 分页
        paginator = MyPageNumberPagination()
        paginated_things = paginator.paginate_queryset(things, request)
        total = things.count()

        serializer = ThingSerializer(paginated_things, many=True)
        return APIResponse(code=0, msg='查询成功', data=serializer.data, total=total)


@api_view(['GET'])
def detail(request):
    try:
        pk = request.GET.get('id', -1)
        thing = Thing.objects.get(pk=pk)
    except Thing.DoesNotExist:
        utils.log_error(request, '对象不存在')
        return APIResponse(code=1, msg='对象不存在')

    if request.method == 'GET':
        serializer = ThingSerializer(thing)
        data = serializer.data
        skus = list(ThingSku.objects.filter(thing=thing).values(
            'id', 'sku_code', 'attrs', 'price', 'stock', 'cover', 'status'
        ))
        for s in skus:
            s['label'] = _format_sku_label(s.get('attrs'))
        data['skus'] = skus
        return APIResponse(code=0, msg='查询成功', data=data)


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def create(request):

    skus_raw = request.data.get('skus')
    serializer = ThingSerializer(data=request.data)
    if serializer.is_valid():
        obj = serializer.save()
        if skus_raw:
            try:
                skus_payload = json.loads(skus_raw) if isinstance(skus_raw, str) else skus_raw
                _sync_skus(obj, skus_payload)
            except Exception:
                pass
        return APIResponse(code=0, msg='创建成功', data=serializer.data)
    else:
        print(serializer.errors)
        utils.log_error(request, '参数错误')

    return APIResponse(code=1, msg='创建失败')


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def update(request):

    try:
        pk = request.data['id']
        thing = Thing.objects.get(pk=pk)
    except Thing.DoesNotExist:
        return APIResponse(code=1, msg='对象不存在')

    skus_raw = request.data.get('skus')

    serializer = UpdateThingSerializer(thing, data=request.data)
    if serializer.is_valid():
        obj = serializer.save()
        if skus_raw is not None:
            try:
                skus_payload = json.loads(skus_raw) if isinstance(skus_raw, str) else skus_raw
                _sync_skus(obj, skus_payload)
            except Exception:
                pass
        return APIResponse(code=0, msg='查询成功', data=serializer.data)
    else:
        print(serializer.errors)
        utils.log_error(request, '参数错误')

    return APIResponse(code=1, msg='更新失败')


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def delete(request):

    try:
        ids = request.data['ids']
        ids_arr = ids.split(',')
        Thing.objects.filter(id__in=ids_arr).delete()
    except Thing.DoesNotExist:
        return APIResponse(code=1, msg='对象不存在')
    return APIResponse(code=0, msg='删除成功')


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def quick_update(request):
    """后台快速更新：用于列表内修改 price/status 等轻量字段"""

    thing_id = request.data.get('id')
    if not thing_id:
        return APIResponse(code=1, msg='id不能为空')

    try:
        thing = Thing.objects.get(pk=thing_id)
    except Thing.DoesNotExist:
        return APIResponse(code=1, msg='对象不存在')

    fields = []

    if 'price' in request.data:
        thing.price = str(request.data.get('price') or '')
        fields.append('price')

    if 'status' in request.data:
        status = str(request.data.get('status') or '')
        if status not in ['0', '1']:
            return APIResponse(code=1, msg='status参数错误')
        thing.status = status
        fields.append('status')

    if not fields:
        return APIResponse(code=1, msg='没有可更新字段')

    thing.save(update_fields=fields)
    return APIResponse(code=0, msg='更新成功')


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def batch_update(request):
    """后台批量更新：ids + action

    action:
      - setStatus: {status: '0'|'1'}
      - setPrice: {price: '12.34'}
      - adjustPrice: {ratio: 1.1}  # 价格乘以 ratio
    """

    ids = request.data.get('ids') or []
    action = request.data.get('action')

    if not isinstance(ids, list) or len(ids) == 0:
        return APIResponse(code=1, msg='ids不能为空')
    if not action:
        return APIResponse(code=1, msg='action不能为空')

    qs = Thing.objects.filter(id__in=ids)

    if action == 'setStatus':
        status = str(request.data.get('status') or '')
        if status not in ['0', '1']:
            return APIResponse(code=1, msg='status参数错误')
        qs.update(status=status)
        return APIResponse(code=0, msg='更新成功')

    if action == 'setPrice':
        price = str(request.data.get('price') or '')
        qs.update(price=price)
        return APIResponse(code=0, msg='更新成功')

    if action == 'adjustPrice':
        ratio = _parse_decimal(request.data.get('ratio'), None)
        if ratio is None or ratio <= 0:
            return APIResponse(code=1, msg='ratio参数错误')

        for t in qs:
            p = _parse_decimal(t.price, Decimal('0'))
            t.price = str((p * ratio).quantize(Decimal('0.01')))
            t.save(update_fields=['price'])
        return APIResponse(code=0, msg='更新成功')

    return APIResponse(code=1, msg='action不支持')
