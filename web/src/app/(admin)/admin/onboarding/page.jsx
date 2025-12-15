'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, Checkbox } from 'antd';
import { adminPath } from '@/utils/adminPath';

const steps = [
  {
    key: 'site',
    title: '1. 设置网站基础信息',
    desc: '上传 Logo / Ico，填写站点名称、版权等。',
    link: adminPath('/basicInfo'),
    linkText: '去设置',
  },
  {
    key: 'category',
    title: '2. 创建产品分类',
    desc: '先建分类再建商品，小白更容易管理。',
    link: adminPath('/products'),
    linkText: '去分类/产品中心',
  },
  {
    key: 'media',
    title: '3. 上传图片/视频素材',
    desc: '把图片/视频先传到媒体库，后续商品可直接选择使用。',
    link: adminPath('/media'),
    linkText: '去媒体库',
  },
  {
    key: 'product',
    title: '4. 新增商品并完善价格/描述',
    desc: '建议：封面图 + 简短摘要 + 详细描述 + 价格 + 上架。',
    link: adminPath('/products'),
    linkText: '去新增商品',
  },
  {
    key: 'pay',
    title: '5. 配置支付方式（Stripe / PayPal）',
    desc: '在支付设置里开启/关闭支付方式，并测试 PayPal 连接。',
    link: adminPath('/pay-settings'),
    linkText: '去支付设置',
  },
  {
    key: 'test',
    title: '6. 测试下单',
    desc: '前台加入购物车 -> checkout -> 选择支付方式 -> 查询订单状态。',
    link: '/checkout',
    linkText: '打开前台结账页',
  },
];

export default function Page() {
  const storageKey = 'admin_onboarding_checked_v1';
  const [checked, setChecked] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch (e) {
    }
  }, []);

  const setStepChecked = (key, value) => {
    const next = { ...checked, [key]: !!value };
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (e) {
    }
  };

  const doneCount = useMemo(() => {
    return steps.reduce((acc, s) => acc + (checked?.[s.key] ? 1 : 0), 0);
  }, [checked]);

  return (
    <div className="bg-gray-100 px-4 py-4">
      <Card title={`新手引导（开店 Checklist）  ${doneCount}/${steps.length}`}> 
        <div className="flex flex-col gap-4">
          {steps.map((s) => (
            <div key={s.key} className="flex items-start justify-between gap-4 border rounded-md bg-white p-4">
              <div className="flex-1">
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-gray-600 mt-1">{s.desc}</div>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={!!checked?.[s.key]} onChange={(e) => setStepChecked(s.key, e.target.checked)}>已完成</Checkbox>
                <Link className="text-adminPrimaryColor" href={s.link} target={s.link.startsWith('http') || s.link.startsWith('/') && !s.link.startsWith('/panel') ? '_blank' : undefined}>
                  {s.linkText}
                </Link>
              </div>
            </div>
          ))}
          <div className="text-xs text-gray-500">
            提示：PayPal/Stripe 的 KEY 属于服务器环境变量，请在部署时写入 .env；后台支付设置会提示是否配置成功。
          </div>
        </div>
      </Card>
    </div>
  );
}
