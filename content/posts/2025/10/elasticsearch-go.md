---
title: go-elasticsearch使用指南
description: go-elasticsearch v9版本go api的用法
date: '2025-10-27'
updated: '2025-10-27'
categories:
- 数据库
tags:
- es
draft: false
---

在 Go 项目中，Elasticsearch 是非常常用的搜索和分析引擎。随着官方 `go-elasticsearch` v9 的发布，TypedClient 的类型安全和请求构建方式发生了一些变化。本文结合示例代码，带你一步步掌握 Go 调用 Elasticsearch 的基本操作。


## 安装依赖

在 Go 项目中添加依赖：

```bash
go get github.com/elastic/go-elasticsearch/v9
```

TypedClient 默认提供类型安全的 API，可以直接操作索引、文档和聚合。


## 创建客户端

```go
cfg := es.Config{
    Addresses: []string{"http://127.0.0.1:9200"},
}
client, err := es.NewTypedClient(cfg)
if err != nil {
    log.Fatalf("创建 client 失败: %v", err)
}
```

注意：

1.必须带上协议头 `http://` 或 `https://`，否则会报 URL 解析错误。
2.如果 Elasticsearch 开启了用户名密码认证，可以通过 `cfg.Username` 和 `cfg.Password` 设置。

## 创建索引

```go
index, err := client.Indices.Create("my-index").Do(context.Background())
if err != nil {
    log.Fatalf("创建索引失败: %v", err)
}
fmt.Println("索引创建成功:", index)
```

索引创建后，你就可以存储文档。


## CRUD 操作

### 创建文档

```go
doc := struct {
    Name  string `json:"name"`
    Score int64  `json:"score"`
}{"codepzj", 100}

resp, err := client.Index("my-index").
    Document(doc).
    Id("1").
    Header("Content-Type", "application/json").
    Header("Accept", "application/json").
    Do(context.Background())
if err != nil {
    log.Fatalf("创建文档失败: %v", err)
}
fmt.Println("文档创建成功:", resp)
```

> **注意**：TypedClient v9 需要显式设置 `Content-Type` 和 `Accept` 为 `application/json`，否则会报 `[media_type_header_exception]`。

### 查询文档

```go
resp, err := client.Get("my-index", "1").
    Header("Content-Type", "application/json").
    Header("Accept", "application/json").
    Do(context.Background())
if err != nil {
    log.Fatalf("获取文档失败: %v", err)
}
fmt.Println("文档内容:", resp)
```

### 更新文档

```go
docUpdate := struct {
    Score int64 `json:"score"`
}{666}

resp, err := client.Update("my-index", "1").
    Doc(docUpdate).
    Header("Content-Type", "application/json").
    Header("Accept", "application/json").
    Do(context.Background())
if err != nil {
    log.Fatalf("更新文档失败: %v", err)
}
fmt.Println("文档更新成功:", resp)
```

### 删除文档

```go
resp, err := client.Delete("my-index", "1").
    Header("Content-Type", "application/json").
    Header("Accept", "application/json").
    Do(context.Background())
if err != nil {
    log.Fatalf("删除文档失败: %v", err)
}
fmt.Println("文档删除成功:", resp)
```

## 搜索文档

### 查询全部文档

```go
resp, err := client.Search().
    Index("my-index").
    Query(&types.Query{
        MatchAll: &types.MatchAllQuery{},
    }).
    Header("Content-Type", "application/json").
    Header("Accept", "application/json").
    Do(context.Background())
if err != nil {
    log.Fatalf("搜索文档失败: %v", err)
}

for _, hit := range resp.Hits.Hits {
    fmt.Printf("%s\n", hit.Source_)
}
```

### 精确匹配

```go
resp, err := client.Search().
    Index("my-index").
    Query(&types.Query{
        MatchPhrase: map[string]types.MatchPhraseQuery{
            "name": {Query: "666"},
        },
    }).
    Header("Content-Type", "application/json").
    Header("Accept", "application/json").
    Do(context.Background())
```

> **注意**：查询字段必须和文档字段一致，否则查不到结果。


## 聚合查询（求平均分）

```go
resp, err := client.Search().Index("my-index").
Request(&search.Request{
    Aggregations: map[string]types.Aggregations{
        "avg_score": {
            Avg: &types.AverageAggregation{
                Field: some.String("score"),
            },
        },
    },
}).
Header("Content-Type", "application/json").
Header("Accept", "application/json").Do(context.Background())
if err != nil {
    log.Fatalf("搜索文档失败: %v", err)
}
avgScore := resp.Aggregations["avg_score"]
fmt.Println(avgScore)
```


## 总结

>TypedClient v9 类型安全，但需要显式设置 `Content-Type` 和 `Accept`。
>
>字段名必须和索引映射一致，否则搜索不到结果。
>
>聚合结果通过 `Value` 访问，不再有直接类型字段。
>
>建议封装 CRUD/聚合函数，避免每次手动加 Header 和解指针。

TypedClient v9 设计更规范，但和老版本用法差异大，如果你熟悉老版 `elastic`，初期可能会觉得麻烦。不过掌握了 `Header`、`Request` 和 `types.Aggregate` 的使用后，开发效率还是很高的。
