import api from "@/utils/axiosApi";
import {cache} from "react";
import {getIp} from "@/utils/tools";

export default async function Page({params}) {
    const pageNumber = getPageNumber(params?.slug);
    const urlParams = {page: pageNumber, pageSize: 9};
    const sectionData = await getSectionDataCached(urlParams);
    
    // 获取模板id
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;

    // 准备传递给模板的props
    const templateProps = {
        bannerData: sectionData.bannerData,
        pageNumber: pageNumber,
        total: sectionData.total,
        caseData: sectionData.caseData
    };

    // 动态导入对应模板
    const CaseTemplateModule = await import(`@/templates/${templateId}/caseTemplate`);
    const CaseTemplate = CaseTemplateModule.default;
    
    return <CaseTemplate {...templateProps} />;
}

export async function generateMetadata({params}) {
    const pageNumber = getPageNumber(params?.slug);
    const urlParams = {page: pageNumber, pageSize: 9};
    const {seoData = {}, siteName=''} = await getSectionDataCached(urlParams);

    // 提取SEO数据并提供默认值
    const {
        seo_title = 'Case',
        seo_description = 'Case',
        seo_keywords = 'Case'
    } = seoData || {};

    return {
        title: seo_title,
        description: seo_description,
        keywords: seo_keywords,
        // Open Graph
        openGraph: {
            title: seo_title || 'Case',
            description: seo_description || 'Case',
            url: process.env.NEXT_PUBLIC_BASE_URL,
            siteName: siteName,
            image: '',
            type: 'website',
        },
        // Twitter
        twitter: {
            card: 'summary',
            title: seo_title || siteName || 'Case',
            description: seo_description || siteName || 'Case',
            image: '',
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

// 从URL参数中提取页码的辅助函数
function getPageNumber(slug) {
    const slugArray = slug || [];

    if (slugArray.length > 0 && slugArray[0] === 'page' && slugArray.length >= 2) {
        return parseInt(slugArray[1], 10) || 1;
    }

    return 1;
}

const getSectionDataCached = cache(async (params) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'x-forwarded-for': getIp()
        };
        const {code, msg, data} = await api.get('/myapp/index/case/section', {headers, params});
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