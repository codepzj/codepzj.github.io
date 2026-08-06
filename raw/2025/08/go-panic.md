# Go Panic 与 Recover 异常处理

> Go 中的 `panic` 会导致当前 goroutine 崩溃，若未被 `recover` 捕获，则程序终止。`recover` 需配合 `defer` 使用，只能捕获**当前 goroutine** 内的 panic。若 panic 发生在子 goroutine 中，主 goroutine 的 `recover` 无法捕获，程序仍会崩溃，因此每个 goroutine 内需单独设置 `defer+recover` 才能防止异常扩散。

1. panic 是 go 的内置机制，输出严重错误。如果没有恢复程序会打印堆栈，然后退出
2. recover 也是 go 的内置机制，在当前 goroutine 恢复 panic，返回值为 panic 中的引用信息

> **注意：** recover 一定要与 defer 一起使用，不然 recover 只会返回 nil

示例程序：

```go
package main

func A() {
	B()
}

func B() {
	C()
}

func C() {
	panic("报错了")
}

func main() {
	A()
}
```

输出结果：

```text
panic: 报错了

goroutine 1 [running]:
main.C(...)
        /code/demo/panic/main.go:12
main.B(...)
        /code/demo/panic/main.go:8
main.A(...)
        /code/demo/panic/main.go:4
main.main()
        /code/demo/panic/main.go:16 +0x25
exit status 2
```

对应的报错堆栈信息比较清晰
C -> B -> A -> main

最后抛到 main 函数

我们可以在 main 调用 A 函数前使用 defer+recover 对 panic 进行捕获

```go
defer func() {
    if r := recover(); r != nil {
        fmt.Println("捕获到异常", r)
    }
}()
A()
```

如上述代码所示，这样就能成功捕获错误，输出如下

```bash
捕获到异常 报错了
```

recover 只能用于当前 goroutine，我们来试试在子 goroutine 处 panic，main 函数是否能捕获到

```go
package main

import (
	"fmt"
	"sync"
)

func doSomething() {
	defer wg.Done()
	fmt.Println("准备panic")
	panic("子goroutine报错了")
}

var wg sync.WaitGroup

func main() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("recover捕获到异常值为:", r)
		}
	}()
	wg.Add(1)
	go doSomething()
	wg.Wait()
	fmt.Println("无法捕获")
}
```

输出结果：

```bash
root@pzj:/code/demo/panic# go run main.go
准备panic
panic: 子goroutine报错了

goroutine 6 [running]:
main.doSomething()
        /code/demo/panic/main.go:11 +0x90
created by main.main in goroutine 1
        /code/demo/panic/main.go:18 +0x31
exit status 2
```

可以看到子 goroutine 直接 panic 了，而主 goroutine 捕获是没有用的，查看输出

发现**无法捕获**没有输出，说明在子 goroutine panic 后直接就退出了，根本就不会回到 main，所以 recover 只能恢复当前 goroutine 的 panic，无法恢复其他 goroutine 的
