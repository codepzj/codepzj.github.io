---
title: 千万级 Mysql 表结构变更实战
description: 利用 gh-ost 安全、实时地迁移数据，实现大表结构变更，无停机、无锁表。
date: '2026-03-10'
updated: '2026-05-06'
categories:
- 数据库
tags:
- mysql
draft: false
---

在生产环境中，对千万级数据表直接执行 `ALTER TABLE` 进行结构修改，往往会导致表被锁定，从而阻塞写入操作，可能造成数据不一致或业务停顿。为了安全、无感知地变更大表结构，`gh-ost` 提供了一种高效、零停机的解决方案。

它通过创建**镜像表**、**全量+增量同步数据**，最终使用**原子级别的表重命名切换**完成变更。整个过程可以随时暂停，对业务几乎无影响，非常适合 500 万条以上的大表操作。

## gh-ost

生产环境最常用, 适用于 500 万条数据以上

https://github.com/github/gh-ost

### 工作原理

1. 创建**镜像表**

```text
t_dir_gho
```

2. 同步原表数据(`t_dir`)

```text
copy data
```

3. `binlog` 增量同步

```text
实时同步变更
```

4. 最终 **原子切换**, 将 `t_dir` 重命名为 `t_dir_old`, 将 `t_dir_gho` 重命名为 `t_dir`

```text
rename table
```

优点：

- rename 表是原子操作
- **不停写,** 因为是镜像表的缘故,除了全量同步,同时通过 `binlog` 订阅原表对镜像表进行增量同步
- 可随时暂停
- 对业务无感



实际上在表切换的过程中,执行的以下 `Sql` 语句

```sql
RENAME TABLE t_dir TO t_dir_old,t_dir_new TO t_dir;
```

切换的时间`< 1ms`,在这 `1ms`中 `Rename`会锁表,假如说这一瞬间对原表(`t_dir`)进行写操作,那么会短暂停顿等待切换后的"`t_dir`"释放锁, 所以并不会造成数据丢失, 而且这`1ms`很短,对业务无感

## 常见使用示例

### 添加索引

```bash
gh-ost \
--host=127.0.0.1 \
--user=root \
--password=123456 \
--database=db \
--table=t_dir \
--alter="ADD INDEX idx_uid(uid)" \
--allow-on-master \
--execute
```

### 修改字段类型

例如：

```bash
INT → BIGINT
gh-ost \
--host=127.0.0.1 \
--user=root \
--password=123456 \
--database=db \
--table=t_dir \
--alter="MODIFY COLUMN uid BIGINT" \
--allow-on-master \
--execute
```



### 添加字段

```bash
gh-ost \
--host=127.0.0.1 \
--user=root \
--password=123456 \
--database=db \
--table=t_dir \
--alter="ADD COLUMN status INT NOT NULL DEFAULT 0" \
--allow-on-master \
--execute
```

### 删除字段

```bash
gh-ost \
--host=127.0.0.1 \
--user=root \
--password=123456 \
--database=db \
--table=t_dir \
--alter="DROP COLUMN temp_field" \
--allow-on-master \
--execute
```

### 重命名字段

```bash
gh-ost \
--host=127.0.0.1 \
--user=root \
--password=123456 \
--database=db \
--table=t_dir \
--alter="CHANGE old_name new_name VARCHAR(255)" \
--allow-on-master \
--execute
```

### 添加 NOT NULL 字段

```bash
gh-ost \
--host=127.0.0.1 \
--user=root \
--password=123456 \
--database=db \
--table=t_dir \
--alter="ADD COLUMN status INT NOT NULL DEFAULT 0" \
--allow-on-master \
--execute
```

### 常用参数说明

| 参数                           | 说明                  | 示例                     |
| ------------------------------ | --------------------- | ------------------------ |
| `--host`                       | MySQL 地址            | `127.0.0.1`              |
| `--port`                       | MySQL 端口            | `3306`                   |
| `--user`                       | 数据库用户名          | `root`                   |
| `--password`                   | 数据库密码            | `123456`                 |
| `--database`                   | 目标数据库            | `db`                     |
| `--table`                      | 目标表                | `t_dir`                  |
| `--alter`                      | 要执行的 DDL          | `ADD COLUMN size BIGINT` |
| `--execute`                    | 真正执行变更          | 不加则为 dry-run         |
| `--allow-on-master`            | 允许在主库执行        | 常用                     |
| `--chunk-size`                 | 每批迁移行数          | `1000`                   |
| `--max-load`                   | 负载阈值              | `Threads_running=20`     |
| `--critical-load`              | 临界负载              | `Threads_running=100`    |
| `--cut-over`                   | 切换策略              | `default`                |
| `--initially-drop-ghost-table` | 若存在 ghost 表先删除 | 安全                     |
| `--initially-drop-old-table`   | 若存在 old 表先删除   | 安全                     |
| `--exact-rowcount`             | 精确统计行数          | 避免误差                 |
| `--verbose`                    | 输出详细日志          | 调试用                   |
