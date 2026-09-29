---
description: 에지 구독자를 설정하여 DoubleZero 슈레드 피드를 수신합니다. 클라이언트 설정 및 GRE, BGP, PIM, 슈레드 트래픽을 위한 방화벽 규칙을 포함합니다.
---

# 에지 구독자 연결
!!! warning "DoubleZero에 연결함으로써 [DoubleZero 이용 약관](https://doublezero.xyz/terms-protocol)에 동의합니다. 해당 데이터는 내부 용도로만 사용 가능하며 재전송할 수 없습니다 (섹션 2(e) 참조)."

!!! warning "이미 CLI 구독을 사용하고 계신가요?"
    **CLI**(`doublezero-solana shreds pay` / 에스크로 시트)를 통해 구독하신 경우, 해당 명령어는 [CLI 구독 페이지](Edge Subscriber CLI.md)를 참조하세요. 해당 시스템은 **2026년 8월 30일에 폐지**됩니다. 신규 구독은 이 페이지를 따릅니다.

## 1단계: DoubleZero 설정

### 설정 완료

[Solana CLI](https://docs.anza.xyz/cli/install)를 설치합니다.

[설정](setup.md) 안내에 따라 DoubleZero 클라이언트를 설치하고 구성합니다.

이전에 DoubleZero를 설정한 적이 있다면, `sudo apt update && sudo apt install doublezero-solana` 명령어로 최신 Doublezero-Solana CLI를 사용하고 있는지 확인하세요.

### 방화벽 구성

GRE, BGP, PIM 및 슈레드 트래픽을 허용합니다.

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

UFW에는 `pim` 프로토콜이 없습니다. 아웃바운드 PIM은 UFW의 기본 아웃고잉 정책에 의해 허용됩니다. 아웃고잉 트래픽을 차단하는 경우, `/etc/ufw/before.rules`에 PIM을 위한 raw 규칙을 추가하세요.

---

## 2단계: 메트로 선택

슈레드를 수신할 머신에서 가장 낮은 지연 시간의 위치를 확인합니다:

```bash
doublezero latency
```

가장 낮은 지연 시간 결과에서 메트로/도시를 기록합니다. 신청 양식에서 해당 도시를 선택하게 됩니다. 메트로가 어떻게 그룹화되는지 [토폴로지 맵](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth)을 참조하세요.

### 가격

시트는 선택한 메트로에서 머신당 **월별**로 청구됩니다:

| 메트로 | 가격 |
|--------|-------|
| 프랑크푸르트, 암스테르담 | $1,500 / 월 |
| 런던, 뉴욕, 싱가포르, 도쿄 | $900 / 월 |
| 기타 모든 위치 | $450 / 월 |

---

## 3단계: 요청 제출

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)로 이동합니다.
2. **Solana Shreds**를 선택합니다.
3. 필요한 **도시**(메트로)를 선택합니다. 위의 표와 `doublezero latency`를 사용하여 선택하세요.
4. 신청 양식을 완료합니다.

[계정](https://doublezero.xyz/shreds/account) 페이지에서 각 피드 요청에 DoubleZero ID(기존 키 또는 새 키 생성)를 할당합니다. 일치하는 **개인 키는 슈레드를 수신할 머신에 존재해야** 합니다 — 해당 호스트로 이동할 수 없는 공개 키를 할당하지 마세요.

**메트로**와 **공개 키**를 선택합니다. 신청 시점에 공용 IP를 바인딩하지 **않습니다**. 구독 기간 동안 **선택한 메트로 내에서** IP 간 접근을 이동할 수 있습니다.

적시에 추가 안내를 받게 됩니다 (**영업일 기준 1-3일** 예상).

---

## 4단계: 승인 후 연결

신청서를 제출하면 인보이스를 받게 됩니다. 결제가 완료되면 승인된 각 머신에서 연결합니다. 접근은 선택한 시작 날짜에 활성화됩니다.

```bash
doublezero connect multicast --subscribe-feed solana-shreds-full
```

터널을 확인합니다:

```bash
doublezero status
```

올바른 DoubleZero 네트워크에서 `BGP Session Up`이 표시되어야 합니다.

---

## 청구

시트는 **월별**로 청구됩니다. 시트 만료 날짜를 확인하세요.

시트가 만료되기 전에 인보이스를 결제해야 합니다. **미결제 시 시트가 제거됩니다.**

---

## 슈레드 주소 (IP 및 포트)

리더 슈레드와 고스테이크 재전송 슈레드는 `doublezero1` 인터페이스를 통해 포트 `7733`으로 도착합니다. `doublezero0` 인터페이스는 유니캐스트 트래픽용입니다. 포트 `5765`는 슈레드 퍼블리셔의 하트비트 모니터로, 슈레드를 포함하지 않습니다.

슈레드 수신에서 **IP 주소**는 멀티캐스트 스트림을 식별하고 **포트**는 해당 스트림의 UDP 서비스를 식별합니다.  
아래의 모든 슈레드 스트림은 `doublezero1`에서 UDP 포트 `7733`을 사용합니다.

다음 명령어로 멀티캐스트 그룹의 IP를 확인할 수 있습니다:

```bash
doublezero multicast group list
```

### 리더 슈레드

- `edge-solana-shreds`: `233.84.178.1:7733`

### 루트 슈레드

- `edge-solana-root`: `233.84.178.16:7733`

### 재전송 슈레드

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## GRE 터널 헤더 — XDP

!!! note "네트워크를 통해 전달되는 슈레드 트래픽은 GRE로 캡슐화됩니다. 기존 파이프라인(예: XDP 기반 디슈레더)에 데이터를 공급하기 전에 GRE 헤더를 제거해야 할 수 있습니다."

---

## 도구 및 대시보드

### [에지 스코어보드](https://data.doublezero.xyz/dz/shreds/scoreboard)

스코어보드는 슬롯 수준 데이터를 사용하여 DoubleZero Edge 및 기타 제공업체 간의 슈레드 전달 속도를 벤치마크하고 실시간으로 성능을 비교합니다. 이 대시보드를 사용하여 다른 제공업체 대비 Edge 슈레드 승률을 확인할 수 있습니다. 리더 슈레드만의 결과뿐만 아니라 전체 피드 비교도 볼 수 있습니다. 또한 지역별로 드릴다운하여 예상 성능을 확인할 수 있습니다.

### [에지 퍼블리셔](https://data.doublezero.xyz/dz/shreds/publishers)

대시보드 왼쪽 상단의 "Publishing Shreds" 메트릭은 DoubleZero Edge에서 리더 슈레드를 발행하는 모든 Solana 검증자의 총 스테이크 가중치 비율을 보여줍니다. 네트워크의 각 퍼블리셔에 대한 세부 정보를 확인할 수 있습니다.

### [에지 구독자, 디바이스 및 활동](https://data.doublezero.xyz/dz/shreds/subscribers)

이 페이지에서 클라이언트 IP를 검색하여 구독된 시트 및 상태를 확인할 수 있습니다. [디바이스](https://data.doublezero.xyz/dz/shreds/devices) 페이지에서 사용 가능한 디바이스를 확인하고, [활동](https://data.doublezero.xyz/dz/shreds/activity) 페이지에서 모든 최근 활동을 확인할 수 있습니다.

### Data API 문서

프로그래밍 방식으로 데이터 엔드포인트에 접근하려면 API 문서를 참조하세요: [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

---

## 문제 해결

여기에서 다루지 않은 문제가 발생하면, 직접 해결하기 전에 기존 채널을 통해 문의하세요. 채널이 없는 경우, [Discord](https://discord.gg/U2fEb4Jq)에서 검색하고 필요시 티켓을 열어주세요.

### 클라이언트가 최신 버전인지 확인하세요:

실행: `sudo apt update && sudo apt install doublezero-solana`

### 터널이 올라오지 않는 경우

1. 데몬이 실행 중인지 확인: `sudo systemctl status doublezerod`
2. 방화벽 규칙이 적용되어 있는지 확인 (GRE, BGP, PIM, `doublezero1`의 슈레드 트래픽, `doublezero0`의 포트 44880)
3. 해당 시트의 인보이스가 결제되었고 시작 날짜가 지났는지 확인
4. 할당된 개인 키가 있는 머신에서 `doublezero connect multicast --subscribe-feed solana-shreds-full` 실행
5. 연결 상태 확인: `doublezero status`

계정 페이지에서 사용한 DoubleZero ID는 이 호스트의 키와 일치해야 합니다.

### 시트 만료 또는 제거

시트는 월별입니다. 만료 전에 인보이스가 결제되지 않으면 시트가 제거되고 터널이 유지되지 않습니다.

### "Multicast user already exists"

다른 경로를 통한 활성 구독이 이미 있습니다. 먼저 `doublezero disconnect`로 연결을 해제한 다음 `doublezero connect multicast --subscribe-feed solana-shreds-full`을 다시 시도하세요.