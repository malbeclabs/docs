---
description: LLM-oriented runbook — buy a Kalshi feed, install Edge Connect, subscribe, and verify decoded quotes on the WebSocket. Served to the MCP via GitHub raw; not published on the docs site.
---

# Kalshi + Edge Connect — runbook

!!! tip "Let an AI walk you through this page"
    You do not need to run every command yourself. This page is written so an AI assistant can follow it with you.

    1. Connect the [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`) so the agent can load this runbook itself via `get_onboarding_runbook`.
    2. Tell it your Linux host (or how to SSH to it), where your access secret lives (`DZ_SECRET`: a `DZ_…` token or the path to your keypair file), and what you want — for example: *install Edge Connect and subscribe to Kalshi perps TOB*.
    3. Paste back any errors it asks for. It should follow the steps below in order.

    Prefer to do it by hand? Start at [Prerequisites](#prerequisites).

**Not this page:** choosing between Edge Connect and native multicast — start at the [Kalshi getting started](kalshi.md) page. Raw wire decode — path 2 on that page and [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). WebSocket contract — [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

**What success looks like:** the tunnel shows `BGP Session Up`, you are subscribed to at least one Kalshi group, the bridge is listening on `ws://<host>:8081`, and (when the publisher is live) you see `instrument` / `quote` (or `book`) JSON messages with `"source_name":"KALSHI"` and `"source_id":3`.

---

## Prerequisites

| Need | Notes |
|------|--------|
| Linux/amd64 host | Installer target. |
| Public IP on the host | Must match the IP authorized when the feed / access pass was issued (or the any-IP `0.0.0.0` pass). The connect inside the container detects its own IP. `DZ_CLIENT_IP` only changes the IP the installer's access-pass pre-check uses; it does not help behind NAT. |
| Access secret (`DZ_SECRET`) | A `DZ_…` token **or** path to the Solana keypair JSON that owns the access pass / feed purchase. |
| Account credits | The identity in `DZ_SECRET` must have available DoubleZero credits. `Insufficient balance` means recharge that account before connect can succeed. |
| Purchased Kalshi feed | Buy at [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) before expecting traffic. |
| GRE (IP proto 47) allowed | Cloud SG / firewall. On AWS, disable ENI source/dest check. |
| UDP `30000`–`59999` inbound on `doublezero1` | Leading digit = class (`3` market, `4` reference, `5` snapshot). Open the full band so new channels do not need another firewall change. |

The installer may print `!! No access pass… Continuing` and still exit 0. That is **not** connected. Look for `Access pass OK` and a later `BGP Session Up`. Treat `disconnected` + `Insufficient balance` / missing pass as a hard stop.

Firewall sketch (after the tunnel exists, `doublezero1` is present):

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```

---

## Feed map

| Feed code | Group code | Kind | Multicast group | Market | Reference | Snapshot |
|-----------|------------|------|-----------------|--------|-----------|----------|
| `kalshi-perps-tob` | `edge-kalshi-perps-tob` | TOB | `233.84.178.3` | `31000` | `41000` | — |
| `kalshi-perps-mbp` | `edge-kalshi-perps-mbp` | MBP | `233.84.178.4` | `32000` | `42000` | `52000` |
| `kalshi-sports-tob` | `edge-kalshi-sports-tob` | TOB | `233.84.178.17` | `33000`+id | `43000`+id | — |
| `kalshi-sports-mbp` | `edge-kalshi-sports-mbp` | MBP | `233.84.178.20` | `34000`+id | `44000`+id | `54000`+id |

Subscribe with the **feed code**. `doublezero status` reports the **group code**.

Confirm the live group IP for your env:

```bash
docker exec doublezero-edge-connect doublezero multicast group get --code edge-kalshi-perps-tob
```

**Edge Connect note:** the bridge activates a receiver when a group **code** in its feed registry matches what `doublezero status` reports. A code that does not match fails **silently**: no receiver, nothing on the WebSocket. A wrong group IP in the registry does not stop activation; the receiver starts and warns `no market data; … rejoining`.

---

## Steps

### 1. Install Edge Connect

`DZ_SECRET` is the identity that holds your Edge access pass / purchased feed. Set it to either:

- a **`DZ_…` access token** you were issued, or
- the **path to a Solana keypair JSON** (the same keypair authorized onchain for this host’s public IP, or for the any-IP `0.0.0.0` pass).

```bash
# example: keypair file
curl -fsSL https://get.doublezero.xyz/connect | \
  DZ_SECRET=/path/to/keypair.json DZ_FEEDS=KALSHI DZ_ASSUME_YES=1 bash
```

The variables must come **after the pipe**, on `bash`. Placed before `curl`, they only reach `curl`: without a TTY the installer exits with `No secret provided`, and with one it prompts for the secret and ignores `DZ_FEEDS` and `DZ_ASSUME_YES`.

If you omit `DZ_SECRET`, the installer prompts once. With it set, the install is non-interactive.

What this does: prep host (Docker, `tun`/`ip_gre`, `rmem_max`) → run `doublezero-edge-connect` container (`--network host`) → run `doublezero connect multicast` inside it → serve WS on `:8081` when a **market-data** subscription is active.

Watch the installer for `Access pass OK` and `Joined feed(s): …`. `Joined feed(s)` lists only the purchased feeds joined in the chosen metro with a free seat. Other purchased feeds print `Skipped…`, and a re-run prints `Already joined`. Do not assume Top of Book (`edge-kalshi-perps-tob`) unless it was joined.

A `⚠️` on **Lowest Latency Device** while **Current Device** is another metro is normal when the feed is only served from that metro. Do not pass `--device` to the closer site unless you know the feed is provisioned there — you will get *feed is not provisioned on the access pass* / *is served from that metro*.

### 2. Ensure the Kalshi group is subscribed

Prefer the feed the installer already joined. If status already shows `S:edge-kalshi-…`, skip this step.

Only if a purchased feed is missing from `doublezero status`, join it. A bare connect joins every purchased feed (client v0.35.0 or later):

```bash
docker exec doublezero-edge-connect doublezero connect multicast
```

Or name feeds by **feed code**, space-separated:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    kalshi-perps-tob kalshi-perps-mbp \
    kalshi-sports-tob kalshi-sports-mbp
```

Do not use the per-metro feed **name** (fails with `feed … not found`) or `--subscribe <group code>` (on an Edge seat pass it fails with `A Feed account is required for this EdgeSeat access pass` on the first connect, and with `You are not allowed to execute this action` once the user exists, unless an admin added the group to the pass’s allowlist).

A feed code you have not bought fails with `feed <address> is not provisioned on the access pass`. With no feeds bought at all, a bare connect prints `The AccessPass has no authorized multicast groups; nothing to connect to.`

### 3. Verify tunnel + subscription

```bash
docker exec doublezero-edge-connect doublezero status
```

Expect: `BGP Session Up`, and your Kalshi group(s) listed (e.g. `S:edge-kalshi-perps-mbp`).

If status is `Pending BGP Session` for more than ~30s, wait. If it becomes **`Network Unreachable`** (outer GRE / `Tunnel Dst` may still ping), you likely have a leftover tunnel from a previous attempt:

```bash
docker exec doublezero-edge-connect doublezero disconnect multicast
sudo ip link del doublezero1 2>/dev/null || true
docker exec doublezero-edge-connect doublezero connect multicast
```

Re-run `doublezero status`. Expect `BGP Session Up` and `S:edge-kalshi-…`.

```bash
docker exec doublezero-edge-connect doublezero status --json
```

Check that the reconciler activated the Kalshi receiver. The line is logged **once**, at activation, so search the whole log rather than a recent window:

```bash
docker logs doublezero-edge-connect 2>&1 | grep -iE 'activating market-data receiver|kalshi'
```

Activation can lag the tunnel by one refresh (default 30s). BGP Up + no activation line yet is not a failure — wait, then check again. Still nothing ⇒ group code mismatch or feed not purchased. The WebSocket in steps 4–5 is the final check.

### 4. Open the WebSocket

Default bind: `0.0.0.0:8081` (plain `ws://`, no TLS).

```bash
npx wscat -c ws://127.0.0.1:8081
```

Optional filter (after connect):

```json
{"method":"subscribe","subscription":{"source_name":"KALSHI"}}
```

(`source_name` is matched case-insensitively. The deprecated `venue` key still works — see PROTOCOL.md.)

With no subscription message you get the firehose of every active venue on this host.

### 5. Confirm data path

| Check | Healthy signal |
|-------|----------------|
| WS accepts TCP | Connect succeeds; optional subscribe ack |
| Instruments | `{"type":"instrument",...,"source_name":"KALSHI","source_id":3,...}` after connect (when refdata has been seen) |
| Quotes / book | `quote` (TOB) or `book` (MBP) with `"source_name":"KALSHI"` |
| Quiet market | Heartbeats / refdata may flow without quotes; do not treat “no quote yet” alone as a tunnel failure |

Capture on the tunnel (optional):

```bash
sudo tcpdump -ni doublezero1 host 233.84.178.3 and udp
```

Replace the group IP with the row you subscribed.

---

## Gotchas

1. **Buy before subscribe.** No purchase ⇒ tunnel can look fine, UDP stays empty.
2. **Silent non-activation.** A group code missing from the bridge registry ⇒ no receiver, no WS market data, little noise. Diff `doublezero status --json` groups vs the bridge feed registry.
3. **Host `doublezerod` vs container.** Edge Connect uses host networking and its own daemon. A host-level `doublezerod` holds UDP port `44880`, which the container’s daemon also binds, so the container’s daemon exits right after starting. The installer offers to stop and disable the host daemon (without asking under `DZ_ASSUME_YES=1`).
4. **WS only with market-data subscription.** Shreds-only (or no market feed) ⇒ no `:8081` service by design.
5. **Port band.** Firewall must allow `30000:59999` on `doublezero1`, not only GRE. Decapsulated UDP re-enters `INPUT` on the tunnel iface.
6. **Installer exit 0 ≠ tunnel up.** A failed or pending connect prints `NOT CONNECTED` or `Not connected yet`, and the installer still exits 0. Trust `doublezero status`, not the exit code.
7. **Feed metro ≠ closest device.** Edge Connect attaches to the metro that serves the purchased feed. Forcing `--device` at the lowest-latency site fails if that metro does not serve the feed. The constraint is the **device**, not where the host sits (a host far from the serving metro can still attach to that device).
8. **Stale `doublezero1`.** `tunnel already exists`, mixed `169.254.x` addresses, or BGP TCP never establishing to the inner peer → disconnect, delete the iface, connect again. Do not stack a second GRE on a dirty iface.
9. **Never `docker rm -f` / `docker kill` the bridge.** `SIGKILL` skips the disconnect the entrypoint runs on `docker stop`, orphaning the onchain session and `doublezero1` in the host netns — gotcha 8, self-inflicted. See [Teardown](#teardown).

---

## Minimal consumer sketch

```text
1. TCP connect ws://HOST:8081
2. (optional) send {"method":"subscribe","subscription":{"source_name":"KALSHI"}}
3. On message: ignore unknown types; key books on (source_id, channel, instrument_id), not symbol alone
4. Quote prices and sizes are already decimal. The tradable tick is tick_size × 10^price_exponent;
   tick_size alone is a raw fixed-point value
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

- [Kalshi Edge Subscriber Connection](kalshi.md) — native client, firewall detail, wire format
- [get.doublezero.xyz/connect](https://get.doublezero.xyz/connect) — installer
- [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) — bridge source + PROTOCOL.md
