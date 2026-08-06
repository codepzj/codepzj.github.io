# Go 使用 MinIO SDK 上传文件

> MinIO 是一款开源的分布式对象存储服务，兼容 S3 协议，通过 Go SDK 可以轻松实现文件上传，只需初始化客户端并调用 FPutObject 方法即可完成文件存储，支持自定义 Content-Type 和私有化部署，是替代商业 OSS 的高性价比方案。

今天我们来研究一下minio go上传文件，主要是minio是一款开源的分布式存储服务，遵循S3协议，自己搭建可以省去买OSS的钱

## 下载minio对应的go sdk

```bash
go get github.com/minio/minio-go/v7
```

## 初始化go客户端

```go
func NewMinioClient(endpoint string, accessKeyID string, secretAccessKey string, useSSL bool) *minio.Client {
	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		panic(err)
	}
	return minioClient
}
```

> 注意一下这个endpoint需要填写`Fully Qualified URL`, 填写形如`cdn.codepzj.cn`即可

## 上传本地文件

```go
objectName := "1.txt"      // 上传的文件命名
filePath := "./test/1.txt" // 本地文件路径
uploadFile, err := client.FPutObject(context.Background(), config.Storage.Bucket, objectName, filePath, minio.PutObjectOptions{ContentType: "text/plain; charset=utf-8"})
if err != nil {
	log.Println(err.Error())
	panic("上传失败")
}
```

这只是一个上传本地文件的简单示例，当然`minio`还提供了非常多的接口

可以参考一下 [https://github.com/minio/minio-go/](https://github.com/minio/minio-go/)

## 完整代码

```go
package main

import (
	"context"
	"fmt"
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/spf13/viper"
)

type Config struct {
	Info    MinioInfo    `mapstructure:"info"`
	Storage MinioStorage `mapstructure:"storage"`
}

type MinioInfo struct {
	Endpoint        string `mapstructure:"endpoint"`
	AccessKeyID     string `mapstructure:"accessKey"`
	SecretAccessKey string `mapstructure:"secretKey"`
	Secure          bool   `mapstructure:"secure"`
}

type MinioStorage struct {
	Bucket string `mapstructure:"bucket"`
}

func NewMinioClient(endpoint string, accessKeyID string, secretAccessKey string, useSSL bool) *minio.Client {
	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		panic(err)
	}
	return minioClient
}

func main() {
	// 读取配置文件
	viper.SetConfigFile("./config.yaml") // 设置配置文件路径
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("读取配置文件失败: %v", err)
	}
	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatalf("解析配置文件失败: %v", err)
	}

	// 打印配置文件内容
	log.Println("配置文件内容:", config)

	// 新建客户端
	info := config.Info
	client := NewMinioClient(info.Endpoint, info.AccessKeyID, info.SecretAccessKey, info.Secure)

	objectName := "1.txt"      // 上传的文件命名
	filePath := "./test/1.txt" // 本地文件路径
	uploadFile, err := client.FPutObject(context.Background(), config.Storage.Bucket, objectName, filePath, minio.PutObjectOptions{ContentType: "text/plain; charset=utf-8"})
	if err != nil {
		log.Println(err.Error())
		panic("上传失败")
	}
	// 文件链接
	fmt.Printf("文件链接: https://cdn.codepzj.cn/%s/%s\n", config.Storage.Bucket, objectName)
	fmt.Printf("上传成功, 文件大小为: %dB\n", uploadFile.Size)

}
```

今天的分享就到这里~
