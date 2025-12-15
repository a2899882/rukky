import Link from 'next/link';
import Image from 'next/image';
import Pagination from '@/components/index/sections/pagination';
import SearchBar from "@/components/index/sections/searchBar";
import SearchResultBar from "@/components/index/sections/SearchResultBar";
import CategoryItem from "@/components/index/sections/categoryItem";
import lang from "@/locales";


// 模拟产品数据
const products = [
    {
        id: 1,
        name: 'Anchor Bracelet',
        category: 'Accessories',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
    {
        id: 1,
        name: 'Anchor Bracelet',
        category: 'Accessories',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
    {
        id: 1,
        name: 'Anchor Bracelet',
        category: 'Accessories',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
    {
        id: 1,
        name: 'Anchor Bracelet',
        category: 'Accessories',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
    {
        id: 1,
        name: 'Anchor Bracelet',
        category: 'Accessories',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
    {
        id: 1,
        name: 'Anchor Bracelet',
        category: 'Accessories',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
    {
        id: 1,
        name: 'Anchor Bracelet',
        category: 'Accessories',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
    {
        id: 1,
        name: 'Anchor Bracelet',
        category: 'Accessories',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
    {
        id: 1,
        name: 'Anchor Bracelet',
        category: 'Accessories',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
];

// 分类组件
export default function ProductList({ categoryId, pageNumber, total, categoryData, productData, featuredData, searchQuery }) {

    // 构建基础链接前缀，不包含页码部分
    let linkPrefix = '/product';

    // 添加分类部分，如果存在
    if (categoryId) {
        linkPrefix += `/category/${categoryId}`;
    }

    // 添加页码路径前缀
    linkPrefix += '/page';

    // 如果有搜索查询，我们需要在每个分页链接中保持它
    const searchSuffix = searchQuery ? `?s=${encodeURIComponent(searchQuery)}` : '';

    let mCategoryData = categoryData;
    mCategoryData.unshift({
        id: -1,
        title: lang.AllProducts
    })

    return (
        <div className="bg-white py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8">
                    {/* 左侧边栏 */}
                    <div className="md:col-span-1">
                        {/* 搜索框 */}
                        <SearchBar />

                        {/* 分类 - 使用折叠面板 */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">{lang.Categories}</h3>
                            <div className="divide-y divide-gray-100">
                                {mCategoryData.map((category) => (
                                    <CategoryItem 
                                        key={category.id} 
                                        category={category} 
                                        currentCategoryId={Number(categoryId)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 热门产品 - 在md尺寸以下隐藏 */}
                        <div className="hidden md:block">
                            <h3 className="text-lg font-semibold mb-4">{lang.BestProducts}</h3>
                            <ul>
                                {featuredData.map((product) => {
                                    // 提取第一张图片
                                    const cover = product.cover ? product.cover.split('#')[0] : '';
                                    return (
                                    <li key={product.id} className="mb-4 pb-4 border-b border-gray-100">
                                        <Link href={`/product/${product.id}`} className="flex items-center">
                                            <div className="w-16 h-16 flex-shrink-0 mr-4 bg-gray-100 relative">
                                                <div className="w-full h-full relative">
                                                    <Image
                                                        src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${cover}`}
                                                        alt={product.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-1">{product.title}</h4>
                                            </div>
                                        </Link>
                                    </li>
                                )})}
                            </ul>
                        </div>
                    </div>

                    {/* 右侧产品列表 */}
                    <div className="md:col-span-3 bg-white p-0">

                        {/* 搜索结果提示 */}
                        <SearchResultBar />

                        {/* 产品网格 */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                            {productData.map((product) => {

                                // 提取第一张图片
                                const cover = product.cover ? product.cover.split('#')[0] : '';
                                return (
                                <div key={product.id} className="group bg-white  ">
                                    <div className="relative mb-6 overflow-hidden">
                                        <Link href={`/product/${product.id}`}>
                                            <div className="relative w-full pt-[100%]">
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${cover}`}
                                                    alt={product.title}
                                                    fill
                                                    quality={90}
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                        </Link>
                                    </div>

                                    <div>
                                        <h3 className="text-gray-800 font-medium text-base md:text-lg mb-2">{product.title}</h3>
                                    </div>
                                </div>
                            )})}
                        </div>

                        {/* 分页 */}
                        <div className="mt-10 flex justify-center">
                            <Pagination
                                        currentPage={pageNumber}
                                        linkPrefix={linkPrefix}
                                        total={total}
                                        searchSuffix={searchSuffix} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}