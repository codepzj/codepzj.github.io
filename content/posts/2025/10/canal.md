---
title: "Canal 安装配置与 Go 客户端实践"
description: "介绍 Canal 的工作原理、服务端安装配置、Docker 部署方式以及 Go 客户端订阅 Binlog 的实践。"
date: '2025-10-28'
updated: '2026-01-15'
categories:
- 数据库
tags:
- canal
draft: false
---

Canal 是阿里开源的一款 MySQL 数据库增量日志解析工具，提供增量数据订阅和消费。使用Canal能够实现异步更新数据，配合MQ使用可在很多业务场景下发挥巨大作用。

## Canal简介
[canal](https://github.com/alibaba/canal) 是阿里开源的一款 MySQL 数据库增量日志解析工具，提供增量数据订阅和消费。

![](https://cdn.jsdelivr.net/gh/codepzj/images@main/20251028125658020.png)

使用Canal能够实现异步更新数据，配合MQ使用可在很多业务场景下发挥巨大作用。

## 工作原理
### MySQL主备复制原理
+ MySQL master 将数据变更写入二进制日志（binary log）, 日志中的记录叫做二进制日志事件（binary log events，可以通过 show binlog events 进行查看）
+ MySQL slave 将 master 的 binary log events 拷贝到它的中继日志(relay log)
+ MySQL slave 重放 relay log 中事件，将数据变更反映到它自己的数据

![](https://cdn.jsdelivr.net/gh/codepzj/images@main/20251028125703255.jpeg)

图片来源： [https://avisheksharma.wordpress.com/2015/01/07/step-wise-guide-to-setup-mysql-replication/](https://avisheksharma.wordpress.com/2015/01/07/step-wise-guide-to-setup-mysql-replication/)

### Canal 工作原理

+ Canal 模拟 MySQL slave 的交互协议，伪装自己为 MySQL slave ，向 MySQL master 发送 dump 协议
+ MySQL master 收到 dump 请求，开始推送 binary log 给 slave (即 Canal )
+ Canal 解析 binary log 对象(原始为 byte 流)

## 环境准备
你应该事先准备好一个MySQL环境，并按以下步骤进行设置。

### 开启binlog
需要先开启MySQL的 binlog 写入功能，配置 `binlog-format` 为 `ROW` 模式，具体`my.cnf` 中配置如下：

```ini
[mysqld]
log-bin=mysql-bin # 开启 binlog
binlog-format=ROW # 选择 ROW 模式
server_id=1 # 配置 MySQL replaction 需要定义，不要和 canal 的 slaveId 重复
```

修改配置文件之后，重启MySQL。

使用命令查看是否打开binlog模式，如输出以下内容则说明binlog已开启。

```sql
mysql> show variables like 'log_bin';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | ON    |
+---------------+-------+
```

查看`binlog_format`配置是否正确。

```text
mysql> show variables like 'binlog_format';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| binlog_format | ROW   |
+---------------+-------+
```

### 添加授权
Canal的原理是模拟自己为MySQL slave，所以一定要为账号授予做为MySQL slave的相关权限。

下面的命令是先创建一个名为`canal`的账号，再对其进行授权，如果已有账户可直接 grant。

```sql
CREATE USER canal IDENTIFIED BY 'canal';  
GRANT SELECT, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'canal'@'%';
-- GRANT ALL PRIVILEGES ON *.* TO 'canal'@'%' ;
FLUSH PRIVILEGES;
```

## 安装Canal

### release安装
打开[官方release页面](https://github.com/alibaba/canal/releases)，根据需要选择对应的软件包下载即可。

![](https://cdn.jsdelivr.net/gh/codepzj/images@main/20251028125715992.png)

将下载后的软件包解压，可看到以下目录。

```bash
bin
conf
lib
logs
```

修改配置文件：`canal-server/conf/example/instance.properties`。

将`canal.instance.master.address`修改为你的MySQL地址。

将`canal.instance.tsdb.dbUsername`修改为你上面授权的账号。

将`canal.instance.tsdb.dbPassword`修改为你上面授权账号的密码。

配置示例如下：

```properties
#################################################
## mysql serverId , v1.0.26+ will autoGen
# canal.instance.mysql.slaveId=0

# enable gtid use true/false
canal.instance.gtidon=false

# position info
canal.instance.master.address=127.0.0.1:3306
canal.instance.master.journal.name=
canal.instance.master.position=
canal.instance.master.timestamp=
canal.instance.master.gtid=

# rds oss binlog
canal.instance.rds.accesskey=
canal.instance.rds.secretkey=
canal.instance.rds.instanceId=

# table meta tsdb info
canal.instance.tsdb.enable=true
#canal.instance.tsdb.url=jdbc:mysql://127.0.0.1:3306/canal_tsdb
canal.instance.tsdb.dbUsername=canal
canal.instance.tsdb.dbPassword=canal
```

当然我还是推荐开发和测试阶段使用Docker搭建环境。

执行以下命令，拉取`canal-server`最新镜像。

```bash
docker pull canal/canal-server:latest
```

如果因网络问题无法直接拉取Docker镜像，也可以选择clone代码到本地编译。

```bash
git clone git@github.com:alibaba/canal.git
cd canal/docker && sh build.sh
```

### docker compose安装

#### windows下安装本地测试canal[开发环境]
配置`docker-compose.yaml`

```yaml
version: '3.8'
services:
  canal-server:
    image: canal/canal-server:latest
    container_name: canal-server
    ports:
      - "11111:11111"
    environment:
      - canal.instance.master.address=host.docker.internal:13306
      - canal.instance.dbUsername=root
      - canal.instance.dbPassword=123456
    restart: always
```

注意：如果是windows平台容器内使用[host.docker.internal](https://docs.docker.com/desktop/networking/#i-want-to-connect-from-a-container-to-a-service-on-the-host)表示`localhost`。

即：`canal.instance.master.address=host.docker.internal:13306`


#### linux下部署[生产环境]

> 以mysql的方式持久化

配置docker-compose.yml

```yaml
version: '3.8'
services:
  yabibi-canal-server:
    image: canal/canal-server:v1.1.8
    container_name: yabibi-canal-server
    ports:
      - "22221:11111"
    environment:
      - canal.serverMode=tcp

      # canal 同步的数据库
      - canal.instance.master.address=192.168.0.1:3306
      - canal.instance.dbUsername=canal
      - canal.instance.dbPassword=canal
      
      # canal tsdb
      - canal.instance.tsdb.enable=true
      - canal.instance.tsdb.url=jdbc:mysql://192.168.0.1:3306/canal_tsdb?useUnicode=true&characterEncoding=UTF-8&useSSL=false
      - canal.instance.tsdb.dbUsername=canal
      - canal.instance.tsdb.dbPassword=canal
      - canal.instance.tsdb.spring.xml=classpath:spring/tsdb/mysql-tsdb.xml

    volumes:
      - ./canal-data/canal-log:/home/admin/canal-server/logs

    restart: always
```

创建数据库并赋予canal用户操作权限

```sql
CREATE DATABASE canal_tsdb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
GRANT ALL PRIVILEGES ON canal_tsdb.* TO 'canal'@'%';
FLUSH PRIVILEGES;
```

前往数据库新建两个表:

```sql
CREATE TABLE IF NOT EXISTS `meta_snapshot` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `gmt_create` DATETIME NOT NULL COMMENT '创建时间',
  `gmt_modified` DATETIME NOT NULL COMMENT '修改时间',
  `destination` VARCHAR(128) DEFAULT NULL COMMENT '通道名称',
  `binlog_file` VARCHAR(64) DEFAULT NULL COMMENT 'binlog 文件名',
  `binlog_offest` BIGINT(20) DEFAULT NULL COMMENT 'binlog 偏移量',
  `binlog_master_id` VARCHAR(64) DEFAULT NULL COMMENT 'binlog 节点 id',
  `binlog_timestamp` BIGINT(20) DEFAULT NULL COMMENT 'binlog 应用的时间戳',
  `data` LONGTEXT COMMENT '表结构快照数据',
  `extra` TEXT COMMENT '额外扩展信息',
  PRIMARY KEY (`id`),
  UNIQUE KEY `binlog_file_offest` (`destination`,`binlog_master_id`,`binlog_file`,`binlog_offest`),
  KEY `destination` (`destination`),
  KEY `destination_timestamp` (`destination`,`binlog_timestamp`),
  KEY `gmt_modified` (`gmt_modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='TSDB 表结构快照表';

CREATE TABLE IF NOT EXISTS `meta_history` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `gmt_create` DATETIME NOT NULL COMMENT '创建时间',
  `gmt_modified` DATETIME NOT NULL COMMENT '修改时间',
  `destination` VARCHAR(128) DEFAULT NULL COMMENT '通道名称',
  `binlog_file` VARCHAR(64) DEFAULT NULL COMMENT 'binlog 文件名',
  `binlog_offest` BIGINT(20) DEFAULT NULL COMMENT 'binlog 偏移量',
  `binlog_master_id` VARCHAR(64) DEFAULT NULL COMMENT 'binlog 节点 id',
  `binlog_timestamp` BIGINT(20) DEFAULT NULL COMMENT 'binlog 应用的时间戳',
  `use_schema` VARCHAR(1024) DEFAULT NULL COMMENT '执行时 schema',
  `sql_schema` VARCHAR(1024) DEFAULT NULL COMMENT '对应的 schema',
  `sql_table` VARCHAR(1024) DEFAULT NULL COMMENT '对应的 table',
  `sql_text` LONGTEXT COMMENT '执行的 SQL',
  `sql_type` VARCHAR(256) DEFAULT NULL COMMENT 'SQL 类型',
  `extra` TEXT COMMENT '额外扩展信息',
  PRIMARY KEY (`id`),
  UNIQUE KEY `binlog_file_offest` (`destination`,`binlog_master_id`,`binlog_file`,`binlog_offest`),
  KEY `destination` (`destination`),
  KEY `destination_timestamp` (`destination`,`binlog_timestamp`),
  KEY `gmt_modified` (`gmt_modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='TSDB 表结构历史变化表';
```

- https://github.com/alibaba/canal/blob/master/deployer/src/main/resources/canal.properties
- https://www.cnblogs.com/LQBlog/p/14582469.html

修改完配置后重启容器。

```bash
docker-compose restart
```

## Canal Client
Canal 特别设计了 Client-Server 模式，交互协议使用 protobuf v3 , Client 端可采用不同语言实现不同的消费逻辑。

启动Canal Server之后，我们可以使用Canal客户端连接Canal进行消费，本文以Go客户端[canal-go](https://github.com/Q1mi/canal-go)为例，演示如何从 canal-server 消费数据。

```go
package main

import (
	"fmt"
	"time"

	pbe "github.com/Q1mi/canal-go/protocol/entry"

	"github.com/Q1mi/canal-go/client"
	"google.golang.org/protobuf/proto"
)

// canal-go client demo

func main() {
	// 连接canal-server
	// 请修改为你的 canal-server 配置
	connector := client.NewSimpleCanalConnector(
		"127.0.0.1", 11111, "", "", "example", 60000, 60*60*1000)
	err := connector.Connect()
	if err != nil {
		panic(err)
	}

	// mysql 数据解析关注的表，Perl正则表达式.
	err = connector.Subscribe(".*\\..*")
	if err != nil {
		fmt.Printf("connector.Subscribe failed, err:%v\n", err)
		panic(err)
	}

	// 消费消息
	for {
		message, err := connector.Get(100, nil, nil)
		if err != nil {
			fmt.Printf("connector.Get failed, err:%v\n", err)
			continue
		}
		batchId := message.Id
		if batchId == -1 || len(message.Entries) <= 0 {
			time.Sleep(time.Second)
			fmt.Println("===暂无数据===")
			continue
		}
		printEntry(message.Entries)
	}
}

func printEntry(entries []*pbe.Entry) {
	for _, entry := range entries {
		// 忽略事务开启和事务关闭类型
		if entry.GetEntryType() == pbe.EntryType_TRANSACTIONBEGIN ||
			entry.GetEntryType() == pbe.EntryType_TRANSACTIONEND {
			continue
		}
		// RowChange对象，包含了一行数据变化的所有特征
		rowChange := new(pbe.RowChange)
		// protobuf解析
		err := proto.Unmarshal(entry.GetStoreValue(), rowChange)
		if err != nil {
			fmt.Printf("proto.Unmarshal failed, err:%v\n", err)
		}
		if rowChange == nil {
			continue
		}
		// 获取并打印Header信息
		header := entry.GetHeader()
		fmt.Printf("binlog[%s : %d], name[%s,%s], eventType: %s\n",
			header.GetLogfileName(),
			header.GetLogfileOffset(),
			header.GetSchemaName(),
			header.GetTableName(),
			header.GetEventType(),
		)
		//判断是否为DDL语句
		if rowChange.GetIsDdl() {
			fmt.Printf("isDdl:true, sql:%v\n", rowChange.GetSql())
		}

		// 获取操作类型：insert/update/delete等
		eventType := rowChange.GetEventType()
		for _, rowData := range rowChange.GetRowDatas() {
			if eventType == pbe.EventType_DELETE {
				printColumn(rowData.GetBeforeColumns())
			} else if eventType == pbe.EventType_INSERT || eventType == pbe.EventType_UPDATE {
				printColumn(rowData.GetAfterColumns())
			} else {
				fmt.Println("---before---")
				printColumn(rowData.GetBeforeColumns())
				fmt.Println("---after---")
				printColumn(rowData.GetAfterColumns())
			}
		}
	}
}

func printColumn(columns []*pbe.Column) {
	for _, col := range columns {
		fmt.Printf("%s:%s  updated=%v\n", col.GetName(), col.GetValue(), col.GetUpdated())
	}
}
```

## Canal Kafka/RoctetMQ
Canal 1.1.1版本之后，默认支持将Canal Server接收到的binlog数据直接投递到MQ，目前默认支持的MQ系统有Kafka、RocketMQ、RabbitMQ、PulsarMQ。

这里以介绍使用Canal Server将binlog数据投递到Kafka为例。

### 配置
请事先准备好Kafka环境

#### 修改instance配置
在`instance.properties`配置文件中设置MQ相关配置。

```properties
#  按需修改成自己的数据库信息
#################################################
...
canal.instance.master.address=127.0.0.1:3306
# username/password,数据库的用户名和密码
...
canal.instance.dbUsername = canal
canal.instance.dbPassword = canal
...
# mq config
# 设置默认的topic
canal.mq.topic=example
# 针对库名或者表名发送动态topic
#canal.mq.dynamicTopic=mytest,.*,mytest.user,mytest\\..*,.*\\..*
canal.mq.partition=0
# hash partition config
#canal.mq.partitionsNum=3
#库名.表名: 唯一主键，多个表之间用逗号分隔
#canal.mq.partitionHash=mytest.person:id,mytest.role:id
#################################################
```

其中，`canal.mq.dynamicTopic`配置说明。

Canal 1.1.3版本之后, 支持配置格式为：`schema` 或 `schema.table`，多个配置之间使用逗号或分号分隔。

+ 例子1：`test\\.test` 指定匹配的单表，发送到以test_test为名字的topic上
+ 例子2：`.*\\..*` 匹配所有表，则每个表都会发送到各自表名的topic上
+ 例子3：`test` 指定匹配对应的库，一个库的所有表都会发送到库名的topic上
+ 例子4：`test\\..*` 指定匹配的表达式，针对匹配的表会发送到各自表名的topic上
+ 例子5：`test,test1\\.test1`，指定多个表达式，会将test库的表都发送到test的topic上，`test1\\.test1`的表发送到对应的`test1_test1` topic上，其余的表发送到默认的`canal.mq.topic`值

为满足更大的灵活性，Canal还允许对匹配条件的规则指定发送的topic名字，配置格式：`topicName:schema` 或 `topicName:schema.table`。

+ 例子1: `test:test\\.test` 指定匹配的单表，发送到以test为名字的topic上
+ 例子2: `test:.*\\..*` 匹配所有表，因为有指定topic，则每个表都会发送到test的topic下
+ 例子3: `test:test` 指定匹配对应的库，一个库的所有表都会发送到test的topic下
+ 例子4：`testA:test\\..*` 指定匹配的表达式，针对匹配的表会发送到testA的topic下
+ 例子5：`test0:test,test1:test1\\.test1`，指定多个表达式，会将test库的表都发送到test0的topic下，`test1\\.test1`的表发送到对应的test1的topic下，其余的表发送到默认的`canal.mq.topic`值

#### 修改canal 配置文件
默认配置文件路径为`/usr/local/canal/conf/canal.properties`

```properties
# ...
# 可选项: tcp(默认), kafka,RocketMQ,rabbitmq,pulsarmq
canal.serverMode = kafka
# ...

# 是否为flat json格式对象
canal.mq.flatMessage = true
# Canal的batch size, 默认50K, 由于kafka最大消息体限制请勿超过1M(900K以下)
canal.mq.canalBatchSize = 50
# Canal get数据的超时时间, 单位: 毫秒, 空为不限超时
canal.mq.canalGetTimeout = 100
canal.mq.accessChannel = local

...

##################################################
#########                    Kafka                   #############
##################################################
# 此处配置修改为你的Kafka环境地址
kafka.bootstrap.servers = 127.0.0.1:9092
kafka.acks = all
kafka.compression.type = none
kafka.batch.size = 16384
kafka.linger.ms = 1
kafka.max.request.size = 1048576
kafka.buffer.memory = 33554432
kafka.max.in.flight.requests.per.connection = 1
kafka.retries = 0

kafka.kerberos.enable = false
kafka.kerberos.krb5.file = ../conf/kerberos/krb5.conf
kafka.kerberos.jaas.file = ../conf/kerberos/jaas.conf

# sasl demo
# kafka.sasl.jaas.config = org.apache.kafka.common.security.scram.ScramLoginModule required \\n username=\"alice\" \\npassword="alice-secret\";
# kafka.sasl.mechanism = SCRAM-SHA-512
# kafka.security.protocol = SASL_PLAINTEXT
```

更多详细内容请查看[Canal-Kafka-RocketMQ-QuickStart](https://github.com/alibaba/canal/wiki/Canal-Kafka-RocketMQ-QuickStart)。

按上述修改Canal配置后，重启Canal服务即可。
