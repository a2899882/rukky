'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, Input, InputNumber, Select, Space, Switch, Tag, message } from 'antd';
import axiosInstance from '@/utils/axios';

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [dirty, setDirty] = useState({});

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

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const payload = {
        enableStripe: data.enableStripe,
        enablePayPal: data.enablePayPal,
        defaultCurrency: data.defaultCurrency,
        defaultShippingFee: data.defaultShippingFee,
        paypalEnv: data.paypalEnv,
      };

      if (dirty.stripeSecretKey) payload.stripeSecretKey = data.stripeSecretKey;
      if (dirty.stripeWebhookSecret) payload.stripeWebhookSecret = data.stripeWebhookSecret;
      if (dirty.paypalClientId) payload.paypalClientId = data.paypalClientId;
      if (dirty.paypalClientSecret) payload.paypalClientSecret = data.paypalClientSecret;

      const res = await axiosInstance.post('/myapp/admin/shop/settings/update', payload);
      if (res?.code === 0) {
        message.success('保存成功');
        setDirty({});
        fetchData();
      } else {
        message.error(res?.msg || '保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const testStripe = async () => {
    setSaving(true);
    try {
      const res = await axiosInstance.post('/myapp/admin/shop/settings/testStripe');
      if (res?.code === 0) message.success('Stripe 连接成功');
      else message.error(res?.msg || 'Stripe 连接失败');
    } finally {
      setSaving(false);
    }
  };

  const clearStripeKey = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await axiosInstance.post('/myapp/admin/shop/settings/update', {
        stripeSecretKey: '',
      });
      if (res?.code === 0) {
        message.success('已清空 Stripe Secret Key');
        setDirty((d) => ({ ...d, stripeSecretKey: false }));
        fetchData();
      } else {
        message.error(res?.msg || '清空失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const clearStripeWebhook = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await axiosInstance.post('/myapp/admin/shop/settings/update', {
        stripeWebhookSecret: '',
      });
      if (res?.code === 0) {
        message.success('已清空 Stripe Webhook Secret');
        setDirty((d) => ({ ...d, stripeWebhookSecret: false }));
        fetchData();
      } else {
        message.error(res?.msg || '清空失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const clearPayPalClient = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await axiosInstance.post('/myapp/admin/shop/settings/update', {
        paypalClientId: '',
        paypalClientSecret: '',
      });
      if (res?.code === 0) {
        message.success('已清空 PayPal Client 配置');
        setDirty((d) => ({ ...d, paypalClientId: false, paypalClientSecret: false }));
        fetchData();
      } else {
        message.error(res?.msg || '清空失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const testPayPal = async () => {
    setSaving(true);
    try {
      const res = await axiosInstance.post('/myapp/admin/shop/settings/testPayPal');
      if (res?.code === 0) message.success('PayPal 连接成功');
      else message.error(res?.msg || 'PayPal 连接失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-100 px-4 py-4">
      <Card title="支付设置" loading={loading}>
        {data ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Stripe</div>
                <div className="text-xs text-gray-500">开启后前台会显示 Stripe 支付按钮</div>
              </div>
              <Space>
                <Tag color={data.stripeConfigured ? 'green' : 'red'}>{data.stripeConfigured ? '已配置 KEY' : '未配置 KEY'}</Tag>
                <Switch checked={data.enableStripe === '1'} onChange={(v) => setData({ ...data, enableStripe: v ? '1' : '2' })} />
                <Button onClick={testStripe}>测试连接</Button>
              </Space>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Stripe Secret Key</div>
                <Input.Password
                  placeholder="sk_live_... / sk_test_..."
                  value={data.stripeSecretKey || ''}
                  onChange={(e) => {
                    setData({ ...data, stripeSecretKey: e.target.value });
                    setDirty((d) => ({ ...d, stripeSecretKey: true }));
                  }}
                />
                <div className="mt-2">
                  <Button danger onClick={clearStripeKey}>清空</Button>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Stripe Webhook Secret</div>
                <Input.Password
                  placeholder="whsec_..."
                  value={data.stripeWebhookSecret || ''}
                  onChange={(e) => {
                    setData({ ...data, stripeWebhookSecret: e.target.value });
                    setDirty((d) => ({ ...d, stripeWebhookSecret: true }));
                  }}
                />
                <div className="mt-2">
                  <Button danger onClick={clearStripeWebhook}>清空</Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">PayPal</div>
                <div className="text-xs text-gray-500">开启后前台会显示 PayPal 支付按钮</div>
              </div>
              <Space>
                <Tag color={data.paypalConfigured ? 'green' : 'red'}>{data.paypalConfigured ? '已配置 Client' : '未配置 Client'}</Tag>
                <Tag>{data.paypalEnv}</Tag>
                <Switch checked={data.enablePayPal === '1'} onChange={(v) => setData({ ...data, enablePayPal: v ? '1' : '2' })} />
                <Button onClick={testPayPal}>测试连接</Button>
                <Button danger onClick={clearPayPalClient}>清空 Client</Button>
              </Space>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">PayPal 环境</div>
                <Select
                  value={data.paypalEnv}
                  style={{ width: '100%' }}
                  onChange={(v) => setData({ ...data, paypalEnv: v })}
                  options={[
                    { value: 'sandbox', label: 'sandbox' },
                    { value: 'live', label: 'live' },
                  ]}
                />
              </div>
              <div />
              <div>
                <div className="text-xs text-gray-500 mb-1">PayPal Client ID</div>
                <Input
                  placeholder="Client ID"
                  value={data.paypalClientId || ''}
                  onChange={(e) => {
                    setData({ ...data, paypalClientId: e.target.value });
                    setDirty((d) => ({ ...d, paypalClientId: true }));
                  }}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">PayPal Client Secret</div>
                <Input.Password
                  placeholder="Client Secret"
                  value={data.paypalClientSecret || ''}
                  onChange={(e) => {
                    setData({ ...data, paypalClientSecret: e.target.value });
                    setDirty((d) => ({ ...d, paypalClientSecret: true }));
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">默认币种</div>
                <div className="text-xs text-gray-500">前台 checkout 默认币种</div>
              </div>
              <Select
                value={data.defaultCurrency}
                style={{ width: 160 }}
                onChange={(v) => setData({ ...data, defaultCurrency: v })}
                options={[
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'GBP', label: 'GBP' },
                  { value: 'CNY', label: 'CNY' },
                ]}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">默认运费</div>
                <div className="text-xs text-gray-500">前台 checkout 默认运费（可手动修改）</div>
              </div>
              <InputNumber
                min={0}
                value={Number(data.defaultShippingFee || 0)}
                onChange={(v) => setData({ ...data, defaultShippingFee: v })}
              />
            </div>

            <div>
              <Button type="primary" loading={saving} onClick={save}>保存</Button>
            </div>

            <div className="text-xs text-gray-500">
              PayPal 授权说明：本系统采用 PayPal 官方 "Client ID / Secret" 方式接入（类似 WooCommerce 的 PayPal 插件）。
              你需要在 PayPal Developer 后台创建 App 获取 Client ID/Secret，然后在本页面填写并保存即可生效。
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
