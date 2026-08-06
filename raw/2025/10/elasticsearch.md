# Elasticsearch 安装与基础操作

> elasticsearch是一个分布式搜索引擎，本文讲述了elasticsearch的安装与使用

## 介绍

Elasticsearch 是一个高度可扩展的开源实时搜索和分析引擎，它允许用户在近实时的时间内执行全文搜索、结构化搜索、聚合、过滤等功能。Elasticsearch 基于 Lucene 构建，提供了强大的全文搜索功能，并且具有广泛的应用领域，包括日志和实时分析、社交媒体、电子商务等。

Elasticsearch 为所有类型的数据提供近乎实时的搜索和分析。无论是结构化文本还是非结构化文本、数字数据或地理空间数据，Elasticsearch 都能够以支持快速搜索的方式有效地存储和索引它们。除了简单的数据检索和聚合信息之外，还可以用 Elasticsearch 发现数据中的趋势和模式。随着数据和查询量的增长，Elasticsearch 的分布式特性能够横向扩展至数以百计的服务器存储以及处理PB级的数据，同时可以在极短的时间内索引、搜索和分析大量的数据。，

## 安装

```yaml
version: "3.8"

services:
  elasticsearch:
    container_name: elasticsearch
    image: docker.elastic.co/elasticsearch/elasticsearch:8.9.1
    environment:
      - node.name=elasticsearch
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - 9200:9200
      - 9300:9300
    networks:
      - elastic
  kibana:
    image: docker.elastic.co/kibana/kibana:8.9.1
    container_name: kibana
    ports:
      - 5601:5601
    networks:
      - elastic
    depends_on:
      - elasticsearch

networks:
  elastic:
```

kibana提供Elasticsearch的命令行工具

执行`docker-compose up -d`启动ES镜像

## 使用

### 查看索引

```http
GET /_cat/indices?v
```

### 创建索引

```http
PUT /my1
```

### 创建文档

```http
POST /my1/_create/1
{
  "name": "codepzj",
  "age": 18
}

POST /my1/_create/2
{
  "name": "codepzj",
  "age": 20
}
```

### 获取文档的数据

```http
GET /my1/_source/1
```

### 查看文档是否存在

```http
HEAD /my1/_doc/2
```

### 更新文档

```http
POST /my1/_update/1
{
  "doc": {
    "name": "codepzj",
    "age": 20
  }
}
```

### 批量获取文档

```http
GET /my1/_mget
{
  "docs": [
    {
      "_id": "1"
    },
    {
      "_id": "2"
    }
  ]
}
```

### 删除文档

```http
DELETE /my1/_doc/2
```

### 全局检索

```http
GET /_search
```

### 索引检索

```http
GET /my1/_search
```

## kibana的使用

点击`Devtools`，直接输入ES命令即可

![image-20251027213638469](https://cdn.jsdelivr.net/gh/codepzj/images@main/20251027213655202.png)
