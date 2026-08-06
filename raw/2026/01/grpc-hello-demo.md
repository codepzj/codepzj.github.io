# 使用 Go 构建第一个 gRPC 服务

> 通过 Protocol Buffers 定义服务，生成 Go 代码并实现客户端与服务端，完成首个 gRPC 示例。

新建一个文件夹`hello`，分别创建`pb`,`server`,`client`三个文件夹

## 编写proto

新建`hello.proto`, 简单打个招呼吧

```proto
syntax = "proto3";

option go_package = "hello/pb;pb";

package pb;

message HelloRequest {
  string name = 1;
}

message HelloResponse {
  string message = 1;
}

service HelloService {
  rpc SayHello (HelloRequest) returns (HelloResponse);
}
```

执行protoc命令行生成go代码

```bash
protoc --go_out=. --go-grpc_out=. hello/pb/hello.proto
```

## 编写server端代码

分为四步:

1. 创建`tcp`连接
2. 创建`grpc`服务
3. 注册服务
4. 启动服务

### 代码

```go
package main

import (
	"context"
	"goplayground/rpc-learn/proto-learn/hello/pb"
	"log"
	"net"

	"google.golang.org/grpc"
)

type HelloServer struct {
	pb.UnimplementedHelloServiceServer
}

func (s *HelloServer) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloResponse, error) {
	name := req.GetName()
	return &pb.HelloResponse{Message: "hello " + name}, nil
}

func main() {
	l, err := net.Listen("tcp", "127.0.0.1:8082")
	if err != nil {
		log.Fatalf("fail to start tcp connection, err:%v", err)
	}

	// 1. 创建grpc服务
	s := grpc.NewServer()

	// 2. 注册服务
	pb.RegisterHelloServiceServer(s, &HelloServer{})

	// 3. 启动服务
	log.Println("gRPC server listening on 127.0.0.1:8082")
	if err := s.Serve(l); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
```

## 编写client端代码

分为三步:

1. 创建`grpc`连接，与server端连接
2. 创建`client`客户端对象
3. 在本地直接调用服务端方法

### 代码

```go
package main

import (
	"context"
	"flag"
	"goplayground/rpc-learn/proto-learn/hello/pb"
	"log"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	name = flag.String("name", "codepzj", "eg: -name=pzj")
)

func main() {
	flag.Parse()
	// 1. 创建连接 无需TLS认证
	conn, err := grpc.Dial("127.0.0.1:8082", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("failed to dial: %v", err)
	}
	defer conn.Close()

	// 2. 创建client对象
	client := pb.NewHelloServiceClient(conn)

	// 3. 调用方法
	resp, err := client.SayHello(context.Background(), &pb.HelloRequest{Name: *name})
	if err != nil {
		log.Fatalf("failed to call SayHello: %v", err)
	}
	log.Printf("Response: %s", resp.Message)
}
```
