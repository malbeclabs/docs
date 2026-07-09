# 사이트 해제 가이드 (기여자용)

이 가이드는 DoubleZero Device(DZD) 해제 또는 사이트 탈퇴 방법을 설명합니다. 연결된 사용자에게 지장을 주지 않으면서 네트워크에서 장치와 링크를 제거한 후 온체인에서 삭제하는 방법을 다룹니다.

프로세스는 세 단계로 진행됩니다. 해제일 31일 전에 장치를 제한하고, 고지 기간 동안 연결된 사용자에게 이전을 알린 후, 해제일에 링크, 인터페이스, 장치를 드레인 및 삭제합니다.

> ⚠️ **먼저 DoubleZero와 조율하세요:**
> 장치나 사이트를 해제하기 전에 반드시 DoubleZero 팀과 사전 조율하고, 해제 날짜와 시간을 함께 정하세요. 해당 시간대에 맞춰 저희 측에서도 몇 가지 단계를 진행해야 하므로 사전 일정 조율이 필요합니다. 장치를 제한하거나 링크를 드레인하기 전에 날짜와 계획을 합의하세요.

> ⚠️ **DZX 스위치 및 링크:**
> 해제하려는 장치가 DZX 스위치이거나 DZX 링크가 있는 경우, 영향을 받는 기여자를 최대한 빨리 파악하고 사전에 알려주세요. 해당 기여자들이 해제일 전에 링크를 이전하거나 재구성해야 할 수 있습니다. 또한 해제일에 대한 유지보수 이벤트를 [OPS 포털](contribute-ops-management.md)에 생성하세요.

---

## 개요

| 시기 | 조치 | 담당 |
|------|------|------|
| 31일 전 | 새로운 사용자가 연결할 수 없도록 장치 제한 (`--max-users 0`) | 기여자 |
| 14일 전 | 연결된 사용자에게 다른 장치로 이전하도록 알림 | DoubleZero 팀 |
| 고지 기간 | 사용자가 스스로 다른 DZD에 재연결 | 사용자 |
| 해제일 | 링크, 인터페이스, 장치를 드레인 및 삭제 | 기여자 |

원칙:

- **신규 사용자는 조기에 차단하고, 기존 사용자는 점진적으로 이전합니다.** 장치를 일찍 제한하면 해당 시점부터 신규 사용자만 차단됩니다. 기존 사용자는 계속 정상적으로 이용하며 자신의 일정에 맞춰 이전합니다.
- **고지 기간 동안에는 모든 것을 활성 상태로 유지합니다.** 이전 중인 사용자가 정상적인 서비스를 받을 수 있도록 해제일까지 링크나 장치를 드레인하지 마세요.
- **해체 순서는 컨트랙트에 의해 강제됩니다.** 활성 상태인 링크나 장치는 삭제할 수 없으므로 아래 단계에서 먼저 드레인한 후 마지막에 삭제합니다.

> ⚠️ **긴급한 경우:**
> 탈퇴까지 31일이 남지 않은 경우 즉시 시작하세요. 지금 바로 장치를 제한하고 가용 시간에 맞춰 기간을 단축하세요. 단계 순서는 변경되지 않습니다.

---

## 1단계 — 장치 제한 (31일 전)

새로운 사용자가 연결할 수 없도록 장치를 제한합니다:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

기존 사용자는 영향을 받지 않으며 계속 정상적으로 이용합니다. 사이트에서 해제할 모든 장치에 대해 반복하세요. 링크와 장치는 완전히 활성 상태를 유지하므로 연결된 사용자는 정상적인 서비스를 받습니다.

---

## 2단계 — 고지 기간 (14일 전)

DoubleZero 팀이 연결된 사용자에게 해제일 전에 다른 DZD로 재연결하도록 알립니다. 어떤 사용자에게 누가 연락할지 팀과 조율하세요.

이 기간 동안에는 드레인이 이루어지지 않으므로 사용자는 정상적인 서비스를 받습니다. 사용자는 자신의 속도에 맞춰 재연결합니다. 다음 명령으로 사용자 수를 모니터링하세요:

```bash
doublezero device list
```

---

## 3단계 — 해제일

시작하기 전에 제거해야 할 항목을 정확히 파악하세요: 장치, 연결된 링크, 정리할 인터페이스. 다음 명령으로 모두 확인할 수 있습니다:

```bash
doublezero device list | grep <CONTRIBUTOR_CODE>    # 장치 찾기: 코드 및 공개키
doublezero link list | grep <DEVICE_CODE>           # 장치에 연결된 링크 찾기
doublezero device interface list <DEVICE_CODE>      # 제거할 장치의 인터페이스 목록 조회
```

아래 단계를 순서대로 실행하세요. 각 단계가 다음 단계를 가능하게 합니다.

> ⚠️ **최종 장치 삭제 전:**
> 마지막 단계를 실행하기 전에 DoubleZero Foundation에 알리세요. Foundation이 제때 이전하지 못한 사용자를 제거하며, 이를 하지 않으면 삭제가 차단됩니다. 또한 Foundation 측에서 필요한 단계를 완료합니다.

### 1. 링크 드레인

소프트 드레인을 먼저 수행한 후 하드 드레인합니다. 각 상태가 무엇을 하는지에 대해서는 [링크 드레인](contribute-operations.md#link-draining)을 참조하세요.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
# 트래픽이 이동된 후:
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

제거할 장치의 모든 링크에 대해 반복하세요.

### 2. 링크 삭제

```bash
doublezero link delete --pubkey <LINK_PUBKEY>
```

이렇게 하면 링크가 사용하던 인터페이스가 해제됩니다.

### 3. 인터페이스 삭제

```bash
doublezero device interface delete <DEVICE_CODE> <INTERFACE_NAME>
```

장치의 각 인터페이스에 대해 반복하세요.

### 4. 장치 드레인

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --status drained
```

드레인은 라우팅에서 장치를 제거하고 남아 있는 사용자 세션을 종료합니다. 또한 장치를 활성 상태에서 이동시켜 삭제할 수 있게 합니다.

### 5. 장치 삭제

```bash
doublezero device delete --pubkey <DEVICE_PUBKEY>
```

장치는 더 이상 활성 상태가 아니고, 참조하는 링크가 없으며, 남아 있는 인터페이스가 없어야만 삭제할 수 있습니다. 이전 단계들이 이를 처리합니다.

---

## 취소 또는 연기

제한과 드레인은 삭제를 시작하기 전까지 되돌릴 수 있습니다:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users <ORIGINAL_VALUE>   # 용량 복원
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained             # 하드 드레인에서 변경
doublezero link update --pubkey <LINK_PUBKEY> --status activated                # 활성 상태로 복원
doublezero device update --pubkey <DEVICE_PUBKEY> --status activated            # 장치 드레인 해제
```

링크, 인터페이스, 장치의 삭제는 영구적입니다. 온체인 계정이 닫힙니다. 탈퇴가 확정된 후에만 삭제를 시작하세요.