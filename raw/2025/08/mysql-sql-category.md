# SQL 语句分类：DDL、DML、DQL 与 DCL

> 介绍 DDL、DML、DQL、DCL 和 TCL 等 SQL 语句分类，并列举常见操作示例。

![img](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250827004852371.png)SQL（Structured Query Language，结构化查询语言）主要用来操作关系型数据库（如 MySQL、PostgreSQL、Oracle、SQL Server 等)。语法分为几大类：

## DDL

用于定义和管理数据库对象（数据库、表、视图、索引等）。
常见语法：

```sql
-- 创建数据库
CREATE DATABASE db_name;

-- 删除数据库
DROP DATABASE db_name;

-- 使用数据库
USE db_name;

-- 创建表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 修改表
ALTER TABLE users ADD COLUMN email VARCHAR(100);

-- 删除表
DROP TABLE users;
```

## DML

用于增删改查表中的数据。

```sql
-- 插入数据
INSERT INTO users (name, age, email) VALUES ('Tom', 20, 'tom@test.com');

-- 查询数据
SELECT id, name, age FROM users WHERE age > 18 ORDER BY age DESC;

-- 更新数据
UPDATE users SET age = 25 WHERE id = 1;

-- 删除数据
DELETE FROM users WHERE id = 1;
```

## DQL

DQL 通常指 **SELECT 语句**，主要用于查询数据。

```sql
-- 基本查询
SELECT * FROM users;

-- 条件查询
SELECT name, age FROM users WHERE age BETWEEN 18 AND 30;

-- 聚合函数
SELECT COUNT(*) AS total_users, AVG(age) AS avg_age FROM users;

-- 分组
SELECT age, COUNT(*) FROM users GROUP BY age;

-- 多表连接
SELECT u.name, o.order_no
FROM users u
JOIN orders o ON u.id = o.user_id;

-- 子查询
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);
```

## DCL

用于权限管理。

```sql
-- 授权
GRANT SELECT, INSERT ON db_name.* TO 'user'@'localhost' IDENTIFIED BY 'password';

-- 回收权限
REVOKE INSERT ON db_name.* FROM 'user'@'localhost';
```

## TCL

用于事务管理。

```sql
-- 开启事务
START TRANSACTION;

-- 更新数据
UPDATE users SET age = 30 WHERE id = 2;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;
```
