'use client';
import HeadLabel from "@/components/admin/headLabel";
import FormLabel from "@/components/admin/formLabel";
import React, {useEffect, useState} from "react";
import {Button, Input, message, Radio} from 'antd';
import ImageUpload from "@/components/admin/imageUpload";
import TextArea from "antd/es/input/TextArea";
import {Divider} from "antd/lib";
import axiosInstance from "@/utils/axios";

const AboutSettings = () => {

    const [currentItem, setCurrentItem] = useState({});
    const [loading, setLoading] = useState(false);

    // 为了制造Upload而用(关于配图)
    const [aboutImageList, setAboutImageList] = useState([]);


    const fetchData = async () => {
        try {
            setLoading(true)
            const {code, msg, data} = await axiosInstance.get('/myapp/admin/about/list');
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
        setAboutImageList(createImageList(initialData?.about_cover));
    }

    useEffect(() => {
        fetchData();
    }, []);


    const createImageList = (imageString) => {
        return imageString?.length > 0
            ? imageString.split("#").map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: `${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${item}`,
            }))
            : [];
    };

    const handleInputChange = (name, value) => {
        setCurrentItem((prev) => ({...prev, [name]: value}));
    }

    const handleSave = async () => {
        console.log(currentItem);
        try {
            const post_url = '/myapp/admin/about/update';
            const formData = new FormData();
            formData.append('about_introduction', currentItem.about_introduction || '');
            formData.append('about_cover', currentItem.about_cover || '');
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

    const handleImageUploadChange = (imageUrlList, name) => {
        let value = (imageUrlList && imageUrlList.length > 0) ? imageUrlList.join("#") : null;
        setCurrentItem((prev) => ({...prev, [name]: value}));
    };

    return (
        <>
            <div className="px-6 py-6 flex flex-col gap-6">

                <div className="flex flex-col gap-6">
                    <div className="flex flex-row gap-4">
                        <FormLabel title="企业介绍"></FormLabel>
                        <TextArea
                            placeholder="请输入描述"
                            autoSize={{
                                minRows: 4,
                                maxRows: 8,
                            }}
                            showCount
                            maxLength={500}
                            value={currentItem.about_introduction}
                            onChange={(e) => handleInputChange("about_introduction", e.target.value)}
                            style={{width: 600}}
                        />
                    </div>

                    <div className="flex flex-row gap-4">
                        <FormLabel title="关于图片"></FormLabel>
                        <ImageUpload maxCount={1}
                                     maxSize={2}
                                     accept="image/*"
                                     imageList={aboutImageList}
                                     onImageUploadChange={(imageUrlList)=>handleImageUploadChange(imageUrlList, 'about_cover')}/>
                    </div>
                </div>

                <Divider />

                <div className="pb-6 flex flex-row gap-4 justify-start">
                    <Button type="primary" onClick={handleSave}>保存</Button>
                </div>
            </div>
        </>
    );
}

export default AboutSettings;