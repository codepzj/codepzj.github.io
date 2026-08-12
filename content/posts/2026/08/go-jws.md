---
title: "Go 使用 JWS 与 RS256 实现私钥签名、公钥验签"
description: "通过 lestrrat-go/jwx v4 完成一个 JWS 示例：使用 OpenSSL 生成 RSA 密钥，解析 PEM 文件，以 RS256 对 JSON 载荷签名，并使用公钥验证签名。"
date: '2026-08-13'
updated: '2026-08-13'
categories:
- Go语言
tags:
- Go
- JWS
- RS256
- RSA
- JOSE
---

在接口鉴权、服务间通信和第三方回调等场景中，我们不仅需要传递数据，还需要确认数据确实来自可信的发送方，并且在传输过程中没有被修改。JWS（JSON Web Signature）正是用来解决这类问题的标准。

本文使用 Go 和 `github.com/lestrrat-go/jwx/v4` 完成一个最小示例：先用 OpenSSL 生成 RSA 密钥对，再使用 RS256 和私钥对 JSON 数据签名，最后使用公钥验证签名并还原原始数据。

::alert{type="info" title="阅读目标" card}
读完本文，你将理解 JWS 的三段结构和 RS256 的签名流程，能够区分 JWT、JWS、JWE、JWK，并能在 Go 中完成 RSA 密钥解析、私钥签名与公钥验签。
::

::link-card
---
title: Go JWS 完整示例
description: 本文使用的 main.go、RSA 公私钥及运行说明
link: https://cnb.cool/codepzj/goplayground/-/tree/main/jws
---
::

## JWS 的三部分结构

JWS 是一种为数据添加数字签名的标准。它最常见的紧凑序列化格式由三部分组成：

```text
BASE64URL(Protected Header).BASE64URL(Payload).BASE64URL(Signature)
```

这里的点号 `.` 是三部分之间的分隔符。以前文的业务数据为例，这三部分的含义如下。

### Protected Header：告诉接收方如何验签

Protected Header 是一段 JSON 元数据。本例使用 RS256，因此签名前的内容类似：

```json
{
  "alg": "RS256"
}
```

它经过 Base64URL 编码后成为 JWS 的第一部分：

```text
eyJhbGciOiJSUzI1NiJ9
```

`alg` 表示签名算法。实际系统中还常用 `kid` 表示签名所使用的密钥编号，方便接收方在密钥轮换时找到对应公钥。

之所以称为 **Protected** Header，是因为它也参与签名计算。攻击者如果把 `alg` 或 `kid` 改掉，原签名就会失效。不过接收方仍然应该维护算法白名单，不能仅根据 Header 的内容决定是否接受某种算法。

### Payload：真正要传递的业务数据

Payload 是发送方希望传递的数据。本例将 `Payload` 结构体序列化为下面的 JSON：

```json
{
  "uid": 1008676840,
  "session_id": "27a5d73b-11be-4d97-a728-2d08e9a25771",
  "pkg": "com.codepzj.app.android",
  "cou": "CN",
  "did": "1102bc81-6f25-4d08-8f8d-46bba8c62d62"
}
```

这段 JSON 经过 Base64URL 编码后成为第二部分。Base64URL 只是为了让二进制数据能安全地放进 URL 或 HTTP Header，它不是加密：拿到 JWS 的人无需密钥就能解码并看到 Payload。

### Signature：证明前两部分没有被篡改

签名方先把前两部分的编码结果用一个点号连接起来：

```text
BASE64URL(Protected Header) + "." + BASE64URL(Payload)
```

这段内容称为 **Signing Input**。随后使用 RS256 和 RSA 私钥对 Signing Input 计算数字签名，再将签名结果进行 Base64URL 编码，得到 JWS 的第三部分：

```text
Signature = RS256_SIGN(私钥, Signing Input)
```

最终传输的完整 JWS 就是：

```text
Protected Header.Payload.Signature
```

接收方收到 JWS 后，用点号拆出三部分，再使用公钥验证第三部分是否确实是前两部分的签名：

```text
RS256_VERIFY(公钥, Signing Input, Signature)
```

验证成功可以证明两件事：Header 和 Payload 自签名生成后没有被修改；签名来自持有对应 RSA 私钥的一方。验证失败则说明内容被篡改、签名使用了错误私钥，或者验证方拿错了公钥。验证成功并不能证明 Payload 内容本身符合业务规则，过期时间、签发方和权限等仍需另外校验。

把上面的过程连起来，就是一条完整的签名与验签链路：

::timeline
{1. 准备数据}

将 Protected Header 和 Payload 分别进行 Base64URL 编码。

{2. 构造 Signing Input}

用点号连接编码后的 Header 与 Payload。

{3. 生成签名}

签名方使用 RSA 私钥和 RS256 对 Signing Input 签名，组装成三段 JWS。

{4. 验证签名}

接收方使用 RSA 公钥验证 Signature，成功后才能信任 Payload 未被篡改。
::

## JWT、JWS、JWE 与 JWK 的区别

这几个名称都属于 JOSE（JSON Object Signing and Encryption）规范体系，但它们解决的问题不同。

::card-list
- **JWT 定义传递什么数据**：用 Claims 描述用户、签发方、有效期等信息。
- **JWS 定义如何签名数据**：防止数据被篡改，并验证数据来自谁。
- **JWE 定义如何加密数据**：防止无关方看到数据，同时校验密文完整性。
- **JWK 定义如何描述密钥**：用 JSON 表示 RSA、EC 等公钥或私钥。
::

| 名称 | 全称 | 核心作用 | 是否隐藏内容 | 紧凑格式 |
|---|---|---|---|---|
| JWT | JSON Web Token | 定义一组可在系统间传递的 Claims | 取决于使用 JWS 还是 JWE | 通常是 3 段或 5 段 |
| JWS | JSON Web Signature | 对任意载荷签名，保证完整性并验证来源 | 否 | 3 段 |
| JWE | JSON Web Encryption | 对任意明文进行认证加密 | 是 | 5 段 |
| JWK | JSON Web Key | 用 JSON 表示密码学密钥 | 不适用，它不是 Token | JSON 对象，没有点号分段 |

它们不是四种相互竞争的 Token。JWT 是数据及 Claims 规则，JWS 和 JWE 是保护、封装数据的方式，JWK 则负责表达过程中使用的密钥。

### JWT：定义 Claims，而不是一种签名算法

JWT 的 Payload 是一个 Claims JSON 对象，例如：

```json [JWT Claims]
{
  "sub": "1008676840",
  "iss": "https://auth.example.com",
  "aud": "com.codepzj.app.android",
  "iat": 1786550400,
  "exp": 1786554000
}
```

::folding{title="常见 JWT 注册 Claims"}
常见的注册 Claims 包括：

- `sub`（Subject）：这个 Token 描述的主体，通常是用户 ID。
- `iss`（Issuer）：由谁签发。
- `aud`（Audience）：允许哪个系统使用。
- `iat`（Issued At）：签发时间。
- `nbf`（Not Before）：在什么时间之后才能使用。
- `exp`（Expiration Time）：过期时间。
- `jti`（JWT ID）：Token 的唯一编号，可辅助防重放或吊销。
::

JWT 只规定 Claims 的表达和处理规则，并没有规定一定使用 RS256，也没有规定一定是“可读的三段字符串”。JWT 可以被 JWS 签名，也可以被 JWE 加密。

日常开发中所说的“JWT Token”通常是 **Signed JWT**：把 JWT Claims 作为 JWS 的 Payload，因此呈现为三段结构：

```text
BASE64URL(Header).BASE64URL(JWT Claims).BASE64URL(Signature)
```

这种 JWT 能验签，但 Payload 仍然可以被任何人解码查看。本文示例虽然也对 JSON 数据进行了 JWS 签名，但没有使用 JWT 包校验 `exp`、`iss`、`aud` 等 Claims，所以更准确地说它是“JSON Payload 的 JWS 示例”。

### JWS：签名保护，不负责保密

JWS 可以给任意字节数据签名，Payload 不一定是 JWT Claims，也不一定是 JSON。它解决的是：

- 数据是否在传输过程中被修改；
- 数据是否由持有签名密钥的一方发出。

JWS 紧凑格式固定为三段：

```text
Protected Header.Payload.Signature
```

使用 RS256 时，签名方持有 RSA 私钥，验证方持有 RSA 公钥。公钥只能验证，不能生成对应签名，因此可以安全地分发给多个验证服务。

### JWE：加密保护，紧凑格式有五段

当 Payload 中包含不希望客户端、中间代理或日志系统看到的数据时，可以使用 JWE。JWE 的紧凑格式由五部分组成：

```text
Protected Header.Encrypted Key.IV.Ciphertext.Authentication Tag
```

各部分含义如下：

- `Protected Header`：声明密钥管理算法 `alg` 和内容加密算法 `enc`。
- `Encrypted Key`：经过接收方密钥保护的内容加密密钥。
- `IV`：内容加密算法使用的初始化向量。
- `Ciphertext`：明文加密后的密文。
- `Authentication Tag`：用于发现 Header 或密文是否被篡改的认证标签。

JWE Header 中的 `alg` 和 `enc` 含义不同。例如：

```json [JWE Protected Header]
{
  "alg": "RSA-OAEP-256",
  "enc": "A256GCM"
}
```

- `alg` 表示如何管理或传递内容加密密钥。本例使用接收方 RSA 公钥，通过 RSA-OAEP-256 保护这个密钥。
- `enc` 表示如何加密真正的 Payload。本例使用 A256GCM 对内容进行认证加密。

之所以不直接用 RSA 加密整个 Payload，是因为 RSA 不适合加密较长数据。JWE 通常采用混合加密：随机生成一个对称密钥加密正文，再使用接收方的公钥保护这个对称密钥。接收方使用私钥解出对称密钥后，才能还原正文。

```text
发送方：接收方公钥 + 明文 → JWE
接收方：接收方私钥 + JWE → 明文
```

JWE 不只是“把内容变得不可读”，其认证加密机制还会检测密文是否被篡改。

### JWK：用 JSON 表示密钥

PEM 和 JWK 都可以表示密钥，只是编码形式不同。本文从 PEM 文件读取 RSA 公钥，而同一个公钥也可以写成 JWK：

```json [RSA Public JWK]
{
  "kty": "RSA",
  "kid": "rsa-key-2026-08",
  "use": "sig",
  "alg": "RS256",
  "n": "0z8zW...省略...",
  "e": "AQAB"
}
```

常见字段包括：

- `kty`（Key Type）：密钥类型，例如 `RSA`、`EC` 或 `OKP`。
- `kid`（Key ID）：密钥编号，用于从多个候选密钥中选择一个。
- `use`（Public Key Use）：用途，`sig` 表示签名，`enc` 表示加密。
- `alg`：建议搭配使用的算法，例如 `RS256`。
- `n`、`e`：RSA 公钥的模数和公开指数，使用 Base64URL 编码。

如果 JWK 中出现 RSA 私钥参数 `d`、`p`、`q` 等，它就是私钥 JWK，必须像 PEM 私钥一样严格保护，不能通过公开接口下发。

多个 JWK 可以组成 JWKS（JSON Web Key Set）：

```json [JWKS]
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "rsa-key-2026-08",
      "use": "sig",
      "alg": "RS256",
      "n": "0z8zW...省略...",
      "e": "AQAB"
    }
  ]
}
```

身份服务通常公开一个 JWKS 地址，只发布公钥。验证方读取 JWS Header 中的 `kid`，再从 JWKS 找到相同 `kid` 的公钥完成验签。这样可以在不中断服务的情况下同时保留新旧公钥，实现密钥轮换。

```text
JWS Header 中的 kid
        ↓ 匹配
JWKS 中某个 JWK
        ↓ 取出公钥
验证 JWS Signature
```

### 签名 JWT、加密 JWT 与嵌套 JWT

把这些概念组合起来，常见的 Token 有三种形态：

::tab{:tabs='["签名 JWT", "加密 JWT", "嵌套 JWT"]'}
#tab1
JWT Claims 作为 JWS Payload：

```text
JWT Claims → JWS
```

最终得到三段 Token。内容可以直接解码查看，但接收方能够发现篡改并验证签发来源。这是日常鉴权中最常见的 JWT 形态。

#tab2
JWT Claims 作为 JWE 明文：

```text
JWT Claims → JWE
```

最终得到五段 Token。只有持有解密密钥的接收方能够读取 Claims，适合 Payload 必须保密的场景。

#tab3
先将 JWT Claims 签名为 JWS，再加密整个 JWS：

```text
JWT Claims → JWS → JWE
```

接收方先解密外层 JWE，再验证内层 JWS，同时获得保密性、完整性和来源认证。
::

在嵌套 JWT 中，外层 JWE Header 通常会使用 `cty: "JWT"` 表明解密后得到的内容仍然是一个 JWT。

如何选择取决于安全目标：只需要防篡改和验证来源时使用签名 JWT；Payload 含有必须保密的数据时使用 JWE；既要隐藏内容，又要让最终接收方验证原始签发者时，可以使用嵌套 JWT。无论选择哪种形式，业务层仍然必须校验过期时间、签发方、接收方和权限。

## 本文为何使用 JWS 与 RS256

同样需要注意，JWS 并不限定只能使用非对称算法。它既可以使用 HS256 这类共享密钥算法，也可以使用 RS256、ES256 等非对称算法。本文选择的 **RS256** 表示：

- 使用 RSA 密钥对；
- 使用 SHA-256 计算摘要；
- 使用 RSASSA-PKCS1-v1_5 生成和验证签名。

RS256 的优势在于签名方只需保管私钥，验证方只需持有公钥。验证服务可以判断签名是否合法，但无法使用公钥伪造新的签名，适合多个系统只负责验签的场景。

::alert{type="warning" title="JWS 只保证完整性和来源可信"}
JWS 的 Payload 只是经过 Base64URL 编码，并没有被加密。任何拿到 JWS 的人都可以解码并查看载荷，因此不要把密码、私钥等敏感信息直接放入 Payload。需要隐藏内容时，应使用 JWE 或在业务层单独加密。
::

## 初始化项目

示例使用 `lestrrat-go/jwx` v4：

```bash
go get github.com/lestrrat-go/jwx/v4
go get github.com/google/uuid
```

目录结构如下：

```text
jws/
├── main.go
└── rsa/
    ├── private.pem
    └── public.pem
```

## 使用 OpenSSL 生成 RSA 密钥对

先进入示例目录并创建密钥目录：

```bash
mkdir -p rsa
```

生成一个 2048 位 RSA 私钥：

```bash
openssl genrsa -out rsa/private.pem 2048
```

再从私钥中导出公钥：

```bash
openssl rsa -in rsa/private.pem -pubout -out rsa/public.pem
```

生成后可以检查文件头：

```bash
head -n 1 rsa/private.pem
head -n 1 rsa/public.pem
```

本文示例使用的文件头为：

```text
-----BEGIN PRIVATE KEY-----
-----BEGIN PUBLIC KEY-----
```

其中，`PRIVATE KEY` 对应 PKCS#8 私钥，`PUBLIC KEY` 对应 X.509 SubjectPublicKeyInfo 公钥。后续 Go 代码需要选择与文件格式匹配的解析函数。

::alert{type="info" title="不同 OpenSSL 版本可能生成不同格式"}
如果私钥文件头是 `-----BEGIN RSA PRIVATE KEY-----`，它通常是 PKCS#1 格式，应使用 `x509.ParsePKCS1PrivateKey` 解析，不能直接传给 `x509.ParsePKCS8PrivateKey`。
::

私钥必须严格限制访问权限，也不应该提交到 Git 仓库：

```bash
chmod 600 rsa/private.pem
```

生产环境中建议通过密钥管理服务、Secret 或安全的配置中心注入私钥，而不是把它和应用代码一起分发。

## 从 PEM 文件读取 RSA 私钥

磁盘中的密钥使用 PEM 文本格式保存，而 `crypto/x509` 实际解析的是 PEM 内部的 DER 二进制数据。因此读取私钥需要经过以下步骤：

1. 使用 `os.ReadFile` 读取文件；
2. 使用 `pem.Decode` 取出 DER 数据；
3. 使用 `x509.ParsePKCS8PrivateKey` 解析 PKCS#8；
4. 通过类型断言确认它是 RSA 私钥。

```go
func readRSAPrivateKeyFromPath(path string) (*rsa.PrivateKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(data)
	if block == nil {
		return nil, errors.New("failed to decode PEM")
	}

	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	privateKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("private key is not RSA")
	}
	return privateKey, nil
}
```

`ParsePKCS8PrivateKey` 的返回值是 `any`，因为 PKCS#8 可以保存不同类型的私钥，所以还要将结果断言为 `*rsa.PrivateKey`。

## 从 PEM 文件读取 RSA 公钥

公钥的读取过程类似，不过 `PUBLIC KEY` 文件使用的是 PKIX 公钥格式，需要调用 `x509.ParsePKIXPublicKey`：

```go
func readRSAPublicKeyFromPath(path string) (*rsa.PublicKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(data)
	if block == nil {
		return nil, errors.New("failed to decode PEM")
	}

	key, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	publicKey, ok := key.(*rsa.PublicKey)
	if !ok {
		return nil, errors.New("public key is not RSA")
	}
	return publicKey, nil
}
```

这里同样需要类型断言，因为 PKIX 格式还可能保存 ECDSA、Ed25519 等其他类型的公钥。

## 定义需要签名的 Payload

示例使用一个结构体表示业务载荷：

```go
type Payload struct {
	UID       int64  `json:"uid"`
	SessionID string `json:"session_id"`
	Pkg       string `json:"pkg"`
	Cou       string `json:"cou"`
	DID       string `json:"did"`
}
```

创建数据并将它序列化为 JSON：

```go
payload := Payload{
	UID:       1008676840,
	SessionID: uuid.NewString(),
	Pkg:       "com.codepzj.app.android",
	Cou:       "CN",
	DID:       uuid.NewString(),
}

payloadBytes, err := json.Marshal(payload)
if err != nil {
	log.Fatalf("marshal payload failed: %v", err)
}
```

`jws.Sign` 接收字节切片，它并不要求 Payload 一定是 JSON。这里先进行 JSON 序列化，是为了便于在不同服务和语言之间传递结构化数据。

## 使用私钥和 RS256 签名

先读取私钥，再调用 `jws.Sign`：

```go
privateKey, err := readRSAPrivateKeyFromPath("./rsa/private.pem")
if err != nil {
	log.Fatalf("parse RSA private key failed: %v", err)
}

signed, err := jws.Sign(
	payloadBytes,
	jws.WithKey(jwa.RS256(), privateKey),
)
if err != nil {
	log.Fatalf("sign payload failed: %v", err)
}

fmt.Printf("signed: %s\n", signed)
```

`jwa.RS256()` 明确指定签名算法为 RS256，`privateKey` 则用于产生签名。生成的结果类似：

```text
eyJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjEwMDg2NzY4NDAs...<省略>.X21n...<省略>
```

第一部分解码后是受保护头：

```json
{
  "alg": "RS256"
}
```

第二部分是原始 JSON 载荷的 Base64URL 编码，第三部分才是真正的签名值。Payload 或受保护头只要有一个字节发生改变，原签名就无法通过验证。

## 使用公钥验签并还原 Payload

验证方读取公钥，并通过同一个 RS256 算法验证签名：

```go
publicKey, err := readRSAPublicKeyFromPath("./rsa/public.pem")
if err != nil {
	log.Fatalf("parse RSA public key failed: %v", err)
}

body, err := jws.Verify(
	signed,
	jws.WithKey(jwa.RS256(), publicKey),
)
if err != nil {
	log.Fatalf("verify JWS failed: %v", err)
}
```

`jws.Verify` 只有在签名合法时才返回经过验证的 Payload。不要在验签之前信任或使用载荷中的业务字段。

最后将验证后的 JSON 反序列化回结构体：

```go
var verifiedPayload Payload
if err := json.Unmarshal(body, &verifiedPayload); err != nil {
	log.Fatalf("unmarshal payload failed: %v", err)
}

fmt.Printf("verified payload: %+v\n", verifiedPayload)
```

完整的数据流如下：

::timeline
{Payload 结构体}

调用 `json.Marshal` 得到 JSON 字节。

{生成 JWS}

调用 `jws.Sign`，使用 RS256 和 RSA 私钥生成 `Header.Payload.Signature`。

{验证 JWS}

调用 `jws.Verify`，使用 RS256 和 RSA 公钥验证签名并取出 JSON 字节。

{还原 Payload}

调用 `json.Unmarshal` 将验证后的 JSON 字节还原为结构体。
::

## 运行示例

由于代码使用了 `./rsa/private.pem` 和 `./rsa/public.pem` 相对路径，需要在 `jws` 目录中运行：

```bash
cd jws
go run .
```

输出类似：

```text
signed: eyJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjEwMDg2NzY4NDAs...<省略>
verified payload: {UID:1008676840 SessionID:27a5d73b-11be-4d97-a728-2d08e9a25771 Pkg:com.codepzj.app.android Cou:CN DID:1102bc81-6f25-4d08-8f8d-46bba8c62d62}
```

如果在 `goplayground` 根目录执行 `go run ./jws`，程序会从当前工作目录查找 `./rsa/private.pem`，因此可能出现下面的错误：

```text
open ./rsa/private.pem: no such file or directory
```

实际项目中可以通过配置项传入绝对路径，或使用 `go:embed` 嵌入公钥。私钥一般不建议嵌入二进制文件。

## 验证篡改后的数据

JWS 的价值在于能够发现数据是否被修改。可以在签名完成后手动改变 `signed` 中 Payload 部分的任意字符，再进行验证：

```go
body, err := jws.Verify(tampered, jws.WithKey(jwa.RS256(), publicKey))
if err != nil {
	log.Printf("signature verification failed: %v", err)
}
```

即使修改后的 Base64URL 仍然能够正常解码，它也无法通过原公钥的签名验证，因为签名所覆盖的内容已经发生变化。

## 生产环境需要继续补充什么

这个示例打通了签名和验签的最小链路，但生产环境通常还要补充以下能力：

::card-list
- **时间限制**：载荷中加入签发时间和过期时间，并在验签后主动校验，避免签名永久有效。
- **签发方与接收方限制**：校验 `issuer`、`audience` 等业务字段，避免合法签名被用到错误的系统。
- **防重放**：加入唯一请求 ID、时间戳或 nonce，并在服务端记录短期使用状态。
- **算法白名单**：验签时由服务端固定允许的算法，不能盲目信任 Header 中的 `alg`。
- **密钥轮换**：通过 `kid` 标识密钥版本，验证方根据 `kid` 选择对应公钥。
- **私钥保护**：限制文件权限，避免写入日志，并使用 KMS、HSM 或 Secret 管理系统保存私钥。
- **错误处理**：对外返回统一的验签失败信息，对内记录可追踪但不泄露敏感数据的日志。
::

如果载荷本身就是认证 Claims，并且需要标准的过期时间、签发方和接收方校验，可以在同一个 `jwx` 项目中继续使用 `jwt` 包建模和验证 JWT，而不是手动重复实现全部规则。

## 总结

使用 Go 实现 RS256 JWS 的核心只有两步：签名方调用 `jws.Sign` 并传入 RSA 私钥，验证方调用 `jws.Verify` 并传入 RSA 公钥。真正容易出错的地方，反而是密钥格式、相对路径和安全边界。

需要记住：

- JWS 用于签名，不负责加密 Payload；
- RS256 使用私钥签名、公钥验签；
- PEM 文件头必须与 `crypto/x509` 的解析函数匹配；
- 只有 `jws.Verify` 成功后，才能信任返回的 Payload；
- 生产环境还需要处理过期时间、防重放、算法限制和密钥轮换。

理解这些基础后，就可以把同样的签名流程应用到 API 鉴权、服务间消息、Webhook 回调和配置下发等场景中。

## 参考资料

- https://www.rfc-editor.org/rfc/rfc7515
- https://www.rfc-editor.org/rfc/rfc7518
- https://pkg.go.dev/github.com/lestrrat-go/jwx/v4/jws
