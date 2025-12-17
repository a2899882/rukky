import os

import requests
from django.core.cache import cache
from rest_framework.decorators import api_view, authentication_classes

from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.models import ShopSettings


def _paypal_api_base():
    paypal_env = (os.getenv('PAYPAL_ENV') or 'sandbox').lower()
    return 'https://api-m.sandbox.paypal.com' if paypal_env != 'live' else 'https://api-m.paypal.com'


def _paypal_get_access_token():
    client_id = os.getenv('PAYPAL_CLIENT_ID')
    client_secret = os.getenv('PAYPAL_CLIENT_SECRET')
    if not client_id or not client_secret:
        return None, 'PayPal 未配置（缺少 PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET）'

    api_base = _paypal_api_base()
    try:
        resp = requests.post(
            f"{api_base}/v1/oauth2/token",
            auth=(client_id, client_secret),
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            data={'grant_type': 'client_credentials'},
            timeout=20,
        )
    except Exception:
        return None, 'PayPal token 请求失败'

    if resp.status_code >= 300:
        return None, 'PayPal token 请求失败'

    data = resp.json()
    return data.get('access_token'), None


@api_view(['GET'])
@authentication_classes([AdminTokenAuthtication])
def get_api(request):
    s = ShopSettings.get_solo()
    if not s:
        s = ShopSettings.objects.create()

    return APIResponse(code=0, msg='查询成功', data={
        'enableStripe': s.enable_stripe,
        'enablePayPal': s.enable_paypal,
        'defaultCurrency': s.default_currency,
        'defaultShippingFee': str(s.default_shipping_fee),
        'homeThemeId': getattr(s, 'home_theme_id', None) or '001',
        'stripeConfigured': bool(os.getenv('STRIPE_SECRET_KEY')),
        'paypalConfigured': bool(os.getenv('PAYPAL_CLIENT_ID')) and bool(os.getenv('PAYPAL_CLIENT_SECRET')),
        'paypalEnv': os.getenv('PAYPAL_ENV') or 'sandbox',
    })


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
def update_api(request):
    s = ShopSettings.get_solo()
    if not s:
        s = ShopSettings.objects.create()

    enable_stripe = request.data.get('enableStripe')
    enable_paypal = request.data.get('enablePayPal')
    default_currency = (request.data.get('defaultCurrency') or s.default_currency or 'USD').upper()
    default_shipping_fee = request.data.get('defaultShippingFee')
    home_theme_id = request.data.get('homeThemeId')

    if enable_stripe in ['1', '2']:
        s.enable_stripe = enable_stripe
    if enable_paypal in ['1', '2']:
        s.enable_paypal = enable_paypal
    if default_currency in ['USD', 'EUR', 'GBP', 'CNY']:
        s.default_currency = default_currency
    try:
        if default_shipping_fee is not None:
            s.default_shipping_fee = default_shipping_fee
    except Exception:
        pass

    if home_theme_id in ['001', '005', '010', '011']:
        s.home_theme_id = home_theme_id

    s.save()
    # Invalidate cached frontend sections so homepage theme changes take effect immediately
    cache.delete('section_view:/myapp/index/common/section')
    cache.delete('section_view:/myapp/index/home/section')
    return APIResponse(code=0, msg='更新成功')


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
def test_paypal(request):
    token, err = _paypal_get_access_token()
    if err:
        return APIResponse(code=1, msg=err)

    if not token:
        return APIResponse(code=1, msg='PayPal token 为空')

    return APIResponse(code=0, msg='连接成功')
