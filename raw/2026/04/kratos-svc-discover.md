# Kratos 服务注册与发现实践

> 介绍 Kratos 接入 Consul 实现服务注册与发现，包括 Consul 部署、启动和客户端配置。

- consul
- etcd

## 安装单节点Consul

```yaml
version: "3.9"

services:
  consul:
    image: consul:1.15.4
    container_name: consul
    ports:
      - "8500:8500"      # Web UI 和 HTTP API
      - "8600:8600/udp"  # DNS 服务
    command: agent -server -bootstrap-expect=1 -ui -client=0.0.0.0
    volumes:
      - ./data:/consul/data
```

执行`docker-compose up -d`

## linux安装

```bash
wget -O - https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(grep -oP '(?<=UBUNTU_CODENAME=).*' /etc/os-release || lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install consul
```

## 开发环境启动

```bash
consul agent -dev
```

## 后台运行

```bash
sudo tee /etc/systemd/system/consul.service > /dev/null <<EOF
[Unit]
Description=Consul Agent
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/bin/consul agent -server -bootstrap-expect=1 -data-dir=/opt/consul -bind=0.0.0.0 -client=0.0.0.0 -ui
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
```

## 创建数据目录并启动服务

```bash
sudo mkdir -p /opt/consul
sudo systemctl daemon-reload
sudo systemctl enable consul
sudo systemctl start consul
```

## 启动服务

```bash
systemctl start consul
```
