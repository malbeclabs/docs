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

## Request peering

More information about peering is available via [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Include your node's static public IP (and region). Expect peer details within **1–3 business days** after we have your node details and payment is done.

## Connect your node

Once you're approved, we send you your **peer IP**. Point your non-validating node at it, open your firewall to it, and restart the node.

### 1. Set the gossip config

Replace `~/override_gossip_config.json` with this, using your peer IP:

```json
{
  "root_node_ips": [{"Ip": "<PEER_IP>"}],
  "try_new_peers": false,
  "split_client_blocks": true,
  "chain": "Mainnet"
}
```

| Setting | Why |
|--|--|
| `root_node_ips` | Your DoubleZero peer is your only upstream. |
| `try_new_peers: false` | Keeps the node on the DoubleZero peer. It will not switch to public peers. |
| `split_client_blocks: true` | Streams mempool transactions to `~/hl/data/mempool_txs/`. |

### 2. Open your firewall to the peer

Allow **inbound TCP and UDP 4001–4002 from `<PEER_IP>`**. Do this in your cloud security group and on the host firewall.

When your node connects, the peer connects back to your node on 4001 and 4002 to check that it is reachable. If that check is blocked, the connection opens but no data arrives. Also allow outbound connections to the peer on 4001–4002.

### 3. Restart the node

```bash
sudo systemctl restart hl-node   # or however you run hl-visor
```

The node reads this file when it starts. Changes made while it runs may not take full effect, so restart after every change. Catching up usually takes 5–15 minutes.

### 4. Check that it works

```bash
ss -tn state established '( dport = :4001 )'     # one connection, to <PEER_IP>
journalctl -u hl-node -f | grep 'applied block'  # blocks are being applied
ls -l ~/hl/data/mempool_txs/                     # mempool files are growing
```

!!! warning "Connected but no data"
    The peer cannot reach your node on 4001–4002. Check the inbound rules from step 2.

!!! note "No fallback to public peers"
    With `try_new_peers: false`, your node waits for the DoubleZero peer if it is unreachable. It does not switch to public peers. Contact us if you see repeated `Peer full` or connection timeouts.

## Why paid peering

Public Hyperliquid root peers are shared: slots are contended, peers rotate or rate-limit, and many do not forward mempool. A reserved peering slot gives you a stable upstream on DoubleZero instead of competing for that public capacity.

## How it works

- Two gossip sources: an A feed from Hyper Foundation's non-validating node, and a B feed from a sentry.
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

Hyper Foundation node peers with our primary; a sentry feeds our secondary. Each Block Proxy peers with both, merges their feeds for its customers, and pulls bootstrap snapshots from the snapshot service when needed.

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
