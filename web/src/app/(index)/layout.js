

import {Roboto, Open_Sans, Lato, Nunito, Merriweather, Montserrat } from 'next/font/google';
import "@/styles/globals.css";
import api from "@/utils/axiosApi";
import ThemeScript from '@/components/index/sections/ThemeScript';

export const revalidate = 0

// 预加载所有字体
const lato = Lato({ subsets: ["latin"], weight: ['400','700'] });
const openSans = Open_Sans({ subsets: ["latin"], weight: ['500', '600', '700'] });

// 定义不同模板的字体配置
const fontConfigs = {
    '001': lato,
    '002': lato,
    '003': lato,
    '004': lato,
    '005': openSans,
    '006': openSans,
    '007': openSans,
    '008': openSans,
    '009': openSans,
    '010': openSans,
    '011': openSans,
};

// 获取当前模板的字体
const getTemplateFont = (templateId) => {
    const id = templateId || process.env.NEXT_PUBLIC_TEMPLATE_ID || '001';
    return fontConfigs[id] || lato; // 默认使用 Lato
};

export const metadata = {
    icons: [{rel: "icon", url: "/favicon.ico"}],
}

// 生成内联样式，确保主题变量优先设置
const getInitialThemeStyles = (templateId) => {
    const id = templateId || process.env.NEXT_PUBLIC_TEMPLATE_ID || '001';
    return `
        :root {
            --main-color-light: var(--main-color-light-${id});
            --main-color-normal: var(--main-color-normal-${id});
            --main-color-deep: var(--main-color-deep-${id});
        }
    `;
};

export default async function RootLayout({children}) {
    const sectionData = (await getSectionData()) || { navSectionData: null, footerSectionData: null };
    const {navSectionData, footerSectionData, homeThemeId} = sectionData;
    
    // 获取模板id（优先使用后台设置）
    const templateId = homeThemeId || process.env.NEXT_PUBLIC_TEMPLATE_ID || '010';
    
    // 获取当前模板的字体
    const font = getTemplateFont(templateId);
    
    // 检查网站状态
    const isWebsiteDown = navSectionData?.basicSite?.status === "2";

    const ga4Enabled = navSectionData?.basicSite?.ga4_enable === '1' && !!navSectionData?.basicSite?.ga4_measurement_id;
    const ga4Id = navSectionData?.basicSite?.ga4_measurement_id;
    const metaEnabled = navSectionData?.basicSite?.meta_pixel_enable === '1' && !!navSectionData?.basicSite?.meta_pixel_id;
    const metaId = navSectionData?.basicSite?.meta_pixel_id;
    const tiktokEnabled = navSectionData?.basicSite?.tiktok_pixel_enable === '1' && !!navSectionData?.basicSite?.tiktok_pixel_id;
    const tiktokId = navSectionData?.basicSite?.tiktok_pixel_id;
    
    // 如果网站状态为关闭
    if (isWebsiteDown) {
        return (
            <html lang="en" suppressHydrationWarning>
                <head>
                    <title>Website Under Maintenance</title>
                    {/* 内联样式优先设置主题变量 */}
                    <style dangerouslySetInnerHTML={{ __html: getInitialThemeStyles(templateId) }} />
                    {/* 优先加载主题脚本 */}
                    <ThemeScript templateId={templateId} />
                </head>
                <body className={`${font.className} bg-gray-50 overflow-x-hidden flex items-center justify-center min-h-screen`}>
                    <div className="max-w-md w-full mx-auto bg-white rounded-md shadow-lg p-8 text-center">
                        {navSectionData?.basicSite?.site_logo && (
                            <div className="flex justify-center mb-6">
                                <img 
                                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${navSectionData.basicSite.site_logo}`} 
                                    alt="Website Logo" 
                                    className="h-16 w-auto" 
                                />
                            </div>
                        )}
                        
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Website Under Maintenance</h1>
                        <p className="text-gray-600 mb-6">
                            {navSectionData?.basicSite?.closeMessage || "We are currently performing scheduled maintenance. Please check back later."}
                        </p>
                        
                        <div className="mt-8 text-gray-500 text-sm">
                            &copy; {new Date().getFullYear()} {navSectionData?.basicSite?.site_name || "Company Website"} | Technical Support
                        </div>
                    </div>
                </body>
            </html>
        );
    }
    
    // 动态导入对应模板（若模板缺失，回退到 010，避免 SSR 白屏）
    let IndexLayoutTemplate;
    try {
        const IndexLayoutTemplateModule = await import(`@/templates/${templateId}/indexLayoutTemplate`);
        IndexLayoutTemplate = IndexLayoutTemplateModule.default;
    } catch (e) {
        const IndexLayoutTemplateModule = await import(`@/templates/010/indexLayoutTemplate`);
        IndexLayoutTemplate = IndexLayoutTemplateModule.default;
    }
    
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* 内联样式优先设置主题变量 */}
                <style dangerouslySetInnerHTML={{ __html: getInitialThemeStyles(templateId) }} />
                {/* 优先加载主题脚本 */}
                <ThemeScript templateId={templateId} />

                {ga4Enabled ? (
                    <>
                        <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}></script>
                        <script dangerouslySetInnerHTML={{
                            __html: `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', '${ga4Id}');`
                        }} />
                    </>
                ) : null}

                {metaEnabled ? (
                    <script dangerouslySetInnerHTML={{
                        __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaId}');fbq('track','PageView');`
                    }} />
                ) : null}

                {tiktokEnabled ? (
                    <script dangerouslySetInnerHTML={{
                        __html: `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokId}');ttq.page();}(window, document, 'ttq');`
                    }} />
                ) : null}
            </head>
            <body className={`${font.className} bg-white overflow-x-hidden`}>
                <IndexLayoutTemplate 
                    navSectionData={navSectionData} 
                    footerSectionData={footerSectionData}
                >
                    {children}
                </IndexLayoutTemplate>
            </body>
        </html>
    );
}


// 服务端获取数据
async function getSectionData() {
    try {
        const {code, msg, data} = await api.get('/myapp/index/common/section');
        if (code === 0) {
            return data;
        } else {
            console.error(`获取导航数据错误: ${msg}`);
            return { navSectionData: null, footerSectionData: null };
        }
    } catch (err) {
        console.error("获取导航数据失败:", err);
        return { navSectionData: null, footerSectionData: null };
    }
}
