---
description: LLM-oriented runbook — buy a Phoenix feed, install Edge Connect, subscribe, and verify decoded quotes on the WebSocket. Served to the MCP via GitHub raw; not published on the docs site.
---

# Phoenix + Edge Connect — runbook

!!! tip "Let an AI walk you through this page"
    You do not need to run every command yourself. This page is written so an AI assistant can follow it with you.

    1. Connect the [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`) so the agent can load this runbook itself via `get_onboarding_runbook`.
    2. Tell it your Linux host (or how to SSH to it), where your access secret lives (`DZ_SECRET`: a `DZ_…` token or the path to your keypair file), and what you want — for example: *install Edge Connect and subscribe to Phoenix TOB*.
    3. Paste back any errors it asks for. It should follow the steps below in order.

    Prefer to do it by hand? Start at [Prerequisites](#prerequisites).

**Not this page:** choosing between Edge Connect and native multicast — start at the [Phoenix getting started](phoenix.md) page. Raw wire decode — path 2 on that page and [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). WebSocket contract — [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

**What success looks like:** the tunnel shows `BGP Session Up`, you are subscribed to at least one Phoenix group, the bridge is listening on `ws://<host>:8081`, and (when the publisher is live) you see `instrument` / `quote` (or `book`) / `trade` JSON messages with `"source_name":"PHOENIX"` and `"source_id":2`.

---

## Prerequisites

| Need | Notes |
|------|--------|
| Linux/amd64 host | Installer target. |
| Public IP on the host | Must match the IP authorized when the feed / access pass was issued (or the any-IP `0.0.0.0` pass). The connect inside the container detects its own IP. `DZ_CLIENT_IP` only changes the IP the installer's access-pass pre-check uses; it does not help behind NAT. |
| Access secret (`DZ_SECRET`) | A `DZ_…` token **or** path to the Solana keypair JSON that owns the access pass / feed purchase. |
| Account credits | The identity in `DZ_SECRET` must have available DoubleZero credits. `Insufficient balance` means recharge that account before connect can succeed. |
| Purchased Phoenix feed | Buy at [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) before expecting traffic. TOB is $50 / month, MBP is $100 / month. |
| GRE (IP proto 47) allowed | Cloud SG / firewall. On AWS, disable ENI source/dest check. |
| UDP `9201`–`9213` inbound on `doublezero1` | `9201`/`9202` TOB market/reference; `9211`/`9212`/`9213` MBP market/reference/snapshot. |

The installer may print `!! No access pass… Continuing` and still exit 0. That is **not** connected. Look for `Access pass OK` and a later `BGP Session Up`. Treat `disconnected` + `Insufficient balance` / missing pass as a hard stop.

Firewall sketch (after the tunnel exists, `doublezero1` is present):

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 9201:9213 -j ACCEPT
```

---

## Feed map

| Feed code | Group code | Kind | Multicast group | Market | Reference | Snapshot |
|-----------|------------|------|-----------------|--------|-----------|----------|
| `phoenix-tob` | `edge-phoenix-tob` | TOB | `233.84.178.24` | `9201` | `9202` | — |
| `phoenix-mbp` | `edge-phoenix-mbp` | MBP | `233.84.178.25` | `9211` | `9212` | `9213` |

Subscribe with the **feed code**. `doublezero status` reports the **group code**. Channel `1` on every port, Source ID `2`. More than one publisher sends each feed on the same group, channel, and ports; Edge Connect arbitrates between them, so WebSocket clients see one copy. Both feeds come from the same publisher process: same instrument IDs, and the MBP market port carries the same trade prints as TOB.

Confirm the live group IP for your env:

```bash
docker exec doublezero-edge-connect doublezero multicast group get --code edge-phoenix-tob
```

**Edge Connect note:** the bridge activates a receiver when a group **code** in its feed registry matches what `doublezero status` reports. A code that does not match fails **silently**: no receiver, nothing on the WebSocket. The image downloads its registry at startup from `DZ_FEED_REGISTRY_URL` (`https://get.doublezero.xyz/feeds/doublezero-edge-feeds-latest.json`) and falls back to its built-in copy only if the download fails or the file is rejected, so the hosted file, not the image version, decides which codes activate. Check which registry loaded:

```bash
docker logs doublezero-edge-connect 2>&1 | grep 'feed registry resolved'
```

If `origin` starts with `url https://get.doublezero.xyz`, the hosted file is in use and must list the Phoenix codes — this must not print `0`:

```bash
curl -fsSL https://get.doublezero.xyz/feeds/doublezero-edge-feeds-latest.json | grep -c edge-phoenix
```

If `origin` starts with `built-in`, the download failed or the file was rejected, and the image’s own list is in use.

A wrong group IP in the registry does not stop activation; the receiver starts and warns `no market data; … rejoining`.

---

## Steps

### 1. Install Edge Connect

`DZ_SECRET` is the identity that holds your Edge access pass / purchased feed. Set it to either:

- a **`DZ_…` access token** you were issued, or
- the **path to a Solana keypair JSON** (the same keypair authorized onchain for this host’s public IP, or for the any-IP `0.0.0.0` pass).

```bash
# example: keypair file
curl -fsSL https://get.doublezero.xyz/connect | \
  DZ_SECRET=/path/to/keypair.json DZ_FEEDS=PHOENIX DZ_ASSUME_YES=1 bash
```

The variables must come **after the pipe**, on `bash`. Placed before `curl`, they only reach `curl`: without a TTY the installer exits with `No secret provided`, and with one it prompts for the secret and ignores `DZ_FEEDS` and `DZ_ASSUME_YES`.

What this does: prep host (Docker, `tun`/`ip_gre`, `rmem_max`) → run `doublezero-edge-connect` container (`--network host`) → run `doublezero connect multicast` inside it → serve WS on `:8081` when a **market-data** subscription is active.

Watch the installer for `Access pass OK` and `Joined feed(s): …`. `Joined feed(s)` lists only the purchased feeds joined in the chosen metro with a free seat. Other purchased feeds print `Skipped…`, and a re-run prints `Already joined`. Do not assume Top of Book (`edge-phoenix-tob`) unless it was joined.

A `⚠️` on **Lowest Latency Device** while **Current Device** is another metro is normal when the feed is only served from that metro. Do not pass `--device` to the closer site unless you know the feed is provisioned there — you will get *feed is not provisioned on the access pass* / *is served from that metro*.

### 2. Ensure the Phoenix group is subscribed

Prefer the feed the installer already joined. If status already shows `S:edge-phoenix-…`, skip this step.

Only if a purchased feed is missing from `doublezero status`, join it. A bare connect joins every purchased feed (client v0.35.0 or later):

```bash
docker exec doublezero-edge-connect doublezero connect multicast
```

Or name feeds by **feed code** (`phoenix-tob`, `phoenix-mbp`):

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed phoenix-tob phoenix-mbp
```

Do not use the per-metro feed **name** (such as `phoenix-tob-cmh`, fails with `feed … not found`) or `--subscribe <group code>` (on an Edge seat pass it fails with `A Feed account is required for this EdgeSeat access pass` on the first connect, and with `You are not allowed to execute this action` once the user exists, unless an admin added the group to the pass’s allowlist).

A feed code you have not bought fails with `feed <address> is not provisioned on the access pass`. With no feeds bought at all, a bare connect prints `The AccessPass has no authorized multicast groups; nothing to connect to.`

### 3. Verify tunnel + subscription

```bash
docker exec doublezero-edge-connect doublezero status
```

Expect: `BGP Session Up`, and your Phoenix group(s) listed (e.g. `S:edge-phoenix-mbp`).

If status is `Pending BGP Session` for more than ~30s, wait. If it becomes **`Network Unreachable`** (outer GRE / `Tunnel Dst` may still ping), you likely have a leftover tunnel from a previous attempt:

```bash
docker exec doublezero-edge-connect doublezero disconnect multicast
sudo ip link del doublezero1 2>/dev/null || true
docker exec doublezero-edge-connect doublezero connect multicast
```

Re-run `doublezero status`. Expect `BGP Session Up` and `S:edge-phoenix-…`.

```bash
docker exec doublezero-edge-connect doublezero status --json
```

Check that the reconciler activated the Phoenix receiver. The line is logged **once**, at activation, so search the whole log rather than a recent window:

```bash
docker logs doublezero-edge-connect 2>&1 | grep -iE 'activating market-data receiver|phoenix'
```

Activation can lag the tunnel by one refresh (default 30s). BGP Up + no activation line yet is not a failure — wait, then check again. Still nothing ⇒ group code mismatch (old image) or feed not purchased. The WebSocket in steps 4–5 is the final check.

### 4. Open the WebSocket

Default bind: `0.0.0.0:8081` (plain `ws://`, no TLS).

```bash
npx wscat -c ws://127.0.0.1:8081
```

Optional filter (after connect):

```json
{"method":"subscribe","subscription":{"source_name":"PHOENIX"}}
```

(`source_name` is matched case-insensitively. The deprecated `venue` key still works — see PROTOCOL.md.)

With no subscription message you get the firehose of every active venue on this host.

### 5. Confirm data path

| Check | Healthy signal |
|-------|----------------|
| WS accepts TCP | Connect succeeds; optional subscribe ack |
| Instruments | `{"type":"instrument",...,"source_name":"PHOENIX","source_id":2,...}` after connect (when refdata has been seen) |
| Quotes / book | `quote` (TOB) or `book` (MBP) with `"source_name":"PHOENIX"` |
| Trades | `trade` with `"source_name":"PHOENIX"` on either feed |
| Quiet market | Heartbeats / refdata may flow without quotes; do not treat “no quote yet” alone as a tunnel failure |

Capture on the tunnel (optional):

```bash
sudo tcpdump -ni doublezero1 host 233.84.178.24 and udp
```

Replace the group IP with the row you subscribed (`233.84.178.25` for MBP).

---

## Gotchas

1. **Buy before subscribe.** No purchase ⇒ tunnel can look fine, UDP stays empty.
2. **Silent non-activation.** A group code missing from the bridge registry ⇒ no receiver, no WS market data, little noise. Diff `doublezero status --json` groups vs the bridge feed registry. Check which registry loaded and whether it lists `edge-phoenix-*` (see the Edge Connect note under [Feed map](#feed-map)).
3. **Host `doublezerod` vs container.** Edge Connect uses host networking and its own daemon. A host-level `doublezerod` holds UDP port `44880`, which the container’s daemon also binds, so the container’s daemon exits right after starting. The installer offers to stop and disable the host daemon (without asking under `DZ_ASSUME_YES=1`).
4. **WS only with market-data subscription.** Shreds-only (or no market feed) ⇒ no `:8081` service by design.
5. **Ports.** Firewall must allow `9201:9213` on `doublezero1`, not only GRE. Decapsulated UDP re-enters `INPUT` on the tunnel iface.
6. **Installer exit 0 ≠ tunnel up.** A failed or pending connect prints `NOT CONNECTED` or `Not connected yet`, and the installer still exits 0. Trust `doublezero status`, not the exit code.
7. **Feed metro ≠ closest device.** Edge Connect attaches to the metro that serves the purchased feed. Forcing `--device` at the lowest-latency site fails if that metro does not serve the feed. The constraint is the **device**, not where the host sits (a host far from the serving metro can still attach to that device).
8. **Stale `doublezero1`.** `tunnel already exists`, mixed `169.254.x` addresses, or BGP TCP never establishing to the inner peer → disconnect, delete the iface, connect again. Do not stack a second GRE on a dirty iface.
9. **Tick ≠ exponent.** `10^price_exponent` is the price precision, not the tick. BTC on Phoenix is exponent `-2` with `tick_size` `100` (moves in dollars). Round orders to `tick_size × 10^price_exponent`.
10. **Feed code, not name or group code.** `--subscribe-feed phoenix-tob`, not `phoenix-tob-cmh` and not `--subscribe edge-phoenix-tob`.
11. **Never `docker rm -f` / `docker kill` the bridge.** `SIGKILL` skips the disconnect the entrypoint runs on `docker stop`, orphaning the onchain session and `doublezero1` in the host netns — gotcha 8, self-inflicted. See [Teardown](#teardown).

---

## Minimal consumer sketch

```text
1. TCP connect ws://HOST:8081
2. (optional) send {"method":"subscribe","subscription":{"source_name":"PHOENIX"}}
3. On message: ignore unknown types; key books on (source_id, channel, instrument_id), not symbol alone
4. Quote prices and sizes are already decimal. The tradable tick is tick_size × 10^price_exponent
   (BTC: 100 × 10^-2 = 1.00); tick_size alone is a raw fixed-point value
```

Full field list: [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## Teardown

`docker stop` **is** the uninstall. The entrypoint stays PID 1 so its `TERM` trap can run a bounded `doublezero disconnect` while the daemon is still up, releasing the onchain session, the GRE tunnel and its routes. The installer creates the container with `--stop-timeout 60`, which is what gives that disconnect room to finish.

```bash
docker stop doublezero-edge-connect
docker rm doublezero-edge-connect
```

Confirm the tunnel actually came down. The bridge ran with `--network host`, so a disconnect that did not happen leaves the iface orphaned on the host. Expect `Device "doublezero1" does not exist.`:

```bash
ip link show doublezero1
```

If it is still there, the previous session was not released — delete the iface and treat the onchain session as still held.

The `doublezero-edge` CLI (if you installed it) versions independently of the bridge and is removed separately. Neither removal touches the Cloudsmith repo config, which is a normal `apt`/`dnf` source file:

```bash
sudo apt remove doublezero-edge   # or: sudo dnf remove doublezero-edge
```

---

## See also

- [Phoenix Edge Subscriber Connection](phoenix.md) — native client, firewall detail, wire format
- [get.doublezero.xyz/connect](https://get.doublezero.xyz/connect) — installer
- [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) — bridge source + PROTOCOL.md
