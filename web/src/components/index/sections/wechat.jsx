'use client'
import { useState, useEffect } from 'react';

export default function Wechat({ wechatId, qrCodeImage, iconSize = "h-6 w-6", colorStyle="text-gray-700 hover:text-mainColorNormal" }) {
    const [isOpen, setIsOpen] = useState(false);

    // 处理ESC键关闭
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // 处理点击背景关闭
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* WeChat 图标按钮 */}
            <button 
                onClick={() => setIsOpen(true)} 
                className={`${colorStyle} bg-transparent transition-colors`}
                title={wechatId}
            >
                <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2C4.768 2 1.25 4.99 1.25 8.691c0 2.092 1.216 3.83 2.858 5.159L3.1 16.451c-.101.212.149.389.334.263l2.396-1.507c.912.247 1.87.389 2.862.389 4.075 0 7.38-2.79 7.38-6.484 0-.15-.015-.299-.025-.447C15.642 4.748 12.313 2 8.691 2zM6.829 6.33c.392 0 .654.262.654.654 0 .389-.262.65-.654.65-.389 0-.65-.261-.65-.65-.001-.392.261-.654.65-.654zm3.895 0c.39 0 .654.262.654.654 0 .389-.264.65-.654.65-.392 0-.654-.261-.654-.65 0-.392.262-.654.654-.654zM18 9.13c-3.141 0-5.678 2.145-5.678 4.883 0 .759.188 1.473.499 2.12-1.122.241-2.099.399-2.243.407-.217.023-.247.329-.058.392l.537 1.062c.099.182.294.139.341.131.1-.034 1.107-.401 1.917-.72.615.338 1.308.527 2.085.527 3.18 0 5.679-2.147 5.679-4.883 0-2.736-2.499-4.919-5.679-4.919zm-2.663 2.058c.352 0 .614.229.614.578 0 .348-.262.577-.614.577-.35 0-.578-.229-.578-.577 0-.349.228-.578.578-.578zm3.234 0c.35 0 .616.229.616.578 0 .348-.265.577-.616.577-.35 0-.578-.229-.578-.577 0-.349.228-.578.578-.578z"/>
                </svg>
            </button>

            {/* 微信二维码弹窗 */}
            {isOpen && (
                <div 
                    className="fixed top-0 -left-4 -right-4 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/30 transition-opacity duration-300"
                    onClick={handleBackdropClick}
                    style={{ position: 'fixed', zIndex: 70 }}
                >
                    <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl transform transition-all duration-300">
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">WeChat</h3>
                            <p className="text-gray-500 mb-4">WeChat ID: {wechatId}</p>
                            
                            {/* 二维码图片 */}
                            <div className="bg-gray-100 p-3 rounded-md w-64 h-64 flex items-center justify-center mb-4">
                                {qrCodeImage ? (
                                    <img 
                                        src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${qrCodeImage}`} 
                                        alt="WeChat QR Code" 
                                        className="max-w-full max-h-full"
                                    />
                                ) : (
                                    <div className="text-gray-400">No QR Code Available</div>
                                )}
                            </div>
                            
                            {/* 关闭按钮 */}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="bg-mainColorNormal hover:bg-mainColorDeep text-white px-4 py-2 rounded-md transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}