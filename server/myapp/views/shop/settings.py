from rest_framework.decorators import api_view

from myapp.handler import APIResponse
from myapp.models import ShopSettings


@api_view(['GET'])
def get_settings(request):
    s = ShopSettings.get_solo()
    if not s:
        s = ShopSettings.objects.create()

    return APIResponse(code=0, msg='查询成功', data={
        'enableStripe': s.enable_stripe == '1',
        'enablePayPal': s.enable_paypal == '1',
        'defaultCurrency': s.default_currency,
        'defaultShippingFee': str(s.default_shipping_fee),
    })
