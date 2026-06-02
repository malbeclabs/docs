# 如何设置 DoubleZero

!!! info "术语"
    初次接触 DoubleZero？请参阅[术语表](glossary.md)，了解 [doublezerod](glossary.md#doublezerod)、[IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency) 和 [DZD](glossary.md#dzd-doublezero-device) 等术语的定义。

!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 服务条款](https://doublezero.xyz/terms-protocol)"


## 前提条件
!!! warning inline end
    对于验证者：DoubleZero 需要直接安装在您的验证者主机上，而不是在容器中。
- 具有公网 IP 地址的互联网连接（无 NAT）
- x86_64 服务器
- 支持的操作系统：Ubuntu 22.04+ 或 Debian 11+，或 Rocky Linux / RHEL 9+
- 运行 DoubleZero 的服务器上的 root 或 sudo 权限
- 可选但有用：用于调试的 jq 和 curl

## 连接到 DoubleZero

DoubleZero Testnet 和 DoubleZero Mainnet-Beta 是物理上独立的网络。请在安装过程中选择适当的网络。

加入 DoubleZero 时，您将建立一个 **DoubleZero 身份**，由一个称为 **DoubleZero ID** 的公钥表示。此密钥是 DoubleZero 识别您机器的方式之一。

## 1. 安装 DoubleZero 软件包

<div data-wizard-step="install-version-info" markdown>

!!! info "当前版本"
    | 软件包 | Mainnet-Beta | Testnet |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |

</div>

请根据您的操作系统执行以下步骤：

### Ubuntu / Debian

<div data-wizard-step="install-deb-mainnet-beta" markdown>

当前推荐的 Mainnet-Beta 部署方式为：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

<div data-wizard-step="install-deb-testnet" markdown>

当前推荐的 Testnet 部署方式为：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

### Rocky Linux / RHEL

<div data-wizard-step="install-rpm-mainnet-beta" markdown>

当前推荐的 Mainnet-Beta 部署方式为：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-rpm-testnet" markdown>

当前推荐的 Testnet 部署方式为：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-network-warning" markdown>

??? info "仅限现有用户：将软件包从 *Testnet 切换到 Mainnet-Beta*，或从 *Mainnet-Beta 切换到 Testnet*"
    当您从上述某个软件包仓库安装时，它特定于 DoubleZero **Testnet** 或 **DoubleZero Mainnet Beta**。如果您在任何时候切换网络，您需要移除之前安装的软件包仓库并更新到目标仓库。

    本示例将演示从 Testnet 到 Mainnet-Beta 的迁移

    从 Mainnet-Beta 迁移到 Testnet 也可以完成相同的步骤，只需将步骤 3 替换为上述 Testnet 的安装命令即可。


    1. 查找旧的仓库文件

        首先，找到系统上所有现有的 DoubleZero 仓库配置文件：

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. 移除旧的仓库文件

        移除上一步中找到的旧仓库文件，例如

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. 从新仓库安装

        添加新的 Mainnet-Beta 仓库并安装最新的软件包：

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<current_recomended_version_above>
        ```


</div>

<div data-wizard-step="install-verify-daemon" markdown>

#### 检查 `doublezerod` 的状态

软件包安装后，将安装、激活并启动一个新的 systemd 单元。要查看状态，您可以运行：
```
sudo systemctl status doublezerod
```

</div>

### 配置 GRE 和 BGP 防火墙

DoubleZero 使用 GRE 隧道（IP 协议 47）和 BGP 路由（链路本地地址上的 tcp/179）。请确保您的防火墙允许这些协议：

通过 iptables 允许 GRE 和 BGP：

<div data-wizard-step="firewall-gre-bgp-iptables" markdown>

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```

</div>

或通过 UFW 允许 GRE 和 BGP：

<div data-wizard-step="firewall-gre-bgp-ufw" markdown>

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```

</div>

## 2. 创建新的 DoubleZero 身份

使用以下命令在服务器上创建 DoubleZero 身份：

```bash
doublezero keygen
```

!!! info
    如果您有现有的 ID 想要使用，可以按照以下可选步骤操作。

    创建 doublezero 配置目录

    ```
    mkdir -p ~/.config/doublezero
    ```

    将您想要与 DoubleZero 一起使用的 `id.json` 复制或链接到 doublezero 配置目录。

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```
## 3. 获取服务器的 DoubleZero 身份

查看您的 DoubleZero 身份。此身份将用于在您的机器和 DoubleZero 之间创建连接。

```bash
doublezero address
```

**输出：**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. 检查 doublezerod 是否已发现 DZ 设备

在连接之前，请确保 `doublezerod` 已发现并 ping 通每个可用的 DZ 测试网交换机：

```
doublezero latency
```

示例输出：

```
$ doublezero latency
 pubkey                                       | name      | ip             | min      | max      | avg      | reachable
 96AfeBT6UqUmREmPeFZxw6PbLrbfET51NxBFCCsVAnek | la2-dz01  | 207.45.216.134 |   0.38ms |   0.45ms |   0.42ms | true
 CCTSmqMkxJh3Zpa9gQ8rCzhY7GiTqK7KnSLBYrRriuan | ny5-dz01  | 64.86.249.22   |  68.81ms |  68.87ms |  68.85ms | true
 BX6DYCzJt3XKRc1Z3N8AMSSqctV6aDdJryFMGThNSxDn | ty2-dz01  | 180.87.154.78  | 112.16ms | 112.25ms | 112.22ms | true
 55tfaZ1kRGxugv7MAuinXP4rHATcGTbNyEKrNsbuVLx2 | ld4-dz01  | 195.219.120.66 | 138.15ms | 138.21ms | 138.17ms | true
 3uGKPEjinn74vd9LHtC4VJvAMAZZgU9qX9rPxtc6pF2k | ams-dz001 | 195.219.138.50 | 141.84ms | 141.97ms | 141.91ms | true
 65DqsEiFucoFWPLHnwbVHY1mp3d7MNM2gNjDTgtYZtFQ | frk-dz01  | 195.219.220.58 | 143.52ms | 143.62ms | 143.58ms | true
 9uhh2D5c14WJjbwgM7BudztdoPZYCjbvqcTPgEKtTMZE | sg1-dz01  | 180.87.102.98  | 176.66ms | 176.76ms | 176.72ms | true
```

如果输出中未返回任何设备，请等待 10-20 秒后重试。

## 5. 断开与 DoubleZero 的连接

在接下来的章节中，您将设置 DoubleZero 环境。为确保成功，请断开当前会话。这将避免因机器上打开多个隧道而导致的问题。

检查

```bash
doublezero status
```

如果状态为 `up`，运行：

```bash
doublezero disconnect
```

### 下一步：租户

连接到 DoubleZero 的方式将因您的使用场景而异。在 DoubleZero 上，租户是具有相似用户配置文件的组。示例包括区块链、数据传输层等。

### [点击此处选择您的租户](tenant.md)


# 可选：启用 Prometheus 指标

熟悉 Prometheus 指标的运营者可能希望为 DoubleZero 监控启用这些指标。这可以提供对 DoubleZero 客户端性能、连接状态和运行健康状况的可见性。

## 可用的指标

DoubleZero 公开了几个关键指标：
- **构建信息**：版本、提交哈希和构建日期
- **会话状态**：DoubleZero 会话是否处于活动状态
- **连接指标**：延迟和连接信息
- **性能数据**：吞吐量和错误率

## 启用 Prometheus 指标

要在 DoubleZero 客户端上启用 Prometheus 指标，请按照以下步骤操作：

### 1. 修改 doublezerod systemd 服务启动命令

创建或编辑 systemd 覆盖配置：

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

替换为以下配置：

请注意，`-env` 标志需要指向 `testnet` 或 `mainnet-beta`，具体取决于您要从哪个网络收集数据。在示例代码块中使用的是 `testnet`。如果需要，您可以将其替换为 `mainnet-beta`。

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env testnet -metrics-enable -metrics-addr localhost:2113
```

### 2. 重新加载并重启服务

```bash
sudo systemctl daemon-reload
sudo systemctl restart doublezerod
sudo systemctl status doublezerod
```

### 3. 验证指标是否可用

测试指标端点是否正在响应：

```bash
curl -s localhost:2113/metrics | grep doublezero
```

预期输出：

```
# HELP doublezero_build_info Build information of the client
# TYPE doublezero_build_info gauge
doublezero_build_info{commit="0d684e1b",date="2025-09-10T16:30:25Z",version="0.6.4"} 1
# HELP doublezero_session_is_up Status of session to doublezero
# TYPE doublezero_session_is_up gauge
doublezero_session_is_up 0
```
## 故障排除

如果指标未显示：

1. **检查服务状态**：`sudo systemctl status doublezerod`
2. **验证配置**：`sudo systemctl cat doublezerod`
3. **检查日志**：`sudo journalctl -u doublezerod -f`
4. **测试端点**：`curl -v localhost:2113/metrics`
5. **验证端口**：`netstat -tlnp | grep 2113`


## 配置 Prometheus 服务器

配置和安全性超出了本文档的范围。
Grafana 是一个出色的可视化选项，其文档可在[此处](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/)获取，详细说明了如何收集 Prometheus 指标。

## Grafana 仪表板（可选）

对于可视化，您可以使用 DoubleZero 指标创建 Grafana 仪表板。常见面板包括：
- 会话状态随时间变化
- 构建信息
- 连接延迟趋势
- 错误率监控