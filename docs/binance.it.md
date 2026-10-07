---
description: Ottieni i dati di mercato Binance Spot e futures USD-M su DoubleZero Edge — Edge Connect o multicast nativo.
---

# Connessione Subscriber Binance Edge

!!! warning "Collegandomi a DoubleZero accetto i [Termini di utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol). Si prega di notare che i dati sono esclusivamente per uso interno e non possono essere ritrasmessi (vedere Sezione 2(e))."

I feed Binance distribuiscono dati di mercato top-of-book di Binance sulla rete DoubleZero Edge tramite multicast UDP. I dati vengono acquisiti da Binance a Tokyo e trasportati sulla fibra dedicata di DoubleZero, quindi raggiungono le altre metro prima di quanto li consegni l'internet pubblico. Binance è il luogo in cui avviene la price discovery per molte coppie spot, quindi i suoi dati sono un indicatore anticipatore per gli altri mercati.

Ci sono due feed, uno per ciascun matching engine di Binance:

| Feed | Strumenti | Timestamp della quote |
|------|-----------|-----------------------|
| Binance Spot | Ogni coppia spot in negoziazione, incluse le coppie quotate in valuta fiat | Orario di invio del gateway, precisione µs |
| Binance USD-M | Perpetual quotati in USDT e USDC. Futures con scadenza e perpetual TradFi non sono inclusi | Orario del matching engine, precisione ms |

Il set di strumenti segue i listing di Binance: coppie e contratti vengono aggiunti e rimossi man mano che entrano ed escono dalla negoziazione.

## Prezzi {#pricing}

I feed sono fatturati **al mese**:

| Feed | Prezzo |
|------|--------|
| Binance Spot | $100 / mese |
| Binance USD-M | $100 / mese |

## Quale percorso scegliere? {#which-path-should-i-take}

| # | Percorso | Ideale per | Impegno |
|---|----------|------------|---------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agent e app che desiderano una CLI semplice e JSON decodificato via WebSocket | Minimo |
| **2** | [Multicast nativo](#2-native-multicast-advanced) | Costruire il proprio decoder sul formato binario grezzo | Massimo |

Prima di qualsiasi percorso: acquista i feed di cui hai bisogno su [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Con l'acquisto, accetti i [Termini di utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol).

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

Quindi verifica lo stato **all'interno del container** (aspettati `BGP Session Up` e il tuo gruppo Binance) e connetti un client WebSocket alla porta `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

Ogni messaggio Binance sul WebSocket riporta `"source_name":"BINANCE"`. Gli engine condividono quel nome, quindi distinguili tramite `source_id`: `8` è Spot e `6` è USD-M. Lo stesso simbolo può esistere su entrambi — `BTCUSDT` è una coppia spot su uno e un perpetual sull'altro — e gli instrument ID sono assegnati per engine, quindi usa come chiave `source_id` oltre al simbolo o all'instrument ID.

**Contratto WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avanzato) {#2-native-multicast-advanced}

!!! warning "Richieste conoscenze tecniche approfondite"
    Il multicast nativo significa che ti unisci al gruppo autonomamente e decodifichi il formato wire **grezzo** di Edge sul tuo host. Solo gli utenti tecnicamente più esperti dovrebbero seguire questo percorso. Dovrai leggere e comprendere le specifiche, a partire da [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) e il resto di [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Preferisci [Edge Connect](#1-edge-connect-recommended) a meno che tu non abbia un requisito imprescindibile di gestire il decoder in autonomia.

### Configurazione del client DoubleZero {#doublezero-client-setup}

Segui le istruzioni di [setup](setup.md) per installare e configurare il client DoubleZero. Mantieni il client aggiornato:

```bash
sudo apt update && sudo apt install doublezero
```

### Acquista un feed {#buy-a-feed}

Con `doublezerod` in esecuzione, identifica il dispositivo con la latenza più bassa prima dell'acquisto:

```bash
doublezero latency
```

Acquista su [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configura il firewall {#configure-the-firewall}

Consenti GRE, BGP, PIM e il traffico del feed Binance. Entrambi i feed pubblicano i dati di mercato su UDP `30001` e i dati di riferimento su `30002`; si distinguono per gruppo multicast, non per porta. Vedi [Indirizzi dei feed](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Binance market / reference (both feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30001:30002 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Binance market / reference (both feeds)
sudo ufw allow in on doublezero1 to any port 30001:30002 proto udp
```

UFW non dispone del protocollo `pim`. Il PIM in uscita è consentito dalla policy di default di UFW per il traffico in uscita; se blocchi il traffico in uscita, aggiungi una regola raw per PIM in `/etc/ufw/before.rules`.

### Sottoscrivi {#subscribe}

Unisciti a ogni feed acquistato (client v0.35.0 o successivo):

```bash
doublezero connect multicast
```

La sottoscrizione tramite codice gruppo con `--subscribe` fallisce con un pass acquistato.

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

### Decodifica il formato wire autonomamente {#decode-the-wire-yourself}

La versione dello schema è **`3`** — scarta i datagrammi la cui versione non è implementata dal tuo decoder. Layout autorevoli: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluso [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md), il [Source ID Registry](https://github.com/malbeclabs/edge-feed-spec/blob/main/sources/spec.md) e il [GLOSSARY](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md).

Ogni datagramma inizia con un header di 24 byte, seguito da uno o più messaggi applicativi impacchettati fino all'MTU. I datagrammi sono little-endian e a layout fisso.

| Campo | Note |
|-------|------|
| Magic | `u16` all'offset 0: `0x445A`. Validalo. |
| Versione schema | `3` |
| Channel ID | Spot usa il canale `1`, USD-M il canale `0` |
| Sequence | Monotono per indirizzo IP sorgente, Channel ID e porta di destinazione — ogni porta ha la propria serie. Usalo per il rilevamento dei gap. |
| Send timestamp | Nanosecondi dall'epoca Unix |
| Message count | Messaggi impacchettati in questo datagramma |
| Reset count | Qualsiasi cambiamento (incluso il wrap `255` → `0`) è un reset; scarta lo stato del canale di quel publisher. |
| Datagram length | Byte totali |

#### Messaggi applicativi {#application-messages}

| Tipo | ID | Dimensione | Porta | Contenuto |
|------|----|------------|-------|-----------|
| Heartbeat | `0x01` | 16 B | market | Segnale di attività quando il mercato è inattivo |
| InstrumentDefinition | `0x02` | 130 B | reference | Simbolo, esponenti, tick e lotto, scadenza |
| Quote | `0x03` | 60 B | market | Miglior bid e ask, prezzo e quantità, flag di aggiornamento |
| Trade | `0x04` | 52 B | market | Prezzo, quantità, lato aggressore, trade ID |
| EndOfSession | `0x06` | 12 B | market | Chiusura ordinata |
| ManifestSummary | `0x07` | 24 B | reference | Flag di validità, contatore di cambio Manifest Seq, conteggio strumenti, timestamp |

**Il Source ID è la chiave dell'engine.** Entrambi i feed usano il codice venue `BINANCE`, ma ciascun engine ha il proprio Source ID nel registro edge-feed-spec: `8` Binance Spot, `6` Binance USD-Margined Futures. Gli engine elencano simboli sovrapposti (`BTCUSDT` è sia una coppia spot sia un perpetual USD-M), e ciascun engine assegna gli instrument ID in modo indipendente, quindi lo stesso instrument ID può comparire su entrambi i feed per strumenti diversi. Usa come chiave per strumenti e book **(Source ID, instrument ID)**, mai solo il simbolo o l'instrument ID. Leggi `price_exponent` e `qty_exponent` da ciascun `InstrumentDefinition` — non codificarli staticamente. L'esponente è la precisione del prezzo, non il tick: l'incremento negoziabile è `tick_size × 10^price_exponent`.

La consegna è UDP fire-and-forget senza ritrasmissione, e la porta dei dati di riferimento non ripara i dati di mercato: ripete solo `InstrumentDefinition` (almeno una volta ogni 30 s su entrambi i feed) e `ManifestSummary` (almeno una volta ogni 1 s su USD-M, ogni 5 s su Spot). Una Quote persa resta persa fino a quando il miglior bid o ask di quello strumento cambia. Deduplica i trade su **(Source ID, instrument ID, trade ID)**, mai solo sul trade ID.

Binance aggrega gli aggiornamenti di miglior bid e ask prima che raggiungano il feed: sotto carico, un aggiornamento superato per un simbolo viene scartato a favore di quello più recente. Un numero di quote inferiore ai cambiamenti del book è un comportamento normale della venue, non una perdita — usa il numero di sequenza del datagramma per rilevare le perdite.

Dettagli dei dati di riferimento che differiscono da quanto un decoder potrebbe presumere:

- **Timestamp.** `Quote` e `Trade` USD-M riportano l'orario del matching engine, con precisione al millisecondo. `Quote` Spot riporta l'orario di invio del gateway e `Trade` Spot l'orario di esecuzione, entrambi con precisione al microsecondo. Tutti sono espressi in nanosecondi sul wire.
- **`Leg1` è di 8 byte.** Gli asset base più lunghi (ad esempio `1000FLOKI` o `BROCCOLI714`) vengono troncati; il nome completo è sempre in `Symbol`.
- **Non tutti i simboli sono ASCII.** Alcuni perpetual USD-M hanno nomi cinesi, e i loro `Symbol` e `Leg1` contengono byte UTF-8. Non presumere ASCII durante la decodifica di questi campi.
- **`Expiry` è `0`** su ogni strumento USD-M, poiché sono tutti perpetual.
- **`Bid Source Count` e `Ask Source Count` sono sempre `0`.** Binance non pubblica il numero di ordini al touch.
- **USD-M esclude gli ordini Retail Price Improvement (RPI)** dal miglior bid e ask, quindi può differire da uno snapshot di profondità che li include.

---

## Indirizzi dei feed {#feed-addresses}

| Codice gruppo | Engine | Source ID | Channel ID | Gruppo multicast | Dati di mercato | Dati di riferimento |
|---------------|--------|-----------|------------|------------------|-----------------|---------------------|
| `edge-binance-spot-tob` | Spot | `8` | `1` | `233.84.178.31` | `30001` | `30002` |
| `edge-binance-usdsm-tob` | Perpetual USD-M | `6` | `0` | `233.84.178.23` | `30001` | `30002` |

`doublezero status` e `multicast group list` mostrano il codice gruppo.

Il gruppo seleziona il feed; la porta seleziona dati di mercato o dati di riferimento al suo interno. La replica multicast avviene per indirizzo IP sorgente e gruppo, e il fabric non ispeziona mai la porta UDP, quindi l'unione a un gruppo consegna tutto ciò che è presente su quel gruppo attraverso il tuo tunnel DoubleZero. La porta è un filtro socket applicato sul tuo host dopo l'arrivo dei byte. Poiché i feed condividono le porte, un socket in binding su `30001` su un host unito a entrambi i gruppi Binance riceve entrambi; filtra per gruppo di destinazione o per Source ID.

---

## Risoluzione dei problemi {#troubleshooting}

Se riscontri un problema non trattato qui, contattaci attraverso il tuo canale esistente prima di cercare soluzioni alternative. Se non disponi di un canale, consulta [Supporto](support/index.md).

### Assicurati che il tuo client sia aggiornato {#ensure-your-client-is-up-to-date}

Esegui: `sudo apt update && sudo apt install doublezero`

### Nessun datagramma in arrivo {#no-datagrams-arriving}

1. Verifica che il feed sia stato acquistato su [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un feed non acquistato non consegna traffico.
2. Verifica che il BGP sia attivo: `doublezero status` dovrebbe mostrare `BGP Session Up` sulla rete DoubleZero corretta.
3. Verifica che la sottoscrizione sia attiva: `doublezero user list --client-ip <your ip>` dovrebbe elencare il feed sotto `groups`.
4. Verifica che il gruppo sia stato unito sull'interfaccia corretta. Il multicast arriva su `doublezero1`, non su `doublezero0`.
5. Verifica che il firewall consenta le porte UDP `30001`–`30002` in ingresso su `doublezero1`.

### Due engine mescolati {#two-engines-mixed-together}

Spot e USD-M elencano entrambi simboli come `BTCUSDT`, assegnano gli instrument ID in modo indipendente e condividono le porte. Un decoder che usa come chiave dei book solo il simbolo o l'instrument ID, o che effettua il binding di un unico socket per tutti i gruppi senza controllare il gruppo di destinazione, unisce due strumenti diversi in un unico book. Usa come chiave il Source ID (o il gruppo di destinazione) oltre all'instrument ID.

### Gap di sequenza {#sequence-gaps}

Traccia la sequenza per indirizzo IP sorgente, Channel ID e porta di destinazione; un decoder basato solo sul Channel ID rileva falsi gap. Un gap reale indica datagrammi persi. Non esiste riparazione: la quote di uno strumento torna corrente quando il suo miglior bid o ask cambia nuovamente.

### Cambiamenti del reset count {#reset-count-changes}

Qualsiasi cambiamento nel reset count significa che quel publisher ha riavviato o effettuato il re-seed del canale. Scarta lo stato per quell'indirizzo IP sorgente e canale, e raccogli nuovamente le definizioni dalla porta dei dati di riferimento.

### Il tunnel non si attiva {#tunnel-not-coming-up}

1. **Edge Connect:** esegui status nel container — `docker exec doublezero-edge-connect doublezero status`. Il `doublezero status` dell'host spesso fallisce mentre il feed funziona correttamente (il container possiede il daemon). Verifica che il `doublezerod` dell'host sia arrestato.
2. **Nativo:** verifica che il daemon host sia in esecuzione: `sudo systemctl status doublezerod`
3. Verifica che le regole del firewall siano applicate (GRE, BGP, PIM e le porte del feed su `doublezero1`)
4. Controlla lo stato della connessione dallo stesso punto da cui ti sei connesso (container o host) — aspettati `BGP Session Up` sulla rete DoubleZero corretta

L'IP del client viene rilevato automaticamente dall'IP pubblico del tuo host. Verifica che corrisponda all'IP utilizzato al momento dell'acquisto del feed.

---

## Design di riferimento per la ricerca {#research-reference-design}

Opzionale. Se hai già un tunnel DoubleZero e una sottoscrizione sull'host e vuoi **registrare e visualizzare** i dati del feed, il design di riferimento per la ricerca esegue multicast → parser → topofbook-bot → ClickHouse → Grafana con Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Questo punta la demo su Binance Spot. Per un altro feed, usa il suo gruppo da [Indirizzi dei feed](#feed-addresses):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.31/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=30001/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=30002/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana è tipicamente disponibile su `http://localhost:3000` sull'host. Dettagli e dashboard: il [README della demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Questo visualizza i dati che stai già ricevendo. Non sostituisce l'acquisto del feed, la sottoscrizione o nessuno dei percorsi di connessione descritti sopra.
