import { cache } from 'react';
import api from '@/utils/axiosApi';
import { getIp } from '@/utils/tools';
import { getThemeIdOrDefault } from '@/utils/getThemeId';

const getSectionDataCached = cache(async (params) => {
  const headers = {
    'Content-Type': 'application/json',
    'x-forwarded-for': getIp(),
  };
  const { code, data } = await api.get('/myapp/index/thing/section', { headers, params });
  if (code === 0) return data;
  return null;
});

function parseRoute({ params, searchParams, pageSize }) {
  const slug = params?.slug || [];

  let categoryId = null;
  let pageNumber = 1;

  if (Array.isArray(slug) && slug.length > 0) {
    if (slug[0] === 'category' && slug.length >= 2) {
      categoryId = slug[1];
      if (slug.length >= 4 && slug[2] === 'page') {
        pageNumber = parseInt(slug[3], 10) || 1;
      }
    } else if (slug[0] === 'page' && slug.length >= 2) {
      pageNumber = parseInt(slug[1], 10) || 1;
    }
  }

  const searchQuery = searchParams?.s || '';

  return {
    categoryId,
    pageNumber,
    searchQuery,
    apiParams: {
      page: pageNumber,
      pageSize,
      categoryId,
      searchQuery,
    },
  };
}

function buildPath({ categoryId, pageNumber, searchQuery }) {
  let path = '/product';

  if (categoryId) {
    path = `/product/category/${categoryId}`;
    if (pageNumber > 1) path = `/product/category/${categoryId}/page/${pageNumber}`;
  } else {
    if (pageNumber > 1) path = `/product/page/${pageNumber}`;
  }

  const qs = new URLSearchParams();
  if (searchQuery) qs.set('s', String(searchQuery));
  const queryString = qs.toString();

  return queryString ? `${path}?${queryString}` : path;
}

export default async function Head({ params, searchParams }) {
  const base = String(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  if (!base) return null;

  let pageSize = 9;
  const templateId = await getThemeIdOrDefault('010');
  if (['004', '005', '006', '007', '008', '009', '010', '011'].includes(templateId)) {
    pageSize = 12;
  }

  const route = parseRoute({ params, searchParams, pageSize });
  const sectionData = await getSectionDataCached(route.apiParams);
  const total = sectionData?.total || 0;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  const prevPath =
    route.pageNumber > 1
      ? buildPath({
          categoryId: route.categoryId,
          pageNumber: route.pageNumber - 1,
          searchQuery: route.searchQuery,
        })
      : null;

  const nextPath =
    route.pageNumber < maxPage
      ? buildPath({
          categoryId: route.categoryId,
          pageNumber: route.pageNumber + 1,
          searchQuery: route.searchQuery,
        })
      : null;

  return (
    <>
      {prevPath ? <link rel="prev" href={`${base}${prevPath}`} /> : null}
      {nextPath ? <link rel="next" href={`${base}${nextPath}`} /> : null}
    </>
  );
}
