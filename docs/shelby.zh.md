---
description: 面向以 IBRL 模式连接 DoubleZero 的 Shelby 测试网用户的许可连接指南。
---

# Shelby
!!! warning "连接 DoubleZero 即表示我同意 [DoubleZero 服务条款](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### 获取您的 DoubleZeroID

您需要在此[表单](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)中提供您的 `DoubleZeroID` 和 `public ipv4 address`


- 未来许可用户的使用可能会产生相关费用。
- 提交表单后，请关注您的主要 Telegram 联系方式。
- 目前 Shelby 仅能连接到 DoubleZero 测试网。

</div>

### 以 IBRL 模式连接测试网

Shelby 许可用户将完成与 DoubleZero 测试网的连接，详细信息请参阅本页面。

## 1. 环境配置

请在继续之前按照[设置](setup.md)说明进行操作。

设置的最后一步是断开网络连接。这是为了确保您的机器上只有一个到 DoubleZero 的隧道处于打开状态，并且该隧道连接到正确的网络。

配置 DoubleZero 客户端 CLI (`doublezero`) 以连接到 DoubleZero 上的 Shelby 租户：
```bash
doublezero config set --tenant shelby
```

应用 Shelby 特定的附加防火墙规则：

iptables:
```
sudo iptables -A INPUT -i doublezero0 -p tcp --dport 39431 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 39431 -j DROP
```

UFW:
```
sudo ufw allow in on doublezero0 to any port 39431 proto tcp
sudo ufw deny in to any port 39431 proto tcp
```

## 2. 联系 DoubleZero 基金会

联系 DoubleZero 基金会。您需要提供您的 `DoubleZeroID` 以及您将用于连接的 `public ipv4 address`。


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. 以 IBRL 模式连接

在服务器上，使用将连接到 DoubleZero 的用户，运行 `connect` 命令以建立与 DoubleZero 的连接。

```bash
doublezero connect ibrl
```

您应该会看到表示正在配置的输出，例如：

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
请等待一分钟以完成隧道建立。在隧道建立完成之前，您的状态输出可能会返回 "down" 或 "Unknown"。

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