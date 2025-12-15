import {cache} from "react";
import api from "@/utils/axiosApi";
import {getIp} from "@/utils/tools";

// 使用React的缓存机制优化API调用
const getThingDetailCached = cache(async (id) => {
    try {
        const params = {id};
        const headers = {
            'Content-Type': 'application/json',
            'x-forwarded-for': getIp()
        };
        const {code, msg, data} = await api.get('/myapp/index/thing/detail', {headers, params});
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

// 动态生成metadata
export async function generateMetadata({params}) {
    // 读取路由参数
    const {id} = params;

    // 使用缓存的函数获取案例详情数据
    const data = await getThingDetailCached(id);

    // 从详情数据中提取信息
    const {seo_title, seo_description, seo_keywords, title, summary} = data.detailData;
    const siteName = data.siteName;

    // 返回动态生成的metadata
    return {
        title: seo_title || title,
        description: seo_description || (title + ':'+ summary),
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

    // 使用相同的缓存函数获取数据
    const {detailData, relatedData} = await getThingDetailCached(id);

    // 获取模板id
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;

    // 准备传递给模板的props
    const templateProps = {
        detailData,
        relatedData
    };

    // 动态导入对应模板
    const ProductDetailTemplateModule = await import(`@/templates/${templateId}/productDetailTemplate`);
    const ProductDetailTemplate = ProductDetailTemplateModule.default;
    
    return <ProductDetailTemplate {...templateProps} />;
}