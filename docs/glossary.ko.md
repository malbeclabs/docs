---
description: 문서 전반에 사용되는 DoubleZero 전용 용어 정의.
---

# 용어집

이 페이지는 문서 전반에 사용되는 DoubleZero 전용 용어를 정의합니다.

---

## 네트워크 인프라

### DZD (DoubleZero Device)
DoubleZero 링크를 종단하고 DoubleZero Agent 소프트웨어를 실행하는 물리적 네트워크 스위칭 하드웨어입니다. DZD는 데이터 센터에 배포되며 라우팅, 패킷 처리 및 사용자 연결 서비스를 제공합니다. 각 DZD는 특정 [하드웨어 사양](contribute.md#dzd-network-hardware)을 충족해야 하며 [Config Agent](#config-agent)와 [Telemetry Agent](#telemetry-agent)를 모두 실행합니다.

### DZX (DoubleZero Exchange)
서로 다른 [기여자](#contributor) 링크가 연결되는 메시 네트워크의 상호 연결 지점입니다. DZX는 네트워크 교차점이 발생하는 주요 대도시 지역(예: NYC, LON, TYO)에 위치합니다. 네트워크 기여자는 가장 가까운 DZX에서 자신의 링크를 더 넓은 DoubleZero 메시에 크로스 커넥트해야 합니다. 인터넷 교환소(IX)와 유사한 개념입니다.

### WAN Link
**동일한** 기여자가 운영하는 두 [DZD](#dzd-doublezero-device) 간의 광역 네트워크 링크입니다. WAN 링크는 단일 기여자 인프라 내에서 백본 연결을 제공합니다.

### DZX Link
**서로 다른** 기여자가 운영하는 [DZD](#dzd-doublezero-device) 간에 [DZX](#dzx-doublezero-exchange)에서 설정되는 링크입니다. DZX 링크는 양측 모두의 명시적 수락이 필요합니다.

### DZ Prefix
오버레이 네트워크 주소 지정을 위해 [DZD](#dzd-doublezero-device)에 할당되는 CIDR 형식의 IP 주소 할당입니다. [디바이스 생성](contribute-provisioning.md#step-32-create-your-device-onchain) 시 `--dz-prefixes` 매개변수를 사용하여 지정합니다.

---

## 디바이스 유형

### Edge Device
DoubleZero 네트워크에 대한 사용자 연결을 제공하는 [DZD](#dzd-doublezero-device)입니다. Edge 디바이스는 [CYOA](#cyoa-choose-your-own-adventure) 인터페이스를 활용하여 사용자(밸리데이터, RPC 운영자)를 종단하고 네트워크에 연결합니다.

### Transit Device
DoubleZero 네트워크 내에서 백본 연결을 제공하는 [DZD](#dzd-doublezero-device)입니다. Transit 디바이스는 DZD 간에 트래픽을 이동시키지만 사용자 연결을 직접 종단하지는 않습니다.

### Hybrid Device
[edge](#edge-device)와 [transit](#transit-device) 기능을 모두 결합하여 사용자 연결과 백본 라우팅을 모두 제공하는 [DZD](#dzd-doublezero-device)입니다.

---

## 연결

### CYOA (Choose Your Own Adventure)
[기여자](#contributor)가 사용자가 DoubleZero 네트워크에 연결할 수 있는 연결 옵션을 등록할 수 있게 하는 인터페이스 유형입니다. CYOA 인터페이스에는 [DIA](#dia-direct-internet-access), GRE 터널, 프라이빗 피어링 등 다양한 방법이 포함됩니다. 구성 세부 사항은 [CYOA 인터페이스 생성](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)을 참조하세요.

### DIA (Direct Internet Access)
공용 인터넷을 통해 제공되는 연결을 의미하는 표준 네트워킹 용어입니다. DoubleZero에서 DIA는 사용자(밸리데이터, RPC 운영자)가 기존 인터넷 연결을 통해 [DZD](#dzd-doublezero-device)에 연결하는 [CYOA](#cyoa-choose-your-own-adventure) 인터페이스 유형입니다.

### IBRL (Increase Bandwidth Reduce Latency)
밸리데이터와 RPC 노드가 블록체인 클라이언트를 재시작하지 않고 DoubleZero에 연결할 수 있게 하는 연결 모드입니다. IBRL은 기존 공용 IP 주소를 사용하고 가장 가까운 [DZD](#dzd-doublezero-device)에 오버레이 터널을 설정합니다. 설정 방법은 [Mainnet-Beta 연결](DZ%20Mainnet-beta%20Connection.md)을 참조하세요.

### Multicast
DoubleZero가 지원하는 일대다 패킷 전달 방식입니다. Multicast 모드에는 두 가지 역할이 있습니다: **퍼블리셔**(네트워크를 통해 패킷 전송)와 **구독자**(퍼블리셔로부터 패킷 수신). 개발 팀이 효율적인 데이터 배포를 위해 사용합니다. 연결 세부 사항은 [기타 Multicast 연결](Other%20Multicast%20Connection.md)을 참조하세요.

---

## 소프트웨어 구성 요소

### doublezerod
사용자 서버(밸리데이터, RPC 노드)에서 실행되는 DoubleZero 데몬 서비스입니다. DoubleZero 네트워크 연결을 관리하고, 터널 설정을 처리하며, [DZD](#dzd-doublezero-device)와의 연결을 유지합니다. systemd를 통해 구성되며 [`doublezero`](#doublezero-cli) CLI를 통해 제어됩니다.

### doublezero (CLI)
DoubleZero 네트워크와 상호 작용하기 위한 명령줄 인터페이스입니다. 연결, ID 관리, 상태 확인 및 관리 작업에 사용됩니다. [`doublezerod`](#doublezerod) 데몬과 통신합니다.

### Config Agent
[DZD](#dzd-doublezero-device)에서 실행되며 디바이스 구성을 관리하는 소프트웨어 에이전트입니다. [Controller](#controller) 서비스에서 구성을 읽고 디바이스에 변경 사항을 적용합니다. 설정은 [Config Agent 설치](contribute-provisioning.md#step-44-install-config-agent)를 참조하세요.

### Telemetry Agent
[DZD](#dzd-doublezero-device)에서 실행되며 성능 메트릭(지연 시간, 지터, 패킷 손실)을 수집하고 DoubleZero 레저에 제출하는 소프트웨어 에이전트입니다. 설정은 [Telemetry Agent 설치](contribute-provisioning.md#step-45-install-telemetry-agent)를 참조하세요.

### Controller
[DZD](#dzd-doublezero-device) 에이전트에 구성을 제공하는 서비스입니다. Controller는 DoubleZero 레저의 [온체인](#onchain) 상태에서 디바이스 구성을 도출합니다.

---

## 링크 상태

### Activated
링크의 정상 운영 상태입니다. 트래픽이 링크를 통해 흐르며 라우팅 결정에 참여합니다.

### Soft-Drained
특정 링크에서 트래픽이 억제되는 유지 보수 상태입니다. 정상적인 유지 보수 기간에 사용됩니다. [activated](#activated) 또는 [hard-drained](#hard-drained)로 전환할 수 있습니다.

### Hard-Drained
링크가 서비스에서 완전히 제거되는 유지 보수 상태입니다. 링크를 통해 트래픽이 흐르지 않습니다. [activated](#activated)로 복귀하려면 먼저 [soft-drained](#soft-drained)로 전환해야 합니다.

---

## 조직 및 토큰

### DZF (DoubleZero Foundation)
DoubleZero Foundation은 DoubleZero 네트워크의 개발, 탈중앙화, 보안 및 채택을 지원하기 위해 설립된 회원 없는 비영리 케이맨 제도 재단 법인입니다.

### 2Z Token
DoubleZero 네트워크의 네이티브 토큰입니다. 밸리데이터 수수료 지불에 사용되며 [기여자](#contributor)에게 보상으로 분배됩니다. 밸리데이터는 온체인 스왑 프로그램을 통해 2Z로 수수료를 지불할 수 있습니다. [SOL을 2Z로 스왑하기](Swapping-sol-to-2z.md)를 참조하세요.

### Contributor
DoubleZero 네트워크에 대역폭과 하드웨어를 기여하는 네트워크 인프라 제공자입니다. 기여자는 [DZD](#dzd-doublezero-device)를 운영하고, [WAN](#wan-link) 및 [DZX](#dzx-link) 링크를 제공하며, 기여에 대한 [2Z](#2z-token) 토큰 인센티브를 받습니다. 시작하려면 [기여자 문서](contribute-overview.md)를 참조하세요.

---

## 네트워킹 개념

### MTU (Maximum Transmission Unit)
네트워크 링크를 통해 전송할 수 있는 최대 패킷 크기(바이트)입니다. DoubleZero WAN 링크는 효율성을 위해 일반적으로 MTU 9000(점보 프레임)을 사용합니다.

### VRF (Virtual Routing and Forwarding)
동일한 물리적 라우터에 여러 격리된 라우팅 테이블을 존재할 수 있게 하는 기술입니다. 기여자는 스위치 관리 트래픽을 프로덕션 트래픽과 격리하기 위해 별도의 관리 VRF를 사용하는 경우가 많습니다.

### GRE (Generic Routing Encapsulation)
네트워크 패킷을 IP 패킷 내에 캡슐화하는 터널링 프로토콜입니다. [IBRL](#ibrl-increase-bandwidth-reduce-latency) 및 [CYOA](#cyoa-choose-your-own-adventure) 연결에서 사용자와 DZD 간에 오버레이 터널을 생성하는 데 사용됩니다.

### BGP (Border Gateway Protocol)
인터넷에서 네트워크 간 라우팅 정보를 교환하는 데 사용되는 라우팅 프로토콜입니다. DoubleZero는 ASN 65342로 내부적으로 BGP를 사용합니다.

### ASN (Autonomous System Number)
BGP 라우팅을 위해 네트워크에 할당되는 고유 식별자입니다. 모든 DoubleZero 디바이스는 내부 BGP 프로세스에 **ASN 65342**를 사용합니다.

### Loopback Interface
관리 및 라우팅 목적으로 라우터/스위치에서 사용되는 가상 네트워크 인터페이스입니다. DZD는 내부 라우팅을 위해 Loopback255(VPNv4)와 Loopback256(IPv4)을 사용합니다.

### CIDR (Classless Inter-Domain Routing)
IP 주소 범위를 지정하기 위한 표기법입니다. 형식은 `IP/prefix-length`이며, 프리픽스 길이는 네트워크 크기를 나타냅니다(예: `/29` = 8개 주소, `/24` = 256개 주소).

### Jitter
시간에 따른 패킷 지연 시간의 변동입니다. 낮은 지터는 실시간 애플리케이션에 매우 중요합니다.

### RTT (Round-Trip Time)
패킷이 소스에서 목적지로 이동하고 돌아오는 데 걸리는 시간입니다. 디바이스 간 네트워크 지연 시간을 측정하는 데 사용됩니다.

### TWAMP (Two-Way Active Measurement Protocol)
지연 시간 및 패킷 손실과 같은 네트워크 성능 메트릭을 측정하기 위한 프로토콜입니다. [Telemetry Agent](#telemetry-agent)는 DZD 간 메트릭을 수집하기 위해 TWAMP를 사용합니다.

### IS-IS (Intermediate System to Intermediate System)
DoubleZero 네트워크에서 내부적으로 사용되는 링크 상태 라우팅 프로토콜입니다. IS-IS 메트릭은 [링크 드레이닝](#soft-drained) 작업 중에 조정됩니다.

---

## 지리적 위치 확인

### Geolocation
지연 시간 측정을 사용하여 디바이스의 물리적 위치를 검증하는 DoubleZero 서비스입니다. 알려진 위치의 인프라([DZD](#dzd-doublezero-device))와 대상 디바이스 간의 [RTT](#rtt-round-trip-time) 측정은 디바이스가 기준점에서 특정 거리 이내에 있다는 암호학적 서명된 증명을 제공합니다. 측정값의 온체인 기록은 향후 릴리스에서 계획되어 있습니다. 사용자 문서는 [Geolocation](geolocation.md)을 참조하세요.

### geoProbe
[Geolocation](#geolocation) 시스템에서 지연 시간 측정의 중간 매개체 역할을 하는 베어 메탈 서버입니다. geoProbe는 [DZD](#dzd-doublezero-device)에서 ~1ms 이내에 위치하며, 상위 DZD로부터 서명된 LocationOffset을 수신하고, [TWAMP](#twamp-two-way-active-measurement-protocol), 서명된 TWAMP 또는 ICMP echo를 통해 대상 디바이스까지의 [RTT](#rtt-round-trip-time)를 측정합니다. 각 geoProbe는 [온체인](#onchain)에 등록되어 하나 이상의 상위 DZD에 연결됩니다. 기여자 문서는 [Geoprobe 배포](contribute-geolocation.md)를 참조하세요.

### LocationOffset
[DZD](#dzd-doublezero-device)의 지리적 위치(위도 및 경도)와 엔티티 간(DZD↔Probe 또는 Probe↔Target)의 지연 시간 관계 체인을 포함하는 서명된 데이터 구조입니다. LocationOffset은 Ed25519로 서명되며 측정 체인을 통해 UDP로 전송됩니다. 복합 오프셋에는 이전 측정에 대한 참조가 포함되어 감사 가능한 추적 경로를 생성합니다.

---

## 블록체인 및 키

### Onchain
DoubleZero 컨텍스트에서 온체인은 DoubleZero 레저에 기록되는 데이터 및 작업을 의미합니다. 디바이스 및 링크 구성이 중앙 집중식 관리 시스템에 존재하는 기존 네트워크와 달리, DoubleZero는 디바이스 등록, 링크 구성 및 텔레메트리 제출을 온체인에 기록하여 모든 참여자가 네트워크 상태를 투명하고 검증 가능하게 합니다.

### Service Key
CLI 작업을 인증하는 데 사용되는 암호화 키 쌍입니다. DoubleZero 스마트 컨트랙트와 상호 작용하기 위한 기여자 ID입니다. `~/.config/solana/id.json`에 저장됩니다.

### Metrics Publisher Key
[Telemetry Agent](#telemetry-agent)가 블록체인에 메트릭 제출을 서명하는 데 사용하는 암호화 키 쌍입니다. 보안 격리를 위해 서비스 키와 분리되어 있습니다. `~/.config/doublezero/metrics-publisher.json`에 저장됩니다.

---

## 하드웨어 및 소프트웨어

### EOS (Extensible Operating System)
DZD 스위치에서 실행되는 Arista의 네트워크 운영 체제입니다. 기여자는 [Config Agent](#config-agent)와 [Telemetry Agent](#telemetry-agent)를 EOS 확장 기능으로 설치합니다.

### EOS Extension
Arista EOS 스위치에 설치할 수 있는 소프트웨어 패키지입니다. DZ 에이전트는 `.rpm` 파일로 배포되며 `extension` 명령을 통해 설치됩니다.