---
title: "MySQL 常用数值函数"
description: "整理 MySQL 中取整、绝对值、随机数、幂运算等常用数值函数及其使用示例。"
date: '2025-08-26'
updated: '2025-08-26'
categories:
- 数据库
tags:
- MySQL
- SQL函数
---

| 函数                    | 说明                | 示例                         | 结果  |
| ----------------------- | ------------------- | ---------------------------- | ----- |
| ABS(x)                  | 绝对值              | `SELECT ABS(-5);`            | 5     |
| CEIL(x) / CEILING(x)    | 向上取整            | `SELECT CEIL(4.2);`          | 5     |
| FLOOR(x)                | 向下取整            | `SELECT FLOOR(4.8);`         | 4     |
| ROUND(x, d)             | 四舍五入到 d 位小数 | `SELECT ROUND(4.567, 2);`    | 4.57  |
| TRUNCATE(x, d)          | 截断到 d 位小数     | `SELECT TRUNCATE(4.567, 2);` | 4.56  |
| MOD(x, y)               | 取余数              | `SELECT MOD(10, 3);`         | 1     |
| POW(x, y) / POWER(x, y) | 幂运算              | `SELECT POW(2, 3);`          | 8     |
| SQRT(x)                 | 平方根              | `SELECT SQRT(16);`           | 4     |
| RAND()                  | 随机数 (0~1)        | `SELECT RAND();`             | 0.xxx |
| GREATEST(a, b, …)       | 最大值              | `SELECT GREATEST(3, 7, 5);`  | 7     |
| LEAST(a, b, …)          | 最小值              | `SELECT LEAST(3, 7, 5);`     | 3     |
