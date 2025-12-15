'use client';

import React, { useEffect, useState } from 'react';
import { Button, Drawer, Space, Table, Tag, message } from 'antd';
import axiosInstance from '@/utils/axios';

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/myapp/admin/order/list');
      if (res?.code === 0) {
        setData(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (row, status) => {
    try {
      const res = await axiosInstance.post('/myapp/admin/order/updateStatus', { id: row.id, status });
      if (res?.code === 0) {
        message.success('操作成功');
        await fetchList();
        if (detail?.id === row.id) {
          await openDetail(row);
        }
      } else {
        message.error(res?.msg || '操作失败');
      }
    } catch (e) {
      message.error('网络异常');
    }
  };

  const openDetail = async (row) => {
    setDrawerOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await axiosInstance.get('/myapp/admin/order/detail', { params: { id: row.id } });
      if (res?.code === 0) {
        setDetail(res.data);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const columns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 220, ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120, render: (v) => <Tag>{v}</Tag> },
    { title: '币种', dataIndex: 'currency', key: 'currency', width: 80 },
    { title: '总价', dataIndex: 'total', key: 'total', width: 120 },
    { title: '邮箱', dataIndex: 'customer_email', key: 'customer_email', width: 200, ellipsis: true },
    { title: '电话', dataIndex: 'customer_phone', key: 'customer_phone', width: 160, ellipsis: true },
    { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 240,
      render: (_, row) => (
        <Space>
          <Button type="link" onClick={() => openDetail(row)}>详情</Button>
          <Button
            type="link"
            disabled={row.status !== 'paid'}
            onClick={() => updateStatus(row, 'fulfilled')}
          >
            标记发货
          </Button>
          <Button
            type="link"
            disabled={row.status !== 'fulfilled'}
            onClick={() => updateStatus(row, 'completed')}
          >
            标记完成
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-gray-100 px-4 py-4">
      <div className="bg-white rounded-md p-3">
        <div className="flex items-center justify-between pb-3">
          <div className="font-semibold">订单管理</div>
          <Button onClick={fetchList}>刷新</Button>
        </div>
        <Table
          rowKey={(r) => r.id}
          loading={loading}
          dataSource={data}
          columns={columns}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20 }}
        />
      </div>

      <Drawer
        title="订单详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={720}
      >
        {detailLoading ? (
          <div className="text-gray-600">Loading...</div>
        ) : detail ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">订单号</div>
              <div className="font-mono">{detail.orderNo}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">状态</div>
                <div>{detail.status}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">币种</div>
                <div>{detail.currency}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">总价</div>
                <div>{detail.total}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">创建时间</div>
                <div>{detail.createTime}</div>
              </div>
            </div>

            <div>
              <div className="font-medium mb-2">商品</div>
              <div className="divide-y border rounded">
                {(detail.items || []).map((it) => (
                  <div key={it.id} className="p-3 flex items-center justify-between text-sm">
                    <div className="text-gray-900">{it.title_snapshot}</div>
                    <div className="text-gray-600">x{it.quantity}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-medium mb-2">支付记录</div>
              <div className="divide-y border rounded">
                {(detail.payments || []).length === 0 ? (
                  <div className="p-3 text-sm text-gray-600">无</div>
                ) : (
                  (detail.payments || []).map((p) => (
                    <div key={p.id} className="p-3 text-sm flex items-center justify-between">
                      <div>{p.provider}</div>
                      <div>{p.status}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">No data</div>
        )}
      </Drawer>
    </div>
  );
}
