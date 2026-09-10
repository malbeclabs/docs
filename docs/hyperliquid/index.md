---
description: "DoubleZero Hyperliquid offerings: Edge market data feeds and peering for non-validating nodes."
---

# Hyperliquid

*Overview & pricing*

Hyperliquid has two products on DoubleZero: Edge market data feeds, and peering for non-validating nodes.

| Offering | What it is | Who it's for | Price from | Guide |
| --- | --- | --- | --- | --- |
| **Market Data Feeds (Edge)** | Top-of-Book, Market-by-Order, and Order-Intent as UDP multicast on DoubleZero Edge. | Traders | from $900/mo | [Subscribe to Hyperliquid (Edge)](../hyperliquid-subscribe.md) |
| **Peering** | One deduplicated Hyperliquid gossip feed via Block Proxy (no market data). | Non-validating nodes | $999/mo | [Peering Access](../hyperliquid-peering.md) |

## Market Data Feeds (Edge)

Publishers rebuild the order book and send fixed-size binary messages as UDP multicast over DoubleZero Edge.

Core feeds cover Hyperliquid native perps (`hl`) and [trade.xyz](https://trade.xyz) perps (`xyz`):

| Feed | Description |
|------|-------------|
| `edge-hyper-hl-tob` | Best bid/offer and trade prints for Hyperliquid perps |
| `edge-hyper-hl-mbo` | Full order-by-order book for Hyperliquid perps (adds, cancels, executions) |
| `edge-hyper-xyz-tob` | Best bid/offer and trade prints for trade.xyz perps |
| `edge-hyper-xyz-mbo` | Full order-by-order book for trade.xyz perps (adds, cancels, executions) |
| `edge-hyper-hl-orderintent` | Pre-consensus order, cancel, and modify submissions for Hyperliquid perps |

- Top-of-Book and Trades: best bid and offer per instrument, plus trade prints.
- Market-by-Order: every resting order (add, cancel, execution), with in-band snapshot and delta recovery.
- Order-Intent: pre-consensus order, cancel, and modify submissions seen in the mempool before they land in a block.

Pricing is per feed and delivery region. We run multiple publishers so traders can fail over or pick the fastest stream.

How to connect: [Subscribe to Hyperliquid (Edge)](../hyperliquid-subscribe.md). Same Edge path as other feeds: setup, choose a metro, submit a request, connect after approval.

## Peering

Peering is for non-validating nodes that need Hyperliquid gossip without taking market data. You peer with a Block Proxy tier that merges two upstream gossip sources (Foundation and sentry) into one deduplicated feed, so either source can drop without stopping the stream.

Each proxy looks like a single ordinary gossip peer to our nodes. Capacity grows by adding proxies; load on those nodes does not grow with peer count. Availability target is 99.9% monthly. The service does not include Edge market data feeds.

How to connect: [Peering Access](../hyperliquid-peering.md).

## Pricing

!!! note
    Rates are published and the same for every customer. Peering is not bundled or discounted with Edge market data, and no client gets a faster or dedicated line.

### Peering

$999/mo for peering, with no feed content.

### Market Data Feeds (Edge)

Price follows delivery region, not where the buyer sits. A Tokyo package delivers to Tokyo receivers; anywhere else needs the Global package.

| Feed | Tokyo $/mo | Global $/mo |
| --- | --- | --- |
| Hyperliquid perps Top-of-Book (L1) | 900 | 1,500 |
| Hyperliquid perps Market-by-Order (L4) | 3,000 | 5,000 |
| trade.xyz perps Top-of-Book (L1) | 900 | 1,500 |
| trade.xyz perps Market-by-Order (L4) | 3,000 | 5,000 |
| Hyperliquid Order-Intent | 4,800 | 8,000 |
| **Complete suite** | **9,000** | **15,000** |

Bought separately, the feeds total $12,600 (Tokyo) or $21,000 (Global). The complete suite is the bundled rate.
