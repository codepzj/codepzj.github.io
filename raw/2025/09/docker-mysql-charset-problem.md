# docker部署mysql中文乱码问题

> 分析 Docker 部署 MySQL 后出现中文乱码的原因，并通过服务端与连接字符集配置解决问题。

![image](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250917234014825.png)

今天docker部署mysql，不知道什么原因中文乱码了，估计是字符集没有设置为`utf8`

原本的`docker-compose.yaml`配置为

```yaml
version: "3.9"

services:
  mysql:
    image: mysql:8.0
    container_name: askos-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: askos
      TZ: Asia/Shanghai
    ports:
      - "13306:3306"
    volumes:
      - ./data/mysql-data:/var/lib/mysql
      - ./scripts/mysql-init.sql:/docker-entrypoint-initdb.d/mysql-init.sql:ro
```

后面在网上找到相关记录，sql脚本需要指定一下字符集

```sql
/*!40101 SET NAMES utf8 */;
```

然后执行`docker-compose down && rm -rf data && docker-compose up -d`

navicat连接发现表的中文注释也乱码，后面搜了一下教程，发现`navicat`高级里面也可以设置字符集`utf8`

![image](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250918014100847.png)

设置完后表中的注释和中文字符都正常显示

参考文章：

[Navicat连接mysql数据库记录中文乱码的解决方法](https://zhuanlan.zhihu.com/p/74428428)
