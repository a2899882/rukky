'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Segmented, Space, Table, Tag, Upload, message } from 'antd';
import { UploadOutlined, DeleteOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosInstance from '@/utils/axios';

export default function Page() {
  const [dir, setDir] = useState('img');
  const [type, setType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
    fetchList();
  }, [dir, type, keyword, page, pageSize]);

  const uploadAction = useMemo(() => {
    // img -> uploadImg, file -> uploadFile (富文本上传，支持 mp4)
    return dir === 'img' ? '/myapp/admin/cdn/uploadImg' : '/myapp/admin/cdn/uploadFile';
  }, [dir]);

  const uploadProps = {
    name: 'my-file',
    action: uploadAction,
    headers: {
      admintoken: typeof window !== 'undefined' ? localStorage.getItem('admintoken') || '' : '',
    },
    multiple: true,
    showUploadList: false,
    onChange(info) {
      if (info.file.status === 'done') {
        message.success('上传成功');
        fetchList();
      } else if (info.file.status === 'error') {
        message.error('上传失败');
      }
    },
  };

  const copyUrl = async (row) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${row.dir}/${row.name}`;
    try {
      await navigator.clipboard.writeText(url);
      message.success('已复制链接');
    } catch (e) {
      message.error('复制失败');
    }
  };

  const batchDelete = async () => {
    if (!selectedRowKeys.length) return;
    const names = selectedRowKeys;
    const res = await axiosInstance.post('/myapp/admin/media/delete', { dir, names });
    if (res?.code === 0) {
      message.success('删除成功');
      setSelectedRowKeys([]);
      fetchList();
      return;
    }
    const refs = res?.data?.references;
    if (refs && typeof refs === 'object') {
      Modal.confirm({
        title: '文件被引用，是否强制删除？',
        content: (
          <div className="text-sm">
            {Object.keys(refs).map((k) => (
              <div key={k} className="mb-2">
                <div className="font-mono">{k}</div>
                <div className="text-gray-500">used by: {(refs[k] || []).join(', ')}</div>
              </div>
            ))}
          </div>
        ),
        onOk: async () => {
          const r2 = await axiosInstance.post('/myapp/admin/media/delete', { dir, names, force: 1 });
          if (r2?.code === 0) {
            message.success('已强制删除');
            setSelectedRowKeys([]);
            fetchList();
          } else {
            message.error(r2?.msg || '删除失败');
          }
        }
      });
      return;
    }
    message.error(res?.msg || '删除失败');
  };

  const columns = [
    { title: '文件名', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 110, render: (v) => <Tag>{v}</Tag> },
    { title: '大小', dataIndex: 'size', key: 'size', width: 120, render: (v) => `${(Number(v || 0) / 1024).toFixed(1)} KB` },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, row) => (
        <Space>
          <Button icon={<CopyOutlined />} onClick={() => copyUrl(row)}>复制链接</Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={async () => {
              const res = await axiosInstance.post('/myapp/admin/media/delete', { dir: row.dir, names: [row.name] });
              if (res?.code === 0) {
                message.success('删除成功');
                fetchList();
                return;
              }
              const refs = res?.data?.references;
              if (refs && typeof refs === 'object') {
                Modal.confirm({
                  title: '文件被引用，是否强制删除？',
                  content: (
                    <div className="text-sm">
                      {Object.keys(refs).map((k) => (
                        <div key={k} className="mb-2">
                          <div className="font-mono">{k}</div>
                          <div className="text-gray-500">used by: {(refs[k] || []).join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  ),
                  onOk: async () => {
                    const r2 = await axiosInstance.post('/myapp/admin/media/delete', { dir: row.dir, names: [row.name], force: 1 });
                    if (r2?.code === 0) {
                      message.success('已强制删除');
                      fetchList();
                    } else {
                      message.error(r2?.msg || '删除失败');
                    }
                  }
                });
                return;
              }
              message.error(res?.msg || '删除失败');
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-gray-100 px-4 py-4">
      <Card
        title="媒体库"
        extra={
          <Space>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传</Button>
            </Upload>
            <Button icon={<ReloadOutlined />} onClick={fetchList}>刷新</Button>
            <Button danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length} onClick={() => Modal.confirm({ title: '确定删除选中文件？', onOk: batchDelete })}>
              批量删除
            </Button>
          </Space>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center">
            <Segmented
              value={dir}
              onChange={(v) => {
                setPage(1);
                setSelectedRowKeys([]);
                setDir(v);
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
                setSelectedRowKeys([]);
                setType(v);
              }}
              options={[
                { label: '全部', value: 'all' },
                { label: '图片', value: 'image' },
                { label: '视频', value: 'video' },
                { label: '文件', value: 'file' },
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
            rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
            pagination={{ current: page, pageSize, total, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
          />

          <div className="text-xs text-gray-500">
            提示：复制的链接可用于商品详情/封面等位置。视频建议使用 mp4。
          </div>
        </div>
      </Card>
    </div>
  );
}
