---
title: "wrk HTTP 压测工具使用与指标分析"
description: 本文围绕 wrk 压测工具展开，从基础使用到结果分析，结合错误率、尾延迟（P95/P99）、稳定性等核心指标，给出一套可落地的评估方法，用于定位系统性能瓶颈并计算稳定状态下的最大可承载吞吐量。
date: '2026-05-06'
updated: '2026-06-10'
categories:
- 工程实践
tags:
- wrk
draft: false
---

## 安装
```bash
brew install wrk
```



## 压测参数
```bash
pzj@pzjmac ~ % wrk
Usage: wrk <options> <url>                            
  Options:                                            
    -c, --connections <N>  Connections to keep open   
    -d, --duration    <T>  Duration of test           
    -t, --threads     <N>  Number of threads to use   
                                                      
    -s, --script      <S>  Load Lua script file       
    -H, --header      <H>  Add header to request      
        --latency          Print latency statistics   
        --timeout     <T>  Socket/request timeout     
    -v, --version          Print version details      
                                                      
  Numeric arguments may include a SI unit (1k, 1M, 1G)
  Time arguments may include a time unit (2s, 2m, 2h)
```

`-c`: 连接数

`-d`: 压测时长

`-t`: 压测线程数

`-s`: lua 脚本路径

`-h`: 请求头



## 参考示例
```bash
wrk -c100 -d10s -t10 https://blog-api.golangblog.com/config/home
```



含义：

以`100 个连接, 10 个线程`对 [https://blog-api.golangblog.com/config/home](https://blog-api.golangblog.com/config/home) 这个接口压测 `10s`



## 结果分析
```bash
Running 10s test @ https://blog-api.golangblog.com/config/home
  10 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   113.26ms  182.88ms   1.66s    90.13%
    Req/Sec   184.11    122.34   430.00     54.91%
  16657 requests in 10.07s, 17.72MB read
  Non-2xx or 3xx responses: 5501
Requests/sec:   1654.68
Transfer/sec:      1.76MB
```



`Latency`: 平均响应时长

`Req/Sec`: 每个线程的`QPS`

`Avg`: 平均值

`Stdev`: 标准差

`Max`: 最大值

`+/- Stdev`: 有多少比例的请求，落在「平均值 ± 1 个标准差」这个区间内





`Requests/sec`:  压测出来的`全局QPS`

`Transfer/sec`: 每秒平均占用带宽大小



## 如何评判一个接口的好坏
QPS(每秒最多能处理多少个请求，往往反映该接口的吞吐量) 并不是评判一个接口好坏的唯一标准



主要通过以下几种方式



### 错误率
结果中包含 `Non-2xx or 3xx responses: 5501`，代表非 2xx-3xx 之间的错误，那么就是 4xx-5xx(客户端或者服务端错误)

5501/16657 = 33%, 错误率约 33%



评判标准

+ **目标**：≈ 0% 
+ **可接受**：&lt; 0.1% 
+ **危险**：> 1% 
+ **不可用**：> 5%



### 尾延迟
尾延迟通常用这些指标表示：

+ **P95**：95% 请求比这个快 
+ **P99**：99% 请求比这个快 
+ **P999**：99.9% 请求比这个快 



举个例子

```text
P50  = 50ms
P95  = 200ms
P99  = 1.5s
```

含义：

+  一半请求很快（50ms） 
+  大部分还行（200ms） 
+ **但有 1% 请求慢到 1.5秒**

这个 1.5s 就是典型的**尾延迟**



`wrk` 带上 `--latency` 可以获取到请求时间的分布

```bash
pzj@pzjmac ~ % wrk -c100 -d10s -t10 --latency https://blog-api.golangblog.com/config/home 
Running 10s test @ https://blog-api.golangblog.com/config/home
  10 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   246.60ms  318.68ms   1.98s    87.53%
    Req/Sec    73.05     97.49   444.00     87.07%
  Latency Distribution
     50%  113.02ms
     75%  311.00ms
     90%  643.50ms
     99%    1.51s 
  6286 requests in 10.07s, 6.06MB read
  Non-2xx or 3xx responses: 3286
Requests/sec:    624.11
Transfer/sec:    615.81KB
```



业界通用判断标准

| 指标 | 优秀 | 可接受 | 差 |
| --- | --- | --- | --- |
| **P95** | &lt; 100ms | &lt; 300ms | > 500ms |
| **P99** | &lt; 200ms | &lt; 1s | > 1s |


### 稳定性
$ CV=σ/μ $(标准差/平均值)

| CV | 结论 |
| --- | --- |
| &lt; 0.3 | 稳定 |
| 0.3~0.5 | 有波动 |
| > 0.5 | 不稳定 |
| > 1 | 过载 |


### 平均延迟
只能作为参考

| 延迟（Avg / P50） | 评价 | 说明 |
| --- | --- | --- |
| **&lt; 10ms** | 极优 | 内存级 / 本地缓存 |
| **10 ~ 50ms** | 优秀 | 高频接口理想状态 |
| **50 ~ 100ms** | 良好 | 常规业务推荐范围 |
| **100 ~ 200ms** | 一般 | 用户开始能感知 |
| **200 ~ 500ms** | 较差 | 明显变慢 |
| **500ms ~ 1s** | 很差 | 用户明显卡顿 |
| **> 1s** | 不可接受 | 必须优化 |




### 业界通用指标
```bash
✔ 错误率 ≈ 0
✔ P99 在可控范围(200ms以下)
✔ CV < 0.3（稳定）
✔ QPS 在目标负载下稳定
```

保证上述的同时，选择合适的线程数(与电脑的 CPU 数量有关),渐进式增大 `c`，找到该接口的最大拐点，测出稳定状态下的最大请求数量



在不断调整下

```bash
pzj@pzjmac ~ % wrk -c18 -d10s -t10 --latency https://blog-api.golangblog.com/config/home 
Running 10s test @ https://blog-api.golangblog.com/config/home
  10 threads and 18 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    76.36ms   13.38ms 168.20ms   81.25%
    Req/Sec    12.84      4.84    20.00     65.91%
  Latency Distribution
     50%   71.89ms
     75%   78.84ms
     90%   96.56ms
     99%  121.26ms
  1307 requests in 10.09s, 2.11MB read
Requests/sec:    129.56
Transfer/sec:    213.71KB
```

得到博客在稳定状态下最大 QPS 为 129，使用裸 ip 的 QPS 大约在 220 左右，主要原因是`TLS / HTTPS` 的开销



## 总结
性能测试的目标不是跑高数据，而是找到系统在“稳定 + 可用”前提下的真实上限。
