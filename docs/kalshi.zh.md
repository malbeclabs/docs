---
description: 在 DoubleZero Edge 上获取 Kalshi 市场数据 — Edge Connect 或原生组播。
---

# Kalshi Edge 订阅者连接

!!! warning "连接 DoubleZero 即表示我同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。请注意，数据仅供您内部使用，不得转发（参见第 2(e) 条）。"

Kalshi 数据源通过 DoubleZero Edge 网络以 UDP 组播方式传输永续合约和体育市场数据。共有四个数据源：

- 永续合约最优报价（TOB）
- 永续合约按价格分层行情（MBP）
- 体育最优报价（TOB）
- 体育按价格分层行情（MBP）

## 我应该选择哪条路径？

两条路径。除非您需要自行控制解码器，否则建议使用 Edge Connect。

| # | 路径 | 最适合 | 工作量 |
|---|------|--------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | 需要简单 CLI 和标准化 JSON WebSocket 的代理和应用 | 最低 |
| **2** | [原生组播](#2-native-multicast-advanced) | 针对原始线路格式构建自己的解码器 | 最高 |

在选择任何路径之前：请在 [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买您需要的数据源。购买即表示您同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol) 和 [Kalshi 服务条款](https://doublezero.xyz/dz-edge-kalshi-terms)。

想让 AI 协助您完成安装？连接 [DoubleZero MCP](mcp.md) 并让它引导您完成 Kalshi / Edge Connect 的配置。

---

## 1. Edge Connect（推荐）

**从这里开始。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) 是对代理友好的路径：一条安装命令，主机加入 DoubleZero，您的应用通过 **WebSocket 上的标准化 JSON**（`ws://<host>:8081`）消费数据，无需解码二进制组播。

团队持续改进 Edge Connect 以满足不断增长的用户群需求。这是最简单的连接方式，除非您有特定的技术需求，否则应使用此方式。

简短版本：

```bash
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

`DZ_SECRET` 是一个 `DZ_…` 访问令牌**或**拥有您的访问通行证/数据源购买权的 Solana 密钥对 JSON 文件路径。

然后验证 `doublezero status`（期望看到 `BGP Session Up` 和您的 Kalshi 组），并将 WebSocket 客户端连接到 `:8081`。

**完整步骤、验证和注意事项：** 连接 [DoubleZero MCP](mcp.md) 并让它引导您完成 Kalshi 的 Edge Connect 配置。  
**WebSocket 协议规范：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. 原生组播（高级）

!!! warning "需要更深入的技术知识"
    原生组播意味着您自行加入组并在主机上解码**原始** Edge 线路格式。只有技术能力最强的用户才应选择此路径。您需要阅读并理解规范，从 [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) 和 [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) 的其余部分开始。除非您有必须自行控制解码器的硬性需求，否则请使用 [Edge Connect](#1-edge-connect-recommended)。

### 购买数据源

<div data-wizard-step="kalshi-buy-feed" markdown>

在购买之前确定最低延迟的设备：

```bash
doublezero latency
```

在 [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买。

</div>

### DoubleZero 客户端设置

按照[设置](setup.md)说明安装和配置 DoubleZero 客户端。保持客户端为最新版本：

```bash
sudo apt update && sudo apt install doublezero
```

### 配置防火墙

允许 GRE、BGP、PIM 和 Kalshi 数据源流量。Kalshi UDP 端口范围为 `30000`–`59999`：首位数字是流量类别（`3` 市场数据，`4` 参考数据，`5` 快照），第二位数字是数据源，因此参考数据端口始终是市场数据端口 + `10000`，快照端口始终是市场数据端口 + `20000`。在 `doublezero1` 上开放整个端口段，这样新的通道和数据源就不需要再次更改防火墙 — 参见[数据源地址](#feed-addresses)。

<div data-wizard-step="kalshi-firewall-iptables" markdown>

**iptables：**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi 市场 / 参考 / 快照（所有数据源）
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```

</div>

<div data-wizard-step="kalshi-firewall-ufw" markdown>

**UFW：**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Kalshi 市场 / 参考 / 快照（所有数据源）
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

</div>

### 订阅

<div data-wizard-step="kalshi-subscribe" markdown>

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob
```

多个数据源，以空格分隔：

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob edge-kalshi-perps-mbp edge-kalshi-sports-tob edge-kalshi-sports-mbp
```

配置输出示例：

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <your dz_id>
🔍  Provisioning User for IP: <your public ip>
    The Device has been selected: <the doublezero device you are connecting to>
    Service provisioned with status: ok
✅  User Provisioned
```

等待约 60 秒，然后：

```bash
doublezero status
```

期望在正确的 DoubleZero 网络上看到 `BGP Session Up`。作为订阅者，您的 DoubleZero IP 与您的 Tunnel Src IP 一致。

```bash
doublezero user list --client-ip <your ip>
```

您的数据源会出现在 `groups` 列中。使用以下命令查看组 IP：

```bash
doublezero multicast group list
```

</div>

### 自行解码线路数据

Schema 版本为 **`3`** — 丢弃版本号与您解码器未实现版本不匹配的帧。权威布局定义：[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)，包括 [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md)。

每个数据报以帧头开始，后跟一个或多个打包至 MTU 的应用消息。帧采用小端序和固定布局。

| 字段 | 说明 |
|------|------|
| Schema 版本 | `3` |
| 通道 ID | 对共享端口的流进行解复用 |
| 序列号 | 每通道单调递增 — 用于间隙检测 |
| 发送时间戳 | 自 Unix 纪元以来的纳秒数 |
| 消息计数 | 打包到此帧中的消息数 |
| 重置计数 | 每个会话递增。增加意味着需要冷启动您的状态。 |
| 帧长度 | 总字节数 |

#### 应用消息（TOB）

| 类型 | ID | 大小 | 端口 | 内容 |
|------|----|------|------|------|
| 心跳 | `0x01` | 16 B | 市场 | 市场静默时的活跃信号 |
| 合约定义 | `0x02` | 130 B | 参考 | 标的代码、指数、最小变动价位和手数、到期时间 |
| 报价 | `0x03` | 60 B | 市场 | 最优买卖价，价格和数量，更新标志 |
| 成交 | `0x04` | 52 B | 市场 | 价格、数量、主动方向、成交 ID |
| 通道重置 | `0x05` | 12 B | 两者 | 会话启动或重启 |
| 会话结束 | `0x06` | 12 B | 两者 | 正常关闭 |
| 清单摘要 | `0x07` | 24 B | 参考 | 活跃集合指纹和合约数量 |
| 永续统计 | `0x30` | 124 B | 关联 | 资金费率、标记价和预言机价格、未平仓量、日成交量 |

Kalshi 在 edge-feed-spec 注册表中的源 ID 为 `3`。从每个 `InstrumentDefinition` 中读取 `price_exponent` 和 `qty_exponent` — 不要硬编码它们。

MBP 数据源使用按价格分层行情消息集。请参见 edge-feed-spec 中的 market-by-price 和 reference-data 规范。

传输采用即发即忘 UDP，无重传。通过参考数据循环（以及 MBP 数据源上的快照平面）恢复丢失的数据报，参考数据按固定周期重复发送而非仅发送一次。

---

## 数据源地址

| 数据源 | 描述 | 组播组 | 市场数据 | 参考数据 | 快照 |
|--------|------|--------|----------|----------|------|
| `edge-kalshi-perps-tob` | 永续合约最优报价 | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | 永续合约按价格分层行情 | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | 体育最优报价 | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `edge-kalshi-sports-mbp` | 体育按价格分层行情 | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

端口方案：首位数字是流量类别（`3` 市场，`4` 参考，`5` 快照）；第二位数字是数据源。参考数据端口 = 市场数据端口 + `10000`；快照端口 = 市场数据端口 + `20000`。永续合约端口固定。体育端口为 `基础端口 + 通道 id`（例如，`edge-kalshi-sports-mbp` 上 id 为 `10` 时使用 `34010` / `44010` / `54010`）。

组选择数据源；端口选择其中的市场数据、参考数据或快照。组播复制按源和组进行，网络层不检查 UDP 端口，因此加入一个组会通过您的 Edge Connect 链路传递该组上的所有内容。端口是在字节到达后在您自己的主机上应用的套接字过滤器。

---

## 故障排除

如果您遇到此处未涵盖的问题，请在尝试变通方案之前通过您现有的沟通渠道联系我们。如果您没有沟通渠道，请参见[支持](support.md)。

### 确保客户端为最新版本

运行：`sudo apt update && sudo apt install doublezero`

### 没有数据报到达

1. 确认已在 [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买了数据源。未购买的数据源不会传输任何流量。
2. 确认 BGP 已建立：`doublezero status` 应在正确的 DoubleZero 网络上显示 `BGP Session Up`。
3. 确认订阅处于活跃状态：`doublezero user list --client-ip <your ip>` 应在 `groups` 下列出该数据源。
4. 确认组已在正确的接口上加入。组播到达 `doublezero1`，而非 `doublezero0`。
5. 确认防火墙允许该数据源的 UDP 端口在 `doublezero1` 上入站。

### 序列号间隙

序列号在每个通道内单调递增。间隙表示数据报丢失；下一个参考数据循环会恢复合约状态。

### 帧停止后以新的重置计数重新开始

发布者重启会使帧头中的重置计数递增。丢弃上一会话的状态，并从下一个参考数据循环进行冷启动。

### 隧道无法建立

1. 验证守护进程正在运行：`sudo systemctl status doublezerod`（原生路径）或确认 Edge Connect 容器已启动
2. 验证防火墙规则已就位（GRE、BGP、PIM 以及 `doublezero1` 上的数据源端口）
3. 检查您的连接状态：`doublezero status` — 期望在正确的 DoubleZero 网络上看到 `BGP Session Up`

客户端 IP 从您主机的公网 IP 自动发现。验证它与您购买数据源时使用的 IP 一致。

---

## 研究参考设计

可选。如果您的主机上已有 DoubleZero 隧道和订阅，且希望**记录和可视化**数据源数据，研究参考设计通过 Docker Compose 运行 组播 → 解析器 → topofbook-bot → ClickHouse → Grafana：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

将 `.env` 指向您的 Kalshi 组和端口（参见[数据源地址](#feed-addresses)），然后：

```bash
cd demo
cp .env.example .env
# 设置 DZ_MULTICAST_GROUP、DZ_MARKETDATA_PORT、DZ_REFDATA_PORT、DZ_INTERFACE=doublezero1
docker compose up -d --build
```

Grafana 通常在主机的 `http://localhost:3000` 上访问。详情和仪表板：[demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md)。

这只是将您已经接收的数据进行可视化。它不能替代数据源购买、订阅或上述任一连接路径。