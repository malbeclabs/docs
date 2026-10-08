---
description: DoubleZero Edge에서 Binance Spot 및 USD-M 선물 시장 데이터 수신 — Edge Connect 또는 네이티브 멀티캐스트.
---

# Binance Edge 구독자 연결

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol)에 동의합니다. 데이터는 내부 목적으로만 사용해야 하며 재전송할 수 없습니다(섹션 2(e) 참조)."

Binance 피드는 DoubleZero Edge 네트워크를 통해 Binance 최우선 호가 시장 데이터를 UDP 멀티캐스트로 전달합니다. 데이터는 도쿄에서 Binance로부터 수집되어 DoubleZero의 전용 광섬유를 통해 전송되므로, 공용 인터넷보다 더 빨리 다른 메트로에 도달합니다. Binance는 많은 현물 페어의 가격 발견이 이루어지는 곳이므로, 그 데이터는 다른 시장의 선행 지표가 됩니다.

Binance 매칭 엔진별로 하나씩, 두 가지 피드가 있습니다:

| 피드 | 종목 | 호가 타임스탬프 |
|------|-------------|-----------------|
| Binance Spot | 법정화폐 호가 페어를 포함한 모든 거래 중인 현물 페어 | 게이트웨이 전송 시간, µs 정밀도 |
| Binance USD-M | USDT 및 USDC 호가 무기한 계약. 만기 선물 및 TradFi 무기한 계약은 포함되지 않음 | 매칭 엔진 시간, ms 정밀도 |

종목 세트는 Binance 상장을 따릅니다: 페어와 계약은 거래에 진입하고 이탈함에 따라 추가되고 제거됩니다.

## 가격 {#pricing}

피드는 **월 단위**로 청구됩니다:

| 피드 | 가격 |
|------|-------|
| Binance Spot | $100 / 월 |
| Binance USD-M | $100 / 월 |

## 어떤 경로를 선택해야 하나요? {#which-path-should-i-take}

| # | 경로 | 적합한 대상 | 난이도 |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | 간단한 CLI와 WebSocket을 통한 디코딩된 JSON을 원하는 에이전트 및 앱 | 가장 낮음 |
| **2** | [네이티브 멀티캐스트](#2-native-multicast-advanced) | 원시 와이어 포맷에 대해 자체 디코더를 구축하는 경우 | 가장 높음 |

어떤 경로를 선택하든: [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)에서 필요한 피드를 먼저 구매하세요. 구매 시 [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol)에 동의하게 됩니다.

---

## 1. Edge Connect (권장) {#1-edge-connect-recommended}

**여기서 시작하세요.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect)는 에이전트 친화적인 경로입니다: 하나의 설치 명령어로 호스트가 DoubleZero에 참여하고, 앱은 바이너리 멀티캐스트를 디코딩하는 대신 **WebSocket을 통한 디코딩된 JSON**(`ws://<host>:8081`)을 소비합니다.

Edge Connect는 확대되는 사용자 기반의 요구를 충족합니다. 가장 쉬운 연결 방법이며, 특별한 기술적 요구가 없는 한 이 방법을 사용해야 합니다.

요약:

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

설치 프로그램은 시크릿을 요청합니다: `DZ_…` 액세스 토큰 **또는** 액세스 패스 / 피드 구매를 소유한 Solana 키페어 JSON의 경로입니다.

호스트에 `doublezerod`가 이미 실행 중인 경우, 호스트와 컨테이너의 자체 데몬 모두 UDP 포트 `44880`을 바인딩하므로 컨테이너의 데몬은 시작 직후 종료됩니다. 설치 프로그램은 호스트 데몬을 중지하고 비활성화할 것인지 제안하며, `DZ_ASSUME_YES=1`이 설정되어 있을 때는 묻지 않고 수행합니다. 직접 수행하려면:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

그런 다음 **컨테이너 내부에서** 상태를 확인하고(`BGP Session Up`과 Binance 그룹이 표시되어야 함) WebSocket 클라이언트를 `:8081`에 연결하세요:

```bash
docker exec doublezero-edge-connect doublezero status
```

WebSocket의 모든 Binance 메시지는 `"source_name":"BINANCE"`를 포함합니다. 두 엔진은 이 이름을 공유하므로 `source_id`로 구분하세요: `8`은 Spot이고 `6`은 USD-M입니다. 동일한 심볼이 양쪽에 모두 존재할 수 있으며 — `BTCUSDT`는 한쪽에서는 현물 페어이고 다른 쪽에서는 무기한 계약입니다 — 종목 ID는 엔진별로 할당되므로, 심볼 또는 종목 ID와 함께 `source_id`로도 키를 지정하세요.

**WebSocket 프로토콜:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. 네이티브 멀티캐스트 (고급) {#2-native-multicast-advanced}

!!! warning "심층적인 기술 지식 필요"
    네이티브 멀티캐스트는 직접 그룹에 참여하고 호스트에서 **원시** Edge 와이어 포맷을 디코딩하는 것을 의미합니다. 가장 기술적으로 능숙한 사용자만 이 경로를 선택해야 합니다. [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md)를 시작으로 [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)의 나머지 스펙을 읽고 이해해야 합니다. 디코더를 직접 소유해야 하는 확실한 요구사항이 없다면 [Edge Connect](#1-edge-connect-recommended)를 선택하세요.

### DoubleZero 클라이언트 설정 {#doublezero-client-setup}

[설정](setup.md) 안내를 따라 DoubleZero 클라이언트를 설치하고 구성하세요. 클라이언트를 최신 상태로 유지하세요:

```bash
sudo apt update && sudo apt install doublezero
```

### 피드 구매 {#buy-a-feed}

`doublezerod`가 실행 중인 상태에서, 구매 전에 가장 낮은 지연 시간의 장치를 확인하세요:

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)에서 구매하세요.

### 방화벽 구성 {#configure-the-firewall}

GRE, BGP, PIM 및 Binance 피드 트래픽을 허용하세요. 두 피드 모두 UDP `30001`에서 시장 데이터를, `30002`에서 참조 데이터를 게시하며, 포트가 아닌 멀티캐스트 그룹으로 구분됩니다. [피드 주소](#feed-addresses)를 참조하세요.

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Binance market / reference (both feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30001:30002 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Binance market / reference (both feeds)
sudo ufw allow in on doublezero1 to any port 30001:30002 proto udp
```

UFW에는 `pim` 프로토콜이 없습니다. 아웃바운드 PIM은 UFW의 기본 아웃고잉 정책에 의해 허용됩니다. 아웃고잉 트래픽을 거부하는 경우 `/etc/ufw/before.rules`에 PIM에 대한 raw 규칙을 추가하세요.

### 구독 {#subscribe}

구매한 모든 피드에 참여하세요 (클라이언트 v0.35.0 이상):

```bash
doublezero connect multicast
```

`--subscribe`로 그룹 코드를 사용하여 구독하면 구매한 패스에서 실패합니다.

`✅  User Provisioned`가 표시되어야 합니다. 약 60초 후에 다음을 실행하세요:

```bash
doublezero status
```

올바른 DoubleZero 네트워크에서 `BGP Session Up`이 표시되어야 합니다.

```bash
doublezero user list --client-ip <your ip>
```

피드가 `groups` 열에 표시됩니다. 그룹 IP는 다음으로 확인하세요:

```bash
doublezero multicast group list
```

### 와이어 직접 디코딩 {#decode-the-wire-yourself}

스키마 버전은 **`3`**입니다 — 디코더가 구현하지 않은 버전의 데이터그램은 폐기하세요. 공식 레이아웃: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md), [Source ID 레지스트리](https://github.com/malbeclabs/edge-feed-spec/blob/main/sources/spec.md), [용어집](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md) 포함.

모든 데이터그램은 24바이트 데이터그램 헤더로 시작하며, 그 뒤에 MTU까지 하나 이상의 애플리케이션 메시지가 패킹됩니다. 데이터그램은 리틀 엔디안이며 고정 레이아웃입니다.

| 필드 | 참고 |
|-------|-------|
| Magic | 오프셋 0의 `u16`: `0x445A`. 유효성을 검증하세요. |
| 스키마 버전 | `3` |
| 채널 ID | Spot은 채널 `1`, USD-M은 채널 `0`을 사용 |
| 시퀀스 | 소스 IP 주소, 채널 ID 및 대상 포트별 단조 증가 — 각 포트는 자체 시리즈를 가집니다. 갭 감지에 사용하세요. |
| 전송 타임스탬프 | Unix 에포크 이후 나노초 |
| 메시지 수 | 이 데이터그램에 패킹된 메시지 수 |
| 리셋 카운트 | 변경(`255` → `0` 래핑 포함)이 발생하면 리셋입니다; 해당 퍼블리셔의 채널 상태를 폐기하세요. |
| 데이터그램 길이 | 총 바이트 |

#### 애플리케이션 메시지 {#application-messages}

| 유형 | ID | 크기 | 포트 | 내용 |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | 시장이 조용할 때의 생존 신호 |
| InstrumentDefinition | `0x02` | 130 B | reference | 심볼, 지수, 틱 및 랏, 만기 |
| Quote | `0x03` | 60 B | market | 최우선 매수/매도 호가, 가격과 수량, 업데이트 플래그 |
| Trade | `0x04` | 52 B | market | 가격, 수량, 공격자 측, 거래 ID |
| EndOfSession | `0x06` | 12 B | market | 정상 종료 |
| ManifestSummary | `0x07` | 24 B | reference | 유효 플래그, Manifest Seq 변경 카운터, 종목 수, 타임스탬프 |

**Source ID가 엔진 키입니다.** 두 피드 모두 거래소 코드 `BINANCE`를 사용하지만, 각 엔진은 edge-feed-spec 레지스트리에서 자체 Source ID를 가집니다: `8` Binance Spot, `6` Binance USD-Margined Futures. 두 엔진은 겹치는 심볼을 상장하며(`BTCUSDT`는 현물 페어이자 USD-M 무기한 계약), 각 엔진은 종목 ID를 독립적으로 할당하므로 동일한 종목 ID가 두 피드에서 서로 다른 종목으로 나타날 수 있습니다. 종목과 호가창의 키는 **(Source ID, 종목 ID)**로 지정하세요. 심볼이나 종목 ID만으로는 절대 안 됩니다. 각 `InstrumentDefinition`에서 `price_exponent`와 `qty_exponent`를 읽으세요 — 하드코딩하지 마세요. 지수는 가격 정밀도이지 틱이 아닙니다: 거래 가능한 증분은 `tick_size × 10^price_exponent`입니다.

전달은 재전송 없는 fire-and-forget UDP이며, reference-data 포트는 시장 데이터를 복구하지 않습니다: `InstrumentDefinition`(두 피드 모두 최소 30초마다 한 번)과 `ManifestSummary`(USD-M은 최소 1초마다 한 번, Spot은 5초마다 한 번)만 반복합니다. 손실된 Quote는 해당 종목의 최우선 매수 또는 매도 호가가 변경될 때까지 손실 상태로 유지됩니다. 거래 중복 제거는 **(Source ID, 종목 ID, 거래 ID)**로 수행하세요. 거래 ID만으로는 절대 안 됩니다.

Binance는 최우선 매수/매도 호가 업데이트가 피드에 도달하기 전에 병합합니다: 부하가 걸리면 심볼에 대해 대체된 업데이트는 더 새로운 업데이트를 위해 삭제됩니다. 호가창 변경보다 호가 수가 적은 것은 손실이 아니라 정상적인 거래소 동작입니다 — 손실 감지에는 데이터그램 시퀀스 번호를 사용하세요.

디코더가 가정할 수 있는 것과 다른 참조 데이터 세부사항:

- **타임스탬프.** USD-M `Quote`와 `Trade`는 밀리초 정밀도의 매칭 엔진 시간을 포함합니다. Spot `Quote`는 게이트웨이 전송 시간을, Spot `Trade`는 체결 시간을 포함하며, 둘 다 마이크로초 정밀도입니다. 와이어에서는 모두 나노초로 표현됩니다.
- **`Leg1`은 8바이트입니다.** 더 긴 기초 자산(예: `1000FLOKI` 또는 `BROCCOLI714`)은 잘립니다; 전체 이름은 항상 `Symbol`에 있습니다.
- **모든 심볼이 ASCII인 것은 아닙니다.** 일부 USD-M 무기한 계약은 중국어 이름을 가지며, 그 `Symbol`과 `Leg1`은 UTF-8 바이트를 포함합니다. 이 필드를 디코딩할 때 ASCII를 가정하지 마세요.
- 모든 USD-M 종목은 무기한 계약이므로 **`Expiry`는 `0`**입니다.
- **`Bid Source Count`와 `Ask Source Count`는 항상 `0`입니다.** Binance는 최우선 호가의 주문 수를 게시하지 않습니다.
- **USD-M은 Retail Price Improvement(RPI) 주문을** 최우선 매수/매도 호가에서 제외하므로, 이를 포함하는 심도 스냅샷과 다를 수 있습니다.

---

## 피드 주소 {#feed-addresses}

| 그룹 코드 | 엔진 | Source ID | 채널 ID | 멀티캐스트 그룹 | 시장 데이터 | 참조 데이터 |
|------------|--------|-----------|------------|-----------------|-------------|----------------|
| `edge-binance-spot-tob` | Spot | `8` | `1` | `233.84.178.31` | `30001` | `30002` |
| `edge-binance-usdsm-tob` | USD-M 무기한 계약 | `6` | `0` | `233.84.178.23` | `30001` | `30002` |

`doublezero status`와 `multicast group list`는 그룹 코드를 표시합니다.

그룹은 피드를 선택하고; 포트는 그 안에서 시장 데이터 또는 참조 데이터를 선택합니다. 멀티캐스트 복제는 소스 IP 주소와 그룹별로 수행되며, 패브릭은 UDP 포트를 검사하지 않으므로 그룹에 참여하면 DoubleZero 터널을 통해 해당 그룹의 모든 것이 전달됩니다. 포트는 바이트가 도착한 후 자체 호스트에서 적용되는 소켓 필터입니다. 피드가 포트를 공유하므로, 두 Binance 그룹 모두에 참여한 호스트에서 `30001`에 바인딩된 소켓은 둘 다 수신합니다; 대상 그룹 또는 Source ID로 필터링하세요.

---

## 문제 해결 {#troubleshooting}

여기서 다루지 않는 문제가 발생하면 해결 방법을 찾기 전에 기존 채널을 통해 문의해 주세요. 채널이 없는 경우 [지원](support/index.md)을 참조하세요.

### 클라이언트가 최신 상태인지 확인 {#ensure-your-client-is-up-to-date}

실행: `sudo apt update && sudo apt install doublezero`

### 데이터그램이 도착하지 않음 {#no-datagrams-arriving}

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)에서 피드를 구매했는지 확인하세요. 구매하지 않은 피드는 트래픽을 전달하지 않습니다.
2. BGP가 활성 상태인지 확인하세요: `doublezero status`가 올바른 DoubleZero 네트워크에서 `BGP Session Up`을 표시해야 합니다.
3. 구독이 활성 상태인지 확인하세요: `doublezero user list --client-ip <your ip>`가 `groups` 아래에 피드를 나열해야 합니다.
4. 올바른 인터페이스에서 그룹에 참여했는지 확인하세요. 멀티캐스트는 `doublezero0`가 아닌 `doublezero1`에 도착합니다.
5. 방화벽이 `doublezero1`에서 UDP `30001`–`30002` 인바운드를 허용하는지 확인하세요.

### 두 엔진이 섞임 {#two-engines-mixed-together}

Spot과 USD-M은 모두 `BTCUSDT`와 같은 심볼을 상장하고, 종목 ID를 독립적으로 할당하며, 포트를 공유합니다. 심볼이나 종목 ID만으로 호가창의 키를 지정하거나, 대상 그룹을 확인하지 않고 모든 그룹에 하나의 소켓을 바인딩하는 디코더는 서로 다른 두 종목을 하나의 호가창으로 병합합니다. 종목 ID와 함께 Source ID(또는 대상 그룹)로도 키를 지정하세요.

### 시퀀스 갭 {#sequence-gaps}

소스 IP 주소, 채널 ID 및 대상 포트별로 시퀀스를 추적하세요; 채널 ID만으로 키를 잡는 디코더는 거짓 갭을 감지합니다. 실제 갭은 데이터그램 손실을 의미합니다. 복구는 없습니다: 종목의 호가는 최우선 매수 또는 매도 호가가 다음에 변경될 때 다시 최신 상태가 됩니다.

### 리셋 카운트 변경 {#reset-count-changes}

리셋 카운트의 변경은 해당 퍼블리셔가 채널을 재시작하거나 재시드했음을 의미합니다. 해당 소스 IP 주소와 채널의 상태를 폐기하고, reference-data 포트에서 정의를 다시 수집하세요.

### 터널이 올라오지 않음 {#tunnel-not-coming-up}

1. **Edge Connect:** 컨테이너 내에서 상태를 확인하세요 — `docker exec doublezero-edge-connect doublezero status`. 피드가 정상이어도 호스트 `doublezero status`는 종종 실패합니다(컨테이너가 데몬을 소유). 호스트 `doublezerod`가 중지되었는지 확인하세요.
2. **네이티브:** 호스트 데몬이 실행 중인지 확인하세요: `sudo systemctl status doublezerod`
3. 방화벽 규칙이 적용되었는지 확인하세요 (GRE, BGP, PIM 및 `doublezero1`의 피드 포트)
4. 연결한 곳(컨테이너 또는 호스트)과 동일한 곳에서 연결 상태를 확인하세요 — 올바른 DoubleZero 네트워크에서 `BGP Session Up`이 표시되어야 합니다

클라이언트 IP는 호스트의 공인 IP에서 자동 검색됩니다. 피드 구매 시 사용한 IP와 일치하는지 확인하세요.

---

## 리서치 참조 설계 {#research-reference-design}

선택 사항입니다. 이미 호스트에 DoubleZero 터널과 구독이 있고 피드 데이터를 **기록하고 차트로 시각화**하려는 경우, 리서치 참조 설계는 멀티캐스트 → 파서 → topofbook-bot → ClickHouse → Grafana를 Docker Compose로 실행합니다:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

이것은 데모를 Binance Spot에 연결합니다. 다른 피드의 경우 [피드 주소](#feed-addresses)에서 해당 그룹을 사용하세요:

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.31/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=30001/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=30002/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana는 일반적으로 호스트의 `http://localhost:3000`에서 접속할 수 있습니다. 세부사항 및 대시보드: [데모 README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

이것은 이미 수신 중인 데이터를 시각화합니다. 피드 구매, 구독 또는 위의 두 연결 경로를 대체하지 않습니다.
