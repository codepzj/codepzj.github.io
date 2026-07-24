---
title: 本地 kubectl 管理远程
description: 介绍如何将远程 Minikube 集群的 kubeconfig 迁移到本地，处理证书数据、虚拟 IP、Docker 端口映射与 TLS 证书校验问题，实现本地 kubectl 管理远程 Kubernetes。
date: '2026-06-19'
updated: '2026-06-20'
categories:
- 云原生
tags:
- Kubernetes
- Minikube
---

查看 `~/.kube/config`

```yaml
apiVersion: v1
clusters:
- cluster:
    certificate-authority: /home/k8s/.minikube/ca.crt
    extensions:
    - extension:
        last-update: Fri, 19 Jun 2026 12:27:27 CST
        provider: minikube.sigs.k8s.io
        version: v1.36.0
      name: cluster_info
    server: https://192.168.49.2:8443
  name: minikube
contexts:
- context:
    cluster: minikube
    extensions:
    - extension:
        last-update: Fri, 19 Jun 2026 12:27:27 CST
        provider: minikube.sigs.k8s.io
        version: v1.36.0
      name: context_info
    namespace: default
    user: minikube
  name: minikube
current-context: minikube
kind: Config
preferences: {}
users:
- name: minikube
  user:
    client-certificate: /home/k8s/.minikube/profiles/minikube/client.crt
    client-key: /home/k8s/.minikube/profiles/minikube/client.key
```



## 替换密钥文件为真正的密钥数据
但是依赖本地 ip 和证书文件是不能用的，所以执行以下命令

```bash
kubectl config view --raw --flatten
```



得到携带证书的 `kube config`，覆盖掉原有 `config`

```yaml
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: xxx
    extensions:
    - extension:
        last-update: Fri, 19 Jun 2026 12:27:27 CST
        provider: minikube.sigs.k8s.io
        version: v1.36.0
      name: cluster_info
    server: https://192.168.49.2:8443
  name: minikube
contexts:
- context:
    cluster: minikube
    extensions:
    - extension:
        last-update: Fri, 19 Jun 2026 12:27:27 CST
        provider: minikube.sigs.k8s.io
        version: v1.36.0
      name: context_info
    namespace: default
    user: minikube
  name: minikube
current-context: minikube
kind: Config
preferences: {}
users:
- name: minikube
  user:
    client-certificate-data: xxx
    client-key-data: xxx
```

**同时验证当前**`kubectl`是否能使用

`kubectl get ns`



## 替换虚拟 IP 地址
使用`minikube profile list`命令获取当前 `minikube` 的部署方式

```bash
k8s@codepzj:~$ minikube profile list
|----------|-----------|---------|--------------|------|---------|--------|-------|----------------|--------------------|
| Profile  | VM Driver | Runtime |      IP      | Port | Version | Status | Nodes | Active Profile | Active Kubecontext |
|----------|-----------|---------|--------------|------|---------|--------|-------|----------------|--------------------|
| minikube | docker    | docker  | 192.168.49.2 | 8443 | v1.33.1 | OK     |     1 | *              | *                  |
|----------|-----------|---------|--------------|------|---------|--------|-------|----------------|--------------------|
k8s@codepzj:~$
```

可以看到当前使用的是 `docker` 这种方式



查看 `minikube` 的 `docker` 映射

```bash
k8s@codepzj:~$ docker ps
CONTAINER ID   IMAGE                                                                 COMMAND                  CREATED        STATUS        PORTS                                                                                                                                  NAMES
d1556a707278   registry.cn-hangzhou.aliyuncs.com/google_containers/kicbase:v0.0.47   "/usr/local/bin/entr…"   17 hours ago   Up 17 hours   127.0.0.1:32768->22/tcp, 127.0.0.1:32769->2376/tcp, 127.0.0.1:32770->5000/tcp, 127.0.0.1:32771->8443/tcp, 127.0.0.1:32772->32443/tcp   minikube
```

可以看到向外映射是`32771`这个端口



所以可以把 `kubeConfig`的配置复制到本地电脑的`~/.kube/config`处

**并将虚拟机 ip 和端口替换成服务器的公网 ip 和 docker 容器的对外暴露端口**

## 可能出现的坑
- `server`这个参数使用的是 `https`，使用的是 `k8s` 自签名的证书，不安全，所以在调试的时候应该使用`curl -k https://xxx`不校验证书的合法性
- docker 需要将 k8s 的 api 接口暴露到公网，`0.0.0.0`

```bash
minikube start \
  --driver=docker \
  --base-image=registry.cn-hangzhou.aliyuncs.com/google_containers/kicbase:v0.0.47 \
  --listen-address=0.0.0.0
```

- 出现`Unhandled Error`错误

```bash
pzj@pzjmac ~ % kubectl get ns
E0620 00:51:28.656353   47436 memcache.go:265] "Unhandled Error" err="couldn't get current server API group list: Get \"https://<服务器ip>:32771/api?timeout=32s\": EOF"
E0620 00:51:45.706444   47436 memcache.go:265] "Unhandled Error" err="couldn't get current server API group list: Get \"https://<服务器ip>:32771/api?timeout=32s\": EOF"
E0620 00:52:01.824239   47436 memcache.go:265] "Unhandled Error" err="couldn't get current server API group list: Get \"https://<服务器ip>:32771/api?timeout=32s\": EOF"
E0620 00:52:16.840685   47436 memcache.go:265] "Unhandled Error" err="couldn't get current server API group list: Get \"https://<服务器ip>:32771/api?timeout=32s\": EOF"
E0620 00:52:31.396984   47436 memcache.go:265] "Unhandled Error" err="couldn't get current server API group list: Get \"https://<服务器ip>:32771/api?timeout=32s\": tls: failed to verify certificate: x509: certificate is valid for 10.96.0.1, 127.0.0.1, 10.0.0.1, 192.168.49.2, not 103.36.220.100 - error from a previous attempt: EOF"
```

在`~/.kube/config`的 `cluster` 的`server`字段下补一行`tls-server-name: 127.0.0.1`即可
