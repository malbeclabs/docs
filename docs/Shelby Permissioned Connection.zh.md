# Shelby测试网用户以IBRL模式连接到DoubleZero
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "通过连接到DoubleZero，我同意[DoubleZero服务条款](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### 获取您的DoubleZero ID

您需要在此[表单](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)中提供您的`DoubleZero ID`和`公共IPv4地址`。


- 未来Permissioned用户使用可能会收取费用。
- 提交表单后，请监控您的主要Telegram联系方式。
- 目前Shelby只能连接到DoubleZero测试网。

</div>

### 以IBRL模式连接到测试网

Shelby permissioned用户将完成到DoubleZero测试网的连接，详情请见本页面。

## 1. 环境配置

请在继续之前按照[设置](setup.md)说明操作。

设置的最后一步是断开与网络的连接。这是为了确保您的机器上只有一个到DoubleZero的隧道处于开放状态，并且该隧道在正确的网络上。

要配置DoubleZero客户端CLI（`doublezero`）连接到DoubleZero上的Shelby租户：
```bash
doublezero config set --tenant shelby
```

应用Shelby特定的额外防火墙规则：

iptables：
```
sudo iptables -A INPUT -i doublezero0 -p tcp --dport 39431 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 39431 -j DROP
```

UFW：
```
sudo ufw allow in on doublezero0 to any port 39431 proto tcp
sudo ufw deny in to any port 39431 proto tcp
```

## 2. 联系DoubleZero基金会

DoubleZero基金会。您需要提供您的`DoubleZero ID`和您将从中连接的`公共IPv4地址`。


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
