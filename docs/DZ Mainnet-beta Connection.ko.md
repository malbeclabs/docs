---
description: Solana 밸리데이터(mainnet-beta 또는 testnet)와 최대 3개의 백업을 IBRL 모드로 DoubleZero에 연결합니다. 신원 증명 및 연결 요청 과정을 포함합니다.
---

# IBRL 모드에서의 밸리데이터 연결

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 서비스 약관](https://doublezero.xyz/terms-protocol)에 동의합니다"

??? warning "DoubleZero 테스트넷에 연결함으로써 아래에 명시된 평가 계약 조건에 동의합니다 (클릭하여 펼치기)"
    <span style="font-size:14px;">DoubleZero Testnet</span>
    Evaluation Agreement

    By accessing or using the Solution (defined below), you agree as of the
    first date of such access (the "**Effective Date**") that this
    Evaluation Agreement (the "**Agreement**") sets forth the terms and
    conditions under which DoubleZero Foundation ("**DZF**") will provide
    you ("**User**" or "**you**") access to the Solution on an evaluation
    basis. In consideration of the mutual promises herein, you agree as
    follows:

    <span style="font-size:14px;">1. DEFINITIONS.</span>

    <span style="font-size:14px;">1.1 "**Confidential Information**"</span> means any and all information disclosed by either party to the other which is designated as confidential, or which should otherwise be understood to be confidential, including but not limited to, the Solution, product plans, business plans, trade secrets, technology, or any other proprietary information.

    <span style="font-size:14px;">1.2 "**Solution**" </span> means the testnet version of the DoubleZero high-performance network infrastructure for web3 projects ("**Testnet**") and related edge filtering service with integrated bandwidth ("**Information Service**") the DZ Software (defined below), any and all materials provided by DZF relating to the DZ Software ("**Documentation**"), and other materials that DZF provides to User hereunder.

    <span style="font-size:14px;">2. ACCESS. </span>

    <span style="font-size:14px;">2.1 ^^Access to Solution^^.</span> Subject to the terms and conditions of this Agreement, DZF will provide User access to the Solution through the Internet. User's access is a non-exclusive, non-transferable, limited use of the Solution to enable User to evaluate the Information Service only. With respect to any software comprising the Solution ("**DZ Software**"), DZF hereby grants User a limited, revocable license, during the Evaluation Period, to copy, download, make a reasonable number of copies of, run, and deploy (as applicable) such DZ Software solely as contemplated by the Documentation.

    <span style="font-size:14px;">2.2 ^^Restrictions^^. </span>User may use the Solution in accordance with this Agreement from the Effective Date until terminated by DZF (the "**Evaluation Period**"). User understands that any rights to use the Solution beyond the Evaluation Period will be subject to a separate commercial agreement between the parties with respect thereto, including the payment of fees. User shall not, and shall not permit any third party to: (i) modify or create any derivative works based on the Solution or any portion thereof; (ii) reproduce the Solution except as expressly permitted by this Agreement; (iii) sublicense, distribute, sell, lend, rent, lease, transfer, or grant any rights in or to all or any portion of the Solution or provide access to the Solution to third parties, on a service bureau basis or otherwise, except as an offering of the Information Services through or in connection with User's platform or product and not on a standalone basis; or (iv) use the Solution other than as provided herein.

    <span style="font-size:14px;">2.3 ^^Ownership^^.</span> DZF retains all right, title and interest, including intellectual property rights, in and to the Solution.

    <span style="font-size:14px;">3 FEEDBACK.</span>
    DZF may periodically request that User provide, and User agrees to provide to DZF, feedback regarding the use, operation, and functionality of the Solution ("Feedback"). User hereby grants DZF a non-exclusive, worldwide, perpetual, irrevocable, royalty-free, fully paid-up, fully sublicensable and transferable right and license to use and incorporate Feedback into any products and services, to make, use, sell, offer for sale, import, and otherwise exploit such products and services, and to otherwise use, copy, distribute, and otherwise exploit the Feedback without restriction.

    <span style="font-size:14px;">4. TERM AND TERMINATION.</span>

    <span style="font-size:14px;">4.1 ^^Term^^.</span> This Agreement will commence as of the Effective Date and will remain in full force and effect for the Evaluation Period. Either party may terminate this Agreement immediately for convenience, for any reason or no reason, upon written notice to the other party (email to suffice).

    <span style="font-size:14px;">4.1 ^^Effects of Termination^^.</span> Upon termination of this Agreement for any reason: (i) the rights granted to User hereunder will immediately terminate; (ii) User shall immediately discontinue any use of the Solution and shall return or destroy all Documentation and any DZ Software under its control; (iii) each party shall promptly return or destroy all Confidential Information and property of the other party; and (iv) Sections 2.2, 2.3, 3, 4.2, and 5 through 8 will survive.

    <span style="font-size:14px;">5. CONFIDENTIALITY.</span>
    Each party agrees that it will use the Confidential Information of the other party solely to perform its obligations and exercise its rights under this Agreement and it will not disclose, or permit to be disclosed, the same, except as otherwise permitted hereunder. However, either party may disclose Confidential Information to its personnel, attorneys, and other representatives who have a need to know and are bound by confidentiality obligations no less protective than those set forth in this Agreement; and as required by law (in which case the receiving party will provide the disclosing party with prior notice thereof and opportunity to contest such disclosure, and will minimize such disclosure to the extent permitted by applicable law). The obligations of confidentiality in this Section 5 shall not apply to information that: (a) is or becomes generally known or publicly available through no fault of the receiving party; (b) was properly known to the receiving party, without restriction, prior to disclosure by the disclosing party; (c) was properly disclosed to the receiving party, without restriction, by another person with the legal authority to do so; or (d) is independently developed by the receiving party without use of or reference to the disclosing party's Confidential Information. Each party agrees to exercise due care in protecting the Confidential Information of the other party from unauthorized use and disclosure. In the event of actual or threatened breach of the provisions of this Section or the licenses contained herein, the non-breaching party will be entitled to seek immediate injunctive and other equitable relief, without waiving any other rights or remedies available to it. User is responsible for maintaining the Solution and the secrecy of any passwords, seed phrases, or codes that provide access to the Solution as the Confidential Information of DZF. Nothing herein limits or restricts DZF's right or ability to use data regarding the performance, availability, usage, integrity and security of the Solution. If either party breaches, or threatens to breach the provisions of this Section 5, each party agrees that the non-breaching party will have no adequate remedy at law and is therefore entitled to immediate injunctive and other equitable relief, without bond and without the necessity of showing actual money damages.

    <span style="font-size:14px;">6. WARRANTY DISCLAIMER; LIMITATION OF LIABILITY.</span>

    <span style="font-size:14px;">6.1 ^^WARRANTY DISCLAIMER^^.</span> THE SOLUTION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. DZF MAKES NO WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE WITH RESPECT TO THE SOLUTION AND DOCUMENTATION INCLUDING THEIR CONDITION, CONFORMITY TO ANY REPRESENTATION OR DESCRIPTION, AND DZF SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.

    <span style="font-size:14px;">6.2 ^^LIMITATION OF LIABILITY^^.</span>
    EXCEPT FOR A BREACH OF SECTIONS 2.1, 2.2, AND 5, IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER FOR INDIRECT, INCIDENTAL, SPECIAL OR OTHER CONSEQUENTIAL DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS OR USE OR LOSS OF DATA, INCURRED BY YOU OR ANY THIRD PARTY, ARISING OUT OF OR RELATED TO THIS AGREEMENT WHETHER IN AN ACTION IN CONTRACT, TORT, OR OTHERWISE, EVEN IF THE OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL DZF'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED ONE HUNDRED DOLLARS (\$100), WHETHER AN ACTION IN CONTRACT, TORT, OR OTHERWISE. **THE FOREGOING LIMITATIONS WILL APPLY NOTWITHSTANDING THE FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY HEREIN.** THE PARTIES AGREE THAT THE FOREGOING LIMITATIONS REPRESENT A REASONABLE ALLOCATION OF RISK UNDER THIS AGREEMENT.

    <span style="font-size:14px;">7. GOVERNING LAW.</span>
    This Agreement and all matters arising out of or relating to this Agreement shall be governed, interpreted and constructed in accordance with the laws of the Cayman Islands. Should a controversy, dispute or claim arise out of or in relation to this Agreement ("Dispute"), the relevant party as appropriate, must give 30 days' notice of such Dispute to the other parties (the "Notice of Dispute"). Should the Dispute not be resolved at the expiration of 30 days after service of the Notice of Dispute, the relevant party may commence arbitration proceedings as provided herein. Should the Dispute remain at the expiration of 30 days after service of the Notice of Dispute, the Dispute shall be settled by arbitration administered by the Cayman International Mediation & Arbitration Centre (CI-MAC) in accordance with the CI-MAC Arbitration Rules (the "Arbitration Rules") in force as at the date of this Agreement, which Arbitration Rules are deemed to be incorporated by reference to this clause, and governed by the Arbitration Act (as amended). The arbitration shall be seated in George Town, Grand Cayman, Cayman Islands and governed by Cayman Islands law. The language of the arbitration shall be English. The arbitration shall be determined by a sole arbitrator to be appointed in accordance with the Arbitration Rules. Any award or decision made by the arbitrator shall be in writing and shall be final and binding on the parties without any right of appeal, and judgment upon any award thus obtained may be entered in or enforced by any court having jurisdiction thereof. No action at law or in equity based upon any claim arising out of or related to this Agreement shall be instituted in any court of any jurisdiction. If any litigation or arbitration is necessary to enforce the terms of this Agreement, the prevailing party will be entitled to have their attorney fees paid by the other party. Each party waives any right it may have to assert the doctrine of forum non conveniens, to assert that it is not subject to the jurisdiction of such arbitration or courts or to object to venue to the extent any proceeding is brought in accordance herewith. </span>

    <span style="font-size:14px;">8. GENERAL PROVISIONS.</span>
    This Agreement may not be transferred or assigned by User without the prior written consent of DZF. DZF may freely assign this Agreement. All notices required to be sent hereunder shall be sent by email (to DZF: legal@doublezero.xyz) and deemed received the day after sending (with transmission confirmed). If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions of this Agreement will remain in full force and effect. The waiver by either party of any default or breach of this Agreement shall not constitute a waiver of any other or subsequent default or breach. Neither party shall be liable for any delay or failure in performance due to acts of God, earthquakes, shortages of supplies, transportation difficulties, labor disputes, riots, war, fire, epidemics, and similar occurrences beyond its control, whether or not foreseeable. This Agreement together with any attachments constitutes the complete agreement between the parties and supersedes all prior or contemporaneous agreements or representations, written or oral, concerning the subject matter herein. This Agreement may not be modified or amended except in writing signed by a duly authorized representative of each party.

사용 중인 Solana 클러스터에 맞는 DoubleZero 네트워크를 선택하세요: `mainnet-beta` 또는 `testnet`. [설정](setup.md)에서 해당하는 패키지를 설치하고, 아래의 모든 명령에 동일한 네트워크를 사용하세요.

!!! Note inline end
    IBRL 모드는 기존 공용 IP 주소를 사용하기 때문에 밸리데이터 클라이언트를 재시작할 필요가 없습니다.

Solana 밸리데이터는 이 페이지의 단계를 사용하여 IBRL 모드로 DoubleZero에 연결합니다.

각 Solana 밸리데이터에는 고유한 **신원 키페어(identity keypair)**가 있으며, 여기서 **노드 ID**로 알려진 공개 키를 추출합니다. 이것이 Solana 네트워크에서 밸리데이터의 고유 식별자입니다.

DoubleZeroID와 노드 ID가 확인되면, 머신의 소유권을 증명하게 됩니다. 이는 밸리데이터의 신원 키로 서명된 DoubleZeroID를 포함하는 메시지를 생성하여 수행됩니다. 결과로 생성된 암호화 서명은 밸리데이터를 제어하고 있다는 검증 가능한 증거로 사용됩니다.

마지막으로 **DoubleZero에 연결 요청**을 제출합니다. 이 요청은 다음을 전달합니다: *"여기 제 신원이 있고, 여기 소유권 증명이 있으며, 이렇게 연결하고자 합니다."* DoubleZero는 이 정보를 검증하고 증명을 수락한 후, DoubleZero에서 밸리데이터의 네트워크 액세스를 프로비저닝합니다.

이 가이드를 통해 1개의 프라이머리 밸리데이터를 등록하고, 동시에 최대 3개의 백업/장애조치 머신을 등록할 수 있습니다.

## 사전 요구 사항 {#prerequisites}

- Solana CLI가 설치되어 있고 $PATH에 포함되어 있어야 합니다
- 밸리데이터의 경우: sol 사용자 권한으로 밸리데이터 신원 키페어 파일(예: validator-keypair.json)에 접근 가능해야 합니다
- 밸리데이터의 경우: 연결하려는 Solana 밸리데이터의 신원 키에 최소 1 SOL이 있는지 확인하세요
- 방화벽 규칙이 DoubleZero 및 Solana RPC에 필요한 아웃바운드 연결을 허용해야 합니다.
 GRE (ip proto 47) 및 BGP (169.254.0.0/16 on tcp/179) 포함

!!! info
    밸리데이터 ID는 Solana 가십을 통해 대상 IP를 결정하는 데 사용됩니다. 대상 IP와 DoubleZero ID는 머신과 대상 DoubleZero 디바이스 간 GRE 터널을 개설할 때 사용됩니다.

    참고: 동일한 IP에 가짜 ID와 프라이머리 ID가 있는 경우, 머신 등록에는 프라이머리 ID만 사용됩니다. 가짜 ID는 가십에 나타나지 않으므로 대상 머신의 IP를 확인하는 데 사용할 수 없기 때문입니다.

## 1. 클라이언트 네트워크 확인 {#1-confirm-the-client-network}

계속 진행하기 전에 [설정](setup.md) 지침을 따라주세요. **mainnet-beta** 또는 **testnet**용 패키지를 설치하세요. 각각 다른 패키지 저장소를 사용합니다.

설정의 마지막 단계는 네트워크에서 연결을 해제하는 것이었습니다. 이는 머신에서 DoubleZero로의 터널이 하나만 열려 있고, 해당 터널이 올바른 네트워크에 있는지 확인하기 위함입니다.

클라이언트가 선택한 네트워크에 있는지 확인하세요:

```bash
doublezero status
```

`Network` 열이 Solana 클러스터와 일치하는 `mainnet-beta` 또는 `testnet`이어야 합니다. 잘못된 경우 또는 잘못된 패키지를 설치한 경우, [문제 해결](troubleshooting.md#issue-wrong-doublezero-environment)의 복사-붙여넣기 전환 방법을 사용하세요.

약 30초 후 사용 가능한 DoubleZero 디바이스를 확인할 수 있습니다:

```bash
doublezero latency
```

예제 출력 (mainnet-beta; testnet도 동일하지만 디바이스 수가 더 적음):

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

## 2. 포트 44880 개방 {#2-open-port-44880}

일부 [라우팅 기능](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md)을 활용하려면 사용자가 포트 44880을 개방해야 합니다.

포트 44880을 개방하려면 다음과 같이 IP 테이블을 업데이트할 수 있습니다:

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```


이 규칙을 DoubleZero 인터페이스에만 제한하는 `-i doublezero0`, `-o doublezero0` 플래그에 주목하세요

또는 UFW를 사용할 수 있습니다:

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```


이 규칙을 DoubleZero 인터페이스에만 제한하는 `in on doublezero0`, `out on doublezero0` 플래그에 주목하세요

## 3. 밸리데이터 소유권 증명 {#3-attest-validator-ownership}

!!! note "네트워크 플래그"
    아래 Passport 명령은 `-u mainnet-beta`를 사용합니다. 테스트넷에서는 `-u testnet` (또는 `-ut`)을 대신 사용하세요.

DoubleZero 환경이 설정되었으므로, 이제 밸리데이터 소유권을 증명할 차례입니다.

프라이머리 밸리데이터의 [설정](setup.md)에서 생성한 DoubleZero ID는 모든 백업 머신에서 사용해야 합니다.

프라이머리 머신의 ID는 `doublezero address`로 확인할 수 있습니다. 동일한 ID가 클러스터의 모든 머신에서 `~/.config/doublezero/id.json`에 있어야 합니다.

이를 수행하기 위해 먼저 명령을 실행하는 머신이 **프라이머리 밸리데이터**인지 확인합니다:

```
doublezero-solana passport find-validator -u mainnet-beta
```

이 명령은 밸리데이터가 가십에 등록되어 있고 리더 스케줄에 나타나는지 확인합니다.

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
    동일한 워크플로우가 한 대 또는 여러 대의 머신에 사용됩니다.
    한 대의 머신만 등록하려면 이 페이지의 모든 명령에서 "--backup-validator-ids" 또는 "backup_ids=" 인수를 제외하세요.

이제 **프라이머리 밸리데이터**를 실행할 모든 백업 머신에서 다음을 실행하세요:
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

이제 **프라이머리 밸리데이터**의 투표 계정과 신원을 사용할 계획인 **모든 백업 머신**에서 이 명령을 실행합니다.


### 연결 준비 {#prepare-the-connection}

**프라이머리 밸리데이터** 머신에서 다음 명령을 실행하세요. 이것은 활성 스테이크가 있고, 리더 스케줄에 있으며, 명령을 실행하는 머신의 solana 가십에 프라이머리 밸리데이터 ID가 있는 머신입니다:

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


예제 출력:

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
이 명령의 마지막에 있는 출력에 주목하세요. 다음 단계의 구조입니다.


## 4. 서명 생성 {#4-generate-signature}

이전 단계의 마지막에서 `solana sign-offchain-message`에 대한 사전 형식화된 출력을 받았습니다.

위 출력에서 **프라이머리 밸리데이터** 머신에서 이 명령을 실행합니다.

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

`request-validator-access` 명령을 사용하여 연결 요청을 위한 Solana 계정을 생성합니다. DoubleZero Sentinel 에이전트가 새 계정을 감지하고, 신원과 서명을 검증한 후, DoubleZero에서 서버가 연결을 설정할 수 있도록 액세스 패스를 생성합니다.


노드 ID, DoubleZeroID, 서명을 사용합니다.

!!! note inline end
      이 예제에서는 밸리데이터 신원을 찾기 위해 `-k /home/user/.config/solana/id.json`을 사용합니다. 로컬 배포에 적절한 경로를 사용하세요.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**출력:**

이 출력을 사용하여 Solana 탐색기에서 트랜잭션을 확인할 수 있습니다. 클러스터에 맞게 탐색기를 mainnet-beta 또는 testnet으로 설정하세요. 이 확인은 선택 사항입니다.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

성공하면 DoubleZero가 프라이머리와 백업을 등록합니다. 이제 액세스 패스에 등록된 IP 간에 장애조치를 수행할 수 있습니다. DoubleZero는 이 방식으로 등록된 백업 노드로 전환할 때 자동으로 연결을 유지합니다.


## 6. IBRL 모드로 연결 {#6-connect-in-ibrl-mode}

서버에서 DoubleZero에 연결할 사용자로 `connect` 명령을 실행하여 DoubleZero에 대한 연결을 설정합니다.

```
doublezero connect ibrl
```

다음과 같은 프로비저닝 진행 상태를 나타내는 출력이 표시됩니다:

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.184.101.183 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
🔍  Provisioning User for IP: 137.184.101.183
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
✅  User Provisioned
```
GRE 터널 설정이 완료될 때까지 1분 정도 기다리세요. GRE 터널 설정이 완료되기 전에는 상태 출력이 "down" 또는 "Unknown"을 반환할 수 있습니다.

연결을 확인하세요:

```bash
doublezero status
```

**출력:**
!!! note inline end
    이 출력을 살펴보세요. `Tunnel src`와 `DoubleZero IP`가 머신의 공용 IPv4 주소와 일치하는 것을 확인하세요.
    <!--`Tunnel dst`는 연결된 DZ 디바이스의 주소입니다.-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```

(테스트넷에서 연결한 경우 `Network`에 `testnet`이 표시됩니다.)

상태가 `up`이면 성공적으로 연결된 것입니다.

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


### 다음 단계: 멀티캐스트를 통한 슈레드 퍼블리싱 {#up-next-publishing-shreds-via-multicast}

이 설정을 완료했고 멀티캐스트를 통해 슈레드를 퍼블리싱할 계획이라면, [다음 페이지](Validator%20Multicast%20Connection.md)로 진행하세요.