---
description: DoubleZero Edge에서 Kalshi 시장 데이터 수신 — Edge Connect 또는 네이티브 멀티캐스트.
---

# Kalshi Edge 구독자 연결

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol)에 동의합니다. 데이터는 내부 용도로만 사용할 수 있으며 재전송할 수 없습니다(섹션 2(e) 참조)."

Kalshi 피드는 DoubleZero Edge 네트워크를 통해 무기한 선물(perps) 및 스포츠 시장 데이터를 UDP 멀티캐스트로 전달합니다. 네 가지 피드가 있습니다:

- 무기한 선물 최우선 호가(TOB)
- 무기한 선물 가격별 시장 심도(MBP)
- 스포츠 최우선 호가(TOB)
- 스포츠 가격별 시장 심도(MBP)

## 어떤 경로를 선택해야 하나요?

두 가지 경로가 있습니다. 디코더를 직접 소유해야 하는 경우가 아니라면 Edge Connect를 권장합니다.

| # | 경로 | 적합한 대상 | 난이도 |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | 간단한 CLI와 정규화된 JSON WebSocket을 원하는 에이전트 및 앱 | 가장 쉬움 |
| **2** | [네이티브 멀티캐스트](#2-native-multicast-advanced) | 원시 와이어 포맷에 대해 자체 디코더를 구축하는 경우 | 가장 어려움 |

어떤 경로든 시작하기 전에: [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)에서 필요한 피드를 구매하세요. 구매함으로써 [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol) 및 [Kalshi 서비스 약관](https://doublezero.xyz/dz-edge-kalshi-terms)에 동의하게 됩니다.

AI가 설치를 도와주기를 원하시나요? [DoubleZero MCP](mcp.md)를 연결하고 Kalshi / Edge Connect 과정을 안내해 달라고 요청하세요.

---

## 1. Edge Connect (권장)

**여기서 시작하세요.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect)는 에이전트 친화적인 경로입니다: 설치 명령어 하나로 호스트가 DoubleZero에 참여하고, 바이너리 멀티캐스트를 디코딩하는 대신 앱에서 **WebSocket을 통한 정규화된 JSON** (`ws://<host>:8081`)을 소비합니다.

팀은 확장되는 사용자 기반의 요구사항을 충족하도록 Edge Connect를 지속적으로 발전시키고 있습니다. 이것이 가장 쉬운 연결 방법이며, 특별한 기술적 요구사항이 없는 한 이 방법을 사용해야 합니다.

간단한 버전:

```bash
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

`DZ_SECRET`은 `DZ_…` 액세스 토큰 **또는** 액세스 패스 / 피드 구매를 소유한 Solana 키페어 JSON 파일의 경로입니다.

그런 다음 `doublezero status`를 확인하고(`BGP Session Up`과 Kalshi 그룹이 표시되어야 합니다) WebSocket 클라이언트를 `:8081`에 연결하세요.

**전체 단계, 검증 및 주의사항:** [DoubleZero MCP](mcp.md)를 연결하고 Kalshi용 Edge Connect 과정을 안내해 달라고 요청하세요.  
**WebSocket 프로토콜:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. 네이티브 멀티캐스트 (고급)

!!! warning "깊은 기술 지식 필요"
    네이티브 멀티캐스트는 직접 그룹에 참여하고 호스트에서 **원시** Edge 와이어 포맷을 디코딩하는 것을 의미합니다. 가장 기술적으로 숙련된 사용자만 이 경로를 선택해야 합니다. [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md)와 [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)의 나머지 부분을 시작으로 스펙을 읽고 이해해야 합니다. 디코더를 반드시 직접 소유해야 하는 요구사항이 없다면 [Edge Connect](#1-edge-connect-recommended)를 권장합니다.

### 피드 구매

<div data-wizard-step="kalshi-buy-feed" markdown>

구매하기 전에 가장 낮은 지연 시간의 장치를 확인하세요:

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)에서 구매하세요.

</div>

### DoubleZero 클라이언트 설정

[설정](setup.md) 가이드를 따라 DoubleZero 클라이언트를 설치하고 구성하세요. 클라이언트를 최신 상태로 유지하세요:

```bash
sudo apt update && sudo apt install doublezero
```

### 방화벽 구성

GRE, BGP, PIM 및 Kalshi 피드 트래픽을 허용하세요. Kalshi UDP 포트는 `30000`–`59999` 범위에 있습니다: 첫 번째 자릿수는 트래픽 클래스(`3` 시장 데이터, `4` 레퍼런스 데이터, `5` 스냅샷)이고 두 번째 자릿수는 피드이므로, 레퍼런스는 항상 시장 + `10000`이고 스냅샷은 항상 시장 + `20000`입니다. `doublezero1`에서 전체 대역을 열어 새로운 채널과 피드가 추가 방화벽 변경을 필요로 하지 않도록 하세요 — [피드 주소](#feed-addresses)를 참조하세요.

<div data-wizard-step="kalshi-firewall-iptables" markdown>

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi market / reference / snapshot (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```

</div>

<div data-wizard-step="kalshi-firewall-ufw" markdown>

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Kalshi market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

</div>

### 구독

<div data-wizard-step="kalshi-subscribe" markdown>

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob
```

여러 피드는 공백으로 구분합니다:

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob edge-kalshi-perps-mbp edge-kalshi-sports-tob edge-kalshi-sports-mbp
```

프로비저닝 출력 예시:

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <your dz_id>
🔍  Provisioning User for IP: <your public ip>
    The Device has been selected: <the doublezero device you are connecting to>
    Service provisioned with status: ok
✅  User Provisioned
```

약 60초 정도 기다린 후:

```bash
doublezero status
```

올바른 DoubleZero 네트워크에서 `BGP Session Up`이 표시되어야 합니다. 구독자로서 DoubleZero IP는 Tunnel Src IP와 일치합니다.

```bash
doublezero user list --client-ip <your ip>
```

`groups` 열에 피드가 표시됩니다. 그룹 IP를 확인하려면:

```bash
doublezero multicast group list
```

</div>

### 와이어 포맷 직접 디코딩

스키마 버전은 **`3`**입니다 — 디코더가 구현하지 않은 버전의 프레임은 폐기하세요. 공식 레이아웃: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) 포함.

모든 데이터그램은 프레임 헤더로 시작하며, 그 뒤에 MTU까지 패킹된 하나 이상의 애플리케이션 메시지가 따릅니다. 프레임은 리틀 엔디안이며 고정 레이아웃입니다.

| 필드 | 설명 |
|-------|-------|
| 스키마 버전 | `3` |
| 채널 ID | 포트를 공유하는 스트림을 역다중화 |
| 시퀀스 | 채널별 단조 증가 — 갭 탐지에 사용 |
| 전송 타임스탬프 | Unix 에포크 이후 나노초 |
| 메시지 수 | 이 프레임에 패킹된 메시지 수 |
| 리셋 카운트 | 세션마다 증가. 증가하면 상태를 콜드 스타트하세요. |
| 프레임 길이 | 총 바이트 수 |

#### 애플리케이션 메시지 (TOB)

| 유형 | ID | 크기 | 포트 | 내용 |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | 시장이 조용한 동안의 생존 신호 |
| InstrumentDefinition | `0x02` | 130 B | reference | 심볼, 지수, 틱 및 랏, 만기 |
| Quote | `0x03` | 60 B | market | 최우선 매수/매도, 가격과 수량, 업데이트 플래그 |
| Trade | `0x04` | 52 B | market | 가격, 수량, 공격자 방향, 거래 ID |
| ChannelReset | `0x05` | 12 B | both | 세션 시작 또는 재시작 |
| EndOfSession | `0x06` | 12 B | both | 정상 종료 |
| ManifestSummary | `0x07` | 24 B | reference | 활성 세트 핑거프린트 및 종목 수 |
| PerpStats | `0x30` | 124 B | sibling | 펀딩, 마크 및 오라클 가격, 미결제 약정, 일일 거래량 |

edge-feed-spec 레지스트리에서 Kalshi의 소스 ID는 `3`입니다. 각 `InstrumentDefinition`에서 `price_exponent`와 `qty_exponent`를 읽으세요 — 하드코딩하지 마세요.

MBP 피드는 market-by-price 메시지 세트를 사용합니다. edge-feed-spec의 market-by-price 및 reference-data 스펙을 참조하세요.

전달은 재전송 없는 fire-and-forget UDP입니다. 누락된 데이터그램은 한 번만이 아닌 주기적으로 재전송되는 reference-data 사이클(및 MBP 피드의 스냅샷 플레인)에서 복구하세요.

---

## 피드 주소

| 피드 | 설명 | 멀티캐스트 그룹 | 시장 데이터 | 레퍼런스 데이터 | 스냅샷 |
|------|-------------|-----------------|-------------|----------------|----------|
| `edge-kalshi-perps-tob` | 무기한 선물 최우선 호가 | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | 무기한 선물 가격별 시장 심도 | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | 스포츠 최우선 호가 | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `edge-kalshi-sports-mbp` | 스포츠 가격별 시장 심도 | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

포트 체계: 첫 번째 자릿수는 트래픽 클래스(`3` 시장, `4` 레퍼런스, `5` 스냅샷)이고 두 번째 자릿수는 피드입니다. 레퍼런스는 시장 + `10000`이고 스냅샷은 시장 + `20000`입니다. 무기한 선물 포트는 고정입니다. 스포츠 포트는 `base + channel id`입니다(예: `edge-kalshi-sports-mbp`의 id `10`은 `34010` / `44010` / `54010`을 사용합니다).

그룹은 피드를 선택하고, 포트는 그 안에서 시장 데이터, 레퍼런스 데이터 또는 스냅샷을 선택합니다. 멀티캐스트 복제는 소스와 그룹 단위로 이루어지며, 패브릭은 UDP 포트를 검사하지 않으므로, 그룹에 참여하면 Edge Connect 링크를 통해 해당 그룹의 모든 것이 전달됩니다. 포트는 바이트가 도착한 후 호스트에서 적용되는 소켓 필터입니다.

---

## 문제 해결

여기에서 다루지 않는 문제가 발생하면, 해결 방법을 직접 찾기 전에 기존 채널을 통해 문의해 주세요. 채널이 없는 경우 [지원](support.md)을 참조하세요.

### 클라이언트가 최신 버전인지 확인

실행: `sudo apt update && sudo apt install doublezero`

### 데이터그램이 도착하지 않음

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)에서 피드를 구매했는지 확인하세요. 구매하지 않은 피드는 트래픽을 전달하지 않습니다.
2. BGP가 활성 상태인지 확인하세요: `doublezero status`에서 올바른 DoubleZero 네트워크에 `BGP Session Up`이 표시되어야 합니다.
3. 구독이 활성 상태인지 확인하세요: `doublezero user list --client-ip <your ip>`에서 `groups` 아래에 피드가 나열되어야 합니다.
4. 올바른 인터페이스에서 그룹에 참여했는지 확인하세요. 멀티캐스트는 `doublezero0`이 아닌 `doublezero1`에 도착합니다.
5. 방화벽이 `doublezero1`에서 피드의 UDP 포트 인바운드를 허용하는지 확인하세요.

### 시퀀스 갭

시퀀스는 채널별로 단조 증가합니다. 갭은 데이터그램이 누락되었음을 의미하며, 다음 reference-data 사이클이 종목 상태를 복원합니다.

### 프레임이 중단된 후 새로운 리셋 카운트로 재시작됨

퍼블리셔 재시작은 프레임 헤더의 리셋 카운트를 증가시킵니다. 이전 세션의 상태를 폐기하고 다음 reference-data 사이클에서 콜드 스타트하세요.

### 터널이 올라오지 않음

1. 데몬이 실행 중인지 확인하세요: `sudo systemctl status doublezerod` (네이티브 경로) 또는 Edge Connect 컨테이너가 실행 중인지 확인
2. 방화벽 규칙이 설정되어 있는지 확인하세요 (GRE, BGP, PIM, 및 `doublezero1`의 피드 포트)
3. 연결 상태를 확인하세요: `doublezero status` — 올바른 DoubleZero 네트워크에서 `BGP Session Up`이 표시되어야 합니다

클라이언트 IP는 호스트의 공개 IP에서 자동 감지됩니다. 피드 구매 시 사용한 IP와 일치하는지 확인하세요.

---

## 리서치 레퍼런스 디자인

선택 사항입니다. 호스트에 이미 DoubleZero 터널과 구독이 있고 피드 데이터를 **기록하고 차트로 표시**하려는 경우, 리서치 레퍼런스 디자인은 멀티캐스트 → 파서 → topofbook-bot → ClickHouse → Grafana를 Docker Compose로 실행합니다:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

`.env`를 Kalshi 그룹과 포트로 지정한 후([피드 주소](#feed-addresses) 참조):

```bash
cd demo
cp .env.example .env
# set DZ_MULTICAST_GROUP, DZ_MARKETDATA_PORT, DZ_REFDATA_PORT, DZ_INTERFACE=doublezero1
docker compose up -d --build
```

Grafana는 일반적으로 호스트의 `http://localhost:3000`에서 접근할 수 있습니다. 세부 사항과 대시보드: [demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

이것은 이미 수신 중인 데이터를 시각화합니다. 피드 구매, 구독 또는 위의 연결 경로를 대체하지 않습니다.