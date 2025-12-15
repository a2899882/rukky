import {cache} from "react";
import api from "@/utils/axiosApi";
import {getIp} from "@/utils/tools";


export default async function Page() {
    const {
        bannerData,
        aboutData,
        missionData,
        statsData,
        advantageData,
        companyImageData,
        certificationImageData,
        contactData
    } = await getSectionDataCached();

    // 获取模板id
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID

    const templateProps = {
        bannerData,
        aboutData,
        missionData,
        statsData,
        advantageData,
        companyImageData,
        certificationImageData,
        contactData
    };

    const AboutTemplateModule = await import(`@/templates/${templateId}/aboutTemplate`);
    const AboutTemplate = AboutTemplateModule.default;
    return <AboutTemplate {...templateProps} />
}

export async function generateMetadata({params}) {
    // 使用缓存的函数获取数据
    const data = await getSectionDataCached();

    // 从详情数据中提取信息
    const {seo_title, seo_description, seo_keywords} = data.seoData;
    const siteName = data.siteName || '';

    // 返回动态生成的metadata
    return {
        title: seo_title || ('About Us - ' + siteName),
        description: seo_description || ('About Us - ' + siteName),
        keywords: seo_keywords || ('About Us - ' + siteName),
        // Open Graph
        openGraph: {
            title: seo_title || 'About Us',
            description: seo_description || 'About Us',
            url: process.env.NEXT_PUBLIC_BASE_URL,
            siteName: siteName,
            image: '',
            type: 'website',
        },
        // Twitter
        twitter: {
            card: 'summary',
            title: seo_title || siteName || 'About Us',
            description: seo_description || siteName || 'About Us',
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
        const {code, msg, data} = await api.get('/myapp/index/about/section', {headers});
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