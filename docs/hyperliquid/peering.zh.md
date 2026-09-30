---
description: "Hyperliquid 对等连接：通过 Block Proxy 为非验证节点提供仲裁式 gossip。"
---

# 对等连接访问

对等连接为非验证节点提供低延迟、去重的 Hyperliquid gossip 数据流，通过 Block Proxy 传输，包含内存池（mempool）数据。不包含 Edge 市场数据流。如需了解后者，请参阅 [订阅 Hyperliquid (Edge)](edge.md)。概览：[Hyperliquid](index.md)。

| | |
|--|--|
| 适用对象 | 您运营的非验证节点 |
| 您将获得 | 通过 Block Proxy 提供的一条仲裁式 gossip 数据流（区块 + 内存池） |
| 接收主机 | 包含 1 个 IP |
| 价格 | $999/月（不含 Edge 市场数据） |
| 可用性目标 | 每月 99.9% |

## 申请对等连接

有关对等连接的更多信息，请通过 [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite) 获取。请提供您节点的静态公网 IP（及所在区域）。在我们收到您的节点信息并完成付款后，预计 **1–3 个工作日** 内提供对等连接详情。

## 连接您的节点

审批通过后，我们会向您发送您的 **peer IP**。将您的非验证节点指向该地址，在防火墙中放行该地址，然后重启节点。

### 1. 设置 gossip 配置

使用您的 peer IP 替换 `~/override_gossip_config.json` 文件内容：

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
| `root_node_ips` | 您的 DoubleZero 对等节点是您唯一的上游来源。 |
| `try_new_peers: false` | 保持节点连接到 DoubleZero 对等节点，不会切换到公共对等节点。 |
| `split_client_blocks: true` | 将内存池交易流式写入 `~/hl/data/mempool_txs/`。 |

!!! note "规划磁盘和带宽"
    启用 `split_client_blocks: true` 后，节点会将完整内存池写入磁盘。
    请预留每天数百 GB 到约 1 TB 的内存池写入量，以及大致相同的其他
    节点输出写入量。入站带宽较低，因为 gossip 在传输时经过压缩；我们
    的测试节点每天接收约 110 GB。请为 `~/hl/data/` 设置保留策略
    （例如，删除数小时前的旧文件），否则磁盘将在一天内被填满。

### 2. 在防火墙中放行对等节点

允许 **来自 `<PEER_IP>` 的入站 TCP 和 UDP 4001–4002**。请在您的云安全组和主机防火墙中同时进行设置。

当您的节点连接后，对等节点会通过 4001 和 4002 端口回连您的节点以检查其是否可达。如果该检查被阻止，连接会建立但不会收到任何数据。同时请允许到对等节点 4001–4002 端口的出站连接。

### 3. 重启节点

```bash
sudo systemctl restart hl-node   # or however you run hl-visor
```

节点在启动时读取此文件。运行期间所做的更改可能不会完全生效，因此每次更改后都需要重启。追赶同步通常需要 5–15 分钟。

### 4. 检查是否正常工作

```bash
ss -tn state established '( dport = :4001 )'     # one connection, to <PEER_IP>
journalctl -u hl-node -f | grep 'applied block'  # blocks are being applied
ls -l ~/hl/data/mempool_txs/                     # mempool files are growing
```

!!! warning "已连接但无数据"
    对等节点无法通过 4001–4002 端口访问您的节点。请检查步骤 2 中的入站规则。

!!! note "不会回退到公共对等节点"
    启用 `try_new_peers: false` 后，如果 DoubleZero 对等节点不可达，您的节点会持续等待。它不会切换到公共对等节点。如果您看到反复出现的 `Peer full` 或连接超时，请联系我们。

## 为什么需要付费对等连接

公共 Hyperliquid 根对等节点是共享的：插槽存在争用，对等节点会轮换或限流，且许多不转发内存池数据。预留的对等连接插槽为您提供 DoubleZero 上的稳定上游，而非与他人争夺公共容量。

## 工作原理

- 两个 gossip 数据源：A 源来自 Hyper Foundation 的非验证节点，B 源来自哨兵节点（sentry）。
- 客户通过可水平扩展的 Block Proxy 层进行对等连接。每个代理与我们的两个非验证节点对等连接，对每个节点表现为一个普通的 gossip 对等节点。
- 代理将 A 源和 B 源仲裁合并为一条去重的 gossip 数据流提供给其对等节点，因此任一数据源中断不会导致数据流停止。
- 通过添加代理来增加容量。我们非验证节点上的负载不会随对等节点数量增长。

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

Hyper Foundation 节点与我们的主节点对等连接；哨兵节点为我们的次节点提供数据。每个 Block Proxy 与两者对等连接，为其客户合并数据流，并在需要时从快照服务拉取引导快照。

## 正常运行时间

目标：每月 99.9% 可用性。

- 冗余数据源。每个代理与我们的两个非验证节点对等连接。这些节点从独立来源（Foundation 和哨兵节点）获取区块。如果一个会话或数据源中断，另一个会在故障路径恢复期间保持区块流动。
- 我们的节点位于代理层之后。外部对等节点只能访问 Block Proxy。如果某个代理故障，其对等节点会重新连接到另一个健康的代理。负载永远不会回退到我们的节点上。
- 代理仅持有可丢弃的缓存（快照、滚动区块窗口、实时缓冲区），而非权威链状态。故障代理会被自动替换。替换节点只有在上游会话和缓存通过就绪检查后才会投入服务。我们的非验证节点无需为此重启。

## 自动扩展

- 通过添加代理进行扩展。每个代理服务多个对等节点，但在我们的每个非验证节点上仅计为单个对等节点。
- 节点负载与代理数量相关，而非对等节点数量。
- 新代理在缓存预热并通过就绪检查后即可上线。无需完整的链重新同步。
- 加入的对等节点从快照服务获取引导快照，从代理自身的存储获取追赶区块，而非从我们的非验证节点获取。新对等节点的激增只会影响代理层。

## 定价

$999/月的对等连接费用。包含内存池数据。不包含 Edge 市场数据流。包含一个接收主机（IP）。对等连接不与 Edge 市场数据捆绑或享受折扣。