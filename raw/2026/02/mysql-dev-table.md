# MySQL 表结构常用操作

> 整理 MySQL 开发中常用的表结构操作，包括字段新增、修改、删除以及表结构维护相关 SQL。

## 删除某一列

```sql
ALTER TABLE video_comments DROP COLUMN updated_at;
```
