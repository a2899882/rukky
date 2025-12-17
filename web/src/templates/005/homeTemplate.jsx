 'use client';

 export default function HomeTemplate({
  featuredData,
  categoryData,
  heroText,
}) {
  const lang = require('@/locales').default;
  const hero = '/themes/hero-005.svg';
  const u1 = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=60';

  return (
    <div className="bg-gray-950 text-white">
      <section className="relative">
        <img src={hero} alt="Hero" className="w-full h-[260px] sm:h-[320px] md:h-[420px] object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />
        <div className="absolute inset-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-end pb-6 sm:pb-10">
            <div>
              <div className="text-xs tracking-widest uppercase opacity-80">Theme 005 · Commerce</div>
              <div className="text-3xl md:text-5xl font-bold mt-2">
                {heroText || 'Best sellers for your next order'}
              </div>
              <div className="text-white/80 mt-3 max-w-2xl">
                {lang?.demo_theme_desc || 'Big hero, strong CTA, product-first layout.'}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a href="/product" className="px-5 py-3 text-center bg-[hsl(var(--main-color-normal))] text-gray-950 font-semibold">
                  {lang?.demo_shop_now || 'Shop Now'}
                </a>
                <a href="/cart" className="px-5 py-3 text-center border border-white/20 text-white font-medium">
                  {lang?.demo_view_cart || 'View Cart'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { t: 'Fast delivery', d: 'Dispatch within 48 hours.' },
            { t: 'Secure checkout', d: 'Stripe / PayPal ready.' },
            { t: 'Premium quality', d: 'Built for returning customers.' },
          ].map((x) => (
            <div key={x.t} className="border border-white/10 bg-white/5 p-4 sm:p-6">
              <div className="font-semibold">{x.t}</div>
              <div className="text-sm text-white/70 mt-2">{x.d}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="border border-white/10 bg-white/5 p-6">
            <div className="font-semibold">Trending photo block (Unsplash hotlink)</div>
            <img src={u1} alt="Demo" className="mt-4 w-full h-44 sm:h-64 object-cover" />
          </div>
          <div className="border border-white/10 bg-white/5 p-6">
            <div className="font-semibold">Categories</div>
            <div className="text-sm text-white/70 mt-2">Data-driven categories from your backend.</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(categoryData || []).slice(0, 4).map((c) => (
                <a key={c.id} href={`/product/category/${c.id}`} className="bg-white/10 p-3 hover:bg-white/15">
                  <div className="text-sm font-medium">{c.title || c.name || 'Category'}</div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="h-6" />
      </section>
    </div>
  );
}
