import Image from 'next/image';
import Link from 'next/link';
import ProductTabs from '@/components/index/sections/productTabs';
import ProductCover from "@/components/index/sections/productCover";
import lang from "@/locales";
import React from "react";
import AddToCartButtons from '@/components/index/shop/AddToCartButtons';

export default function ProductDetail({detailData, relatedData}) {
    const skus = Array.isArray(detailData?.skus) ? detailData.skus : [];
    const [selectedSkuId, setSelectedSkuId] = React.useState(skus.length ? null : null);

    const selectedSku = React.useMemo(() => {
        if (!selectedSkuId) return null;
        const sku = skus.find((x) => String(x.id) === String(selectedSkuId));
        if (!sku) return null;
        const attrs = sku.attrs;
        let label = '';
        if (attrs && typeof attrs === 'object') {
            if (Array.isArray(attrs)) {
                label = attrs.join(' / ');
            } else {
                label = Object.entries(attrs).map(([k, v]) => `${k}:${v}`).join(' / ');
            }
        }
        return {
            id: sku.id,
            label,
            price: sku.price,
            coverUrl: sku.cover ? `${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${sku.cover}` : '',
        };
    }, [selectedSkuId, skus]);

    const inquiryHref = React.useMemo(() => {
        const params = new URLSearchParams();
        try {
            if (detailData?.title) params.set('inquiryProduct', String(detailData.title));
            if (detailData?.id != null) params.set('inquiryProductId', String(detailData.id));
            if (selectedSku?.label) params.set('inquirySku', String(selectedSku.label));
            if (typeof window !== 'undefined' && window?.location?.href) {
                params.set('inquiryUrl', window.location.href);
            }
        } catch (e) {
        }
        const qs = params.toString();
        return qs ? `/?${qs}#inquiry` : '/#inquiry';
    }, [detailData?.id, detailData?.title, selectedSku?.label]);

    const TrustPanel = () => {
        return (
            <div className="mt-6 rounded-md border bg-gray-50 p-4 text-sm">
                <div className="font-semibold text-gray-900">Buy with confidence</div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600">
                    <div>
                        <div className="font-medium text-gray-800">Secure payment</div>
                        <div className="text-xs">Stripe / PayPal supported</div>
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">Fast support</div>
                        <div className="text-xs">
                            Need a quote or bulk pricing? <Link href={inquiryHref} className="text-blue-600 hover:underline">Send an inquiry</Link>
                        </div>
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">Shipping</div>
                        <div className="text-xs">We will confirm shipping options after your order</div>
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">Returns</div>
                        <div className="text-xs">Contact us if you have any issues with your order</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* 面包屑导航 */}
            <div className="mb-8 text-sm">
                <nav className="text-gray-500">
                    <Link href="/" className="hover:text-mainColorNormal">{lang.Home}</Link>
                    <span className="mx-2">/</span>
                    <Link href="/product" className="hover:text-mainColorNormal">{lang.Product}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{detailData.title}</span>
                </nav>
            </div>

            {/* 商品详情主体 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* 左侧商品图片 - 使用轮播组件 */}
                <div className="aspect-[4/3]">
                    <ProductCover product={detailData}/>

                    {detailData.video && detailData.video.length > 0 ? (
                        <div className="mt-4">
                            <video
                                controls
                                className="w-full"
                                src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/file/${detailData.video}`}
                            />
                        </div>
                    ) : null}
                </div>

                {/* 右侧商品信息 */}
                <div>
                    {/* 商品名称 */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {detailData.title}
                    </h1>

                    {/* 商品价格 */}
                    {detailData.price && detailData.price.length > 0 && (
                        <div className="text-2xl font-bold text-gray-900 mt-4 mb-1.5">
                            {detailData.price}
                        </div>
                    )}

                    {/* 商品摘要 */}
                    <div className="text-gray-700 mb-8">
                        <p>{detailData.summary}</p>
                    </div>

                    {skus.length > 0 ? (
                        <div className="mb-6">
                            <div className="text-sm text-gray-600 mb-2">Select variant</div>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={selectedSkuId || ''}
                                onChange={(e) => setSelectedSkuId(e.target.value || null)}
                            >
                                <option value="">Please select</option>
                                {skus.map((s) => {
                                    const attrs = s.attrs;
                                    let label = s.sku_code || '';
                                    if (attrs && typeof attrs === 'object') {
                                        if (Array.isArray(attrs)) {
                                            label = attrs.join(' / ');
                                        } else {
                                            label = Object.entries(attrs).map(([k, v]) => `${k}:${v}`).join(' / ');
                                        }
                                    }
                                    return (
                                        <option key={s.id} value={s.id}>
                                            {label || `SKU #${s.id}`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    ) : null}

                    {/* 获取免费报价按钮 */}
                    <div className="mb-8">
                        <Link
                            href="/contact"
                            className="bg-mainColorNormal hover:bg-mainColorDeep text-white py-3 px-6 transition-colors w-full text-center font-medium"
                        >
                            {lang.GetAFreeQuote}
                        </Link>
                    </div>

                    <div className="mb-8">
                        <AddToCartButtons
                            product={{
                                id: detailData.id,
                                title: detailData.title,
                                price: detailData.price,
                                coverUrl: detailData.cover ? `${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${detailData.cover.split('#')[0]}` : '',
                            }}
                            selectedSku={selectedSku}
                        />

                        <div className="mt-4 text-sm text-gray-600">
                            Prefer to confirm details first? <Link href={inquiryHref} className="text-blue-600 hover:underline">Send an inquiry</Link>
                        </div>

                        <TrustPanel />
                    </div>

                    {/* 商品分类 */}
                    <div className="text-sm text-gray-600">
                        <span>{lang.Category}: </span>
                        <Link href={`/product/category/${detailData.category}`}
                              className="text-mainColorNormal">
                            {detailData.category_title}
                        </Link>
                    </div>
                </div>
            </div>

            {/* 产品选项卡 */}
            <ProductTabs product={detailData}/>

            {/* 产品推荐 */}
            {relatedData.length > 0 && (
                <div className="mt-24">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                            {lang.RelatedProducts}
                        </h2>
                    </div>
                    <div className="w-full h-[1px] bg-[#eee] mb-10">
                        <div className="h-[1px] w-[100px] bg-mainColorNormal"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedData.map((relatedProduct) => {
                            // 提取第一张图片
                            const cover = relatedProduct.cover ? relatedProduct.cover.split('#')[0] : '';
                            return (
                                <div key={relatedProduct.id} className="group">
                                    <div className="relative mb-6 overflow-hidden bg-gray-100">
                                        <Link href={`/product/${relatedProduct.id}`}>
                                            <div className="relative w-full pt-[100%]">
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${cover}`}
                                                    alt={relatedProduct.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                                                />
                                            </div>
                                        </Link>
                                    </div>

                                    <Link href={`/product/${relatedProduct.id}`}>
                                        <h3 className="text-gray-800 font-semibold text-lg mb-2">{relatedProduct.title}</h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 mb-2">{relatedProduct.category_title}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}