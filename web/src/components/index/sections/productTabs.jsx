'use client';

import {
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
} from '@headlessui/react'
import lang from "@/locales";
import Link from "next/link";
import HtmlPanel from "@/components/index/sections/htmlPanel";

export default function ProductTabs({product}) {
    let propertiesArr = [];
    try{
        propertiesArr = JSON.parse(product.properties);
    }catch (error){}


    // 分享链接构建
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const articleUrl = `${baseUrl}/product/${product.id}`;
    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(product.title);
    const encodedSummary = encodeURIComponent(`Check out this article: ${product.title}`);

    // 社交媒体分享链接
    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };


    return (
        <div className="mt-16">
            <TabGroup>
                <TabList className="flex border-b border-gray-200">
                    <Tab
                        className={({selected}) =>
                            `bg-transparent py-4 px-1 text-sm font-medium border-b-2 mr-8 focus:outline-none whitespace-nowrap ${
                                selected
                                    ? 'border-mainColorNormal text-mainColorNormal'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        {lang.Description}
                    </Tab>
                    <Tab
                        className={({selected}) =>
                            `bg-transparent py-4 px-1 text-sm font-medium border-b-2 mr-8 focus:outline-none whitespace-nowrap ${
                                selected
                                    ? 'border-mainColorNormal text-mainColorNormal'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        {lang.AdditionalInformation}
                    </Tab>
                </TabList>

                <TabPanels className="mt-10">
                    {/* 描述内容面板 */}
                    <TabPanel>
                        <h3 className="text-2xl font-bold mb-6">{lang.ProductDescription}</h3>
                        <HtmlPanel htmlText={product.description} ></HtmlPanel>
                        {/* 分享按钮  */}
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
                    </TabPanel>

                    {/* 额外信息面板 */}
                    <TabPanel>
                        <h3 className="text-2xl font-bold mb-6">{lang.AdditionalInformation}</h3>
                        <div className="border-t border-gray-200">
                            <dl>
                                {
                                    propertiesArr.map((property, index) => {
                                        let color = index % 2 !== 0 ? 'bg-gray-50' : ''
                                        return (
                                            <div key={index}
                                                 className={`px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 ${color}`}>
                                                <dt className="text-sm font-medium text-gray-900">{property.name}</dt>
                                                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">{property.value}</dd>
                                            </div>
                                        )
                                    })
                                }
                            </dl>
                        </div>
                    </TabPanel>

                </TabPanels>
            </TabGroup>
        </div>
    );
}