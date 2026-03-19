**在访问或使用代码或相关材料之前，请查看免责声明。**
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


<!-- https://github.com/doublezerofoundation/doublezero-offchain/pull/159 -->

??? warning "免责声明"

    本文档及相关代码仅供信息和技术目的提供。本文中描述的代币转换功能是非托管型的。用户直接与底层智能合约交互，始终完全控制自己的资产。

    该系统可能依赖于或与开发人员和发行人未开发、管理或审查的第三方代码、数据源或价格和费用机制（例如智能合约、API或去中心化交易所）交互。对第三方组件的准确性、功能或安全性不作任何声明或保证。
    本代码的开发人员和发行人不保证其准确性、完整性或持续可用性。代码和相关材料按"原样"（AS IS）提供，可能包含错误、缺陷或漏洞。使用风险自负。
    开发人员和发行人不会因使用这些合约而收取任何费用。对代码或相关文档没有维护、更新或支持的义务。

    本文件不是对参与代币转换、兑换或其他交易的推介、招揽或建议。不提供法律、财务或投资建议。
    用户单独负责确定其活动的合法性。在使用代码或参与转换之前，必须查阅适用于其司法管辖区的法律法规，并咨询独立顾问。在违法的地方使用是被禁止的，包括受制裁的个人或组织或受限地区的使用。

    在法律允许的最大范围内，开发人员和发行人否认因使用代码或参与转换而引起的或与之相关的所有损失、损害或索赔的任何责任。

    本文档及相关代码的审查和使用须遵守[网站使用条款](https://doublezero.xyz/terms)和[协议使用条款](https://doublezero.xyz/terms-protocol)。

验证器可以通过链上[兑换程序](https://github.com/doublezerofoundation/doublezero-offchain/tree/main/crates/solana-interface/sol-conversion)以2Z支付费用。通过将2Z兑换为SOL来执行兑换。存款账户的SOL余额会根据兑换情况更新。


此过程**始终**使用1 SOL的增量。此兑换的结果**始终**直接存入存款账户。这是单向的，您无法从此交易中取回2Z或SOL。它被发送到链上分配模块。


#### 步骤1
首先检查当前转换汇率


```
doublezero-solana revenue-distribution fetch sol-conversion
```


输出：
```
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 800.86265341  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 797.75530631  | Includes 0.38800000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```


#### 步骤2
提交限价订单。此兑换由您自行承担风险。我们不建议任何风险偏好，此处提供的示例仅供教育目的。


##### 如何构建限价订单
基于上面的示例，我们将提交比估计价格高5%的限价订单。
797.76 * 1.05 = 837.65


在此示例中，假设存款账户中有0 SOL。


```
doublezero-solana revenue-distribution --convert-2z-limit-price 837.65 --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 --fund 1
```
上面命令中的`--fund 1`明确向存款账户注入1 SOL。


选择1以外的数字将导致错误，并通知您错误的金额：
```
Error: SOL amount must be 1.000000000 for 2Z -> SOL conversion. Got 1.500000000
```


系统将要求您确认交易：


```
⚠️  By specifying --convert-2z-limit-price, you are funding 1.000000000 SOL to your deposit account. Proceed? [y/N]
```


输出：
```
2Z token balance: 987241.76579348
Converted 2Z to SOL: 2iaBzd4vgEeDnpfSCD9aYFMWZ3UoVzrJfUjSMhsDhfSQ6isPZKkKe3ZWQ6b5aWvV3h8Vsk8Mmde6wmCiidD4Qc6s
Converted 837.65 2Z tokens to 1.000000000 SOL
```
请注意，兑换成功后，`Balance:`将更新为1 SOL。


如果价格超出指定范围，将发生以下类型的错误：
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
