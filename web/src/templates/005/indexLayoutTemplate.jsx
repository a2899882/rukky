import ScrollBar from '@/components/index/sections/scrollBar';
import SendMessage from '@/components/index/sections/sendMessage';
import SwitchLangB from '@/components/index/sections/switchLangB';

export default function IndexLayoutTemplate({ navSectionData, footerSectionData, children }) {
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

  const logo = safeNavSectionData?.basicSite?.site_logo
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${safeNavSectionData.basicSite.site_logo}`
    : null;
  const siteName = safeNavSectionData?.basicSite?.site_name || '外贸独立站演示站';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            {logo ? <img src={logo} className="h-9 w-auto" alt="logo" /> : <div className="h-9 w-28 bg-white/10" />}
            <div className="font-semibold">{siteName}</div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {(safeNavSectionData?.navigationItems || []).map((it) => (
              <a key={it.href} href={it.href} className="text-white/70 hover:text-white">
                {it.name}
              </a>
            ))}
          </nav>

          <a
            href="/product"
            className="px-4 py-2 bg-[hsl(var(--main-color-normal))] text-gray-950 text-sm font-semibold"
          >
            Shop
          </a>
        </div>
      </header>

      <main className="min-h-[60vh]">{children}</main>

      <footer className="border-t border-white/10 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-white/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-white font-semibold">{safeFooterSectionData?.basicSite?.site_name || siteName}</div>
              <div className="mt-1">Commerce theme demo. Replace copy and images for production.</div>
            </div>
            <div className="flex gap-4">
              {(safeFooterSectionData?.navData || []).slice(0, 4).map((it) => (
                <a key={it.href} href={it.href} className="hover:text-white">
                  {it.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <ScrollBar />
      <SendMessage />
      <SwitchLangB colorClass="bg-gray-950 text-white px-4 py-2 border-[1px] border-white/20 rounded-full shadow-sm" />
    </div>
  );
}
