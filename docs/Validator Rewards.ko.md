# 밸리데이터 보상
!!! warning "DoubleZero에 연결함으로써, [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol)에 동의합니다"

## 작동 방식

리더 shred를 DoubleZero Edge에 게시하는 밸리데이터는 매 에포크마다 보상을 받습니다. 보상이 지급되기 전에, 각 밸리데이터는 Solana에서 `ValidatorPublisherRewards` 계정을 구성하여 보상이 **어디로** 전송될지 등록해야 합니다. 해당 계정에는 다음 정보가 저장됩니다:

- **보상 민트** — 보상이 지급되는 토큰으로 2z입니다 (수동으로 변경하지 않는 한)
- **보상 소유자** — 보상을 수령하는 Associated Token Account (ATA)를 소유하는 지갑

`configure` 명령을 실행하면 이러한 필드가 설정되며, 이후 에포크 단위로 자동 지급이 이루어집니다. 나중에 `configure`를 다시 실행하여 두 필드 중 하나를 변경할 수 있습니다.

!!! info "아직 [설정](setup.md), [밸리데이터 Mainnet-Beta 연결](DZ%20Mainnet-beta%20Connection.md), [밸리데이터 멀티캐스트 연결](Validator%20Multicast%20Connection.md)을 완료하지 않았다면 먼저 완료하세요."

## 사전 요구 사항

- 리더 shred를 게시하는 밸리데이터 - [밸리데이터 멀티캐스트 연결](Validator%20Multicast%20Connection.md)을 참조하세요.
- 최신 `doublezero-solana` CLI: `sudo apt update && sudo apt install doublezero-solana`, 최소 `0.5.6` 버전 이상.
- **밸리데이터 ID 키페어**에 대한 접근 권한 — 동일한 머신에 있거나 오프라인으로 보관하면서 메시지 서명이 가능해야 합니다.
- 보상 ATA를 소유할 대상 지갑 공개키.


---

## 1. 보상 수령을 위한 구성

밸리데이터 ID 키페어를 `-k`로 지정하여 `configure`를 실행합니다.

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    -k <path-to-validator-identity-keypair.json>
```
출력 예시
```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         direct
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```
`Configured validator publisher rewards: `는 블록 탐색기에서 확인할 수 있는 트랜잭션을 출력합니다.

| 플래그 | 설명 |
|---|---|
| `--node-id` | 밸리데이터 노드 ID 공개키. |
| `--rewards-token-owner` | 수령 ATA를 소유할 지갑. |
| `--rewards-token-mint` | 보상이 수령될 지갑 토큰으로 `2z`입니다. 지원되는 토큰에는 `usdc`와 `wsol`도 포함됩니다. |
| `-k` | 밸리데이터 ID 키페어 경로. 직접 경로에서는 키페어의 공개키가 `--node-id`와 일치해야 하며, 그렇지 않으면 명령이 오류를 반환하고 오프체인 경로로 전환하라고 안내합니다. |

ATA가 아직 존재하지 않는 경우 동일한 트랜잭션에서 자동으로 초기화됩니다.


!!! note "오류가 반환되는 경우"
    `-k` 공개키가 `--node-id`와 일치하지 않는 경우

    전달한 수수료 지불자 키페어가 밸리데이터 ID가 아닙니다. 밸리데이터 ID 키페어를 `-k`로 전달하거나, [오프체인 경로](#apendix-offchain-path-alternative)로 전환하세요.
---

## 2. 구성 확인

```bash
doublezero-solana shreds publisher-rewards show --node-id <NODE_ID>
```

이 명령은 `Node ID`, `Rewards owner`, `Rewards mint`, 확인된 ATA 주소 및 ATA 상태를 출력합니다. **Resolved ATA**는 보상 소유자 + 보상 민트에서 파생된 결정론적 주소이며, 매 에포크마다 보상이 입금되는 곳입니다.

---

## 부록: 오프체인 경로 대안

세 가지 하위 단계: 준비, 서명, 구성.

### 1. 오프체인 메시지 준비

이 명령은 어디서든 실행할 수 있습니다 — 읽기 전용이며 밸리데이터 ID 키페어가 필요하지 않습니다. 서명할 hex 블롭과 서명이 만료되는 절대 슬롯을 출력합니다.

```bash
doublezero-solana shreds publisher-rewards prepare-offchain-message \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --valid-for 1h
```
출력 예시

```bash
Hex message:    123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3
Deadline slot:  422954444

Sign with:
  solana sign-offchain-message 123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3 --keypair <validator-identity>

Then submit:
  doublezero-solana shreds publisher-rewards configure \
    --node-id ValidatorIdentity111111111111111111111111111 --rewards-token-mint J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd --rewards-token-owner Wallet567Identity111111111111111111111111111 \
    --deadline-slot 422954444 --signature <BASE58>
```


| 플래그 | 설명 |
|---|---|
| `--node-id` | 밸리데이터 노드 ID 공개키. |
| `--rewards-token-owner` | 수령 ATA를 소유할 지갑. |
| `--rewards-token-mint` | 보상이 수령될 지갑 토큰으로 `2z`입니다. 지원되는 토큰에는 `usdc`와 `wsol`도 포함됩니다. |
| `--valid-for` | 현재 슬롯 기준 서명 유효 기간. `<n>s`, `<n>m`, 또는 `<n>h`를 사용할 수 있습니다. 기본값: `1h`. |
| `--deadline-slot` | `--valid-for`의 대안: 인증이 만료되는 절대 슬롯. `--valid-for`와 상호 배타적입니다. |
| `--json` | 사람이 읽을 수 있는 요약 대신 JSON (`{ hex, deadline_slot }`)을 출력합니다. |

이 명령은 hex 인코딩된 인증 메시지, 확인된 마감 슬롯, 그리고 다음 두 단계에 바로 사용할 수 있는 셸 스니펫을 출력합니다.

### 2. 메시지 서명

밸리데이터 ID 키페어가 있는 머신에서:

```bash
solana sign-offchain-message <123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3> \
--keypair <path-to-validator-identity-keypair.json>
```

이 명령은 base58 서명을 출력합니다.

출력 예시

```bash
SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp
```

### 3. `configure` 제출

수수료 지불자 지갑이 있는 머신에서:

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --signature <SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp> \
    --deadline-slot <DEADLINE_SLOT>
```

`--signature`와 `--deadline-slot`은 함께 전달되어야 합니다. 값은 2b.i 및 2b.ii 단계에서 생성된 값과 일치해야 합니다.

ATA가 아직 존재하지 않는 경우 동일한 트랜잭션에서 자동으로 초기화됩니다.

출력 예시

```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         offchain
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```

---

!!! note "참고: 서명이 만료된 경우"
    각 오프체인 서명에는 마감 슬롯이 있습니다. `prepare-offchain-message`와 `configure` 사이에 너무 많은 시간이 경과하면, `prepare-offchain-message`를 다시 실행하고 다시 서명한 후 다시 제출하세요. 기본 유효 기간은 1시간이며, 오프라인 서명 흐름에 더 많은 시간이 필요한 경우 `--valid-for 4h` 등으로 연장할 수 있습니다.