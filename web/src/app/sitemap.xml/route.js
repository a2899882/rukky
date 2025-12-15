export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const host = baseUrl.replace(/\/$/, '');
  const apiBase = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || host).replace(/\/$/, '');

  const upstream = `${apiBase}/myapp/index/sitemap/section`;

  try {
    const resp = await fetch(upstream, {
      method: 'GET',
      headers: {
        'Accept': 'text/xml,application/xml;q=0.9,*/*;q=0.8',
      },
      cache: 'no-store',
    });

    const xml = await resp.text();

    return new Response(xml, {
      status: resp.ok ? 200 : resp.status,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    const fallback = host
      ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${host}/</loc>\n  </url>\n</urlset>`
      : `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    return new Response(fallback, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
}
