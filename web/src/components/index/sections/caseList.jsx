import Pagination from "@/components/index/sections/pagination";
import Link from 'next/link';
import Image from 'next/image';
import lang from "@/locales";

// 示例案例数据
const cases = [
    {
        id: 1,
        title: 'Global E-commerce Platform Redesign',
        client: 'TechRetail Inc.',
        category: 'E-commerce',
        description: 'Complete redesign of a global e-commerce platform resulting in 45% increase in conversions and 30% reduction in cart abandonment.',
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
        href: '/case-studies/global-ecommerce-redesign',
        date: 'June 2023'
    },
    {
        id: 2,
        title: 'Enterprise IoT Dashboard System',
        client: 'IndusTech Solutions',
        category: 'Industrial IoT',
        description: 'Development of a comprehensive IoT dashboard monitoring over 5,000 connected devices across 12 manufacturing plants.',
        imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
        href: '/case-studies/enterprise-iot-dashboard',
        date: 'April 2023'
    },
    {
        id: 3,
        title: 'Fintech Mobile Application',
        client: 'GlobalPay Financial',
        category: 'Finance',
        description: 'Award-winning mobile banking application with state-of-the-art security features and intuitive UX, serving over 2 million users.',
        imageUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
        href: '/case-studies/fintech-mobile-app',
        date: 'February 2023'
    },
    {
        id: 4,
        title: 'Healthcare Patient Management System',
        client: 'MediCare Solutions',
        category: 'Healthcare',
        description: 'Integrated patient management system connecting 35 hospitals and 120 clinics, streamlining care for over 500,000 patients.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
        href: '/case-studies/healthcare-patient-management',
        date: 'December 2022'
    },
    {
        id: 5,
        title: 'Smart City Infrastructure Project',
        client: 'MetroTech Urban Development',
        category: 'Smart City',
        description: 'Comprehensive smart city solution including traffic management, public safety, and environmental monitoring systems.',
        imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80',
        href: '/case-studies/smart-city-infrastructure',
        date: 'November 2022'
    },
    {
        id: 6,
        title: 'Educational Platform for Remote Learning',
        client: 'EduFuture Academy',
        category: 'Education',
        description: 'Interactive learning platform supporting over 50,000 students with real-time collaboration and AI-driven personalized learning paths.',
        imageUrl: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
        href: '/case-studies/educational-platform',
        date: 'October 2022'
    }
];

export default function CaseList({pageNumber=1, total, caseData}) {
    return (
        <div className="bg-white py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* 案例列表 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                    {caseData.map((caseItem) => (
                        <article key={caseItem.id} className="group relative flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                            {/* 整个卡片可点击 */}
                            <Link href={'/case/'+caseItem.id} className="absolute w-full h-full top-0 left-0 inset-0 z-10">
                                <span className="sr-only">View case study</span>
                            </Link>
                            
                            {/* 图片部分 */}
                            <div className="relative h-56 overflow-hidden">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${caseItem.cover}`}
                                    alt={caseItem.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            
                            {/* 内容部分 */}
                            <div className="flex-1 bg-white p-6 flex flex-col">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-mainColorNormal transition-colors duration-300 line-clamp-2">
                                        {caseItem.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600 font-medium">
                                        {lang.Client}: {caseItem.client}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{caseItem.date}</span>
                                    <span className="inline-flex items-center text-sm font-medium text-mainColorNormal group-hover:text-mainColorDeep">
                                        {lang.ViewCaseStudy}
                                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* 分页 */}
                <div className="mt-12">
                    <Pagination linkPrefix="/case/page" currentPage={pageNumber} total={total} />
                </div>
            </div>
        </div>
    );
}