import { cache } from 'react';
import api from '@/utils/axiosApi';
import { getIp } from '@/utils/tools';

const getSectionDataCached = cache(async (params) => {
  const headers = {
    'Content-Type': 'application/json',
    'x-forwarded-for': getIp(),
  };
  const { code, data } = await api.get('/myapp/index/case/section', { headers, params });
  if (code === 0) return data;
  return null;
});

function getPageNumber(slug) {
  const slugArray = slug || [];
  if (slugArray.length > 0 && slugArray[0] === 'page' && slugArray.length >= 2) {
    return parseInt(slugArray[1], 10) || 1;
  }
  return 1;
}

export default async function Head({ params }) {
  const base = String(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  if (!base) return null;

  const pageSize = 9;
  const pageNumber = getPageNumber(params?.slug);
  const sectionData = await getSectionDataCached({ page: pageNumber, pageSize });
  const total = sectionData?.total || 0;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  const prevPath =
    pageNumber > 1 ? (pageNumber - 1 === 1 ? '/case' : `/case/page/${pageNumber - 1}`) : null;
  const nextPath = pageNumber < maxPage ? `/case/page/${pageNumber + 1}` : null;

  return (
    <>
      {prevPath ? <link rel="prev" href={`${base}${prevPath}`} /> : null}
      {nextPath ? <link rel="next" href={`${base}${nextPath}`} /> : null}
    </>
  );
}
