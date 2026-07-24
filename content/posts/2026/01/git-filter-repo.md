---
title: git-filter-repo 清理敏感信息
description: git-filter-repo清理敏感信息，防止git提交了敏感信息后导致的密钥泄漏
date: '2026-01-21'
updated: '2026-01-21'
categories:
- 工程实践
tags:
- git
draft: false
---

在开发过程中，不小心把 `config.yaml`（包含Mysql，Redis 等配置）提交进了 Git 仓库。
虽然随后通过提交把文件删除并加入了 `.gitignore`，但回过头来看，这个处理方式是**不完整的**。

原因很简单：
Git 会永久保留历史提交，只要有人 checkout 到旧 commit，配置内容依然是明文可见的。

## 问题本质

很多人第一次遇到这个问题，都会下意识做这些操作：

* 删除配置文件再提交
* 新增提交覆盖旧内容
* revert 某个提交

这些方式的共同问题是：
**它们只影响当前分支状态，不会影响 Git 历史中的对象。**

只要配置文件曾经被提交过，就必须假设已经泄露。

## 为什么要用 git-filter-repo

目前官方推荐的是 `git-filter-repo`，专门用于：

* 清理敏感文件
* 重写提交历史
* 仓库级别维护操作

## 安装 git-filter-repo

### macOS

```bash
brew install git-filter-repo
```

### Linux

```bash
pip3 install --user git-filter-repo
```

```bash
~/.local/bin/git-filter-repo --help
```

如果提示找不到命令，把路径加入 PATH：

```bash
export PATH=$PATH:~/.local/bin
```

## 如何使用 git-filter-repo 清理敏感信息

### 1. 使用 mirror 方式克隆仓库

```bash
git clone --mirror https://github.com/codepzj/demo-repo.git demo-repo-mirror
cd demo-repo-mirror
```

`--mirror` 的目的不是开发，而是为了：
1. 包含所有分支、tag、引用
2. 确保不会遗漏任何历史

### 2. 从所有历史提交中移除配置文件

```bash
git filter-repo --path config.yaml --invert-paths
```

执行完成后，git-filter-repo 会：

- 重写所有提交
- 删除旧的 blob 对象
- 重新打包仓库对象

如果看到类似：

```text
Parsed 15 commits
New history written
Repacking your repo
```

说明处理是成功的。

### 3. 重新添加远端并覆盖推送

git-filter-repo 会主动移除 `origin`，这是为了防止误推送。

```bash
git remote add origin https://github.com/codepzj/demo-repo.git
git push --force --mirror
```

这一步会直接用**新的干净历史**替换远端仓库。

## 如何确认是否真的清理干净

在任意新 clone 的仓库中执行：

```bash
git log --all -- config.yaml
```

如果没有任何输出，说明该文件已经不存在于历史中。

## 必须做的后续处理

### 1. 永久忽略该配置文件

```gitignore
config.yaml
```

同时提供示例文件：

```text
config.example.yaml
```

只放结构，不放真实值。

### 2. 重置所有相关密钥

无论泄露时间长短，都应视为已暴露：

* 数据库账号密码
* JWT Secret
* Firebase / 云服务凭证

历史清理只能解决 Git 层面的问题，**无法撤回已经泄露的密钥**。

## 多人协作需要注意的点

历史被重写后，所有协作者必须同步仓库状态：

```bash
git fetch --all
git reset --hard origin/main
```

如果有人直接 `git pull` 并再次推送，旧历史可能会被带回远端。

## 总结

这次问题的根源不是 Git 操作失误，而是：

对 Git 历史不可变性的低估。

只要敏感信息进入过仓库，正确的处理方式只有一种：

**重写历史，而不是覆盖提交。**

`git filter-repo + mirror + force push`是目前最稳妥、最可控的一套方案。
