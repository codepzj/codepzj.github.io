---
title: kratos中proto文件引入其他proto爆红
description: "记录 VS Code 开发 Kratos 时 Proto 文件跨目录引用报错的原因，以及插件配置解决方法。"
date: '2025-10-25'
updated: '2025-10-25'
categories:
- 微服务
tags:
- bug
- kratos
draft: false
---

在根目录下新建`.vscode/settings.json`

写入代码

```json
{
    "protoc": {
        "options": [
            "--proto_path=${workspaceFolder}/api",
        ]
    }
}
```

即可解决报错，特此记录
