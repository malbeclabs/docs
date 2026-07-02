---
description: doublezero-edge-connect를 실행하여 Solana shred를 로컬 UDP 포트로 재전달하고 로컬 WebSocket을 통해 정규화된 Edge 시장 데이터를 소비합니다.
---

# Edge 연결

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol)에 동의합니다. 데이터는 내부 목적으로만 사용 가능하며 재전송할 수 없습니다(Section 2(e) 참조)."

`doublezero-edge-connect`는 **DoubleZero Edge 바이너리 멀티캐스트**에 참여하여 로컬에서 두 가지 피드로 제공하는 브리지입니다:

1. **Solana shred 전달** — 중복 제거된(선택적으로 서명 검증된) shred를 하나 이상의 로컬 UDP 대상으로 팬아웃하여 밸리데이터 또는 RPC에 바로 사용할 수 있습니다.
2. **정규화된 시장 데이터** — Edge 거래소 피드를 디코딩하고, 정밀도를 보정하여, `ws://host:8081`에서 단일 JSON WebSocket으로 재제공합니다.

두 피드 모두 동일한 컨테이너와 동일한 한 줄 설치에서 실행됩니다. 온체인 인가에서 허용하는 피드를 활성화하세요.

```
                                        ┌─ UDP datagrams ──▶  validator / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binary)             (dedup · decode · normalize)  └─ WebSocket (JSON) ──▶  trading engine
                                                          ws://host:8081
```

---

## 요구 사항

- 대상 환경에 대해 온체인으로 인가된 퍼블릭 IPv4 주소를 가진 **Linux/amd64** 호스트.
- **Docker** (없는 경우 원라이너가 설치합니다).
- **GRE 연결** — 클라우드 제공업체에서 IP 프로토콜 47을 허용하세요; AWS에서는 ENI source/dest 체크를 비활성화하세요.
- **DoubleZero 액세스 시크릿**: `DZ_` 접두사가 붙은 base64 토큰 또는 키페어 파일 경로로, [DoubleZero 온보딩](setup.md) 과정에서 발급받습니다.

---

## 1단계: 설치 및 실행

하나의 명령으로 호스트를 준비하고 브리지 컨테이너를 시작합니다. DoubleZero 네트워크에 참여하고 인가에서 허용하는 모든 피드를 시작합니다 — shred 전달 및/또는 `:8081`의 시장 데이터 WebSocket:

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
    # read:packages 권한이 있는 GHCR 토큰 필요
    DZ_GHCR_TOKEN=<your-token> curl -fsSL https://get.doublezero.xyz/connect-devnet | bash
    ```

스크립트가 수행하는 작업:

1. 호스트가 Linux/amd64인지 확인합니다.
2. 액세스 시크릿을 로드하고(`DZ_SECRET`이 설정되지 않은 경우 한 번 입력 요청) **설치 전에 온체인에서 액세스 패스를 검증합니다** — 레저의 퍼블릭 JSON-RPC를 대상으로 하는 순수 호스트 측 검사입니다. 패스가 호스트의 IP와 다른 IP에 바인딩된 경우, (`DZ_CLIENT_IP`를 통해 명시적으로 IP를 지정한 경우) 중단하거나, (NAT 뒤에서 잘못될 수 있는 자동 감지된 IP인 경우) 경고 후 계속 진행하며, `doublezero connect`가 실제 검사를 수행합니다.
3. Docker가 있는지 확인하고(없으면 설치를 제안) GRE 터널을 위한 호스트 커널을 준비합니다: `tun`/`ip_gre` 로드, `net.core.rmem_max` 증가, 방화벽 및 클라우드 제공업체 규칙에 대한 경고.
4. 브리지 컨테이너를 실행하고(`--network host`, `NET_ADMIN`/`NET_RAW`, `/dev/net/tun`) `doublezero connect multicast`를 실행합니다.

!!! tip "비대화식 설치"
    파이프 앞에 `DZ_SECRET=DZ_…`를 설정하면 프롬프트 없이 완전 자동으로 실행됩니다.

---

## 2단계: 구성

모든 구성은 **파이프 앞에 설정하는 환경 변수**를 통해 이루어집니다. 구성 파일은 없습니다.

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### 인스톨러 변수

| 변수 | 기본값 | 용도 |
|------|--------|------|
| `DZ_SECRET` | *(입력 요청)* | `DZ_` 접두사가 붙은 base64 토큰 **또는** 키페어 파일 경로. 토큰은 컨테이너에 주입되며 디스크에 기록되지 않습니다; 파일은 읽기 전용으로 바인드 마운트됩니다. |
| `DZ_ENV` | 스크립트별 | `mainnet-beta` \| `testnet` \| `devnet`. |
| `DZ_IMAGE` | 스크립트별 | 컨테이너 이미지를 오버라이드합니다. |
| `DZ_NAME` | `doublezero-edge-connect` | 컨테이너 이름. |
| `DZ_FEEDS` | *(전체)* | 시장 데이터 수집을 특정 거래소로 좁히기 위한 쉼표 구분 목록 (예: `VenueA,VenueB`). Solana shred 전달에는 영향을 주지 않습니다. |
| `DZ_CLIENT_IP` | *(자동 감지)* | 온체인 액세스 패스 사전 검사에 사용되는 퍼블릭 IPv4를 오버라이드합니다. 자동 감지가 잘못된 경우(예: NAT 뒤) 설정하면 사전 검사가 경고만 하는 대신 확인할 수 있습니다. |
| `DZ_LEDGER_RPC_URL` | 환경별 | 사전 검사에 사용되는 DoubleZero 레저 RPC 엔드포인트를 오버라이드합니다. |
| `DZ_ASSUME_YES` | `0` | 확인 프롬프트를 건너뜁니다(예: Docker 설치 프롬프트). |
| `DZ_GHCR_TOKEN` | — | **Devnet 전용** — `read:packages` 권한이 있는 GHCR 토큰 (devnet 이미지는 비공개). |
| `DZ_GHCR_USER` | `malbeclabs` | **Devnet 전용** — 로그인용 GHCR 사용자 이름. |

### 브리지 변수

인스톨러는 **비어 있지 않은** 모든 브리지 변수를 컨테이너로 직접 전달합니다. 주요 항목:

| 변수 | 기본값 | 용도 |
|------|--------|------|
| `DZ_IFACE` | `doublezero1` | 리스닝할 네트워크 인터페이스. |
| `DZ_RECV_BUF` | `8388608` | UDP 수신 버퍼 오버라이드 (바이트; 기본 8 MiB). |
| `METRICS_BIND` | *(비어 있음 / 비활성)* | Prometheus `/metrics` 엔드포인트 활성화 (예: `127.0.0.1:9090`). |
| `RUST_LOG` | `warn,doublezero_edge_connect=info` | 로그 수준 (`debug`, `warn` 등). |
| `DZ_SHRED_FORWARD` | — | 전달된 shred를 위한 로컬 UDP 대상 — [Solana Shred 전달](#solana-shred-전달) 참조. |
| `WS_BIND` | `0.0.0.0:8081` | 시장 데이터 WebSocket 바인드 주소 — [시장 데이터 WebSocket](#시장-데이터-websocket) 참조. |
| `WS_MAX_CLIENTS` | `64` | 최대 동시 WebSocket 클라이언트 수. |
| `WS_INPUT_COINS` | *(비어 있음 / 비활성)* | 나열된 심볼에 대한 Hyperliquid 공개 WebSocket 백스톱 활성화 (예: `BTC,ETH`) — [입력 소스](#입력-소스-및-websocket-백스톱) 참조. |
| `WS_INPUT_URL` | `wss://api.hyperliquid.xyz/ws` | 백스톱용 Hyperliquid 공개 WebSocket URL. |
| `PHOENIX_WS_INPUT_MARKETS` | *(비어 있음 / 비활성)* | 나열된 티커에 대한 Phoenix 공개 WebSocket 백스톱(거래만) 활성화 (예: `SOL,BTC`). |
| `PHOENIX_WS_INPUT_URL` | `wss://perp-api.phoenix.trade/v1/ws` | 백스톱용 Phoenix 공개 WebSocket URL. |

**예시:**

```bash
# 로컬 밸리데이터/RPC로 shred 전달:
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# 비대화식, testnet:
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# 특정 거래소로 시장 데이터 좁히기, 상세 로깅, 기본이 아닌 WS 포트:
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# 메트릭 및 공개 WS 백스톱 활성화:
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    인스톨러는 **비어 있지 않은** 값만 전달하며, 한 가지 예외가 있습니다: `WS_BIND`는 비어 있게 설정해도 전달되므로, `WS_BIND=""`는 원라이너를 통해 WebSocket 싱크를 **비활성화합니다**. 다른 변수의 경우 빈 오버라이드는 파이프를 통해 전달할 수 없습니다 — 이 경우 직접 작성한 `docker run`을 사용하세요([셀프 호스팅](#고급-셀프-호스팅) 참조).

---

## Solana Shred 전달

브리지는 `edge-solana-*` shred 멀티캐스트 그룹에 참여하고 각 데이터그램을 하나 이상의 로컬 UDP 대상으로 팬아웃합니다 — Edge 네트워크에서 직접 밸리데이터 또는 RPC에 공급합니다. 해당 그룹이 인가에 포함되어 있으면 검색 시 자동으로 활성화됩니다.

```bash
# 기본값 (중복 제거만, 로컬 포트 20000으로 전달):
DZ_SHRED_FORWARD=127.0.0.1:20000 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# 서명 검증 포함:
DZ_SHRED_DEDUP_MODE=sigverify \
  DZ_SHRED_RPC_URL=https://api.mainnet-beta.solana.com \
  DZ_SHRED_FORWARD=127.0.0.1:20000 \
  DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

| 변수 | 기본값 | 용도 |
|------|--------|------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | 전달된 shred의 대상 (반복 가능). |
| `DZ_SHRED_DISABLE` | `0` | 마스터 옵트아웃 (`--shred-forward-disable`). 인가에서 허용하는 것과 관계없이 포워더를 비활성화합니다 — 로컬 소비자가 리스닝하지 않을 때 설정하여, shred 파이어호스를 아무 곳에도 전달하지 않는 데 CPU를 소모하는 것을 방지합니다. |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup` (shred당 하나의 복사본), `sigverify` (+ ed25519 검증), `none` (모든 데이터그램). |
| `DZ_SHRED_RPC_URL` | — | Solana RPC 엔드포인트; `sigverify` 모드에 필요합니다. |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | 중복 제거 윈도우 크기. |

전체 파이프라인과 주의 사항은 [Shred 전달](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md)을 참조하세요.

---

## 시장 데이터 WebSocket

`ws://<host>:8081`로 WebSocket을 열고 JSON 프레임을 읽으세요. 인가된 모든 거래소의 데이터를 수신합니다. 선택적 `subscribe` 메시지로 스트림을 특정 거래소와 심볼로 좁힐 수 있습니다.

WebSocket + JSON을 사용하는 모든 엔진이 간단한(~50–100줄) 어댑터로 소비할 수 있습니다. 바이너리 멀티캐스트, 거래소별 2포트 분리, 매니페스트/정밀도 핸드셰이크는 모두 브리지 내부에 있으며, 소비자가 구현해야 하는 유일한 인터페이스는 WebSocket JSON입니다.

!!! note
    WebSocket 싱크는 인가에 대해 하나 이상의 시장 데이터 피드가 활성화된 경우에만 시작됩니다 — shred 전용 호스트는 WebSocket을 제공하지 않습니다. 활성화는 30초마다 갱신되는 온체인 구독 조정기(`--subscription-refresh-secs`)에 의해 구동됩니다; `--subscription-gating-disable`는 게이팅을 옵트아웃합니다.

### 연결 수명 주기

새 연결마다 브리지는:

1. **현재 상품 정의를 재생합니다** — 알려진 심볼당 하나의 `instrument` 메시지 — 소비자가 첫 호가 전에 정밀도를 확보할 수 있도록 합니다.
2. **심볼별 최신 호가 잔량 스냅샷을 재생합니다** (Market-by-Order 피드가 활성화된 경우).
3. `quote` / `trade` / `midpoint` / `depth` 메시지를 도착하는 대로 **스트리밍**하며, 연결된 모든 소비자에게 팬아웃합니다.

```
connect → instrument (×N) → depth (×M, 최신 호가잔량) → quote → trade → depth → …
```

### 메시지 유형

모든 메시지는 `type` 필드로 태그된 JSON 객체입니다:

| `type` | 의미 |
|--------|------|
| `instrument` | 상품/정밀도 정의. |
| `quote` | 최우선 호가 업데이트 (전체 상태). |
| `trade` | 체결 (최종 거래). |
| `midpoint` | 파생 중간 가격. |
| `depth` | 전체 호가 잔량 스냅샷. |
| `status` | 거래소 수준 피드 상태 전환. |

소비자는 **알 수 없는 `type` 값과 알 수 없는 필드를 무시해야 합니다** (전방 호환성).

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

연결 시 및 정의 변경 시 전송됩니다. `price_exponent`와 `qty_exponent`는 거래소의 틱 크기와 수량 단위를 10의 거듭제곱으로 나타냅니다.

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

모든 `quote`는 **전체 상태**입니다 — 메시지가 누락되어도 다음 호가에서 자동 복구되며, 재동기화가 필요 없습니다. 네 개의 타임스탬프는 엔드투엔드 지연 시간을 분해합니다:

```
source_ts_ns → kernel_rx_ts_ns → recv_ts_ns → ws_send_ts_ns → (소비자 수신)
  거래소 호가      와이어 도착      디코딩 후      WS 핸드오프
```

`0`은 "사용 불가"의 센티넬 값입니다 — 1970이 아닌 누락으로 처리하세요.

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

`aggressor_side`는 `"buy"`, `"sell"`, 또는 `"unknown"`입니다. 거래는 시점 이벤트이며 재연결 시 재생되지 않습니다.

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

`bids`는 높은 가격 순으로 정렬됩니다; `asks`는 낮은 가격 순으로 정렬됩니다. 각 `depth`는 **전체 스냅샷**입니다 — 병합하지 말고 교체하세요.

#### `status`

```json
{"type":"status","venue":"ExampleVenue","state":"down","stale_ms":30000,"ts_ns":...}
```

거래소의 호가 멀티캐스트가 침묵할 때(`state:"down"`) 또는 복구될 때(`state:"ok"`) 에지에서 발행됩니다. UI에서 거래소를 비활성화 표시하는 데 사용하세요. 호가 전달은 상태에 의해 게이팅되지 않습니다 — 피드는 다음 호가에서 자동 복구됩니다.

### 구독

기본적으로 모든 데이터를 수신합니다. 스트림을 좁히려면 제어 메시지를 전송하세요:

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

필드를 생략하면 모든 값과 일치합니다 (`{"symbol":"SOL"}` = 모든 거래소의 SOL). `venue`는 대소문자를 구분하지 않고 매칭됩니다.

**서버 응답:**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

오류는 `{"channel":"error","error":"<reason>"}`를 반환합니다.

### 하트비트 및 활성 확인

- 서버는 20초마다 **WebSocket Ping**을 전송합니다; 호환 클라이언트는 자동으로 Pong을 응답합니다.
- 60초 동안 무응답인 클라이언트는 종료 및 정리됩니다.
- 앱 수준 킵얼라이브: `{"method":"ping"}` → `{"channel":"pong"}`.

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
    # 알 수 없는 타입: 조용히 무시 (전방 호환성)

ws = websocket.WebSocketApp("ws://localhost:8081", on_message=on_message)
ws.run_forever()
```

### 입력 소스 및 WebSocket 백스톱

Edge 멀티캐스트 피드는 상시 활성화됩니다. 선택적 **공개 WebSocket 백스톱**은 Edge 피드가 중단될 때 갭을 채울 수 있습니다. 두 가지가 있으며, 각각 기본적으로 비활성화되고 거래소별로 독립적으로 활성화됩니다:

| 백스톱 | 활성화 방법 | 커버 범위 | 기본 URL |
|--------|------------|----------|----------|
| **Hyperliquid** | `WS_INPUT_COINS` (예: `BTC,ETH`) | 호가 + 거래 | `wss://api.hyperliquid.xyz/ws` (`WS_INPUT_URL`) |
| **Phoenix** | `PHOENIX_WS_INPUT_MARKETS` (티커, 예: `SOL,BTC`) | **거래만** | `wss://perp-api.phoenix.trade/v1/ws` (`PHOENIX_WS_INPUT_URL`) |

```bash
# BTC과 ETH에 대한 Hyperliquid 백스톱 활성화:
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# SOL에 대한 Phoenix 거래 백스톱 활성화:
PHOENIX_WS_INPUT_MARKETS=SOL DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

각 `(venue, symbol, source_ts)` 틱에 대해, Edge와 공개 소스가 공유 중재기 내에서 경쟁합니다. 정상 상태에서는 Edge 소스가 승리합니다(인터넷 상의 수십 ms 대비 1ms 미만); Edge에 갭이 발생하면 공개 복사본이 채웁니다. WebSocket 출력은 어떤 소스가 특정 업데이트를 전달했는지에 관계없이 동일합니다. (Phoenix 백스톱은 거래만 제공합니다 — Edge가 Phoenix 호가의 유일한 소스로 남습니다.)

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

메트릭 엔드포인트는 **기본적으로 비활성화**되어 있습니다. `METRICS_BIND`로 활성화하세요:

```bash
METRICS_BIND=127.0.0.1:9090 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

그런 다음 스크레이핑:

```bash
curl -s localhost:9090/metrics | grep '^dz_'
```

주요 