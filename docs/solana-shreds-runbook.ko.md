---
description: LLM 지향 런북 — Edge shreds 시트를 구매하고 doublezero1에서 Solana shred 멀티캐스트를 수신합니다. GitHub raw를 통해 MCP에 제공되며, 문서 사이트에는 게시되지 않습니다.
---

# shreds 구독 (Edge) — 런북

이 페이지는 GitHub raw를 통해 DoubleZero MCP(`get_onboarding_runbook`)를 위한 것입니다. 문서 사이트에는 게시되지 않습니다.

1. [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`)에 연결합니다.
2. shreds를 **수신**할 Linux 호스트(또는 SSH), `doublezero-solana`용 지갑/키페어, 그리고 어떤 피드(leader vs retransmit)를 사용할지 알려줍니다.
3. 아래 단계를 순서대로 진행합니다. 사람용 가이드: [Edge Subscriber Connection](Edge Subscriber Connection.md).

**성공 시 확인 사항:** 현재 에포크에 시트가 할당되고, `doublezero status`에서 터널이 활성 상태로 표시되며, `doublezero1` 포트 `7733`에서 UDP shreds 수신(leader 그룹 `233.84.178.1`).

연결함으로써 사용자는 [DoubleZero 이용약관](https://doublezero.xyz/terms-protocol)에 동의합니다. 데이터는 내부 사용 목적이며 재전송할 수 없습니다.

---

## 사전 요구 사항

| 필요 항목 | 참고 사항 |
|------|--------|
| Linux/amd64 호스트 | 공용 IPv4, NAT 없음. AWS의 경우: ENI source/dest 검사를 비활성화합니다. |
| Solana CLI + `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` |
| 지갑 | `~/.config/solana/id.json` (또는 `--keypair`). **SOL**(수수료) + **USDC**(시트 에스크로)가 필요합니다. |
| USDC 민트 | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| 방화벽 | GRE, BGP (`169.254.0.0/16` tcp/179), PIM, `doublezero1`에서 UDP `7733`, `doublezero0`에서 UDP `44880`. |

---

## 단계

### 1. 클라이언트 + 패키지 설치

[설정](setup.md)을 따른 후:

```bash
sudo apt update && sudo apt install doublezero-solana
```

`~/.config/doublezero/id.json`을 백업합니다.

### 2. 방화벽

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW 대안: 사람용 가이드를 참조하세요.

### 3. 리컨실러 활성화

시트가 터널을 자동 프로비저닝하려면 필수입니다.

```bash
doublezero enable
```

### 4. 지갑

```bash
solana-keygen new    # 필요한 경우 — ~/.config/solana/id.json에 기록됩니다; 백업하세요
solana address
```

SOL과 USDC를 충전합니다.

### 5. 장치 + 가격 선택

```bash
doublezero latency
doublezero-solana shreds price
doublezero-solana shreds price --device-code <Device_Name>
```

최저 지연 시간의 **장치 코드**와 에포크 가격(기본 + 프리미엄)을 기록합니다. **1 에포크 이상** 충전하는 것을 권장합니다. 가격 UI: [devices](https://data.doublezero.xyz/dz/shreds/devices).

### 6. 시트 구매 (블로킹)

수신 호스트에서:

```bash
curl -4 -s ifconfig.me; echo
```

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

`--client-ip`는 shreds를 수신할 머신의 공용 IPv4여야 합니다. `--amount`는 USDC 소수점 값(예: `100`)이며 에포크 가격을 충족해야 합니다.

에포크의 10% 미만이 남은 경우 CLI가 경고합니다. `--accept-partial-epoch`는 남은 기간을 즉시 사용합니다; 그렇지 않으면 기다리세요. 정산 시 에스크로 잔액 부족 → 시트 상실, 터널 해제, **테뉴어 손실**.

할당되면 데몬이 GRE 터널을 활성화합니다.

```bash
doublezero status
doublezero-solana shreds list
```

### 7. shreds 확인

Leader shreds: `doublezero1`의 `233.84.178.1:7733`. `doublezero multicast group list`로 그룹을 검색합니다.

| 피드 | 그룹 | 주소 |
|------|-------|---------|
| Leader | `edge-solana-shreds` | `233.84.178.1:7733` |
| Root | `edge-solana-root` | `233.84.178.16:7733` |
| Retransmit EU | `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| Retransmit APAC | `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| Retransmit AMER | `edge-solana-retrans-amer` | `233.84.178.14:7733` |

포트 `5765`는 퍼블리셔 하트비트이며 — shreds가 아닙니다. 트래픽은 GRE 캡슐화되어 있습니다; 일부 파이프라인(XDP deshredder)은 GRE를 제거해야 합니다.

```bash
sudo tcpdump -ni doublezero1 host 233.84.178.1 and udp port 7733
```

---

## 주의 사항

1. **리컨실러 비활성화.** `doublezero enable` 없이 결제해도 터널이 활성화되지 않습니다.
2. **`--client-ip` ≠ 데몬 IP.** 자동 검색이 시트와 일치해야 합니다.
3. **`Multicast user already exists`.** 먼저 연결 해제: `doublezero disconnect`, 그런 다음 `shreds pay`를 재시도합니다.
4. **금액이 현재 가격 미만.** `shreds price`를 다시 확인하고 `--amount`를 높이세요.
5. **결제 후 시트가 할당되지 않음.** 에포크 후반(다음 에포크), 장치 만석(더 높은 테뉴어), 또는 정산 전 출금.
6. **에스크로 잔액을 유지하세요.** 추가 `shreds pay`로 충전하고, 잔액이 에포크 가격 이하로 떨어지지 않도록 하세요.

---

## 참고 자료

- [Edge Subscriber Connection](Edge Subscriber Connection.md)
- [지원](support.md)
- 스코어보드 / 시트: [data.doublezero.xyz](https://data.doublezero.xyz/dz/shreds/scoreboard)