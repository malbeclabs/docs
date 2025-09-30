# Validator Pricing & Fees

**Simple, aligned pricing for Solana validators**

Fees will start epoch 859, which starts Saturday October 4th at 4am ET. A flat 5% fee is charged on block signature rewards and priority fees.

The fees directly fund the infrastructure which makes DoubleZero possible. Including physical fiber lines, and equipment in data centers.

An in depth exploration of why fees exist, and the validator pricing model can be found [here](https://doublezero.xyz/fees).

***This guide focuses on how fees are paid from a technical perspective.***

## **Settlement Model**

- Fees are denominated in SOL and settled per epoch
- Validator debt is computed on chain by the Revenue Distribution program
- Each validator has a deposit account (PDA) for payments
- Funding window: Fees are deposited during the Solana epoch following their accrual. IE fees which are accumulated during epoch 860, need to be paid in epoch 861.

- Prefunding is supported. Balances draw down across epochs

---

# **Payment Checklist**

1. Derive deposit account (PDA) using validator identity pubkey.
2. Calculate epoch fee: 5% × total block rewards.
3. Fund within ~24 hours post epoch. Prefund an estimated payment (with a buffer) if desired; excess amounts can be applied to future epochs. [How to Send SOL>>](https://solana.com/tr/learn/sending-and-receiving-sol)
4. Monitor balance to ensure successful settlements.

---

# **Estimating Fees**

Historical estimates and per-pubkey data are available in the [Fee Estimates Repo](http://github.com/doublezerofoundation/fees). The repo does not replace on chain data. You are responsible for the balance on chain, not in the balance in this repo.

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