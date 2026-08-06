# Kratos 日志系统与 Zap 集成

> 介绍 Kratos 日志组件的使用方式，并演示文件输出、Helper 封装以及与 Zap 日志库的集成。

## 官方文档

[https://go-kratos.dev/zh-cn/docs/component/log/](https://go-kratos.dev/zh-cn/docs/component/log/)

主要是看文档为主

## 写文件

```go
// 输出到 ./server.log 文件
f, err := os.OpenFile("server.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
if err != nil {
    return
}
```

## logger和helper

通过阅读kratos脚手架生成的代码发现，`logger`是在main函数当中注入进去的，`biz`和`data`在构造函数时`Helper`类型

- `main` 统一了日志的接入方式
- `biz和data`增强日志的使用

Helper更加全面，有`数据脱敏，字段级别过滤，语法糖`等功能

一般在`biz`或者`data`的构造函数添加字段的过滤

## 配合zap使用

### github参考代码

[https://github.com/go-kratos/kratos/blob/main/contrib/log/zap/zap.go](https://github.com/go-kratos/kratos/blob/main/contrib/log/zap/zap.go)

### 定义配置

```yaml
log:
  format: "text" # 日志格式，text, json
  log_file: "logs/server.log" # 日志文件
  max_size: 100 # 单个文件最大 10MB
  max_backups: 10 # 保留 10 个旧文件
  max_age: 30 # 保留 30 天
  compress: true # 启用压缩
```

### 封装logger

```text
internal/pkg/logger/zap.go
```

实现Log方法即可

```go
package logger

import (
    "fmt"

    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"

    "github.com/go-kratos/kratos/v2/log"
)

var _ log.Logger = (*Logger)(nil)

type Logger struct {
    log    *zap.Logger
    msgKey string
}

type Option struct {
    Format     string
    Level      string
    LogFile    string
    MaxSize    int32
    MaxBackups int32
    MaxAge     int32
    Compress   bool
}

func NewOption(format string, level string, logFile string, maxSize int32, maxBackups int32, maxAge int32, compress bool) *Option {
    return &Option{
        Format:     format,
        Level:      level,
        LogFile:    logFile,
        MaxSize:    maxSize,
        MaxBackups: maxBackups,
        MaxAge:     maxAge,
        Compress:   compress,
    }
}

func NewZapLogger(opts *Option) *Logger {
    var encoder zapcore.Encoder
    if opts.Format == "text" {
        encoder = zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
    } else {
        encoder = zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig())
    }

    core := zapcore.NewCore(encoder, getLogWriter(opts), parseLogLevel(opts.Level))

    return &Logger{log: zap.New(core), msgKey: log.DefaultMessageKey}
}

func (l *Logger) Log(level log.Level, keyvals ...any) error {
    // If logging at this level is completely disabled, skip the overhead of
    // string formatting.
    if zapcore.Level(level) < zapcore.DPanicLevel && !l.log.Core().Enabled(zapcore.Level(level)) {
        return nil
    }
    var (
        msg    = ""
        keylen = len(keyvals)
    )
    if keylen == 0 || keylen%2 != 0 {
        l.log.Warn(fmt.Sprint("Keyvalues must appear in pairs: ", keyvals))
        return nil
    }

    data := make([]zap.Field, 0, (keylen/2)+1)
    for i := 0; i < keylen; i += 2 {
        if keyvals[i].(string) == l.msgKey {
            msg, _ = keyvals[i+1].(string)
            continue
        }
        data = append(data, zap.Any(fmt.Sprint(keyvals[i]), keyvals[i+1]))
    }

    switch level {
        case log.LevelDebug:
        l.log.Debug(msg, data...)
        case log.LevelInfo:
        l.log.Info(msg, data...)
        case log.LevelWarn:
        l.log.Warn(msg, data...)
        case log.LevelError:
        l.log.Error(msg, data...)
        case log.LevelFatal:
        l.log.Fatal(msg, data...)
    }
    return nil
}

func (l *Logger) Sync() error {
    return l.log.Sync()
}

func (l *Logger) Close() error {
    return l.Sync()
}
internal/pkg/logger/log.go
package logger

import (
	"io"
	"os"

	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

func parseLogLevel(level string) zapcore.Level {
	switch level {
	case "debug":
		return zapcore.DebugLevel
	case "info":
		return zapcore.InfoLevel
	case "warn":
		return zapcore.WarnLevel
	case "error":
		return zapcore.ErrorLevel
	}
	return zapcore.InfoLevel
}

// 全量日志
func getLogWriter(opt *Option) zapcore.WriteSyncer {
	logger := &lumberjack.Logger{
		Filename:   opt.LogFile,
		MaxSize:    int(opt.MaxSize),
		MaxBackups: int(opt.MaxBackups),
		MaxAge:     int(opt.MaxAge),
		Compress:   opt.Compress,
	}
	ws := io.MultiWriter(logger, os.Stdout)
	return zapcore.AddSync(ws)
}
```

### 在main.go引入

```go
// zap 封装的日志
logger := log.With(logger.NewZapLogger(logger.NewOption(bc.Log)),
    "caller", log.DefaultCaller,
    "service.id", id,
    "service.name", Name,
    "service.version", Version,
    "trace.id", tracing.TraceID(),
    "span.id", tracing.SpanID(),
)
```
