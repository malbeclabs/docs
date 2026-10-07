---
description: Get Binance Spot and USD-M futures market data on DoubleZero Edge — Edge Connect or native multicast.
---

# Binance Edge Subscriber Connection

!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol). Please note that the data is for your internal purposes only and may not be retransmitted (see Section 2(e))."

The Binance feeds deliver Binance top-of-book market data over the DoubleZero Edge network as UDP multicast. The data is ingested from Binance in Tokyo and carried over DoubleZero's dedicated fiber, so it reaches other metros sooner than the public internet delivers it. Binance is where price discovery happens for many spot pairs, so its data is a leading indicator for other markets.

There are two feeds, one per Binance matching engine:

| Feed | Instruments | Quote timestamp |
|------|-------------|-----------------|
| Binance Spot | Every trading spot pair, including fiat-quoted pairs | Gateway send time, µs precision |
| Binance USD-M | USDT- and USDC-quoted perpetuals. Dated futures and TradFi perpetuals are not included | Matching engine time, ms precision |

The instrument set follows Binance listings: pairs and contracts are added and removed as they enter and leave trading.

## Pricing {#pricing}

Feeds are billed **per month**:

| Feed | Price |
|------|-------|
| Binance Spot | $100 / month |
| Binance USD-M | $100 / month |

## Which path should I take? {#which-path-should-i-take}

| # | Path | Best for | Effort |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agents and apps that want a simple CLI and decoded JSON over WebSocket | Lowest |
| **2** | [Native multicast](#2-native-multicast-advanced) | Building your own decoder against the raw wire | Highest |

Before any path: purchase the feeds you need at [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). By purchasing, you agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol).

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

Then verify status **inside the container** (expect `BGP Session Up` and your Binance group) and connect a WebSocket client to `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

Every Binance message on the WebSocket carries `"source_name":"BINANCE"`. The engines share that name, so tell them apart by `source_id`: `8` is Spot and `6` is USD-M. The same symbol can exist on both — `BTCUSDT` is a spot pair on one and a perpetual on the other — and instrument IDs are assigned per engine, so key on `source_id` as well as the symbol or instrument ID.

**WebSocket contract:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Native multicast (advanced) {#2-native-multicast-advanced}

!!! warning "Deeper technical knowledge required"
    Native multicast means you join the group yourself and decode the **raw** Edge wire format on your host. Only the most technically capable users should take this path. You will need to read and understand the specs, starting with [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) and the rest of [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefer [Edge Connect](#1-edge-connect-recommended) unless you have a hard requirement to own the decoder.

### DoubleZero client setup {#doublezero-client-setup}

Follow the [setup](setup.md) instructions to install and configure the DoubleZero client. Keep the client current:

```bash
sudo apt update && sudo apt install doublezero
```

### Buy a feed {#buy-a-feed}

With `doublezerod` running, identify the lowest-latency device before purchasing:

```bash
doublezero latency
```

Purchase at [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configure the firewall {#configure-the-firewall}

Allow GRE, BGP, PIM, and the Binance feed traffic. Both feeds publish market data on UDP `30001` and reference data on `30002`; they are told apart by multicast group, not by port. See [Feed Addresses](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Binance market / reference (both feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30001:30002 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Binance market / reference (both feeds)
sudo ufw allow in on doublezero1 to any port 30001:30002 proto udp
```

UFW has no `pim` protocol. Outbound PIM is allowed by UFW's default outgoing policy; if you deny outgoing traffic, add a raw rule for PIM in `/etc/ufw/before.rules`.

### Subscribe {#subscribe}

Join every feed you purchased (client v0.35.0 or later):

```bash
doublezero connect multicast
```

Subscribing by group code with `--subscribe` fails on a purchased pass.

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

### Decode the wire yourself {#decode-the-wire-yourself}

Schema version is **`3`** — discard datagrams whose version your decoder does not implement. Authoritative layouts: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), including [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md), the [Source ID Registry](https://github.com/malbeclabs/edge-feed-spec/blob/main/sources/spec.md), and the [GLOSSARY](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md).

Every datagram opens with a 24-byte datagram header, followed by one or more application messages packed up to the MTU. Datagrams are little-endian and fixed-layout.

| Field | Notes |
|-------|-------|
| Magic | `u16` at offset 0: `0x445A`. Validate it. |
| Schema version | `3` |
| Channel ID | Spot uses channel `1`, USD-M channel `0` |
| Sequence | Monotonic per source IP address, Channel ID, and destination port — each port has its own series. Use for gap detection. |
| Send timestamp | Nanoseconds since the Unix epoch |
| Message count | Messages packed into this datagram |
| Reset count | Any change (including the `255` → `0` wrap) is a reset; discard that publisher's channel state. |
| Datagram length | Total bytes |

#### Application messages {#application-messages}

| Type | ID | Size | Port | Carries |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | Liveness while the market is quiet |
| InstrumentDefinition | `0x02` | 130 B | reference | Symbol, exponents, tick and lot, expiry |
| Quote | `0x03` | 60 B | market | Best bid and ask, price and size, update flags |
| Trade | `0x04` | 52 B | market | Price, size, aggressor side, trade ID |
| EndOfSession | `0x06` | 12 B | market | Clean shutdown |
| ManifestSummary | `0x07` | 24 B | reference | Valid flag, Manifest Seq change counter, instrument count, timestamp |

**Source ID is the engine key.** Both feeds use the venue code `BINANCE`, but each engine has its own Source ID in the edge-feed-spec registry: `8` Binance Spot, `6` Binance USD-Margined Futures. The engines list overlapping symbols (`BTCUSDT` is both a spot pair and a USD-M perpetual), and each engine assigns instrument IDs independently, so the same instrument ID can appear on both feeds for different instruments. Key instruments and books on **(Source ID, instrument ID)**, never on the symbol or instrument ID alone. Read `price_exponent` and `qty_exponent` from each `InstrumentDefinition` — do not hardcode them. The exponent is the price precision, not the tick: the tradable increment is `tick_size × 10^price_exponent`.

Delivery is fire-and-forget UDP with no retransmit, and the reference-data port does not repair market data: it only repeats `InstrumentDefinition` (at least once every 30 s on both feeds) and `ManifestSummary` (at least once every 1 s on USD-M, every 5 s on Spot). A lost Quote stays lost until that instrument's best bid or ask changes. Deduplicate trades on **(Source ID, instrument ID, trade ID)**, never trade ID alone.

Binance conflates best bid and ask updates before they reach the feed: under load, a superseded update for a symbol is dropped in favor of the newer one. Fewer quotes than book changes is normal venue behavior, not loss — use the datagram sequence number to detect loss.

Reference-data details that differ from what a decoder might assume:

- **Timestamps.** USD-M `Quote` and `Trade` carry the matching engine time, at millisecond precision. Spot `Quote` carries the gateway send time and Spot `Trade` the execution time, both at microsecond precision. All are expressed in nanoseconds on the wire.
- **`Leg1` is 8 bytes.** Longer base assets (for example `1000FLOKI` or `BROCCOLI714`) are truncated; the full name is always in `Symbol`.
- **Not every symbol is ASCII.** A few USD-M perpetuals have Chinese names, and their `Symbol` and `Leg1` carry UTF-8 bytes. Do not assume ASCII when decoding these fields.
- **`Expiry` is `0`** on every USD-M instrument, since all are perpetuals.
- **`Bid Source Count` and `Ask Source Count` are always `0`.** Binance does not publish order counts at the touch.
- **USD-M excludes Retail Price Improvement (RPI) orders** from the best bid and ask, so it can differ from a depth snapshot that includes them.

---

## Feed Addresses {#feed-addresses}

| Group code | Engine | Source ID | Channel ID | Multicast group | Market data | Reference data |
|------------|--------|-----------|------------|-----------------|-------------|----------------|
| `edge-binance-spot-tob` | Spot | `8` | `1` | `233.84.178.31` | `30001` | `30002` |
| `edge-binance-usdsm-tob` | USD-M perpetuals | `6` | `0` | `233.84.178.23` | `30001` | `30002` |

`doublezero status` and `multicast group list` show the group code.

The group selects the feed; the port selects market data or reference data within it. Multicast replication happens per source IP address and group, and the fabric never inspects the UDP port, so joining a group delivers everything on that group across your DoubleZero tunnel. The port is a socket filter applied on your own host after the bytes arrive. Because the feeds share ports, a socket bound to `30001` on a host joined to both Binance groups receives both; filter on the destination group or on Source ID.

---

## Troubleshooting {#troubleshooting}

If you run into an issue not covered here, please reach out over your existing channel before working around it. If you do not have a channel, see [Support](support/index.md).

### Ensure your client is up to date {#ensure-your-client-is-up-to-date}

Run: `sudo apt update && sudo apt install doublezero`

### No datagrams arriving {#no-datagrams-arriving}

1. Confirm the feed was purchased at [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). An unpurchased feed delivers no traffic.
2. Confirm BGP is up: `doublezero status` should show `BGP Session Up` on the correct DoubleZero network.
3. Confirm the subscription is active: `doublezero user list --client-ip <your ip>` should list the feed under `groups`.
4. Confirm the group is joined on the right interface. Multicast arrives on `doublezero1`, not `doublezero0`.
5. Confirm the firewall permits UDP `30001`–`30002` inbound on `doublezero1`.

### Two engines mixed together {#two-engines-mixed-together}

Spot and USD-M both list symbols such as `BTCUSDT`, assign instrument IDs independently, and share ports. A decoder that keys books on the symbol or instrument ID alone, or binds one socket for every group without checking the destination group, merges two different instruments into one book. Key on Source ID (or the destination group) as well as the instrument ID.

### Sequence gaps {#sequence-gaps}

Track sequence per source IP address, Channel ID, and destination port; a decoder keyed on Channel ID alone sees false gaps. A real gap means dropped datagrams. There is no repair: an instrument's quote is current again once its best bid or ask next changes.

### Reset count changes {#reset-count-changes}

Any change in the reset count means that publisher restarted or re-seeded the channel. Discard state for that source IP address and channel, and collect definitions from the reference-data port again.

### Tunnel not coming up {#tunnel-not-coming-up}

1. **Edge Connect:** run status in the container — `docker exec doublezero-edge-connect doublezero status`. Host `doublezero status` often fails while the feed is fine (container owns the daemon). Confirm host `doublezerod` is stopped.
2. **Native:** verify the host daemon is running: `sudo systemctl status doublezerod`
3. Verify firewall rules are in place (GRE, BGP, PIM, and the feed ports on `doublezero1`)
4. Check connection status from the same place you connected (container or host) — expect `BGP Session Up` on the correct DoubleZero network

The client IP is auto-discovered from your host's public IP. Verify it matches the IP you used when purchasing the feed.

---

## Research reference design {#research-reference-design}

Optional. If you already have a DoubleZero tunnel and subscription on the host and want to **record and chart** feed data, the research reference design runs multicast → parser → topofbook-bot → ClickHouse → Grafana with Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

This points the demo at Binance Spot. For another feed, use its group from [Feed Addresses](#feed-addresses):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.31/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=30001/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=30002/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana is typically at `http://localhost:3000` on the host. Details and dashboards: the [demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

This visualizes data you are already receiving. It does not replace feed purchase, subscription, or either connection path above.
