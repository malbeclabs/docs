---
description: Solana 검증자(mainnet-beta 또는 testnet)와 최대 3개의 백업을 IBRL 모드로 DoubleZero에 연결합니다. 신원 증명 및 연결 요청 과정을 포함합니다.
---

# IBRL 모드에서의 검증자 연결

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 서비스 약관](https://doublezero.xyz/terms-protocol)에 동의합니다"

??? warning "DoubleZero 테스트넷에 연결함으로써 여기에 명시된 평가 계약 조건에 동의합니다 (클릭하여 펼치기)"
    <span style="font-size:14px;">DoubleZero Testnet</span>
    평가 계약

    솔루션(아래 정의됨)에 접근하거나 이를 사용함으로써, 귀하는 최초 접근일("**발효일**")부터 본
    평가 계약("**본 계약**")이 DoubleZero Foundation("**DZF**")이
    귀하("**사용자**" 또는 "**귀하**")에게 평가 목적으로 솔루션에 대한
    접근을 제공하는 조건을 규정함에 동의합니다. 상호 약정을 고려하여 귀하는
    다음과 같이 동의합니다:

    <span style="font-size:14px;">1. 정의.</span>

    <span style="font-size:14px;">1.1 "**기밀 정보**"</span>란 기밀로 지정되었거나 기밀로 이해되어야 하는, 솔루션, 제품 계획, 사업 계획, 영업 비밀, 기술 또는 기타 독점 정보를 포함하되 이에 국한되지 않는, 일방 당사자가 타방 당사자에게 공개하는 모든 정보를 의미합니다.

    <span style="font-size:14px;">1.2 "**솔루션**" </span>이란 web3 프로젝트를 위한 DoubleZero 고성능 네트워크 인프라의 테스트넷 버전("**Testnet**") 및 통합 대역폭을 포함한 관련 엣지 필터링 서비스("**정보 서비스**"), DZ 소프트웨어(아래 정의됨), DZ 소프트웨어에 관련하여 DZF가 제공하는 모든 자료("**문서**"), 그리고 DZF가 본 계약에 따라 사용자에게 제공하는 기타 자료를 의미합니다.

    <span style="font-size:14px;">2. 접근. </span>

    <span style="font-size:14px;">2.1 ^^솔루션에 대한 접근^^.</span> 본 계약의 조건에 따라, DZF는 인터넷을 통해 사용자에게 솔루션에 대한 접근을 제공합니다. 사용자의 접근은 정보 서비스만을 평가할 수 있도록 하는 비독점적, 양도 불가능한 솔루션의 제한적 사용입니다. 솔루션을 구성하는 소프트웨어("**DZ 소프트웨어**")와 관련하여, DZF는 사용자에게 평가 기간 동안 문서에서 의도한 대로만 해당 DZ 소프트웨어를 복사, 다운로드, 합리적인 수의 사본 제작, 실행 및 배포(해당하는 경우)할 수 있는 제한적이고 철회 가능한 라이선스를 부여합니다.

    <span style="font-size:14px;">2.2 ^^제한 사항^^. </span>사용자는 발효일부터 DZF가 종료할 때까지("**평가 기간**") 본 계약에 따라 솔루션을 사용할 수 있습니다. 사용자는 평가 기간 이후의 솔루션 사용 권리가 수수료 지불을 포함한 별도의 상업적 계약에 따를 것임을 이해합니다. 사용자는 다음 행위를 하거나 제3자가 하도록 허용해서는 안 됩니다: (i) 솔루션 또는 그 일부를 기반으로 파생 저작물을 수정하거나 작성하는 행위; (ii) 본 계약에서 명시적으로 허용한 경우를 제외하고 솔루션을 복제하는 행위; (iii) 사용자의 플랫폼이나 제품을 통한 또는 이와 관련한 정보 서비스 제공으로서가 아닌 독립형 기반으로, 서비스 뷰로 기반 또는 기타 방식으로 솔루션의 전부 또는 일부에 대한 재라이선스, 배포, 판매, 대여, 임대, 양도 또는 권리 부여를 하거나 제3자에게 솔루션에 대한 접근을 제공하는 행위; 또는 (iv) 본 계약에 규정된 것 이외의 방식으로 솔루션을 사용하는 행위.

    <span style="font-size:14px;">2.3 ^^소유권^^.</span> DZF는 솔루션에 대한 지적 재산권을 포함한 모든 권리, 소유권 및 이익을 보유합니다.

    <span style="font-size:14px;">3 피드백.</span>
    DZF는 수시로 사용자에게 솔루션의 사용, 운영 및 기능에 관한 피드백("피드백")을 제공할 것을 요청할 수 있으며, 사용자는 DZF에 이를 제공하는 데 동의합니다. 사용자는 이에 DZF에게 피드백을 제품 및 서비스에 사용하고 통합하며, 그러한 제품 및 서비스를 제조, 사용, 판매, 판매 제안, 수입 및 기타 이용하며, 피드백을 제한 없이 사용, 복사, 배포 및 기타 이용할 수 있는 비독점적, 전 세계적, 영구적, 철회 불가능한, 로열티 없는, 전액 지불된, 완전히 재라이선스 가능하고 양도 가능한 권리 및 라이선스를 부여합니다.

    <span style="font-size:14px;">4. 기간 및 해지.</span>

    <span style="font-size:14px;">4.1 ^^기간^^.</span> 본 계약은 발효일부터 시작되며 평가 기간 동안 완전한 효력을 유지합니다. 어느 당사자든 서면 통지(이메일로 충분)로 사유 여부에 관계없이 편의에 따라 즉시 본 계약을 해지할 수 있습니다.

    <span style="font-size:14px;">4.1 ^^해지의 효과^^.</span> 어떤 사유로든 본 계약이 해지되면: (i) 사용자에게 부여된 권리는 즉시 종료됩니다; (ii) 사용자는 즉시 솔루션의 모든 사용을 중단하고 통제 하에 있는 모든 문서 및 DZ 소프트웨어를 반환하거나 파기해야 합니다; (iii) 각 당사자는 상대방의 모든 기밀 정보 및 재산을 즉시 반환하거나 파기해야 합니다; 그리고 (iv) 섹션 2.2, 2.3, 3, 4.2 및 5부터 8까지는 존속합니다.

    <span style="font-size:14px;">5. 기밀 유지.</span>
    각 당사자는 상대방의 기밀 정보를 본 계약에 따른 의무 이행 및 권리 행사 목적으로만 사용하고, 본 계약에서 달리 허용되는 경우를 제외하고는 이를 공개하거나 공개되도록 허용하지 않을 것에 동의합니다. 다만, 어느 당사자든 알 필요가 있고 본 계약에 규정된 것 이상으로 보호적인 기밀 유지 의무에 구속되는 자사 인력, 변호사 및 기타 대리인에게 기밀 정보를 공개할 수 있으며, 법률에 의해 요구되는 경우(이 경우 수령 당사자는 공개 당사자에게 사전 통지 및 이의 제기 기회를 제공하고, 관련 법률이 허용하는 범위 내에서 공개를 최소화합니다) 공개할 수 있습니다. 본 섹션 5의 기밀 유지 의무는 다음에 해당하는 정보에는 적용되지 않습니다: (a) 수령 당사자의 과실 없이 일반적으로 알려지거나 공개된 정보; (b) 공개 당사자의 공개 이전에 수령 당사자가 제한 없이 적절히 알고 있던 정보; (c) 법적 권한을 가진 다른 사람이 제한 없이 수령 당사자에게 적절히 공개한 정보; 또는 (d) 공개 당사자의 기밀 정보를 사용하거나 참조하지 않고 수령 당사자가 독립적으로 개발한 정보. 각 당사자는 상대방의 기밀 정보가 무단 사용 및 공개되지 않도록 적절한 주의를 기울이는 데 동의합니다. 본 섹션 또는 본 계약에 포함된 라이선스 조항의 실제 또는 예상 위반 시, 비위반 당사자는 기타 권리 또는 구제수단을 포기하지 않고 즉각적인 금지명령 및 기타 형평법적 구제를 구할 권리를 가집니다. 사용자는 솔루션과 솔루션에 대한 접근을 제공하는 모든 비밀번호, 시드 구문 또는 코드의 비밀을 DZF의 기밀 정보로서 유지할 책임이 있습니다. 본 계약의 어떤 내용도 솔루션의 성능, 가용성, 사용량, 무결성 및 보안에 관한 데이터를 사용할 DZF의 권리나 능력을 제한하거나 제약하지 않습니다. 어느 당사자든 본 섹션 5의 조항을 위반하거나 위반을 위협하는 경우, 각 당사자는 비위반 당사자가 법률상 적절한 구제수단을 갖지 못하며 따라서 보증금 없이 그리고 실제 금전적 손해를 입증할 필요 없이 즉각적인 금지명령 및 기타 형평법적 구제를 받을 권리가 있음에 동의합니다.

    <span style="font-size:14px;">6. 보증 면책; 책임 제한.</span>

    <span style="font-size:14px;">6.1 ^^보증 면책^^.</span> 솔루션은 어떠한 종류의 보증 없이 "있는 그대로" 제공됩니다. DZF는 솔루션 및 문서의 상태, 어떤 표현이나 설명에 대한 적합성을 포함하여 명시적, 묵시적, 법정 또는 기타 어떠한 보증도 하지 않으며, DZF는 상품성, 특정 목적 적합성, 소유권 및 비침해에 대한 모든 묵시적 보증을 명시적으로 부인합니다.

    <span style="font-size:14px;">6.2 ^^책임 제한^^.</span>
    섹션 2.1, 2.2 및 5의 위반을 제외하고, 어떠한 경우에도 어느 당사자도 본 계약에서 발생하거나 이와 관련하여 계약, 불법행위 또는 기타 소송에서 이익 손실, 사용 손실 또는 데이터 손실에 대한 손해를 포함하되 이에 국한되지 않는 간접적, 부수적, 특별 또는 기타 결과적 손해에 대해 상대방에게 책임을 지지 않으며, 이는 상대방이 그러한 손해의 가능성을 통보받은 경우에도 마찬가지입니다. 어떠한 경우에도 DZF의 본 계약에서 발생하거나 이와 관련된 총 책임은 계약, 불법행위 또는 기타 소송 여부에 관계없이 100달러(\$100)를 초과하지 않습니다. **전술한 제한은 본 계약의 제한적 구제수단의 본질적 목적이 달성되지 못한 경우에도 적용됩니다.** 당사자들은 전술한 제한이 본 계약에 따른 합리적인 위험 배분을 나타냄에 동의합니다.

    <span style="font-size:14px;">7. 준거법.</span>
    본 계약 및 본 계약에서 발생하거나 이와 관련된 모든 사항은 케이만 제도 법률에 따라 규율, 해석 및 구성됩니다. 본 계약에서 발생하거나 이와 관련하여 논쟁, 분쟁 또는 청구("분쟁")가 발생하는 경우, 해당 당사자는 상대방에게 30일 전 분쟁 통지("분쟁 통지")를 해야 합니다. 분쟁 통지 송달 후 30일 경과 시에도 분쟁이 해결되지 않으면, 해당 당사자는 본 계약에 규정된 바에 따라 중재 절차를 개시할 수 있습니다. 분쟁 통지 송달 후 30일 경과 시에도 분쟁이 남아 있는 경우, 분쟁은 본 계약일 기준으로 유효한 CI-MAC 중재 규칙("중재 규칙")에 따라 케이만 국제 중재 및 조정 센터(CI-MAC)가 관리하는 중재에 의해 해결되며, 해당 중재 규칙은 본 조항에 참조로 통합된 것으로 간주되고, 중재법(개정 포함)에 의해 규율됩니다. 중재의 소재지는 케이만 제도 그랜드 케이만의 조지타운이며 케이만 제도 법률이 적용됩니다. 중재 언어는 영어입니다. 중재는 중재 규칙에 따라 선임된 단독 중재인에 의해 결정됩니다. 중재인이 내린 모든 판정 또는 결정은 서면으로 작성되며 항소권 없이 당사자들에게 최종적이고 구속력을 가지며, 이에 따라 획득된 판정에 대한 판결은 관할권을 가진 법원에서 등록되거나 집행될 수 있습니다. 본 계약에서 발생하거나 이와 관련된 청구에 기반한 법률상 또는 형평법상 소송은 어떤 관할권의 법원에서도 제기될 수 없습니다. 본 계약 조건의 집행을 위해 소송이나 중재가 필요한 경우, 승소 당사자는 상대방으로부터 변호사 비용을 지급받을 권리를 가집니다. 각 당사자는 불편한 법정지 원칙을 주장하거나, 해당 중재 또는 법원의 관할에 복종하지 않음을 주장하거나, 본 계약에 따라 절차가 제기되는 범위에서 관할지에 이의를 제기할 수 있는 권리를 포기합니다. </span>

    <span style="font-size:14px;">8. 일반 조항.</span>
    본 계약은 DZF의 사전 서면 동의 없이 사용자가 양도하거나 이전할 수 없습니다. DZF는 본 계약을 자유롭게 양도할 수 있습니다. 본 계약에 따라 송부가 요구되는 모든 통지는 이메일(DZF 수신처: legal@doublezero.xyz)로 송부되어야 하며 송부 다음 날 수신된 것으로 간주됩니다(전송 확인 포함). 본 계약의 어떤 조항이 무효이거나 집행 불가능한 것으로 판정되더라도, 본 계약의 나머지 조항은 완전한 효력을 유지합니다. 어느 당사자의 본 계약의 불이행 또는 위반에 대한 권리 포기는 다른 또는 후속 불이행이나 위반에 대한 권리 포기를 구성하지 않습니다. 어느 당사자도 천재지변, 지진, 공급 부족, 운송 어려움, 노동 분쟁, 폭동, 전쟁, 화재, 전염병 및 예견 가능 여부에 관계없이 통제 범위를 벗어난 유사한 사건으로 인한 지연이나 이행 불능에 대해 책임을 지지 않습니다. 본 계약은 첨부 문서와 함께 당사자 간의 완전한 합의를 구성하며, 본 주제에 관한 모든 이전 또는 동시의 서면 또는 구두 합의나 진술을 대체합니다. 본 계약은 각 당사자의 정당한 권한을 가진 대리인이 서명한 서면에 의해서만 수정 또는 변경될 수 있습니다.

Solana 클러스터에 맞는 DoubleZero 네트워크를 선택하세요: `mainnet-beta` 또는 `testnet`. [설정](../../setup.md)에서 해당하는 패키지를 설치하고, 아래의 모든 명령에 동일한 네트워크를 사용하세요.

!!! Note inline end
    IBRL 모드는 기존 공개 IP 주소를 사용하므로 검증자 클라이언트를 재시작할 필요가 없습니다.

Solana 검증자는 이 페이지의 단계를 사용하여 IBRL 모드로 DoubleZero에 연결합니다.

각 Solana 검증자는 고유한 **신원 키페어**를 가지고 있으며, 여기서 **노드 ID**로 알려진 공개 키를 추출합니다. 이것이 Solana 네트워크에서 검증자의 고유한 지문입니다.

DoubleZeroID와 노드 ID가 확인되면, 머신의 소유권을 증명합니다. 이는 검증자의 신원 키로 서명된 DoubleZeroID를 포함하는 메시지를 생성하여 수행됩니다. 결과 암호화 서명은 귀하가 해당 검증자를 통제하고 있다는 검증 가능한 증거로 사용됩니다.

마지막으로, **DoubleZero에 연결 요청**을 제출합니다. 이 요청은 다음을 전달합니다: *"여기 제 신원이 있고, 여기 소유권 증명이 있으며, 이것이 제가 연결하려는 방식입니다."* DoubleZero는 이 정보를 검증하고, 증명을 수락하며, DoubleZero에서 검증자를 위한 네트워크 접근을 프로비저닝합니다.

이 가이드에서는 1개의 기본 검증자를 등록하고, 동시에 최대 3개의 백업/장애 조치 머신을 등록할 수 있습니다.

## 사전 요구 사항 {#prerequisites}

- Solana CLI가 설치되어 있고 $PATH에 등록되어 있어야 합니다
- 검증자의 경우: sol 사용자 아래에서 검증자 신원 키페어 파일(예: validator-keypair.json)에 접근할 수 있는 권한
- 검증자의 경우: 연결하려는 Solana 검증자의 Identity 키에 최소 1 SOL이 있는지 확인
- 방화벽 규칙이 DoubleZero 및 Solana RPC에 필요한 아웃바운드 연결을 허용해야 하며, 여기에는
 GRE (ip proto 47) 및 BGP (169.254.0.0/16 on tcp/179)가 포함됩니다

!!! info
    Validator ID는 Solana gossip을 통해 대상 IP를 결정하기 위해 확인됩니다. 대상 IP와 DoubleZero ID는 머신과 대상 DoubleZero 장치 간에 GRE 터널을 열 때 사용됩니다.

    참고: 동일한 IP에 junk ID와 Primary ID가 있는 경우, Primary ID만 머신 등록에 사용됩니다. 이는 junk ID가 gossip에 나타나지 않아 대상 머신의 IP를 확인하는 데 사용할 수 없기 때문입니다.

## 1. 클라이언트 네트워크 확인 {#1-confirm-the-client-network}

계속하기 전에 [설정](../../setup.md) 지침을 따르세요. **mainnet-beta** 또는 **testnet** 패키지를 설치하세요. 서로 다른 패키지 저장소를 사용합니다.

설정의 마지막 단계는 네트워크 연결을 해제하는 것이었습니다. 이는 머신에서 DoubleZero로의 터널이 하나만 열려 있고, 그 터널이 올바른 네트워크에 있는지 확인하기 위함입니다.

클라이언트가 선택한 네트워크에 있는지 확인하세요:

```bash
doublezero status
```

`Network` 열이 `mainnet-beta` 또는 `testnet`이어야 하며, Solana 클러스터와 일치해야 합니다. 잘못되었거나 잘못된 패키지를 설치한 경우, [문제 해결](../../support/troubleshooting.md#issue-wrong-doublezero-environment)의 복사-붙여넣기 전환 방법을 사용하세요.

약 30초 후 사용 가능한 DoubleZero 장치를 확인할 수 있습니다:

```bash
doublezero latency
```

예시 출력 (mainnet-beta; testnet도 동일하지만 장치 수가 더 적습니다):

```bash
 pubkey                                       | code          | ip              | min      | max      | avg      | reachable
 2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.74ms   | 1.92ms   | 1.84ms   | true
 ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.88ms   | 4.39ms   | 2.72ms   | true
 8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.45ms   | 3.30ms   | 2.74ms   | true
 8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.88ms   | 5.13ms   | 3.02ms   | true
 uzyg9iYw2FEbtdTHaDb5HoeEWYAPRPQgvsgyd873qPS  | nyc001-dz002  | 4.42.212.122    | 3.17ms   | 3.63ms   | 3.33ms   | true
 FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.33ms   | 5.46ms   | 3.39ms   | true
 9oKLaL6Hwno5TyAFutTbbkNrzxm1fw9fhzkiUHgsxgGx | dz-dc10-sw01  | 137.239.200.186 | 6.84ms   | 7.01ms   | 6.91ms   | true
 DESzDP8GkSTpQLkrUegLkt4S2ynGfZX5bTDzZf3sEE58 | was001-dz002  | 38.88.214.133   | 7.39ms   | 7.44ms   | 7.41ms   | true
 HHNCpqB7CwHVLxAiB1S86ko6gJRzLCtw78K1tc7ZpT5P | was001-dz001  | 66.198.11.74    | 7.67ms   | 7.85ms   | 7.76ms   | true
 9LFtjDzohKvCBzSquQD4YtL3HwuvkKBDE7KSzb8ztV2b | dz-mtl11-sw01 | 134.195.161.10  | 9.88ms   | 10.01ms  | 9.95ms   | true
 9M7FfYYyjM4wGinKPofZRNmQFcCjCKRbXscGBUiXvXnG | dz-tor1-sw01  | 209.42.165.10   | 14.52ms  | 14.53ms  | 14.52ms  | true
```

## 2. 포트 44880 열기 {#2-open-port-44880}

사용자는 일부 [라우팅 기능](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md)을 활용하기 위해 포트 44880을 열어야 합니다.

포트 44880을 열려면 다음과 같이 IP 테이블을 업데이트할 수 있습니다:

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```


이 규칙을 DoubleZero 인터페이스에만 제한하는 `-i doublezero0`, `-o doublezero0` 플래그에 유의하세요

또는 UFW를 사용할 수 있습니다:

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```


이 규칙을 DoubleZero 인터페이스에만 제한하는 `in on doublezero0`, `out on doublezero0` 플래그에 유의하세요

## 3. 검증자 소유권 증명 {#3-attest-validator-ownership}

!!! note "네트워크 플래그"
    아래 Passport 명령은 `-u mainnet-beta`를 사용합니다. 테스트넷에서는 `-u testnet` (또는 `-ut`)을 대신 사용하세요.

DoubleZero 환경이 설정되었으니, 이제 검증자 소유권을 증명할 차례입니다.

기본 검증자의 [설정](../../setup.md)에서 생성한 DoubleZero ID는 모든 백업 머신에서 사용되어야 합니다.

기본 머신의 ID는 `doublezero address`로 확인할 수 있습니다. 동일한 ID가 클러스터의 모든 머신의 `~/.config/doublezero/id.json`에 있어야 합니다.

이를 위해 먼저 명령을 실행하는 머신이 **기본 검증자**인지 다음 명령으로 확인합니다:

```
doublezero-solana passport find-validator -u mainnet-beta
```

이 명령은 검증자가 gossip에 등록되어 있고 리더 스케줄에 나타나는지 확인합니다.

예상 출력:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 11.11.11.111
Validator ID: ValidatorIdentity111111111111111111111111111
Gossip IP: 11.11.11.111
In Leader scheduler
✅ This validator can connect as a primary in DoubleZero 🖥️  💎. It is a leader scheduled validator.
```

!!! info
    하나 또는 여러 머신에 대해 동일한 워크플로우가 사용됩니다.
    하나의 머신만 등록하려면 이 페이지의 모든 명령에서 "--backup-validator-ids" 또는 "backup_ids=" 인수를 제외하세요.

이제 **기본 검증자**를 실행할 모든 백업 머신에서 다음을 실행하세요:
```
doublezero-solana passport find-validator -u mainnet-beta
```

예상 출력:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
이 출력은 예상된 것입니다. 백업 노드는 패스 생성 시점에 리더 스케줄에 있을 수 없습니다.

이제 **기본 검증자**의 투표 계정과 신원을 사용할 **모든 백업 머신**에서 이 명령을 실행합니다.


### 연결 준비 {#prepare-the-connection}

**기본 검증자** 머신에서 다음 명령을 실행하세요. 이것은 활성 스테이크가 있고, 명령을 실행하는 머신의 solana gossip에 기본 검증자 ID가 있는 리더 스케줄에 포함된 머신입니다:

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


예시 출력:

```
DoubleZero Passport - Prepare Validator Access Request
Connected to Solana: mainnet-beta

Primary validator 🖥️  💎:
  ID: ValidatorIdentity111111111111111111111111111
  Gossip: ✅ OK 11.11.11.111)
  Leader scheduler: ✅ OK (Stake: 1,050,000.00 SOL)

Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity222222222222222222222222222
  Gossip: ✅ OK (22.22.22.222)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity333333333333333333333333333
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


  Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity444444444444444444444444444
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)

  To request access, sign the following message with your validator's identity key:

  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>

```
이 명령의 끝에 출력된 내용에 유의하세요. 이것이 다음 단계의 구조입니다.


## 4. 서명 생성 {#4-generate-signature}

마지막 단계의 끝에서 `solana sign-offchain-message`에 대한 미리 형식화된 출력을 받았습니다.

위의 출력을 사용하여 **기본 검증자** 머신에서 이 명령을 실행합니다.

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**출력:**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```


## 5. DoubleZero에서 연결 요청 시작 {#5-initiate-a-connection-request-in-doublezero}

`request-validator-access` 명령을 사용하여 연결 요청을 위한 계정을 Solana에 생성합니다. DoubleZero Sentinel 에이전트가 새 계정을 감지하고, 신원 및 서명을 검증한 후, 서버가 연결을 설정할 수 있도록 DoubleZero에 접근 패스를 생성합니다.


노드 ID, DoubleZeroID, 그리고 서명을 사용하세요.

!!! note inline end
      이 예시에서는 검증자 Identity를 찾기 위해 `-k /home/user/.config/solana/id.json`을 사용합니다. 로컬 배포에 적합한 경로를 사용하세요.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**출력:**

이 출력은 Solana 탐색기에서 트랜잭션을 확인하는 데 사용할 수 있습니다. 클러스터에 맞게 탐색기를 mainnet-beta 또는 testnet으로 설정하세요. 이 확인은 선택 사항입니다.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

성공하면, DoubleZero가 기본 검증자와 백업을 등록합니다. 이제 접근 패스에 등록된 IP 간에 장애 조치를 수행할 수 있습니다. DoubleZero는 이 방식으로 등록된 백업 노드로 전환할 때 자동으로 연결을 유지합니다.


## 6. IBRL 모드로 연결 {#6-connect-in-ibrl-mode}

서버에서 DoubleZero에 연결할 사용자로, `connect` 명령을 실행하여 DoubleZero에 대한 연결을 설정합니다.

```
doublezero connect ibrl
```

다음과 같은 프로비저닝을 나타내는 출력이 표시되어야 합니다:

```
⚡  Connecting to mainnet-beta...
    DoubleZero ID: <your DoubleZero ID>
⚡  Provisioning for IP: <your public ip>
    Device selected: <the doublezero device you are connecting to>
✅  User Provisioned
```
GRE 터널 설정이 완료될 때까지 1분 정도 기다리세요. GRE 터널 설정이 완료될 때까지 status 출력이 "down" 또는 "Unknown"을 반환할 수 있습니다.

연결을 확인하세요:

```bash
doublezero status
```

**출력:**
!!! note inline end
    이 출력을 살펴보세요. `Tunnel src`와 `DoubleZero IP`가 머신의 공개 IPv4 주소와 일치하는 것에 주목하세요.
    <!--`Tunnel dst`는 연결된 DZ 장치의 주소입니다.-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```

(테스트넷에서 연결한 경우 `Network`에 `testnet`이 표시됩니다.)

`up` 상태는 성공적으로 연결되었음을 의미합니다.

다음 명령을 실행하여 DoubleZero의 다른 사용자가 전파한 라우트를 확인할 수 있습니다:

```
ip route
```


```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```


### 다음 단계: 멀티캐스트를 통한 Shreds 퍼블리싱 {#up-next-publishing-shreds-via-multicast}

이 설정을 완료했고 멀티캐스트를 통해 shreds를 퍼블리싱할 계획이라면, [다음 페이지](../edge/publish.md)로 진행하세요.