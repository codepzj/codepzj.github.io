---
title: "Go Wire 依赖注入实践"
description: Wire 是 Google 开发的 Go 依赖注入工具，通过自动生成代码管理模块依赖关系，解决手动初始化导致的混乱问题。它使用 wire.Build
  定义依赖链，支持接口绑定和构造器集合，执行 wire 命令即可生成初始化代码。虽然学习成本较高，但能显著提升大型项目的可维护性，特别适合与 Gin 等框架集成使用。需注意处理循环依赖和接口绑定，小项目可能增加复杂度。
date: '2025-07-26'
updated: '2025-08-21'
categories:
- Go语言
tags:
- wire
draft: false
---

## 前言

> 你是否遇到这种情况，为 go 项目当中定义了太多的全局变量以及紊乱的依赖关系而苦恼。

就拿一个`user`模块举例

```go
db := config.NewGormDB()
userDao := dao.NewUserDao(db)
userRepo := repo.NewUserRepo(userDao)
userService := service.NewUserService(userRepo)
userHandler := api.NewUserHandler(userService)
```

为了管理这些模块，需要自己手动分包，以及管理子模块中`Router`的引入，然后再统一从子模块引入初始化，有时候处理不当就会导致空指针异常，因为没有正确的处理好依赖关系

## 快速开始

[wire](https://github.com/google/wire)库恰好可以帮助解决这个问题，**谷歌出品，必定难用，对初学者非常的不友好**。

### 安装

```bash
go install github.com/google/wire/cmd/wire@latest
```

### 项目引入

```bash
go get github.com/google/wire/cmd/wire
```

### 测试

```bash
wire -h # 查看是否安装成功
```

## 项目初始化

我们举个简单的案例，假设我们现在已经写好`user`模块

### domian 层

```go
package domain

import "gorm.io/gorm"

type User struct {
	gorm.Model `gorm:"embedded"`
	Name       string `gorm:"unique"`
	Age        int
	Gender     string
}
```

### dao 层

```go
package dao

import (
	"gorm.io/gorm"
	"wire_learn/internal/user/domain"
)

type UserDao struct {
	db *gorm.DB
}

func NewUserDao(db *gorm.DB) *UserDao {
	return &UserDao{db}
}

type IUserDao interface {
	Create(user domain.User) error
	FindIsExistByName(name string) bool
}

var _ IUserDao = (*UserDao)(nil)

func (r *UserDao) Create(user domain.User) error {
	return r.db.Create(&user).Error
}

func (r *UserDao) FindIsExistByName(name string) bool {
	return r.db.Where("name=?", name).First(&domain.User{}).RowsAffected != 0
}
```

### service 层

```go
package service

import (
	"wire_learn/internal/user/domain"
	"wire_learn/internal/user/repo"
)

type UserService struct {
	repo repo.IUserRepo
}

type IUserService interface {
	CreateUser(user domain.User) error
}

var _ IUserService = (*UserService)(nil)

func NewUserService(repo repo.IUserRepo) *UserService {
	return &UserService{repo}
}

func (s *UserService) CreateUser(user domain.User) error {
	return s.repo.Create(user)
}
```

### api 层

```go
package api

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"wire_learn/internal/user/domain"
	"wire_learn/internal/user/service"
	"wire_learn/pkg/resp"
)

type UserHandler struct {
	serv service.IUserService
}

type IUserHandler interface {
	Login(c *gin.Context)
}

var _ IUserHandler = (*UserHandler)(nil)

func NewUserHandler(serv service.IUserService) *UserHandler {
	return &UserHandler{
		serv: serv,
	}
}

func (h *UserHandler) Login(c *gin.Context) {
	var userReq UserReq
	if err := c.ShouldBindJSON(&userReq); err != nil {
		resp.FailWithMsg(c, http.StatusBadRequest, "UserReq类型不匹配")
		return
	}
	user := domain.User{
		Name:   userReq.Username,
		Age:    userReq.Age,
		Gender: userReq.Gender,
	}
	err := h.serv.CreateUser(user)
	if err != nil {
		resp.FailWithMsg(c, http.StatusBadRequest, err.Error())
		return
	}
	resp.Success(c)
}
```

## 不使用 wire 怎么写

在没有接触`wire`之前，我是这样写的

- 初始化 gormDB，挂载到全局变量 DB 上
- 然后新建一个`router`文件夹，里面分包，在`user`模块下建立一个`initUserRouter`的函数初始化当前模块的路由（初始化 dao,repo,service,api）
- 然后在`router`文件夹下的`enter.go`入口文件初始化总路由`initAppRouter`，然后在`main.go`中引入。

## 使用 wire 又该怎么写呢

**我会慢慢的引导大家，报错先别急**

### 第一步 wire.Build

在`main.go`的同级目录下新建一个`wire.go`

```go
func InitUserHandler() *api.UserHandler {
	wire.Build(
        config.NewGormDB, # 绑定db
		api.NewUserHandler,
		service.NewUserService,
		repo.NewUserRepo,
		dao.NewUserDao,
	)
	return nil
}
```

#### 含义

> 在`wire.Build`中写入各个模块的构造函数，db->dao->repo->service->api，返回值写入你想要生成函数的返回值，通常是**最高层模块对应的结构体指针**

然后在`wire.go`中所在的目录打开终端输入：

```bash
wire
```

**出现报错**

```bash
D:\Code\Go\wire-learn>wire
wire: D:\Code\Go\wire-learn\wire.go:11:1: inject InitUserHandler: no provider found for *github.com/gin-gonic/gin.Engine
        needed by *wire_learn/internal/user/api.UserHandler in provider "NewUserHandler" (D:\Code\Go\wire-learn\internal\user\api\user.go:21:6)
wire: D:\Code\Go\wire-learn\wire.go:11:1: inject InitUserHandler: no provider found for wire_learn/internal/user/service.IUserService
        needed by *wire_learn/internal/user/api.UserHandler in provider "NewUserHandler" (D:\Code\Go\wire-learn\internal\user\api\user.go:21:6)
wire: wire_learn: generate failed
wire: at least one generate failure
```

在软件设计层面，一般要遵循`依赖倒置`原则

也就是说，高层模块要维护低层模块的抽象类（接口）

代码层面，`UserHandler`要维护`IUserService`这个接口

```go
type UserHandler struct {
	serv service.IUserService
}
```

所以说要让`wire`去识别`某个接口`实现了`某个结构体`，比如说`api.NewUserHandler`返回的是`IUserService`,而`service.NewUserService`依赖于`UserService`结构体，而不是`IUserService`接口，所以要绑定接口和结构体之间的关系

### 第二步 wire.Bind

```go
func InitUserHandler() *service.UserService {
	wire.Build(
		config.NewGormDB,
        wire.Bind(new(repo.IUserService), new(*repo.UserService)),
		wire.Bind(new(repo.IUserRepo), new(*repo.UserRepo)),
		wire.Bind(new(dao.IUserDao), new(*dao.UserDao)),
        api.NewUserHandler,
		service.NewUserService,
		repo.NewUserRepo,
		dao.NewUserDao,
	)
	return nil
}
```

### 第三步 使用 wire.NetSet

有时候可能多个类型有相同的依赖，我们每次都将相同的构造器传给`wire.Build()`不仅繁琐，而且不易维护，一个依赖修改了，所有传入`wire.Build()`的地方都要修改。为此，`wire`提供了一个`ProviderSet`（构造器集合），可以将多个构造器打包成一个集合，后续只需要使用这个集合即可。

在 user 模块下新建`ioc.go`

```go
// UserProvider 依赖注入
var UserProvider = wire.NewSet(
	config.NewGormDB,
    wire.Bind(new(repo.IUserService), new(*repo.UserService)),
    wire.Bind(new(repo.IUserRepo), new(*repo.UserRepo)),
    wire.Bind(new(dao.IUserDao), new(*dao.UserDao)),
    api.NewUserHandler,
    service.NewUserService,
    repo.NewUserRepo,
    dao.NewUserDao,
)
```

然后在`wire.Bind`中注入

```go
func InitUserHandler() *service.UserService {
	wire.Build(
		ioc.UserProvider
	)
	return nil
}
```

这样就能有效管理`provider`，统一引入，防止大量代码写在一个`Build`里面

### 第四步 生成代码

```bash
wire # 识别当前目录的wire.build
wire ./... # 识别当前目录和子目录
```

### 第五步 添加 wireinject

在`wire.go`头部上添加

```go
//go:build wireinject
// +build wireinject
```

因为同个包下不能有两个相同的函数名，否则报错，保留自动化生成的`wire_gen.go`文件

## 在 gin 中优雅的使用 wire

### 重点

又回到刚刚那个问题，怎么做才能避免初始化大量的`Router`和比较有效的避免使用一些没有意义的全局变量

大多数的数据库，对象初始化应该是一个`单例模式`，所以只能有一个 wire.go，如果说在不同的模块下建立多个`wire.go`，这样做法是错误的。

为了解决`Router`的问题，应该在`NewHandler`(即初始化 api 接口构造函数)的时候，**将 router \*gin.Engine 传入,api 初始化的时候顺带挂载路由**

### 第一步 优化 api 层的构造函数

```go
func NewUserHandler(r *gin.Engine, serv service.IUserService) *UserHandler {
	h := &UserHandler{
		serv: serv,
	}
	v := r.Group("user")
	{
		v.POST("add", h.Login)
	}
	return h
}
```

> 同时初始化路由

### 第二步 初始化一个无中间件的 gin 服务器

`middleware/logger.go`

```go
package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// GinLogger 是一个 Gin 中间件，用于记录 HTTP 请求的日志信息
func GinLogger(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now() // 记录请求开始时间

		// 获取请求的路径和查询参数
		status := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		clientIP := c.ClientIP()
		userAgent := c.Request.UserAgent()
		date := time.Now().Format("2006-01-02 15:04:05")

		// 处理请求
		c.Next()

		// 计算请求耗时
		duration := time.Since(start)

		// 记录日志
		logger.Info(
			"请求日志",
			zap.Int("status", status),
			zap.String("method", method),
			zap.Duration("duration", duration),
			zap.String("path", path),
			zap.String("query", query),
			zap.String("clientIP", clientIP),
			zap.String("userAgent", userAgent),
			zap.String("date", date),
		)
	}
}
```

`config/initGin.go`

```go
package config

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"wire_learn/pkg/middleware"
)

func NewGin(logger *zap.Logger) *gin.Engine {
	r := gin.New()
	r.Use(middleware.GinLogger(logger))
    // 使用其他中间件
    ...
	return r
}
```

> 还可添加 cors，recover 等中间件

### 第三步. 初始化 httpServer

```go
type HttpServer struct {
	Engine  *gin.Engine
	UserApi *api.UserHandler
}

func (receiver *HttpServer) Runserver() {
	// 加载env配置

    // casbin配置

    ...
	// 启动gin服务端
	receiver.Engine.Run()
}
```

> 定义了一个`HttpServer`的结构体，里面有 Engine，UserApi 两个字段，目的就是在初始化完 gin 服务器后，再通过 Engine 对象去初始化路由，然后通过 wire，将前面的一系列的封装成一个 initApp 函数，返回\*HttpServer 对象

### 第四步 生成 wire_gen.go

`wire.go`代码

```go
func InitApp() *config.HttpServer {
	wire.Build(
		wire.Struct(new(config.HttpServer), "*"),
		config.NewGormDB,
		config.NewLogger,
		config.NewGin,
		user.UserProvider,
	)
	return nil
}
```

`wire.Struct(new(config.HttpServer), "*")`实际上是初始化 HttpServer 对象，**wire.Build 除了构造函数也可以识别这种格式，`*`代表所有字段**

### 第五步 执行 wire

```bash
wire
```

生成代码如下

```go
// Injectors from wire.go:

func InitApp() *config.HttpServer {
	logger := config.NewLogger()
	engine := config.NewGin(logger)
	db := config.NewGormDB()
	userDao := dao.NewUserDao(db)
	userRepo := repo.NewUserRepo(userDao)
	userService := service.NewUserService(userRepo)
	userHandler := api.NewUserHandler(engine, userService)
	httpServer := &config.HttpServer{
		Engine:  engine,
		UserApi: userHandler,
	}
	return httpServer
}
```

### 第六步 main.go 中调用

```go
package main

func main() {
	app := InitApp()
	app.Runserver()
}
```

![image-20250215163501665](https://cdn.jsdelivr.net/gh/codepzj/images@main/202502151635481.png)

## 总结

> 将 handler 挂载到 httpServer 结构体当中，如果你新增子模块，只需在 httpServer 加入对应的 handler 和 build 加入对应的 provider，就能自动管理路由，而不需要手动分包初始化，是不是非常方便 😎😎😎

Wire 是一个强大的依赖注入工具，可以帮助你更好地管理 Go 项目的依赖关系，提高代码的可维护性和可测试性。虽然学习曲线比较陡峭，但对于大型项目来说，使用 Wire 可以带来显著的好处。在使用 Wire 的过程中，需要注意错误处理、循环依赖、单例模式、编译时间等问题。尤其是在与 gin 结合使用时，需要注意 API Handler 和中间件的初始化方式。

**还有一点的是小项目可能体现不出来优势，大项目用 wire 管理是一种非常方便的选择**

### 参考资料

- https://darjun.github.io/2020/03/02/godailylib/wire/

- https://chenmingyong.cn/posts/go-wire
