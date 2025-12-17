from rest_framework.decorators import api_view, authentication_classes
from rest_framework.pagination import PageNumberPagination

from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.models import I18nText
from myapp.permission.permission import check_if_demo
from myapp.utils import after_call, clear_cache


class MyPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'pageSize'
    max_page_size = 200


@api_view(['GET'])
@authentication_classes([AdminTokenAuthtication])
def list_api(request):
    model = (request.GET.get('model') or '').strip()
    object_id = (request.GET.get('objectId') or '').strip()
    field = (request.GET.get('field') or '').strip()
    lang = (request.GET.get('lang') or '').strip()
    keyword = (request.GET.get('keyword') or '').strip()

    qs = I18nText.objects.all().order_by('-update_time')
    if model:
        qs = qs.filter(model=model)
    if object_id:
        qs = qs.filter(object_id=object_id)
    if field:
        qs = qs.filter(field=field)
    if lang:
        qs = qs.filter(lang=lang)
    if keyword:
        qs = qs.filter(value__icontains=keyword)

    paginator = MyPageNumberPagination()
    page = paginator.paginate_queryset(qs, request)
    total = qs.count()

    data = list(page.values('id', 'model', 'object_id', 'field', 'lang', 'value', 'update_time', 'create_time'))
    return APIResponse(code=0, msg='查询成功', data=data, total=total)


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def upsert(request):
    model = (request.data.get('model') or '').strip()
    object_id = (request.data.get('objectId') or '').strip()
    field = (request.data.get('field') or '').strip()
    lang = (request.data.get('lang') or '').strip()
    value = request.data.get('value')

    if not model or not object_id or not field or not lang:
        return APIResponse(code=1, msg='参数不完整')

    obj, _created = I18nText.objects.update_or_create(
        model=model,
        object_id=object_id,
        field=field,
        lang=lang,
        defaults={'value': value},
    )

    data = {
        'id': obj.id,
        'model': obj.model,
        'object_id': obj.object_id,
        'field': obj.field,
        'lang': obj.lang,
        'value': obj.value,
    }
    return APIResponse(code=0, msg='保存成功', data=data)


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def delete(request):
    ids = request.data.get('ids')
    if not ids:
        return APIResponse(code=1, msg='缺少 ids')

    if isinstance(ids, str):
        ids_list = [x for x in ids.split(',') if x]
    else:
        ids_list = list(ids)

    I18nText.objects.filter(id__in=ids_list).delete()
    return APIResponse(code=0, msg='删除成功')
