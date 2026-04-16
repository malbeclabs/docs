# Edge Subscriber Connection
!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol). Please note that the data is for your internal purposes only and may not be retransmitted (see Section 2(e))."

## Step 1: DoubleZero Setup

### 1. Complete Setup

Intall the [Solana CLI](https://docs.anza.xyz/cli/install).

Follow the [setup](setup.md) instructions to instal and configure the DoubleZero client.

### 2. Configure the Firewall

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

### 3. Enable the Reconciler

The reconciler monitors onchain state and automatically provisions tunnels when your seat is allocated. It is not enabled by default.

```bash
doublezero enable
```

### 4. Retrieve the Server's DoubleZero Identity

Review your DoubleZero Identity. This identity will be used to create the connection between your machine and DoubleZero.

```bash
doublezero address
```

**Output:**
```
YourDoubleZeroAddress11111111111111111111111111111
```

---

## Step 2: Set Up Your Wallet

### 1. Create a Solana Keypair

The `doublezero-solana` CLI uses a standard Solana keypair for onchain seat management. If you don't have one:

```bash
solana-keygen new
```

This writes to `~/.config/solana/id.json`. To use a different path, pass `--keypair <path>` to any `doublezero-solana` command.

Print your wallet address:

```bash
solana address
```

### 2. Fund Your Wallet

Your wallet needs two tokens:

- **SOL** — for Solana transaction fees. Transfer SOL to the wallet address printed above.
- **USDC** — for seat funding. The CLI pulls from your wallet's Associated Token Account (ATA) for the mainnet USDC mint (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`).

---

## Step 3: Buy a Seat

### 1. Find Your Nearest Device

Before buying a seat, identify the device with the lowest latency from your machine:

```bash
doublezero latency
```

Note the device code from the lowest-latency result (e.g., `MIA-1`). You'll use this when purchasing a seat.

### 2. Check Pricing

View current device pricing before committing funds. Pricing has two components: a **base metro price** and a **per-device premium**. Prices update each epoch. You can also view pricing and availability [here](https://data.malbeclabs.com/dz/shreds/devices).

**All devices:**

```bash
doublezero-solana shreds price
```

**Specific device:**

```bash
doublezero-solana shreds price --device-code MIA-1
doublezero-solana shreds price --device <PUBKEY>
```

**All devices in a metro:**

```bash
doublezero-solana shreds price --metro <PUBKEY>
```

Output columns: `Device Code`, `Metro Code`, `Metro Name`, `Status`, `Settled Seats`, `Available Seats`, `Base Price (USDC)`, `Premium (USDC)`, `Epoch Price (USDC)`.

The epoch price is the total cost per epoch for a seat on that device (base + premium). Use `--wide` to show full pubkeys, or `--json` for JSON output.

### 3. Buy a Seat

Purchase a seat with a single command. This initializes your seat, funds the escrow, and requests allocation:

```bash
doublezero-solana shreds pay \
  --device-code MIA-1 \
  --client-ip 203.0.113.42 \
  --amount 100
```

**Parameters:**

| Flag | Description |
|------|-------------|
| `--device <PUBKEY>` | Target device by public key (mutually exclusive with `--device-code`) |
| `--device-code <CODE>` | Target device by human-readable code (e.g., `MIA-1`) |
| `--client-ip <IP>` | Your machine's public IPv4 address |
| `--amount <USDC>` | USDC to fund (decimal format, e.g. `100` = 100 USDC). Must meet the minimum epoch price. |
| `--source-token-account <PUBKEY>` | Custom USDC source account (defaults to your wallet's ATA) |
| `--accept-partial-epoch` | Skip the epoch-remaining warning (see below) |
| `--fee-payer <PATH>` | Use a different wallet for SOL transaction fees |
| `--dry-run` | Simulate the transaction without executing it |
| `--with-compute-unit-price <PRICE>` | Set a compute unit price for faster inclusion during congestion |

Once your seat is allocated, the daemon establishes the GRE tunnel automatically. Check your connection with:

```bash
doublezero status
```

### Epoch Timing

Seats are allocated per Solana epoch (~2 days). If less than 10% of the current epoch remains when you pay, the CLI warns that your seat will be allocated immediately but only covers the remainder of the current epoch. A separate payment will be deducted from your escrow when the next epoch begins.

!!! info "It is advisable to fund for more than 1 epoch at a time so you don't lose your seat. You can check the current time left in an epoch [here](https://explorer.solana.com/)."

You can bypass this warning with `--accept-partial-epoch`.

### Keep Your Escrow Funded

!!! warning "If your escrow balance is below the epoch price at settlement, your seat will not be allocated, the tunnel will be torn down, and you lose your accumulated tenure. Tenure determines your priority for future epochs — losing it means you compete as a newcomer again."

You may overfund this account to fund multiple epochs. Each settlement deducts one epoch's price from your escrow, and the remaining balance carries forward. For example, funding 5x the per-epoch price keeps your seat active for up to 5 epochs without re-funding.

To top up your escrow, run `shreds pay` again at any time:

```bash
doublezero-solana shreds pay \
  --device-code MIA-1 \
  --client-ip 203.0.113.42 \
  --amount 500
```

### Monitor Seats

View your active seats and escrow balances:

**All your seats:**

```bash
doublezero-solana shreds list
```

**Filter by device:**

```bash
doublezero-solana shreds list --device-code MIA-1
```

**Filter by client IP:**

```bash
doublezero-solana shreds list --client-ip 203.0.113.42
```

**Filter by wallet:**

```bash
doublezero-solana shreds list --withdraw-authority <PUBKEY>
```

Output columns: `Device Code`, `Client IP`, `Tenure`, `Balance (USDC)`, `Est. Epochs Paid`.

The "Est. Epochs Paid" column shows how many epochs your current balance covers at current pricing. If prices change, this estimate adjusts.

### Withdraw Funds

Close your escrow and refund remaining USDC to your wallet:

```bash
doublezero-solana shreds withdraw \
  --device-code MIA-1 \
  --client-ip 203.0.113.42
```

You can identify the device by either `--device <PUBKEY>` or `--device-code <CODE>`, same as other commands.

To send the refund to a different token account:

```bash
doublezero-solana shreds withdraw \
  --device-code MIA-1 \
  --client-ip 203.0.113.42 \
  --refund-token-account <PUBKEY>
```

!!! warning "Withdrawing means you lose your seat and accumulated tenure."

---

## Expected Port

Leader Shreds and high-stake Retransmit Shreds will arrive over port `7733`, over the `doublezero1` interface. The `doublezero0` interface is for unicast traffic. Port `5765` is a heartbeat monitor from the shred publishers — this will not contain shreds.

## GRE Tunnel Header — XDP

!!! note "Shred traffic delivered over the network is GRE-encapsulated. You may need to strip the GRE header before feeding data into your existing pipeline (e.g. an XDP-based deshredder)."

---

## Tools and Dashboards

### [Edge Scoreboard](https://data.malbeclabs.com/dz/shreds/scoreboard)

Scoreboard benchmarks shred delivery speed across DoubleZero Edge and other providers, using slot-level data to compare performance in real time. Use this dashboard to see a view of Edge shreds win rates against other providers. You can view results for leader shreds only, in addition to full feed comparison. You can also drill down by region to see expected performance.

### [Edge Publishers](https://data.malbeclabs.com/dz/shreds/publishers)

The "Publishing Shreds" metric at the top left of the dashboard shows the total percent of stake weight of all Solana validators publishing leader shreds on DoubleZero Edge. You can see details for each publisher on the network.

### [Edge Subscribers, Devices and Activity](https://data.malbeclabs.com/dz/shreds/subscribers)

You can easily search your Client IP on this page for subscribed seats and view status. Click through specific seat subscriptions to view payment history and activity. You can also view available devices on the [Devices](https://data.malbeclabs.com/dz/shreds/devices) page and all recent activity on the [Activity](https://data.malbeclabs.com/dz/shreds/activity) page.

---

## Troubleshooting

If you run into an issue not covered here, please reach out over your existing channel before working around it. If you do not have a channel, please search [Discord](https://discord.gg/U2fEb4Jq) and open a ticket if required.

### Insufficient escrow balance

If your escrow balance is below the epoch price at settlement, the seat is not allocated, the tunnel is torn down, and tenure is lost. Top up with `shreds pay` before the next settlement.

### Seat not allocated after paying

- You may have paid late in the epoch — the seat takes effect next epoch.
- All seats on the device may be taken by higher-tenure incumbents. Check available seats with `shreds price`.
- If you withdrew before settlement, the seat was not eligible.

### Tunnel not coming up

1. Verify the daemon is running: `sudo systemctl status doublezerod`
2. Verify the reconciler is enabled: `doublezero enable`
3. Verify firewall rules are in place (GRE, BGP, PIM, shred traffic on `doublezero1`, port 44880 on `doublezero0`)
4. Verify your seat is active for the current epoch: `doublezero-solana shreds list`
5. Check your connection status: `doublezero status`

The daemon's client IP is auto-discovered from your host's public IP — verify it matches the `--client-ip` used in your seat commands.

### Epoch warning prompt

The CLI warns when less than 10% of the epoch remains. Your options:

- Accept with `--accept-partial-epoch` if you want the seat immediately
- Wait for the next epoch to get a full epoch's coverage

### "Amount is below the current price"

The `pay` command validates your amount against the minimum epoch price (metro base + device premium). Use `shreds price` to check current pricing and increase your amount.

### "Multicast user already exists"

You already have an active subscription through a different path. Disconnect first with `doublezero disconnect`, then retry `shreds pay`.
