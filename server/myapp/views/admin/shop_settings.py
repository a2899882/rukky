import os

import requests
import stripe
from django.core.cache import cache
from rest_framework.decorators import api_view, authentication_classes

from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.models import ShopSettings
from myapp.crypto import encrypt_text, decrypt_text


def _paypal_api_base(paypal_env: str = None):
    paypal_env = (paypal_env or os.getenv('PAYPAL_ENV') or 'sandbox').lower()
    return 'https://api-m.sandbox.paypal.com' if paypal_env != 'live' else 'https://api-m.paypal.com'


def _paypal_get_access_token(client_id: str = None, client_secret: str = None, paypal_env: str = None):
    client_id = client_id or os.getenv('PAYPAL_CLIENT_ID')
    client_secret = client_secret or os.getenv('PAYPAL_CLIENT_SECRET')
    if not client_id or not client_secret:
        return None, 'PayPal 未配置（缺少 PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET）'

    api_base = _paypal_api_base(paypal_env)
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

    stripe_key = None
    paypal_client_id = None
    paypal_client_secret = None
    try:
        stripe_key = decrypt_text(getattr(s, 'stripe_secret_key_enc', None))
    except Exception:
        stripe_key = None
    try:
        paypal_client_id = decrypt_text(getattr(s, 'paypal_client_id_enc', None))
    except Exception:
        paypal_client_id = None
    try:
        paypal_client_secret = decrypt_text(getattr(s, 'paypal_client_secret_enc', None))
    except Exception:
        paypal_client_secret = None

    paypal_env = getattr(s, 'paypal_env', None) or os.getenv('PAYPAL_ENV') or 'sandbox'

    return APIResponse(code=0, msg='查询成功', data={
        'enableStripe': s.enable_stripe,
        'enablePayPal': s.enable_paypal,
        'defaultCurrency': s.default_currency,
        'defaultShippingFee': str(s.default_shipping_fee),
        'homeThemeId': getattr(s, 'home_theme_id', None) or '001',
        'stripeConfigured': bool(stripe_key) or bool(os.getenv('STRIPE_SECRET_KEY')),
        'paypalConfigured': (bool(paypal_client_id) and bool(paypal_client_secret)) or (bool(os.getenv('PAYPAL_CLIENT_ID')) and bool(os.getenv('PAYPAL_CLIENT_SECRET'))),
        'paypalEnv': paypal_env,
        'stripeSecretKey': '',
        'stripeWebhookSecret': '',
        'paypalClientId': '',
        'paypalClientSecret': '',
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

    stripe_secret_key = request.data.get('stripeSecretKey')
    stripe_webhook_secret = request.data.get('stripeWebhookSecret')
    paypal_env = request.data.get('paypalEnv')
    paypal_client_id = request.data.get('paypalClientId')
    paypal_client_secret = request.data.get('paypalClientSecret')

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

    if 'stripeSecretKey' in request.data:
        if stripe_secret_key is not None and str(stripe_secret_key).strip() != '':
            s.stripe_secret_key_enc = encrypt_text(str(stripe_secret_key).strip())
        elif stripe_secret_key == '':
            s.stripe_secret_key_enc = None

    if 'stripeWebhookSecret' in request.data:
        if stripe_webhook_secret is not None and str(stripe_webhook_secret).strip() != '':
            s.stripe_webhook_secret_enc = encrypt_text(str(stripe_webhook_secret).strip())
        elif stripe_webhook_secret == '':
            s.stripe_webhook_secret_enc = None

    if paypal_env in ['sandbox', 'live']:
        s.paypal_env = paypal_env

    if 'paypalClientId' in request.data:
        if paypal_client_id is not None and str(paypal_client_id).strip() != '':
            s.paypal_client_id_enc = encrypt_text(str(paypal_client_id).strip())
        elif paypal_client_id == '':
            s.paypal_client_id_enc = None

    if 'paypalClientSecret' in request.data:
        if paypal_client_secret is not None and str(paypal_client_secret).strip() != '':
            s.paypal_client_secret_enc = encrypt_text(str(paypal_client_secret).strip())
        elif paypal_client_secret == '':
            s.paypal_client_secret_enc = None

    s.save()
    # Invalidate cached frontend sections so homepage theme changes take effect immediately
    cache.delete('section_view:/myapp/index/common/section')
    cache.delete('section_view:/myapp/index/home/section')
    return APIResponse(code=0, msg='更新成功')


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
def test_paypal(request):
    s = ShopSettings.get_solo()
    paypal_env = getattr(s, 'paypal_env', None) or os.getenv('PAYPAL_ENV') or 'sandbox'
    client_id = None
    client_secret = None
    try:
        client_id = decrypt_text(getattr(s, 'paypal_client_id_enc', None))
    except Exception:
        client_id = None
    try:
        client_secret = decrypt_text(getattr(s, 'paypal_client_secret_enc', None))
    except Exception:
        client_secret = None

    token, err = _paypal_get_access_token(client_id=client_id, client_secret=client_secret, paypal_env=paypal_env)
    if err:
        return APIResponse(code=1, msg=err)

    if not token:
        return APIResponse(code=1, msg='PayPal token 为空')

    return APIResponse(code=0, msg='连接成功')


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
def test_stripe(request):
    s = ShopSettings.get_solo()
    stripe_key = None
    try:
        stripe_key = decrypt_text(getattr(s, 'stripe_secret_key_enc', None))
    except Exception:
        stripe_key = None

    stripe_key = stripe_key or os.getenv('STRIPE_SECRET_KEY')
    if not stripe_key:
        return APIResponse(code=1, msg='Stripe 未配置（缺少 STRIPE_SECRET_KEY）')

    try:
        stripe.api_key = stripe_key
        stripe.Balance.retrieve()
    except Exception:
        return APIResponse(code=1, msg='Stripe 连接失败')

    return APIResponse(code=0, msg='连接成功')
