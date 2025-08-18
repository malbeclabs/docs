## Summary

Anyone who wishes to monetize their underutilized fiber optic cables and network hardware may contribute to the DoubleZero network. Network contributors must provide dedicated bandwidth between two points, operate DoubleZero compatible devices (DZDs) at each end, and a connection to the public internet at each end. Network contributors must also run DoubleZero software on each DZD to provide services like multicast, user lookup, and edge filtration.

The DoubleZero smart contract is the cornerstone of ensuring that the network maintains high-quality links that can be measured and integrated into the topology, allowing our network controllers to develop the most efficient end-to-end path between our different users and endpoints. Upon execution of the smart contract and deployment of the network equipment and bandwidth, an entity is classified as a network contributor.  See [DoubleZero Economics](https://economics.doublezero.xyz/overview) to further understand the economics behind participating in DoubleZero as a network contributor.

## Requirements to be a DoubleZero Network Contributor

- Dedicated bandwidth that can provide IPv4 connectivity and an MTU of 2048 bytes between two data centers
- DoubleZero Device (DZD) hardware that is compatible with the DoubleZero protocol
- Connectivity to the internet and other DoubleZero network contributors
- Installation of DoubleZero software on the DZD

## Quick Start Guide

As a network contributor, the simplest way to get started in DoubleZero is by identifying capacity in your network that can be dedicated for DoubleZero. Once identified, DZDs must be deployed, facilitating the DoubleZero overlay network which only requires IPv4 reachability and a minimum MTU of 2048 bytes as its dependencies from the contributor’s network.

Figure 1 highlights the simplest model for contributing bandwidth and packet sending and processing services. A DZD is deployed in each data center, interfacing with the network contributor’s internal network to provide DoubleZero WAN connectivity. This is complemented by local internet, typically a Direct Internet Access (DIA) solution, that is used as on-ramps for DoubleZero users. While it is expected that DIA will be the preferred option for facilitating access to users of DoubleZero, numerous connectivity models are possible e.g. physical cabling to servers, network fabric extension, etc. We refer to these options as Choose Your Own Adventure (CYOA), providing the contributor flexibility to connect local or remote users in a way that best fits their internal network policies.

As with any network, reachability is a fundamental part of the architecture as network contributors cannot live in isolation. As such, the DZD *must* have a link to a DoubleZero Exchange (DZX) to create a contiguous network between participants.

<figure markdown="span">
  ![Image title](images/figure1.png){ width="800" }
  <figcaption>Figure 1: DoubleZero Network Bandwidth Contribution Between 2 Data Centers - Single Contributor</figcaption>
</figure>

### Example Contributions

The ways in which a network contributor can grow their DoubleZero contributions are many, including:

- Improve the performance characteristics of their existing contributions: increase bandwidth, reduce latency
- Add multiple links between the same data centers
- Add a new link from an existing data center to a new data center
- Add a new, independent link between two new data centers

#### Example 1: Single Contributor, 3 Data Centers, Two Links
<figure markdown="span">
  ![Image title](images/figure2.png){ width="800" }
  <figcaption>Figure 2: DoubleZero Network Bandwidth Contribution Between 3 Data Centers - Single Contributor</figcaption>
</figure>

A single DZD can support multiple links contributed to DoubleZero. Figure 2 illustrates a potential topology if a single data center, denoted as 1, terminates bandwidth to two different remote data centers 2 and 3. In this scenario, each data center contains only 1 DZD. All DZDs are using DIA for user on-ramps as their CYOA interface.

#### Example 2: Single Contributor, 3 Data Centers, Three Links

Figure 3 describes the DoubleZero topology when a single contributor deploys three links in a triangle topology between 3 data centers. In a scenario similar to example 1, a single DZD is deployed in data centers 1, 2 and 3, each supporting 2 independent network links. The resulting topology is a triangle or ring between data centers.

<figure markdown="span">
  ![Image title](images/figure3.png){ width="800" }
  <figcaption>Figure 3: DoubleZero Network Bandwidth Contribution Between 3 Data Centers - Single Contributor </figcaption>
</figure>

### DoubleZero Exchange

The creation of a contiguous network is a fundamental building block of the DoubleZero architecture. Contributors interface via a DoubleZero Exchange (DZX) within a metropolitan area, which is a city such as New York (NYC), London (LON) or Tokyo (TYO). A DZX is a network fabric similar to an Internet Exchange, allowing peering and route exchange.

In figure 4, network contributor 1 operates in data centers 1, 2 and 3, while network contributor 2 operates in data centers 2, 4 and 5. By interconnecting in data center 2, the DoubleZero network reach increases to 5 contiguous data centers.

<figure markdown="span">
  ![Image title](images/figure4.png){ width="1000" }
  <figcaption>Figure 4: DoubleZero Network Bandwidth Contribution Between 2 Network Bandwidth Contributors </figcaption>
</figure>

### Bandwidth Contribution Options

DoubleZero requires a network contributor to offer integrated connectivity via a guaranteed bandwidth, latency and jitter profile between DZDs at two terminating data centers expressed via a smart contract. DoubleZero does not mandate how a network contributor implements their contribution, however, in the following sections we provide indicative options for use at their sole discretion.

Important areas to consider for a network contributor might be:

- Ability to guarantee network performance of the DoubleZero service: bandwidth, latency, and jitter
- Segregation from their existing internal network services
- IPv4 addressing clashes, specifically with the tunnel underlay address space
- Uptime and availability
- CAPEX and OPEX considerations

#### Layer 1 Bandwidth
<figure markdown="span">
  ![Image title](images/figure5.png){ width="800" }
  <figcaption>Figure 5: Layer 1 Optical Services </figcaption>
</figure>

Layer 1 bandwidth, more formally described as wavelength services, may see dedicated capacity provisioned on an existing optical infrastructure, such as DWDM, CWDM or via optical multiplexers (MUX). In figure 5, the DZDs use a colored optic that is cabled to an L1 MUX, which interleaves the DZD wavelength on to an existing dark fiber.

This solution has numerous benefits for network contributors who already operate an existing core network. The iterative operational changes, as well as additional CAPEX and OPEX requirements, are modest. This option is particularly robust in offering segregation from the network contributor's network services.

#### Packet Switched Bandwidth

Packet switched networks can be considered a typical enterprise network, running standard routing and switching protocols supporting business applications. There are numerous networking technologies that achieve connectivity, for example, layer 2 (L2) extensions using VLAN tags.

##### L2 Extension
<figure markdown="span">
  ![Image title](images/figure6.png){ width="800" }
  <figcaption>Figure 6: Packet Switched Networks - L2 Extension </figcaption>
</figure>

An L2 extension as shown in Figure 6 can be facilitated through VLAN tagging. A DZD’s port can be cabled to a contributor’s internal network switch, with the switch port being set as an access port in, for example, VLAN 10. Through 802.1q tagging, this VLAN can be carried over multiple switch-hops on the contributor’s network, terminating at the switch interfacing with the remote DZD.

This solution benefits from being widely supported and relatively easy to implement while creating segmentation between DoubleZero and internal layer 3 services. Bandwidth can be controlled based on the interface speed of the contributor’s internal switch or router. Careful consideration must be given to performance across the shared internal L2 network through technologies such as Quality of Service (QoS) or other traffic management policies. However, additional CAPEX and OPEX investments should be modest if existing capacity is available within the contributor’s core network.

#### Dedicated 3rd Party Bandwidth
<figure markdown="span">
  ![Image title](images/figure7.png){ width="800" }
  <figcaption>Figure 7: Dedicated 3rd Party Bandwidth </figcaption>
</figure>

While reusing available capacity will be attractive to many network contributors, one can also dedicate newly acquired bandwidth to DoubleZero. In such a scenario, the DZD would connect directly to the 3rd party carrier without any internal devices of the contributor sitting inline (figure 7).

This option is attractive as it ensures dedicated bandwidth for DoubleZero, is simple operationally and ensures complete segmentation from any other network services. This option will likely have the highest OPEX increase and requires new service contracts with 3rd party carriers.

## Install Guide
### Indicative Hardware Requirements - 100Gbps Bandwidth Contribution
Note that quantities below reflect equipment needed in two data centers, i.e. the total required hardware necessary to deploy 1 fiber optic cable for bandwidth contribution.

??? warning "*All FPGAs are subject to final testing.  10G contributions can be supported using Arista 7130LBR switches with inbuilt dual Virtex® UltraScale+™ FPGAs."

#### Function & Port Requirements

| Function                    | Port Speed | DZ Requirement | QTY | Note |
|-----------------------------|------------|----------------|-----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Private Bandwidth           | 100G       | Yes            | 1   |                                                                                                                                                                   |
| Direct Internet Access (DIA) | 10G       | Yes            | 2   |                                                                                                                                                                   |
| DoubleZero eXchange (DZX)   | 100G       | Yes*           | 1   | Must be supported once more than 3 providers operate in the same metro area, preceding this, cross-connects or other peering arrangements can be used to interconnect to other providers. |
| Management                  |            | No            | 1   | Determined by contributor's own internal management policies.                                                                                                    |
| Console                     |            | No             | 1   | Determined by contributor's own internal management policies.                                                                                                    |

#### DZD Network Hardware

| Make     | Model            | Part Number           | DZ Requirement | QTY | Note |
|----------|-----------------|----------------------|----------------|-----|-----------------------------------------------------------|
| AMD*      | C1100*           | V-C1100-P00G-PQ-G*    | Yes            | 4   |                                                           |
| LDA* | Unity*  | Unity*       | Yes            | 2   | Chassis for FPGA card (provides power only)                 |
| Arista   | 7280CR3A        | DCS-7280CR3A-32S    | Yes            | 2   | Alternatives may be possible if lead times are challenging. |

---

#### Optics - 100G

| Make   | Model         | Part Number     | DZ Requirement | QTY | Note |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 100GBASE-LR | QSFP-100G-LR    | No             | 16  | Cabling and optic choice available at contributor's discretion. 100G required to connect FPGAs. |

---

#### Optics - 10G

| Make   | Model         | Part Number     | DZ Requirement | QTY | Note |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 10GBASE-LR | SFP-10G-LR    | No             | 2   | Cabling and optic choice available at contributor's discretion. |
| Finisar | DynamiX QSA™ | MAM1Q00A-QSA   | No             | 2   | Cabling and optic choice available at contributor's discretion. |

---

#### IP Addressing

| IP Addressing | Minimum Subnet Size | DZ Requirement | Note |
|--------------|-------------------|----------------|----------------------------------------------------------|
| Public IPv4  | /29               | Yes            | Must be routable via DIA. We may eliminate the need for this over time. |

### Indicative Hardware Requirements - 10Gbps Bandwidth Contribution
Note that quantities reflect two data centers' equipment i.e. the total required hardware necessary to deploy 1 bandwidth contribution.

#### Function & Port Requirements

| Function                    | Port Speed | DZ Requirement | QTY | Note |
|-----------------------------|------------|----------------|-----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Private Bandwidth           | 10G        | Yes            | 1   |                                                                                                                                                                   |
| Direct Internet Access (DIA) | 10G        | Yes            | 2   |                                                                                                                                                                   |
| DoubleZero eXchange (DZX)   | 100G       | Yes*           | 1   | Must be supported once more than 3 providers operate in the same metro area; preceding this, cross-connects or other peering arrangements can be used to interconnect to other providers. |
| Management                  |            | No             | 1   | Determined by contributor's own internal management policies.                                                                                                    |
| Console                     |            | No             | 1   | Determined by contributor's own internal management policies.                                                                                                    |

---

#### Hardware

| Make     | Model            | Part Number           | DZ Requirement | QTY | Note |
|----------|-----------------|----------------------|----------------|-----|-----------------------------------------------------------|
| AMD*      | C1100*           | V-C1100-P00G-PQ-G*    | Yes            | 4   |                                                           |
| LDA* | Unity*  | Unity*       | Yes            | 2   | Chassis for FPGA card (provides power only)                 |
| Arista   | 7280CR3A        | DCS-7280CR3A-32S    | Yes            | 2   | Alternatives may be possible if lead times are challenging. |

---

#### Optics - 100G

| Make   | Model         | Part Number     | DZ Requirement | QTY | Note |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 100GBASE-LR | QSFP-100G-LR    | No             | 14  | Cabling and optic choice available at contributor's discretion. 100G required to connect FPGAs. |

---

#### Optics - 10G

| Make   | Model         | Part Number     | DZ Requirement | QTY | Note |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 10GBASE-LR | SFP-10G-LR    | No             | 4   | Cabling and optic choice available at contributor's discretion. |
 Finisar | DynamiX QSA™ | MAM1Q00A-QSA   | No             | 4   | Cabling and optic choice available at contributor's discretion. |
---

#### IP Addressing

| IP Addressing | Minimum Subnet Size | DZ Requirement | Note |
|--------------|-------------------|----------------|----------------------------------------------------------|
| Public IPv4  | /29               | Yes            | Must be routable via DIA. We may eliminate the need for this over time. |

### Data Center Requirements

#### Rack & Power Requirements

| Requirement  | Specification |
|-------------|--------------|
| Rack Space  | 4U           |
| Power       | 4KW (recommended) |

### DoubleZero Config Agent Installation

#### Prerequisites

1. Supported network hardware: Arista Networks 7130 and 7280 switches (see above).
2. Admin access to the Arista switch(es) that will be joining the DoubleZero network.
3. Each device's DoubleZero public key, generated by running the command `doublezero device create`.
4. Determine which Arista routing instance the agent will use to connect to the DoubleZero Controller. If you can ping the controller with `ping <W.X.Y.Z>` where W.X.Y.Z is the IP address of the DoubleZero Controller, you will use the default routing instance, named `default`. If you need to specify a VRF, for example with `ping vrf management <W.X.Y.Z>`, then your routing instance would be `management`.

#### Agent Installation Steps

Use these steps if your DoubleZero Agent will connect to the DoubleZero Controller using Arista's default routing instance.

1. To allow agents running on the local devices, including doublezero-agent, to call the local device's API, enter the following into the EOS configuration:
    ```
    !
    ! Replace the word "default" with the VRF name identified in prerequisites step 4
    !
    management api eos-sdk-rpc
        transport grpc eapilocal
            localhost loopback vrf default
            service all
            no disabled
    ```

2. Download and install the current stable doublezero-agent binary package

    a. As admin on the EOS CLI, run the `bash` shell command and then enter the following commands:
        ```
        switch# bash
        $ sudo bash
        # cd /mnt/flash
        # wget https://dl.cloudsmith.io/public/malbeclabs/doublezero/rpm/any-version/x86_64/doublezero-agent-<X.Y.Z>_linux_amd64.rpm
        # exit
        $ exit
        ```

    !!! note
        You can find more info about Arista EOS extensions [here](https://www.arista.com/en/um-eos/eos-managing-eos-extensions)

    b. Back on the EOS CLI, set up the agent
        ```
        switch# copy flash:doublezero-agent_<X.Y.Z>_linux_amd64.rpm extension:
        switch# extension doublezero-agent_<X.Y.Z>_linux_amd64.rpm
        switch# copy installed-extensions boot-extensions
        ```
    c. Verify the extension

    The Status should be "A, I, B".
        ```
        switch# show extensions
        Name                                        Version/Release     Status     Extension
        ------------------------------------------- ------------------- ---------- ---------
        doublezero-agent_<X.Y.Z>_linux_amd64.rpm    X.Y.Z/1             A, I, B    1

        A: available | NA: not available | I: installed | F: forced | B: install at boot
        ```

3. To set up and start the agent, go back to EOS command line, add the following to the Arista EOS configuration:
    a. Configure the doublezero-agent
    ```
    !
    ! Replace the word "default" with the VRF name identified in prerequisites step 4
    !
    daemon doublezero-agent
    exec ip netns exec ns-default /usr/local/bin/doublezero-agent -pubkey <PUBKEY>
    no shut
    ```
    b. Verify that the agent is working
    When the agent is up and running you should see the following log entries:
    ```
    switch# ceos2#show agent doublezero-agent logs
    2025/01/21 18:17:52 main.go:71: Starting doublezero-agent
    2025/01/21 18:17:52 main.go:72: doublezero-agent controller: 18.116.166.35:7000
    2025/01/21 18:17:52 main.go:73: doublezero-agent sleep-interval-in-seconds: 5.000000
    2025/01/21 18:17:52 main.go:74: doublezero-agent controller-timeout-in-seconds: 2.000000
    2025/01/21 18:17:52 main.go:75: doublezero-agent pubkey: 111111G5zfGFHe9aek69vLPkXTZnkozyBm468PhitD7U
    2025/01/21 18:17:52 main.go:76: doublezero-agent device: 127.0.0.1:9543
    2025/01/21 18:17:52 dzclient.go:32: controllerAddressAndPort 18.116.166.35:7000
    ```

#### Agent Upgrade Steps

1. Download the latest version of agent:
```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget https://dl.cloudsmith.io/public/malbeclabs/doublezero/rpm/any-distro/any-version/x86_64/doublezero-agent_<X.Y.Z>_linux_amd64.rpm
# exit
$ exit
```

2. Back on the EOS CLI, remove the old version
First, find the filename of the old version, similar to the new version downloaded but one or more versions behind the new one: `doublezero-agent_<W.X.Y>_linux_amd64.rpm`
```
switch# show extensions
```
Run the following commands to remove the old version. Replace the filenames below with the one from the `show extensions` command above.
```
switch# delete flash:doublezero-agent_<W.X.Y>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<W.X.Y>_linux_amd64.rpm
```
3. Set up the new agent version
```
switch# copy flash:doublezero-agent_<X.Y.Z>_linux_amd64.rpm extension:
switch# extension doublezero-agent_<X.Y.Z>_linux_amd64.rpm
switch# copy installed-extensions boot-extensions
```

4. Verify the extension

    The Status should be "A, I, B".
    ```
    switch# show extensions
    Name                                        Version/Release    Status     Extension
    ------------------------------------------- ------------------ ---------- ---------
    doublezero-agent_<X.Y.Z>_linux_amd64.rpm    <X.Y.Z>/1          A, I, B    1

    A: available | NA: not available | I: installed | F: forced | B: install at boot
    ```

#### Verify Agent Log Output

```
show agent doublezero-agent log
```

### DoubleZero Telemetry Agent Installation

#### Prerequisites

1. Supported network hardware: Arista Networks 7130 and 7280 switches (see above).
2. Admin access to the Arista switch(es) that will be joining the DoubleZero network.
3. Each device's DoubleZero public key, generated by running the command `doublezero device create`.
4. Determine which Arista routing instance the agent will use to connect to the DoubleZero Ledger. If you can ping the ledger with `ping doublezero-mainnet-beta.rpcpool.com`, you will use the default routing instance, named `default`. If you need to specify a VRF, for example with `ping vrf management doublezero-mainnet-beta.rpcpool.com`, then your routing instance would be `management`.

#### Agent Installation Steps

Use these steps if your DoubleZero Agent will connect to the DoubleZero Controller using Arista's default routing instance.

1. Install a metrics publisher keypair

    a. Outside of the device, generate a keypair:

      ```sh
      doublezero keygen -o metrics-publisher-keypair.json
      ```

    b. Save the keypair on the device at `/mnt/flash/metrics-publisher-keypair.json`

    c. Register it onchain on the DoubleZero ledger:

      ```sh
      doublezero device update --pubkey <DEVICE_PUBKEY> --metrics-publisher <METRICS_PUBLISHER_PUBKEY>
      ```

2. Download and install the current stable doublezero-telemetry binary package

    a. As admin on the EOS CLI, run the `bash` shell command and then enter the following commands:

      ```
      switch# bash
      $ sudo bash
      # cd /mnt/flash
      # wget https://dl.cloudsmith.io/public/malbeclabs/doublezero/rpm/any-version/x86_64/doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm
      # exit
      $ exit
      ```

    !!! note
        You can find more info about Arista EOS extensions [here](https://www.arista.com/en/um-eos/eos-managing-eos-extensions)

    b. Back on the EOS CLI, set up the agent

      ```
      switch# copy flash:doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm extension:
      switch# extension doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm
      switch# copy installed-extensions boot-extensions
      ```

    c. Verify the extension

    The Status should be "A, I, B".

      ```
      switch# show extensions
      Name                                                      Version/Release     Status     Extension
      --------------------------------------------------------- ------------------- ---------- ---------
      doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm    X.Y.Z/1             A, I, B    1

      A: available | NA: not available | I: installed | F: forced | B: install at boot
      ```

3. To set up and start the agent, go back to EOS command line, add the following to the Arista EOS configuration:
    a. Configure the doublezero-telemetry

    ```
    !
    ! Replace the word "default" with the VRF name identified in prerequisites step 4
    !
    daemon doublezero-agent
    exec /usr/local/bin/doublezero-device-telemetry-agent --management-namespace ns-default --local-device-pubkey <DEVICE_PUBKEY> --env testnet --keypair /mnt/flash/metrics-publisher-keypair.json
    no shut
    ```
    b. Verify that the agent is working
    When the agent is up and running you should see the following log entries:
    ```
    switch# ceos2#show agent doublezero-telemetry logs
    time=2025-08-18T18:54:04.341Z level=INFO msg="Starting telemetry collector" twampReflector=0.0.0.0:862 localDevicePK=<DEVICE_PUBKEY> probeInterval=10s submissionInterval=1m0s
    time=2025-08-18T18:54:04.342Z level=INFO msg="Starting peer discovery" refreshInterval=10s
    time=2025-08-18T18:54:04.342Z level=INFO msg="Starting submission loop" interval=1m0s maxRetries=5 metricsPublisherPK=<METRICS_PUBLISHER_PUBKEY>
    time=2025-08-18T18:54:04.342Z level=INFO msg="Starting probe loop"
    time=2025-08-18T18:54:14.363Z level=DEBUG msg="Refreshed peers" devic
    ```

#### Agent Upgrade Steps

1. Download the latest version of telemetry agent:

    ```
    switch# bash
    $ sudo bash
    # cd /mnt/flash
    # wget https://dl.cloudsmith.io/public/malbeclabs/doublezero/rpm/any-version/x86_64/doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm
    # exit
    $ exit
    ```

2. Back on the EOS CLI, remove the old version

    First, find the filename of the old version, similar to the new version downloaded but one or more versions behind the new one: `doublezero-device-telemetry-agent_<W.X.Y>_linux_amd64.rpm`

    ```
    switch# show extensions
    ```

    Run the following commands to remove the old version. Replace the filenames below with the one from the `show extensions` command above.

    ```
    switch# delete flash:doublezero-device-telemetry-agent_<W.X.Y>_linux_amd64.rpm
    switch# delete extension:doublezero-device-telemetry-agent_<W.X.Y>_linux_amd64.rpm
    ```

3. Set up the new agent version

    ```
    switch# copy flash:doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm extension:
    switch# extension doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm
    switch# copy installed-extensions boot-extensions
    ```

4. Verify the extension

    The Status should be "A, I, B".
    ```
    switch# show extensions
    Name                                                      Version/Release    Status     Extension
    --------------------------------------------------------- ------------------ ---------- ---------
    doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm    <X.Y.Z>/1          A, I, B    1

    A: available | NA: not available | I: installed | F: forced | B: install at boot
    ```

#### Verify Agent Log Output

```
show agent doublezero-telemetry log
```
