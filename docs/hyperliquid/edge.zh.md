---
description: "在 DoubleZero Edge 上订阅 Hyperliquid 市场数据 — 设置、城市节点、数据源请求以及审批后连接。"
---

# 订阅 Hyperliquid (Edge)

!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。请注意，数据仅供您内部使用，不得转发（参见第 2(e) 条）。"

Hyperliquid 数据源通过 DoubleZero Edge 以 UDP 组播方式传输市场数据。四个核心数据源涵盖 Hyperliquid 原生永续合约（`hl`）和 [trade.xyz](https://trade.xyz) 永续合约（`xyz`）：

| 数据源 | 描述 |
|------|-------------|
| `hyper-hl-tob` | Hyperliquid 永续合约的最优买卖报价和成交记录 |
| `hyper-hl-mbo` | Hyperliquid 永续合约的完整逐笔订单簿（新增、撤单、成交） |
| `hyper-xyz-tob` | trade.xyz 永续合约的最优买卖报价和成交记录 |
| `hyper-xyz-mbo` | trade.xyz 永续合约的完整逐笔订单簿（新增、撤单、成交） |

服务概述：[Hyperliquid](index.md)。

## 我应该选择哪条路径？

| 模式 | 获得内容 | 适用场景 |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — 解码 + 标准化 JSON WebSocket | 最快获取可用的报价流 |
| **原生组播** | 在 `doublezero1` 上订阅，自行解码二进制 UDP（或使用参考解析器） | 完全控制数据线路 |

首先完成共享步骤：防火墙、城市节点、申请和付款（步骤 1-3）。审批通过后，[步骤 4](#step-4-connect-after-approval) 分为两条路径 — **Edge Connect** 或 **原生**。不要在同一台主机上混用。

希望 AI 协助您完成安装？连接 [DoubleZero MCP](../mcp.md)，让它引导您完成 Hyperliquid Edge 设置。

---

## 步骤 1：DoubleZero 设置

**完成设置**


按照[设置](../setup.md)说明在主机上安装和配置 DoubleZero 客户端。

如果您之前已在主机上为原生使用设置过 DoubleZero，请确保客户端是最新版本：

```bash
sudo apt update && sudo apt install doublezero
```

**配置防火墙**


在 `doublezero1` 上允许 GRE、BGP、PIM 和 Hyperliquid 数据源流量。Hyperliquid UDP 端口范围为 `20000`–`20999`（Top-of-Book 和 Market-by-Order 市场数据、参考数据和快照）。同时在隧道上允许 UDP `5765` 用于 DoubleZero 心跳。开放数据源端口范围，以免新增数据源时需要再次修改防火墙。参见[数据源地址](#feed-addresses)。

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid 市场数据 / 参考数据 / 快照（所有数据源）
sudo iptables -A INPUT -i doublezero1 -p udp --dport 20000:20999 -j ACCEPT
# DoubleZero 心跳
sudo iptables -A INPUT -i doublezero1 -p udp --dport 5765 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Hyperliquid 市场数据 / 参考数据 / 快照（所有数据源）
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# DoubleZero 心跳
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

您可以将这些规则收紧到仅限您订阅的数据源所用端口（参见[数据源地址](#feed-addresses)）。

---

## 步骤 2：选择城市节点

确定接收数据源的机器延迟最低的位置：

```bash
doublezero latency
```

记下延迟最低结果中的城市节点/城市。您将在申请表中选择该城市。请参阅[拓扑地图](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth)了解城市节点的分组方式。

**定价**


数据源按交付区域定价。价格取决于数据交付地点，而非购买者所在地。东京套餐交付给东京接收者；交付到其他地方需要全球套餐。每个数据源、每个城市节点包含两台接收主机（IP）。

| 数据源 | 东京 /月 | 全球 /月 |
| --- | --- | --- |
| Hyperliquid 永续合约 Top-of-Book (L1) | $900 | $1,500 |
| Hyperliquid 永续合约 Market-by-Order (L4) | $3,000 | $5,000 |
| trade.xyz 永续合约 Top-of-Book (L1) | $900 | $1,500 |
| trade.xyz 永续合约 Market-by-Order (L4) | $3,000 | $5,000 |
| **所有数据源（套餐约 30% 折扣）** | **$5,500** | **$9,000** |

---

## 步骤 3：提交请求

1. 前往 [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)。
2. 选择 **Hyperliquid** 以及您需要的数据源。
3. 选择您需要的**城市**（城市节点）。使用上表和 `doublezero latency` 进行选择。
4. 完成申请表。

您将在[账户](https://doublezero.xyz/shreds/account)页面为每个数据源请求分配一个 DoubleZero ID（现有密钥或生成新密钥）。对应的**私钥必须存在于将接收数据源的机器上** — 不要分配一个无法将私钥移至该主机的公钥。

您选择一个**城市节点**和一个**公钥**。您**不需要**在申请时绑定公网 IP。在订阅期间，您可以在**所选城市节点内**的 IP 之间迁移访问权限。

我们将及时联系您并提供更多说明（预计 **1-3 个工作日**）。

---

## 步骤 4：审批后连接

提交申请后，您将收到一张发票；付款后，在每台已审批的机器上进行连接。访问权限将在您选择的开始日期启用。选择以下**一条**路径。

### 4a. Edge Connect

如果主机上 `doublezerod` 已在运行（来自[设置](../setup.md)），请先停止它 — 它会与容器的守护进程争用同一隧道：

```bash
sudo systemctl stop doublezerod
```

在审批和付款**之后**安装 [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect)。该桥接器通过 `--network host` 容器加入 DoubleZero，并在 `ws://<host>:8081` 上提供标准化的 JSON。

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**所有 `doublezero` 命令通过容器执行**，而非主机 CLI：

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    您可以创建一个别名以便于向容器发送命令。此示例使 `dz status` 的效果等同于在容器内运行 `doublezero status`：

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

预期看到 `BGP Session Up` 以及您的 `edge-hyper-…` 组已订阅。

然后打开 WebSocket（`ws://127.0.0.1:8081`）。协议说明：[PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。完整操作指南：[MCP](../mcp.md) runbook `hyperliquid-edge`。

### 4b. 原生组播

在持有已分配私钥的主机上（主机 `doublezerod` 正在运行），订阅您购买的数据源：

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

多个数据源，以空格分隔：

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

检查隧道：

```bash
doublezero status
```

预期在正确的 DoubleZero 网络上看到 `BGP Session Up`。然后自行解码数据线路 — 参见[解码数据源](#decode-the-feed)。

---

## 计费

席位按**月**收费。请关注席位到期日期。

您需要在席位到期前支付发票。**未付款将导致席位被移除。**

---

## 数据源地址

IP 对应组播组。端口对应该组上的数据流。使用以下命令实时查看 IP 值：

```bash
doublezero multicast group list
```

| 数据源 | 描述 | 组播组 | 市场数据 | 参考数据 | 快照 | 规范 |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Hyperliquid 永续合约的最优买卖报价和成交记录 | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Hyperliquid 永续合约的完整逐笔订单簿 | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | trade.xyz 永续合约的最优买卖报价和成交记录 | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | trade.xyz 永续合约的完整逐笔订单簿 | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

每个数据源有自己的组播组地址。端口：参考数据 = 市场数据 + `1`；快照（仅 MBO）= 市场数据 + `2`。建议将市场数据和参考数据绑定在一起；对于 MBO，还需绑定快照。

您可能还会在 `doublezero1` 上的端口 `5765` 看到小型 UDP 数据包 — 这是 DoubleZero 心跳，不是市场数据。

帧为小端序固定大小二进制格式。Hyperliquid 原生永续合约使用 `source_id=1`；trade.xyz 永续合约使用 `source_id=7`。

---

## 解码数据源

!!! note "Edge Connect"
    如果您使用的是 `doublezero-edge-connect`，数据源已通过 WebSocket 解码为 JSON — 无需手动解码。

**使用参考解析器**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) 提供组播订阅器，可解码线路格式并通过 Unix 套接字将其重新发布为 JSON：

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) 用于 Top-of-Book 和成交数据
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) 用于 Market-by-Order

参见[主 README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines) 了解完整管道。

**编写自己的解码器**

根据 [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) 进行解码。从帧头开始，然后是您接收的数据源的消息布局。

**GRE 隧道头 — XDP**

通过网络传输的市场数据在最后一英里使用 GRE 封装。在 `doublezero1` 上，客户端呈现普通的 UDP 组播。如果您自行终结 GRE（例如 XDP 管道），请在将数据送入解码器之前剥离 GRE 头。参见 [`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap)。

---

## 故障排除

如果您遇到此处未涵盖的问题，请在尝试解决之前通过现有渠道联系我们。如果您没有沟通渠道，请参见[支持](../support.md)。

**确保客户端是最新版本**


```bash
sudo apt update && sudo apt install doublezero
```

**隧道无法建立**


1. **Edge Connect：**在容器内运行状态检查 — `docker exec doublezero-edge-connect doublezero status`。主机上的 `doublezero status` 通常会失败，但数据源正常（容器拥有守护进程）。确认主机上的 `doublezerod` 已停止。
2. **原生：**验证主机守护进程正在运行：`sudo systemctl status doublezerod`
3. 验证防火墙规则已就位（GRE、BGP、PIM、Hyperliquid UDP 端口以及 `doublezero1` 上的 `5765`）
4. 确认该席位的发票已支付且开始日期已过
5. 使用与账户页面匹配的密钥，在您选择的路径上运行 connect（[4a](#4a-edge-connect) 或 [4b](#4b-native-multicast)）
6. 预期从运行 connect 的同一位置（容器或主机）看到 `BGP Session Up`

**订阅后没有数据包**


1. 确认您已订阅：`doublezero user list`
2. 确认数据源出现在您的组中：`doublezero multicast group list`
3. 在隧道上抓包，例如 Hyperliquid TOB：`sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. 建议将市场数据和参考数据绑定在一起（对于 MBO 还需绑定快照）用于您需要的数据源

**已购买的数据源缺失（Edge Connect）**

如果已购买的数据源未出现在 `doublezero status` 中，请在容器内订阅：

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-code>
```

多个数据源，以空格分隔：

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

**席位已过期或已移除**


席位按月计费。如果在到期前未支付发票，席位将被移除，隧道将无法保持连接。

**"Multicast user already exists"**


您已通过其他路径拥有一个活跃的订阅。请先断开连接，然后重试：

- **Edge Connect：**`docker exec doublezero-edge-connect doublezero disconnect`
- **原生：**`doublezero disconnect`

然后在同一路径（容器或主机）上重试 `doublezero connect multicast --subscribe-feed <feed-code>`。

**AWS 特定问题**


在实例的 ENI 上禁用源/目标检查。否则，GRE 封装的组播可能会被丢弃。