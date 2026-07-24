---
title: "MySQL 常用字符串函数"
description: "整理 MySQL 字符串拼接、截取、替换、长度计算和大小写转换等常用函数。"
date: '2025-08-26'
updated: '2025-08-26'
categories:
- 数据库
tags:
- MySQL
- SQL函数
---

| 功能                 | 函数                                 | 示例                                | 结果        |
| -------------------- | ------------------------------------ | ----------------------------------- | ----------- |
| 字符串长度（字节数） | `LENGTH(str)`                        | `LENGTH('Hello')`                   | 5           |
| 字符串长度（字符数） | `CHAR_LENGTH(str)`                   | `CHAR_LENGTH('你好')`               | 2           |
| 转大写               | `UPPER(str)`                         | `UPPER('hello')`                    | HELLO       |
| 转小写               | `LOWER(str)`                         | `LOWER('HELLO')`                    | hello       |
| 拼接                 | `CONCAT(s1, s2, …)`                  | `CONCAT('Hello',' ','World')`       | Hello World |
| 拼接（带分隔符）     | `CONCAT_WS(sep, s1, s2, …)`          | `CONCAT_WS('-', '2025','08','25')`  | 2025-08-25  |
| 截取字符串           | `SUBSTRING(str, pos, len)`           | `SUBSTRING('Hello World', 7, 5)`    | World       |
| 去除空格             | `TRIM(str)`                          | `TRIM(' hi ')`                      | hi          |
| 去左空格             | `LTRIM(str)`                         | `LTRIM(' hi')`                      | hi          |
| 去右空格             | `RTRIM(str)`                         | `RTRIM('hi ')`                      | hi          |
| 替换                 | `REPLACE(str, from, to)`             | `REPLACE('2025-08-25','-','/')`     | 2025/08/25  |
| 查找位置             | `LOCATE(substr, str)`                | `LOCATE('World','Hello World')`     | 7           |
| 查找位置             | `INSTR(str, substr)`                 | `INSTR('Hello World','World')`      | 7           |
| 重复                 | `REPEAT(str, n)`                     | `REPEAT('ab', 3)`                   | ababab      |
| 左填充               | `LPAD(str, len, pad)`                | `LPAD('7', 3, '0')`                 | 007         |
| 右填充               | `RPAD(str, len, pad)`                | `RPAD('7', 3, '0')`                 | 700         |
| 反转                 | `REVERSE(str)`                       | `REVERSE('hello')`                  | olleh       |
| 分隔符截取           | `SUBSTRING_INDEX(str, delim, count)` | `SUBSTRING_INDEX('a,b,c', ',', -1)` | c           |

  SQL 里的字符串函数非常常用，不同数据库有些差异（MySQL、PostgreSQL、SQL Server、Oracle 等语法略有不同），我先给你列常见的 MySQL 语法，绝大多数数据库都支持类似写法。

## 常用字符串函数

```sql
-- 获取字符串长度
LENGTH('Hello');         -- 结果: 5 (字节数)
CHAR_LENGTH('Hello');    -- 结果: 5 (字符数)

-- 大小写转换
UPPER('hello');          -- 结果: HELLO
LOWER('HELLO');          -- 结果: hello

-- 拼接字符串
CONCAT('Hello', ' ', 'World');       -- 结果: Hello World
CONCAT_WS('-', '2025', '08', '25');  -- 结果: 2025-08-25

-- 截取字符串
SUBSTRING('Hello World', 1, 5);      -- 结果: Hello
SUBSTRING('Hello World', 7);         -- 结果: World

-- 去除空格
TRIM('   hello   ');    -- 结果: hello
LTRIM('   hello');      -- 结果: hello
RTRIM('hello   ');      -- 结果: hello

-- 替换字符串
REPLACE('2025-08-25', '-', '/');     -- 结果: 2025/08/25

-- 查找位置
LOCATE('World', 'Hello World');      -- 结果: 7
INSTR('Hello World', 'World');       -- 结果: 7

-- 重复字符串
REPEAT('abc', 3);       -- 结果: abcabcabc

-- 左右填充
LPAD('7', 3, '0');      -- 结果: 007
RPAD('7', 3, '0');      -- 结果: 700

-- 反转字符串
REVERSE('hello');       -- 结果: olleh

-- 提取指定分隔符字段
SUBSTRING_INDEX('a,b,c', ',', 1);   -- 结果: a
SUBSTRING_INDEX('a,b,c', ',', -1);  -- 结果: c
```

## 实用示例

```sql
-- 手机号脱敏
SELECT CONCAT(LEFT('13812345678', 3), '****', RIGHT('13812345678', 4));
-- 结果: 138****5678

-- 统计邮箱后缀
SELECT SUBSTRING_INDEX(email, '@', -1) AS domain, COUNT(*) 
FROM users 
GROUP BY domain;
```
