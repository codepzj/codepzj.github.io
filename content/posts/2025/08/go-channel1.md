---
title: "Go Channel 基础概念与用法"
description: |
  在 Go 语言中，channel 是一种用于**协程间通信**的数据结构。根据是否带缓冲区，channel 可分为**无缓冲区**和**有缓冲区**两类。

  **无缓冲区的 channel** 是一种同步通信方式，发送和接收必须“当场配对”，发送方在没有接收方的情况下会被挂起，直到数据被接收。这就像一个共享的杯子，只有顾客喝掉牛奶，奶农才能继续挤下一杯。

  **有缓冲区的 channel** 则支持异步通信，可以预先存入一定数量的值，只在缓冲区满时才会阻塞发送。它更像一个小型车间，奶农可以提前挤奶放进去，顾客随时取用。

  理解这两者的差异对于编写高效的并发程序非常关键，尤其是在处理 goroutine 调度与通信时。
date: '2025-08-04'
updated: '2025-08-04'
categories:
- Go语言
tags:
- channel
draft: false
---

chan 是 golang 中的数据结构，俗称管道，用于并发控制和阻塞，其实不也不太懂一步步来

## 创建

channel 只能使用 make 来创建

```go
c := make(chan int) // 创建无缓冲区的chan

c2 := make(chan int,2) // 创建2个缓冲区的chan
```

这个无缓冲区的 channel 一旦接收了值就会在当前 goroutines 阻塞

所以一般配合 goroutines 在后台使用

## 无缓冲区的 channel

无缓冲区的 channel 在一个地方接收值只能等待接收方接收才能进行下一次读入

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	c := make(chan int)
	go func() {
		fmt.Println("[Goroutine] Send 1")
		c <- 1
		fmt.Println("[Goroutine] Send 2")
		c <- 2
	}()

	time.Sleep(time.Millisecond * 10) // 稍等，确保 goroutine 启动

	fmt.Println("[Main] Receive 1")
	v1 := <-c
	fmt.Println("[Main] Got:", v1)

	fmt.Println("[Main] Receive 2")
	v2 := <-c
	fmt.Println("[Main] Got:", v2)
}
```

执行结果：

```text
[Goroutine] Send 1
[Main] Receive 1
[Main] Got: 1
[Main] Receive 2
[Goroutine] Send 2
[Main] Got: 2
```

正如上述代码所示，往 **无缓冲的** channel 置入值，接收值这个过程会阻塞当前`goroutine`，直到在另外一个 goroutine 拿到为止

```go
v3 := <-c
fmt.Println("[Main] Got:", v3)
```

如果写成这样那么就会持续阻塞，造成死锁问题

控制台的输出为

```text
fatal error: all goroutines are asleep - deadlock!
]:
main.main()
        /code/demo/eventbus/1.go:27 +0x214
```

## 有缓冲区的 channel

与无缓冲区的 channel 不同的是，有缓冲区的 channel 内部是可以存储值的，如果在没有接收方时，依旧是可以往 channel 发送值，直到发送的值的个数等于缓冲区容量的时候，channel 就会被阻塞

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	c := make(chan int, 2)
	go func() {
		fmt.Println("[Goroutine] Send 1")
		c <- 1
		fmt.Println("[Goroutine] Send 2")
		c <- 2
	}()

	time.Sleep(time.Millisecond * 10) // 稍等，确保 goroutine 启动

	fmt.Println("[Main] Receive 1")
	v1 := <-c
	fmt.Println("[Main] Got:", v1)

	fmt.Println("[Main] Receive 2")
	v2 := <-c
	fmt.Println("[Main] Got:", v2)
}
```

执行结果：

```bash
[Goroutine] Send 1
[Goroutine] Send 2
[Main] Receive 1
[Main] Got: 1
[Main] Receive 2
[Main] Got: 2
```

可以发现，有缓冲区并不像无缓冲区那样，在置入一个值就会阻塞，当前`goroutine` 会被挂起，有缓冲区的 channel 可以往内部置入多个值，仅当发送个数等于其缓冲区容量的时候，才会被挂起

所以无缓冲区是同步的，在消费者消费完才能继续生产
有缓冲区是异步的，无需等待消费者消费完

无缓冲区有点像一个共用的杯子，只有牛奶满了，顾客才能购买并且喝完才能继续挤奶
有缓冲区就是一个车间，可以一直生产牛奶直到车间满为止，消费者是可以直接去车间喝牛奶的
