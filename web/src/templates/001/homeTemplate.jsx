 'use client';

 export default function HomeTemplate({
  bannerData,
  featuredData,
  categoryData,
  aboutData,
  companyName,
  statsData,
  commentData,
  newsData,
  heroText,
}) {
  const lang = require('@/locales').default;
  const hero = '/themes/hero-001.svg';
  const unsplash = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=60';

  return (
    <div className="flex flex-col">
      <section className="relative">
        <div className="w-full">
          <img src={hero} alt="Hero" className="w-full h-[360px] md:h-[460px] object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-6 -mt-28">
          <div className="bg-white shadow-md p-6 md:p-10 border border-gray-100">
            <div className="text-xs text-gray-500">Theme 001 · Modern B2B Landing</div>
            <div className="text-2xl md:text-4xl font-bold mt-2">
              {heroText || 'Build your next brand-ready storefront'}
            </div>
            <div className="text-gray-600 mt-3 max-w-2xl">
              {lang?.demo_theme_desc || 'Demo blocks are ready-to-use. Replace images and copy with your real content.'}
            </div>
            <div className="mt-5 flex gap-3">
              <a href="/product" className="px-5 py-3 bg-[hsl(var(--main-color-normal))] text-white font-medium">
                {lang?.demo_explore_products || 'Explore Products'}
              </a>
              <a href="/contact" className="px-5 py-3 border border-gray-200 text-gray-700 font-medium">
                {lang?.demo_contact_sales || 'Contact Sales'}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { t: 'Fast setup', d: 'Prebuilt sections, switch themes in admin.' },
              { t: 'Mobile first', d: 'Clean spacing and readable typography.' },
              { t: 'SEO ready', d: 'SSR pages + metadata already wired.' },
            ].map((x) => (
              <div key={x.t} className="bg-white border border-gray-100 p-6">
                <div className="font-semibold">{x.t}</div>
                <div className="text-sm text-gray-600 mt-2">{x.d}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 p-6">
              <div className="font-semibold">Featured Showcase</div>
              <div className="text-sm text-gray-600 mt-2">A real-photo block (Unsplash hotlink) for demo feel.</div>
              <img src={unsplash} alt="Demo" className="mt-4 w-full h-56 object-cover" />
            </div>
            <div className="bg-white border border-gray-100 p-6">
              <div className="font-semibold">About</div>
              <div className="text-sm text-gray-600 mt-2">
                {aboutData?.aboutText || 'Add your company story here. This theme focuses on clarity and trust.'}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="border border-gray-100 p-3">
                  <div className="text-xs text-gray-500">Company</div>
                  <div className="font-medium">{companyName || 'Your Company'}</div>
                </div>
                <div className="border border-gray-100 p-3">
                  <div className="text-xs text-gray-500">Global shipping</div>
                  <div className="font-medium">48h dispatch</div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-12" />
        </div>
      </section>

      {/* keep existing data-driven sections in template10 via 010 if you want; this theme is standalone */}
    </div>
  );
}
