/** @type {import('next').NextConfig} */

const rawHost = (process.env.NEXT_PUBLIC_HOST || '').trim();
const imageDomains = rawHost
    ? Array.from(new Set([
        rawHost.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '').startsWith('www.')
            ? rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^www\./, '')
            : `www.${rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '')}`,
    ].filter(Boolean)))
    : [];

const enableHsts = String(process.env.NEXT_PUBLIC_BASE_URL || '').startsWith('https://');

const nextConfig = {
    basePath: '', // 设置统一前缀如/en
    assetPrefix: '', // 静态资源前缀
    reactStrictMode: false,
    eslint: {
        ignoreDuringBuilds: true, // build时跳过eslint
    },
    rewrites: async () => {
        const adminBase = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH || '';
        const base = adminBase && adminBase.startsWith('/') ? adminBase.replace(/\/$/, '') : (adminBase ? `/${adminBase.replace(/\/$/, '')}` : '');
        if (!base || base === '/admin') {
            return [];
        }
        return [
            {
                source: `${base}`,
                destination: '/admin',
            },
            {
                source: `${base}/:path*`,
                destination: '/admin/:path*',
            },
            {
                source: `${base}Login`,
                destination: '/adminLogin',
            },
        ];
    },
    env: {
        NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "da9h8exvs",
        NEXT_PUBLIC_CLOUDINARY_PRESET_NAME: "fi0lxkc1",
    },
    images: {
        domains: imageDomains,
    },
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    headers: async () => [
        {
            source: '/:path*',
            headers: [
                {
                    key: 'X-DNS-Prefetch-Control',
                    value: 'on'
                },
                ...(enableHsts ? [{
                    key: 'Strict-Transport-Security',
                    value: 'max-age=63072000; includeSubDomains; preload'
                }] : []),
                {
                    key: 'X-XSS-Protection',
                    value: '1; mode=block'
                },
                {
                    key: 'X-Frame-Options',
                    value: 'SAMEORIGIN'
                },
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff'
                }
            ]
        }
    ],
    poweredByHeader: false,
    compress: true,
};

export default nextConfig;
