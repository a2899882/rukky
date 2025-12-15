import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_DJANGO_BASE_URL,
    timeout: 15000, // 设置请求超时时间
    headers: {
        'Content-Type': 'application/json',
    },
});

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        // 可以在这里对响应数据进行处理
        return response.data; // 返回数据部分
    },
    (error) => {
        const { response } = error;
        if (response) {
            console.log("error---------->", response.data)
            // 处理其他响应错误
            return Promise.reject(response.data); // 返回错误信息
        }
        // 处理网络错误
        return Promise.reject(error);
    }
);


export default api;