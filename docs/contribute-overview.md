# Contributor Documentation

!!! info "Terminology"
    New to DoubleZero? See the [Glossary](glossary.md) for definitions of key terms like [DZD](glossary.md#dzd-doublezero-device), [DZX](glossary.md#dzx-doublezero-exchange), and [CYOA](glossary.md#cyoa-choose-your-own-adventure).

Welcome to the DoubleZero contributor documentation. This section covers everything you need to become a network contributor.

---

## Onboarding Checklist

Use this checklist to track your progress. **All items must be complete before your contribution is technically operational.**

### Phase 1: Prerequisites
- [ ] DoubleZero CLI installed on a management server (only step 1 of the [Setup Guide](setup.md))
- [ ] Hardware procured and meets [requirements](contribute.md#hardware-requirements)
- [ ] Data center rack space and power available (4U, 4KW recommended)
- [ ] DZD physically installed with management connectivity
- [ ] Public IPv4 block allocated for DZ protocol (**see [DZ Prefix Rules](#dz-prefix-rules)**)

### Phase 2: Account Setup
- [ ] Service keypair generated (`doublezero keygen`)
- [ ] Metrics publisher keypair generated
- [ ] Service key submitted to DZF for authorization
- [ ] Contributor account created onchain (verify with `doublezero contributor list`)
- [ ] Access granted to [malbeclabs/contributors](https://github.com/malbeclabs/contributors) repository

### Phase 3: Device Provisioning
- [ ] Base device configuration applied (from contributors repo)
- [ ] Device created onchain (`doublezero device create`)
- [ ] Device interfaces registered
- [ ] Loopback interfaces created (Loopback255 vpnv4, Loopback256 ipv4)
- [ ] CYOA/DIA interfaces configured (if edge/hybrid device)

### Phase 4: Link Establishment & Agent Installation
- [ ] WAN links created (if applicable)
- [ ] DZX link created (status: `requested`)
- [ ] DZX link accepted by peer contributor
- [ ] Config Agent installed and running
- [ ] Config Agent receiving configuration from controller
- [ ] Telemetry Agent installed and running
- [ ] Metrics publisher registered onchain
- [ ] Telemetry submissions visible on ledger

### Phase 5: Link Burn-in
- [ ] All links drained for 24-hour burn-in period
- [ ] [metrics.doublezero.xyz](https://metrics.doublezero.xyz) shows zero loss and zero errors for 24h
- [ ] Links undrained after clean burn-in

### Phase 6: Verification & Activation
- [ ] `doublezero device list` shows your device (with `max_users = 0`)
- [ ] `doublezero link list` shows your links
- [ ] Config Agent logs show successful config pulls
- [ ] Telemetry Agent logs show successful metric submissions
- [ ] **Coordinate with DZ/Malbec Labs** to run connectivity test (connect, receive routes, route over DZ)
- [ ] After test passes, set `max_users` to 96 via `doublezero device update`

---

## Getting Help

As part of onboarding, DZF will add you to the contributor Slack channels:

| Channel | Purpose |
|---------|---------|
| **#dz-contributor-announcements** | Official communications from DZF and Malbec Labs — CLI/agent upgrades, breaking changes, security announcements. Monitor for critical updates; ask questions in threads. |
| **#dz-contributor-incidents** | Unplanned service-impacting events. Incidents are posted automatically via the API/web form with severity and affected devices/links. Discussion and troubleshooting happens in threads. |
| **#dz-contributor-maintenance** | Planned maintenance activities (upgrades, repairs). Scheduled via the API/web form with planned start/end times. Discussion in threads. |
| **#dz-contributor-ops** | Open discussion for all contributors — operational questions, CLI help, sharing runbooks and playbooks. |

You will also get a **private DZ/Malbec Labs channel** for direct support for your organization.

---

## DZ Prefix Rules

!!! warning "Critical: DZ Prefix Pool Usage"
    The DZ prefix pool you provide is **managed by the DoubleZero protocol for IP allocation**.

    **How DZ prefixes are used:**

    - **First IP**: Reserved for your device (assigned to Loopback100 interface)
    - **Remaining IPs**: Allocated to specific user types connecting to your DZD:
        - `IBRLWithAllocatedIP` users
        - `EdgeFiltering` users
        - Multicast publishers
    - **IBRL users**: Do NOT consume from this pool (they use their own public IP)

    **You CANNOT use these addresses for:**

    - Your own network equipment
    - Point-to-point links on DIA interfaces
    - Management interfaces
    - Any infrastructure outside the DZ protocol

    **Requirements:**

    - Must be **globally routable (public)** IPv4 addresses
    - Private IP ranges (10.x, 172.16-31.x, 192.168.x) are rejected by the smart contract
    - **Minimum size: /29** (8 addresses), larger prefixes preferred (e.g., /28, /27)
    - The entire block must be available - do not pre-allocate any addresses

    If you need addresses for your own equipment (DIA interface IPs, management, etc.), use a **separate address pool**.

---

## Quick Reference: Key Terms

New to DoubleZero? Here are the essential terms (see [full Glossary](glossary.md)):

| Term | Definition |
|------|------------|
| **DZD** | DoubleZero Device - your physical Arista switch running DZ agents |
| **DZX** | DoubleZero Exchange - metro interconnect point where contributors peer |
| **CYOA** | Choose Your Own Adventure - user connectivity method (GREOverDIA, GREOverFabric, etc.) |
| **DIA** | Direct Internet Access - internet connectivity required by all DZDs for controller and telemetry, commonly used as a CYOA type for user connectivity on edge/hybrid devices |
| **WAN Link** | Link between your own DZDs (same contributor) |
| **DZX Link** | Link to another contributor's DZD (requires mutual acceptance) |
| **Config Agent** | Polls controller, applies configuration to your DZD |
| **Telemetry Agent** | Collects TWAMP latency/loss metrics, submits to onchain ledger |
| **Service Key** | Your contributor identity key for CLI operations |
| **Metrics Publisher Key** | Key for signing telemetry submissions onchain |

---

---

## Documentation Structure

| Guide | Description |
|-------|-------------|
| [Requirements & Architecture](contribute.md) | Hardware specs, network architecture, bandwidth options |
| [Device Provisioning](contribute-provisioning.md) | Step-by-step: keys → repo access → device → links → agents |
| [Operations](contribute-operations.md) | Agent upgrades, link management, monitoring |
| [Glossary](glossary.md) | All DoubleZero terminology defined |

---

## Network Basics for Non-Network Engineers

If you're not from a network engineering background, here's a primer on concepts used in this documentation:

### IP Addressing

- **IPv4 address**: A unique identifier for a device on a network (e.g., `192.168.1.1`)
- **CIDR notation** (`/29`, `/24`): Indicates subnet size. `/29` = 8 addresses, `/24` = 256 addresses
- **Public IP**: Routable on the internet; **Private IP**: Internal networks only (10.x, 172.16-31.x, 192.168.x)

### Network Layers

- **Layer 1 (Physical)**: Cables, optics, wavelengths
- **Layer 2 (Data Link)**: Switches, VLANs, MAC addresses
- **Layer 3 (Network)**: Routers, IP addresses, routing protocols

### Common Terms

- **MTU**: Maximum Transmission Unit - largest packet size (typically 9000 bytes for WAN links)
- **VLAN**: Virtual LAN - logically separates traffic on shared infrastructure
- **VRF**: Virtual Routing and Forwarding - isolates routing tables on same device
- **BGP**: Border Gateway Protocol - inter-network route exchange
- **GRE**: Generic Routing Encapsulation - tunneling protocol for overlay networks
- **TWAMP**: Two-Way Active Measurement Protocol - measures latency/loss between devices

### DoubleZero-Specific

- **Onchain**: In DoubleZero, device registrations, link configurations, and telemetry are recorded on the DoubleZero ledger — making network state transparent and verifiable by all participants
- **Controller**: Service that derives DZD configuration from onchain state on the DoubleZero ledger

---

Ready to begin? Start with [Requirements & Architecture](contribute.md).
