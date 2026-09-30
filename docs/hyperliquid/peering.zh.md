---
description: "Hyperliquid 对等连接：非验证节点通过 Block Proxy 获取仲裁去重的 gossip 数据。"
---

# 对等连接访问

对等连接为非验证节点提供低延迟、去重的 Hyperliquid gossip 数据流，通过 Block Proxy 传输，包括 mempool。不包含 Edge 市场数据流。如需了解 Edge 市场数据流，请参阅 [订阅 Hyperliquid (Edge)](edge.md)。概览：[Hyperliquid](index.md)。

| | |
|--|--|
| 适用对象 | 您运营的非验证节点 |
| 获得内容 | 通过 Block Proxy 提供的一条仲裁去重 gossip 数据流（区块 + mempool） |
| 接收主机 | 包含 1 个 IP |
| 价格 | $999/月（不含 Edge 市场数据） |
| 可用性目标 | 每月 99.9% |

## 申请对等连接

有关对等连接的更多信息，请通过 [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite) 获取。请提供您节点的静态公网 IP（及所在地区）。在我们收到您的节点信息并完成付款后，预计 **1–3 个工作日** 内提供对等连接详情。

## 连接您的节点

审批通过后，我们会向您发送您的 **对等节点 IP**。将您的非验证节点指向该 IP，在防火墙中放行该 IP，然后重启节点。

### 1. 设置 gossip 配置

将 `~/override_gossip_config.json` 替换为以下内容，使用您的对等节点 IP：

```json
{
  "root_node_ips": [{"Ip": "<PEER_IP>"}],
  "try_new_peers": false,
  "split_client_blocks": true,
  "chain": "Mainnet"
}
```

| 设置项 | 说明 |
|--|--|
| `root_node_ips` | 您的 DoubleZero 对等节点是唯一的上游。 |
| `try_new_peers: false` | 使节点保持连接 DoubleZero 对等节点，不会切换到公共对等节点。 |
| `split_client_blocks: true` | 将 mempool 交易流式写入 `~/hl/data/mempool_txs/`。 |

### 2. 在防火墙中放行对等节点

允许 **来自 `<PEER_IP>` 的入站 TCP 和 UDP 4001–4002**。请在云安全组和主机防火墙中同时配置。

当您的节点连接后，对等节点会通过 4001 和 4002 端口回连您的节点以检查其可达性。如果该检查被阻止，连接会建立但不会收到任何数据。同时也请允许到对等节点 4001–4002 端口的出站连接。

### 3. 重启节点

```bash
sudo systemctl restart hl-node   # or however you run hl-visor
```

节点启动时会读取此文件。运行期间所做的更改可能不会完全生效，因此每次更改后请重启。追赶同步通常需要 5–15 分钟。

### 4. 检查是否正常工作

```bash
ss -tn state established '( dport = :4001 )'     # one connection, to <PEER_IP>
journalctl -u hl-node -f | grep 'applied block'  # blocks are being applied
ls -l ~/hl/data/mempool_txs/                     # mempool files are growing
```

!!! warning "已连接但无数据"
    对等节点无法通过 4001–4002 端口访问您的节点。请检查第 2 步中的入站规则。

!!! note "不会回退到公共对等节点"
    设置 `try_new_peers: false` 后，如果 DoubleZero 对等节点不可达，您的节点会等待其恢复，不会切换到公共对等节点。如果您看到反复出现 `Peer full` 或连接超时，请联系我们。

## 为什么采用付费对等连接

公共 Hyperliquid 根节点是共享的：插槽存在竞争，节点会轮换或限流，许多节点不转发 mempool。预留的对等连接插槽为您提供 DoubleZero 上的稳定上游，无需与他人竞争公共容量。

## 工作原理

- 两个 gossip 数据源：A 源来自 Hyper Foundation 的非验证节点，B 源来自哨兵节点。
- 客户与可水平扩展的 Block Proxy 层对等连接。每个代理与我们的两个非验证节点对等连接，对每个节点来说看起来就像一个普通的 gossip 对等节点。
- 代理将 A 和 B 仲裁合并为一条去重的 gossip 数据流提供给其对等节点，因此任一数据源断开都不会中断数据流。
- 添加代理即可扩展容量。我们的非验证节点负载不会随对等节点数量增长。

<pre class="ascii-diagram"><code>  ┌─────────────────────┐                    ┌─────────────────────┐
  │     Foundation      │                    │       Sentry        │
  │ Non-Validating Node │                    │                     │
  └──────────┬──────────┘                    └──────────┬──────────┘
             │                                          │
┈┈┈┈┈┈┈┈┈┈┈┈┈│┈┈┈┈┈┈┈┈┈┈ DOUBLEZERO INFRA ┈┈┈┈┈┈┈┈┈┈┈┈┈┈│┈┈┈┈┈┈┈┈┈┈┈┈
             ▼                                          ▼
  ┌─────────────────────┐                    ┌─────────────────────┐
  │       Primary       │                    │      Secondary      │
  │ Non-Validating Node │                    │ Non-Validating Node │
  └──────────┬──────────┘                    └──────────┬──────────┘
             │                                          │
             │   A feed                        B feed   │
             └──────────────┐              ┌────────────┘
                            ▼              ▼
                    ┌────────────────────────┐         ┌──────────────────┐
                    │      Block Proxy       │◀╌╌╌╌╌╌╌╌│ Snapshot Service │
                    │  (arbitrates A and B)  │         │   (on demand)    │
                    └───────────┬────────────┘         └──────────────────┘
                                │
                                │  one deduplicated gossip feed
                                ▼
                          ┌───────────┐
                          │   Peers   │
                          └───────────┘</code></pre>

Hyper Foundation 节点与我们的主节点对等连接；哨兵节点为我们的备用节点提供数据。每个 Block Proxy 与两者对等连接，为其客户合并数据流，并在需要时从快照服务拉取引导快照。

## 可用性

目标：每月 99.9% 可用性。

- 冗余数据源。每个代理与我们的两个非验证节点对等连接。这些节点从独立来源（Foundation 和哨兵节点）获取区块。如果一个会话或数据源断开，另一个会在故障路径恢复期间保持区块流传输。
- 我们的节点位于代理层之后。外部对等节点只能访问 Block Proxy。如果一个代理故障，其对等节点会重新连接到另一个健康的代理。负载永远不会回退到我们的节点上。
- 代理仅持有可丢弃的缓存（快照、滚动区块窗口、实时缓冲区），不持有权威链状态。故障代理会被自动替换。替换代理仅在上游会话和缓存通过就绪检查后才会投入服务。我们的非验证节点无需为此重启。

## 自动扩展

- 通过添加代理进行扩展。每个代理服务多个对等节点，但在我们的每个非验证节点上仅计为一个对等节点。
- 节点负载取决于代理数量，而非对等节点数量。
- 新代理在缓存预热并通过就绪检查后即可上线。无需完整的链重新同步。
- 新加入的对等节点从快照服务获取引导快照，从代理自身的存储获取追赶区块，永远不会从我们的非验证节点获取。新对等节点的涌入由代理层承担。

## 定价

对等连接 $999/月。包含 mempool。不包含 Edge 市场数据流。包含一个接收主机（IP）。对等连接与 Edge 市场数据不捆绑销售，也不提供组合折扣。