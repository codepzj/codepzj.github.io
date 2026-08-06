# MySQL 常用数值函数

> 整理 MySQL 中取整、绝对值、随机数、幂运算等常用数值函数及其使用示例。

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
      ABS(x)
    </td>
    
    <td>
      绝对值
    </td>
    
    <td>
      <code code="SELECT ABS(-5);">
        SELECT ABS(-5);
      </code>
    </td>
    
    <td>
      5
    </td>
  </tr>
  
  <tr>
    <td>
      CEIL(x) / CEILING(x)
    </td>
    
    <td>
      向上取整
    </td>
    
    <td>
      <code code="SELECT CEIL(4.2);">
        SELECT CEIL(4.2);
      </code>
    </td>
    
    <td>
      5
    </td>
  </tr>
  
  <tr>
    <td>
      FLOOR(x)
    </td>
    
    <td>
      向下取整
    </td>
    
    <td>
      <code code="SELECT FLOOR(4.8);">
        SELECT FLOOR(4.8);
      </code>
    </td>
    
    <td>
      4
    </td>
  </tr>
  
  <tr>
    <td>
      ROUND(x, d)
    </td>
    
    <td>
      四舍五入到 d 位小数
    </td>
    
    <td>
      <code code="SELECT ROUND(4.567, 2);">
        SELECT ROUND(4.567, 2);
      </code>
    </td>
    
    <td>
      4.57
    </td>
  </tr>
  
  <tr>
    <td>
      TRUNCATE(x, d)
    </td>
    
    <td>
      截断到 d 位小数
    </td>
    
    <td>
      <code code="SELECT TRUNCATE(4.567, 2);">
        SELECT TRUNCATE(4.567, 2);
      </code>
    </td>
    
    <td>
      4.56
    </td>
  </tr>
  
  <tr>
    <td>
      MOD(x, y)
    </td>
    
    <td>
      取余数
    </td>
    
    <td>
      <code code="SELECT MOD(10, 3);">
        SELECT MOD(10, 3);
      </code>
    </td>
    
    <td>
      1
    </td>
  </tr>
  
  <tr>
    <td>
      POW(x, y) / POWER(x, y)
    </td>
    
    <td>
      幂运算
    </td>
    
    <td>
      <code code="SELECT POW(2, 3);">
        SELECT POW(2, 3);
      </code>
    </td>
    
    <td>
      8
    </td>
  </tr>
  
  <tr>
    <td>
      SQRT(x)
    </td>
    
    <td>
      平方根
    </td>
    
    <td>
      <code code="SELECT SQRT(16);">
        SELECT SQRT(16);
      </code>
    </td>
    
    <td>
      4
    </td>
  </tr>
  
  <tr>
    <td>
      RAND()
    </td>
    
    <td>
      随机数 (0~1)
    </td>
    
    <td>
      <code code="SELECT RAND();">
        SELECT RAND();
      </code>
    </td>
    
    <td>
      0.xxx
    </td>
  </tr>
  
  <tr>
    <td>
      GREATEST(a, b, …)
    </td>
    
    <td>
      最大值
    </td>
    
    <td>
      <code code="SELECT GREATEST(3, 7, 5);">
        SELECT GREATEST(3, 7, 5);
      </code>
    </td>
    
    <td>
      7
    </td>
  </tr>
  
  <tr>
    <td>
      LEAST(a, b, …)
    </td>
    
    <td>
      最小值
    </td>
    
    <td>
      <code code="SELECT LEAST(3, 7, 5);">
        SELECT LEAST(3, 7, 5);
      </code>
    </td>
    
    <td>
      3
    </td>
  </tr>
</tbody>
</table>
