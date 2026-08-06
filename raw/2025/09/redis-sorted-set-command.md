# Redis Sorted Set 常用命令

> 整理 Redis Sorted Set 的成员写入、分数排序、区间查询和排名统计等常用命令。

## sorted-set常用命令

相对于`set`，sorted_set还维护一个`score`字段，在字段不重复的基础上，按照分数从低到高进行排序

![image-20250911145700057](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250911145701535.png)

常用命令

![image-20250911145812497](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250911145814185.png)

```bash
ZADD msset 100 chinese 150 math 145 english // 前面是分数后面是键

ZRANGE msset 0 2 [WITHSCORES] // 查看有序集合中前三个元素，如果填写WITHSCORES则会带上分数

ZSCORE msset chinese // 查看语文的分数

ZRANK msset math // 查看数学的排名 

ZREVRANK msset math // 查看数学排名【从大到小】

ZREM msset chinese // 删除语文这门学科
```
