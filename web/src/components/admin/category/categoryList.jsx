'use client';
import React, {useEffect, useState} from 'react';
import {Button, ConfigProvider, message, Modal, Pagination, Popconfirm, Space, Spin, Table, Tag} from 'antd';
import ProductModal from "@/components/admin/product/productModal";
import {useDispatch, useSelector} from "react-redux";
import Search from "antd/es/input/Search";
import CategoryModal from "@/components/admin/category/categoryModal";
import axios from "axios";
import axiosInstance from "@/utils/axios";

export default function CategoryList() {
    const adminApp = useSelector((state) => state.adminSetting);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);


    const columns = [
        {
            title: '分类名称',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: '排序',
            dataIndex: 'sort',
            key: 'sort',
        },
        {
            title: '操作',
            key: 'action',
            align: 'left',
            width: '260px',
            render: (_, item) => (
                <Space size="middle">

                    <a className="text-adminPrimaryColor" onClick={() => openModal(item)}>编辑</a>
                    {
                        item.pid === -1 ? (
                            <a className="text-adminPrimaryColor"  onClick={() => openModal({sort: 0, pid: item.id})}>
                                添加子分类
                            </a>
                        ) : (null)
                    }
                    <Popconfirm
                        title="确定删除？"
                        okText="确定"
                        cancelText="取消"
                        onConfirm={() => deleteRecord(item)}
                    >
                        <a className="text-adminPrimaryColor" >删除</a>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const {code, data} = await axiosInstance.get('/myapp/admin/category/list');
            if (code === 0) {
                setData(data)
            } else {
                message.error("数据获取失败")
            }
            setLoading(false);
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        fetchData();
    }, [])


    const [data, setData] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const openModal = (item) => {
        setModalIsOpen(true);
        setCurrentItem(item)
    };

    const closeModal = (shouldRefresh) => {
        setModalIsOpen(false);
        setCurrentItem(null);
        if (shouldRefresh) {
            fetchData();
        }
    };

    const deleteRecord = async (item) => {
        try {
            const {code, data} = await axiosInstance.post('/myapp/admin/category/delete', {id: item.id});
            if (code === 0) {
                message.success("删除成功")
                fetchData();
            } else {
                message.error("删除失败")
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <>
            <Spin spinning={loading} tip="">
                <div className="bg-white px-4 py-4 flex flex-col gap-4">
                    <div className="flex flex-row gap-4">
                        <Button type="primary" onClick={() => openModal({sort: 0, pid: -1})}>新增分类</Button>
                    </div>
                    <Table columns={columns}
                           dataSource={data}
                           size="middle"
                           rowKey={(record) => record.id}
                           pagination={false}
                    />
                </div>
            </Spin>

            {/* 使用 CategoryModal 组件 */}
            <CategoryModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                initialItem={currentItem}
            />

        </>
    );
};