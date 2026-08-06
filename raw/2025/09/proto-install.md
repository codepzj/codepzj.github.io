# Protocol Buffers 安装与 Go 插件配置

> 介绍 protoc 的命令行安装方式、环境变量配置，以及 Go 代码生成插件的安装与验证。

## 命令行安装

### linux

```bash
# 更新包列表
sudo apt update

# 安装 unzip（后面解压 protoc 用）
sudo apt install -y unzip

# 下载 protoc（这里用 v27.1，你也可以换最新的）
PROTOC_ZIP=protoc-27.1-linux-x86_64.zip
wget https://github.com/protocolbuffers/protobuf/releases/download/v27.1/$PROTOC_ZIP

# 解压到 /usr/local
sudo unzip -o $PROTOC_ZIP -d /usr/local bin/protoc
sudo unzip -o $PROTOC_ZIP -d /usr/local 'include/*'

# 删除压缩包
rm -f $PROTOC_ZIP
```

### mac

```bash
# 下载
curl -SL -O https://github.com/protocolbuffers/protobuf/releases/download/v33.2/protoc-33.2-osx-aarch_64.zip

# 解压
sudo unzip -o protoc-33.2-osx-aarch_64.zip -d ./protoc
```

记得把环境变量加入`~/.zshrc`中

```bash
# protoc
export PROTOC="/opt/protoc"
export PATH="$PROTOC/bin:$PATH"
```

## Github 安装

前往 [https://github.com/protocolbuffers/protobuf/releases](https://github.com/protocolbuffers/protobuf/releases)

对应的`protoc`目录树

```bash
pzj@pzjmac protoc % tree
.
├── bin
│   └── protoc
├── include
│   └── google
│       └── protobuf
│           ├── any.proto
│           ├── api.proto
│           ├── compiler
│           │   └── plugin.proto
│           ├── cpp_features.proto
│           ├── descriptor.proto
│           ├── duration.proto
│           ├── empty.proto
│           ├── field_mask.proto
│           ├── go_features.proto
│           ├── java_features.proto
│           ├── source_context.proto
│           ├── struct.proto
│           ├── timestamp.proto
│           ├── type.proto
│           └── wrappers.proto
└── readme.txt

6 directories, 17 files
```

## 安装Go插件

安装go对应的proto插件

```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

验证是否安装成功

```bash
protoc-gen-go --version
protoc-gen-go-grpc --version
```

## oneof语法

在proto语法当中`oneof`关键字比较特殊，代表多选一
实际上就是定义proto时不确定使用什么字段，设置`oneof`，本质上类似Go语法当中的枚举类型

举个例子

如果我的博客文章更新了，既可以选择短信推送也可以选择邮件推送

可以这样定义`proto`

```proto
syntax = "proto3";

option go_package="hello/pb;pb";

package pb;

message NoticeRequest {
    string msg = 1;
    oneof msg_type {
        string phone = 2;
        string email = 3;
    }
}

message NoticeResponse {
    string msg = 1;
}

service NoticeService {
    rpc Notice (NoticeRequest) returns (NoticeResponse);
}
```

定义server端代码

```go
type NoticeServer struct {
	pb.UnimplementedNoticeServiceServer
}

func (s *NoticeServer) Notice(ctx context.Context, req *pb.NoticeRequest) (*pb.NoticeResponse, error) {
	send_msg := req.Msg
	switch req.MsgType.(type) { // 类型断言
	case *pb.NoticeRequest_Email:
		send_msg += " send by email:" + req.GetEmail()
	case *pb.NoticeRequest_Phone:
		send_msg += " send by phone" + req.GetPhone()
	}

	return &pb.NoticeResponse{
		Msg: send_msg,
	}, nil
}
```

根据传过来的值进行**类型断言**后继续处理

定义client端代码

```go
// notice
noticeResp, err := noticeClient.Notice(ctx, &pb.NoticeRequest{Msg: *msg, MsgType: &pb.NoticeRequest_Phone{
	Phone: "15811111111",
}})
if err != nil {
	log.Fatalf("failed to call Notice[phone]: %v", err)
}
log.Printf("Response: %s", noticeResp.Msg)

noticeResp, err = noticeClient.Notice(ctx, &pb.NoticeRequest{Msg: *msg, MsgType: &pb.NoticeRequest_Email{
	Email: "email@codepzj.cn",
}})
if err != nil {
	log.Fatalf("failed to call Notice[email]: %v", err)
}
log.Printf("Response: %s", noticeResp.Msg)
```

可以定义phone和email两种不同的请求信息
