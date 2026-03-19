# 검증자 가격 및 수수료
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


**Solana 검증자를 위한 간단하고 투명한 가격**

수수료는 2024년 10월 4일 토요일 동부 시간 오전 4시에 시작되는 859 에포크부터 시작됩니다. 블록 서명 보상 및 우선 수수료에 대해 균일한 5% 수수료가 부과됩니다.

수수료는 DoubleZero를 가능하게 하는 인프라, 즉 데이터 센터의 물리적 광섬유 라인 및 장비에 직접 자금을 지원합니다.

수수료가 존재하는 이유와 검증자 가격 모델에 대한 심층적인 탐구는 [여기](https://doublezero.xyz/fees)에서 찾을 수 있습니다.

***이 가이드는 기술적 관점에서 수수료가 어떻게 납부되는지에 초점을 맞춥니다.***

## **결제 모델**

- 수수료는 SOL로 표시되며 에포크별로 정산됩니다
- 검증자 채무는 Revenue Distribution 프로그램에 의해 온체인으로 계산됩니다
- 각 검증자는 결제를 위한 보증금 계정(PDA)을 가집니다
- 자금 조달 기간: 수수료는 발생한 Solana 에포크 이후 에포크에 입금됩니다. 즉, 860 에포크 동안 적립된 수수료는 861 에포크에 납부해야 합니다.

- 선결제가 지원됩니다. 잔액은 에포크에 걸쳐 차감됩니다

---

# **수수료 추정**

과거 추정치 및 공개 키별 데이터는 [수수료 추정 저장소](http://github.com/doublezerofoundation/fees)에서 확인할 수 있습니다. 저장소는 온체인 데이터를 대체하지 않습니다. 저장소의 잔액이 아닌 온체인 잔액을 관리할 책임이 있습니다.

질문이 있으시면 Nihar Shah(nihar@doublezero.us)에게 연락하세요.

# 개발자 세부 정보

### 명령줄 인터페이스
DoubleZero CLI는 검증자 보증금을 관리하고 잔액을 모니터링하는 명령을 제공합니다.
이 명령을 실행하는 계정에는 가스 비용을 위한 SOL이 필요합니다.

<div data-wizard-step="fee-check" markdown>

### 1단계: 미납 채무 이해

특정 주소의 채무를 보려면 다음 형식을 사용할 수 있습니다:
```
doublezero-solana revenue-distribution fetch validator-debts --node-id ValidatorIdentity111111111111111111111111111
```
아래에서 예제 출력을 살펴보겠습니다:

```
| node_id                                      |    total_amount | deposit_balance | note                   |
|----------------------------------------------|-----------------|-----------------|------------------------|
| ValidatorIdentity111111111111111111111111111 | 0.632736605 SOL | 0.000220966 SOL | 0.632515639 SOL needed |
| ValidatorIdentity111111111111111111111111111 | 24.520162479 SOL| 0.000000000 SOL | Not funded             |
```
샘플 출력에는 `note` 아래에 두 가지 다른 출력이 있습니다. `Not funded`는 계정에 자금이 없음을 의미합니다. 예에서 `0.632515639 SOL needed`는 대상 검증자 ID와 관련된 현재 미납 채무를 모두 납부하는 데 필요한 미납 SOL 금액입니다.

</div>

<div data-wizard-step="fee-pay" markdown>

### 2단계: 미납 채무 납부

!!! note inline end
      이 명령을 정기적인 간격으로 실행하도록 예약할 수 있습니다.

미납 채무를 납부하려면 다음 명령을 사용할 수 있습니다. 이 명령은 자동으로 `$HOME/.config/solana/id.json`의 기본 키쌍을 사용합니다.

명령 끝에 `-k path/to/keypair.json` 인수를 추가하여 채무 납부에 사용할 키쌍을 지정할 수 있습니다.

```
doublezero-solana revenue-distribution validator-deposit --fund-outstanding-debt --node-id ValidatorIdentity111111111111111111111111111
```
아래에 예제 출력이 제공됩니다.

```
Solana validator deposit: DZ_PDA_MvFTgPku3dUrw2W3dbeK5dhxmXYKKYETDUK1V
Funded: TransactionHashHVxSobvdY2r14CkEwsBDhwf2dBmFatyeftisrdfSocMM2tXPjFvXPRmVs1xagiqKSX4b92fgt
Node ID: ValidatorIdentity111111111111111111111111111
Balance: 0.309294915 SOL
```

`Solana validator deposit:` 자금이 지원된 보증금 계정을 반환합니다

`Funded:` 즐겨찾는 Solana 탐색기에서 조회할 수 있는 트랜잭션 해시를 반환합니다

`Node ID:` 납부된 검증자 ID를 반환합니다

`Balance:` 전송 완료 후 보증금 계정의 SOL 금액을 반환합니다

</div>
