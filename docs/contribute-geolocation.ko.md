---
description: DoubleZero 지오로케이션 서비스의 지연 시간 측정을 수행하는 geoProbe 에이전트를 배포하고 구성합니다.
---

# Geoprobe 배포

이 가이드는 **geoProbe 에이전트** — DoubleZero [지오로케이션](geolocation.md) 서비스를 위한 지연 시간 측정을 수행하는 서버 — 의 배포 및 구성을 다룹니다.

geoProbe는 3단계 측정 체인에서 [DZD](glossary.md#dzd-doublezero-device)와 대상 디바이스 사이에 위치합니다. 상위 DZD로부터 서명된 LocationOffset을 수신하고, [TWAMP](glossary.md#twamp-two-way-active-measurement-protocol), 서명된 TWAMP 또는 ICMP 에코를 통해 등록된 대상에 대한 [RTT](glossary.md#rtt-round-trip-time)를 측정합니다. 각 geoProbe는 온체인에 등록되며 하나 이상의 상위 DZD에 연결됩니다.

지오로케이션 아키텍처 및 측정 흐름에 대한 개요는 [지오로케이션 사용자 가이드](geolocation.md)를 참조하세요.

---

## 사전 요구 사항 {#prerequisites}

!!! warning "DZD 텔레메트리 에이전트 버전"
    상위 DZD는 지오로케이션 서비스를 지원하기 위해 **디바이스 텔레메트리 에이전트 버전 0.17.0 이상**을 실행해야 합니다. 이전 버전에는 지오로케이션에 필요한 프로브 검색, TWAMP 핑, 오프셋 게시 확장 기능이 포함되어 있지 않습니다. 프로브를 배포하기 전에 에이전트 버전을 확인하세요 — 이전 버전의 DZD와 페어링된 프로브는 오프셋을 수신하지 못합니다.

geoProbe를 배포하기 전에 다음 사항을 확인하세요:

- **베어 메탈 Linux 서버** — VPS도 사용 가능하지만 덜 이상적입니다.
- **DZD와의 네트워크 근접성** — 프로브와 상위 DZD 간 RTT가 1ms 미만이어야 합니다. 이상적으로는 0.1ms 이하입니다.
- 에이전트 프로세스에 대한 **`CAP_NET_RAW` 기능** (raw 소켓을 사용한 ICMP 에코 프로빙에 필요)
- 프로브의 서명 ID를 위한 **Ed25519 키 쌍**
- **Foundation 인가** — 현재 프로브 등록은 Foundation 승인이 필요합니다; 진행하기 전에 [DZF](glossary.md#dzf-doublezero-foundation)와 조율하세요
- 텔레메트리 에이전트 v0.17.0+를 실행하는 **상위 DZD**

---

## 설치 {#installation}

에이전트 데몬과 doublezero CLI를 모두 설치합니다:

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt install doublezero-geoprobe-agent doublezero
```

| 패키지 | 용도 |
|---------|---------|
| `doublezero-geoprobe-agent` | 프로브 서버에서 실행되는 에이전트 데몬으로, 지연 시간 측정을 수행하고 서명된 오프셋을 생성합니다 |
| `doublezero` | 프로브 등록 및 관리 명령에 사용되는 CLI 도구 |

---

## 온체인 등록 {#onchain-registration}

프로브 등록에는 Foundation 인가가 필요합니다. 진행하기 전에 DZF와 조율하세요.

### 1단계: 프로브 등록 {#step-1-register-the-probe}

```bash
doublezero geolocation probe create \
  --code <probe-code> \
  --exchange <exchange-pubkey> \
  --public-ip <probe-ip> \
  --signing-pubkey <signing-key-pubkey>
```

| 매개변수 | 설명 |
|-----------|-------------|
| `--code` | 프로브의 고유 식별자 (예: `ams-tn-gp1`) — 최대 32자 |
| `--exchange` | 이 프로브가 연결된 Serviceability Exchange 계정의 공개 키 |
| `--public-ip` | 프로브가 수신 대기하는 공개 IPv4 주소 |
| `--signing-pubkey` | 오프셋 및 텔레메트리 서명에 사용되는 공개 키 |

### 2단계: 상위 DZD 연결 {#step-2-link-parent-dzds}

```bash
doublezero geolocation probe add-parent \
  --probe <probe-code> \
  --device <dzd-code>
```

각 상위 DZD는 Serviceability Program에서 활성화된 디바이스여야 합니다. DZD는 60초마다 하위 프로브를 자동으로 검색합니다 — 연결되면 DZD는 TWAMP 측정 및 오프셋 생성을 자동으로 시작합니다.

---

## 에이전트 실행 {#running-the-agent}

```bash
doublezero-geoprobe-agent \
  --env mainnet-beta \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey>
```

### 필수 플래그 {#required-flags}

| 플래그 | 설명 |
|------|-------------|
| `--keypair` | 오프셋 서명을 위한 Ed25519 키 쌍 파일 경로 |
| `--geoprobe-pubkey` | 프로브의 [온체인](glossary.md#onchain) 공개 키 (`probe create`에서 생성됨) |
| `--env` | 네트워크 환경: `testnet`, `devnet` 또는 `mainnet-beta` (원장 RPC URL을 설정) |

또는 `--env` 대신 `--ledger-rpc-url`을 사용하여 사용자 지정 Solana RPC 엔드포인트를 지정할 수 있습니다.

### 선택적 플래그 {#optional-flags}

| 플래그 | 기본값 | 설명 |
|------|---------|-------------|
| `--twamp-listen-port` | 8925 | 상위 DZD로부터의 TWAMP 측정을 위한 포트 |
| `--signed-twamp-port` | 8924 | 인바운드 대상으로부터의 서명된 TWAMP 프로브를 위한 포트 |
| `--udp-listen-port` | 8923 | DZD로부터 LocationOffset 데이터그램을 수신하기 위한 포트 |
| `--probe-interval` | 30s | 각 대상을 측정하는 주기 |
| `--max-offset-age` | 1h | 캐시된 DZD 오프셋이 폐기되기 전 최대 유효 기간 |
| `--verify-interval` | 29s | 원장에서 대상 할당을 재검증하는 주기 |
| `--verbose` | false | 상세 로깅 활성화 |
| `--metrics-enable` | false | Prometheus 메트릭 엔드포인트 활성화 |
| `--metrics-addr` | — | Prometheus 메트릭 엔드포인트 주소 (예: `0.0.0.0:9090`) |

---

## 포트 및 방화벽 {#ports-and-firewall}

geoprobe 에이전트는 여러 포트를 열어야 합니다:

| 포트 | 프로토콜 | 방향 | 용도 |
|------|----------|-----------|---------|
| 8923/udp | UDP | DZD로부터 인바운드 | 서명된 LocationOffset 데이터그램 수신 |
| 8924/udp | UDP | 대상으로부터 인바운드 | 서명된 TWAMP 리플렉터 (인바운드 프로브 흐름) |
| 8925/udp | UDP | DZD로부터 인바운드 | 상위 DZD로부터의 TWAMP 측정 |
| ICMP | ICMP | 대상으로 아웃바운드 | OutboundIcmp 대상에 대한 ICMP 에코 요청 |

!!! note
    에이전트는 TWAMP 프로빙(아웃바운드 흐름)과 서명된 LocationOffset 결과를 대상에 전달하기 위해 대상으로의 아웃바운드 UDP도 필요합니다.

---

## 모니터링 {#monitoring}

운영 가시성을 위해 Prometheus 메트릭 엔드포인트를 활성화하세요:

```bash
doublezero-geoprobe-agent \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey> \
  --env testnet \
  --metrics-enable \
  --metrics-addr 0.0.0.0:9090
```

모니터링할 주요 메트릭:

- **프로브 가용성** — 에이전트 프로세스의 가동 시간
- **DZD-프로브 간 지연 시간** — 1ms 미만이어야 합니다; 높은 값은 배치 문제를 나타냅니다
- **활성 대상 수** — 프로브가 현재 측정 중인 대상 수
- **서명 검증 실패** — 0이 아닌 값은 키 설정 오류 또는 변조된 패킷을 나타낼 수 있습니다
- **오프셋 캐시 적중률** — 낮은 적중률은 프로브가 새로운 DZD 오프셋을 자주 기다리고 있음을 의미합니다

Prometheus 스크래핑 및 DoubleZero 에이전트 전반에서 사용되는 알림 패턴에 대한 일반적인 지침은 [운영 가이드](contribute-operations.md#monitoring)를 참조하세요.

---

## 프로브 관리 명령어 {#probe-management-commands}

`doublezero geolocation` CLI는 프로브 관리를 위해 다음 하위 명령어를 제공합니다:

| 하위 명령어 | 설명 |
|------------|-------------|
| `probe create` | 새 geoProbe를 온체인에 등록 |
| `probe get` | 코드로 특정 프로브의 세부 정보 조회 |
| `probe list` | 등록된 모든 프로브 목록 조회 |
| `probe update` | 프로브 구성 업데이트 (IP, 포트, 서명 키) |
| `probe delete` | 프로브 삭제 (활성 대상 참조가 없어야 함) |
| `probe add-parent` | 상위 DZD를 프로브에 연결 |
| `probe remove-parent` | 프로브에서 상위 DZD 제거 |

모든 하위 명령어는 네트워크를 선택하기 위해 `--env` 또는 `--rpc-url`을 허용합니다. 쓰기 작업(`create`, `update`, `delete`, `add-parent`, `remove-parent`)에는 `--keypair`가 필요합니다.

??? note "예시: 프로브 목록 조회"

    ```bash
    doublezero geolocation probe list
    ```

    등록된 모든 프로브의 코드, 공개 IP, 상위 DZD 및 현재 상태를 반환합니다.