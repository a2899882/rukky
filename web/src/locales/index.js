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

const getLangCode = () => {
    if (typeof window === 'undefined') {
        return 'en';
    }
    try {
        const v = localStorage.getItem('lang') || 'en';
        return DICTS[v] ? v : 'en';
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