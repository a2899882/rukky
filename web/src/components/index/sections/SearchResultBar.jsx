'use client'
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";

export default function SearchResultBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('s') || '';


    // 清空搜索
    const clearSearch = () => {
        router.push('/product');
    };

    if(!searchQuery){
        return null;
    }

    return (
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md mb-8">
            <div className="text-gray-700 font-medium">
                Search results for: <span className="font-bold text-mainColorNormal">"{searchQuery}"</span>
            </div>
            <button
                onClick={clearSearch}
                className="flex items-center text-gray-500 hover:text-mainColorNormal transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
            </button>
        </div>
    )
}