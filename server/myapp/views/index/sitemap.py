from rest_framework.decorators import api_view, renderer_classes
from rest_framework.response import Response
from rest_framework.renderers import BaseRenderer
from django.utils import timezone
from django.core.cache import cache
from xml.etree.ElementTree import Element, SubElement, tostring
from typing import List, Dict
import logging

from myapp.models import Thing, Category, News, Case
from server.settings import BASE_HOST_URL

logger = logging.getLogger(__name__)


class XMLRenderer(BaseRenderer):
    media_type = 'text/xml'
    format = 'xml'
    charset = 'utf-8'

    def render(self, data, media_type=None, renderer_context=None):
        return data


def create_url_element(urlset: Element, loc: str, lastmod: str = None, changefreq: str = 'weekly',
                       priority: float = 0.5) -> None:
    """
    创建URL元素
    
    Args:
        urlset: XML根元素
        loc: 页面URL
        lastmod: 最后修改时间
        changefreq: 更新频率
        priority: 优先级
    """
    url = SubElement(urlset, 'url')

    # 添加loc
    loc_elem = SubElement(url, 'loc')
    loc_elem.text = loc

    # 添加lastmod
    if lastmod:
        lastmod_elem = SubElement(url, 'lastmod')
        lastmod_elem.text = lastmod

    # 添加changefreq
    changefreq_elem = SubElement(url, 'changefreq')
    changefreq_elem.text = changefreq

    # 添加priority
    priority_elem = SubElement(url, 'priority')
    priority_elem.text = str(priority)


def get_static_pages() -> List[Dict]:
    """获取静态页面配置"""
    return [
        {'loc': '/', 'priority': 1.0, 'changefreq': 'weekly'},
        {'loc': '/about', 'priority': 0.9, 'changefreq': 'weekly'},
        {'loc': '/contact', 'priority': 0.9, 'changefreq': 'weekly'},
        {'loc': '/product', 'priority': 0.9, 'changefreq': 'weekly'},
        {'loc': '/news', 'priority': 0.9, 'changefreq': 'weekly'},
        {'loc': '/faq', 'priority': 0.9, 'changefreq': 'weekly'},
    ]


@api_view(['GET'])
@renderer_classes([XMLRenderer])
def section(request):
    """
    生成网站sitemap.xml
    """
    try:
        # 尝试从缓存获取
        cache_key = 'sitemap_xml'
        cached_xml = cache.get(cache_key)
        if cached_xml:
            return Response(cached_xml)

        # 创建XML根元素
        urlset = Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
        base_url = BASE_HOST_URL.rstrip('/')
        current_date = timezone.now().strftime('%Y-%m-%d')

        # 添加静态页面（去掉 lastmod）
        for page in get_static_pages():
            create_url_element(
                urlset=urlset,
                loc=f"{base_url}{page['loc']}",
                lastmod=None,  # 设置为 None，这样 create_url_element 函数就不会添加 lastmod 字段
                changefreq=page['changefreq'],
                priority=page['priority']
            )

        # 添加产品页面
        things = Thing.objects.select_related('category').filter(status='0')
        for thing in things:
            create_url_element(
                urlset=urlset,
                loc=f"{base_url}/product/{thing.id}",
                lastmod=thing.create_time.strftime('%Y-%m-%d') if thing.create_time else current_date,
                changefreq='weekly',
                priority=0.9
            )

        # 添加新闻页面
        news = News.objects.filter(status='0')
        for item in news:
            create_url_element(
                urlset=urlset,
                loc=f"{base_url}/news/{item.id}",
                lastmod=item.create_time.strftime('%Y-%m-%d') if item.create_time else current_date,
                changefreq='weekly',
                priority=0.9
            )

        # 生成XML字符串
        xml_str = tostring(urlset, encoding="utf-8", xml_declaration=True)

        # 缓存XML结果（24小时）
        cache.set(cache_key, xml_str, 86400)

        return Response(xml_str)

    except Exception as e:
        logger.error(f"生成sitemap.xml时发生错误: {str(e)}")
        return Response(
            f"<?xml version='1.0' encoding='UTF-8'?><error>生成sitemap时发生错误</error>",
            status=500
        )
