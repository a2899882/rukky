import {cache} from 'react';
import api from '@/utils/axiosApi';

export const getThemeIdCached = cache(async () => {
  try {
    const {code, msg, data} = await api.get('/myapp/index/common/section');
    if (code === 0) {
      return String(data?.homeThemeId || '').trim() || null;
    }
    console.error(`获取导航数据错误: ${msg}`);
    return null;
  } catch (err) {
    console.error('获取导航数据失败:', err);
    return null;
  }
});

export async function getThemeIdOrDefault(defaultId = '010') {
  const id = await getThemeIdCached();
  return id || process.env.NEXT_PUBLIC_TEMPLATE_ID || defaultId;
}
