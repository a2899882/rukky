 'use client';

 export default function HomeTemplate({
  aboutData,
  companyName,
  heroText,
}) {
  const lang = require('@/locales').default;
  const hero = '/themes/hero-011.svg';
  const u1 = 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1600&q=60';

  return (
    <div className="bg-white">
      <section className="relative">
        <img src={hero} alt="Hero" className="w-full h-[340px] md:h-[480px] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />
        <div className="absolute inset-0">
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="max-w-2xl">
              <div className="text-xs tracking-widest uppercase text-gray-700">Theme 011 · Premium</div>
              <div className="text-3xl md:text-5xl font-bold text-gray-900 mt-3">
                {heroText || 'Premium layout for brand-first storefronts'}
              </div>
              <div className="text-gray-700 mt-4">
                {lang?.demo_theme_desc || 'Elegant spacing, soft gradients, and a premium feel. Swap content from admin without code.'}
              </div>
              <div className="mt-6 flex gap-3">
                <a href="/product" className="px-5 py-3 bg-[hsl(var(--main-color-normal))] text-white font-semibold">
                  {lang?.demo_view_catalog || 'View Catalog'}
                </a>
                <a href="/about" className="px-5 py-3 border border-gray-200 text-gray-800 font-medium">
                  {lang?.demo_about_us || 'About Us'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { t: 'Premium visuals', d: 'Designed for brand perception.' },
            { t: 'Clean layout', d: 'Readable typography and spacing.' },
            { t: 'Conversion ready', d: 'CTA blocks and trust signals.' },
          ].map((x) => (
            <div key={x.t} className="border border-gray-100 p-6">
              <div className="font-semibold text-gray-900">{x.t}</div>
              <div className="text-sm text-gray-600 mt-2">{x.d}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-100 p-6">
            <div className="font-semibold text-gray-900">Editorial photo block (Unsplash hotlink)</div>
            <img src={u1} alt="Demo" className="mt-4 w-full h-64 object-cover" />
          </div>
          <div className="border border-gray-100 p-6">
            <div className="font-semibold text-gray-900">Brand Story</div>
            <div className="text-sm text-gray-600 mt-2">
              {aboutData?.aboutText || 'Tell your brand story here. This theme makes content feel premium.'}
            </div>
            <div className="mt-5 text-sm text-gray-700">
              <span className="font-semibold">{companyName || 'Your Company'}</span> · Quality-first · Global delivery
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
