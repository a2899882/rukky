# 部署说明（Debian 12/13 + Docker + FinalShell）

## 0. 新服务器首次部署（最短稳定流程）

说明：本项目使用 Docker Compose 部署，服务名固定为：`db / api / web / nginx`。

```bash
# 1) 安装 Docker + compose（Debian/Ubuntu）
apt update
apt -y install ca-certificates curl git
curl -fsSL https://get.docker.com | bash
apt -y install docker-compose-plugin

# 2) 拉代码
mkdir -p /opt
cd /opt
git clone https://github.com/a2899882/rukky.git boutiquemark-shop
cd /opt/boutiquemark-shop

# 3) 创建 .env（按你的真实值填写）
# 建议：直接把已有服务器的 /opt/boutiquemark-shop/.env 复制到新服务器，然后只改域名/密码

# 4) 启动并迁移
docker-compose -f docker-compose.yml up -d --build db api web nginx
docker-compose -f docker-compose.yml exec api python manage.py migrate
docker-compose -f docker-compose.yml restart api web nginx
```

## 1. 服务器准备

- 推荐路径：`/opt/boutiquemark-shop`
- 需要开放端口：80（后续上 https 再开 443）

### 安装 Docker（只需一次）

```bash
sudo bash deploy/server-install-docker.sh
```

## 2. 获取代码

把代码放到 `/opt/boutiquemark-shop`。

- 方式 1：git clone（推荐）
- 方式 2：上传 zip，服务器解压

## 3. 配置环境变量

```bash
cp .env.example .env
nano .env
```

至少需要修改：

- `SITE_HOST=boutiquemark.shop`
- `DJANGO_ALLOWED_HOSTS=boutiquemark.shop,www.boutiquemark.shop,localhost,127.0.0.1`
- `DJANGO_SECRET_KEY=...`
- `MYSQL_ROOT_PASSWORD=...`

域名/SEO 相关（建议保持一致）：

- `NEXT_PUBLIC_BASE_URL=https://你的域名`（canonical/JSON-LD/分享链接/图片绝对路径）
- `NEXT_PUBLIC_DJANGO_BASE_URL=https://你的域名`（前端 SSR/接口 base）
- `PUBLIC_BASE_URL=https://你的域名`（后端生成 URL、支付回跳等）
- `DJANGO_BASE_HOST_URL=https://你的域名`

后台管理员初始化（首次部署建议启用）：

- `AUTO_INIT_ADMIN=1`（容器启动时自动 migrate + 创建/更新管理员账号）
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=你的强密码`

首次启动完成后可选：将 `AUTO_INIT_ADMIN=0`，避免每次启动重复检查（已做幂等，不关也不会报错）。

支付相关（后续要上线收款必须配置）：

- `PUBLIC_BASE_URL=https://你的域名`（用于支付成功/取消回跳）
- Stripe:
  - `STRIPE_SECRET_KEY=...`
  - `STRIPE_WEBHOOK_SECRET=...`
- PayPal:
  - `PAYPAL_ENV=sandbox` 或 `live`
  - `PAYPAL_CLIENT_ID=...`
  - `PAYPAL_CLIENT_SECRET=...`

后台路径默认：

- `NEXT_PUBLIC_ADMIN_BASE_PATH=/panel`

数据库初始化说明：

- 首次部署默认使用 Django migrations 自动建表（容器启动时 `api` 会执行 `python manage.py migrate --noinput`）。
- 本项目不再默认自动导入 `web_b2b.sql`（避免与 migrations 冲突导致首次启动失败）。
- 如你确实需要导入历史数据：请使用 `deploy/restore.sh` 恢复备份，或自行在 MySQL 中导入你的 SQL。

## 4. 一键启动

```bash
bash deploy/deploy.sh
```

如果你希望手动启动（方便排查），使用下面命令（服务名固定为：`db/api/web/nginx`）：

```bash
docker-compose -f docker-compose.yml up -d --build db api web nginx
docker-compose -f docker-compose.yml exec api python manage.py migrate
docker-compose -f docker-compose.yml restart api web nginx
```

可选：临时指定本次部署域名（不修改 .env）：

```bash
bash deploy/deploy.sh --host 你的域名
```

说明：脚本会检查关键环境变量（如 `DJANGO_SECRET_KEY`、`MYSQL_ROOT_PASSWORD`）是否已修改，并在启动后等待 `db` healthcheck 变为 healthy，再输出访问地址。

访问：

- 前台：`http://你的域名/`
- 后台：`http://你的域名/panel`
- 后台登录：`http://你的域名/panelLogin`

## 4.1 启动后验收（建议首次部署必做）

按下面顺序逐项确认，能最大概率“一次搭建完成上线”。

### A. 容器健康

```bash
docker compose ps    # 如果你的系统只有 docker-compose，则使用：docker-compose ps
docker compose logs -f --tail=200 db    # 或 docker-compose logs -f --tail=200 db
docker compose logs -f --tail=200 api   # 或 docker-compose logs -f --tail=200 api
docker compose logs -f --tail=200 web   # 或 docker-compose logs -f --tail=200 web
docker compose logs -f --tail=200 nginx # 或 docker-compose logs -f --tail=200 nginx
```

确认：

- `db` health 状态为 healthy
- `api/web/nginx` 为 running

### B. 后台可登录

- 打开：`http://你的域名/panelLogin`
- 使用 `.env` 中的 `ADMIN_USERNAME/ADMIN_PASSWORD` 登录

### C. 媒体上传

- 打开：`http://你的域名/panel/media`
- 上传图片/视频后，前台能直接访问 `http://你的域名/upload/...`

说明：Nginx 已设置 `client_max_body_size 100m`，如需更大请修改 `deploy/nginx/default.conf`。

### D. 下单闭环

- 前台下单：`/cart` -> `/checkout`
- 使用 Stripe/PayPal sandbox 完成一次支付
- 回跳成功后：后台订单列表可看到订单，并能“标记发货/完成”

### E. SEO

- `http://你的域名/robots.txt`
- `http://你的域名/sitemap.xml`

## 4.2 支付上线前必读（Webhook/回跳）

- `PUBLIC_BASE_URL` 必须是 `https://你的域名`（用于支付成功/取消回跳）
- Stripe / PayPal 在切换到 live 前，务必在各自后台检查 Webhook/Return URL 配置与域名一致

## 8. 换服务器/换域名（一条命令）

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

## 5. 查看日志

```bash
docker compose logs -f --tail=200 nginx   # 或 docker-compose ...
docker compose logs -f --tail=200 web
docker compose logs -f --tail=200 api
```

## 6. 备份与恢复

### 备份

```bash
bash deploy/backup.sh
```

备份输出：`backups/<timestamp>/`

- `db.sql`
- `upload.tar.gz`

### 恢复

```bash
RESTORE_FORCE=1 bash deploy/restore.sh backups/<timestamp>
```

说明：为避免误操作，恢复脚本要求：

- 备份目录必须位于 `backups/` 下
- 必须显式传入 `RESTORE_FORCE=1`
- 恢复上传文件前会把现有 `server/upload` 重命名为 `server/upload.bak_<timestamp>`

## 7. 更新

```bash
bash deploy/update.sh
```

可选：临时指定本次更新域名（不修改 .env）：

```bash
bash deploy/update.sh --host 你的域名
```
