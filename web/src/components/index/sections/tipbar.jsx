'use client'
import { useState, useEffect } from 'react'

export default function TipBar({sectionData}) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // 检查URL中是否包含?demo=true
        const searchParams = new URLSearchParams(window.location.search);
        const isDemo = searchParams.get('demo') === 'true';
        const clearDemo = searchParams.get('demo') === 'false';
        
        // 如果URL中有demo=true，则保存到localStorage
        if (isDemo) {
            localStorage.setItem('demo', 'true');
        }

        if(clearDemo){
            localStorage.removeItem('demo');
        }
        
        // 检查localStorage中是否有demo标记
        const hasDemo = localStorage.getItem('demo') === 'true';
        setShow(hasDemo);
    }, []);

    return null
}