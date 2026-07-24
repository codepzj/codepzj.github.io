---
title: "MySQL 流程控制函数"
description: "介绍 MySQL IF、IFNULL、CASE WHEN 等流程控制函数，并通过示例说明适用场景。"
date: '2025-08-26'
updated: '2025-08-26'
categories:
- 数据库
tags:
- MySQL
- SQL函数
---

| 函数                                | 说明                                             | 示例                                                         | 结果                    |
| ----------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ | ----------------------- |
| IF(expr, v1, v2)                    | 条件判断，expr 为真返回 v1，否则返回 v2          | `SELECT IF(10>5, '大', '小');`                               | 大                      |
| IFNULL(expr1, expr2)                | 如果 expr1 为 NULL，则返回 expr2，否则返回 expr1 | `SELECT IFNULL(NULL, '默认');`                               | 默认                    |
| NULLIF(expr1, expr2)                | 如果 expr1=expr2，则返回 NULL，否则返回 expr1    | `SELECT NULLIF(5,5);`                                        | NULL                    |
| CASE WHEN ... THEN ... ELSE ... END | 多分支条件                                       | `SELECT CASE WHEN score>=90 THEN '优' WHEN score>=60 THEN '及格' ELSE '不及格' END;` | 根据 score 返回对应结果 |
