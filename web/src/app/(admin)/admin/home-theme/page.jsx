'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Row, message } from 'antd';
import axiosInstance from '@/utils/axios';

const THEME_OPTIONS = [
  {
    id: '001',
    name: '主题 001 · Modern B2B',
    desc: '干净、偏B2B展示风格，适合企业与品牌站。',
    preview: '/themes/hero-001.svg',
  },
  {
    id: '005',
    name: '主题 005 · Commerce Dark',
    desc: '电商导向，强CTA与暗色氛围，适合SKU较多。',
    preview: '/themes/hero-005.svg',
  },
  {
    id: '010',
    name: '独立站·通用（推荐）',
    desc: '通用型营销首页，适合大多数品类。',
    preview: '/themes/hero-010.svg',
  },
  {
    id: '011',
    name: '主题 011 · Premium',
    desc: '更强品牌质感与留白，适合中高客单。',
    preview: '/themes/hero-011.svg',
  },
];

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);

  const currentThemeId = useMemo(() => String(data?.homeThemeId || '010'), [data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/myapp/admin/shop/settings/get');
      if (res?.code === 0) setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const save = async (themeId) => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await axiosInstance.post('/myapp/admin/shop/settings/update', {
        enableStripe: data.enableStripe,
        enablePayPal: data.enablePayPal,
        defaultCurrency: data.defaultCurrency,
        defaultShippingFee: data.defaultShippingFee,
        homeThemeId: themeId,
      });
      if (res?.code === 0) {
        message.success('已切换首页主题');
        fetchData();
      } else {
        message.error(res?.msg || '保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-100 px-4 py-4">
      <Card title="首页主题" loading={loading}>
        <div className="text-xs text-gray-500 mb-4">选择一个首页主题，保存后前台首页将自动切换（无需改代码）。</div>

        <Row gutter={[16, 16]}>
          {THEME_OPTIONS.map((t) => {
            const active = currentThemeId === t.id;
            return (
              <Col xs={24} md={12} key={t.id}>
                <div className={`bg-white border ${active ? 'border-blue-500' : 'border-gray-200'} p-4`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-gray-500 mt-1">ID: {t.id}</div>
                      <div className="text-sm text-gray-600 mt-2">{t.desc}</div>
                    </div>
                    <div>
                      <Button type={active ? 'default' : 'primary'} disabled={active} loading={saving} onClick={() => save(t.id)}>
                        {active ? '当前使用' : '启用'}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 h-24 bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                    {t.preview ? (
                      <img src={t.preview} alt="preview" className="w-full h-24 object-cover" />
                    ) : (
                      '预览图'
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>

        <div className="text-xs text-gray-500 mt-6">
          提示：切换后如果你开启了 Cloudflare 缓存，可能需要等待缓存刷新或手动刷新页面。
        </div>
      </Card>
    </div>
  );
}
