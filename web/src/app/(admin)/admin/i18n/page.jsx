'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Select, Space, Table, message } from 'antd';
import axiosInstance from '@/utils/axios';

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文(简体)' },
  { value: 'zh-TW', label: '中文(繁體)' },
  { value: 'ja', label: '日本語' },
  { value: 'th', label: 'ไทย' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'ar', label: 'العربية' },
  { value: 'sw', label: 'Kiswahili' },
];

const MODEL_OPTIONS = [
  { value: '', label: '全部模型' },
  { value: 'BasicSite', label: 'BasicSite（站点信息）' },
  { value: 'BasicGlobal', label: 'BasicGlobal（全局信息）' },
  { value: 'BasicAdditional', label: 'BasicAdditional（首页扩展）' },
  { value: 'BasicTdk', label: 'BasicTdk（TDK）' },
  { value: 'Category', label: 'Category（分类）' },
  { value: 'Thing', label: 'Thing（产品）' },
  { value: 'News', label: 'News（新闻）' },
  { value: 'Case', label: 'Case（案例）' },
  { value: 'Faq', label: 'Faq（FAQ）' },
  { value: 'Download', label: 'Download（下载）' },
  { value: 'About', label: 'About（关于）' },
  { value: 'Contact', label: 'Contact（联系）' },
];

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [filters, setFilters] = useState({
    model: '',
    objectId: '',
    field: '',
    lang: '',
    keyword: '',
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ model: '', objectId: '', field: '', lang: 'en', value: '' });
  const [saving, setSaving] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const columns = useMemo(
    () => [
      { title: 'Model', dataIndex: 'model', key: 'model', width: 140 },
      { title: 'ObjectId', dataIndex: 'object_id', key: 'object_id', width: 110 },
      { title: 'Field', dataIndex: 'field', key: 'field', width: 140 },
      { title: 'Lang', dataIndex: 'lang', key: 'lang', width: 90 },
      {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
        render: (v) => <div className="max-w-[560px] truncate" title={v || ''}>{v || ''}</div>,
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_, r) => (
          <Space>
            <a
              onClick={() => {
                setForm({
                  model: r.model,
                  objectId: r.object_id,
                  field: r.field,
                  lang: r.lang,
                  value: r.value || '',
                });
                setEditing(true);
              }}
            >
              编辑
            </a>
          </Space>
        ),
      },
    ],
    []
  );

  const fetchData = async (p = page, ps = pageSize, f = filters) => {
    setLoading(true);
    try {
      const params = {
        page: p,
        pageSize: ps,
        model: f.model,
        objectId: f.objectId,
        field: f.field,
        lang: f.lang,
        keyword: f.keyword,
      };
      const res = await axiosInstance.get('/myapp/admin/i18n/list', { params });
      if (res?.code === 0) {
        setData(res.data || []);
        setTotal(res.total || 0);
        setPage(p);
        setPageSize(ps);
      } else {
        message.error(res?.msg || '获取失败');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pageSize, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm({ model: '', objectId: '', field: '', lang: 'en', value: '' });
    setEditing(true);
  };

  const save = async () => {
    if (!form.model || !form.objectId || !form.field || !form.lang) {
      message.error('请填写 model/objectId/field/lang');
      return;
    }
    setSaving(true);
    try {
      const res = await axiosInstance.post('/myapp/admin/i18n/upsert', {
        model: form.model,
        objectId: String(form.objectId),
        field: form.field,
        lang: form.lang,
        value: form.value,
      });
      if (res?.code === 0) {
        message.success('已保存');
        setEditing(false);
        fetchData(1, pageSize, filters);
      } else {
        message.error(res?.msg || '保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const batchDelete = async () => {
    if (!selectedRowKeys.length) return;
    setSaving(true);
    try {
      const res = await axiosInstance.post('/myapp/admin/i18n/delete', {
        ids: selectedRowKeys.join(','),
      });
      if (res?.code === 0) {
        message.success('已删除');
        setSelectedRowKeys([]);
        fetchData(1, pageSize, filters);
      } else {
        message.error(res?.msg || '删除失败');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-100 px-4 py-4">
      <Card title="多语言翻译（方案A）" loading={loading}>
        <div className="text-xs text-gray-500 mb-4">
          说明：按 model/objectId/field/lang 存储翻译，前台会按 cookie lang 自动展示。
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            <Select
              value={filters.model}
              onChange={(v) => setFilters((s) => ({ ...s, model: v }))}
              options={MODEL_OPTIONS}
              style={{ width: 220 }}
            />
            <Input
              placeholder="objectId"
              value={filters.objectId}
              onChange={(e) => setFilters((s) => ({ ...s, objectId: e.target.value }))}
              style={{ width: 120 }}
            />
            <Input
              placeholder="field"
              value={filters.field}
              onChange={(e) => setFilters((s) => ({ ...s, field: e.target.value }))}
              style={{ width: 140 }}
            />
            <Select
              value={filters.lang}
              onChange={(v) => setFilters((s) => ({ ...s, lang: v }))}
              options={[{ value: '', label: '全部语言' }, ...LANG_OPTIONS]}
              style={{ width: 160 }}
            />
            <Input
              placeholder="value 关键词"
              value={filters.keyword}
              onChange={(e) => setFilters((s) => ({ ...s, keyword: e.target.value }))}
              style={{ width: 200 }}
            />
            <Button type="primary" onClick={() => fetchData(1, pageSize, filters)}>
              查询
            </Button>
            <Button onClick={openCreate}>新增</Button>
            <Button danger disabled={!selectedRowKeys.length} loading={saving} onClick={batchDelete}>
              批量删除
            </Button>
          </div>

          <Table
            rowKey={(r) => r.id}
            columns={columns}
            dataSource={data}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (p, ps) => fetchData(p, ps, filters),
              showSizeChanger: true,
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
          />
        </div>
      </Card>

      <Modal
        title="编辑翻译"
        open={editing}
        onCancel={() => setEditing(false)}
        onOk={save}
        confirmLoading={saving}
        okText="保存"
      >
        <div className="flex flex-col gap-3">
          <Select
            value={form.model}
            onChange={(v) => setForm((s) => ({ ...s, model: v }))}
            options={MODEL_OPTIONS.filter((x) => x.value)}
          />
          <Input
            placeholder="objectId（例如：分类id/产品id/单例id）"
            value={form.objectId}
            onChange={(e) => setForm((s) => ({ ...s, objectId: e.target.value }))}
          />
          <Input
            placeholder="field（例如：title/description/site_name/...）"
            value={form.field}
            onChange={(e) => setForm((s) => ({ ...s, field: e.target.value }))}
          />
          <Select
            value={form.lang}
            onChange={(v) => setForm((s) => ({ ...s, lang: v }))}
            options={LANG_OPTIONS}
          />
          <Input.TextArea
            rows={6}
            placeholder="翻译内容"
            value={form.value}
            onChange={(e) => setForm((s) => ({ ...s, value: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
