---
title: "MySQL 日期与时间函数"
description: "整理 MySQL 日期获取、格式化、时间计算和日期差值等常用函数及使用方法。"
date: '2025-08-26'
updated: '2025-08-26'
categories:
- 数据库
tags:
- MySQL
- SQL函数
---

| 函数                         | 说明         | 示例                                  | 结果                |
| ---------------------------- | ------------ | ------------------------------------- | ------------------- |
| NOW()                        | 当前日期时间 | `SELECT NOW();`                       | 2025-08-27 00:12:34 |
| CURDATE()                    | 当前日期     | `SELECT CURDATE();`                   | 2025-08-27          |
| CURTIME()                    | 当前时间     | `SELECT CURTIME();`                   | 00:12:34            |
| DATE(expr)                   | 提取日期部分 | `SELECT DATE('2025-08-27 13:45:20');` | 2025-08-27          |
| TIME(expr)                   | 提取时间部分 | `SELECT TIME('2025-08-27 13:45:20');` | 13:45:20            |
| YEAR(date)                   | 年份         | `SELECT YEAR('2025-08-27');`          | 2025                |
| MONTH(date)                  | 月份 (1–12)  | `SELECT MONTH('2025-08-27');`         | 8                   |
| DAY(date) / DAYOFMONTH(date) | 月中的第几天 | `SELECT DAY('2025-08-27');`           | 27                  |
| HOUR(time)                   | 小时         | `SELECT HOUR('13:45:20');`            | 13                  |
| MINUTE(time)                 | 分钟         | `SELECT MINUTE('13:45:20');`          | 45                  |
| SECOND(time)                 | 秒           | `SELECT SECOND('13:45:20');`          | 20                  |
