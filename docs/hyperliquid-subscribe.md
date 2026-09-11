---
description: "Subscribe to Hyperliquid market data on DoubleZero Edge — setup, metro, feed request, and connect after approval."
---

# Subscribe to Hyperliquid (Edge)

!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol). Please note that the data is for your internal purposes only and may not be retransmitted (see Section 2(e))."

The Hyperliquid feeds deliver market data over DoubleZero Edge as UDP multicast. Five core feeds cover Hyperliquid native perps (`hl`) and [trade.xyz](https://trade.xyz) perps (`xyz`):

| Feed | Description |
|------|-------------|
| `edge-hyper-hl-tob` | Best bid/offer and trade prints for Hyperliquid perps |
| `edge-hyper-hl-mbo` | Full order-by-order book for Hyperliquid perps (adds, cancels, executions) |
| `edge-hyper-xyz-tob` | Best bid/offer and trade prints for trade.xyz perps |
| `edge-hyper-xyz-mbo` | Full order-by-order book for trade.xyz perps (adds, cancels, executions) |
| `edge-hyper-hl-orderintent` | Pre-consensus order, cancel, and modify submissions for Hyperliquid perps |

Service overview and pricing: [Hyperliquid](hyperliquid/index.md).

!!! note "Peering"
    For Hyperliquid gossip peering (non-validating nodes), see [Peering Access](hyperliquid-peering.md).

## Which path should I take?

| Mode | What you get | When to use |
|------|----------------|-------------|
| **Native multicast** | Subscribe on `doublezero1`, decode binary UDP yourself (or with reference parsers) | Default for full control |
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — decode + normalized JSON WebSocket | Fastest to a usable quote stream |

For Edge Connect, finish subscription and connect on the host first, then run the container instead of decoding by hand.

---

## Step 1: DoubleZero Setup

**Complete Setup**


Follow the [setup](setup.md) instructions to install and configure the DoubleZero client.

If you have previously set up DoubleZero, ensure the client is current:

```bash
sudo apt update && sudo apt install doublezero
```

**Configure the Firewall**


Allow GRE, BGP, PIM, and Hyperliquid feed traffic on `doublezero1`. Hyperliquid UDP ports sit in `9000`–`11999` (Top-of-Book, Market-by-Order, and Order-Intent across publisher port sets). Open the full band so new port sets do not need another firewall change. See [Feed addresses](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid market / reference / snapshot / order-intent (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 9000:11999 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Hyperliquid market / reference / snapshot / order-intent (all feeds)
sudo ufw allow in on doublezero1 to any port 9000:11999 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

You may tighten these rules to only the port sets for the feeds you subscribe to (see [Feed addresses](#feed-addresses)).

---

## Step 2: Choose a metro

Identify the lowest-latency location from the machine that will receive the feed:

```bash
doublezero latency
```

Note the metro / city from the lowest-latency result. You will select that city on the application form. See the [topology map](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) for how metros are grouped.

**Pricing**


Feeds are priced by delivery region. The price follows where the data is delivered, not where the buyer is. A Tokyo package delivers to Tokyo receivers; delivery elsewhere needs the Global package.

| Feed | Tokyo /mo | Global /mo |
| --- | --- | --- |
| Hyperliquid perps Top-of-Book (L1) | $900 | $1,500 |
| Hyperliquid perps Market-by-Order (L4) | $3,000 | $5,000 |
| trade.xyz perps Top-of-Book (L1) | $900 | $1,500 |
| trade.xyz perps Market-by-Order (L4) | $3,000 | $5,000 |
| Hyperliquid Order-Intent | $4,800 | $8,000 |
| **All feeds (bundle 28% discount)** | **$9,000** | **$15,000** |

Buying each feed alone totals $12,600/mo (Tokyo) or $21,000/mo (Global). The bundle row is the discounted price for all five together. Full rate card: [Hyperliquid pricing](hyperliquid/index.md#pricing).

---

## Step 3: Submit Request

1. Go to [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Select **Hyperliquid** and the feeds you need.
3. Select the **city** (metro) you need. Use the table above and `doublezero latency` to choose.
4. Finish the application form.

You will assign a DoubleZero ID (existing key, or generate a new one) to each feed request on the [accounts](https://doublezero.xyz/shreds/account) page. The matching **private key must be present on the machine that will receive the feed** — do not assign a pubkey whose private key you cannot move to that host.

You pick a **metro** and a **pubkey**. You do **not** bind a public IP at application time. During the subscription you can move access between IPs **within the chosen metros**.

Our team reviews applications and contacts you in a timely manner (expect **2 business days**).

---

## Step 4: Connect after approval

After we contact you, you receive an invoice, and that invoice is paid, connect on each approved machine. Subscribe to the feeds you purchased:

```bash
doublezero connect multicast --subscribe-feed <name_of_feed>
```

Multiple feeds, space-separated:

```bash
doublezero connect multicast --subscribe-feed edge-hyper-hl-tob edge-hyper-hl-mbo edge-hyper-xyz-tob edge-hyper-xyz-mbo edge-hyper-hl-orderintent
```

Access is enabled on your chosen start date. After access is provisioned, check the tunnel status with:

```bash
doublezero status
```

Expect `BGP Session Up` on the correct DoubleZero network.

---

## Billing

Seats are charged **monthly**. Watch the seat expiration date.

You will be invoiced a few days before the seat expires. **Not paying leads to removal of the seat.**

---

## Feed addresses

IP picks the multicast group. Port picks the stream on that group. Check live values with:

```bash
doublezero multicast group list
```

| Feed | Description | Multicast group | Spec |
|------|-------------|-----------------|------|
| `edge-hyper-hl-tob` | Best bid/offer and trade prints for Hyperliquid perps | `233.84.178.15` | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `edge-hyper-hl-mbo` | Full order-by-order book for Hyperliquid perps | `233.84.178.15` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `edge-hyper-xyz-tob` | Best bid/offer and trade prints for trade.xyz perps | `233.84.178.15` | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `edge-hyper-xyz-mbo` | Full order-by-order book for trade.xyz perps | `233.84.178.15` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `edge-hyper-hl-orderintent` | Pre-consensus order, cancel, and modify submissions for Hyperliquid perps | `233.84.178.19` | [order-intent](https://github.com/malbeclabs/edge-feed-spec/blob/main/order-intent/spec.md) |

Book feeds (TOB / MBO for Hyperliquid and trade.xyz) share `233.84.178.15`. Order-Intent uses `233.84.178.19`. Several publisher streams can share a group address on different ports; bind the ports for the stream you want.

Typical port layout (confirm live values before binding):

| Port set | TOB mktdata | TOB refdata | MBO mktdata | MBO refdata | MBO snapshot |
|----------|-------------|-------------|-------------|-------------|--------------|
| A | `9601` | `9602` | `10601` | `10602` | `10603` |
| B | `9801` | `9802` | `10801` | `10802` | `10803` |
| C | `9101` | `9102` | `10101` | `10102` | `10103` |
| D | `9901` | `9902` | `10901` | `10902` | `10903` |
| E | `9501` | `9502` | `10501` | `10502` | `10503` |
| F | `9001` | `9002` | `10001` | `10002` | `10003` |
| G | `9301` | `9302` | `10301` | `10302` | `10303` |
| H | `9701` | `9702` | `10701` | `10702` | `10703` |
| I | `9201` | `9202` | `10201` | `10202` | `10203` |
| J | `9401` | `9402` | `10401` | `10402` | `10403` |

Order-Intent ports on `233.84.178.19`:

| Port set | OI mktdata | OI refdata |
|----------|------------|------------|
| A | `11001` | `11002` |
| B | `11201` | `11202` |

Frames are little-endian fixed-size binary, at most **1,232** bytes per UDP datagram. Mainnet Top-of-Book and Market-by-Order frames typically use `source_id=1`; Market-by-Order frames use `channel_id=1`.

---

## Decode the feed

!!! note "Edge Connect"
    If you’re using `doublezero-edge-connect`, the feed is already decoded as JSON over WebSocket — skip manual decoding.

**Use a reference parser**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) ships multicast subscribers that decode the wire format and republish it as JSON on a Unix socket:

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) for Top-of-Book & Trades
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) for Market-by-Order

See the [main README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines) for the full pipeline.

**Write your own decoder**

Decode against [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Start with the frame header, then the message layouts for the feed you are receiving.

**GRE Tunnel Header — XDP**

Market-data traffic delivered over the network is GRE-encapsulated at the last mile. On `doublezero1`, the client presents plain UDP multicast. If you terminate GRE yourself (e.g. an XDP pipeline), strip the GRE header before feeding data into your decoder. See [`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap).

---

## Troubleshooting

If you run into an issue not covered here, please reach out over your existing channel before working around it. If you do not have a channel, see [Support](support.md).

**Ensure your client is up to date**


```bash
sudo apt update && sudo apt install doublezero
```

**Tunnel not coming up**


1. Verify the daemon is running: `sudo systemctl status doublezerod`
2. Verify firewall rules are in place (GRE, BGP, PIM, Hyperliquid UDP ports on `doublezero1`, port 44880 on `doublezero0`)
3. Confirm the invoice for this seat is paid and the start date has passed
4. Run `doublezero connect multicast --subscribe-feed <feed>` on the machine that holds the assigned private key
5. Check your connection status: `doublezero status`

The DoubleZero ID used on the accounts page must match the key on this host.

**No packets after subscribe**


1. Confirm you are subscribed: `doublezero user list`
2. Confirm the feed appears under your groups: `doublezero multicast group list`
3. Capture on the tunnel, e.g. book data: `sudo tcpdump -ni doublezero1 host 233.84.178.15`
4. For Order-Intent: `sudo tcpdump -ni doublezero1 host 233.84.178.19`
5. Verify you are binding the correct port set for the publisher stream you want

**Seat expired or removed**


Seats are monthly. If the invoice sent before expiry is not paid, the seat is removed and the tunnel will not stay up.

**"Multicast user already exists"**


You already have an active subscription through a different path. Disconnect first with `doublezero disconnect`, then retry `doublezero connect multicast --subscribe-feed <feed>`.

**AWS-specific**


Disable the source/destination check on the instance’s ENI. Without this, GRE-encapsulated multicast may be dropped.
