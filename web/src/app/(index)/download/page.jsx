import api from "@/utils/axiosApi";
import {cache} from "react";
import {getIp} from "@/utils/tools";
import {getThemeIdOrDefault} from "@/utils/getThemeId";


export default async function Page() {
    const sectionData = await getSectionDataCached();

    // 获取模板id（优先使用后台设置）
    const templateId = await getThemeIdOrDefault('010');

    // 准备传递给模板的props
    const templateProps = {
        bannerData: sectionData.bannerData,
        downloadData: sectionData.downloadData
    };

    // 动态导入对应模板（若模板缺失，回退到 010，避免 SSR 白屏）
    let DownloadTemplate;
    try {
        const DownloadTemplateModule = await import(`@/templates/${templateId}/downloadTemplate`);
        DownloadTemplate = DownloadTemplateModule.default;
    } catch (e) {
        const DownloadTemplateModule = await import(`@/templates/010/downloadTemplate`);
        DownloadTemplate = DownloadTemplateModule.default;
    }
    
    return <DownloadTemplate {...templateProps} />;
}

export async function generateMetadata({ params }) {
    // 使用缓存的函数获取案例详情数据
    const data = await getSectionDataCached();

    // 从详情数据中提取信息
    const { seo_title, seo_description, seo_keywords } = data.seoData;
    const siteName = data.siteName;

    const base = String(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const canonical = base ? `${base}/download` : undefined;

    // 返回动态生成的metadata
    return {
        title: seo_title || 'Download',
        description: seo_description || 'Download',
        keywords: seo_keywords || 'Download',
        ...(canonical ? { alternates: { canonical } } : {}),
        // Open Graph
        openGraph: {
            title: seo_title || 'Download',
            description: seo_description || 'Download',
            url: process.env.NEXT_PUBLIC_BASE_URL,
            siteName: siteName,
            image: '',
            type: 'website',
        },
        // Twitter
        twitter: {
            card: 'summary',
            title: seo_title || siteName || 'Download',
            description: seo_description || siteName || 'Download',
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
        const {code, msg, data} = await api.get('/myapp/index/download/section', {headers});
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