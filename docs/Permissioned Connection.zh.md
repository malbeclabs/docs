---
description: 以 IBRL 模式连接到 DoubleZero Mainnet-Beta 和 Testnet 的非验证者及 RPC 的许可制接入。
---

# 非验证者以 IBRL 模式许可制连接到 DoubleZero
!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 服务条款](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### 许可制用户接入概述

目前，非验证者和 RPC 的用户接入采用许可制。要开始许可制流程，请填写[此表单](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)。以下是该流程中需要了解的事项：

- 未来许可制用户的使用可能会产生相关费用。
- 提交表单后，请关注您的主要 Telegram 联系方式。

</div>

### 以 IBRL 模式连接到 Mainnet-Beta 和 Testnet

!!! Note inline end
    IBRL 模式不需要重启验证者客户端，因为它使用您现有的公网 IP 地址。

许可制用户将完成到 DoubleZero Mainnet-beta 的连接，具体步骤详见本页。

## 1. 确认客户端网络

请在继续之前按照[设置](setup.md)说明进行操作。根据您要加入的网络安装 Mainnet-Beta 或 Testnet 软件包——它们使用不同的软件包仓库。

设置的最后一步是断开网络连接。这是为了确保您的机器上只有一个到 DoubleZero 的隧道处于开启状态，并且该隧道连接到正确的网络。

使用以下命令确认：

```bash
doublezero status
```

`Network` 列应与您打算加入的网络匹配。如果不匹配，请使用[故障排除](troubleshooting.md#issue-wrong-doublezero-environment)中的一键切换方法。

大约 30 秒后，您将看到可用的 DoubleZero 设备：

```bash
doublezero latency
```
示例输出（Testnet）
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
Testnet 的输出结构相同，但可用设备会更多。

## 2. 联系 DoubleZero 基金会

联系 DoubleZero 基金会。您需要提供您的 `DoubleZeroID`、`Validator ID`（节点 ID）以及您将用于连接的 `public ipv4 address`（公网 IPv4 地址）。


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. 以 IBRL 模式连接

在服务器上，使用将要连接到 DoubleZero 的用户，运行 `connect` 命令以建立到 DoubleZero 的连接。

```bash
doublezero connect ibrl
```

您应该会看到指示正在配置的输出，例如：

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
请等待一分钟让隧道建立完成。在隧道建立完成之前，您的状态输出可能会返回 "down" 或 "Unknown"。

验证您的连接：

```bash
doublezero status
```

**输出：**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
状态为 `up` 表示您已成功连接。

您可以通过运行以下命令查看 DoubleZero 上其他用户传播的路由：

```
ip route
```
输出：

```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100 
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
...
```

</div>

### 下一步：多播

如果您已完成此设置并计划使用多播，请继续查看[下一页](Other%20Multicast%20Connection.md)。