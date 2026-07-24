---
title: "gRPC 四种通信模式详解"
description: "介绍 gRPC 的普通调用、客户端流、服务端流和双向流四种通信模式，并给出 Go 示例。"
date: '2025-12-16'
updated: '2026-01-05'
categories:
- 微服务
tags:
- gRPC
- 微服务
---

本文主要介绍 gRPC 的四种调用方式。

## 官方教程

https://grpc.io/docs/languages/go/basics/

## gRPC 的四种调用方式

分为四部分：`Unary RPC`、`Client Streaming`、`Server Streaming`、`Bidirectional Streaming`

### 1. Unary RPC

> 客户端发送单个请求，服务器返回单个响应，类似http请求，此处代码略过...

### 2. Client Streaming

> 客户端发送多条消息，服务器接收所有消息后返回一个聚合响应

**客户端示例**:
```go
userStream, _ := aiClient.ChatWithUserStream(ctx)
words := []string{"how", "are", "you"}
for _, word := range words {
    userStream.Send(&pb.ChatMsg{Msg: word})
}
userStreamReply, _ := userStream.CloseAndRecv()
```

**服务端示例**:
```go
func (s *AIService) ChatWithUserStream(stream grpc.ClientStreamingServer[pb.ChatMsg, pb.ChatMsg]) error {
    respMsg := ""
    for {
        chatReq, err := stream.Recv()
        if err == io.EOF {
            return stream.SendAndClose(&pb.ChatMsg{Msg: respMsg})
        }
        respMsg = respMsg + chatReq.Msg
    }
}
```

### 3. Server Streaming

> 客户端发送单个请求，服务器返回多条消息流

**客户端示例**:
```go
aiStream, _ := aiClient.ChatWithAIStream(ctx, &pb.ChatMsg{Msg: "hello,I want to ask a question"})
for {
    aiStreamReply, err := aiStream.Recv()
    if err == io.EOF {
        break
    }
    log.Println(aiStreamReply.Msg)
}
```

**服务端示例**:
```go
func (s *AIService) ChatWithAIStream(in *pb.ChatMsg, stream grpc.ServerStreamingServer[pb.ChatMsg]) error {
    stream.Send(&pb.ChatMsg{Msg: in.Msg})
    words := []string{"wait", "a", "minute"}
    for _, word := range words {
        stream.Send(&pb.ChatMsg{Msg: word})
    }
    return nil
}
```

### 4. Bidirectional Streaming

> 客户端和服务器都可以随时发送消息，类似于实时聊天

**客户端示例**:
```go
userAIStream, _ := aiClient.ChatWithUserAIStream(ctx)

// 启动 goroutine 接收服务器消息
go func() {
    for {
        userAIStreamReply, err := userAIStream.Recv()
        if err != nil {
            log.Fatalf("failed to get userAIStreamReply,err:%v", err)
        }
        log.Println(userAIStreamReply.Msg)
    }
}()

// 从标准输入读取并发送消息
for {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    userAIStream.Send(&pb.ChatMsg{Msg: line})
}
```

**服务端示例**:
```go
func (s *AIService) ChatWithUserAIStream(stream grpc.BidiStreamingServer[pb.ChatMsg, pb.ChatMsg]) error {
    for {
        chatReq, err := stream.Recv()
        if err == io.EOF {
            break
        }
        if err != nil {
            return err
        }
        replyMsg := replace(chatReq.Msg)  // 文本转换
        stream.Send(&pb.ChatMsg{Msg: replyMsg})
    }
    return nil
}
```

## 后端代码地址

https://cnb.cool/codepzj/goplayground/-/tree/main/rpc-learn/grpc-4method
