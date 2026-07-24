---
title: "MySQL 查询性能分析方法"
description: "介绍 MySQL Profiling 等性能分析方法，帮助定位 SQL 执行耗时与查询过程中的性能瓶颈。"
date: '2025-09-01'
updated: '2025-09-01'
categories:
- 数据库
tags:
- MySQL
- 性能优化
---

查看数据库是否开启性能分析的开关

```sql
select @@have_profiling;
```



查看sql语句具体性能

```sql
# 查看sql语句的耗时
show profiles;

show profile for query query_id;

show profile cpu for query query_id;
```

![image-20250901225635397](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250901225724857.png)
