import ScrollBar from '@/components/index/sections/scrollBar';
import SendMessage from '@/components/index/sections/sendMessage';
import TipBar from '@/components/index/sections/tipbar';

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
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            {logo ? <img src={logo} className="h-9 w-auto" alt="logo" /> : <div className="h-9 w-28 bg-gray-100" />}
            <div className="font-semibold text-gray-900">{siteName}</div>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            {(safeNavSectionData?.navigationItems || []).map((it) => (
              <a key={it.href} href={it.href} className="text-gray-700 hover:text-gray-900">
                {it.name}
              </a>
            ))}
          </nav>

          <a
            href="/product"
            className="px-4 py-2 rounded-full bg-[hsl(var(--main-color-normal))] text-white text-sm font-semibold"
          >
            Shop
          </a>
        </div>
      </header>

      <main className="min-h-[60vh]">{children}</main>

      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="font-semibold text-gray-900">{safeFooterSectionData?.basicSite?.site_name || siteName}</div>
              <div className="text-sm text-gray-600 mt-2">Premium theme demo layout.</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Links</div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                {(safeFooterSectionData?.navData || []).map((it) => (
                  <a key={it.href} href={it.href} className="text-gray-600 hover:text-gray-900">
                    {it.name}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Contact</div>
              <div className="text-sm text-gray-600 mt-3">
                {safeFooterSectionData?.contactData?.global_email || 'demo@example.com'}
              </div>
              <div className="text-sm text-gray-600">
                {safeFooterSectionData?.contactData?.global_phone || '+1 000 000 0000'}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ScrollBar />
      <SendMessage />
      <TipBar sectionData={safeNavSectionData} />
    </div>
  );
}
