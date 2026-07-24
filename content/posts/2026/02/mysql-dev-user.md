---
title: "MySQL 用户与权限管理"
description: "整理 MySQL 用户创建、授权、权限查看、权限刷新和用户删除等常用管理操作。"
date: '2026-02-18'
updated: '2026-02-18'
categories:
- 数据库
tags:
- MySQL
- SQL
---

在 MySQL 中创建用户并授权，标准流程分为三步：**创建用户 → 授权 → 刷新权限**。

## 一、创建用户

### 允许任意 IP 访问

```sql
CREATE USER 'username'@'%' IDENTIFIED BY 'password';
```

### 只允许本机访问

```sql
CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
```

### 指定某个 IP

```sql
CREATE USER 'username'@'192.168.1.100' IDENTIFIED BY 'password';
```

> `%` 表示任意主机
> `localhost` 表示仅本机



## 二、授予权限

### 授予某个数据库全部权限

```sql
GRANT ALL PRIVILEGES ON db_name.* TO 'username'@'%';
```

### 只授予常用权限

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON db_name.* TO 'username'@'%';
```

### 授予所有数据库权限(慎用)

```sql
GRANT ALL PRIVILEGES ON *.* TO 'username'@'%' WITH GRANT OPTION;
```

`WITH GRANT OPTION` 表示该用户可以再给别人授权。



## 三、刷新权限

MySQL 8.0 一般不需要手动刷新，但可以执行：

```sql
FLUSH PRIVILEGES;
```



## 四、查看权限

```sql
SHOW GRANTS FOR 'username'@'%';
```



## 五、删除用户

```sql
DROP USER 'username'@'%';
```



## 六、生产环境建议

- 不要使用 root 账号对外提供服务
- 不要轻易使用 `*.*`
- 一个服务一个数据库用户
- 最小权限原则
- 生产库不要开`%`
