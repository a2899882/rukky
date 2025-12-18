export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const host = baseUrl.replace(/\/$/, '');
  const adminBase = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH || '';
  const adminPrefix = adminBase && adminBase.startsWith('/') ? adminBase.replace(/\/$/, '') : (adminBase ? `/${adminBase.replace(/\/$/, '')}` : '');

  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /admin/',
    'Disallow: /adminLogin',
    'Disallow: /adminLogin/',
    'Disallow: /myapp/',
  ];

  if (adminPrefix && adminPrefix !== '/admin') {
    lines.push(`Disallow: ${adminPrefix}`);
    lines.push(`Disallow: ${adminPrefix}/`);
  }

  if (host) {
    lines.push(`Sitemap: ${host}/sitemap.xml`);
  }

  return new Response(lines.join('\n') + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
