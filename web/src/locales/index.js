import zh from './zh';
import en from './en';
import fr from './fr';
import de from './de';
import es from './es';
import pt from './pt';
import ar from './ar';
import sw from './sw';
import zhTw from './zhTw';
import ja from './ja';
import th from './th';
import vi from './vi';

const DICTS = {
    en,
    zh,
    fr,
    de,
    es,
    pt,
    ar,
    sw,
    'zh-TW': zhTw,
    ja,
    th,
    vi,
};

const getCookieLang = () => {
    if (typeof window !== 'undefined') {
        try {
            const m = document.cookie.match(/(?:^|; )lang=([^;]*)/);
            return m ? decodeURIComponent(m[1]) : null;
        } catch (e) {
            return null;
        }
    }

    try {
        // next/headers only works in Server Components / Route Handlers
        // eslint-disable-next-line global-require
        const { cookies } = require('next/headers');
        const v = cookies().get('lang')?.value;
        return v ? decodeURIComponent(v) : null;
    } catch (e) {
        return null;
    }
}

const getLangCode = () => {
    const cookieLang = getCookieLang();
    if (cookieLang && DICTS[cookieLang]) {
        return cookieLang;
    }

    if (typeof window !== 'undefined') {
        try {
            const v = localStorage.getItem('lang') || 'en';
            return DICTS[v] ? v : 'en';
        } catch (e) {
            return 'en';
        }
    }

    return 'en';
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