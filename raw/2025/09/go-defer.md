# Go Defer 执行机制详解

> 本文讲述 Go 函数返回值与 defer 执行顺序的关系，通过三个实例分析值类型、具名返回值及引用类型在返回过程中的不同表现。

我们都知道，`defer`往往在函数的最后执行，遵循**先进后出**原则，在`return`函数写入返回值后执行，而且传入的形参会立即读入，后续修改对其无影响

**Go 函数返回过程完整流程**

当一个函数执行到 `return` 语句时，**执行顺序是**：

1. **计算 return 后的表达式**（如果有的话），将结果赋值给返回值；
2. **执行所有的 defer 语句**（按照后进先出 LIFO 的顺序）；
3. **函数真正返回（携带返回值）**。

下面来看这三个案例

```go
package main

import "fmt"

func Func1() int {
	a := 0
	defer func() {
		a++
	}()
	return a
}

func Func2() (a int) {
	a = 0
	defer func() {
		a++
	}()
	return
}

func Func3() *int {
	a := new(int)
	*a = 0
	defer func() {
		*a++
	}()
	return a
}

func main() {
	fmt.Println(Func1())
	fmt.Println(Func2())
	fmt.Println(*Func3())
}
```

输出结果为

```bash
0 1 1
```

## 案例分析

这三个究竟有什么区别呢？

案例一：

1. 首先，我们获得a的值0，然后会重新赋值一份给临时的返回槽(slot)当中
2. 然后，调用defer，修改局部变量a为1，但是a已被copy一份到返回槽，所以重新赋值没有用
3. 返回0

案例二：

1. 首先，Go 在函数进入时会自动为 a 分配内存（在栈上，必要时会逃逸到堆）；
2. a的初始值0，然后赋值一份给临时的返回槽(slot)当中
3. 然后defer修改了a的值
4. 返回1

案例三:

与案例一相似，但是传递的是指针，是引用类型，能修改地址中存储的值，所以返回的是1
