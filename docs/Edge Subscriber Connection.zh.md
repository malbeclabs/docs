---
description: 设置边缘订阅者以接收 DoubleZero 分片数据流，包括客户端设置和 GRE、BGP、PIM 及分片流量的防火墙规则。
---

# 边缘订阅者连接
!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。请注意，数据仅供您内部使用，不得转发（参见第 2(e) 条）。"

!!! warning "已使用 CLI 订阅？"
    如果您通过 **CLI**（`doublezero-solana shreds pay` / 托管席位）订阅，请使用 [CLI 订阅页面](Edge Subscriber CLI.md) 获取相关命令。该系统将于 **2026 年 8 月 30 日停用**。新订阅请按照本页面操作。

## 步骤 1：DoubleZero 设置

### 完成设置

安装 [Solana CLI](https://docs.anza.xyz/cli/install)。

按照[设置](setup.md)说明安装和配置 DoubleZero 客户端。

如果您之前已设置过 DoubleZero，请确保通过 `sudo apt update && sudo apt install doublezero-solana` 获取最新的 Doublezero-Solana CLI。

### 配置防火墙

允许 GRE、BGP、PIM 和分片流量。

**iptables：**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

**UFW：**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

---

## 步骤 2：选择城域节点

确定将接收分片的机器延迟最低的位置：

```bash
doublezero latency
```

记下延迟最低结果中的城域节点/城市。您将在申请表中选择该城市。请参阅[拓扑地图](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth)了解城域节点的分组方式。

### 定价

席位按**每月**、每台机器、您选择的城域节点计费：

| 城域节点 | 价格 |
|--------|-------|
| 法兰克福、阿姆斯特丹 | $1,500 / 月 |
| 伦敦、纽约、新加坡、东京 | $900 / 月 |
| 所有其他位置 | $450 / 月 |

---

## 步骤 3：提交请求

1. 前往 [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)。
2. 选择 **Solana Shreds**。
3. 选择您需要的**城市**（城域节点）。使用上表和 `doublezero latency` 进行选择。
4. 完成申请表。

您将在[账户](https://doublezero.xyz/shreds/account)页面为每个数据流请求分配一个 DoubleZero ID（使用现有密钥或生成新密钥）。匹配的**私钥必须存在于将接收分片的机器上** — 不要分配一个您无法将私钥移至该主机的公钥。

您选择一个**城域节点**和一个**公钥**。您**无需**在申请时绑定公网 IP。在订阅期间，您可以在**所选城域节点内**的不同 IP 之间转移访问权限。

我们的团队会审核申请并及时与您联系（预计 **2 个工作日**）。

---

## 步骤 4：审批通过后连接

在我们与您联系、您收到发票并完成付款后，在每台已批准的机器上连接：

```bash
doublezero connect multicast --subscribe-feed solana-shreds-full
```

访问权限将在您选定的开始日期启用（通常为美国东部时间上午 9:01）。使用以下命令检查隧道状态：

```bash
doublezero status
```

---

## 计费

席位按**每月**收费。请关注席位到期日期。

您将在席位到期前几天收到发票。**未付款将导致席位被移除。**

---

## 分片地址（IP 与端口）

领导者分片和高质押权重的转发分片将通过 `doublezero1` 接口的端口 `7733` 到达。`doublezero0` 接口用于单播流量。端口 `5765` 是来自分片发布者的心跳监控 — 不包含分片数据。

对于分片消费，**IP 地址**标识组播流，**端口**标识该流上的 UDP 服务。
以下所有分片流均使用 `doublezero1` 上的 UDP 端口 `7733`。

您可以使用以下命令查看任何组播组的 IP：

```bash
doublezero multicast group list
```

### 领导者分片

- `edge-solana-shreds`: `233.84.178.1:7733`

### 根分片

- `edge-solana-root`: `233.84.178.16:7733`

### 转发分片

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## GRE 隧道头 — XDP

!!! note "通过网络传输的分片流量经过 GRE 封装。在将数据送入现有处理管道（例如基于 XDP 的分片重组器）之前，您可能需要剥离 GRE 头部。"

---

## 工具和仪表板

### [边缘计分板](https://data.doublezero.xyz/dz/shreds/scoreboard)

计分板使用槽级数据，对比 DoubleZero Edge 和其他提供商的分片交付速度，实时比较性能。使用此仪表板查看 Edge 分片相对于其他提供商的胜率。您可以仅查看领导者分片的结果，也可以查看完整数据流的对比。您还可以按区域深入查看预期性能。

### [边缘发布者](https://data.doublezero.xyz/dz/shreds/publishers)

仪表板左上角的"发布分片"指标显示了在 DoubleZero Edge 上发布领导者分片的所有 Solana 验证者的总质押权重百分比。您可以查看网络上每个发布者的详细信息。

### [边缘订阅者、设备和活动](https://data.doublezero.xyz/dz/shreds/subscribers)

您可以在此页面搜索您的客户端 IP 以查看已订阅的席位和状态。您还可以在[设备](https://data.doublezero.xyz/dz/shreds/devices)页面查看可用设备，以及在[活动](https://data.doublezero.xyz/dz/shreds/activity)页面查看所有近期活动。

### 数据 API 文档

如需以编程方式访问数据端点，请参阅 API 文档：[https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)。

---

## 故障排除

如果您遇到此处未涵盖的问题，请先通过您现有的沟通渠道联系我们，再尝试自行解决。如果您没有现有渠道，请搜索 [Discord](https://discord.gg/U2fEb4Jq)，必要时提交工单。

### 确保您的客户端是最新版本：

运行：`sudo apt update && sudo apt install doublezero-solana`

### 隧道未建立

1. 验证守护进程是否在运行：`sudo systemctl status doublezerod`
2. 验证防火墙规则是否已配置（GRE、BGP、PIM、`doublezero1` 上的分片流量、`doublezero0` 上的端口 44880）
3. 确认该席位的发票已支付且开始日期已过
4. 在持有已分配私钥的机器上运行 `doublezero connect multicast --subscribe-feed solana-shreds-full`
5. 检查您的连接状态：`doublezero status`

在账户页面使用的 DoubleZero ID 必须与此主机上的密钥匹配。

### 席位已过期或被移除

席位按月计费。如果到期前发送的发票未付款，席位将被移除，隧道将无法保持连接。

### "Multicast user already exists"

您已通过其他途径拥有活跃订阅。请先使用 `doublezero disconnect` 断开连接，然后重试 `doublezero connect multicast --subscribe-feed solana-shreds-full`。