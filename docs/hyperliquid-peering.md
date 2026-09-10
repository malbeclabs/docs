---
description: "Hyperliquid peering: arbitrated gossip via Block Proxy for non-validating nodes."
---

# Peering Access

Peering gives non-validating nodes a low-latency, deduplicated Hyperliquid gossip feed through a Block Proxy. It does not include market data. For Edge market data, see [Subscribe to Hyperliquid (Edge)](hyperliquid-subscribe.md). Overview and rate card: [Hyperliquid](hyperliquid/index.md).

| | |
|--|--|
| Who it's for | Non-validating nodes |
| What you get | One arbitrated gossip feed via Block Proxy |
| Price | $999/mo (no feed content) |
| Availability target | 99.9% monthly |

!!! note "Connection steps"
    Self-serve peering connect steps are not on this page yet. Use [Support](support.md) or your existing channel to start.

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

!!! note "$999/mo for peering"
    No feed content. Peering is not bundled or discounted with Edge market data. See [Hyperliquid pricing](hyperliquid/index.md#pricing) for the full rate card and equal-access terms.