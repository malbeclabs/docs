---
description: Configurare un edge subscriber per ricevere i feed di shred DoubleZero, inclusa la configurazione del client e le regole firewall per GRE, BGP, PIM e il traffico shred.
---

# Connessione Edge Subscriber
!!! warning "Collegandomi a DoubleZero accetto i [Termini di Utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol). Si prega di notare che i dati sono esclusivamente per uso interno e non possono essere ritrasmessi (vedi Sezione 2(e))."

!!! warning "Hai già la sottoscrizione via CLI?"
    Se hai effettuato la sottoscrizione tramite la **CLI** (`doublezero-solana shreds pay` / escrow seats), utilizza la [pagina di sottoscrizione CLI](Edge Subscriber CLI.md) per quei comandi. Quel sistema sarà **dismesso il 30 agosto 2026**. Le nuove sottoscrizioni seguono questa pagina.

## Passo 1: Configurazione DoubleZero

### Completare la Configurazione

Installa la [Solana CLI](https://docs.anza.xyz/cli/install).

Segui le istruzioni di [configurazione](setup.md) per installare e configurare il client DoubleZero.

Se hai già configurato DoubleZero in precedenza, assicurati di avere l'ultima versione della CLI Doublezero-Solana con `sudo apt update && sudo apt install doublezero-solana`

### Configurare il Firewall

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

---

## Passo 2: Scegliere un metro

Identifica la posizione con la latenza più bassa dalla macchina che riceverà gli shred:

```bash
doublezero latency
```

Annota il metro / la città dal risultato con la latenza più bassa. Selezionerai quella città nel modulo di richiesta. Consulta la [mappa della topologia](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) per vedere come sono raggruppati i metro.

### Prezzi

I posti vengono fatturati **mensilmente**, per macchina, nel metro selezionato:

| Metro | Prezzo |
|-------|--------|
| Francoforte, Amsterdam | $1.500 / mese |
| Londra, New York, Singapore, Tokyo | $900 / mese |
| Tutte le altre località | $450 / mese |

---

## Passo 3: Inviare la Richiesta

1. Vai su [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Seleziona **Solana Shreds**.
3. Seleziona la **città** (metro) di cui hai bisogno. Usa la tabella sopra e `doublezero latency` per scegliere.
4. Completa il modulo di richiesta.

Assegnerai un DoubleZero ID (chiave esistente o generane una nuova) a ciascuna richiesta di feed nella pagina [accounts](https://doublezero.xyz/shreds/account). La **chiave privata corrispondente deve essere presente sulla macchina che riceverà gli shred** — non assegnare una pubkey la cui chiave privata non puoi spostare su quell'host.

Scegli un **metro** e una **pubkey**. **Non** è necessario associare un IP pubblico al momento della richiesta. Durante la sottoscrizione puoi spostare l'accesso tra IP **all'interno dei metro scelti**.

Il nostro team esamina le richieste e ti contatta in tempi rapidi (prevedere **2 giorni lavorativi**).

---

## Passo 4: Connettersi dopo l'approvazione

Dopo che ti contattiamo, ricevi una fattura, e una volta pagata quella fattura, connettiti su ciascuna macchina approvata:

```bash
doublezero connect multicast --subscribe-feed solana-shreds-full
```

L'accesso viene abilitato alla data di inizio scelta (tipicamente 9:01 AM ET). Verifica il tunnel con:

```bash
doublezero status
```

---

## Fatturazione

I posti vengono addebitati **mensilmente**. Tieni d'occhio la data di scadenza del posto.

Riceverai una fattura alcuni giorni prima della scadenza del posto. **Il mancato pagamento comporta la rimozione del posto.**

---

## Indirizzi Shred (IP vs Porta)

I Leader Shred e i Retransmit Shred ad alto stake arriveranno sulla porta `7733`, tramite l'interfaccia `doublezero1`. L'interfaccia `doublezero0` è per il traffico unicast. La porta `5765` è un heartbeat monitor dai publisher di shred — non conterrà shred.

Per il consumo degli shred, l'**indirizzo IP** identifica il flusso multicast e la **porta** identifica il servizio UDP su quel flusso.  
Tutti i flussi shred di seguito utilizzano la porta UDP `7733` su `doublezero1`.

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

!!! note "Il traffico shred consegnato attraverso la rete è incapsulato in GRE. Potrebbe essere necessario rimuovere l'header GRE prima di alimentare i dati nella pipeline esistente (ad es. un deshredder basato su XDP)."

---

## Strumenti e Dashboard

### [Edge Scoreboard](https://data.doublezero.xyz/dz/shreds/scoreboard)

La Scoreboard confronta la velocità di consegna degli shred tra DoubleZero Edge e altri provider, utilizzando dati a livello di slot per comparare le prestazioni in tempo reale. Usa questa dashboard per visualizzare i tassi di vittoria degli shred Edge rispetto ad altri provider. Puoi visualizzare i risultati solo per i leader shred, oltre al confronto del feed completo. Puoi anche approfondire per regione per vedere le prestazioni attese.

### [Edge Publishers](https://data.doublezero.xyz/dz/shreds/publishers)

La metrica "Publishing Shreds" in alto a sinistra della dashboard mostra la percentuale totale del peso di stake di tutti i validatori Solana che pubblicano leader shred su DoubleZero Edge. Puoi vedere i dettagli per ciascun publisher sulla rete.

### [Edge Subscribers, Dispositivi e Attività](https://data.doublezero.xyz/dz/shreds/subscribers)

Puoi cercare il tuo Client IP su questa pagina per i posti sottoscritti e visualizzare lo stato. Puoi anche visualizzare i dispositivi disponibili nella pagina [Devices](https://data.doublezero.xyz/dz/shreds/devices) e tutta l'attività recente nella pagina [Activity](https://data.doublezero.xyz/dz/shreds/activity).

### Documentazione API Dati

Per l'accesso programmatico agli endpoint dati, consulta la documentazione API: [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

---

## Risoluzione dei Problemi

Se riscontri un problema non trattato qui, contattaci attraverso il tuo canale esistente prima di tentare soluzioni alternative. Se non disponi di un canale, cerca su [Discord](https://discord.gg/U2fEb4Jq) e apri un ticket se necessario.

### Assicurati che il tuo Client sia aggiornato:

Esegui: `sudo apt update && sudo apt install doublezero-solana`

### Il tunnel non si attiva

1. Verifica che il daemon sia in esecuzione: `sudo systemctl status doublezerod`
2. Verifica che le regole del firewall siano configurate (GRE, BGP, PIM, traffico shred su `doublezero1`, porta 44880 su `doublezero0`)
3. Conferma che la fattura per questo posto sia stata pagata e che la data di inizio sia trascorsa
4. Esegui `doublezero connect multicast --subscribe-feed solana-shreds-full` sulla macchina che contiene la chiave privata assegnata
5. Controlla lo stato della connessione: `doublezero status`

Il DoubleZero ID utilizzato nella pagina accounts deve corrispondere alla chiave su questo host.

### Posto scaduto o rimosso

I posti sono mensili. Se la fattura inviata prima della scadenza non viene pagata, il posto viene rimosso e il tunnel non rimarrà attivo.

### "Multicast user already exists"

Hai già una sottoscrizione attiva attraverso un percorso diverso. Disconnettiti prima con `doublezero disconnect`, poi riprova con `doublezero connect multicast --subscribe-feed solana-shreds-full`.