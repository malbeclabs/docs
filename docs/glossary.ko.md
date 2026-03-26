# 용어집
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


이 페이지는 문서 전반에 사용되는 DoubleZero 전용 용어를 정의합니다.

---

## 네트워크 인프라

### DZD (DoubleZero Device)
DoubleZero 링크를 종단하고 DoubleZero 에이전트 소프트웨어를 실행하는 물리적 네트워크 스위칭 하드웨어입니다. DZD는 데이터 센터에 배포되며 라우팅, 패킷 처리 및 사용자 연결 서비스를 제공합니다. 각 DZD는 특정 [하드웨어 사양](contribute.md#dzd-network-hardware)을 필요로 하며 [Config Agent](#config-agent) 와 [Telemetry Agent](#telemetry-agent) 를 모두 실행합니다.

### DZX (DoubleZero Exchange)
서로 다른 [기여자](#contributor) 링크가 연결되는 메시 네트워크의 상호 연결 지점입니다. DZX는 네트워크 교차점이 발생하는 주요 도시 지역(예: NYC, LON, TYO)에 위치합니다. 네트워크 기여자는 가장 가까운 DZX에서 링크를 더 광범위한 DoubleZero 메시에 크로스 커넥트해야 합니다. 인터넷 교환(IX)과 개념적으로 유사합니다.

### WAN 링크
**동일한** 기여자가 운영하는 두 [DZD](#dzd-doublezero-device) 간의 광역 네트워크 링크입니다. WAN 링크는 단일 기여자의 인프라 내에서 백본 연결을 제공합니다.

### DZX 링크
[DZX](#dzx-doublezero-exchange)에서 설정된, **서로 다른** 기여자가 운영하는 [DZD](#dzd-doublezero-device) 간의 링크입니다. DZX 링크는 양쪽 당사자의 명시적인 수락이 필요합니다.

### DZ 프리픽스
오버레이 네트워크 주소 지정을 위해 [DZD](#dzd-doublezero-device)에 할당된 CIDR 형식의 IP 주소 할당입니다. `--dz-prefixes` 파라미터를 사용하여 [장치 생성](contribute-provisioning.md#step-32-create-your-device-onchain) 중에 지정됩니다.

---

## 장치 유형

### 엣지 장치
DoubleZero 네트워크에 사용자 연결을 제공하는 [DZD](#dzd-doublezero-device)입니다. 엣지 장치는 [CYOA](#cyoa-choose-your-own-adventure) 인터페이스를 활용하여 사용자(검증자, RPC 운영자)를 종단하고 네트워크에 연결합니다.

### 트랜짓 장치
DoubleZero 네트워크 내에서 백본 연결을 제공하는 [DZD](#dzd-doublezero-device)입니다. 트랜짓 장치는 DZD 간에 트래픽을 이동하지만 사용자 연결을 직접 종단하지 않습니다.

### 하이브리드 장치
[엣지](#edge-device)와 [트랜짓](#transit-device) 기능을 모두 결합한 [DZD](#dzd-doublezero-device)로, 사용자 연결과 백본 라우팅을 모두 제공합니다.

---

## 연결

### CYOA (Choose Your Own Adventure)
[기여자](#contributor)가 사용자가 DoubleZero 네트워크에 연결하기 위한 연결 옵션을 등록할 수 있는 인터페이스 유형입니다. CYOA 인터페이스에는 [DIA](#dia-direct-internet-access), GRE 터널, 프라이빗 피어링 등 다양한 방법이 포함됩니다. 구성 세부 정보는 [CYOA 인터페이스 생성](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)을 참조하세요.

### DIA (Direct Internet Access)
공용 인터넷을 통해 제공되는 연결에 대한 표준 네트워킹 용어입니다. DoubleZero에서 DIA는 사용자(검증자, RPC 운영자)가 기존 인터넷 연결을 통해 [DZD](#dzd-doublezero-device)에 연결하는 [CYOA](#cyoa-choose-your-own-adventure) 인터페이스 유형입니다.

### IBRL (Increase Bandwidth Reduce Latency)
검증자와 RPC 노드가 블록체인 클라이언트를 재시작하지 않고 DoubleZero에 연결할 수 있는 연결 모드입니다. IBRL은 기존 공개 IP 주소를 사용하고 가장 가까운 [DZD](#dzd-doublezero-device)에 오버레이 터널을 설정합니다. 설정 지침은 [Mainnet-Beta 연결](DZ%20Mainnet-beta%20Connection.md)을 참조하세요.

### 멀티캐스트
DoubleZero에서 지원하는 일대다 패킷 전달 방법입니다. 멀티캐스트 모드에는 **발행자**(네트워크 전체에 패킷 전송)와 **구독자**(발행자로부터 패킷 수신)의 두 가지 역할이 있습니다. 개발 팀이 효율적인 데이터 배포를 위해 사용합니다. 연결 세부 정보는 [기타 멀티캐스트 연결](Other%20Multicast%20Connection.md)을 참조하세요.

---

## 소프트웨어 구성 요소

### doublezerod
사용자 서버(검증자, RPC 노드)에서 실행되는 DoubleZero 데몬 서비스입니다. DoubleZero 네트워크에 대한 연결을 관리하고, 터널 설정을 처리하며, [DZD](#dzd-doublezero-device)에 대한 연결을 유지합니다. systemd를 통해 구성되고 [`doublezero`](#doublezero-cli) CLI를 통해 제어됩니다.

### doublezero (CLI)
DoubleZero 네트워크와 상호작용하기 위한 명령줄 인터페이스입니다. 연결, 아이덴티티 관리, 상태 확인 및 관리 작업에 사용됩니다. [`doublezerod`](#doublezerod) 데몬과 통신합니다.

### Config Agent
[DZD](#dzd-doublezero-device)에서 실행되어 장치 구성을 관리하는 소프트웨어 에이전트입니다. [컨트롤러](#controller) 서비스에서 구성을 읽고 장치에 변경사항을 적용합니다. 설정은 [Config Agent 설치](contribute-provisioning.md#step-44-install-config-agent)를 참조하세요.

### Telemetry Agent
[DZD](#dzd-doublezero-device)에서 실행되어 성능 지표(대기 시간, 지터, 패킷 손실)를 수집하고 DoubleZero 레저에 제출하는 소프트웨어 에이전트입니다. 설정은 [Telemetry Agent 설치](contribute-provisioning.md#step-45-install-telemetry-agent)를 참조하세요.

### 컨트롤러
[DZD](#dzd-doublezero-device) 에이전트에 구성을 제공하는 서비스입니다. 컨트롤러는 DoubleZero 레저의 [온체인](#onchain) 상태에서 장치 구성을 도출합니다.

---

## 링크 상태

### 활성화됨 (Activated)
링크의 정상 운영 상태입니다. 트래픽이 링크를 통해 흐르고 라우팅 결정에 참여합니다.

### 소프트 드레인 (Soft-Drained)
특정 링크의 트래픽을 줄이는 유지보수 상태입니다. 점진적인 유지보수 창에 사용됩니다. [활성화됨](#activated) 또는 [하드 드레인](#hard-drained)으로 전환할 수 있습니다.

### 하드 드레인 (Hard-Drained)
링크가 서비스에서 완전히 제거되는 유지보수 상태입니다. 링크를 통해 트래픽이 흐르지 않습니다. [활성화됨](#activated)으로 돌아가기 전에 [소프트 드레인](#soft-drained)으로 전환해야 합니다.

---

## 조직 및 토큰

### DZF (DoubleZero Foundation)
DoubleZero Foundation은 DoubleZero 네트워크의 개발, 탈중앙화, 보안 및 채택을 지원하기 위해 설립된 비회원 비영리 케이맨 제도 파운데이션 컴퍼니입니다.

### 2Z 토큰
DoubleZero 네트워크의 네이티브 토큰입니다. 검증자 수수료 납부 및 [기여자](#contributor)에게 보상 배포에 사용됩니다. 검증자는 온체인 스왑 프로그램을 통해 2Z로 수수료를 납부할 수 있습니다. [SOL을 2Z로 스왑](Swapping-sol-to-2z.md)을 참조하세요.

### 기여자 (Contributor)
DoubleZero 네트워크에 대역폭과 하드웨어를 기여하는 네트워크 인프라 제공업체입니다. 기여자는 [DZD](#dzd-doublezero-device)를 운영하고 [WAN](#wan-link) 및 [DZX](#dzx-link) 링크를 제공하며 기여에 대한 [2Z](#2z-token) 토큰 인센티브를 받습니다. 시작하려면 [기여자 문서](contribute-overview.md)를 참조하세요.

---

## 네트워킹 개념

### MTU (Maximum Transmission Unit)
네트워크 링크를 통해 전송할 수 있는 가장 큰 패킷 크기(바이트)입니다. DoubleZero WAN 링크는 일반적으로 효율성을 위해 MTU 9000(점보 프레임)을 사용합니다.

### VRF (Virtual Routing and Forwarding)
동일한 물리적 라우터에 여러 개의 격리된 라우팅 테이블이 존재할 수 있는 기술입니다. 기여자는 종종 별도의 관리 VRF를 사용하여 스위치 관리 트래픽을 프로덕션 트래픽으로부터 격리합니다.

### GRE (Generic Routing Encapsulation)
IP 패킷 내에 네트워크 패킷을 캡슐화하는 터널링 프로토콜입니다. 사용자와 DZD 간에 오버레이 터널을 생성하기 위해 [IBRL](#ibrl-increase-bandwidth-reduce-latency) 및 [CYOA](#cyoa-choose-your-own-adventure) 연결에 사용됩니다.

### BGP (Border Gateway Protocol)
인터넷의 네트워크 간 라우팅 정보 교환에 사용되는 라우팅 프로토콜입니다. DoubleZero는 ASN 65342로 내부적으로 BGP를 사용합니다.

### ASN (Autonomous System Number)
BGP 라우팅을 위해 네트워크에 할당된 고유 식별자입니다. 모든 DoubleZero 장치는 내부 BGP 프로세스에 **ASN 65342**를 사용합니다.

### 루프백 인터페이스
관리 및 라우팅 목적으로 라우터/스위치에 사용되는 가상 네트워크 인터페이스입니다. DZD는 내부 라우팅에 Loopback255 (VPNv4) 및 Loopback256 (IPv4)을 사용합니다.

### CIDR (Classless Inter-Domain Routing)
IP 주소 범위를 지정하기 위한 표기법입니다. 형식은 `IP/프리픽스-길이`이며 프리픽스 길이는 네트워크 크기를 나타냅니다(예: `/29` = 8개 주소, `/24` = 256개 주소).

### 지터 (Jitter)
시간이 지남에 따라 패킷 대기 시간의 변동입니다. 낮은 지터는 실시간 애플리케이션에 매우 중요합니다.

### RTT (Round-Trip Time)
패킷이 소스에서 목적지까지 이동하고 다시 돌아오는 시간입니다. 장치 간 네트워크 대기 시간을 측정하는 데 사용됩니다.

### TWAMP (Two-Way Active Measurement Protocol)
대기 시간 및 패킷 손실과 같은 네트워크 성능 지표를 측정하기 위한 프로토콜입니다. [Telemetry Agent](#telemetry-agent)는 TWAMP를 사용하여 DZD 간의 지표를 수집합니다.

### IS-IS (Intermediate System to Intermediate System)
DoubleZero 네트워크에서 내부적으로 사용되는 링크 상태 라우팅 프로토콜입니다. IS-IS 지표는 [링크 드레인](#soft-drained) 작업 중에 조정됩니다.

---

## 블록체인 및 키

### 온체인 (Onchain)
DoubleZero 맥락에서 온체인은 DoubleZero 레저에 기록된 데이터와 작업을 의미합니다. 장치 및 링크 구성이 중앙화된 관리 시스템에 있는 기존 네트워크와 달리 DoubleZero는 장치 등록, 링크 구성 및 텔레메트리 제출을 온체인으로 기록하여 모든 참여자가 네트워크 상태를 투명하고 검증 가능하게 합니다.

### 서비스 키 (Service Key)
CLI 작업을 인증하는 데 사용되는 암호화 키쌍입니다. DoubleZero 스마트 계약과 상호작용하기 위한 기여자 아이덴티티입니다. `~/.config/solana/id.json`에 저장됩니다.

### 메트릭스 발행자 키 (Metrics Publisher Key)
블록체인에 지표 제출을 서명하기 위해 [Telemetry Agent](#telemetry-agent)가 사용하는 암호화 키쌍입니다. 보안 격리를 위해 서비스 키와 별도입니다. `~/.config/doublezero/metrics-publisher.json`에 저장됩니다.

---

## 하드웨어 및 소프트웨어

### EOS (Extensible Operating System)
DZD 스위치에서 실행되는 Arista의 네트워크 운영 체제입니다. 기여자는 [Config Agent](#config-agent) 및 [Telemetry Agent](#telemetry-agent)를 EOS 확장으로 설치합니다.

### EOS 확장
Arista EOS 스위치에 설치할 수 있는 소프트웨어 패키지입니다. DZ 에이전트는 `.rpm` 파일로 배포되며 `extension` 명령을 통해 설치됩니다.
