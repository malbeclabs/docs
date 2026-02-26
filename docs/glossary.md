# Glossary

This page defines DoubleZero-specific terminology used throughout the documentation.

---

## Network Infrastructure

### DZD (DoubleZero Device)
The physical network switching hardware that terminates DoubleZero links and runs the DoubleZero Agent software. DZDs are deployed at data centers and provide routing, packet processing, and user connectivity services. Each DZD requires specific [hardware specifications](contribute.md#dzd-network-hardware) and runs both the [Config Agent](#config-agent) and [Telemetry Agent](#telemetry-agent).

### DZX (DoubleZero Exchange)
Interconnect points in the mesh network where different [contributor](#contributor) links are bridged together. DZXs are located in major metropolitan areas (e.g., NYC, LON, TYO) where network intersections occur. Network contributors must cross-connect their links into the broader DoubleZero mesh at the nearest DZX. Similar in concept to an Internet Exchange (IX).

### WAN Link
A Wide Area Network link between two [DZDs](#dzd-doublezero-device) operated by the **same** contributor. WAN links provide backbone connectivity within a single contributor's infrastructure.

### DZX Link
A link between [DZDs](#dzd-doublezero-device) operated by **different** contributors, established at a [DZX](#dzx-doublezero-exchange). DZX links require explicit acceptance by both parties.

### DZ Prefix
IP address allocations in CIDR format assigned to a [DZD](#dzd-doublezero-device) for overlay network addressing. Specified during [device creation](contribute-provisioning.md#step-32-create-your-device-onchain) using the `--dz-prefixes` parameter.

---

## Device Types

### Edge Device
A [DZD](#dzd-doublezero-device) that provides user connectivity to the DoubleZero network. Edge devices leverage [CYOA](#cyoa-choose-your-own-adventure) interfaces to terminate users (validators, RPC operators) and connect them to the network.

### Transit Device
A [DZD](#dzd-doublezero-device) that provides backbone connectivity within the DoubleZero network. Transit devices move traffic between DZDs but do not terminate user connections directly.

### Hybrid Device
A [DZD](#dzd-doublezero-device) that combines both [edge](#edge-device) and [transit](#transit-device) functionality, providing both user connectivity and backbone routing.

---

## Connectivity

### CYOA (Choose Your Own Adventure)
Interface types that allow [contributors](#contributor) to register connectivity options for users to connect to the DoubleZero network. CYOA interfaces include various methods like [DIA](#dia-direct-internet-access), GRE tunnels, and private peering. See [Creating CYOA Interfaces](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices) for configuration details.

### DIA (Direct Internet Access)
A standard networking term for connectivity provided over the public internet. In DoubleZero, DIA is a [CYOA](#cyoa-choose-your-own-adventure) interface type where users (validators, RPC operators) connect to a [DZD](#dzd-doublezero-device) over their existing internet connection.

### IBRL (Increase Bandwidth Reduce Latency)
A connection mode that allows validators and RPC nodes to connect to DoubleZero without restarting their blockchain clients. IBRL uses the existing public IP address and establishes an overlay tunnel to the nearest [DZD](#dzd-doublezero-device). See [Mainnet-Beta Connection](DZ%20Mainnet-beta%20Connection.md) for setup instructions.

### Multicast
A one-to-many packet delivery method supported by DoubleZero. Multicast mode has two roles: **publisher** (sends packets across the network) and **subscriber** (receives packets from the publisher). Used by development teams for efficient data distribution. See [Other Multicast Connection](Other%20Multicast%20Connection.md) for connection details.

---

## Software Components

### doublezerod
The DoubleZero daemon service that runs on user servers (validators, RPC nodes). It manages the connection to the DoubleZero network, handles tunnel establishment, and maintains connectivity to [DZDs](#dzd-doublezero-device). Configured via systemd and controlled through the [`doublezero`](#doublezero-cli) CLI.

### doublezero (CLI)
The command-line interface for interacting with the DoubleZero network. Used for connecting, managing identities, checking status, and administrative operations. Communicates with the [`doublezerod`](#doublezerod) daemon.

### Config Agent
Software agent running on [DZDs](#dzd-doublezero-device) that manages device configuration. Reads configuration from the [Controller](#controller) service and applies changes to the device. See [Config Agent Installation](contribute-provisioning.md#step-44-install-config-agent) for setup.

### Telemetry Agent
Software agent running on [DZDs](#dzd-doublezero-device) that collects performance metrics (latency, jitter, packet loss) and submits them to the DoubleZero ledger. See [Telemetry Agent Installation](contribute-provisioning.md#step-45-install-telemetry-agent) for setup.

### Controller
A service that provides configuration to [DZD](#dzd-doublezero-device) agents. The Controller derives device configurations from [onchain](#onchain) state on the DoubleZero ledger.

---

## Link States

### Activated
The normal operational state for a link. Traffic flows through the link and it participates in routing decisions.

### Soft-Drained
A maintenance state where traffic will be discouraged on a specific link. Used for graceful maintenance windows. Can transition to [activated](#activated) or [hard-drained](#hard-drained).

### Hard-Drained
A maintenance state where the link is completely removed from service. No traffic flows through the link. Must transition to [soft-drained](#soft-drained) before returning to [activated](#activated).

---

## Organizations & Tokens

### DZF (DoubleZero Foundation)
DoubleZero Foundation is a memberless nonprofit Cayman Islands foundation company that was formed to support the development, decentralization, security and adoption of the DoubleZero network.

### 2Z Token
The native token of the DoubleZero network. Used for paying validator fees and distributed as rewards to [contributors](#contributor). Validators can pay fees in 2Z via an onchain swap program. See [Paying Fees with 2Z](paying-fees2z.md) and [Swapping SOL to 2Z](Swapping-sol-to-2z.md).

### Contributor
A network infrastructure provider who contributes bandwidth and hardware to the DoubleZero network. Contributors operate [DZDs](#dzd-doublezero-device), provide [WAN](#wan-link) and [DZX](#dzx-link) links, and receive [2Z](#2z-token) token incentives for their contribution. See [Contributor Documentation](contribute-overview.md) to get started.

---

## Networking Concepts

### MTU (Maximum Transmission Unit)
The largest packet size (in bytes) that can be transmitted over a network link. DoubleZero WAN links typically use MTU 9000 (jumbo frames) for efficiency.

### VRF (Virtual Routing and Forwarding)
A technology that allows multiple isolated routing tables to exist on the same physical router. Contributors often use a separate management VRF to isolate switch management traffic from production traffic.

### GRE (Generic Routing Encapsulation)
A tunneling protocol that encapsulates network packets inside IP packets. Used by [IBRL](#ibrl-increase-bandwidth-reduce-latency) and [CYOA](#cyoa-choose-your-own-adventure) connections to create overlay tunnels between users and DZDs.

### BGP (Border Gateway Protocol)
The routing protocol used for exchanging routing information between networks on the internet. DoubleZero uses BGP internally with ASN 65342.

### ASN (Autonomous System Number)
A unique identifier assigned to a network for BGP routing. All DoubleZero devices use **ASN 65342** for the internal BGP process.

### Loopback Interface
A virtual network interface on a router/switch used for management and routing purposes. DZDs use Loopback255 (VPNv4) and Loopback256 (IPv4) for internal routing.

### CIDR (Classless Inter-Domain Routing)
A notation for specifying IP address ranges. The format is `IP/prefix-length` where the prefix length indicates network size (e.g., `/29` = 8 addresses, `/24` = 256 addresses).

### Jitter
Variation in packet latency over time. Low jitter is critical for real-time applications.

### RTT (Round-Trip Time)
The time for a packet to travel from source to destination and back. Used to measure network latency between devices.

### TWAMP (Two-Way Active Measurement Protocol)
A protocol for measuring network performance metrics like latency and packet loss. The [Telemetry Agent](#telemetry-agent) uses TWAMP to collect metrics between DZDs.

### IS-IS (Intermediate System to Intermediate System)
A link-state routing protocol used internally by the DoubleZero network. IS-IS metrics are adjusted during [link draining](#soft-drained) operations.

---

## Blockchain & Keys

### Onchain
In the DoubleZero context, onchain refers to data and operations recorded on the DoubleZero ledger. Unlike traditional networks where device and link configurations live in centralized management systems, DoubleZero records device registrations, link configurations, and telemetry submissions onchain — making the network state transparent and verifiable by all participants.

### Service Key
A cryptographic keypair used to authenticate CLI operations. This is your contributor identity for interacting with the DoubleZero smart contract. Stored at `~/.config/solana/id.json`.

### Metrics Publisher Key
A cryptographic keypair used by the [Telemetry Agent](#telemetry-agent) to sign metric submissions to the blockchain. Separate from the service key for security isolation. Stored at `~/.config/doublezero/metrics-publisher.json`.

---

## Hardware & Software

### EOS (Extensible Operating System)
Arista's network operating system that runs on DZD switches. Contributors install [Config Agent](#config-agent) and [Telemetry Agent](#telemetry-agent) as EOS extensions.

### EOS Extension
A software package that can be installed on Arista EOS switches. DZ agents are distributed as `.rpm` files and installed via the `extension` command.
