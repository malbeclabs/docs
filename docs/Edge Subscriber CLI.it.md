---
description: Configura un subscriber edge per ricevere i feed di shred DoubleZero, inclusa la configurazione del client e le regole firewall per GRE, BGP, PIM e il traffico shred.
---

# Connessione Edge Subscriber (CLI)

!!! warning "Sottoscrizione CLI legacy — dismessa il **30 agosto 2026**"
    Questa pagina è destinata agli utenti che utilizzano già la sottoscrizione **CLI / seat onchain** (`doublezero-solana shreds pay`). Questo sistema verrà dismesso il **30 agosto 2026**.

    Le nuove sottoscrizioni utilizzano il flusso tramite portale su [Sottoscrizione agli shred (Edge)](Edge Subscriber Connection.md).

!!! warning "Collegandomi a DoubleZero accetto i [Termini d'uso di DoubleZero](https://doublezero.xyz/terms-protocol). Si prega di notare che i dati sono esclusivamente per uso interno e non possono essere ritrasmessi (vedere Sezione 2(e))."

## Passaggio 1: Configurazione di DoubleZero

### 1. Completare la configurazione

Installa la [Solana CLI](https://docs.anza.xyz/cli/install).

Segui le istruzioni di [configurazione](setup.md) per installare e configurare il client DoubleZero.

Se hai già configurato DoubleZero in precedenza, assicurati di avere l'ultima versione della CLI Doublezero-Solana con `sudo apt update && sudo apt install doublezero-solana`

### 2. Configurare il Firewall

Consenti il traffico GRE, BGP, PIM e shred.

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
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

UFW non supporta il protocollo `pim`. Il PIM in uscita è consentito dalla policy predefinita di UFW per il traffico in uscita; se blocchi il traffico in uscita, aggiungi una regola raw per PIM in `/etc/ufw/before.rules`.

### 3. Abilitare il Reconciler

Il reconciler monitora lo stato onchain e provvede automaticamente ai tunnel quando il tuo seat viene allocato. Non è abilitato di default.

```bash
doublezero enable
```

---

## Passaggio 2: Configurare il Wallet

### 1. Creare una Keypair Solana

La CLI `doublezero-solana` utilizza una keypair Solana standard per la gestione dei seat onchain. Se non ne hai una:

```bash
solana-keygen new
```

Questo scrive in `~/.config/solana/id.json`. Per utilizzare un percorso diverso, passa `--keypair <path>` a qualsiasi comando `doublezero-solana`.

Stampa l'indirizzo del tuo wallet:

```bash
solana address
```

### 2. Finanziare il Wallet

Il tuo wallet necessita di due token:

- **SOL** — per le commissioni di transazione Solana. Trasferisci SOL all'indirizzo del wallet stampato sopra.
- **USDC** — per il finanziamento del seat. La CLI preleva dall'Associated Token Account (ATA) del tuo wallet per il mint USDC mainnet (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`).

---

## Passaggio 3: Acquistare un Seat

### 1. Trovare il Dispositivo Più Vicino

Prima di acquistare un seat, identifica il dispositivo con la latenza più bassa dalla tua macchina:

```bash
doublezero latency
```

Prendi nota del codice dispositivo dal risultato con la latenza più bassa (ad esempio, `<Device_Name>`). Lo utilizzerai al momento dell'acquisto di un seat.

### 2. Verificare i Prezzi

Visualizza i prezzi attuali dei dispositivi prima di impegnare fondi. I prezzi hanno due componenti: un **prezzo base metro** e un **premium per dispositivo**. Puoi anche visualizzare prezzi e disponibilità [qui](https://data.doublezero.xyz/dz/shreds/devices).

**Tutti i dispositivi:**

```bash
doublezero-solana shreds price
```

**Dispositivo specifico:**

```bash
doublezero-solana shreds price --device-code <Device_Name>
doublezero-solana shreds price --device <PUBKEY>
```

**Tutti i dispositivi in un metro:**

```bash
doublezero-solana shreds price --metro <PUBKEY>
```

Colonne dell'output: `Device Code`, `Metro Code`, `Metro Name`, `Status`, `Settled Seats`, `Available Seats`, `Base Price (USDC)`, `Premium (USDC)`, `Epoch Price (USDC)`.

Il prezzo per epoch è il costo totale per epoch per un seat su quel dispositivo (base + premium). Usa `--wide` per mostrare le pubkey complete, o `--json` per l'output in formato JSON.

### 3. Acquistare un Seat

Acquista un seat con un singolo comando. Questo inizializza il tuo seat, finanzia l'escrow e richiede l'allocazione:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**Parametri:**

| Flag | Descrizione |
|------|-------------|
| `--device <PUBKEY>` | Dispositivo di destinazione tramite chiave pubblica (mutuamente esclusivo con `--device-code`) |
| `--device-code <CODE>` | Dispositivo di destinazione tramite codice leggibile (ad esempio, `<Device_Name>`) |
| `--client-ip <IP>` | Indirizzo IPv4 pubblico della tua macchina |
| `--amount <USDC>` | USDC da finanziare (formato decimale, ad esempio `100` = 100 USDC). Deve soddisfare il prezzo minimo per epoch. |
| `--source-token-account <PUBKEY>` | Account sorgente USDC personalizzato (predefinito: ATA del tuo wallet) |
| `--accept-partial-epoch` | Salta l'avviso sull'epoch rimanente (vedi sotto) |
| `--fee-payer <PATH>` | Usa un wallet diverso per le commissioni di transazione SOL |
| `--dry-run` | Simula la transazione senza eseguirla |
| `--with-compute-unit-price <PRICE>` | Imposta un prezzo per compute unit per un'inclusione più rapida durante la congestione |

Una volta allocato il tuo seat, il daemon stabilisce automaticamente il tunnel GRE. Verifica la tua connessione con:

```bash
doublezero status
```

### Tempistica dell'Epoch

I seat vengono allocati per epoch Solana (~2 giorni). Se rimane meno del 10% dell'epoch corrente quando effettui il pagamento, la CLI avvisa che il tuo seat verrà allocato immediatamente ma coprirà solo il resto dell'epoch corrente. Un pagamento separato verrà detratto dal tuo escrow all'inizio dell'epoch successiva.

!!! info "È consigliabile finanziare per più di 1 epoch alla volta per non perdere il tuo seat. Puoi controllare il tempo rimanente in un epoch [qui](https://explorer.solana.com/)."

Puoi ignorare questo avviso con `--accept-partial-epoch`.

### Mantenere l'Escrow Finanziato

!!! warning "Se il saldo del tuo escrow è inferiore al prezzo per epoch al momento del settlement, il tuo seat non verrà allocato, il tunnel verrà dismesso e perderai la tenure accumulata. La tenure determina la tua priorità per le epoch future — perderla significa competere nuovamente come nuovo arrivato."

Puoi sovraccaricare questo account per finanziare più epoch. Ogni settlement detrae il prezzo di un'epoch dal tuo escrow, e il saldo rimanente viene riportato. Ad esempio, finanziare 5 volte il prezzo per epoch mantiene il tuo seat attivo per un massimo di 5 epoch senza necessità di rifinanziamento.

Per ricaricare il tuo escrow, esegui `shreds pay` nuovamente in qualsiasi momento:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

Nota che il `Target_IP` deve essere un indirizzo IPv4 pubblico sulla macchina che riceverà gli shred. Puoi trovarlo eseguendo un comando come `curl -4 ifconfig.me` sulla macchina di destinazione.

### Monitorare i Seat

Questa sezione descrive come visualizzare i seat tramite la CLI. Puoi anche utilizzare [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs) per monitorare i seat e gestire il tuo account escrow.

Visualizza i tuoi seat attivi e i saldi escrow:

**Tutti i tuoi seat:**

```bash
doublezero-solana shreds list
```

**Filtra per dispositivo:**

```bash
doublezero-solana shreds list --device-code <Device_Name>
```

**Filtra per IP client:**

```bash
doublezero-solana shreds list --client-ip <Target_IP>
```

**Filtra per wallet:**

```bash
doublezero-solana shreds list --withdraw-authority <PUBKEY>
```

Colonne dell'output: `Device Code`, `Client IP`, `Tenure`, `Balance (USDC)`, `Est. Epochs Paid`.

La colonna "Est. Epochs Paid" mostra quante epoch copre il tuo saldo attuale ai prezzi correnti. Se i prezzi cambiano, questa stima si aggiorna.

### Prelevare Seat ed Escrow

Questo comando rilascia il tuo seat e chiude l'escrow. Riceverai un rimborso proporzionale per la porzione inutilizzata dell'epoch corrente, più l'eventuale saldo escrow rimanente, restituito al tuo wallet. Perderai il seat e tutta la tenure accumulata.

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

Puoi identificare il dispositivo tramite `--device <PUBKEY>` o `--device-code <CODE>`, come per gli altri comandi.

Per inviare il rimborso USDC a un account token diverso:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "Questa operazione non può essere annullata. Dopo il prelievo, il tuo seat viene eliminato e la tenure viene azzerata."

---

## Indirizzi Shred (IP e Porta)

Gli Shred Leader e gli Shred Retransmit ad alto stake arriveranno sulla porta `7733`, tramite l'interfaccia `doublezero1`. L'interfaccia `doublezero0` è per il traffico unicast. La porta `5765` è un heartbeat monitor dai publisher di shred — non conterrà shred.

Per il consumo degli shred, l'**indirizzo IP** identifica lo stream multicast e la **porta** identifica il servizio UDP su quello stream.  
Tutti gli stream shred sottostanti utilizzano la porta UDP `7733` su `doublezero1`.

Puoi esaminare gli IP di qualsiasi gruppo multicast con:

```bash
doublezero multicast group list
```

### Shred Leader

- `edge-solana-shreds`: `233.84.178.1:7733`

### Shred Root

- `edge-solana-root`: `233.84.178.16:7733`

### Shred Retransmit

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## Header Tunnel GRE — XDP

!!! note "Il traffico shred consegnato attraverso la rete è incapsulato in GRE. Potrebbe essere necessario rimuovere l'header GRE prima di alimentare i dati nella tua pipeline esistente (ad esempio un deshredder basato su XDP)."

---

## Strumenti e Dashboard

### [Edge Scoreboard](https://data.doublezero.xyz/dz/shreds/scoreboard)

Lo Scoreboard confronta la velocità di consegna degli shred tra DoubleZero Edge e altri provider, utilizzando dati a livello di slot per comparare le prestazioni in tempo reale. Usa questa dashboard per visualizzare i tassi di vittoria degli shred Edge rispetto ad altri provider. Puoi visualizzare i risultati solo per gli shred leader, oltre al confronto del feed completo. Puoi anche approfondire per regione per vedere le prestazioni attese.

### [Edge Publishers](https://data.doublezero.xyz/dz/shreds/publishers)

La metrica "Publishing Shreds" in alto a sinistra della dashboard mostra la percentuale totale di stake weight di tutti i validatori Solana che pubblicano shred leader su DoubleZero Edge. Puoi vedere i dettagli di ogni publisher sulla rete.

### [Edge Subscribers, Dispositivi e Attività](https://data.doublezero.xyz/dz/shreds/subscribers)

Puoi facilmente cercare il tuo Client IP su questa pagina per i seat sottoscritti e visualizzarne lo stato. Clicca su sottoscrizioni specifiche per visualizzare la cronologia dei pagamenti e l'attività. Puoi anche visualizzare i dispositivi disponibili nella pagina [Dispositivi](https://data.doublezero.xyz/dz/shreds/devices) e tutta l'attività recente nella pagina [Attività](https://data.doublezero.xyz/dz/shreds/activity).

### Documentazione API Dati

Per l'accesso programmatico agli endpoint dati, consulta la documentazione API: [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

---

## Risoluzione dei Problemi

Se riscontri un problema non trattato qui, contattaci tramite il tuo canale esistente prima di cercare soluzioni alternative. Se non disponi di un canale, cerca su [Discord](https://discord.gg/U2fEb4Jq) e apri un ticket se necessario.

### Assicurati che il tuo Client sia aggiornato:

Esegui: `sudo apt update && sudo apt install doublezero-solana`

### Saldo escrow insufficiente

Se il saldo del tuo escrow è inferiore al prezzo per epoch al momento del settlement, il seat non viene allocato, il tunnel viene dismesso e la tenure viene persa. Ricarica con `shreds pay` prima del prossimo settlement.

### Seat non allocato dopo il pagamento

- Potresti aver pagato in ritardo nell'epoch — il seat diventa effettivo nell'epoch successiva.
- Tutti i seat sul dispositivo potrebbero essere occupati da titolari con tenure più alta. Verifica i seat disponibili con `shreds price`.
- Se hai effettuato un prelievo prima del settlement, il seat non era idoneo.

### Il tunnel non si attiva

1. Verifica che il daemon sia in esecuzione: `sudo systemctl status doublezerod`
2. Verifica che il reconciler sia abilitato: `doublezero enable`
3. Verifica che le regole firewall siano configurate (GRE, BGP, PIM, traffico shred su `doublezero1`, porta 44880 su `doublezero0`)
4. Verifica che il tuo seat sia attivo per l'epoch corrente: `doublezero-solana shreds list`
5. Controlla lo stato della tua connessione: `doublezero status`

L'IP client del daemon viene rilevato automaticamente dall'IP pubblico del tuo host — verifica che corrisponda al `--client-ip` utilizzato nei comandi del seat.

### Avviso prompt sull'epoch

La CLI avvisa quando rimane meno del 10% dell'epoch. Le tue opzioni sono:

- Accettare con `--accept-partial-epoch` se vuoi il seat immediatamente
- Attendere l'epoch successiva per ottenere una copertura completa dell'epoch

### "Amount is below the current price"

Il comando `pay` valida il tuo importo rispetto al prezzo minimo per epoch (base metro + premium dispositivo). Usa `shreds price` per verificare i prezzi correnti e aumentare il tuo importo.

### "Multicast user already exists"

Hai già una sottoscrizione attiva tramite un percorso diverso. Disconnetti prima con `doublezero disconnect`, poi riprova `shreds pay`.