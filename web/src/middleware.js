import { NextResponse } from 'next/server';

const SUPPORTED = new Set([
  'en',
  'zh',
  'fr',
  'de',
  'es',
  'pt',
  'ar',
  'sw',
  'zh-TW',
  'ja',
  'th',
  'vi',
]);

function normalizeLang(raw) {
  const v = (raw || '').trim();
  if (!v) return null;
  if (SUPPORTED.has(v)) return v;
  const lower = v.toLowerCase();
  if (lower === 'zh-tw' || lower === 'zh-hant' || lower === 'zh-hant-tw') return 'zh-TW';
  if (lower.startsWith('zh')) return 'zh';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('pt')) return 'pt';
  if (lower.startsWith('ar')) return 'ar';
  if (lower.startsWith('sw')) return 'sw';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('th')) return 'th';
  if (lower.startsWith('vi')) return 'vi';
  return null;
}

function pickLang(request) {
  const cookieLang = normalizeLang(request.cookies.get('lang')?.value);
  if (cookieLang) return cookieLang;

  const accept = request.headers.get('accept-language') || '';
  const first = accept.split(',')[0] || '';
  return normalizeLang(first) || 'en';
}

function appendVary(existing, value) {
  const cur = (existing || '').trim();
  if (!cur) return value;
  const parts = cur.split(',').map((x) => x.trim()).filter(Boolean);
  if (!parts.some((p) => p.toLowerCase() === value.toLowerCase())) {
    parts.push(value);
  }
  return parts.join(', ');
}

export function middleware(request) {
  const lang = pickLang(request);
  const response = NextResponse.next();

  response.headers.set('Content-Language', lang);
  response.headers.set('Vary', appendVary(response.headers.get('Vary'), 'Accept-Language'));
  response.headers.set('Vary', appendVary(response.headers.get('Vary'), 'Cookie'));

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
