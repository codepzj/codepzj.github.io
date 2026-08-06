# MySQL EXPLAIN 执行计划详解

> 介绍 MySQL EXPLAIN 执行计划中的关键字段，并说明如何利用执行计划分析和优化查询。

我们一般使用explain来评判sql查询语句的性能

通常，我们一般这样使用，如

```sql
explain select * from member where promoter_id=86;
```

![image-20250901232722256](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250901232724327.png)

就会得到这样的表格

评判性能指标主要看`type`和`filter`这两个参数

![image-20250901233107654](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250901233109370.png)

NULL：不访问表的情况，如`select A`

system: 访问系统表

const：主键和unique索引

ref: 普通index

index: 虽是index，但也全表扫描了

all：全表扫描

![image-20250901233451858](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250901233454151.png)

filter越接近100性能越好
