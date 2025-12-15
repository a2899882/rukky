'use client';
import FormLabel from "@/components/admin/formLabel";
import React, {useEffect, useState} from "react";
import {Button, Input, message, Radio, Spin} from 'antd';
import ImageUpload from "@/components/admin/imageUpload";
import TextArea from "antd/es/input/TextArea";
import {Divider} from "antd/lib";
import axiosInstance from "@/utils/axios";

const BannerSettings = () => {

    const [loading, setLoading] = useState(false);
    const [currentItem, setCurrentItem] = useState({});

    // 为了制造Upload而用（首页）
    const [homeImageList, setHomeImageList] = useState([]);
    // 为了制造Upload而用（产品）
    const [productImageList, setProductImageList] = useState([]);
    // 为了制造Upload而用（关于）
    const [aboutImageList, setAboutImageList] = useState([]);
    // 为了制造Upload而用（联系）
    const [contactImageList, setContactImageList] = useState([]);
    // 为了制造Upload而用（新闻）
    const [newsImageList, setNewsImageList] = useState([]);
    // 为了制造Upload而用（案例）
    const [caseImageList, setCaseImageList] = useState([]);
    // 为了制造Upload而用（faq）
    const [faqImageList, setFaqImageList] = useState([]);
    // 为了制造Upload而用（下载）
    const [downloadImageList, setDownloadImageList] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true)
            const {code, msg, data} = await axiosInstance.get('/myapp/admin/basicBanner/list');
            if (code === 0) {
                setCurrentItem(data);
                fixToImageData(data);
            } else {
                message.error(msg || '网络异常')
            }
            setLoading(false)
        } catch (err) {
            console.log(err)
            message.error('网络异常')
            setLoading(false)
        }
    };

    const fixToImageData = (initialData) => {
        // 首页
        if (initialData?.banner_home?.length > 0) {
            setHomeImageList(initialData?.banner_home?.split("#").map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/img/' + item,
            })));
        } else {
            setHomeImageList([]);
        }

        // 产品
        if (initialData?.banner_product?.length > 0) {
            setProductImageList(initialData?.banner_product?.split("#").map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/img/' + item,
            })));
        } else {
            setProductImageList([]);
        }
        // 关于
        if (initialData?.banner_about?.length > 0) {
            setAboutImageList(initialData?.banner_about?.split("#").map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/img/' + item,
            })));
        } else {
            setAboutImageList([]);
        }
        // 联系
        if (initialData?.banner_contact?.length > 0) {
            setContactImageList(initialData?.banner_contact?.split("#").map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/img/' + item,
            })));
        } else {
            setContactImageList([]);
        }
        // 新闻
        if (initialData?.banner_news?.length > 0) {
            setNewsImageList(initialData?.banner_news?.split("#").map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/img/' + item,
            })));
        } else {
            setNewsImageList([]);
        }
        // 案例
        if (initialData?.banner_case?.length > 0) {
            setCaseImageList(initialData?.banner_case?.split("#").map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/img/' + item,
            })));
        } else {
            setCaseImageList([]);
        }
        // faq
        if (initialData?.banner_faq?.length > 0) {
            setFaqImageList(initialData?.banner_faq?.split("#").map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/img/' + item,
            })));
        } else {
            setFaqImageList([]);
        }
        // 下载
        if (initialData?.banner_download?.length > 0) {
            setDownloadImageList(initialData?.banner_download?.split("#").map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/img/' + item,
            })));
        } else {
            setDownloadImageList([]);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleImageUploadChange = (imageUrlList, name) => {
        let value = (imageUrlList && imageUrlList.length > 0) ? imageUrlList.join("#") : null;
        setCurrentItem((prev) => ({...prev, [name]: value}));
    };

    const handleSave = async () => {
        try {
            const post_url = '/myapp/admin/basicBanner/update';
            const formData = new FormData()
            formData.append('banner_home', currentItem.banner_home || '');
            formData.append('banner_product', currentItem.banner_product || '');
            formData.append('banner_about', currentItem.banner_about || '');
            formData.append('banner_contact', currentItem.banner_contact || '');
            formData.append('banner_news', currentItem.banner_news || '');
            formData.append('banner_case', currentItem.banner_case || '');
            formData.append('banner_faq', currentItem.banner_faq || '');
            formData.append('banner_download', currentItem.banner_download || '');

            const {code, msg, data} = await axiosInstance.post(post_url, formData);
            if (code === 0) {
                message.success("操作成功");
                fetchData()
            } else {
                message.error(msg || '网络异常')
            }
        } catch (err) {
            console.log(err)
        }
    };


    console.log(currentItem);

    return (
        <>
            <div className="px-6">
                <Spin spinning={loading}>
                    <div className="flex flex-col gap-6 py-6">
                        <div className="flex flex-row gap-4">
                            <FormLabel title="首页Banner" labelWidth={150}></FormLabel>
                            <ImageUpload maxCount={6}
                                         maxSize={2}
                                         accept="image/*"
                                         imageList={homeImageList}
                                         onImageUploadChange={(imageUrlList) => handleImageUploadChange(imageUrlList, 'banner_home')}/>
                        </div>
                        <div className="flex flex-row gap-4">
                            <FormLabel title="产品中心Banner" labelWidth={150}></FormLabel>
                            <ImageUpload maxCount={1}
                                         maxSize={2}
                                         accept="image/*"
                                         imageList={productImageList}
                                         onImageUploadChange={(imageUrlList) => handleImageUploadChange(imageUrlList, 'banner_product')}/>
                        </div>
                        <div className="flex flex-row gap-4">
                            <FormLabel title="关于页Banner" labelWidth={150}></FormLabel>
                            <ImageUpload maxCount={1}
                                         maxSize={2}
                                         accept="image/*"
                                         imageList={aboutImageList}
                                         onImageUploadChange={(imageUrlList) => handleImageUploadChange(imageUrlList, 'banner_about')}/>
                        </div>
                        <div className="flex flex-row gap-4">
                            <FormLabel title="联系页Banner" labelWidth={150}></FormLabel>
                            <ImageUpload maxCount={1}
                                         maxSize={2}
                                         accept="image/*"
                                         imageList={contactImageList}
                                         onImageUploadChange={(imageUrlList) => handleImageUploadChange(imageUrlList, 'banner_contact')}/>
                        </div>
                        <div className="flex flex-row gap-4">
                            <FormLabel title="新闻页Banner" labelWidth={150}></FormLabel>
                            <ImageUpload maxCount={1}
                                         maxSize={2}
                                         accept="image/*"
                                         imageList={newsImageList}
                                         onImageUploadChange={(imageUrlList) => handleImageUploadChange(imageUrlList, 'banner_news')}/>
                        </div>
                        <div className="flex flex-row gap-4">
                            <FormLabel title="案例页Banner" labelWidth={150}></FormLabel>
                            <ImageUpload maxCount={1}
                                         maxSize={2}
                                         accept="image/*"
                                         imageList={caseImageList}
                                         onImageUploadChange={(imageUrlList) => handleImageUploadChange(imageUrlList, 'banner_case')}/>
                        </div>
                        <div className="flex flex-row gap-4">
                            <FormLabel title="Faq页Banner" labelWidth={150}></FormLabel>
                            <ImageUpload maxCount={1}
                                         maxSize={2}
                                         accept="image/*"
                                         imageList={faqImageList}
                                         onImageUploadChange={(imageUrlList) => handleImageUploadChange(imageUrlList, 'banner_faq')}/>
                        </div>
                        <div className="flex flex-row gap-4">
                            <FormLabel title="下载页Banner" labelWidth={150}></FormLabel>
                            <ImageUpload maxCount={1}
                                         maxSize={2}
                                         accept="image/*"
                                         imageList={downloadImageList}
                                         onImageUploadChange={(imageUrlList) => handleImageUploadChange(imageUrlList, 'banner_download')}/>
                        </div>

                    </div>
                </Spin>

                <Divider/>

                <div className="pb-6 flex flex-row gap-4 justify-start">
                    <Button type="primary" onClick={handleSave}>提交</Button>
                </div>
            </div>
        </>
    );
}

export default BannerSettings;