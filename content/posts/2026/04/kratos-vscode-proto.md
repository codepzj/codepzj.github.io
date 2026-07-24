---
title: "VS Code 中配置 Protobuf 开发环境"
description: "介绍 VS Code 中 Protobuf 插件与导入路径的配置方法，解决 Kratos Proto 文件引用报错问题。"
date: '2026-04-12'
updated: '2026-04-12'
categories:
- 微服务
tags:
- Kratos
- Protobuf
---

新建`.vscode/settings.json`

```json
{
    "go.goroot": "/Users/pzj/.gvm/gos/go1.25.3",
    "protoc": {
        "options": [
            "--proto_path=./api",
            "--proto_path=./third_party",
            "--go_out=paths=source_relative:./api",
            "--go-http_out=paths=source_relative:./api",
            "--go-grpc_out=paths=source_relative:./api",
            "--openapi_out=fq_schema_naming=true,default_response=false:./api",
        ]
    }
}
```
