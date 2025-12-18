# Create your views here.

from rest_framework.decorators import api_view, throttle_classes
from rest_framework.throttling import AnonRateThrottle

from myapp import utils
from myapp.handler import APIResponse
from myapp.models import BasicGlobal
from myapp.serializers import InquirySerializer, BasicGlobalSerializer
from myapp.utils import send_email
from server.settings import SMTP_SERVER, SENDER_EMAIL, SENDER_PASS


class MyRateThrottle(AnonRateThrottle):
    # 限流 每小时10次
    THROTTLE_RATES = {"anon": "10/hour"}


@api_view(['POST'])
@throttle_classes([MyRateThrottle])
def create(request):
    data = request.data.copy()
    data['ip'] = utils.get_ip(request)
    serializer = InquirySerializer(data=data)
    if serializer.is_valid():
        inquiry = serializer.save()

        basicGlobal = BasicGlobal.get_solo()
        basicGlobalSerializer = BasicGlobalSerializer(basicGlobal, many=False)
        global_email = basicGlobalSerializer.data['global_email']

        # 发送邮件
        try:
            create_time = None
            try:
                create_time = inquiry.create_time.strftime('%Y-%m-%d %H:%M:%S') if getattr(inquiry, 'create_time', None) else None
            except Exception:
                create_time = None

            name = getattr(inquiry, 'name', None) or ''
            email = getattr(inquiry, 'email', None) or ''
            tel = getattr(inquiry, 'tel', None) or ''
            company = getattr(inquiry, 'company', None) or ''
            country = getattr(inquiry, 'country', None) or ''
            quantity = getattr(inquiry, 'quantity', None) or ''
            preferred_contact = getattr(inquiry, 'preferred_contact', None) or ''
            message = getattr(inquiry, 'message', None) or ''
            ip = getattr(inquiry, 'ip', None) or utils.get_ip(request)

            content = (
                "您好，<p>收到新的询盘：</p>"
                f"<p><b>Name</b>: {name}</p>"
                f"<p><b>Email</b>: {email}</p>"
                f"<p><b>Phone</b>: {tel}</p>"
                f"<p><b>Company</b>: {company}</p>"
                f"<p><b>Country/Region</b>: {country}</p>"
                f"<p><b>Quantity</b>: {quantity}</p>"
                f"<p><b>Preferred Contact</b>: {preferred_contact}</p>"
                f"<p><b>Message</b>: {message}</p>"
                f"<p><b>IP</b>: {ip}</p>"
                f"<p><b>Time</b>: {create_time or ''}</p>"
                "<p>请登录网站后台查看与跟进。</p>"
            )

            send_email(
                subject="询盘通知",
                receivers=global_email,
                content=content,
                smtp_server=SMTP_SERVER,
                port=465,
                sender_email=SENDER_EMAIL,
                sender_pass=SENDER_PASS
            )
        except Exception as e:
            try:
                utils.log_error(request, f"Inquiry email send failed: {str(e)}")
            except Exception:
                pass

        return APIResponse(code=0, msg='创建成功', data=serializer.data)
    else:
        print(serializer.errors)

    return APIResponse(code=1, msg='创建失败')
