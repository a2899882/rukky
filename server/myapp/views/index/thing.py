# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from django.core.cache import cache

from myapp import utils
from myapp.handler import APIResponse
from myapp.models import Category, Thing, ThingSku, BasicTdk, BasicBanner, BasicSite
from myapp.serializers import ThingSerializer, CategorySerializer, ListThingSerializer, NormalCategorySerializer, \
    BasicSiteSerializer


def get_all_category_ids(category_id):
    ids = [category_id]
    sub_ids = Category.objects.filter(pid=category_id).values_list('id', flat=True)
    for sub_id in sub_ids:
        ids.extend(get_all_category_ids(sub_id))
    return ids


class MyPageNumberPagination(PageNumberPagination):
    page_size = 9  # 每页的默认项
    page_size_query_param = 'pageSize'  # 允许通过 URL 参数设置每页的大小
    max_page_size = 100  # 最大页尺寸


@api_view(['GET'])
def section(request):
    if request.method == 'GET':

        sectionData = {}

        # seo数据
        basicTdk = BasicTdk.get_solo()
        sectionData['seoData'] = {
            'seo_title': basicTdk.tdk_product_title,
            'seo_description': basicTdk.tdk_product_description,
            'seo_keywords': basicTdk.tdk_product_keywords,
        }

        # siteName
        basicSite = BasicSite.get_solo()
        basicSiteSerializer = BasicSiteSerializer(basicSite, many=False)
        sectionData['siteName'] = basicSiteSerializer.data['site_name']

        # banner数据
        basicBanner = BasicBanner.get_solo()
        sectionData['bannerData'] = basicBanner.banner_product

        # 左侧分类数据
        categories = Category.objects.filter(pid=-1).order_by('sort', '-id')
        categorySerializer = CategorySerializer(categories, many=True)
        sectionData['categoryData'] = categorySerializer.data
        # sectionData['categoryData'].insert(0, {
        #     "id": -1,
        #     "title": "All Products",
        # })

        # 左侧产品
        featuredThings = Thing.objects.filter(status=0, dimension__icontains="Feature").order_by('-create_time')[:4]
        thingSerializer = ListThingSerializer(featuredThings, many=True)
        sectionData['featuredData'] = thingSerializer.data

        # 产品数据
        searchQuery = request.GET.get("searchQuery", None)
        categoryId = request.GET.get("categoryId", None)
        if searchQuery:
            things = Thing.objects.filter(status=0, title__contains=searchQuery).order_by('-create_time')
        elif categoryId and categoryId != '-1':
            # 分类以及子分类的数据
            category_ids = get_all_category_ids(categoryId)
            things = Thing.objects.filter(category_id__in=category_ids, status=0).order_by('-create_time')
        else:
            things = Thing.objects.filter(status=0).order_by('-create_time')

        # 分页
        paginator = MyPageNumberPagination()
        paginated_things = paginator.paginate_queryset(things, request)
        total = things.count()

        serializer = ListThingSerializer(paginated_things, many=True)

        sectionData['productData'] = serializer.data
        sectionData['total'] = total

        return APIResponse(code=0, msg='查询成功', data=sectionData)


@api_view(['GET'])
def detail(request):
    data = {}
    try:
        pk = request.GET.get('id', -1)
        thing = Thing.objects.get(pk=pk)
    except Thing.DoesNotExist:
        utils.log_error(request, '对象不存在')
        return APIResponse(code=1, msg='对象不存在')

    if request.method == 'GET':
        serializer = ThingSerializer(thing)

        # siteName
        basicSite = BasicSite.get_solo()
        basicSiteSerializer = BasicSiteSerializer(basicSite, many=False)
        data['siteName'] = basicSiteSerializer.data['site_name']

        # 详情数据
        detail_data = serializer.data

        skus = list(ThingSku.objects.filter(thing=thing, status='0').values(
            'id', 'sku_code', 'attrs', 'price', 'stock', 'cover', 'status'
        ))
        detail_data['skus'] = skus

        data['detailData'] = detail_data

        # 相关产品
        category = Category.objects.get(pk=serializer.data['category'])
        relatedThings = category.category_thing.filter(status=0)[:4]
        thingSerializer = ListThingSerializer(relatedThings, many=True)
        data['relatedData'] = thingSerializer.data

        return APIResponse(code=0, msg='查询成功', data=data)
