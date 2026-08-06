# MySQL 日期与时间函数

> 整理 MySQL 日期获取、格式化、时间计算和日期差值等常用函数及使用方法。

<table>
<thead>
  <tr>
    <th>
      函数
    </th>
    
    <th>
      说明
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
      NOW()
    </td>
    
    <td>
      当前日期时间
    </td>
    
    <td>
      <code code="SELECT NOW();">
        SELECT NOW();
      </code>
    </td>
    
    <td>
      2025-08-27 00:12:34
    </td>
  </tr>
  
  <tr>
    <td>
      CURDATE()
    </td>
    
    <td>
      当前日期
    </td>
    
    <td>
      <code code="SELECT CURDATE();">
        SELECT CURDATE();
      </code>
    </td>
    
    <td>
      2025-08-27
    </td>
  </tr>
  
  <tr>
    <td>
      CURTIME()
    </td>
    
    <td>
      当前时间
    </td>
    
    <td>
      <code code="SELECT CURTIME();">
        SELECT CURTIME();
      </code>
    </td>
    
    <td>
      00:12:34
    </td>
  </tr>
  
  <tr>
    <td>
      DATE(expr)
    </td>
    
    <td>
      提取日期部分
    </td>
    
    <td>
      <code code="SELECT DATE('2025-08-27 13:45:20');">
        SELECT DATE('2025-08-27 13:45:20');
      </code>
    </td>
    
    <td>
      2025-08-27
    </td>
  </tr>
  
  <tr>
    <td>
      TIME(expr)
    </td>
    
    <td>
      提取时间部分
    </td>
    
    <td>
      <code code="SELECT TIME('2025-08-27 13:45:20');">
        SELECT TIME('2025-08-27 13:45:20');
      </code>
    </td>
    
    <td>
      13:45:20
    </td>
  </tr>
  
  <tr>
    <td>
      YEAR(date)
    </td>
    
    <td>
      年份
    </td>
    
    <td>
      <code code="SELECT YEAR('2025-08-27');">
        SELECT YEAR('2025-08-27');
      </code>
    </td>
    
    <td>
      2025
    </td>
  </tr>
  
  <tr>
    <td>
      MONTH(date)
    </td>
    
    <td>
      月份 (1–12)
    </td>
    
    <td>
      <code code="SELECT MONTH('2025-08-27');">
        SELECT MONTH('2025-08-27');
      </code>
    </td>
    
    <td>
      8
    </td>
  </tr>
  
  <tr>
    <td>
      DAY(date) / DAYOFMONTH(date)
    </td>
    
    <td>
      月中的第几天
    </td>
    
    <td>
      <code code="SELECT DAY('2025-08-27');">
        SELECT DAY('2025-08-27');
      </code>
    </td>
    
    <td>
      27
    </td>
  </tr>
  
  <tr>
    <td>
      HOUR(time)
    </td>
    
    <td>
      小时
    </td>
    
    <td>
      <code code="SELECT HOUR('13:45:20');">
        SELECT HOUR('13:45:20');
      </code>
    </td>
    
    <td>
      13
    </td>
  </tr>
  
  <tr>
    <td>
      MINUTE(time)
    </td>
    
    <td>
      分钟
    </td>
    
    <td>
      <code code="SELECT MINUTE('13:45:20');">
        SELECT MINUTE('13:45:20');
      </code>
    </td>
    
    <td>
      45
    </td>
  </tr>
  
  <tr>
    <td>
      SECOND(time)
    </td>
    
    <td>
      秒
    </td>
    
    <td>
      <code code="SELECT SECOND('13:45:20');">
        SELECT SECOND('13:45:20');
      </code>
    </td>
    
    <td>
      20
    </td>
  </tr>
</tbody>
</table>
