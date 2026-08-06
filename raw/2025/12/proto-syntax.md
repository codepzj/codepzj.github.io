# Protocol Buffers 核心语法详解

> 系统介绍 Protocol Buffers 的消息、字段、枚举、服务、导入、oneof 和包装类型等核心语法。

虽然语法繁多但是每一个都很简单

## syntax

语法，目前主要设置为`proto3`

```proto
syntax = "proto3";
```

## package

用于指定生成的go文件所在文件夹的名称

## go_package

因为go插件是通过`proto`文件是生成对应的go代码，所以go_package相当于要生成的文件的`package`属性，用于指定包名

如：

```proto
option go_package="proto-learn/pb/person;person";
```

分号隔开的是别名

```go
// 写了别名
import (
	user "proto-learn/pb/user"
)

// 没写别名
import (
	"proto-learn/pb/user"
)
```

## message

定义结构体

```proto
message MyStruct {
	... // 字段名
}
```

定义变量，语法：`类型 变量名 = 标识符[一般为数字,递增];`

其实我觉得有一点点像C++语法

<table>
<thead>
  <tr>
    <th>
      类型
    </th>
    
    <th>
      含义
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      string
    </td>
    
    <td>
      字符串
    </td>
  </tr>
  
  <tr>
    <td>
      int32
    </td>
    
    <td>
      32位整型<span>
        2^31
      </span>
    </td>
  </tr>
  
  <tr>
    <td>
      int64
    </td>
    
    <td>
      64位整型<span>
        2^63
      </span>
    </td>
  </tr>
  
  <tr>
    <td>
      float
    </td>
    
    <td>
      32位精度浮点型<span>
        2^127
      </span>
    </td>
  </tr>
  
  <tr>
    <td>
      double
    </td>
    
    <td>
      64位精度浮点型<span>
        2^1023
      </span>
    </td>
  </tr>
  
  <tr>
    <td>
      bool
    </td>
    
    <td>
      布尔
    </td>
  </tr>
  
  <tr>
    <td>
      repeated
    </td>
    
    <td>
      切片
    </td>
  </tr>
  
  <tr>
    <td>
      map<K,V>
    </td>
    
    <td>
      map
    </td>
  </tr>
  
  <tr>
    <td>
      reversed
    </td>
    
    <td>
      保留字
    </td>
  </tr>
  
  <tr>
    <td>
      enum
    </td>
    
    <td>
      枚举
    </td>
  </tr>
  
  <tr>
    <td>
      oneof
    </td>
    
    <td>
      多选一
    </td>
  </tr>
</tbody>
</table>

## service

这是定义方法的地方，主要分为四种

- 即刻响应
- 输入流
- 输出流
- 输入输出流

```proto
service PersonService {
    rpc GetPerson (Person) returns (Person); // 即刻响应
    rpc GetPersonIn (stream Person) returns (Person); // 输入以流的形式
    rpc GetPersonOut (Person) returns (stream Person); // 输出以流的形式
    rpc GetPersonIO (stream Person) returns (stream Person); // 输入输出都以流的形式
}
```

## 示例代码

```proto
syntax = "proto3";

package person;
option go_package="proto-learn/pb/person;person";

import "pb/user/user.proto";

message Person{
    string name = 1;
    int64 age = 2;
    float height = 3;
    double weight = 4;
    bool isMale = 5;
    repeated string lessons = 6;
    message Friend {
        string name = 7;
    }
    Friend friend = 8;
    map<string,int64> scores = 9;

    reserved "reversed_field"; // 保留字段
    reserved 10; // 保留唯一标识
    
    // 枚举类型
    enum Subjects{
        Chinese = 0;
        Math = 1;
        English = 2;
    }

    Subjects subject = 11;

    // oneof
    oneof Teacher{
        string Teacher1 = 12;
        string Teacher2 = 13;
        string Teacher3 = 14;
    }

    user.UserReq req = 15;
}

service PersonService {
    rpc GetPerson (Person) returns (Person); // 即刻响应
    rpc GetPersonIn (stream Person) returns (Person); // 输入以流的形式
    rpc GetPersonOut (Person) returns (stream Person); //输出以流的形式
    rpc GetPersonIO (stream Person) returns (stream Person); // 输入输出都以流的形式
}
```

## 命令行生成

编写makefile脚本

```makefile
.PHONY: gen-user gen-person

gen-user:
	protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative ./pb/user/user.proto

gen-person:
	protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative ./pb/person/person.proto
```

执行`make gen-person`即可生成

现在我来解释一下命令行的各个参数，在学习的时候也踩了很多坑

- `--go_out`: pb.go生成的相对目录
- `--go-grpc_out`: grpc.pb.go生成的相对目录
- `--go_opt=paths=source_relative`: 如果不写的话，默认生成的是go_package的目录，这样写的话就和proto定义的位置一致
- `--go-grpc_opt=paths=source_relative`: 如果不写的话，默认生成的是go_package的目录，这样写的话就和proto定义的位置一致

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

## WrapperValue和optional

对于Go语言来说，如果对于`int32`类型来说，传参为0和不传参得到的零值都为0，怎么判断这个参数传没传呢？

答案是使用**结构体和指针**

在protobuf当中对应`WrapperValue`和`optional`两个关键字

protobuf v3在删除required的同时把optional也一起删除了（v3.15.0又加回来了），这使得我们没办法轻易判断某些字段究竟是未赋值还是其被赋值为零值。

> WrapperValue适用于v3.15之前的版本，optional适合v3.15之后的版本，不过现在的protoc都v33了😂

WrapperValue位于protoc的include目录下的`google/protobuf/wrappers.proto`中

### 示例代码

#### proto

```proto
syntax = "proto3";

option go_package = "hello/pb;pb";

import "google/protobuf/wrappers.proto";

message BookRequest {
    string name = 1;
    google.protobuf.Int32Value price = 2;
    optional string author = 3;
}

message BookResponse {
    string msg = 1;
}

service BookService {
    rpc Buy (BookRequest) returns (BookResponse);
}
```

#### server

```go
type BookServer struct {
	pb.UnimplementedBookServiceServer
}

func (s *BookServer) Buy(ctx context.Context, req *pb.BookRequest) (*pb.BookResponse, error) {
	if req.Price == nil {
		return &pb.BookResponse{Msg: "price没传, 可能是无价之宝"}, nil
	}
	msg := fmt.Sprintf("%s这本书价格为:%d元", req.Name, req.GetPrice().GetValue())
	if req.Author != nil {
		msg += ",作者为:" + req.GetAuthor()
	}
	return &pb.BookResponse{Msg: msg}, nil
}
```

#### client

```go
// book
author := "codepzj"
bookResp, err := bookClient.Buy(ctx, &pb.BookRequest{Name: "《Go语言圣经》", Price: &wrapperspb.Int32Value{Value: 99}, Author: &author})
if err != nil {
	log.Fatalf("failed to call Buy: %v", err)
}
log.Printf("Response: %s", bookResp.Msg)

bookResp, err = bookClient.Buy(ctx, &pb.BookRequest{Name: "《如何让富婆爱上你》"})
if err != nil {
	log.Fatalf("failed to call Buy: %v", err)
}
log.Printf("Response: %s", bookResp.Msg)
```

#### 输出结果

```bash
2025/12/12 00:33:26 Response: 《Go语言圣经》这本书价格为:99元,作者为:codepzj
2025/12/12 00:33:26 Response: price没传, 可能是无价之宝
```

本质上就是把字段拿出来判断指针是否为nil，如果为nil，说明字段没有赋值，不为nil，说明字段有值

## 代码仓库

本教程都是一步步手敲出来的，对应的代码仓库链接为：

[https://cnb.cool/codepzj/goplayground/-/tree/main/rpc-learn/proto-learn](https://cnb.cool/codepzj/goplayground/-/tree/main/rpc-learn/proto-learn)

参考文章：

- [https://www.liwenzhou.com/posts/Go/Protobuf3-language-guide-zh/](https://www.liwenzhou.com/posts/Go/Protobuf3-language-guide-zh/)
- [https://www.liwenzhou.com/posts/Go/oneof-wrappers-field_mask/](https://www.liwenzhou.com/posts/Go/oneof-wrappers-field_mask/)
