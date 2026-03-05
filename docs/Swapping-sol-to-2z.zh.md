**在访问或使用代码或相关材料之前，请查看免责声明。**

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

DoubleZero协议从验证器用户处收取以SOL计价的收益，但以2Z计价向贡献者分配奖励。因此，需要将SOL转换为2Z。

**为此，合格的参与者可以与DoubleZero兑换合约进行交易，从合约购买SOL并出售2Z。定价基于Pyth价格数据流和程序性折扣机制。**

本指南介绍如何使用该程序。

***在访问或使用本文档及相关代码之前，请查看文档末尾的免责声明。***

---

## 程序设计

兑换程序本质上是一个单边流动性池，每笔交易的固定批量为1 SOL进行SOL销售。合格的参与者可以存入2Z并从程序提取SOL，价格由Pyth的预言机价格和动态折扣决定。随着时间的推移，这实现了将程序的原生代币转换为2Z的目标。

要使用该程序，交易者需要提供两个最新的Pyth价格（SOL/USD和2Z/USD）以及2Z的数量。程序随后根据隐含的SOL/2Z价格计算购买1 SOL所需的2Z。然后执行一些额外步骤：

- 检查Pyth价格是否足够新，即不超过5秒的旧价格。
- 检查两个价格的置信区间是否足够小，即两个价格的拉普拉斯标准差（Pyth价格参数`conf`）之和在其水平上归一化后不得超过30个基点。
- 用动态折扣（以Pyth价格的百分比表示）调整SOL/2Z价格。此折扣是自上次交易以来时间的函数。以下公式指定折扣，假设上次交易在槽位$s_{\text{last}}$，当前槽位为$s_{\text{now}}$。（例如，如果自上次交易以来已经过了200个槽位，折扣为40个基点。）

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

此时，如果交易者提供足够的2Z以按此计算价格（含折扣）执行交易，则将按此计算价格执行。交易者将收到购买的SOL和多余的2Z。

合约随后不允许在该槽位进行更多交易。这是为了防止合约在Pyth价格在任何时间点与真实价格相差太远（超出现有过滤器的捕获范围）时支付过高的滑点。

---

## 无Gas原子执行

本节介绍`harvest-dz`命令的使用方法。该命令以原子方式执行两个操作：
1. 命令向Jupiter请求针对原生SOL <> 2Z转换程序的报价。
2. 如果Jupiter路由产生的2Z/SOL多于原生SOL转换程序所需的，`harvest-2z`将执行兑换，并将1 SOL和2Z的差额返还到钱包。

### 2Z的收割

要执行，请运行以下命令：
```
doublezero-solana revenue-distribution harvest-2z
```
输出将如下所示：
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
该命令也可以使用`--dry-run`参数进行模拟。干运行将生成程序日志和如下输出：

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## 协议转换

本节介绍如何检查转换率以及如何使用`doublezero-solana` CLI执行转换。最后还介绍了与DoubleZero兑换合约进行自定义集成的接口。

### 如何通过`doublezero-solana`检查SOL/2Z转换价格

要检查主网Beta的SOL/2Z转换率，请运行以下命令：

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

显示的输出将如下所示：

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

Journal Balance告知用户收入分配智能合约中有多少SOL流动性。只要Journal Balance超过固定交易大小1 SOL，用户就可以交易。

第一行显示链下预言机的"真实"SOL/2Z转换价格。第二行是链上兑换使用的转换价格，是对算法折扣的真实价格的调整。

### 如何通过`doublezero-solana`将2Z转换为SOL

要将2Z代币转换为多的，请运行以下命令：

```bash
doublezero-solana revenue-distribution convert-2z
```

默认情况下，如果有足够的SOL流动性，并且ATA中有足够的2Z执行兑换，此交易将成功。通过指定以下参数，您可以更精细地控制兑换：

```bash
      --limit-price <DECIMAL>                    限价默认为当前SOL/2Z预言机价格
      --source-2z-account <PUBKEY>               代币账户必须由签名者拥有。如果不指定，默认为签名者ATA
      --checked-sol-amount <SOL>                 明确检查SOL金额。如果指定，此金额将针对固定填充数量进行检查
```

指定的限价决定了执行SOL/2Z转换时您愿意接受的最坏情况价格。例如，假设SOL的折扣2Z价格为800（每1 SOL 800个2Z代币）。如果您将限价指定为790，您不愿意以每1 SOL多于790个2Z代币进行兑换，因此不会尝试执行兑换。但如果您指定810，您愿意兑换最多810个2Z代币（在本例中，仅在此交易中兑换800个2Z代币），因此交易将通过。

源2Z代币账户会覆盖默认的ATA，使用签名者作为此2Z ATA的所有者。但是，如果您有另一个想要用于执行兑换的代币账户，请通过此参数提供其公钥。

作为选项，您可以指定要检查的SOL金额到标准填充大小（启动时设置为1 SOL）。如果与程序的填充大小不匹配，兑换将失败。这减少了程序填充大小发生变化而您未注意到的风险。

### 购买SOL的接口

接口和`doublezero-solana` CLI位于[此仓库](https://github.com/doublezerofoundation/doublezero-offchain)中。DoubleZero兑换合约接口的源代码在[这里](https://github.com/doublezerofoundation/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09)。程序ID为`9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`。

生成buy SOL指令所需账户的便捷方法是使用`new`方法（位于*instruction/account.rs*）：

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

`fill_registry_key`可从`ProgramState`获取

```rust
pub struct ProgramState {
    pub admin_key: Pubkey,
    pub fills_registry_key: Pubkey, // 此密钥
    pub is_paused: bool,
    pub configuration_registry_bump: u8,
    pub program_state_bump: u8,
    pub deny_list_registry_bump: u8,
    pub withdraw_authority_bump: u8,
    pub last_trade_slot: u64,
    pub deny_list_authority: Pubkey,
}
```

或者，您也可以通过Solana RPC使用判别器调用`getProgramAccounts`。但是，由于此公钥永远不会改变，建议对其进行缓存。

`user_key`是buy SOL指令的签名者，必须是`user_token_account_key`的所有者。如上所述，这不需要是ATA。只要2Z代币账户由`user_key`拥有，此指令就会成功。

`BuySolAccounts`结构体实现了`Into<Vec<AccountMeta>>`，因此可以生成构建指令所需的所有账户元数据。

指令数据为

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

此指令数据以Borsh序列化，有8字节的Anchor选择器，使用`BorshSerialize::serialize`序列化所有内容。

预言机价格数据可从此公共端点获取：[https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate)。数据可使用*oracle.rs*中的OraclePriceData结构体通过serde反序列化。

```rust
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default, PartialEq, Eq)]
#[cfg_attr(
    feature = "serde",
    derive(serde::Deserialize),
    serde(rename_all = "camelCase")
)]
pub struct OraclePriceData {
    pub swap_rate: u64,
    pub timestamp: i64,
    pub signature: String,
}
```

使用[reqwest crate](https://docs.rs/reqwest/latest/reqwest/)的获取示例：

```rust
use anyhow::{Context, Result};

pub async fn try_request_oracle_conversion_price(oracle_endpoint: &str) -> Result<OraclePriceData> {
    reqwest::Client::new()
        .get(oracle_endpoint)
        .header("User-Agent", "SOL buyoooooooor")
        .send()
        .await?
        .json()
        .await
        .with_context(|| format!("Failed to request SOL/2Z price from {oracle_endpoint}"))
}
```

使用程序ID、账户和指令数据，您应该能够构建从DoubleZero兑换合约购买SOL的指令。
