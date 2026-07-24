---
title: Go遍历时删除特定元素
description: Go遍历时候删除元素时候的坑，不能正序删除，不然会引起索引错位
date: '2026-02-20'
updated: '2026-02-20'
categories:
- Go语言
tags:
- go
draft: false
---

我们都知道在 Go 语言中可以通过切片语法删除特定元素，但实际开发中，常见的写法其实是有问题的。

## 错误示例

下面这段 Go 代码表面上看起来没什么问题，但实际存在 bug：

```go
package main

import "fmt"

func main() {
	m := []string{"a", "b", "c", "d"}
	for i, v := range m {
		fmt.Println("len(m)", len(m), v)
		if i == 1 {
			m = append(m[:i], m[i+1:]...)
		}
	}
	fmt.Println("m", m)
}
```

### 数据流转解析

- 初始切片内容和索引如下：

  | 索引 | 值  |
  | ---- | --- |
  | 0    | a   |
  | 1    | b   |
  | 2    | c   |
  | 3    | d   |

- 在遍历到 b 时（i==1），删除 b 这个元素，切片变为：

  | 索引 | 值  |
  | ---- | --- |
  | 0    | a   |
  | 1    | c   |
  | 2    | d   |

- 剩下还有 2 次遍历，且都会输出 d，导致输出如下：

```text
len(m) 4 a
len(m) 4 b
len(m) 3 d
len(m) 3 d
m [a c d]
```

可以看到根本不会打印 c，也就是说循环过程中遗漏了一些元素。

## 正确做法：倒序遍历

最优雅、推荐的做法是倒序遍历切片，然后删除元素。

```go
package main

import "fmt"

func main() {
	m := []string{"a", "b", "c", "d"}
	for i := len(m) - 1; i >= 0; i-- {
		fmt.Println("len(m)", len(m), m[i])
		if i == 1 {
			m = append(m[:i], m[i+1:]...)
		}
	}
	fmt.Println("m", m)
}
```

### 过程解析

- 初始切片内容和索引：

  | 索引 | 值  |
  | ---- | --- |
  | 0    | a   |
  | 1    | b   |
  | 2    | c   |
  | 3    | d   |

- 从索引 3 开始遍历到 0，到 b 的时候（i==1），删除 b，切片变为：

  | 索引 | 值  |
  | ---- | --- |
  | 0    | a   |
  | 1    | c   |
  | 2    | d   |

- 因为是倒序遍历，已经被遍历过的元素不会受影响，所以不会发生漏读。

### 最终输出

```text
len(m) 4 d
len(m) 4 c
len(m) 4 b
len(m) 3 a
m [a c d]
```

这种方式可以保证不会遗漏或重复读取元素，代码也更健壮。
