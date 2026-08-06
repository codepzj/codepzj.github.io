# MySQL 事务隔离级别详解

> 介绍 MySQL 四种事务隔离级别、并发读写问题以及不同隔离级别之间的行为差异。

## 并发事务出现的三种问题

1. **脏读（Dirty Read）**：事务A读取了事务B还未提交的数据，如果B回滚了，A读取的数据就是无效的。
2. **不可重复读（Non-Repeatable Read）**：事务A在同一个事务中两次读取同一行数据，结果不一致，这是因为事务B在中间修改并提交了这行数据。
3. **幻读（Phantom Read）**：事务A在同一个事务中两次执行相同条件的查询，发现结果集不一致。原因是事务B在中间插入或删除了符合条件的新数据。

## 事务的隔离级别

![image-20250828145920828](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250828145923410.png)

```sql
-- 设置当前会话的隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 或设置全局默认隔离级别（需重启或重新连接生效）
SET GLOBAL TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

具体操作可看B站视频

- 【黑马程序员 MySQL数据库入门到精通，从mysql安装到mysql高级、mysql优化全囊括】[https://www.bilibili.com/video/BV1Kr4y1i7ru?p=55&vd_source=717e5631051a8339c2eea7fb70959d5b](https://www.bilibili.com/video/BV1Kr4y1i7ru?p=55&vd_source=717e5631051a8339c2eea7fb70959d5b)
