---
description: Configura un edge subscriber per ricevere i feed di shred DoubleZero, inclusa la configurazione del client e le regole firewall per GRE, BGP, PIM e il traffico shred.
---

# Connessione Edge Subscriber
!!! warning "Connettendomi a DoubleZero accetto i [Termini di Utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol). Si prega di notare che i dati sono esclusivamente per uso interno e non possono essere ritrasmessi (vedere Sezione 2(e))."

## Passaggio 1: Configurazione DoubleZero

### 1. Completare la Configurazione

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
sudo ufw allow out on doublezero1 proto pim from any to any
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

### 3. Abilitare il Reconciler

Il reconciler monitora lo stato onchain e provisiona automaticamente i tunnel quando il tuo seat viene allocato. Non è abilitato di default.

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

Questo scrive su `~/.config/solana/id.json`. Per utilizzare un percorso diverso, passa `--keypair <path>` a qualsiasi comando `doublezero-solana`.

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

Annota il codice del dispositivo dal risultato con la latenza più bassa (es., `<Device_Name>`). Lo utilizzerai per l'acquisto di un seat.

### 2. Verificare i Prezzi

Visualizza i prezzi correnti del dispositivo prima di impegnare fondi. I prezzi hanno due componenti: un **prezzo base della metro** e un **premium per dispositivo**. I prezzi si aggiornano ad ogni epoch. Puoi anche visualizzare prezzi e disponibilità [qui](https://data.malbeclabs.com/dz/shreds/devices).

**Tutti i dispositivi:**

```bash
doublezero-solana shreds price
```

**Dispositivo specifico:**

```bash
doublezero-solana shreds price --device-code <Device_Name>
doublezero-solana shreds price --device <PUBKEY>
```

**Tutti i dispositivi in una metro:**

```bash
doublezero-solana shreds price --metro <PUBKEY>
```

Colonne dell'output: `Device Code`, `Metro Code`, `Metro Name`, `Status`, `Settled Seats`, `Available Seats`, `Base Price (USDC)`, `Premium (USDC)`, `Epoch Price (USDC)`.

Il prezzo epoch è il costo totale per epoch per un seat su quel dispositivo (base + premium). Usa `--wide` per mostrare le pubkey complete, o `--json` per output JSON.

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
| `--device-code <CODE>` | Dispositivo di destinazione tramite codice leggibile (es., `<Device_Name>`) |
| `--client-ip <IP>` | L'indirizzo IPv4 pubblico della tua macchina |
| `--amount <USDC>` | USDC da finanziare (formato decimale, es. `100` = 100 USDC). Deve soddisfare il prezzo minimo per epoch. |
| `--source-token-account <PUBKEY>` | Account sorgente USDC personalizzato (predefinito: ATA del tuo wallet) |
| `--accept-partial-epoch` | Salta l'avviso sull'epoch rimanente (vedi sotto) |
| `--fee-payer <PATH>` | Usa un wallet diverso per le commissioni di transazione SOL |
| `--dry-run` | Simula la transazione senza eseguirla |
| `--with-compute-unit-price <PRICE>` | Imposta un prezzo per unità di calcolo per un'inclusione più rapida durante la congestione |

Una volta che il tuo seat è allocato, il daemon stabilisce il tunnel GRE automaticamente. Verifica la tua connessione con:

```bash
doublezero status
```

### Tempistiche dell'Epoch

I seat vengono allocati per epoch Solana (~2 giorni). Se rimane meno del 10% dell'epoch corrente quando paghi, la CLI avvisa che il tuo seat verrà allocato immediatamente ma copre solo il resto dell'epoch corrente. Un pagamento separato verrà detratto dal tuo escrow quando inizia l'epoch successivo.

!!! info "È consigliabile finanziare per più di 1 epoch alla volta per non perdere il proprio seat. Puoi verificare il tempo rimanente in un epoch [qui](https://explorer.solana.com/)."

Puoi ignorare questo avviso con `--accept-partial-epoch`.

### Mantenere il Proprio Escrow Finanziato

!!! warning "Se il saldo del tuo escrow è inferiore al prezzo epoch al momento del settlement, il tuo seat non verrà allocato, il tunnel verrà dismesso e perderai la tenure accumulata. La tenure determina la tua priorità per gli epoch futuri — perderla significa competere nuovamente come nuovo arrivato."

Puoi sovraccaricare questo account per finanziare più epoch. Ogni settlement detrae il prezzo di un epoch dal tuo escrow, e il saldo rimanente viene riportato. Ad esempio, finanziare 5 volte il prezzo per epoch mantiene il tuo seat attivo fino a 5 epoch senza ri-finanziare.

Per ricaricare il tuo escrow, esegui di nuovo `shreds pay` in qualsiasi momento:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

Nota che il `Target_IP` deve essere un indirizzo ipv4 pubblico sulla macchina che riceverà gli shred. Puoi trovarlo eseguendo un comando come `curl -4 ifconfig.me` sulla macchina di destinazione.

### Monitorare i Seat

Questa sezione descrive come visualizzare i seat tramite la CLI. Puoi anche utilizzare [https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs) per monitorare i seat e assistere nella gestione del tuo account escrow.

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

La colonna "Est. Epochs Paid" mostra quanti epoch copre il tuo saldo attuale ai prezzi correnti. Se i prezzi cambiano, questa stima si adegua.

### Prelevare Fondi

Chiudi il tuo escrow e rimborsa gli USDC rimanenti al tuo wallet:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

Puoi identificare il dispositivo sia con `--device <PUBKEY>` che con `--device-code <CODE>`, come per gli altri comandi.

Per inviare il rimborso a un account token diverso:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "Prelevare significa perdere il proprio seat e la tenure accumulata."

---

## Indirizzi Shred (IP vs Porta)

Gli Shred Leader e gli Shred Retransmit ad alto stake arriveranno sulla porta `7733`, tramite l'interfaccia `doublezero1`. L'interfaccia `doublezero0` è per il traffico unicast. La porta `5765` è un monitor heartbeat dai publisher di shred — non conterrà shred.

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


## Header del Tunnel GRE — XDP

!!! note "Il traffico shred consegnato sulla rete è incapsulato in GRE. Potrebbe essere necessario rimuovere l'header GRE prima di inviare i dati alla pipeline esistente (es. un deshredder basato su XDP)."

---

## Strumenti e Dashboard

### [Edge Scoreboard](https://data.malbeclabs.com/dz/shreds/scoreboard)

Lo Scoreboard confronta la velocità di consegna degli shred tra DoubleZero Edge e altri provider, utilizzando dati a livello di slot per confrontare le prestazioni in tempo reale. Usa questa dashboard per visualizzare le percentuali di vittoria degli shred Edge rispetto ad altri provider. Puoi visualizzare i risultati solo per gli shred leader, oltre al confronto del feed completo. Puoi anche approfondire per regione per vedere le prestazioni attese.

### [Edge Publishers](https://data.malbeclabs.com/dz/shreds/publishers)

La metrica "Publishing Shreds" in alto a sinistra della dashboard mostra la percentuale totale del peso di stake di tutti i validatori Solana che pubblicano shred leader su DoubleZero Edge. Puoi visualizzare i dettagli per ogni publisher sulla rete.

### [Edge Subscribers, Dispositivi e Attività](https://data.malbeclabs.com/dz/shreds/subscribers)

Puoi facilmente cercare il tuo Client IP su questa pagina per i seat sottoscritti e visualizzarne lo stato. Clicca sulle sottoscrizioni specifiche dei seat per visualizzare lo storico dei pagamenti e l'attività. Puoi anche visualizzare i dispositivi disponibili sulla pagina [Dispositivi](https://data.malbeclabs.com/dz/shreds/devices) e tutte le attività recenti sulla pagina [Attività](https://data.malbeclabs.com/dz/shreds/activity).

### Documentazione API Dati

Per l'accesso programmatico agli endpoint dei dati, consulta la documentazione API: [https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs).

---

## Risoluzione dei Problemi

Se riscontri un problema non trattato qui, contattaci tramite il tuo canale esistente prima di cercare soluzioni alternative. Se non hai un canale, cerca su [Discord](https://discord.gg/U2fEb4Jq) e apri un ticket se necessario.

### Assicurati che il tuo Client sia aggiornato:

Esegui: `sudo apt update && sudo apt install doublezero-solana`

### Saldo escrow insufficiente

Se il saldo del tuo escrow è inferiore al prezzo epoch al momento del settlement, il seat non viene allocato, il tunnel viene dismesso e la tenure viene persa. Ricarica con `shreds pay` prima del prossimo settlement.

### Seat non allocato dopo il pagamento

- Potresti aver pagato in ritardo nell'epoch — il seat entra in vigore nell'epoch successivo.
- Tutti i seat sul dispositivo potrebbero essere occupati da incumbent con tenure superiore. Verifica i seat disponibili con `shreds price`.
- Se hai prelevato prima del settlement, il seat non era idoneo.

### Il tunnel non si attiva

1. Verifica che il daemon sia in esecuzione: `sudo systemctl status doublezerod`
2. Verifica che il reconciler sia abilitato: `doublezero enable`
3. Verifica che le regole del firewall siano configurate (GRE, BGP, PIM, traffico shred su `doublezero1`, porta 44880 su `doublezero0`)
4. Verifica che il tuo seat sia attivo per l'epoch corrente: `doublezero-solana shreds list`
5. Controlla lo stato della connessione: `doublezero status`

L'IP client del daemon viene scoperto automaticamente dall'IP pubblico del tuo host — verifica che corrisponda al `--client-ip` utilizzato nei comandi del seat.

### Avviso relativo all'epoch

La CLI avvisa quando rimane meno del 10% dell'epoch. Le tue opzioni sono:

- Accettare con `--accept-partial-epoch` se vuoi il seat immediatamente
- Attendere il prossimo epoch per ottenere una copertura completa dell'epoch

### "Amount is below the current price"

Il comando `pay` valida l'importo rispetto al prezzo minimo per epoch (base metro + premium dispositivo). Usa `shreds price` per verificare i prezzi correnti e aumenta l'importo.

### "Multicast user already exists"

Hai già una sottoscrizione attiva attraverso un percorso diverso. Disconnettiti prima con `doublezero disconnect`, poi riprova `shreds pay`.