---
description: Runbook orientato agli LLM — collegare un validatore Solana Mainnet-Beta a DoubleZero in modalità IBRL. Fornito all'MCP tramite GitHub raw; non pubblicato sul sito della documentazione.
---

# Collegare un validatore (IBRL Mainnet) — runbook

Questa pagina è destinata al DoubleZero MCP (`get_onboarding_runbook`) tramite GitHub raw. Non è
pubblicata sul sito della documentazione.

1. Collegare il [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Indicare che si tratta di un **validatore Solana Mainnet-Beta**, l'host Linux (o SSH) e dove si trova il keypair dell'identità del validatore.
3. Seguire i passaggi sottostanti in ordine. Si preferisce procedere manualmente? Utilizzare la [guida per operatori](DZ Mainnet-beta Connection.md).

**Come si presenta il successo:** `doublezero status` mostra il tunnel **up**, User Type **IBRL**, Network **mainnet-beta**. `Tunnel src` e `Doublezero IP` corrispondono all'IPv4 pubblico dell'host.

IBRL non richiede il riavvio dei client del validatore; utilizza l'IP pubblico esistente.

---

## Prerequisiti

| Necessario | Note |
|------|--------|
| Host Linux/amd64 | Installare DoubleZero **sull'host del validatore**, non in un container. |
| IPv4 pubblico, senza NAT | L'IP di gossip deve corrispondere a questo host. |
| Solana CLI nel `$PATH` | Per `solana sign-offchain-message`. |
| Keypair dell'identità del validatore | Leggibile dall'utente che esegue i comandi (spesso sotto l'utente `sol`). |
| ≥1 SOL sull'identità | Passport / richiesta onchain. |
| GRE (protocollo IP 47) + BGP | BGP su `169.254.0.0/16` tcp/179. |
| `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` (o equivalente per la distribuzione). |

L'ID del Validatore viene verificato rispetto al gossip di Solana per determinare l'IP di destinazione. Un ID fasullo sullo stesso IP viene ignorato; solo l'ID primario nel gossip viene utilizzato.

---

## Passaggi

### 1. Installare il client

Seguire [setup](setup.md) se `doublezero` non è installato. Pacchetti mainnet:

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

Rocky / RHEL: utilizzare `setup.rpm.sh` e `sudo yum install doublezero`.

**Verifica:** `sudo systemctl status doublezerod` è attivo. Effettuare un backup di `~/.config/doublezero/id.json`.

### 2. Configurare il daemon per mainnet-beta

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Attendere ~30 secondi, poi `doublezero latency` dovrebbe elencare i dispositivi mainnet.

### 3. Aprire la porta UDP 44880 su `doublezero0`

```bash
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW: `sudo ufw allow in on doublezero0 to any port 44880 proto udp` e la corrispondente regola `out`. Consentire anche GRE e BGP come indicato in [setup](setup.md).

### 4. Confermare l'ID DoubleZero e il validatore primario

L'ID DoubleZero dal setup sul **primario** deve essere presente su ogni backup (`~/.config/doublezero/id.json`).

```bash
doublezero address
doublezero-solana passport find-validator -u mainnet-beta
```

Aspettarsi il primario: presente nel gossip, nella schedule dei leader, "can connect as a primary". Sui backup, eseguire lo stesso `find-validator`; **non** dovrebbero essere nella schedule dei leader.

Una sola macchina: omettere `--backup-validator-ids` / `backup_ids=` dai comandi successivi.

### 5. Preparare il messaggio di accesso (primario)

Sul primario (stake attivo, identità nel gossip):

```bash
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address <DOUBLEZERO_ADDRESS> \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4>
```

Omettere `--backup-validator-ids` se non ci sono backup (massimo 3). Copiare la riga `solana sign-offchain-message …` dall'output.

### 6. Firmare con la chiave di identità del validatore

Sul primario, eseguire il comando stampato (keypair dell'identità, **non** solo la chiave DoubleZero):

```bash
solana sign-offchain-message \
   service_key=<DOUBLEZERO_ADDRESS>,backup_ids=<ID2>,<ID3>,<ID4> \
   -k <identity-keypair-file.json>
```

**Produce:** una stringa di firma. Portarla nel passaggio successivo.

### 7. Richiedere l'accesso validatore

```bash
doublezero-solana passport request-validator-access -k <path-to-keypair> -u mainnet-beta \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4> \
  --signature <SIGNATURE> \
  --doublezero-address <DOUBLEZERO_ADDRESS>
```

Attendere che Sentinel validi e crei il pass di accesso. Facoltativo: l'agente può chiamare **`check_edge_access`** con `pubkey` (`doublezero address`) e l'IP pubblico dell'host finché il pass non è presente.

### 8. Connettere IBRL

```bash
doublezero connect ibrl
```

Attendere ~1 minuto per il GRE. Fino ad allora, lo stato potrebbe essere `down` / `Unknown`.

```bash
doublezero status
```

**Superato:** `up`, User Type `IBRL`, Network `mainnet-beta`, tunnel tipicamente `doublezero0`.

```bash
ip route
```

Aspettarsi route apprese tramite BGP via `doublezero0`.

---

## Insidie comuni

1. **Ambiente errato.** Pacchetti testnet / `DESIRED_DOUBLEZERO_ENV=testnet` non funzioneranno su mainnet-beta.
2. **Identità non nel gossip.** ID fasulli sullo stesso IP non possono registrare la macchina.
3. **I backup devono condividere l'ID DoubleZero del primario.** Copiare `id.json`; non generare una seconda identità con keygen.
4. **Firmare con l'identità del validatore**, non con la chiave DoubleZero.
5. **Stato down per ~1 minuto** dopo `connect ibrl` è normale mentre il GRE si avvia.

---

## Vedi anche

- [Connessione Validatore Mainnet-Beta](DZ Mainnet-beta Connection.md)
- [Setup](setup.md)
- Successivo: [Pubblicare shred (Edge)](solana-shreds-publisher-runbook.md)