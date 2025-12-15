'use client'

import Script from 'next/script';

export default function ThemeScript() {
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID || '001';
    
    const themeScript = `
        (function() {
            // 设置主题变量
            document.documentElement.style.setProperty(
                '--main-color-light', 
                \`var(--main-color-light-${templateId})\`
            );
            document.documentElement.style.setProperty(
                '--main-color-normal', 
                \`var(--main-color-normal-${templateId})\`
            );
            document.documentElement.style.setProperty(
                '--main-color-deep', 
                \`var(--main-color-deep-${templateId})\`
            );
        })();
    `;

    return (
        <Script id="theme-initializer" strategy="beforeInteractive">
            {themeScript}
        </Script>
    );
} 