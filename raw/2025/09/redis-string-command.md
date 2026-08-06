# Redis String 常用命令

> 整理 Redis String 类型的设置、读取、批量操作、过期时间与数值增减等常用命令。

## String常用命令

![image-20250902121724037](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250902121726954.png)

常用命令：

```bash
set aa 1
get aa # 1
mset bb 2 cc 3
mget bb cc # 2 3
setnx bb 2 # 0【影响行数：0，代表key已经存在，不会重新设置key值去覆盖】
setex dd 10 100 # OK 【为dd键值设置值为100，过期时间为10秒】
```

## redis 中key的格式

![image-20250902123256273](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250902123301086.png)
