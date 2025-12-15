import lang from "@/locales";
import Image from "next/image";

const stats = [
    { label: 'Global Customers', value: '10,000+' },
    { label: 'Countries Served', value: '80+' },
    { label: 'Years Experience', value: '18+' },
]

export default function OurMission({missionData, statsData}) {
    return (
        <div className="bg-white py-10 lg:py-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 lg:px-8">
                {/* 左侧：图片和统计数据 */}
                <div className="flex flex-col order-2 lg:order-1">
                    <div className="relative h-60 lg:h-96 bg-gray-100 rounded-lg overflow-hidden mb-8">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${missionData.missionCover}`}
                            alt="Our Global Mission"
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                            priority
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-auto">
                        <div className="bg-mainColorLight p-6 rounded-lg">
                            <dd className="text-4xl font-semibold tracking-tight text-mainColorNormal mb-2">{statsData.param_one_value}</dd>
                            <dt className="text-sm text-gray-600">{statsData.param_one_name}</dt>
                        </div>
                        <div className="bg-mainColorLight p-6 rounded-lg">
                            <dd className="text-4xl font-semibold tracking-tight text-mainColorNormal mb-2">{statsData.param_two_value}</dd>
                            <dt className="text-sm text-gray-600">{statsData.param_two_name}</dt>
                        </div>
                        <div className="bg-mainColorLight p-6 rounded-lg">
                            <dd className="text-4xl font-semibold tracking-tight text-mainColorNormal mb-2">{statsData.param_three_value}</dd>
                            <dt className="text-sm text-gray-600">{statsData.param_three_name}</dt>
                        </div>
                    </div>
                </div>
                
                {/* 右侧：使命描述 */}
                <div className="flex flex-col p-0 order-1 lg:order-2">
                    <div className="h-1 w-28 bg-gradient-to-r from-mainColorNormal to-mainColorNormalAlpha-50 mb-6"></div>
                    <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-6">{lang.OurMission}</h2>
                    <p className="text-gray-700"
                       dangerouslySetInnerHTML={{ __html: missionData.missionText }}>
                    </p>
                </div>
            </div>
        </div>
    )
}