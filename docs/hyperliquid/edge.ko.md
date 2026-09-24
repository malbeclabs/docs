---
description: "DoubleZero Edge에서 Hyperliquid 시장 데이터를 구독하기 — 설정, 메트로, 피드 요청 및 승인 후 연결."
---

# Hyperliquid 구독 (Edge)

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 이용 약관](https://doublezero.xyz/terms-protocol)에 동의합니다. 데이터는 내부 목적으로만 사용할 수 있으며 재전송할 수 없습니다(섹션 2(e) 참조)."

Hyperliquid 피드는 DoubleZero Edge를 통해 UDP 멀티캐스트로 시장 데이터를 전달합니다. 네 가지 핵심 피드가 Hyperliquid 네이티브 무기한 선물(`hl`)과 [trade.xyz](https://trade.xyz) 무기한 선물(`xyz`)을 다룹니다:

| 피드 | 설명 |
|------|-------------|
| `hyper-hl-tob` | Hyperliquid 무기한 선물의 최우선 호가 및 체결 내역 |
| `hyper-hl-mbo` | Hyperliquid 무기한 선물의 전체 주문별 호가창 (추가, 취소, 체결) |
| `hyper-xyz-tob` | trade.xyz 무기한 선물의 최우선 호가 및 체결 내역 |
| `hyper-xyz-mbo` | trade.xyz 무기한 선물의 전체 주문별 호가창 (추가, 취소, 체결) |

서비스 개요: [Hyperliquid](index.md).

## 어떤 경로를 선택해야 하나요?

| 모드 | 제공 내용 | 사용 시기 |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — 디코딩 + 정규화된 JSON WebSocket | 사용 가능한 호가 스트림까지 가장 빠른 경로 |
| **네이티브 멀티캐스트** | `doublezero1`에서 구독하고 바이너리 UDP를 직접 디코딩(또는 참조 파서 사용) | 와이어에 대한 완전한 제어 |

공통 단계를 먼저 수행합니다: 방화벽, 메트로, 신청, 결제(1~3단계). 승인 후 [4단계](#step-4-connect-after-approval)에서 분기합니다 — **Edge Connect** 또는 **네이티브**. 같은 호스트에서 두 가지를 혼합하지 마세요.

AI가 설치를 도와주길 원하시나요? [DoubleZero MCP](../mcp.md)를 연결하고 Hyperliquid Edge 설정을 안내해 달라고 요청하세요.

---

## 1단계: DoubleZero 설정

**설정 완료**


[설정](../setup.md) 안내에 따라 호스트에 DoubleZero 클라이언트를 설치하고 구성하세요.

이전에 네이티브 사용을 위해 호스트에서 DoubleZero를 설정한 적이 있다면 클라이언트가 최신 버전인지 확인하세요:

```bash
sudo apt update && sudo apt install doublezero
```

**방화벽 구성**


`doublezero1`에서 GRE, BGP, PIM 및 Hyperliquid 피드 트래픽을 허용하세요. Hyperliquid UDP 포트는 `20000`–`20999` 범위에 있습니다(Top-of-Book 및 Market-by-Order 시장, 참조, 스냅샷). 또한 터널에서 DoubleZero 하트비트를 위해 UDP `5765`를 허용하세요. 새 피드가 추가될 때 방화벽 변경이 필요 없도록 피드 대역을 열어두세요. [피드 주소](#feed-addresses)를 참조하세요.

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid 시장 / 참조 / 스냅샷 (모든 피드)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 20000:20999 -j ACCEPT
# DoubleZero 하트비트
sudo iptables -A INPUT -i doublezero1 -p udp --dport 5765 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Hyperliquid 시장 / 참조 / 스냅샷 (모든 피드)
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# DoubleZero 하트비트
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

구독하는 피드의 포트로만 이 규칙을 제한할 수 있습니다([피드 주소](#feed-addresses) 참조).

---

## 2단계: 메트로 선택

피드를 수신할 머신에서 가장 지연 시간이 낮은 위치를 확인하세요:

```bash
doublezero latency
```

가장 낮은 지연 시간 결과에서 메트로 / 도시를 확인하세요. 신청 양식에서 해당 도시를 선택하게 됩니다. 메트로가 어떻게 그룹화되어 있는지 [토폴로지 맵](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth)을 참조하세요.

**가격**


피드는 전달 지역별로 가격이 책정됩니다. 가격은 구매자의 위치가 아니라 데이터가 전달되는 곳을 따릅니다. 도쿄 패키지는 도쿄 수신자에게 전달되며, 다른 곳으로의 전달은 글로벌 패키지가 필요합니다. 피드당, 메트로당 두 개의 수신 호스트(IP)가 포함됩니다.

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
3. 필요한 **도시**(메트로)를 선택합니다. 위의 표와 `doublezero latency`를 사용하여 선택하세요.
4. 신청 양식을 작성합니다.

[계정](https://doublezero.xyz/shreds/account) 페이지에서 각 피드 요청에 DoubleZero ID(기존 키 또는 새로 생성)를 할당합니다. 일치하는 **프라이빗 키가 피드를 수신할 머신에 존재해야 합니다** — 해당 호스트로 이동할 수 없는 퍼블릭 키를 할당하지 마세요.

**메트로**와 **퍼블릭 키**를 선택합니다. 신청 시 퍼블릭 IP를 바인딩하지 **않습니다**. 구독 기간 동안 **선택한 메트로 내에서** IP 간에 접근을 이동할 수 있습니다.

적시에 추가 안내와 함께 연락을 받게 됩니다(**영업일 기준 1~3일** 예상).

---

## 4단계: 승인 후 연결

신청을 제출하면 인보이스를 받게 되며, 결제가 완료되면 승인된 각 머신에서 연결합니다. 선택한 시작 날짜에 접근이 활성화됩니다. 아래에서 **하나의** 경로를 선택하세요.

### 4a. Edge Connect

호스트에서 `doublezerod`가 이미 실행 중인 경우([설정](../setup.md)에서), 먼저 중지하세요 — 컨테이너의 데몬과 동일한 터널을 두고 충돌합니다:

```bash
sudo systemctl stop doublezerod
```

승인 및 결제 **후에** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect)를 설치합니다. 브릿지는 `--network host` 컨테이너 내부에서 DoubleZero에 합류하고 `ws://<host>:8081`에서 정규화된 JSON을 제공합니다.

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**모든 `doublezero` 명령은 호스트 CLI가 아닌 컨테이너를 통해 실행합니다**:

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    컨테이너에 쉽게 명령을 보내기 위한 별칭을 만들 수 있습니다. 이 예시는 `dz status`가 컨테이너 내부에서 `doublezero status`와 동일하게 작동하도록 합니다:

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

`BGP Session Up`과 구독된 `edge-hyper-…` 그룹이 표시되어야 합니다.

그런 다음 WebSocket(`ws://127.0.0.1:8081`)을 엽니다. 프로토콜: [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md). 전체 안내: [MCP](../mcp.md) 런북 `hyperliquid-edge`.

### 4b. 네이티브 멀티캐스트

할당된 프라이빗 키가 있는 호스트에서(호스트 `doublezerod`가 실행 중인 상태), 구매한 피드를 구독합니다:

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

여러 피드를 공백으로 구분:

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

터널을 확인합니다:

```bash
doublezero status
```

올바른 DoubleZero 네트워크에서 `BGP Session Up`이 표시되어야 합니다. 그런 다음 와이어를 직접 디코딩하세요 — [피드 디코딩](#decode-the-feed)을 참조하세요.

---

## 결제

시트는 **월별**로 청구됩니다. 시트 만료 날짜를 주시하세요.

시트가 만료되기 전에 인보이스를 결제해야 합니다. **결제하지 않으면 시트가 제거됩니다.**

---

## 피드 주소

IP는 멀티캐스트 그룹을 선택합니다. 포트는 해당 그룹의 스트림을 선택합니다. 다음 명령으로 IP 실시간 값을 확인하세요:

```bash
doublezero multicast group list
```

| 피드 | 설명 | 멀티캐스트 그룹 | 시장 | 참조 | 스냅샷 | 사양 |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Hyperliquid 무기한 선물의 최우선 호가 및 체결 내역 | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Hyperliquid 무기한 선물의 전체 주문별 호가창 | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | trade.xyz 무기한 선물의 최우선 호가 및 체결 내역 | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | trade.xyz 무기한 선물의 전체 주문별 호가창 | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

각 피드에는 고유한 멀티캐스트 그룹 주소가 있습니다. 포트: 참조 = 시장 + `1`; 스냅샷(MBO 전용) = 시장 + `2`. 시장과 참조를 함께 바인딩하는 것을 권장하며, MBO의 경우 스냅샷도 함께 바인딩하세요.

`doublezero1`의 포트 `5765`에서 소규모 UDP 패킷이 보일 수도 있습니다 — DoubleZero 하트비트이며 시장 데이터가 아닙니다.

프레임은 리틀 엔디안 고정 크기 바이너리입니다. Hyperliquid 네이티브 무기한 선물은 `source_id=1`을 사용하고, trade.xyz 무기한 선물은 `source_id=7`을 사용합니다.

---

## 피드 디코딩

!!! note "Edge Connect"
    `doublezero-edge-connect`를 사용하는 경우, 피드는 이미 WebSocket을 통해 JSON으로 디코딩되어 있습니다 — 수동 디코딩을 건너뛰세요.

**참조 파서 사용**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref)는 와이어 형식을 디코딩하고 Unix 소켓에서 JSON으로 재발행하는 멀티캐스트 구독자를 제공합니다:

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) — Top-of-Book & Trades용
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) — Market-by-Order용

전체 파이프라인은 [메인 README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines)를 참조하세요.

**직접 디코더 작성**

[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)에 따라 디코딩하세요. 프레임 헤더로 시작한 다음, 수신하는 피드의 메시지 레이아웃을 확인하세요.

**GRE 터널 헤더 — XDP**

네트워크를 통해 전달되는 시장 데이터 트래픽은 라스트 마일에서 GRE로 캡슐화됩니다. `doublezero1`에서 클라이언트는 일반 UDP 멀티캐스트를 제공합니다. GRE를 직접 종단하는 경우(예: XDP 파이프라인), 디코더에 데이터를 전달하기 전에 GRE 헤더를 제거하세요. [`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap)을 참조하세요.

---

## 문제 해결

여기에서 다루지 않는 문제가 발생하면, 우회 방법을 시도하기 전에 기존 채널을 통해 문의해 주세요. 채널이 없는 경우 [지원](../support.md)을 참조하세요.

**클라이언트가 최신 버전인지 확인**


```bash
sudo apt update && sudo apt install doublezero
```

**터널이 올라오지 않는 경우**


1. **Edge Connect:** 컨테이너에서 상태를 확인합니다 — `docker exec doublezero-edge-connect doublezero status`. 호스트의 `doublezero status`는 피드가 정상이어도 종종 실패합니다(컨테이너가 데몬을 소유). 호스트의 `doublezerod`가 중지되었는지 확인하세요.
2. **네이티브:** 호스트 데몬이 실행 중인지 확인합니다: `sudo systemctl status doublezerod`
3. 방화벽 규칙이 적용되어 있는지 확인합니다(GRE, BGP, PIM, Hyperliquid UDP 포트 및 `doublezero1`의 `5765`)
4. 이 시트의 인보이스가 결제되었고 시작 날짜가 지났는지 확인합니다
5. 선택한 경로([4a](#4a-edge-connect) 또는 [4b](#4b-native-multicast))에서 계정 페이지와 일치하는 키로 connect를 실행합니다
6. connect를 실행한 동일한 위치(컨테이너 또는 호스트)에서 `BGP Session Up`이 표시되어야 합니다

**구독 후 패킷이 없는 경우**


1. 구독되어 있는지 확인합니다: `doublezero user list`
2. 그룹에 피드가 표시되는지 확인합니다: `doublezero multicast group list`
3. 터널에서 캡처합니다. 예: Hyperliquid TOB: `sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. 원하는 피드에 대해 시장과 참조를 함께 바인딩하는 것을 권장합니다(MBO의 경우 스냅샷도 포함)

**구매한 피드가 누락된 경우 (Edge Connect)**

`doublezero status`에서 구매한 피드가 누락된 경우, 컨테이너 내부에서 구독합니다:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-code>
```

여러 피드를 공백으로 구분:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

**시트 만료 또는 제거**


시트는 월별입니다. 만료 전에 인보이스를 결제하지 않으면 시트가 제거되고 터널이 유지되지 않습니다.

**"Multicast user already exists"**


다른 경로를 통해 이미 활성 구독이 있습니다. 먼저 연결을 해제한 다음 connect를 다시 시도하세요:

- **Edge Connect:** `docker exec doublezero-edge-connect doublezero disconnect`
- **네이티브:** `doublezero disconnect`

그런 다음 동일한 경로(컨테이너 또는 호스트)에서 `doublezero connect multicast --subscribe-feed <feed-code>`를 다시 시도합니다.

**AWS 관련**


인스턴스 ENI의 소스/목적지 확인을 비활성화하세요. 이 설정 없이는 GRE 캡슐화된 멀티캐스트가 드롭될 수 있습니다.