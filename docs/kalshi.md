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

| # | Path | Best for | Effort |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agents and apps that want a simple CLI and decoded JSON over WebSocket | Lowest |
| **2** | [Native multicast](#2-native-multicast-advanced) | Building your own decoder against the raw wire | Highest |

Before any path: purchase the feeds you need at [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). By purchasing, you agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol) and [Kalshi Terms of Service](https://doublezero.xyz/dz-edge-kalshi-terms).

Want an AI to do the install with you? Connect the [DoubleZero MCP](mcp.md) and ask it to walk you through Kalshi / Edge Connect.

---

## 1. Edge Connect (recommended) {#1-edge-connect-recommended}

**Start here.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) is the agent-friendly path: one install command, the host joins DoubleZero, and your app consumes **decoded JSON over WebSocket** (`ws://<host>:8081`) instead of decoding binary multicast.

Edge Connect meets the needs of its expanding user base. This is the easiest method of connection, and should be used unless you have a specific technical need.

Short version:

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

The installer asks for your secret: a `DZ_…` access token **or** the path to the Solana keypair JSON that owns your access pass / feed purchase.

If a host `doublezerod` is already running, it and the container’s own daemon both bind UDP port `44880`, so the container’s daemon exits right after starting. The installer offers to stop and disable the host daemon, and does it without asking when `DZ_ASSUME_YES=1` is set. To do it yourself:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Then verify status **inside the container** (expect `BGP Session Up` and your Kalshi group) and connect a WebSocket client to `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

**Full steps, verification, and gotchas:** connect the [DoubleZero MCP](mcp.md) and ask it to walk you through Edge Connect for Kalshi.  
**WebSocket contract:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Native multicast (advanced) {#2-native-multicast-advanced}

!!! warning "Deeper technical knowledge required"
    Native multicast means you join the group yourself and decode the **raw** Edge wire format on your host. Only the most technically capable users should take this path. You will need to read and understand the specs, starting with [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) and the rest of [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefer [Edge Connect](#1-edge-connect-recommended) unless you have a hard requirement to own the decoder.

### DoubleZero client setup

Follow the [setup](setup.md) instructions to install and configure the DoubleZero client. Keep the client current:

```bash
sudo apt update && sudo apt install doublezero
```

### Buy a feed

With `doublezerod` running, identify the lowest-latency device before purchasing:

```bash
doublezero latency
```

Purchase at [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configure the firewall

Allow GRE, BGP, PIM, and the Kalshi feed traffic. Kalshi UDP ports live in `30000`–`59999`: the leading digit is the traffic class (`3` market data, `4` reference data, `5` snapshot) and the second digit is the feed, so reference is always market + `10000` and snapshot is always market + `20000`. Open the full band on `doublezero1` so new channels and feeds do not require another firewall change — see [Feed Addresses](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi market / reference / snapshot (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```


**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Kalshi market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

UFW has no `pim` protocol. Outbound PIM is allowed by UFW's default outgoing policy; if you deny outgoing traffic, add a raw rule for PIM in `/etc/ufw/before.rules`.


### Subscribe

Join every feed you purchased (client v0.35.0 or later):

```bash
doublezero connect multicast
```

Or name the feeds by **feed code**, space-separated:

```bash
doublezero connect multicast --subscribe-feed kalshi-perps-tob kalshi-perps-mbp kalshi-sports-tob kalshi-sports-mbp
```

Use the feed codes (`kalshi-…`), not the per-metro feed names and not the group codes (`edge-kalshi-…`). Subscribing by group code with `--subscribe` fails on a purchased pass.

Expect `✅  User Provisioned`. Wait about 60 seconds, then:

```bash
doublezero status
```

Expect `BGP Session Up` on the correct DoubleZero network.

```bash
doublezero user list --client-ip <your ip>
```

Your feeds appear in the `groups` column. Inspect group IPs with:

```bash
doublezero multicast group list
```


### Decode the wire yourself

Schema version is **`3`** — discard datagrams whose version your decoder does not implement. Authoritative layouts: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), including [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md).

Every datagram opens with a 24-byte datagram header, followed by one or more application messages packed up to the MTU. Datagrams are little-endian and fixed-layout.

| Field | Notes |
|-------|-------|
| Magic | `u16` at offset 0: `0x445A` on TOB, `0x4442` on MBP. Validate it. |
| Schema version | `3` |
| Channel ID | Demultiplex channels sharing a port |
| Sequence | Monotonic per source IP address, Channel ID, and destination port — each port has its own series. Use for gap detection. |
| Send timestamp | Nanoseconds since the Unix epoch |
| Message count | Messages packed into this datagram |
| Reset count | Any change (including the `255` → `0` wrap) is a reset; discard that publisher's channel state. MBP can also bump it mid-session on a venue-wide re-seed. |
| Datagram length | Total bytes |

#### Application messages (TOB)

| Type | ID | Size | Port | Carries |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | Liveness while the market is quiet |
| InstrumentDefinition | `0x02` | 130 B | reference | Symbol, exponents, tick and lot, expiry |
| Quote | `0x03` | 60 B | market | Best bid and ask, price and size, update flags |
| Trade | `0x04` | 52 B | market | Price, size, aggressor side, trade ID |
| EndOfSession | `0x06` | 12 B | market | Clean shutdown |
| ManifestSummary | `0x07` | 24 B | reference | Valid flag, Manifest Seq change counter, instrument count, timestamp |
| PerpStats | `0x30` | 124 B | sibling | Funding, mark and oracle prices, open interest, day volume |

Kalshi's Source ID in the edge-feed-spec registry is `3`. Read `price_exponent` and `qty_exponent` from each `InstrumentDefinition` — do not hardcode them.

MBP feeds use the market-by-price message set. See the market-by-price and reference-data specs in edge-feed-spec.

Delivery is fire-and-forget UDP with no retransmit, and the reference-data port does not repair market data: it only repeats `InstrumentDefinition` (at least once every 30 s) and `ManifestSummary` (at least once every 1 s). A lost TOB Quote stays lost until that market's best bid or ask changes. Only MBP feeds have a repair path — the snapshot cycle — and an MBP cold start must bind the snapshot port. Deduplicate trades on **(instrument ID, trade ID)**, never trade ID alone.

---

## Feed Addresses {#feed-addresses}

| Feed code | Group code | Description | Multicast group | Market data | Reference data | Snapshot |
|-----------|------------|-------------|-----------------|-------------|----------------|----------|
| `kalshi-perps-tob` | `edge-kalshi-perps-tob` | Perps top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `kalshi-perps-mbp` | `edge-kalshi-perps-mbp` | Perps market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `kalshi-sports-tob` | `edge-kalshi-sports-tob` | Sports top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `kalshi-sports-mbp` | `edge-kalshi-sports-mbp` | Sports market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

Subscribe with the feed code; `doublezero status` and `multicast group list` show the group code.

Port scheme: leading digit is traffic class (`3` market, `4` reference, `5` snapshot); second digit is the feed. Reference is market + `10000`; snapshot is market + `20000`. Perps ports are fixed. Sports ports are `base + channel id` (for example, id `10` on `edge-kalshi-sports-mbp` uses `34010` / `44010` / `54010`).

The group selects the feed; the port selects market data, reference data, or snapshot within it. Multicast replication happens per source IP address and group, and the fabric never inspects the UDP port, so joining a group delivers everything on that group across your DoubleZero tunnel. The port is a socket filter applied on your own host after the bytes arrive.

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

Track sequence per source IP address, Channel ID, and destination port; a decoder keyed on Channel ID alone sees false gaps. A real gap means dropped datagrams. On MBP feeds, the affected markets recover from the next snapshot cycle. On TOB feeds there is no repair: a market's quote is current again once its best bid or ask next changes.

### Reset count changes

Any change in the reset count means that publisher restarted or re-seeded the channel. Discard state for that source IP address and channel, collect definitions from the reference-data port again, and on MBP feeds rebuild books from the snapshot port.

### Tunnel not coming up

1. **Edge Connect:** run status in the container — `docker exec doublezero-edge-connect doublezero status`. Host `doublezero status` often fails while the feed is fine (container owns the daemon). Confirm host `doublezerod` is stopped.
2. **Native:** verify the host daemon is running: `sudo systemctl status doublezerod`
3. Verify firewall rules are in place (GRE, BGP, PIM, and the feed ports on `doublezero1`)
4. Check connection status from the same place you connected (container or host) — expect `BGP Session Up` on the correct DoubleZero network

The client IP is auto-discovered from your host's public IP. Verify it matches the IP you used when purchasing the feed.

---

## Research reference design

Optional. If you already have a DoubleZero tunnel and subscription on the host and want to **record and chart** feed data, the research reference design runs multicast → parser → topofbook-bot → ClickHouse → Grafana with Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

This points the demo at Kalshi perps TOB. For another feed, use its group and ports from [Feed Addresses](#feed-addresses):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.3/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=31000/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=41000/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana is typically at `http://localhost:3000` on the host. Details and dashboards: the [demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

This visualizes data you are already receiving. It does not replace feed purchase, subscription, or either connection path above.
