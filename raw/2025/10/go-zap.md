# Go Zap实现日志双写和切割

> go-zap日志双写，日志切割，使用的zap库中的sugar版本

在 Go 项目中，日志系统是不可或缺的一部分。它不仅帮助我们定位问题、分析性能，还能在生产环境中追踪系统行为。
本文将介绍如何使用 **Zap + Lumberjack** 实现**高性能双写日志系统**：

- **全量日志（控制台 + 文件）**
- **错误日志（单独文件）**
- **自动日志切割与压缩**

## 一、为什么选择 Zap

Zap 是 Uber 开源的高性能日志库，号称“Go 语言最快的日志库之一”。
它有以下优点：

- **极致性能**：无反射、零分配（`Logger` 模式）
- **结构化日志**：天然支持键值对输出
- **灵活扩展**：可自定义 encoder、core、writer
- **生态完善**：支持 Lumberjack、K8s、ELK 等集成

## 二、为什么要用 Lumberjack

在长时间运行的服务中，日志会不断增大。
**Lumberjack** 是一个简单可靠的日志文件切割库，它支持：

- 按文件大小切割（`MaxSize`）
- 按天数保留（`MaxAge`）
- 保留备份数量（`MaxBackups`）
- 自动压缩（`Compress`）

## 三、实现效果

我们希望实现如下效果：

1. **server.log**
保存所有 Info 级别及以上的日志（包括终端输出）
2. **error.log**
仅保存 Error 级别及以上的日志
3. 日志文件自动切割、压缩
4. 控制台实时输出

## 四、完整代码示例

```go
package main

import (
	"io"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

func main() {
	// 定义编码器：使用 JSON 格式输出
	encoder := zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig())

	// 全量日志：控制台 + 文件
	coreFull := zapcore.NewCore(encoder, getFullLogWriter(), zapcore.InfoLevel)

	// 错误日志：仅文件
	coreError := zapcore.NewCore(encoder, getErrorLogWriter(), zapcore.ErrorLevel)

	// 合并两个 core
	core := zapcore.NewTee(coreFull, coreError)

	// 构建 logger
	logger := zap.New(core)
	sugarLogger := logger.Sugar()

	// 测试日志
	sugarLogger.Debug("这条不会输出，因为级别低于 Info")
	sugarLogger.Info("系统启动成功")
	sugarLogger.Error("这是错误日志")
}

// 全量日志（控制台 + 文件）
func getFullLogWriter() zapcore.WriteSyncer {
	fullLogger := &lumberjack.Logger{
		Filename:   "./server.log", // 日志文件路径
		MaxSize:    10,             // 单个文件最大 10MB
		MaxBackups: 5,              // 保留 5 个旧文件
		MaxAge:     30,             // 保留 30 天
		Compress:   true,           // 启用压缩
	}
	ws := io.MultiWriter(fullLogger, os.Stdout)
	return zapcore.AddSync(ws)
}

// 错误日志（仅文件）
func getErrorLogWriter() zapcore.WriteSyncer {
	errLogger := &lumberjack.Logger{
		Filename:   "./error.log",
		MaxSize:    10,
		MaxBackups: 5,
		MaxAge:     30,
		Compress:   true,
	}
	return zapcore.AddSync(errLogger)
}
```

## 五、运行效果

终端输出：

```json
{"level":"info","ts":1730265598.123,"msg":"系统启动成功"}
{"level":"error","ts":1730265598.125,"msg":"这是错误日志"}
```

`server.log` 文件中会保存全部 Info 以上日志。
`error.log` 文件中仅保存 Error 以上日志。
