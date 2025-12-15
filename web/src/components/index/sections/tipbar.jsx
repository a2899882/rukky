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

    if(show){
        return (
            <div className="fixed left-6 bottom-6 z-50 p-1.5 bg-gray-900 text-white shadow-md rounded-sm">
                建站微信: <span className="font-bold">{sectionData['basicGlobal']['global_wechat']}</span>
            </div>
        )
    }else {
        return null
    }
}