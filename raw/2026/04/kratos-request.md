# Kratos HTTP 请求与路由配置

> 介绍 Kratos HTTP 服务中的请求处理、路由注册和 transport/http 组件的基本使用方式。

## HTTP

### 获取原始http请求信息

```go
import (
    khttp "github.com/go-kratos/kratos/v2/transport/http"
)

hr, ok := khttp.RequestFromServerContext(ctx)
if !ok {
    return nil, errors.New("get http request failed")
}
```
