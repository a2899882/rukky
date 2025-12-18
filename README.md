# 基于Python开发的B2B企业英文网站


> 基于 React + Django 开发的 B2B 企业网站（大部分代码使用AI编写），适用场景包括外贸独立站、企业官网、产品展示网站等场景。


## 在线演示

演示地址：[https://boutiquemark.shop](https://boutiquemark.shop)

## 快速开始（推荐：Debian/Ubuntu + Docker）

部署文档：`deploy/README_DEPLOY.md`

最常用命令（在服务器 `/opt/boutiquemark-shop` 目录执行）：

```bash
git pull
docker-compose -f docker-compose.yml up -d --build api web nginx
docker-compose -f docker-compose.yml exec api python manage.py migrate
docker-compose -f docker-compose.yml restart api web nginx
```

### 一键换域名（不同服务器部署必看）

说明：本项目 `web` 在构建阶段（build args）会注入 `NEXT_PUBLIC_BASE_URL` 等变量，所以换域名后需要 `--build web` 才会生效。

```bash
NEW_DOMAIN="newdomain.com"
NEW_BASE_URL="https://newdomain.com"

cd /opt/boutiquemark-shop

set_kv () {
  KEY="$1"; VAL="$2";
  grep -q "^${KEY}=" .env && sed -i "s#^${KEY}=.*#${KEY}=${VAL}#g" .env || echo "${KEY}=${VAL}" >> .env
}

set_kv SITE_HOST "${NEW_DOMAIN}"
set_kv NEXT_PUBLIC_BASE_URL "${NEW_BASE_URL}"
set_kv NEXT_PUBLIC_DJANGO_BASE_URL "${NEW_BASE_URL}"
set_kv PUBLIC_BASE_URL "${NEW_BASE_URL}"
set_kv DJANGO_BASE_HOST_URL "${NEW_BASE_URL}"
set_kv DJANGO_ALLOWED_HOSTS "${NEW_DOMAIN},localhost,127.0.0.1"

docker-compose -f docker-compose.yml up -d --build api web nginx
docker-compose -f docker-compose.yml exec api python manage.py migrate
docker-compose -f docker-compose.yml restart api web nginx
```


## 开发环境

- 后端： Python 3.8 + Django 3.2
- 前端： Javascript + React + Next.js
- 数据库：MySQL 8.0（Docker 部署默认使用 MySQL 8.0）
- 开发平台：Pycharm + vscode
- 运行环境：Windows 10/11

## 关键技术

- 前端技术栈 ES6、React、nextjs、react-router、axios、antd、tailwindcss
- 后端技术栈 Python、Django、djangorestframework、pip



## 运行步骤

### Docker 部署（推荐）

参考：`deploy/README_DEPLOY.md`

### 上线验收 Checklist（建议首次部署必做）

- **[服务健康]** `db/api/web/nginx` 容器均为 running，且 db healthcheck 通过
- **[后台可登录]** `/panelLogin` 使用 `.env` 中初始化的管理员账号可登录
- **[媒体上传]** 后台媒体库可上传图片/视频，前台能访问 `/upload/...`
- **[下单闭环]** 前台下单 -> 支付（sandbox）-> 回跳确认 -> 后台订单可“标记发货/完成”
- **[SEO]** `/robots.txt` 和 `/sitemap.xml` 可访问
- **[支付配置]** 收款上线前确认 `PUBLIC_BASE_URL` 为 `https://boutiquemark.shop`，并按支付平台要求配置 Webhook

### 本地开发（可选）

- 前端：进入 `web/`，安装依赖并启动

```
npm install
npm run dev
```

- 后端：进入 `server/`，安装依赖并启动

```
pip install -r requirements.txt
python manage.py runserver
```


## 常见问题

**1. 数据库版本有什么要求？**

答：mysql 5.7及以上版本即可

**2. 项目的代码结构？**

答：server目录是后端代码，web目录是前端代码。

**3. 需要学习哪些技术知识？**

答：需要学习[python编程知识](https://www.runoob.com/python3/python3-tutorial.html)、[django框架知识](https://docs.djangoproject.com/zh-hans/3.2/)、[vue编程知识](https://cn.vuejs.org/guide/introduction.html)

**4. 后台管理的默认账号密码是？**

答：Docker 部署场景下，后台账号密码由环境变量初始化：

- `AUTO_INIT_ADMIN=1`
- `ADMIN_USERNAME=...`
- `ADMIN_PASSWORD=...`
