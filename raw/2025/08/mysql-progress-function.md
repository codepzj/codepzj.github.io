# MySQL 流程控制函数

> 介绍 MySQL IF、IFNULL、CASE WHEN 等流程控制函数，并通过示例说明适用场景。

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
      IF(expr, v1, v2)
    </td>
    
    <td>
      条件判断，expr 为真返回 v1，否则返回 v2
    </td>
    
    <td>
      <code code="SELECT IF(10>5, '大', '小');">
        SELECT IF(10>5, '大', '小');
      </code>
    </td>
    
    <td>
      大
    </td>
  </tr>
  
  <tr>
    <td>
      IFNULL(expr1, expr2)
    </td>
    
    <td>
      如果 expr1 为 NULL，则返回 expr2，否则返回 expr1
    </td>
    
    <td>
      <code code="SELECT IFNULL(NULL, '默认');">
        SELECT IFNULL(NULL, '默认');
      </code>
    </td>
    
    <td>
      默认
    </td>
  </tr>
  
  <tr>
    <td>
      NULLIF(expr1, expr2)
    </td>
    
    <td>
      如果 expr1=expr2，则返回 NULL，否则返回 expr1
    </td>
    
    <td>
      <code code="SELECT NULLIF(5,5);">
        SELECT NULLIF(5,5);
      </code>
    </td>
    
    <td>
      NULL
    </td>
  </tr>
  
  <tr>
    <td>
      CASE WHEN ... THEN ... ELSE ... END
    </td>
    
    <td>
      多分支条件
    </td>
    
    <td>
      <code code="SELECT CASE WHEN score>=90 THEN '优' WHEN score>=60 THEN '及格' ELSE '不及格' END;">
        SELECT CASE WHEN score>=90 THEN '优' WHEN score>=60 THEN '及格' ELSE '不及格' END;
      </code>
    </td>
    
    <td>
      根据 score 返回对应结果
    </td>
  </tr>
</tbody>
</table>
