# Kratos 配置管理实践

> 介绍 Kratos 配置文件的组织方式、配置加载流程以及在服务中读取和使用配置的方法。

kratos支持在多种配置的加载

1. 本地文件
2. 环境变量
3. 注册中心

在`internal/conf/conf.proto`去修改配置，再使用`make config`去生成go代码，注意修改yaml保证与结构体内容的一致
