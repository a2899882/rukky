export default function Stats() {
    // 企业指标数据
    const statsData = [
        {
            id: 1,
            value: "40",
            label: "Number of rooms"
        },
        {
            id: 2,
            value: "12",
            label: "Years of service"
        },
        {
            id: 3,
            value: "128K+",
            label: "Happy guests"
        },
        {
            id: 4,
            value: "400",
            label: "Sq. meter area"
        }
    ];

    return (
        <div className="py-12 md:py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 大型图片区域 */}
                {/*<div className="mb-12 md:mb-16 overflow-hidden h-[300px] md:h-[550px]">*/}
                {/*    <img */}
                {/*        src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" */}
                {/*        alt="Beachside cottage with white picket fence" */}
                {/*        className="w-full h-full object-cover"*/}
                {/*    />*/}
                {/*</div>*/}

                {/* 数据统计区域 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
                    {statsData.map(stat => (
                        <div key={stat.id} className="text-center">
                            <p className="text-2xl md:text-4xl lg:text-5xl font-semibold text-mainColorNormal mb-2">
                                {stat.value}
                            </p>
                            <p className="mt-4 text-sm md:text-base font-semibold text-gray-900">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}