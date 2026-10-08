---
description: Ottieni i dati di mercato dei perpetuals Phoenix su DoubleZero Edge — Edge Connect o multicast nativo.
---

# Connessione Subscriber Phoenix Edge

!!! warning "Connettendomi a DoubleZero accetto i [Termini di Utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol). Si prega di notare che i dati sono esclusivamente per uso interno e non possono essere ritrasmessi (vedi Sezione 2(e))."

I feed Phoenix forniscono dati di mercato dei perpetuals Phoenix sulla rete DoubleZero Edge tramite multicast UDP. Sono disponibili due feed:

- Top of Book (TOB): miglior bid e ask, più stampe dei trade
- Market by Price (MBP): profondità a livello di prezzo, più stampe dei trade

## Prezzi {#pricing}

I feed vengono fatturati **mensilmente**:

| Feed | Prezzo |
|------|--------|
| `phoenix-tob` | $50 / mese |
| `phoenix-mbp` | $100 / mese |

## Quale percorso devo scegliere? {#which-path-should-i-take}

| # | Percorso | Ideale per | Impegno |
|---|----------|------------|---------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agent e app che desiderano una CLI semplice e JSON decodificato via WebSocket | Minimo |
| **2** | [Multicast nativo](#2-native-multicast-advanced) | Costruire il proprio decoder sul formato wire grezzo | Massimo |

Prima di qualsiasi percorso: acquista i feed necessari su [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Effettuando l'acquisto, accetti i [Termini di Utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol).

---

## 1. Edge Connect (consigliato) {#1-edge-connect-recommended}

**Inizia da qui.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) è il percorso agent-friendly: un singolo comando di installazione, l'host si connette a DoubleZero, e la tua app consuma **JSON decodificato via WebSocket** (`ws://<host>:8081`) invece di decodificare multicast binario.

Edge Connect soddisfa le esigenze della sua base utenti in espansione. Questo è il metodo di connessione più semplice e dovrebbe essere utilizzato a meno che tu non abbia un'esigenza tecnica specifica.

Versione breve:

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

L'installer chiede il tuo segreto: un token di accesso `DZ_…` **oppure** il percorso al file JSON della keypair Solana che possiede il tuo access pass / acquisto del feed.

Se un `doublezerod` sull'host è già in esecuzione, sia esso che il daemon del container bindano la porta UDP `44880`, quindi il daemon del container si arresta subito dopo l'avvio. L'installer offre di fermare e disabilitare il daemon dell'host, e lo fa senza chiedere quando `DZ_ASSUME_YES=1` è impostato. Per farlo manualmente:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Quindi verifica lo stato **all'interno del container** (aspettati `BGP Session Up` e il tuo gruppo Phoenix) e connetti un client WebSocket alla porta `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

Edge Connect arbitra tra i publisher Phoenix, quindi i client WebSocket vedono una sola copia di ogni aggiornamento.

**Contratto WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avanzato) {#2-native-multicast-advanced}

!!! warning "Richieste conoscenze tecniche approfondite"
    Il multicast nativo significa che ti unisci al gruppo autonomamente e decodifichi il formato wire Edge **grezzo** sul tuo host. Solo gli utenti tecnicamente più esperti dovrebbero seguire questo percorso. Dovrai leggere e comprendere le specifiche, a partire da [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) e il resto di [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Preferisci [Edge Connect](#1-edge-connect-recommended) a meno che tu non abbia un requisito specifico per gestire il decoder in autonomia.

### Configurazione client DoubleZero {#doublezero-client-setup}

Segui le istruzioni di [configurazione](setup.md) per installare e configurare il client DoubleZero. Mantieni il client aggiornato:

```bash
sudo apt update && sudo apt install doublezero
```

### Acquista un feed {#buy-a-feed}

Con `doublezerod` in esecuzione, identifica il dispositivo a latenza più bassa prima dell'acquisto:

```bash
doublezero latency
```

Acquista su [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configura il firewall {#configure-the-firewall}

Consenti GRE, BGP, PIM e il traffico del feed Phoenix. Le porte UDP Phoenix sono nell'intervallo `9201`–`9213`: `9201`/`9202` trasportano i dati di mercato e di riferimento Top of Book, e `9211`/`9212`/`9213` trasportano i dati di mercato, di riferimento e snapshot Market by Price. Vedi [Indirizzi dei Feed](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Phoenix market / reference / snapshot (entrambi i feed)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 9201:9213 -j ACCEPT
```


**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Phoenix market / reference / snapshot (entrambi i feed)
sudo ufw allow in on doublezero1 to any port 9201:9213 proto udp
```

UFW non ha il protocollo `pim`. Il PIM in uscita è consentito dalla policy outgoing predefinita di UFW; se blocchi il traffico in uscita, aggiungi una regola raw per PIM in `/etc/ufw/before.rules`.


### Sottoscrivi {#subscribe}

Unisciti a ogni feed acquistato (client v0.35.0 o successivo):

```bash
doublezero connect multicast
```

Oppure specifica i feed tramite **codice feed**:

```bash
doublezero connect multicast --subscribe-feed phoenix-tob phoenix-mbp
```

Usa i codici feed `phoenix-tob` / `phoenix-mbp`, non i nomi feed per metro (come `phoenix-tob-cmh`) e non i codici gruppo (`edge-phoenix-…`). La sottoscrizione tramite codice gruppo con `--subscribe` fallisce con un pass acquistato.

Aspettati `✅  User Provisioned`. Attendi circa 60 secondi, poi:

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


### Decodifica il wire autonomamente {#decode-the-wire-yourself}

La versione dello schema è **`3`** — scarta i datagrammi la cui versione il tuo decoder non implementa. Layout autorevoli: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), inclusi [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md), [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) e il [GLOSSARY](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md).

Ogni datagramma inizia con un header di 24 byte, seguito da uno o più messaggi applicativi impacchettati fino alla MTU. I datagrammi sono little-endian e a layout fisso.

| Campo | Note |
|-------|------|
| Magic | `u16` all'offset 0: `0x445A` su TOB, `0x4442` su MBP. Validalo. |
| Schema version | `3` |
| Channel ID | Entrambi i feed Phoenix usano il canale `1` |
| Sequence | Monotono per indirizzo IP sorgente, Channel ID e porta di destinazione — ogni porta ha la propria serie. Usalo per il rilevamento dei gap. |
| Send timestamp | Nanosecondi dall'epoca Unix |
| Message count | Messaggi impacchettati in questo datagramma |
| Reset count | Qualsiasi cambiamento (incluso il wrap `255` → `0`) è un reset; scarta lo stato del canale di quel publisher. MBP può anche incrementarlo a metà sessione in caso di re-seed dell'intera venue. |
| Datagram length | Byte totali |

**Più di un publisher invia ogni feed Phoenix**, sugli stessi gruppi, canale e porte. Indicizza tutto lo stato di canale e strumento sull'indirizzo IP sorgente oltre che sul Channel ID, altrimenti le serie di sequenza di due publisher si intercalano in una sola. Un subscriber nativo riceve una copia di ogni trade per publisher.

#### Messaggi applicativi (TOB) {#application-messages-tob}

| Tipo | ID | Dimensione | Porta | Contenuto |
|------|----|------------|-------|-----------|
| Heartbeat | `0x01` | 16 B | market | Liveness quando il mercato è silenzioso |
| InstrumentDefinition | `0x02` | 130 B | reference | Simbolo, esponenti, tick e lotto, scadenza |
| Quote | `0x03` | 60 B | market | Miglior bid e ask, prezzo e dimensione, flag di aggiornamento |
| Trade | `0x04` | 52 B | market | Prezzo, dimensione, lato aggressore, trade ID |
| EndOfSession | `0x06` | 12 B | market | Shutdown pulito |
| ManifestSummary | `0x07` | 24 B | reference | Flag di validità, contatore di cambio Manifest Seq, conteggio strumenti, timestamp |

Phoenix non invia `0x08` (Liquidation). Il Source ID di Phoenix nel registro edge-feed-spec è `2`. Leggi `price_exponent` e `qty_exponent` da ogni `InstrumentDefinition` — non hardcodarli. L'esponente è la precisione del prezzo, non il tick: BTC su Phoenix usa l'esponente `-2` con una tick size di `100`, quindi si muove in dollari interi.

Il feed MBP utilizza il set di messaggi market-by-price. Consulta le specifiche market-by-price e reference-data in edge-feed-spec. Entrambi i feed provengono dallo stesso processo publisher, quindi condividono gli instrument ID, e la porta market-data MBP trasporta le stesse stampe dei trade del TOB. I trade ID di Phoenix sono numeri di sequenza per mercato, quindi deduplica i trade su **(instrument ID, trade ID)**, mai sul solo trade ID.

La consegna è UDP fire-and-forget senza ritrasmissione, e la porta reference-data non ripara i dati di mercato: ripete solo `InstrumentDefinition` (almeno una volta ogni 30 s) e `ManifestSummary` (almeno una volta ogni 1 s). Una Quote TOB persa resta persa fino a quando il miglior bid o ask di quel mercato cambia. Solo MBP ha un percorso di riparazione — il suo ciclo di snapshot — e un cold start MBP deve bindare la porta snapshot.

---

## Indirizzi dei Feed {#feed-addresses}

| Codice feed | Codice gruppo | Descrizione | Gruppo multicast | Dati di mercato | Dati di riferimento | Snapshot |
|-------------|---------------|-------------|------------------|-----------------|---------------------|----------|
| `phoenix-tob` | `edge-phoenix-tob` | Top-of-book e trade dei perpetuals | `233.84.178.24` | `9201` | `9202` | — |
| `phoenix-mbp` | `edge-phoenix-mbp` | Market-by-price dei perpetuals | `233.84.178.25` | `9211` | `9212` | `9213` |

Sottoscrivi con il codice feed; `doublezero status` e `multicast group list` mostrano il codice gruppo.

Il gruppo seleziona il feed; la porta seleziona dati di mercato, dati di riferimento o snapshot al suo interno. La replicazione multicast avviene per indirizzo IP sorgente e gruppo, e il fabric non ispeziona mai la porta UDP, quindi unirsi a un gruppo consegna tutto ciò che è su quel gruppo attraverso il tuo tunnel DoubleZero. La porta è un filtro socket applicato sul tuo host dopo l'arrivo dei byte.

---

## Risoluzione dei problemi {#troubleshooting}

Se riscontri un problema non trattato qui, contattaci attraverso il tuo canale esistente prima di cercare workaround. Se non hai un canale, vedi [Supporto](support/index.md).

### Assicurati che il client sia aggiornato {#ensure-your-client-is-up-to-date}

Esegui: `sudo apt update && sudo apt install doublezero`

### Nessun datagramma in arrivo {#no-datagrams-arriving}

1. Conferma che il feed sia stato acquistato su [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un feed non acquistato non consegna traffico.
2. Conferma che BGP sia attivo: `doublezero status` dovrebbe mostrare `BGP Session Up` sulla rete DoubleZero corretta.
3. Conferma che la sottoscrizione sia attiva: `doublezero user list --client-ip <your ip>` dovrebbe elencare il feed sotto `groups`.
4. Conferma che il gruppo sia unito sull'interfaccia corretta. Il multicast arriva su `doublezero1`, non su `doublezero0`.
5. Conferma che il firewall permetta le porte UDP del feed in ingresso su `doublezero1`.

### Gap di sequenza {#sequence-gaps}

Traccia la sequenza per indirizzo IP sorgente, Channel ID e porta di destinazione; un decoder indicizzato solo sul Channel ID vede gap falsi. Un gap reale significa datagrammi persi. Su MBP, i mercati interessati si ripristinano dal prossimo ciclo di snapshot. Su TOB non c'è riparazione: la quote di un mercato torna corrente quando il suo miglior bid o ask cambia nuovamente.

### Cambiamenti del reset count {#reset-count-changes}

Qualsiasi cambiamento nel reset count significa che quel publisher si è riavviato o ha fatto il re-seed del canale. Scarta lo stato per quell'indirizzo IP sorgente e canale, raccogli nuovamente le definizioni dalla porta reference-data e su MBP ricostruisci i book dalla porta snapshot.

### Il tunnel non si attiva {#tunnel-not-coming-up}

1. **Edge Connect:** esegui lo status nel container — `docker exec doublezero-edge-connect doublezero status`. Il `doublezero status` sull'host spesso fallisce mentre il feed funziona correttamente (il container possiede il daemon). Conferma che il `doublezerod` dell'host sia fermato.
2. **Nativo:** verifica che il daemon dell'host sia in esecuzione: `sudo systemctl status doublezerod`
3. Verifica che le regole del firewall siano in posizione (GRE, BGP, PIM e le porte del feed su `doublezero1`)
4. Controlla lo stato della connessione dallo stesso punto da cui ti sei connesso (container o host) — aspettati `BGP Session Up` sulla rete DoubleZero corretta

L'IP del client viene rilevato automaticamente dall'IP pubblico del tuo host. Verifica che corrisponda all'IP utilizzato al momento dell'acquisto del feed.

---

## Design di riferimento per la ricerca {#research-reference-design}

Opzionale. Se hai già un tunnel DoubleZero e una sottoscrizione sull'host e vuoi **registrare e visualizzare graficamente** i dati del feed, il design di riferimento per la ricerca esegue multicast → parser → topofbook-bot → ClickHouse → Grafana con Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Questo punta la demo al Phoenix TOB (vedi [Indirizzi dei Feed](#feed-addresses)):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.24/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=9201/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=9202/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana è tipicamente raggiungibile su `http://localhost:3000` sull'host. Dettagli e dashboard: il [README della demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Questo visualizza i dati che stai già ricevendo. Non sostituisce l'acquisto del feed, la sottoscrizione o nessuno dei percorsi di connessione sopra descritti.