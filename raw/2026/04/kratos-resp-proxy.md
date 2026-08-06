# Kratos 自定义 HTTP 响应与错误处理

> 介绍如何在 Kratos 中自定义 HTTP 成功响应与错误响应，并结合 Proto 错误码统一接口格式。

在我们的日常开发中，HTTP响应通常包含如下几个字段，但是kratos并没有去帮助我们封装这个响应体，而是靠我们手动构造

```json
{
  success: true,
  code: 200,
  msg: "success",
  data: []
}
```

## 常规响应

kratos没有统一的响应格式，都是我们程序员自定义的，如果说要更换相应格式，那么我们应该对其默认的响应结构体编码进行修改

默认使用的`DefaultResponseEncoder`

```go
// DefaultResponseEncoder encodes the object to the HTTP response.
func DefaultResponseEncoder(w http.ResponseWriter, r *http.Request, v interface{}) error {
        if v == nil {
                return nil
        }
        if rd, ok := v.(Redirector); ok {
                url, code := rd.Redirect()
                http.Redirect(w, r, url, code)
                return nil
        }
        codec, _ := CodecForRequest(r, "Accept")
        data, err := codec.Marshal(v)
        if err != nil {
                return err
        }
        w.Header().Set("Content-Type", httputil.ContentType(codec.Name()))
        _, err = w.Write(data)
        if err != nil {
                return err
        }
        return nil
}
```

自定义`ResponseEncoder`

```go
// 自定义响应格式
func ResponseEncoder(w http.ResponseWriter, r *http.Request, v interface{}) error {
    if v == nil {
        return nil
    }
    if rd, ok := v.(kratos_http.Redirector); ok {
        url, code := rd.Redirect()
        http.Redirect(w, r, url, code)
        return nil
    }
    codec, _ := kratos_http.CodecForRequest(r, "Accept")
    resp := &httpResponse{
        Success: true,
        Code:    200,
        Msg:     "success",
        Data:    v,
    }
    data, err := codec.Marshal(resp)
    if err != nil {
        return err
    }
    w.Header().Set("Content-Type", "application/"+codec.Name())
    _, err = w.Write(data)
    return err
}
```

在`internal/server/http.go`下添加配置

```go
// 自定义响应体
opts = append(opts, http.ResponseEncoder(ResponseEncoder))
srv := http.NewServer(opts...)
```

## 错误响应

```go
// 自定义错误格式
func ErrorEncoder(w http.ResponseWriter, r *http.Request, err error) {
	resp := new(httpResponse)
	// 如果能从kratos error解析出来, 则使用对应的code和message作为错误响应
	if gs, ok := status.FromError(err); ok {
		resp = &httpResponse{
			Success: false,
			Code:    kratos_status.FromGRPCCode(gs.Code()),
			Msg:     gs.Message(),
			Data:    nil,
		}
	} else {
		resp = &httpResponse{
			Success: false,
			Code:    http.StatusInternalServerError,
			Msg:     err.Error(),
			Data:    nil,
		}
	}
	codec, _ := kratos_http.CodecForRequest(r, "Accept")
	body, err := codec.Marshal(resp)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/"+codec.Name())
	w.WriteHeader(resp.Code) // 响应状态码
	_, _ = w.Write(body)
}
```

在`internal/server/http.go`下添加配置

```go
// 自定义错误响应
opts = append(opts, http.ErrorEncoder(ErrorEncoder))
```

首先先解析错误，看看是否符合grpc格式，如果符合将原本在grpc中的Code和Message写入自定义的结构体当中，如果不符合则返回默认的状态码500，并且写入响应体body当中

## 自定义错误状态码

[https://go-kratos.dev/zh-cn/docs/component/errors/](https://go-kratos.dev/zh-cn/docs/component/errors/)

安装kratos错误处理相关的proto包

```bash
go install github.com/go-kratos/kratos/cmd/protoc-gen-go-errors/v2@latest
```

在`api/shortvid-service/v1`下新建`errors.proto`

```proto
syntax = "proto3";

option go_package = "shortvid-backend/api/shortvid-service/v1;v1";

import "errors/errors.proto";

enum ErrorReason {
    // 设置缺省错误码
    option (errors.default_code) = 500;
    
    // 用户相关
    USER_NOT_FOUND = 0 [(errors.code) = 404];
}
```

然后生成对应的客户端代码

`Makefile`中写入

```makefile
.PHONY: errors
# errors
errors:
        protoc --proto_path=. \
         --proto_path=./third_party \
         --go_out=paths=source_relative:. \
         --go-errors_out=paths=source_relative:. \
         $(API_PROTO_FILES)
```

然后执行

```bash
make errors
```

在service层使用自定义的枚举错误常量

```go
if userModel == nil {
    return nil, v1.ErrorUserNotFound("user not found")
}
```

完整代码

```go
server/encoder.go
package server

import (
    "net/http"

    kratos_http "github.com/go-kratos/kratos/v2/transport/http"
    kratos_status "github.com/go-kratos/kratos/v2/transport/http/status"
    "google.golang.org/grpc/status"
)

type httpResponse struct {
    Success bool   `json:"success"`
    Code    int    `json:"code"`
    Msg     string `json:"msg"`
    Data    any    `json:"data,omitempty"`
}

// 自定义响应格式
func ResponseEncoder(w http.ResponseWriter, r *http.Request, v interface{}) error {
    if v == nil {
        return nil
    }
    if rd, ok := v.(kratos_http.Redirector); ok {
        url, code := rd.Redirect()
        http.Redirect(w, r, url, code)
        return nil
    }
    codec, _ := kratos_http.CodecForRequest(r, "Accept")
    resp := &httpResponse{
        Success: true,
        Code:    200,
        Msg:     "success",
        Data:    v,
    }
    data, err := codec.Marshal(resp)
    if err != nil {
        return err
    }
    w.Header().Set("Content-Type", "application/"+codec.Name())
    _, err = w.Write(data)
    return err
}

// 自定义错误格式
func ErrorEncoder(w http.ResponseWriter, r *http.Request, err error) {
    resp := new(httpResponse)
    if gs, ok := status.FromError(err); ok {
        resp = &httpResponse{
            Success: false,
            Code:    kratos_status.FromGRPCCode(gs.Code()),
            Msg:     gs.Message(),
            Data:    nil,
        }
    } else {
        resp = &httpResponse{
            Success: false,
            Code:    http.StatusInternalServerError,
            Msg:     err.Error(),
            Data:    nil,
        }
    }
    codec, _ := kratos_http.CodecForRequest(r, "Accept")
    body, err := codec.Marshal(resp)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/"+codec.Name())
    w.WriteHeader(resp.Code) // 响应状态码
    _, _ = w.Write(body)
}
server/http.go
package server

import (
    v1 "shortvid-backend/api/shortvid-service/v1"
    "shortvid-backend/app/shortvid-service/internal/conf"
    "shortvid-backend/app/shortvid-service/internal/service"

    "github.com/go-kratos/kratos/v2/log"
    "github.com/go-kratos/kratos/v2/middleware/recovery"
    "github.com/go-kratos/kratos/v2/transport/http"
)

// NewHTTPServer new an HTTP server.
func NewHTTPServer(c *conf.Server, users *service.UsersService, logger log.Logger) *http.Server {
    var opts = []http.ServerOption{
        http.Middleware(
            recovery.Recovery(),
        ),
    }
    if c.Http.Network != "" {
        opts = append(opts, http.Network(c.Http.Network))
    }
    if c.Http.Addr != "" {
        opts = append(opts, http.Address(c.Http.Addr))
    }
    if c.Http.Timeout != nil {
        opts = append(opts, http.Timeout(c.Http.Timeout.AsDuration()))
    }

    // 自定义响应格式
    opts = append(opts, http.ResponseEncoder(ResponseEncoder))
    opts = append(opts, http.ErrorEncoder(ErrorEncoder))

    srv := http.NewServer(opts...)
    v1.RegisterUsersServiceHTTPServer(srv, users)
    return srv
}
```
