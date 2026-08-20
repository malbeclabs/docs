---
description: Set up an edge subscriber to receive DoubleZero shred feeds, including client setup and firewall rules for GRE, BGP, PIM, and shred traffic.
---

# Edge Subscriber Connection
!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol). Please note that the data is for your internal purposes only and may not be retransmitted (see Section 2(e))."

!!! warning "Already on the CLI subscription?"
    If you subscribed through the **CLI** (`doublezero-solana shreds pay` / escrow seats), use the [CLI subscription page](Edge Subscriber CLI.md) for those commands. That system is being **decommissioned on August 30, 2026**. New subscriptions follow this page.

## Step 1: DoubleZero Setup

### Complete Setup

Install the [Solana CLI](https://docs.anza.xyz/cli/install).

Follow the [setup](setup.md) instructions to install and configure the DoubleZero client.

If you have previously set up DoubleZero, ensure you have the latest Doublezero-Solana CLI with `sudo apt update && sudo apt install doublezero-solana`

### Configure the Firewall

Allow GRE, BGP, PIM, and shred traffic.

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

---

## Step 2: Choose a metro

Identify the lowest-latency location from the machine that will receive shreds:

```bash
doublezero latency
```

Note the metro / city from the lowest-latency result. You will select that city on the application form. See the [topology map](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) for how metros are grouped.

### Pricing

Seats are billed **per month**, per machine, in the metro you select:

| Metros | Price |
|--------|-------|
| Frankfurt, Amsterdam | $1,500 / month |
| London, New York, Singapore, Tokyo | $900 / month |
| All other locations | $450 / month |

---

## Step 3: Submit Request

1. Go to [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Select **Solana Shreds**.
3. Select the **city** (metro) you need. Use the table above and `doublezero latency` to choose.
4. Finish the application form.

You will assign a DoubleZero ID (existing key, or generate a new one) to each feed request on the [accounts](https://doublezero.xyz/shreds/account) page. The matching **private key must be present on the machine that will receive shreds** — do not assign a pubkey whose private key you cannot move to that host.

You pick a **metro** and a **pubkey**. You do **not** bind a public IP at application time. During the subscription you can move access between IPs **within the chosen metros**.

Our team reviews applications and contacts you in a timely manner (expect **2 business days**).

---

## Step 4: Connect after approval

After we contact you, you receive an invoice, and that invoice is paid, connect on each approved machine:

```bash
doublezero connect multicast --subscribe-feed solana-shreds-full
```

Access is enabled on your chosen start date (typically 9:01 AM ET). Check the tunnel with:

```bash
doublezero status
```

---

## Billing

Seats are charged **monthly**. Watch the seat expiration date.

You will be invoiced a few days before the seat expires. **Not paying leads to removal of the seat.**

---

## Shred Addresses (IP vs Port)

Leader Shreds and high-stake Retransmit Shreds will arrive over port `7733`, over the `doublezero1` interface. The `doublezero0` interface is for unicast traffic. Port `5765` is a heartbeat monitor from the shred publishers — this will not contain shreds.

For shred consumption, **IP address** identifies the multicast stream and **port** identifies the UDP service on that stream.  
All shred streams below use UDP port `7733` on `doublezero1`.

You examine any multicast group's IPs with:

```bash
doublezero multicast group list
```

### Leader Shreds

- `edge-solana-shreds`: `233.84.178.1:7733`

### Root Shreds

- `edge-solana-root`: `233.84.178.16:7733`

### Retransmit Shreds

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## GRE Tunnel Header — XDP

!!! note "Shred traffic delivered over the network is GRE-encapsulated. You may need to strip the GRE header before feeding data into your existing pipeline (e.g. an XDP-based deshredder)."

---

## Tools and Dashboards

### [Edge Scoreboard](https://data.doublezero.xyz/dz/shreds/scoreboard)

Scoreboard benchmarks shred delivery speed across DoubleZero Edge and other providers, using slot-level data to compare performance in real time. Use this dashboard to see a view of Edge shreds win rates against other providers. You can view results for leader shreds only, in addition to full feed comparison. You can also drill down by region to see expected performance.

### [Edge Publishers](https://data.doublezero.xyz/dz/shreds/publishers)

The "Publishing Shreds" metric at the top left of the dashboard shows the total percent of stake weight of all Solana validators publishing leader shreds on DoubleZero Edge. You can see details for each publisher on the network.

### [Edge Subscribers, Devices and Activity](https://data.doublezero.xyz/dz/shreds/subscribers)

You can search your Client IP on this page for subscribed seats and view status. You can also view available devices on the [Devices](https://data.doublezero.xyz/dz/shreds/devices) page and all recent activity on the [Activity](https://data.doublezero.xyz/dz/shreds/activity) page.

### Data API Docs

For programmatic access to data endpoints, see the API documentation: [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

---

## Troubleshooting

If you run into an issue not covered here, please reach out over your existing channel before working around it. If you do not have a channel, please search [Discord](https://discord.gg/U2fEb4Jq) and open a ticket if required.

### Ensure your Client is up to date:

Run: `sudo apt update && sudo apt install doublezero-solana`

### Tunnel not coming up

1. Verify the daemon is running: `sudo systemctl status doublezerod`
2. Verify firewall rules are in place (GRE, BGP, PIM, shred traffic on `doublezero1`, port 44880 on `doublezero0`)
3. Confirm the invoice for this seat is paid and the start date has passed
4. Run `doublezero connect multicast --subscribe-feed solana-shreds-full` on the machine that holds the assigned private key
5. Check your connection status: `doublezero status`

The DoubleZero ID used on the accounts page must match the key on this host.

### Seat expired or removed

Seats are monthly. If the invoice sent before expiry is not paid, the seat is removed and the tunnel will not stay up.

### "Multicast user already exists"

You already have an active subscription through a different path. Disconnect first with `doublezero disconnect`, then retry `doublezero connect multicast --subscribe-feed solana-shreds-full`.
