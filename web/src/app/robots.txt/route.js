export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const host = baseUrl.replace(/\/$/, '');

  const lines = [
    'User-agent: *',
    'Allow: /',
  ];

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
