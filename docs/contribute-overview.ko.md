---
description: DoubleZero 네트워크 기여자가 되기 위한 개요 및 온보딩 체크리스트.
---

# 기여자 문서

!!! info "용어"
    DoubleZero가 처음이신가요? [용어집](glossary.md)에서 [DZD](glossary.md#dzd-doublezero-device), [DZX](glossary.md#dzx-doublezero-exchange), [CYOA](glossary.md#cyoa-choose-your-own-adventure) 등 주요 용어의 정의를 확인하세요.

DoubleZero 기여자 문서에 오신 것을 환영합니다. 이 섹션에서는 네트워크 기여자가 되기 위해 필요한 모든 내용을 다룹니다.

!!! tip "네트워크 기여자에 관심이 있으신가요?"
    [요구사항 & 아키텍처](contribute.md) 페이지를 검토하여 DoubleZero 네트워크에 기여하는 데 필요한 하드웨어, 대역폭 및 연결 요건을 이해하세요.

---

## 온보딩 체크리스트

이 체크리스트를 사용하여 진행 상황을 추적하세요. **모든 항목이 완료되어야 기여가 기술적으로 운영 가능합니다.**

### 1단계: 사전 요건
- [ ] 관리 서버에 DoubleZero CLI 설치 완료
- [ ] 하드웨어 조달 및 [요구사항](contribute.md#hardware-requirements) 충족 확인
- [ ] 데이터센터 랙 공간 및 전원 확보 ([랙 & 전원](contribute.md#rack-power-requirements) 참조)
- [ ] DZD 물리적 설치 및 관리 연결 완료
- [ ] DZ 프로토콜용 공인 IPv4 블록 할당 (**[DZ 프리픽스 규칙](#dz-프리픽스-규칙) 참조**)

### 2단계: 계정 설정

이 단계는 기여자와 DZF 간에 번갈아 진행됩니다. 각 **DZF** 항목은 다음 그룹을 시작하기 전에 확인되어야 합니다.

**기여자**

- [ ] GitHub 사용자명을 DZF에 전송

**DZF**

- [ ] [malbeclabs/contributors](https://github.com/malbeclabs/contributors) 리포지토리 접근 권한 부여

**기여자**

- [ ] 서비스 키페어 생성 (`doublezero keygen`)
- [ ] 메트릭 퍼블리셔 키페어 생성
- [ ] 서비스 키 **공개키**를 DZF에 전송

**DZF**

- [ ] 온체인에 기여자 계정 생성

**기여자**

- [ ] 기여자 계정 확인 (`doublezero contributor list`)
- [ ] 보상 관리 설정 (라이브 전환을 차단하지 않음, **기여자 리포지토리의 [보상 관리](https://github.com/malbeclabs/contributors#rewards-management) 참조**)

### 3단계: 디바이스 프로비저닝
- [ ] 기본 디바이스 구성 적용 (기여자 리포지토리에서)
- [ ] 온체인에 디바이스 생성 (`doublezero device create`)
- [ ] 디바이스 인터페이스 등록
- [ ] 루프백 인터페이스 생성 (Loopback255 vpnv4, Loopback256 ipv4)
- [ ] CYOA/DIA 인터페이스 구성 (엣지/하이브리드 디바이스인 경우)

### 4단계: 링크 수립 & 에이전트 설치
- [ ] WAN 링크 생성 (해당하는 경우)
- [ ] DZX 링크 생성 (상태: `requested`)
- [ ] 피어 기여자에 의해 DZX 링크 수락
- [ ] Config Agent 설치 및 실행
- [ ] Config Agent가 컨트롤러로부터 구성 수신
- [ ] Telemetry Agent 설치 및 실행
- [ ] 온체인에 메트릭 퍼블리셔 등록
- [ ] 원장에서 텔레메트리 제출 확인 가능

### 5단계: 링크 번인
- [ ] 24시간 번인 기간 동안 모든 링크 드레인
- [ ] [링크 상태 대시보드](https://data.doublezero.xyz/status/links)에서 24시간 동안 손실 제로 및 오류 제로 확인
- [ ] 정상 번인 후 링크 드레인 해제

### 6단계: 검증 & 활성화
- [ ] `doublezero device list`에 디바이스 표시 확인 (`max_users = 0`)
- [ ] `doublezero link list`에 링크 표시 확인
- [ ] Config Agent 로그에서 구성 풀 성공 확인
- [ ] Telemetry Agent 로그에서 메트릭 제출 성공 확인
- [ ] **DZ/Malbec Labs와 협의**하여 연결 테스트 실행 (연결, 라우트 수신, DZ를 통한 라우팅)
- [ ] 테스트 통과 후 `doublezero device update`를 통해 `max_users`를 96으로 설정

---

## 도움 받기

온보딩 과정에서 DZF가 기여자 Slack 채널에 추가해 드립니다:

| 채널 | 목적 |
|---------|---------|
| **#dz-contributor-announcements** | DZF 및 Malbec Labs의 공식 커뮤니케이션 — CLI/에이전트 업그레이드, 호환성 변경사항, 보안 공지. 중요 업데이트를 모니터링하고 스레드에서 질문하세요. |
| **#dz-contributor-incidents** | 계획되지 않은 서비스 영향 이벤트. API/웹 폼을 통해 심각도 및 영향받는 디바이스/링크와 함께 인시던트가 자동으로 게시됩니다. 스레드에서 논의 및 문제 해결이 이루어집니다. |
| **#dz-contributor-maintenance** | 계획된 유지보수 활동 (업그레이드, 수리). API/웹 폼을 통해 계획된 시작/종료 시간으로 예약됩니다. 스레드에서 논의합니다. |
| **#dz-contributor-ops** | 모든 기여자를 위한 개방형 토론 — 운영 질문, CLI 도움, 런북 및 플레이북 공유. |

또한 조직에 대한 직접 지원을 위한 **비공개 DZ/Malbec Labs 채널**이 제공됩니다.

---

## DZ 프리픽스 규칙

!!! warning "중요: DZ 프리픽스 풀 사용"
    제공하신 DZ 프리픽스 풀은 **IP 할당을 위해 DoubleZero 프로토콜에서 관리합니다**.

    **DZ 프리픽스 사용 방법:**

    - **첫 번째 IP**: 디바이스용으로 예약 (Loopback100 인터페이스에 할당)
    - **나머지 IP**: DZD에 연결하는 특정 사용자 유형에 할당:
        - `IBRLWithAllocatedIP` 사용자
        - `EdgeFiltering` 사용자
        - 멀티캐스트 퍼블리셔
    - **IBRL 사용자**: 이 풀에서 소비하지 않음 (자체 공인 IP 사용)

    **다음 용도로 사용할 수 없습니다:**

    - 자체 네트워크 장비
    - DIA 인터페이스의 포인트-투-포인트 링크
    - 관리 인터페이스
    - DZ 프로토콜 외부의 인프라

    **요구사항:**

    - **글로벌 라우팅 가능한 (공인)** IPv4 주소여야 합니다
    - 사설 IP 범위 (10.x, 172.16-31.x, 192.168.x)는 스마트 컨트랙트에서 거부됩니다
    - **최소 크기: /29** (8개 주소), 더 큰 프리픽스 선호 (예: /28, /27)
    - 전체 블록이 사용 가능해야 합니다 - 주소를 사전 할당하지 마세요

    자체 장비용 주소가 필요한 경우 (DIA 인터페이스 IP, 관리 등), **별도의 주소 풀**을 사용하세요.

---

## 빠른 참조: 주요 용어

DoubleZero가 처음이신가요? 필수 용어를 확인하세요 ([전체 용어집](glossary.md) 참조):

| 용어 | 정의 |
|------|------------|
| **DZD** | DoubleZero Device - DZ 에이전트를 실행하는 물리적 Arista 스위치 |
| **DZX** | DoubleZero Exchange - 기여자들이 피어링하는 메트로 상호접속 지점 |
| **CYOA** | Choose Your Own Adventure - 사용자 연결 방식 (GREOverDIA, GREOverFabric 등) |
| **DIA** | Direct Internet Access - 컨트롤러 및 텔레메트리를 위해 모든 DZD에 필요한 인터넷 연결, 엣지/하이브리드 디바이스에서 사용자 연결을 위한 CYOA 유형으로 일반적으로 사용 |
| **WAN Link** | 자체 DZD 간의 링크 (동일 기여자) |
| **DZX Link** | 다른 기여자의 DZD로의 링크 (상호 수락 필요) |
| **Config Agent** | 컨트롤러를 폴링하여 DZD에 구성을 적용 |
| **Telemetry Agent** | TWAMP 지연/손실 메트릭을 수집하여 온체인 원장에 제출 |
| **Service Key** | CLI 운영을 위한 기여자 신원 키 |
| **Metrics Publisher Key** | 온체인 텔레메트리 제출 서명을 위한 키 |
| **Rewards Manager Key** | 보상을 수령할 지갑을 제어하는 키 (기여자 리포지토리 참조) |

---

---

## 문서 구조

| 가이드 | 설명 |
|-------|-------------|
| [요구사항 & 아키텍처](contribute.md) | 하드웨어 사양, 네트워크 아키텍처, 대역폭 옵션 |
| [디바이스 프로비저닝](contribute-provisioning.md) | 단계별: 리포지토리 접근 → 키 → 디바이스 → 링크 → 에이전트 |
| [운영](contribute-operations.md) | 에이전트 업그레이드, 링크 관리, 모니터링 |
| [Geoprobe 배포](contribute-geolocation.md) | 지리적 위치 확인을 위한 geoProbe 에이전트 배포 및 구성 |
| [용어집](glossary.md) | 모든 DoubleZero 용어 정의 |

---

## 비 네트워크 엔지니어를 위한 네트워크 기초

네트워크 엔지니어링 배경이 아닌 분들을 위해 이 문서에서 사용되는 개념에 대한 입문 안내입니다:

### IP 주소 지정

- **IPv4 주소**: 네트워크상의 디바이스를 위한 고유 식별자 (예: `192.168.1.1`)
- **CIDR 표기법** (`/29`, `/24`): 서브넷 크기를 나타냅니다. `/29` = 8개 주소, `/24` = 256개 주소
- **공인 IP**: 인터넷에서 라우팅 가능; **사설 IP**: 내부 네트워크 전용 (10.x, 172.16-31.x, 192.168.x)

### 네트워크 계층

- **계층 1 (물리 계층)**: 케이블, 광학 장치, 파장
- **계층 2 (데이터 링크 계층)**: 스위치, VLAN, MAC 주소
- **계층 3 (네트워크 계층)**: 라우터, IP 주소, 라우팅 프로토콜

### 일반 용어

- **MTU**: Maximum Transmission Unit - 최대 패킷 크기 (WAN 링크의 경우 일반적으로 9000바이트)
- **VLAN**: Virtual LAN - 공유 인프라에서 트래픽을 논리적으로 분리
- **VRF**: Virtual Routing and Forwarding - 동일 디바이스에서 라우팅 테이블을 격리
- **BGP**: Border Gateway Protocol - 네트워크 간 라우트 교환
- **GRE**: Generic Routing Encapsulation - 오버레이 네트워크용 터널링 프로토콜
- **TWAMP**: Two-Way Active Measurement Protocol - 디바이스 간 지연/손실 측정

### DoubleZero 전용 용어

- **온체인**: DoubleZero에서 디바이스 등록, 링크 구성 및 텔레메트리는 DoubleZero 원장에 기록되어 — 네트워크 상태가 모든 참여자에게 투명하고 검증 가능합니다
- **컨트롤러**: DoubleZero 원장의 온체인 상태로부터 DZD 구성을 도출하는 서비스

---

시작할 준비가 되셨나요? [요구사항 & 아키텍처](contribute.md)부터 시작하세요.