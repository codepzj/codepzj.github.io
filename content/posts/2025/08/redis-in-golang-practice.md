---
title: "Go 项目中的 Redis 缓存实践"
description: 这篇文章记录了我在学习极客时间大明老师课程后，对 Redis 在 Go 项目中的实践总结。从初始化 Redis 客户端，到在仓储层引入缓存模块，再到结合
  DDD 思想实现数据查询与缓存的解耦，逐步形成了更优雅的使用方式。
date: '2025-08-31'
updated: '2025-08-31'
categories:
- 数据库
tags:
- redis
- ddd
draft: false
---

最近在看极客时间大明老师的极客训练营，初步了解了一下redis在golang中的使用



对于ddd架构来说，我们常用redis来缓存一些常用的sql查询，在缓解数据库压力的同时，能够提升效率和保护系统



在大明老师的课中，我改变了原有使用redis的观念，如今能写出相对之前更优雅的代码



## 初始化redis

```go
func NewRedis() *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
	})

	// 校验redis连通性
	if _, err := client.Ping(context.Background()).Result(); err != nil {
		slog.Error("连接Redis失败", "error", err)
		panic(err.Error())
	}
	return client
}
```

我们一般在基础设施层【infra】去初始化redis示例



## 注入repo层

目录结构

```bash
root@pzj:/code/program/AskOS/askos-server/internal/sys_user/internal/repository#  tree
.
├── cache
│   └── sys_user.go
├── dao
│   └── sys_user.go
└── sys_user.go
```



然后redis一般在仓储层【repo】当中注入

```go
func NewSysUserRepository(dao dao.ISysUserDao, cache *cache.SysUserCache) *SysUserRepository {
	return &SysUserRepository{dao: dao, cache: cache}
}

type SysUserRepository struct {
	dao   dao.ISysUserDao
	cache *cache.SysUserCache
}
```



cache模块放在与`dao`同级的目录下，用来缓存数据



cache模块主要编写redis相关的缓存代码:

1. `Key()`: 获取redis对应的key值，简化代码
2. `Get`: 获取缓存数据
3. `Set`: 写入缓存数据



具体如下：

```go
package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/codepzj/askos-server/internal/sys_user/internal/domain"
	"github.com/redis/go-redis/v9"
)

var (
	ErrUserNotFound  = redis.Nil
	SysUserCacheTime = 10 * time.Minute
)

type SysUserCache struct {
	client   *redis.Client
	duration time.Duration
}

func NewSysUserCache(client *redis.Client) *SysUserCache {
	return &SysUserCache{
		client:   client,
		duration: SysUserCacheTime,
	}
}

func (cache *SysUserCache) Key(id uint) string {
	return fmt.Sprintf("user:info:%d", id)
}

// 获得redis缓存中的数据，不考虑业务逻辑
// 只看redis中是否真的有数据，没有则返回错误
func (cache *SysUserCache) Get(id uint) (*domain.SysUserInfo, error) {
	val, err := cache.client.Get(context.Background(), cache.Key(id)).Result()
	var user domain.SysUserInfo
	// 未命中缓存
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal([]byte(val), &user)
	return &user, err
}

// 设置缓存
func (cache *SysUserCache) Set(u *domain.SysUserInfo) error {
	val, err := json.Marshal(u)
	if err != nil {
		return err
	}
	return cache.client.Set(context.Background(), cache.Key(u.ID), val, cache.duration).Err()
}
```



**大明老师在视频里面说，公司一般在`repo`或者`service`层去使用redis，实际上最佳实践是在repo层去引入redis来做缓存，原因是service其实关心的是业务逻辑，不关心拿数据具体是从redis还是从数据库拿的，所以应该把redis操作放在仓储层去实现数据的持久化**



## repo中使用redis

```go
func (r *SysUserRepository) GetByID(id uint) (*domain.SysUserInfo, error) {
	user, err := r.cache.Get(id)
	if err == nil {
		return user, nil
	}

	// 未命中缓存
	if errors.Is(err, cache.ErrUserNotFound) {
		u, err := r.dao.GetByID(id)
		if err != nil {
			return nil, err
		}

		user := &domain.SysUserInfo{
			ID:        u.ID,
			CreatedAt: u.CreatedAt.Format("2006-01-02 15:04:05"),
			UpdatedAt: u.UpdatedAt.Format("2006-01-02 15:04:05"),
			Username:  u.Username,
			Phone:     u.Phone,
			Avatar:    u.Avatar,
			Sex:       *u.Sex,
			Email:     u.Email,
			RoleId:    u.RoleId,
		}
		// 监控缓存
		if err = r.cache.Set(user); err != nil {
			slog.Error("缓存用户信息失败", "err", err.Error())
		}
		return user, nil
	}
	// redis异常【宕机，击穿】
	/* TODO: 进阶
	可考虑限流，使用本地memcache进行降级操作
	防止数据库被打穿
	*/
	return nil, err
}
```



来看这段代码，如果命中缓存则直接返回，不命中缓存，则回表查询，写入redis；

**异常兜底：** 如果redis发生异常，如宕机，雪崩等情况，可以考虑限流，并使用memcache去进行本地缓存，这叫做降级操作



## 收获

虽然萌新初入门redis，但是看了大明老师的视频还是非常有收获的，懂得如何在go项目中优雅的去使用redis，操作redis。
