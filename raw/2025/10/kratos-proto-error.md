# kratos中proto文件引入其他proto爆红

> 记录 VS Code 开发 Kratos 时 Proto 文件跨目录引用报错的原因，以及插件配置解决方法。

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
