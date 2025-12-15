import Link from 'next/link';
import Image from 'next/image';
import {Suspense} from 'react';
import {formatDate} from "@/utils/tools";
import lang from "@/locales";
import HtmlPanel from "@/components/index/sections/htmlPanel";

// 骨架屏组件
const ImageSkeleton = ({className}) => (
    <div className={`animate-pulse bg-gray-200 ${className || 'w-full h-full'}`}></div>
);

export default function NewsDetail({
    detailData,
    categoryData,
    recommendData,
    shareLinks
}) {
    if (!detailData) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">News Article Not Found</h1>
                    <p className="text-gray-600 mb-8">The news article you are looking for does not exist or has been
                        removed.</p>
                    <Link href="/news"
                          className="bg-mainColorNormal text-white px-4 py-2 rounded hover:bg-mainColorDeep transition-colors">
                        Return to News List
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-mainColorLight py-8 lg:py-16">
            <div className="container mx-auto px-4">
                {/* 面包屑导航 */}
                <div className="mb-8 hidden md:block">
                    <div className="flex items-center text-sm text-gray-500">
                        <Link href="/" className="hover:text-mainColorNormal transition-colors">{lang.Home}</Link>
                        <span className="mx-2">/</span>
                        <Link href="/news" className="hover:text-mainColorNormal transition-colors">{lang.News}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-mainColorNormal">{detailData.title}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">
                    {/* 左侧新闻详情 */}
                    <div className="">
                        <div
                            className="bg-white overflow-hidden rounded-md border border-gray-200 shadow-md">

                            <div className="p-6 lg:p-8">
                                {/* 标题信息和日期 */}
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{detailData.title}</h1>

                                <div
                                    className="flex flex-wrap items-center text-sm text-gray-500 mb-6">
                                    <span className="mr-4 flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-mainColorNormal" fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        {formatDate(detailData.create_time.slice(0, 10))}
                                    </span>

                                    <span className="mr-4 flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-mainColorNormal" fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        {detailData.source}
                                    </span>
                                </div>

                                {/* 主图  */}
                                <div className="relative w-full aspect-video mb-6 overflow-hidden rounded-lg">
                                    <Suspense fallback={<ImageSkeleton className="w-full h-72 md:h-96 rounded-lg"/>}>
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${detailData.cover}`}
                                            alt={detailData.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 800px"
                                            priority={true}
                                            className="object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                    </Suspense>
                                </div>

                                {/* 文章内容 */}
                                <HtmlPanel htmlText={detailData.description} ></HtmlPanel>

                                {/* 分享按钮 - 使用Link标签代替a标签 */}
                                <div className="mt-8 flex items-center">
                                    <span className="text-gray-700 font-medium mr-4">Share:</span>
                                    <div className="flex space-x-2">
                                        <Link
                                            href={shareLinks.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Share on Facebook"
                                            className="w-8 h-8 rounded-full bg-mainColorNormal text-white flex items-center justify-center hover:bg-mainColorDeep transition-colors">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                                            </svg>
                                        </Link>
                                        <Link
                                            href={shareLinks.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Share on Twitter"
                                            className="w-8 h-8 rounded-full bg-mainColorNormal text-white flex items-center justify-center hover:bg-mainColorDeep transition-colors">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                                            </svg>
                                        </Link>
                                        <Link
                                            href={shareLinks.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Share on LinkedIn"
                                            className="w-8 h-8 rounded-full bg-mainColorNormal text-white flex items-center justify-center hover:bg-mainColorDeep transition-colors">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"></path>
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 右侧产品推荐和分类 */}
                    <div className="space-y-8">
                        {/* 产品分类 */}
                        <div
                            className="bg-white border border-gray-200 rounded-md shadow-md">
                            <div className="border-b border-gray-100">
                                <h3 className="text-xl font-bold px-6 py-4 flex items-center">
                                    <svg className="w-5 h-5 text-mainColorNormal mr-2" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M4 6h16M4 12h16m-7 6h7"></path>
                                    </svg>
                                    {lang.ProductCategories}
                                </h3>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-3">
                                    {categoryData.map(category => (
                                        <li key={category.id}
                                            className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                                            <Link href={`/product/category/${category.id}`}
                                                  className="flex items-center text-gray-700 hover:text-mainColorNormal transition-colors group">
                                                <div
                                                    className="w-2 h-2 rounded-full bg-mainColorNormal group-hover:bg-mainColorNormal transition-colors mr-3 flex-shrink-0"></div>
                                                <span className="flex-grow">{category.title}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* 推荐产品 */}
                        {
                            recommendData?.length > 0 && (
                                <div
                                    className="bg-white  border border-gray-200 rounded-md overflow-hidden shadow-md">
                                    <div className="border-b border-gray-100">
                                        <h3 className="text-xl font-bold px-6 py-4 flex items-center">
                                            <svg className="w-5 h-5 text-mainColorNormal mr-2" fill="none"
                                                 stroke="currentColor"
                                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                                            </svg>
                                            {lang.RecommendedProducts}
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-5">
                                            {recommendData.map(product => {
                                                // 提取第一张图片
                                                const cover = product.cover ? product.cover.split('#')[0] : '';
                                                return (
                                                    <Link href={`/product/${product.id}`} key={product.id}
                                                          className="group flex items-center pb-5 last:pb-0 last:mb-0 border-b border-gray-50 last:border-0">
                                                        <div
                                                            className="w-24 h-24 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 relative border border-gray-100 group-hover:border-mainColorLight transition-colors">
                                                            <Suspense
                                                                fallback={<ImageSkeleton
                                                                    className="w-24 h-24 rounded-md"/>}>
                                                                <Image
                                                                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${cover}`}
                                                                    alt={product.title}
                                                                    fill
                                                                    sizes="96px"
                                                                    loading="lazy"
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            </Suspense>
                                                        </div>
                                                        <div className="ml-4 flex-grow">
                                                            <h4 className="text-gray-800 font-medium group-hover:text-mainColorNormal transition-colors">{product.title}</h4>
                                                        </div>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                        <Link href="/product"
                                              className="inline-block mt-6 pt-2 text-mainColorNormal font-medium hover:text-mainColorDeep transition-colors flex items-center">
                                            {lang.ViewAllProducts}
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}