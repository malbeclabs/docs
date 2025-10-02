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
3. Fund your deposit account with the amount calculated in step 2 in the next epoch. If desired; you can make excess payments and that excess SOL will be applied to future epochs. [How to Send SOL>>](https://solana.com/tr/learn/sending-and-receiving-sol)
4. Monitor balance to ensure successful settlements.

---

# **Estimating Fees**

Historical estimates and per-pubkey data are available in the [Fee Estimates Repo](http://github.com/doublezerofoundation/fees). The repo does not replace on chain data. You are responsible for the balance on chain, not in the balance in this repo.

Questions? Contact Nihar Shah at nihar@doublezero.us

# Developer Details

### Command Line Interface

The DoubleZero CLI provides commands to manage validator deposits and monitor balances.
You will need sol in the account that you run these commands from to pay for gas.

In these examples the flag `um` is used to denote mainnet-beta. If you need a testnet balance use the flag `ut`

#### Command 1: Fetch All Validator Deposits

```bash
doublezero-solana revenue-distribution fetch validator-deposits -um
```

**Output:**
```
Solana validator deposit accounts            | Node ID                                     | Balance (SOL)
---------------------------------------------+---------------------------------------------+--------------
79jStiBvoxujPWfmGfRahfFJd5SU2XruSwfDmysXt3xA | Node111111111111111111111111111111111111111 | 0.000000001
EdmeAaCNiKkkNX73vch6kibJCeLnzcSPFpNzKeoRPYxP | Node111111111111111111111111111111111111112 | 0.000000069
AReLULgb4P7ipxQJy9cheGUsGRqQCbJNTFZXmjdkGMdE | Node111111111111111111111111111111111111113 | 0.000000420
```

#### Command 2: Fetch Deposits for Specific Node

```bash
doublezero-solana revenue-distribution fetch validator-deposits -um --node-id Node111111111111111111111111111111111111111
```

**Output:**
```
Solana validator deposit accounts            | Node ID                                     | Balance (SOL)
---------------------------------------------+---------------------------------------------+--------------
79jStiBvoxujPWfmGfRahfFJd5SU2XruSwfDmysXt3xA | Node111111111111111111111111111111111111111 | 0.000000001
```

#### Command 3: Fund Validator Deposit (First Transaction)

```bash
doublezero-solana revenue-distribution validator-deposit Node111111111111111111111111111111111111111 --fund 0.000000001 -um
```

**Output:**
```
Solana validator deposit: 79jStiBvoxujPWfmGfRahfFJd5SU2XruSwfDmysXt3xA
Funded: 3n56AW1UXeRqCQdLhQ82tjYzHQUbw7w2NcgD31PXSSxNLNgfrtsAENrWrXS2uLS2x5CyTyNaDTQMn9nHo5dfaS3B
Node ID: Node111111111111111111111111111111111111111
Balance: 0.000000002 SOL
```

#### Command 4: Fund Validator Deposit (Second Transaction)

```bash
doublezero-solana revenue-distribution validator-deposit Node111111111111111111111111111111111111111 --fund 0.000000001 -um
```

**Output:**
```
Solana validator deposit: 79jStiBvoxujPWfmGfRahfFJd5SU2XruSwfDmysXt3xA
Funded: 5WEpFc7pw6Hg353giEq1zwxAq2Lw4CHAahyZfb3tAgTBjfWiExaWpMjvrEm5bb618XC42ZU2hygryUu4E2PMbRxT
Node ID: Node111111111111111111111111111111111111111
Balance: 0.000000003 SOL
```

#### Command 5: Verify Updated Balance

```bash
doublezero-solana revenue-distribution fetch validator-deposits -um --node-id Node111111111111111111111111111111111111111
```

**Output:**
```
Solana validator deposit accounts            | Node ID                                     | Balance (SOL)
---------------------------------------------+---------------------------------------------+--------------
79jStiBvoxujPWfmGfRahfFJd5SU2XruSwfDmysXt3xA | Node111111111111111111111111111111111111111 | 0.000000003
```

