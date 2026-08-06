# gRPC Metadata 的传递与使用

> 介绍 gRPC Metadata 的创建、发送和读取方法，以及 Header、Trailer 在客户端与服务端之间的传递。

## 什么是metadata

> metadata即为元信息，记录k、v键值对，类似于http请求当中的header，常用于RPC请求当中的鉴权、追溯和验签等场景，元数据可以包含**认证token**、**请求标识**和**监控标签**等

metadata的数据类型

```go
type MD map[string][]string
```

元数据可以像普通map一样读取。注意，这个 map 的值类型是<span>



</span>

string，因此用户可以使用一个键附加多个值。

## 创建metadata

### metadata.Pairs

```go
md := metadata.Pairs(
    "x-token", "codepzj-authorization-key",
    "X-TOKEN", "codepzj-authorization-key-2",
    "req_id", "req_123456",
)
```

需要注意的是key是大小写不敏感的，`x-token`和`X-TOKEN`会被识别为同一个key，最终值为`["codepzj-authorization-key", "codepzj-authorization-key-2"]`

### k、v字符串

在客户端发起调用的时候，以k、v字符串附加到`AppendToOutgoingContext`之后

```go
ctx := metadata.AppendToOutgoingContext(context.Background(), "x-token", "codepzj-authorization-key", "req_id", "req_123456")
```

## 客户端发送metadata，服务端接收metadata

### client

```go
ctx := metadata.AppendToOutgoingContext(context.Background(), "x-token", "codepzj-authorization-key", "req_id", "req_123456")

resp, err := client.SayHello(ctx, &pb.HelloRequest{Name: *name})
```

### server

```go
// 1. 接受来自客户端的metadata
md, ok := metadata.FromIncomingContext(ctx)
if !ok {
    return nil, status.Error(codes.Unauthenticated, "metadata missing")
}

log.Printf("md: %+v\n", md)

// 2. 解析metadata
xToken, ok := md["x-token"]
if !ok {
    return nil, status.Error(codes.Unauthenticated, "x-token missing")
}
if len(xToken) == 0 {
    return nil, status.Error(codes.Unauthenticated, "x-token missing")
}

log.Println("x-token", xToken[0])
```

## 服务端发送metadata，客户端接收metadata

### server

```go
// 3. 服务端设置metadata, 发送给客户端
header := metadata.Pairs("x-server", "ok")
if err := grpc.SendHeader(ctx, header); err != nil {
    log.Println("Failed to set header from SayHello")
}
defer func() {
    trailer := metadata.Pairs("x-trailer", "ok")
    if err := grpc.SetTrailer(ctx, trailer); err != nil {
        log.Println("Failed to set trailer from SayHello")
    }
}()
```

直接`grpc.SendHeader` & `grpc.SetTrailer`

### client

```go
var header, trailer metadata.MD
resp, err := client.SayHello(ctx, &pb.HelloRequest{Name: *name}, grpc.Header(&header), grpc.Trailer(&trailer))
if err != nil {
    log.Fatalf("failed to call SayHello: %v", err)
}
log.Printf("Response: %s", resp.Message)
log.Printf("Header: %s", header)
```

在发请求前绑定`header` OR `trailer`，收到server响应就绑定到`header` OR `trailer`上了

## 参考文章

- [https://liwenzhou.com/posts/Go/gRPC/](https://liwenzhou.com/posts/Go/gRPC/)

## 代码仓库

- [https://cnb.cool/codepzj/goplayground/-/tree/main/rpc-learn/grpc-metadata](https://cnb.cool/codepzj/goplayground/-/tree/main/rpc-learn/grpc-metadata)
