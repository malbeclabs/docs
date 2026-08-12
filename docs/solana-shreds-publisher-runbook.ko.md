---
description: LLM 지향 런북 — 연결된 Solana 밸리데이터가 리더 shred를 DoubleZero Edge로 퍼블리시하도록 구성합니다. GitHub raw를 통해 MCP에 제공되며, 문서 사이트에는 게시되지 않습니다.
---

# Shred 퍼블리시 (Edge) — 런북

이 페이지는 GitHub raw를 통해 DoubleZero MCP(`get_onboarding_runbook`)를 위한 것입니다. 문서 사이트에는 게시되지 않습니다.

1. [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`)를 연결합니다.
2. 밸리데이터가 **이미 DoubleZero IBRL**(mainnet-beta)에 연결되어 있는지 확인합니다. 연결되어 있지 않다면, 먼저 [밸리데이터 연결 (IBRL Mainnet)](solana-ibrl-runbook.md)을 완료하세요.
3. 아래 단계를 따릅니다. 사람용 가이드: [Validator Multicast Connection](Validator Multicast Connection.md).

**성공 상태:** 밸리데이터가 리더 shred를 `233.84.178.1:7733`으로 전송하고, `edge-solana-shreds`에서 멀티캐스트 퍼블리시가 작동 중이며, [publisher-check](https://data.doublezero.xyz/dz/publisher-check)에서 최소 한 번의 리더 슬롯 이후 퍼블리싱이 표시됩니다.

이 경로는 **밸리데이터**를 위한 것입니다. *구독*하려는 트레이딩 회사는 [Shred 구독](solana-shreds-runbook.md)을 사용하세요.

---

## 전제 조건

| 필요 사항 | 참고 |
|------|--------|
| IBRL 터널이 이미 가동 중 | [IBRL Mainnet 런북](solana-ibrl-runbook.md) / [사람용 가이드](DZ Mainnet-beta Connection.md). |
| 지원되는 클라이언트 | Jito-Agave **3.1.9+**, JitoBam 3.1.9+, Frankendancer, 또는 Harmonic **3.1.11+**. 다른 버전은 퍼블리시되지 않습니다. |
| 재시작 시간 | shred 대상 추가 시 밸리데이터 재시작이 필요합니다. |

---

## 단계

### 1. 클라이언트를 Edge shred 그룹으로 지정

**Jito-Agave (v3.1.9+) 및 Harmonic (3.1.11+)** — 밸리데이터 시작 스크립트에 다음을 추가합니다:

```text
--shred-receiver-address 233.84.178.1:7733
```

Jito와 `edge-solana-shreds`에 동시에 전송할 수 있습니다. 밸리데이터를 재시작합니다.

**Frankendancer** — `config.toml`에서:

```toml
[tiles.shred]
additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
```

밸리데이터를 재시작합니다.

### 2. 멀티캐스트 그룹에서 퍼블리시

```bash
doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds
```

**확인:** `doublezero status`가 여전히 IBRL/up이고, 사용자가 `edge-solana-shreds`의 퍼블리셔인지 확인합니다.

라이브 그룹 IP: `doublezero multicast group list`. 모든 shred 피드는 UDP **`7733`**을 사용하며, IP로 피드를 선택합니다.

| 피드 | 주소 |
|------|---------|
| `edge-solana-shreds` (리더) | `233.84.178.1:7733` |
| `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| `edge-solana-retrans-amer` | `233.84.178.14:7733` |

### 3. 퍼블리싱 확인

[publisher-check](https://data.doublezero.xyz/dz/publisher-check)를 엽니다. 밸리데이터가 **최소 한 슬롯** 동안 리더 shred를 퍼블리시할 때까지 확인이 표시되지 않습니다.

정상 상태: 아웃바운드 스파이크가 리더 슬롯과 일치합니다(톱니파 형태). 슬롯 패턴 없이 일정한 아웃바운드는 **재전송**(비정상)입니다.

---

## 주의 사항

1. **잘못된 클라이언트 버전.** 3.1.9+ / 3.1.11+가 아니면 → 유효한 데이터가 전송되지 않습니다.
2. **재전송 플래그가 남아 있음.** Jito-Agave에서 `--shred-retransmit-receiver-address`를 제거하세요. publisher-check의 **No Retransmit Shreds** 열을 확인하세요(2-에포크 vs 최근 슬롯 뷰).
3. **아직 리더가 아님.** 리더 슬롯이 올 때까지 대시보드가 비어 있습니다.
4. **IBRL이 가동되지 않음.** 여기서 시작하지 마세요; 먼저 IBRL을 완료하세요.

---

## 참고 자료

- [Validator Multicast Connection](Validator Multicast Connection.md)
- [Validator Rewards](Validator Rewards.md)