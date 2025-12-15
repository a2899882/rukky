from django.core.cache import cache
from django.db.models import Q
from rest_framework.decorators import api_view

from myapp.handler import APIResponse
from myapp.models import BasicSite, Category, BasicGlobal
from myapp.serializers import BasicGlobalSerializer, BasicSiteSerializer


def create_nav_item(name, href, type="link", subItems=None):
    """
    创建导航项目的工具函数，减少代码重复
    """
    nav_item = {
        "name": name,
        "href": href,
        "type": type
    }
    if subItems:
        nav_item["subItems"] = subItems
    return nav_item


@api_view(['GET'])
def section(request):
    """
    获取导航和页脚数据的接口
    """
    if request.method == 'GET':
        # 使用请求相关缓存键
        cache_key = f"section_view:{request.get_full_path()}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return APIResponse(code=0, msg='查询成功', data=cached_data)

        # 获取所有需要的数据
        basicSite = BasicSite.get_solo()
        basicGlobal = BasicGlobal.get_solo()

        # 一次性获取所有分类数据
        all_categories = Category.objects.filter(
            Q(pid=-1) | Q(pid__in=Category.objects.filter(pid=-1).values_list('id', flat=True))
        ).order_by('sort', '-id')

        # 分离一级分类和二级分类
        parent_categories = {}
        child_categories = {}

        for category in all_categories:
            if category.pid == -1:
                parent_categories[category.id] = {
                    'id': category.id,
                    'title': category.title,
                    'cover': category.cover,
                    'sort': category.sort,
                    'children': []
                }
            else:
                if category.pid not in child_categories:
                    child_categories[category.pid] = []
                child_categories[category.pid].append({
                    'id': category.id,
                    'title': category.title,
                    'cover': category.cover,
                    'sort': category.sort
                })

        # 将子分类添加到父分类中
        for parent_id, children in child_categories.items():
            if parent_id in parent_categories:
                parent_categories[parent_id]['children'] = sorted(
                    children, key=lambda x: (x['sort'], -x['id'])
                )

        # 构建导航数据
        nav_data = {
            'basicSite': BasicSiteSerializer(basicSite).data,
            'basicGlobal': BasicGlobalSerializer(basicGlobal).data,
            'navigationItems': []
        }

        # 添加首页
        nav_data['navigationItems'].append(create_nav_item("Home", "/"))

        # 将分类数据转换为前端所需的格式
        formatted_categories = []
        for parent in parent_categories.values():
            parent_item = {
                'id': parent['id'],
                'name': parent['title'],
                'href': '/product/category/' + str(parent['id']),
                'type': 'link',
                'subItems': []
            }

            if parent['children']:
                parent_item['type'] = 'dropdown'
                for child in parent['children']:
                    child_item = {
                        'id': child['id'],
                        'name': child['title'],
                        'href': '/product/category/' + str(child['id']),
                        'type': 'link',
                        'sort': child['sort']
                    }
                    parent_item['subItems'].append(child_item)

            formatted_categories.append(parent_item)

        # 导航项配置
        nav_items = [
            ("site_switch_product", "Product", "/product", "dropdown", formatted_categories),
            ("site_switch_about", "AboutUs", "/about"),
            ("site_switch_news", "News", "/news"),
            ("site_switch_download", "Download", "/download"),
            ("site_switch_case", "Case", "/case"),
            ("site_switch_faq", "Faq", "/faq"),
            ("site_switch_contact", "ContactUs", "/contact")
        ]

        # 添加导航项
        for item in nav_items:
            switch_attr, name, href = item[0], item[1], item[2]
            if getattr(basicSite, switch_attr) == '1':
                if len(item) > 3:  # 有子项的情况
                    nav_data['navigationItems'].append(create_nav_item(name, href, item[3], item[4]))
                else:
                    nav_data['navigationItems'].append(create_nav_item(name, href))

        # 构建页脚数据
        footer_data = {
            'navData': [create_nav_item("Home", "/", "link")],
            'contactData': BasicGlobalSerializer(basicGlobal).data,
            'categoryData': [],
            'basicSite': BasicSiteSerializer(basicSite).data
        }

        # 为页脚准备分类数据
        for parent in list(parent_categories.values())[:6]:
            footer_category = {
                'id': parent['id'],
                'pid': -1,
                'title': parent['title'],
                'sort': parent['sort'],
                'cover': parent['cover'],
                'children': parent['children']
            }
            footer_data['categoryData'].append(footer_category)

        # 页脚导航项
        footer_nav_items = [
            ("site_switch_product", "Product", "/product"),
            ("site_switch_about", "AboutUs", "/about"),
            ("site_switch_contact", "ContactUs", "/contact"),
            ("site_switch_news", "News", "/news"),
            ("site_switch_faq", "Faq", "/faq")
        ]

        # 添加页脚导航项
        for item in footer_nav_items:
            switch_attr, name, href = item[0], item[1], item[2]
            if getattr(basicSite, switch_attr) == '1':
                footer_data['navData'].append({"name": name, "href": href})

        # 组合最终数据
        data = {
            "navSectionData": nav_data,
            "footerSectionData": footer_data
        }

        # 缓存数据
        cache.set(cache_key, data, 3600)  # 缓存3600秒

        return APIResponse(code=0, msg='查询成功', data=data)
