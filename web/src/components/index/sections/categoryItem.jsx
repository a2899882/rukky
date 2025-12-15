'use client'
import {useState} from "react";
import Link from "next/link";
import {ChevronDownIcon} from "@heroicons/react/20/solid";


export default function CategoryItem({ category, currentCategoryId }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubCategories = category.children && category.children.length > 0;
    const isActive = currentCategoryId === category.id;

    return (
        <div className="mb-2">
            <div className="flex justify-between items-center py-2">
                <Link
                    href={`/product/category/${category.id}`}
                    className={`${isActive ? 'text-mainColorNormal font-semibold' : 'text-gray-600'} hover:text-mainColorNormal flex-grow`}
                >
                    {category.title}
                </Link>
                {hasSubCategories && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1 bg-transparent text-gray-500 hover:text-mainColorNormal focus:outline-none"
                    >
                        <ChevronDownIcon
                            className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                )}
            </div>

            {/* 子分类 */}
            {hasSubCategories && isOpen && (
                <ul className="pl-6 mt-1 border-t border-gray-100">
                    {category.children.map((subCategory) => (
                        <li key={subCategory.id} className="flex items-center py-2">
                            <span className="text-xl text-gray-500 mr-2">•</span>
                            <Link
                                href={`/product/category/${subCategory.id}`}
                                className={`${currentCategoryId === subCategory.id ? 'text-mainColorNormal font-semibold' : 'text-gray-600'} hover:text-mainColorNormal`}
                            >
                                {subCategory.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
