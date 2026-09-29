---
description: "DoubleZero Edge에서 Hyperliquid 시장 데이터 구독하기 — 설정, 메트로, 피드 요청, 승인 후 연결."
---

# Hyperliquid 구독하기 (Edge)

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol)에 동의합니다. 데이터는 내부 목적으로만 사용 가능하며 재전송이 불가합니다 (섹션 2(e) 참조)."

Hyperliquid 피드는 DoubleZero Edge를 통해 UDP 멀티캐스트로 시장 데이터를 전달합니다. 네 가지 핵심 피드가 Hyperliquid 네이티브 무기한 선물 (`hl`)과 [trade.xyz](https://trade.xyz) 무기한 선물 (`xyz`)을 다룹니다:

| 피드 | 설명 |
|------|-------------|
| `hyper-hl-tob` | Hyperliquid 무기한 선물의 최우선 매수/매도 호가 및 체결 내역 |
| `hyper-hl-mbo` | Hyperliquid 무기한 선물의 전체 주문별 호가창 (추가, 취소, 체결) |
| `hyper-xyz-tob` | trade.xyz 무기한 선물의 최우선 매수/매도 호가 및 체결 내역 |
| `hyper-xyz-mbo` | trade.xyz 무기한 선물의 전체 주문별 호가창 (추가, 취소, 체결) |

서비스 개요: [Hyperliquid](index.md).

## 어떤 경로를 선택해야 하나요?

| 모드 | 제공 내용 | 사용 시점 |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — WebSocket을 통한 디코딩된 JSON | 사용 가능한 호가 스트림까지 가장 빠른 경로 |
| **네이티브 멀티캐스트** | `doublezero1`에서 구독, 바이너리 UDP를 직접 (또는 참조 파서로) 디코딩 | 와이어에 대한 완전한 제어 |

공통 단계 먼저: 방화벽, 메트로, 신청, 결제 (1~3단계). 승인 후 [4단계](#step-4-connect-after-approval)에서 분기됩니다 — **Edge Connect** 또는 **네이티브**. 동일한 호스트에서 두 방식을 혼합하지 마세요.

AI가 설치를 도와주길 원하시나요? [DoubleZero MCP](../mcp.md)를 연결하고 Hyperliquid Edge 설정을 안내해 달라고 요청하세요.

---

## 1단계: DoubleZero 설정

**설정 완료**


[설정](../setup.md) 안내를 따라 호스트에 DoubleZero 클라이언트를 설치하고 구성하세요.

이전에 네이티브 용도로 호스트에 DoubleZero를 설정한 적이 있다면, 클라이언트가 최신인지 확인하세요:

```bash
sudo apt update && sudo apt install doublezero
```

**방화벽 구성**


`doublezero1`에서 GRE, BGP, PIM, 및 Hyperliquid 피드 트래픽을 허용하세요. Hyperliquid UDP 포트는 `20000`–`20999` 범위에 있습니다 (Top-of-Book, Market-by-Order 시장, 참조, 스냅샷). 또한 터널의 DoubleZero 하트비트를 위해 UDP `5765`도 허용하세요. 새로운 피드가 추가될 때 방화벽 변경이 필요 없도록 피드 대역을 열어두세요. [피드 주소](#feed-addresses)를 참조하세요.

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid market / reference / snapshot (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 20000:20999 -j ACCEPT
# DoubleZero heartbeats
sudo iptables -A INPUT -i doublezero1 -p udp --dport 5765 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Hyperliquid market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# DoubleZero heartbeats
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

UFW에는 `pim` 프로토콜이 없습니다. 아웃바운드 PIM은 UFW의 기본 아웃고잉 정책에 의해 허용됩니다; 아웃고잉 트래픽을 거부하는 경우 `/etc/ufw/before.rules`에 PIM에 대한 raw 규칙을 추가하세요.

구독하는 피드의 포트만으로 이 규칙을 더 엄격하게 제한할 수 있습니다 ([피드 주소](#feed-addresses) 참조).

---

## 2단계: 메트로 선택

피드를 수신할 머신에서 가장 낮은 지연 시간의 위치를 확인하세요:

```bash
doublezero latency
```

가장 낮은 지연 시간 결과에서 메트로 / 도시를 기록하세요. 신청 양식에서 해당 도시를 선택하게 됩니다. 메트로 그룹화 방식은 [토폴로지 맵](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth)을 참조하세요.

**가격**


피드는 전달 지역별로 가격이 책정됩니다. 가격은 구매자의 위치가 아니라 데이터가 전달되는 곳을 기준으로 합니다. 도쿄 패키지는 도쿄 수신자에게 전달됩니다; 다른 곳으로의 전달은 글로벌 패키지가 필요합니다. 피드당, 메트로당 두 개의 수신 호스트(IP)가 포함됩니다.

| 피드 | 도쿄 /월 | 글로벌 /월 |
| --- | --- | --- |
| Hyperliquid 무기한 선물 Top-of-Book (L1) | $900 | $1,500 |
| Hyperliquid 무기한 선물 Market-by-Order (L4) | $3,000 | $5,000 |
| trade.xyz 무기한 선물 Top-of-Book (L1) | $900 | $1,500 |
| trade.xyz 무기한 선물 Market-by-Order (L4) | $3,000 | $5,000 |
| **모든 피드 (번들 ~30% 할인)** | **$5,500** | **$9,000** |

---

## 3단계: 요청 제출

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)로 이동합니다.
2. **Hyperliquid**와 필요한 피드를 선택합니다.
3. 필요한 **도시** (메트로)를 선택합니다. 위의 표와 `doublezero latency`를 사용하여 선택하세요.
4. 신청 양식을 완성합니다.

[계정](https://doublezero.xyz/shreds/account) 페이지에서 각 피드 요청에 DoubleZero ID (기존 키 또는 새로 생성)를 할당합니다. 일치하는 **프라이빗 키는 피드를 수신할 머신에 있어야 합니다** — 해당 호스트로 이동할 수 없는 프라이빗 키의 공개키를 할당하지 마세요.

**메트로**와 **공개키**를 선택합니다. 신청 시점에 공개 IP를 바인딩하지 **않습니다**. 구독 기간 중 **선택한 메트로 내에서** IP 간 액세스를 이동할 수 있습니다.

적시에 추가 안내와 함께 연락을 받으실 것입니다 (**1~3 영업일** 예상).

---

## 4단계: 승인 후 연결 {#step-4-connect-after-approval}

신청서를 제출하면 인보이스를 받게 됩니다; 결제가 완료되면 승인된 각 머신에서 연결합니다. 선택한 시작 날짜에 액세스가 활성화됩니다. 아래에서 **하나의** 경로를 선택하세요.

### 4a. Edge Connect {#4a-edge-connect}

호스트 `doublezerod`가 이미 실행 중인 경우 ([설정](../setup.md)에서), 호스트와 컨테이너의 자체 데몬이 모두 UDP 포트 `44880`을 바인딩하므로 컨테이너의 데몬이 시작 직후 종료됩니다. 설치 프로그램은 호스트 데몬을 중지하고 비활성화할 것을 제안하며, `DZ_ASSUME_YES=1`이 설정된 경우 확인 없이 자동으로 수행합니다. 직접 수행하려면:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

승인 및 결제 **후에** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect)를 설치합니다. 브리지는 `--network host` 컨테이너 내에서 DoubleZero에 참여하고 `ws://<host>:8081`에서 디코딩된 JSON을 제공합니다.

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**모든 `doublezero` 명령은 호스트 CLI가 아닌 컨테이너를 통해** 실행됩니다:

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    컨테이너에 대한 명령을 간편하게 사용할 수 있도록 별칭을 만들 수 있습니다. 이 예시에서는 컨테이너 내부의 `doublezero status`와 동일하게 `dz status`로 작동하도록 합니다:

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

`BGP Session Up`과 `edge-hyper-…` 그룹 구독이 표시될 것입니다.

그런 다음 WebSocket (`ws://127.0.0.1:8081`)을 엽니다. 프로토콜: [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md). 전체 가이드: [MCP](../mcp.md) 런북 `hyperliquid-edge`.

### 4b. 네이티브 멀티캐스트 {#4b-native-multicast}

할당된 프라이빗 키가 있는 호스트에서 (호스트 `doublezerod`가 실행 중인 상태로), 구매한 피드를 구독합니다:

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

여러 피드, 공백으로 구분:

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

터널을 확인합니다:

```bash
doublezero status
```

올바른 DoubleZero 네트워크에서 `BGP Session Up`이 표시될 것입니다. 그런 다음 와이어를 직접 디코딩합니다 — [피드 디코딩](#decode-the-feed)을 참조하세요.

---

## 청구

좌석은 **월별**로 청구됩니다. 좌석 만료 날짜를 확인하세요.

좌석이 만료되기 전에 인보이스를 결제해야 합니다. **미결제 시 좌석이 제거됩니다.**

---

## 피드 주소 {#feed-addresses}

IP는 멀티캐스트 그룹을 선택합니다. 포트는 해당 그룹의 스트림을 선택합니다. 다음으로 IP 실시간 값을 확인하세요:

```bash
doublezero multicast group list
```

| 피드 | 설명 | 멀티캐스트 그룹 | Market | Reference | Snapshot | 스펙 |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Hyperliquid 무기한 선물의 최우선 매수/매도 호가 및 체결 내역 | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Hyperliquid 무기한 선물의 전체 주문별 호가창 | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | trade.xyz 무기한 선물의 최우선 매수/매도 호가 및 체결 내역 | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | trade.xyz 무기한 선물의 전체 주문별 호가창 | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

각 피드에는 고유한 멀티캐스트 그룹 주소가 있습니다. 포트: reference = market + `1`; snapshot (MBO 전용) = market + `2`. market과 reference를 함께 바인딩하는 것을 권장합니다; MBO의 경우 snapshot도 함께 바인딩하세요.

`doublezero1`에서 포트 `5765`로 전송되는 작은 UDP 패킷을 볼 수도 있습니다 — 이는 DoubleZero 하트비트이며 시장 데이터가 아닙니다.

프레임은 리틀엔디안 고정 크기 바이너리입니다. Hyperliquid 네이티브 무기한 선물은 `source_id=1`을 사용하고; trade.xyz 무기한 선물은 `source_id=7`을 사용합니다.

---

## 피드 디코딩 {#decode-the-feed}

!!! note "Edge Connect"
    `doublezero-edge-connect`를 사용하는 경우 피드는 이미 WebSocket을 통해 JSON으로 디코딩되어 있으므로 수동 디코딩을 건너뛰세요.

**참조 파서 사용**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref)는 와이어 포맷을 디코딩하고 Unix 소켓에서 JSON으로 재발행하는 멀티캐스트 구독자를 제공합니다:

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) Top-of-Book 및 체결용
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) Market-by-Order용

전체 파이프라인은 [메인 README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines)를 참조하세요.

**자체 디코더 작성**

[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)에 맞춰 디코딩하세요. 프레임 헤더로 시작한 다음 수신 중인 피드의 메시지 레이아웃을 따르세요.

**GRE 터널 헤더 — XDP**

네트워크를 통해 전달되는 시장 데이터 트래픽은 라스트 마일에서 GRE로 캡슐화됩니다. `doublezero1`에서 클라이언트는 일반 UDP 멀티캐스트를 제공합니다. GRE를 직접 종단하는 경우 (예: XDP 파이프라인), 디코더에 데이터를 공급하기 전에 GRE 헤더를 제거하세요. [`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap)을 참조하세요.

---

## 문제 해결

여기에 포함되지 않은 문제가 발생하면 우회 방법을 시도하기 전에 기존 채널을 통해 문의해 주세요. 채널이 없는 경우 [지원](../support.md)을 참조하세요.

**클라이언트가 최신인지 확인**


```bash
sudo apt update && sudo apt install doublezero
```

**터널이 올라오지 않음**


1. **Edge Connect:** 컨테이너에서 상태를 실행하세요 — `docker exec doublezero-edge-connect doublezero status`. 호스트 `doublezero status`는 피드가 정상이어도 자주 실패합니다 (컨테이너가 데몬을 소유). 호스트 `doublezerod`가 중지되어 있는지 확인하세요.
2. **네이티브:** 호스트 데몬이 실행 중인지 확인: `sudo systemctl status doublezerod`
3. 방화벽 규칙이 적용되어 있는지 확인 (`doublezero1`에서 GRE, BGP, PIM, Hyperliquid UDP 포트 및 `5765`)
4. 이 좌석의 인보이스가 결제되었고 시작 날짜가 지났는지 확인
5. 계정 페이지의 키와 일치하는 키로 선택한 경로 ([4a](#4a-edge-connect) 또는 [4b](#4b-native-multicast))에서 connect를 실행
6. connect를 실행한 동일한 위치 (컨테이너 또는 호스트)에서 `BGP Session Up`이 표시될 것입니다

**구독 후 패킷이 없음**


1. 구독이 되어 있는지 확인: `doublezero user list`
2. 그룹 아래에 피드가 표시되는지 확인: `doublezero multicast group list`
3. 터널에서 캡처, 예: Hyperliquid TOB: `sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. 원하는 피드에 대해 market과 reference를 함께 바인딩하는 것을 권장 (MBO의 경우 snapshot도)

**구매한 피드가 누락됨 (Edge Connect)**

구매한 피드가 `doublezero status`에 표시되지 않으면 컨테이너 내에서 구독하세요:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-code>
```

여러 피드, 공백으로 구분:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

**좌석 만료 또는 제거**


좌석은 월별입니다. 만료 전에 인보이스를 결제하지 않으면 좌석이 제거되고 터널이 유지되지 않습니다.

**"Multicast user already exists"**


다른 경로를 통해 이미 활성 구독이 있습니다. 먼저 연결을 해제한 다음 connect를 재시도하세요:

- **Edge Connect:** `docker exec doublezero-edge-connect doublezero disconnect`
- **네이티브:** `doublezero disconnect`

그런 다음 동일한 경로 (컨테이너 또는 호스트)에서 `doublezero connect multicast --subscribe-feed <feed-code>`를 재시도하세요.

**AWS 관련**


인스턴스 ENI의 소스/대상 확인을 비활성화하세요. 이 설정이 없으면 GRE로 캡슐화된 멀티캐스트가 드롭될 수 있습니다.