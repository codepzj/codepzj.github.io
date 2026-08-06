# Go Air 热重载工具使用指南

> 介绍 Go Air 热重载工具的安装、初始化和配置方法，提升本地开发与调试效率。

用`fresh`用腻了，想使用`air`尝尝鲜，上`Github`一看，`air`的知名度比`fresh`高很多，于是直接开始吧。

## 直接安装

> **项目地址：https://github.com/air-verse/air**

```bash
go install github.com/air-verse/air@latest
```

## 开始使用

### 初始化

```bash
air init
```

然后项目根目录就会多出一个`.air.toml`

### 修改配置文件

#### 编译位置

```toml
cmd = "go build -o ./tmp/main.exe ./cmd/." # 根据main.go所在位置修改，如果为根目录设置为'.',当前main.go位于cmd文件夹中
```

#### 退出air删除exe

```toml
[misc]
  clean_on_exit = true # 在退出air的时候删除编译的exe
```

#### 完整配置文件

```toml
root = "."
testdata_dir = "testdata"
tmp_dir = "tmp"

[build]
  args_bin = []
  bin = "tmp\\main.exe"
  cmd = "go build -o ./tmp/main.exe ./cmd/." # 根据main.go所在位置修改，如果为根目录设置为'.',当前main.go位于cmd文件夹中
  delay = 1000
  exclude_dir = ["assets", "tmp", "vendor", "testdata"]
  exclude_file = []
  exclude_regex = ["_test.go"]
  exclude_unchanged = false
  follow_symlink = false
  full_bin = ""
  include_dir = []
  include_ext = ["go", "tpl", "tmpl", "html"]
  include_file = []
  kill_delay = "0s"
  log = "build-errors.log"
  poll = false
  poll_interval = 0
  post_cmd = []
  pre_cmd = []
  rerun = false
  rerun_delay = 500
  send_interrupt = false
  stop_on_error = false

[color]
  app = ""
  build = "yellow"
  main = "magenta"
  runner = "green"
  watcher = "cyan"

[log]
  main_only = false
  time = false

[misc]
  clean_on_exit = true # 在退出air的时候删除编译的exe

[proxy]
  app_port = 0
  enabled = false
  proxy_port = 0

[screen]
  clear_on_rebuild = false
  keep_scroll = true
```

### 运行

```bash
air # 默认直接读取.air.toml的配置
```

```bash
air -c config.toml # 指定配置文件
```
