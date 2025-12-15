import {cache} from "react";
import api from "@/utils/axiosApi";
import {getIp} from "@/utils/tools";

export default async function Page({params, searchParams}) {
    // 解析slug参数
    const slug = params?.slug || [];

    // 解析category和page
    let categoryId = null;
    let pageNumber = 1;
    let pageSize = 9;

    const id = process.env.NEXT_PUBLIC_TEMPLATE_ID;

    // 兼容模板
    if (['004', '005', '006', '007', '008', '009', '010'].includes(id)) {
        pageSize = 12;
    }

    // 解析不同的路由模式
    if (slug.length > 0) {
        if (slug[0] === 'category' && slug.length >= 2) {
            // 处理 /product/category/[id] 和 /product/category/[id]/page/[number]
            categoryId = slug[1];

            // 检查是否还有页码
            if (slug.length >= 4 && slug[2] === 'page') {
                pageNumber = parseInt(slug[3], 10) || 1;
            }
        } else if (slug[0] === 'page' && slug.length >= 2) {
            // 处理 /product/page/[number]
            pageNumber = parseInt(slug[1], 10) || 1;
        }
    }

    // 获取搜索参数
    const searchQuery = searchParams?.s || '';

    const urlParams = {page: pageNumber, pageSize: pageSize, categoryId, searchQuery}
    const {bannerData, categoryData, productData, featuredData, total} = await getSectionDataCached(urlParams)

    // 获取模板id
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;

    // 准备传递给模板的props
    const templateProps = {
        bannerData,
        categoryId,
        pageNumber,
        total,
        pageSize,
        categoryData,
        productData,
        featuredData,
        searchQuery
    };

    // 动态导入对应模板
    const ProductTemplateModule = await import(`@/templates/${templateId}/productTemplate`);
    const ProductTemplate = ProductTemplateModule.default;
    
    return <ProductTemplate {...templateProps} />;
}

export async function generateMetadata({params}) {
    // 使用缓存的函数获取案例详情数据
    const data = await getSectionDataCached({page: 1, pageSize: 9});

    // 从详情数据中提取信息
    const {seo_title, seo_description, seo_keywords} = data.seoData;
    const siteName = data.siteName;

    // 返回动态生成的metadata
    return {
        title: seo_title || 'Products',
        description: seo_description || 'Products',
        keywords: seo_keywords || 'Products',
        // Open Graph
        openGraph: {
            title: seo_title || 'Products',
            description: seo_description || 'Products',
            url: process.env.NEXT_PUBLIC_BASE_URL,
            siteName: siteName,
            image: '',
            type: 'website',
        },
        // Twitter
        twitter: {
            card: 'summary',
            title: seo_title || siteName || 'Products',
            description: seo_description || siteName || 'Products',
            image: '',
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

const getSectionDataCached = cache(async (params) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'x-forwarded-for': getIp()
        };
        const {code, msg, data} = await api.get('/myapp/index/thing/section', {headers, params});
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