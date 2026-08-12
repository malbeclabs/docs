---
description: Runbook orientato agli LLM — acquistare un seat Edge per gli shred e ricevere il multicast degli shred Solana su doublezero1. Servito all'MCP tramite GitHub raw; non pubblicato sul sito della documentazione.
---

# Sottoscrivere gli shred (Edge) — runbook

Questa pagina è destinata al DoubleZero MCP (`get_onboarding_runbook`) tramite GitHub raw. Non è
pubblicata sul sito della documentazione.

1. Connettere il [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Indicare l'host Linux che **riceverà** gli shred (o SSH), il wallet/keypair per `doublezero-solana` e quale feed (leader vs retransmit).
3. Seguire i passaggi sottostanti in ordine. Guida per operatori: [Edge Subscriber Connection](Edge Subscriber Connection.md).

**Come si presenta il successo:** seat allocato per l'epoca corrente, `doublezero status` mostra il tunnel attivo, shred UDP su `doublezero1` porta `7733` (gruppo leader `233.84.178.1`).

Connettendosi, l'utente accetta i [Termini di Utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol). I dati sono per uso interno e non possono essere ritrasmessi.

---

## Prerequisiti

| Necessario | Note |
|------|--------|
| Host Linux/amd64 | IPv4 pubblico, senza NAT. Su AWS: disabilitare il controllo source/dest dell'ENI. |
| Solana CLI + `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` |
| Wallet | `~/.config/solana/id.json` (oppure `--keypair`). Necessari **SOL** (commissioni) + **USDC** (escrow del seat). |
| Mint USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Firewall | GRE, BGP (`169.254.0.0/16` tcp/179), PIM, UDP `7733` su `doublezero1`, UDP `44880` su `doublezero0`. |

---

## Passaggi

### 1. Installare client e pacchetti

Seguire il [setup](setup.md), poi:

```bash
sudo apt update && sudo apt install doublezero-solana
```

Eseguire il backup di `~/.config/doublezero/id.json`.

### 2. Firewall

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

Varianti UFW: consultare la guida per operatori.

### 3. Abilitare il reconciler

Necessario affinché i seat provisionino automaticamente il tunnel.

```bash
doublezero enable
```

### 4. Wallet

```bash
solana-keygen new    # se necessario — scrive ~/.config/solana/id.json; eseguire il backup
solana address
```

Finanziare con SOL e USDC.

### 5. Scegliere device e prezzo

```bash
doublezero latency
doublezero-solana shreds price
doublezero-solana shreds price --device-code <Device_Name>
```

Annotare il **device code** con latenza più bassa e il prezzo dell'epoca (base + premium). È preferibile finanziare **>1 epoca**. Interfaccia prezzi: [devices](https://data.doublezero.xyz/dz/shreds/devices).

### 6. Acquistare un seat (bloccante)

Sull'host ricevente:

```bash
curl -4 -s ifconfig.me; echo
```

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

`--client-ip` deve essere l'IPv4 pubblico della macchina che riceverà gli shred. `--amount` è in decimali USDC (es. `100`) e deve soddisfare il prezzo dell'epoca.

Se rimane meno del 10% dell'epoca, la CLI avvisa. `--accept-partial-epoch` prende il residuo immediatamente; altrimenti attendere. Escrow sottofinanziato al momento del settlement → seat perso, tunnel abbattuto, **tenure persa**.

Una volta allocato, il daemon attiva il tunnel GRE.

```bash
doublezero status
doublezero-solana shreds list
```

### 7. Verificare gli shred

Shred leader: `233.84.178.1:7733` su `doublezero1`. Scoprire i gruppi con `doublezero multicast group list`.

| Feed | Gruppo | Indirizzo |
|------|-------|---------|
| Leader | `edge-solana-shreds` | `233.84.178.1:7733` |
| Root | `edge-solana-root` | `233.84.178.16:7733` |
| Retransmit EU | `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| Retransmit APAC | `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| Retransmit AMER | `edge-solana-retrans-amer` | `233.84.178.14:7733` |

La porta `5765` è un heartbeat del publisher — non shred. Il traffico è incapsulato in GRE; alcune pipeline (deshredder XDP) devono rimuovere il GRE.

```bash
sudo tcpdump -ni doublezero1 host 233.84.178.1 and udp port 7733
```

---

## Problemi comuni

1. **Reconciler disattivato.** Senza `doublezero enable`, il pagamento non attiva il tunnel.
2. **`--client-ip` ≠ IP del daemon.** L'auto-discovery deve corrispondere al seat.
3. **`Multicast user already exists`.** Disconnettersi prima: `doublezero disconnect`, poi riprovare `shreds pay`.
4. **Importo inferiore al prezzo corrente.** Ricontrollare `shreds price` e aumentare `--amount`.
5. **Seat non allocato dopo il pagamento.** Epoca tardiva (epoca successiva), device pieno (tenure più alta), o prelievo prima del settlement.
6. **Mantenere l'escrow finanziato.** Ricaricare con un altro `shreds pay`; non lasciare che il saldo scenda sotto il prezzo dell'epoca.

---

## Vedi anche

- [Edge Subscriber Connection](Edge Subscriber Connection.md)
- [Supporto](support.md)
- Scoreboard / seat: [data.doublezero.xyz](https://data.doublezero.xyz/dz/shreds/scoreboard)