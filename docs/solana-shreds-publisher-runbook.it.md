---
description: Runbook orientato agli LLM — configurare un validatore Solana connesso per pubblicare leader shred su DoubleZero Edge. Servito all'MCP tramite GitHub raw; non pubblicato sul sito della documentazione.
---

# Pubblicare shred (Edge) — runbook

Questa pagina è destinata al DoubleZero MCP (`get_onboarding_runbook`) tramite GitHub raw. Non è
pubblicata sul sito della documentazione.

1. Connettere il [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Verificare che il validatore sia **già su DoubleZero IBRL** (mainnet-beta). In caso contrario, completare prima [Connetti il validatore (IBRL Mainnet)](solana-ibrl-runbook.md).
3. Seguire i passaggi sottostanti. Guida per utenti: [Validator Multicast Connection](Validator Multicast Connection.md).

**Risultato atteso in caso di successo:** il validatore invia leader shred a `233.84.178.1:7733`, la pubblicazione multicast su `edge-solana-shreds` è attiva, e [publisher-check](https://data.doublezero.xyz/dz/publisher-check) mostra la pubblicazione dopo almeno uno slot da leader.

Questo percorso è per i **validatori**. Le società di trading che desiderano *sottoscrivere* utilizzano [Sottoscrivere gli shred](solana-shreds-runbook.md).

---

## Prerequisiti

| Necessario | Note |
|------|--------|
| Tunnel IBRL già attivo | [Runbook IBRL Mainnet](solana-ibrl-runbook.md) / [guida per utenti](DZ Mainnet-beta Connection.md). |
| Client supportato | Jito-Agave **3.1.9+**, JitoBam 3.1.9+, Frankendancer, o Harmonic **3.1.11+**. Altre versioni non pubblicheranno. |
| Finestra di riavvio | L'aggiunta della destinazione shred richiede un riavvio del validatore. |

---

## Passaggi

### 1. Puntare il client al gruppo shred di Edge

**Jito-Agave (v3.1.9+) e Harmonic (3.1.11+)** — nello script di avvio del validatore aggiungere:

```text
--shred-receiver-address 233.84.178.1:7733
```

È possibile inviare contemporaneamente a Jito e a `edge-solana-shreds`. Riavviare il validatore.

**Frankendancer** — in `config.toml`:

```toml
[tiles.shred]
additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
```

Riavviare il validatore.

### 2. Pubblicare sul gruppo multicast

```bash
doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds
```

**Verifica:** `doublezero status` mostra ancora IBRL/up, e l'utente è un publisher su `edge-solana-shreds`.

IP dei gruppi attivi: `doublezero multicast group list`. Tutti i feed shred utilizzano UDP **`7733`**; l'IP seleziona il feed.

| Feed | Indirizzo |
|------|---------|
| `edge-solana-shreds` (leader) | `233.84.178.1:7733` |
| `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| `edge-solana-retrans-amer` | `233.84.178.14:7733` |

### 3. Confermare la pubblicazione

Aprire [publisher-check](https://data.doublezero.xyz/dz/publisher-check). La conferma non sarà visibile finché il validatore non avrà pubblicato leader shred per **almeno uno slot**.

Stato sano: picchi in uscita allineati con gli slot da leader (a dente di sega). Un flusso in uscita costante senza schema legato agli slot indica **retransmit** (anomalo).

---

## Insidie comuni

1. **Versione del client errata.** Non 3.1.9+ / 3.1.11+ → nessun dato utile sul filo.
2. **Flag di retransmit lasciato attivo.** Rimuovere `--shred-retransmit-receiver-address` da Jito-Agave. Controllare la colonna **No Retransmit Shreds** su publisher-check (viste 2-epoch vs slot recenti).
3. **Non ancora leader.** La dashboard resta vuota fino a uno slot da leader.
4. **IBRL non attivo.** Non iniziare da qui; completare prima IBRL.

---

## Vedi anche

- [Validator Multicast Connection](Validator Multicast Connection.md)
- [Validator Rewards](Validator Rewards.md)