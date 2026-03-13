# DoubleZero设置方法
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


!!! info "术语"
    初次使用DoubleZero？请在[词汇表](glossary.md)中查看[doublezerod](glossary.md#doublezerod)、[IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency)、[DZD](glossary.md#dzd-doublezero-device)等术语的定义。

!!! warning "通过连接到DoubleZero，您同意[DoubleZero服务条款](https://doublezero.xyz/terms-protocol)"


## 前提条件
!!! warning inline end
    对于验证器：DoubleZero必须直接安装在验证器主机上，而不是容器中。
- 具有公共IP地址（无NAT）的互联网连接
- x86_64服务器
- 支持的操作系统：Ubuntu 22.04+或Debian 11+，或Rocky Linux / RHEL 8+
- 运行DoubleZero的服务器上的root或sudo权限
- 可选但有用：用于调试的jq和curl

## 连接到DoubleZero

DoubleZero测试网和DoubleZero主网Beta是物理上不同的网络。安装时请选择适当的网络。

加入DoubleZero时，您将建立**DoubleZero身份**（称为**DoubleZero ID**的公钥）。此密钥是DoubleZero识别您机器的方式之一。

## 1. 安装DoubleZero软件包

<div data-wizard-step="install-version-info" markdown>

!!! info "当前版本"
    | 软件包 | 主网Beta | 测试网 |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |

</div>

根据您的操作系统按照以下说明操作：

### Ubuntu / Debian

<div data-wizard-step="install-deb-mainnet-beta" markdown>

主网Beta的当前推荐部署：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

<div data-wizard-step="install-deb-testnet" markdown>

测试网的当前推荐部署：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

### Rocky Linux / RHEL

<div data-wizard-step="install-rpm-mainnet-beta" markdown>

主网Beta的当前推荐部署：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-rpm-testnet" markdown>

测试网的当前推荐部署：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-network-warning" markdown>

??? info "仅限现有用户：将软件包从*测试网切换到主网Beta*，或从*主网Beta切换到测试网*"
    从上述软件包仓库安装时，DoubleZero**测试网**或**DoubleZero主网Beta**各有其专用仓库。如果您在某个时候需要切换网络，则需要删除之前安装的软件包仓库并更新到目标仓库。

    此示例展示了从测试网迁移到主网Beta的过程。

    通过将步骤3替换为上述测试网安装命令，也可以以相同步骤完成从主网Beta到测试网的迁移。


    1. 找到旧的仓库文件

        首先，识别系统上现有的DoubleZero仓库配置文件：

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. 删除旧的仓库文件

        删除上一步中找到的旧仓库文件。例如：

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. 从新仓库安装

        添加新的主网Beta仓库并安装最新软件包：

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<current_recomended_version_above>
        ```


</div>

<div data-wizard-step="install-verify-daemon" markdown>

#### 检查`doublezerod`状态

软件包安装后，将安装、激活并启动新的systemd单元。要检查状态，请运行以下命令：
```
sudo systemctl status doublezerod
```

</div>

### GRE和BGP的防火墙配置

DoubleZero使用GRE隧道（IP协议47）和BGP路由（链路本地地址的tcp/179）。请确保您的防火墙允许这些协议：

用iptables允许GRE和BGP：

<div data-wizard-step="firewall-gre-bgp-iptables" markdown>

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```

</div>

或用UFW允许GRE和BGP：

<div data-wizard-step="firewall-gre-bgp-ufw" markdown>

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```

</div>

## 2. 创建新的DoubleZero身份

使用以下命令在服务器上创建DoubleZero身份：

```bash
doublezero keygen
```

!!! info
    如果您有想要使用的现有ID，可以按照以下可选步骤操作。

    创建doublezerod配置目录

    ```
    mkdir -p ~/.config/doublezero
    ```

    将您想在DoubleZero中使用的`id.json`复制或链接到doublezero配置目录。

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```

## 3. 获取服务器的DoubleZero身份

确认您的DoubleZero身份。此身份用于在您的机器与DoubleZero之间创建连接。

```bash
doublezero address
```

**输出：**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. 确认doublezerod已检测到DZ设备

在连接之前，确认`doublezerod`已检测并ping了每个可用的DZ测试网交换机：

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

如果输出中未显示设备，请等待10至20秒后重试。

## 5. 从DoubleZero断开连接

下一节将配置DoubleZero环境。为确保成功，请断开当前会话的连接。这可以避免机器上打开多个隧道的问题。

确认

```bash
doublezero status
```

如果状态为`up`，请运行：

```bash
doublezero disconnect
```

### 下一步：租户

连接到DoubleZero因使用场景而异。在DoubleZero中，租户是具有相似用户配置文件的群组。例如：区块链、数据传输层等。

### [在此处选择租户并继续](tenant.md)


# 可选：启用Prometheus指标

熟悉Prometheus指标的运营商可能希望为DoubleZero监控启用它。这将使您能够了解DoubleZero客户端的性能、连接状态和运营健康状况。

## 可用指标

DoubleZero公开几个关键指标：
- **构建信息**：版本、提交哈希、构建日期
- **会话状态**：DoubleZero会话是否活跃
- **连接指标**：延迟和连接信息
- **性能数据**：吞吐量和错误率

## 启用Prometheus指标

要在DoubleZero客户端上启用Prometheus指标，请按照以下步骤操作：

### 1. 修改doublezerod systemd服务启动命令

创建或编辑systemd覆盖配置：

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

替换为此配置：

`-env`标志应根据您想收集数据的网络指向`testnet`或`mainnet-beta`。示例块中使用了`testnet`。如有需要，可以更改为`mainnet-beta`。

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

### 3. 确认指标可用

确认指标端点正在响应：

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
5. **检查端口**：`netstat -tlnp | grep 2113`


## 配置Prometheus服务器

配置和安全性超出本文档的范围。
Grafana是可视化的优秀选项，Grafana文档[此处](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/)详细介绍了如何收集Prometheus指标。

## Grafana仪表板（可选）

对于可视化，您可以使用DoubleZero指标创建Grafana仪表板。常见面板包括：
- 随时间变化的会话状态
- 构建信息
- 连接延迟趋势
- 错误率监控
