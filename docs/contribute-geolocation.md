# Geoprobe Deployment

This guide covers deploying and configuring **geoProbe agents** — the bare metal servers that perform latency measurements for the DoubleZero [Geolocation](geolocation.md) service.

A geoProbe sits between [DZDs](glossary.md#dzd-doublezero-device) and target devices in the three-tier measurement chain. It receives signed LocationOffsets from parent DZDs and measures [RTT](glossary.md#rtt-round-trip-time) to registered targets via [TWAMP](glossary.md#twamp-two-way-active-measurement-protocol), signed TWAMP, or ICMP echo. Each geoProbe is registered onchain and linked to one or more parent DZDs.

For an overview of the geolocation architecture and measurement flows, see the [Geolocation user guide](geolocation.md).

---

## Prerequisites

!!! warning "DZD Telemetry Agent Version"
    Parent DZDs must run **device telemetry agent version 0.17.0 or newer** to support the geolocation service. Earlier versions do not include the probe discovery, TWAMP pinging, and offset-publishing extensions required for geolocation. Verify agent versions before deploying a probe — a probe paired with an older DZD will not receive offsets.

Before deploying a geoProbe, ensure you have:

- **Bare metal Linux server** — VMs add unpredictable latency to measurements
- **Network proximity to a DZD** — less than 1ms RTT between the probe and its parent DZD
- **`CAP_NET_RAW` capability** for the agent process (required for ICMP echo probing with raw sockets)
- **Ed25519 keypair** for the probe's signing identity
- **Foundation authorization** — probe registration is foundation-gated; coordinate with [DZF](glossary.md#dzf-doublezero-foundation) before proceeding
- **Parent DZD(s)** running telemetry agent v0.17.0+

---

## Installation

Install both the agent daemon and the management CLI:

```bash
sudo apt install doublezero-geoprobe-agent doublezero-geolocation
```

| Package | Purpose |
|---------|---------|
| `doublezero-geoprobe-agent` | Agent daemon that runs on the probe server, performing latency measurements and generating signed offsets |
| `doublezero-geolocation` | CLI tool used for probe registration and management commands |

---

## Onchain Registration

Probe registration requires foundation authorization. Coordinate with DZF before proceeding.

### Step 1: Register the probe

```bash
doublezero-geolocation probe create \
  --env testnet \
  --code <probe-code> \
  --exchange <exchange-pubkey> \
  --public-ip <probe-ip> \
  --location-offset-port 8923 \
  --metrics-publisher-pk <signing-key-pubkey>
```

| Parameter | Description |
|-----------|-------------|
| `--code` | Unique identifier for the probe (e.g., `ams-tn-gp1`) — max 32 characters |
| `--exchange` | Public key of the Serviceability Exchange account this probe is associated with |
| `--public-ip` | Public IPv4 address where the probe listens |
| `--location-offset-port` | UDP port for receiving LocationOffsets from DZDs (default: 8923) |
| `--metrics-publisher-pk` | Public key used to sign offsets and telemetry |

### Step 2: Link parent DZDs

```bash
doublezero-geolocation probe add-parent \
  --env testnet \
  --probe <probe-code> \
  --device <dzd-pubkey>
```

Each parent DZD must be an activated device in the Serviceability Program. DZDs auto-discover child probes every 60 seconds — once linked, the DZD begins TWAMP measurements and offset generation automatically.

---

## Running the Agent

```bash
doublezero-geoprobe-agent \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey> \
  --env testnet
```

### Required Flags

| Flag | Description |
|------|-------------|
| `--keypair` | Path to the Ed25519 keypair file for signing offsets |
| `--geoprobe-pubkey` | The probe's [onchain](glossary.md#onchain) public key (from `probe create`) |
| `--env` | Network environment: `testnet`, `devnet`, or `mainnet-beta` (sets the ledger RPC URL) |

Alternatively, use `--ledger-rpc-url` instead of `--env` to specify a custom Solana RPC endpoint.

### Optional Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--twamp-listen-port` | 8925 | Port for TWAMP measurements from parent DZDs |
| `--signed-twamp-port` | 8924 | Port for signed TWAMP probes from inbound targets |
| `--udp-listen-port` | 8923 | Port for receiving LocationOffset datagrams from DZDs |
| `--probe-interval` | 30s | How often to measure each target |
| `--max-offset-age` | 1h | Maximum age of a cached DZD offset before it is discarded |
| `--verify-interval` | 29s | How often to re-verify target assignments from the ledger |
| `--verbose` | false | Enable verbose logging |
| `--metrics-enable` | false | Enable Prometheus metrics endpoint |
| `--metrics-addr` | — | Address for the Prometheus metrics endpoint (e.g., `0.0.0.0:9090`) |

---

## Ports and Firewall

The geoprobe agent requires several ports open:

| Port | Protocol | Direction | Purpose |
|------|----------|-----------|---------|
| 8923/udp | UDP | Inbound from DZDs | Receives signed LocationOffset datagrams |
| 8924/udp | UDP | Inbound from targets | Signed TWAMP reflector (inbound probe flow) |
| 8925/udp | UDP | Inbound from DZDs | TWAMP measurements from parent DZDs |
| ICMP | ICMP | Outbound to targets | ICMP echo requests for OutboundIcmp targets |

!!! note
    The agent also needs outbound UDP to targets for TWAMP probing (outbound flow) and for delivering signed LocationOffset results to targets.

---

## Monitoring

Enable the Prometheus metrics endpoint for operational visibility:

```bash
doublezero-geoprobe-agent \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey> \
  --env testnet \
  --metrics-enable \
  --metrics-addr 0.0.0.0:9090
```

Key metrics to monitor:

- **Probe availability** — uptime of the agent process
- **DZD-to-Probe latency** — should be less than 1ms; higher values indicate a placement problem
- **Active targets** — number of targets the probe is currently measuring
- **Signature verification failures** — non-zero values may indicate key misconfiguration or tampered packets
- **Offset cache hit rate** — a low hit rate means the probe is frequently waiting for fresh DZD offsets

See the [Operations guide](contribute-operations.md#monitoring) for general guidance on Prometheus scraping and alerting patterns used across DoubleZero agents.

---

## Probe Management Commands

The `doublezero-geolocation` CLI provides the following subcommands for managing probes:

| Subcommand | Description |
|------------|-------------|
| `probe create` | Register a new geoProbe onchain |
| `probe get` | Get details of a specific probe by code |
| `probe list` | List all registered probes |
| `probe update` | Update probe configuration (IP, port, signing key) |
| `probe delete` | Delete a probe (requires no active target references) |
| `probe add-parent` | Link a parent DZD to the probe |
| `probe remove-parent` | Remove a parent DZD from the probe |

All subcommands accept `--env` or `--rpc-url` to select the network. Write operations (`create`, `update`, `delete`, `add-parent`, `remove-parent`) require `--keypair`.

??? note "Example: listing probes on testnet"

    ```bash
    doublezero-geolocation probe list --env testnet
    ```

    Returns all registered probes with their codes, public IPs, parent DZDs, and current status.
