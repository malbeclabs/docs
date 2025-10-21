**Review the Disclaimer at the end of this document before accessing or using the code or any
related materials.**


<!-- https://github.com/doublezerofoundation/doublezero-offchain/pull/159 -->


Validators can pay their fees in 2z via an onchain [swap program](https://github.com/doublezerofoundation/doublezero-offchain/tree/main/crates/solana-interface/sol-conversion). The swap is performed using 2z, and exchanging it for Sol. The Sol balance in your deposit account will be updated according to the swap.


This process will **always** use increments of 1 sol. The result of this swap will **always** be deposited directly into your deposit account. This is a one way street, you cannot retrieve the 2z or sol from this transaction. It will be sent to a distribution module onchain.


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
Place a limit order. You will be executing this swap at your own risk. We do not make recommendations on risk profile, and examples provided here are for educational purposes.


##### How to structure a limit order 
Based on the example above, we will now place a limit order 5% above quote price.
797.76 * 1.05 = 837.65


In this example, we will assume the deposit account has 0 sol in it.


```
doublezero-solana revenue-distribution --convert-2z-limit-price 837.65 --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 --fund 1
```
Notice in the above command `--fund 1` this is explicitly funding 1 sol into the deposit account.


If you choose any number besides 1 you will trigger an error telling you the incorrect amount:
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

??? warning "Disclaimer"
    
    This document and the associated code are provided for informational and technical purposes only. The token conversion functionality described herein is non-custodial—users interact directly with the underlying smart contracts and retain full control of their assets at all times.

    The system may rely on or interact with third-party code, data sources, or pricing and fee mechanisms (for example, smart contracts, APIs, or decentralized exchanges) that are not developed, controlled, or reviewed by the developer(s) or publisher(s). No representation or warranty is made as to the accuracy, functionality, or security of any third-party component.
    The developer(s) and publisher(s) of this code do not guarantee its accuracy, completeness, or continued availability. The code and related materials are provided “as is”, and may contain bugs, errors, or vulnerabilities. Use is entirely at your own risk.
    The developer(s) and publisher(s) do not receive any fees in connection with the use of these contracts. They are under no obligation to maintain, update, or support the code or related documentation.

    This document does not constitute an offer to sell, a solicitation to buy, or a recommendation to participate in any token conversion, swap or other transaction. No legal, financial, or investment advice is provided.
    Users are solely responsible for determining the legality of their activities. They should review the laws and regulations applicable in their jurisdiction and consult independent advisors before using the code or participating in any conversion. Use is prohibited where it would be unlawful, including by persons or entities subject to sanctions or in restricted jurisdictions.

    To the maximum extent permitted by law, the developer(s) and publisher(s) disclaim all liability for any loss, damage, or claim arising from or in connection with use of the code or participation in the conversion.

    Review and use of this document and the associated code are subject to the [Website Terms and Conditions](https://doublezero.xyz/terms) and [Protocol Terms and Conditions](https://doublezero.xyz/terms-protocol).
