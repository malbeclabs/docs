**在访问或使用代码或任何相关材料之前，请查阅免责声明。**

<!-- https://github.com/malbeclabs/doublezero-offchain/pull/159 -->

??? warning "免责声明"
    
    本文档及相关代码仅供参考和技术用途。本文所述的代币转换功能为非托管模式——用户直接与底层智能合约交互，并始终保留对其资产的完全控制权。

    本系统可能依赖或与第三方代码、数据源或定价和费用机制（例如智能合约、API 或去中心化交易所）进行交互，这些均非由开发者或发布者开发、控制或审查。对于任何第三方组件的准确性、功能性或安全性，不作任何声明或保证。
    本代码的开发者和发布者不保证其准确性、完整性或持续可用性。代码及相关材料按"原样"提供，可能包含错误、缺陷或漏洞。使用风险完全由您自行承担。
    开发者和发布者不会因使用这些合约而收取任何费用。他们没有义务维护、更新或支持代码或相关文档。

    本文档不构成出售要约、购买邀约，也不构成参与任何代币转换、兑换或其他交易的建议。本文不提供任何法律、财务或投资建议。
    用户须自行负责确定其活动的合法性。用户应在使用代码或参与任何转换之前，查阅其所在司法管辖区适用的法律法规，并咨询独立顾问。在可能违法的情况下禁止使用，包括受制裁对象或受限司法管辖区内的个人或实体。

    在法律允许的最大范围内，开发者和发布者对因使用代码或参与转换而产生的或与之相关的任何损失、损害或索赔不承担任何责任。

    查阅和使用本文档及相关代码须遵守[网站条款与条件](https://doublezero.xyz/terms)和[协议条款与条件](https://doublezero.xyz/terms-protocol)。

DoubleZero 协议从其验证者用户处收取以 SOL 计价的收入，但向贡献者分配以 2Z 计价的奖励。因此，它必须将 SOL 转换为 2Z。

**为此，符合条件的参与者可以与 DoubleZero 兑换合约进行交易，从合约中购买 SOL 并出售 2Z。定价基于 Pyth 价格馈送以及程序化折扣机制。**

本简要指南说明如何使用该程序。

***在访问或使用代码或任何相关材料之前，请查阅本文档末尾的免责声明。***

---

## 程序设计

兑换程序实质上是一个单边流动性池，以每笔交易固定批量 1 SOL 的方式出售 SOL。任何符合条件的参与者都可以通过存入 2Z 从程序中提取 SOL，价格由 Pyth 的预言机价格和动态折扣决定。随着时间的推移，这实现了该程序将原生代币转换为 2Z 的目标。

要使用该功能，交易者必须提供两个最新的 Pyth 价格（SOL/USD 和 2Z/USD）以及一定数量的 2Z。然后程序根据隐含的 SOL/2Z 价格计算购买 1 SOL 所需的 2Z 数量。接下来它还会执行以下几个额外步骤：

- 检查 Pyth 价格是否足够新鲜，即不超过 5 秒的延迟。
- 检查两个价格的置信区间是否足够小。即两个价格的两个拉普拉斯标准差（即 Pyth 价格中的 `conf` 参数）之和，经各自价格水平归一化后，必须小于或等于 30 个基点。
- 通过动态折扣调整 SOL/2Z 价格，折扣以 Pyth 价格的百分比表示。此折扣是自上次交易以来时间的函数。以下公式指定了折扣，假设上次交易在槽位 $s_{\text{last}}$ 进行，当前槽位为 $s_{\text{now}}$。（例如，如果自上次交易以来已过去 200 个槽位，则折扣为 40 个基点。）

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

此时，如果交易者提供了足够的 2Z 以在此计算价格（包含折扣）下执行交易，则按此计算价格执行。它会将购买的 SOL 数量和多余的 2Z 返还给交易者。

之后该合约在该槽位内不再允许更多交易。这是为了防止在任何给定时间点 Pyth 价格远离真实价格时（现有过滤器未能捕获的情况下），合约支付过高的滑点。

---

## 无 Gas 原子执行

本节将详细介绍如何使用 `harvest-dz` 命令。此命令将原子性地执行 2 个操作。
1. 该命令从 Jupiter 请求报价，并与原生 SOL <> 2Z 转换程序进行对比。
2. 当 Jupiter 路由的每 SOL 兑换的 2Z 数量多于原生转换程序所需的数量时，`harvest-2z` 执行一笔兑换，将 1 SOL 加上 2Z 差额返回到您的钱包。

### 收割 2Z

要执行，请运行以下命令：
```
doublezero-solana revenue-distribution harvest-2z
```
输出将类似于：
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
该命令也可以使用 `--dry-run` 参数进行模拟。模拟运行将产生程序日志和类似以下的输出：

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## 协议转换

本节讨论如何使用 `doublezero-solana` CLI 检查转换汇率和执行转换。最后，我们讨论与 DoubleZero 兑换合约进行自定义集成的接口。

### 如何通过 `doublezero-solana` 查看 SOL/2Z 转换价格

要查看主网 (mainnet-beta) 上的 SOL/2Z 转换汇率，请运行以下命令：

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

您将看到类似以下的输出：

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

Journal Balance 告知用户收入分配智能合约中有多少 SOL 流动性。只要 Journal Balance 超过固定交易大小 1 SOL，用户就可以进行交易。

第一行显示通过链下预言机获得的"真实" SOL/2Z 转换价格。第二行是用于链上兑换的转换价格，它只是在真实价格的基础上应用了算法折扣调整。

### 如何通过 `doublezero-solana` 将您的 2Z 转换为 SOL

要将您的 2Z 代币转换为 SOL，请运行以下命令：

```bash
doublezero-solana revenue-distribution convert-2z
```

默认情况下，如果有足够的 SOL 流动性且您的 ATA 有足够的 2Z 来执行兑换，该交易将会成功。您可以通过指定以下参数来更精细地调整兑换：

```bash
      --limit-price <DECIMAL>                    Limit price defaults to the current SOL/2Z oracle price
      --source-2z-account <PUBKEY>               Token account must be owned by the signer. Defaults to signer ATA if not specified
      --checked-sol-amount <SOL>                 Explicitly check SOL amount. When specified, this amount will be checked against the fixed fill quantity
```

指定的限价决定了您在执行 SOL/2Z 转换时愿意接受的最差价格。例如，假设折后 SOL 的 2Z 价格为 800，即 800 个 2Z 代币换 1 SOL。如果您指定限价为 790，您将不愿意执行兑换，因为您要求最多只用 790 个 2Z 代币换 1 SOL。但如果您指定 810，交易将会执行，因为您愿意最多兑换 810 个 2Z 代币（在这种情况下，您在该笔交易中实际只兑换了 800 个 2Z 代币）。

源 2Z 代币账户会覆盖默认的 ATA（使用签名者作为此 2Z ATA 的所有者）。但如果您有另一个代币账户想用于执行兑换，请使用此参数提供其公钥。

可选地，您可以将已检查的 SOL 数量指定为标准成交大小（启动时设为 1 SOL）。如果它与程序的成交大小不一致，兑换将失败。这降低了程序成交大小发生变化而您未注意到的风险。

### 购买 SOL 的接口

接口和 `doublezero-solana` CLI 位于[此仓库](https://github.com/malbeclabs/doublezero-offchain)。DoubleZero 兑换合约接口的源代码可在[此处](https://github.com/malbeclabs/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09)找到。程序 ID 为 `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`。

生成购买 SOL 指令所需账户的便捷方法是使用 `new` 方法（位于 *instruction/account.rs* 中）。

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

`fill_registry_key` 可以从 `ProgramState` 中获取

```rust
pub struct ProgramState {
    pub admin_key: Pubkey,
    pub fills_registry_key: Pubkey, // this key
    pub is_paused: bool,
    pub configuration_registry_bump: u8,
    pub program_state_bump: u8,
    pub deny_list_registry_bump: u8,
    pub withdraw_authority_bump: u8,
    pub last_trade_slot: u64,
    pub deny_list_authority: Pubkey,
}
```

或者，您可以通过 Solana RPC 使用其判别器调用 `getProgramAccounts`。但我们建议缓存此公钥，因为它永远不会改变。

`user_key` 是购买 SOL 指令的签名者，必须是 `user_token_account_key` 的所有者。如上所述，这不需要是 ATA。只要您的 2Z 代币账户由 `user_key` 所有，此指令就会成功。

`BuySolAccounts` 结构体实现了 `Into<Vec<AccountMeta>>`，因此您可以生成构建指令所需的所有账户元数据。

指令数据为

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

此指令数据经过 Borsh 序列化，并带有 8 字节的 Anchor 选择器，使用 `BorshSerialize::serialize` 时会全部完成序列化。

预言机价格数据可以从此公共端点获取：[https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate)。该数据可使用 *oracle.rs* 中的 OraclePriceData 结构体进行 serde 反序列化。

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

以下是使用 [reqwest crate](https://docs.rs/reqwest/latest/reqwest/) 获取数据的示例：

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

有了程序 ID、账户和指令数据，您应该能够构建从 DoubleZero 兑换合约购买 SOL 的指令。