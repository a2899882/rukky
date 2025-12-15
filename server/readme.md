### 准备环境

安装mysql
安装python
安装node
安装nginx

放开防火墙端口/telnet检查
需要客户提供邮箱、域名、logo

### 运行说明

清空日志
导出sql
复制sql到远程服务器
远程服务器建库并恢复sql
server文件夹主要内容复制到服务器
修改settings.py中的Debug/ALLOWED_HOSTS
修改settings.py中的BASE_HOST_URL (https格式)
修改settings.py中的上传文件大小限制
修改settings.py中的smtp设置
修改settings.py中的数据库名称/用户名/密码
pip安装依赖
管理员权限运行: python manage.py runserver 0.0.0.0:port(指定端口)

### linux端启动命令：

sudo nohup python3 manage.py runserver 0.0.0.0:8000 >> django.log 2>&1 &

查看端口状态
netstat -pln | grep 8000

停止服务

用 ps aux | grep runserver 查出进程号，再执行 kill 进程号 即可。




### 常见问题

建库语句

CREATE DATABASE IF NOT EXISTS python_db DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;


接口请求频次限制


### 登录接口

调login -> 生成token

### 注意

update接口的时候，如果model里面存在多对多字段，则需要设置explode






