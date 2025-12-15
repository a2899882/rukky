import React, {useEffect, useState} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {Image, message, Upload} from 'antd';

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });


const LogoImageUpload = ({maxCount, maxSize,accept, imageList, onImageUploadChange}) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState(imageList);
    const [admintoken, setAdmintoken] = useState('');
    
    useEffect(() => {
        setFileList(imageList)

        if (localStorage.getItem('admintoken')) {
            setAdmintoken(localStorage.getItem('admintoken'))
        }
    }, [imageList]);


    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };

    const handleChange = ({file, fileList: newFileList}) => {
        console.log('当前操作文件的状态------>',file.status)
        setFileList(newFileList);
        if (file.status === 'error') {
            message.error("上传失败")
        }

        let imageUrlArray = [];
        newFileList.forEach(item => {
            if (item.success) {
                imageUrlArray.push(item.name);
            }
            if(item.response){
                if(item.response.code === 0){
                    imageUrlArray.push(item.response.data)
                }else if(item.response.code === 1){
                    message.error("上传失败："+item.response.msg)
                    item.status = 'error'
                }
            }
        })

        onImageUploadChange(imageUrlArray);
    };

    const uploadButton = (
        <button
            style={{
                border: 0,
                background: 'none',
                display: 'flex',
                alignItems:  'center'
            }}
            type="button"
        >
            <PlusOutlined/>
            <div
                style={{
                    marginTop: 8,
                }}
            >
            </div>
        </button>
    );

    const props = {
        name: 'my-file',
        action: process.env.NEXT_PUBLIC_BASE_URL + '/myapp/admin/cdn/uploadLogoImg',
        headers: {
            admintoken: admintoken,
        },
    };

    return (
        <>
            <div className="flex flex-col gap-2">
                <div className=" min-h-[102px]">
                    <Upload
                        accept={accept}
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}
                        maxCount={maxCount}
                        {...props}
                    >
                        {fileList?.length >= maxCount ? null : uploadButton}
                    </Upload>
                    {previewImage && (
                        <Image
                            wrapperStyle={{
                                display: 'none',
                            }}
                            preview={{
                                visible: previewOpen,
                                onVisibleChange: (visible) => setPreviewOpen(visible),
                                afterOpenChange: (visible) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                        />
                    )}
                </div>
                <div className="text-gray-400 text-sm">图片大小{maxSize}MB以内，最多{maxCount}张图片</div>
            </div>
        </>
    );
};
export default LogoImageUpload;