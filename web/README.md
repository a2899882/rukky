


## 部署步骤

- 修改wangEditor上传图片/视频大小
- 复制web文件夹(除了node_modules和.next文件夹,升级不传.env)
- npm install
- 在服务器修改.env (host/baseUrl/templateId/)
- build打包 (管理员权限)
- npm run start启动(指定端口)
- 配置nginx(缓存有效期, ubuntu端只先配置http)
- 确保访问成功
- 删除src
- 维护数据(产品数据/各类banner图片/用户数据)

## 配置ssl

## linux静默启动

nohup setsid env PORT=3000 npm run start >> app.log 2>&1 &




## 多语言方案
二级域名+.env配置
NEXT_PUBLIC_DJANGO_BASE_URL用于ssr中的请求
navbar加边距
switchLang.jsx里面需要改languages常量
switchLangB.jsx里面需要改languages常量

## 代码说明

- NEXT_PUBLIC_DJANGO_BASE_URL用于ssr中的请求
- 富文本编辑器的上传文件带baseurl
- 后台主题色 #3399cc
- 代码版权归作者所有
- 未经作者同意不得商用

## 学习路径

- 登录鉴权/权限管理
- 路由
- 请求接口并渲染
- components
- 状态管理
- 主题切换
- 多语言
- 字体
- shadCN/Radix ui
- tailwindcss
- sass
- Typescript混合编程
- SSG/SSR


