---
title: "Go Context 原理与使用实践"
description: Go语言的context包是并发编程的核心工具，主要用于管理goroutine的生命周期、传递取消信号和请求范围数据。通过WithCancel、WithTimeout、WithDeadline和WithValue等方法，可以从根context派生出子context，形成树状结构，实现优雅的协程控制和超时管理。context广泛应用于HTTP请求、数据库操作等场景，确保资源及时释放，避免泄漏。最佳实践包括及时调用cancel()、避免滥用WithValue传递业务参数，以及在goroutine中监听ctx.Done()以响应取消信号
date: '2025-08-20'
updated: '2025-08-20'
categories:
- Go语言
tags:
- context
draft: false
---

## context 数据结构

```go
type Context interface {
	Deadline() (deadline time.Time, ok bool)
	Done() <-chan struct{}
	Err() error
	Value(key interface{}) interface{}
}
```

这是 go 官方的 context 包，其中的`Context`数据结构实现了以下四个方法

- Deadline：获取 context 的截止时间，ok 表示是否设置了超时时间。
- Done：当 context 被取消或达到截止时间时，返回的只读 channel 会被关闭，用来传递取消信号。
- Err：在 Done 关闭后返回错误信息（context.Canceled 或 context.DeadlineExceeded），在此之前返回 nil。
- Value：获取 context 中存储的值（通常用来传递请求范围内的元数据，如 traceID、用户信息）。

## 创建 context

context.Background() -- 根 context
context.TODO() -- 占位，类型和 Background 一致但是未确定是使用根 context 还是传递的 context

这两个都是根 context，然后均为无超时，无取消，无值的“三无”根 context

来看一段代码

```go
func TestDeadline() {
	ctx := context.Background()

	deadTime, ok := ctx.Deadline()
	fmt.Println("超时时间和是否设置超时", deadTime, ok)


	// 死锁, 因为context.Background()是无超时
	// <-ctx.Done()

	fmt.Printf("ctx.Err(): %v\n", ctx.Err())

}
```

输出结果

```text
超时时间和是否设置超时 0001-01-01 00:00:00 +0000 UTC false
ctx.Err(): <nil>
```

注释的部分是因为根 context 无超时时间，所以 channel 永久不会，发送超时信号【channel 在退出的时候，为空继续拿值会拿其零值】，一直阻塞造成死锁

## context 的派生

```go
func WithCancel(parent Context) (ctx Context, cancel CancelFunc)
func WithDeadline(parent Context, deadline time.Time) (Context, CancelFunc)
func WithTimeout(parent Context, timeout time.Duration) (Context, CancelFunc)
func WithValue(parent Context, key, val interface{}) Context
```

- WithCancel，可用于创建子 context，附带撤销机制
- WithDeadline，可用于创建子 context，附带撤销机制，同时附带超时控制
- WithTimeout，类似 WithDeadline，但是传递的 duration，方便些
- WithValue，父 context 的派生，设置值

![context](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250820162659687.png)
通过根 context，通过四个 with 系列方法可以派生出四种类型的 context，每种 context 又可以通过同样的方式调用 with 系列方法继续向下派生新的 context，整个结构像一棵树。

来看一段代码

```go
func func1(ctx context.Context, name string) {
	select {
	case <-ctx.Done():
		fmt.Printf("%s, 超时了, 准备退出...\n", name)
		fmt.Println("ctx.Err", ctx.Err().Error())
	case <-time.After(3 * time.Second):
		fmt.Printf("%s, 数据库查询完成\n", name)
	}
}

func func2(ctx context.Context) {
	fmt.Printf("ctx.Value(\"name\").(string): %v\n", ctx.Value("name").(string))
}

func main() {
	/* ---------- context派生 ---------- */
	ctx1, cancel := context.WithCancel(parent)
	go func1(ctx1, "cancel")
	time.Sleep(2 * time.Second)
	cancel() // 子goroutine 2s之后超时退出

	ctx2, cancel2 := context.WithDeadline(parent, time.Now().Add(1*time.Second))
	go func1(ctx2, "deadline") // 子goroutine 1s之后超时退出
	defer cancel2()

	ctx3, cancel3 := context.WithTimeout(parent, 500*time.Millisecond)
	go func1(ctx3, "timeout") // 子goroutine 0.5s之后超时退出
	defer cancel3()

	ctx4 := context.WithValue(parent, "name", "codepzj")
	go func2(ctx4)

	time.Sleep(5 * time.Second)
}
```

输出结果：

```text
ctx.Value("name").(string): codepzj
cancel, 超时了, 准备退出...
ctx.Err context canceled
timeout, 超时了, 准备退出...
ctx.Err context deadline exceeded
deadline, 超时了, 准备退出...
ctx.Err context deadline exceeded
```

## context 用途

context 主要有两个用途，也是在项目中经常使用的:

1. 用于并发控制，控制协程的优雅退出
2. 上下文的信息传递，总的来说，context 就是用来在父子 goroutine 间进行值传递以及发送 cancel 信号的一种机制。
