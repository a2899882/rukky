'use client'
import { useState, useEffect, useRef } from 'react';

export function useInView(options = {}) {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        let observer = null;
        
        try {
            // 检查元素初始位置
            const checkInitialPosition = () => {
                const currentRef = ref.current;
                if (currentRef) {
                    const rect = currentRef.getBoundingClientRect();
                    // 如果元素在视口内或视口上方，直接设置为可见
                    if (rect.top <= window.innerHeight) {
                        setIsInView(true);
                        hasAnimated.current = true;
                        return true;
                    }
                }
                return false;
            };

            // 如果元素已经在视口内或上方，不需要创建 observer
            if (checkInitialPosition()) {
                return;
            }

            // 检查浏览器是否支持 IntersectionObserver
            if (typeof IntersectionObserver === 'undefined') {
                // 如果不支持，直接设置元素可见
                setIsInView(true);
                hasAnimated.current = true;
                return;
            }

            observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    // 获取元素相对于视口的位置
                    const rect = entry.boundingClientRect;
                    // 只有当元素从底部进入视口时才触发动画
                    if (rect.top > 0) {
                        setIsInView(true);
                        hasAnimated.current = true;
                    }
                }
            }, {
                threshold: 0.1,
                ...options
            });

            const currentRef = ref.current;

            if (currentRef) {
                observer.observe(currentRef);
            }
        } catch (error) {
            // 捕获任何可能的错误，并设置元素可见
            console.warn('IntersectionObserver not supported:', error);
            setIsInView(true);
            hasAnimated.current = true;
        }

        return () => {
            if (observer) {
                const currentRef = ref.current;
                if (currentRef) {
                    observer.unobserve(currentRef);
                }
            }
        };
    }, [options]);

    return [ref, isInView];
} 