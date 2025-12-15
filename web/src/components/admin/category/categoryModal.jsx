import React, {useEffect, useState} from "react";
import {Button, Divider, Input, InputNumber, message, Modal, Spin} from "antd";
import FormLabel from "@/components/admin/formLabel";
import ImageUpload from "@/components/admin/imageUpload";
import axiosInstance from "@/utils/axios";

const CategoryModal = ({isOpen, onRequestClose, initialItem}) => {
    const [currentItem, setCurrentItem] = useState(initialItem || {});

    // 为了制造Upload而用
    const [imageList, setImageList] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setCurrentItem(initialItem || {});

        // 制造适合Upload的数据格式
        if (initialItem?.cover?.length > 0) {
            setImageList(initialItem?.cover?.split("#").map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/img/' + item,
            })));
        } else {
            setImageList([]);
        }

    }, [initialItem]);

    const handleInputChange = (name, value) => {
        setCurrentItem((prev) => ({...prev, [name]: value}));
    };

    const handleImageUploadChange = (imageUrlList) => {
        let cover = (imageUrlList && imageUrlList.length > 0) ? imageUrlList.join("#") : null;
        setCurrentItem((prev) => ({...prev, cover: cover}));
    };

    const handleSave = async () => {

        if (!currentItem.title) {
            message.error("请输入分类名称");
            return;
        }
        if (!currentItem.cover) {
            message.error("请上传封面图");
            return;
        }
        try {
            setLoading(true);
            const post_url = currentItem.id ? '/myapp/admin/category/update' : '/myapp/admin/category/create';
            const formData = new FormData();
            if (currentItem.id) {
                formData.append('id', currentItem.id);
            }
            if (currentItem.cover) {
                formData.append('cover', currentItem.cover);
            }
            formData.append('pid', currentItem.pid);
            formData.append('title', currentItem.title || '');
            formData.append('sort', currentItem.sort || 0);
            const {code, msg, data} = await axiosInstance.post(post_url, formData);
            if (code === 0) {
                message.success("操作成功")
                onRequestClose(true);
            } else {
                message.error(msg || '网络异常')
            }
            setLoading(false);
        } catch (err) {
            console.log(err)
            setLoading(false)
        }
    };

    console.log('current-----------', currentItem)


    return (
        <Modal
            title={currentItem.id ? '编辑分类' : '新增分类'}
            centered
            open={isOpen}
            onCancel={() => onRequestClose(false)}
            footer={null}
            width={600}
        >

            <Spin spinning={loading} tip="">
                <div className="flex flex-col">
                    <div className="">
                        <div className="">
                            <div className="flex flex-col gap-4 pt-4 pb-0 overflow-y-auto max-h-[70vh]">
                                <div className="flex flex-row gap-4">
                                    <FormLabel title="分类名称" required={true}></FormLabel>
                                    <Input placeholder="请输入分类名称" value={currentItem.title}
                                           onChange={(e) => handleInputChange("title", e.target.value)}
                                           style={{width: 400}}/>
                                </div>
                                <div className="flex flex-row gap-4">
                                    <FormLabel title="封面图" required={true}></FormLabel>
                                    <ImageUpload maxCount={1}
                                                 maxSize={2}
                                                 accept="image/*"
                                                 imageList={imageList}
                                                 onImageUploadChange={handleImageUploadChange}/>
                                </div>
                                <div className="flex flex-row gap-4">
                                    <FormLabel title="排序" required={true}></FormLabel>
                                    <InputNumber placeholder="请输入顺序号" value={currentItem.sort}
                                                 onChange={(value) => handleInputChange("sort", value)}
                                                 style={{width: 400}}/>

                                </div>
                            </div>

                            <Divider/>

                            <div className="flex flex-row gap-4 justify-start">
                                <Button type="primary" onClick={handleSave}>提交</Button>
                                <Button onClick={() => onRequestClose(false)}>取消</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
        </Modal>

    );
};

export default CategoryModal;