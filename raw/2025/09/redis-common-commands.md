# Redis 通用键命令详解

> 整理 Redis 键查询、删除、判断存在、设置过期时间和查看类型等通用操作命令。

## 通用命令

![image-20250902120345803](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250902120347660.png)

```bash
KEYS * # 获取所有键值
DEL aa # 删除aa这个键
EXISTS  aa # 判断aa这个键是否存在
EXPIRE aa 10 # 为aa设置十秒有效期
TTL aa # 查看aa的过期时间【秒】，永久有效返回-1，已过期或不存在返回-2
```
