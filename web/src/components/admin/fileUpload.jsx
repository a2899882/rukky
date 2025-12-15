import React, {useEffect, useState} from 'react';
import {PlusOutlined, UploadOutlined} from '@ant-design/icons';
import {Button, Image, message, Upload} from 'antd';

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });


const FileUpload = ({maxCount, maxSize, accept, myFileList, onFileUploadChange}) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [fileList, setFileList] = useState(myFileList);
    const [admintoken, setAdmintoken] = useState('');

    useEffect(() => {
        setFileList(myFileList)

        if (localStorage.getItem('admintoken')) {
            setAdmintoken(localStorage.getItem('admintoken'))
        }
    }, [myFileList]);


    const handleChange = ({file, fileList: newFileList}) => {
        console.log('当前操作文件的状态------>', file.status)
        setFileList(newFileList);
        if (file.status === 'error') {
            message.error("上传失败")
        }

        let fileUrlArray = [];
        newFileList.forEach(item => {
            if (item.success) {
                fileUrlArray.push(item.name);
            }
            if (item.response) {
                if (item.response.code === 0) {
                    fileUrlArray.push(item.response.data)
                } else if (item.response.code === 1) {
                    message.error("上传失败：" + item.response.msg)
                    item.status = 'error'
                }
            }
        })

        onFileUploadChange(fileUrlArray);
    };

    const uploadButton = (
        <Button icon={<UploadOutlined/>}>Upload</Button>
    );

    const props = {
        name: 'my-file',
        action: process.env.NEXT_PUBLIC_BASE_URL + '/myapp/admin/cdn/uploadNormalFile',
        headers: {
            admintoken: admintoken,
        },
    };

    return (
        <>
            <div className="flex flex-col gap-2">
                <div>
                    <Upload
                        accept={accept}
                        fileList={fileList}
                        onChange={handleChange}
                        maxCount={maxCount}
                        {...props}
                    >
                        {fileList.length >= maxCount ? null : uploadButton}
                    </Upload>
                </div>
                <div className="text-gray-400 text-sm">文件大小{maxSize}MB以内，支持格式 jpeg/png/docx/pdf/zip/rar</div>
            </div>
        </>
    );
};
export default FileUpload;