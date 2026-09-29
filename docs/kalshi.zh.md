---
description: 在 DoubleZero Edge 上获取 Kalshi 市场数据 — Edge Connect 或原生组播。
---

# Kalshi Edge 订阅者连接

!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。请注意，数据仅供您内部使用，不得转发（参见第 2(e) 节）。"

Kalshi 数据源通过 DoubleZero Edge 网络以 UDP 组播方式传输永续合约和体育市场数据。共有四个数据源：

- 永续合约最优报价（TOB）
- 永续合约逐档行情（MBP）
- 体育最优报价（TOB）
- 体育逐档行情（MBP）

## 我应该选择哪种方式？

| # | 方式 | 最适合 | 难度 |
|---|------|--------|------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | 希望通过简单 CLI 和 WebSocket 解码 JSON 的代理和应用 | 最低 |
| **2** | [原生组播](#2-native-multicast-advanced) | 自行构建针对原始线路格式的解码器 | 最高 |

在选择任何方式之前：请在 [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买您需要的数据源。购买即表示您同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol) 和 [Kalshi 服务条款](https://doublezero.xyz/dz-edge-kalshi-terms)。

想让 AI 协助您完成安装？连接 [DoubleZero MCP](mcp.md) 并让它引导您完成 Kalshi / Edge Connect 的设置。

---

## 1. Edge Connect（推荐） {#1-edge-connect-recommended}

**从这里开始。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) 是对代理友好的方式：一条安装命令，主机加入 DoubleZero，您的应用通过 **WebSocket 上的解码 JSON**（`ws://<host>:8081`）消费数据，无需解码二进制组播。

Edge Connect 满足其不断增长的用户群的需求。这是最简单的连接方法，除非您有特定的技术需求，否则应使用此方式。

简要版本：

```bash
curl -fsSL https://get.doublezero.xyz/connect | \
  DZ_SECRET=/path/to/keypair.json DZ_FEEDS=KALSHI DZ_ASSUME_YES=1 bash
```

变量放在管道符之后，以便安装程序（`bash`）接收它们。`DZ_SECRET` 可以是 `DZ_…` 访问令牌**或**拥有您的访问通行证/数据源购买的 Solana 密钥对 JSON 文件路径。

如果主机上已经有 `doublezerod` 在运行，它和容器内的守护进程都会绑定 UDP 端口 `44880`，因此容器的守护进程会在启动后立即退出。安装程序会提示停止并禁用主机守护进程，在设置 `DZ_ASSUME_YES=1` 时会自动执行。如需手动操作：

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

然后**在容器内**验证状态（期望看到 `BGP Session Up` 和您的 Kalshi 组），并将 WebSocket 客户端连接到 `:8081`：

```bash
docker exec doublezero-edge-connect doublezero status
```

**完整步骤、验证和注意事项：** 连接 [DoubleZero MCP](mcp.md) 并让它引导您完成 Kalshi 的 Edge Connect 设置。  
**WebSocket 协议：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. 原生组播（高级） {#2-native-multicast-advanced}

!!! warning "需要更深入的技术知识"
    原生组播意味着您需要自行加入组播组并在主机上解码**原始** Edge 线路格式。只有技术能力最强的用户才应选择此方式。您需要阅读并理解规范，从 [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) 和 [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) 的其余部分开始。除非您有必须自行实现解码器的硬性要求，否则请优先选择 [Edge Connect](#1-edge-connect-recommended)。

### DoubleZero 客户端设置

按照[设置](setup.md)说明安装和配置 DoubleZero 客户端。保持客户端为最新版本：

```bash
sudo apt update && sudo apt install doublezero
```

### 购买数据源

在 `doublezerod` 运行的情况下，购买前先确定最低延迟的设备：

```bash
doublezero latency
```

在 [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买。

### 配置防火墙

允许 GRE、BGP、PIM 和 Kalshi 数据源流量。Kalshi UDP 端口范围为 `30000`–`59999`：首位数字是流量类别（`3` 市场数据、`4` 参考数据、`5` 快照），第二位数字是数据源，因此参考数据端口始终是市场数据端口 + `10000`，快照端口始终是市场数据端口 + `20000`。在 `doublezero1` 上打开完整端口范围，这样新增频道和数据源无需再次修改防火墙 — 参见[数据源地址](#feed-addresses)。

**iptables：**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi 市场 / 参考 / 快照（所有数据源）
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```


**UFW：**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Kalshi 市场 / 参考 / 快照（所有数据源）
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

UFW 没有 `pim` 协议。UFW 的默认出站策略允许出站 PIM；如果您拒绝出站流量，请在 `/etc/ufw/before.rules` 中添加 PIM 的原始规则。


### 订阅

加入您购买的所有数据源（客户端 v0.35.0 或更高版本）：

```bash
doublezero connect multicast
```

或通过**数据源代码**指定数据源，以空格分隔：

```bash
doublezero connect multicast --subscribe-feed kalshi-perps-tob kalshi-perps-mbp kalshi-sports-tob kalshi-sports-mbp
```

使用数据源代码（`kalshi-…`），而不是每个城市的数据源名称，也不是组代码（`edge-kalshi-…`）。使用 `--subscribe` 按组代码订阅在已购买的通行证上会失败。

期望看到 `✅  User Provisioned`。等待约 60 秒，然后：

```bash
doublezero status
```

期望在正确的 DoubleZero 网络上看到 `BGP Session Up`。

```bash
doublezero user list --client-ip <your ip>
```

您的数据源会出现在 `groups` 列中。通过以下命令查看组 IP：

```bash
doublezero multicast group list
```


### 自行解码线路数据

Schema 版本为 **`3`** — 丢弃您的解码器未实现该版本的数据报。权威布局定义：[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)，包括 [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md)。

每个数据报以 24 字节的数据报头部开始，后跟一个或多个应用消息，打包至 MTU 上限。数据报为小端序且固定布局。

| 字段 | 说明 |
|------|------|
| Magic | 偏移 0 处的 `u16`：TOB 为 `0x445A`，MBP 为 `0x4442`。请验证该值。 |
| Schema 版本 | `3` |
| 频道 ID | 用于解复用共享端口的频道 |
| 序列号 | 按源 IP 地址、频道 ID 和目标端口单调递增 — 每个端口有独立的序列。用于间隙检测。 |
| 发送时间戳 | 自 Unix 纪元以来的纳秒数 |
| 消息计数 | 打包在此数据报中的消息数 |
| 重置计数 | 任何变化（包括 `255` → `0` 回绕）即为重置；丢弃该发布者的频道状态。MBP 还可能在会话中因全市场重新播种而递增。 |
| 数据报长度 | 总字节数 |

#### 应用消息（TOB）

| 类型 | ID | 大小 | 端口 | 内容 |
|------|----|------|------|------|
| 心跳 | `0x01` | 16 B | market | 市场静默时的活跃信号 |
| 合约定义 | `0x02` | 130 B | reference | 标的、指数、最小变动和批量、到期时间 |
| 报价 | `0x03` | 60 B | market | 最优买价和卖价、价格和数量、更新标志 |
| 成交 | `0x04` | 52 B | market | 价格、数量、主动方向、成交 ID |
| 会话结束 | `0x06` | 12 B | market | 正常关闭 |
| 清单摘要 | `0x07` | 24 B | reference | 有效标志、清单序列变更计数器、合约数量、时间戳 |
| 永续合约统计 | `0x30` | 124 B | sibling | 资金费率、标记价格和预言机价格、未平仓量、日成交量 |

Kalshi 在 edge-feed-spec 注册表中的 Source ID 为 `3`。从每个 `InstrumentDefinition` 中读取 `price_exponent` 和 `qty_exponent` — 不要硬编码。

MBP 数据源使用逐档行情消息集。请参阅 edge-feed-spec 中的 market-by-price 和 reference-data 规范。

传输采用无重传的即发即弃 UDP，参考数据端口不修复市场数据：它仅重复发送 `InstrumentDefinition`（至少每 30 秒一次）和 `ManifestSummary`（至少每 1 秒一次）。丢失的 TOB 报价在该市场的最优买价或卖价下次变化之前保持丢失状态。只有 MBP 数据源具有修复路径 — 快照周期 — 且 MBP 冷启动必须绑定快照端口。按 **(合约 ID, 成交 ID)** 去重成交记录，切勿仅按成交 ID 去重。

---

## 数据源地址 {#feed-addresses}

| 数据源代码 | 组代码 | 描述 | 组播组 | 市场数据 | 参考数据 | 快照 |
|-----------|--------|------|--------|---------|---------|------|
| `kalshi-perps-tob` | `edge-kalshi-perps-tob` | 永续合约最优报价 | `233.84.178.3` | `31000` | `41000` | — |
| `kalshi-perps-mbp` | `edge-kalshi-perps-mbp` | 永续合约逐档行情 | `233.84.178.4` | `32000` | `42000` | `52000` |
| `kalshi-sports-tob` | `edge-kalshi-sports-tob` | 体育最优报价 | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `kalshi-sports-mbp` | `edge-kalshi-sports-mbp` | 体育逐档行情 | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

使用数据源代码订阅；`doublezero status` 和 `multicast group list` 显示的是组代码。

端口方案：首位数字是流量类别（`3` 市场数据、`4` 参考数据、`5` 快照）；第二位数字是数据源。参考数据 = 市场数据 + `10000`；快照 = 市场数据 + `20000`。永续合约端口是固定的。体育端口为 `基础端口 + 频道 id`（例如，`edge-kalshi-sports-mbp` 上 id `10` 使用 `34010` / `44010` / `54010`）。

组选择数据源；端口在数据源内选择市场数据、参考数据或快照。组播复制按源 IP 地址和组进行，网络结构不检查 UDP 端口，因此加入一个组会通过您的 DoubleZero 隧道接收该组上的所有内容。端口是在字节到达后在您自己的主机上应用的套接字过滤器。

---

## 故障排除

如果您遇到此处未涵盖的问题，请在通过变通方法解决之前先通过您现有的渠道联系我们。如果您没有渠道，请参阅[支持](support.md)。

### 确保您的客户端是最新版本

运行：`sudo apt update && sudo apt install doublezero`

### 没有收到数据报

1. 确认已在 [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买了数据源。未购买的数据源不会传输任何流量。
2. 确认 BGP 已建立：`doublezero status` 应在正确的 DoubleZero 网络上显示 `BGP Session Up`。
3. 确认订阅处于活动状态：`doublezero user list --client-ip <your ip>` 应在 `groups` 下列出该数据源。
4. 确认组已在正确的接口上加入。组播到达 `doublezero1`，而不是 `doublezero0`。
5. 确认防火墙允许数据源的 UDP 端口在 `doublezero1` 上的入站流量。

### 序列间隙

按源 IP 地址、频道 ID 和目标端口跟踪序列；仅按频道 ID 为键的解码器会看到虚假间隙。真正的间隙意味着丢失了数据报。在 MBP 数据源上，受影响的市场将从下一个快照周期恢复。在 TOB 数据源上没有修复机制：市场的报价要等到其最优买价或卖价下次变化时才会更新。

### 重置计数变化

重置计数的任何变化意味着该发布者重启或重新播种了频道。丢弃该源 IP 地址和频道的状态，从参考数据端口重新收集定义，并在 MBP 数据源上从快照端口重建订单簿。

### 隧道未建立

1. **Edge Connect：** 在容器内运行状态检查 — `docker exec doublezero-edge-connect doublezero status`。主机上的 `doublezero status` 经常在数据源正常时报错（容器拥有守护进程）。确认主机 `doublezerod` 已停止。
2. **原生方式：** 验证主机守护进程正在运行：`sudo systemctl status doublezerod`
3. 验证防火墙规则已就位（GRE、BGP、PIM 以及 `doublezero1` 上的数据源端口）
4. 从您连接的同一位置（容器或主机）检查连接状态 — 期望在正确的 DoubleZero 网络上看到 `BGP Session Up`

客户端 IP 从您主机的公网 IP 自动发现。验证它与您购买数据源时使用的 IP 一致。

---

## 研究参考设计

可选。如果您的主机上已有 DoubleZero 隧道和订阅，并且希望**录制和图表化**数据源数据，研究参考设计通过 Docker Compose 运行 组播 → 解析器 → topofbook-bot → ClickHouse → Grafana：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

这将演示指向 Kalshi 永续合约 TOB。如需其他数据源，请使用[数据源地址](#feed-addresses)中的组和端口：

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.3/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=31000/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=41000/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana 通常在主机的 `http://localhost:3000` 上访问。详细信息和仪表板：[demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md)。

这是对您已经接收的数据进行可视化。它不能替代数据源购买、订阅或上述任何一种连接方式。