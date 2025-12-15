import Link from 'next/link';
import Image from 'next/image';
import {formatDate} from "@/utils/tools";
import lang from "@/locales";
import HtmlPanel from "@/components/index/sections/htmlPanel";

export default function CaseDetail({ detailData, categoryData, recommendData }){
    return (
        <div className="bg-mainColorLight py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* 面包屑导航 */}
                <div className="mb-8 hidden md:block">
                    <div className="flex items-center text-sm text-gray-500">
                        <Link href="/" className="hover:text-mainColorNormal transition-colors">{lang.Home}</Link>
                        <span className="mx-2">/</span>
                        <Link href="/case" className="hover:text-mainColorNormal transition-colors">{lang.Case}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-mainColorNormal">{detailData.title}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                    {/* 左侧案例详情 */}
                    <div className="lg:col-span-7">
                        <article
                            className="prose prose-lg max-w-none bg-white p-6 rounded-md border border-gray-200 shadow-md">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{detailData.title}</h1>

                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8">
                                <span>{lang.Client}: {detailData.client}</span>
                                <span>•</span>
                                <span>{formatDate(detailData.create_time.slice(0, 10))}</span>
                            </div>

                            <div className="relative w-full aspect-video mb-8 rounded-md overflow-hidden">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${detailData.cover}`}
                                    alt={detailData.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                                    className="object-cover"
                                />
                            </div>

                            <HtmlPanel htmlText={detailData.description} ></HtmlPanel>
                        </article>
                    </div>

                    {/* 右侧产品分类和推荐产品 */}
                    <div className="lg:col-span-3">
                        <div className="top-8 space-y-8">
                            {/* 产品分类 */}
                            <div className="bg-white border border-gray-200 rounded-md p-6 shadow-md">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">{lang.ProductCategories}</h2>
                                <ul className="space-y-3">
                                    {categoryData.map((category) => (
                                        <li key={category.id}>
                                            <Link href={'/product/category/' + category.id}
                                                  className="text-gray-600 hover:text-mainColorNormal transition-colors flex items-center">
                                                <svg className="w-3 h-3 text-mainColorNormal mr-2" fill="currentColor"
                                                     viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd"
                                                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                          clipRule="evenodd"/>
                                                </svg>
                                                {category.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* 推荐产品 */}
                            {
                                recommendData?.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-md p-6 shadow-md">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">{lang.RecommendedProducts}</h2>
                                        <div className="space-y-6">
                                            {recommendData.map((product) => {
                                                // 提取第一张图片
                                                const cover = product.cover ? product.cover.split('#')[0] : '';
                                                return (<Link
                                                        key={product.id}
                                                        href={`/products/${product.id}`}
                                                        className="block group"
                                                    >
                                                        <div
                                                            className="relative h-44 rounded-md overflow-hidden mb-3 shadow-sm">
                                                            <Image
                                                                src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${cover}`}
                                                                alt={product.title}
                                                                fill
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-mainColorNormal transition-colors duration-300">
                                                            {product.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {product.category_title}
                                                        </p>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}