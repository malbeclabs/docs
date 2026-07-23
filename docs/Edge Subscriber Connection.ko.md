---
description: DoubleZero 슈레드 피드를 수신하기 위한 엣지 구독자 설정, 클라이언트 설정 및 GRE, BGP, PIM, 슈레드 트래픽에 대한 방화벽 규칙을 포함합니다.
---

# 엣지 구독자 연결
!!! warning "DoubleZero에 연결함으로써 [DoubleZero 이용 약관](https://doublezero.xyz/terms-protocol)에 동의합니다. 데이터는 내부 목적으로만 사용 가능하며 재전송할 수 없습니다(섹션 2(e) 참조)."

## 1단계: DoubleZero 설정

### 1. 설정 완료

[Solana CLI](https://docs.anza.xyz/cli/install)를 설치합니다.

[설정](setup.md) 지침에 따라 DoubleZero 클라이언트를 설치하고 구성합니다.

이전에 DoubleZero를 설정한 적이 있다면, `sudo apt update && sudo apt install doublezero-solana` 명령으로 최신 Doublezero-Solana CLI가 설치되어 있는지 확인하세요.

### 2. 방화벽 구성

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
sudo ufw allow out on doublezero1 proto pim from any to any
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

### 3. 리컨사일러 활성화

리컨사일러는 온체인 상태를 모니터링하고 좌석이 할당되면 자동으로 터널을 프로비저닝합니다. 기본적으로 활성화되어 있지 않습니다.

```bash
doublezero enable
```

---

## 2단계: 지갑 설정

### 1. Solana 키페어 생성

`doublezero-solana` CLI는 온체인 좌석 관리를 위해 표준 Solana 키페어를 사용합니다. 키페어가 없는 경우:

```bash
solana-keygen new
```

이 명령은 `~/.config/solana/id.json`에 파일을 생성합니다. 다른 경로를 사용하려면 `doublezero-solana` 명령에 `--keypair <path>`를 전달하세요.

지갑 주소를 출력합니다:

```bash
solana address
```

### 2. 지갑에 자금 충전

지갑에 두 가지 토큰이 필요합니다:

- **SOL** — Solana 트랜잭션 수수료용. 위에서 출력된 지갑 주소로 SOL을 전송합니다.
- **USDC** — 좌석 자금 충전용. CLI는 메인넷 USDC 민트(`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`)에 대한 지갑의 연관 토큰 계정(ATA)에서 자금을 인출합니다.

---

## 3단계: 좌석 구매

### 1. 가장 가까운 장치 찾기

좌석을 구매하기 전에 머신에서 가장 낮은 지연 시간을 가진 장치를 확인합니다:

```bash
doublezero latency
```

가장 낮은 지연 시간 결과의 장치 코드를 기록해 두세요(예: `<Device_Name>`). 좌석 구매 시 이 코드를 사용합니다.

### 2. 가격 확인

자금을 투입하기 전에 현재 장치 가격을 확인합니다. 가격은 **기본 메트로 가격**과 **장치별 프리미엄** 두 가지 요소로 구성됩니다. [여기](https://data.malbeclabs.com/dz/shreds/devices)에서도 가격 및 가용성을 확인할 수 있습니다.

**모든 장치:**

```bash
doublezero-solana shreds price
```

**특정 장치:**

```bash
doublezero-solana shreds price --device-code <Device_Name>
doublezero-solana shreds price --device <PUBKEY>
```

**메트로 내 모든 장치:**

```bash
doublezero-solana shreds price --metro <PUBKEY>
```

출력 열: `Device Code`, `Metro Code`, `Metro Name`, `Status`, `Settled Seats`, `Available Seats`, `Base Price (USDC)`, `Premium (USDC)`, `Epoch Price (USDC)`.

에포크 가격은 해당 장치의 좌석당 에포크당 총 비용(기본 + 프리미엄)입니다. 전체 공개 키를 표시하려면 `--wide`를, JSON 출력을 원하면 `--json`을 사용하세요.

### 3. 좌석 구매

단일 명령으로 좌석을 구매합니다. 이 명령은 좌석을 초기화하고, 에스크로에 자금을 충전하고, 할당을 요청합니다:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**매개변수:**

| 플래그 | 설명 |
|------|-------------|
| `--device <PUBKEY>` | 공개 키로 대상 장치 지정 (`--device-code`와 상호 배타적) |
| `--device-code <CODE>` | 사람이 읽을 수 있는 코드로 대상 장치 지정 (예: `<Device_Name>`) |
| `--client-ip <IP>` | 머신의 공용 IPv4 주소 |
| `--amount <USDC>` | 충전할 USDC (소수점 형식, 예: `100` = 100 USDC). 최소 에포크 가격을 충족해야 합니다. |
| `--source-token-account <PUBKEY>` | 사용자 지정 USDC 소스 계정 (기본값은 지갑의 ATA) |
| `--accept-partial-epoch` | 에포크 잔여 경고 건너뛰기 (아래 참조) |
| `--fee-payer <PATH>` | SOL 트랜잭션 수수료에 다른 지갑 사용 |
| `--dry-run` | 실행하지 않고 트랜잭션 시뮬레이션 |
| `--with-compute-unit-price <PRICE>` | 혼잡 시 빠른 포함을 위한 컴퓨트 유닛 가격 설정 |

좌석이 할당되면 데몬이 자동으로 GRE 터널을 구축합니다. 다음 명령으로 연결을 확인하세요:

```bash
doublezero status
```

### 에포크 타이밍

좌석은 Solana 에포크(약 2일)별로 할당됩니다. 결제 시 현재 에포크의 10% 미만이 남아 있는 경우, CLI는 좌석이 즉시 할당되지만 현재 에포크의 나머지 기간만 적용된다는 경고를 표시합니다. 다음 에포크가 시작되면 에스크로에서 별도의 결제가 차감됩니다.

!!! info "좌석을 잃지 않으려면 한 번에 1 에포크 이상의 자금을 충전하는 것이 좋습니다. [여기](https://explorer.solana.com/)에서 현재 에포크의 남은 시간을 확인할 수 있습니다."

`--accept-partial-epoch`를 사용하여 이 경고를 우회할 수 있습니다.

### 에스크로 자금 유지

!!! warning "정산 시점에 에스크로 잔액이 에포크 가격보다 낮으면 좌석이 할당되지 않고, 터널이 해제되며, 누적된 재직 기간(tenure)을 잃게 됩니다. 재직 기간은 향후 에포크에서의 우선순위를 결정하므로, 잃게 되면 신규 참여자로서 다시 경쟁해야 합니다."

이 계정에 여러 에포크분의 자금을 초과 충전할 수 있습니다. 각 정산 시 에스크로에서 1 에포크 가격이 차감되며, 나머지 잔액은 이월됩니다. 예를 들어, 에포크당 가격의 5배를 충전하면 재충전 없이 최대 5 에포크 동안 좌석이 유지됩니다.

에스크로를 추가 충전하려면 언제든지 `shreds pay`를 다시 실행하세요:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

`Target_IP`는 슈레드를 수신할 머신의 공용 IPv4 주소여야 합니다. 대상 머신에서 `curl -4 ifconfig.me`와 같은 명령을 실행하여 확인할 수 있습니다.

### 좌석 모니터링

이 섹션에서는 CLI를 통해 좌석을 확인하는 방법을 설명합니다. [https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs)를 사용하여 좌석을 모니터링하고 에스크로 계정 관리를 지원받을 수도 있습니다.

활성 좌석 및 에스크로 잔액을 확인합니다:

**모든 좌석:**

```bash
doublezero-solana shreds list
```

**장치별 필터:**

```bash
doublezero-solana shreds list --device-code <Device_Name>
```

**클라이언트 IP별 필터:**

```bash
doublezero-solana shreds list --client-ip <Target_IP>
```

**지갑별 필터:**

```bash
doublezero-solana shreds list --withdraw-authority <PUBKEY>
```

출력 열: `Device Code`, `Client IP`, `Tenure`, `Balance (USDC)`, `Est. Epochs Paid`.

"Est. Epochs Paid" 열은 현재 가격 기준으로 현재 잔액이 몇 에포크를 커버하는지 보여줍니다. 가격이 변경되면 이 추정치도 조정됩니다.

### 자금 인출

에스크로를 닫고 남은 USDC를 지갑으로 환불합니다:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

다른 명령과 마찬가지로 `--device <PUBKEY>` 또는 `--device-code <CODE>`로 장치를 식별할 수 있습니다.

환불을 다른 토큰 계정으로 보내려면:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "인출하면 좌석과 누적된 재직 기간(tenure)을 잃게 됩니다."

---

## 슈레드 주소 (IP vs 포트)

리더 슈레드와 고스테이크 재전송 슈레드는 `doublezero1` 인터페이스를 통해 포트 `7733`으로 도착합니다. `doublezero0` 인터페이스는 유니캐스트 트래픽용입니다. 포트 `5765`는 슈레드 퍼블리셔의 하트비트 모니터이며, 슈레드를 포함하지 않습니다.

슈레드 소비의 경우, **IP 주소**는 멀티캐스트 스트림을 식별하고 **포트**는 해당 스트림의 UDP 서비스를 식별합니다.  
아래의 모든 슈레드 스트림은 `doublezero1`에서 UDP 포트 `7733`을 사용합니다.

다음 명령으로 멀티캐스트 그룹의 IP를 확인할 수 있습니다:

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

!!! note "네트워크를 통해 전달되는 슈레드 트래픽은 GRE 캡슐화되어 있습니다. 기존 파이프라인(예: XDP 기반 디슈레더)에 데이터를 전달하기 전에 GRE 헤더를 제거해야 할 수 있습니다."

---

## 도구 및 대시보드

### [엣지 스코어보드](https://data.malbeclabs.com/dz/shreds/scoreboard)

스코어보드는 슬롯 수준 데이터를 사용하여 DoubleZero Edge와 다른 제공업체 간의 슈레드 전달 속도를 실시간으로 비교 벤치마킹합니다. 이 대시보드를 사용하여 다른 제공업체 대비 Edge 슈레드 승률을 확인할 수 있습니다. 리더 슈레드만의 결과와 전체 피드 비교를 모두 볼 수 있습니다. 또한 지역별로 드릴다운하여 예상 성능을 확인할 수 있습니다.

### [엣지 퍼블리셔](https://data.malbeclabs.com/dz/shreds/publishers)

대시보드 좌측 상단의 "Publishing Shreds" 지표는 DoubleZero Edge에서 리더 슈레드를 퍼블리싱하는 모든 Solana 밸리데이터의 총 스테이크 가중치 비율을 보여줍니다. 네트워크의 각 퍼블리셔에 대한 세부 정보를 확인할 수 있습니다.

### [엣지 구독자, 장치 및 활동](https://data.malbeclabs.com/dz/shreds/subscribers)

이 페이지에서 구독 좌석에 대한 클라이언트 IP를 쉽게 검색하고 상태를 확인할 수 있습니다. 특정 좌석 구독을 클릭하여 결제 내역 및 활동을 확인할 수 있습니다. [장치](https://data.malbeclabs.com/dz/shreds/devices) 페이지에서 사용 가능한 장치를 확인하고, [활동](https://data.malbeclabs.com/dz/shreds/activity) 페이지에서 최근 모든 활동을 확인할 수도 있습니다.

### 데이터 API 문서

데이터 엔드포인트에 프로그래밍 방식으로 접근하려면 API 문서를 참조하세요: [https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs).

---

## 문제 해결

여기에서 다루지 않은 문제가 발생하면, 해결을 시도하기 전에 기존 채널을 통해 문의해 주세요. 채널이 없는 경우 [Discord](https://discord.gg/U2fEb4Jq)에서 검색하고 필요한 경우 티켓을 열어 주세요.

### 클라이언트가 최신 버전인지 확인:

실행: `sudo apt update && sudo apt install doublezero-solana`

### 에스크로 잔액 부족

정산 시점에 에스크로 잔액이 에포크 가격보다 낮으면 좌석이 할당되지 않고, 터널이 해제되며, 재직 기간이 상실됩니다. 다음 정산 전에 `shreds pay`로 추가 충전하세요.

### 결제 후 좌석이 할당되지 않음

- 에포크 후반에 결제했을 수 있습니다 — 좌석은 다음 에포크에 적용됩니다.
- 장치의 모든 좌석이 재직 기간이 더 긴 기존 사용자에게 점유되었을 수 있습니다. `shreds price`로 사용 가능한 좌석을 확인하세요.
- 정산 전에 인출한 경우 좌석이 자격을 갖추지 못합니다.

### 터널이 연결되지 않음

1. 데몬이 실행 중인지 확인: `sudo systemctl status doublezerod`
2. 리컨사일러가 활성화되어 있는지 확인: `doublezero enable`
3. 방화벽 규칙이 적용되어 있는지 확인 (GRE, BGP, PIM, `doublezero1`의 슈레드 트래픽, `doublezero0`의 포트 44880)
4. 현재 에포크에 좌석이 활성 상태인지 확인: `doublezero-solana shreds list`
5. 연결 상태 확인: `doublezero status`

데몬의 클라이언트 IP는 호스트의 공용 IP에서 자동으로 검색됩니다 — 좌석 명령에서 사용한 `--client-ip`와 일치하는지 확인하세요.

### 에포크 경고 프롬프트

에포크의 10% 미만이 남아 있을 때 CLI가 경고합니다. 선택 사항:

- 좌석을 즉시 원하면 `--accept-partial-epoch`로 수락
- 전체 에포크를 적용받으려면 다음 에포크까지 대기

### "금액이 현재 가격보다 낮습니다"

`pay` 명령은 최소 에포크 가격(메트로 기본 + 장치 프리미엄)에 대해 금액을 검증합니다. `shreds price`로 현재 가격을 확인하고 금액을 높이세요.

### "멀티캐스트 사용자가 이미 존재합니다"

다른 경로를 통해 이미 활성 구독이 있습니다. 먼저 `doublezero disconnect`로 연결을 해제한 후 `shreds pay`를 다시 시도하세요.