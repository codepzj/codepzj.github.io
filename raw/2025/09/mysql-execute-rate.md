# MySQL SQL 执行频次统计

> 介绍如何通过 MySQL 状态变量统计各类 SQL 的执行频次，用于观察数据库负载与操作分布。

在mysql数据库中，我们可以查看增删改查sql具体的执行次数并对其进行优化

```sql
show global status like 'Com_______'; # 7个_
```
