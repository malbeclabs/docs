---
description: Get Phoenix perpetuals market data on DoubleZero Edge — Edge Connect or native multicast.
---

# Phoenix Edge Subscriber Connection

!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol). Please note that the data is for your internal purposes only and may not be retransmitted (see Section 2(e))."

The Phoenix feeds deliver Phoenix perpetuals market data over the DoubleZero Edge network as UDP multicast. There are two feeds:

- Top of Book (TOB): best bid and ask, plus trade prints
- Market by Price (MBP): price-level depth, plus trade prints

## Pricing {#pricing}

Feeds are billed **per month**:

| Feed | Price |
|------|-------|
| `phoenix-tob` | $50 / month |
| `phoenix-mbp` | $100 / month |

## Which path should I take? {#which-path-should-i-take}

| # | Path | Best for | Effort |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agents and apps that want a simple CLI and decoded JSON over WebSocket | Lowest |
| **2** | [Native multicast](#2-native-multicast-advanced) | Building your own decoder against the raw wire | Highest |

Before any path: purchase the feeds you need at [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). By purchasing, you agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol).

Want an AI to do the install with you? Connect the [DoubleZero MCP](mcp.md) and ask it to walk you through Phoenix / Edge Connect.

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

Then verify status **inside the container** (expect `BGP Session Up` and your Phoenix group) and connect a WebSocket client to `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

Edge Connect arbitrates between the Phoenix publishers, so WebSocket clients see one copy of each update.

**Full steps, verification, and gotchas:** connect the [DoubleZero MCP](mcp.md) and ask it to walk you through Edge Connect for Phoenix.  
**WebSocket contract:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Native multicast (advanced) {#2-native-multicast-advanced}

!!! warning "Deeper technical knowledge required"
    Native multicast means you join the group yourself and decode the **raw** Edge wire format on your host. Only the most technically capable users should take this path. You will need to read and understand the specs, starting with [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) and the rest of [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefer [Edge Connect](#1-edge-connect-recommended) unless you have a hard requirement to own the decoder.

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

Allow GRE, BGP, PIM, and the Phoenix feed traffic. Phoenix UDP ports live in `9201`–`9213`: `9201`/`9202` carry Top of Book market and reference data, and `9211`/`9212`/`9213` carry Market by Price market, reference, and snapshot data. See [Feed Addresses](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Phoenix market / reference / snapshot (both feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 9201:9213 -j ACCEPT
```


**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Phoenix market / reference / snapshot (both feeds)
sudo ufw allow in on doublezero1 to any port 9201:9213 proto udp
```

UFW has no `pim` protocol. Outbound PIM is allowed by UFW's default outgoing policy; if you deny outgoing traffic, add a raw rule for PIM in `/etc/ufw/before.rules`.


### Subscribe {#subscribe}

Join every feed you purchased (client v0.35.0 or later):

```bash
doublezero connect multicast
```

Or name the feeds by **feed code**:

```bash
doublezero connect multicast --subscribe-feed phoenix-tob phoenix-mbp
```

Use the feed codes `phoenix-tob` / `phoenix-mbp`, not the per-metro feed names (such as `phoenix-tob-cmh`) and not the group codes (`edge-phoenix-…`). Subscribing by group code with `--subscribe` fails on a purchased pass.

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

Schema version is **`3`** — discard datagrams whose version your decoder does not implement. Authoritative layouts: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), including [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md), [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md), and the [GLOSSARY](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md).

Every datagram opens with a 24-byte datagram header, followed by one or more application messages packed up to the MTU. Datagrams are little-endian and fixed-layout.

| Field | Notes |
|-------|-------|
| Magic | `u16` at offset 0: `0x445A` on TOB, `0x4442` on MBP. Validate it. |
| Schema version | `3` |
| Channel ID | Both Phoenix feeds use channel `1` |
| Sequence | Monotonic per source IP address, Channel ID, and destination port — each port has its own series. Use for gap detection. |
| Send timestamp | Nanoseconds since the Unix epoch |
| Message count | Messages packed into this datagram |
| Reset count | Any change (including the `255` → `0` wrap) is a reset; discard that publisher's channel state. MBP can also bump it mid-session on a venue-wide re-seed. |
| Datagram length | Total bytes |

**More than one publisher sends each Phoenix feed**, on the same groups, channel, and ports. Key all channel and instrument state on the source IP address as well as Channel ID, or two publishers' sequence series interleave into one. A native subscriber receives one copy of each trade per publisher.

#### Application messages (TOB) {#application-messages-tob}

| Type | ID | Size | Port | Carries |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | Liveness while the market is quiet |
| InstrumentDefinition | `0x02` | 130 B | reference | Symbol, exponents, tick and lot, expiry |
| Quote | `0x03` | 60 B | market | Best bid and ask, price and size, update flags |
| Trade | `0x04` | 52 B | market | Price, size, aggressor side, trade ID |
| EndOfSession | `0x06` | 12 B | market | Clean shutdown |
| ManifestSummary | `0x07` | 24 B | reference | Valid flag, Manifest Seq change counter, instrument count, timestamp |

Phoenix does not send `0x08` (Liquidation). Phoenix's Source ID in the edge-feed-spec registry is `2`. Read `price_exponent` and `qty_exponent` from each `InstrumentDefinition` — do not hardcode them. The exponent is the price precision, not the tick: BTC on Phoenix uses exponent `-2` with a tick size of `100`, so it moves in whole dollars.

The MBP feed uses the market-by-price message set. See the market-by-price and reference-data specs in edge-feed-spec. Both feeds come from the same publisher process, so they share instrument IDs, and the MBP market-data port carries the same trade prints as TOB. Phoenix trade IDs are per-market sequence numbers, so deduplicate trades on **(instrument ID, trade ID)**, never trade ID alone.

Delivery is fire-and-forget UDP with no retransmit, and the reference-data port does not repair market data: it only repeats `InstrumentDefinition` (at least once every 30 s) and `ManifestSummary` (at least once every 1 s). A lost TOB Quote stays lost until that market's best bid or ask changes. Only MBP has a repair path — its snapshot cycle — and an MBP cold start must bind the snapshot port.

---

## Feed Addresses {#feed-addresses}

| Feed code | Group code | Description | Multicast group | Market data | Reference data | Snapshot |
|-----------|------------|-------------|-----------------|-------------|----------------|----------|
| `phoenix-tob` | `edge-phoenix-tob` | Perps top-of-book and trades | `233.84.178.24` | `9201` | `9202` | — |
| `phoenix-mbp` | `edge-phoenix-mbp` | Perps market-by-price | `233.84.178.25` | `9211` | `9212` | `9213` |

Subscribe with the feed code; `doublezero status` and `multicast group list` show the group code.

The group selects the feed; the port selects market data, reference data, or snapshot within it. Multicast replication happens per source IP address and group, and the fabric never inspects the UDP port, so joining a group delivers everything on that group across your DoubleZero tunnel. The port is a socket filter applied on your own host after the bytes arrive.

---

## Troubleshooting {#troubleshooting}

If you run into an issue not covered here, please reach out over your existing channel before working around it. If you do not have a channel, see [Support](support.md).

### Ensure your client is up to date {#ensure-your-client-is-up-to-date}

Run: `sudo apt update && sudo apt install doublezero`

### No datagrams arriving {#no-datagrams-arriving}

1. Confirm the feed was purchased at [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). An unpurchased feed delivers no traffic.
2. Confirm BGP is up: `doublezero status` should show `BGP Session Up` on the correct DoubleZero network.
3. Confirm the subscription is active: `doublezero user list --client-ip <your ip>` should list the feed under `groups`.
4. Confirm the group is joined on the right interface. Multicast arrives on `doublezero1`, not `doublezero0`.
5. Confirm the firewall permits the feed's UDP ports inbound on `doublezero1`.

### Sequence gaps {#sequence-gaps}

Track sequence per source IP address, Channel ID, and destination port; a decoder keyed on Channel ID alone sees false gaps. A real gap means dropped datagrams. On MBP, the affected markets recover from the next snapshot cycle. On TOB there is no repair: a market's quote is current again once its best bid or ask next changes.

### Reset count changes {#reset-count-changes}

Any change in the reset count means that publisher restarted or re-seeded the channel. Discard state for that source IP address and channel, collect definitions from the reference-data port again, and on MBP rebuild books from the snapshot port.

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

This points the demo at Phoenix TOB (see [Feed Addresses](#feed-addresses)):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.24/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=9201/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=9202/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana is typically at `http://localhost:3000` on the host. Details and dashboards: the [demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

This visualizes data you are already receiving. It does not replace feed purchase, subscription, or either connection path above.
