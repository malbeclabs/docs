---
description: 在 DoubleZero Edge 上获取 Phoenix 永续合约市场数据 — Edge Connect 或原生组播。
---

# Phoenix Edge 订阅者连接

!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。请注意，数据仅供您内部使用，不得转发（参见第 2(e) 条）。"

Phoenix 数据源通过 DoubleZero Edge 网络以 UDP 组播方式传输 Phoenix 永续合约市场数据。共有两个数据源：

- 最优报价（TOB）：最佳买入价和卖出价，以及成交记录
- 按价格分级深度（MBP）：价格级别深度，以及成交记录

## 定价 {#pricing}

数据源按**月**计费：

| 数据源 | 价格 |
|------|-------|
| `phoenix-tob` | $50 / 月 |
| `phoenix-mbp` | $100 / 月 |

## 我应该选择哪条路径？ {#which-path-should-i-take}

| # | 路径 | 最适合 | 工作量 |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | 希望通过简单 CLI 和 WebSocket 解码 JSON 的代理和应用程序 | 最低 |
| **2** | [原生组播](#2-native-multicast-advanced) | 针对原始线路格式构建自己的解码器 | 最高 |

在选择任何路径之前：请在 [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买您需要的数据源。购买即表示您同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。

想要 AI 协助您完成安装？连接 [DoubleZero MCP](mcp.md)，让它引导您完成 Phoenix / Edge Connect 的设置。

---

## 1. Edge Connect（推荐） {#1-edge-connect-recommended}

**从这里开始。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) 是对代理友好的路径：一条安装命令，主机加入 DoubleZero，您的应用通过 **WebSocket 上的解码 JSON**（`ws://<host>:8081`）消费数据，而无需解码二进制组播。

Edge Connect 满足其不断增长的用户群的需求。这是最简单的连接方法，除非您有特定的技术需求，否则应使用此方法。

简短版本：

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

安装程序会要求输入您的密钥：一个 `DZ_…` 访问令牌**或**拥有您的访问通行证/数据源购买权的 Solana 密钥对 JSON 文件路径。

如果主机上已有 `doublezerod` 在运行，它和容器自带的守护进程都会绑定 UDP 端口 `44880`，因此容器的守护进程在启动后会立即退出。安装程序会提示停止并禁用主机守护进程，当设置了 `DZ_ASSUME_YES=1` 时会自动执行而不询问。手动操作方法：

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

然后在**容器内部**验证状态（预期看到 `BGP Session Up` 和您的 Phoenix 组），并将 WebSocket 客户端连接到 `:8081`：

```bash
docker exec doublezero-edge-connect doublezero status
```

Edge Connect 在 Phoenix 发布者之间进行仲裁，因此 WebSocket 客户端只会看到每次更新的一个副本。

**完整步骤、验证和注意事项：** 连接 [DoubleZero MCP](mcp.md)，让它引导您完成 Phoenix 的 Edge Connect 设置。
**WebSocket 协议：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. 原生组播（高级） {#2-native-multicast-advanced}

!!! warning "需要更深入的技术知识"
    原生组播意味着您需要自己加入组播组并在主机上解码**原始** Edge 线路格式。只有技术能力最强的用户才应选择此路径。您需要阅读并理解规范，从 [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) 和 [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) 的其余部分开始。除非您有必须自行拥有解码器的硬性需求，否则请优先选择 [Edge Connect](#1-edge-connect-recommended)。

### DoubleZero 客户端设置 {#doublezero-client-setup}

按照[设置](setup.md)说明安装和配置 DoubleZero 客户端。保持客户端为最新版本：

```bash
sudo apt update && sudo apt install doublezero
```

### 购买数据源 {#buy-a-feed}

在 `doublezerod` 运行的情况下，购买前先确定延迟最低的设备：

```bash
doublezero latency
```

在 [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买。

### 配置防火墙 {#configure-the-firewall}

允许 GRE、BGP、PIM 和 Phoenix 数据源流量。Phoenix UDP 端口范围为 `9201`–`9213`：`9201`/`9202` 承载最优报价的市场数据和参考数据，`9211`/`9212`/`9213` 承载按价格分级深度的市场数据、参考数据和快照数据。参见[数据源地址](#feed-addresses)。

**iptables：**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Phoenix 市场 / 参考 / 快照（两个数据源）
sudo iptables -A INPUT -i doublezero1 -p udp --dport 9201:9213 -j ACCEPT
```


**UFW：**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Phoenix 市场 / 参考 / 快照（两个数据源）
sudo ufw allow in on doublezero1 to any port 9201:9213 proto udp
```

UFW 没有 `pim` 协议。UFW 的默认出站策略允许出站 PIM；如果您拒绝出站流量，请在 `/etc/ufw/before.rules` 中为 PIM 添加原始规则。


### 订阅 {#subscribe}

加入您购买的所有数据源（客户端 v0.35.0 或更高版本）：

```bash
doublezero connect multicast
```

或按**数据源代码**指定数据源：

```bash
doublezero connect multicast --subscribe-feed phoenix-tob phoenix-mbp
```

使用数据源代码 `phoenix-tob` / `phoenix-mbp`，而不是按区域的数据源名称（如 `phoenix-tob-cmh`），也不是组代码（`edge-phoenix-…`）。使用 `--subscribe` 按组代码订阅在已购买的通行证上会失败。

预期看到 `✅  User Provisioned`。等待约 60 秒，然后：

```bash
doublezero status
```

预期在正确的 DoubleZero 网络上看到 `BGP Session Up`。

```bash
doublezero user list --client-ip <your ip>
```

您的数据源会出现在 `groups` 列中。使用以下命令查看组 IP：

```bash
doublezero multicast group list
```


### 自行解码线路数据 {#decode-the-wire-yourself}

Schema 版本为 **`3`** — 丢弃您的解码器未实现其版本的数据报。权威布局：[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)，包括 [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md)、[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) 和 [GLOSSARY](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md)。

每个数据报以 24 字节的数据报头开始，后跟一个或多个应用消息，打包至 MTU 上限。数据报为小端序和固定布局。

| 字段 | 说明 |
|-------|-------|
| Magic | 偏移量 0 处的 `u16`：TOB 为 `0x445A`，MBP 为 `0x4442`。请验证此值。 |
| Schema 版本 | `3` |
| Channel ID | 两个 Phoenix 数据源都使用通道 `1` |
| 序列号 | 按源 IP 地址、Channel ID 和目标端口单调递增 — 每个端口有自己独立的序列。用于间隙检测。 |
| 发送时间戳 | 自 Unix 纪元以来的纳秒数 |
| 消息计数 | 此数据报中打包的消息数量 |
| 重置计数 | 任何变化（包括 `255` → `0` 的回绕）都是重置；丢弃该发布者的通道状态。MBP 也可能在会话中途因全场重新播种而增加此值。 |
| 数据报长度 | 总字节数 |

**每个 Phoenix 数据源由多个发布者发送**，使用相同的组、通道和端口。将所有通道和合约状态键控在源 IP 地址和 Channel ID 上，否则两个发布者的序列号系列会交织在一起。原生订阅者每个发布者会收到每笔交易的一个副本。

#### 应用消息（TOB） {#application-messages-tob}

| 类型 | ID | 大小 | 端口 | 内容 |
|------|----|------|------|---------|
| 心跳 | `0x01` | 16 B | 市场数据 | 市场安静时的存活信号 |
| 合约定义 | `0x02` | 130 B | 参考数据 | 交易品种、指数、最小变动和手数、到期日 |
| 报价 | `0x03` | 60 B | 市场数据 | 最佳买入价和卖出价、价格和数量、更新标志 |
| 成交 | `0x04` | 52 B | 市场数据 | 价格、数量、主动方向、成交 ID |
| 会话结束 | `0x06` | 12 B | 市场数据 | 正常关闭 |
| 清单摘要 | `0x07` | 24 B | 参考数据 | 有效标志、Manifest Seq 变化计数器、合约数量、时间戳 |

Phoenix 不发送 `0x08`（清算）。Phoenix 在 edge-feed-spec 注册表中的 Source ID 为 `2`。请从每个 `InstrumentDefinition` 中读取 `price_exponent` 和 `qty_exponent` — 不要硬编码。指数是价格精度，不是最小变动单位：Phoenix 上的 BTC 使用指数 `-2`，最小变动大小为 `100`，因此以整美元为单位变动。

MBP 数据源使用 market-by-price 消息集。参见 edge-feed-spec 中的 market-by-price 和 reference-data 规范。两个数据源来自同一个发布者进程，因此它们共享合约 ID，MBP 市场数据端口承载与 TOB 相同的成交记录。Phoenix 成交 ID 是按市场的序列号，因此请基于**（合约 ID，成交 ID）**去重交易，而不要仅依赖成交 ID。

传输是即发即弃的 UDP，没有重传机制，参考数据端口不修复市场数据：它只重复发送 `InstrumentDefinition`（至少每 30 秒一次）和 `ManifestSummary`（至少每 1 秒一次）。丢失的 TOB 报价在该市场的最佳买入或卖出价发生变化之前将一直处于丢失状态。只有 MBP 有修复路径 — 其快照周期 — MBP 冷启动时必须绑定快照端口。

---

## 数据源地址 {#feed-addresses}

| 数据源代码 | 组代码 | 描述 | 组播组 | 市场数据 | 参考数据 | 快照 |
|-----------|------------|-------------|-----------------|-------------|----------------|----------|
| `phoenix-tob` | `edge-phoenix-tob` | 永续合约最优报价和成交 | `233.84.178.24` | `9201` | `9202` | — |
| `phoenix-mbp` | `edge-phoenix-mbp` | 永续合约按价格分级深度 | `233.84.178.25` | `9211` | `9212` | `9213` |

使用数据源代码订阅；`doublezero status` 和 `multicast group list` 显示组代码。

组选择数据源；端口选择其中的市场数据、参考数据或快照。组播复制按源 IP 地址和组进行，网络层从不检查 UDP 端口，因此加入一个组会通过您的 DoubleZero 隧道传输该组上的所有内容。端口是在字节到达后应用在您主机上的套接字过滤器。

---

## 故障排除 {#troubleshooting}

如果您遇到此处未涵盖的问题，请在尝试变通方案之前通过您现有的渠道联系我们。如果您没有现有渠道，请参阅[支持](support.md)。

### 确保客户端为最新版本 {#ensure-your-client-is-up-to-date}

运行：`sudo apt update && sudo apt install doublezero`

### 没有数据报到达 {#no-datagrams-arriving}

1. 确认数据源已在 [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买。未购买的数据源不会传输流量。
2. 确认 BGP 已建立：`doublezero status` 应在正确的 DoubleZero 网络上显示 `BGP Session Up`。
3. 确认订阅处于活动状态：`doublezero user list --client-ip <your ip>` 应在 `groups` 下列出该数据源。
4. 确认在正确的接口上加入了组播组。组播数据到达 `doublezero1`，而不是 `doublezero0`。
5. 确认防火墙允许数据源的 UDP 端口在 `doublezero1` 上入站。

### 序列号间隙 {#sequence-gaps}

按源 IP 地址、Channel ID 和目标端口跟踪序列号；仅按 Channel ID 键控的解码器会看到虚假间隙。真正的间隙意味着数据报丢失。在 MBP 上，受影响的市场会在下一个快照周期中恢复。在 TOB 上没有修复机制：市场的报价会在其最佳买入或卖出价下次变化时恢复为最新状态。

### 重置计数变化 {#reset-count-changes}

重置计数的任何变化意味着该发布者重启或重新播种了通道。丢弃该源 IP 地址和通道的状态，从参考数据端口重新收集定义，在 MBP 上从快照端口重建订单簿。

### 隧道无法建立 {#tunnel-not-coming-up}

1. **Edge Connect：** 在容器内运行状态检查 — `docker exec doublezero-edge-connect doublezero status`。在数据源正常工作时主机上的 `doublezero status` 经常失败（容器拥有守护进程）。确认主机上的 `doublezerod` 已停止。
2. **原生方式：** 验证主机守护进程正在运行：`sudo systemctl status doublezerod`
3. 验证防火墙规则已就位（GRE、BGP、PIM 以及 `doublezero1` 上的数据源端口）
4. 从您连接的同一位置（容器或主机）检查连接状态 — 预期在正确的 DoubleZero 网络上看到 `BGP Session Up`

客户端 IP 从您主机的公网 IP 自动发现。验证它与您购买数据源时使用的 IP 匹配。

---

## 研究参考设计 {#research-reference-design}

可选。如果您已经在主机上有 DoubleZero 隧道和订阅，并且想要**记录和绘制**数据源数据，研究参考设计使用 Docker Compose 运行 组播 → 解析器 → topofbook-bot → ClickHouse → Grafana：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

以下命令将演示指向 Phoenix TOB（参见[数据源地址](#feed-addresses)）：

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.24/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=9201/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=9202/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana 通常在主机上的 `http://localhost:3000` 可访问。详情和仪表板：[demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md)。

这只是可视化您已经在接收的数据。它不能替代数据源购买、订阅或上述任何连接路径。