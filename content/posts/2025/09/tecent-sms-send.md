---
title: "Go 接入腾讯云短信服务"
description: 短信验证码业务主要流程是用户请求后端，后端生成随机 6 位验证码，存入 Redis 缓存并调用腾讯云短信 SDK 发送到用户手机。前端提示短信发送成功，用户再输入验证码完成验证。为了防止接口被滥用，需要增加限流、图片验证码或签名加密等保护措施。
date: '2025-09-28'
updated: '2025-09-28'
categories:
- 后端开发
tags:
- go
draft: false
---

最近接触到了短信发送业务，不过实现起来也不难

## 分析问题

主要流程为：

1. 用户在前端手动触发发送短信的按钮
2. 后端生成随机6位数验证码
3. 从redis缓存中get `auth_code_{telephone}`，查看是否有相关记录。若有则返回已有验证码，让用户输入未过期的验证码；若没有，则将6位`code`存入redis中
4. 调用腾讯云sdk发送验证码
5. 返回给用户说明短信发送成功

腾讯云短信sdk文档

[短信 Go SDK_腾讯云](https://cloud.tencent.com/document/product/382/43199)

对应的`UML图`：

![](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250928121740816.png)

## 安装依赖

```bash
go get github.com/tencentcloud/tencentcloud-sdk-go/common
go get github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/sms/v20210111
```



## 详细代码

### sdk发送短信

需要传入`secretId, secretKey, smsSdkAppId, signName, templateId, phoneCode, phone`等参数

1. secretId, secretKey就是腾讯云为开发者提供的密钥，在控制台创建密钥才能远程调用api
2. 短信应用ID：smsSdkAppId，signName：签名，templateId：模板ID
3. 2025-05工信部禁止个体户创建资质，以后发短信都只能企业发了😒

```go
// 发送短信【腾讯】
func SendTecentSmsCode(secretId, secretKey, smsSdkAppId, signName, templateId, phoneCode, phone string) error {
	credential := common.NewCredential(secretId, secretKey)
	// 腾讯云文档：https://cloud.tencent.com/document/product/382/43199
	/* 实例化一个客户端配置对象 */
	cpf := profile.NewClientProfile()

	cpf.HttpProfile.ReqMethod = "POST"
	cpf.HttpProfile.ReqTimeout = 10 // 请求超时时间
	cpf.HttpProfile.Endpoint = "sms.tencentcloudapi.com"

	/* SDK默认用TC3-HMAC-SHA256进行签名，非必要请不要修改这个字段 */
	cpf.SignMethod = "HmacSHA1"

	/* 实例化client对象 */
	client, _ := sms.NewClient(credential, "ap-guangzhou", cpf)

	/* 实例化一个请求对象 */
	request := sms.NewSendSmsRequest()

	/* 短信应用ID */
	request.SmsSdkAppId = common.StringPtr(smsSdkAppId)

	/* 短信签名内容 */
	request.SignName = common.StringPtr(signName)

	/* 模板 ID */
	request.TemplateId = common.StringPtr(templateId)

	/* 模板参数 */
	request.TemplateParamSet = common.StringPtrs([]string{phoneCode})

	/* 下发手机号码，采用 E.164 标准，+[国家或地区码][手机号] */
	request.PhoneNumberSet = common.StringPtrs([]string{"+86" + phone})

	// 通过client对象调用想要访问的接口，需要传入请求对象
	response, err := client.SendSms(request)

	if err != nil {
		return err
	}
	b, _ := json.Marshal(response.Response)
	// 打印返回的json字符串
	fmt.Printf("%s", b)

	return nil
}
```

## 发送短信业务逻辑

```go
// 发送验证码
/*
查看redis中是否有对应的key
- 有，返回错误说明验证码未过期
- 无，则发送
*/
func (s *UserInfoService) SendSmsCode(req req.SmsCodeSendReq) error {
	key := fmt.Sprintf("auth_code_%s", req.Phone)

	// 未命中缓存
	if _, err := s.rdb.Get(context.Background(), key).Result(); err != nil {
		// 生成随机6位验证码, 有效时间为10分钟
		phoneCode := pkg.GenRandomCode(6)
		s.rdb.SetNX(context.Background(), key, phoneCode, time.Duration(s.conf.SmsExpireTime)*time.Minute)

		tecentSms := s.conf.TecentSms
		if err := pkg.SendTecentSmsCode(tecentSms.AccessKeyId, tecentSms.AccessKeySecret, tecentSms.SmsSdkAppId, tecentSms.SignName, tecentSms.TemplateId, phoneCode, req.Phone); err != nil {
			// 打日志
			go func() {
				slog.Error("发送验证码失败", "phone", req.Phone, "err", err.Error())
			}()
			return constrants.ErrSendRandomCode
		}
		return nil
	}
	// 命中缓存则不发送
	return constrants.RandomCodeNotExpired
}
```



代码也很简单



## 可以改进的点

可以考虑一些保护措施，因为短信接口是暴露在外的，而且短信也是要钱的，5分钱一条左右，被别人开机器伪造请求并发打这个接口一下额度就用完了...

1. 同一个手机号在一个小时内只能发送三次，这是针对单个用户的限流操作。
2. 图片验证码，发送短信请求，同时携带图片验证码，不过比较消耗CPU，也会造成系统耦合
3. 请求签名/加密 ， 前端请求时加上签名参数（时间戳 + 随机数 + HMAC 签名），避免接口被轻易伪造调用
