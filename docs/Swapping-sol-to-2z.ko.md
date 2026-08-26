**코드 또는 관련 자료에 접근하거나 사용하기 전에 면책 조항을 검토하십시오.**

<!-- https://github.com/malbeclabs/doublezero-offchain/pull/159 -->

??? warning "면책 조항"
    
    이 문서와 관련 코드는 정보 제공 및 기술적 목적으로만 제공됩니다. 본 문서에서 설명하는 토큰 변환 기능은 비수탁형(non-custodial)으로, 사용자는 기반 스마트 컨트랙트와 직접 상호작용하며 자산에 대한 완전한 통제권을 항상 보유합니다.

    이 시스템은 개발자 또는 발행자가 개발, 통제 또는 검토하지 않은 제3자 코드, 데이터 소스, 가격 책정 및 수수료 메커니즘(예: 스마트 컨트랙트, API 또는 탈중앙화 거래소)에 의존하거나 상호작용할 수 있습니다. 제3자 구성 요소의 정확성, 기능성 또는 보안에 대해 어떠한 진술이나 보증도 하지 않습니다.
    이 코드의 개발자 및 발행자는 코드의 정확성, 완전성 또는 지속적인 가용성을 보장하지 않습니다. 코드 및 관련 자료는 "있는 그대로" 제공되며, 버그, 오류 또는 취약점을 포함할 수 있습니다. 사용은 전적으로 귀하의 책임 하에 이루어집니다.
    개발자 및 발행자는 이러한 컨트랙트 사용과 관련하여 어떠한 수수료도 받지 않습니다. 코드 또는 관련 문서를 유지, 업데이트 또는 지원할 의무가 없습니다.

    이 문서는 토큰 변환, 스왑 또는 기타 거래에 대한 매도 제안, 매수 권유 또는 참여 권장을 구성하지 않습니다. 법적, 재정적 또는 투자 조언이 제공되지 않습니다.
    사용자는 자신의 활동의 합법성을 판단할 전적인 책임이 있습니다. 코드를 사용하거나 변환에 참여하기 전에 자신의 관할권에 적용되는 법률 및 규정을 검토하고 독립적인 자문을 구해야 합니다. 제재 대상 개인 또는 단체, 제한된 관할권에서의 사용을 포함하여 불법이 될 수 있는 경우 사용이 금지됩니다.

    법률이 허용하는 최대 범위 내에서, 개발자 및 발행자는 코드 사용 또는 변환 참여로 인해 또는 이와 관련하여 발생하는 모든 손실, 손해 또는 청구에 대한 모든 책임을 부인합니다.

    이 문서 및 관련 코드의 검토 및 사용은 [웹사이트 이용약관](https://doublezero.xyz/terms) 및 [프로토콜 이용약관](https://doublezero.xyz/terms-protocol)의 적용을 받습니다.

DoubleZero 프로토콜은 검증자 사용자로부터 SOL 표시 수익을 수집하지만, 기여자에게는 2Z 표시 보상을 분배합니다. 따라서 SOL을 2Z로 변환해야 합니다.

**이를 위해, 자격을 갖춘 참여자는 DoubleZero 스왑 컨트랙트를 상대로 거래할 수 있으며, 컨트랙트에서 SOL을 구매하고 2Z를 매도합니다. 가격은 Pyth 가격 피드와 프로그래밍 방식의 할인 메커니즘을 기반으로 합니다.**

이 간략한 가이드는 프로그램 사용 방법을 설명합니다.

***코드 또는 관련 자료에 접근하거나 사용하기 전에 이 문서 끝에 있는 면책 조항을 검토하십시오.***

---

## 프로그램 설계

스왑 프로그램은 사실상 거래당 1 SOL의 고정 배치 크기로 SOL을 판매하는 단방향 유동성 풀입니다. 자격을 갖춘 참여자라면 누구나 Pyth의 오라클 가격과 동적 할인에 의해 결정되는 가격으로 2Z를 예치하여 프로그램에서 SOL을 인출할 수 있습니다. 시간이 지남에 따라, 이는 네이티브 토큰을 2Z로 전환하려는 프로그램의 목표를 달성합니다.

활용하려면, 거래자는 두 개의 최신 Pyth 가격(SOL/USD 및 2Z/USD)과 2Z 수량을 제공해야 합니다. 그러면 프로그램은 내재된 SOL/2Z 가격을 기반으로 해당 1 SOL을 구매하는 데 필요한 2Z를 계산합니다. 그런 다음 몇 가지 추가 단계를 수행합니다:

- Pyth 가격이 충분히 최신인지, 즉 5초 이상 지연되지 않았는지 확인합니다.
- 두 가격의 신뢰 구간이 충분히 작은지 확인합니다. 즉, 두 가격에 대한 두 라플라스 표준 편차(즉, Pyth 가격의 `conf` 파라미터)의 합을 각각의 수준으로 정규화한 값이 30 베이시스 포인트 이하여야 합니다.
- SOL/2Z 가격을 동적 할인으로 조정하며, 이는 Pyth 가격의 백분율로 표시됩니다. 이 할인은 마지막 거래 이후 경과 시간의 함수입니다. 아래 공식은 마지막 거래가 슬롯 $s_{\text{last}}$에서 이루어졌고 현재 슬롯이 $s_{\text{now}}$인 경우의 할인을 명시합니다. (예를 들어, 마지막 거래 이후 200 슬롯이 경과했다면 할인은 40 베이시스 포인트입니다.)

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

이 시점에서, 거래자가 이 계산된 가격(할인 포함)으로 거래를 실행하기에 충분한 2Z를 제공했다면, 이 계산된 가격으로 실행됩니다. 거래자에게 구매한 SOL 수량과 초과 2Z를 반환합니다.

그 후 컨트랙트는 해당 슬롯에서 더 이상의 거래를 허용하지 않습니다. 이는 기존 필터가 문제를 포착하지 못하는 방식으로 특정 시점에 Pyth 가격이 실제 가격과 크게 다를 경우, 컨트랙트가 과도하게 높은 슬리피지를 지불하는 것을 방지하기 위함입니다.

---

## 가스 없는 원자적 실행

이 섹션에서는 `harvest-dz` 명령어 사용 방법을 상세히 설명합니다. 이 명령어는 원자적으로 2가지 작업을 수행합니다.
1. 이 명령어는 Jupiter 대비 네이티브 SOL <> 2Z 변환 프로그램의 견적을 요청합니다.
2. Jupiter 경로가 네이티브 변환 프로그램이 요구하는 것보다 SOL당 더 많은 2Z를 제공할 때, `harvest-2z`는 스왑을 실행하여 지갑에 1 SOL과 2Z의 차액을 반환합니다.

### Harvest 2Z

실행하려면 다음을 실행하십시오:
```
doublezero-solana revenue-distribution harvest-2z
```
출력은 다음과 유사합니다:
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
이 명령어는 `--dry-run` 인자를 사용하여 시뮬레이션할 수도 있습니다. Dry-run은 프로그램 로그와 다음과 유사한 출력을 생성합니다:

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## 프로토콜 변환

이 섹션에서는 `doublezero-solana` CLI를 사용하여 변환율을 확인하고 변환을 실행하는 방법을 논의합니다. 마지막으로, DoubleZero 스왑 컨트랙트와의 커스텀 통합을 위한 인터페이스에 대해 설명합니다.

### `doublezero-solana`를 통한 SOL/2Z 변환 가격 확인 방법

mainnet-beta에서 SOL/2Z 변환율을 확인하려면 다음 명령어를 실행하십시오:

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

출력은 다음과 유사합니다:

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

Journal Balance는 Revenue Distribution 스마트 컨트랙트에 얼마나 많은 SOL 유동성이 있는지 사용자에게 알려줍니다. 사용자는 Journal Balance가 고정 거래 크기인 1 SOL을 초과하는 한 거래할 수 있습니다.

첫 번째 행은 오프체인 오라클을 통한 "실제" SOL/2Z 변환 가격을 표시합니다. 두 번째 행은 스왑에 사용되는 온체인 변환 가격으로, 실제 가격에 알고리즘적 할인을 적용한 것입니다.

### `doublezero-solana`를 통한 2Z에서 SOL로의 변환 방법

2Z 토큰을 SOL로 변환하려면 다음 명령어를 실행하십시오:

```bash
doublezero-solana revenue-distribution convert-2z
```

기본적으로, SOL 유동성이 충분하고 ATA에 스왑을 수행할 만큼의 2Z가 있다면 이 트랜잭션은 성공합니다. 다음 인자를 지정하여 스왑을 더 세밀하게 조정할 수 있습니다:

```bash
      --limit-price <DECIMAL>                    Limit price defaults to the current SOL/2Z oracle price
      --source-2z-account <PUBKEY>               Token account must be owned by the signer. Defaults to signer ATA if not specified
      --checked-sol-amount <SOL>                 Explicitly check SOL amount. When specified, this amount will be checked against the fixed fill quantity
```

지정된 지정가는 SOL/2Z 변환 수행 시 수용할 수 있는 최악의 가격을 결정합니다. 예를 들어, SOL의 할인된 2Z 가격이 800이라고 가정합시다. 이는 1 SOL에 800 2Z 토큰을 의미합니다. 지정가를 790으로 설정하면, 1 SOL에 최대 790 2Z 토큰만 교환하겠다고 요구하는 것이므로 스왑이 수행되지 않습니다. 하지만 810으로 지정하면, 최대 810 2Z 토큰을 교환할 의향이 있으므로 거래가 성사됩니다(이 경우, 실제로는 이 트랜잭션에서 800 2Z 토큰만 교환하게 됩니다).

소스 2Z 토큰 계정은 서명자를 이 2Z ATA의 소유자로 사용하는 기본 ATA를 재정의합니다. 스왑에 사용하고 싶은 다른 토큰 계정이 있다면, 이 인자에 해당 pubkey를 제공하십시오.

선택적으로, 표준 체결 크기(출시 시 1 SOL로 설정)에 맞춰 checked SOL amount를 지정할 수 있습니다. 프로그램의 체결 크기와 일치하지 않으면 스왑이 실패합니다. 이는 프로그램의 체결 크기가 변경되었는데 귀하가 이를 인지하지 못하는 위험을 완화합니다.

### SOL 구매 인터페이스

인터페이스와 `doublezero-solana` CLI는 [이 저장소](https://github.com/malbeclabs/doublezero-offchain)에 있습니다. DoubleZero 스왑 컨트랙트 인터페이스의 소스 코드는 [여기](https://github.com/malbeclabs/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09)에서 찾을 수 있습니다. Program ID는 `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`입니다.

SOL 구매 명령에 필요한 계정을 생성하는 편리한 방법은 `new` 메서드(*instruction/account.rs*에 위치)를 사용하는 것입니다.

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

`fill_registry_key`는 `ProgramState`에서 가져올 수 있습니다

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

또는, Solana RPC를 통해 해당 discriminator와 함께 `getProgramAccounts`를 호출할 수 있습니다. 하지만 이 pubkey는 절대 변경되지 않으므로 캐싱하는 것을 권장합니다.

`user_key`는 SOL 구매 명령의 서명자이며 `user_token_account_key`의 소유자여야 합니다. 위에서 설명한 바와 같이, 이것은 ATA일 필요가 없습니다. 2Z 토큰 계정이 `user_key`에 의해 소유되기만 하면 이 명령은 성공합니다.

`BuySolAccounts` 구조체는 `Into<Vec<AccountMeta>>`를 구현하므로, 명령을 빌드하는 데 필요한 모든 account meta를 생성할 수 있습니다.

명령 데이터는 다음과 같습니다

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

이 명령 데이터는 Borsh 직렬화되며 8바이트 Anchor 셀렉터를 가지고 있으며, `BorshSerialize::serialize`를 사용할 때 모두 직렬화됩니다.

오라클 가격 데이터는 다음 공개 엔드포인트에서 가져올 수 있습니다: [https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate). 이 데이터는 *oracle.rs*에 있는 OraclePriceData 구조체를 사용하여 serde 역직렬화할 수 있습니다.

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

[reqwest 크레이트](https://docs.rs/reqwest/latest/reqwest/)를 사용한 가져오기 예시:

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

Program ID, 계정 및 명령 데이터를 사용하여 DoubleZero 스왑 컨트랙트에서 SOL을 구매하는 명령을 빌드할 수 있습니다.