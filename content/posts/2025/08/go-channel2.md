---
title: 缓冲区为 1 和无缓冲区的 channel 有什么区别
description: 带缓冲区的 channel（如容量为 1）允许发送方先发送后接收，不会立即阻塞；而无缓冲区的 channel 发送操作会阻塞当前 goroutine，直到有接收方同步接收，否则会造成死锁。因此缓冲区提供了发送和接收的解耦能力。
date: '2025-08-04'
updated: '2025-08-04'
categories:
- Go语言
tags:
- channel
draft: false
---

### 缓冲区为 1

```go
package main

import "fmt"

func main() {
	ch := make(chan int, 1)

	ch <- 1

	fmt.Println("ch中的值为", <-ch)
}
```

### 无缓冲区

```go
package main

import "fmt"

func main() {
	ch := make(chan int)

	ch <- 1

	fmt.Println("ch中的值为", <-ch)
}
```

缓冲区为 1 能正常输出 1
而无缓冲区会死锁，因为在往 channel 置入值，当前 goroutine 就会被挂起，消费者无法接收 channel 传入的值
