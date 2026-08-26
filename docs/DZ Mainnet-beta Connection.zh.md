---
description: 将 Solana 主网测试版（Mainnet-Beta）验证器及最多三台备份机器以 IBRL 模式连接到 DoubleZero，包括身份证明和连接请求。
---

# 验证器主网测试版 IBRL 模式连接
!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 服务条款](https://doublezero.xyz/terms-protocol)"



### 以 IBRL 模式连接到主网测试版

!!! Note inline end
    IBRL 模式不需要重启验证器客户端，因为它使用您现有的公共 IP 地址。

Solana 主网验证器将完成与 DoubleZero 主网测试版的连接，本页面将详细说明此过程。

每个 Solana 验证器都有自己的**身份密钥对**；从中可以提取公钥，即**节点 ID**。这是验证器在 Solana 网络上的唯一标识。

确定 DoubleZeroID 和节点 ID 后，您需要证明对机器的所有权。这通过创建一条包含 DoubleZeroID 并使用验证器身份密钥签名的消息来完成。生成的加密签名可作为您控制该验证器的可验证证明。

最后，您将向 DoubleZero 提交**连接请求**。该请求传达的信息是：*"这是我的身份，这是所有权证明，这是我打算如何连接。"* DoubleZero 验证此信息，接受证明，并为该验证器在 DoubleZero 上配置网络访问权限。

本指南允许 1 个主验证器注册自身，并同时注册最多 3 台备份/故障转移机器。

## 前提条件

- 已安装 Solana CLI 并加入 $PATH
- 对于验证器：具有访问验证器身份密钥对文件（例如 validator-keypair.json）的权限，需在 sol 用户下
- 对于验证器：验证被连接的 Solana 验证器的身份密钥上至少有 1 SOL
- 防火墙规则允许 DoubleZero 和 Solana RPC 所需的出站连接，包括
 GRE（IP 协议 47）和 BGP（169.254.0.0/16 上的 tcp/179）

!!! info
    验证器 ID 将与 Solana gossip 进行比对以确定目标 IP。目标 IP 和 DoubleZero ID 将用于在您的机器与目标 DoubleZero 设备之间建立 GRE 隧道。

    注意：如果您在同一 IP 上同时拥有临时 ID 和主 ID，则仅主 ID 会用于机器注册。这是因为临时 ID 不会出现在 gossip 中，因此无法用于验证目标机器的 IP。

## 1. 确认客户端网络

请在继续之前按照[设置](setup.md)说明操作。安装 **Mainnet-Beta** 软件包 — Testnet 和 Mainnet-Beta 使用不同的软件包仓库。

设置的最后一步是断开网络连接。这是为了确保您的机器上只有一条通往 DoubleZero 的隧道处于打开状态，并且该隧道连接到正确的网络。

确认客户端在 mainnet-beta 上：

```bash
doublezero status
```

`Network` 列应显示 `mainnet-beta`。如果显示 `testnet`，或者您安装了错误的软件包，请使用[故障排除](troubleshooting.md#issue-wrong-doublezero-environment)中的一键切换方法。

大约 30 秒后，您将看到可用的 DoubleZero 设备：

```bash
doublezero latency
```
示例输出（Mainnet-Beta）
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
Testnet 输出结构相同，但设备数量较少。

## 2. 开放端口 44880

用户需要开放端口 44880 以使用某些[路由功能](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md)。

要开放端口 44880，您可以更新 IP tables，例如：

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

注意 `-i doublezero0`、`-o doublezero0` 标志将此规则限制为仅适用于 DoubleZero 接口

或者使用 UFW，例如：

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

注意 `in on doublezero0`、`out on doublezero0` 标志将此规则限制为仅适用于 DoubleZero 接口

## 3. 验证验证器所有权

<div data-wizard-step="mainnet-find-validator" markdown>

设置好 DoubleZero 环境后，现在是验证您的验证器所有权的时候了。

您在主验证器[设置](setup.md)中创建的 DoubleZero ID 必须在所有备份机器上使用。

主机器上的 ID 可以通过 `doublezero address` 查看。相同的 ID 必须存在于集群中所有机器的 `~/.config/doublezero/id.json` 中。

为此，您首先需要验证运行命令的机器是您的**主验证器**：

```
doublezero-solana passport find-validator -u mainnet-beta
```

这将验证验证器已在 gossip 中注册并出现在出块调度表中。

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
    单台机器和多台机器使用相同的工作流程。
    如果只注册一台机器，请在本页面的所有命令中排除参数 "--backup-validator-ids" 或 "backup_ids="。

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
此输出是预期的。备份节点在创建通行证时不能在出块调度表中。

现在，您需要在所有计划使用**主验证器**投票账户和身份的**备份机器**上运行此命令。

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### 准备连接

在**主验证器**机器上运行以下命令。这是您拥有活跃质押的机器，在出块调度表中，您的主验证器 ID 在运行命令的机器上的 solana gossip 中：

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
请注意此命令末尾的输出。它是下一步的命令结构。

</div>

## 4. 生成签名

<div data-wizard-step="mainnet-sign-message" markdown>

在上一步的最后，我们收到了 `solana sign-offchain-message` 的预格式化输出。

根据上述输出，我们将在**主验证器**机器上运行此命令。

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

## 5. 在 DoubleZero 中发起连接请求

<div data-wizard-step="mainnet-request-access" markdown>

使用 `request-validator-access` 命令在 Solana 上创建一个用于连接请求的账户。DoubleZero Sentinel 代理检测到新账户后，会验证其身份和签名，并在 DoubleZero 中创建访问通行证，以便服务器建立连接。


使用节点 ID、DoubleZeroID 和签名。

!!! note inline end
      在本示例中，我们使用 `-k /home/user/.config/solana/id.json` 来查找验证器身份。请根据您的本地部署使用适当的路径。

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**输出：**

此输出可用于在 Solana 浏览器上查看交易。请确保将浏览器切换到 mainnet。此验证为可选步骤。

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

如果成功，DoubleZero 将注册主验证器及其备份机器。您现在可以在访问通行证中注册的 IP 之间进行故障转移。当切换到以此方式注册的备份节点时，DoubleZero 将自动保持连接。

</div>

## 6. 以 IBRL 模式连接

<div data-wizard-step="mainnet-connect-ibrl" markdown>

在服务器上，使用将要连接到 DoubleZero 的用户，运行 `connect` 命令建立与 DoubleZero 的连接。

```
doublezero connect ibrl
```

您应该会看到指示配置过程的输出，例如：

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
等待一分钟让 GRE 隧道完成设置。在 GRE 隧道设置完成之前，您的状态输出可能返回 "down" 或 "Unknown"。

验证您的连接：

```bash
doublezero status
```

**输出：**
!!! note inline end
    查看此输出。注意 `Tunnel src` 和 `DoubleZero IP` 与您机器上的公共 IPv4 地址匹配。
    <!--`Tunnel dst` 是您连接的 DZ 设备的地址。-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```
状态为 `up` 表示您已成功连接。

您可以通过运行以下命令查看 DoubleZero 上其他用户传播的路由：

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

### 下一步：通过组播发布 Shreds

如果您已完成此设置并计划通过组播发布 shreds，请继续阅读[下一页](Validator%20Multicast%20Connection.md)。