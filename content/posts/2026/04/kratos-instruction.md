---
title: "Kratos 常用命令速查"
description: "整理 Kratos 项目运行、构建、添加 Proto 文件和生成服务代码等常用命令。"
date: '2026-04-12'
updated: '2026-04-12'
categories:
- 微服务
tags:
- Kratos
- Protobuf
---

## 运行项目

### CLI运行

```bash
kratos run
```

### **手动编译**

```bash
go build -o ./bin ./...
./helloworld -conf ../configs
```

## proto生成模版

### client

```bash
kratos proto add api/shortvid-service/v1/file.proto
```

### server

```bash
kratos proto server api/shortvid-service/v1/file.proto -t app/shortvid-service/internal/service
```
