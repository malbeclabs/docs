---
description: doublezero-edge-connect를 실행하여 Solana 시레드(shred)를 로컬 UDP 포트로 재전달하고 정규화된 Edge 시장 데이터를 로컬 WebSocket을 통해 소비합니다.
---

# Edge 연결

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol)에 동의합니다. 데이터는 내부 목적으로만 사용할 수 있으며 재전송할 수 없습니다(제2조(e) 참조)."

`doublezero-edge-connect`는 **DoubleZero Edge 바이너리 멀티캐스트**에 참여하여 이를 로컬에서 두 가지 피드로 제공하는 브리지입니다:

1. **Solana 시레드 포워딩** — 중복 제거된(선택적으로 서명 검증된) 시레드를 하나 이상의 로컬 UDP 대상으로 팬아웃하여 밸리데이터 또는 RPC에서 바로 사용할 수 있습니다.
2. **정규화된 시장 데이터** — Edge 거래소 피드를 디코딩하고 정밀도를 보정한 후 `ws://host:8081`에서 단일 JSON WebSocket으로 제공합니다.

두 피드 모두 동일한 컨테이너와 동일한 원라인 설치로 실행됩니다. 온체인 인가가 부여한 피드를 활성화하세요.

```
                                        ┌─ UDP datagrams ──▶  validator / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binary)             (dedup · decode · normalize)  └─ WebSocket (JSON) ──▶  trading engine
                                                          ws://host:8081
```

---

## 요구 사항

- 대상 환경에 대해 온체인으로 인가된 공인 IPv4 주소를 가진 **Linux/amd64** 호스트.
- **Docker** (원라이너가 없는 경우 설치합니다).
- **GRE 연결** — 클라우드 제공자에서 IP 프로토콜 47을 허용하세요. AWS에서는 ENI 소스/목적지 확인을 비활성화하세요.
- **DoubleZero 액세스 시크릿**: `DZ_` 접두사가 붙은 base64 토큰 또는 키페어 파일 경로로, [DoubleZero 온보딩](setup.md) 과정에서 발급받습니다.

---

## 1단계: 설치 및 실행

하나의 명령으로 호스트를 준비하고 브리지 컨테이너를 시작합니다. DoubleZero 네트워크에 참여하고 인가가 부여한 모든 피드(시레드 포워딩 및/또는 `:8081`의 시장 데이터 WebSocket)를 시작합니다:

=== "Mainnet-beta"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect | bash
    ```

=== "Testnet"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect-testnet | bash
    ```

=== "Devnet (비공개)"

    ```bash
    # read:packages 권한이 있는 GHCR 토큰이 필요합니다
    DZ_GHCR_TOKEN=<your-token> curl -fsSL https://get.doublezero.xyz/connect-devnet | bash
    ```

스크립트가 수행하는 작업:

1. 호스트가 Linux/amd64인지 확인하고, Docker가 있는지 확인합니다(없으면 설치를 제안합니다).
2. GRE 터널을 위해 호스트 커널을 준비합니다: `tun`/`ip_gre` 로드, `net.core.rmem_max` 증가, 방화벽 및 클라우드 제공자 규칙에 대한 경고.
3. 액세스 시크릿을 로드합니다(`DZ_SECRET`이 설정되지 않은 경우 한 번 프롬프트됩니다).
4. 브리지 컨테이너를 실행하고(`--network host`, `NET_ADMIN`/`NET_RAW`, `/dev/net/tun`) `doublezero connect multicast`를 실행합니다.

!!! tip "비대화형 설치"
    파이프 앞에 `DZ_SECRET=DZ_…`를 설정하면 프롬프트 없이 완전히 무인으로 실행됩니다.

---

## 2단계: 구성

모든 구성은 **파이프 앞에 설정하는 환경 변수**를 통해 이루어집니다. 구성 파일은 없습니다.

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### 설치 프로그램 변수

| 변수 | 기본값 | 용도 |
|----------|---------|---------|
| `DZ_SECRET` | *(프롬프트)* | `DZ_` 접두사가 붙은 base64 토큰 **또는** 키페어 파일 경로. 토큰은 컨테이너에 주입되며 디스크에 기록되지 않습니다. 파일은 읽기 전용으로 바인드 마운트됩니다. |
| `DZ_ENV` | 스크립트별 | `mainnet-beta` \| `testnet` \| `devnet`. |
| `DZ_IMAGE` | 스크립트별 | 컨테이너 이미지를 재정의합니다. |
| `DZ_NAME` | `doublezero-edge-connect` | 컨테이너 이름. |
| `DZ_FEEDS` | *(전체)* | 시장 데이터 수집을 좁히는 쉼표로 구분된 거래소 목록 (예: `VenueA,VenueB`). Solana 시레드 포워딩에는 영향을 미치지 않습니다. |
| `DZ_ASSUME_YES` | `0` | 확인 프롬프트를 건너뜁니다 (예: Docker 설치 프롬프트). |
| `DZ_GHCR_TOKEN` | — | **Devnet 전용** — `read:packages` 권한이 있는 GHCR 토큰(devnet 이미지는 비공개). |
| `DZ_GHCR_USER` | `malbeclabs` | **Devnet 전용** — 로그인을 위한 GHCR 사용자명. |

### 브리지 변수

설치 프로그램은 **비어 있지 않은** 모든 브리지 변수를 컨테이너로 직접 전달합니다. 주요 변수:

| 변수 | 기본값 | 용도 |
|----------|---------|---------|
| `DZ_IFACE` | `doublezero1` | 리스닝할 네트워크 인터페이스. |
| `DZ_RECV_BUF` | — | UDP 수신 버퍼 재정의 (바이트). |
| `METRICS_BIND` | *(비어 있음 / 비활성)* | Prometheus `/metrics` 엔드포인트 활성화 (예: `127.0.0.1:9090`). |
| `RUST_LOG` | `info` | 로그 레벨 (`debug`, `warn` 등). |
| `DZ_SHRED_FORWARD` | — | 포워딩된 시레드의 로컬 UDP 대상 — [Solana 시레드 포워딩](#solana-시레드-포워딩) 참조. |
| `WS_BIND` | `0.0.0.0:8081` | 시장 데이터 WebSocket 바인드 주소 — [시장 데이터 WebSocket](#시장-데이터-websocket) 참조. |
| `WS_MAX_CLIENTS` | `64` | 최대 동시 WebSocket 클라이언트 수. |
| `WS_INPUT_COINS` | *(비어 있음 / 비활성)* | 나열된 심볼에 대한 공개 WebSocket 백스톱 활성화 (예: `BTC,ETH`). |

**예시:**

```bash
# 로컬 밸리데이터/RPC로 시레드 포워딩:
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# 비대화형, testnet:
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# 특정 거래소로 시장 데이터 좁히기, 상세 로깅, 비기본 WS 포트:
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# 메트릭 및 공개 WS 백스톱 활성화:
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    설치 프로그램은 **비어 있지 않은** 값만 전달하므로, 원라이너를 통해 빈 재정의(예: WebSocket 싱크를 비활성화하기 위한 `WS_BIND=""`)를 전달할 수 없습니다. 이 경우 수동으로 `docker run`을 작성하세요 — [자체 호스팅](#고급-자체-호스팅) 참조.

---

## Solana 시레드 포워딩

브리지는 `edge-solana-*` 시레드 멀티캐스트 그룹에 참여하고 각 데이터그램을 하나 이상의 로컬 UDP 대상으로 팬아웃합니다 — Edge 네트워크에서 직접 밸리데이터 또는 RPC에 공급합니다. 인가에 해당 그룹이 포함되어 있으면 검색 시 자동으로 활성화됩니다.

```bash
# 기본값 (중복 제거만, 로컬 포트 20000으로 포워딩):
DZ_SHRED_FORWARD=127.0.0.1:20000 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# 서명 검증 포함:
DZ_SHRED_DEDUP_MODE=sigverify \
  DZ_SHRED_RPC_URL=https://api.mainnet-beta.solana.com \
  DZ_SHRED_FORWARD=127.0.0.1:20000 \
  DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

| 변수 | 기본값 | 용도 |
|----------|---------|---------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | 포워딩된 시레드의 대상 (반복 가능). |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup` (시레드당 한 복사본), `sigverify` (+ ed25519 검증), `none` (모든 데이터그램). |
| `DZ_SHRED_RPC_URL` | — | Solana RPC 엔드포인트; `sigverify` 모드에 필요합니다. |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | 중복 제거 윈도우 크기. |

전체 파이프라인과 주의사항은 [시레드 포워딩](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md)을 참조하세요.

---

## 시장 데이터 WebSocket

`ws://<host>:8081`에 WebSocket을 연결하고 JSON 프레임을 읽으세요. 인가된 모든 거래소의 데이터를 수신합니다. 선택적 `subscribe` 메시지를 통해 스트림을 특정 거래소와 심볼로 좁힐 수 있습니다.

WebSocket + JSON을 지원하는 모든 엔진은 간단한 (~50–100줄) 어댑터로 이를 소비할 수 있습니다. 바이너리 멀티캐스트, 거래소별 2포트 분할, 매니페스트/정밀도 핸드셰이크는 모두 브리지 내부에서 처리됩니다. 소비자가 코딩해야 할 유일한 계약은 WebSocket JSON입니다.

### 연결 라이프사이클

새 연결마다 브리지는:

1. **현재 상품 정의를 재전송합니다** — 알려진 심볼당 하나의 `instrument` 메시지 — 소비자가 첫 번째 호가 전에 정밀도를 파악할 수 있도록 합니다.
2. **심볼당 최신 호가창 스냅샷을 재전송합니다** (Market-by-Order 피드가 활성인 경우).
3. `quote` / `trade` / `midpoint` / `depth` 메시지를 도착하는 대로 **스트리밍**하며 연결된 모든 소비자에게 팬아웃합니다.

```
connect → instrument (×N) → depth (×M, latest books) → quote → trade → depth → …
```

### 메시지 유형

모든 메시지는 `type` 필드로 태그된 JSON 객체입니다:

| `type` | 의미 |
|--------|---------|
| `instrument` | 상품/정밀도 정의. |
| `quote` | 최우선 호가 업데이트 (전체 상태). |
| `trade` | 체결 내역 (최근 거래). |
| `midpoint` | 파생 중간 가격. |
| `depth` | 전체 호가창 깊이 스냅샷. |
| `status` | 거래소 수준 피드 상태 전환. |

소비자는 **알 수 없는 `type` 값과 알 수 없는 필드를 무시해야 합니다** (전방 호환성).

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

연결 시와 정의가 변경될 때마다 전송됩니다. `price_exponent`와 `qty_exponent`는 거래소의 틱 사이즈와 수량 단위를 10의 거듭제곱으로 나타냅니다.

#### `quote`

```json
{
  "type": "quote",
  "venue": "ExampleVenue",
  "symbol": "SOL",
  "bid": 184.20, "ask": 184.21,
  "bid_size": 12.5, "ask_size": 8.0,
  "bid_n": 3, "ask_n": 2,
  "source_ts_ns": 1781019263715344015,
  "recv_ts_ns":   1781019263715501230,
  "kernel_rx_ts_ns": 1781019263715300010,
  "ws_send_ts_ns":   1781019263715600440
}
```

모든 `quote`는 **전체 상태**입니다 — 메시지가 손실되어도 다음 호가에서 자동 복구되며, 재동기화가 필요 없습니다. 네 개의 타임스탬프는 종단 간 지연 시간을 분해합니다:

```
source_ts_ns → kernel_rx_ts_ns → recv_ts_ns → ws_send_ts_ns → (consumer recv)
  venue book      wire arrival      post-decode    WS hand-off
```

`0`은 "사용할 수 없음"을 나타내는 센티넬 값입니다 — 1970이 아닌 누락된 값으로 처리하세요.

#### `trade`

```json
{
  "type": "trade",
  "venue": "ExampleVenue", "symbol": "SOL",
  "price": 184.20, "size": 3.5,
  "aggressor_side": "buy",
  "trade_id": 987654, "cumulative_volume": 12500.0,
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

`aggressor_side`는 `"buy"`, `"sell"` 또는 `"unknown"`입니다. 체결은 시점 이벤트이며 재연결 시 재전송되지 않습니다.

#### `depth`

```json
{
  "type": "depth",
  "venue": "MboVenue", "symbol": "SOL",
  "bids": [[184.20, 12.5], [184.19, 4.0]],
  "asks": [[184.21, 8.0], [184.22, 6.5]],
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

`bids`는 최고가 우선으로 정렬되고 `asks`는 최저가 우선으로 정렬됩니다. 각 `depth`는 **전체 스냅샷**입니다 — 병합하지 말고 교체하세요.

#### `status`

```json
{"type":"status","venue":"ExampleVenue","state":"down","stale_ms":30000,"ts_ns":...}
```

거래소의 호가 멀티캐스트가 침묵할 때(`state:"down"`) 또는 복구될 때(`state:"ok"`) Edge에서 발생합니다. UI에서 거래소를 비활성 상태로 표시하는 데 사용하세요. 호가 전달은 상태에 의해 차단되지 않습니다 — 피드는 다음 호가에서 자동 복구됩니다.

### 구독

기본적으로 모든 것을 수신합니다. 스트림을 좁히려면 제어 메시지를 보내세요:

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

필드를 생략하면 모든 값과 일치합니다(`{"symbol":"SOL"}` = 모든 거래소의 SOL). `venue`는 대소문자를 구분하지 않고 매칭됩니다.

**서버 확인 응답:**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

오류는 `{"channel":"error","error":"<reason>"}`으로 반환됩니다.

### 하트비트 및 활성 확인

- 서버는 20초마다 **WebSocket Ping**을 보냅니다. 호환 클라이언트는 자동으로 Pong을 응답합니다.
- 60초 동안 비활성인 클라이언트는 닫히고 정리됩니다.
- 애플리케이션 수준 keepalive: `{"method":"ping"}` → `{"channel":"pong"}`.

### 소비자 스켈레톤

```python
import json, websocket

def on_message(ws, frame):
    msg = json.loads(frame)
    t = msg.get("type")
    if t == "instrument":
        register_instrument(msg["venue"], msg["symbol"],
                            msg["price_exponent"], msg["qty_exponent"])
    elif t == "quote":
        on_top_of_book(msg["venue"], msg["symbol"],
                       msg["bid"], msg["ask"],
                       msg["bid_size"], msg["ask_size"])
    elif t == "trade":
        on_trade(msg["venue"], msg["symbol"],
                 msg["price"], msg["size"], msg["aggressor_side"])
    elif t == "depth":
        replace_book(msg["venue"], msg["symbol"],
                     msg["bids"], msg["asks"])
    # unknown types: silently ignore (forward compatibility)

ws = websocket.WebSocketApp("ws://localhost:8081", on_message=on_message)
ws.run_forever()
```

### 입력 소스와 WebSocket 백스톱

Edge 멀티캐스트 피드는 항상 활성 상태입니다. 선택적 **공개 WebSocket 백스톱**은 Edge 피드가 중단될 때 격차를 메울 수 있습니다:

```bash
# BTC와 ETH에 대한 백스톱 활성화:
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

두 소스는 공유 아비터 내에서 `(venue, symbol, source_ts)` 틱 단위로 경쟁합니다. 정상 상태에서는 Edge 소스가 승리합니다(인터넷 경유 수십 ms 대비 1ms 미만). Edge에 격차가 발생하면 공개 복사본이 채웁니다. WebSocket 출력은 어떤 소스가 특정 업데이트를 전달했는지와 관계없이 동일합니다.

---

## 컨테이너 관리

```bash
# 로그 스트리밍
sudo docker logs -f doublezero-edge-connect

# 터널 상태 확인
sudo docker exec -it doublezero-edge-connect doublezero status

# 디바이스 지연 시간 확인
sudo docker exec -it doublezero-edge-connect doublezero latency

# 중지 및 제거
sudo docker stop doublezero-edge-connect && sudo docker rm doublezero-edge-connect
```

!!! note "TLS 없음"
    브리지는 신뢰할 수 있는/로컬 네트워크를 대상으로 합니다. WebSocket 엔드포인트를 외부에 노출하는 경우 리버스 프록시에서 TLS를 종단하세요.

---

## 모니터링 (Prometheus 메트릭)

메트릭 엔드포인트는 **기본적으로 비활성**입니다. `METRICS_BIND`로 활성화하세요:

```bash
METRICS_BIND=127.0.0.1:9090 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

그런 다음 스크래핑하세요:

```bash
curl -s localhost:9090/metrics | grep '^dz_'
```

주요 메트릭:

| 메트릭 | 추적 대상 |
|--------|---------------|
| `dz_feed_up{venue}` | 해당 거래소의 멀티캐스트가 활성이면 `1`, 침묵이면 `0`. |
| `dz_datagrams_received_total{venue}` | 거래소별 수집 볼륨. |
| `dz_emit_total{venue,kind}` | 중복 제거 후 유형별 브로드캐스트된 메시지. |
| `dz_quotes_dropped_total{venue}` | 억제된 오래된/중복 호가. |
| `dz_ws_clients` | 현재 연결된 WebSocket 클라이언트 수. |
| `dz_ws_messages_sent_total{kind}` | 클라이언트에 포워딩된 메시지. |
| `dz_ws_client_lagged_total` | 피드 보호를 위해 느린 클라이언트가 제거된 횟수. |

동일한 바인드 주소에 `GET /healthz` 활성 프로브도 제공됩니다.

---

## 고급: 자체 호스팅

컨테이너는 GHCR에서 사용할 수 있습니다:

| 환경 | 이미지 | 태그 |
|-------------|-------|-----|
| Mainnet-beta | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:mainnet-beta` |
| Testnet | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:testnet` |
| Devnet (비공개) | `ghcr.io/malbeclabs/doublezero-edge-connect-devnet` | `:latest` |

수동으로 실행합니다(설치 프로그램이 전달할 수 없는 옵션, 예: `WS_BIND=""`에 필요):

```bash
docker run --rm --network host --cap-add NET_ADMIN --device /dev/net/tun \
  -e DZ_SECRET=DZ_… \
  -e DZ_SHRED_FORWARD=127.0.0.1:20000 \
  -e WS_BIND=0.0.0.0:8081 \
  -e METRICS_BIND=127.0.0.1:9090 \
  ghcr.io/malbeclabs/doublezero-edge-connect:mainnet-beta
```

**소스에서 빌드:**

```bash
git clone https://github.com/malbeclabs/doublezero-edge-connect
cd doublezero-edge-connect
cargo build --release
cargo test

./target/release/doublezero-edge-connect \
  --iface doublezero1 \
  --ws-bind 0.0.0.0:8081
```

버스트 피드에는 더 큰 커널 수신 버퍼가 권장됩니다:

```bash
sudo sysctl -w net.core.rmem_max=268435456
```

---

## 제한 및 백프레셔

| 제한 | 기본값 | 초과 시 동작 |
|-------|---------|------------------------|
| 동시 클라이언트 수 (`WS_MAX_CLIENTS`) | 64 | 새 연결이 거부됩니다. |
| 클라이언트당 구독 수 (`WS_MAX_SUBS`) | 256 | `subscribe`가 오류와 함께 거부됩니다. |
| 클라이언트당 분당 인바운드 제어 메시지 수 (`WS_MAX_INBOUND_PER_MIN`) | 600 | 클라이언트 연결이 끊깁니다. |
| 브로드캐스트 버퍼 (`WS_BROADCAST_CAPACITY`) | 4096 | 느린 클라이언트는 **가장 오래된 메시지를 드롭합니다** (피드를 차단하지 않습니다). |

모든 `quote`와 `depth`는 전체 상태이므로, 백프레셔로 인해 메시지를 드롭한 소비자도 다음 메시지에서 자동 복구됩니다 — 재동기화 핸드셰이크가 필요 없습니다.

---

## 문제 해결

### 로컬 포트에 시레드가 도착하지 않음

- 온체인에서 `edge-solana-*` 시레드 그룹에 대한 접근이 인가