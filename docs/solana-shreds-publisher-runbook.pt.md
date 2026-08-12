---
description: Runbook orientado a LLM — configure um validador Solana conectado para publicar leader shreds no DoubleZero Edge. Servido ao MCP via GitHub raw; não publicado no site de documentação.
---

# Publicar shreds (Edge) — runbook

Esta página é para o DoubleZero MCP (`get_onboarding_runbook`) via GitHub raw. Ela
não é publicada no site de documentação.

1. Conecte o [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Confirme que o validador **já está no DoubleZero IBRL** (mainnet-beta). Caso contrário, conclua primeiro [Conectar validador (IBRL Mainnet)](solana-ibrl-runbook.md).
3. Siga os passos abaixo. Guia humano: [Validator Multicast Connection](Validator Multicast Connection.md).

**Como é o sucesso:** o validador envia leader shreds para `233.84.178.1:7733`, a publicação multicast em `edge-solana-shreds` está ativa, e o [publisher-check](https://data.doublezero.xyz/dz/publisher-check) mostra publicação após pelo menos um leader slot.

Este caminho é para **validadores**. Empresas de trading que desejam *se inscrever* devem usar [Inscrever-se em shreds](solana-shreds-runbook.md).

---

## Pré-requisitos

| Necessário | Notas |
|------------|-------|
| Túnel IBRL já ativo | [Runbook IBRL Mainnet](solana-ibrl-runbook.md) / [guia humano](DZ Mainnet-beta Connection.md). |
| Cliente suportado | Jito-Agave **3.1.9+**, JitoBam 3.1.9+, Frankendancer, ou Harmonic **3.1.11+**. Outras versões não publicarão. |
| Janela de reinício | Adicionar o destino de shred requer um reinício do validador. |

---

## Passos

### 1. Aponte o cliente para o grupo de shred do Edge

**Jito-Agave (v3.1.9+) e Harmonic (3.1.11+)** — no script de inicialização do validador adicione:

```text
--shred-receiver-address 233.84.178.1:7733
```

Você pode enviar para o Jito e `edge-solana-shreds` ao mesmo tempo. Reinicie o validador.

**Frankendancer** — em `config.toml`:

```toml
[tiles.shred]
additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
```

Reinicie o validador.

### 2. Publique no grupo multicast

```bash
doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds
```

**Verifique:** `doublezero status` ainda IBRL/up, e o usuário é um publicador em `edge-solana-shreds`.

IPs de grupo ao vivo: `doublezero multicast group list`. Todos os feeds de shred usam UDP **`7733`**; o IP seleciona o feed.

| Feed | Endereço |
|------|----------|
| `edge-solana-shreds` (leader) | `233.84.178.1:7733` |
| `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| `edge-solana-retrans-amer` | `233.84.178.14:7733` |

### 3. Confirme a publicação

Abra o [publisher-check](https://data.doublezero.xyz/dz/publisher-check). Você não verá confirmação até que o validador tenha publicado leader shreds por **pelo menos um slot**.

Saudável: picos de saída alinhados com leader slots (dente de serra). Saída constante sem padrão de slot é **retransmit** (ruim).

---

## Armadilhas

1. **Versão errada do cliente.** Não é 3.1.9+ / 3.1.11+ → nada útil na rede.
2. **Flag de retransmit deixada ativa.** Remova `--shred-retransmit-receiver-address` do Jito-Agave. Verifique a coluna **No Retransmit Shreds** no publisher-check (visualizações de 2 epochs vs slot recente).
3. **Ainda não é leader.** O dashboard permanece vazio até um leader slot.
4. **IBRL não está ativo.** Não comece por aqui; conclua o IBRL primeiro.

---

## Veja também

- [Validator Multicast Connection](Validator Multicast Connection.md)
- [Validator Rewards](Validator Rewards.md)