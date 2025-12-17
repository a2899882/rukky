from django.core.cache import cache
from rest_framework.decorators import api_view

from myapp.handler import APIResponse
from myapp.i18n import apply_translations_for_list, apply_translations_for_obj, get_lang_from_request
from myapp.models import BasicSite, Category, BasicGlobal, BasicBanner, Thing, BasicTdk
from myapp.serializers import CategorySerializer, BasicGlobalSerializer, ThingSerializer, ListThingSerializer, \
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
            'seo_title': basicTdk.tdk_contact_title,
            'seo_description': basicTdk.tdk_contact_description,
            'seo_keywords': basicTdk.tdk_contact_keywords,
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
        sectionData['bannerData'] = basicBanner.banner_contact

        # 联系信息
        basicGlobal = BasicGlobal.get_solo()
        basicGlobalSerializer = BasicGlobalSerializer(basicGlobal, many=False)
        sectionData['contactData'] = basicGlobalSerializer.data
        apply_translations_for_obj(
            lang,
            'BasicGlobal',
            sectionData['contactData'],
            fields=['global_company_name', 'global_email', 'global_address', 'global_phone'],
            object_id=str(getattr(basicGlobal, 'id', '') or ''),
        )

        # 推荐数据
        things = Thing.objects.filter(status=0, dimension__icontains="Recommend").order_by('-create_time')[:4]
        thingSerializer = ListThingSerializer(things, many=True)
        sectionData['recommendData'] = thingSerializer.data
        apply_translations_for_list(lang, 'Thing', sectionData['recommendData'], fields=['title', 'category_title'], id_key='id')

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
