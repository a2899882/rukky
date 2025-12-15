# Create your views here.

from rest_framework.decorators import api_view, authentication_classes

from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.models import BasicBanner
from myapp.permission.permission import isDemoAdminUser, check_if_demo
from myapp.serializers import BasicBannerSerializer
from myapp.utils import after_call, clear_cache


@api_view(['GET'])
@authentication_classes([AdminTokenAuthtication])
def list_api(request):
    if request.method == 'GET':
        basicBanner = BasicBanner.get_solo()

        serializer = BasicBannerSerializer(basicBanner, many=False)
        return APIResponse(code=0, msg='查询成功', data=serializer.data)




@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def update(request):

    try:
        basicBanner = BasicBanner.get_solo()
        serializer = BasicBannerSerializer(basicBanner, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse(code=0, msg='更新成功', data=serializer.data)
        else:
            print(serializer.errors)
    except BasicBanner.DoesNotExist:
        return APIResponse(code=1, msg='对象不存在')

    return APIResponse(code=1, msg='更新失败')


