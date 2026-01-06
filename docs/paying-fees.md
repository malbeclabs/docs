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

# **Estimating Fees**

Historical estimates and per-pubkey data are available in the [Fee Estimates Repo](http://github.com/doublezerofoundation/fees). The repo does not replace on chain data. You are responsible for the balance on chain, not in the balance in this repo.

Questions? Contact Nihar Shah at nihar@doublezero.us

# Developer Details

### Command Line Interface
The DoubleZero CLI provides commands to manage validator deposits and monitor balances.
You will need SOL in the account that you run these commands from to pay for gas.

### Step 1: Understanding Debt Owed

To view debt at a specific address you may use this format:
```
doublezero-solana revenue-distribution fetch validator-debts --node-id ValidatorIdentity111111111111111111111111111
```
We will examine a example output below:

```
| node_id                                      |    total_amount | deposit_balance | note                   |
|----------------------------------------------|-----------------|-----------------|------------------------|
| ValidatorIdentity111111111111111111111111111 | 0.632736605 SOL | 0.000220966 SOL | 0.632515639 SOL needed |
| ValidatorIdentity111111111111111111111111111 | 24.520162479 SOL| 0.000000000 SOL | Not funded             |
```
In the sample output there are two different outputs possible under `note`. `Not funded` means the account has not been funded. In the example `0.632515639 SOL needed` is the outstanding amount of Sol needed to pay all currently owed debts associated with the target Validator ID.

### Step 2: Paying Debt Owed

!!! note inline end
      You may schedule this command to run at a regular interval.

To pay down debt owed you may use the following command. This will automatically use the default keypair in `$HOME/.config/solana/id.json` 

You may specify the keypair you want to pay your debt with by adding the argument `-k path/to/keypair.json` at the end of the command.

```
doublezero-solana revenue-distribution validator-deposit --fund-outstanding-debt --node-id ValidatorIdentity111111111111111111111111111
```
An example output is provided below

```
Solana validator deposit: DZ_PDA_MvFTgPku3dUrw2W3dbeK5dhxmXYKKYETDUK1V
Funded: TransactionHashHVxSobvdY2r14CkEwsBDhwf2dBmFatyeftisrdfSocMM2tXPjFvXPRmVs1xagiqKSX4b92fgt
Node ID: ValidatorIdentity111111111111111111111111111
Balance: 0.309294915 SOL
```

`Solana validator deposit:` returns the deposit account which was funded

`Funded:` returns the transaction hash, which you may look up in your favorite solana explorer

`Node ID:` returns the Validator ID which was paid for

`Balance:` returns the amount of Sol which is in the deposit account, after the transfer is complete
