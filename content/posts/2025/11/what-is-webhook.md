---
title: "Webhook 工作原理与 Go 实现"
description: "介绍 Webhook 的事件通知机制、典型使用场景，并使用 Go 和 Gin 实现简单的回调接口。"
date: '2025-11-18'
updated: '2025-11-18'
categories:
- 工程实践
tags:
- webhook
draft: false
---

## 概念
Webhook 属于一种事件驱动的消息推送机制。当特定事件被触发时，事件源会主动向预先配置的 webhook URL 发起 HTTP 请求。远程服务在收到请求后，会根据请求中携带的参数进行解析，并按照业务逻辑完成相应处理。



## webhook 和 api 的区别
+ webhook 是主动推送的机制，主动向预设 url 发请求
+ api 是需要被动请求的，需要调用方手动请求



## 具体使用场景
+ 支付后，发送通知给商家出货
+ 发博客后，主动发邮件
+ 日志告警，主动发送到钉钉机器人
+ 客服消息，主动推送到 n8n 工作流推送到飞书群



## 代码示例
```go
package main

import "github.com/gin-gonic/gin"

type WebhookRequest struct {
    Event string `json:"event" binding:"required"`
}

func main() {
    r := gin.Default()
    r.POST("/webhook", func(c *gin.Context) {
        var req WebhookRequest
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(400, gin.H{"error": err.Error()})
            return
        }
        webhookEvent := req.Event
        c.String(200, "webhook event: %s", webhookEvent)
    })
    r.Run(":8080")
}
```
