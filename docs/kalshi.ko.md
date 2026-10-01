---
description: DoubleZero Edge에서 Kalshi 시장 데이터 수신 — Edge Connect 또는 네이티브 멀티캐스트.
---

# Kalshi Edge 구독자 연결

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol)에 동의합니다. 데이터는 내부 목적으로만 사용해야 하며 재전송할 수 없습니다(섹션 2(e) 참조)."

Kalshi 피드는 DoubleZero Edge 네트워크를 통해 무기한 계약(perps) 및 스포츠 시장 데이터를 UDP 멀티캐스트로 전달합니다. 네 가지 피드가 있습니다:

- 무기한 계약 최우선 호가(TOB)
- 무기한 계약 가격별 시장 심도(MBP)
- 스포츠 최우선 호가(TOB)
- 스포츠 가격별 시장 심도(MBP)

## 어떤 경로를 선택해야 하나요?

| # | 경로 | 적합한 대상 | 난이도 |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | 간단한 CLI와 WebSocket을 통한 디코딩된 JSON을 원하는 에이전트 및 앱 | 가장 낮음 |
| **2** | [네이티브 멀티캐스트](#2-native-multicast-advanced) | 원시 와이어 포맷에 대해 자체 디코더를 구축하는 경우 | 가장 높음 |

어떤 경로를 선택하든: [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)에서 필요한 피드를 먼저 구매하세요. 구매 시 [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol) 및 [Kalshi 서비스 약관](https://doublezero.xyz/dz-edge-kalshi-terms)에 동의하게 됩니다.

AI가 설치를 도와주길 원하시나요? [DoubleZero MCP](mcp.md)를 연결하고 Kalshi / Edge Connect 설정을 안내해 달라고 요청하세요.

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

그런 다음 **컨테이너 내부에서** 상태를 확인하고(`BGP Session Up`과 Kalshi 그룹이 표시되어야 함) WebSocket 클라이언트를 `:8081`에 연결하세요:

```bash
docker exec doublezero-edge-connect doublezero status
```

**전체 단계, 검증 및 주의사항:** [DoubleZero MCP](mcp.md)를 연결하고 Kalshi용 Edge Connect 설정을 안내해 달라고 요청하세요.  
**WebSocket 프로토콜:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. 네이티브 멀티캐스트 (고급) {#2-native-multicast-advanced}

!!! warning "심층적인 기술 지식 필요"
    네이티브 멀티캐스트는 직접 그룹에 참여하고 호스트에서 **원시** Edge 와이어 포맷을 디코딩하는 것을 의미합니다. 가장 기술적으로 능숙한 사용자만 이 경로를 선택해야 합니다. [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md)를 시작으로 [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)의 나머지 스펙을 읽고 이해해야 합니다. 디코더를 직접 소유해야 하는 확실한 요구사항이 없다면 [Edge Connect](#1-edge-connect-recommended)를 선택하세요.

### DoubleZero 클라이언트 설정

[설정](setup.md) 안내를 따라 DoubleZero 클라이언트를 설치하고 구성하세요. 클라이언트를 최신 상태로 유지하세요:

```bash
sudo apt update && sudo apt install doublezero
```

### 피드 구매

`doublezerod`가 실행 중인 상태에서, 구매 전에 가장 낮은 지연 시간의 장치를 확인하세요:

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)에서 구매하세요.

### 방화벽 구성

GRE, BGP, PIM 및 Kalshi 피드 트래픽을 허용하세요. Kalshi UDP 포트는 `30000`–`59999` 범위에 있습니다: 첫 번째 숫자는 트래픽 클래스(`3` 시장 데이터, `4` 참조 데이터, `5` 스냅샷)이고 두 번째 숫자는 피드이므로, 참조 데이터는 항상 시장 데이터 + `10000`이고 스냅샷은 항상 시장 데이터 + `20000`입니다. `doublezero1`에서 전체 대역을 열어 새 채널과 피드가 추가 방화벽 변경을 필요로 하지 않도록 하세요 — [피드 주소](#feed-addresses)를 참조하세요.

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi 시장 / 참조 / 스냅샷 (모든 피드)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```


**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Kalshi 시장 / 참조 / 스냅샷 (모든 피드)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

UFW에는 `pim` 프로토콜이 없습니다. 아웃바운드 PIM은 UFW의 기본 아웃고잉 정책에 의해 허용됩니다. 아웃고잉 트래픽을 거부하는 경우 `/etc/ufw/before.rules`에 PIM에 대한 raw 규칙을 추가하세요.


### 구독

구매한 모든 피드에 참여하세요 (클라이언트 v0.35.0 이상):

```bash
doublezero connect multicast
```

또는 **피드 코드**로 피드 이름을 지정하세요(공백으로 구분):

```bash
doublezero connect multicast --subscribe-feed kalshi-perps-tob kalshi-perps-mbp kalshi-sports-tob kalshi-sports-mbp
```

피드 코드(`kalshi-…`)를 사용하세요. 메트로별 피드 이름이나 그룹 코드(`edge-kalshi-…`)가 아닙니다. `--subscribe`로 그룹 코드를 사용하여 구독하면 구매한 패스에서 실패합니다.

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


### 와이어 직접 디코딩

스키마 버전은 **`3`**입니다 — 디코더가 구현하지 않은 버전의 데이터그램은 폐기하세요. 공식 레이아웃: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) 포함.

모든 데이터그램은 24바이트 데이터그램 헤더로 시작하며, 그 뒤에 MTU까지 하나 이상의 애플리케이션 메시지가 패킹됩니다. 데이터그램은 리틀 엔디안이며 고정 레이아웃입니다.

| 필드 | 참고 |
|-------|-------|
| Magic | 오프셋 0의 `u16`: TOB에서 `0x445A`, MBP에서 `0x4442`. 유효성을 검증하세요. |
| 스키마 버전 | `3` |
| 채널 ID | 포트를 공유하는 채널의 역다중화 |
| 시퀀스 | 소스 IP 주소, 채널 ID 및 대상 포트별 단조 증가 — 각 포트는 자체 시리즈를 가집니다. 갭 감지에 사용하세요. |
| 전송 타임스탬프 | Unix 에포크 이후 나노초 |
| 메시지 수 | 이 데이터그램에 패킹된 메시지 수 |
| 리셋 카운트 | 변경(`255` → `0` 래핑 포함)이 발생하면 리셋입니다; 해당 퍼블리셔의 채널 상태를 폐기하세요. MBP는 거래소 전체 재시드 시 세션 중에도 이를 증가시킬 수 있습니다. |
| 데이터그램 길이 | 총 바이트 |

#### 애플리케이션 메시지 (TOB)

| 유형 | ID | 크기 | 포트 | 내용 |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | 시장이 조용할 때의 생존 신호 |
| InstrumentDefinition | `0x02` | 130 B | reference | 심볼, 지수, 틱 및 랏, 만기 |
| Quote | `0x03` | 60 B | market | 최우선 매수/매도 호가, 가격과 수량, 업데이트 플래그 |
| Trade | `0x04` | 52 B | market | 가격, 수량, 공격자 측, 거래 ID |
| EndOfSession | `0x06` | 12 B | market | 정상 종료 |
| ManifestSummary | `0x07` | 24 B | reference | 유효 플래그, Manifest Seq 변경 카운터, 종목 수, 타임스탬프 |
| PerpStats | `0x30` | 124 B | sibling | 펀딩, 마크 및 오라클 가격, 미결제약정, 일간 거래량 |

edge-feed-spec 레지스트리에서 Kalshi의 Source ID는 `3`입니다. 각 `InstrumentDefinition`에서 `price_exponent`와 `qty_exponent`를 읽으세요 — 하드코딩하지 마세요.

MBP 피드는 market-by-price 메시지 세트를 사용합니다. edge-feed-spec의 market-by-price 및 reference-data 스펙을 참조하세요.

전달은 재전송 없는 fire-and-forget UDP이며, reference-data 포트는 시장 데이터를 복구하지 않습니다: `InstrumentDefinition`(최소 30초마다 한 번)과 `ManifestSummary`(최소 1초마다 한 번)만 반복합니다. 손실된 TOB Quote는 해당 시장의 최우선 매수 또는 매도 호가가 변경될 때까지 손실 상태로 유지됩니다. MBP 피드만 복구 경로(스냅샷 사이클)를 가지며, MBP 콜드 스타트는 반드시 스냅샷 포트를 바인딩해야 합니다. 거래 중복 제거는 **(종목 ID, 거래 ID)**로 수행하세요. 거래 ID만으로는 절대 안 됩니다.

---

## 피드 주소 {#feed-addresses}

| 피드 코드 | 그룹 코드 | 설명 | 멀티캐스트 그룹 | 시장 데이터 | 참조 데이터 | 스냅샷 |
|-----------|------------|-------------|-----------------|-------------|----------------|----------|
| `kalshi-perps-tob` | `edge-kalshi-perps-tob` | 무기한 계약 최우선 호가 | `233.84.178.3` | `31000` | `41000` | — |
| `kalshi-perps-mbp` | `edge-kalshi-perps-mbp` | 무기한 계약 가격별 시장 심도 | `233.84.178.4` | `32000` | `42000` | `52000` |
| `kalshi-sports-tob` | `edge-kalshi-sports-tob` | 스포츠 최우선 호가 | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `kalshi-sports-mbp` | `edge-kalshi-sports-mbp` | 스포츠 가격별 시장 심도 | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

피드 코드로 구독하세요; `doublezero status`와 `multicast group list`는 그룹 코드를 표시합니다.

포트 체계: 첫 번째 숫자는 트래픽 클래스(`3` 시장, `4` 참조, `5` 스냅샷); 두 번째 숫자는 피드입니다. 참조는 시장 + `10000`; 스냅샷은 시장 + `20000`입니다. 무기한 계약 포트는 고정입니다. 스포츠 포트는 `기본값 + 채널 id`입니다(예: `edge-kalshi-sports-mbp`에서 id `10`은 `34010` / `44010` / `54010`을 사용).

그룹은 피드를 선택하고; 포트는 그 안에서 시장 데이터, 참조 데이터 또는 스냅샷을 선택합니다. 멀티캐스트 복제는 소스 IP 주소와 그룹별로 수행되며, 패브릭은 UDP 포트를 검사하지 않으므로 그룹에 참여하면 DoubleZero 터널을 통해 해당 그룹의 모든 것이 전달됩니다. 포트는 바이트가 도착한 후 자체 호스트에서 적용되는 소켓 필터입니다.

---

## 문제 해결

여기서 다루지 않는 문제가 발생하면 해결 방법을 찾기 전에 기존 채널을 통해 문의해 주세요. 채널이 없는 경우 [지원](support.md)을 참조하세요.

### 클라이언트가 최신 상태인지 확인

실행: `sudo apt update && sudo apt install doublezero`

### 데이터그램이 도착하지 않음

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)에서 피드를 구매했는지 확인하세요. 구매하지 않은 피드는 트래픽을 전달하지 않습니다.
2. BGP가 활성 상태인지 확인하세요: `doublezero status`가 올바른 DoubleZero 네트워크에서 `BGP Session Up`을 표시해야 합니다.
3. 구독이 활성 상태인지 확인하세요: `doublezero user list --client-ip <your ip>`가 `groups` 아래에 피드를 나열해야 합니다.
4. 올바른 인터페이스에서 그룹에 참여했는지 확인하세요. 멀티캐스트는 `doublezero0`가 아닌 `doublezero1`에 도착합니다.
5. 방화벽이 `doublezero1`에서 피드의 UDP 포트 인바운드를 허용하는지 확인하세요.

### 시퀀스 갭

소스 IP 주소, 채널 ID 및 대상 포트별로 시퀀스를 추적하세요; 채널 ID만으로 키를 잡는 디코더는 거짓 갭을 감지합니다. 실제 갭은 데이터그램 손실을 의미합니다. MBP 피드에서 영향받은 시장은 다음 스냅샷 사이클에서 복구됩니다. TOB 피드에서는 복구가 없습니다: 시장의 호가는 최우선 매수 또는 매도 호가가 다음에 변경될 때 다시 최신 상태가 됩니다.

### 리셋 카운트 변경

리셋 카운트의 변경은 해당 퍼블리셔가 채널을 재시작하거나 재시드했음을 의미합니다. 해당 소스 IP 주소와 채널의 상태를 폐기하고, reference-data 포트에서 정의를 다시 수집하고, MBP 피드에서는 스냅샷 포트에서 호가창을 재구축하세요.

### 터널이 올라오지 않음

1. **Edge Connect:** 컨테이너 내에서 상태를 확인하세요 — `docker exec doublezero-edge-connect doublezero status`. 피드가 정상이어도 호스트 `doublezero status`는 종종 실패합니다(컨테이너가 데몬을 소유). 호스트 `doublezerod`가 중지되었는지 확인하세요.
2. **네이티브:** 호스트 데몬이 실행 중인지 확인하세요: `sudo systemctl status doublezerod`
3. 방화벽 규칙이 적용되었는지 확인하세요 (GRE, BGP, PIM 및 `doublezero1`의 피드 포트)
4. 연결한 곳(컨테이너 또는 호스트)과 동일한 곳에서 연결 상태를 확인하세요 — 올바른 DoubleZero 네트워크에서 `BGP Session Up`이 표시되어야 합니다

클라이언트 IP는 호스트의 공인 IP에서 자동 검색됩니다. 피드 구매 시 사용한 IP와 일치하는지 확인하세요.

---

## 리서치 참조 설계

선택 사항입니다. 이미 호스트에 DoubleZero 터널과 구독이 있고 피드 데이터를 **기록하고 차트로 시각화**하려는 경우, 리서치 참조 설계는 멀티캐스트 → 파서 → topofbook-bot → ClickHouse → Grafana를 Docker Compose로 실행합니다:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

이것은 데모를 Kalshi 무기한 계약 TOB에 연결합니다. 다른 피드의 경우 [피드 주소](#feed-addresses)에서 해당 그룹과 포트를 사용하세요:

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.3/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=31000/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=41000/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana는 일반적으로 호스트의 `http://localhost:3000`에서 접속할 수 있습니다. 세부사항 및 대시보드: [데모 README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

이것은 이미 수신 중인 데이터를 시각화합니다. 피드 구매, 구독 또는 위의 연결 경로를 대체하지 않습니다.