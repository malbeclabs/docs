---
description: "DoubleZero Hyperliquid offerings: Edge market data feeds and peering for non-validating nodes."
---

# Hyperliquid

*Overview*

Hyperliquid has two products on DoubleZero: Edge market data feeds, and peering for non-validating nodes.

| Offering | What it is | Who it's for | Guide |
| --- | --- | --- | --- |
| **Market Data Feeds (Edge)** | Top-of-Book and Market-by-Order as UDP multicast on DoubleZero Edge. | Traders | [Subscribe to Hyperliquid (Edge)](edge.md) |
| **Peering** | One deduplicated Hyperliquid gossip feed via Block Proxy (no market data). | Non-validating nodes | [Peering Access](peering.md) |

## Market Data Feeds (Edge)

Publishers rebuild the order book and send fixed-size binary messages as UDP multicast over DoubleZero Edge.

Core feeds cover Hyperliquid native perps (`hl`) and [trade.xyz](https://trade.xyz) perps (`xyz`):

| Feed | Description |
|------|-------------|
| `edge-hyper-hl-tob` | Best bid/offer and trade prints for Hyperliquid perps |
| `edge-hyper-hl-mbo` | Full order-by-order book for Hyperliquid perps (adds, cancels, executions) |
| `edge-hyper-xyz-tob` | Best bid/offer and trade prints for trade.xyz perps |
| `edge-hyper-xyz-mbo` | Full order-by-order book for trade.xyz perps (adds, cancels, executions) |

- Top-of-Book and Trades: best bid and offer per instrument, plus trade prints.
- Market-by-Order: every resting order (add, cancel, execution), with in-band snapshot and delta recovery.

We run multiple publishers so traders can fail over or pick the fastest stream.

How to connect: [Subscribe to Hyperliquid (Edge)](edge.md).

## Peering

Peering is for non-validating nodes that need Hyperliquid gossip without taking market data. You peer with a Block Proxy tier that merges two upstream gossip sources (Hyper Foundation and sentry) into one deduplicated feed, so either source can drop without stopping the stream.

Each proxy looks like a single ordinary gossip peer to our nodes. Capacity grows by adding proxies; load on those nodes does not grow with peer count. Availability target is 99.9% monthly. The service does not include Edge market data feeds.

How to connect: [Peering Access](peering.md).
