import Pagination from "@/components/index/sections/pagination";
import Link from 'next/link';
import Image from 'next/image';
import {formatDate} from "@/utils/tools";

const posts = [
    {
        id: 1,
        title: 'Boost your conversion rate',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80',
        date: 'Mar 16, 2020',
        datetime: '2020-03-16',
        category: {title: 'Marketing', href: '#'},
        author: {
            name: 'Michael Foster',
            role: 'Co-Founder / CTO',
            href: '#',
            imageUrl:
                'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    },
    {
        id: 2,
        title: 'How to use search engine optimization to drive traffic to your website and increase visibility in search results',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80',
        date: 'Apr 20, 2020',
        datetime: '2020-04-20',
        category: {title: 'SEO', href: '#'},
        author: {
            name: 'Lindsay Walton',
            role: 'Front-end Developer',
            href: '#',
            imageUrl:
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    },
    {
        id: 3,
        title: 'Improve your customer experience',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1492724441997-5dc865305da7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80',
        date: 'May 8, 2020',
        datetime: '2020-05-08',
        category: {title: 'Customer Success', href: '#'},
        author: {
            name: 'Tom Cook',
            role: 'Product Manager',
            href: '#',
            imageUrl:
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    },
    {
        id: 4,
        title: 'The future of e-commerce and retail technology',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1554200876-56c2f25224fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3600&q=80',
        date: 'Jun 12, 2020',
        datetime: '2020-06-12',
        category: {title: 'E-commerce', href: '#'},
        author: {
            name: 'Sarah Johnson',
            role: 'E-commerce Strategist',
            href: '#',
            imageUrl:
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    },
    {
        id: 5,
        title: 'Mobile app development trends for 2023',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3600&q=80',
        date: 'Jul 5, 2020',
        datetime: '2020-07-05',
        category: {title: 'Mobile Development', href: '#'},
        author: {
            name: 'David Wilson',
            role: 'Mobile Developer',
            href: '#',
            imageUrl:
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    },
    {
        id: 6,
        title: 'AI and machine learning applications in business',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3600&q=80',
        date: 'Aug 17, 2020',
        datetime: '2020-08-17',
        category: {title: 'Artificial Intelligence', href: '#'},
        author: {
            name: 'Emily Chen',
            role: 'AI Researcher',
            href: '#',
            imageUrl:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    },
    {
        id: 7,
        title: 'Sustainable practices in modern businesses',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3600&q=80',
        date: 'Sep 3, 2020',
        datetime: '2020-09-03',
        category: {title: 'Sustainability', href: '#'},
        author: {
            name: 'Robert Green',
            role: 'Sustainability Consultant',
            href: '#',
            imageUrl:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    },
    {
        id: 8,
        title: 'Cybersecurity essentials for small businesses',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3600&q=80',
        date: 'Oct 22, 2020',
        datetime: '2020-10-22',
        category: {title: 'Cybersecurity', href: '#'},
        author: {
            name: 'Jennifer Lee',
            role: 'Security Specialist',
            href: '#',
            imageUrl:
                'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    },
    {
        id: 9,
        title: 'Remote work strategies for distributed teams',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3600&q=80',
        date: 'Nov 10, 2020',
        datetime: '2020-11-10',
        category: {title: 'Remote Work', href: '#'},
        author: {
            name: 'Alex Morgan',
            role: 'Remote Work Consultant',
            href: '#',
            imageUrl:
                'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    }
]

export default function NewsList({pageNumber=1, total, newsData}) {
    return (
        <div className="bg-white py-8 sm:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div
                    className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {newsData.map((post, index) => (
                        <article key={post.id} className="flex flex-col items-start group relative">
                            <Link href={`/news/${post.id}`} className="absolute w-full h-full top-0 left-0 inset-0 z-10">
                                <span className="sr-only">detail</span>
                            </Link>
                            
                            <div className="relative w-full overflow-hidden cursor-pointer" style={{ paddingBottom: '75%' }}>
                                <div className="absolute w-full h-full top-0 left-0 inset-0">
                                    <Image
                                        alt={post.title || "News image"}
                                        src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${post.cover}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                        priority={index === 0}
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-gray-900/10"/>
                                </div>
                            </div>
                            <div className="max-w-xl w-full">
                                <div className="relative">
                                    <h3 className="mt-6 text-lg font-semibold text-gray-900 group-hover:text-gray-600 line-clamp-3">
                                        {post.title}
                                    </h3>
                                </div>
                                <div className="mt-3 flex items-center text-sm text-gray-500">
                                    <time dateTime={post.datetime}>
                                        {formatDate(post.create_time.slice(0,10))}
                                    </time>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-12">
                    <Pagination linkPrefix="/news/page" currentPage={pageNumber} total={total}/>
                </div>
            </div>
        </div>
    )
}
