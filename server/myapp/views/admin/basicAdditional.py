# Create your views here.

from rest_framework.decorators import api_view, authentication_classes

from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.models import BasicAdditional
from myapp.permission.permission import isDemoAdminUser, check_if_demo
from myapp.serializers import BasicAdditionalSerializer
from myapp.utils import clear_cache, after_call


@api_view(['GET'])
@authentication_classes([AdminTokenAuthtication])
def list_api(request):
    if request.method == 'GET':
        basicAdditional = BasicAdditional.get_solo()

        serializer = BasicAdditionalSerializer(basicAdditional, many=False)
        return APIResponse(code=0, msg='查询成功', data=serializer.data)




@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def update(request):

    try:
        basicAdditional = BasicAdditional.get_solo()
        serializer = BasicAdditionalSerializer(basicAdditional, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse(code=0, msg='更新成功', data=serializer.data)
        else:
            print(serializer.errors)
    except BasicAdditional.DoesNotExist:
        return APIResponse(code=1, msg='对象不存在')

    return APIResponse(code=1, msg='更新失败')


