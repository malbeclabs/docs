---
description: "DoubleZero Edge for Builders on testnet: deploy a market data feed on DoubleZero Edge against a 2Z bond. Components, testnet bond tiers, and requirements."
---

# DoubleZero Edge for Builders

DoubleZero Edge for Builders lets a builder deploy a market data feed on DoubleZero Edge and sell it to subscribers. A builder posts a 2Z [bond](#bond) and deploys a feed against it. These pages describe how to do that on DoubleZero testnet with the DoubleZero command line tools or the builder API.

Deploying a feed does not require approval from the DoubleZero Foundation. The builder signs every transaction with their own key.

!!! info "Testnet only"
    These pages cover DoubleZero testnet. The bond tiers, amounts, and hold period shown here apply to testnet only. Mainnet-beta will use different values.

!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol)"

## Components

A deployed feed is made up of the following:

1. **Bond.** 2Z the builder locks in the builder bond program on Solana devnet. The bond's tier sets the maximum bandwidth the feed may use.
2. **Multicast group.** An address on the DoubleZero network. The builder's publisher sends to it, and subscribers join it.
3. **Feed.** The DoubleZero ledger account that subscribers buy access to. It records the feed's multicast groups, its bond, the wire spec it publishes, and its committed rate.
4. **Publisher grant.** Permission for the builder's host IP address to send to the multicast group.

The bond must exist before anything else. The protocol copies each funded bond from Solana devnet to the DoubleZero ledger, and the ledger will not create a multicast group or a feed without that copy. One bond supports one feed and up to four multicast groups.

## Bond

The committed rate is the maximum bandwidth a feed will use. It determines the bond's tier, and the tier determines how much 2Z the bond must hold. The testnet tiers are:

| Committed rate | Required bond |
|----------------|---------------|
| Up to 1 Gbps | 1 2Z |
| Up to 5 Gbps | 2 2Z |
| Above 5 Gbps | 5 2Z |

On testnet the bond is posted in devnet 2Z, which has no value. The [DoubleZero devnet faucet](publish-a-feed.md#step-2-get-devnet-2z-and-sol) provides enough for any tier.

On testnet, the first post to a bond starts a 180-day hold. Later posts do not restart it. Once the hold ends, the builder can withdraw any 2Z above what the tier requires.

## Forfeiture

The bond backs two commitments. The feed must stay within its committed rate, because exceeding it degrades the network for other users. The feed must also meet any service level the builder declares, because that declaration is what subscribers are paying for. Breaking either commitment is grounds for forfeiting the bond. Nothing is forfeited on testnet.

## Requirements

- A Linux x86_64 host with a public IPv4 address and no NAT, such as an EC2 or GCE instance or a bare metal server. It does not need to be connected to DoubleZero yet.
- Root or sudo access on that host.
- An application that publishes your data in one of the [supported wire specs](choose-a-spec.md).
- A second host to subscribe from, to confirm that your feed arrives.

## Guides

- [Publish a feed on testnet](publish-a-feed.md): set up a host, post a bond, and deploy a feed.
- [Choose a spec](choose-a-spec.md): pick a wire format and check your feed against it.
- [Operate your feed](operate.md): halt, resume, and retire a feed; add multicast groups; withdraw from a bond.
- [Builder API reference](api.md): every API endpoint, and how to sign the instructions it returns.

## Support

If you need help deploying or operating a feed, [request support](https://airtable.com/appQ8e047TKOgqV3h/pagIf9qvCcXlzDsDc/form) or ask in the [DoubleZero Discord](https://discord.com/invite/doublezerotech).
