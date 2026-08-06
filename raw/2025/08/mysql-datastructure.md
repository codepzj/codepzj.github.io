# MySQL 常用数据类型详解

> 介绍 MySQL 常用整数、浮点数、字符串、日期时间等数据类型及字段设计注意事项。

MySQL 数据类型主要分为三类：**数值类型、字符串类型、日期和时间类型**。

## 数值类型

<table>
<thead>
  <tr>
    <th>
      类型
    </th>
    
    <th>
      说明
    </th>
    
    <th>
      示例
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code code="TINYINT">
        TINYINT
      </code>
    </td>
    
    <td>
      很小的整数，范围 -128<del>
        127 或 0
      </del>
      
      255 (UNSIGNED)
    </td>
    
    <td>
      <code code="TINYINT(3)">
        TINYINT(3)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="SMALLINT">
        SMALLINT
      </code>
    </td>
    
    <td>
      小整数，范围 -32,768~32,767
    </td>
    
    <td>
      <code code="SMALLINT(5)">
        SMALLINT(5)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="MEDIUMINT">
        MEDIUMINT
      </code>
    </td>
    
    <td>
      中等整数，范围 -8,388,608~8,388,607
    </td>
    
    <td>
      <code code="MEDIUMINT(8)">
        MEDIUMINT(8)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="INT">
        INT
      </code>
      
       / <code code="INTEGER">
        INTEGER
      </code>
    </td>
    
    <td>
      普通整数，范围 -2,147,483,648~2,147,483,647
    </td>
    
    <td>
      <code code="INT(11)">
        INT(11)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="BIGINT">
        BIGINT
      </code>
    </td>
    
    <td>
      大整数，范围 -2^63 ~ 2^63-1
    </td>
    
    <td>
      <code code="BIGINT(20)">
        BIGINT(20)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="DECIMAL(M,D)">
        DECIMAL(M,D)
      </code>
      
       / <code code="NUMERIC(M,D)">
        NUMERIC(M,D)
      </code>
    </td>
    
    <td>
      定点小数，精确存储，常用于金额
    </td>
    
    <td>
      <code code="DECIMAL(10,2)">
        DECIMAL(10,2)
      </code>
      
       → 99999999.99
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="FLOAT(M,D)">
        FLOAT(M,D)
      </code>
    </td>
    
    <td>
      单精度浮点数，近似存储
    </td>
    
    <td>
      <code code="FLOAT(7,4)">
        FLOAT(7,4)
      </code>
      
       → 999.9999
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="DOUBLE(M,D)">
        DOUBLE(M,D)
      </code>
      
       / <code code="REAL">
        REAL
      </code>
    </td>
    
    <td>
      双精度浮点数，近似存储
    </td>
    
    <td>
      <code code="DOUBLE(16,8)">
        DOUBLE(16,8)
      </code>
    </td>
  </tr>
</tbody>
</table>

## 字符串类型

<table>
<thead>
  <tr>
    <th>
      类型
    </th>
    
    <th>
      说明
    </th>
    
    <th>
      示例
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code code="CHAR(n)">
        CHAR(n)
      </code>
    </td>
    
    <td>
      固定长度字符串，最大 255
    </td>
    
    <td>
      <code code="CHAR(10)">
        CHAR(10)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="VARCHAR(n)">
        VARCHAR(n)
      </code>
    </td>
    
    <td>
      可变长度字符串，最大 65535（受行大小限制）
    </td>
    
    <td>
      <code code="VARCHAR(255)">
        VARCHAR(255)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="TINYTEXT">
        TINYTEXT
      </code>
    </td>
    
    <td>
      最多 255 字符
    </td>
    
    <td>
      适合存储短文本
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="TEXT">
        TEXT
      </code>
    </td>
    
    <td>
      最多 65,535 字符（64KB）
    </td>
    
    <td>
      博客正文
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="MEDIUMTEXT">
        MEDIUMTEXT
      </code>
    </td>
    
    <td>
      最多 16,777,215 字符（16MB）
    </td>
    
    <td>
      长文章
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="LONGTEXT">
        LONGTEXT
      </code>
    </td>
    
    <td>
      最多 4,294,967,295 字符（4GB）
    </td>
    
    <td>
      大规模内容（如书籍）
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="ENUM(val1,val2,…)">
        ENUM(val1,val2,…)
      </code>
    </td>
    
    <td>
      枚举类型，只能存其中一个值
    </td>
    
    <td>
      <code code="ENUM('male','female')">
        ENUM('male','female')
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="SET(val1,val2,…)">
        SET(val1,val2,…)
      </code>
    </td>
    
    <td>
      集合类型，可同时存多个选项
    </td>
    
    <td>
      <code code="SET('a','b','c')">
        SET('a','b','c')
      </code>
    </td>
  </tr>
</tbody>
</table>

## 日期和时间类型

<table>
<thead>
  <tr>
    <th>
      类型
    </th>
    
    <th>
      说明
    </th>
    
    <th>
      示例
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code code="DATE">
        DATE
      </code>
    </td>
    
    <td>
      日期（YYYY-MM-DD），范围 1000-01-01 ~ 9999-12-31
    </td>
    
    <td>
      <code code="'2025-08-25'">
        '2025-08-25'
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="DATETIME">
        DATETIME
      </code>
    </td>
    
    <td>
      日期时间（YYYY-MM-DD HH:MM:SS），不受时区影响
    </td>
    
    <td>
      <code code="'2025-08-25 14:30:00'">
        '2025-08-25 14:30:00'
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="TIMESTAMP">
        TIMESTAMP
      </code>
    </td>
    
    <td>
      时间戳（会随时区变化），范围 1970-01-01 ~ 2038-01-19
    </td>
    
    <td>
      <code code="'2025-08-25 14:30:00'">
        '2025-08-25 14:30:00'
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="TIME">
        TIME
      </code>
    </td>
    
    <td>
      时间（HH:MM:SS），范围 -838:59:59 ~ 838:59:59
    </td>
    
    <td>
      <code code="'12:30:00'">
        '12:30:00'
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code code="YEAR">
        YEAR
      </code>
    </td>
    
    <td>
      年份（YYYY），范围 1901~2155
    </td>
    
    <td>
      <code code="YEAR">
        YEAR
      </code>
    </td>
  </tr>
</tbody>
</table>

## 使用建议

- **整型主键 ID** → `INT` 或 `BIGINT`，配合 `AUTO_INCREMENT`
- **金额** → `DECIMAL(10,2)`，避免浮点误差
- **短文本（姓名、标题）** → `VARCHAR(50/255)`
- **长文本（正文内容）** → `TEXT` 或 `MEDIUMTEXT`
- **时间** → 业务数据建议 `DATETIME`，日志记录推荐 `TIMESTAMP`
