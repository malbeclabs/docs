# Welcome to DoubleZero

DoubleZero is a decentralized framework for creating and managing high-performance permissionless networks, optimized for distributed systems like blockchain. It enables permissionless contributions of underutilized private fiber links to create a dynamic and expansive network.

What are the benefits of connecting to DZ? Compared to the public internet, the DoubleZero network offers two improvements to blockchains. First, inbound transactions can be edge-filtered (i.e. removed of spam and duplicates) by specialized hardware prior to being sent over the DoubleZero network. This allows blockchains to benefit from shared system-wide filtration resources rather than needing each individual validator to provision sufficient resources. Second, outbound messages can be explicitly routed, tracked, and prioritized to improve efficiency. V alidators can control latency and reduce jitter (i.e. random variation) in that latency in reaching consensus. Taken together, the DoubleZero network can achieve levels of performance that are otherwise unobtainable without the centralized co-location of systems.

For more details, see the [DoubleZero Protocol](https://doublezero.xyz/whitepaper.pdf) whitepaper.

TODO: Convert from outline to narrative format:

- What does DoubleZero do on my host?
    - This software package provides a command line interface (CLI) and small daemon to interface with doublezero smart contracts and provision the connection.
    - Once you have connected to DoubleZero, a network tunnel interface appears to the host OS as normal network interface with a DoubleZero-assigned IP.
    - Your host will use this tunnel interface to communicate to other hosts on the DoubleZero network.
- System architecture components - blockchain, doublezero CLI, doublezerod, controller, eosagent

What's next? Learn [how to connect to DoubleZero](/how-to-connect/).