# Swapping SOL to 2Z

!!! warning ""
    Use of the conversion functionality is limited to [Eligible Contract Participants](https://share.google/dXO473u1lUjKvUH6t) only. Review and use of this document and the associated code are subject to the [Website Terms and Conditions](https://doublezero.xyz/terms) and [Protocol Terms and Conditions](https://doublezero.xyz/terms-protocol).

The DoubleZero protocol collects SOL-denominated revenue from its validator users but distributes 2Z-denominated rewards to contributors. Thus, it must convert SOL into 2Z.

**To do so, eligible participants can trade against a DoubleZero swap contract, purchasing SOL from the contract and selling it 2Z. Pricing is based on Pyth price feeds with a programmatic discount mechanism.** 

This short guide explains how to use the program.

***Review the Disclaimer at the end of this document before accessing or using the code or any related materials.***

## Program Design

The swap program is effectively a one-sided liquidity pool that sells SOL in a fixed batch size of 1 SOL per trade. Any eligible participant can withdraw SOL from the program by depositing 2Z, at a price that is determined by an oracle price from Pyth and a dynamic discount. Over time, this executes the program’s goal of turning native tokens into 2Z.

To utilize, a trader must provide two recent Pyth prices (SOL/USD and 2Z/USD) and a quantity of 2Z. The program then calculates the 2Z needed to purchase that 1 SOL based on the implied SOL/2Z price. It then takes a few additional steps:

- It checks that the Pyth prices are sufficiently fresh, i.e. they are no more than 5 seconds stale.
- It checks that the confidence intervals of the two prices are sufficiently small. That is, the sum of two Laplacing standard deviations (i.e. parameter `conf` in the Pyth price) for the two prices, normalized by their levels, must be less than or equal to 30 basis points.
- It adjusts the SOL/2Z price by a dynamic discount, expressed as a percent of the Pyth price. This discount is a function of the time since the last trade. The formula below specifies the discount, assuming the last trade was made at slot $s_{\text{last}}$ and the current slot is $s_{\text{now}}$. (For instance, if 200 slots have elapsed since the last trade, the discount is 40 basis points.)

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

At this point, if the trader has provided enough 2Z to execute the transaction at this computed price (inclusive of the discount), it executes at this computed price. It returns to the trader the purchased quantity of SOL and any excess 2Z.

The contract then permits no more trades for that slot. This is to prevent the contract from paying excessively high slippage should the Pyth price be far from the true price at any given point in time in ways that the existing filters do not catch issues.

## Program Usage

This section discusses checking conversion rates and executing the conversion using the `doublezero-solana` CLI. And at the end, we discuss the interface for custom-built integrations with the DoubleZero swap contract.

### How to check the SOL/2Z conversion price via `doublezero-solana`

To find the SOL/2Z conversion rates on mainnet-beta, run the following command:

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

And the output you would see will resemble:

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

The Journal Balance informs the user how much SOL liquidity there is in the Revenue Distribution smart contract. A user can trade as long as the Journal Balance exceeds the fixed trade size of 1 SOL. 

The first row displays the "true" SOL/2Z conversion price via an offchain oracle. The second row is the conversion price used on-chain for the swap, which simply adjusts the true price for the algorithmic discount.

### How to convert your 2Z to SOL via `doublezero-solana`

To convert your 2Z tokens to SOL, run the following command:

```bash
doublezero-solana revenue-distribution convert-2z
```

By default, if there is enough SOL liquidity and your ATA has enough 2Z to perform the swap, this transaction will succeed. You can more finely-tune the swap by specifying the following arguments:

```bash
      --limit-price <DECIMAL>                    Limit price defaults to the current SOL/2Z oracle price
      --source-2z-account <PUBKEY>               Token account must be owned by the signer. Defaults to signer ATA if not specified
      --checked-sol-amount <SOL>                 Explicitly check SOL amount. When specified, this amount will be checked against the fixed fill quantity
```

The specified limit price determines the worst-case price you are willing to accept when performing the SOL/2Z conversion. For example, let us say the discounted 2Z price for SOL is 800, which means 800 2Z tokens for 1 SOL. If you specify a limit price of 790, you are not willing to perform the swap because you are requiring that you only swap at most 790 2Z tokens for 1 SOL. But if you specify 810, the trade will go through because you were willing to swap at most 810 2Z tokens (and in this case, you will have only swapped 800 2Z tokens in this transaction).

The source 2Z token account overrides the default ATA using the signer as the owner of this 2Z ATA. But if you have another token account you want to use to perform the swap, provide the pubkey for it with this argument.

Optionally, you may specify the checked SOL amount to the standard fill size (set to 1 SOL at launch). If it does not align with the program’s fill size, the swap fails. This mitigates the risk that the program’s fill size changes and you do not notice.

### Interface to Buy SOL

The interface and `doublezero-solana` CLI live in [this repo](https://github.com/doublezerofoundation/doublezero-offchain). The source code for the DoubleZero swap contract interface can be found [here](https://github.com/doublezerofoundation/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09). The program ID is `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`.

A convenient way of generating the accounts needed for the buy SOL instruction is using the `new` method (found in *instruction/account.rs*).

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

The `fill_registry_key` can be fetched either from the `ProgramState`

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

Alternatively, you can call `getProgramAccounts` via Solana RPC with its discriminator. But we recommend caching this pubkey since it will never change.

The `user_key` is a signer for the buy SOL instruction and must be the owner of the `user_token_account_key`. As described above, this does NOT need to be an ATA. As long as your 2Z token account is owned by the `user_key`, this instruction will succeed.

The `BuySolAccounts` struct implements `Into<Vec<AccountMeta>>` so you can generate all of the account metas you need in order to build the instruction.

Instruction data is

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

This instruction data is Borsh-serialized and has an 8-byte Anchor selector, which will all serialize when using `BorshSerialize::serialize`.

The oracle price data can be fetched from this public endpoint: [https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate). The data is serde-deserializable using the OraclePriceData struct found in *oracle.rs*.

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

Example of how to fetch using the [reqwest crate](https://docs.rs/reqwest/latest/reqwest/):

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

With the program ID, accounts and instruction data, you should be able to build the instruction to buy SOL from the DoubleZero swap contract.

## **Disclaimer**

This document and the associated code are provided for informational and technical purposes only. The token conversion functionality described herein is non-custodial — users interact directly with the underlying smart contracts and retain full control of their assets at all times.

The system may rely on or interact with third-party code, data sources, or pricing and fee mechanisms (for example, smart contracts, APIs, or decentralized exchanges) that are not developed, controlled, or reviewed by the developer(s) or publisher(s). No representation or warranty is made as to the accuracy, functionality, or security of any third-party component.

The developer(s) and publisher(s) of this code do not guarantee its accuracy, completeness, or continued availability. The code and related materials are provided “as is”, and may contain bugs, errors, or vulnerabilities. Use is entirely at your own risk.

The developer(s) and publisher(s) do not receive any fees in connection with the use of these contracts. They are under no obligation to maintain, update, or support the code or related documentation.

This document does not constitute an offer to sell, a solicitation to buy, or a recommendation to participate in any token conversion, swap or other transaction. No legal, financial, or investment advice is provided.

Users are solely responsible for determining the legality of their activities. They should review the laws and regulations applicable in their jurisdiction and consult independent advisors before using the code or participating in any conversion. Use is prohibited where it would be unlawful, including by persons or entities subject to sanctions or in restricted jurisdictions.

To the maximum extent permitted by law, the developer(s) and publisher(s) disclaim all liability for any loss, damage, or claim arising from or in connection with use of the code or participation in the conversion.

