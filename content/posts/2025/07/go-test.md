---
title: "Go 单元测试与覆盖率实践"
description: "介绍 Go 官方 testing 包的基本用法，包括单元测试、表驱动测试、子测试和覆盖率统计。"
date: '2025-07-26'
updated: '2025-07-28'
categories:
- Go语言
tags:
- Go
- 单元测试
---

今天来研究一下go自带的单元测试(testing库)，来测试程序返回值是否达到预期结果

> 使用方法是执行`go test`会执行当前目录所有以`_test`结尾,以`Test`开头的函数

## 参数说明

| 参数                 | 作用                                        | 示例                              |
| -------------------- | ------------------------------------------- | --------------------------------- |
| `-v`                 | 显示测试的详细信息（verbose 模式）          | `go test -v`                      |
| `-run Testxxx`        | 只运行特定的测试函数              | `go test -run TestAbs`        |
| `-cover`        | 查看单元测试覆盖率              | `go test -cover`        |



## 简单例子

**abs.go**

```go
package abs

func Abs(num int) int {
	if num < 0 {
		return -num
	}
	return num
}
```

**abs_test.go**


```go
package abs

import "testing"

func TestAbs(t *testing.T) {
	num := Abs(-1)
	if num != 1 {
		t.Errorf("expected: %d,get: %d", 1, num)
	}
}
```



### go test -v

这是一个判断绝对值函数是否获得预期结果的测试用例

运行结果:

```text
=== RUN   TestAbs
--- PASS: TestAbs (0.00s)
PASS
```



### go test -run

测试特定函数输出详细信息:

```powershell
PS D:\code\go\fucking-golang\go-test> go test -v -run TestAbs
=== RUN   TestAbs
--- PASS: TestAbs (0.00s)
PASS
ok      go-test 0.528s
```



### go test -cover

测试用例在功能代码中的覆盖率:

```powershell
PS D:\code\go\fucking-golang\go-test> go test -cover          
PASS
coverage: 66.7% of statements
ok      go-test 0.759s
```



因为没有正数的绝对值判断

```go
func TestAbs(t *testing.T) {
	num := Abs(-1)
	if num != 1 {
		t.Errorf("expected: %d,get: %d", 1, num)
	}
	num2 := Abs(3)
	if num2 != 3 {
		t.Errorf("expected: %d,get: %d", 3, num2)
	}
}
```

加上后得出结果

```powershell
PS D:\code\go\fucking-golang\go-test> go test -cover
PASS
coverage: 100.0% of statements
ok      go-test 0.626s
```

## 测试组

有时候一个个测试非常麻烦，每一个用例就要一个if判断，非常冗余，所以可以将其封装成一个结构体

```go
func TestAbs2(t *testing.T) {
	type testCase struct {
		input  int
		output int
	}
	tc := []testCase{
		{1, 1},
		{-1, -1},
		{0, 0},
	}
	for _, c := range tc {
		if Abs(c.input) != c.output {
			t.Errorf("expected: %d,get: %d", c.output, Abs(c.input))
		}
	}
}
```

测试结果:

```powershell
PS D:\code\go\fucking-golang\go-test> go test -v -run TestAbs2
=== RUN   TestAbs2
--- PASS: TestAbs2 (0.00s)
PASS
ok      go-test 0.523s
```

将`{-1, 1}`改成`{-1, -1}`就会出错

测试结果:

```powershell
PS D:\code\go\fucking-golang\go-test> go test -run TestAbs2   
--- FAIL: TestAbs2 (0.00s)
    abs_test.go:28: expected: -1,get: 1
FAIL
exit status 1
FAIL    go-test 0.523s
```

> 但是如果测试用例较多，则不好判断具体出错

## 子测试

```go
func TestAbs3(t *testing.T) {
    type testCase struct {
       input  int
       output int
    }
    testCaseMap := map[string]testCase{
       "No1": {1, 1},
       "No2": {-1, -1},
       "No3": {0, 0},
    }
    for key, tc := range testCaseMap {
       t.Run(key, func(t *testing.T) {
          got := Abs(tc.input)
          if got != tc.output {
             t.Errorf("expected: %d,get: %d", tc.output, got)
          }
       })
    }
}
```



使用`t.Run`进行子测试，可以传入key值，从而定位哪个测试用例出错

```powershell
PS D:\code\go\fucking-golang\go-test> go test -run TestAbs3
--- FAIL: TestAbs3 (0.00s)
    --- FAIL: TestAbs3/No2 (0.00s)
        abs_test.go:47: expected: -1,get: 1
FAIL
exit status 1
FAIL    go-test 0.545s
```
