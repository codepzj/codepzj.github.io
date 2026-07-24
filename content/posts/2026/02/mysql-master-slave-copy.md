---
title: "MySQL 主从复制搭建与配置"
description: "介绍 MySQL 主从复制原理，并使用 Docker Compose 完成主库、从库和复制账号的配置。"
date: '2026-02-27'
updated: '2026-02-27'
categories:
- 数据库
tags:
- mysql
draft: false
---

## MySql主从复制原理

### 什么是MySql的主从复制

主从复制,指的是在多个MySql实例下,从节点启动一个IO线程,主动向主节点去请求binlog,然后写入到slave log,启动一个Sql线程去重放执行主节点执行过的Sql语句去保证和主节点的一致性.

### 主从复制的原理图

![img](https://cdn.jsdelivr.net/gh/codepzj/images@main/20260226165030341.jpeg)

1. 从节点使用`CHANGE MASTER TO`去连接主库,同时连接的账号需要有`REPLICATION`的权限
2. 从节点启动一个**IO线程**,向主节点去请求获取二进制数据(binlog)
3. 主节点接受到请求,向从节点发送binlog
4. 从节点接受到请求之后,将binlog写入到slavelog(中继日志中)
5. 从节点启动Sql线程去读取relaylog,翻译成一条条Sql语句去重放,保证和主库数据一致

**需要注意的是:**

- master节点需要开启binlog以及binlog_format=ROW
- master和slave节点最好在一个网段下
- IO线程主要用于读取主库binlog投放到从库的slavelog,Sql线程主要用于翻译,去转换log为Sql语句去同步

### 主从复制的优点

1. 保证MySql的高可用性,假如数据库压力过大,导致主节点mysql宕机,从节点会补上成为主节点,防止单节点mysql崩了系统全面瘫痪
2. 提高数据库的读写性能,一般采用`一主多从`的策略,主库负责写操作,从库负责读操作,读写分离,如果有一条sql语句需要锁表,那么并不影响主数据库的写入

### MySQL 主从复制的形式

- 一主一从
- 主主复制
- 一主多从
- 多主一从
- 级联复制

### MySql主从复制时延

MySQL 的主从复制都是单线程的操作，主库对所有 DDL 和 DML 产生的日志写进 binlog，由于 binlog 是顺序写，所以效率很高，slave 的 SQL thread 线程将主库的 DDL 和 DML 操作事件在 slave 中重放。DML 和 DDL 的 IO 操作是随机的，不是顺序，所以成本要高很多，另一方面，由于 SQL thread 也是单线程的，当主库的并发较高时，产生的 DML 数量超过 slave 的 SQL thread 所能处理的速度，或者当 slave 中有大型 query 语句产生了锁等待，那么延时就产生了。

## Mysql主从复制安装配置

这里只介绍Docker的方式安装

### docker-compose.yaml

```yaml
version: "3.8"
services:
  mysql-master:
    container_name: mysql-master
    image: mysql:8.0.36
    environment:
      MYSQL_ROOT_PASSWORD: master
    volumes:
      - ./data/mysql-master-data:/var/lib/mysql
      - ./conf/master/my.cnf:/etc/mysql/my.cnf
    ports:
      - 3307:3306
    networks:
      - mysql_bridge
  mysql-slave-1:
    container_name: mysql-slave-1
    image: mysql:8.0.36
    environment:
      MYSQL_ROOT_PASSWORD: slave1
    volumes:
      - ./data/mysql-slave1-data:/var/lib/mysql
      - ./conf/slave1/my.cnf:/etc/mysql/my.cnf
    ports:
      - 3308:3306
    networks:
      - mysql_bridge
  mysql-slave-2:
    container_name: mysql-slave-2
    image: mysql:8.0.36
    environment:
      MYSQL_ROOT_PASSWORD: slave2
    volumes:
      - ./data/mysql-slave2-data:/var/lib/mysql
      - ./conf/slave2/my.cnf:/etc/mysql/my.cnf
    ports:
      - 3309:3306
    networks:
      - mysql_bridge

networks:
  mysql_bridge:
```

```bash
pzj@pzjmac mysql-cluster % tree -I data
.
├── conf
│   ├── master
│   │   └── my.cnf
│   ├── slave1
│   │   └── my.cnf
│   └── slave2
│       └── my.cnf
└── docker-compose.yaml
```

### 主从节点的my.cnf

`master/my.cnf`

```ini
[mysqld]
server-id=1 # mysql实例唯一标识
log-bin=mysql-bin # 开启binlog
binlog_format=ROW # ROW模式
gtid_mode=ON # 全局事务唯一ID
enforce_gtid_consistency=ON # 根据ID同步事务而不是文件commit滚动同步
log_slave_updates=ON # 接收主库日志
binlog_checksum=NONE # 日志校验
```

`slave/my.cnf`

```ini
[mysqld]
server-id=2 # mysql实例唯一标识
log-bin=mysql-bin # 开启binlog
relay-log=relay-bin # 主库binlog副本
binlog_format=ROW # ROW模式
gtid_mode=ON # 全局事务唯一ID
enforce_gtid_consistency=ON # 根据ID同步事务而不是文件commit滚动同步
log_slave_updates=ON # 接收主库日志
read_only=ON # 从库只进行写操作
binlog_checksum=NONE # 日志校验
```

参数详解:

- server-id: mysql唯一标识,多节点不能存在重复
- gtid_mode: 开启全局唯一事务
- enforce_gtid_consistency: 根据ID同步事务而不是binlog文件commit滚动同步(需要知道哪个binlog文件和offset,效率较低)
- read_only: 只读(一般从库开启)

### 从库连接主库

进入主库,先创建一个含有复制权限的账号

```sql
CREATE USER 'repl'@'%' IDENTIFIED BY 'repl';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
```

进入从库，指定主库

```sql
STOP SLAVE;
```

```sql
CHANGE MASTER TO
  MASTER_HOST='mysql-master',
  MASTER_PORT=3306, -- host使用应该是容器监听端口
  MASTER_USER='repl',
  MASTER_PASSWORD='repl',
  MASTER_AUTO_POSITION=1; -- 通过全局事务唯一ID进行同步, 不依赖binlog和偏移量
```

```sql
START SLAVE;
```
