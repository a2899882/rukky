import zh from './zh';
import en from './en';

const DICTS = { en, zh };

const getLangCode = () => {
    if (typeof window === 'undefined') {
        return 'en';
    }
    try {
        const v = localStorage.getItem('lang') || 'en';
        return v === 'zh' ? 'zh' : 'en';
    } catch (e) {
        return 'en';
    }
}

// 多语言（按需动态读取，默认 en）
const lang = new Proxy({}, {
    get: function (_target, prop) {
        const code = getLangCode();
        const dict = DICTS[code] || DICTS.en;
        const fallback = DICTS.en || {};
        return dict?.[prop] ?? fallback?.[prop] ?? prop;
    }
});

export default lang;