from rest_framework.decorators import api_view

from myapp.handler import APIResponse
from myapp.i18n import apply_translations_for_list, apply_translations_for_obj, get_lang_from_request
from myapp.models import BasicSite, Category, BasicGlobal, BasicBanner, Thing, Faq, Download, BasicTdk
from myapp.serializers import CategorySerializer, BasicGlobalSerializer, ThingSerializer, FaqSerializer, \
    DownloadSerializer, BasicSiteSerializer


@api_view(['GET'])
def section(request):
    if request.method == 'GET':
        sectionData = {}

        lang = get_lang_from_request(request)

        # seo数据
        basicTdk = BasicTdk.get_solo()
        sectionData['seoData'] = {
            'seo_title': basicTdk.tdk_download_title,
            'seo_description': basicTdk.tdk_download_description,
            'seo_keywords': basicTdk.tdk_download_keywords,
        }
        apply_translations_for_obj(
            lang,
            'BasicTdk',
            sectionData['seoData'],
            fields=['seo_title', 'seo_description', 'seo_keywords'],
            object_id=str(getattr(basicTdk, 'id', '') or ''),
        )

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

        # banner数据
        basicBanner = BasicBanner.get_solo()
        sectionData['bannerData'] = basicBanner.banner_download

        # download列表
        downloads = Download.objects.all().order_by('-create_time')
        downloadSerializer = DownloadSerializer(downloads, many=True)
        sectionData['downloadData'] = downloadSerializer.data

        apply_translations_for_list(lang, 'Download', sectionData['downloadData'], fields=['title', 'summary', 'raw', 'link'], id_key='id')

        return APIResponse(code=0, msg='查询成功', data=sectionData)
