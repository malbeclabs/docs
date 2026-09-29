---
description: DoubleZero 디바이스(DZD) 프로비저닝 및 인터페이스와 역할을 온체인에 등록하는 단계별 가이드입니다.
---

# 디바이스 프로비저닝 가이드

이 가이드는 DoubleZero 디바이스(DZD) 프로비저닝을 처음부터 끝까지 안내합니다. 각 단계는 [온보딩 체크리스트](contribute-overview.md#onboarding-checklist)와 일치합니다.

---

## 전체 구조 이해하기

이 가이드는 DoubleZero 네트워크가 트래픽을 라우팅할 수 있도록 인프라를 온체인에 등록하는 과정을 안내합니다. 디바이스 등록이 완료될수록 네트워크에 더 유용해집니다. 디바이스의 완전한 온체인 표현은 문제 해결, 용량 계획을 개선하고 컨트롤러가 정보에 기반한 의사결정을 할 수 있게 합니다. 궁극적으로 컨트롤러가 더 많은 구성 책임을 담당하는 것이 목표입니다.

### 핵심 개념

**인터페이스**

DZD의 인터페이스는 이더넷 포트, 포트 채널(여러 이더넷 포트로 구성된 LAG), 루프백 등 다양한 형태가 있습니다. 네트워크에서 역할을 하는 각 인터페이스는 프로토콜이 그 기능을 파악할 수 있도록 적절한 플래그와 함께 온체인에 등록되어야 합니다.

이더넷 포트와 포트 채널은 다음 역할을 수행할 수 있습니다:

| 플래그 | 의미 |
|------|---------------|
| `--interface-dia dia` | 인터페이스를 직접 인터넷 접속(DIA) 업링크로 표시 |
| `--interface-cyoa <subtype>` | 사용자가 이 인터페이스를 통해 GRE 터널을 설정하는 방식을 선언 (예: 공용 인터넷 경유, 프라이빗 피어링 링크 경유) |
| `--user-tunnel-endpoint true` | 이 인터페이스가 사용자가 GRE 터널을 종단하는 공인 IP를 보유 |

WAN 또는 DZX 링크에 사용되는 인터페이스는 특정 플래그를 갖지 않으며, 대역폭과 함께 등록된 후 링크 생성 시 참조됩니다.

루프백 인터페이스는 여러 목적을 수행합니다:

| 루프백 | 의미 |
|----------|---------------|
| **Loopback100 / 101** | 사용자가 GRE 터널을 종단하는 공인 IP를 보유. `--user-tunnel-endpoint true`로 등록. |
| **Loopback255** (`vpnv4`) | 컨트롤러가 BGP 라우터 ID, VPN-IPv4 피어링(유니캐스트), IS-IS 식별, 세그먼트 라우팅에 사용되는 IP를 할당할 수 있도록 등록 |
| **Loopback256** (`ipv4`) | 컨트롤러가 IPv4 BGP 피어링(멀티캐스트) 및 MSDP 세션에 사용되는 IP를 할당할 수 있도록 등록 |

**링크**

링크는 인터페이스와 별도로 등록되며, 링크가 참조하려면 인터페이스가 먼저 온체인에 존재해야 합니다. WAN 또는 DZX 링크를 생성할 때 이미 등록된 인터페이스를 링크의 물리적 엔드포인트로 지정합니다. 모든 인터페이스가 링크에 연결되는 것은 아닙니다: DIA, CYOA, 루프백 인터페이스는 링크에 연결되지 않습니다.

| 용어 | 의미 |
|------|---------------|
| **WAN 링크** | 자신의 두 DZD 간 링크 |
| **DZX 링크** | 자신의 DZD와 다른 기여자의 DZD 간 링크 |

### 아키텍처 개요

```mermaid
flowchart TB
    subgraph Onchain
        SC[DoubleZero 원장]
    end

    subgraph Your Infrastructure
        MGMT[관리 서버<br/>DoubleZero CLI]
        subgraph DZD[사용자의 DZD]
            CYOA["DIA · CYOA 인터페이스<br/>(사용자 대면 업링크)"]
            WAN_INTF["WAN 링크 인터페이스"]
            DZX_INTF["DZX 링크 인터페이스"]
            LO100["Loopback100/101<br/>(사용자 터널 엔드포인트)"]
        end
        DZD2[사용자의 다른 DZD]
    end

    subgraph Other Contributor
        OtherDZD[다른 기여자의 DZD]
    end

    USERS["사용자"]

    MGMT -.->|디바이스, 링크,<br/>인터페이스 등록| SC
    WAN_INTF ---|WAN 링크| DZD2
    DZX_INTF ---|DZX 링크| OtherDZD
    USERS -.|GRE 터널|.-> CYOA
    CYOA ---|라우팅| LO100
```

---

## 1단계: 사전 준비

디바이스를 프로비저닝하기 전에 물리적 하드웨어를 설치하고 일부 IP 주소를 할당해야 합니다.

### 필요한 것

| 요구사항 | 필요한 이유 |
|-------------|-----------------|
| **DZD 하드웨어** | Arista 7280CR3A 스위치 ([하드웨어 사양](contribute.md#hardware-requirements) 참조) |
| **랙 공간** | 적절한 공기 흐름이 있는 4U |
| **전원** | 이중화 전원, ~4KW 권장 |
| **관리 접근** | 스위치 구성을 위한 SSH/콘솔 접근 |
| **인터넷 연결** | 메트릭 게시 및 컨트롤러에서 구성 가져오기용 |
| **공인 IPv4 블록** | DZ 프리픽스 풀용 최소 /29 (아래 참조) |

### DoubleZero CLI 설치

DoubleZero CLI(`doublezero`)는 프로비저닝 전 과정에서 디바이스 등록, 링크 생성, 기여 관리를 위해 사용됩니다. **관리 서버 또는 VM**에 설치해야 하며 — DZD 스위치 자체에는 설치하지 마십시오. 스위치에는 Config Agent와 Telemetry Agent만 실행됩니다([4단계](#phase-4-link-establishment-agent-installation)에서 설치).

**Ubuntu / Debian:**
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

**Rocky Linux / RHEL:**
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

데몬이 실행 중인지 확인:
```bash
sudo systemctl status doublezerod
```

### DZ 프리픽스 이해하기

DZ 프리픽스는 DoubleZero 프로토콜이 IP 할당을 관리하는 공인 IP 주소 블록입니다.

```mermaid
flowchart LR
    subgraph "사용자의 /29 블록 (8개 IP)"
        IP1["첫 번째 IP<br/>디바이스용<br/>예약"]
        IP2["IP 2"]
        IP3["IP 3"]
        IP4["..."]
        IP8["IP 8"]
    end

    IP1 -->|할당 대상| LO[Loopback100<br/>사용자의 DZD]
    IP2 -->|할당 대상| U1[사용자 1]
    IP3 -->|할당 대상| U2[사용자 2]
```

**DZ 프리픽스 사용 방법:**

- **첫 번째 IP**: 디바이스용 예약 (Loopback100 인터페이스에 할당)
- **나머지 IP**: DZD에 연결하는 특정 사용자 유형에 할당:
    - `IBRLWithAllocatedIP` 사용자
    - `EdgeFiltering` 사용자 (향후 사용 사례)
- **IBRL 사용자**: 이 풀에서 소모하지 않음 (자체 공인 IP 사용)

!!! warning "DZ 프리픽스 규칙"
    **이 주소를 다음 용도로 사용할 수 없습니다:**

    - 자체 네트워크 장비
    - DIA 인터페이스의 점대점 링크
    - 관리 인터페이스
    - DZ 프로토콜 외부의 모든 인프라

    **요구사항:**

    - **전역 라우팅 가능한 (공인)** IPv4 주소여야 함
    - 사설 IP 범위(10.x, 172.16-31.x, 192.168.x)는 스마트 컨트랙트에서 거부됨
    - **최소 크기: /29** (8개 주소), 더 큰 프리픽스 권장 (예: /28, /27)
    - 전체 블록이 사용 가능해야 함 — 주소를 미리 할당하지 마십시오

    자체 장비(DIA 인터페이스 IP, 관리 등)에 주소가 필요한 경우 **별도의 주소 풀**을 사용하십시오.

---

## 2단계: 계정 설정

이 단계에서는 네트워크에서 사용자와 디바이스를 식별하는 암호화 키를 생성합니다.

### CLI 실행 위치

!!! warning "스위치에 CLI를 설치하지 마십시오"
    DoubleZero CLI(`doublezero`)는 Arista 스위치가 아닌 **관리 서버 또는 VM**에 설치해야 합니다.

    ```mermaid
    flowchart LR
        subgraph "관리 서버/VM"
            CLI[DoubleZero CLI]
            KEYS[사용자의 키쌍]
        end

        subgraph "사용자의 DZD 스위치"
            CA[Config Agent]
            TA[Telemetry Agent]
        end

        CLI -->|디바이스, 링크 생성| BC[블록체인]
        CA -->|구성 가져오기| CTRL[컨트롤러]
        TA -->|메트릭 제출| BC
    ```

    | 관리 서버에 설치 | 스위치에 설치 |
    |-----------------------------|-------------------|
    | `doublezero` CLI | Config Agent |
    | 서비스 키쌍 | Telemetry Agent |
    | 메트릭 퍼블리셔 키쌍 | 메트릭 퍼블리셔 키쌍 (복사본) |

### 키란 무엇인가?

키는 보안 로그인 자격 증명과 같습니다:

- **서비스 키**: 기여자 신원 — CLI 명령 실행에 사용
- **메트릭 퍼블리셔 키**: 텔레메트리 데이터 제출을 위한 디바이스 신원

둘 다 암호화 키쌍입니다(공유하는 공개 키와 비밀로 유지하는 개인 키).

```mermaid
flowchart LR
    subgraph "사용자의 키"
        SK[서비스 키<br/>~/.config/solana/id.json]
        MK[메트릭 퍼블리셔 키<br/>~/.config/doublezero/metrics-publisher.json]
    end

    SK -->|사용 용도| CLI[CLI 명령<br/>doublezero device create<br/>doublezero link create]
    MK -->|사용 용도| TEL[Telemetry Agent<br/>온체인에 메트릭 제출]
```

### 단계 2.1: 서비스 키 생성

이것은 DoubleZero와 상호작용하기 위한 주 신원입니다.

```bash
doublezero keygen
```

기본 위치에 키쌍이 생성됩니다. 출력에 **공개 키**가 표시됩니다 — 이것이 DZF와 공유할 정보입니다.

### 단계 2.2: 메트릭 퍼블리셔 키 생성

이 키는 Telemetry Agent가 메트릭 제출에 서명할 때 사용됩니다.

```bash
doublezero keygen -o ~/.config/doublezero/metrics-publisher.json
```

### 단계 2.3: DZF에 키 제출

DoubleZero Foundation 또는 Malbec Labs에 연락하여 다음을 제공하십시오:

1. **서비스 키 공개 키**
2. **GitHub 사용자 이름** (저장소 접근용)

다음 작업이 수행됩니다:

- 온체인에 **기여자 계정** 생성
- 비공개 **기여자 저장소** 접근 권한 부여

### 단계 2.4: 계정 확인

확인을 받은 후 기여자 계정이 존재하는지 확인하십시오:

```bash
doublezero contributor list
```

목록에 기여자 코드가 표시되어야 합니다.

### 단계 2.5: 기여자 저장소 접근

[malbeclabs/contributors](https://github.com/malbeclabs/contributors) 저장소에는 다음이 포함됩니다:

- 기본 디바이스 구성
- TCAM 프로필
- ACL 구성
- 추가 설정 지침

디바이스별 구성은 해당 저장소의 지침을 따르십시오.

---

## 3단계: 디바이스 프로비저닝

이제 물리적 디바이스를 블록체인에 등록하고 인터페이스를 구성합니다.

### 디바이스 유형 이해하기

**Edge** — 사용자 연결만 수락

```mermaid
flowchart LR
    subgraph EDZD[Edge DZD]
        E_CYOA["DIA · CYOA 인터페이스"]
        E_TUN["Loopback100/101
        (사용자 터널 엔드포인트)"]
        E_DZX["DZX 링크 인터페이스"]
        E_CYOA --- E_TUN
    end
    EU["사용자"] -.|GRE 터널|.-> E_CYOA
    E_DZX <-->|DZX 링크| ED["DZD (다른 기여자)"]
```

**Transit** — 디바이스 간 트래픽 전달, 사용자 연결 없음

```mermaid
flowchart LR
    subgraph TDZD[Transit DZD]
        T_WAN["WAN 링크 인터페이스"]
        T_DZX["DZX 링크 인터페이스"]
    end
    T_WAN <-->|WAN 링크| T2["DZD (동일 기여자)"]
    T_DZX <-->|DZX 링크| TD["DZD (다른 기여자)"]
```

**Hybrid** — 사용자 연결과 백본 모두, 가장 일반적

```mermaid
flowchart LR
    subgraph HDZD[Hybrid DZD]
        H_CYOA["DIA · CYOA 인터페이스"]
        H_TUN["Loopback100/101
        (사용자 터널 엔드포인트)"]
        H_WAN["WAN 링크 인터페이스"]
        H_DZX["DZX 링크 인터페이스"]
        H_CYOA --- H_TUN
    end
    HU["사용자"] -.|GRE 터널|.-> H_CYOA
    H_WAN <-->|WAN 링크| H2["DZD (동일 기여자)"]
    H_DZX <-->|DZX 링크| HD["DZD (다른 기여자)"]
```

| 유형 | 기능 | 사용 시기 |
|------|--------------|-------------|
| **Edge** | 사용자 연결만 수락 | 단일 위치, 사용자 대면 전용 |
| **Transit** | 디바이스 간 트래픽 전달 | 백본 연결, 사용자 없음 |
| **Hybrid** | 사용자 연결과 백본 모두 | 가장 일반적 — 모든 기능 수행 |

### 단계 3.1: 위치 및 거래소 찾기

디바이스를 생성하기 전에 데이터센터 위치와 가장 가까운 거래소 코드를 조회하십시오:

```bash
# 사용 가능한 위치(데이터센터) 목록
doublezero location list

# 사용 가능한 거래소(상호연결 지점) 목록
doublezero exchange list
```

### 단계 3.2: 디바이스 온체인 생성

블록체인에 디바이스를 등록합니다:

```bash
doublezero device create \
  --code <YOUR_DEVICE_CODE> \
  --contributor <YOUR_CONTRIBUTOR_CODE> \
  --device-type hybrid \
  --location <LOCATION_CODE> \
  --exchange <EXCHANGE_CODE> \
  --public-ip <DEVICE_PUBLIC_IP> \
  --dz-prefixes <YOUR_DZ_PREFIX>
```

**예시:**

```bash
doublezero device create \
  --code nyc-dz001 \
  --contributor acme \
  --device-type hybrid \
  --location EQX-NY5 \
  --exchange nyc \
  --public-ip "203.0.113.10" \
  --dz-prefixes "198.51.100.0/28"
```

**예상 출력:**

```
Signature: 4vKz8H...truncated...7xPq2
```

디바이스가 생성되었는지 확인:

```bash
doublezero device list | grep nyc-dz001
```

**매개변수 설명:**

| 매개변수 | 의미 |
|-----------|---------------|
| `--code` | 디바이스의 고유 이름 (예: `nyc-dz001`) |
| `--contributor` | 기여자 코드 (DZF에서 부여) |
| `--device-type` | `hybrid`, `transit`, 또는 `edge` |
| `--location` | `location list`에서 확인한 데이터센터 코드 |
| `--exchange` | `exchange list`에서 확인한 가장 가까운 거래소 코드 |
| `--public-ip` | 사용자가 인터넷을 통해 디바이스에 연결하는 공인 IP |
| `--dz-prefixes` | 사용자용 할당 IP 블록 |

### 단계 3.3: 필수 루프백 인터페이스 생성

모든 디바이스는 내부 라우팅을 위해 두 개의 루프백 인터페이스가 필요합니다:

```bash
# VPNv4 루프백
doublezero device interface create <DEVICE_CODE> Loopback255 --loopback-type vpnv4

# IPv4 루프백
doublezero device interface create <DEVICE_CODE> Loopback256 --loopback-type ipv4
```

**예상 출력 (각 명령별):**

```
Signature: 3mNx9K...truncated...8wRt5
```

### 단계 3.4: 물리적 인터페이스 생성

WAN 또는 DZX 링크에 사용될 물리적 인터페이스를 등록합니다. 링크를 참조하는 데 사용하려면 인터페이스가 먼저 온체인에 존재해야 합니다. 이 단계에서는 인터페이스와 대역폭만 등록하며, 링크는 이후 단계에서 생성됩니다.

```bash
doublezero device interface create <DEVICE_CODE> <INTERFACE_NAME> \
  --bandwidth <PORT_SPEED>
```

**예시:**

```bash
doublezero device interface create nyc-dz001 Ethernet1/1 \
  --bandwidth 10Gbps
```

**예상 출력:**

```
Signature: 7pQw2R...truncated...4xKm9
```

WAN 또는 DZX 링크 엔드포인트로 사용될 각 인터페이스에 대해 이 작업을 반복합니다. CYOA 및 DIA 인터페이스는 다음 단계에서 별도로 등록됩니다.

### 단계 3.5: CYOA 인터페이스 생성 (Edge/Hybrid 디바이스용)

Hybrid 및 edge DZD는 사용자가 GRE 터널을 종단하는 **두 개의 공인 IP 주소**가 필요합니다. 사용자는 유니캐스트, 멀티캐스트 또는 둘 다로 연결할 수 있으며, 어떤 IP가 어떤 목적으로 사용되는지는 사용자별로 교대됩니다.

두 IP 모두 물리적 인터페이스 또는 루프백에 `--user-tunnel-endpoint true`로 등록되어야 합니다. 디바이스 생성 시 제공한 IP도 여기서 명시적으로 등록해야 합니다.

IP가 부족한 경우 DZ 프리픽스의 첫 번째 `/32`를 두 IP 중 하나로 사용할 수 있습니다.

#### CYOA 및 DIA

| 유형 | 플래그 | 목적 |
|------|------|---------|
| DIA | `--interface-dia dia` | 포트를 직접 인터넷 접속으로 표시 |
| CYOA | `--interface-cyoa <subtype>` | 사용자가 디바이스에 GRE 터널을 연결하는 방식을 선언 |

CYOA 플래그는 항상 **물리적 인터페이스**(이더넷 포트 또는 포트 채널)에 설정됩니다. 루프백에는 절대 설정하지 않습니다.

| CYOA 하위 유형 | 사용 시기 |
|-------------|-------------|
| `gre-over-dia` | 사용자가 공용 인터넷을 통해 연결. 가장 일반적. |
| `gre-over-private-peering` | 사용자가 직접 크로스커넥트 또는 전용 회선을 통해 연결 |
| `gre-over-public-peering` | 사용자가 인터넷 익스체인지(IX)에서 피어링 |
| `gre-over-fabric` | 사용자가 동일 위치에 있으며 로컬 패브릭을 통해 연결 |
| `gre-over-cable` | 단일 전용 사용자에 대한 직접 케이블 연결 |

#### 시나리오 A: 단일 물리적 인터페이스

ISP로의 단일 물리적 업링크. Ethernet1/1이 CYOA 및 DIA 인터페이스이며 두 공인 IP 중 하나를 보유합니다. Loopback100이 두 번째 공인 IP를 보유합니다.

```mermaid
flowchart LR
    USERS(["최종 사용자"])

    subgraph DZD["DZD"]
        E1["Eth1/1
        203.0.113.1/30
        CYOA · DIA · 사용자 터널 엔드포인트"]
        LO["Loopback100
        198.51.100.1/32\n        사용자 터널 엔드포인트"]
        E1 --- LO
    end

    ISP["ISP 라우터
    203.0.113.2/30"]

    ISP -- "10GbE" --- E1
    USERS -. "GRE 터널" .-> E1
    USERS -. "GRE 터널" .-> LO
```

| 인터페이스 | `--interface-cyoa` | `--interface-dia` | `--ip-net` | `--bandwidth` | `--cir` | `--routing-mode` | `--user-tunnel-endpoint` |
|-----------|-------------------|------------------|------------|---------------|---------|-----------------|--------------------------|
| Ethernet1/1 | `gre-over-dia` | `dia` | 기여자 할당 IP/서브넷 | 포트 속도 | 약정 전송률 | `bgp` 또는 `static` | `true` |
| Loopback100 | — | — | 공인 /32 | `0bps` | — | — | `true` |

시나리오 A 기반 실행 명령 예시:
```bash
doublezero device interface create mydzd-nyc01 Ethernet1/1 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --ip-net 203.0.113.1/30 \
  --bandwidth 10Gbps \
  --cir 1Gbps \
  --routing-mode bgp \
  --user-tunnel-endpoint true

doublezero device interface create mydzd-nyc01 Loopback100 \
  --ip-net 198.51.100.1/32 \
  --bandwidth 0bps \
  --user-tunnel-endpoint true
```

#### 시나리오 B: 포트 채널 (LAG)

DZD가 IP가 있는 포트 채널을 통해 업스트림 장비에 연결됩니다. 포트 채널이 하나의 공인 IP를 보유하며 CYOA 엔드포인트입니다. Loopback100이 두 번째 공인 IP를 보유합니다.

```mermaid
flowchart LR
    USERS(["최종 사용자"])

    subgraph SW["업스트림 라우터 / 스위치"]
        SWPC(["bond0
        203.0.113.2/30"])
    end

    subgraph DZD["DZD"]
        subgraph PC["Port-Channel1 · 203.0.113.1/30 · CYOA · DIA · 사용자 터널 엔드포인트"]
            E1["Eth1/1"]
            E2["Eth2/1"]
        end
        LO["Loopback100
        198.51.100.1/32\n        사용자 터널 엔드포인트"]
        PC --- LO
    end

    SWPC -- "2x 10GbE" --- PC
    USERS -. "GRE 터널" .-> PC
    USERS -. "GRE 터널" .-> LO
```

| 인터페이스 | `--interface-cyoa` | `--interface-dia` | `--ip-net` | `--bandwidth` | `--cir` | `--routing-mode` | `--user-tunnel-endpoint` |
|-----------|-------------------|------------------|------------|---------------|---------|-----------------|--------------------------|
| Port-Channel1 | `gre-over-dia` | `dia` | 기여자 할당 IP/서브넷 | 결합된 LAG 속도 | 약정 전송률 | `bgp` 또는 `static` | `true` |
| Loopback100 | — | — | 공인 /32 | `0bps` | — | — | `true` |

시나리오 B 기반 실행 명령 예시:
```bash
doublezero device interface create mydzd-fra01 Port-Channel1 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --ip-net 203.0.113.1/30 \
  --bandwidth 20Gbps \
  --cir 2Gbps \
  --routing-mode bgp \
  --user-tunnel-endpoint true

doublezero device interface create mydzd-fra01 Loopback100 \
  --ip-net 198.51.100.1/32 \
  --bandwidth 0bps \
  --user-tunnel-endpoint true
```


#### 시나리오 C: 별도 라우터로의 이중 물리적 업링크

각 물리적 인터페이스가 다른 업스트림 라우터에 연결됩니다. 두 공인 IP는 Loopback100과 Loopback101에 있으며, 둘 다 사용자 터널 엔드포인트로 등록됩니다.

```mermaid
flowchart LR
    USERS(["최종 사용자"])

    RA["라우터 A
    203.0.113.2/30"]
    RB["라우터 B
    203.0.113.6/30"]

    subgraph DZD["DZD"]
        E1["Eth1/1
        203.0.113.1/30
        CYOA · DIA"]
        E2["Eth2/1
        203.0.113.5/30
        CYOA · DIA"]
        LO0["Loopback100
        198.51.100.1/32\n        사용자 터널 엔드포인트"]
        LO1["Loopback101
        198.51.100.2/32\n        사용자 터널 엔드포인트"]
        E1 --> LO0
        E2 --> LO1
    end

    RA -- "10GbE" --- E1
    RB -- "10GbE" --- E2
    USERS -. "GRE 터널" .-> LO0
    USERS -. "GRE 터널" .-> LO1
```

| 인터페이스 | `--interface-cyoa` | `--interface-dia` | `--ip-net` | `--bandwidth` | `--cir` | `--routing-mode` | `--user-tunnel-endpoint` |
|-----------|-------------------|------------------|------------|---------------|---------|-----------------|--------------------------|
| Ethernet1/1 | `gre-over-dia` | `dia` | 기여자 할당 IP/서브넷 | 포트 속도 | 약정 전송률 | `bgp` 또는 `static` | — |
| Ethernet2/1 | `gre-over-dia` | `dia` | 기여자 할당 IP/서브넷 | 포트 속도 | 약정 전송률 | `bgp` 또는 `static` | — |
| Loopback100 | — | — | 공인 /32 | `0bps` | — | — | `true` |
| Loopback101 | — | — | 공인 /32 | `0bps` | — | — | `true` |

시나리오 C 기반 실행 명령 예시:
```bash
doublezero device interface create mydzd-ams01 Ethernet1/1 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --ip-net 203.0.113.1/30 \
  --bandwidth 10Gbps \
  --cir 1Gbps \
  --routing-mode bgp

doublezero device interface create mydzd-ams01 Ethernet2/1 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --ip-net 203.0.113.5/30 \
  --bandwidth 10Gbps \
  --cir 1Gbps \
  --routing-mode bgp

doublezero device interface create mydzd-ams01 Loopback100 \
  --ip-net 198.51.100.1/32 \
  --bandwidth 0bps \
  --user-tunnel-endpoint true

doublezero device interface create mydzd-ams01 Loopback101 \
  --ip-net 198.51.100.2/32 \
  --bandwidth 0bps \
  --user-tunnel-endpoint true
```

### 단계 3.6: 디바이스 확인

```bash
doublezero device list
```

**예상 출력:**

```
 account                                      | code      | contributor | location | exchange | device_type | public_ip    | dz_prefixes     | users | max_users | status    | health  | mgmt_vrf | owner
 7xKm9pQw2R4vHt3...                          | nyc-dz001 | acme        | EQX-NY5  | nyc      | hybrid      | 203.0.113.10 | 198.51.100.0/28 | 0     | 14        | activated | pending |          | 5FMtd5Woq5XAAg54...
```

디바이스가 `activated` 상태로 표시되어야 합니다.

---

## 4단계: 링크 설정 및 에이전트 설치

링크는 디바이스를 DoubleZero 네트워크의 나머지 부분에 연결합니다.

### 링크 이해하기

```mermaid
flowchart LR
    subgraph "사용자의 네트워크"
        D1[사용자의 DZD 1<br/>NYC]
        D2[사용자의 DZD 2<br/>LAX]
    end

    subgraph "다른 기여자"
        O1[다른 기여자의 DZD<br/>NYC]
    end

    D1 ---|WAN 링크<br/>동일 기여자| D2
    D1 ---|DZX 링크<br/>다른 기여자| O1
```

| 링크 유형 | 연결 대상 | 수락 방식 |
|-----------|----------|------------|
| **WAN 링크** | 사용자의 디바이스 두 대 | 자동 (양쪽 모두 소유) |
| **DZX 링크** | 사용자의 디바이스와 다른 기여자의 디바이스 | 상대방의 수락 필요 |

### 단계 4.1: WAN 링크 생성 (여러 디바이스가 있는 경우)

WAN 링크는 자신의 디바이스를 연결합니다:

```bash
doublezero link create wan \
  --code <LINK_CODE> \
  --contributor <YOUR_CONTRIBUTOR> \
  --side-a <DEVICE_1_CODE> \
  --side-a-interface <INTERFACE_ON_DEVICE_1> \
  --side-z <DEVICE_2_CODE> \
  --side-z-interface <INTERFACE_ON_DEVICE_2> \
  --bandwidth 10000 \
  --mtu 9000 \
  --delay-ms 20 \
  --jitter-ms 1
```

**예시:**

```bash
doublezero link create wan \
  --code nyc-lax-wan01 \
  --contributor acme \
  --side-a nyc-dz001 \
  --side-a-interface Ethernet3/1 \
  --side-z lax-dz001 \
  --side-z-interface Ethernet3/1 \
  --bandwidth 10000 \
  --mtu 9000 \
  --delay-ms 65 \
  --jitter-ms 1
```

**예상 출력:**

```
Signature: 5tNm7K...truncated...9pRw2
```

### 단계 4.2: DZX 링크 생성

DZX 링크는 사용자의 디바이스를 다른 기여자의 DZD에 직접 연결합니다:

```bash
doublezero link create dzx \
  --code <DEVICE_CODE_A:DEVICE_CODE_Z> \
  --contributor <YOUR_CONTRIBUTOR> \
  --side-a <YOUR_DEVICE_CODE> \
  --side-a-interface <YOUR_INTERFACE> \
  --side-z <OTHER_DEVICE_CODE> \
  --bandwidth <BANDWIDTH in Kbps, Mbps, or Gbps> \
  --mtu <MTU> \
  --delay-ms <DELAY> \
  --jitter-ms <JITTER>
```

**예상 출력:**

```
Signature: 8mKp3W...truncated...2nRx7
```

DZX 링크를 생성한 후 상대방 기여자가 수락해야 합니다:

```bash
# 상대방 기여자가 이 명령을 실행합니다
doublezero link accept \
  --code <LINK_CODE> \
  --side-z-interface <THEIR_INTERFACE>
```

**예상 출력 (수락하는 기여자):**

```
Signature: 6vQt9L...truncated...3wPm4
```

### 단계 4.3: 링크 확인

```bash
doublezero link list
```

**예상 출력:**

```
 account                                      | code          | contributor | side_a_name | side_a_iface_name | side_z_name | side_z_iface_name | link_type | bandwidth | mtu  | delay_ms | jitter_ms | delay_override_ms | tunnel_id | tunnel_net      | status    | health  | owner
 8vkYpXaBW8RuknJq...                         | nyc-dz001:lax-dz001 | acme        | nyc-dz001   | Ethernet3/1       | lax-dz001   | Ethernet3/1       | WAN       | 10Gbps    | 9000 | 65.00ms  | 1.00ms    | 0.00ms            | 42        | 172.16.0.84/31  | activated | pending | 5FMtd5Woq5XAAg54...
```

양측이 모두 구성되면 링크가 `activated` 상태로 표시되어야 합니다.

---

### 에이전트 설치

두 개의 소프트웨어 에이전트가 DZD에서 실행됩니다:

```mermaid
flowchart TB
    subgraph "사용자의 DZD"
        CA[Config Agent]
        TA[Telemetry Agent]
        HW[스위치 하드웨어/소프트웨어]
    end

    CA -->|구성 폴링| CTRL[컨트롤러 서비스]
    CA -->|구성 적용| HW

    HW -->|메트릭| TA
    TA -->|온체인 제출| BC[DoubleZero 원장]
```

| 에이전트 | 기능 |
|-------|--------------|
| **Config Agent** | 컨트롤러에서 구성을 가져와 스위치에 적용 |
| **Telemetry Agent** | 다른 디바이스와의 지연/손실을 측정하고 메트릭을 온체인에 보고 |

### 단계 4.4: Config Agent 설치

#### 스위치에서 API 활성화

EOS 구성에 추가:

```
management api eos-sdk-rpc
    transport grpc eapilocal
        localhost loopback vrf default
        service all
        no disabled
```

!!! note "VRF 참고"
    관리 VRF 이름이 다른 경우 `default`를 해당 이름으로 변경하십시오 (예: `management`).

#### 에이전트 다운로드 및 설치

```bash
# 스위치에서 bash 진입
switch# bash
$ sudo bash
# cd /mnt/flash
# wget AGENT_DOWNLOAD_URL
# exit
$ exit

# EOS 확장으로 설치
switch# copy flash:AGENT_FILENAME extension:
switch# extension AGENT_FILENAME
switch# copy installed-extensions boot-extensions
```

#### 확장 확인

```bash
switch# show extensions
```

Status가 "A, I, B"여야 합니다:

```
Name                                        Version/Release     Status     Extension
------------------------------------------- ------------------- ---------- ---------
AGENT_FILENAME    MAINNET_CLIENT_VERSION/1             A, I, B    1

A: available | NA: not available | I: installed | F: forced | B: install at boot
```

#### 에이전트 구성 및 시작

EOS 구성에 추가:

```
daemon doublezero-agent
    exec /usr/local/bin/doublezero-agent -pubkey <YOUR_DEVICE_PUBKEY> -controller <controller_IP>:<controller_port>
    no shut
```

!!! info "컨트롤러 IP 및 포트"
    컨트롤러 IP와 포트는 단계 2.5에서 접근 권한을 받은 기여자 저장소에서 확인할 수 있습니다.

!!! note "VRF 참고"
    관리 VRF가 `default`가 아닌 경우 (즉, 네임스페이스가 `ns-default`가 아닌 경우) exec 명령 앞에 `exec /sbin/ip netns exec ns-<VRF>`를 추가하십시오. 예를 들어 VRF가 `management`인 경우:
    ```
    daemon doublezero-agent
        exec /sbin/ip netns exec ns-management /usr/local/bin/doublezero-agent -pubkey <YOUR_DEVICE_PUBKEY>
        no shut
    ```

디바이스 pubkey는 `doublezero device list`의 `account` 열에서 확인할 수 있습니다.

#### 실행 확인

```bash
switch# show agent doublezero-agent logs
```

"Starting doublezero-agent" 메시지와 컨트롤러 연결 성공이 표시되어야 합니다.

### 단계 4.5: Telemetry Agent 설치

#### 메트릭 퍼블리셔 키를 디바이스에 복사

```bash
scp ~/.config/doublezero/metrics-publisher.json <SWITCH_IP>:/mnt/flash/metrics-publisher-keypair.json
```

#### 메트릭 퍼블리셔를 온체인에 등록

```bash
doublezero device update \
  --pubkey <DEVICE_ACCOUNT> \
  --metrics-publisher <METRICS_PUBLISHER_PUBKEY>
```

pubkey는 metrics-publisher.json 파일에서 확인할 수 있습니다.

#### 에이전트 다운로드 및 설치

```bash
switch# bash
$ sudo bash
# cd /mnt/flash
# wget TELEMETRY_DOWNLOAD_URL
# exit
$ exit

# EOS 확장으로 설치
switch# copy flash:TELEMETRY_FILENAME extension:
switch# extension TELEMETRY_FILENAME
switch# copy installed-extensions boot-extensions
```

#### 확장 확인

```bash
switch# show extensions
```

Status가 "A, I, B"여야 합니다:

```
Name                                        Version/Release     Status     Extension
------------------------------------------- ------------------- ---------- ---------
TELEMETRY_FILENAME    MAINNET_CLIENT_VERSION/1             A, I, B    1

A: available | NA: not available | I: installed | F: forced | B: install at boot
```

#### 에이전트 구성 및 시작

EOS 구성에 추가:

```
daemon doublezero-telemetry
    exec /usr/local/bin/doublezero-telemetry --local-device-pubkey <DEVICE_ACCOUNT> --env mainnet --keypair /mnt/flash/metrics-publisher-keypair.json
    no shut
```

!!! note "VRF 참고"
    관리 VRF가 `default`가 아닌 경우 (즉, 네임스페이스가 `ns-default`가 아닌 경우) exec 명령에 `--management-namespace ns-<VRF>`를 추가하십시오. 예를 들어 VRF가 `management`인 경우:
    ```
    daemon doublezero-telemetry
        exec /usr/local/bin/doublezero-telemetry --management-namespace ns-management --local-device-pubkey <DEVICE_ACCOUNT> --env mainnet --keypair /mnt/flash/metrics-publisher-keypair.json
        no shut
    ```

#### 실행 확인

```bash
switch# show agent doublezero-telemetry logs
```

"Starting telemetry collector" 및 "Starting submission loop" 메시지가 표시되어야 합니다.

---

## 5단계: 링크 번인

!!! warning "모든 새 링크는 트래픽을 전달하기 전에 번인을 거쳐야 합니다"
    새 링크는 프로덕션 트래픽에 활성화되기 전에 **최소 24시간 동안 드레인 상태로 유지**되어야 합니다. 이 번인 요구사항은 [RFC12: Network Provisioning](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc12-network-provisioning.md)에 정의되어 있으며, 링크가 서비스에 투입되기 전에 약 200,000 DZ Ledger 슬롯(~20시간)의 깨끗한 메트릭이 필요합니다.

에이전트가 설치되고 실행 중인 상태에서 [metrics.doublezero.xyz](https://metrics.doublezero.xyz)에서 최소 24시간 연속으로 링크를 모니터링하십시오:

- **"DoubleZero Device-Link Latencies"** 대시보드 — 시간 경과에 따라 링크에서 **패킷 손실이 0**인지 확인
- **"DoubleZero Network Metrics"** 대시보드 — 링크에서 **오류가 0**인지 확인

번인 기간 동안 손실과 오류가 모두 0인 깨끗한 링크가 확인된 후에만 링크의 드레인을 해제하십시오.

---

## 6단계: 검증 및 활성화

모든 것이 정상적으로 작동하는지 확인하기 위해 이 체크리스트를 수행하십시오.

!!! warning "디바이스는 잠긴 상태(`max_users = 0`)로 시작합니다"
    디바이스가 생성되면 `max_users`가 기본적으로 **0**으로 설정됩니다. 이는 아직 사용자가 연결할 수 없음을 의미합니다. 이것은 의도적인 것으로 — 사용자 트래픽을 수락하기 전에 모든 것이 작동하는지 확인해야 합니다.

    **`max_users`를 0 이상으로 설정하기 전에 다음을 수행해야 합니다:**

    1. [metrics.doublezero.xyz](https://metrics.doublezero.xyz)에서 모든 링크가 손실/오류 없이 **24시간 번인**을 완료했는지 확인
    2. **DZ/Malbec Labs와 협력**하여 연결 테스트 실행:
        - 테스트 사용자가 디바이스에 연결할 수 있는가?
        - 사용자가 DZ 네트워크를 통해 라우트를 수신하는가?
        - 사용자가 DZ 네트워크를 통해 엔드투엔드 트래픽을 라우팅할 수 있는가?
    3. DZ/ML이 테스트 통과를 확인한 후에만 max_users를 96으로 설정:

    ```bash
    doublezero device update --pubkey <DEVICE_ACCOUNT> --max-users 96
    ```

### 디바이스 확인

```bash
# 디바이스가 "activated" 상태로 표시되어야 합니다
doublezero device list | grep <YOUR_DEVICE_CODE>
```

**예상 출력:**

```
 7xKm9pQw2R4vHt3... | nyc-dz001 | acme | EQX-NY5 | nyc | hybrid | 203.0.113.10 | 198.51.100.0/28 | 0 | 14 | activated | pending | | 5FMtd5Woq5XAAg54...
```

```bash
# 인터페이스가 목록에 표시되어야 합니다
doublezero device interface list | grep <YOUR_DEVICE_CODE>
```

**예상 출력:**

```
 nyc-dz001 | Loopback255 | loopback | vpnv4 | none | none | 0 | 0 | 1500 | static | 0 | 172.16.1.91/32  | 56 | false | activated
 nyc-dz001 | Loopback256 | loopback | ipv4  | none | none | 0 | 0 | 1500 | static | 0 | 172.16.1.100/32 | 0  | false | activated
 nyc-dz001 | Ethernet1/1 | physical | none  | none | none | 0 | 0 | 1500 | static | 0 |                 | 0  | false | activated
```

### 링크 확인

```bash
# 링크가 "activated" 상태로 표시되어야 합니다
doublezero link list | grep <YOUR_DEVICE_CODE>
```

**예상 출력:**

```
 8vkYpXaBW8RuknJq... | nyc-lax-wan01 | acme | nyc-dz001 | Ethernet3/1 | lax-dz001 | Ethernet3/1 | WAN | 10Gbps | 9000 | 65.00ms | 1.00ms | 0.00ms | 42 | 172.16.0.84/31 | activated | pending | 5FMtd5Woq5XAAg54...
```

### 에이전트 확인

스위치에서:

```bash
# Config agent가 구성 가져오기에 성공하는지 확인
switch# show agent doublezero-agent logs | tail -20

# Telemetry agent가 제출에 성공하는지 확인
switch# show agent doublezero-telemetry logs | tail -20
```

### 최종 검증 다이어그램

```mermaid
flowchart TB
    subgraph "검증 체크리스트"
        D[디바이스 상태: activated?]
        I[인터페이스: 등록됨?]
        L[링크: activated?]
        CA[Config Agent: 구성 가져오기 중?]
        TA[Telemetry Agent: 메트릭 제출 중?]
    end

    D --> PASS
    I --> PASS
    L --> PASS
    CA --> PASS
    TA --> PASS

    PASS[모든 검사 통과] --> NOTIFY[DZF/Malbec Labs에 알림<br/>기술적 준비 완료!]
```

---

## 문제 해결

### 디바이스 생성 실패

- 서비스 키가 인증되었는지 확인 (`doublezero contributor list`)
- 위치 및 거래소 코드가 유효한지 확인
- DZ 프리픽스가 유효한 공인 IP 범위인지 확인

### 링크가 "requested" 상태에서 멈춤

- DZX 링크는 상대방 기여자의 수락이 필요합니다
- 상대방에게 `doublezero link accept` 실행을 요청하십시오

### Config Agent 연결 안 됨

- 관리 네트워크가 인터넷 접근이 가능한지 확인
- VRF 구성이 설정과 일치하는지 확인
- 디바이스 pubkey가 올바른지 확인

### Telemetry Agent 제출 안 됨

- 메트릭 퍼블리셔 키가 온체인에 등록되었는지 확인
- 키쌍 파일이 스위치에 존재하는지 확인
- 디바이스 account pubkey가 올바른지 확인

---

## 다음 단계

- 에이전트 업그레이드 및 링크 관리에 대한 [운영 가이드](contribute-operations.md)를 검토하십시오
- 용어 정의는 [용어집](glossary.md)을 확인하십시오
- 문제가 발생하면 DZF/Malbec Labs에 문의하십시오