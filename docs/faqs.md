# Frequently asked question (FAQ)

## Who

**Who do I contact to join DoubleZero testnet-beta?**

- [hello@doublezero.xyz](mailto:hello@doublezero.xyz)

**How do I get support after I join testnet-beta?**

- For early testnet-beta users the DoubleZero Foundation has established a community Slack channel to collaborate, ask questions and report findings.  Later on we expect the DoubleZero Foundation will also provide a communication channel like Discord to collaborate with testnet-beta and mainnet-beta users.

**Who are the existing network contributors supporting DoubleZero’s physical network?**

- For testnet-beta, Jump Trading is the primary contributor of network bandwidth.

## What

**What are the FPGA capabilities on DoubleZero testnet-beta?**

- Once enabled, the DoubleZero testnet-beta FPGA implementation will provide transaction deduplication and signature verification of UDP traffic (not QUIC).  We are actively working on a solution that balances the benefits of QUIC with the benefits of spam prevention.

**Which validator clients have been tested on DoubleZero testnet-beta?**

- Latest versions of Agave >= `v2.0.x` and >= `v2.1.x` (with workaround, permanent fix in [testing](https://github.com/anza-xyz/agave/pull/4581))
- Latest versions of Jito >= `v2.0.x-jito` and `v2.1.x-jito` (with workaround, permanent fix in [testing](https://github.com/jito-foundation/jito-solana/pull/770))
- Frankendancer with skb mode partially works but we’re working with the Firedancer team to make a full release with DoubleZero support in XDP for both Franken and Firedancer

**What should I expect to see in terms of performance improvement after I connect and run my validator on DoubleZero?**

- For testnet-beta, you should see reduced jitter when communicating with other validators on testnet-beta. For mainnet-beta, when you communicate with other users on DoubleZero, you should see reduced jitter and latency, and a reduction in duplicate UDP packets.

**Can I connect to DoubleZero without running your software?**

- No, not yet.  If there are use cases in mind where you’d like to connect to DoubleZero without our software package please reach out to us.  We do expect alternative DoubleZero clients will be built.

**Is anybody already running a Solana mainnet-beta validator on the DoubleZero testnet-beta?**

- Yes, there are four mainnet-beta validators running on DZ testnet-beta that were created by Malbec Labs and our network contributors for testing purposes leading up to our testnet-beta launch.

**What are the reliability guarantees of DoubleZero testnet-beta?**

- We aim to follow a similar process to Solana testnet where if we are introducing a breaking change, we will do our best to notify users ahead of time.

**Does running a DoubleZero device require special hardware?**

- Running a DoubleZerodevice device requires connecting physical Arista devices built to spec (bare metal servers will not work) to a point-point circuit such as a wavelength service, an L2 extension or an L3 packet service.  It can use existing network capacity, or the network contributor can light up dark fiber as a wavelength service and contribute it to the protocol.

**GRE has 24 bytes of overhead.  Does that cause packet fragmentation if we still target an MTU size of 1232 bytes?**

- Packet fragmentation will not occur for packets transiting the DoubleZero network since the DoubleZero network can handle jumbo frames.  For packets transiting the public Internet inside DoubleZero user tunnels, we also do not expect packet fragmentation because even though the payload is targeted to 1232 bytes, the total packet size can be up to 1500 bytes which leaves plenty of headroom.

## When

**When can I connect to testnet-beta?**

- DoubleZero testnet-beta is in early user testing and is presently invite-only.  Please send your GitHub account names to [hello@doublezero.xyz](mailto:hello@doublezero.xyz) and we’ll respect the order in which we receive the requests.

**I have read that the DZ network is multicast-enabled.  How does that work?**

- Multicast functionality is still being developed  and will be released later this year.


## Where

**GitHub software location:** 

- Open sourcing is on our near term roadmap but is not done.  In the mean time, packaged versions of the software are hosted in our apt/yum repos hosted by Cloudsmith.  We recorgnize many users will want to compile this software from the source code and will open our repo to the public as soon as we're able.

**GitHub setup guide location:**

- [https://docs.malbeclabs.com](https://docs.malbeclabs.com) — this link is behind GitHub authentication and requires the user to be a collaborator on the `docs-demo` repo.  Please contact [hello@doublezero.xyz](mailto:hello@doublezero.xyz) to get on the invite list.  If you’re seeing this page then you already have access.

**Where does DoubleZero testnet-beta have a physical presence?**

- The following cities have testnet-beta POPs: Singapore, Tokyo, Los Angeles, New York, London, Frankfurt, Amsterdam.  We use IATA codes to identify these locations in the protocol.


## How

**How do I join testnet-beta?**

- DoubleZero testnet-beta is presently invite-only and will remain this way until our public launch.  If you’re interested in joining please email [hello@doublezero.xyz](mailto:hello@doublezero.xyz) and we’ll send you a Google Form which will help us organize the participants.  Invitations will be sent based on available testnet-beta slots in each region; we’ll be adding more slots over time.

**Do I have to ask my bare metal hosting provider to change anything in my hosting environment?**

- No.  Any internet-connected Ubuntu or RHEL-based Linux system with a public IP can connect to doublezero.  The performance of the network will be better depending on how close your computer is to the nearest DoubleZero location.

**Which parts of DoubleZero testnet-beta have been decentralized at this stage?**
- Resource allocation is completely decentralized as it lives on the Solana blockchain. Provisioning of network nodes to accept DoubleZero connections is currently centralized and operated by Malbec Labs. DoubleZero plans to decentralize provisioning in the future.

**I run an RPC service, how can I connect to DoubleZero?**

- On testnet-beta, RPC hosts can join as any other host.  When we get to mainnet there may be separate smart contracts for different classes of users.

**How do I fail over to my exiting Internet connection if I am having problems with my DZ connection?**

- The answer depends on what your next step is.  If you wish to leave DoubleZero altogether, use `doublezero disconnect` … if you expect to reconnect after DoubleZero is repaired, you can simply top `doublezerod` using `systemctl stop doublezerod`In either case you need to restart the validator process and bind to a new IP address that you wish to use.  This is because none of the existing Solana validators client have multi-homing awareness but we’re working with both Anza and Firedancer to add this support.
- We intend to provide docs for the failover process for each validator client stack which can be integrated into your ops processes

**Will I run the same validator client as I am running now?**

- Yes.  You can use the same client, DZ doesn’t interfere with the Solana code.  Once we enable the FPGAs in testnet, DZ’s dedupe and sigverify process will happen at the edge of the network before you process the packets.

**Will I need to run sigverify again once I receive the deduped transaction traffic from DZ?**

- The DoubleZero FPGA will drop packets that matches the criteria to be verified by the FPGA (UDP port) and that are improperly signed before they arrive at your network interface.  However, we expect that all validator software clients will continue to verify valid signatures prior to packing.

**Does DoubleZero introduce any new attack vectors?**

- We initially developed `doublezerod` under a root user but as of v0.21.0 it runs as an unprivileged user with appropriate CAP_NET_* permissions to the devices it needs to communicate with.