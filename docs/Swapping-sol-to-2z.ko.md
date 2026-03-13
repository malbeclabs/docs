**코드 또는 관련 자료에 액세스하거나 사용하기 전에 면책 조항을 검토하세요.**
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


<!-- https://github.com/doublezerofoundation/doublezero-offchain/pull/159 -->

??? warning "면책 조항"

    이 문서와 관련 코드는 정보 및 기술적 목적으로만 제공됩니다. 여기에 설명된 토큰 변환 기능은 비수탁형입니다. 사용자는 기본 스마트 계약과 직접 상호 작용하며 항상 자산에 대한 완전한 통제권을 유지합니다.

    이 시스템은 개발자 또는 게시자가 개발, 제어 또는 검토하지 않은 제3자 코드, 데이터 소스 또는 가격 및 수수료 메커니즘(예: 스마트 계약, API 또는 탈중앙화 거래소)에 의존하거나 상호 작용할 수 있습니다. 제3자 구성 요소의 정확성, 기능 또는 보안에 대한 어떠한 보증이나 보장도 없습니다.
    이 코드의 개발자 및 게시자는 정확성, 완전성 또는 지속적인 가용성을 보장하지 않습니다. 코드 및 관련 자료는 "있는 그대로" 제공되며 버그, 오류 또는 취약점이 포함될 수 있습니다. 사용은 전적으로 귀하의 책임입니다.
    코드의 개발자 및 게시자는 이 계약의 사용과 관련하여 어떠한 수수료도 받지 않습니다. 코드 또는 관련 문서를 유지, 업데이트 또는 지원할 의무가 없습니다.

    이 문서는 토큰 변환, 스왑 또는 기타 거래에 매도 제안, 매수 권유 또는 참여 권장으로 구성되지 않습니다. 법적, 재정적 또는 투자 조언은 제공되지 않습니다.
    사용자는 활동의 합법성을 결정할 전적인 책임이 있습니다. 해당 관할 지역에서 적용 가능한 법률과 규정을 검토하고 코드를 사용하거나 변환에 참여하기 전에 독립적인 어드바이저와 상담해야 합니다. 제재 대상 또는 제한된 관할 지역의 사람 또는 주체를 포함하여 불법이 될 경우 사용이 금지됩니다.

    법률이 허용하는 최대한도 내에서 개발자 및 게시자는 코드 사용 또는 변환 참여와 관련하여 발생하는 손실, 손해 또는 청구에 대한 모든 책임을 면책합니다.

    이 문서 및 관련 코드의 검토 및 사용은 [웹사이트 이용약관](https://doublezero.xyz/terms) 및 [프로토콜 이용약관](https://doublezero.xyz/terms-protocol)에 따릅니다.

DoubleZero 프로토콜은 검증자 사용자로부터 SOL 단위의 수익을 수집하지만 기여자에게 2Z 단위의 보상을 배포합니다. 따라서 SOL을 2Z로 변환해야 합니다.

**이를 위해 적격 참여자는 DoubleZero 스왑 계약에 대해 거래하여 계약에서 SOL을 구매하고 2Z를 판매할 수 있습니다. 가격은 Pyth 가격 피드와 프로그래매틱 할인 메커니즘을 기반으로 합니다.**

이 짧은 가이드는 프로그램 사용 방법을 설명합니다.

***코드 또는 관련 자료에 액세스하거나 사용하기 전에 이 문서 끝에 있는 면책 조항을 검토하세요.***

---

## 프로그램 설계

스왑 프로그램은 거래당 1 SOL의 고정 배치 크기로 SOL을 판매하는 단방향 유동성 풀입니다. 적격 참여자는 오라클 가격과 동적 할인에 의해 결정되는 가격으로 2Z를 예치하여 프로그램에서 SOL을 인출할 수 있습니다. 시간이 지남에 따라 이는 네이티브 토큰을 2Z로 전환하는 프로그램의 목표를 실행합니다.

사용하려면 트레이더가 두 개의 최근 Pyth 가격(SOL/USD 및 2Z/USD)과 2Z 수량을 제공해야 합니다. 그러면 프로그램은 내포된 SOL/2Z 가격을 기반으로 1 SOL 구매에 필요한 2Z를 계산합니다. 그런 다음 몇 가지 추가 단계를 수행합니다:

- Pyth 가격이 충분히 신선한지 확인합니다. 즉, 5초 이상 오래되지 않았는지 확인합니다.
- 두 가격의 신뢰 구간이 충분히 작은지 확인합니다. 즉, 두 가격의 두 라플라스 표준 편차(Pyth 가격의 `conf` 파라미터)의 합이 수준으로 정규화될 때 30 기저점 이하여야 합니다.
- 동적 할인(Pyth 가격의 백분율)으로 SOL/2Z 가격을 조정합니다. 이 할인은 마지막 거래 이후 시간의 함수입니다. 아래 공식은 마지막 거래가 슬롯 $s_{\text{last}}$에서 이루어지고 현재 슬롯이 $s_{\text{now}}$인 경우의 할인을 지정합니다. (예를 들어 마지막 거래 이후 200 슬롯이 경과한 경우 할인은 40 기저점입니다.)

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

이 시점에서 트레이더가 이 계산된 가격(할인 포함)으로 트랜잭션을 실행하기에 충분한 2Z를 제공했다면, 이 계산된 가격으로 실행됩니다. 트레이더에게 구매한 SOL 수량과 초과 2Z를 반환합니다.

그런 다음 계약은 해당 슬롯에 대해 더 이상 거래를 허용하지 않습니다. 이는 Pyth 가격이 현재 기존 필터가 잡지 못하는 방식으로 특정 시점의 실제 가격과 멀리 떨어져 있을 경우 계약이 과도하게 높은 슬리피지를 지불하는 것을 방지하기 위한 것입니다.

---

## 가스 없는 원자적 실행

이 섹션에서는 `harvest-dz` 명령을 사용하는 방법을 자세히 설명합니다. 이 명령은 2가지 작업을 원자적으로 수행합니다.
1. 명령이 Jupiter에서 네이티브 SOL <> 2Z 변환 프로그램 대비 견적을 요청합니다.
2. Jupiter 경로가 네이티브 변환 프로그램이 요구하는 것보다 SOL당 더 많은 2Z를 생성할 때, `harvest-2z`는 스왑을 실행하여 지갑에 1 SOL과 2Z의 차이를 반환합니다.

### Harvest 2Z

실행하려면 다음을 실행하세요:
```
doublezero-solana revenue-distribution harvest-2z
```
출력은 다음과 유사합니다:
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
명령은 `--dry-run` 인수로 시뮬레이션할 수도 있습니다. 드라이런은 프로그램 로그와 다음과 유사한 출력을 생성합니다:

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## 프로토콜 변환

이 섹션에서는 `doublezero-solana` CLI를 사용하여 환율을 확인하고 변환을 실행하는 방법을 설명합니다. 마지막에는 DoubleZero 스왑 계약과의 맞춤형 통합을 위한 인터페이스를 설명합니다.

### `doublezero-solana`를 통해 SOL/2Z 환율 확인 방법

메인넷-베타의 SOL/2Z 환율을 찾으려면 다음 명령을 실행하세요:

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

저널 잔액은 수익 배분 스마트 계약에 얼마나 많은 SOL 유동성이 있는지 사용자에게 알립니다. 저널 잔액이 1 SOL의 고정 거래 크기를 초과하는 한 사용자는 거래할 수 있습니다.

첫 번째 행은 오프체인 오라클을 통한 "실제" SOL/2Z 환율을 표시합니다. 두 번째 행은 스왑에 온체인으로 사용되는 환율로, 단순히 알고리즘 할인에 대한 실제 가격을 조정합니다.

### `doublezero-solana`를 통해 2Z를 SOL로 변환하는 방법

2Z 토큰을 SOL로 변환하려면 다음 명령을 실행하세요:

```bash
doublezero-solana revenue-distribution convert-2z
```

기본적으로 충분한 SOL 유동성이 있고 ATA에 스왑을 수행할 충분한 2Z가 있으면 이 트랜잭션이 성공합니다. 다음 인수를 지정하여 스왑을 더 세밀하게 조정할 수 있습니다:

```bash
      --limit-price <DECIMAL>                    현재 SOL/2Z 오라클 가격을 기본값으로 하는 지정가
      --source-2z-account <PUBKEY>               토큰 계정은 서명자가 소유해야 합니다. 지정하지 않으면 서명자 ATA로 기본 설정됩니다.
      --checked-sol-amount <SOL>                 SOL 금액을 명시적으로 확인합니다. 지정된 경우 이 금액이 고정 채움 수량과 비교하여 확인됩니다.
```

지정된 지정가는 SOL/2Z 변환을 수행할 때 수락할 최악의 경우 가격을 결정합니다. 예를 들어 SOL에 대한 할인된 2Z 가격이 800이라고 가정합시다. 즉, 1 SOL에 2Z 토큰 800개입니다. 지정가를 790으로 지정하면 최대 790개의 2Z 토큰만 스왑하도록 요구하기 때문에 스왑을 수행하지 않습니다. 그러나 810을 지정하면 최대 810개의 2Z 토큰을 스왑할 의향이 있었으므로 거래가 이루어집니다(이 경우 이 트랜잭션에서 2Z 토큰 800개만 스왑됩니다).

소스 2Z 토큰 계정은 이 2Z ATA의 소유자로 서명자를 사용하는 기본 ATA를 재정의합니다. 그러나 스왑을 수행하는 데 사용하려는 다른 토큰 계정이 있는 경우 이 인수와 함께 해당 공개 키를 제공하세요.

선택적으로, 확인된 SOL 금액을 표준 채움 크기(출시 시 1 SOL로 설정됨)에 지정할 수 있습니다. 프로그램의 채움 크기와 일치하지 않으면 스왑이 실패합니다. 이는 프로그램의 채움 크기가 변경되고 귀하가 알아차리지 못하는 위험을 완화합니다.

### SOL 구매 인터페이스

인터페이스와 `doublezero-solana` CLI는 [이 저장소](https://github.com/doublezerofoundation/doublezero-offchain)에 있습니다. DoubleZero 스왑 계약 인터페이스의 소스 코드는 [여기](https://github.com/doublezerofoundation/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09)에서 찾을 수 있습니다. 프로그램 ID는 `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`입니다.

buy SOL 명령에 필요한 계정을 생성하는 편리한 방법은 *instruction/account.rs*에 있는 `new` 메서드를 사용하는 것입니다.

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

`fill_registry_key`는 `ProgramState`에서 가져올 수 있습니다.

```rust
pub struct ProgramState {
    pub admin_key: Pubkey,
    pub fills_registry_key: Pubkey, // 이 키
    pub is_paused: bool,
    pub configuration_registry_bump: u8,
    pub program_state_bump: u8,
    pub deny_list_registry_bump: u8,
    pub withdraw_authority_bump: u8,
    pub last_trade_slot: u64,
    pub deny_list_authority: Pubkey,
}
```

대안으로 판별자를 사용하여 Solana RPC를 통해 `getProgramAccounts`를 호출할 수 있습니다. 그러나 이 공개 키는 절대 변경되지 않으므로 캐시하는 것을 권장합니다.

`user_key`는 buy SOL 명령의 서명자이며 `user_token_account_key`의 소유자여야 합니다. 위에서 설명한 바와 같이 이것은 ATA일 필요가 없습니다. 2Z 토큰 계정이 `user_key`가 소유하는 한 이 명령이 성공합니다.

`BuySolAccounts` 구조체는 `Into<Vec<AccountMeta>>`를 구현하므로 명령을 빌드하는 데 필요한 모든 계정 메타를 생성할 수 있습니다.

명령 데이터는 다음과 같습니다:

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

이 명령 데이터는 Borsh 직렬화되고 8바이트 Anchor 선택자가 있으며, 이는 `BorshSerialize::serialize`를 사용할 때 모두 직렬화됩니다.

오라클 가격 데이터는 이 공개 엔드포인트에서 가져올 수 있습니다: [https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate). 데이터는 *oracle.rs*에 있는 OraclePriceData 구조체를 사용하여 serde 역직렬화 가능합니다.

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

[reqwest 크레이트](https://docs.rs/reqwest/latest/reqwest/)를 사용하여 가져오는 방법 예시:

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

프로그램 ID, 계정 및 명령 데이터를 사용하여 DoubleZero 스왑 계약에서 SOL을 구매하는 명령을 빌드할 수 있어야 합니다.
