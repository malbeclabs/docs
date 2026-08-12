---
description: Get Kalshi market data on DoubleZero Edge — Edge Connect or native multicast.
---

# Kalshi Edge Subscriber Connection

!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol). Please note that the data is for your internal purposes only and may not be retransmitted (see Section 2(e))."

The Kalshi feeds deliver perps and sports market data over the DoubleZero Edge network as UDP multicast. There are four feeds:

- perps Top of Book (TOB)
- perps Market by Price (MBP)
- sports Top of Book (TOB)
- sports Market by Price (MBP)

## Which path should I take?

Two paths. Prefer Edge Connect unless you need to own the decoder.

| # | Path | Best for | Effort |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agents and apps that want a simple CLI and a normalized JSON WebSocket | Lowest |
| **2** | [Native multicast](#2-native-multicast-advanced) | Building your own decoder against the raw wire | Highest |

Before any path: purchase the feeds you need at [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). By purchasing, you agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol) and [Kalshi Terms of Service](https://doublezero.xyz/dz-edge-kalshi-terms).

Want an AI to do the install with you? Connect the [DoubleZero MCP](mcp.md) and ask it to walk you through Kalshi / Edge Connect.

---

## 1. Edge Connect (recommended)

**Start here.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) is the agent-friendly path: one install command, the host joins DoubleZero, and your app consumes **normalized JSON over WebSocket** (`ws://<host>:8081`) instead of decoding binary multicast.

The team evolves Edge Connect to meet the needs of its expanding user base. This is the easiest method of connection, and should be used unless you have a specific technical need.

Short version:

```bash
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

`DZ_SECRET` is a `DZ_…` access token **or** the path to the Solana keypair JSON that owns your access pass / feed purchase.

Then verify `doublezero status` (expect `BGP Session Up` and your Kalshi group) and connect a WebSocket client to `:8081`.

**Full steps, verification, and gotchas:** connect the [DoubleZero MCP](mcp.md) and ask it to walk you through Edge Connect for Kalshi.  
**WebSocket contract:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Native multicast (advanced)

!!! warning "Deeper technical knowledge required"
    Native multicast means you join the group yourself and decode the **raw** Edge wire format on your host. Only the most technically capable users should take this path. You will need to read and understand the specs, starting with [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) and the rest of [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefer [Edge Connect](#1-edge-connect-recommended) unless you have a hard requirement to own the decoder.

### Buy a feed

<div data-wizard-step="kalshi-buy-feed" markdown>

Identify the lowest-latency device before purchasing:

```bash
doublezero latency
```

Purchase at [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

</div>

### DoubleZero client setup

Follow the [setup](setup.md) instructions to install and configure the DoubleZero client. Keep the client current:

```bash
sudo apt update && sudo apt install doublezero
```

### Configure the firewall

Allow GRE, BGP, PIM, and the Kalshi feed traffic. Kalshi UDP ports live in `30000`–`59999`: the leading digit is the traffic class (`3` market data, `4` reference data, `5` snapshot) and the second digit is the feed, so reference is always market + `10000` and snapshot is always market + `20000`. Open the full band on `doublezero1` so new channels and feeds do not require another firewall change — see [Feed Addresses](#feed-addresses).

<div data-wizard-step="kalshi-firewall-iptables" markdown>

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi market / reference / snapshot (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```

</div>

<div data-wizard-step="kalshi-firewall-ufw" markdown>

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Kalshi market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

</div>

### Subscribe

<div data-wizard-step="kalshi-subscribe" markdown>

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob
```

Multiple feeds, space-separated:

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob edge-kalshi-perps-mbp edge-kalshi-sports-tob edge-kalshi-sports-mbp
```

Example provisioning output:

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <your dz_id>
🔍  Provisioning User for IP: <your public ip>
    The Device has been selected: <the doublezero device you are connecting to>
    Service provisioned with status: ok
✅  User Provisioned
```

Wait about 60 seconds, then:

```bash
doublezero status
```

Expect `BGP Session Up` on the correct DoubleZero network. As a subscriber, your DoubleZero IP matches your Tunnel Src IP.

```bash
doublezero user list --client-ip <your ip>
```

Your feeds appear in the `groups` column. Inspect group IPs with:

```bash
doublezero multicast group list
```

</div>

### Decode the wire yourself

Schema version is **`3`** — discard frames whose version your decoder does not implement. Authoritative layouts: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), including [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md).

Every datagram opens with a frame header, followed by one or more application messages packed up to the MTU. Frames are little-endian and fixed-layout.

| Field | Notes |
|-------|-------|
| Schema version | `3` |
| Channel ID | Demultiplex streams sharing a port |
| Sequence | Monotonic per channel — use for gap detection |
| Send timestamp | Nanoseconds since the Unix epoch |
| Message count | Messages packed into this frame |
| Reset count | Advances per session. An increase means cold-start your state. |
| Frame length | Total bytes |

#### Application messages (TOB)

| Type | ID | Size | Port | Carries |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | Liveness while the market is quiet |
| InstrumentDefinition | `0x02` | 130 B | reference | Symbol, exponents, tick and lot, expiry |
| Quote | `0x03` | 60 B | market | Best bid and ask, price and size, update flags |
| Trade | `0x04` | 52 B | market | Price, size, aggressor side, trade ID |
| ChannelReset | `0x05` | 12 B | both | Session start or restart |
| EndOfSession | `0x06` | 12 B | both | Clean shutdown |
| ManifestSummary | `0x07` | 24 B | reference | Active-set fingerprint and instrument count |
| PerpStats | `0x30` | 124 B | sibling | Funding, mark and oracle prices, open interest, day volume |

Kalshi's source ID in the edge-feed-spec registry is `3`. Read `price_exponent` and `qty_exponent` from each `InstrumentDefinition` — do not hardcode them.

MBP feeds use the market-by-price message set. See the market-by-price and reference-data specs in edge-feed-spec.

Delivery is fire-and-forget UDP with no retransmit. Recover missed datagrams from the reference-data cycle (and the snapshot plane on MBP feeds), which is re-emitted on a cadence rather than once.

---

## Feed Addresses

| Feed | Description | Multicast group | Market data | Reference data | Snapshot |
|------|-------------|-----------------|-------------|----------------|----------|
| `edge-kalshi-perps-tob` | Perps top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | Perps market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | Sports top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `edge-kalshi-sports-mbp` | Sports market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

Port scheme: leading digit is traffic class (`3` market, `4` reference, `5` snapshot); second digit is the feed. Reference is market + `10000`; snapshot is market + `20000`. Perps ports are fixed. Sports ports are `base + channel id` (for example, id `10` on `edge-kalshi-sports-mbp` uses `34010` / `44010` / `54010`).

The group selects the feed; the port selects market data, reference data, or snapshot within it. Multicast replication happens per source and group, and the fabric never inspects the UDP port, so joining a group delivers everything on that group across your Edge Connect link. The port is a socket filter applied on your own host after the bytes arrive.

---

## Troubleshooting

If you run into an issue not covered here, please reach out over your existing channel before working around it. If you do not have a channel, see [Support](support.md).

### Ensure your client is up to date

Run: `sudo apt update && sudo apt install doublezero`

### No datagrams arriving

1. Confirm the feed was purchased at [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). An unpurchased feed delivers no traffic.
2. Confirm BGP is up: `doublezero status` should show `BGP Session Up` on the correct DoubleZero network.
3. Confirm the subscription is active: `doublezero user list --client-ip <your ip>` should list the feed under `groups`.
4. Confirm the group is joined on the right interface. Multicast arrives on `doublezero1`, not `doublezero0`.
5. Confirm the firewall permits the feed's UDP ports inbound on `doublezero1`.

### Sequence gaps

Sequence is monotonic per channel. A gap means dropped datagrams; the next reference-data cycle restores instrument state.

### Frames stop then restart with a new reset count

A publisher restart advances the reset count in the frame header. Discard state from the prior session and cold-start from the next reference-data cycle.

### Tunnel not coming up

1. Verify the daemon is running: `sudo systemctl status doublezerod` (native path) or that the Edge Connect container is up
2. Verify firewall rules are in place (GRE, BGP, PIM, and the feed ports on `doublezero1`)
3. Check your connection status: `doublezero status` — expect `BGP Session Up` on the correct DoubleZero network

The client IP is auto-discovered from your host's public IP. Verify it matches the IP you used when purchasing the feed.

---

## Research reference design

Optional. If you already have a DoubleZero tunnel and subscription on the host and want to **record and chart** feed data, the research reference design runs multicast → parser → topofbook-bot → ClickHouse → Grafana with Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Point `.env` at your Kalshi group and ports (see [Feed Addresses](#feed-addresses)), then:

```bash
cd demo
cp .env.example .env
# set DZ_MULTICAST_GROUP, DZ_MARKETDATA_PORT, DZ_REFDATA_PORT, DZ_INTERFACE=doublezero1
docker compose up -d --build
```

Grafana is typically at `http://localhost:3000` on the host. Details and dashboards: the [demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

This visualizes data you are already receiving. It does not replace feed purchase, subscription, or either connection path above.
