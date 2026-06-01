# Validator Rewards
!!! warning "By connecting to DoubleZero, I agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol)"

Validators that publish leader shreds to DoubleZero Edge earn rewards each epoch. Before rewards can be paid, each validator must register **where** rewards go by configuring a `ValidatorPublisherRewards` account on Solana. That account stores:

- the **rewards mint** — the token rewards are paid in 2z (unless manually changed)
- the **rewards owner** — the wallet that owns the Associated Token Account (ATA) receiving rewards

The `configure` command will set these fields, and automatic payouts will occur on an epoch by epoch basis thereafter. You can re-run `configure` later to change either field.

!!! info "If you have not yet completed [Setup](setup.md), [Validator Mainnet-Beta Connection](DZ%20Mainnet-beta%20Connection.md), and [Validator Multicast Connection](Validator%20Multicast%20Connection.md), do that first."

## Prerequisites

- Validators publishing leader shreds - see [Validator Multicast Connection](Validator%20Multicast%20Connection.md).
- The latest `doublezero-solana` CLI: `sudo apt update && sudo apt install doublezero-solana`, at a minimum `0.5.6`.
- Access to the **validator identity keypair**, either on the same box or kept offline with the ability to sign a message.
- A destination wallet pubkey that will own the rewards ATA.

---

## 1. Choose an Auth Path

Configuring the rewards account requires authorization from the validator identity key. There are two ways to provide it:

| Path | When to use |
|---|---|
| **Direct** | The validator identity keypair is on the box you're running commands from.|
| **Offchain** | The validator identity keypair is kept offline or on a separate machine from the fee-payer wallet. |

---

## 2a. Direct Path

Run `configure` with the validator identity keypair as `-k`. 

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    -k <path-to-validator-identity-keypair.json>
```
Example Output
```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         direct
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```
`Configured validator publisher rewards: ` outputs the txt you can view in a block explorer.

| Flag | Description |
|---|---|
| `--node-id` | Validator node identity pubkey. |
| `--rewards-token-owner` | Wallet that will own the receiving ATA. |
| `--rewards-token-mint` | The wallet token rewards will be received in `2z`. Supported tokens also include `usdc` and `wsol`.  |
| `-k` | Path to the validator identity keypair. On the direct path, the keypair's pubkey must equal `--node-id` or the command will error out and tell you to switch to the offchain path. |

The ATA is auto-initialized in the same transaction if it doesn't yet exist.

Skip ahead to [step 3](#3-verify-the-configuration).

---

## 2b. Offchain Path

Three sub-steps: prepare, sign, configure.

### 2b.i. Prepare the offchain message

Run this anywhere — it's read-only and does not need the validator identity keypair. It prints the hex blob to sign and the absolute slot the signature expires at.

```bash
doublezero-solana shreds publisher-rewards prepare-offchain-message \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --valid-for 1h
```
Example Output

```bash
Hex message:    123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3
Deadline slot:  422954444

Sign with:
  solana sign-offchain-message 123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3 --keypair <validator-identity>

Then submit:
  doublezero-solana shreds publisher-rewards configure \
    --node-id ValidatorIdentity111111111111111111111111111 --rewards-token-mint J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd --rewards-token-owner Wallet567Identity111111111111111111111111111 \
    --deadline-slot 422954444 --signature <BASE58>
```


| Flag | Description |
|---|---|
| `--node-id` | Validator node identity pubkey. |
| `--rewards-token-owner` | Wallet that will own the receiving ATA. |
| `--rewards-token-mint` | The wallet token rewards will be received in `2z`. Supported tokens also include `usdc` and `wsol`.  |
| `--valid-for` | Signature lifetime relative to the current slot. Accepts `<n>s`, `<n>m`, or `<n>h`. Default: `1h`. |
| `--deadline-slot` | Alternative to `--valid-for`: absolute slot the authorization expires at. Mutually exclusive with `--valid-for`. |
| `--json` | Emit JSON (`{ hex, deadline_slot }`) instead of the human summary. |

The command prints the hex-encoded auth message, the resolved deadline slot, and ready-to-run shell snippets for the next two steps.

### 2b.ii. Sign the message

On the machine that holds the validator identity keypair:

```bash
solana sign-offchain-message <123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3> \
--keypair <path-to-validator-identity-keypair.json>
```

This prints a base58 signature.

Example Output

```bash
SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp
```

### 2b.iii. Submit `configure`

Back on the machine with your fee-payer wallet:

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --signature <SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp> \
    --deadline-slot <DEADLINE_SLOT>
```

`--signature` and `--deadline-slot` must be passed together. The values must match those produced in steps 2b.i and 2b.ii.

The ATA is auto-initialized in the same transaction if it doesn't yet exist.


Example Output

```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         offchain
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```

---

## 3. Verify the Configuration

```bash
doublezero-solana shreds publisher-rewards show --node-id <NODE_ID>
```

The command prints the `Node ID`, `Rewards owner`, `Rewards mint`, the resolved ATA address, and the ATA status. The **Resolved ATA** is the deterministic address derived from the rewards owner + rewards mint — it is where rewards will be deposited each epoch.

---

## Troubleshooting

### Direct path: `-k` pubkey does not match `--node-id`

The fee-payer keypair you passed isn't the validator identity. Either pass the validator identity keypair as `-k`, or switch to the [offchain path](#2b-offchain-path).

### Signature expired

Each offchain signature has a deadline slot. If too much time passes between `prepare-offchain-message` and `configure`, re-run `prepare-offchain-message`, re-sign, and re-submit. Default validity is 1 hour — extend with `--valid-for 4h` or similar if you need more time for an offline signing flow.
