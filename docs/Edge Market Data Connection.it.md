---
description: Esegui doublezero-edge-connect per ri-inoltrare gli shred di Solana a una porta UDP locale e consumare dati di mercato Edge normalizzati tramite un WebSocket locale.
---

# Connessione Edge

!!! warning "Connettendomi a DoubleZero accetto i [Termini d'uso di DoubleZero](https://doublezero.xyz/terms-protocol). I dati sono esclusivamente per uso interno e non possono essere ritrasmessi (vedi Sezione 2(e))."

`doublezero-edge-connect` è un bridge che si unisce al **multicast binario di DoubleZero Edge** e lo ri-serve localmente come due feed:

1. **Inoltro shred di Solana** — shred deduplicati (con verifica opzionale della firma) distribuiti a una o più destinazioni UDP locali, pronti per il tuo validator o RPC.
2. **Dati di mercato normalizzati** — feed dei venue Edge decodificati, con precisione corretta, e ri-serviti come un singolo WebSocket JSON su `ws://host:8081`.

Entrambi vengono eseguiti dallo stesso container e dalla stessa installazione a riga singola. Abilita qualsiasi feed concesso dalla tua autorizzazione onchain.

```
                                        ┌─ UDP datagrams ──▶  validator / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binary)             (dedup · decode · normalize)  └─ WebSocket (JSON) ──▶  trading engine
                                                          ws://host:8081
```

---

## Requisiti

- Host **Linux/amd64** con un indirizzo IPv4 pubblico autorizzato onchain per l'ambiente di destinazione.
- **Docker** (l'installazione a riga singola lo installa se mancante).
- **Connettività GRE** — consentire il protocollo IP 47 presso il tuo cloud provider; su AWS disabilitare il controllo source/dest dell'ENI.
- Un **secret di accesso DoubleZero**: un token base64 con prefisso `DZ_` o un percorso a un file keypair, ottenuto dal processo di [onboarding DoubleZero](setup.md).

---

## Passo 1: Installazione ed Esecuzione

Un singolo comando prepara l'host e avvia il container bridge. Si unisce alla rete DoubleZero e avvia ogni feed concesso dalla tua autorizzazione — inoltro shred e/o il WebSocket per dati di mercato sulla porta `:8081`:

=== "Mainnet-beta"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect | bash
    ```

=== "Testnet"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect-testnet | bash
    ```

=== "Devnet (privata)"

    ```bash
    # Richiede un token GHCR con read:packages
    DZ_GHCR_TOKEN=<your-token> curl -fsSL https://get.doublezero.xyz/connect-devnet | bash
    ```

Cosa fa lo script:

1. Verifica che l'host sia Linux/amd64.
2. Carica il tuo secret di accesso (richiesto una volta se `DZ_SECRET` non è impostato) e **verifica il pass di accesso onchain prima di installare qualsiasi cosa** — un controllo puramente lato host contro il JSON-RPC pubblico del ledger. Se il pass è associato a un IP diverso da quello dell'host, interrompe l'esecuzione (quando l'IP è stato fornito esplicitamente tramite `DZ_CLIENT_IP`) o avvisa e continua (quando l'IP è stato solo auto-rilevato, il che può essere errato dietro NAT), lasciando `doublezero connect` come verifica effettiva.
3. Assicura che Docker sia presente (propone di installarlo) e prepara il kernel dell'host per il tunnel GRE: carica `tun`/`ip_gre`, aumenta `net.core.rmem_max`, avvisa riguardo firewall e regole del cloud provider.
4. Esegue il container bridge (`--network host`, `NET_ADMIN`/`NET_RAW`, `/dev/net/tun`) ed esegue `doublezero connect multicast`.

!!! tip "Installazione non interattiva"
    Imposta `DZ_SECRET=DZ_…` prima della pipe per eseguire in modo completamente automatico — nessun prompt.

---

## Passo 2: Configurazione

Tutta la configurazione avviene tramite **variabili d'ambiente impostate prima della pipe**. Non esiste un file di configurazione.

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### Variabili dell'installer

| Variabile | Default | Scopo |
|----------|---------|---------|
| `DZ_SECRET` | *(richiesto)* | Token base64 con prefisso `DZ_` **oppure** percorso a un file keypair. Un token viene iniettato nel container e non viene mai scritto su disco; un file viene montato in bind read-only. |
| `DZ_ENV` | per script | `mainnet-beta` \| `testnet` \| `devnet`. |
| `DZ_IMAGE` | per script | Override dell'immagine del container. |
| `DZ_NAME` | `doublezero-edge-connect` | Nome del container. |
| `DZ_FEEDS` | *(tutti)* | Venue separati da virgola per restringere l'ingestione dei dati di mercato (es. `VenueA,VenueB`). Non influisce sull'inoltro degli shred di Solana. |
| `DZ_CLIENT_IP` | *(auto-rilevato)* | Override dell'IPv4 pubblico utilizzato dal pre-check del pass di accesso onchain. Impostalo quando l'auto-rilevamento è errato (es. dietro NAT) così il pre-check può confermare anziché solo avvisare. |
| `DZ_LEDGER_RPC_URL` | per env | Override dell'endpoint RPC del ledger DoubleZero utilizzato dal pre-check. |
| `DZ_ASSUME_YES` | `0` | Salta i prompt di conferma (es. il prompt di installazione Docker). |
| `DZ_GHCR_TOKEN` | — | **Solo Devnet** — un token GHCR con `read:packages` (l'immagine devnet è privata). |
| `DZ_GHCR_USER` | `malbeclabs` | **Solo Devnet** — username GHCR per il login. |

### Variabili del bridge

L'installer inoltra **qualsiasi variabile non vuota** del bridge direttamente al container. Le più comuni:

| Variabile | Default | Scopo |
|----------|---------|---------|
| `DZ_IFACE` | `doublezero1` | Interfaccia di rete su cui ascoltare. |
| `DZ_RECV_BUF` | `8388608` | Override del buffer di ricezione UDP (byte; default 8 MiB). |
| `METRICS_BIND` | *(vuoto / disattivato)* | Abilita l'endpoint Prometheus `/metrics` (es. `127.0.0.1:9090`). |
| `RUST_LOG` | `warn,doublezero_edge_connect=info` | Livello di log (`debug`, `warn`, ecc.). |
| `DZ_SHRED_FORWARD` | — | Destinazione/i UDP locale/i per gli shred inoltrati — vedi [Inoltro Shred di Solana](#inoltro-shred-di-solana). |
| `WS_BIND` | `0.0.0.0:8081` | Indirizzo di bind del WebSocket per dati di mercato — vedi [WebSocket Dati di Mercato](#websocket-dati-di-mercato). |
| `WS_MAX_CLIENTS` | `64` | Massimo numero di client WebSocket concorrenti. |
| `WS_INPUT_COINS` | *(vuoto / disattivato)* | Abilita il backstop WebSocket pubblico di Hyperliquid per i simboli listati (es. `BTC,ETH`) — vedi [Sorgenti di input](#sorgenti-di-input-e-backstop-websocket). |
| `WS_INPUT_URL` | `wss://api.hyperliquid.xyz/ws` | URL del WebSocket pubblico di Hyperliquid per il backstop. |
| `PHOENIX_WS_INPUT_MARKETS` | *(vuoto / disattivato)* | Abilita il backstop WebSocket pubblico di Phoenix (solo trade) per i ticker listati (es. `SOL,BTC`). |
| `PHOENIX_WS_INPUT_URL` | `wss://perp-api.phoenix.trade/v1/ws` | URL del WebSocket pubblico di Phoenix per il backstop. |

**Esempi:**

```bash
# Inoltra shred a un validator/RPC locale:
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# Non interattivo, testnet:
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# Restringi i dati di mercato a venue specifici, logging verbose, porta WS non predefinita:
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# Abilita metriche e un backstop WS pubblico:
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    L'installer inoltra solo valori **non vuoti**, con un'eccezione: `WS_BIND` viene inoltrato anche se impostato vuoto, quindi `WS_BIND=""` **disabilita** effettivamente il sink WebSocket tramite la riga singola. Per qualsiasi altra variabile, un override vuoto non può essere passato tramite la pipe — usa un `docker run` scritto manualmente per questo (vedi [Self-hosting](#avanzato-self-hosting)).

---

## Inoltro Shred di Solana

Il bridge si unisce ai gruppi multicast `edge-solana-*` per gli shred e distribuisce ogni datagramma a una o più destinazioni UDP locali — alimentando il tuo validator o RPC direttamente dalla rete Edge. Si attiva automaticamente al discovery quando quei gruppi sono presenti nella tua autorizzazione.

```bash
# Default (solo dedup, inoltro alla porta locale 20000):
DZ_SHRED_FORWARD=127.0.0.1:20000 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# Con verifica della firma:
DZ_SHRED_DEDUP_MODE=sigverify \
  DZ_SHRED_RPC_URL=https://api.mainnet-beta.solana.com \
  DZ_SHRED_FORWARD=127.0.0.1:20000 \
  DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

| Variabile | Default | Scopo |
|----------|---------|---------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | Destinazione/i per gli shred inoltrati (ripetibile). |
| `DZ_SHRED_DISABLE` | `0` | Opt-out principale (`--shred-forward-disable`). Mantiene il forwarder disattivato indipendentemente da ciò che concede la tua autorizzazione — impostalo quando nessun consumer locale è in ascolto, per evitare di sprecare CPU inoltrando il firehose di shred nel vuoto. |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup` (una copia per shred), `sigverify` (+ verifica ed25519), `none` (tutti i datagrammi). |
| `DZ_SHRED_RPC_URL` | — | Endpoint RPC Solana; richiesto dalla modalità `sigverify`. |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | Dimensione della finestra di deduplicazione. |

Vedi [Inoltro shred](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md) per la pipeline completa e le avvertenze.

---

## WebSocket Dati di Mercato

Apri un WebSocket verso `ws://<host>:8081` e leggi frame JSON. Ricevi tutti i venue per cui sei autorizzato. Un messaggio opzionale `subscribe` restringe lo stream a venue e simboli specifici.

Qualsiasi engine che parli WebSocket + JSON può consumarlo con un adapter sottile (~50–100 righe). Il multicast binario, la suddivisione a due porte per venue e l'handshake manifest/precisione restano tutti all'interno del bridge; l'unico contratto contro cui un consumer programma è il WebSocket JSON.

!!! note
    Il sink WebSocket si attiva solo quando almeno un feed di dati di mercato è attivo per la tua autorizzazione — un host solo-shred non serve alcun WebSocket. L'attivazione è guidata da un riconciliatore di sottoscrizioni onchain che si aggiorna ogni 30s (`--subscription-refresh-secs`); `--subscription-gating-disable` disabilita il gating.

### Ciclo di vita della connessione

Ad ogni nuova connessione il bridge:

1. **Riproduce le definizioni correnti degli strumenti** — un messaggio `instrument` per ogni simbolo noto — così il consumer ha la precisione prima della prima quotazione.
2. **Riproduce l'ultimo snapshot di profondità** per simbolo (se il feed Market-by-Order è attivo).
3. **Trasmette in streaming** messaggi `quote` / `trade` / `midpoint` / `depth` man mano che arrivano, distribuiti a tutti i consumer connessi.

```
connect → instrument (×N) → depth (×M, latest books) → quote → trade → depth → …
```

### Tipi di messaggio

Ogni messaggio è un oggetto JSON contrassegnato da un campo `type`:

| `type` | Significato |
|--------|---------|
| `instrument` | Definizione strumento/precisione. |
| `quote` | Aggiornamento top-of-book (stato completo). |
| `trade` | Stampa di trade (ultimo prezzo). |
| `midpoint` | Prezzo mid derivato. |
| `depth` | Snapshot completo della profondità del book degli ordini. |
| `status` | Transizione dello stato di salute del feed a livello di venue. |

I consumer **devono ignorare valori `type` sconosciuti e campi sconosciuti** (compatibilità in avanti).

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

Inviato alla connessione e ogni volta che le definizioni cambiano. `price_exponent` e `qty_exponent` forniscono il tick size e lo step di dimensione del venue come potenze di dieci.

#### `quote`

```json
{
  "type": "quote",
  "venue": "ExampleVenue",
  "symbol": "SOL",
  "bid": 184.20, "ask": 184.21,
  "bid_size": 12.5, "ask_size": 8.0,
  "bid_n": 3, "ask_n": 2,
  "source_ts_ns": 1781019263715344015,
  "recv_ts_ns":   1781019263715501230,
  "kernel_rx_ts_ns": 1781019263715300010,
  "ws_send_ts_ns":   1781019263715600440
}
```

Ogni `quote` è **stato completo** — un messaggio perso si auto-ripara alla prossima quotazione, nessuna risincronizzazione necessaria. I quattro timestamp decompongono la latenza end-to-end:

```
source_ts_ns → kernel_rx_ts_ns → recv_ts_ns → ws_send_ts_ns → (consumer recv)
  venue book      wire arrival      post-decode    WS hand-off
```

`0` è il valore sentinella per "non disponibile" — trattalo come mancante, non come 1970.

#### `trade`

```json
{
  "type": "trade",
  "venue": "ExampleVenue", "symbol": "SOL",
  "price": 184.20, "size": 3.5,
  "aggressor_side": "buy",
  "trade_id": 987654, "cumulative_volume": 12500.0,
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

`aggressor_side` è `"buy"`, `"sell"` o `"unknown"`. I trade sono eventi puntuali e non vengono riprodotti alla riconnessione.

#### `depth`

```json
{
  "type": "depth",
  "venue": "MboVenue", "symbol": "SOL",
  "bids": [[184.20, 12.5], [184.19, 4.0]],
  "asks": [[184.21, 8.0], [184.22, 6.5]],
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

I `bids` sono ordinati dal prezzo più alto al più basso; gli `asks` sono ordinati dal prezzo più basso al più alto. Ogni `depth` è uno **snapshot completo** — sostituisci, non unire.

#### `status`

```json
{"type":"status","venue":"ExampleVenue","state":"down","stale_ms":30000,"ts_ns":...}
```

Emesso al limite quando il multicast delle quotazioni di un venue diventa silenzioso (`state:"down"`) o si riprende (`state:"ok"`). Usalo per disattivare visualmente un venue nella tua UI. La consegna delle quotazioni non è condizionata dallo status — il feed si auto-ripara alla prossima quotazione.

### Sottoscrizioni

Per impostazione predefinita ricevi tutto. Invia un messaggio di controllo per restringere lo stream:

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Omettere un campo corrisponde a qualsiasi valore (`{"symbol":"SOL"}` = SOL su ogni venue). `venue` viene confrontato senza distinzione tra maiuscole e minuscole.

**Conferma del server:**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Gli errori restituiscono `{"channel":"error","error":"<reason>"}`.

### Heartbeat e liveness

- Il server invia un **WebSocket Ping** ogni 20 secondi; i client conformi rispondono automaticamente con Pong.
- I client silenti per 60 secondi vengono chiusi e rimossi.
- Keepalive a livello applicativo: `{"method":"ping"}` → `{"channel":"pong"}`.

### Scheletro del consumer

```python
import json, websocket

def on_message(ws, frame):
    msg = json.loads(frame)
    t = msg.get("type")
    if t == "instrument":
        register_instrument(msg["venue"], msg["symbol"],
                            msg["price_exponent"], msg["qty_exponent"])
    elif t == "quote":
        on_top_of_book(msg["venue"], msg["symbol"],
                       msg["bid"], msg["ask"],
                       msg["bid_size"], msg["ask_size"])
    elif t == "trade":
        on_trade(msg["venue"], msg["symbol"],
                 msg["price"], msg["size"], msg["aggressor_side"])
    elif t == "depth":
        replace_book(msg["venue"], msg["symbol"],
                     msg["bids"], msg["asks"])
    # tipi sconosciuti: ignora silenziosamente (compatibilità in avanti)

ws = websocket.WebSocketApp("ws://localhost:8081", on_message=on_message)
ws.run_forever()
```

### Sorgenti di input e backstop WebSocket

Il feed multicast Edge è sempre attivo. **Backstop WebSocket pubblici** opzionali possono colmare le lacune quando il feed Edge si interrompe. Ne sono disponibili due, ciascuno disattivato per default e abilitabile indipendentemente per venue:

| Backstop | Abilita con | Copre | URL predefinito |
|----------|-------------|--------|-------------|
| **Hyperliquid** | `WS_INPUT_COINS` (es. `BTC,ETH`) | quotazioni + trade | `wss://api.hyperliquid.xyz/ws` (`WS_INPUT_URL`) |
| **Phoenix** | `PHOENIX_WS_INPUT_MARKETS` (ticker, es. `SOL,BTC`) | **solo trade** | `wss://perp-api.phoenix.trade/v1/ws` (`PHOENIX_WS_INPUT_URL`) |

```bash
# Abilita il backstop Hyperliquid per BTC ed ETH:
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# Abilita il backstop trade di Phoenix per SOL:
PHOENIX_WS_INPUT_MARKETS=SOL DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

Per ogni tick `(venue, symbol, source_ts)`, le sorgenti Edge e pubbliche competono all'interno di un arbitro condiviso. In condizioni normali la sorgente Edge vince (sub-ms vs. decine di ms su internet); quando l'Edge ha interruzioni, la copia pubblica interviene. L'output WebSocket è identico indipendentemente da quale sorgente ha consegnato un dato aggiornamento. (I backstop di Phoenix coprono solo i trade — Edge rimane l'unica sorgente delle quotazioni Phoenix.)

---

## Gestione del Container

```bash
# Streaming dei log
sudo docker logs -f doublezero-edge-connect

# Verifica dello stato del tunnel
sudo docker exec -it doublezero-edge-connect doublezero status

# Verifica delle latenze dei dispositivi
sudo docker exec -it doublezero-edge-connect doublezero latency

# Arresto e rimozione
sudo docker stop doublezero-edge-connect && sudo docker rm doublezero-edge-connect
```

!!! note "Nessun TLS"
    Il bridge è pensato per una rete trusted/locale. Termina il TLS con un reverse proxy se esponi l'endpoint WebSocket esternamente.

---

## Monitoraggio (Metriche Prometheus)

L'endpoint delle metriche è **disattivato per default**. Abilitalo con `METRICS_BIND`:

```bash
METRICS_BIND=127.0.0.1:9090 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

Poi esegui lo scrape:

```bash
curl -s localhost:9090/metrics | grep '^dz_'
```

Metriche principali:

| Metrica | Cosa traccia |
|--------|---------------|
| `dz_feed_up{venue}` | `1` mentre il multicast del venue è attivo, `0` mentre è silenzioso. |
| `dz_datagrams_received_total{venue}` | Volume di ingestione per venue. |
| `dz_emit_total{venue,kind}` | Messaggi trasmessi dopo la dedup, per tipo. |
| `dz_quotes_admitted_total{venue,publisher}` | Quotazioni ammesse dall'arbitro, attribuite alla sorgente vincente. Un aumento di `publisher="public"` significa che un backstop sta colmando un'interruzione Edge (vs. `publisher="edge"` in condizioni normali). |
| `dz_quotes_dropped_total{venue}` | Quotazioni obsolete/duplicate soppresse. |
| `dz_ws_clients` | Client WebSocket attualmente connessi. |
| `dz_ws_messages_sent_total{kind}` | Messaggi inoltrati ai client. |
| `dz_ws_client_lagged_total` | Numero di volte in cui un client lento è stato disconnesso per proteggere il feed. |

Un probe di liveness `GET /healthz` è anch'esso servito sullo stesso indirizzo di bind.

---

## Avanzato: Self-hosting

Il container è disponibile su GHCR:

| Ambiente | Immagine | Tag |
|-------------|-------|-----|
| Mainnet-beta | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:mainnet-beta` |
| Testnet | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:testnet` |
| Devnet (privata) | `ghcr.io/malbeclabs/doublezero-edge-connect-devnet` | `:latest` |

Eseguilo manualmente (necessario per opzioni che l'installer non può inoltrare, come `WS_BIND=""`):

```bash
docker run --rm --network host --cap-add NET_ADMIN --device /dev/net/tun \
  -e DZ_SECRET=DZ_… \
  -e DZ_SHRED_FORWARD=127.0.0.1:20000 \
  -e WS_BIND=0.0.0.0:8081 \
  -e METRICS_BIND=127.0.0.1:9090 \
  ghcr.io/malbeclabs/doublezero-edge-connect:mainnet-beta
```

**Build dal sorgente:**

```bash
git clone https://github.com/malbeclabs/doublezero-edge-connect
cd doublezero-edge-connect
cargo build --release
cargo test

./target/release/doublezero-edge-connect \
  --iface doublezero1 \
  --ws-bind 0.0.0.0:8081
```

Un buffer di ricezione del kernel più grande è raccomandato per feed a raffica:

```bash
sudo sysctl -w net.core.rmem_max=268435456
```

---

## Limiti e Backpressure

| Limite | Default | Comportamento quando superato |
|-------|---------|------------------------|
| Client concorrenti (`WS_MAX_CLIENTS`) | 64 | La nuova connessione viene rifiutata. |
| Sottoscrizioni per client (`WS_MAX_SUBS`) | 256 | Il `subscribe` viene rifiutato con un errore. |
| Messaggi di controllo in ingresso / client / min (`WS_MAX_INBOUND_PER_MIN`) | 600 | Il client viene disconnesso. |
| Buffer di broadcast (`WS_BROADCAST_CAPACITY`) | 4096 | Un client lento **perde i messaggi più vecchi** (non blocca mai il feed). |

Poiché ogni `quote` e `depth` è stato completo, un consumer che perde messaggi sotto backpressure si auto-ripara al messaggio successivo — nessun handshake di risincronizzazione necessario.

---

## Risoluzione dei Problemi

### Nessuno shred in arrivo sulla porta locale

- Conferma che il tuo accesso sia autorizzato per i gruppi shred `edge-solana-*` onchain.
- Verifica che il tunnel sia attivo: `sudo docker exec -it doublezero-edge-connect doublezero status`
- Controlla i log per errori di join: `sudo docker logs -f doublezero-edge-connect`
- Conferma che `DZ_SHRED_FORWARD` punti a una destinazione UDP locale raggiungibile.

### Nessun messaggio da un venue

- Verifica che il tunnel sia attivo: `sudo docker exec -it doublezero-edge-connect doublezero status`
- Controlla i log per errori di join: `sudo docker logs -f doublezero-edge-connect`
- Conferma che il tuo accesso sia autorizzato per quel venue onchain.
- Restringi l'ingestione a quel venue con `DZ_FEEDS=<VenueName>` per isolare il problema.

### Il WebSocket si connette ma non arrivano quotazioni

- I messaggi `instrument` arrivano sempre per primi; le quotazioni seguono una volta completato l'handshake dei dati di riferimento. Attendi 10–20 secondi dopo la connessione prima di concludere che i dati mancano.
- Controlla `dz_feed_up{venue}` nelle metriche — `0` significa che il multicast è silenzioso sul tuo host.
- Verifica che le regole del firewall consentano UDP multicast sull'interfaccia `doublezero1`.

### `dz_ws_client_lagged_total` elevato

Il tuo consumer legge più lentamente di quanto il bridge pubblica. Aumenta il buffer di broadcast con `WS_BROADCAST_CAPACITY`, riduci il tempo di elaborazione per messaggio, oppure aggiungi un thread di lettura dedicato.

### Il container esce immediatamente

- Il bridge richiede `--network host` e il device `/dev/net/tun`; un semplice `docker run` senza questi flag fallirà.
- Usa la riga singola dell'installer o l'esatto comando `docker run` mostrato in [Self-hosting](#avanzato-self-hosting).

### Il tunnel GRE non si stabilisce

Fai riferimento a [Risoluzione dei problemi](troubleshooting.md) e assicurati che il protocollo IP 47 sia consentito presso il tuo cloud provider. Su AWS, disabilita il controllo source/dest dell'ENI per l'host.