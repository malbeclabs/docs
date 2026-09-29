---
description: "DoubleZero Hyperliquid 产品：Edge 市场数据源和非验证节点对等连接。"
---

# Hyperliquid

*概述*

Hyperliquid 在 DoubleZero 上提供两款产品：Edge 市场数据源，以及非验证节点对等连接。

| 产品 | 简介 | 适用人群 | 指南 |
| --- | --- | --- | --- |
| **市场数据源 (Edge)** | 通过 DoubleZero Edge 以 UDP 多播方式提供 Top-of-Book 和 Market-by-Order 数据。 | 交易者 | [订阅 Hyperliquid (Edge)](/hyperliquid/edge/) |
| **对等连接** | 通过 Block Proxy 提供一条去重的 Hyperliquid gossip 数据流（不含市场数据）。 | 非验证节点 | [对等连接访问](/hyperliquid/peering/) |

## 市场数据源 (Edge)

发布者重建订单簿，并通过 DoubleZero Edge 以 UDP 多播方式发送固定大小的二进制消息。

核心数据源涵盖 Hyperliquid 原生永续合约 (`hl`) 和 [trade.xyz](https://trade.xyz) 永续合约 (`xyz`)：

| 数据源 | 描述 |
|------|-------------|
| `hyper-hl-tob` | Hyperliquid 永续合约的最优买卖报价和成交记录 |
| `hyper-hl-mbo` | Hyperliquid 永续合约的完整逐笔订单簿（新增、撤销、成交） |
| `hyper-xyz-tob` | trade.xyz 永续合约的最优买卖报价和成交记录 |
| `hyper-xyz-mbo` | trade.xyz 永续合约的完整逐笔订单簿（新增、撤销、成交） |

- Top-of-Book 和成交数据：每个合约的最优买价和卖价，以及成交记录。
- Market-by-Order：每一笔挂单（新增、撤销、成交），支持带内快照和增量恢复。

我们运行多个发布者，以便交易者可以进行故障切换或选择最快的数据流。

如何连接：[订阅 Hyperliquid (Edge)](/hyperliquid/edge/)。

## 对等连接

对等连接面向需要 Hyperliquid gossip 数据但无需市场数据的非验证节点。您将与 Block Proxy 层进行对等连接，该层将两个上游 gossip 源（Hyper Foundation 和 sentry）合并为一条去重的数据流，因此任一源断开都不会中断数据传输。

每个代理在您的节点看来就像一个普通的 gossip 对等节点。可通过增加代理来扩展容量；节点上的负载不会随对等节点数量增长而增加。可用性目标为每月 99.9%。该服务不包含 Edge 市场数据源。

如何连接：[对等连接访问](/hyperliquid/peering/)。