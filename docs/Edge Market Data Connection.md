---
description: Run doublezero-edge-connect to re-forward Solana shreds to a local UDP port and consume normalized Edge market data over a local WebSocket.
---

# Edge Connection

!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol). The data is for your internal purposes only and may not be retransmitted (see Section 2(e))."

`doublezero-edge-connect` is a bridge that joins the **DoubleZero Edge binary multicast** and re-serves it locally as two feeds:

1. **Solana shred forwarding** — deduplicated (optionally signature-verified) shreds fanned out to one or more local UDP destinations, ready for your validator or RPC.
2. **Normalized market data** — Edge venue feeds decoded, precision-corrected, and re-served as a single JSON WebSocket on `ws://host:8081`.

Both run from the same container and the same one-line install. Enable whichever feeds your onchain authorization grants.

```
                                        ┌─ UDP datagrams ──▶  validator / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binary)             (dedup · decode · normalize)  └─ WebSocket (JSON) ──▶  trading engine
                                                          ws://host:8081
```

---

## Requirements

- **Linux/amd64** host with a public IPv4 address authorized onchain for the target environment.
- **Docker** (the one-liner installs it if missing).
- **GRE connectivity** — allow IP protocol 47 at your cloud provider; on AWS disable the ENI source/dest check.
- A **DoubleZero access secret**: a `DZ_`-prefixed base64 token or a path to a keypair file, obtained from the [DoubleZero onboarding](setup.md) process.

---

## Step 1: Install and Run

One command prepares the host and starts the bridge container. It joins the DoubleZero network and starts every feed your authorization grants — shred forwarding and/or the market-data WebSocket on `:8081`:

=== "Mainnet-beta"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect | bash
    ```

=== "Testnet"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect-testnet | bash
    ```

=== "Devnet (private)"

    ```bash
    # Requires a GHCR token with read:packages
    DZ_GHCR_TOKEN=<your-token> curl -fsSL https://get.doublezero.xyz/connect-devnet | bash
    ```

What the script does:

1. Checks that the host is Linux/amd64, ensures Docker is present (offers to install it).
2. Prepares the host kernel for the GRE tunnel: loads `tun`/`ip_gre`, raises `net.core.rmem_max`, warns about firewall and cloud-provider rules.
3. Loads your access secret (prompted once if `DZ_SECRET` is not set).
4. Runs the bridge container (`--network host`, `NET_ADMIN`/`NET_RAW`, `/dev/net/tun`) and executes `doublezero connect multicast`.

!!! tip "Non-interactive install"
    Set `DZ_SECRET=DZ_…` before the pipe to run completely unattended — no prompts at all.

---

## Step 2: Configure

All configuration is via **environment variables set before the pipe**. There is no config file.

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### Installer variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `DZ_SECRET` | *(prompted)* | `DZ_`-prefixed base64 token **or** path to a keypair file. A token is injected into the container and never written to disk; a file is bind-mounted read-only. |
| `DZ_ENV` | per script | `mainnet-beta` \| `testnet` \| `devnet`. |
| `DZ_IMAGE` | per script | Override the container image. |
| `DZ_NAME` | `doublezero-edge-connect` | Container name. |
| `DZ_FEEDS` | *(all)* | Comma-separated venues to narrow market-data ingestion (e.g. `VenueA,VenueB`). Does not affect Solana shred forwarding. |
| `DZ_ASSUME_YES` | `0` | Skip confirmation prompts (e.g. the Docker install prompt). |
| `DZ_GHCR_TOKEN` | — | **Devnet only** — a GHCR token with `read:packages` (devnet image is private). |
| `DZ_GHCR_USER` | `malbeclabs` | **Devnet only** — GHCR username for the login. |

### Bridge variables

The installer forwards **any non-empty** bridge variable straight through to the container. Common ones:

| Variable | Default | Purpose |
|----------|---------|---------|
| `DZ_IFACE` | `doublezero1` | Network interface to listen on. |
| `DZ_RECV_BUF` | — | UDP receive buffer override (bytes). |
| `METRICS_BIND` | *(empty / off)* | Enable the Prometheus `/metrics` endpoint (e.g. `127.0.0.1:9090`). |
| `RUST_LOG` | `info` | Log level (`debug`, `warn`, etc.). |
| `DZ_SHRED_FORWARD` | — | Local UDP destination(s) for forwarded shreds — see [Solana Shred Forwarding](#solana-shred-forwarding). |
| `WS_BIND` | `0.0.0.0:8081` | Market-data WebSocket bind address — see [Market Data WebSocket](#market-data-websocket). |
| `WS_MAX_CLIENTS` | `64` | Maximum concurrent WebSocket clients. |
| `WS_INPUT_COINS` | *(empty / off)* | Enable the public WebSocket backstop for listed symbols (e.g. `BTC,ETH`). |

**Examples:**

```bash
# Forward shreds to a local validator/RPC:
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# Non-interactive, testnet:
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# Narrow market data to specific venues, verbose logging, non-default WS port:
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# Enable metrics and a public WS backstop:
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    Because the installer only forwards **non-empty** values, you cannot pass an empty override (e.g. `WS_BIND=""` to disable the WebSocket sink) through the one-liner. Use a hand-written `docker run` for that — see [Self-hosting](#advanced-self-hosting).

---

## Solana Shred Forwarding

The bridge joins the `edge-solana-*` shred multicast groups and fans each datagram to one or more local UDP destinations — feeding your validator or RPC directly off the Edge network. It activates automatically on discovery when those groups are present in your authorization.

```bash
# Default (dedup-only, forward to local port 20000):
DZ_SHRED_FORWARD=127.0.0.1:20000 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# With signature verification:
DZ_SHRED_DEDUP_MODE=sigverify \
  DZ_SHRED_RPC_URL=https://api.mainnet-beta.solana.com \
  DZ_SHRED_FORWARD=127.0.0.1:20000 \
  DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | Destination(s) for forwarded shreds (repeatable). |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup` (one copy per shred), `sigverify` (+ ed25519 verification), `none` (all datagrams). |
| `DZ_SHRED_RPC_URL` | — | Solana RPC endpoint; required by `sigverify` mode. |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | Size of the dedup window. |

See [Shred forwarding](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md) for the full pipeline and caveats.

---

## Market Data WebSocket

Open a WebSocket to `ws://<host>:8081` and read JSON frames. You receive all venues you are authorized for. An optional `subscribe` message narrows the stream to specific venues and symbols.

Any engine that speaks WebSocket + JSON can consume it with a thin (~50–100 line) adapter. The binary multicast, the two-port per-venue split, and the manifest/precision handshake all stay inside the bridge; the only contract a consumer codes against is the WebSocket JSON.

### Connection lifecycle

On each new connection the bridge:

1. **Replays current instrument definitions** — one `instrument` message per known symbol — so the consumer has precision before the first quote.
2. **Replays the latest depth snapshot** per symbol (if the Market-by-Order feed is active).
3. **Streams** `quote` / `trade` / `midpoint` / `depth` messages as they arrive, fanned out to all connected consumers.

```
connect → instrument (×N) → depth (×M, latest books) → quote → trade → depth → …
```

### Message types

Every message is a JSON object tagged by a `type` field:

| `type` | Meaning |
|--------|---------|
| `instrument` | Instrument/precision definition. |
| `quote` | Top-of-book update (full state). |
| `trade` | Trade print (last sale). |
| `midpoint` | Derived mid price. |
| `depth` | Full order-book depth snapshot. |
| `status` | Venue-level feed-health transition. |

Consumers **must ignore unknown `type` values and unknown fields** (forward compatibility).

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

Sent on connect and whenever definitions change. `price_exponent` and `qty_exponent` give the venue's tick size and size step as powers of ten.

#### `quote`

```json
{
  "type": "quote",
  "venue": "ExampleVenue",
  "symbol": "SOL",
  "bid": 184.20, "ask": 184.21,
  "bid_size": 12.5, "ask_size": 8.0,
  "bid_n": 3, "ask_n": 2,
  "source_ts_ns": 1781019263715344015,
  "recv_ts_ns":   1781019263715501230,
  "kernel_rx_ts_ns": 1781019263715300010,
  "ws_send_ts_ns":   1781019263715600440
}
```

Every `quote` is **full state** — a dropped message self-heals on the next quote, no resync needed. The four timestamps decompose end-to-end latency:

```
source_ts_ns → kernel_rx_ts_ns → recv_ts_ns → ws_send_ts_ns → (consumer recv)
  venue book      wire arrival      post-decode    WS hand-off
```

`0` is the sentinel for "not available" — treat it as missing, not as 1970.

#### `trade`

```json
{
  "type": "trade",
  "venue": "ExampleVenue", "symbol": "SOL",
  "price": 184.20, "size": 3.5,
  "aggressor_side": "buy",
  "trade_id": 987654, "cumulative_volume": 12500.0,
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

`aggressor_side` is `"buy"`, `"sell"`, or `"unknown"`. Trades are point-in-time events and are not replayed on reconnect.

#### `depth`

```json
{
  "type": "depth",
  "venue": "MboVenue", "symbol": "SOL",
  "bids": [[184.20, 12.5], [184.19, 4.0]],
  "asks": [[184.21, 8.0], [184.22, 6.5]],
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

`bids` are sorted highest price first; `asks` are sorted lowest price first. Each `depth` is a **full snapshot** — replace, do not merge.

#### `status`

```json
{"type":"status","venue":"ExampleVenue","state":"down","stale_ms":30000,"ts_ns":...}
```

Emitted on the edge when a venue's quote multicast goes silent (`state:"down"`) or recovers (`state:"ok"`). Use it to gray out a venue in your UI. Quote delivery is not gated on status — the feed self-heals on the next quote.

### Subscriptions

By default you receive everything. Send a control message to narrow the stream:

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Omitting a field matches any value (`{"symbol":"SOL"}` = SOL on every venue). `venue` is matched case-insensitively.

**Server acknowledgement:**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Errors return `{"channel":"error","error":"<reason>"}`.

### Heartbeat and liveness

- The server sends a **WebSocket Ping** every 20 seconds; compliant clients auto-reply Pong.
- Clients silent for 60 seconds are closed and reaped.
- App-level keepalive: `{"method":"ping"}` → `{"channel":"pong"}`.

### Consumer skeleton

```python
import json, websocket

def on_message(ws, frame):
    msg = json.loads(frame)
    t = msg.get("type")
    if t == "instrument":
        register_instrument(msg["venue"], msg["symbol"],
                            msg["price_exponent"], msg["qty_exponent"])
    elif t == "quote":
        on_top_of_book(msg["venue"], msg["symbol"],
                       msg["bid"], msg["ask"],
                       msg["bid_size"], msg["ask_size"])
    elif t == "trade":
        on_trade(msg["venue"], msg["symbol"],
                 msg["price"], msg["size"], msg["aggressor_side"])
    elif t == "depth":
        replace_book(msg["venue"], msg["symbol"],
                     msg["bids"], msg["asks"])
    # unknown types: silently ignore (forward compatibility)

ws = websocket.WebSocketApp("ws://localhost:8081", on_message=on_message)
ws.run_forever()
```

### Input sources and the WebSocket backstop

The Edge multicast feed is always-on. An optional **public WebSocket backstop** can fill gaps when the Edge feed stalls:

```bash
# Enable the backstop for BTC and ETH:
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

The two sources race per `(venue, symbol, source_ts)` tick inside a shared arbiter. In steady state the Edge source wins (sub-ms vs. tens of ms over the internet); when the Edge gaps, the public copy fills in. The WebSocket output is identical regardless of which source delivered a given update.

---

## Manage the Container

```bash
# Stream logs
sudo docker logs -f doublezero-edge-connect

# Check tunnel status
sudo docker exec -it doublezero-edge-connect doublezero status

# Check device latencies
sudo docker exec -it doublezero-edge-connect doublezero latency

# Stop and remove
sudo docker stop doublezero-edge-connect && sudo docker rm doublezero-edge-connect
```

!!! note "No TLS"
    The bridge targets a trusted/local network. Terminate TLS at a reverse proxy if you expose the WebSocket endpoint externally.

---

## Monitoring (Prometheus Metrics)

The metrics endpoint is **off by default**. Enable it with `METRICS_BIND`:

```bash
METRICS_BIND=127.0.0.1:9090 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

Then scrape:

```bash
curl -s localhost:9090/metrics | grep '^dz_'
```

Key metrics:

| Metric | What it tracks |
|--------|---------------|
| `dz_feed_up{venue}` | `1` while that venue's multicast is live, `0` while silent. |
| `dz_datagrams_received_total{venue}` | Ingest volume per venue. |
| `dz_emit_total{venue,kind}` | Messages broadcast after dedup, by type. |
| `dz_quotes_dropped_total{venue}` | Stale/duplicate quotes suppressed. |
| `dz_ws_clients` | Currently connected WebSocket clients. |
| `dz_ws_messages_sent_total{kind}` | Messages forwarded to clients. |
| `dz_ws_client_lagged_total` | Times a slow client was shed to protect the feed. |

A `GET /healthz` liveness probe is also served on the same bind address.

---

## Advanced: Self-hosting

The container is available on GHCR:

| Environment | Image | Tag |
|-------------|-------|-----|
| Mainnet-beta | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:mainnet-beta` |
| Testnet | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:testnet` |
| Devnet (private) | `ghcr.io/malbeclabs/doublezero-edge-connect-devnet` | `:latest` |

Run it by hand (required for options the installer can't forward, like `WS_BIND=""`):

```bash
docker run --rm --network host --cap-add NET_ADMIN --device /dev/net/tun \
  -e DZ_SECRET=DZ_… \
  -e DZ_SHRED_FORWARD=127.0.0.1:20000 \
  -e WS_BIND=0.0.0.0:8081 \
  -e METRICS_BIND=127.0.0.1:9090 \
  ghcr.io/malbeclabs/doublezero-edge-connect:mainnet-beta
```

**Build from source:**

```bash
git clone https://github.com/malbeclabs/doublezero-edge-connect
cd doublezero-edge-connect
cargo build --release
cargo test

./target/release/doublezero-edge-connect \
  --iface doublezero1 \
  --ws-bind 0.0.0.0:8081
```

A larger kernel receive buffer is recommended for bursty feeds:

```bash
sudo sysctl -w net.core.rmem_max=268435456
```

---

## Limits and Backpressure

| Limit | Default | Behavior when exceeded |
|-------|---------|------------------------|
| Concurrent clients (`WS_MAX_CLIENTS`) | 64 | New connection is rejected. |
| Subscriptions per client (`WS_MAX_SUBS`) | 256 | `subscribe` is refused with an error. |
| Inbound control msgs / client / min (`WS_MAX_INBOUND_PER_MIN`) | 600 | Client is disconnected. |
| Broadcast buffer (`WS_BROADCAST_CAPACITY`) | 4096 | A slow client **drops the oldest messages** (never stalls the feed). |

Because every `quote` and `depth` is full state, a consumer that drops messages under backpressure self-heals on the next message — no resync handshake required.

---

## Troubleshooting

### No shreds arriving at the local port

- Confirm your access is authorized for the `edge-solana-*` shred groups onchain.
- Verify the tunnel is up: `sudo docker exec -it doublezero-edge-connect doublezero status`
- Check logs for join errors: `sudo docker logs -f doublezero-edge-connect`
- Confirm `DZ_SHRED_FORWARD` points at a reachable local UDP destination.

### No messages from a venue

- Verify the tunnel is up: `sudo docker exec -it doublezero-edge-connect doublezero status`
- Check logs for join errors: `sudo docker logs -f doublezero-edge-connect`
- Confirm your access is authorized for that venue onchain.
- Narrow ingestion to that venue with `DZ_FEEDS=<VenueName>` to isolate the issue.

### WebSocket connects but no quotes arrive

- The `instrument` messages always arrive first; quotes follow once the reference-data handshake completes. Wait 10–20 seconds after connect before concluding data is missing.
- Check `dz_feed_up{venue}` in metrics — `0` means the multicast is silent on your host.
- Verify firewall rules allow multicast UDP on the `doublezero1` interface.

### High `dz_ws_client_lagged_total`

Your consumer is reading slower than the bridge is publishing. Increase the broadcast buffer with `WS_BROADCAST_CAPACITY`, reduce per-message processing time, or add a dedicated reader thread.

### Container exits immediately

- The bridge requires `--network host` and the `/dev/net/tun` device; a plain `docker run` without those flags will fail.
- Use the installer one-liner or the exact `docker run` command shown in [Self-hosting](#advanced-self-hosting).

### GRE tunnel not establishing

Refer to [Troubleshooting](troubleshooting.md) and ensure IP protocol 47 is permitted at your cloud provider. On AWS, disable the ENI source/dest check for the host.
