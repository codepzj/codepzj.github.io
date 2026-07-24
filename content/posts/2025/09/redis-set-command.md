---
title: "Redis Set 常用命令"
description: "整理 Redis Set 集合的元素增删、成员查询、集合遍历以及交并差集等常用命令。"
date: '2025-09-10'
updated: '2025-09-11'
categories:
- 数据库
tags:
- Redis
- 数据结构
---

## set 常用命令

set代表集合，该数据结构不能出现重复的元素

![image-20250911144704105](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250911144706079.png)

常用命令

```bash
SADD myset 1 2 3  // 往集合插入3个值

SMEMBERS myset // 查看集合的所有元素

SISMEMBER myset 1 // 查看1是否为该集合中的元素

SCARD myset // 返回集合当中元素的个数

SREM myset 1 // 删除集合中的特定元素

SADD  s1 1 2 3
SADD s2 1 2 4

SINTER s1 s2 // 1, 2
SDIFF s1 s2 // 3
SUNION s1 s2 // 1, 2, 3, 4
```
