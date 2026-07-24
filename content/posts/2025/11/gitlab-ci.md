---
title: GitLab Runner 使用与 CICD 全面指南
description: Gitlab使用教程以及CI/CD的配置，触发工作流，减少手动部署的成本
date: '2025-11-10'
updated: '2025-12-02'
categories:
- 工程实践
tags:
- gitlab
draft: false
---

## 一、部署与注册 Runner

### 1.1 部署 Runner

进入 Runner 容器：

```bash
docker exec -it gitlab-runner bash
```

### 1.2 注册 Runner

执行注册命令，将 Runner 绑定到指定的 GitLab 实例与项目：

```bash
gitlab-runner register --url $gitlab-url --token $your-token
```

注册过程会依次要求输入信息：

- **GitLab 实例地址**
- **Runner 名称**
- **执行器类型（executor）**

注册成功后，配置信息会写入 `/etc/gitlab-runner/config.toml`。
若注册时选择了 `custom` 执行器，可修改为 `docker`，再重启容器即可。

### 1.3 执行器类型说明

| Executor          | 说明                         |
| ----------------- | ---------------------------- |
| custom            | 自定义执行器，需自编执行脚本 |
| parallels         | 仅 macOS 支持                |
| virtualbox        | 使用虚拟机环境               |
| docker            | 最常用方式，隔离性好         |
| docker+machine    | 自动创建 Docker 主机执行 Job |
| docker-autoscaler | 自动扩容执行环境             |
| shell             | 使用宿主机 Shell 执行        |
| ssh               | 远程主机执行                 |
| docker-windows    | Windows 容器执行             |
| kubernetes        | 在 K8s 集群中运行            |
| instance          | GitLab EE 专用执行器         |

### 1.4 Runner 执行规则总结

| 场景                                                        | Runner 会不会执行 |
| ----------------------------------------------------------- | ----------------- |
| Runner 有标签 build，Job 标签写 build                       | ✅ 执行            |
| Runner 有标签 build，Job 没写标签但勾了 Run untagged jobs   | ✅ 执行            |
| Runner 有标签 build，Job 没写标签且未勾选 Run untagged jobs | ❌ 不执行          |
| Runner 无标签（空），Job 写 build                           | ❌ 不执行          |

## 二、GitLab CI/CD 变量管理

### 2.1 常用预定义变量

| 变量             | 含义         |
| ---------------- | ------------ |
| CI_COMMIT_BRANCH | 当前提交分支 |
| CI_COMMIT_TAG    | 当前提交 Tag |

### 2.2 设置环境变量

路径：**Settings > CI/CD > Variables**

可配置两类属性：

- **Visible**：允许变量忽略空格、换行检查；
- **Masked**：更严格的安全校验（例如 Token 需要符合特定格式）。

若变量在部分分支不可用，可关闭变量的 “Protect variable” 选项，以便所有分支访问。

## 三、GitLab CI 基础语法

### 3.1 `.gitlab-ci.yml` 文件结构

```yaml
stages:
  - build
  - test
  - deploy

build-job:
  stage: build
  script:
    - echo "Building..."
    - npm install
    - npm run build

test-job:
  stage: test
  script:
    - npm test

deploy-job:
  stage: deploy
  script:
    - scp -r dist/* user@server:/var/www/app
```

### 3.2 关键字段说明

| 字段                         | 说明                 |
| ---------------------------- | -------------------- |
| stages                       | 定义阶段（顺序执行） |
| stage                        | 当前 job 所属阶段    |
| script                       | 要执行的命令         |
| tags                         | 指定执行 Runner 标签 |
| only / except                | 执行条件             |
| rules                        | 高级条件控制         |
| needs                        | 指定依赖             |
| artifacts                    | 构建产物             |
| cache                        | 缓存依赖             |
| variables                    | 定义变量             |
| image                        | 指定 Docker 镜像     |
| before_script / after_script | 前置或后置命令       |

### 3.3 常见高级写法

**使用变量**

```yaml
variables:
  NODE_ENV: production
  APP_PATH: /app

build:
  stage: build
  script:
    - echo "$NODE_ENV"
    - mkdir -p $APP_PATH
```

**缓存依赖**

```yaml
cache:
  paths:
    - node_modules/
```

**保存构建产物**

```yaml
artifacts:
  paths:
    - dist/
  expire_in: 1 week
```

**分支执行**

```yaml
only:
  - dev
```

或使用 `rules`：

```yaml
rules:
  - if: '$CI_COMMIT_BRANCH == "main"'
    when: always
  - when: never
```

**指定 Docker 镜像**

```yaml
image: node:20
```

**任务依赖**

```yaml
build:
  stage: build
  artifacts:
    paths: [dist/]

deploy:
  stage: deploy
  needs: ["build"]
  script: scp -r dist/* server:/var/www
```

**并行任务**

```yaml
parallel: 3
```

**多环境部署**

```yaml
deploy_staging:
  only:
    - develop

deploy_prod:
  only:
    - main
```

### 3.4 YAML 注意事项

1. 使用空格缩进（不能用 Tab）
2. 冒号后需有空格
3. 特殊字符用引号包裹
4. 数组用 `-` 表示
5. 变量引用用 `$VAR_NAME`

## 四、GitLab Rules 高级控制

### 4.1 基本语法

```yaml
rules:
  - if: '$CI_COMMIT_BRANCH == "main"'
    when: always
  - when: never
```

从上到下匹配，命中第一条后停止。

### 4.2 字段说明

| 字段          | 含义         |
| ------------- | ------------ |
| if            | 条件表达式   |
| when          | 执行时机     |
| allow_failure | 是否允许失败 |
| changes       | 文件变更触发 |
| exists        | 文件存在触发 |
| start_in      | 延迟执行时间 |

### 4.3 when 可选值

| 值         | 含义               |
| ---------- | ------------------ |
| on_success | 默认值             |
| manual     | 手动触发           |
| always     | 无论成功失败都执行 |
| never      | 永不执行           |
| delayed    | 延迟执行           |

### 4.4 常见用法示例

**按分支执行**

```yaml
rules:
  - if: '$CI_COMMIT_BRANCH == "dev"'
    when: on_success
  - if: '$CI_COMMIT_BRANCH == "main"'
    when: manual
  - when: never
```

**标签触发**

```yaml
rules:
  - if: '$CI_COMMIT_TAG'
```

**检测文件变更**

```yaml
rules:
  - changes:
      - src/**/*.js
```

**检测文件存在**

```yaml
rules:
  - exists:
      - docs/
```

**延迟执行**

```yaml
rules:
  - when: delayed
    start_in: 5 minutes
```

**环境变量判断**

```yaml
rules:
  - if: '$NODE_ENV == "production"'
```

**组合条件**

```yaml
rules:
  - if: '$CI_COMMIT_BRANCH == "dev" || $CI_COMMIT_BRANCH == "main"'
```

**未匹配时不执行**

```yaml
rules:
  - if: '$CI_COMMIT_BRANCH == "main"'
  - when: never
```

## 五、include 多文件管理

### 5.1 引入本地文件

```yaml
include:
  - local: 'ci/build.yml'
  - local: 'ci/deploy.yml'
```

### 5.2 引入其他项目文件

```yaml
include:
  - project: 'group/ci-templates'
    ref: main
    file: '/templates/docker-build.yml'
```

### 5.3 引入远程 URL

```yaml
include:
  - remote: 'https://gitlab.com/gitlab-org/gitlab-foss/raw/master/.gitlab-ci.yml'
```

### 5.4 使用官方模板

```yaml
include:
  - template: 'Go.gitlab-ci.yml'
```

### 5.5 混合引入

```yaml
include:
  - local: 'ci/build.yml'
  - project: 'team/shared-ci'
    ref: main
    file: '/deploy/docker.yml'
  - template: 'Go.gitlab-ci.yml'
```

### 5.6 条件引入

```yaml
include:
  - local: 'ci/prod.yml'
    rules:
      - if: '$CI_COMMIT_TAG =~ /^pro-/'
```

### 5.7 注意事项

1. 所有 include 文件必须合法
2. stages 会合并，同名 job 会覆盖
3. 文件路径错误会导致 CI 解析失败

## 六、Gitlab Runner使用镜像缓存

主要是为了执行job的时候防止重复拉取镜像

配置`config/config.toml`

```toml
concurrent = 1
check_interval = 0
shutdown_timeout = 0
[session_server]
  session_timeout = 1800
[[runners]]
  name = "test-ci"
  url = "http://git.disoms.net"
  id = 2
  token = "your-gitlab-token"
  token_obtained_at = 2025-11-06T10:38:31Z
  token_expires_at = 0001-01-01T00:00:00Z
  executor = "docker"
  [runners.cache]
    MaxUploadedArchiveSize = 0
    [runners.cache.s3]
    [runners.cache.gcs]
    [runners.cache.azure]
  [runners.docker]
    tls_verify = false
    image = "golang:1.23.4" # 默认镜像
    privileged = false
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/cache"] # 缓存
    pull_policy = ["if-not-present"] # 策略
    shm_size = 0
    network_mtu = 0
```

重启镜像

## 七、常见问题与坑点

1. **分支读取不到变量**：关闭变量保护（取消 Protect variable）
2. **Runner 不执行 Job**：检查标签匹配及 “Run untagged jobs” 设置
3. **执行器错误**：custom 改为 docker 并重启容器
4. **权限错误**：确认 Token 与注册项目匹配
