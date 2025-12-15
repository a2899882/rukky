'use client'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import lang from "@/locales";

export default function OurFactory({ companyImageData }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    
    // 处理图片数据
    let dataList = companyImageData?.split("#").filter(item => item.trim()) || [];
    
    // 打开图片模态框
    const openModal = (image, index) => {
        setCurrentImage(image);
        setCurrentIndex(index);
        setModalOpen(true);
        document.body.style.overflow = "hidden"; // 防止背景滚动
    };
    
    // 关闭图片模态框
    const closeModal = () => {
        setModalOpen(false);
        document.body.style.overflow = "auto"; // 恢复背景滚动
    };
    
    // 处理ESC键关闭模态框
    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    };
    
    // 切换到下一张图片
    const nextImage = () => {
        const newIndex = (currentIndex + 1) % dataList.length;
        setCurrentIndex(newIndex);
        setCurrentImage(`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${dataList[newIndex]}`);
    };
    
    // 切换到上一张图片
    const prevImage = () => {
        const newIndex = (currentIndex - 1 + dataList.length) % dataList.length;
        setCurrentIndex(newIndex);
        setCurrentImage(`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${dataList[newIndex]}`);
    };

    // 处理图片加载动画
    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="h-1 w-20 bg-gradient-to-r from-mainColorNormal to-mainColorNormalAlpha-50 mx-auto mb-6"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">{lang.OurFactory}</h2>
                    <p className="text-gray-600 max-w-3xl mx-auto mb-4 px-4">
                        {lang.OurFactoryTip}
                    </p>
                </div>

                {/* 工厂图片网格，确保一行4张图片 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {dataList.map((item, index) => (
                        <div 
                            key={index} 
                            className={`group overflow-hidden rounded-lg shadow-md transition-all duration-300 border border-gray-200 cursor-pointer transform hover:scale-102 opacity-0 translate-y-5 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : ''}`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                            onClick={() => openModal(`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${item}`, index)}
                        >
                            <div className="relative w-full overflow-hidden" style={{ paddingBottom: '75%' }}>
                                <div className="absolute w-full h-full top-0 left-0 inset-0">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${item}`}
                                        alt={`Factory Image ${index + 1}`}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 图片查看模态框 */}
            {modalOpen && (
                <div 
                    className={`fixed w-full h-full top-0 left-0 inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${modalOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={closeModal}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    {/* 关闭按钮 */}
                    <button 
                        className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 z-50 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeModal();
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    {/* 上一张按钮 */}
                    <button 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/80 text-white z-50 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    {/* 下一张按钮 */}
                    <button 
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/80 text-white z-50 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    
                    {/* 图片容器 */}
                    <div 
                        className="relative w-full max-w-5xl max-h-[90vh] flex items-center justify-center transform transition-transform duration-300 scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={currentImage} 
                            alt="Enlarged factory image" 
                            className="max-h-[90vh] max-w-full object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}
        </section>
    );
}