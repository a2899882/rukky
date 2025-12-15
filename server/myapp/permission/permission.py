from functools import wraps

from myapp.handler import APIResponse
from myapp.models import User


def isDemoAdminUser(request):
    adminToken = request.META.get("HTTP_ADMINTOKEN")
    users = User.objects.filter(admin_token=adminToken)
    if len(users) > 0:
        user = users[0]
        if user.role == '3':  # （角色3）表示演示帐号
            print('演示帐号-----是')
            return True
    return False


def check_if_demo(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if isDemoAdminUser(request):
            return APIResponse(code=1, msg='演示帐号无法操作')
        return view_func(request, *args, **kwargs)

    return _wrapped_view
