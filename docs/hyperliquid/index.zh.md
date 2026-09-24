---
description: "DoubleZero Hyperliquid 产品：Edge 市场数据源和非验证节点对等连接。"
---

# Hyperliquid

*概述*

Hyperliquid 在 DoubleZero 上提供两款产品：Edge 市场数据源和非验证节点对等连接。

| 产品 | 简介 | 适用人群 | 指南 |
| --- | --- | --- | --- |
| **市场数据源 (Edge)** | 通过 DoubleZero Edge 以 UDP 组播方式提供最优报价和逐笔委托数据。 | 交易者 | [订阅 Hyperliquid (Edge)](edge.md) |
| **对等连接** | 通过 Block Proxy 提供一条去重后的 Hyperliquid gossip 数据源（不含市场数据）。 | 非验证节点 | [对等连接访问](peering.md) |

## 市场数据源 (Edge)

发布者重建订单簿，并通过 DoubleZero Edge 以 UDP 组播方式发送固定大小的二进制消息。

核心数据源涵盖 Hyperliquid 原生永续合约 (`hl`) 和 [trade.xyz](https://trade.xyz) 永续合约 (`xyz`)：

| 数据源 | 描述 |
|------|-------------|
| `hyper-hl-tob` | Hyperliquid 永续合约的最优买卖报价和成交回报 |
| `hyper-hl-mbo` | Hyperliquid 永续合约的完整逐笔委托簿（新增、撤单、成交） |
| `hyper-xyz-tob` | trade.xyz 永续合约的最优买卖报价和成交回报 |
| `hyper-xyz-mbo` | trade.xyz 永续合约的完整逐笔委托簿（新增、撤单、成交） |

- 最优报价与成交：每个合约的最优买价和卖价，以及成交回报。
- 逐笔委托：每一笔挂单（新增、撤单、成交），支持带内快照和增量恢复。

我们运行多个发布者，以便交易者可以进行故障切换或选择最快的数据流。

如何连接：[订阅 Hyperliquid (Edge)](edge.md)。

## 对等连接

对等连接适用于需要 Hyperliquid gossip 数据但不需要市场数据的非验证节点。您将与 Block Proxy 层建立对等连接，该层将两个上游 gossip 源（Hyper Foundation 和 sentry）合并为一条去重后的数据源，因此任一源断开都不会中断数据流。

每个代理对我们的节点而言看起来就像一个普通的 gossip 对等节点。通过增加代理数量可以扩展容量；这些节点上的负载不会随对等节点数量的增加而增长。可用性目标为每月 99.9%。该服务不包含 Edge 市场数据源。

如何连接：[对等连接访问](peering.md)。