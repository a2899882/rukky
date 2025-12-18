import {cache} from "react";
import api from "@/utils/axiosApi";
import {getIp} from "@/utils/tools";
import {getThemeIdOrDefault} from "@/utils/getThemeId";

export default async function Home() {
    const sectionData = (await getSectionDataCached()) || {
        seoData: { seo_title: null, seo_description: null, seo_keywords: null },
        bannerData: null,
        featuredData: [],
        categoryData: [],
        aboutData: { aboutText: null, aboutCover: null },
        companyName: null,
        siteName: null,
        statsData: {
            param_one_name: null,
            param_one_value: null,
            param_two_name: null,
            param_two_value: null,
            param_three_name: null,
            param_three_value: null,
            param_four_name: null,
            param_four_value: null,
        },
        commentData: [],
        newsData: [],
        heroText: null,
        contactData: null,
    };

    // 获取模板id（优先使用后台设置）
    const templateId = await getThemeIdOrDefault('010');

    // 准备传递给模板的props
    const templateProps = {
        bannerData: sectionData.bannerData,
        featuredData: sectionData.featuredData,
        categoryData: sectionData.categoryData,
        aboutData: sectionData.aboutData,
        companyName: sectionData.companyName,
        statsData: sectionData.statsData,
        commentData: sectionData.commentData,
        newsData: sectionData.newsData,
        heroText: sectionData.heroText,
        contactData: sectionData.contactData
    };

    // 动态导入对应模板（若模板缺失，回退到 010，避免 SSR 白屏）
    let HomeTemplate;
    try {
        const HomeTemplateModule = await import(`@/templates/${templateId}/homeTemplate`);
        HomeTemplate = HomeTemplateModule.default;
    } catch (e) {
        const HomeTemplateModule = await import(`@/templates/010/homeTemplate`);
        HomeTemplate = HomeTemplateModule.default;
    }
    
    return <HomeTemplate {...templateProps} />;
}

export async function generateMetadata() {
    const data = (await getSectionDataCached()) || {
        seoData: { seo_title: null, seo_description: null, seo_keywords: null },
        siteName: null,
    };

    const {seo_title, seo_description, seo_keywords} = data.seoData || {};
    const siteName = data.siteName;

    const base = String(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const canonical = base ? `${base}/` : undefined;

    return {
        title: seo_title || siteName || 'Home',
        description: seo_description || siteName || 'Home',
        keywords: seo_keywords || siteName || 'Home',
        ...(canonical ? { alternates: { canonical } } : {}),
        openGraph: {
            title: seo_title || siteName || 'Home',
            description: seo_description || siteName || 'Home',
            url: process.env.NEXT_PUBLIC_BASE_URL,
            siteName: siteName,
            image: '',
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title: seo_title || siteName || 'Home',
            description: seo_description || siteName || 'Home',
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

        const {code, msg, data} = await api.get('/myapp/index/home/section', {headers});
        if (code === 0) {
            return data;
        } else {
            console.error(`获取数据错误: ${msg}`);
            return {
                seoData: { seo_title: null, seo_description: null, seo_keywords: null },
                bannerData: null,
                featuredData: [],
                categoryData: [],
                aboutData: { aboutText: null, aboutCover: null },
                companyName: null,
                siteName: null,
                statsData: {
                    param_one_name: null,
                    param_one_value: null,
                    param_two_name: null,
                    param_two_value: null,
                    param_three_name: null,
                    param_three_value: null,
                    param_four_name: null,
                    param_four_value: null,
                },
                commentData: [],
                newsData: [],
                heroText: null,
                contactData: null,
            };
        }
    } catch (err) {
        console.error("获取数据失败:", err);
        return {
            seoData: { seo_title: null, seo_description: null, seo_keywords: null },
            bannerData: null,
            featuredData: [],
            categoryData: [],
            aboutData: { aboutText: null, aboutCover: null },
            companyName: null,
            siteName: null,
            statsData: {
                param_one_name: null,
                param_one_value: null,
                param_two_name: null,
                param_two_value: null,
                param_three_name: null,
                param_three_value: null,
                param_four_name: null,
                param_four_value: null,
            },
            commentData: [],
            newsData: [],
            heroText: null,
            contactData: null,
        };
    }
})