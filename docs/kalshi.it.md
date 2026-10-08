---
description: Ottieni i dati di mercato Kalshi su DoubleZero Edge — Edge Connect o multicast nativo.
---

# Connessione Subscriber Kalshi Edge

!!! warning "Collegandomi a DoubleZero accetto i [Termini di utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol). Si prega di notare che i dati sono esclusivamente per uso interno e non possono essere ritrasmessi (vedere Sezione 2(e))."

I feed Kalshi distribuiscono dati di mercato perps e sports sulla rete DoubleZero Edge tramite multicast UDP. Ci sono quattro feed:

- perps Top of Book (TOB)
- perps Market by Price (MBP)
- sports Top of Book (TOB)
- sports Market by Price (MBP)

## Quale percorso scegliere?

| # | Percorso | Ideale per | Impegno |
|---|----------|------------|---------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agent e app che desiderano una CLI semplice e JSON decodificato via WebSocket | Minimo |
| **2** | [Multicast nativo](#2-native-multicast-advanced) | Costruire il proprio decoder sul formato binario grezzo | Massimo |

Prima di qualsiasi percorso: acquista i feed di cui hai bisogno su [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Con l'acquisto, accetti i [Termini di utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol) e i [Termini di servizio di Kalshi](https://doublezero.xyz/dz-edge-kalshi-terms).

---

## 1. Edge Connect (consigliato) {#1-edge-connect-recommended}

**Inizia da qui.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) è il percorso agent-friendly: un solo comando di installazione, l'host si unisce a DoubleZero e la tua app consuma **JSON decodificato via WebSocket** (`ws://<host>:8081`) invece di decodificare multicast binario.

Edge Connect soddisfa le esigenze della sua base utenti in espansione. Questo è il metodo di connessione più semplice e dovrebbe essere utilizzato a meno che non si abbia un'esigenza tecnica specifica.

Versione breve:

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

L'installer chiede il tuo secret: un token di accesso `DZ_…` **oppure** il percorso al file JSON della keypair Solana che possiede il tuo pass di accesso / acquisto del feed.

Se un `doublezerod` host è già in esecuzione, sia esso che il daemon del container effettuano il binding sulla porta UDP `44880`, quindi il daemon del container si arresta subito dopo l'avvio. L'installer propone di arrestare e disabilitare il daemon host, e lo fa senza chiedere quando `DZ_ASSUME_YES=1` è impostato. Per farlo manualmente:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Quindi verifica lo stato **all'interno del container** (aspettati `BGP Session Up` e il tuo gruppo Kalshi) e connetti un client WebSocket alla porta `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

**Contratto WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avanzato) {#2-native-multicast-advanced}

!!! warning "Richieste conoscenze tecniche approfondite"
    Il multicast nativo significa che ti unisci al gruppo autonomamente e decodifichi il formato wire **grezzo** di Edge sul tuo host. Solo gli utenti tecnicamente più esperti dovrebbero seguire questo percorso. Dovrai leggere e comprendere le specifiche, a partire da [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) e il resto di [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Preferisci [Edge Connect](#1-edge-connect-recommended) a meno che tu non abbia un requisito imprescindibile di gestire il decoder in autonomia.

### Configurazione del client DoubleZero

Segui le istruzioni di [setup](setup.md) per installare e configurare il client DoubleZero. Mantieni il client aggiornato:

```bash
sudo apt update && sudo apt install doublezero
```

### Acquista un feed

Con `doublezerod` in esecuzione, identifica il dispositivo con la latenza più bassa prima dell'acquisto:

```bash
doublezero latency
```

Acquista su [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configura il firewall

Consenti GRE, BGP, PIM e il traffico del feed Kalshi. Le porte UDP di Kalshi sono nell'intervallo `30000`–`59999`: la prima cifra indica la classe di traffico (`3` dati di mercato, `4` dati di riferimento, `5` snapshot) e la seconda cifra indica il feed, quindi i dati di riferimento corrispondono sempre a mercato + `10000` e lo snapshot a mercato + `20000`. Apri l'intera banda su `doublezero1` in modo che nuovi canali e feed non richiedano ulteriori modifiche al firewall — vedi [Indirizzi dei feed](#feed-addresses).

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
# Kalshi mercato / riferimento / snapshot (tutti i feed)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

UFW non dispone del protocollo `pim`. Il PIM in uscita è consentito dalla policy di default di UFW per il traffico in uscita; se blocchi il traffico in uscita, aggiungi una regola raw per PIM in `/etc/ufw/before.rules`.


### Sottoscrivi

Unisciti a ogni feed acquistato (client v0.35.0 o successivo):

```bash
doublezero connect multicast
```

Oppure specifica i feed tramite **codice feed**, separati da spazio:

```bash
doublezero connect multicast --subscribe-feed kalshi-perps-tob kalshi-perps-mbp kalshi-sports-tob kalshi-sports-mbp
```

Usa i codici feed (`kalshi-…`), non i nomi feed per metro e non i codici gruppo (`edge-kalshi-…`). La sottoscrizione tramite codice gruppo con `--subscribe` fallisce con un pass acquistato.

Aspettati `✅  User Provisioned`. Attendi circa 60 secondi, quindi:

```bash
doublezero status
```

Aspettati `BGP Session Up` sulla rete DoubleZero corretta.

```bash
doublezero user list --client-ip <your ip>
```

I tuoi feed appaiono nella colonna `groups`. Ispeziona gli IP dei gruppi con:

```bash
doublezero multicast group list
```


### Decodifica il formato wire autonomamente

La versione dello schema è **`3`** — scarta i datagrammi la cui versione non è implementata dal tuo decoder. Layout autorevoli: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluso [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md).

Ogni datagramma inizia con un header di 24 byte, seguito da uno o più messaggi applicativi impacchettati fino all'MTU. I datagrammi sono little-endian e a layout fisso.

| Campo | Note |
|-------|------|
| Magic | `u16` all'offset 0: `0x445A` per TOB, `0x4442` per MBP. Validalo. |
| Versione schema | `3` |
| Channel ID | Demultiplexa i canali che condividono una porta |
| Sequence | Monotono per indirizzo IP sorgente, Channel ID e porta di destinazione — ogni porta ha la propria serie. Usalo per il rilevamento dei gap. |
| Send timestamp | Nanosecondi dall'epoca Unix |
| Message count | Messaggi impacchettati in questo datagramma |
| Reset count | Qualsiasi cambiamento (incluso il wrap `255` → `0`) è un reset; scarta lo stato del canale di quel publisher. MBP può anche incrementarlo a metà sessione in caso di re-seed a livello venue. |
| Datagram length | Byte totali |

#### Messaggi applicativi (TOB)

| Tipo | ID | Dimensione | Porta | Contenuto |
|------|----|------------|-------|-----------|
| Heartbeat | `0x01` | 16 B | market | Segnale di attività quando il mercato è inattivo |
| InstrumentDefinition | `0x02` | 130 B | reference | Simbolo, esponenti, tick e lotto, scadenza |
| Quote | `0x03` | 60 B | market | Miglior bid e ask, prezzo e quantità, flag di aggiornamento |
| Trade | `0x04` | 52 B | market | Prezzo, quantità, lato aggressore, trade ID |
| EndOfSession | `0x06` | 12 B | market | Chiusura ordinata |
| ManifestSummary | `0x07` | 24 B | reference | Flag di validità, contatore di cambio Manifest Seq, conteggio strumenti, timestamp |
| PerpStats | `0x30` | 124 B | sibling | Funding, prezzi mark e oracle, open interest, volume giornaliero |

Il Source ID di Kalshi nel registro edge-feed-spec è `3`. Leggi `price_exponent` e `qty_exponent` da ciascun `InstrumentDefinition` — non codificarli staticamente.

I feed MBP utilizzano il set di messaggi market-by-price. Consulta le specifiche market-by-price e reference-data in edge-feed-spec.

La consegna è UDP fire-and-forget senza ritrasmissione, e la porta dei dati di riferimento non ripara i dati di mercato: ripete solo `InstrumentDefinition` (almeno una volta ogni 30 s) e `ManifestSummary` (almeno una volta ogni 1 s). Una Quote TOB persa resta persa fino a quando il miglior bid o ask di quel mercato cambia. Solo i feed MBP dispongono di un percorso di riparazione — il ciclo di snapshot — e un avvio a freddo MBP deve effettuare il binding sulla porta snapshot. Deduplica i trade su **(instrument ID, trade ID)**, mai solo sul trade ID.

---

## Indirizzi dei feed {#feed-addresses}

| Codice feed | Codice gruppo | Descrizione | Gruppo multicast | Dati di mercato | Dati di riferimento | Snapshot |
|-------------|---------------|-------------|------------------|-----------------|---------------------|----------|
| `kalshi-perps-tob` | `edge-kalshi-perps-tob` | Perps top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `kalshi-perps-mbp` | `edge-kalshi-perps-mbp` | Perps market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `kalshi-sports-tob` | `edge-kalshi-sports-tob` | Sports top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `kalshi-sports-mbp` | `edge-kalshi-sports-mbp` | Sports market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

Sottoscrivi con il codice feed; `doublezero status` e `multicast group list` mostrano il codice gruppo.

Schema delle porte: la prima cifra indica la classe di traffico (`3` mercato, `4` riferimento, `5` snapshot); la seconda cifra indica il feed. Il riferimento è mercato + `10000`; lo snapshot è mercato + `20000`. Le porte perps sono fisse. Le porte sports sono `base + channel id` (ad esempio, id `10` su `edge-kalshi-sports-mbp` usa `34010` / `44010` / `54010`).

Il gruppo seleziona il feed; la porta seleziona dati di mercato, dati di riferimento o snapshot al suo interno. La replica multicast avviene per indirizzo IP sorgente e gruppo, e il fabric non ispeziona mai la porta UDP, quindi l'unione a un gruppo consegna tutto ciò che è presente su quel gruppo attraverso il tuo tunnel DoubleZero. La porta è un filtro socket applicato sul tuo host dopo l'arrivo dei byte.

---

## Risoluzione dei problemi

Se riscontri un problema non trattato qui, contattaci attraverso il tuo canale esistente prima di cercare soluzioni alternative. Se non disponi di un canale, consulta [Supporto](support/index.md).

### Assicurati che il tuo client sia aggiornato

Esegui: `sudo apt update && sudo apt install doublezero`

### Nessun datagramma in arrivo

1. Verifica che il feed sia stato acquistato su [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un feed non acquistato non consegna traffico.
2. Verifica che il BGP sia attivo: `doublezero status` dovrebbe mostrare `BGP Session Up` sulla rete DoubleZero corretta.
3. Verifica che la sottoscrizione sia attiva: `doublezero user list --client-ip <your ip>` dovrebbe elencare il feed sotto `groups`.
4. Verifica che il gruppo sia stato unito sull'interfaccia corretta. Il multicast arriva su `doublezero1`, non su `doublezero0`.
5. Verifica che il firewall consenta le porte UDP del feed in ingresso su `doublezero1`.

### Gap di sequenza

Traccia la sequenza per indirizzo IP sorgente, Channel ID e porta di destinazione; un decoder basato solo sul Channel ID rileva falsi gap. Un gap reale indica datagrammi persi. Sui feed MBP, i mercati interessati si ripristinano dal successivo ciclo di snapshot. Sui feed TOB non esiste riparazione: la quote di un mercato torna corrente solo quando il suo miglior bid o ask cambia nuovamente.

### Cambiamenti del reset count

Qualsiasi cambiamento nel reset count significa che quel publisher ha riavviato o effettuato il re-seed del canale. Scarta lo stato per quell'indirizzo IP sorgente e canale, raccogli nuovamente le definizioni dalla porta dei dati di riferimento e, sui feed MBP, ricostruisci i book dalla porta snapshot.

### Il tunnel non si attiva

1. **Edge Connect:** esegui status nel container — `docker exec doublezero-edge-connect doublezero status`. Il `doublezero status` dell'host spesso fallisce mentre il feed funziona correttamente (il container possiede il daemon). Verifica che il `doublezerod` dell'host sia arrestato.
2. **Nativo:** verifica che il daemon host sia in esecuzione: `sudo systemctl status doublezerod`
3. Verifica che le regole del firewall siano applicate (GRE, BGP, PIM e le porte del feed su `doublezero1`)
4. Controlla lo stato della connessione dallo stesso punto da cui ti sei connesso (container o host) — aspettati `BGP Session Up` sulla rete DoubleZero corretta

L'IP del client viene rilevato automaticamente dall'IP pubblico del tuo host. Verifica che corrisponda all'IP utilizzato al momento dell'acquisto del feed.

---

## Design di riferimento per la ricerca

Opzionale. Se hai già un tunnel DoubleZero e una sottoscrizione sull'host e vuoi **registrare e visualizzare** i dati del feed, il design di riferimento per la ricerca esegue multicast → parser → topofbook-bot → ClickHouse → Grafana con Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Questo punta la demo su Kalshi perps TOB. Per un altro feed, usa il suo gruppo e le sue porte da [Indirizzi dei feed](#feed-addresses):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.3/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=31000/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=41000/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana è tipicamente disponibile su `http://localhost:3000` sull'host. Dettagli e dashboard: il [README della demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Questo visualizza i dati che stai già ricevendo. Non sostituisce l'acquisto del feed, la sottoscrizione o nessuno dei percorsi di connessione descritti sopra.