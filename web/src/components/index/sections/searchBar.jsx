'use client'
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import lang from "@/locales";


export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('s') || '';
    const [searchTerm, setSearchTerm] = useState(searchQuery);

    // 更新搜索框的值
    useEffect(() => {
        setSearchTerm(searchQuery);
    }, [searchQuery]);

    // 处理搜索提交
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/product?s=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <div className="mb-8">
            <form onSubmit={handleSearch} className="flex">
                <input
                    type="text"
                    placeholder={lang.SearchProducts}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="bg-mainColorNormal text-white px-4 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </button>
            </form>
        </div>
    )
}