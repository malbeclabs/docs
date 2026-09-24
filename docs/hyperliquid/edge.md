---
description: "Subscribe to Hyperliquid market data on DoubleZero Edge — setup, metro, feed request, and connect after approval."
---

# Subscribe to Hyperliquid (Edge)

!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol). Please note that the data is for your internal purposes only and may not be retransmitted (see Section 2(e))."

The Hyperliquid feeds deliver market data over DoubleZero Edge as UDP multicast. Four core feeds cover Hyperliquid native perps (`hl`) and [trade.xyz](https://trade.xyz) perps (`xyz`):

| Feed | Description |
|------|-------------|
| `edge-hyper-hl-tob` | Best bid/offer and trade prints for Hyperliquid perps |
| `edge-hyper-hl-mbo` | Full order-by-order book for Hyperliquid perps (adds, cancels, executions) |
| `edge-hyper-xyz-tob` | Best bid/offer and trade prints for trade.xyz perps |
| `edge-hyper-xyz-mbo` | Full order-by-order book for trade.xyz perps (adds, cancels, executions) |

Service overview: [Hyperliquid](index.md).

## Which path should I take?

| Mode | What you get | When to use |
|------|----------------|-------------|
| **Native multicast** | Subscribe on `doublezero1`, decode binary UDP yourself (or with reference parsers) | Default for full control |
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — decode + normalized JSON WebSocket | Fastest to a usable quote stream |

For Edge Connect, finish subscription and connect on the host first, then run the container instead of decoding by hand.

Want an AI to do the install with you? Connect the [DoubleZero MCP](../mcp.md) and ask it to walk you through Hyperliquid Edge.

---

## Step 1: DoubleZero Setup

**Complete Setup**


Follow the [setup](../setup.md) instructions to install and configure the DoubleZero client.

If you have previously set up DoubleZero, ensure the client is current:

```bash
sudo apt update && sudo apt install doublezero
```

**Configure the Firewall**


Allow GRE, BGP, PIM, and Hyperliquid feed traffic on `doublezero1`. Hyperliquid UDP ports sit in `20000`–`20999` (Top-of-Book and Market-by-Order market, reference, and snapshot). Open the full band so new feeds do not need another firewall change. See [Feed addresses](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid market / reference / snapshot (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 20000:20999 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Hyperliquid market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

You may tighten these rules to only the ports for the feeds you subscribe to (see [Feed addresses](#feed-addresses)).

---

## Step 2: Choose a metro

Identify the lowest-latency location from the machine that will receive the feed:

```bash
doublezero latency
```

Note the metro / city from the lowest-latency result. You will select that city on the application form. See the [topology map](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) for how metros are grouped.

**Pricing**


Feeds are priced by delivery region. The price follows where the data is delivered, not where the buyer is. A Tokyo package delivers to Tokyo receivers; delivery elsewhere needs the Global package. Two receiving hosts (IPs) are included per feed, per metro.

| Feed | Tokyo /mo | Global /mo |
| --- | --- | --- |
| Hyperliquid perps Top-of-Book (L1) | $900 | $1,500 |
| Hyperliquid perps Market-by-Order (L4) | $3,000 | $5,000 |
| trade.xyz perps Top-of-Book (L1) | $900 | $1,500 |
| trade.xyz perps Market-by-Order (L4) | $3,000 | $5,000 |
| **All feeds (bundle ~30% discount)** | **$5,500** | **$9,000** |

---

## Step 3: Submit Request

1. Go to [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Select **Hyperliquid** and the feeds you need.
3. Select the **city** (metro) you need. Use the table above and `doublezero latency` to choose.
4. Finish the application form.

You will assign a DoubleZero ID (existing key, or generate a new one) to each feed request on the [accounts](https://doublezero.xyz/shreds/account) page. The matching **private key must be present on the machine that will receive the feed** — do not assign a pubkey whose private key you cannot move to that host.

You pick a **metro** and a **pubkey**. You do **not** bind a public IP at application time. During the subscription you can move access between IPs **within the chosen metros**.

You will be contacted with more instructions in a timely manner (expect **1-3 business days**).

---

## Step 4: Connect after approval

After you submit the application, you will receive an invoice; once it is paid, you can connect on each approved machine. Subscribe to the feeds you purchased:

```bash
doublezero connect multicast --subscribe-feed <name_of_feed>
```

Multiple feeds, space-separated:

```bash
doublezero connect multicast --subscribe-feed edge-hyper-hl-tob edge-hyper-hl-mbo edge-hyper-xyz-tob edge-hyper-xyz-mbo
```

Access is enabled on your chosen start date. After access is provisioned, check the tunnel status with:

```bash
doublezero status
```

Expect `BGP Session Up` on the correct DoubleZero network.

---

## Billing

Seats are charged **monthly**. Watch the seat expiration date.

You need to pay the invoice before the seat expires. **Not paying leads to removal of the seat.**

---

## Feed addresses

IP picks the multicast group. Port picks the stream on that group. Check live values with:

```bash
doublezero multicast group list
```

| Feed | Description | Multicast group | Market | Reference | Snapshot | Spec |
|------|-------------|-----------------|--------|-----------|----------|------|
| `edge-hyper-hl-tob` | Best bid/offer and trade prints for Hyperliquid perps | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `edge-hyper-hl-mbo` | Full order-by-order book for Hyperliquid perps | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `edge-hyper-xyz-tob` | Best bid/offer and trade prints for trade.xyz perps | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `edge-hyper-xyz-mbo` | Full order-by-order book for trade.xyz perps | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

Each feed has its own multicast group address. Bind ports: reference = market + `1`; snapshot (MBO only) = market + `2`. Confirm live values with `doublezero multicast group list` before binding.

Frames are little-endian fixed-size binary, at most **1,232** bytes per UDP datagram. Hyperliquid native perps use `source_id=1`; trade.xyz perps use `source_id=7`.

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

If you run into an issue not covered here, please reach out over your existing channel before working around it. If you do not have a channel, see [Support](../support.md).

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
3. Capture on the tunnel, e.g. Hyperliquid TOB: `sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. Verify you are binding the correct market / reference / snapshot ports for the feed you want

**Seat expired or removed**


Seats are monthly. If the invoice sent before expiry is not paid, the seat is removed and the tunnel will not stay up.

**"Multicast user already exists"**


You already have an active subscription through a different path. Disconnect first with `doublezero disconnect`, then retry `doublezero connect multicast --subscribe-feed <feed>`.

**AWS-specific**


Disable the source/destination check on the instance’s ENI. Without this, GRE-encapsulated multicast may be dropped.
