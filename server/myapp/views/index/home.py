# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from django.core.cache import cache

from myapp import utils
from myapp.handler import APIResponse
from myapp.i18n import apply_translations_for_list, apply_translations_for_obj, get_lang_from_request
from myapp.models import Category, Thing, BasicTdk, BasicBanner, BasicAdditional, BasicGlobal, Comment, News, BasicSite
from myapp.serializers import ThingSerializer, CategorySerializer, ListThingSerializer, BasicGlobalSerializer, \
    CommentSerializer, NewsSerializer, NewsListSerializer, NormalCategorySerializer, BasicSiteSerializer


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
            'seo_title': basicTdk.tdk_home_title,
            'seo_description': basicTdk.tdk_home_description,
            'seo_keywords': basicTdk.tdk_home_keywords,
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
        sectionData['bannerData'] = basicBanner.banner_home

        # 分类数据
        categories = Category.objects.filter(pid=-1).order_by('sort', '-id')
        categorySerializer = NormalCategorySerializer(categories, many=True)
        sectionData['categoryData'] = categorySerializer.data
        apply_translations_for_list(lang, 'Category', sectionData['categoryData'], fields=['title'], id_key='id')

        # 精选产品
        featuredThings = Thing.objects.filter(status=0, dimension__icontains="Feature").order_by('-create_time')[:8]
        thingSerializer = ListThingSerializer(featuredThings, many=True)
        sectionData['featuredData'] = thingSerializer.data
        apply_translations_for_list(lang, 'Thing', sectionData['featuredData'], fields=['title', 'category_title'], id_key='id')

        # about us
        basicAdditional = BasicAdditional.get_solo()
        sectionData['aboutData'] = {
            'aboutText': basicAdditional.additional_about,
            'aboutCover': basicAdditional.global_addition_about_image,
        }
        apply_translations_for_obj(
            lang,
            'BasicAdditional',
            sectionData['aboutData'],
            fields=['aboutText'],
            object_id=str(getattr(basicAdditional, 'id', '') or ''),
        )
        basicGlobal = BasicGlobal.get_solo()
        basicGlobalSerializer = BasicGlobalSerializer(basicGlobal, many=False)
        sectionData['companyName'] = basicGlobalSerializer.data['global_company_name']
        apply_translations_for_obj(
            lang,
            'BasicGlobal',
            sectionData,
            fields=['companyName'],
            object_id=str(getattr(basicGlobal, 'id', '') or ''),
        )

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

        # stats
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

        # hero文案
        sectionData['heroText'] = basicAdditional.ext01
        apply_translations_for_obj(
            lang,
            'BasicAdditional',
            sectionData,
            fields=['heroText'],
            object_id=str(getattr(basicAdditional, 'id', '') or ''),
        )

        # 客评
        comments = Comment.objects.all()[:4]
        commentSerializer = CommentSerializer(comments, many=True)
        sectionData['commentData'] = commentSerializer.data

        # news
        news = News.objects.all()[:3]
        newsSerializer = NewsListSerializer(news, many=True)
        sectionData['newsData'] = newsSerializer.data
        apply_translations_for_list(lang, 'News', sectionData['newsData'], fields=['title'], id_key='id')

        # 联系底图
        sectionData['contactData'] = basicAdditional.global_addition_contact_image

        # 缓存数据
        cache.set(cache_key, sectionData, 300)  # 缓存300秒

        return APIResponse(code=0, msg='查询成功', data=sectionData)
