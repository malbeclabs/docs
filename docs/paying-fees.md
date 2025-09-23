# Validator Pricing & Seat Fees

**Simple, aligned pricing for Solana validators**

At mainnet-beta launch on September 30, 2025, a flat 5% seat fee on block signature rewards and priority fees unlocks DoubleZero's high-performance network and 3 million SOL stake-pool support. Additional revenue streams will phase in only after demonstrable value is delivered.

---

# **A Pricing Model Built for Network Effects**

**Aligned incentives**

The 5% seat fee directly tracks validator revenue. When validator earnings rise, DoubleZero revenue rises; when earnings fall, the fee automatically adjusts downward.

**Abundance mindset**

No marginal cost per transaction enables unrestricted communication between validators, accelerating network effects and removing incentives to ration bandwidth.

**Operational simplicity**

Fees are denominated and paid in SOL, and will eventually be automatically diverted via smart contract

---

# **Unlocking High-Performance Connectivity**

The 5% seat fee to connect with DoubleZero provides the connectivity and filtration services that translate into measurable improvements across the Solana stack.

- **Faster Slot Times:** Deterministic routing reduces latency and jitter for block propagation.
- **Multicast Delivery *(coming fall 2026)*:** Turbine traffic will shift to multicast, cutting propagation time even further and reducing duplicate shreds.
- **Larger Blocks**: Bandwidth capacity removes existing congestion and bottlenecks to larger blocks in the future.
- **Quicker Voting**: Lower latency means timely vote credits accumulate faster.
- **Geographic Reach:** Direct connectivity already supports operation from North America, Europe, and Asia with viable links into South America and the Middle East.
- **RPC & MEV Delivery**: More predictable delivery from RPCs and Jito searchers yields higher-value transactions and bundles.
- ***Filtration (coming 2026)***: Bespoke hardware filters duplicates and malformed signatures before reaching leader slots.

As additional validators, RPCs, and MEV participants join DoubleZero, these benefits multiply, culminating in step-changes like shorter slot times or larger blocks at supermajority adoption.

---

# **Fee Rollout Schedule**

Fees roll out in lockstep with value delivered:

- **Launch (Short Term)**
    
    **5% seat fee on base, voting, and priority fees. Immediate benefit: fast, deterministic, high-bandwidth connectivity for votes, RPC transactions, bundles, and shreds.**
    
- **Growth (Medium Term)**
    
    When DoubleZero demonstrably increases Jito tips (MEV) for validators by more than 5% through faster and more reliable bundle delivery, a 5% seat fee on that revenue stream begins.
    
- **Protocol Evolution (Long Term)**
    
    As a supermajority of Solana stake runs on DoubleZero, fundamental protocol changes (shorter slots, larger blocks, Alpenglow rearchitecture) become possible. Only then will DoubleZero charge 5% on inflationary rewards.

---

# **The Seat Fee in Perspective**

Solana validator commission rates today are effectively 15%, between inflation, priority fees, and MEV revenue. DoubleZero's flat 5% seat fee sits well below this rate while funding dedicated high-performance links and advanced routing.

CTA: Connect Validator

# **The 5% Seat Fee at Work**

The seat fee directly funds the infrastructure that makes DoubleZero possible:

- **Dedicated fiber connectivity** linking major data centers and frontier regions
- **Specialized hardware** for packet filtration, duplicate consolidation, and signature validation
- **Engineering and operations** to expand bandwidth, deploy multicast, and reduce slot times
- **Stake pool support** to help decentralize the Solana validator footprint

By tying fees to consensus-related revenues, the model aligns DoubleZero's incentives with validator performance while ensuring continued investment in network capacity and innovation. *Fees are paid in SOL into a validator deposit account configured on-chain.*

# **How to Pay**

**Effective September 30, 2025:** a **5% seat fee** applies to **block signature rewards** and **priority fees**. Additional revenue streams will phase in after demonstrable value is delivered.

## **What Is Billed at Launch**

- **Active:** 5% of block signature rewards and priority fees
- **Not active:** MEV tips, inflationary rewards

## **Settlement Model**

- Fees are denominated in SOL and settled per epoch
- Validator debt is computed on chain by the Revenue Distribution program
- Each validator has a deposit account (PDA) for payments
- Funding window: ideally within ~24 hours after epoch end
- Prefunding is supported. Balances draw down across epochs

[View Fee Estimates Repo](http://github.com/doublezerofoundation/fees)

---

# **Payment Checklist**

1. Derive deposit account (PDA) using validator identity pubkey.
2. Calculate epoch fee: 5% × total block rewards).
3. Fund within ~24 hours post epoch. Prefund an estimated payment (with a buffer) if desired; excess amounts can be applied to future epochs. [How to Send SOL>>](https://solana.com/tr/learn/sending-and-receiving-sol)
4. Monitor balance to ensure successful settlements.

---

# **Estimating Fees**

Historical estimates and per-pubkey data are available.

DoubleZero Fees Repo

block_rewards_data.csv: epochs 830 to 849, includes average rewards and a computed 5% column. This will be updated periodically.

[View Fee Estimates Repo](http://github.com/doublezerofoundation/fees)

Questions? Contact Nihar Shah at nihar@doublezero.us

# Developer Details

This process will be added as a CLI command by Sept 30 2025. For educational purposes the backend process is provided in detail below. 

Dependency
- [Rust](https://www.rust-lang.org/tools/install)


### Deposit Account Derivation


```rust
const REVENUE_DISTRIBUTION_PROGRAM_ID: Pubkey =
    solana_sdk::pubkey!("dzrevZC94tBLwuHw1dyynZxaXTWyp7yocsinyEVPtt4");

let (deposit_key, _) = Pubkey::find_program_address(
    &[&[b"solana_validator_deposit"], validator_identity_pubkey.as_ref()],
    &REVENUE_DISTRIBUTION_PROGRAM_ID,
);
```

Seed uses the validator identity public key
deposit_key is the SOL account for fee payments

### Transfer Example

```rust
let dz_payment = block_signature_rewards
    .checked_add(priority_fees)
    .expect("sum overflow")
    * 5 / 100;

let transfer_ix = solana_system_interface::instruction::transfer(
    &payer_key, 
    &deposit_key, 
    dz_payment
);
```