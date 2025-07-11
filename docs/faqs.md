# Frequently asked question (FAQ)

## Who

**Who do I contact to join DoubleZero testnet?**

- [hello@doublezero.xyz](mailto:hello@doublezero.xyz)

**How do I get support after I join testnet?**

- For testnet users DoubleZero Foundation has established a community Slack channel to collaborate, ask questions and report findings.  Later on we expect there will be a communication channel like Discord to collaborate with testnet and mainnet-beta users.

**Who are the existing network contributors supporting DoubleZero’s physical network?**

- For testnet, Jump Trading is the primary contributor.

**Can I use the DoubleZero network if my system is not a blockchain validator?**

- In the initial implementation, DoubleZero is compatible with the Agave and Firedancer validator clients as well as RPC and MEV nodes supporting them. This focus allows the first version of DoubleZero to provide the integrated information service fully optimized for its users and authorize access to the service using the identity and attestation tooling native to that user community. In the near future, the protocol is expected to evolve to natively support other distributed networks (blockchain L1s and L2s) as well.

## What

**What are the FPGA capabilities on DoubleZero?**

- Once enabled, the DoubleZero FPGA implementation will provide transaction deduplication and signature verification of UDP traffic (not QUIC), also referred to as the "edge filtration" feature of the network.  We are actively working on a solution that balances the benefits of QUIC with the benefits of spam prevention.

**Which validator clients have been tested on DoubleZero testnet?**

- Latest versions of Agave >= `v2.0.x` and >= `v2.1.x` (with workaround, permanent fix in [testing](https://github.com/anza-xyz/agave/pull/4581))
- Latest versions of Jito >= `v2.0.x-jito` and `v2.1.x-jito` (with workaround, permanent fix in [testing](https://github.com/jito-foundation/jito-solana/pull/770))
- Frankendancer with skb mode partially works but we’re working with the Firedancer team to make a full release with DoubleZero support in XDP for both Franken and Firedancer

**What should I expect to see in terms of performance improvement after I connect and run my validator on DoubleZero?**

- For testnet, you should see reduced jitter when communicating with other validators on testnet. For mainnet-beta, when you communicate with other users on DoubleZero, you should see reduced jitter and latency, and a reduction in duplicate UDP packets.

**Can I connect to DoubleZero without running the DoubleZero software?**

- No, not yet.  If there are use cases in mind where you’d like to connect to DoubleZero without the DoubleZero software package please reach out to [hello@doublezero.xyz](mailto:hello@doublezero.xyz).  It is possible that alternative DoubleZero clients will be built.

**Is anybody already running a Solana mainnet-beta validator on the DoubleZero testnet?**

- Yes, there are multiple mainnet-beta validators running on DZ testnet. Some were created by Malbec Labs and our network contributors for testing purposes leading up to our testnet launch, and others are run by third-parties that want to benefit from the DoubleZero network.

**What are the reliability guarantees of DoubleZero testnet?**

- We aim to notify users ahead of any breaking changes. That said, we are not able to offer any specific guarantees [see T&Cs](https://doublezero.xyz/terms.pdf).

**Does a contributor running a DoubleZero device require special hardware?**

- Yes. Being a network contributor is more than merely passing along data. Running a DoubleZero device requires connecting physical Arista devices that are publicly available (vanilla bare metal servers will not work) to a point-to-point circuit such as a wavelength service, or an L2 extension.  It can use existing network capacity, or the network contributor can light up dark fiber as a wavelength service and contribute it to the protocol.

**GRE has 24 bytes of overhead.  Does that cause packet fragmentation if we still target an MTU size of 1232 bytes?**

- Packet fragmentation will not occur for packets transiting the DoubleZero network since the DoubleZero network can handle jumbo frames.  For packets transiting the public internet inside DoubleZero user tunnels, we also do not expect packet fragmentation because even though the payload is targeted to 1232 bytes, the total packet size can be up to 1500 bytes which leaves plenty of headroom.

## When

**When can I connect to testnet?**

- DoubleZero testnet is live.  Please send your GitHub account names to [hello@doublezero.xyz](mailto:hello@doublezero.xyz) and we’ll send you instructions to connect.

**I have read that the DZ network is multicast-enabled.  How does that work?**

- The multicast feature is an implementation unique to DoubleZero in that it implements the broadcast of packets to receiving devices in a publish/subscribe model. When establishing a multicast tunnel for a client device connecting to the DoubleZero network, the user defines a multicast group and the client in either publisher or subscriber mode. Packets sent by a multicast group publisher are replicated to all client devices in subscriber mode to the same multicast group.

## Where

**GitHub software location:**

- Open sourcing is on our near-term roadmap.  In the mean time, packaged versions of the software are hosted in our apt/yum repos hosted by Cloudsmith.  We recognize many users will want to compile this software from the source code and will open our repo to the public as soon as we're able.

**Where does DoubleZero testnet have a physical presence?**

- The following cities have testnet POPs: Singapore, Tokyo, Los Angeles, New York, London, Frankfurt, Amsterdam.  We use IATA codes to identify these locations in the protocol.


## How

**How do I join testnet?**

- Please send your GitHub account name(s) to [hello@doublezero.xyz](mailto:hello@doublezero.xyz) and we'll send you instructions to connect.

**As a user, do I have to ask my bare metal hosting provider to change anything in my hosting environment?**

- No.  Any internet-connected Ubuntu or RHEL-based Linux system with a public IP can connect to DoubleZero.  The performance of the network will be better depending on how close your computer is to the nearest DoubleZero contributor's physical location.

**I run an RPC service, how can I connect to DoubleZero?**

- On testnet, RPC hosts can join as any other host. When we get to mainnet-beta there may be separate smart contracts for different classes of users.

**How do I fail over to my existing internet connection if I am having problems with my DZ connection?**

- The answer depends on what your next step is.  If you wish to leave DoubleZero altogether, use `doublezero disconnect` … if you expect to reconnect after DoubleZero is repaired, you can simply stop `doublezerod` using `systemctl stop doublezerod`.  In either case you need to restart the validator process and bind to a new IP address that you wish to use.  This is because none of the existing Solana validator client implementations have multi-homing awareness but both Agave and Firedancer maintaining teams are working to add this support.
- We intend to provide docs for the failover process for each validator client stack which can be integrated into your ops processes

**Will I run the same validator client as I am running now?**

- Yes.  You can use the same client as DoubleZero doesn’t interfere with the Solana code.  Once the FPGAs are enabled, DZ’s dedupe and sigverify process will happen at the edge of the network before your validator client receives the packets for processing.

**Will I need to run sigverify again once I receive the deduped transaction traffic from DoubleZero?**

- The DoubleZero FPGA will drop packets that match the criteria to be verified by the FPGA (UDP port) and that are improperly signed before they arrive at your network interface.  However, we expect that all validator software clients will continue to verify valid signatures prior to packing.

**Does DoubleZero introduce any new attack vectors?**

- We initially developed `doublezerod` under a root user but as of v0.21.0 it runs as an unprivileged user with appropriate CAP_NET_* permissions to the devices with which it needs to communicate.
