import React from "react";
import Image from "next/image";
import lang from "@/locales";

// 企业优势数据
const advantagesList = [
    {
        id: 1,
        title: "Rich Experience",
        description: "Established in 2005, specializing in chemical raw materials export for over 18 years with extensive international trade experience.",
        url: "https://cdn-icons-png.flaticon.com/512/9616/9616003.png"
    },
    {
        id: 2,
        title: "Global Markets",
        description: "Products sold in over 80 countries and regions, with a comprehensive international sales network and logistics system.",
        url: "https://cdn-icons-png.flaticon.com/512/3069/3069186.png"
    },
    {
        id: 3,
        title: "Cooperation Partners",
        description: "Established stable cooperation with over 700 companies worldwide, including many industry leaders and renowned brands.",
        url: "https://cdn-icons-png.flaticon.com/512/921/921347.png"
    },
    {
        id: 4,
        title: "Quality Certifications",
        description: "Holder of multiple international certifications including ISO9001 and ISO14001, meeting quality and environmental standards of strict markets like EU and US.",
        url: "https://cdn-icons-png.flaticon.com/512/4406/4406665.png"
    },
    {
        id: 5,
        title: "Competitive Pricing",
        description: "Leveraging scale advantages and efficient supply chain to provide competitive prices, helping customers reduce procurement costs.",
        url: "https://cdn-icons-png.flaticon.com/512/2331/2331852.png"
    },
    {
        id: 6,
        title: "One-Stop Services",
        description: "Providing product consulting, customized solutions, logistics arrangements, customs clearance, and comprehensive professional support to simplify international trade.",
        url: "https://cdn-icons-png.flaticon.com/512/2906/2906274.png"
    }
];

export default function Advantages({advantageData}) {
    return (
        <section className="py-16 bg-mainColorLight">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="h-1 w-20 bg-gradient-to-r from-mainColorNormal to-mainColorNormalAlpha-50 mx-auto mb-6"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">{lang.OurAdvantages}</h2>
                    <p className="text-gray-600 max-w-3xl mx-auto mb-4 px-4">
                        {lang.OurAdvantagesTip}
                    </p>
                </div>

                {/* 优势卡片网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {advantageData.map((advantage) => (
                        <div key={advantage.id} 
                             className="bg-white rounded-lg p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg border border-gray-200 ">
                            <div className="mb-5 rounded-full p-3 flex items-center justify-center border border-mainColorLight relative w-[72px] h-[72px]">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${advantage.advantage_image}`}
                                    alt={advantage.advantage_title}
                                    fill
                                    sizes="72px"
                                    className="object-contain p-3"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">{advantage.advantage_title}</h3>
                            <p className="text-gray-600">{advantage.advantage_description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}