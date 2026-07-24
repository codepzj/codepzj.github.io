---
title: "Go Channel 的 Select Case 用法"
description: "`select case` 用于监听多个 channel 的就绪状态，只有当对应的读写操作**不阻塞**时才会执行。无缓冲通道需读写同时存在才就绪，有缓冲通道读需有值、写需未满。若多个
  case 同时就绪，`select` 会**随机选择一个执行**，否则执行 `default`。配合 `time.After` 可实现超时控制，是并发中的常用模式。"
date: '2025-08-05'
updated: '2025-08-05'
categories:
- Go语言
tags:
- channel
draft: false
---

## select case 用法

select case 主要用于对 channel 进行控制
和我们常用的`switch case`语句类似，但是 select case 的 case 是在`channel处于就绪态`才会执行
case 后面必须跟的是 channel 相关的表达式
如：
ch &lt;- -- 读取
val:=&lt;-ch -- 写入

什么是就绪态呢

- 对于无缓冲区的 channel 来说
  对于读操作，另外一个 goroutine 正在监听该 channel(成双成对)
  对于写操作，当前 channel 不处于挂起状态

- 对于有缓冲区的 channel 来说
  对于读操作，缓冲区有值
  对于写操作，缓冲区没满

总言而之，channel 处于非阻塞就是就绪态

举一个简单的例子

```go
package main

import (
	"fmt"
	"time"
)

func SelectCaseFunc(ch chan int) {
	for {
		select {
		case val := <-ch:
			fmt.Println("接收到值为:", val)
			return
		case ch <- 666:
			fmt.Println("channel往里面置入了值")
		default:
			fmt.Println("上面channel都不位于就绪态, 暂时跳过")
		}
		time.Sleep(time.Millisecond * 500)
	}

}

func main() {
	ch := make(chan int, 1)
	SelectCaseFunc(ch)
}
```

我们来分析一下这段程序

1. 进入`select`
2. 进入第 1 个 case: 该 channel 队列中没有值，不是处于就绪态跳过
3. 进入第 2 个 case: 该 channel 没满，处于就绪态，写入 666
4. for 循环回到 select，进入第 1 个 case，处于就绪态，读出 666 并退出

## 例题

### 判断下面代码的输出可能性，并说明原因

```go
package main

import (
	"fmt"
)

func main() {
	ch1 := make(chan int, 1)
	ch2 := make(chan int, 1)

	ch1 <- 1
	ch2 <- 2

	select {
	case v := <-ch1:
		fmt.Println("从 ch1 读取到：", v)
	case v := <-ch2:
		fmt.Println("从 ch2 读取到：", v)
	default:
		fmt.Println("都不就绪")
	}
}
```

ch1 和 ch2 都是缓冲通道，且都有值。select 中两个 case 都是 读操作，都满足“就绪态”。

那么：

1. 运行结果有几种可能？

2. 是否每次都输出一样？

3. Go 是怎么决定选哪个 case 的？

答案：
都处于就绪态
会随机选，所以既会输出从 ch1 读取：1 也会从 ch2 读取：2
不一定一样，不确定

### 请判断程序输出了什么？是否稳定？并解释理由

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	ch := make(chan int)

	go func() {
		time.Sleep(1 * time.Second)
		ch <- 1
	}()

	select {
	case v := <-ch:
		fmt.Println("收到:", v)
	case <-time.After(500 * time.Millisecond):
		fmt.Println("超时退出")
	}
}
```

答案
超时退出
每次都一样
因为 1 秒过后 ch 才进入就绪态，但是 500ms 就已经进入第二个 case 超时退出了
