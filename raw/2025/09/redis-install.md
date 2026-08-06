# Redis 安装、启动与连接

> 介绍使用 Docker 安装 Redis、配置密码、启动服务并通过 redis-cli 连接实例的完整过程。

## redis安装

这里我为了方便，使用docker来安装redis

新建`docker-compose.yml`，写入：

```yaml
version: '3'

services:
  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "6379:6379"
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
    volumes:
      - ./data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    restart: always
```

执行docker-compose up -d，后台运行docker容器

## redis客户端连接命令

```bash
redis-cli -h 127.0.0.1 -p 6379 -a 123456
```

-h: ip

-p: 端口

-a: 密码

执行`ping`，查看redis服务端是否正常返回`pong`，若正常返回`pong`，则说明redis-server正常启动成功

## 图形化界面

[https://redis.tinycraft.cc/](https://redis.tinycraft.cc/)

![image-20250902133341464](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250902133343308.png)
