from rest_framework.decorators import api_view, authentication_classes

from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.models import Payment


@api_view(['GET'])
@authentication_classes([AdminTokenAuthtication])
def list_api(request):
    provider = request.GET.get('provider', '')
    status = request.GET.get('status', '')

    qs = Payment.objects.select_related('order').all().order_by('-create_time')
    if provider:
        qs = qs.filter(provider=provider)
    if status:
        qs = qs.filter(status=status)

    data = []
    for p in qs[:500]:
        data.append({
            'id': p.id,
            'provider': p.provider,
            'status': p.status,
            'provider_ref': p.provider_ref,
            'order_no': p.order.order_no if p.order_id else None,
            'amount': str(p.order.total) if p.order_id else None,
            'currency': p.order.currency if p.order_id else None,
            'create_time': p.create_time.strftime('%Y-%m-%d %H:%M:%S') if p.create_time else None,
            'update_time': p.update_time.strftime('%Y-%m-%d %H:%M:%S') if p.update_time else None,
        })

    return APIResponse(code=0, msg='查询成功', data=data)
