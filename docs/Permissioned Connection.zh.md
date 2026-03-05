# 非验证器以IBRL模式的Permissioned连接到DoubleZero
!!! warning "通过连接到DoubleZero，我同意[DoubleZero服务条款](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### Permissioned用户入职概述

目前非验证器和RPC的用户入职需要许可。要开始permissioned流程，请填写[此表单](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)。以下是此过程中的预期内容：

- 未来Permissioned用户使用可能会收取费用。
- 提交表单后，请监控您的主要Telegram联系方式。

</div>

### 以IBRL模式连接到主网Beta和测试网

!!! Note inline end
    IBRL模式不需要重启验证器客户端，因为它使用您现有的公共IP地址。

Permissioned用户将完成到DoubleZero主网Beta的连接，详情请见本页面。

## 1. 环境配置

请在继续之前按照[设置](setup.md)说明操作。

设置的最后一步是断开与网络的连接。这是为了确保您的机器上只有一个到DoubleZero的隧道处于开放状态，并且该隧道在正确的网络上。

要配置DoubleZero客户端CLI（`doublezero`）和守护程序（`doublezerod`）连接到**DoubleZero测试网**：
```bash
DESIRED_DOUBLEZERO_ENV=testnet \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```
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
```
✅ doublezerod configured for environment mainnet-beta
```
您应该看到以下输出：
`
✅ doublezerod configured for environment testnet
`

大约30秒后，您将看到可用的DoubleZero设备：

```bash
doublezero latency
```
示例输出（测试网）
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
测试网输出结构相同，但可用设备更多。
</details>


## 2. 联系DoubleZero基金会

DoubleZero基金会。您需要提供您的`DoubleZero ID`、您的`验证器ID`（节点ID）以及您将从中连接的`公共IPv4地址`。


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. 以IBRL模式连接

在服务器上，使用将连接到DoubleZero的用户，运行`connect`命令建立到DoubleZero的连接。

```bash
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
等待一分钟让隧道完成。在隧道完成之前，您的状态输出可能返回"down"或"Unknown"。

验证您的连接：

```bash
doublezero status
```

**输出：**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
状态`up`表示您已成功连接。

您可以通过运行以下命令查看DoubleZero上其他用户传播的路由：

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

如果您已完成此设置并计划使用多播，请继续访问[下一页](Other%20Multicast%20Connection.md)。
