'use client';
import Link from "next/link";
import React, {useEffect, useState} from 'react';
import {Button, Input, InputNumber, message, Modal, Pagination, Popconfirm, Space, Spin, Switch, Table} from 'antd';
import Search from "antd/es/input/Search";
import axiosInstance from "@/utils/axios";
import ProductModal from "@/components/admin/product/productModal";
import {useRouter} from "next/navigation";


export default function ProductList() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dataList, setDataList] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkMode, setBulkMode] = useState('setPrice');
    const [bulkPrice, setBulkPrice] = useState(0);
    const [bulkRatio, setBulkRatio] = useState(1);

    // 分页变量
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);


    const openModal = async (item) => {
        try {
            if (item?.id) {
                const res = await axiosInstance.get('/myapp/admin/thing/detail', { params: { id: item.id } });
                if (res?.code === 0) {
                    setCurrentItem(res.data);
                } else {
                    setCurrentItem(item);
                }
            } else {
                setCurrentItem(item);
            }
        } catch (e) {
            setCurrentItem(item);
        }
        setModalIsOpen(true);
    };

    const closeModal = (shouldRefresh) => {
        setModalIsOpen(false);
        setCurrentItem(null);
        if (shouldRefresh) {
            fetchData(page, pageSize);
        }
    };


    const quickUpdate = async (id, payload) => {
        try {
            const res = await axiosInstance.post('/myapp/admin/thing/quickUpdate', { id, ...payload });
            if (res?.code === 0) {
                message.success('更新成功');
                fetchData(page, pageSize);
            } else {
                message.error(res?.msg || '更新失败');
            }
        } catch (e) {
            message.error('网络异常');
        }
    }

    const batchUpdate = async (payload) => {
        if (!selectedRowKeys.length) return;
        try {
            const res = await axiosInstance.post('/myapp/admin/thing/batchUpdate', { ids: selectedRowKeys, ...payload });
            if (res?.code === 0) {
                message.success('批量更新成功');
                setSelectedRowKeys([]);
                fetchData(page, pageSize);
            } else {
                message.error(res?.msg || '批量更新失败');
            }
        } catch (e) {
            message.error('网络异常');
        }
    }

    const columns = [
        {
            title: '产品名称',
            dataIndex: 'title',
            key: 'title',
            width: '200px',
            textWrap: 'word-break',
            ellipsis: true,
        },
        {
            title: '分类',
            dataIndex: 'category_title',
            key: 'category_title',
            width: '150px',
            textWrap: 'word-break',
            ellipsis: true,
        },
        {
            title: '摘要',
            dataIndex: 'summary',
            key: 'summary',
            width: '280px',
            textWrap: 'word-break',
            ellipsis: true,
        },
        {
            title: '是否启用',
            dataIndex: 'status',
            key: 'status',
            width: '90px',
            textWrap: 'word-break',
            ellipsis: true,
            render: (text, item) => (
                <Switch
                    checked={text === '0'}
                    checkedChildren="上架"
                    unCheckedChildren="下架"
                    onChange={(v) => quickUpdate(item.id, { status: v ? '0' : '1' })}
                />
            ),
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            width: '120px',
            render: (text, item) => (
                <Input
                    defaultValue={text}
                    placeholder="price"
                    onBlur={(e) => {
                        const v = e.target.value;
                        if (String(v ?? '') !== String(text ?? '')) {
                            quickUpdate(item.id, { price: v });
                        }
                    }}
                />
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'create_time',
            key: 'create_time',
            width: '150px',
            textWrap: 'word-break',
            ellipsis: true,
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            align: 'center',
            width: '150px',
            textWrap: 'word-break',
            ellipsis: true,
            render: (_, item) => (
                <Space size="middle">
                    <a className="text-adminPrimaryColor" onClick={() => openModal(item)}>编辑</a>
                    <Popconfirm
                        title="确定删除？"
                        okText="确定"
                        cancelText="取消"
                        onConfirm={() => deleteRecord([item.id])}
                    >
                        <a className="text-adminPrimaryColor">删除</a>
                    </Popconfirm>
                    <Link className="text-adminPrimaryColor" href={`/product/${item.id}`} target="_blank"
                          rel="noopener noreferrer">预览</Link>
                </Space>
            ),
        },
    ];

    const onSelectChange = (newSelectedRowKeys) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const preview = (item) => {
        router.push(`/product/${item.id}`)
    }

    const deleteRecord = async (selected_ids) => {
        try {
            const {code, data} = await axiosInstance.post('/myapp/admin/thing/delete', {ids: selected_ids.join(',')});
            if (code === 0) {
                message.success("删除成功")
                if (selected_ids.length === dataList.length && page > 1) {
                    setPage(page - 1);
                } else {
                    fetchData(page, pageSize);
                }
            } else {
                message.error("删除失败")
            }
        } catch (err) {
            console.log(err)
        }
    }

    const fetchData = async (page, pageSize) => {
        try {
            setLoading(true);
            const params = {
                page: page,
                pageSize: pageSize,
                keyword: searchValue
            };
            const {code, total, data} = await axiosInstance.get('/myapp/admin/thing/list', {params});
            if (code === 0) {
                setDataList(data)
                setTotal(total)
                setPage(page);
                setPageSize(pageSize);
            } else {
                message.error("数据获取失败")
            }
            setLoading(false);
        } catch (err) {
            console.log(err)
            message.error("网络异常")
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData(page, pageSize);
    }, [page, searchValue])


    const onSearch = (value, _e, info) => {
        console.log(info?.source, value);
        setPage(1)
        setSearchValue(value || '')
    }

    const handleChangePage = (page, pageSize) => {
        setPage(page);
        setPageSize(pageSize);
    }


    return (
        <>
            <Spin spinning={loading} tip="">
                <div className="bg-white px-4 py-4 flex flex-col gap-4">
                    <div className="flex flex-row gap-4">
                        <Button type="primary" onClick={() => openModal({status: '0'})}>新增产品</Button>
                        <Button disabled={!selectedRowKeys.length} onClick={() => batchUpdate({ action: 'setStatus', status: '0' })}>批量上架</Button>
                        <Button disabled={!selectedRowKeys.length} onClick={() => batchUpdate({ action: 'setStatus', status: '1' })}>批量下架</Button>
                        <Button disabled={!selectedRowKeys.length} onClick={() => setBulkOpen(true)}>批量改价</Button>
                        <Popconfirm
                            title="确定删除？"
                            okText="确定"
                            cancelText="取消"
                            onConfirm={() => deleteRecord(selectedRowKeys)}
                        >
                            <Button disabled={!selectedRowKeys.length > 0}>删除</Button>
                        </Popconfirm>
                        <Search
                            placeholder="搜索产品"
                            allowClear
                            onSearch={onSearch}
                            style={{
                                width: 200,
                                marginLeft: 'auto',
                            }}
                        />
                    </div>
                    <div className="bg-white">
                        <Table columns={columns}
                               dataSource={dataList}
                               size="middle"
                               rowSelection={rowSelection}
                               rowKey={(record) => record.id}
                               pagination={false}
                               showSizeChanger={false}/>
                        <div className="p-4">
                            <Pagination align='end'
                                        current={page}
                                        pageSize={pageSize}
                                        total={total}
                                        showTotal={(total) => `共 ${total} 条`}
                                        onChange={handleChangePage}
                            />
                        </div>
                    </div>
                </div>
            </Spin>

            <Modal
                title="批量改价"
                open={bulkOpen}
                onCancel={() => setBulkOpen(false)}
                onOk={async () => {
                    if (bulkMode === 'setPrice') {
                        await batchUpdate({ action: 'setPrice', price: bulkPrice });
                    } else {
                        await batchUpdate({ action: 'adjustPrice', ratio: bulkRatio });
                    }
                    setBulkOpen(false);
                }}
                okButtonProps={{ disabled: !selectedRowKeys.length }}
            >
                <div className="flex flex-col gap-4">
                    <div className="text-sm text-gray-600">对所选商品批量修改价格。</div>
                    <div className="flex gap-3 items-center">
                        <Button type={bulkMode === 'setPrice' ? 'primary' : 'default'} onClick={() => setBulkMode('setPrice')}>设置为固定价</Button>
                        <Button type={bulkMode === 'adjustPrice' ? 'primary' : 'default'} onClick={() => setBulkMode('adjustPrice')}>按比例调整</Button>
                    </div>
                    {bulkMode === 'setPrice' ? (
                        <div className="flex items-center gap-3">
                            <div className="w-28 text-sm">新价格</div>
                            <InputNumber min={0} value={bulkPrice} onChange={(v) => setBulkPrice(v || 0)} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-28 text-sm">比例</div>
                            <InputNumber min={0.01} step={0.01} value={bulkRatio} onChange={(v) => setBulkRatio(v || 1)} />
                            <div className="text-xs text-gray-500">例如 1.1 表示上涨 10%</div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* 使用 CategoryModal 组件 */}
            <ProductModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                initialItem={currentItem}
            />
        </>
    );
};