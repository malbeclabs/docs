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
You will need SOL in the account that you run these commands from to pay for gas.

!!! note inline end
      Do not use your `Vote Identity` or `DoubleZero ID` in this process

In these examples the flag `-u mainnet-beta` is used to denote mainnet-beta. If you need a testnet balance use the flag `-u testnet`

#### Command 1: Fetch All Validator Deposits

```bash
doublezero-solana revenue-distribution fetch validator-deposits -u mainnet-beta
```

**Output:**
```
Solana validator deposit accounts            | Node ID                                     | Balance (SOL)
---------------------------------------------+---------------------------------------------+--------------
DepositAccount111111111111111111111111111111 | ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 | 0.000000001
DepositAccount222222222222222222222222222222 | ValidatorIdentity11111111111111111111111111111111111111111111111111111111111112 | 0.000000069
DepositAccount333333333333333333333333333333 | ValidatorIdentity11111111111111111111111111111111111111111111111111111111111113 | 0.000000420
```

#### Command 2: Fetch Deposits for Specific Node

```bash
doublezero-solana revenue-distribution fetch validator-deposits -u mainnet-beta --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111
```

**Output:**
```
Solana validator deposit accounts            | Node ID                                     | Balance (SOL)
---------------------------------------------+---------------------------------------------+--------------
DepositAccount111111111111111111111111111111 | ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 | 0.000000001
```

#### Command 3: Fund Validator Deposit (First Transaction)

```bash
doublezero-solana revenue-distribution validator-deposit --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 --fund 0.000000001 -u mainnet-beta
```

**Output:**
```
2Z token balance: 0.0
Solana validator deposit: DepositAccount111111111111111111111111111111
Funded: 3n56AW1UXeRqCQdLhQ82tjYzHQUbw7w2NcgD31PXSSxNLNgfrtsAENrWrXS2uLS2x5CyTyNaDTQMn9nHo5dfaS3B
Node ID: ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111
Balance: 0.000000002 SOL
```

#### Command 4: Fund Validator Deposit (Second Transaction)

```bash
doublezero-solana revenue-distribution validator-deposit --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 --fund 0.000000001 -u mainnet-beta
```

**Output:**
```
2Z token balance: 0.0
Solana validator deposit: DepositAccount111111111111111111111111111111
Funded: 5WEpFc7pw6Hg353giEq1zwxAq2Lw4CHAahyZfb3tAgTBjfWiExaWpMjvrEm5bb618XC42ZU2hygryUu4E2PMbRxT
Node ID: ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111
Balance: 0.000000003 SOL
```

#### Command 5: Verify Updated Balance

```bash
doublezero-solana revenue-distribution fetch validator-deposits -u mainnet-beta --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111
```

**Output:**
```
Solana validator deposit accounts            | Node ID                                     | Balance (SOL)
---------------------------------------------+---------------------------------------------+--------------
DepositAccount111111111111111111111111111111 | ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 | 0.000000003
```
## Paying in 2z
### Validators may pay their fees in 2z

<!-- https://github.com/doublezerofoundation/doublezero-offchain/pull/159 -->

Validators have the option to pay their fees in 2z via an onchain [swap program](https://github.com/doublezerofoundation/doublezero-offchain/tree/main/crates/solana-interface/sol-conversion). This section will detail the steps to complete this process. The swap is performed using 2z, and exchanging it for Sol. The Sol balance in your deposit account will be updated according to the swap.

This process will **always** use incremints of 1 sol. The result of this swap will **always** be deposited directly into your deposit account. This is a one way street, you cannot retrieve the 2z or sol from this transaction. It will be sent to a distribution module onchain.

#### Step 1
First determine what the current conversion rate is

```
doublezero-solana revenue-distribution fetch sol-conversion
```

output:
```
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 800.86265341  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 797.75530631  | Includes 0.38800000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

#### Step 2
Place a limit order. You will be executing this trade at your own risk. DoubleZero does not make recomendations on risk profile, and examples provided here are for educational purposes.

You may structure a limit order, based on the example above, we will now place a limit order 5% above quote price.
797.76 * 1.05 = 837.65

In this example, we will assume the deposit account has 0 sol in it.

```
doublezero-solana revenue-distribution --convert-2z-limit-price 837.65 --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 --fund 1
```
Notice in the above command `--fund 1` this is explicitly funding 1 sol into the deposit account.

If you chose any number besides 1 you will trigger an error telling you the incorrect amount:
```
Error: SOL amount must be 1.000000000 for 2Z -> SOL conversion. Got 1.500000000
```

You will be prompted to confirm the transaction:

```
⚠️  By specifying --convert-2z-limit-price, you are funding 1.000000000 SOL to your deposit account. Proceed? [y/N]
```

output:
```
2Z token balance: 987241.76579348
Converted 2Z to SOL: 2iaBzd4vgEeDnpfSCD9aYFMWZ3UoVzrJfUjSMhsDhfSQ6isPZKkKe3ZWQ6b5aWvV3h8Vsk8Mmde6wmCiidD4Qc6s
Converted 837.65 2Z tokens to 1.000000000 SOL
```
Notice, that on successful swap the `Balance:` has been updated to 1 sol.

If a price is out of your specified range you will run into an error such as:
```
Error: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x177f; 10 log messages:
  Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs invoke [1]
  Program log: Instruction: BuySol
  Program log: Signature verified successfully
  Program log: Timestamp verified successfully
  Program log: Bid price 79500000000
  Program log: Ask price 79862251144
  Program data: 1fxoRNOEulcAypo7AAAAAAC7kYISAAAAiD4pmBIAAAAsk/ZoAAAAAA4PxjWjgr+ERO7jDdvoOmT/WpgDFLfY+FGKKDdOw4PMAAAAAAAAAAA=
  Program log: AnchorError thrown in on-chain/programs/converter-program/src/buy_sol.rs:142. Error Code: BidTooLow. Error Number: 6015. Error Message: Provided bid is too low.
  Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs consumed 50754 of 90000 compute units
  Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs failed: custom program error: 0x177f
```
## Troubleshooting:
### Issue: `⚠️  Warning: Please use "doublezero-solana revenue-distribution validator-deposit ValidatorIdentity111111111111111111111111111 --initialize" to create

This issue is generally caused by sending funds to a deposit account, without first running the fund command.

**Symptoms:**
- When executing `doublezero-solana revenue-distribution` commands the user encounters `⚠️  Warning: Please use "doublezero-solana revenue-distribution validator-deposit --node-id ValidatorIdentity111111111111111111111111111 --initialize" to create`


**Solutions:**
1. initialize the account

 `doublezero-solana revenue-distribution validator-deposit --node-id ValidatorIdentity111111111111111111111111111 --initialize -k path/to/your_keypair.json`

 Sample Output:

    ```
    Solana validator deposit: Deposit1111111111111111111111111111111111111
    Funded and initialized: Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
    Node ID: ValidatorIdentity111111111111111111111111111
    Balance: YourCurrentBalanceIn SOL
    ```
2. re-run the command which caused the error

    for example:

    `revenue-distribution fetch validator-deposits -u mainnet-beta --node-id ValidatorIdentity111111111111111111111111111'`

    Sample Output:
    ```
    Solana validator deposit accounts            | Node ID                                     | Balance (SOL)
    ---------------------------------------------+---------------------------------------------+--------------
    79jStiBvoxujPWfmGfRahfFJd5SU2XruSwfDmysXt3xA | ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 | 0.000000003
    ```
    The command should now return without error

    2z 