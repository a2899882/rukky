import api from "@/utils/axiosApi";
import {cache} from "react";
import {getIp} from "@/utils/tools";
import {getThemeIdOrDefault} from "@/utils/getThemeId";

export default async function Page({params}) {

    let pageSize = 9;

    const templateId = await getThemeIdOrDefault('010');

    // 兼容模板
    if (['006', '009'].includes(templateId)) {
        pageSize = 10;
    }

    const pageNumber = getPageNumber(params?.slug);
    const urlParams = {page: pageNumber, pageSize: pageSize};
    const sectionData = await getSectionDataCached(urlParams);

    // 准备传递给模板的props
    const templateProps = {
        bannerData: sectionData.bannerData,
        pageNumber: pageNumber,
        pageSize: pageSize,
        total: sectionData.total,
        newsData: sectionData.newsData,
        featuredData: sectionData.featuredData
    };

    // 动态导入对应模板（若模板缺失，回退到 010，避免 SSR 白屏）
    let NewsTemplate;
    try {
        const NewsTemplateModule = await import(`@/templates/${templateId}/newsTemplate`);
        NewsTemplate = NewsTemplateModule.default;
    } catch (e) {
        const NewsTemplateModule = await import(`@/templates/010/newsTemplate`);
        NewsTemplate = NewsTemplateModule.default;
    }
    
    return <NewsTemplate {...templateProps} />;
}

export async function generateMetadata({params}) {
    const pageNumber = getPageNumber(params?.slug);
    const urlParams = {page: pageNumber, pageSize: 9};
    const {seoData = {}, siteName = ''} = await getSectionDataCached(urlParams);

    // 提取SEO数据并提供默认值
    const {
        seo_title = 'News',
        seo_description = 'News',
        seo_keywords = 'News'
    } = seoData || {};

    const base = String(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const canonicalPath = pageNumber > 1 ? `/news/page/${pageNumber}` : '/news';
    const canonical = base ? `${base}${canonicalPath}` : undefined;


    return {
        title: seo_title || 'News',
        description: seo_description,
        keywords: seo_keywords,
        ...(canonical ? { alternates: { canonical } } : {}),
        // Open Graph
        openGraph: {
            title: seo_title || 'News',
            description: seo_description || 'News',
            url: process.env.NEXT_PUBLIC_BASE_URL,
            siteName: siteName,
            image: '',
            type: 'website',
        },
        // Twitter
        twitter: {
            card: 'summary',
            title: seo_title || siteName || 'News',
            description: seo_description || siteName || 'News',
            image: '',
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}


// 缓存获取新闻部分数据的函数
const getSectionDataCached = cache(async (params) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'x-forwarded-for': getIp()
        };
        const {code, msg, data} = await api.get('/myapp/index/news/section', {headers, params});
        if (code === 0) {
            return data;
        } else {
            console.error(`获取数据错误: ${msg}`);
            return null;
        }
    } catch (err) {
        console.error("获取数据失败:", err);
        return null;
    }
});

// 从URL参数中提取页码的辅助函数
function getPageNumber(slug) {
    const slugArray = slug || [];

    if (slugArray.length > 0 && slugArray[0] === 'page' && slugArray.length >= 2) {
        return parseInt(slugArray[1], 10) || 1;
    }

    return 1;
}

