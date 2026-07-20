---
description: Configura un edge subscriber per ricevere i feed di shred DoubleZero, inclusa la configurazione del client e le regole firewall per GRE, BGP, PIM e il traffico shred.
---

# Connessione Edge Subscriber
!!! warning "Collegandomi a DoubleZero accetto i [Termini di Utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol). Si prega di notare che i dati sono esclusivamente per uso interno e non possono essere ritrasmessi (vedi Sezione 2(e))."

## Passaggio 1: Configurazione di DoubleZero

### 1. Completare la Configurazione

Installare la [Solana CLI](https://docs.anza.xyz/cli/install).

Seguire le istruzioni di [configurazione](setup.md) per installare e configurare il client DoubleZero.

Se hai già configurato DoubleZero in precedenza, assicurati di avere l'ultima versione della CLI Doublezero-Solana con `sudo apt update && sudo apt install doublezero-solana`

### 2. Configurare il Firewall

Consentire il traffico GRE, BGP, PIM e shred.

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

### 3. Abilitare il Reconciler

Il reconciler monitora lo stato onchain e provisiona automaticamente i tunnel quando il tuo seat viene allocato. Non è abilitato di default.

```bash
doublezero enable
```

### 4. Recuperare l'Identità DoubleZero del Server

Verifica la tua Identità DoubleZero. Questa identità verrà utilizzata per creare la connessione tra la tua macchina e DoubleZero.

```bash
doublezero address
```

**Output:**
```
YourDoubleZeroAddress11111111111111111111111111111
```

---

## Passaggio 2: Configurare il Wallet

### 1. Creare un Keypair Solana

La CLI `doublezero-solana` utilizza un keypair Solana standard per la gestione onchain dei seat. Se non ne hai uno:

```bash
solana-keygen new
```

Questo scrive su `~/.config/solana/id.json`. Per utilizzare un percorso diverso, passa `--keypair <path>` a qualsiasi comando `doublezero-solana`.

Stampa l'indirizzo del tuo wallet:

```bash
solana address
```

### 2. Finanziare il Wallet

Il tuo wallet necessita di due token:

- **SOL** — per le commissioni delle transazioni Solana. Trasferisci SOL all'indirizzo del wallet stampato sopra.
- **USDC** — per il finanziamento del seat. La CLI preleva dall'Associated Token Account (ATA) del tuo wallet per il mint USDC mainnet (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`).

---

## Passaggio 3: Acquistare un Seat

### 1. Trovare il Device Più Vicino

Prima di acquistare un seat, identifica il device con la latenza più bassa dalla tua macchina:

```bash
doublezero latency
```

Annota il codice del device dal risultato con la latenza più bassa (es., `<Device_Name>`). Lo utilizzerai durante l'acquisto di un seat.

### 2. Verificare i Prezzi

Visualizza i prezzi attuali dei device prima di impegnare fondi. I prezzi hanno due componenti: un **prezzo base metro** e un **sovrapprezzo per device**. I prezzi si aggiornano ad ogni epoch. Puoi anche visualizzare prezzi e disponibilità [qui](https://data.malbeclabs.com/dz/shreds/devices).

**Tutti i device:**

```bash
doublezero-solana shreds price
```

**Device specifico:**

```bash
doublezero-solana shreds price --device-code <Device_Name>
doublezero-solana shreds price --device <PUBKEY>
```

**Tutti i device in un metro:**

```bash
doublezero-solana shreds price --metro <PUBKEY>
```

Colonne di output: `Device Code`, `Metro Code`, `Metro Name`, `Status`, `Settled Seats`, `Available Seats`, `Base Price (USDC)`, `Premium (USDC)`, `Epoch Price (USDC)`.

Il prezzo per epoch è il costo totale per epoch per un seat su quel device (base + sovrapprezzo). Usa `--wide` per mostrare le pubkey complete, o `--json` per output JSON.

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
| `--device <PUBKEY>` | Device target per chiave pubblica (mutuamente esclusivo con `--device-code`) |
| `--device-code <CODE>` | Device target per codice leggibile (es., `<Device_Name>`) |
| `--client-ip <IP>` | Indirizzo IPv4 pubblico della tua macchina |
| `--amount <USDC>` | USDC da finanziare (formato decimale, es. `100` = 100 USDC). Deve soddisfare il prezzo minimo per epoch. |
| `--source-token-account <PUBKEY>` | Account sorgente USDC personalizzato (predefinito: ATA del tuo wallet) |
| `--accept-partial-epoch` | Salta l'avviso sull'epoch rimanente (vedi sotto) |
| `--fee-payer <PATH>` | Usa un wallet diverso per le commissioni delle transazioni SOL |
| `--dry-run` | Simula la transazione senza eseguirla |
| `--with-compute-unit-price <PRICE>` | Imposta un prezzo per compute unit per un'inclusione più rapida durante la congestione |

Una volta allocato il tuo seat, il daemon stabilisce automaticamente il tunnel GRE. Verifica la tua connessione con:

```bash
doublezero status
```

### Tempistica dell'Epoch

I seat vengono allocati per epoch Solana (~2 giorni). Se rimane meno del 10% dell'epoch corrente quando effettui il pagamento, la CLI avvisa che il tuo seat verrà allocato immediatamente ma coprirà solo il resto dell'epoch corrente. Un pagamento separato verrà detratto dal tuo escrow quando inizia l'epoch successivo.

!!! info "È consigliabile finanziare per più di 1 epoch alla volta per non perdere il tuo seat. Puoi verificare il tempo rimanente in un epoch [qui](https://explorer.solana.com/)."

Puoi ignorare questo avviso con `--accept-partial-epoch`.

### Mantenere l'Escrow Finanziato

!!! warning "Se il saldo del tuo escrow è inferiore al prezzo per epoch al momento del settlement, il tuo seat non verrà allocato, il tunnel verrà abbattuto e perderai la tenure accumulata. La tenure determina la tua priorità per gli epoch futuri — perderla significa competere nuovamente come nuovo arrivato."

Puoi sovra-finanziare questo account per coprire più epoch. Ogni settlement detrae il prezzo di un epoch dal tuo escrow, e il saldo rimanente viene riportato. Ad esempio, finanziare 5 volte il prezzo per epoch mantiene il tuo seat attivo per un massimo di 5 epoch senza ri-finanziamento.

Per ricaricare il tuo escrow, esegui nuovamente `shreds pay` in qualsiasi momento:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

Nota che il `Target_IP` deve essere un indirizzo ipv4 pubblico sulla macchina che riceverà gli shred. Puoi trovarlo eseguendo un comando come `curl -4 ifconfig.me` sulla macchina target.

### Monitorare i Seat

Questa sezione descrive come visualizzare i seat tramite la CLI. Puoi anche utilizzare [https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs) per monitorare i seat e assistere nella gestione del tuo account escrow.

Visualizza i tuoi seat attivi e i saldi escrow:

**Tutti i tuoi seat:**

```bash
doublezero-solana shreds list
```

**Filtrare per device:**

```bash
doublezero-solana shreds list --device-code <Device_Name>
```

**Filtrare per IP client:**

```bash
doublezero-solana shreds list --client-ip <Target_IP>
```

**Filtrare per wallet:**

```bash
doublezero-solana shreds list --withdraw-authority <PUBKEY>
```

Colonne di output: `Device Code`, `Client IP`, `Tenure`, `Balance (USDC)`, `Est. Epochs Paid`.

La colonna "Est. Epochs Paid" mostra quanti epoch copre il tuo saldo attuale ai prezzi correnti. Se i prezzi cambiano, questa stima si adegua.

### Prelevare Fondi

Chiudi il tuo escrow e ricevi il rimborso degli USDC rimanenti nel tuo wallet:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

Puoi identificare il device sia tramite `--device <PUBKEY>` che `--device-code <CODE>`, come per gli altri comandi.

Per inviare il rimborso a un token account diverso:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "Prelevare significa perdere il tuo seat e la tenure accumulata."

---

## Indirizzi Shred (IP vs Porta)

I Leader Shred e i Retransmit Shred ad alto stake arriveranno sulla porta `7733`, attraverso l'interfaccia `doublezero1`. L'interfaccia `doublezero0` è per il traffico unicast. La porta `5765` è un monitor heartbeat dai publisher degli shred — non conterrà shred.

Per il consumo degli shred, l'**indirizzo IP** identifica lo stream multicast e la **porta** identifica il servizio UDP su quello stream.
Tutti gli stream shred sottostanti utilizzano la porta UDP `7733` su `doublezero1`.

Puoi esaminare gli IP di qualsiasi gruppo multicast con:

```bash
doublezero multicast group list
```

### Leader Shred

- `edge-solana-shreds`: `233.84.178.1:7733`

### Root Shred

- `edge-solana-root`: `233.84.178.16:7733`

### Retransmit Shred

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## Header del Tunnel GRE — XDP

!!! note "Il traffico shred consegnato sulla rete è incapsulato in GRE. Potrebbe essere necessario rimuovere l'header GRE prima di alimentare i dati nella tua pipeline esistente (es. un deshredder basato su XDP)."

---

## Strumenti e Dashboard

### [Edge Scoreboard](https://data.malbeclabs.com/dz/shreds/scoreboard)

Lo Scoreboard confronta la velocità di consegna degli shred tra DoubleZero Edge e altri provider, utilizzando dati a livello di slot per comparare le prestazioni in tempo reale. Usa questa dashboard per visualizzare i tassi di vittoria degli shred Edge rispetto ad altri provider. Puoi visualizzare i risultati solo per i leader shred, oltre al confronto del feed completo. Puoi anche approfondire per regione per vedere le prestazioni attese.

### [Edge Publisher](https://data.malbeclabs.com/dz/shreds/publishers)

La metrica "Publishing Shreds" in alto a sinistra della dashboard mostra la percentuale totale di peso dello stake di tutti i validatori Solana che pubblicano leader shred su DoubleZero Edge. Puoi vedere i dettagli per ogni publisher sulla rete.

### [Edge Subscriber, Device e Attività](https://data.malbeclabs.com/dz/shreds/subscribers)

Puoi facilmente cercare il tuo Client IP su questa pagina per i seat sottoscritti e visualizzarne lo stato. Clicca sulle specifiche sottoscrizioni dei seat per visualizzare la cronologia dei pagamenti e l'attività. Puoi anche visualizzare i device disponibili nella pagina [Device](https://data.malbeclabs.com/dz/shreds/devices) e tutte le attività recenti nella pagina [Attività](https://data.malbeclabs.com/dz/shreds/activity).

### Documentazione API Dati

Per l'accesso programmatico agli endpoint dati, consulta la documentazione API: [https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs).

---

## Risoluzione dei Problemi

Se riscontri un problema non trattato qui, contattaci attraverso il tuo canale esistente prima di cercare soluzioni alternative. Se non disponi di un canale, cerca su [Discord](https://discord.gg/U2fEb4Jq) e apri un ticket se necessario.

### Assicurati che il tuo Client sia aggiornato:

Esegui: `sudo apt update && sudo apt install doublezero-solana`

### Saldo escrow insufficiente

Se il saldo del tuo escrow è inferiore al prezzo per epoch al momento del settlement, il seat non viene allocato, il tunnel viene abbattuto e la tenure viene persa. Ricarica con `shreds pay` prima del prossimo settlement.

### Seat non allocato dopo il pagamento

- Potresti aver pagato tardi nell'epoch — il seat diventa effettivo nell'epoch successivo.
- Tutti i seat sul device potrebbero essere occupati da titolari con tenure superiore. Verifica i seat disponibili con `shreds price`.
- Se hai prelevato prima del settlement, il seat non era eleggibile.

### Il tunnel non si attiva

1. Verifica che il daemon sia in esecuzione: `sudo systemctl status doublezerod`
2. Verifica che il reconciler sia abilitato: `doublezero enable`
3. Verifica che le regole del firewall siano configurate (GRE, BGP, PIM, traffico shred su `doublezero1`, porta 44880 su `doublezero0`)
4. Verifica che il tuo seat sia attivo per l'epoch corrente: `doublezero-solana shreds list`
5. Controlla lo stato della tua connessione: `doublezero status`

L'IP client del daemon viene rilevato automaticamente dall'IP pubblico del tuo host — verifica che corrisponda al `--client-ip` utilizzato nei tuoi comandi seat.

### Prompt di avviso sull'epoch

La CLI avvisa quando rimane meno del 10% dell'epoch. Le tue opzioni sono:

- Accettare con `--accept-partial-epoch` se vuoi il seat immediatamente
- Attendere l'epoch successivo per ottenere una copertura completa dell'epoch

### "Amount is below the current price"

Il comando `pay` valida l'importo rispetto al prezzo minimo per epoch (base metro + sovrapprezzo device). Usa `shreds price` per verificare i prezzi attuali e aumenta il tuo importo.

### "Multicast user already exists"

Hai già una sottoscrizione attiva attraverso un percorso diverso. Disconnettiti prima con `doublezero disconnect`, poi riprova `shreds pay`.