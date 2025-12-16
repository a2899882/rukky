import {GoogleAnalytics} from "@next/third-parties/google";

import ScrollBar from "@/components/index/sections/scrollBar";
import SendMessage from "@/components/index/sections/sendMessage";
import NavBar from "@/components/index/sections/template10/navBar";
import Footer from "@/components/index/sections/template10/footer";
import TipBar from "@/components/index/sections/tipbar";
import SwitchLangB from "@/components/index/sections/switchLangB";

export default function IndexLayoutTemplate({navSectionData, footerSectionData, children}) {
    const safeNavSectionData = navSectionData || {
        basicSite: {},
        basicGlobal: {},
        navigationItems: [],
    };

    const safeFooterSectionData = footerSectionData || {
        navData: [],
        categoryData: [],
        contactData: {},
    };

    return (
        <>
            <div className="flex flex-col min-h-screen">
                <NavBar sectionData={safeNavSectionData}/>
                <main className="flex-grow">
                    {children}
                </main>
                <Footer sectionData={safeFooterSectionData}/>
                <ScrollBar/>
                <SendMessage />
                <TipBar sectionData={safeNavSectionData}/>
            </div>

            {/* 语言切换器  */}
            <SwitchLangB/>

            {/*谷歌分析*/}
            <GoogleAnalytics gaId={safeNavSectionData?.basicSite?.site_gaid || null} />
        </>
    );
}
