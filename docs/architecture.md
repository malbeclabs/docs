# Architecture

What makes up the different actors and components of the DoubleZero network?

Figure 1: Network architecture components

## Contributors

The DoubleZero network is made up of contributions from a growing community of distributed systems operators and network infrastructure providers in cities across the globe. Contributors bring physical link and/or compute resources to the network to provide the decentralized mesh network

### Bandwidth

The physical links of the DoubleZero network, most commonly in the form of fiberoptic cables or commonly referred to as wavelength services. Bandwidth contributors commit underutilized network links, owned or leased from infrastructure providers, between two or more data centers. Bandwidth links are terminated at both ends by DoubleZero Devices, physical network switching enclosures running instances of the DoubleZero Agent software.

#### DoubleZero Exchange (DZX / Cross-connect Site)

DoubleZero Exchanges (DZXs) are interconnect points in the mesh network where different contributor links are bridged together. DZXs are located in major metropolitan areas around the world where network intersections occur. Network bandwidth contributors pay to cross-connect their links into the broader DoubleZero mesh network at the DZXs geographically located nearest their link endpoints.

### Resource

Resource contributors host instances of the DoubleZero Ledger, providing the RPC endpoints to the rest of the DoubleZero network for users to configure the network and devices to read that configuration.

## Components

### DoubleZero Ledger

The DoubleZero Ledger is based on a fork of the Solana Agave client software. The DZ Ledger hosts the smart contract code that governs the DoubleZero protocol, the user accounts representing resource ownership and granting signing authority, and the data accounts storing the network identity and configuration information comprising the state of the network.

### DoubleZero Daemon

The DoubleZero Daemon software runs on servers needing to communicate over the DoubleZero network. The daemon interfaces with the host's kernel networking stack to create and manage tunnel interfaces, routing tables, and routes based on user configuration pushed to the DZ Ledger.

### Activator

The Activator service, a singleton service managed by the DoubleZero Foundation, monitors the DZ Ledger for contract events that require IP address allocations and state changes and manages those changes on behalf of the network.

### Controller

The Controller service, a singleton service managed by the DoubleZero Foundation, serves as the configuration interface for DoubleZero Device Agents to render their current configuration based on smart contract events submitted to the DZ Ledger.

### Agent

The Agent software runs directly on DoubleZero Devices and applies configuration changes to the devices from the shared network state of the DZ Ledger as interpreted by the Controller service. The Agent software polls the Controller for configuration changes, computes any diffs between the on-chain version of the Device state recorded in the DZ Ledger and the active configuration on the device and applies the necessary changes to reconcile the active configuration with the Ledger state.

### Device

The physical device enclosure providing the routing and link termination for the DoubleZero network. DZDs run the DoubleZero Agent software and are configured based on data read from the DZ Ledger via the Controller service.
