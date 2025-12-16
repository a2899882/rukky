'use client';

import React, {useState} from 'react';
import {Button, Input, message, Spin} from 'antd';
import axiosInstance from '@/utils/axios';
import {useRouter} from 'next/navigation';
import {adminLoginPath, adminPath} from '@/utils/adminPath';

export default function Page() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        password: '',
        newPassword1: '',
        newPassword2: '',
    });

    const setField = (name, value) => {
        setForm((prev) => ({...prev, [name]: value}));
    };

    const submit = async () => {
        const id = localStorage.getItem('admin_user_id');
        if (!id) {
            message.error('请重新登录');
            router.push(adminLoginPath());
            return;
        }
        if (!form.password || !form.newPassword1 || !form.newPassword2) {
            message.error('不能为空');
            return;
        }
        try {
            setLoading(true);
            const post_url = '/myapp/admin/user/updatePwd';
            const formData = new FormData();
            formData.append('id', id);
            formData.append('password', form.password);
            formData.append('newPassword1', form.newPassword1);
            formData.append('newPassword2', form.newPassword2);
            const {code, msg} = await axiosInstance.post(post_url, formData);
            if (code === 0) {
                localStorage.setItem('admin_must_change_password', '0');
                message.success('更新成功');
                router.push(adminPath('/main'));
            } else {
                message.error(msg || '网络异常');
            }
            setLoading(false);
        } catch (err) {
            console.log(err);
            message.error(err?.detail || '网络异常');
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 px-4 py-6">
            <div className="max-w-xl mx-auto bg-white p-6 shadow">
                <div className="text-lg font-semibold">首次登录请修改管理员密码</div>
                <div className="text-gray-500 text-sm mt-1">为保证安全，请先修改默认密码后再进入后台。</div>

                <Spin spinning={loading} tip="">
                    <div className="mt-6 flex flex-col gap-4">
                        <div>
                            <div className="text-xs text-gray-700 mb-1">原密码</div>
                            <Input.Password value={form.password} onChange={(e) => setField('password', e.target.value)} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-700 mb-1">新密码</div>
                            <Input.Password value={form.newPassword1} onChange={(e) => setField('newPassword1', e.target.value)} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-700 mb-1">确认新密码</div>
                            <Input.Password value={form.newPassword2} onChange={(e) => setField('newPassword2', e.target.value)} />
                        </div>

                        <div className="pt-2">
                            <Button type="primary" onClick={submit}>提交并继续</Button>
                        </div>
                    </div>
                </Spin>
            </div>
        </div>
    );
}
