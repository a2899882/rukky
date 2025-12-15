'use client'
import { useState, useEffect } from 'react'
import { ArrowUp,ChevronUp } from 'lucide-react'

export default function ScrollBar() {
    const [isVisible, setIsVisible] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    // 检测滚动位置，决定是否显示按钮
    useEffect(() => {
        const toggleVisibility = () => {
            // 当滚动超过300px时显示按钮
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        // 添加滚动事件监听
        window.addEventListener('scroll', toggleVisibility)

        // 初始检查
        toggleVisibility()

        // 清理事件监听
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    // 滚动到顶部的函数
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return (
        <div className={`fixed right-6 bottom-[86px] z-40 transition-all duration-100 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
                onClick={scrollToTop}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label="Scroll to top"
                className="flex items-center justify-center size-10 md:size-12 bg-white text-mainColorNormal rounded-full hover:bg-gray-50 transition-all duration-300"
                style={{
                    boxShadow: isHovered
                        ? '0 6px 16px rgba(0, 0, 0, 0.16), 0 0 12px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.1)'
                        : '0 4px 12px rgba(0, 0, 0, 0.12), 0 0 8px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.08)'
                }}
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        </div>
    )
}