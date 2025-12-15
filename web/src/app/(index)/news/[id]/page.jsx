import {cache, Suspense} from 'react';
import api from "@/utils/axiosApi";
import {getIp} from "@/utils/tools";

// 使用React的缓存机制优化API调用
const getNewsDetailCached = cache(async (id) => {    // 这里应该是从API获取数据
    try {
        const params = {
            id: id,
        }
        const headers = {
            'Content-Type': 'application/json',
            'x-forwarded-for': getIp()
        };
        const {code, msg, data} = await api.get('/myapp/index/news/detail', {headers, params});
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
})

export async function generateMetadata({params}) {
    // 读取路由参数
    const {id} = params;

    // 使用缓存的函数获取案例详情数据
    const data = await getNewsDetailCached(id);

    // 从详情数据中提取信息
    const {seo_title, seo_description, seo_keywords, title} = data.detailData;
    const siteName = data.siteName;

    // 返回动态生成的metadata
    return {
        title: seo_title || title,
        description: seo_description || title,
        keywords: seo_keywords || title,
        // Open Graph
        openGraph: {
            title: seo_title || title,
            description: seo_description || title,
            url: process.env.NEXT_PUBLIC_BASE_URL,
            siteName: siteName,
            image: '',
            type: 'website',
        },
        // Twitter
        twitter: {
            card: 'summary',
            title: seo_title || siteName || title,
            description: seo_description || siteName || title,
            image: '',
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}


export default async function Page({params}) {
    const {id} = params;
    const data = await getNewsDetailCached(id);

    // 获取模板id
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;

    if (!data) {
        // 动态导入对应模板并传入空数据
        const NewsDetailTemplateModule = await import(`@/templates/${templateId}/newsDetailTemplate`);
        const NewsDetailTemplate = NewsDetailTemplateModule.default;
        return <NewsDetailTemplate detailData={null} />;
    }

    const {detailData, categoryData, recommendData} = data;

    // 分享链接构建
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const articleUrl = `${baseUrl}/news/${id}`;
    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(detailData.title);
    const encodedSummary = encodeURIComponent(`Check out this article: ${detailData.title}`);

    // 社交媒体分享链接
    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };

    // 准备传递给模板的props
    const templateProps = {
        detailData,
        categoryData,
        recommendData,
        shareLinks
    };

    // 动态导入对应模板
    const NewsDetailTemplateModule = await import(`@/templates/${templateId}/newsDetailTemplate`);
    const NewsDetailTemplate = NewsDetailTemplateModule.default;
    
    return <NewsDetailTemplate {...templateProps} />;
}