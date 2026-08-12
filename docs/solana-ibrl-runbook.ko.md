---
description: LLM 지향 런북 — Solana Mainnet-Beta 밸리데이터를 IBRL 모드로 DoubleZero에 연결합니다. GitHub raw를 통해 MCP에 제공되며, 문서 사이트에는 게시되지 않습니다.
---

# 밸리데이터 연결 (IBRL Mainnet) — 런북

이 페이지는 GitHub raw를 통해 DoubleZero MCP(`get_onboarding_runbook`)용으로 작성되었습니다. 문서 사이트에는 게시되지 않습니다.

1. [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`)를 연결합니다.
2. **Solana Mainnet-Beta 밸리데이터**, Linux 호스트(또는 SSH), 밸리데이터 아이덴티티 키페어의 위치를 알려줍니다.
3. 아래 단계를 순서대로 진행합니다. 수동으로 하고 싶으신가요? [사람용 가이드](DZ Mainnet-beta Connection.md)를 사용하세요.

**성공 시 모습:** `doublezero status`에서 터널 **up**, User Type **IBRL**, Network **mainnet-beta**가 표시됩니다. `Tunnel src`와 `Doublezero IP`가 호스트의 공인 IPv4와 일치합니다.

IBRL은 밸리데이터 클라이언트 재시작이 필요 없으며, 기존 공인 IP를 사용합니다.

---

## 사전 요구 사항

| 필요 항목 | 참고 |
|------|--------|
| Linux/amd64 호스트 | DoubleZero를 컨테이너가 아닌 **밸리데이터 호스트에** 설치합니다. |
| 공인 IPv4, NAT 없음 | Gossip IP가 이 호스트와 일치해야 합니다. |
| `$PATH`에 Solana CLI | `solana sign-offchain-message`용. |
| 밸리데이터 아이덴티티 키페어 | 명령을 실행하는 사용자가 읽을 수 있어야 합니다(보통 `sol` 사용자 아래). |
| 아이덴티티에 ≥1 SOL | Passport / 온체인 요청용. |
| GRE (IP proto 47) + BGP | BGP는 `169.254.0.0/16` tcp/179에서. |
| `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` (또는 배포판에 맞는 동등 명령). |

Validator ID는 Solana gossip과 대조하여 대상 IP를 결정합니다. 같은 IP에 있는 잘못된 ID는 무시됩니다. gossip에 있는 기본 ID만 사용됩니다.

---

## 단계

### 1. 클라이언트 설치

`doublezero`가 설치되지 않은 경우 [설정](setup.md)을 따르세요. Mainnet 패키지:

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

Rocky / RHEL: `setup.rpm.sh`와 `sudo yum install doublezero`를 사용합니다.

**확인:** `sudo systemctl status doublezerod`가 active 상태입니다. `~/.config/doublezero/id.json`을 백업하세요.

### 2. 데몬을 mainnet-beta로 설정

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

약 30초 대기 후 `doublezero latency`에서 mainnet 장치 목록이 표시되어야 합니다.

### 3. `doublezero0`에서 UDP 44880 열기

```bash
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW: `sudo ufw allow in on doublezero0 to any port 44880 proto udp` 및 일치하는 `out` 규칙을 추가합니다. [설정](setup.md)에 따라 GRE 및 BGP도 허용하세요.

### 4. DoubleZero ID 및 기본 밸리데이터 확인

설정 시 생성된 DoubleZero ID가 **기본** 머신의 것이어야 하며, 모든 백업에 동일하게 존재해야 합니다(`~/.config/doublezero/id.json`).

```bash
doublezero address
doublezero-solana passport find-validator -u mainnet-beta
```

기본 밸리데이터에서 예상되는 결과: gossip에 존재, 리더 스케줄에 포함, "can connect as a primary". 백업에서 동일한 `find-validator`를 실행하면 리더 스케줄에 포함되지 **않아야** 합니다.

단일 머신인 경우: 이후 명령에서 `--backup-validator-ids` / `backup_ids=`를 생략합니다.

### 5. 접근 메시지 준비 (기본)

기본 밸리데이터(활성 스테이크, gossip에 아이덴티티 있음)에서:

```bash
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address <DOUBLEZERO_ADDRESS> \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4>
```

백업이 없는 경우 `--backup-validator-ids`를 생략합니다(최대 3개). 출력에서 `solana sign-offchain-message …` 줄을 복사합니다.

### 6. 밸리데이터 아이덴티티 키로 서명

기본 밸리데이터에서 출력된 명령을 실행합니다(아이덴티티 키페어, DoubleZero 키만이 **아닙니다**):

```bash
solana sign-offchain-message \
   service_key=<DOUBLEZERO_ADDRESS>,backup_ids=<ID2>,<ID3>,<ID4> \
   -k <identity-keypair-file.json>
```

**결과:** 서명 문자열이 생성됩니다. 다음 단계로 가져가세요.

### 7. 밸리데이터 접근 요청

```bash
doublezero-solana passport request-validator-access -k <path-to-keypair> -u mainnet-beta \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4> \
  --signature <SIGNATURE> \
  --doublezero-address <DOUBLEZERO_ADDRESS>
```

Sentinel이 검증하고 접근 패스를 생성할 때까지 대기합니다. 선택 사항: 에이전트가 패스가 존재할 때까지 `pubkey`(`doublezero address`)와 호스트 공인 IP로 **`check_edge_access`**를 호출할 수 있습니다.

### 8. IBRL 연결

```bash
doublezero connect ibrl
```

GRE가 올라올 때까지 약 1분 대기합니다. 그때까지 상태가 `down` / `Unknown`일 수 있습니다.

```bash
doublezero status
```

**통과 조건:** `up`, User Type `IBRL`, Network `mainnet-beta`, 터널은 일반적으로 `doublezero0`.

```bash
ip route
```

`doublezero0`를 통한 BGP 학습 경로가 표시되어야 합니다.

---

## 주의 사항

1. **잘못된 환경.** Testnet 패키지 / `DESIRED_DOUBLEZERO_ENV=testnet`으로는 mainnet-beta에 연결되지 않습니다.
2. **gossip에 아이덴티티 없음.** 같은 IP에 있는 잘못된 ID로는 머신을 등록할 수 없습니다.
3. **백업은 기본 DoubleZero ID를 공유해야 합니다.** `id.json`을 복사하세요. 두 번째 아이덴티티를 keygen하지 마세요.
4. **밸리데이터 아이덴티티로 서명하세요**, DoubleZero 키가 아닙니다.
5. `connect ibrl` 후 **약 1분간 상태 down**은 GRE가 올라오는 동안 정상입니다.

---

## 참고

- [밸리데이터 Mainnet-Beta 연결](DZ Mainnet-beta Connection.md)
- [설정](setup.md)
- 다음: [슈레드 퍼블리시 (Edge)](solana-shreds-publisher-runbook.md)