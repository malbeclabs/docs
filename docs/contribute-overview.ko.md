# 기여자 문서
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


!!! info "용어"
    DoubleZero가 처음이신가요? [DZD](glossary.md#dzd-doublezero-device), [DZX](glossary.md#dzx-doublezero-exchange), [CYOA](glossary.md#cyoa-choose-your-own-adventure)와 같은 핵심 용어의 정의는 [용어집](glossary.md)을 참조하세요.

DoubleZero 기여자 문서에 오신 것을 환영합니다. 이 섹션에서는 네트워크 기여자가 되기 위해 필요한 모든 것을 다룹니다.

!!! tip "네트워크 기여자가 되고 싶으신가요?"
    DoubleZero 네트워크에 기여하는 데 필요한 하드웨어, 대역폭 및 연결성을 이해하려면 [요구사항 및 아키텍처](contribute.md) 페이지를 검토하세요.

---

## 온보딩 체크리스트

이 체크리스트를 사용하여 진행 상황을 추적하세요. **기여가 기술적으로 운영되기 전에 모든 항목을 완료해야 합니다.**

### 단계 1: 사전 요구사항
- [ ] 관리 서버에 DoubleZero CLI 설치
- [ ] 하드웨어 구매 및 [요구사항](contribute.md#hardware-requirements) 충족
- [ ] 데이터 센터 랙 공간 및 전원 사용 가능 (4U, 4KW 권장)
- [ ] DZD 물리적 설치 및 관리 연결 완료
- [ ] DZ 프로토콜을 위한 공개 IPv4 블록 할당 (**[DZ 프리픽스 규칙](#dz-prefix-rules) 참조**)

### 단계 2: 계정 설정
- [ ] 서비스 키쌍 생성 (`doublezero keygen`)
- [ ] 메트릭스 발행자 키쌍 생성
- [ ] 인증을 위해 DZF에 서비스 키 제출
- [ ] 온체인 기여자 계정 생성 (`doublezero contributor list`로 확인)
- [ ] [malbeclabs/contributors](https://github.com/malbeclabs/contributors) 저장소 접근 권한 부여

### 단계 3: 장치 프로비저닝
- [ ] 장치에 기본 구성 적용 (기여자 저장소에서)
- [ ] 온체인 장치 생성 (`doublezero device create`)
- [ ] 장치 인터페이스 등록
- [ ] 루프백 인터페이스 생성 (Loopback255 vpnv4, Loopback256 ipv4)
- [ ] CYOA/DIA 인터페이스 구성 (엣지/하이브리드 장치인 경우)

### 단계 4: 링크 설정 및 에이전트 설치
- [ ] WAN 링크 생성 (해당하는 경우)
- [ ] DZX 링크 생성 (상태: `requested`)
- [ ] 상대방 기여자가 DZX 링크 수락
- [ ] Config Agent 설치 및 실행
- [ ] Config Agent가 컨트롤러에서 구성 수신
- [ ] Telemetry Agent 설치 및 실행
- [ ] 메트릭스 발행자 온체인 등록
- [ ] 레저에서 텔레메트리 제출 확인

### 단계 5: 링크 번인
- [ ] 24시간 번인 기간 동안 모든 링크 드레인 상태 유지
- [ ] [metrics.doublezero.xyz](https://metrics.doublezero.xyz)에서 24시간 동안 손실 및 오류 0 확인
- [ ] 클린 번인 완료 후 링크 드레인 해제

### 단계 6: 검증 및 활성화
- [ ] `doublezero device list`에서 장치 확인 (`max_users = 0` 상태)
- [ ] `doublezero link list`에서 링크 확인
- [ ] Config Agent 로그에서 성공적인 구성 가져오기 확인
- [ ] Telemetry Agent 로그에서 성공적인 메트릭스 제출 확인
- [ ] **DZ/Malbec Labs와 조율**하여 연결 테스트 실행 (연결, 경로 수신, DZ를 통한 라우팅)
- [ ] 테스트 통과 후 `doublezero device update`를 통해 `max_users`를 96으로 설정

---

## 도움 받기

온보딩의 일환으로 DZF가 기여자 Slack 채널에 추가해 드립니다:

| 채널 | 목적 |
|---------|---------|
| **#dz-contributor-announcements** | DZF 및 Malbec Labs의 공식 커뮤니케이션 — CLI/에이전트 업데이트, 주요 변경 사항, 보안 공지. 중요 업데이트 모니터링. 스레드에서 질문 가능. |
| **#dz-contributor-incidents** | 서비스에 영향을 미치는 계획되지 않은 이벤트. 인시던트는 심각도 및 영향받는 장치/링크와 함께 API/웹 양식을 통해 자동으로 게시됩니다. 스레드에서 토론 및 문제 해결. |
| **#dz-contributor-maintenance** | 계획된 유지보수 활동 (업그레이드, 수리). API/웹 양식을 통해 예상 시작/종료 시간과 함께 예약됩니다. 스레드에서 토론. |
| **#dz-contributor-ops** | 모든 기여자를 위한 공개 토론 — 운영 질문, CLI 도움, 런북 및 플레이북 공유. |

귀하의 조직을 위한 직접 지원을 위한 **DZ/Malbec Labs 전용 채널**도 받게 됩니다.

---

## DZ 프리픽스 규칙

!!! warning "중요: DZ 프리픽스 풀 사용"
    제공하는 DZ 프리픽스 풀은 **IP 할당을 위해 DoubleZero 프로토콜이 관리**합니다.

    **DZ 프리픽스가 사용되는 방식:**

    - **첫 번째 IP**: 장치용으로 예약됨 (Loopback100 인터페이스에 할당)
    - **나머지 IP**: DZD에 연결하는 특정 유형의 사용자에게 할당:
        - `IBRLWithAllocatedIP` 사용자
        - `EdgeFiltering` 사용자
        - 멀티캐스트 발행자
    - **IBRL 사용자**: 이 풀을 소비하지 않음 (자신의 공개 IP 사용)

    **다음 용도로 사용할 수 없습니다:**

    - 자신의 네트워크 장비
    - DIA 인터페이스의 지점간 링크
    - 관리 인터페이스
    - DZ 프로토콜 외부의 모든 인프라

    **요구사항:**

    - 전 세계적으로 라우팅 가능한(공개) IPv4 주소여야 합니다
    - 사설 IP 범위(10.x, 172.16-31.x, 192.168.x)는 스마트 계약에서 거부됩니다
    - **최소 크기: /29** (8개 주소), 더 큰 프리픽스 권장 (예: /28, /27)
    - 전체 블록이 사용 가능해야 합니다 — 어떤 주소도 사전 할당하지 마세요

    자신의 장비(DIA 인터페이스 IP, 관리 등)를 위한 주소가 필요한 경우 **별도의 주소 풀**을 사용하세요.

---

## 빠른 참조: 핵심 용어

DoubleZero가 처음이신가요? 필수 용어는 다음과 같습니다([전체 용어집](glossary.md) 참조):

| 용어 | 정의 |
|------|------------|
| **DZD** | DoubleZero Device — DZ 에이전트를 실행하는 물리적 Arista 스위치 |
| **DZX** | DoubleZero Exchange — 기여자들이 서로 연결하는 도시 상호 연결 지점 |
| **CYOA** | Choose Your Own Adventure — 사용자 연결 방법 (GREOverDIA, GREOverFabric 등) |
| **DIA** | Direct Internet Access — 모든 DZD가 컨트롤러 및 텔레메트리를 위해 필요한 인터넷 연결, 엣지/하이브리드 장치의 사용자 연결을 위한 CYOA 유형으로도 일반적으로 사용 |
| **WAN 링크** | 자신의 DZD 간 링크 (동일 기여자) |
| **DZX 링크** | 다른 기여자의 DZD에 대한 링크 (상호 수락 필요) |
| **Config Agent** | 컨트롤러에 쿼리하고 DZD에 구성 적용 |
| **Telemetry Agent** | TWAMP 대기 시간/손실 메트릭스 수집, 온체인 레저에 제출 |
| **서비스 키** | CLI 작업을 위한 기여자 ID 키 |
| **메트릭스 발행자 키** | 온체인 텔레메트리 제출 서명을 위한 키 |

---

---

## 문서 구조

| 가이드 | 설명 |
|-------|-------------|
| [요구사항 및 아키텍처](contribute.md) | 하드웨어 사양, 네트워크 아키텍처, 대역폭 옵션 |
| [장치 프로비저닝](contribute-provisioning.md) | 단계별: 키 → 저장소 접근 → 장치 → 링크 → 에이전트 |
| [운영](contribute-operations.md) | 에이전트 업데이트, 링크 관리, 모니터링 |
| [용어집](glossary.md) | 모든 DoubleZero 용어 정의 |

---

## 비네트워크 엔지니어를 위한 네트워킹 개념

네트워크 엔지니어링 경험이 없으시다면 이 문서에 사용된 개념에 대한 소개가 있습니다:

### IP 주소 지정

- **IPv4 주소**: 네트워크의 장치에 대한 고유 식별자 (예: `192.168.1.1`)
- **CIDR 표기법** (`/29`, `/24`): 서브넷 크기를 나타냅니다. `/29` = 8개 주소, `/24` = 256개 주소
- **공개 IP**: 인터넷에서 라우팅 가능; **사설 IP**: 내부 네트워크 전용 (10.x, 172.16-31.x, 192.168.x)

### 네트워크 계층

- **계층 1 (물리)**: 케이블, 광학, 파장
- **계층 2 (데이터 링크)**: 스위치, VLAN, MAC 주소
- **계층 3 (네트워크)**: 라우터, IP 주소, 라우팅 프로토콜

### 일반 용어

- **MTU**: 최대 전송 단위 — 최대 패킷 크기 (WAN 링크의 경우 일반적으로 9000바이트)
- **VLAN**: 가상 LAN — 공유 인프라에서 트래픽을 논리적으로 분리
- **VRF**: 가상 라우팅 및 포워딩 — 동일한 장치에서 라우팅 테이블을 격리
- **BGP**: 경계 게이트웨이 프로토콜 — 네트워크 간 경로 교환
- **GRE**: 일반 라우팅 캡슐화 — 오버레이 네트워크를 위한 터널링 프로토콜
- **TWAMP**: 양방향 능동 측정 프로토콜 — 장치 간 대기 시간/손실 측정

### DoubleZero 전용

- **온체인**: DoubleZero에서 장치 등록, 링크 구성 및 텔레메트리는 DoubleZero 레저에 기록되어 네트워크 상태를 모든 참여자가 투명하고 검증 가능하게 합니다
- **컨트롤러**: DoubleZero 레저의 온체인 상태에서 DZD 구성을 도출하는 서비스

---

준비가 되셨나요? [요구사항 및 아키텍처](contribute.md)부터 시작하세요.
