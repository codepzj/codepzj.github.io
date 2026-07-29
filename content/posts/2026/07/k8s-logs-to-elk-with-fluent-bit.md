---
title: "使用 Fluent Bit 将 Kubernetes 日志采集到 ELK"
description: "从日志链路设计开始，完整介绍 Elasticsearch、Kibana 与 Fluent Bit 的部署、鉴权、持久化、Kubernetes 元数据补充、索引验证及常见故障排查。"
date: '2026-07-29'
updated: '2026-07-29'
categories:
- 云原生
tags:
- Kubernetes
- Fluent Bit
- Elasticsearch
- Kibana
- 日志
references:
- title: Fluent Bit 官方文档：在 Kubernetes 中部署
  link: https://docs.fluentbit.io/manual/installation/kubernetes
- title: Fluent Bit 官方文档：Tail 输入、游标与缓冲配置
  link: https://docs.fluentbit.io/manual/data-pipeline/inputs/tail
- title: Fluent Bit 官方文档：补充 Kubernetes 元数据
  link: https://docs.fluentbit.io/manual/data-pipeline/filters/kubernetes
- title: Fluent Bit 官方文档：写入 Elasticsearch
  link: https://docs.fluentbit.io/manual/data-pipeline/outputs/elasticsearch
- title: Elastic 官方文档：使用 Docker 启动单节点 Elasticsearch
  link: https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-docker-basic
- title: Elastic 官方文档：使用 Docker 部署 Kibana
  link: https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker
- title: Elastic 官方文档：内置用户与 kibana_system
  link: https://www.elastic.co/docs/deploy-manage/users-roles/cluster-or-deployment-auth/built-in-users
- title: Elasticsearch API：创建或更新用户
  link: https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-security-put-user
---

应用运行在 Kubernetes 以后，日志分散在不同节点和 Pod 中。只靠 `kubectl logs` 临时查询没有问题，但遇到跨 Pod 检索、历史追踪或线上事故复盘时就会比较吃力。

本文搭建一条轻量的 ELK 日志链路：Elasticsearch 和 Kibana 部署在一台日志服务器上，Fluent Bit 以 DaemonSet 运行在 Kubernetes 的每个节点，读取容器标准输出并写入 Elasticsearch。

> 本文所有密码、IP、目录和业务名称均为示例。不要把真实密码直接提交到 Git 仓库，也不要照搬示例密码到生产环境。

## 整体架构

```text
应用 stdout / stderr
        │
        ▼
/var/log/containers/*.log（每个 K8s 节点）
        │
        ▼
Fluent Bit DaemonSet
  1. tail 持续读取文件
  2. kubernetes filter 补充 namespace、pod、container 等元数据
  3. 本地磁盘缓冲，避免 ES 短暂不可用时立即丢日志
        │
        ▼
Elasticsearch 8.x ──────► Kibana 8.x
```

这里没有单独部署 Logstash。当前场景只是采集容器日志、补充 Kubernetes 元数据并写入 Elasticsearch，Fluent Bit 已经能够完成这些工作。只有在需要复杂的数据清洗、跨数据源编排或大量条件路由时，才有必要再引入 Logstash。

## 前置条件

- Kubernetes 节点使用常见的 Docker 或 CRI 日志格式，日志可从 `/var/log/containers` 读取。
- 日志服务器已经安装 Docker 与 Docker Compose。
- Kubernetes 节点能访问 Elasticsearch 的 `9200` 端口。
- Elasticsearch 与 Kibana 使用相同的 8.x 小版本，避免兼容性问题。
- 生产环境应使用 HTTPS、网络访问控制和独立的最小权限用户；本文为便于展示，内网示例关闭了 HTTP TLS。

## 分开部署 Elasticsearch 与 Kibana

先创建一个外部 Docker 网络，让两个 Compose 服务可以通过容器名互相访问：

```bash
docker network create app-network
```

Elasticsearch 和 Kibana 使用两个独立目录、两份 Compose 文件。这样可以分别启动、停止和升级，不会因为修改其中一个服务而影响另一个服务。

目录结构如下：

```text
/app/
├── elasticsearch/
│   ├── docker-compose.yml
│   ├── .env
│   ├── data/
│   └── backup/
└── kibana/
    ├── docker-compose.yml
    ├── .env
    ├── data/
    └── plugins/
```

Elasticsearch 容器默认以 UID `1000` 运行。绑定宿主机目录前要给予写权限：

```bash
sudo mkdir -p /app/elasticsearch/{data,backup}
sudo mkdir -p /app/kibana/{data,plugins}
sudo chown -R 1000:1000 /app/elasticsearch /app/kibana
```

### 单独部署 Elasticsearch

把下面内容保存为 `/app/elasticsearch/docker-compose.yml`：

```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.19.10
    container_name: elasticsearch
    restart: unless-stopped
    environment:
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - ES_JAVA_OPTS=-Xms1g -Xmx1g
      - xpack.security.enabled=true
      - xpack.security.http.ssl.enabled=false
      - ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
    ulimits:
      memlock:
        soft: -1
        hard: -1
    ports:
      - "9200:9200"
    volumes:
      - ./data:/usr/share/elasticsearch/data
      - ./backup:/usr/share/elasticsearch/backup
    networks:
      - app-network

networks:
  app-network:
    external: true
```

在 `/app/elasticsearch/.env` 中设置 `elastic` 的初始管理员密码：

```dotenv
ELASTIC_PASSWORD=<ELASTIC_INITIAL_ADMIN_PASSWORD>
```

启动 Elasticsearch：

```bash
cd /app/elasticsearch
docker compose up -d
docker compose logs -f --tail=100
```

看到节点启动完成后，按 `Ctrl+C` 退出日志跟踪，再验证服务：

```bash
curl -u 'elastic:<ELASTIC_INITIAL_ADMIN_PASSWORD>' \
  http://127.0.0.1:9200/_cluster/health?pretty
```

### 进入 Elasticsearch 容器创建用户和密码

进入 Elasticsearch 容器：

```bash
docker exec -it elasticsearch bash
```

先设置 `elastic` 管理员的新密码：

```bash
bin/elasticsearch-reset-password -u elastic -i
```

命令提示输入密码时，填写新的随机强密码。后面的 `<ELASTIC_ADMIN_PASSWORD>` 均指这个新密码。

然后设置 Kibana 后台服务用户 `kibana_system` 的密码：

```bash
bin/elasticsearch-reset-password -u kibana_system -i
```

这里设置的密码稍后要写入 Kibana 的 `.env`，但不能把它用作 Kibana 网页登录密码。

接着仍在 Elasticsearch 容器内，通过安全 API 创建 Fluent Bit 的最小权限角色：

```bash
curl -u 'elastic:<ELASTIC_ADMIN_PASSWORD>' \
  -H 'Content-Type: application/json' \
  -X PUT 'http://127.0.0.1:9200/_security/role/fluent_bit_writer' \
  -d '{
    "cluster": ["monitor"],
    "indices": [{
      "names": ["k8s-logs*"],
      "privileges": ["auto_configure", "create_doc", "create_index"]
    }]
  }'
```

再创建 Fluent Bit 写入用户及密码：

```bash
curl -u 'elastic:<ELASTIC_ADMIN_PASSWORD>' \
  -H 'Content-Type: application/json' \
  -X POST 'http://127.0.0.1:9200/_security/user/fluent_bit' \
  -d '{
    "password": "<FLUENT_BIT_STRONG_PASSWORD>",
    "roles": ["fluent_bit_writer"],
    "full_name": "Fluent Bit log writer"
  }'
```

验证用户是否创建成功，然后退出容器：

```bash
curl -u 'fluent_bit:<FLUENT_BIT_STRONG_PASSWORD>' \
  http://127.0.0.1:9200/_security/_authenticate?pretty

exit
```

如果集群启用了严格的索引模板或数据流，应按实际写入方式调整权限，而不是把采集用户直接设置为超级用户。

### 为什么 Kibana 不能使用 elastic 用户

`elastic` 是 Elasticsearch 的内置超级用户，适合管理员登录和初始化操作，不应该作为 Kibana 服务端的长期运行身份。Kibana 后台应使用专门的内置用户 `kibana_system`。

### 单独部署 Kibana

把下面内容保存为 `/app/kibana/docker-compose.yml`：

```yaml
services:
  kibana:
    image: docker.elastic.co/kibana/kibana:8.19.10
    container_name: kibana
    restart: unless-stopped
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
      - ELASTICSEARCH_USERNAME=kibana_system
      - ELASTICSEARCH_PASSWORD=${KIBANA_SYSTEM_PASSWORD}
    ports:
      - "5601:5601"
    volumes:
      - ./plugins:/usr/share/kibana/plugins
      - ./data:/usr/share/kibana/data
    networks:
      - app-network

networks:
  app-network:
    external: true
```

在 `/app/kibana/.env` 写入刚才在 Elasticsearch 容器中为 `kibana_system` 设置的密码：

```dotenv
KIBANA_SYSTEM_PASSWORD=<KIBANA_INTERNAL_PASSWORD>
```

分别部署以后，Kibana 的 Compose 文件里不需要 `depends_on`。它通过外部网络 `app-network` 连接已经运行的 Elasticsearch 容器。

启动 Kibana：

```bash
cd /app/kibana
docker compose up -d
docker compose logs -f --tail=100
```

检查两个独立服务的状态：

```bash
curl -u 'elastic:<ELASTIC_ADMIN_PASSWORD>' \
  http://127.0.0.1:9200/_cluster/health?pretty

cd /app/elasticsearch && docker compose ps
cd /app/kibana && docker compose ps
```

浏览器访问 `http://<ELK_SERVER_IP>:5601`，登录时使用 `elastic` 管理员账户，而不是 `kibana_system`。后者是 Kibana 后台服务账户，不用于网页登录。

两个目录中的 `.env` 都要限制文件权限并加入 `.gitignore`：

```bash
chmod 600 /app/elasticsearch/.env /app/kibana/.env
```

更稳妥的方式是使用 Docker Secret 或外部密钥管理服务。

## 创建 Kubernetes Secret

不要把 Elasticsearch 密码直接写进 DaemonSet YAML。使用 Secret 注入连接信息：

```bash
kubectl -n default create secret generic fluent-bit-es-auth \
  --from-literal=host='<ELK_SERVER_PRIVATE_IP>' \
  --from-literal=username='fluent_bit' \
  --from-literal=password='<FLUENT_BIT_STRONG_PASSWORD>'
```

命令会把明文留在 Shell 历史中。正式环境可使用 Sealed Secrets、External Secrets 或云厂商 Secret Manager。

## 部署 Fluent Bit DaemonSet

下面的清单在原有配置上做了几项调整：

- Fluent Bit、ConfigMap 和 Secret 都部署在 `default` 命名空间。
- 日志路径只匹配 `_default_`，因此仅采集 `default` 命名空间中的容器日志。
- 排除 Fluent Bit 自身日志，避免采集链路形成噪声或循环。
- 通过 RBAC 读取 Pod 与 Namespace 信息。
- 启用数据库游标和文件系统缓冲，容器重启后可以尽量接着读取。
- 使用健康检查和资源限制，便于 Kubernetes 管理采集器。

保存为 `fluent-bit.yaml`：

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: fluent-bit
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: fluent-bit-read-kubernetes
rules:
  - apiGroups: [""]
    resources: ["namespaces", "pods"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: fluent-bit-read-kubernetes
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: fluent-bit-read-kubernetes
subjects:
  - kind: ServiceAccount
    name: fluent-bit
    namespace: default
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
  namespace: default
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush                     2
        Grace                     30
        Log_Level                 info
        Daemon                    off
        Parsers_File              parsers.conf
        HTTP_Server               on
        HTTP_Listen               0.0.0.0
        HTTP_Port                 2020
        storage.path              /var/lib/fluent-bit/storage
        storage.sync              normal
        storage.checksum          off
        storage.max_chunks_up     64
        storage.backlog.mem_limit 5M

    [INPUT]
        Name              tail
        Tag               kube.*
        Path              /var/log/containers/*_default_*.log
        Exclude_Path      /var/log/containers/fluent-bit-*_default_*.log
        multiline.parser  docker, cri
        DB                /var/lib/fluent-bit/tail-containers.db
        DB.Sync           Normal
        Mem_Buf_Limit     5MB
        Buffer_Chunk_Size 32KB
        Buffer_Max_Size   256KB
        Skip_Long_Lines   on
        Refresh_Interval  10
        Rotate_Wait       30
        storage.type      filesystem

    [FILTER]
        Name                kubernetes
        Match               kube.*
        Kube_URL            https://kubernetes.default.svc:443
        Kube_CA_File        /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        Kube_Token_File     /var/run/secrets/kubernetes.io/serviceaccount/token
        Kube_Tag_Prefix     kube.var.log.containers.
        Merge_Log           on
        Keep_Log            off
        K8S-Logging.Parser  on
        K8S-Logging.Exclude on
        Labels              on
        Annotations         off

    [OUTPUT]
        Name                es
        Match               kube.*
        Host                ${ES_HOST}
        Port                9200
        HTTP_User           ${ES_USER}
        HTTP_Passwd         ${ES_PASSWORD}
        Logstash_Format     on
        Logstash_Prefix     k8s-logs
        Suppress_Type_Name  on
        Generate_ID         on
        Replace_Dots        on
        Workers             1
        Retry_Limit         False
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: default
  labels:
    app.kubernetes.io/name: fluent-bit
    app.kubernetes.io/part-of: logging
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: fluent-bit
  template:
    metadata:
      labels:
        app.kubernetes.io/name: fluent-bit
        app.kubernetes.io/part-of: logging
      annotations:
        fluentbit.io/exclude: "true"
    spec:
      serviceAccountName: fluent-bit
      terminationGracePeriodSeconds: 30
      tolerations:
        - operator: Exists
      containers:
        - name: fluent-bit
          image: fluent/fluent-bit:5.0.9
          imagePullPolicy: IfNotPresent
          env:
            - name: ES_HOST
              valueFrom:
                secretKeyRef:
                  name: fluent-bit-es-auth
                  key: host
            - name: ES_USER
              valueFrom:
                secretKeyRef:
                  name: fluent-bit-es-auth
                  key: username
            - name: ES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: fluent-bit-es-auth
                  key: password
          ports:
            - name: health
              containerPort: 2020
              protocol: TCP
          livenessProbe:
            httpGet:
              path: /api/v1/uptime
              port: health
            initialDelaySeconds: 10
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /api/v1/uptime
              port: health
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            requests:
              cpu: 20m
              memory: 30Mi
            limits:
              cpu: 150m
              memory: 96Mi
          volumeMounts:
            - name: config
              mountPath: /fluent-bit/etc/fluent-bit.conf
              subPath: fluent-bit.conf
              readOnly: true
            - name: varlog
              mountPath: /var/log
              readOnly: true
            - name: state
              mountPath: /var/lib/fluent-bit
      volumes:
        - name: config
          configMap:
            name: fluent-bit-config
        - name: varlog
          hostPath:
            path: /var/log
            type: Directory
        - name: state
          hostPath:
            path: /var/lib/fluent-bit
            type: DirectoryOrCreate
```

部署并观察状态：

```bash
kubectl apply -f fluent-bit.yaml
kubectl -n default rollout status daemonset/fluent-bit
kubectl -n default get pods -o wide
kubectl -n default logs daemonset/fluent-bit --tail=100
```

DaemonSet 正常情况下会在每个可调度节点上运行一个 Pod。如果节点数和 Fluent Bit Pod 数量不一致，先检查污点、节点选择器和资源限制。

### Elasticsearch 在 Kubernetes 节点宿主机上时

如果 Elasticsearch 运行在每个节点都能访问的固定内网地址，直接把该地址写入 Secret 即可。只有 Elasticsearch 恰好运行在 Kubernetes 节点宿主机、且容器网络无法访问宿主机地址时，才考虑为 Fluent Bit 添加：

```yaml
hostNetwork: true
dnsPolicy: ClusterFirstWithHostNet
```

`hostNetwork` 会扩大容器网络权限和端口冲突范围，不应作为默认配置。更推荐让 Elasticsearch 使用稳定的内网 IP、DNS 名称或 Kubernetes Service。

## 验证日志链路

先启动一个持续输出日志的测试 Pod：

```bash
kubectl run log-demo \
  --image=busybox:1.36 \
  --restart=Never \
  -- /bin/sh -c 'i=0; while true; do i=$((i+1)); echo "{\"level\":\"info\",\"message\":\"log demo\",\"sequence\":$i}"; sleep 5; done'
```

确认 Elasticsearch 已创建索引：

```bash
curl -u 'elastic:<ELASTIC_ADMIN_PASSWORD>' \
  'http://<ELK_SERVER_IP>:9200/_cat/indices/k8s-logs-*?v'
```

再查询几条记录：

```bash
curl -u 'elastic:<ELASTIC_ADMIN_PASSWORD>' \
  -H 'Content-Type: application/json' \
  'http://<ELK_SERVER_IP>:9200/k8s-logs-*/_search?pretty' \
  -d '{
    "size": 3,
    "sort": [{"@timestamp": "desc"}],
    "query": {
      "match": {"kubernetes.pod_name": "log-demo"}
    }
  }'
```

在 Kibana 中进入 **Stack Management → Data Views**，创建数据视图：

```text
k8s-logs-*
```

时间字段选择 `@timestamp`，随后就可以在 Discover 中按照以下字段筛选：

- `kubernetes.namespace_name`
- `kubernetes.pod_name`
- `kubernetes.container_name`
- `kubernetes.labels.*`
- `log` 或合并后的 JSON 字段

验证完成后删除测试 Pod：

```bash
kubectl delete pod log-demo
```

## 关键配置说明

### DB 不是日志数据库

Tail 插件的 `DB` 文件记录每个日志文件已经读取到的偏移量。Fluent Bit 重启后会根据偏移量继续读取，减少重复采集或漏采。这个文件必须挂载到持久目录，不能只保存在容器临时文件系统中。

### Mem_Buf_Limit 与磁盘缓冲

当 Elasticsearch 短暂不可用时，日志会积压。`Mem_Buf_Limit` 限制输入插件占用的内存，`storage.type filesystem` 则允许数据转移到磁盘缓冲。它们能提高短时故障的容忍度，但磁盘空间仍然有限，长期中断最终还是可能丢数据，因此需要监控积压量与磁盘使用率。

### Merge_Log 的作用

应用输出 JSON 字符串时，Kubernetes filter 可以把 JSON 内容合并到日志记录中。这样在 Kibana 中能够直接按 `level`、`trace_id` 等字段查询，而不是对整段字符串做全文搜索。

业务日志最好保持“一行一条 JSON”，例如：

```json
{"level":"info","message":"order created","trace_id":"demo-trace-id","order_id":"demo-order-id"}
```

堆栈信息等多行日志由 `multiline.parser docker, cri` 负责合并。应用自行输出非标准多行格式时，需要额外定义 multiline parser。

### Retry_Limit False 不是无限可靠

`Retry_Limit False` 表示输出插件持续重试，但它不代表日志永远不会丢失。节点重装、缓冲目录损坏、磁盘写满和 Elasticsearch 长时间不可用都可能造成数据损失。重要审计日志还应考虑消息队列、对象存储归档或其他可靠传输方案。

## 常见问题排查

### Fluent Bit 没有采集到任何文件

进入 Pod 检查挂载目录：

```bash
kubectl -n default exec -it daemonset/fluent-bit -- \
  sh -c 'ls -l /var/log/containers | head'
```

如果目录为空，需要确认节点运行时的实际日志路径。有些发行版还需要挂载 `/var/lib/docker/containers` 或 `/var/log/pods`，具体取决于容器运行时和符号链接目标。

### Kubernetes 元数据为空

依次检查 ServiceAccount、RBAC 和集群 API 连通性：

```bash
kubectl auth can-i list pods \
  --as=system:serviceaccount:default:fluent-bit --all-namespaces

kubectl auth can-i get namespaces \
  --as=system:serviceaccount:default:fluent-bit
```

同时确认 `Tag` 与 `Kube_Tag_Prefix` 能对应容器日志文件名。前缀错误时，filter 无法从 tag 中解析 Pod、Namespace 和容器名称。

### Elasticsearch 返回 401

通常是用户名或密码不一致。先验证 Secret 中的内容是否正确，再使用同一账户直接请求 Elasticsearch：

```bash
curl -u 'fluent_bit:<FLUENT_BIT_STRONG_PASSWORD>' \
  http://<ELK_SERVER_IP>:9200/_security/_authenticate?pretty
```

更新 Secret 后，已有 Pod 不会自动刷新环境变量，需要重启 DaemonSet：

```bash
kubectl -n default rollout restart daemonset/fluent-bit
```

### Elasticsearch 返回 403

认证已经成功，但用户缺少索引权限。查看 Fluent Bit 日志中的目标索引名，确认角色的 `names` 范围覆盖该索引，并具备创建索引和写入文档的权限。

### Kibana 报 Unable to retrieve version information

重点检查以下内容：

1. Kibana 容器能否解析 `elasticsearch` 容器名。
2. 两个容器是否加入同一个 `app-network`。
3. `kibana_system` 密码是否已重置且与 Compose 环境变量一致。
4. Elasticsearch 是否已经完成启动，而不是只看容器处于 Running。

```bash
docker exec kibana \
  curl -sS http://elasticsearch:9200

docker compose logs --tail=200 elasticsearch kibana
```

### 出现 mapper_parsing_exception

同一个字段在不同日志里出现了不同类型，例如一条日志的 `status` 是数字，另一条却是字符串。应统一应用日志结构，并通过索引模板固定关键字段类型。不要只通过删除索引来临时解决，否则新数据仍会再次触发冲突。

## 上线前还需要做什么

本文配置适合单机或中小规模内网环境。准备长期运行时，至少还要补齐：

- 为 Elasticsearch 启用 TLS，不要把 `9200` 直接暴露到公网。
- 使用防火墙或安全组，只允许 Kubernetes 节点访问 Elasticsearch。
- 配置 ILM（索引生命周期管理），自动滚动和删除过期日志。
- 为 Elasticsearch 数据卷做容量监控与备份。
- 在 Kibana 中按团队划分空间和角色，避免所有人共用超级用户。
- 对手机号、身份证、Token、Cookie 等敏感字段在应用输出前脱敏；采集端过滤只能作为补充，不能代替源头治理。
- 为 Fluent Bit 的重试、丢弃记录、缓冲区和输出错误建立告警。

至此，一条可检索、带 Kubernetes 元数据并具备基础缓冲能力的日志链路就搭建完成了。后续日志量增长时，可以继续演进为 Elasticsearch 集群、数据流与 ILM，或者在 Fluent Bit 和 Elasticsearch 之间增加 Kafka 作为削峰与持久缓冲层。

## 参考资料说明

- [在 Kubernetes 中部署 Fluent Bit](https://docs.fluentbit.io/manual/installation/kubernetes)：用于理解为什么日志采集器通常以 DaemonSet 运行，以及需要挂载哪些节点目录。
- [Tail 输入插件](https://docs.fluentbit.io/manual/data-pipeline/inputs/tail)：重点参考 `DB`、`Mem_Buf_Limit`、文件轮转和长日志处理配置。
- [Kubernetes Filter](https://docs.fluentbit.io/manual/data-pipeline/filters/kubernetes)：说明 Pod 元数据补充、`Merge_Log`、标签与注解处理方式。
- [Elasticsearch 输出插件](https://docs.fluentbit.io/manual/data-pipeline/outputs/elasticsearch)：说明认证、索引命名、重试和 Elasticsearch 8 类型兼容配置。
- [使用 Docker 启动 Elasticsearch](https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-docker-basic) 与 [使用 Docker 部署 Kibana](https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker)：对应本文拆分后的两套 Compose 部署。
- [Elasticsearch 内置用户](https://www.elastic.co/docs/deploy-manage/users-roles/cluster-or-deployment-auth/built-in-users)：解释 `elastic` 与 `kibana_system` 的职责区别。
- [创建或更新用户 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-security-put-user)：对应在 Elasticsearch 容器中创建 `fluent_bit` 写入用户的步骤。
