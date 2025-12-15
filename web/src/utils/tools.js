import {headers} from "next/headers";


const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const formatted = date.toLocaleDateString('en-US', options);
    return formatted;
}

const getIp = () => {
    const h = headers();
    const xff = h.get('x-forwarded-for');
    const realIp = h.get('x-real-ip');
    const clientIp = xff?.split(',')[0].trim() || realIp || 'unknown';
    return clientIp;
}

export {formatDate, getIp}