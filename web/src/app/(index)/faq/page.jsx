import api from "@/utils/axiosApi";
import {cache} from "react";
import {getIp} from "@/utils/tools";

export default async function Page() {
    const sectionData = await getSectionDataCached();

    // 获取模板id
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;

    // 准备传递给模板的props
    const templateProps = {
        bannerData: sectionData.bannerData,
        faqData: sectionData.faqData
    };

    // 动态导入对应模板
    const FaqTemplateModule = await import(`@/templates/${templateId}/faqTemplate`);
    const FaqTemplate = FaqTemplateModule.default;
    
    return <FaqTemplate {...templateProps} />;
}

export async function generateMetadata({ params }) {
    // 使用缓存的函数获取案例详情数据
    const data = await getSectionDataCached();

    // 从详情数据中提取信息
    const { seo_title, seo_description, seo_keywords } = data.seoData;
    const siteName = data.siteName;


    // 返回动态生成的metadata
    return {
        title: seo_title || 'Faq',
        description: seo_description || 'Faq',
        keywords: seo_keywords || 'Faq',
        // Open Graph
        openGraph: {
            title: seo_title || 'Faq',
            description: seo_description || 'Faq',
            url: process.env.NEXT_PUBLIC_BASE_URL,
            siteName: siteName,
            image: '',
            type: 'website',
        },
        // Twitter
        twitter: {
            card: 'summary',
            title: seo_title || siteName || 'Faq',
            description: seo_description || siteName || 'Faq',
            image: '',
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

const getSectionDataCached = cache(async () =>{
    try {
        const headers = {
            'Content-Type': 'application/json',
            'x-forwarded-for': getIp()
        };
        const {code, msg, data} = await api.get('/myapp/index/faq/section', {headers});
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