export const getAdminBasePath = () => {
  const p = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH || '';
  if (!p) return '';
  return p.startsWith('/') ? p.replace(/\/$/, '') : `/${p.replace(/\/$/, '')}`;
};

export const adminPath = (subPath = '') => {
  const base = getAdminBasePath();
  if (!subPath) return base || '/admin';
  const normalized = subPath.startsWith('/') ? subPath : `/${subPath}`;
  return (base || '/admin') + normalized;
};

export const adminLoginPath = () => {
  const base = getAdminBasePath();
  if (!base) return '/adminLogin';
  return `${base}Login`;
};

export const withSiteBasePath = (path) => {
  const siteBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!siteBase) return path;
  const b = siteBase.startsWith('/') ? siteBase.replace(/\/$/, '') : `/${siteBase.replace(/\/$/, '')}`;
  return `${b}${path}`;
};
