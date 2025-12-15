import React, {useState, useEffect} from 'react';
import {Button, Input, message, Spin} from "antd";
import axiosInstance from "@/utils/axios";
import {useRouter} from "next/navigation";
import { UserOutlined } from '@ant-design/icons';
import { adminPath } from "@/utils/adminPath";

const LoginPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());

    const [currentItem, setCurrentItem] = useState({
        username: "",
        password: ""
    });

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    const handleInputChange = (name, value) => {
        setCurrentItem((prev) => ({...prev, [name]: value}));
    };

    const login = async () => {
        if (currentItem.username.length === 0 || currentItem.password.length === 0) {
            message.error('用户名或密码不能为空')
            return;
        }
        try {
            setLoading(true);
            const post_url = '/myapp/admin/adminLogin';
            const formData = new FormData();
            formData.append('username', currentItem.username);
            formData.append('password', currentItem.password);
            const {code, msg, data} = await axiosInstance.post(post_url, formData);
            if (code === 0) {
                message.success("登录成功")
                localStorage.setItem('admintoken', data.admin_token);
                localStorage.setItem('username', data.username);
                router.push(adminPath('/main'));
            } else {
                message.error(msg || '网络异常')
            }
            setLoading(false);
        } catch (err) {
            console.log(err)
            message.error(err.detail || '网络异常')
            setLoading(false)
        }
    }

    // 键盘按Enter登录
    const handleKeyPress = (e) => {
        if(e.key === 'Enter'){
            login();
        }
    }
    const bgImage = "linear-gradient(to right, #92fe9d 0%, #00c9ff 100%)";

    return (
        <div
            style={{
            backgroundImage: `${bgImage}`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }} className="min-h-screen w-full flex flex-col items-center justify-center">
            {/* 背景装饰元素 - 在小屏幕上减小或隐藏部分装饰 */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full opacity-50 blur-3xl hidden sm:block"></div>
                <div className="absolute top-1/3 -right-20 w-60 h-60 bg-indigo-100 rounded-full opacity-40 blur-3xl"></div>
                <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-cyan-100 rounded-full opacity-30 blur-3xl hidden sm:block"></div>
            </div>
            
            <div className="z-10 w-full max-w-sm px-4 sm:px-0">
                {/* 品牌标识 - 在移动端调整大小 */}
                <div className="text-center mb-4">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800 tracking-wide mb-1">网站后台内容管理系统</h1>
                    <p className="text-gray-500 text-xs sm:text-sm">专业的企业官网内容管理平台</p>
                </div>
                
                {/* 登录卡片 - 移动端减少内边距 */}
                <div className="bg-white/80 backdrop-blur-lg rounded shadow-md p-4 sm:p-6 border border-gray-100">
                    <div className="flex items-center justify-center h-10 sm:h-12 w-10 sm:w-12 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-3 sm:mb-4 shadow-lg">
                        {/* 使用扁平风格的锁图标 - 移动端稍小 */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                            <rect x="3" y="11" width="18" height="11" rx="1" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    
                    <h2 className="text-base sm:text-lg font-semibold text-center mb-3 sm:mb-4 text-gray-800">管理员登录</h2>
                    
                    <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700" htmlFor="username">
                                用户名
                            </label>
                            <Input 
                                prefix={<UserOutlined className="site-form-item-icon text-gray-400" />}
                                placeholder="请输入管理员用户名" 
                                value={currentItem.username}
                                onChange={(e) => handleInputChange("username", e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="py-1"
                                size="middle"
                                style={{ borderRadius: '2px' }}
                            />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700" htmlFor="password">
                                密码
                            </label>
                            <Input.Password 
                                prefix={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                                        <rect x="3" y="11" width="18" height="11" rx="1" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                }
                                placeholder="请输入管理员密码" 
                                value={currentItem.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="py-1"
                                size="middle"
                                style={{ borderRadius: '2px' }}
                            />
                        </div>
                        
                        <div className="pt-3">
                            <Button 
                                loading={loading} 
                                type="primary" 
                                className="w-full h-8 sm:h-9 bg-gradient-to-r from-blue-500 to-cyan-500 border-0 shadow-md transition-all"
                                onClick={() => login()}
                                size="middle"
                                style={{ borderRadius: '2px' }}
                            >
                                {loading ? '登录中...' : '登录'}
                            </Button>
                        </div>
                    </div>
                </div>
                
                {/* 底部版权信息 - 移动端缩小 */}
                <div className="mt-4 sm:mt-6 text-center text-gray-500 text-xs">
                    <p>安全连接 | 管理员专用入口</p>
                    <p className="mt-1">© {year} 企业内容管理系统. 保留所有权利</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;