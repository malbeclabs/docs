---
description: "Hyperliquid peering: arbitrated gossip via Block Proxy for non-validating nodes."
---

# Peering Access

Peering gives non-validating nodes a low-latency, deduplicated Hyperliquid gossip feed through a Block Proxy, including mempool. It does not include Edge market data feeds. For those, see [Subscribe to Hyperliquid (Edge)](edge.md). Overview: [Hyperliquid](index.md).

| | |
|--|--|
| Who it's for | Non-validating nodes you operate |
| What you get | One arbitrated gossip feed via Block Proxy (blocks + mempool) |
| Receiving hosts | 1 IP included |
| Price | $999/mo (no Edge market data) |
| Availability target | 99.9% monthly |
| Provisioning | Expect 1–2 business days after we have your node details |

## Request peering

Contact DoubleZero for peering via [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Include your node's static public IP (and region). Expect peer details within **1–3 business days** after we have your node details.

## Why paid peering

Public Hyperliquid root peers are shared: slots are contended, peers rotate or rate-limit, and many do not forward mempool. A reserved peering slot gives you a stable upstream on DoubleZero instead of competing for that public capacity.

## How it works

- Two gossip sources: an A feed from the Foundation's non-validating node, and a B feed from a sentry.
- Customers peer with a Block Proxy tier that scales horizontally. Each proxy peers with both of our non-validating nodes and looks like one ordinary gossip peer to each of them.
- The proxy arbitrates A and B into one deduplicated gossip feed for its peers, so either source can drop without stopping the stream.
- Add proxies to add capacity. Load on our non-validating nodes does not grow with peer count.

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

The Foundation node peers with our primary; a sentry feeds our secondary. Each Block Proxy peers with both, merges their feeds for its customers, and pulls bootstrap snapshots from the snapshot service when needed.

## Uptime

Target: 99.9% monthly availability.

- Redundant feed. Each proxy peers with both of our non-validating nodes. Those nodes take blocks from independent sources (Foundation and sentry). If one session or source drops, the other keeps blocks flowing while the failed path recovers.
- Our nodes stay behind the proxy tier. External peers only reach Block Proxies. If a proxy fails, its peers reconnect to another healthy proxy. Load never falls back onto our nodes.
- Proxies hold disposable caches only (snapshot, rolling block window, live buffers), not authoritative chain state. A bad proxy is replaced automatically. A replacement only enters service after upstream sessions and caches pass readiness checks. Our non-validating nodes are not restarted for that.

## Autoscaling

- Scale by adding a proxy. Each proxy serves many peers but counts as a single peer on each of our non-validating nodes.
- Node load tracks the number of proxies, not the number of peers.
- A new proxy comes up once caches are warm and readiness checks pass. It does not need a full chain resync.
- A joining peer takes its bootstrap snapshot from the snapshot service and catch-up blocks from the proxy's own store, never from our non-validating nodes. A surge of new peers hits the proxy tier instead.

## Pricing

$999/mo for peering. Includes mempool. Does not include Edge market data feeds. One receiving host (IP) is included. Peering is not bundled or discounted with Edge market data.
