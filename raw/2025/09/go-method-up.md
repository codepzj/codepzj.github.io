# Go 方法提升与嵌入类型

> 今天聊一下go的方法提升，在很多源码看到，查资料才发现可以这样用

在go的源码中经常看到这种形式

结构体经常嵌套一个匿名的接口，这样写的要求是当前结构体实现了该接口的所有方法

struct嵌套interface

代码如下

```go
package main

import "fmt"

type Person struct {
	Name string
	Dog
}

type Dog interface {
	Eat()
	Bark()
}

type Husky struct {
}

func (h Husky) Eat() {
	fmt.Println("eat")
}

func (h Husky) Bark() {
	fmt.Println("bark")
}

func main() {
	p := Person{
		Name: "codepzj",
		Dog:  Husky{},
	}

	p.Eat()
	p.Bark()

}
```

我们在初始化的时候直接赋值，然后通过Person就能调用Dog接口的Eat和Bark方法

这叫作**方法提升**

详细资料可看：[https://juejin.cn/post/7120219197799563278](https://juejin.cn/post/7120219197799563278)
