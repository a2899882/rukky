'use client'
import {useState, useEffect, useRef} from "react";
import {usePathname} from 'next/navigation';

export default function SwitchLang({
                                       colorClass = "ml-2 bg-white text-gray-500 px-2 py-1.5 rounded-full ",
                                   }) {
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const [buttonPosition, setButtonPosition] = useState({top: 0, right: 0, height: 0, width: 0});

    // 语言选项
    const languages = [
        {code: 'en', name: 'English'},
        {code: 'zh', name: '中文'},
    ];

    const setLang = (code) => {
        try {
            localStorage.setItem('lang', code);
        } catch (e) {
        }
        window.location.reload();
    }

    useEffect(() => {
        let timeoutId;
        let resizeObserver;

        const updateButtonPosition = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const newPosition = {
                    top: rect.top,
                    right: document.documentElement.clientWidth - rect.right,
                    height: rect.height,
                    width: rect.width
                };
                setButtonPosition(newPosition);
            }
        };

        const debouncedUpdate = () => {
            clearTimeout(timeoutId);
            // 延迟250毫秒执行
            timeoutId = setTimeout(updateButtonPosition, 250);
        };

        // 初始更新
        debouncedUpdate();

        // 添加事件监听，使用 passive 优化滚动性能
        window.addEventListener('resize', debouncedUpdate, { passive: true });
        window.addEventListener('scroll', debouncedUpdate, { passive: true });

        // 兼容处理 ResizeObserver
        if (typeof ResizeObserver !== 'undefined') {
            // 现代浏览器使用 ResizeObserver
            resizeObserver = new ResizeObserver(debouncedUpdate);
            if (buttonRef.current) {
                resizeObserver.observe(buttonRef.current);
            }
        } else {
            // 旧版浏览器降级处理：使用 MutationObserver 监听 DOM 变化
            const mutationObserver = new MutationObserver(debouncedUpdate);
            if (buttonRef.current) {
                mutationObserver.observe(buttonRef.current, {
                    attributes: true,
                    childList: true,
                    subtree: true
                });
            }
            // 清理函数中也要处理 mutationObserver
            return () => {
                window.removeEventListener('resize', debouncedUpdate);
                window.removeEventListener('scroll', debouncedUpdate);
                mutationObserver.disconnect();
                clearTimeout(timeoutId);
            };
        }

        return () => {
            window.removeEventListener('resize', debouncedUpdate);
            window.removeEventListener('scroll', debouncedUpdate);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        // 点击页面其他区域时关闭弹出框
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowLanguageMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // 处理鼠标悬浮事件
    const handleMouseEnter = () => {
        setShowLanguageMenu(true);
    };

    // 处理鼠标离开事件
    const handleMouseLeave = () => {
        setShowLanguageMenu(false);
    };

    return (
        <div className="relative">
            {/*按钮*/}
            <button
                ref={buttonRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`flex items-center ${colorClass} focus:outline-none`}
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            >
                {/*地球图标*/}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 16 16">
                    <path fill="currentColor" fillRule="evenodd"
                          d="M8 14.5c.23 0 .843-.226 1.487-1.514c.306-.612.563-1.37.742-2.236H5.771c.179.866.436 1.624.742 2.236C7.157 14.274 7.77 14.5 8 14.5M5.554 9.25a14.4 14.4 0 0 1 0-2.5h4.892a14.5 14.5 0 0 1 0 2.5zm6.203 1.5c-.224 1.224-.593 2.308-1.066 3.168a6.53 6.53 0 0 0 3.2-3.168zm2.623-1.5h-2.43a16 16 0 0 0 0-2.5h2.429a6.5 6.5 0 0 1 0 2.5Zm-10.331 0H1.62a6.5 6.5 0 0 1 0-2.5h2.43a16 16 0 0 0 0 2.5Zm-1.94 1.5h2.134c.224 1.224.593 2.308 1.066 3.168a6.53 6.53 0 0 1-3.2-3.168m3.662-5.5h4.458c-.179-.866-.436-1.624-.742-2.236C8.843 1.726 8.23 1.5 8 1.5s-.843.226-1.487 1.514c-.306.612-.563 1.37-.742 2.236m5.986 0h2.134a6.53 6.53 0 0 0-3.2-3.168c.473.86.842 1.944 1.066 3.168M5.31 2.082c-.473.86-.842 1.944-1.066 3.168H2.109a6.53 6.53 0 0 1 3.2-3.168ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0"
                          clipRule="evenodd"/>
                </svg>
                <svg className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </button>

            {/* 弹出框 */}
            {showLanguageMenu && (
                <div
                    ref={menuRef}
                    className={`fixed z-[70] w-24 bg-white border-[1px] border-gray-300 rounded-md shadow-lg`}
                    style={{
                        top: `${buttonPosition.top + buttonPosition.height}px`,
                        right: `${buttonPosition.right}px`                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                type="button"
                                onClick={() => setLang(lang.code)}
                                className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

