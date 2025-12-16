import api from "@/utils/axiosApi";
import {cache} from "react";
import {getIp} from "@/utils/tools";
import {getThemeIdOrDefault} from "@/utils/getThemeId";

export default async function Page() {
    const {bannerData, contactData, recommendData} = await getSectionDataCached();

    // 获取模板id（优先使用后台设置）
    const templateId = await getThemeIdOrDefault('010');

    // 准备传递给模板的props
    const templateProps = {
        bannerData,
        contactData,
        recommendData
    };

    // 动态导入对应模板（若模板缺失，回退到 010，避免 SSR 白屏）
    let ContactTemplate;
    try {
        const ContactTemplateModule = await import(`@/templates/${templateId}/contactTemplate`);
        ContactTemplate = ContactTemplateModule.default;
    } catch (e) {
        const ContactTemplateModule = await import(`@/templates/010/contactTemplate`);
        ContactTemplate = ContactTemplateModule.default;
    }

    return <ContactTemplate {...templateProps} />;
}

export async function generateMetadata({params}) {
    // 使用缓存的函数获取案例详情数据
    const data = await getSectionDataCached();

    // 从详情数据中提取信息
    const {seo_title, seo_description, seo_keywords} = data.seoData;
    const siteName = data.siteName || '';

    // 返回动态生成的metadata
    return {
        title: seo_title || ('Contact - ' + siteName),
        description: seo_description || ('Contact - ' + siteName),
        keywords: seo_keywords || ('Contact - ' + siteName),
        // Open Graph
        openGraph: {
            title: seo_title || 'Contact',
            description: seo_description || 'Contact',
            url: process.env.NEXT_PUBLIC_BASE_URL,
            siteName: siteName,
            image: '',
            type: 'website',
        },
        // Twitter
        twitter: {
            card: 'summary',
            title: seo_title || siteName || 'Contact',
            description: seo_description || siteName || 'Contact',
            image: '',
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

const getSectionDataCached = cache(async () => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'x-forwarded-for': getIp()
        };
        const {code, msg, data} = await api.get('/myapp/index/contact/section', {headers});
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