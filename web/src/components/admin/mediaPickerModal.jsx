'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Table, Input, Segmented, Space, Button, message } from 'antd';
import axiosInstance from '@/utils/axios';

export default function MediaPickerModal({ open, onCancel, onOk, multiple = true, initialDir = 'img', initialType = 'image' }) {
  const [dir, setDir] = useState(initialDir);
  const [type, setType] = useState(initialType);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/myapp/admin/media/list', {
        params: { dir, type, keyword, page, pageSize },
      });
      if (res?.code === 0) {
        setData(res.data || []);
        setTotal(res.total || 0);
      } else {
        message.error(res?.msg || '获取失败');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSelected([]);
      setDir(initialDir);
      setType(initialType);
      fetchList();
    }
  }, [open, initialDir, initialType]);

  useEffect(() => {
    if (open) fetchList();
  }, [dir, type, keyword, page, pageSize]);

  const columns = [
    {
      title: '预览',
      key: 'preview',
      width: 90,
      render: (_, row) => {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${row.dir}/${row.name}`;
        if (row.type === 'image') {
          return <img src={url} alt={row.name} style={{ width: 56, height: 56, objectFit: 'cover' }} />;
        }
        return <div className="text-xs text-gray-500">{row.type}</div>;
      },
    },
    { title: '文件名', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
  ];

  return (
    <Modal
      title="从媒体库选择"
      open={open}
      width={820}
      onCancel={onCancel}
      onOk={() => onOk(selected)}
      okButtonProps={{ disabled: selected.length === 0 }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-center">
          <Segmented
            value={dir}
            onChange={(v) => {
              setPage(1);
              setDir(v);
              setSelected([]);
            }}
            options={[
              { label: '图片', value: 'img' },
              { label: '文件/视频', value: 'file' },
            ]}
          />
          <Segmented
            value={type}
            onChange={(v) => {
              setPage(1);
              setType(v);
              setSelected([]);
            }}
            options={dir === 'img'
              ? [
                  { label: '图片', value: 'image' },
                  { label: '全部', value: 'all' },
                ]
              : [
                  { label: '视频', value: 'video' },
                  { label: '文件', value: 'file' },
                  { label: '全部', value: 'all' },
                ]}
          />
          <Input
            placeholder="搜索文件名"
            allowClear
            style={{ width: 240, marginLeft: 'auto' }}
            value={keyword}
            onChange={(e) => {
              setPage(1);
              setKeyword(e.target.value);
            }}
          />
        </div>

        <Table
          rowKey={(r) => r.name}
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          rowSelection={{
            type: multiple ? 'checkbox' : 'radio',
            selectedRowKeys: selected,
            onChange: (keys) => setSelected(keys),
          }}
        />

        <div className="text-xs text-gray-500">
          选择后会把文件名写入商品图片字段（以 # 分隔）。
        </div>
      </div>
    </Modal>
  );
}
