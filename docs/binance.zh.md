---
description: 在 DoubleZero Edge 上获取 Binance Spot 和 USD-M 期货市场数据 — Edge Connect 或原生组播。
---

# Binance Edge 订阅者连接

!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。请注意，数据仅供您内部使用，不得转播（参见第 2(e) 节）。"

Binance 数据源通过 DoubleZero Edge 网络以 UDP 组播方式传送 Binance 最优报价市场数据。数据在东京从 Binance 接入，并通过 DoubleZero 的专用光纤传输，因此比公共互联网更早到达其他都市区。Binance 是许多现货交易对进行价格发现的场所，因此其数据是其他市场的领先指标。

共有两个数据源，每个 Binance 撮合引擎各一个：

| 数据源 | 合约 | 报价时间戳 |
|------|-------------|-----------------|
| Binance Spot | 所有正在交易的现货交易对，包括法币计价交易对 | 网关发送时间，微秒精度 |
| Binance USD-M | 以 USDT 和 USDC 计价的永续合约。不包括交割期货和 TradFi 永续合约 | 撮合引擎时间，毫秒精度 |

合约集合跟随 Binance 上架情况：交易对和合约在开始和停止交易时会相应添加和移除。

## 定价 {#pricing}

数据源按**月**计费：

| 数据源 | 价格 |
|------|-------|
| Binance Spot | $100 / 月 |
| Binance USD-M | $100 / 月 |

## 我应该选择哪种方式？ {#which-path-should-i-take}

| # | 方式 | 最适合 | 工作量 |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | 希望通过简单 CLI 和 WebSocket 解码 JSON 获取数据的代理和应用 | 最低 |
| **2** | [原生组播](#2-native-multicast-advanced) | 自行构建针对原始线路格式的解码器 | 最高 |

在选择任何方式之前：请在 [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买所需的数据源。购买即表示您同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。

---

## 1. Edge Connect（推荐） {#1-edge-connect-recommended}

**从这里开始。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) 是对代理友好的方式：一条安装命令，主机加入 DoubleZero，您的应用通过 **WebSocket 上的解码 JSON**（`ws://<host>:8081`）消费数据，无需解码二进制组播。

Edge Connect 满足其不断增长的用户群的需求。这是最简单的连接方法，除非您有特定的技术需求，否则应优先使用此方式。

简要步骤：

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

安装程序会要求您输入密钥：一个 `DZ_…` 访问令牌**或**拥有访问通行证 / 数据源购买的 Solana 密钥对 JSON 文件的路径。

如果主机上已经运行了 `doublezerod`，它和容器自身的守护进程都会绑定 UDP 端口 `44880`，因此容器的守护进程在启动后会立即退出。安装程序会提示停止并禁用主机守护进程，当设置了 `DZ_ASSUME_YES=1` 时则无需询问直接执行。手动操作方法：

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

然后在**容器内部**验证状态（期望看到 `BGP Session Up` 和您的 Binance 组），并将 WebSocket 客户端连接到 `:8081`：

```bash
docker exec doublezero-edge-connect doublezero status
```

WebSocket 上的每条 Binance 消息都带有 `"source_name":"BINANCE"`。两个引擎共用该名称，因此请通过 `source_id` 区分它们：`8` 为 Spot，`6` 为 USD-M。同一个代码可能同时存在于两者中 — `BTCUSDT` 在一个引擎上是现货交易对，在另一个引擎上是永续合约 — 且合约 ID 按引擎分别分配，因此请同时以 `source_id` 以及代码或合约 ID 作为键。

**WebSocket 协议：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. 原生组播（高级） {#2-native-multicast-advanced}

!!! warning "需要更深入的技术知识"
    原生组播意味着您自行加入组播组并在主机上解码 **原始** Edge 线路格式。只有技术能力最强的用户才应选择此方式。您需要阅读并理解相关规范，从 [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) 和 [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) 的其余部分开始。除非您有必须自行拥有解码器的硬性要求，否则请优先选择 [Edge Connect](#1-edge-connect-recommended)。

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

允许 GRE、BGP、PIM 和 Binance 数据源流量。两个数据源都在 UDP `30001` 上发布行情数据，在 `30002` 上发布参考数据；它们通过组播组而非端口区分。参见[数据源地址](#feed-addresses)。

**iptables：**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Binance market / reference (both feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30001:30002 -j ACCEPT
```

**UFW：**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Binance market / reference (both feeds)
sudo ufw allow in on doublezero1 to any port 30001:30002 proto udp
```

UFW 没有 `pim` 协议。出站 PIM 由 UFW 的默认出站策略允许；如果您拒绝出站流量，请在 `/etc/ufw/before.rules` 中为 PIM 添加原始规则。

### 订阅 {#subscribe}

加入您购买的所有数据源（客户端 v0.35.0 或更高版本）：

```bash
doublezero connect multicast
```

对已购买的通行证使用 `--subscribe` 按组代码订阅会失败。

期望看到 `✅  User Provisioned`。等待约 60 秒，然后：

```bash
doublezero status
```

期望在正确的 DoubleZero 网络上看到 `BGP Session Up`。

```bash
doublezero user list --client-ip <your ip>
```

您的数据源会显示在 `groups` 列中。使用以下命令查看组 IP：

```bash
doublezero multicast group list
```

### 自行解码线路格式 {#decode-the-wire-yourself}

Schema 版本为 **`3`** — 丢弃解码器未实现版本的数据报。权威布局定义：[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)，包括 [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md)、[Source ID 注册表](https://github.com/malbeclabs/edge-feed-spec/blob/main/sources/spec.md)和[术语表](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md)。

每个数据报以 24 字节的数据报头部开始，后面跟一个或多个应用消息，打包至 MTU 上限。数据报为小端序和固定布局。

| 字段 | 说明 |
|-------|-------|
| Magic | 偏移 0 处的 `u16`：`0x445A`。需验证此值。 |
| Schema 版本 | `3` |
| 频道 ID | Spot 使用频道 `1`，USD-M 使用频道 `0` |
| 序列号 | 按源 IP 地址、频道 ID 和目标端口单调递增 — 每个端口有独立的序列。用于间隔检测。 |
| 发送时间戳 | 自 Unix 纪元以来的纳秒数 |
| 消息计数 | 此数据报中打包的消息数 |
| 重置计数 | 任何变化（包括 `255` → `0` 的回绕）即为重置；丢弃该发布者的频道状态。 |
| 数据报长度 | 总字节数 |

#### 应用消息 {#application-messages}

| 类型 | ID | 大小 | 端口 | 内容 |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | 市场安静时的活跃性探测 |
| InstrumentDefinition | `0x02` | 130 B | reference | 合约代码、指数、最小价格变动和最小手数、到期时间 |
| Quote | `0x03` | 60 B | market | 最优买价和卖价、价格和数量、更新标志 |
| Trade | `0x04` | 52 B | market | 价格、数量、主动方向、成交 ID |
| EndOfSession | `0x06` | 12 B | market | 正常关闭 |
| ManifestSummary | `0x07` | 24 B | reference | 有效标志、Manifest Seq 变更计数器、合约数量、时间戳 |

**Source ID 是引擎键。** 两个数据源都使用场所代码 `BINANCE`，但每个引擎在 edge-feed-spec 注册表中都有自己的 Source ID：`8` 为 Binance Spot，`6` 为 Binance USD-Margined Futures。两个引擎上架的代码存在重叠（`BTCUSDT` 既是现货交易对也是 USD-M 永续合约），且每个引擎独立分配合约 ID，因此同一个合约 ID 可能在两个数据源上对应不同的合约。请以 **(Source ID, 合约 ID)** 作为合约和订单簿的键，切勿仅使用代码或合约 ID。从每个 `InstrumentDefinition` 中读取 `price_exponent` 和 `qty_exponent` — 不要硬编码它们。指数表示价格精度，而不是最小价格变动：可交易的增量为 `tick_size × 10^price_exponent`。

传输采用即发即忘的 UDP，无重传，参考数据端口不修复行情数据：它仅重复发送 `InstrumentDefinition`（两个数据源上均至少每 30 秒一次）和 `ManifestSummary`（USD-M 上至少每 1 秒一次，Spot 上至少每 5 秒一次）。丢失的 Quote 在该合约的最优买价或卖价发生变化之前将一直丢失。基于 **(Source ID, 合约 ID, 成交 ID)** 去重成交记录，切勿仅使用成交 ID。

Binance 在最优买卖价更新到达数据源之前会对其进行合并：在高负载下，某个代码已被取代的更新会被丢弃，以保留较新的更新。报价数量少于订单簿变化次数是正常的场所行为，而非丢失 — 请使用数据报序列号检测丢失。

与解码器可能的假设不同的参考数据细节：

- **时间戳。** USD-M 的 `Quote` 和 `Trade` 携带撮合引擎时间，精度为毫秒。Spot 的 `Quote` 携带网关发送时间，Spot 的 `Trade` 携带成交时间，精度均为微秒。在线路上均以纳秒表示。
- **`Leg1` 为 8 字节。** 较长的基础资产名称（例如 `1000FLOKI` 或 `BROCCOLI714`）会被截断；完整名称始终在 `Symbol` 中。
- **并非所有代码都是 ASCII。** 少数 USD-M 永续合约使用中文名称，其 `Symbol` 和 `Leg1` 携带 UTF-8 字节。解码这些字段时不要假设为 ASCII。
- **`Expiry` 为 `0`**，适用于所有 USD-M 合约，因为它们均为永续合约。
- **`Bid Source Count` 和 `Ask Source Count` 始终为 `0`。** Binance 不发布最优价位上的订单数量。
- **USD-M 的最优买卖价不包括零售价格改善（RPI）订单**，因此可能与包含这些订单的深度快照不同。

---

## 数据源地址 {#feed-addresses}

| 组代码 | 引擎 | Source ID | 频道 ID | 组播组 | 行情数据 | 参考数据 |
|------------|--------|-----------|------------|-----------------|-------------|----------------|
| `edge-binance-spot-tob` | Spot | `8` | `1` | `233.84.178.31` | `30001` | `30002` |
| `edge-binance-usdsm-tob` | USD-M 永续合约 | `6` | `0` | `233.84.178.23` | `30001` | `30002` |

`doublezero status` 和 `multicast group list` 显示组代码。

组选择数据源；端口选择其中的行情数据或参考数据。组播复制按源 IP 地址和组进行，网络架构不检查 UDP 端口，因此加入一个组会通过 DoubleZero 隧道传送该组上的所有内容。端口是在字节到达后在您自己的主机上应用的套接字过滤器。由于两个数据源共用端口，在同时加入两个 Binance 组的主机上，绑定到 `30001` 的套接字会同时接收两者；请按目标组或 Source ID 进行过滤。

---

## 故障排除 {#troubleshooting}

如果您遇到此处未涵盖的问题，请在进行变通处理之前通过现有渠道联系我们。如果您没有现有渠道，请参阅[支持](support/index.md)。

### 确保客户端为最新版本 {#ensure-your-client-is-up-to-date}

运行：`sudo apt update && sudo apt install doublezero`

### 没有数据报到达 {#no-datagrams-arriving}

1. 确认已在 [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买了数据源。未购买的数据源不会传送流量。
2. 确认 BGP 已建立：`doublezero status` 应在正确的 DoubleZero 网络上显示 `BGP Session Up`。
3. 确认订阅处于活动状态：`doublezero user list --client-ip <your ip>` 应在 `groups` 下列出该数据源。
4. 确认已在正确的接口上加入组播组。组播到达 `doublezero1`，而不是 `doublezero0`。
5. 确认防火墙允许 UDP `30001`–`30002` 在 `doublezero1` 上的入站流量。

### 两个引擎的数据混在一起 {#two-engines-mixed-together}

Spot 和 USD-M 都上架了 `BTCUSDT` 等代码，各自独立分配合约 ID，并共用端口。如果解码器仅以代码或合约 ID 作为订单簿的键，或为所有组绑定同一个套接字而不检查目标组，就会把两个不同的合约合并到同一个订单簿中。请同时以 Source ID（或目标组）和合约 ID 作为键。

### 序列间隔 {#sequence-gaps}

按源 IP 地址、频道 ID 和目标端口跟踪序列号；仅按频道 ID 跟踪的解码器会看到虚假间隔。真正的间隔意味着数据报丢失。没有修复机制：合约的报价在其最优买价或卖价下次变化时才会恢复为最新。

### 重置计数变化 {#reset-count-changes}

重置计数的任何变化意味着该发布者重新启动或重新种子了频道。丢弃该源 IP 地址和频道的状态，并从参考数据端口重新收集定义。

### 隧道未建立 {#tunnel-not-coming-up}

1. **Edge Connect：** 在容器内运行状态检查 — `docker exec doublezero-edge-connect doublezero status`。当数据源正常时，主机上的 `doublezero status` 通常会失败（容器拥有守护进程）。确认主机 `doublezerod` 已停止。
2. **原生方式：** 验证主机守护进程正在运行：`sudo systemctl status doublezerod`
3. 验证防火墙规则已就位（GRE、BGP、PIM 以及 `doublezero1` 上的数据源端口）
4. 从连接的同一位置（容器或主机）检查连接状态 — 期望在正确的 DoubleZero 网络上看到 `BGP Session Up`

客户端 IP 从主机的公网 IP 自动发现。验证它与您购买数据源时使用的 IP 是否匹配。

---

## 研究参考设计 {#research-reference-design}

可选。如果您已在主机上拥有 DoubleZero 隧道和订阅，并希望**记录和图表化**数据源数据，研究参考设计通过 Docker Compose 运行 组播 → 解析器 → topofbook-bot → ClickHouse → Grafana 流水线：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

此示例指向 Binance Spot。如需其他数据源，请使用[数据源地址](#feed-addresses)中对应的组：

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.31/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=30001/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=30002/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana 通常在主机的 `http://localhost:3000` 上访问。详情和仪表板：[demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md)。

这只是将您已经接收的数据可视化。它不能替代数据源购买、订阅或上述任何一种连接方式。
