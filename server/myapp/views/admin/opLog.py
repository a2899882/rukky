# Create your views here.
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.pagination import PageNumberPagination

from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.models import OpLog
from myapp.permission.permission import isDemoAdminUser, check_if_demo
from myapp.serializers import OpLogSerializer


class MyPageNumberPagination(PageNumberPagination):
    page_size = 10  # 每页的默认项
    page_size_query_param = 'pageSize'  # 允许通过 URL 参数设置每页的大小
    max_page_size = 100  # 最大页尺寸


@api_view(['GET'])
def list_api(request):
    if request.method == 'GET':
        if request.method == 'GET':
            opLog = OpLog.objects.order_by('-re_time')

            # 分页
            paginator = MyPageNumberPagination()
            paginated_logs = paginator.paginate_queryset(opLog, request)
            total = opLog.count()

            serializer = OpLogSerializer(paginated_logs, many=True)
            return APIResponse(code=0, msg='查询成功', data=serializer.data, total=total)


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
def deleteAll(request):

    if request.method == 'POST':
        OpLog.objects.all().delete()
        return APIResponse(code=0, msg='操作成功')


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
def delete(request):
    if request.method == 'POST':
        try:
            ids = request.data['ids']
            ids_arr = ids.split(',')
            OpLog.objects.filter(id__in=ids_arr).delete()
        except OpLog.DoesNotExist:
            return APIResponse(code=1, msg='对象不存在')

        return APIResponse(code=0, msg='删除成功')
