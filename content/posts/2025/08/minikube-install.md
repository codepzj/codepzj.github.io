---
title: "Minikube 安装与环境配置"
description: "介绍在 Linux 环境安装 Minikube、配置 Docker 驱动、启动集群并安装 kubectl 的完整步骤。"
date: '2025-08-21'
updated: '2026-06-20'
categories:
- 云原生
tags:
- Kubernetes
- Minikube
---

升级一下系统

```bash
sudo apt update && sudo apt install -y curl wget apt-transport-https
```



https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fbinary+download

因为用的是单节点的k8s

## 你需要什么

- 2 个或更多 CPU
- 2GB可用内存
- 20GB可用磁盘空间
- 互联网连接
- 容器或虚拟机管理器，例如：[Docker](https://minikube.sigs.k8s.io/docs/drivers/docker/)、[QEMU](https://minikube.sigs.k8s.io/docs/drivers/qemu/)、[Hyperkit](https://minikube.sigs.k8s.io/docs/drivers/hyperkit/)、[Hyper-V](https://minikube.sigs.k8s.io/docs/drivers/hyperv/)、[KVM](https://minikube.sigs.k8s.io/docs/drivers/kvm2/)、[Parallels](https://minikube.sigs.k8s.io/docs/drivers/parallels/)、[Podman](https://minikube.sigs.k8s.io/docs/drivers/podman/)、[VirtualBox](https://minikube.sigs.k8s.io/docs/drivers/virtualbox/)或[VMware Fusion/Workstation](https://minikube.sigs.k8s.io/docs/drivers/vmware/)

## 安装 minikube：

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

## 启动集群

从具有管理员访问权限（但未以 root 身份登录）的终端运行：

```bash
minikube start
```

注意

 不允许用 root 用户直接运行 docker 驱动  

![img](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250821123630465.png)

```bash
sudo adduser k8s
sudo usermod -aG sudo k8s # 分配root权限
sudo usermod -aG docker k8s # 加入docker组，操控docker
sudo usermod -aG docker k8s # 把用户加到docker组
su - k8s # 切换到新用户
```

![img](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250821123655108.png)



## 启动minikube

一定要使用镜像，不然国内容易拉取失败

```bash
minikube start --driver=docker --base-image=registry.cn-hangzhou.aliyuncs.com/google_containers/kicbase:v0.0.47
```

![img](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250821123725881.png)



拉取成功

## 安装kubectl

```bash
 curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```



![img](https://cdn.jsdelivr.net/gh/codepzj/images@main/20250821123746723.png)

安装成功
