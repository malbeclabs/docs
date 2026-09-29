---
description: DoubleZero 기여자를 위한 지속적인 운영 작업 — 에이전트 업그레이드, 장치 및 인터페이스 업데이트, 링크 관리, 인시던트 로깅.
---

# 기여자를 위한 운영 가이드


이 가이드는 에이전트 업그레이드, 장치/인터페이스 업데이트, 링크 관리를 포함하여 DoubleZero Devices(DZD)를 유지 관리하기 위한 지속적인 운영 작업을 다룹니다.

## 인시던트 및 유지보수 로깅

계획된 유지보수 또는 계획되지 않은 링크/장치 문제는 [OPS Management 포털](contribute-ops-management.md)에 기록해야 합니다. 이를 통해 모든 기여자가 네트워크 전반에서 무슨 일이 발생하고 있는지 확인할 수 있으며 중복 조사를 방지할 수 있습니다.

- **계획된 작업** (예: 광모듈 교체, 예정된 캐리어 유지보수): 작업 시작 전에 유지보수 기록을 생성합니다.
- **계획되지 않은 문제** (예: 링크 다운, 인터페이스 오류, 패킷 손실): 조사를 시작하는 즉시 인시던트를 개설합니다.

온보딩 단계 및 티켓 생성 방법은 [OPS Management 가이드](contribute-ops-management.md)를 참조하세요.

---

**사전 요구 사항**: 이 가이드를 사용하기 전에 다음을 확인하세요:

- [장치 프로비저닝 가이드](contribute-provisioning.md) 완료
- Config 및 Telemetry 에이전트가 모두 실행 중인 상태에서 DZD가 완전히 작동 중

---

## 장치 업데이트

초기 프로비저닝 후 장치 설정을 수정하려면 `doublezero device update`를 사용하세요.

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**주요 업데이트 옵션:**

| 옵션 | 설명 |
|--------|-------------|
| `--device-type <TYPE>` | 작동 모드 변경: `hybrid`, `transit`, `edge` ([장치 유형](contribute-provisioning.md#understanding-device-types) 참조) |
| `--location <LOCATION>` | 장치를 다른 위치로 이동 |
| `--metrics-publisher <PUBKEY>` | 메트릭 퍼블리셔 키 변경 |

---

## 인터페이스 업데이트

기존 인터페이스를 수정하려면 `doublezero device interface update`를 사용하세요. 이 명령은 `interface create`와 동일한 옵션을 지원합니다.

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

CYOA/DIA 설정을 포함한 전체 인터페이스 옵션 목록은 [인터페이스 생성](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)을 참조하세요.

**예시 - 기존 인터페이스에 CYOA 설정 추가:**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### 인터페이스 목록 조회

```bash
doublezero device interface list              # 모든 장치의 전체 인터페이스
doublezero device interface list <DEVICE>     # 특정 장치의 인터페이스
```

---

## Config Agent 업그레이드

Config Agent의 새 버전이 출시되면 다음 단계에 따라 업그레이드하세요.

### 1. 최신 버전 다운로드

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget AGENT_DOWNLOAD_URL
# exit
$ exit
```

### 2. 에이전트 종료

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 3. 이전 버전 제거

먼저 이전 버전의 파일명을 확인합니다:
```
switch# show extensions
```

다음 명령을 실행하여 이전 버전을 제거합니다. `<OLD_VERSION>`을 위 출력에서 확인한 이전 버전으로 교체하세요:
```
switch# delete flash:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. 새 버전 설치

```
switch# copy flash:AGENT_FILENAME extension:
switch# extension AGENT_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. 에이전트 재시작

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# no shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 6. 업그레이드 확인

Status가 "A, I, B"여야 합니다.
```
switch# show extensions
```

### 7. Config Agent 로그 출력 확인

```
show agent doublezero-agent log
```

---

## Telemetry Agent 업그레이드

Telemetry Agent의 새 버전이 출시되면 다음 단계에 따라 업그레이드하세요.

### 1. 최신 버전 다운로드

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget TELEMETRY_DOWNLOAD_URL
# exit
$ exit
```

### 2. 에이전트 종료

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 3. 이전 버전 제거

먼저 이전 버전의 파일명을 확인합니다:
```
switch# show extensions
```

다음 명령을 실행하여 이전 버전을 제거합니다. `<OLD_VERSION>`을 위 출력에서 확인한 이전 버전으로 교체하세요:
```
switch# delete flash:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. 새 버전 설치

```
switch# copy flash:TELEMETRY_FILENAME extension:
switch# extension TELEMETRY_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. 에이전트 재시작

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# no shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 6. 업그레이드 확인

Status가 "A, I, B"여야 합니다.
```
switch# show extensions
```

### 7. Telemetry Agent 로그 출력 확인

```
show agent doublezero-telemetry log
```

---

## 모니터링

> ⚠️ **중요:**
>
>  1. 아래 구성 예시에서 에이전트가 관리 VRF를 사용하고 있는지 여부를 확인하세요.
>  2. 구성 에이전트와 텔레메트리 에이전트는 기본적으로 메트릭 엔드포인트에 동일한 리스닝 포트(:8080)를 사용합니다. 두 에이전트 모두에서 메트릭을 활성화하는 경우, `-metrics-addr` 플래그를 사용하여 각 에이전트에 고유한 리스닝 포트를 설정하세요.

### Config Agent 메트릭

DoubleZero 장치의 구성 에이전트는 `doublezero-agent` 데몬 구성에서 `-metrics-enable` 플래그를 설정하여 prometheus 호환 메트릭을 노출할 수 있습니다. 기본 리스닝 포트는 tcp/8080이지만 `-metrics-addr`를 통해 환경에 맞게 변경할 수 있습니다:
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

go 런타임 메트릭과 함께 다음과 같은 DoubleZero 전용 메트릭이 노출됩니다:
```
$ curl -s 10.0.0.11:2112/metrics | grep doublezero

# HELP doublezero_agent_apply_config_errors_total Number of errors encountered while applying config to the device
# TYPE doublezero_agent_apply_config_errors_total counter
doublezero_agent_apply_config_errors_total 0

# HELP doublezero_agent_bgp_neighbors_errors_total Number of errors encountered while retrieving BGP neighbors from the device
# TYPE doublezero_agent_bgp_neighbors_errors_total counter
doublezero_agent_bgp_neighbors_errors_total 0

# HELP doublezero_agent_build_info Build information of the agent
# TYPE doublezero_agent_build_info gauge
doublezero_agent_build_info{commit="4378018f",date="2025-09-23T14:07:48Z",version="0.6.5~git20250923140746.4378018f"} 1

# HELP doublezero_agent_get_config_errors_total Number of errors encountered while getting config from the controller
# TYPE doublezero_agent_get_config_errors_total counter
doublezero_agent_get_config_errors_total 0
```

#### 주요 오류 지표

- `up` - 스크레이프 인스턴스가 정상이고 접근 가능한 경우 prometheus가 자동으로 생성하는 시계열 메트릭입니다. 그렇지 않은 경우 에이전트에 접근할 수 없거나 에이전트가 실행 중이 아닙니다.
- `doublezero_agent_apply_config_errors_total` - 에이전트가 적용하려는 구성이 실패했습니다. 이 상황에서는 사용자가 장치에 온보딩할 수 없으며, 이 문제가 해결될 때까지 온체인 구성 변경 사항이 적용되지 않습니다.
- `doublezero_agent_get_config_errors_total` - 로컬 구성 에이전트가 DoubleZero 컨트롤러와 통신할 수 없음을 나타냅니다. 대부분의 경우 장치의 관리 연결 문제로 인해 발생할 수 있습니다. 위의 메트릭과 마찬가지로, 이 문제가 해결될 때까지 사용자가 장치에 온보딩할 수 없으며 온체인 구성 변경 사항이 적용되지 않습니다.

### Telemetry Agent 메트릭

DoubleZero 장치의 텔레메트리 에이전트는 `doublezero-telemetry` 데몬 구성에서 `-metrics-enable` 플래그를 설정하여 prometheus 호환 메트릭을 노출할 수 있습니다. 기본 리스닝 포트는 tcp/8080이지만 `-metrics-addr`를 통해 환경에 맞게 변경할 수 있습니다:
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

go 런타임 메트릭과 함께 다음과 같은 DoubleZero 전용 메트릭이 노출됩니다:
```
$ curl -s 10.0.0.11:2113/metrics | grep doublezero

# HELP doublezero_device_telemetry_agent_build_info Build information of the device telemetry agent
# TYPE doublezero_device_telemetry_agent_build_info gauge
doublezero_device_telemetry_agent_build_info{commit="4378018f",date="2025-09-23T14:07:45Z",version="0.6.5~git20250923140743.4378018f"} 1

# HELP doublezero_device_telemetry_agent_errors_total Number of errors encountered
# TYPE doublezero_device_telemetry_agent_errors_total counter
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_program_load"} 7
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_write_samples"} 8
doublezero_device_telemetry_agent_errors_total{error_type="collector_submit_samples_on_close"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_getting_local_interfaces"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_finding_local_tunnel"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_link_tunnel_net_invalid"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_initialize_account"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_retries_exhausted"} 0

# HELP doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels Number of local tunnel interfaces not found during peer discovery
# TYPE doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels gauge
doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels{local_device_pk="8PQkip3CxWhQTdP7doCyhT2kwjSL2csRTdnRg2zbDPs1"} 0
```

#### 주요 오류 지표

- `up` - 스크레이프 인스턴스가 정상이고 접근 가능한 경우 prometheus가 자동으로 생성하는 시계열 메트릭입니다. 그렇지 않은 경우 에이전트에 접근할 수 없거나 에이전트가 실행 중이 아닙니다.
- `doublezero_device_telemetry_agent_errors_total`에서 `error_type`이 `submitter_failed_to_write_samples`인 경우 - 텔레메트리 에이전트가 온체인에 샘플을 기록할 수 없다는 신호이며, 장치의 관리 연결 문제로 인해 발생할 수 있습니다.

---

## 링크 관리

### 링크 드레이닝

링크 드레이닝을 통해 기여자는 유지보수 또는 문제 해결을 위해 활성 서비스에서 링크를 안전하게 제거할 수 있습니다. 두 가지 드레인 상태가 있습니다:

| 상태 | IS-IS 동작 | 설명 |
|--------|----------------|-------------|
| `soft-drained` | 메트릭이 1,000,000으로 설정 | 링크의 우선순위가 낮아집니다. 대체 경로가 있으면 트래픽이 대체 경로를 사용하지만, 이 링크가 유일한 옵션인 경우에는 여전히 사용됩니다. |
| `hard-drained` | passive로 설정 | 링크가 라우팅에서 완전히 제거됩니다. 이 링크를 통과하는 트래픽이 없습니다. |

### 상태 전환

다음과 같은 상태 전환이 허용됩니다:

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (반드시 soft-drained를 거쳐야 함)
```

> ⚠️ **참고:**
> `hard-drained`에서 `activated`로 직접 전환할 수 없습니다. 반드시 먼저 `soft-drained`로 전환한 다음 `activated`로 전환해야 합니다.

### 링크 소프트 드레인

소프트 드레이닝은 IS-IS 메트릭을 1,000,000으로 설정하여 링크의 우선순위를 낮춥니다. 트래픽은 대체 경로를 선호하지만 필요한 경우 여전히 이 링크를 사용할 수 있습니다.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### 링크 하드 드레인

하드 드레이닝은 IS-IS를 passive 모드로 설정하여 링크를 라우팅에서 완전히 제거합니다. 이 링크를 통과하는 트래픽이 없습니다.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### 링크를 활성 상태로 복원

드레인된 링크를 정상 운영 상태로 복원하려면:

```bash
# soft-drained에서 복원
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# hard-drained에서 복원 (반드시 soft-drained를 먼저 거쳐야 함)
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### 지연 오버라이드

지연 오버라이드 기능을 통해 기여자는 실제 측정된 지연 값을 수정하지 않고 링크의 유효 지연을 일시적으로 변경할 수 있습니다. 이는 링크를 기본 경로에서 보조 경로로 일시적으로 강등하는 데 유용합니다.

### 지연 오버라이드 설정

링크의 지연을 오버라이드하려면 (라우팅에서 덜 선호되게 만들기):

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

유효한 값은 `0.01`에서 `1000` 밀리초입니다.

### 지연 오버라이드 해제

오버라이드를 제거하고 실제 측정된 지연으로 돌아가려면:

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **참고:**
> 링크가 soft-drained 상태일 때, 우선순위 강등을 보장하기 위해 `delay_ms`와 `delay_override_ms` 모두 1000ms(1초)로 오버라이드됩니다.