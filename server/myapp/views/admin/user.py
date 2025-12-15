# Create your views here.
import datetime

from django.core.cache import cache
from rest_framework.decorators import api_view, authentication_classes, throttle_classes
from rest_framework.throttling import AnonRateThrottle

from myapp import utils
from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.models import User
from myapp.permission.permission import isDemoAdminUser, check_if_demo
from myapp.serializers import UserSerializer, NormalUserSerializer
from myapp.utils import md5value, after_call, clear_cache


class UserRateThrottle(AnonRateThrottle):
    # 限流 每小时10次
    THROTTLE_RATES = {"anon": "10/h"}


@api_view(['POST'])
@throttle_classes([UserRateThrottle])
def admin_login(request):
    username = request.data.get('username')
    raw_password = request.data.get('password')

    if not username or not raw_password:
        return APIResponse(code=1, msg='用户名或密码不能为空')

    ip = utils.get_ip(request)
    lock_key = f"admin_login_lock:{ip}"
    fail_key = f"admin_login_fail:{ip}"
    locked_until = cache.get(lock_key)
    now_ts = utils.get_timestamp()
    if locked_until and int(locked_until) > now_ts:
        remain_s = int((int(locked_until) - now_ts) / 1000)
        if remain_s < 1:
            remain_s = 1
        return APIResponse(code=1, msg=f'登录失败次数过多，请{remain_s}秒后再试')

    password = utils.md5value(raw_password)

    users = User.objects.filter(username=username, password=password)
    if len(users) > 0:
        user = users[0]
        ts = utils.get_timestamp()
        data = {
            'username': username,
            'password': password,
            'admin_token': md5value(username + str(ts)),  # 生成令牌
            'exp': ts + (24 * 60 * 60 * 1000)  # 刷新过期时间
        }

        if user.status == '1':
            return APIResponse(code=1, msg='该帐号已禁用')

        if user.role == '2':
            return APIResponse(code=1, msg='请使用管理员账号登录')

        serializer = UserSerializer(user, data=data)
        if serializer.is_valid():
            serializer.save()
            cache.delete(fail_key)
            cache.delete(lock_key)
            return APIResponse(code=0, msg='登录成功', data=serializer.data)
        else:
            print(serializer.errors)

    fails = cache.get(fail_key) or 0
    try:
        fails = int(fails)
    except Exception:
        fails = 0
    fails += 1
    cache.set(fail_key, fails, 60 * 30)
    if fails >= 5:
        cache.set(lock_key, now_ts + (15 * 60 * 1000), 60 * 20)
        return APIResponse(code=1, msg='登录失败次数过多，请稍后再试')

    return APIResponse(code=1, msg='用户名或密码错误')


@api_view(['GET'])
@authentication_classes([AdminTokenAuthtication])
def list_api(request):
    if request.method == 'GET':
        keyword = request.GET.get("keyword", '')
        users = User.objects.filter(username__contains=keyword).order_by('-create_time')
        serializer = NormalUserSerializer(users, many=True)
        return APIResponse(code=0, msg='查询成功', data=serializer.data)


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def create(request):
    print(request.data)
    if not request.data.get('username', None) or not request.data.get('password', None):
        return APIResponse(code=1, msg='用户名或密码不能为空')
    users = User.objects.filter(username=request.data['username'])
    if len(users) > 0:
        return APIResponse(code=1, msg='该用户名已存在')

    data = request.data.copy()
    data.update({'password': utils.md5value(request.data['password'])})
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return APIResponse(code=0, msg='创建成功', data=serializer.data)
    else:
        print(serializer.errors)

    return APIResponse(code=1, msg='创建失败')


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def update(request):
    try:
        pk = request.data['id']
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return APIResponse(code=1, msg='对象不存在')

    data = request.data.copy()
    if 'username' in data.keys():
        del data['username']
    if 'password' in data.keys():
        del data['password']
    serializer = UserSerializer(user, data=data)
    print(serializer.is_valid())
    if serializer.is_valid():
        serializer.save()
        return APIResponse(code=0, msg='更新成功', data=serializer.data)
    else:
        print(serializer.errors)
    return APIResponse(code=1, msg='更新失败')


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def updatePwd(request):
    try:
        pk = request.data.get('id', None)
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return APIResponse(code=1, msg='对象不存在')

    password = request.data.get('password', None)
    newPassword1 = request.data.get('newPassword1', None)
    newPassword2 = request.data.get('newPassword2', None)

    if not password or not newPassword1 or not newPassword2:
        return APIResponse(code=1, msg='不能为空')

    if user.password != utils.md5value(password):
        return APIResponse(code=1, msg='原密码不正确')

    if newPassword1 != newPassword2:
        return APIResponse(code=1, msg='两次密码不一致')

    data = request.data.copy()
    data.update({'password': utils.md5value(newPassword1)})
    serializer = UserSerializer(user, data=data)
    if serializer.is_valid():
        serializer.save()
        return APIResponse(code=0, msg='更新成功', data=serializer.data)
    else:
        print(serializer.errors)

    return APIResponse(code=1, msg='更新失败')


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
@after_call(clear_cache)
def delete(request):
    try:
        ids_arr = [request.data['id']]
        User.objects.filter(id__in=ids_arr).delete()
    except User.DoesNotExist:
        return APIResponse(code=1, msg='对象不存在')

    return APIResponse(code=0, msg='删除成功')
