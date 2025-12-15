import React, {useEffect, useState} from "react";
import {Button, Divider, Input, InputNumber, message, Modal, Spin} from "antd";
import FormLabel from "@/components/admin/formLabel";
import axiosInstance from "@/utils/axios";
import TextArea from "antd/es/input/TextArea";
import LabelPanel from "@/components/admin/labelPanel";
import FileUpload from "@/components/admin/fileUpload";

const DownloadModal = ({isOpen, onRequestClose, initialItem}) => {
    const [currentItem, setCurrentItem] = useState(initialItem || {});
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setCurrentItem(initialItem || {});

        // 制造适合Upload的数据格式
        if (initialItem?.raw?.length > 0) {
            setFileList(initialItem?.raw?.split("#").map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/file/' + item,
            })));
        } else {
            setFileList([]);
        }

    }, [initialItem]);


    const handleInputChange = (name, value) => {
        setCurrentItem((prev) => ({...prev, [name]: value}));
    };

    const handleFileUploadChange = (fileUrlList) => {
        let raw = (fileUrlList && fileUrlList.length > 0) ? fileUrlList.join("#") : null;
        setCurrentItem((prev) => ({...prev, raw: raw}));
    };

    const handleHtmlChange = (value) => {
        setCurrentItem((prev) => ({...prev, description: value}));
    };

    const handleSave = async () => {
        try {
            const post_url = currentItem.id ? '/myapp/admin/download/update' : '/myapp/admin/download/create';
            const formData = new FormData();
            if (currentItem.id) {
                formData.append('id', currentItem.id);
            }
            if(!currentItem.title){
                message.error('文件名称不能为空')
                return;
            }
            if(!currentItem.raw && !currentItem.link){
                message.error('请上传文件或填写外部链接')
                return;
            }

            formData.append('title', currentItem.title || '');
            formData.append('summary', currentItem.summary || '');
            formData.append('link', currentItem.link || '');
            formData.append('raw', currentItem.raw || '');
            setLoading(true);
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
            title={currentItem.id ? '编辑' : '新增'}
            centered
            open={isOpen}
            onCancel={() => onRequestClose(false)}
            footer={null}
            width={800}
        >

            <Spin spinning={loading} tip="">
                <div className="flex flex-col">
                    <div className="">
                        <div className="">
                            <div className="flex flex-col gap-4 pt-4 pb-0">
                                <div className="flex flex-row gap-4">
                                    <FormLabel title="文件名称" required={true}></FormLabel>
                                    <Input placeholder="请输入" value={currentItem.title}
                                           onChange={(e) => handleInputChange("title", e.target.value)}
                                           style={{width: 600}}/>
                                </div>
                                <div className="flex flex-row gap-4">
                                    <FormLabel title="文件介绍" ></FormLabel>
                                    <Input placeholder="请输入" value={currentItem.summary}
                                           onChange={(e) => handleInputChange("summary", e.target.value)}
                                           style={{width: 600}}/>
                                </div>
                                <div className="flex flex-row gap-4">
                                    <FormLabel title="文件上传"></FormLabel>
                                    <FileUpload maxCount={1}
                                                maxSize={500}
                                                 accept="image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/zip,application/x-rar-compressed"
                                                myFileList={fileList}
                                                 onFileUploadChange={handleFileUploadChange}/>
                                </div>
                                <div className="flex flex-row gap-4">
                                    <FormLabel title="外部链接" ></FormLabel>
                                    <div className="flex flex-col gap-2">
                                        <Input placeholder="请输入外部下载链接，比如百度网盘链接" value={currentItem.link}
                                               onChange={(e) => handleInputChange("link", e.target.value)}
                                               style={{width: 600}}/>
                                        <div className="text-gray-400 text-sm">提示：网站优先使用外部链接</div>
                                    </div>
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

export default DownloadModal;