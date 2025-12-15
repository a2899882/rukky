'use client';

import React, { useEffect, useState } from 'react';
import { Button, Space, Table, Tag } from 'antd';
import axiosInstance from '@/utils/axios';

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/myapp/admin/payment/list');
      if (res?.code === 0) {
        setData(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const columns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 220, ellipsis: true },
    { title: '渠道', dataIndex: 'provider', key: 'provider', width: 120, render: (v) => <Tag>{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120, render: (v) => <Tag>{v}</Tag> },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 120 },
    { title: '币种', dataIndex: 'currency', key: 'currency', width: 80 },
    { title: 'Ref', dataIndex: 'provider_ref', key: 'provider_ref', width: 260, ellipsis: true },
    { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
    { title: '更新时间', dataIndex: 'update_time', key: 'update_time', width: 180 },
  ];

  return (
    <div className="bg-gray-100 px-4 py-4">
      <div className="bg-white rounded-md p-3">
        <div className="flex items-center justify-between pb-3">
          <div className="font-semibold">支付记录</div>
          <Space>
            <Button onClick={fetchList}>刷新</Button>
          </Space>
        </div>
        <Table
          rowKey={(r) => r.id}
          loading={loading}
          dataSource={data}
          columns={columns}
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 20 }}
        />
      </div>
    </div>
  );
}
