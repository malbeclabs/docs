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

검증자는 온체인 [스왑 프로그램](https://github.com/doublezerofoundation/doublezero-offchain/tree/main/crates/solana-interface/sol-conversion)을 통해 2Z로 수수료를 납부할 수 있습니다. 스왑은 2Z를 SOL로 교환하여 수행됩니다. 예치 계정의 SOL 잔액이 스왑에 따라 업데이트됩니다.

이 프로세스는 **항상** 1 SOL 단위를 사용합니다. 이 스왑의 결과는 **항상** 예치 계정으로 직접 입금됩니다. 이는 일방통행입니다. 이 트랜잭션에서 2Z 또는 SOL을 회수할 수 없습니다. 온체인 배분 모듈로 전송됩니다.


#### 1단계
먼저 현재 환율을 확인합니다.


```
doublezero-solana revenue-distribution fetch sol-conversion
```


출력:
```
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 800.86265341  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 797.75530631  | Includes 0.38800000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```


#### 2단계
지정가 주문을 합니다. 이 스왑은 귀하의 책임 하에 실행됩니다. 위험 프로필에 대한 권장 사항을 제공하지 않으며, 여기에 제공된 예시는 교육 목적으로만 사용됩니다.


##### 지정가 주문 구성 방법
위의 예를 바탕으로 이제 호가 가격보다 5% 높은 지정가 주문을 합니다.
797.76 * 1.05 = 837.65


이 예시에서 예치 계정에 0 SOL이 있다고 가정합니다.


```
doublezero-solana revenue-distribution --convert-2z-limit-price 837.65 --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 --fund 1
```
위 명령에서 `--fund 1`에 주목하세요. 이는 예치 계정에 1 SOL을 명시적으로 펀딩합니다.


1 이외의 숫자를 선택하면 잘못된 금액을 알리는 오류가 발생합니다:
```
Error: SOL amount must be 1.000000000 for 2Z -> SOL conversion. Got 1.500000000
```


트랜잭션을 확인하라는 메시지가 표시됩니다:


```
⚠️  By specifying --convert-2z-limit-price, you are funding 1.000000000 SOL to your deposit account. Proceed? [y/N]
```


출력:
```
2Z token balance: 987241.76579348
Converted 2Z to SOL: 2iaBzd4vgEeDnpfSCD9aYFMWZ3UoVzrJfUjSMhsDhfSQ6isPZKkKe3ZWQ6b5aWvV3h8Vsk8Mmde6wmCiidD4Qc6s
Converted 837.65 2Z tokens to 1.000000000 SOL
```
성공적인 스왑 시 `Balance:`가 1 SOL로 업데이트된 것을 주목하세요.


가격이 지정된 범위를 벗어나면 다음과 같은 오류가 발생합니다:
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
