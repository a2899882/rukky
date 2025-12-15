'use client'
import Image from 'next/image';
import Link from 'next/link';
import lang from "@/locales";

export default function AboutUs({aboutData, companyName, statsData}) {
    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{lang.AboutUs}</h2>
                    <p className="text-lg text-gray-500 max-w-3xl mx-auto">
                        {lang.AboutUsTip}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* 左侧图片 */}
                    <div className="relative h-[300px] lg:h-full overflow-hidden">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${aboutData.aboutCover}`}
                            alt={companyName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>

                    {/* 右侧内容 */}
                    <div className="flex flex-col justify-center">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                            {companyName}
                        </h3>
                        <p className="mb-6 text-gray-700"
                           dangerouslySetInnerHTML={{__html: aboutData.aboutText}}>
                        </p>

                        <Link href="/about"
                              className="inline-block px-6 py-3 bg-mainColorNormal text-white font-medium rounded-md hover:bg-mainColorDeep transition-colors duration-300 self-start">
                            {lang.ViewMore}
                        </Link>
                    </div>
                </div>

                {/* 统计数据 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center">
                    <div className="p-6 bg-mainColorLight rounded-md">
                        <div className="text-4xl font-bold text-mainColorNormal mb-2">{statsData.param_one_value}</div>
                        <div className="text-gray-700">{statsData.param_one_name}</div>
                    </div>
                    <div className="p-6 bg-mainColorLight rounded-md">
                        <div className="text-4xl font-bold text-mainColorNormal mb-2">{statsData.param_two_value}</div>
                        <div className="text-gray-700">{statsData.param_two_name}</div>
                    </div>
                    <div className="p-6 bg-mainColorLight rounded-md">
                        <div
                            className="text-4xl font-bold text-mainColorNormal mb-2">{statsData.param_three_value}</div>
                        <div className="text-gray-700">{statsData.param_three_name}</div>
                    </div>
                    <div className="p-6 bg-mainColorLight rounded-md">
                        <div className="text-4xl font-bold text-mainColorNormal mb-2">{statsData.param_four_value}</div>
                        <div className="text-gray-700">{statsData.param_four_name}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}