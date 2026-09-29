---
description: "在 DoubleZero Edge 上订阅 Hyperliquid 市场数据 — 设置、都市区、Feed 请求以及审批后连接。"
---

# 订阅 Hyperliquid (Edge)

!!! warning "连接 DoubleZero 即表示我同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。请注意，数据仅供您内部使用，不得转发（参见第 2(e) 条）。"

Hyperliquid Feed 通过 DoubleZero Edge 以 UDP 组播方式传送市场数据。四个核心 Feed 涵盖 Hyperliquid 原生永续合约 (`hl`) 和 [trade.xyz](https://trade.xyz) 永续合约 (`xyz`)：

| Feed | 描述 |
|------|-------------|
| `hyper-hl-tob` | Hyperliquid 永续合约的最优买卖报价和成交记录 |
| `hyper-hl-mbo` | Hyperliquid 永续合约的逐笔订单簿（新增、取消、成交） |
| `hyper-xyz-tob` | trade.xyz 永续合约的最优买卖报价和成交记录 |
| `hyper-xyz-mbo` | trade.xyz 永续合约的逐笔订单簿（新增、取消、成交） |

服务概览：[Hyperliquid](index.md)。

## 我应该选择哪条路径？

| 模式 | 获得的内容 | 适用场景 |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — 通过 WebSocket 传输已解码的 JSON | 最快获得可用的报价流 |
| **原生组播** | 在 `doublezero1` 上订阅，自行解码二进制 UDP（或使用参考解析器） | 完全掌控底层传输 |

先完成共同步骤：防火墙、都市区、申请和付款（步骤 1–3）。审批通过后，[步骤 4](#step-4-connect-after-approval) 分为两条路径 — **Edge Connect** 或 **原生**。请勿在同一主机上混用两种方式。

想让 AI 帮您完成安装？连接 [DoubleZero MCP](../mcp.md)，让它引导您完成 Hyperliquid Edge 的设置。

---

## 步骤 1：DoubleZero 设置

**完成初始设置**


按照[设置](../setup.md)说明在主机上安装并配置 DoubleZero 客户端。

如果您之前已在该主机上为原生使用设置过 DoubleZero，请确保客户端已更新到最新版本：

```bash
sudo apt update && sudo apt install doublezero
```

**配置防火墙**


在 `doublezero1` 上放行 GRE、BGP、PIM 和 Hyperliquid Feed 流量。Hyperliquid UDP 端口范围为 `20000`–`20999`（Top-of-Book 和 Market-by-Order 的市场数据、参考数据和快照）。同时在隧道上放行 UDP `5765` 用于 DoubleZero 心跳。建议开放整个 Feed 端口范围，这样添加新 Feed 时无需再次修改防火墙。参见 [Feed 地址](#feed-addresses)。

**iptables：**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid 市场数据 / 参考数据 / 快照（所有 Feed）
sudo iptables -A INPUT -i doublezero1 -p udp --dport 20000:20999 -j ACCEPT
# DoubleZero 心跳
sudo iptables -A INPUT -i doublezero1 -p udp --dport 5765 -j ACCEPT
```

**UFW：**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Hyperliquid 市场数据 / 参考数据 / 快照（所有 Feed）
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# DoubleZero 心跳
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

UFW 不支持 `pim` 协议。出站 PIM 在 UFW 的默认出站策略下是被允许的；如果您拒绝出站流量，请在 `/etc/ufw/before.rules` 中添加 PIM 的原始规则。

您可以将这些规则收紧为仅限您所订阅的 Feed 对应的端口（参见 [Feed 地址](#feed-addresses)）。

---

## 步骤 2：选择都市区

确定距离接收 Feed 的机器延迟最低的位置：

```bash
doublezero latency
```

记下延迟最低结果中的都市区/城市。您将在申请表中选择该城市。查看[拓扑地图](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth)了解都市区的分组方式。

**定价**


Feed 按交付区域定价。价格取决于数据交付到哪里，而非购买者所在位置。东京套餐交付给东京的接收方；交付到其他地方需要全球套餐。每个 Feed 在每个都市区包含两个接收主机（IP）。

| Feed | 东京/月 | 全球/月 |
| --- | --- | --- |
| Hyperliquid 永续合约 Top-of-Book (L1) | $900 | $1,500 |
| Hyperliquid 永续合约 Market-by-Order (L4) | $3,000 | $5,000 |
| trade.xyz 永续合约 Top-of-Book (L1) | $900 | $1,500 |
| trade.xyz 永续合约 Market-by-Order (L4) | $3,000 | $5,000 |
| **所有 Feed（套餐约 30% 折扣）** | **$5,500** | **$9,000** |

---

## 步骤 3：提交申请

1. 前往 [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)。
2. 选择 **Hyperliquid** 以及您需要的 Feed。
3. 选择您需要的**城市**（都市区）。使用上表和 `doublezero latency` 进行选择。
4. 填写申请表。

您需要在[账户](https://doublezero.xyz/shreds/account)页面为每个 Feed 请求分配一个 DoubleZero ID（使用现有密钥或生成新密钥）。对应的**私钥必须存在于将接收 Feed 的机器上** — 不要分配一个您无法将私钥移至该主机的公钥。

您选择一个**都市区**和一个**公钥**。您**不需要**在申请时绑定公网 IP。在订阅期间，您可以在**所选都市区内**的 IP 之间迁移访问权限。

我们将及时联系您并提供更多说明（预计 **1-3 个工作日**）。

---

## 步骤 4：审批后连接 {#step-4-connect-after-approval}

提交申请后，您将收到一张账单；付款完成后，在每台已批准的机器上进行连接。访问权限将在您选择的开始日期启用。选择以下**一条**路径。

### 4a. Edge Connect {#4a-edge-connect}

如果主机上已有 `doublezerod` 在运行（来自[设置](../setup.md)），它和容器内的守护进程都会绑定 UDP 端口 `44880`，因此容器的守护进程启动后会立即退出。安装程序会提议停止并禁用主机守护进程，当设置了 `DZ_ASSUME_YES=1` 时会自动执行而不询问。手动操作方法：

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

在审批和付款**之后**安装 [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect)。该桥接程序在 `--network host` 容器内加入 DoubleZero，并在 `ws://<host>:8081` 上提供已解码的 JSON。

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**所有 `doublezero` 命令都通过容器执行**，而非主机 CLI：

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    您可以创建别名以便于向容器发送命令。以下示例使 `dz status` 的效果与容器内的 `doublezero status` 相同：

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

预期看到 `BGP Session Up` 以及您的 `edge-hyper-…` 组已订阅。

然后打开 WebSocket（`ws://127.0.0.1:8081`）。协议说明：[PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。完整操作指南：[MCP](../mcp.md) runbook `hyperliquid-edge`。

### 4b. 原生组播 {#4b-native-multicast}

在持有已分配私钥的主机上（主机 `doublezerod` 正在运行），订阅您购买的 Feed：

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

多个 Feed 以空格分隔：

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

检查隧道状态：

```bash
doublezero status
```

预期在正确的 DoubleZero 网络上看到 `BGP Session Up`。然后自行解码传输数据 — 参见[解码 Feed](#decode-the-feed)。

---

## 账单

席位按**月**计费。请注意席位到期日期。

您需要在席位到期前支付账单。**未支付将导致席位被移除。**

---

## Feed 地址 {#feed-addresses}

IP 决定组播组。端口决定该组上的数据流。使用以下命令查看 IP 实时值：

```bash
doublezero multicast group list
```

| Feed | 描述 | 组播组 | 市场数据 | 参考数据 | 快照 | 规范 |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Hyperliquid 永续合约的最优买卖报价和成交记录 | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Hyperliquid 永续合约的逐笔订单簿 | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | trade.xyz 永续合约的最优买卖报价和成交记录 | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | trade.xyz 永续合约的逐笔订单簿 | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

每个 Feed 拥有自己的组播组地址。端口：参考数据 = 市场数据 + `1`；快照（仅 MBO）= 市场数据 + `2`。建议将市场数据和参考数据绑定在一起；对于 MBO，还需绑定快照。

您可能还会在 `doublezero1` 的端口 `5765` 上看到小型 UDP 数据包 — 这是 DoubleZero 心跳，不是市场数据。

帧采用小端序固定大小二进制格式。Hyperliquid 原生永续合约使用 `source_id=1`；trade.xyz 永续合约使用 `source_id=7`。

---

## 解码 Feed {#decode-the-feed}

!!! note "Edge Connect"
    如果您使用的是 `doublezero-edge-connect`，Feed 已通过 WebSocket 解码为 JSON — 无需手动解码。

**使用参考解析器**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) 提供组播订阅器，可解码传输格式并通过 Unix socket 重新发布为 JSON：

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) 用于 Top-of-Book 和成交数据
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) 用于 Market-by-Order

完整管线请参见[主 README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines)。

**自行编写解码器**

根据 [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) 进行解码。从帧头开始，然后是您所接收 Feed 的消息布局。

**GRE 隧道头 — XDP**

通过网络传输的市场数据在最后一英里使用 GRE 封装。在 `doublezero1` 上，客户端呈现的是普通 UDP 组播。如果您自行终结 GRE（例如使用 XDP 管线），请在将数据送入解码器之前剥离 GRE 头。参见 [`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap)。

---

## 故障排除

如果您遇到此处未涵盖的问题，请在尝试绕过问题之前通过您现有的沟通渠道联系我们。如果您没有沟通渠道，请参见[支持](../support.md)。

**确保客户端已更新到最新版本**


```bash
sudo apt update && sudo apt install doublezero
```

**隧道无法建立**


1. **Edge Connect：**在容器内运行状态检查 — `docker exec doublezero-edge-connect doublezero status`。当 Feed 正常工作时，主机的 `doublezero status` 通常会失败（容器拥有守护进程）。确认主机 `doublezerod` 已停止。
2. **原生：**验证主机守护进程正在运行：`sudo systemctl status doublezerod`
3. 验证防火墙规则已就位（GRE、BGP、PIM、Hyperliquid UDP 端口以及 `doublezero1` 上的 `5765`）
4. 确认该席位的账单已支付且开始日期已过
5. 在您选择的路径上运行 connect（[4a](#4a-edge-connect) 或 [4b](#4b-native-multicast)），使用与账户页面匹配的密钥
6. 预期从您运行 connect 的同一位置（容器或主机）看到 `BGP Session Up`

**订阅后无数据包**


1. 确认您已订阅：`doublezero user list`
2. 确认 Feed 出现在您的组中：`doublezero multicast group list`
3. 在隧道上抓包，例如 Hyperliquid TOB：`sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. 建议将您所需 Feed 的市场数据和参考数据绑定在一起（MBO 还需绑定快照）

**已购买的 Feed 缺失（Edge Connect）**

如果已购买的 Feed 未出现在 `doublezero status` 中，请在容器内订阅：

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-code>
```

多个 Feed 以空格分隔：

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

**席位过期或被移除**


席位按月计费。如果账单在到期前未支付，席位将被移除，隧道将无法保持连接。

**"Multicast user already exists"**


您已通过其他路径拥有活跃的订阅。请先断开连接，然后重试：

- **Edge Connect：**`docker exec doublezero-edge-connect doublezero disconnect`
- **原生：**`doublezero disconnect`

然后在同一路径（容器或主机）上重试 `doublezero connect multicast --subscribe-feed <feed-code>`。

**AWS 特定问题**


在实例的 ENI 上禁用源/目标检查。否则，GRE 封装的组播数据可能会被丢弃。