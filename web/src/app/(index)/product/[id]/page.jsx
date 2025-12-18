import {cache} from "react";
import api from "@/utils/axiosApi";
import {getIp} from "@/utils/tools";
import {getThemeIdOrDefault} from "@/utils/getThemeId";

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

    const base = String(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const canonical = base ? `${base}/product/${id}` : undefined;

    // 返回动态生成的metadata
    return {
        title: seo_title || title,
        description: seo_description || (title + ':'+ summary),
        keywords: seo_keywords || title,
        ...(canonical ? { alternates: { canonical } } : {}),
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

    const base = String(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const productUrl = base ? `${base}/product/${id}` : undefined;

    const coverList = typeof detailData?.cover === 'string' && detailData.cover
        ? detailData.cover.split('#').map((x) => x.trim()).filter(Boolean)
        : [];
    const images = base
        ? coverList.map((x) => `${base}/upload/img/${x}`)
        : [];

    const parsePrice = (raw) => {
        if (!raw) return null;
        const s = String(raw).trim();
        const numMatch = s.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
        const price = numMatch ? numMatch[1] : null;
        if (!price) return null;
        let currency = null;
        if (s.includes('$')) currency = 'USD';
        if (/\bUSD\b/i.test(s)) currency = 'USD';
        if (/\bEUR\b/i.test(s) || s.includes('€')) currency = 'EUR';
        if (/\bGBP\b/i.test(s) || s.includes('£')) currency = 'GBP';
        return {price, currency};
    };

    const priceInfo = parsePrice(detailData?.price);

    const productJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: detailData?.title || undefined,
        description: detailData?.summary || undefined,
        image: images.length ? images : undefined,
        sku: detailData?.sku || detailData?.sku_code || undefined,
        brand: detailData?.brand ? { '@type': 'Brand', name: detailData.brand } : undefined,
        ...(priceInfo && priceInfo.currency
            ? {
                offers: {
                    '@type': 'Offer',
                    url: productUrl,
                    priceCurrency: priceInfo.currency,
                    price: priceInfo.price,
                    availability: 'https://schema.org/InStock',
                },
            }
            : {}),
    };

    const breadcrumbJsonLd = base && productUrl
        ? {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: `${base}/`,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Products',
                    item: `${base}/product`,
                },
                ...(detailData?.category
                    ? [
                        {
                            '@type': 'ListItem',
                            position: 3,
                            name: detailData?.category_title || 'Category',
                            item: `${base}/product/category/${detailData.category}`,
                        },
                        {
                            '@type': 'ListItem',
                            position: 4,
                            name: detailData?.title || 'Product',
                            item: productUrl,
                        },
                    ]
                    : [
                        {
                            '@type': 'ListItem',
                            position: 3,
                            name: detailData?.title || 'Product',
                            item: productUrl,
                        },
                    ]),
            ],
        }
        : null;

    // 获取模板id（优先使用后台设置）
    const templateId = await getThemeIdOrDefault('010');

    // 准备传递给模板的props
    const templateProps = {
        detailData,
        relatedData
    };

    // 动态导入对应模板（若模板缺失，回退到 010，避免 SSR 白屏）
    let ProductDetailTemplate;
    try {
        const ProductDetailTemplateModule = await import(`@/templates/${templateId}/productDetailTemplate`);
        ProductDetailTemplate = ProductDetailTemplateModule.default;
    } catch (e) {
        const ProductDetailTemplateModule = await import(`@/templates/010/productDetailTemplate`);
        ProductDetailTemplate = ProductDetailTemplateModule.default;
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(productJsonLd),
                }}
            />
            {breadcrumbJsonLd ? (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(breadcrumbJsonLd),
                    }}
                />
            ) : null}
            <ProductDetailTemplate {...templateProps} />
        </>
    );
}