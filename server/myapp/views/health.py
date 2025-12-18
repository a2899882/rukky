from django.core.cache import cache
from rest_framework.decorators import api_view

from myapp.handler import APIResponse
from myapp.models import ShopSettings


@api_view(['GET'])
def healthz(request):
    db_ok = True
    cache_ok = True

    try:
        s = ShopSettings.get_solo()
        if not s:
            ShopSettings.objects.create()
    except Exception:
        db_ok = False

    try:
        cache_key = 'healthz:ping'
        cache.set(cache_key, '1', 5)
        cache_ok = cache.get(cache_key) == '1'
    except Exception:
        cache_ok = False

    ok = db_ok and cache_ok

    return APIResponse(code=0 if ok else 1, msg='ok' if ok else 'fail', data={
        'db': 'ok' if db_ok else 'fail',
        'cache': 'ok' if cache_ok else 'fail',
    })
