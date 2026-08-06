# MySQL 常用字符串函数

> 整理 MySQL 字符串拼接、截取、替换、长度计算和大小写转换等常用函数。

<table>
<thead>
  <tr>
    <th>
      功能
    </th>
    
    <th>
      函数
    </th>
    
    <th>
      示例
    </th>
    
    <th>
      结果
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      字符串长度（字节数）
    </td>
    
    <td>
      <code code="LENGTH(str)">
        LENGTH(str)
      </code>
    </td>
    
    <td>
      <code code="LENGTH('Hello')">
        LENGTH('Hello')
      </code>
    </td>
    
    <td>
      5
    </td>
  </tr>
  
  <tr>
    <td>
      字符串长度（字符数）
    </td>
    
    <td>
      <code code="CHAR_LENGTH(str)">
        CHAR_LENGTH(str)
      </code>
    </td>
    
    <td>
      <code code="CHAR_LENGTH('你好')">
        CHAR_LENGTH('你好')
      </code>
    </td>
    
    <td>
      2
    </td>
  </tr>
  
  <tr>
    <td>
      转大写
    </td>
    
    <td>
      <code code="UPPER(str)">
        UPPER(str)
      </code>
    </td>
    
    <td>
      <code code="UPPER('hello')">
        UPPER('hello')
      </code>
    </td>
    
    <td>
      HELLO
    </td>
  </tr>
  
  <tr>
    <td>
      转小写
    </td>
    
    <td>
      <code code="LOWER(str)">
        LOWER(str)
      </code>
    </td>
    
    <td>
      <code code="LOWER('HELLO')">
        LOWER('HELLO')
      </code>
    </td>
    
    <td>
      hello
    </td>
  </tr>
  
  <tr>
    <td>
      拼接
    </td>
    
    <td>
      <code code="CONCAT(s1, s2, …)">
        CONCAT(s1, s2, …)
      </code>
    </td>
    
    <td>
      <code code="CONCAT('Hello',' ','World')">
        CONCAT('Hello',' ','World')
      </code>
    </td>
    
    <td>
      Hello World
    </td>
  </tr>
  
  <tr>
    <td>
      拼接（带分隔符）
    </td>
    
    <td>
      <code code="CONCAT_WS(sep, s1, s2, …)">
        CONCAT_WS(sep, s1, s2, …)
      </code>
    </td>
    
    <td>
      <code code="CONCAT_WS('-', '2025','08','25')">
        CONCAT_WS('-', '2025','08','25')
      </code>
    </td>
    
    <td>
      2025-08-25
    </td>
  </tr>
  
  <tr>
    <td>
      截取字符串
    </td>
    
    <td>
      <code code="SUBSTRING(str, pos, len)">
        SUBSTRING(str, pos, len)
      </code>
    </td>
    
    <td>
      <code code="SUBSTRING('Hello World', 7, 5)">
        SUBSTRING('Hello World', 7, 5)
      </code>
    </td>
    
    <td>
      World
    </td>
  </tr>
  
  <tr>
    <td>
      去除空格
    </td>
    
    <td>
      <code code="TRIM(str)">
        TRIM(str)
      </code>
    </td>
    
    <td>
      <code code="TRIM(' hi ')">
        TRIM(' hi ')
      </code>
    </td>
    
    <td>
      hi
    </td>
  </tr>
  
  <tr>
    <td>
      去左空格
    </td>
    
    <td>
      <code code="LTRIM(str)">
        LTRIM(str)
      </code>
    </td>
    
    <td>
      <code code="LTRIM(' hi')">
        LTRIM(' hi')
      </code>
    </td>
    
    <td>
      hi
    </td>
  </tr>
  
  <tr>
    <td>
      去右空格
    </td>
    
    <td>
      <code code="RTRIM(str)">
        RTRIM(str)
      </code>
    </td>
    
    <td>
      <code code="RTRIM('hi ')">
        RTRIM('hi ')
      </code>
    </td>
    
    <td>
      hi
    </td>
  </tr>
  
  <tr>
    <td>
      替换
    </td>
    
    <td>
      <code code="REPLACE(str, from, to)">
        REPLACE(str, from, to)
      </code>
    </td>
    
    <td>
      <code code="REPLACE('2025-08-25','-','/')">
        REPLACE('2025-08-25','-','/')
      </code>
    </td>
    
    <td>
      2025/08/25
    </td>
  </tr>
  
  <tr>
    <td>
      查找位置
    </td>
    
    <td>
      <code code="LOCATE(substr, str)">
        LOCATE(substr, str)
      </code>
    </td>
    
    <td>
      <code code="LOCATE('World','Hello World')">
        LOCATE('World','Hello World')
      </code>
    </td>
    
    <td>
      7
    </td>
  </tr>
  
  <tr>
    <td>
      查找位置
    </td>
    
    <td>
      <code code="INSTR(str, substr)">
        INSTR(str, substr)
      </code>
    </td>
    
    <td>
      <code code="INSTR('Hello World','World')">
        INSTR('Hello World','World')
      </code>
    </td>
    
    <td>
      7
    </td>
  </tr>
  
  <tr>
    <td>
      重复
    </td>
    
    <td>
      <code code="REPEAT(str, n)">
        REPEAT(str, n)
      </code>
    </td>
    
    <td>
      <code code="REPEAT('ab', 3)">
        REPEAT('ab', 3)
      </code>
    </td>
    
    <td>
      ababab
    </td>
  </tr>
  
  <tr>
    <td>
      左填充
    </td>
    
    <td>
      <code code="LPAD(str, len, pad)">
        LPAD(str, len, pad)
      </code>
    </td>
    
    <td>
      <code code="LPAD('7', 3, '0')">
        LPAD('7', 3, '0')
      </code>
    </td>
    
    <td>
      007
    </td>
  </tr>
  
  <tr>
    <td>
      右填充
    </td>
    
    <td>
      <code code="RPAD(str, len, pad)">
        RPAD(str, len, pad)
      </code>
    </td>
    
    <td>
      <code code="RPAD('7', 3, '0')">
        RPAD('7', 3, '0')
      </code>
    </td>
    
    <td>
      700
    </td>
  </tr>
  
  <tr>
    <td>
      反转
    </td>
    
    <td>
      <code code="REVERSE(str)">
        REVERSE(str)
      </code>
    </td>
    
    <td>
      <code code="REVERSE('hello')">
        REVERSE('hello')
      </code>
    </td>
    
    <td>
      olleh
    </td>
  </tr>
  
  <tr>
    <td>
      分隔符截取
    </td>
    
    <td>
      <code code="SUBSTRING_INDEX(str, delim, count)">
        SUBSTRING_INDEX(str, delim, count)
      </code>
    </td>
    
    <td>
      <code code="SUBSTRING_INDEX('a,b,c', ',', -1)">
        SUBSTRING_INDEX('a,b,c', ',', -1)
      </code>
    </td>
    
    <td>
      c
    </td>
  </tr>
</tbody>
</table>

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
