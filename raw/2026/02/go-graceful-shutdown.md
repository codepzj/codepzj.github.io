# Golang中的优雅关闭与退出

> Golang中的优雅关闭与退出，去做一些日志刷盘、关闭基础设施和goroutine连接的操作。

在golang当中，我们经常需要在服务器关闭的那一瞬间去做一些操作

比如：

- 日志刷盘
- 关闭基础设施连接
- 销毁goroutine后台协程

## 优雅关闭和退出

```go
// 优雅关闭和退出
quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
```

这段代码的含义就是，创建一个监听系统信号的channel，在系统退出的时刻会向 `quit` 发送一个信号

这段代码主要监听两个信号，也是业界中常用的两个信号

### 对应的信号表格

<table>
<thead>
  <tr>
    <th>
      信号
    </th>
    
    <th>
      来源
    </th>
    
    <th>
      程序是否可捕获
    </th>
    
    <th>
      常见用途
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      SIGINT
    </td>
    
    <td>
      Ctrl+C
    </td>
    
    <td>
      可以
    </td>
    
    <td>
      本地手动停止
    </td>
  </tr>
  
  <tr>
    <td>
      SIGTERM
    </td>
    
    <td>
      kill / 容器停止 / k8s pod 杀死
    </td>
    
    <td>
      可以
    </td>
    
    <td>
      优雅关闭
    </td>
  </tr>
  
  <tr>
    <td>
      SIGKILL
    </td>
    
    <td>
      kill -9
    </td>
    
    <td>
      不可以
    </td>
    
    <td>
      强制杀死
    </td>
  </tr>
</tbody>
</table>

不过需要注意的是，主要针对人为的`Ctrl + C`、进程被kill、docker容器被kill以及k8s pod被kill的信号

### 监测不到的signal

**vscode中的dlv debug, 直接 detach 或调用 ptrace 终止进程。**

- 真实结构是：```text
dlv (调试器进程)
   └── 被调试的 Go 进程
```

<br />

而且：
  - dlv 通过 **ptrace** 控制 Go 进程
  - Go 进程是被“trace”的状态<br />

暂停杀的是dlv调试程序，go进程无法监听到信号就被杀死了

**使用air的默认配置是无法触发优雅退出的**

实际结构是：

```text
air 进程
   └── 你的 Go 程序
```

和 dlv 不同的是：

- air 不使用 ptrace
- 它只是一个普通父进程
- 通过 fork/exec 启动你的程序

**优雅退出**应该这样做

```toml
[build]
  kill_delay = "5s"
  send_interrupt = true
```

在`build`选项后修改这两个配置项，`send_interrupt`指的是给子进程发`Ctrl + C`的退出信号，并预留5s的时间给子进程。

## 示例代码

```go
func (a *App) Start() {
	// 优雅关闭和退出
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		a.engine.Run(fmt.Sprintf(":%d", conf.GetGlobalConfig().Server.Port))
	}()

	<-quit

	log.Println("exit wschat")
}
```
