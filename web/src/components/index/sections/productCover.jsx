'use client'
import React, {useState, useEffect} from "react";
import Image from "next/image";
import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import {Navigation, Autoplay, Pagination, EffectFade} from "swiper/modules";

const ProductCover = ({product}) => {
    const coverArr = product.cover ? product.cover.split('#') : [];
    const [modalOpen, setModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    // 打开模态框并设置当前图片和索引
    const openModal = (image) => {
        setCurrentImage(image);
        const index = coverArr.indexOf(image);
        setCurrentIndex(index >= 0 ? index : 0);
        setModalOpen(true);
        // 使用 requestAnimationFrame 来确保状态更新和动画同步
        requestAnimationFrame(() => {
            setIsVisible(true);
        });
        // 使用更安全的方式设置 body overflow
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden';
        }
    };

    // 关闭模态框
    const closeModal = () => {
        setIsVisible(false);
        // 使用 requestAnimationFrame 来确保动画流畅
        requestAnimationFrame(() => {
            setTimeout(() => {
                setModalOpen(false);
                if (typeof document !== 'undefined') {
                    document.body.style.overflow = 'auto';
                }
            }, 300);
        });
    };

    // 处理ESC键关闭模态框和左右键切换图片
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowLeft') {
            prevImage();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        }
    };

    // 添加键盘事件监听
    useEffect(() => {
        if (modalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [modalOpen, currentIndex]);

    // 切换到下一张图片
    const nextImage = (e) => {
        if (e) e.stopPropagation();

        if (coverArr.length <= 1) return;

        const newIndex = (currentIndex + 1) % coverArr.length;
        setCurrentIndex(newIndex);
        setCurrentImage(coverArr[newIndex]);
    };

    // 切换到上一张图片
    const prevImage = (e) => {
        if (e) e.stopPropagation();

        if (coverArr.length <= 1) return;

        const newIndex = (currentIndex - 1 + coverArr.length) % coverArr.length;
        setCurrentIndex(newIndex);
        setCurrentImage(coverArr[newIndex]);
    };

    // 确定是否启用循环模式
    const enableLoop = coverArr.length > 1;

    return (
        <>
            <div className="relative w-full h-full">
                <Swiper
                    className="w-full h-full"
                    modules={[Navigation, Autoplay, EffectFade]}
                    spaceBetween={30}
                    slidesPerView={1}
                    navigation={{
                        nextEl: ".custom-next",
                        prevEl: ".custom-prev",
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    autoplay={coverArr.length > 1 ? {
                        delay: 3500,
                        disableOnInteraction: false,
                    } : false}
                    speed={1500}
                    effect="fade"
                    fadeEffect={{crossFade: false}}
                    loop={enableLoop}
                >
                    {coverArr.map((image, index) => (
                        <SwiperSlide key={index}>
                            <div className="relative w-full h-full">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${image}`}
                                    alt="Product Cover"
                                    fill
                                    quality={90}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                                    onClick={() => openModal(image)}
                                    priority={index === 0}
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            </div>
                            {coverArr.length > 1 && (
                                <div 
                                    className="absolute inset-0 bg-black/2 flex items-center justify-center cursor-pointer"
                                    onClick={() => openModal(image)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            openModal(image);
                                        }
                                    }}
                                />
                            )}
                        </SwiperSlide>
                    ))}
                    {coverArr.length === 1 && (
                        <SwiperSlide className="hidden" />
                    )}
                </Swiper>
                {coverArr.length > 1 && (
                    <>
                        <button
                            className="custom-prev z-10 absolute top-1/2 left-0 transform -translate-y-1/2 text-white/50 hover:text-white p-3 rounded-full focus:outline-none transition duration-300"
                            aria-label="Previous slide"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="w-6 h-6"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 19.5L8.25 12l7.5-7.5"
                                />
                            </svg>
                        </button>
                        <button
                            className="custom-next z-10 absolute top-1/2 right-0 transform -translate-y-1/2 text-white/50 hover:text-white p-3 rounded-full focus:outline-none transition duration-300"
                            aria-label="Next slide"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="w-6 h-6"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {modalOpen && (
                <div
                    className={`fixed top-0 left-0 w-full h-screen inset-0 z-[65] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
                        isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={closeModal}
                    onKeyDown={handleKeyDown}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image preview"
                >
                    <div
                        className={`relative max-w-[90vw] max-h-[90vh] overflow-hidden transition-all duration-300 ${
                            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {coverArr.length > 1 && (
                            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/40 text-white/90 px-3 py-1 rounded-full text-sm backdrop-blur-sm z-10">
                                {currentIndex + 1} / {coverArr.length}
                            </div>
                        )}

                        <div className="relative">
                            <Image
                                src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${currentImage}`}
                                alt={`Product View ${currentIndex + 1}`}
                                width={900}
                                height={900}
                                quality={90}
                                sizes="90vw"
                                className="max-w-full max-h-[85vh] object-cover shadow-2xl"
                                loading="eager"
                            />
                        </div>
                    </div>

                    {coverArr.length > 1 && (
                        <>
                            <button
                                className="fixed left-5 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-[66]"
                                onClick={prevImage}
                                aria-label="Previous image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                                     stroke="currentColor" className="w-6 h-6" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
                                </svg>
                            </button>
                            <button
                                className="fixed right-5 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-[66]"
                                onClick={nextImage}
                                aria-label="Next image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                                     stroke="currentColor" className="w-6 h-6" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                                </svg>
                            </button>
                        </>
                    )}

                    <button
                        className="fixed top-5 right-5 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors duration-300 z-[66]"
                        onClick={closeModal}
                        aria-label="Close preview"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                             stroke="currentColor" className="w-6 h-6" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            )}
        </>
    );
};

export default ProductCover;