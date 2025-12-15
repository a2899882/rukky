from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication

from myapp import utils
from myapp.models import User


# 后台接口认证
class AdminTokenAuthtication(BaseAuthentication):
    def authenticate(self, request):
        adminToken = request.META.get("HTTP_ADMINTOKEN")

        if not adminToken:
            adminToken = "0000000000"

        print("检查adminToken==>" + adminToken)
        users = User.objects.filter(admin_token=adminToken)
        """
        判定条件：
            1. 传了adminToken 
            2. 查到了该帐号 
            3. 过期机制
        """
        ts = utils.get_timestamp()
        if not adminToken or len(users) == 0 or int(users[0].exp) < ts:
            raise exceptions.AuthenticationFailed("token认证失败")
        else:
            print('adminToken验证----success')

