'use client';
import React, {useEffect, useState} from 'react';
import ProductList from "@/components/admin/product/productList";
import {Tabs} from "antd";
import CategoryList from "@/components/admin/category/categoryList";


export default function Page() {


    useEffect(() => {
    }, [])

    const onChange = (key) => {
        console.log(key);
    };
    const items = [
        {
            key: '1',
            label: '产品列表',
            children: <ProductList/>,
        },
        {
            key: '2',
            label: '产品分类',
            children: <CategoryList/>,
        },
    ];

    return (
        <>
            <div className="bg-gray-100 px-4 py-4">
                <div className="">
                    <Tabs
                        indicator={{ size: (origin) => 24, align: 'center' }}
                        tabBarStyle={{paddingLeft: '20px', outline: 'none',fontWeight: '400'}}
                        className="bg-white custom-tab" defaultActiveKey="1" items={items} onChange={onChange}/>
                </div>
            </div>
        </>
    );
};