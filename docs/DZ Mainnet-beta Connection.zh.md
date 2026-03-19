# 验证器以IBRL模式连接主网Beta
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "通过连接到DoubleZero，我同意[DoubleZero服务条款](https://doublezero.xyz/terms-protocol)"



### 以IBRL模式连接到主网Beta

!!! Note inline end
    IBRL模式不需要重启验证器客户端，因为它使用您现有的公共IP地址。

Solana主网验证器将完成到DoubleZero主网Beta的连接，详情请见本页面。

每个Solana验证器都有其自己的**身份密钥对**；从中提取称为**节点ID**的公钥。这是验证器在Solana网络上的唯一指纹。

确认DoubleZero ID和节点ID后，您将证明您对机器的所有权。这通过创建包含使用验证器身份密钥签名的DoubleZero ID的消息来完成。由此产生的加密签名作为您控制该验证器的可验证证明。

最后，您将向DoubleZero提交**连接请求**。此请求传达：*"这是我的身份，这是所有权证明，这是我打算如何连接。"* DoubleZero验证此信息，接受证明，并为DoubleZero上的验证器配置网络访问。

本指南允许1个主验证器注册自身，以及同时注册最多3台备份/故障转移机器。

## 前提条件

- Solana CLI已安装并在$PATH中
- 对于验证器：有权访问sol用户下的验证器身份密钥对文件（如validator-keypair.json）
- 对于验证器：验证正在连接的Solana验证器的身份密钥上至少有1 SOL
- 防火墙规则允许DoubleZero和Solana RPC所需的出站连接，包括GRE（ip proto 47）和BGP（169.254.0.0/16上的tcp/179）

!!! info
    验证器ID将与Solana gossip进行核对以确定目标IP。然后将使用目标IP和DoubleZero ID在您的机器和目标DoubleZero设备之间建立GRE隧道。

    注意：如果您在同一IP上同时有垃圾ID和主ID，只有主ID将用于机器注册。这是因为垃圾ID不会出现在gossip中，因此无法用于验证目标机器的IP。

## 1. 环境配置

请在继续之前按照[设置](setup.md)说明操作。

设置的最后一步是断开与网络的连接。这是为了确保您的机器上只有一个到DoubleZero的隧道处于开放状态，并且该隧道在正确的网络上。

<div data-wizard-step="mainnet-env-config" markdown>

要配置DoubleZero客户端CLI（`doublezero`）和守护程序（`doublezerod`）连接到**DoubleZero主网Beta**：
```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

您应该看到以下输出：
`
✅ doublezerod configured for environment mainnet-beta
`

大约30秒后，您将看到可用的DoubleZero设备：

```bash
doublezero latency
```
示例输出（主网Beta）
```bash
 pubkey                                       | code          | ip              | min      | max      | avg      | reachable
 2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.74ms   | 1.92ms   | 1.84ms   | true
 ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.88ms   | 4.39ms   | 2.72ms   | true
 8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.45ms   | 3.30ms   | 2.74ms   | true
 8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.88ms   | 5.13ms   | 3.02ms   | true
 uzyg9iYw2FEbtdTHaDb5HoeEWYAPRPQgvsgyd873qPS  | nyc001-dz002  | 4.42.212.122    | 3.17ms   | 3.63ms   | 3.33ms   | true
 FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.33ms   | 5.46ms   | 3.39ms   | true
 9oKLaL6Hwno5TyAFutTbbkNrzxm1fw9fhzkiUHgsxgGx | dz-dc10-sw01  | 137.239.200.186 | 6.84ms   | 7.01ms   | 6.91ms   | true
 DESzDP8GkSTpQLkrUegLkt4S2ynGfZX5bTDzZf3sEE58 | was001-dz002  | 38.88.214.133   | 7.39ms   | 7.44ms   | 7.41ms   | true
 HHNCpqB7CwHVLxAiB1S86ko6gJRzLCtw78K1tc7ZpT5P | was001-dz001  | 66.198.11.74    | 7.67ms   | 7.85ms   | 7.76ms   | true
 9LFtjDzohKvCBzSquQD4YtL3HwuvkKBDE7KSzb8ztV2b | dz-mtl11-sw01 | 134.195.161.10  | 9.88ms   | 10.01ms  | 9.95ms   | true
 9M7FfYYyjM4wGinKPofZRNmQFcCjCKRbXscGBUiXvXnG | dz-tor1-sw01  | 209.42.165.10   | 14.52ms  | 14.53ms  | 14.52ms  | true
```
测试网输出结构相同，但设备较少。
</details>

</div>

## 2. 开放44880端口

用户需要开放44880端口以使用某些[路由功能](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md)。

要开放44880端口，您可以更新IP表，例如：

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

注意`-i doublezero0`、`-o doublezero0`标志，这些标志将此规则限制为仅DoubleZero接口。

或UFW，例如：

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

注意`in on doublezero0`、`out on doublezero0`标志，这些标志将此规则限制为仅DoubleZero接口。

## 3. 证明验证器所有权

<div data-wizard-step="mainnet-find-validator" markdown>

设置好DoubleZero环境后，现在是证明您的验证器所有权的时候了。

您在主验证器[设置](setup.md)中创建的DoubleZero ID必须用于所有备份机器。

您主机器上的ID可以通过`doublezero address`找到。相同的ID必须在集群中所有机器的`~/.config/doublezero/id.json`中。

为了实现这一点，您首先需要通过以下命令验证您正在运行命令的机器是您的**主验证器**：

```
doublezero-solana passport find-validator -u mainnet-beta
```

这验证了验证器已在gossip中注册并出现在领导者时间表中。

预期输出：

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 11.11.11.111
Validator ID: ValidatorIdentity111111111111111111111111111
Gossip IP: 11.11.11.111
In Leader scheduler
✅ This validator can connect as a primary in DoubleZero 🖥️  💎. It is a leader scheduled validator.
```

!!! info
    无论是一台还是多台机器，工作流程相同。
    要注册一台机器，请从本页上的任何命令中排除参数"--backup-validator-ids"或"backup_ids="。

现在，在您打算运行**主验证器**的所有备份机器上执行以下命令：
```
doublezero-solana passport find-validator -u mainnet-beta
```

预期输出：

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
此输出是预期的。备份节点在通行证创建时不能在领导者时间表中。

现在您将在您计划使用**主验证器**投票账户和身份的**所有备份机器**上运行此命令。

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### 准备连接

在**主验证器**机器上运行以下命令。这是您拥有活跃质押的机器，该机器在您正在运行命令的机器上Solana gossip中以您的主验证器ID在领导者时间表中：

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


示例输出：

```
DoubleZero Passport - Prepare Validator Access Request
Connected to Solana: mainnet-beta

Primary validator 🖥️  💎:
  ID: ValidatorIdentity111111111111111111111111111
  Gossip: ✅ OK 11.11.11.111)
  Leader scheduler: ✅ OK (Stake: 1,050,000.00 SOL)

Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity222222222222222222222222222
  Gossip: ✅ OK (22.22.22.222)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity333333333333333333333333333
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


  Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity444444444444444444444444444
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)

  To request access, sign the following message with your validator's identity key:

  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>

```
注意此命令末尾的输出。这是下一步的结构。

</div>

## 4. 生成签名

<div data-wizard-step="mainnet-sign-message" markdown>

在上一步结束时，我们收到了`solana sign-offchain-message`的预格式化输出。

从上述输出中，我们将在**主验证器**机器上运行此命令。

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**输出：**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```

</div>

## 5. 在DoubleZero中发起连接请求

<div data-wizard-step="mainnet-request-access" markdown>

使用`request-validator-access`命令在Solana上为连接请求创建账户。DoubleZero Sentinel代理检测新账户，验证其身份和签名，并在DoubleZero中创建访问通行证，使服务器能够建立连接。


使用节点ID、DoubleZero ID和签名。

!!! note inline end
      在此示例中，我们使用`-k /home/user/.config/solana/id.json`来查找验证器身份。请使用适合您本地部署的位置。

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**输出：**

此输出可用于在Solana浏览器中查看交易。确保将浏览器切换到主网。此验证是可选的。

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

如果成功，DoubleZero将注册主验证器及其备份。您现在可以在访问通行证中注册的IP之间进行故障转移。以这种方式注册备份节点时，DoubleZero将自动维护连接。

</div>

## 6. 以IBRL模式连接

<div data-wizard-step="mainnet-connect-ibrl" markdown>

在服务器上，使用将连接到DoubleZero的用户，运行`connect`命令建立到DoubleZero的连接。

```
doublezero connect ibrl
```

您应该看到表示配置的输出，例如：

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.184.101.183 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
🔍  Provisioning User for IP: 137.184.101.183
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
✅  User Provisioned
```
等待一分钟让GRE隧道完成设置。在GRE隧道完成设置之前，您的状态输出可能返回"down"或"Unknown"。

验证您的连接：

```bash
doublezero status
```

**输出：**
!!! note inline end
    检查此输出。注意`Tunnel src`和`DoubleZero IP`与您机器上的公共IPv4地址匹配。

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```
状态`up`表示您已成功连接。

您可以通过运行以下命令查看DoubleZero上其他用户传播的路由：

```
ip route
```


```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```

</div>

### 下一步：通过多播发布碎片

如果您已完成此设置并计划通过多播发布碎片，请继续访问[下一页](Validator%20Multicast%20Connection.md)。
