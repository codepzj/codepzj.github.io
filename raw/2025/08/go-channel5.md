# 使用 Go Channel 实现简易 EventBus

> 本文介绍了一个适用于单机模块的 Go 语言事件总线（Eventbus）实现，用于异步事件的发布与订阅。通过 map[string]*EventChans 管理事件与多个通道的映射关系，并结合读写锁 sync.RWMutex 保证并发安全，实现了 Subscribe、UnSubscribe、Publish 三个核心方法，展示了如何安全高效地进行事件分发。适合 Go 初学者理解 channel 和并发控制。

## 题目

1. 适用于单机模块，主要用于异步事件分发
2. 选用合适的数据结构，并编写合适的逻辑保证原子性
3. 涵盖发布，订阅，取消订阅等功能

首先，选取合适的数据结构是最重要的，选取 map 来存储事件总线，因为一个事件对应多个 channels 选取这种映射结构性能比较好

```go
type Eventbus struct {
	ec map[string]*EventChans // 设置为指针的目的是能够在订阅和取消订阅的时候原地修改
	mu sync.RWMutex
}
```

然后在并发编程中，map 是读写不安全的，所以设置一把读写锁保证原子性

具体的`EventChans`其实是一个存放 channel 的切片

```go
type EventChans struct {
	query []chan int
	mu    sync.RWMutex
}
```

同样，在并发编程中，切片也是读写不安全的，所以设置一把读写锁保证原子性

## 定义接口

```go
type IEventbus interface {
	Subscribe(event string, ch chan int)
	UnSubscribe(event string, ch chan int)
	Publish(event string, message int)
}
```

分别对应订阅、取消订阅和发布这三个方法

## 具体实现

### 订阅

```go
func (eb *Eventbus) Subscribe(event string, ch chan int) chan int {
	// 对map加互斥锁
	eb.mu.Lock()
	ec, ok := eb.ec[event]
	if !ok {
		ec = &EventChans{}
		eb.ec[event] = ec // 初始化
	}
	eb.mu.Unlock()

	ec.mu.Lock()
	defer ec.mu.Unlock()
	ec.query = append(ec.query, ch)
	return ch // 返回用于监听广播的值
}
```

1. 在订阅过程中，伴随着事件的增加，所以在访问 map 需要加一把互斥锁，在访问完再放开
2. 在订阅过程中，需要新增 channel，需要加把互斥锁，在访问完放开
3. 考虑没有对应事件的时候新增事件

### 取消订阅

```go
func (eb *Eventbus) UnSubscribe(event string, ch chan int) {
	// 对map加互斥锁
	eb.mu.Lock()
	ec, ok := eb.ec[event]
	eb.mu.Unlock()
	if !ok {
		return // 没找到直接返回
	}

	ec.mu.Lock()
	defer ec.mu.Unlock()
	for i, ech := range ec.query {
		if ch == ech {
			ec.query = append(ec.query[0:i], ec.query[i+1:]...)
			break
		}
	}
}
```

1. 在取消订阅过程中，其他事件可能修改 map，所以在访问 map 需要加一把互斥锁，在访问完再放开
2. 在订阅过程中，需要减少 channel，需要加把互斥锁，在访问完放开
3. 考虑没有事件的时候直接返回

### 发布

```go
func (eb *Eventbus) Publish(event string, message int) {
	// 对map加读锁
	eb.mu.RLock()
	ec, ok := eb.ec[event]
	eb.mu.RUnlock()
	if !ok {
		return // 没找到直接返回
	}

	// 对切片加读锁
	ec.mu.RLock()
	defer ec.mu.RUnlock()
	for _, ch := range ec.query {
		ch <- message
	}
}
```

1. 在发布过程中，map 允许被多个 goroutine 读取但是不允许被写入，所以在访问 map 加一把读锁，在访问完再放开
2. 在发布过程中，不允许 channel 的增减，需要加把互斥锁，在访问完放开
3. 考虑没有事件的时候直接返回

## 完整代码以及具体实现

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

type EventChans struct {
	query []chan int
	mu    sync.RWMutex
}

type Eventbus struct {
	ec map[string]*EventChans // 设置为指针的目的是能够在订阅和取消订阅的时候原地修改
	mu sync.RWMutex
}

func NewEventbus() *Eventbus {
	return &Eventbus{
		mu: sync.RWMutex{},
		ec: make(map[string]*EventChans, 10),
	}
}

type IEventbus interface {
	Subscribe(event string, ch chan int)
	UnSubscribe(event string, ch chan int)
	Publish(event string, message int)
}

func (eb *Eventbus) Subscribe(event string, ch chan int) chan int {
	// 对map加互斥锁
	eb.mu.Lock()
	ec, ok := eb.ec[event]
	if !ok {
		ec = &EventChans{}
		eb.ec[event] = ec // 初始化
	}
	eb.mu.Unlock()

	ec.mu.Lock()
	defer ec.mu.Unlock()
	ec.query = append(ec.query, ch)
	return ch // 返回用于监听广播的值
}

func (eb *Eventbus) UnSubscribe(event string, ch chan int) {
	// 对map加互斥锁
	eb.mu.Lock()
	ec, ok := eb.ec[event]
	eb.mu.Unlock()
	if !ok {
		return // 没找到直接返回
	}

	ec.mu.Lock()
	defer ec.mu.Unlock()
	for i, ech := range ec.query {
		if ch == ech {
			ec.query = append(ec.query[0:i], ec.query[i+1:]...)
			break
		}
	}
}

func (eb *Eventbus) Publish(event string, message int) {
	// 对map加读锁
	eb.mu.RLock()
	ec, ok := eb.ec[event]
	eb.mu.RUnlock()
	if !ok {
		return // 没找到直接返回
	}

	// 对切片加读锁
	ec.mu.RLock()
	defer ec.mu.RUnlock()
	for _, ch := range ec.query {
		ch <- message
	}
}

func subscribe(eb *Eventbus) {
	ch := make(chan int, 1)
	eb.Subscribe("event1", ch)
	wg.Done()
	fmt.Println("订阅完毕，开始等待接收")
	fmt.Println("接收到值:", <-ch)
}

var wg sync.WaitGroup

func main() {
	eb := NewEventbus()
	go subscribe(eb)

	// 发布事件

	wg.Add(1)
	wg.Wait() // 等待订阅成功
	eb.Publish("event1", 666)
	time.Sleep(time.Second)
}
```

上述程序是萌新在学习 channel 的一个案例，如果有不足的的地方请指出
