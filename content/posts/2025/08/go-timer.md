---
title: "Go Timer 与 Ticker 定时器详解"
description: Timer 用于一次性计时，可通过 C 通道接收时间；AfterFunc 用于异步回调，不通过 C 通道；Ticker 用于周期性计时；select
  多个就绪 case 随机选择，break 仅退出当前块
date: '2025-08-21'
updated: '2025-08-21'
categories:
- Go语言
tags:
- context
- goroutine
draft: false
---

## timer 定时器

golang 的 time 包内置了 timer 定时器，它包含了两种数据结构，分别是 Timer 和 Ticker

1. Timer，在未来的某一个时刻执行一次【一次性定时器】
2. Ticker，周期性的执行多次，需要手动触发停止【周期性定时器】

## timer 的数据结构

```go
type Timer struct {
	C         <-chan Time
	initTimer bool
}

func NewTimer(d Duration) *Timer {
	c := make(chan Time, 1)
	t := (*Timer)(newTimer(when(d), 0, sendTime, c, syncTimer(c)))
	t.C = c
	return t
}
```

我们可以使用 NewTimer 去初始化一个定时器`func NewTimer(d Duration) *Timer`

Timer 结构里有一个 Time 类型的管道 C，主要用于事件通知。在未到达设定时间的时候，管道内没有数据写入，一直处于阻塞状态，到达设定时间后，会向管道内写入一个系统时间，触发事件。

### 创建 Timer

代码示例：

```go
func main() {
	t := time.NewTimer(2 * time.Second)
	fmt.Println("<-t.C", <-t.C)

	fmt.Println("2s结束了")
}
```

输出结果：

```text
<-t.C 2025-08-20 18:43:43.768511304 +0800 CST m=+2.000062088
2s结束了
```

可以看到输出了结束之后的时间类型

timer 有两个常用的方法：

1. `func (t *Timer) Reset(d Duration) bool`
2. `func (t *Timer) Stop() bool`

Reset 用于重置定时器的时间，哪怕已经定时器已经过时了

Stop 用于暂停，返回值表示是否正处于计时状态

示例代码：

```go
func main() {
	t := time.NewTimer(2 * time.Second)
	res := t.Stop()
	fmt.Println("是否处于计时状态", res)

	// 因为停止计时了，重置一下计时时间
	t.Reset(1 * time.Second)
	fmt.Println("<-t.C", <-t.C)

	fmt.Println("1s结束了")

	res = t.Stop()
	fmt.Println("是否处于计时状态", res)
}
```

运行结果：

```text
是否处于计时状态 true
<-t.C 2025-08-20 19:00:29.577803872 +0800 CST m=+1.000104217
1s结束了
是否处于计时状态 false
```

## time.AfterFunc

来看一下函数定义
`func AfterFunc(d Duration, f func()) *Timer`

经过一段时间之后，调用回调函数并返回 timer
注意点开源码发现，其 C【通道会被置 nil】

```go
// AfterFunc waits for the duration to elapse and then calls f
// in its own goroutine. It returns a [Timer] that can
// be used to cancel the call using its Stop method.
// The returned Timer's C field is not used and will be nil.
func AfterFunc(d Duration, f func()) *Timer {
	return (*Timer)(newTimer(when(d), 0, goFunc, f, nil))
}
```

示例代码

```go
func TestAfterFunc() {
	t := time.AfterFunc(1*time.Second, func() {
		fmt.Println("time.AfterFunc在1秒后被触发了")
	})

	fmt.Println("<-t.C", <-t.C)
}

func TestAfter() {
	ch := time.After(1 * time.Second)
	fmt.Println("<ch", <-ch)
}
```

输出结果

```bash
<ch 2025-08-21 11:14:21.935064037 +0800 CST m=+2.001546026
time.AfterFunc在1秒后被触发了
```

可以看到 t.C 一直为 nil，所以对应的子 goroutine 就会一直阻塞，无法输出

它存在的唯一作用是可以通过调用 Stop() 来取消定时器。而不能像正常 timer 一样通过 C 去等待信号的结束

## time.After

点开源码

```go
func After(d Duration) <-chan Time {
	return NewTimer(d).C
}
```

可以看到这个是个定时器，如果到时间就会往管道发送到时时间，相当于信号，通常配合 select case 使用

```go
select {
   case val := <-ch:
      fmt.Printf("val is %s\n", val)
   case <-time.After(time.Second * 2):
      fmt.Println("timeout!!!")
   }
```

## Ticker

和 Timer 是类似的

```go
type Ticker struct {
   C <-chan Time // The channel on which the ticks are delivered.
   r runtimeTimer
}
```

不过 Ticker 是周期性，Timer 是一次性的

```go
func TestTicker(sem <-chan struct{}) {
	t := time.NewTicker(1 * time.Second)
	defer t.Stop()
	for {
		select {
		case <-t.C:
			fmt.Println("轮询")
		case <-sem:
			fmt.Println("结束Ticker")
			return
		}
	}
}

func main() {
	// 创建一个退出信号，要退出时往里面写值
	sem := make(chan struct{}, 1)
	go TestTicker(sem)
	// 5s后退出轮询
	time.AfterFunc(5*time.Second, func() {
		sem <- struct{}{}
	})
	for {
	}
}
```

Go 的 break 与很多语言有点不同。在 C、Java、Python 这种语言里，break 默认退出最近的一层循环，而 Go 里也一样——但这里的“最近一层循环”要注意，select 语句本身被视作一层语法块，所以 break 默认只会跳出 select，不会跳出包含它的 for。所以直接return退出函数。
