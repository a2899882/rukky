from django.core.cache import cache
from rest_framework.decorators import api_view

from myapp.handler import APIResponse
from myapp.i18n import apply_translations_for_list, apply_translations_for_obj, get_lang_from_request
from myapp.models import BasicSite, Category, BasicGlobal, BasicBanner, Thing, BasicTdk, BasicAdditional, Advantage
from myapp.serializers import CategorySerializer, BasicGlobalSerializer, ThingSerializer, AdvantageSerializer, \
    BasicSiteSerializer


@api_view(['GET'])
def section(request):
    if request.method == 'GET':

        lang = get_lang_from_request(request)

        # 使用请求相关缓存键
        cache_key = f"section_view:{request.get_full_path()}|lang={lang}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return APIResponse(code=0, msg='查询成功', data=cached_data)

        sectionData = {}

        # seo数据
        basicTdk = BasicTdk.get_solo()
        sectionData['seoData'] = {
            'seo_title': basicTdk.tdk_about_title,
            'seo_description': basicTdk.tdk_about_description,
            'seo_keywords': basicTdk.tdk_about_keywords,
        }
        apply_translations_for_obj(
            lang,
            'BasicTdk',
            sectionData['seoData'],
            fields=['seo_title', 'seo_description', 'seo_keywords'],
            object_id=str(getattr(basicTdk, 'id', '') or ''),
        )

        # banner数据
        basicBanner = BasicBanner.get_solo()
        sectionData['bannerData'] = basicBanner.banner_about

        # companyName
        basicGlobal = BasicGlobal.get_solo()
        basicGlobalSerializer = BasicGlobalSerializer(basicGlobal, many=False)
        companyName = basicGlobalSerializer.data['global_company_name']

        sectionData['companyName'] = companyName
        apply_translations_for_obj(
            lang,
            'BasicGlobal',
            sectionData,
            fields=['companyName'],
            object_id=str(getattr(basicGlobal, 'id', '') or ''),
        )

        # about数据
        basicAdditional = BasicAdditional.get_solo()
        sectionData['aboutData'] = {
            'aboutText': basicAdditional.additional_about,
            'aboutCover': basicAdditional.global_addition_about_image,
            'companyName': sectionData.get('companyName') or companyName
        }
        apply_translations_for_obj(
            lang,
            'BasicAdditional',
            sectionData['aboutData'],
            fields=['aboutText'],
            object_id=str(getattr(basicAdditional, 'id', '') or ''),
        )

        # mission数据
        sectionData['missionData'] = {
            'missionText': basicAdditional.additional_mission,
            'missionCover': basicAdditional.global_addition_mission_image,
        }
        apply_translations_for_obj(
            lang,
            'BasicAdditional',
            sectionData['missionData'],
            fields=['missionText'],
            object_id=str(getattr(basicAdditional, 'id', '') or ''),
        )

        # 优势变量
        advantages = Advantage.objects.all()
        advantageSerializer = AdvantageSerializer(advantages, many=True)
        sectionData['advantageData'] = advantageSerializer.data
        apply_translations_for_list(
            lang,
            'Advantage',
            sectionData['advantageData'],
            fields=['advantage_title', 'advantage_description'],
            id_key='id',
        )

        # 工厂图片
        sectionData['companyImageData'] = basicAdditional.global_addition_company_image

        # 资质图片
        sectionData['certificationImageData'] = basicAdditional.ext02

        # 个性指标
        sectionData['statsData'] = {
            'param_one_name': basicAdditional.param_one_name,
            'param_one_value': basicAdditional.param_one_value,
            'param_two_name': basicAdditional.param_two_name,
            'param_two_value': basicAdditional.param_two_value,
            'param_three_name': basicAdditional.param_three_name,
            'param_three_value': basicAdditional.param_three_value,
            'param_four_name': basicAdditional.param_four_name,
            'param_four_value': basicAdditional.param_four_value,
        }
        apply_translations_for_obj(
            lang,
            'BasicAdditional',
            sectionData['statsData'],
            fields=['param_one_name', 'param_two_name', 'param_three_name', 'param_four_name'],
            object_id=str(getattr(basicAdditional, 'id', '') or ''),
        )

        # 联系底图
        sectionData['contactData'] = basicAdditional.global_addition_contact_image

        # siteName
        basicSite = BasicSite.get_solo()
        basicSiteSerializer = BasicSiteSerializer(basicSite, many=False)
        sectionData['siteName'] = basicSiteSerializer.data['site_name']
        apply_translations_for_obj(
            lang,
            'BasicSite',
            sectionData,
            fields=['siteName'],
            object_id=str(getattr(basicSite, 'id', '') or ''),
        )


        # 缓存数据
        cache.set(cache_key, sectionData, 300)  # 缓存300秒

        return APIResponse(code=0, msg='查询成功', data=sectionData)
