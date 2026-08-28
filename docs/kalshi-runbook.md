---
description: LLM-oriented runbook — buy a Kalshi feed, install Edge Connect, subscribe, and verify normalized quotes on the WebSocket. Served to the MCP via GitHub raw; not published on the docs site.
---

# Kalshi + Edge Connect — runbook

!!! tip "Let an AI walk you through this page"
    You do not need to run every command yourself. This page is written so an AI assistant can follow it with you.

    1. Connect the [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`) so the agent can load this runbook itself via `get_onboarding_runbook`.
    2. Tell it your Linux host (or how to SSH to it), where your access secret lives (`DZ_SECRET`: a `DZ_…` token or the path to your keypair file), and what you want — for example: *install Edge Connect and subscribe to Kalshi perps TOB*.
    3. Paste back any errors it asks for. It should follow the steps below in order.

    Prefer to do it by hand? Start at [Prerequisites](#prerequisites).

**Not this page:** choosing between Edge Connect and native multicast — start at the [Kalshi getting started](kalshi.md) page. Raw wire decode — path 2 on that page and [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). WebSocket contract — [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

**What success looks like:** the tunnel shows `BGP Session Up`, you are subscribed to at least one Kalshi group, the bridge is listening on `ws://<host>:8081`, and (when the publisher is live) you see `instrument` / `quote` (or `book`) JSON messages with `source: "KALSHI"`.

---

## Prerequisites

| Need | Notes |
|------|--------|
| Linux/amd64 host | Installer target. |
| Public IP on the host | Must match the IP authorized when the feed / access pass was issued (or the any-IP `0.0.0.0` pass). Override detection with `DZ_CLIENT_IP` if behind NAT. |
| Access secret (`DZ_SECRET`) | A `DZ_…` token **or** path to the Solana keypair JSON that owns the access pass / feed purchase. |
| Account credits | The identity in `DZ_SECRET` must have available DoubleZero credits. `Insufficient balance` means recharge that account before connect can succeed. |
| Purchased Kalshi feed | Buy at [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) before expecting traffic. |
| GRE (IP proto 47) allowed | Cloud SG / firewall. On AWS, disable ENI source/dest check. |
| UDP `30000`–`59999` inbound on `doublezero1` | Leading digit = class (`3` market, `4` reference, `5` snapshot). Open the full band so new channels do not need another firewall change. |

The installer may print `!! No access pass… Continuing` and still exit 0. That is **not** connected. Look for `Access pass OK` and a later `BGP Session Up`. Treat `disconnected` + `Insufficient balance` / missing pass as a hard stop.

Firewall sketch (after the tunnel exists, `doublezero1` is present):

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
# also allow BGP/PIM as in the full Kalshi guide if you harden INPUT by default
```

---

## Feed map

| Group code | Kind | Multicast group | Market | Reference | Snapshot |
|------------|------|-----------------|--------|-----------|----------|
| `edge-kalshi-perps-tob` | TOB | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | MBP | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | TOB | `233.84.178.17` | `33000`+id | `43000`+id | — |
| `edge-kalshi-sports-mbp` | MBP | `233.84.178.20` | `34000`+id | `44000`+id | `54000`+id |

Confirm the live group IP for your env:

```bash
docker exec doublezero-edge-connect doublezero multicast group get --code edge-kalshi-perps-tob
```

**Edge Connect note:** the bridge matches `code` and multicast **group IP** from its hardcoded feed table to what `doublezero status` reports. A code/IP mismatch fails **silently** (receiver never starts — watch bridge logs / metrics, not only BGP).

---

## Steps

### 1. Install Edge Connect

`DZ_SECRET` is the identity that holds your Edge access pass / purchased feed. Set it to either:

- a **`DZ_…` access token** you were issued, or
- the **path to a Solana keypair JSON** (the same keypair authorized onchain for this host’s public IP, or for the any-IP `0.0.0.0` pass).

```bash
# example: keypair file
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

If you omit `DZ_SECRET`, the installer prompts once. With it set, the install is non-interactive.

What this does: prep host (Docker, `tun`/`ip_gre`, `rmem_max`) → run `doublezero-edge-connect` container (`--network host`) → run `doublezero connect multicast` inside it → serve WS on `:8081` when a **market-data** subscription is active.

Watch the installer for `Access pass OK` and `Joined feed(s): …`. That feed list is what this identity actually purchased. Do not assume Top of Book (`edge-kalshi-perps-tob`) unless it appears there.

A `⚠️` on **Lowest Latency Device** while **Current Device** is another metro is normal when the feed is only served from that metro. Do not pass `--device` to the closer site unless you know the feed is provisioned there — you will get *feed is not provisioned on the access pass* / *is served from that metro*.

### 2. Ensure the Kalshi group is subscribed

Prefer the feed the installer already joined. If status already shows `S:edge-kalshi-…`, skip this step.

`--subscribe-feed` takes the **feed account name** from the pass (e.g. `kalshi-perps-mbp`). `--subscribe` takes the **group code** (e.g. `edge-kalshi-perps-mbp`). They are not interchangeable. Subscribing a code or name that is not on the pass fails.

Only run an extra subscribe if the group you bought is missing from `doublezero status`. Prefer the **Feed account** form when using an Edge seat / access-pass identity:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-account-name>
```

Or by group code (use the code that matches `Joined feed(s):`, not a feed you did not buy):

```bash
# MBP example — swap for -tob / sports if that is what the pass joined
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe edge-kalshi-perps-mbp
```

Multiple feeds: space-separate codes.

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe \
    edge-kalshi-perps-tob edge-kalshi-perps-mbp \
    edge-kalshi-sports-tob edge-kalshi-sports-mbp
```

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

```bash
docker logs --since 2m doublezero-edge-connect 2>&1 | grep -iE 'kalshi|activating|receiver|8081|error|warn'
```

Expect the reconciler to **activate** the Kalshi receiver for the subscribed code(s). `:8081` and `activating market-data receiver` can lag the tunnel by one refresh (default 30s). BGP Up + port down is not a failure yet — wait, then grep the logs again. No activation after that wait ⇒ code/IP table mismatch or feed not purchased.

### 4. Open the WebSocket

Default bind: `0.0.0.0:8081` (plain `ws://`, no TLS).

```bash
npx wscat -c ws://127.0.0.1:8081
```

Optional filter (after connect):

```json
{"method":"subscribe","subscription":{"venue":"KALSHI"}}
```

(Also accepted: `source` instead of deprecated `venue` — see PROTOCOL.md.)

With no subscription message you get the firehose of every active venue on this host.

### 5. Confirm data path

| Check | Healthy signal |
|-------|----------------|
| WS accepts TCP | Connect succeeds; optional subscribe ack |
| Instruments | `{"type":"instrument",...,"source":"KALSHI",...}` after connect (when refdata has been seen) |
| Quotes / book | `quote` (TOB) or `book` (MBP) with `source":"KALSHI"` |
| Quiet market | Heartbeats / refdata may flow without quotes; do not treat “no quote yet” alone as a tunnel failure |

Capture on the tunnel (optional):

```bash
sudo tcpdump -ni doublezero1 host 233.84.178.3 and udp
```

Replace the group IP with the row you subscribed.

---

## Gotchas

1. **Buy before subscribe.** No purchase ⇒ tunnel can look fine, UDP stays empty.
2. **Silent non-activation.** Wrong `code` or group IP in the bridge table ⇒ no receiver, no WS market-data, little noise. Diff `doublezero status --json` groups vs bridge feed registry.
3. **Host `doublezerod` vs container.** Edge Connect uses host networking and its own daemon. A host-level `doublezerod` fighting over the same UDP/GRE path will break the container — stop the host daemon when running the bridge.
4. **WS only with market-data subscription.** Shreds-only (or no market feed) ⇒ no `:8081` service by design.
5. **Port band.** Firewall must allow `30000:59999` on `doublezero1`, not only GRE. Decapsulated UDP re-enters `INPUT` on the tunnel iface.
6. **Installer exit 0 ≠ tunnel up.** Missing access pass or credits: the script continues and still prints Done / a WebSocket URL. Trust `doublezero status`, not the installer footer.
7. **Feed metro ≠ closest device.** Edge Connect attaches to the metro that serves the purchased feed. Forcing `--device` at the lowest-latency site fails if that metro does not serve the feed. The constraint is the **device**, not where the host sits (a host far from the serving metro can still attach to that device).
8. **Stale `doublezero1`.** `tunnel already exists`, mixed `169.254.x` addresses, or BGP TCP never establishing to the inner peer → disconnect, delete the iface, connect again. Do not stack a second GRE on a dirty iface.
9. **Never `docker rm -f` / `docker kill` the bridge.** `SIGKILL` skips the disconnect the entrypoint runs on `docker stop`, orphaning the onchain session and `doublezero1` in the host netns — gotcha 8, self-inflicted. See [Teardown](#teardown).

---

## Minimal consumer sketch

```text
1. TCP connect ws://HOST:8081
2. (optional) send {"method":"subscribe","subscription":{"venue":"KALSHI"}}
3. On message: ignore unknown types; key books on (source, channel, instrument_id), not symbol alone
4. Use instrument.price_exponent / qty_exponent for display tick size; quote fields are already decimal
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
