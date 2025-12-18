import api from "@/utils/axiosApi";
import {cache} from 'react';
import {getIp} from "@/utils/tools";
import {getThemeIdOrDefault} from "@/utils/getThemeId";

// 使用React的缓存机制优化API调用
const getCaseDetailCached = cache(async (id) => {
    try {
        const params = {id};
        const headers = {
            'Content-Type': 'application/json',
            'x-forwarded-for': getIp()
        };
        const {code, msg, data} = await api.get('/myapp/index/case/detail', {headers, params});
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
    const data = await getCaseDetailCached(id);

    // 从详情数据中提取信息
    const {seo_title, seo_description, seo_keywords, title} = data.detailData;

    const base = String(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const canonical = base ? `${base}/case/${id}` : undefined;

    // 返回动态生成的metadata
    return {
        title: seo_title || title,
        description: seo_description || title,
        keywords: seo_keywords || title,
        ...(canonical ? { alternates: { canonical } } : {}),
    };
}

export default async function Page({params}) {
    const {id} = params;

    // 使用相同的缓存函数获取数据
    const data = await getCaseDetailCached(id);

    if (!data) {
        return <div>Case not found</div>;
    }

    // 获取模板id（优先使用后台设置）
    const templateId = await getThemeIdOrDefault('010');

    // 准备传递给模板的props
    const templateProps = {
        detailData: data.detailData,
        categoryData: data.categoryData,
        recommendData: data.recommendData
    };

    const base = String(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const caseUrl = base ? `${base}/case/${id}` : undefined;
    const breadcrumbJsonLd = base && caseUrl
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
                    name: 'Case',
                    item: `${base}/case`,
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: data?.detailData?.title || 'Case',
                    item: caseUrl,
                },
            ],
        }
        : null;

    // 动态导入对应模板（若模板缺失，回退到 010，避免 SSR 白屏）
    let CaseDetailTemplate;
    try {
        const CaseDetailTemplateModule = await import(`@/templates/${templateId}/caseDetailTemplate`);
        CaseDetailTemplate = CaseDetailTemplateModule.default;
    } catch (e) {
        const CaseDetailTemplateModule = await import(`@/templates/010/caseDetailTemplate`);
        CaseDetailTemplate = CaseDetailTemplateModule.default;
    }

    return (
        <>
            {breadcrumbJsonLd ? (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(breadcrumbJsonLd),
                    }}
                />
            ) : null}
            <CaseDetailTemplate {...templateProps} />
        </>
    );
}