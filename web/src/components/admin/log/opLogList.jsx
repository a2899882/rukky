'use client';
import React, {useEffect, useState} from 'react';
import {Button, ConfigProvider, message, Modal, Pagination, Popconfirm, Space, Spin, Table, Tabs, Tag} from 'antd';
import {useDispatch, useSelector} from "react-redux";
import Search from "antd/es/input/Search";
import axios from "axios";
import axiosInstance from "@/utils/axios";
import NewsModal from "@/components/admin/news/newsModal";

export default function OpLogList() {
    const adminApp = useSelector((state) => state.adminSetting);
    const dispatch = useDispatch();
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchValue, setSearchValue] = useState('');

    // 分页变量
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '100px',
            textWrap: 'word-break',
        },
        {
            title: 'IP',
            dataIndex: 're_ip',
            key: 're_ip',
            width: '120px',
            textWrap: 'word-break',
            render: (text) => <div>{text}</div>,
        },
        {
            title: '请求方式',
            dataIndex: 're_method',
            key: 're_method',
            width: '90px',
            textWrap: 'word-break',
            render: (text) => <div>{text}</div>,
        },
        {
            title: 'api接口',
            dataIndex: 're_url',
            key: 're_url',
            width: '240px',
            textWrap: 'word-break',
            render: (text) => <div>{text}</div>,
        },
        {
            title: '耗时(ms)',
            dataIndex: 'access_time',
            key: 'access_time',
        },
        {
            title: '创建时间',
            dataIndex: 're_time',
            key: 're_time',
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            render: (_, item) => (
                <Space size="middle">
                    <Popconfirm
                        title="确定删除？"
                        okText="确定"
                        cancelText="取消"
                        onConfirm={() => deleteRecord([item.id])}
                    >
                        <a className="text-adminPrimaryColor">删除</a>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const fetchData = async (page, pageSize) => {
        try {
            setLoading(true);
            const params = {
                page: page,
                pageSize: pageSize,
                keyword: searchValue
            };
            const {code,total, data} = await axiosInstance.get('/myapp/admin/opLog/list',{params});
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
        }
    }

    useEffect(() => {
        fetchData(page, pageSize);
    }, [page, searchValue])


    const [currentItem, setCurrentItem] = useState(null);


    const deleteRecord = async (selected_ids) => {
        try {
            const {code, data} = await axiosInstance.post('/myapp/admin/opLog/delete', {ids: selected_ids.join(',')});
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

    const clearAllRecord = async () => {
        try {
            const {code, data} = await axiosInstance.post('/myapp/admin/opLog/deleteAll');
            if (code === 0) {
                message.success("删除成功")
                setSelectedRowKeys([]);
                fetchData(1, pageSize);
            } else {
                message.error("删除失败")
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleChangePage = (page, pageSize) => {
        setPage(page);
        setPageSize(pageSize);
    }

    return (
        <>

            <div className="bg-white">
                <div>
                    <Spin spinning={loading} tip="">
                        <div className=" px-4 py-4 flex flex-col gap-4">
                            <div className="flex flex-row gap-4">
                                <Popconfirm
                                    title="确定清空？"
                                    okText="确定"
                                    cancelText="取消"
                                    onConfirm={() => clearAllRecord()}
                                >
                                    <Button>清空</Button>
                                </Popconfirm>
                            </div>
                            <Table columns={columns}
                                   dataSource={dataList}
                                   size="middle"
                                   rowKey={(record) => record.id}
                                   pagination={false}
                                   scroll={{ x: 'max-content' }}
                                   showSizeChanger={false}
                            />

                            <div className="p-4">
                                <Pagination align='end'
                                            current={page}
                                            pageSize={pageSize}
                                            showSizeChanger={false}
                                            total={total}
                                            showTotal={(total) => `共 ${total} 条`}
                                            onChange={handleChangePage}
                                />
                            </div>
                        </div>
                    </Spin>
                </div>
            </div>

        </>
    );
};