from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination

from myapp import utils
from myapp.handler import APIResponse
from myapp.i18n import apply_translations_for_list, apply_translations_for_obj, get_lang_from_request
from myapp.models import BasicSite, Category, BasicGlobal, BasicBanner, Thing, News, BasicTdk
from myapp.serializers import CategorySerializer, BasicGlobalSerializer, ThingSerializer, \
    NormalCategorySerializer, NewsSerializer, NewsListSerializer, BasicSiteSerializer, ListThingSerializer


class MyPageNumberPagination(PageNumberPagination):
    page_size = 9  # 每页的默认项
    page_size_query_param = 'pageSize'  # 允许通过 URL 参数设置每页的大小
    max_page_size = 100  # 最大页尺寸


@api_view(['GET'])
def section(request):
    if request.method == 'GET':
        sectionData = {}

        lang = get_lang_from_request(request)

        # seo数据
        basicTdk = BasicTdk.get_solo()
        sectionData['seoData'] = {
            'seo_title': basicTdk.tdk_news_title,
            'seo_description': basicTdk.tdk_news_description,
            'seo_keywords': basicTdk.tdk_news_keywords,
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
        sectionData['bannerData'] = basicBanner.banner_news

        # 精选产品
        featuredThings = Thing.objects.filter(status=0, dimension__icontains="Feature").order_by('-create_time')[:8]
        thingSerializer = ListThingSerializer(featuredThings, many=True)
        sectionData['featuredData'] = thingSerializer.data

        # 分页列表
        news = News.objects.all().order_by('-create_time')
        paginator = MyPageNumberPagination()
        paginated_list = paginator.paginate_queryset(news, request)
        total = news.count()

        newsSerializer = NewsListSerializer(paginated_list, many=True)
        sectionData['newsData'] = newsSerializer.data
        sectionData['total'] = total

        apply_translations_for_list(lang, 'News', sectionData['newsData'], fields=['title'], id_key='id')

        return APIResponse(code=0, msg='查询成功', data=sectionData)


@api_view(['GET'])
def detail(request):
    data = {}
    try:
        pk = request.GET.get('id', -1)
        news = News.objects.get(pk=pk)
    except News.DoesNotExist:
        utils.log_error(request, '对象不存在')
        return APIResponse(code=1, msg='对象不存在')

    if request.method == 'GET':
        lang = get_lang_from_request(request)
        serializer = NewsSerializer(news)

        # siteName
        basicSite = BasicSite.get_solo()
        basicSiteSerializer = BasicSiteSerializer(basicSite, many=False)
        data['siteName'] = basicSiteSerializer.data['site_name']
        apply_translations_for_obj(
            lang,
            'BasicSite',
            data,
            fields=['siteName'],
            object_id=str(getattr(basicSite, 'id', '') or ''),
        )

        # 详情数据
        data['detailData'] = serializer.data
        apply_translations_for_obj(
            lang,
            'News',
            data['detailData'],
            fields=['title', 'summary', 'source', 'description', 'seo_title', 'seo_description', 'seo_keywords'],
            object_id=str(getattr(news, 'id', '') or ''),
        )

        # 推荐产品
        things = Thing.objects.filter(status=0, dimension__icontains="Recommend").order_by('-create_time')[:4]
        thingSerializer = ThingSerializer(things, many=True)
        data['recommendData'] = thingSerializer.data

        # 产品分类
        categories = Category.objects.filter(pid=-1).order_by('sort', '-id')
        categorySerializer = NormalCategorySerializer(categories, many=True)
        data['categoryData'] = categorySerializer.data
        apply_translations_for_list(lang, 'Category', data['categoryData'], fields=['title'], id_key='id')

        return APIResponse(code=0, msg='查询成功', data=data)
