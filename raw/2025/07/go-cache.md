# Go Cache 单机缓存使用与原理

> go-cache 是一个 golang 的缓存库, 用于缓存 k, v 对, 缓存时间过期后存储的值会失效, 底层是一个 map, 过期后内部 Item 是不会自动清除, 需要手动调用DeleteExpired方法清除过期项

> go-cache 是一个 golang 的缓存库, 用于缓存 k, v 对, 缓存时间过期后存储的值会失效, 底层是一个 map, 过期后内部 Item 是不会自动清除, 需要手动调用`DeleteExpired`方法清除过期项

## 安装

```bash
go get github.com/patrickmn/go-cache
```

## 使用方法

```go
// 创建Cache对象, 第一个参数为缓存时间, 第二个参数为清理缓存项的时间间隔
// 底层是一个map, 过期后内部Item是不会自动清除
c := cache.New(30*time.Second, 1*time.Minute)

// 设置k, v对
c.Set("name", "codepzj", cache.DefaultExpiration)

// 获得k, v对, found 为false则代表过期
val, found := c.Get("name")
```

## 其他参数

<table>
<thead>
  <tr>
    <th align="left">
      方法名
    </th>
    
    <th align="left">
      类型
    </th>
    
    <th align="left">
      说明
    </th>
    
    <th align="left">
      示例
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td align="left">
      <code code="GetWithExpiration(key)">
        GetWithExpiration(key)
      </code>
    </td>
    
    <td align="left">
      方法
    </td>
    
    <td align="left">
      获取值和过期时间
    </td>
    
    <td align="left">
      <code code="val, exp, found := c.GetWithExpiration("k")">
        val, exp, found := c.GetWithExpiration("k")
      </code>
    </td>
  </tr>
  
  <tr>
    <td align="left">
      <code code="Add(key, value, duration)">
        Add(key, value, duration)
      </code>
    </td>
    
    <td align="left">
      方法
    </td>
    
    <td align="left">
      添加新项，若存在返回错误
    </td>
    
    <td align="left">
      <code code="err := c.Add("k", "v", 1*time.Hour)">
        err := c.Add("k", "v", 1*time.Hour)
      </code>
    </td>
  </tr>
  
  <tr>
    <td align="left">
      <code code="Replace(key, value, duration)">
        Replace(key, value, duration)
      </code>
    </td>
    
    <td align="left">
      方法
    </td>
    
    <td align="left">
      替换已存在项，否则报错
    </td>
    
    <td align="left">
      <code code="err := c.Replace("k", "new", 2*time.Minute)">
        err := c.Replace("k", "new", 2*time.Minute)
      </code>
    </td>
  </tr>
  
  <tr>
    <td align="left">
      <code code="Delete(key)">
        Delete(key)
      </code>
    </td>
    
    <td align="left">
      方法
    </td>
    
    <td align="left">
      删除指定 key
    </td>
    
    <td align="left">
      <code code="c.Delete("k")">
        c.Delete("k")
      </code>
    </td>
  </tr>
  
  <tr>
    <td align="left">
      <code code="DeleteExpired()">
        DeleteExpired()
      </code>
    </td>
    
    <td align="left">
      方法
    </td>
    
    <td align="left">
      删除所有过期项
    </td>
    
    <td align="left">
      <code code="c.DeleteExpired()">
        c.DeleteExpired()
      </code>
    </td>
  </tr>
  
  <tr>
    <td align="left">
      <code code="Flush()">
        Flush()
      </code>
    </td>
    
    <td align="left">
      方法
    </td>
    
    <td align="left">
      清空所有缓存项
    </td>
    
    <td align="left">
      <code code="c.Flush()">
        c.Flush()
      </code>
    </td>
  </tr>
  
  <tr>
    <td align="left">
      <code code="Items()">
        Items()
      </code>
    </td>
    
    <td align="left">
      方法
    </td>
    
    <td align="left">
      返回所有缓存项（包含过期未清理的）
    </td>
    
    <td align="left">
      <code code="items := c.Items()">
        items := c.Items()
      </code>
    </td>
  </tr>
</tbody>
</table>

## 示例代码

这里写一个简单的示例代码, 使用 gin 框架

```go
package main

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/patrickmn/go-cache"
)

func main() {
	r := gin.Default()
	c := cache.New(30*time.Second, 1*time.Minute)
	r.GET("/", func(ctx *gin.Context) {
		c.Set("name", "codepzj", cache.DefaultExpiration)
		ctx.String(200, "set name successfully")
	})
	r.GET("/cache", func(ctx *gin.Context) {
		fmt.Println("cache items", c.Items())
		val, exp, found := c.GetWithExpiration("name")
		if found {
			ctx.String(200, "get cache successfully, value %s, expired at %s", val, exp.Format("2006-01-02 15:04:05"))
			return
		}
		ctx.String(200, "get cache failed, expired")
	})
	r.GET("/delete", func(ctx *gin.Context) {
		c.Delete("name")
		ctx.String(200, "delete cache successfully")
	})
	r.Run(":8080")
}
```

## 底层剖析

### 数据结构

```go
type cache struct {
	defaultExpiration time.Duration
	items             map[string]Item
	mu                sync.RWMutex
	onEvicted         func(string, interface{})
	janitor           *janitor
}

type Item struct {
	Object     interface{}
	Expiration int64
}
```

- `defaultExpiration`是默认过期时间, 如果设置为 0, 则表示永不过期
- `items`是缓存项的 map, 键是 string, 值是 Item
- `mu`是互斥锁, 用于保护`items`的并发访问
- `onEvicted`是删除缓存项时的回调函数, 当缓存项过期时, 会调用该函数
- `janitor`是清理缓存项的定时器, 会定时清理过期缓存项

### Get 和 Set 详解

#### Get 方法

```go
func (c *cache) Get(k string) (interface{}, bool) {
	c.mu.RLock()
	// "Inlining" of get and Expired
	item, found := c.items[k]
	if !found {
		c.mu.RUnlock()
		return nil, false
	}
	if item.Expiration > 0 {
		if time.Now().UnixNano() > item.Expiration {
			c.mu.RUnlock()
			return nil, false
		}
	}
	c.mu.RUnlock()
	return item.Object, true
}
```

在 Get 方法中, 首先会加锁, 可以防止在读取的时候, 其他 goroutine 修改 items, 并且能够并发访问

然后会判断缓存项是否过期, 如果过期, 则返回 false, 否则返回 true

#### Set 方法

```go
func (c *cache) Set(k string, x interface{}, d time.Duration) {
	// "Inlining" of set
	var e int64
	if d == DefaultExpiration {
		d = c.defaultExpiration
	}
	if d > 0 {
		e = time.Now().Add(d).UnixNano()
	}
	c.mu.Lock()
	c.items[k] = Item{
		Object:     x,
		Expiration: e,
	}
	// TODO: Calls to mu.Unlock are currently not deferred because defer
	// adds ~200 ns (as of go1.)
	c.mu.Unlock()
}
```

设置写锁，防止多个 goroutine 同时修改一个 item, 然后设置过期时间

这就是 go-cache 库, 主要用于单机缓存,底层是一个 map, 使用`RWMutex`锁控制读写和`time.Now().Add(d).UnixNano()`设置过期时间, 基于本地内存 , 如果需要分布式缓存, 可以考虑使用 redis 等其他缓存库
