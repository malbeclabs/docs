---
description: Ottieni i dati di mercato Kalshi su DoubleZero Edge — Edge Connect o multicast nativo.
---

# Connessione Subscriber Kalshi Edge

!!! warning "Connettendomi a DoubleZero accetto i [Termini d'Uso di DoubleZero](https://doublezero.xyz/terms-protocol). Si prega di notare che i dati sono esclusivamente per uso interno e non possono essere ritrasmessi (vedere Sezione 2(e))."

I feed Kalshi forniscono dati di mercato perps e sports sulla rete DoubleZero Edge come multicast UDP. Ci sono quattro feed:

- perps Top of Book (TOB)
- perps Market by Price (MBP)
- sports Top of Book (TOB)
- sports Market by Price (MBP)

## Quale percorso devo scegliere?

Due percorsi. Preferire Edge Connect a meno che non si abbia la necessità di gestire il decoder in autonomia.

| # | Percorso | Ideale per | Impegno |
|---|----------|------------|---------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agent e applicazioni che desiderano una CLI semplice e un WebSocket JSON normalizzato | Minimo |
| **2** | [Multicast nativo](#2-native-multicast-advanced) | Costruire il proprio decoder sul formato wire grezzo | Massimo |

Prima di qualsiasi percorso: acquista i feed necessari su [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Con l'acquisto, accetti i [Termini d'Uso di DoubleZero](https://doublezero.xyz/terms-protocol) e i [Termini di Servizio di Kalshi](https://doublezero.xyz/dz-edge-kalshi-terms).

Vuoi che un'IA ti guidi nell'installazione? Connetti il [DoubleZero MCP](mcp.md) e chiedigli di accompagnarti nella configurazione di Kalshi / Edge Connect.

---

## 1. Edge Connect (consigliato) {#1-edge-connect-recommended}

**Inizia da qui.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) è il percorso pensato per gli agent: un singolo comando di installazione, l'host si unisce a DoubleZero e la tua applicazione consuma **JSON normalizzato via WebSocket** (`ws://<host>:8081`) invece di decodificare il multicast binario.

Il team evolve Edge Connect per soddisfare le esigenze della sua base utenti in espansione. Questo è il metodo di connessione più semplice e dovrebbe essere utilizzato a meno che non si abbia una necessità tecnica specifica.

Versione breve:

```bash
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

`DZ_SECRET` è un token di accesso `DZ_…` **oppure** il percorso al file JSON del keypair Solana che possiede il tuo pass di accesso / acquisto del feed.

Se un `doublezerod` dell'host è già in esecuzione, fermalo prima — interferisce con il daemon del container per lo stesso tunnel:

```bash
sudo systemctl stop doublezerod
```

Quindi verifica lo stato **all'interno del container** (aspettati `BGP Session Up` e il tuo gruppo Kalshi) e connetti un client WebSocket alla porta `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

**Passaggi completi, verifica e insidie:** connetti il [DoubleZero MCP](mcp.md) e chiedigli di guidarti attraverso Edge Connect per Kalshi.  
**Contratto WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avanzato) {#2-native-multicast-advanced}

!!! warning "Richieste conoscenze tecniche approfondite"
    Il multicast nativo significa che ti unisci al gruppo autonomamente e decodifichi il formato wire **grezzo** di Edge sul tuo host. Solo gli utenti tecnicamente più esperti dovrebbero seguire questo percorso. Sarà necessario leggere e comprendere le specifiche, a partire da [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) e il resto di [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Preferisci [Edge Connect](#1-edge-connect-recommended) a meno che tu non abbia un requisito imprescindibile di gestire il decoder in autonomia.

### Acquista un feed

Identifica il dispositivo con la latenza più bassa prima dell'acquisto:

```bash
doublezero latency
```

Acquista su [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).


### Configurazione del client DoubleZero

Segui le istruzioni di [setup](setup.md) per installare e configurare il client DoubleZero. Mantieni il client aggiornato:

```bash
sudo apt update && sudo apt install doublezero
```

### Configura il firewall

Consenti GRE, BGP, PIM e il traffico del feed Kalshi. Le porte UDP Kalshi si trovano nell'intervallo `30000`–`59999`: la prima cifra indica la classe di traffico (`3` dati di mercato, `4` dati di riferimento, `5` snapshot) e la seconda cifra indica il feed, quindi i dati di riferimento sono sempre mercato + `10000` e lo snapshot è sempre mercato + `20000`. Apri l'intera banda su `doublezero1` così che nuovi canali e feed non richiedano ulteriori modifiche al firewall — vedi [Indirizzi dei Feed](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi mercato / riferimento / snapshot (tutti i feed)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```


**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Kalshi mercato / riferimento / snapshot (tutti i feed)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```


### Sottoscrivi

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob
```

Feed multipli, separati da spazio:

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob edge-kalshi-perps-mbp edge-kalshi-sports-tob edge-kalshi-sports-mbp
```

Esempio di output del provisioning:

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <your dz_id>
🔍  Provisioning User for IP: <your public ip>
    The Device has been selected: <the doublezero device you are connecting to>
    Service provisioned with status: ok
✅  User Provisioned
```

Attendi circa 60 secondi, quindi:

```bash
doublezero status
```

Aspettati `BGP Session Up` sulla rete DoubleZero corretta. Come subscriber, il tuo IP DoubleZero corrisponde al tuo Tunnel Src IP.

```bash
doublezero user list --client-ip <your ip>
```

I tuoi feed appaiono nella colonna `groups`. Ispeziona gli IP dei gruppi con:

```bash
doublezero multicast group list
```


### Decodifica il formato wire autonomamente

La versione dello schema è **`3`** — scarta i frame la cui versione non è implementata dal tuo decoder. Layout di riferimento: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluso [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md).

Ogni datagramma inizia con un header di frame, seguito da uno o più messaggi applicativi impacchettati fino al MTU. I frame sono little-endian e a layout fisso.

| Campo | Note |
|-------|------|
| Versione dello schema | `3` |
| Channel ID | Demultiplexing degli stream che condividono una porta |
| Sequenza | Monotonica per canale — usala per il rilevamento dei gap |
| Timestamp di invio | Nanosecondi dall'epoca Unix |
| Conteggio messaggi | Messaggi impacchettati in questo frame |
| Conteggio reset | Avanza per sessione. Un incremento significa riavvio a freddo del tuo stato. |
| Lunghezza del frame | Byte totali |

#### Messaggi applicativi (TOB)

| Tipo | ID | Dimensione | Porta | Contenuto |
|------|----|------------|-------|-----------|
| Heartbeat | `0x01` | 16 B | market | Segnale di attività quando il mercato è silenzioso |
| InstrumentDefinition | `0x02` | 130 B | reference | Simbolo, esponenti, tick e lotto, scadenza |
| Quote | `0x03` | 60 B | market | Miglior bid e ask, prezzo e dimensione, flag di aggiornamento |
| Trade | `0x04` | 52 B | market | Prezzo, dimensione, lato aggressore, ID trade |
| ChannelReset | `0x05` | 12 B | entrambe | Avvio o riavvio della sessione |
| EndOfSession | `0x06` | 12 B | entrambe | Chiusura ordinata |
| ManifestSummary | `0x07` | 24 B | reference | Fingerprint dell'active-set e conteggio strumenti |
| PerpStats | `0x30` | 124 B | sibling | Funding, prezzi mark e oracle, open interest, volume giornaliero |

L'ID sorgente di Kalshi nel registro edge-feed-spec è `3`. Leggi `price_exponent` e `qty_exponent` da ogni `InstrumentDefinition` — non codificarli in modo fisso.

I feed MBP utilizzano il set di messaggi market-by-price. Consulta le specifiche market-by-price e reference-data in edge-feed-spec.

La consegna è UDP fire-and-forget senza ritrasmissione. Recupera i datagrammi mancati dal ciclo dei dati di riferimento (e dal piano snapshot sui feed MBP), che viene riemesso a cadenza regolare anziché una sola volta.

---

## Indirizzi dei Feed {#feed-addresses}

| Feed | Descrizione | Gruppo multicast | Dati di mercato | Dati di riferimento | Snapshot |
|------|-------------|------------------|-----------------|---------------------|----------|
| `edge-kalshi-perps-tob` | Perps top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | Perps market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | Sports top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `edge-kalshi-sports-mbp` | Sports market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

Schema delle porte: la prima cifra indica la classe di traffico (`3` mercato, `4` riferimento, `5` snapshot); la seconda cifra indica il feed. I dati di riferimento sono mercato + `10000`; lo snapshot è mercato + `20000`. Le porte perps sono fisse. Le porte sports sono `base + channel id` (ad esempio, id `10` su `edge-kalshi-sports-mbp` usa `34010` / `44010` / `54010`).

Il gruppo seleziona il feed; la porta seleziona dati di mercato, dati di riferimento o snapshot al suo interno. La replicazione multicast avviene per sorgente e gruppo, e il fabric non ispeziona mai la porta UDP, quindi unirsi a un gruppo consegna tutto ciò che si trova su quel gruppo attraverso il tuo link Edge Connect. La porta è un filtro socket applicato sul tuo host dopo l'arrivo dei byte.

---

## Risoluzione dei problemi

Se riscontri un problema non trattato qui, contattaci attraverso il tuo canale esistente prima di cercare soluzioni alternative. Se non hai un canale, consulta [Supporto](support.md).

### Assicurati che il client sia aggiornato

Esegui: `sudo apt update && sudo apt install doublezero`

### Nessun datagramma in arrivo

1. Conferma che il feed sia stato acquistato su [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un feed non acquistato non genera traffico.
2. Conferma che il BGP sia attivo: `doublezero status` dovrebbe mostrare `BGP Session Up` sulla rete DoubleZero corretta.
3. Conferma che la sottoscrizione sia attiva: `doublezero user list --client-ip <your ip>` dovrebbe elencare il feed sotto `groups`.
4. Conferma che il gruppo sia stato raggiunto sull'interfaccia corretta. Il multicast arriva su `doublezero1`, non su `doublezero0`.
5. Conferma che il firewall consenta le porte UDP del feed in ingresso su `doublezero1`.

### Gap di sequenza

La sequenza è monotonica per canale. Un gap significa datagrammi persi; il successivo ciclo dei dati di riferimento ripristina lo stato degli strumenti.

### I frame si interrompono e ripartono con un nuovo conteggio reset

Un riavvio del publisher incrementa il conteggio reset nell'header del frame. Scarta lo stato della sessione precedente e riparti a freddo dal successivo ciclo dei dati di riferimento.

### Il tunnel non si avvia

1. **Edge Connect:** esegui lo status nel container — `docker exec doublezero-edge-connect doublezero status`. Il comando `doublezero status` dell'host spesso fallisce mentre il feed funziona correttamente (il container possiede il daemon). Conferma che il `doublezerod` dell'host sia fermo.
2. **Nativo:** verifica che il daemon dell'host sia in esecuzione: `sudo systemctl status doublezerod`
3. Verifica che le regole del firewall siano configurate (GRE, BGP, PIM e le porte del feed su `doublezero1`)
4. Controlla lo stato della connessione dallo stesso punto da cui ti sei connesso (container o host) — aspettati `BGP Session Up` sulla rete DoubleZero corretta

L'IP del client viene rilevato automaticamente dall'IP pubblico del tuo host. Verifica che corrisponda all'IP utilizzato al momento dell'acquisto del feed.

---

## Design di riferimento per la ricerca

Opzionale. Se hai già un tunnel DoubleZero e una sottoscrizione sull'host e vuoi **registrare e visualizzare graficamente** i dati del feed, il design di riferimento per la ricerca esegue multicast → parser → topofbook-bot → ClickHouse → Grafana con Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Configura `.env` con il tuo gruppo Kalshi e le porte (vedi [Indirizzi dei Feed](#feed-addresses)), quindi:

```bash
cd demo
cp .env.example .env
# imposta DZ_MULTICAST_GROUP, DZ_MARKETDATA_PORT, DZ_REFDATA_PORT, DZ_INTERFACE=doublezero1
docker compose up -d --build
```

Grafana è tipicamente raggiungibile all'indirizzo `http://localhost:3000` sull'host. Dettagli e dashboard: il [README della demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Questo visualizza i dati che stai già ricevendo. Non sostituisce l'acquisto del feed, la sottoscrizione o nessuno dei due percorsi di connessione descritti sopra.