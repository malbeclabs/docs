---
description: DoubleZero 시ュレ드 피드를 수신하기 위한 엣지 구독자 설정, 클라이언트 설정 및 GRE, BGP, PIM, 시ュレ드 트래픽에 대한 방화벽 규칙 포함.
---

# 엣지 구독자 연결
!!! warning "DoubleZero에 연결함으로써 [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol)에 동의합니다. 데이터는 내부 목적으로만 사용 가능하며 재전송할 수 없습니다(섹션 2(e) 참조)."

## 1단계: DoubleZero 설정

### 1. 설정 완료

[Solana CLI](https://docs.anza.xyz/cli/install)를 설치합니다.

[설정](setup.md) 지침에 따라 DoubleZero 클라이언트를 설치하고 구성합니다.

이전에 DoubleZero를 설정한 적이 있다면, `sudo apt update && sudo apt install doublezero-solana`로 최신 Doublezero-Solana CLI가 설치되어 있는지 확인하세요.

### 2. 방화벽 구성

GRE, BGP, PIM 및 시ュレド 트래픽을 허용합니다.

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

### 3. 리콘실러 활성화

리콘실러는 온체인 상태를 모니터링하고 시트가 할당되면 자동으로 터널을 프로비저닝합니다. 기본적으로 활성화되어 있지 않습니다.

```bash
doublezero enable
```

---

## 2단계: 지갑 설정

### 1. Solana 키페어 생성

`doublezero-solana` CLI는 온체인 시트 관리를 위해 표준 Solana 키페어를 사용합니다. 키페어가 없는 경우:

```bash
solana-keygen new
```

이 명령은 `~/.config/solana/id.json`에 저장합니다. 다른 경로를 사용하려면 `doublezero-solana` 명령에 `--keypair <path>`를 전달하세요.

지갑 주소 출력:

```bash
solana address
```

### 2. 지갑 자금 충전

지갑에 두 가지 토큰이 필요합니다:

- **SOL** — Solana 트랜잭션 수수료용. 위에서 출력된 지갑 주소로 SOL을 전송하세요.
- **USDC** — 시트 자금 충전용. CLI는 메인넷 USDC 민트(`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`)에 대한 지갑의 연관 토큰 계정(ATA)에서 자금을 가져옵니다.

---

## 3단계: 시트 구매

### 1. 가장 가까운 장치 찾기

시트를 구매하기 전에, 머신에서 지연 시간이 가장 낮은 장치를 확인하세요:

```bash
doublezero latency
```

가장 낮은 지연 시간 결과의 장치 코드를 기록하세요(예: `<Device_Name>`). 시트 구매 시 이 코드를 사용합니다.

### 2. 가격 확인

자금을 투입하기 전에 현재 장치 가격을 확인하세요. 가격은 **기본 메트로 가격**과 **장치별 프리미엄** 두 가지 구성 요소로 되어 있습니다. 가격은 매 에포크마다 업데이트됩니다. [여기](https://data.malbeclabs.com/dz/shreds/devices)에서 가격과 가용성을 확인할 수도 있습니다.

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

에포크 가격은 해당 장치의 시트당 에포크 총 비용입니다(기본 + 프리미엄). 전체 공개 키를 표시하려면 `--wide`를, JSON 출력을 원하면 `--json`을 사용하세요.

### 3. 시트 구매

단일 명령으로 시트를 구매합니다. 이 명령은 시트를 초기화하고, 에스크로에 자금을 충전하며, 할당을 요청합니다:

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
| `--client-ip <IP>` | 머신의 공개 IPv4 주소 |
| `--amount <USDC>` | 충전할 USDC (소수점 형식, 예: `100` = 100 USDC). 최소 에포크 가격을 충족해야 합니다. |
| `--source-token-account <PUBKEY>` | 사용자 정의 USDC 소스 계정 (기본값은 지갑의 ATA) |
| `--accept-partial-epoch` | 에포크 잔여 경고 건너뛰기 (아래 참조) |
| `--fee-payer <PATH>` | SOL 트랜잭션 수수료에 다른 지갑 사용 |
| `--dry-run` | 트랜잭션을 실행하지 않고 시뮬레이션 |
| `--with-compute-unit-price <PRICE>` | 혼잡 시 더 빠른 포함을 위한 컴퓨트 유닛 가격 설정 |

시트가 할당되면 데몬이 자동으로 GRE 터널을 설정합니다. 다음 명령으로 연결을 확인하세요:

```bash
doublezero status
```

### 에포크 타이밍

시트는 Solana 에포크(~2일)별로 할당됩니다. 결제 시 현재 에포크의 잔여 시간이 10% 미만이면, CLI는 시트가 즉시 할당되지만 현재 에포크의 나머지 기간만 커버한다는 경고를 표시합니다. 다음 에포크가 시작될 때 에스크로에서 별도의 결제가 차감됩니다.

!!! info "시트를 잃지 않으려면 한 번에 1 에포크 이상의 자금을 충전하는 것이 좋습니다. [여기](https://explorer.solana.com/)에서 현재 에포크의 남은 시간을 확인할 수 있습니다."

`--accept-partial-epoch`로 이 경고를 무시할 수 있습니다.

### 에스크로 자금 유지

!!! warning "정산 시 에스크로 잔액이 에포크 가격보다 낮으면, 시트가 할당되지 않고, 터널이 해제되며, 누적된 재직 기간(tenure)을 잃게 됩니다. 재직 기간은 향후 에포크에서의 우선순위를 결정합니다 — 이를 잃으면 신규 참가자로서 다시 경쟁해야 합니다."

이 계정에 초과 충전하여 여러 에포크를 자금으로 충당할 수 있습니다. 각 정산 시 에스크로에서 1 에포크 가격이 차감되고, 나머지 잔액은 이월됩니다. 예를 들어, 에포크당 가격의 5배를 충전하면 재충전 없이 최대 5 에포크 동안 시트를 유지할 수 있습니다.

에스크로를 충전하려면 언제든지 `shreds pay`를 다시 실행하세요:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

`Target_IP`는 シュレド를 수신할 머신의 공개 IPv4 주소여야 합니다. 대상 머신에서 `curl -4 ifconfig.me`와 같은 명령을 실행하여 확인할 수 있습니다.

### 시트 모니터링

이 섹션에서는 CLI를 통해 시트를 조회하는 방법을 설명합니다. [https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs)를 사용하여 시트를 모니터링하고 에스크로 계정을 관리할 수도 있습니다.

활성 시트와 에스크로 잔액을 확인하세요:

**모든 시트:**

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

"Est. Epochs Paid" 열은 현재 가격 기준으로 현재 잔액이 커버하는 에포크 수를 보여줍니다. 가격이 변경되면 이 추정치도 조정됩니다.

### 자금 인출

에스크로를 종료하고 남은 USDC를 지갑으로 환불받으세요:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

다른 명령과 마찬가지로 `--device <PUBKEY>` 또는 `--device-code <CODE>`로 장치를 식별할 수 있습니다.

다른 토큰 계정으로 환불을 보내려면:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "인출하면 시트와 누적된 재직 기간(tenure)을 잃게 됩니다."

---

## シュレド 주소 (IP vs 포트)

리더 시ュレド와 높은 스테이크 리트랜스밋 시ュレド는 `doublezero1` 인터페이스를 통해 포트 `7733`으로 수신됩니다. `doublezero0` 인터페이스는 유니캐스트 트래픽용입니다. 포트 `5765`는 シュレド 퍼블리셔의 하트비트 모니터로, シュレド를 포함하지 않습니다.

シュレド 소비의 경우, **IP 주소**는 멀티캐스트 스트림을 식별하고 **포트**는 해당 스트림의 UDP 서비스를 식별합니다.  
아래의 모든 시ュレド 스트림은 `doublezero1`에서 UDP 포트 `7733`을 사용합니다.

다음 명령으로 멀티캐스트 그룹의 IP를 확인할 수 있습니다:

```bash
doublezero multicast group list
```

### 리더 シュレド

- `edge-solana-shreds`: `233.84.178.1:7733`

### 루트 シュレド

- `edge-solana-root`: `233.84.178.16:7733`

### 리트랜스밋 シュレド

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## GRE 터널 헤더 — XDP

!!! note "네트워크를 통해 전달되는 시ュ레ド 트래픽은 GRE로 캡슐화되어 있습니다. 기존 파이프라인(예: XDP 기반 디シュレダ)에 데이터를 공급하기 전에 GRE 헤더를 제거해야 할 수 있습니다."

---

## 도구 및 대시보드

### [엣지 스코어보드](https://data.malbeclabs.com/dz/shreds/scoreboard)

스코어보드는 슬롯 수준 데이터를 사용하여 DoubleZero Edge와 다른 제공자 간의 シュレド 전송 속도를 실시간으로 비교 벤치마킹합니다. 이 대시보드를 사용하여 다른 제공자 대비 Edge シュレド 승률을 확인하세요. 리더 시ュレド만의 결과와 전체 피드 비교를 모두 확인할 수 있습니다. 지역별로 드릴다운하여 예상 성능을 확인할 수도 있습니다.

### [엣지 퍼블리셔](https://data.malbeclabs.com/dz/shreds/publishers)

대시보드 왼쪽 상단의 "Publishing Shreds" 지표는 DoubleZero Edge에서 리더 시ュレド를 퍼블리싱하는 모든 Solana 밸리데이터의 총 스테이크 가중치 비율을 보여줍니다. 네트워크의 각 퍼블리셔에 대한 세부 정보를 확인할 수 있습니다.

### [엣지 구독자, 장치 및 활동](https://data.malbeclabs.com/dz/shreds/subscribers)

이 페이지에서 클라이언트 IP를 쉽게 검색하여 구독한 시트를 확인하고 상태를 볼 수 있습니다. 특정 시트 구독을 클릭하여 결제 내역과 활동을 확인하세요. [장치](https://data.malbeclabs.com/dz/shreds/devices) 페이지에서 사용 가능한 장치를, [활동](https://data.malbeclabs.com/dz/shreds/activity) 페이지에서 최근 활동을 확인할 수도 있습니다.

### Data API 문서

데이터 엔드포인트에 프로그래밍 방식으로 접근하려면 API 문서를 참조하세요: [https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs).

---

## 문제 해결

여기에서 다루지 않은 문제가 발생하면, 우회 방법을 시도하기 전에 기존 채널을 통해 연락하세요. 채널이 없는 경우 [Discord](https://discord.gg/U2fEb4Jq)에서 검색하고 필요 시 티켓을 생성하세요.

### 클라이언트가 최신 버전인지 확인:

실행: `sudo apt update && sudo apt install doublezero-solana`

### 에스크로 잔액 부족

정산 시 에스크로 잔액이 에포크 가격보다 낮으면, 시트가 할당되지 않고, 터널이 해제되며, 재직 기간을 잃게 됩니다. 다음 정산 전에 `shreds pay`로 충전하세요.

### 결제 후 시트가 할당되지 않음

- 에포크 후반에 결제했을 수 있습니다 — 시트는 다음 에포크부터 적용됩니다.
- 해당 장치의 모든 시트가 더 높은 재직 기간을 가진 기존 사용자에게 점유되었을 수 있습니다. `shreds price`로 사용 가능한 시트를 확인하세요.
- 정산 전에 인출한 경우 시트 자격이 없습니다.

### 터널이 연결되지 않음

1. 데몬이 실행 중인지 확인: `sudo systemctl status doublezerod`
2. 리콘실러가 활성화되어 있는지 확인: `doublezero enable`
3. 방화벽 규칙이 설정되어 있는지 확인 (GRE, BGP, PIM, `doublezero1`의 シュレド 트래픽, `doublezero0`의 포트 44880)
4. 현재 에포크에 시트가 활성 상태인지 확인: `doublezero-solana shreds list`
5. 연결 상태 확인: `doublezero status`

데몬의 클라이언트 IP는 호스트의 공개 IP에서 자동 검색됩니다 — 시트 명령에서 사용한 `--client-ip`와 일치하는지 확인하세요.

### 에포크 경고 프롬프트

에포크 잔여 시간이 10% 미만일 때 CLI가 경고합니다. 선택지:

- 시트를 즉시 원하면 `--accept-partial-epoch`로 수락
- 전체 에포크 커버리지를 위해 다음 에포크까지 대기

### "금액이 현재 가격 미만입니다"

`pay` 명령은 최소 에포크 가격(메트로 기본 + 장치 프리미엄)에 대해 금액을 검증합니다. `shreds price`로 현재 가격을 확인하고 금액을 늘리세요.

### "멀티캐스트 사용자가 이미 존재합니다"

다른 경로를 통한 활성 구독이 이미 있습니다. 먼저 `doublezero disconnect`로 연결을 해제한 후 `shreds pay`를 다시 시도하세요.