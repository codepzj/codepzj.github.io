---
title: Github CI自动发版
description: "介绍如何通过 GitHub Actions 和 Semantic Release 自动生成版本号、Tag 与发布记录。"
date: '2026-02-15'
updated: '2026-02-18'
categories:
- 工程实践
tags:
- git
draft: false
---

介绍一款CI插件, 叫`semantic-release`, 根据提交信息, 自动打tag后发布release

| 提交类型 | 版本提升                    |
| -------- | --------------------------- |
| `feat`   | **MINOR**(1.1.2 -> 1.2.0)   |
| `fix`    | **PATCH**(1.1.2 -> 1.1.3)   |

我们在生产环境经常需要发版, 所以`semantic-release`是比较好的选择, 无需我们手动打tag并发布



> 不过需要注意的是, 需要对代码进行测试, 能够正常build的才能走自动化打包发版的流程



## 例子

下面用github发版`Go SDK`包为例子

### `release.yml`

```yaml
name: Go SDK Release

on:
  push:
    branches:
      - main

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      # 拉代码
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # ---------- Go 环境 ----------
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'
          cache: true

      - name: Go mod tidy
        run: go mod tidy

      - name: Go build
        run: go build ./...

      # ---------- Node 环境 ----------
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      # ---------- Semantic Release ----------
      - name: Run semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release
```

### `.releaserc.json`

```json
{
    "branches": [
        "main"
    ],
    "tagFormat": "v${version}",
    "plugins": [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/github"
    ]
}
```



## 具体仓库参考

https://github.com/codepzj/go-lib
