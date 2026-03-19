# 验证器定价与费用
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


**为Solana验证器提供简单、一致的定价**

费用将从第859个epoch开始征收，该epoch从美国东部时间10月4日（周六）凌晨4点开始。对区块签名奖励和优先费用收取统一5%的费用。

这些费用直接资助使DoubleZero成为可能的基础设施，包括物理光纤线路和数据中心设备。

有关费用存在原因及验证器定价模型的深入探讨，请参阅[此处](https://doublezero.xyz/fees)。

***本指南从技术角度重点介绍如何支付费用。***

## **结算模式**

- 费用以SOL计价，按epoch结算
- 验证器债务由收入分配程序在链上计算
- 每个验证器都有一个用于支付的存款账户（PDA）
- 资金窗口：费用在其累积后的下一个Solana epoch期间存入。即在第860个epoch累积的费用需要在第861个epoch支付。

- 支持预付资金。余额跨epoch递减

---

# **估算费用**

历史估算和每个公钥的数据可在[费用估算仓库](http://github.com/doublezerofoundation/fees)中获取。该仓库不替代链上数据。您负责链上余额，而非此仓库中的余额。

问题？请联系Nihar Shah：nihar@doublezero.us

# 开发者详情

### 命令行界面
DoubleZero CLI提供命令来管理验证器存款和监控余额。
您需要在运行这些命令的账户中拥有SOL来支付gas费用。

<div data-wizard-step="fee-check" markdown>

### 步骤1：了解欠款

要查看特定地址的债务，您可以使用以下格式：
```
doublezero-solana revenue-distribution fetch validator-debts --node-id ValidatorIdentity111111111111111111111111111
```
我们将在下面检查示例输出：

```
| node_id                                      |    total_amount | deposit_balance | note                   |
|----------------------------------------------|-----------------|-----------------|------------------------|
| ValidatorIdentity111111111111111111111111111 | 0.632736605 SOL | 0.000220966 SOL | 0.632515639 SOL needed |
| ValidatorIdentity111111111111111111111111111 | 24.520162479 SOL| 0.000000000 SOL | Not funded             |
```
在示例输出中，`note`下有两种不同的可能输出。`Not funded`表示账户尚未资金化。在示例中，`0.632515639 SOL needed`是与目标验证器ID相关的所有当前欠款所需的未偿还SOL金额。

</div>

<div data-wizard-step="fee-pay" markdown>

### 步骤2：支付欠款

!!! note inline end
      您可以安排此命令定期运行。

要偿还欠款，您可以使用以下命令。这将自动使用`$HOME/.config/solana/id.json`中的默认密钥对。

您可以通过在命令末尾添加参数`-k path/to/keypair.json`来指定您要用于支付债务的密钥对。

```
doublezero-solana revenue-distribution validator-deposit --fund-outstanding-debt --node-id ValidatorIdentity111111111111111111111111111
```
以下提供示例输出

```
Solana validator deposit: DZ_PDA_MvFTgPku3dUrw2W3dbeK5dhxmXYKKYETDUK1V
Funded: TransactionHashHVxSobvdY2r14CkEwsBDhwf2dBmFatyeftisrdfSocMM2tXPjFvXPRmVs1xagiqKSX4b92fgt
Node ID: ValidatorIdentity111111111111111111111111111
Balance: 0.309294915 SOL
```

`Solana validator deposit:` 返回已资金化的存款账户

`Funded:` 返回交易哈希，您可以在您喜欢的Solana浏览器中查询

`Node ID:` 返回已支付的验证器ID

`Balance:` 返回转账完成后存款账户中的SOL金额

</div>
