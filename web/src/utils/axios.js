import axios from 'axios';
import { adminLoginPath, withSiteBasePath } from "@/utils/adminPath";

// 创建 axios 实例
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    timeout: 15000, // 设置请求超时时间
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
    (config) => {
        // 在发送请求之前添加 token 等信息
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('admintoken'); // 假设 token 存储在 localStorage
            config.headers.ADMINTOKEN = token || '';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
    (response) => {
        // 可以在这里对响应数据进行处理
        return response.data; // 返回数据部分
    },
    (error) => {
        const { response } = error;
        if (response) {
            // 处理 401 错误
            if (response.status === 401 || response.status === 403) {
                // 可以在这里执行登出等操作
                console.error('未授权，请重新登录');
                localStorage.removeItem('admintoken');
                localStorage.removeItem('username');
                // 例如，重定向到登录页面
                window.location.href = withSiteBasePath(adminLoginPath());
            }
            // 处理其他响应错误
            return Promise.reject(response.data); // 返回错误信息
        }
        // 处理网络错误
        return Promise.reject(error);
    }
);


export default axiosInstance;