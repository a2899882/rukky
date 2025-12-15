'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from 'antd';
import { adminPath, withSiteBasePath } from '@/utils/adminPath';

const LABELS = {
  [adminPath('/main')]: '总览',
  [adminPath('/products')]: '产品中心',
  [adminPath('/media')]: '媒体库',
  [adminPath('/news')]: '新闻管理',
  [adminPath('/case')]: '案例管理',
  [adminPath('/download')]: '下载管理',
  [adminPath('/faq')]: 'FAQ管理',
  [adminPath('/inquiry')]: '询盘管理',
  [adminPath('/orders')]: '订单管理',
  [adminPath('/payments')]: '支付记录',
  [adminPath('/pay-settings')]: '支付设置',
  [adminPath('/onboarding')]: '新手引导',
  [adminPath('/basicInfo')]: '基本信息',
  [adminPath('/user')]: '账号管理',
  [adminPath('/log')]: '网站日志',
};

const getLabel = (path) => LABELS[path] || '后台';

export default function AdminBreadcrumb() {
  const pathname = usePathname();

  const base = adminPath('/main');
  const items = [
    {
      title: <Link href={withSiteBasePath(base)}>后台</Link>,
    },
  ];

  if (pathname && pathname !== base) {
    items.push({ title: getLabel(pathname) });
  } else {
    items.push({ title: '总览' });
  }

  return <Breadcrumb items={items} />;
}
