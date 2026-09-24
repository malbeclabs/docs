---
description: "Iscriviti ai dati di mercato Hyperliquid su DoubleZero Edge — configurazione, metro, richiesta feed e connessione dopo l'approvazione."
---

# Iscriviti a Hyperliquid (Edge)

!!! warning "Collegandomi a DoubleZero accetto i [Termini d'Uso di DoubleZero](https://doublezero.xyz/terms-protocol). Si prega di notare che i dati sono esclusivamente per uso interno e non possono essere ritrasmessi (vedere la Sezione 2(e))."

I feed Hyperliquid forniscono dati di mercato tramite DoubleZero Edge come multicast UDP. Quattro feed principali coprono i perps nativi di Hyperliquid (`hl`) e i perps di [trade.xyz](https://trade.xyz) (`xyz`):

| Feed | Descrizione |
|------|-------------|
| `hyper-hl-tob` | Miglior bid/offer e stampe di trade per i perps Hyperliquid |
| `hyper-hl-mbo` | Book completo ordine per ordine per i perps Hyperliquid (aggiunte, cancellazioni, esecuzioni) |
| `hyper-xyz-tob` | Miglior bid/offer e stampe di trade per i perps trade.xyz |
| `hyper-xyz-mbo` | Book completo ordine per ordine per i perps trade.xyz (aggiunte, cancellazioni, esecuzioni) |

Panoramica del servizio: [Hyperliquid](/hyperliquid/).

## Quale percorso dovrei seguire?

| Modalità | Cosa ottieni | Quando usarlo |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — decodifica + WebSocket JSON normalizzato | Il più rapido per ottenere uno stream di quotazioni utilizzabile |
| **Multicast nativo** | Iscriviti su `doublezero1`, decodifica tu stesso l'UDP binario (o con i parser di riferimento) | Controllo completo del wire |

Prima i passaggi condivisi: firewall, metro, richiesta e pagamento (Passaggi 1–3). Dopo l'approvazione, il [Passaggio 4](#step-4-connect-after-approval) si divide — **Edge Connect** o **nativo**. Non mescolarli sullo stesso host.

Vuoi che un'IA faccia l'installazione con te? Connetti il [DoubleZero MCP](/mcp/) e chiedigli di guidarti attraverso Hyperliquid Edge.

---

## Passaggio 1: Configurazione DoubleZero

**Configurazione completa**


Segui le istruzioni di [configurazione](/setup/) per installare e configurare il client DoubleZero sull'host.

Se hai già configurato DoubleZero sull'host per uso nativo, assicurati che il client sia aggiornato:

```bash
sudo apt update && sudo apt install doublezero
```

**Configura il Firewall**


Consenti il traffico GRE, BGP, PIM e dei feed Hyperliquid su `doublezero1`. Le porte UDP di Hyperliquid sono nell'intervallo `20000`–`20999` (Top-of-Book e Market-by-Order market, reference e snapshot). Consenti anche UDP `5765` per gli heartbeat di DoubleZero sul tunnel. Apri la banda dei feed in modo che nuovi feed non richiedano un'ulteriore modifica al firewall. Vedi [Indirizzi dei feed](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid market / reference / snapshot (tutti i feed)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 20000:20999 -j ACCEPT
# Heartbeat DoubleZero
sudo iptables -A INPUT -i doublezero1 -p udp --dport 5765 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Hyperliquid market / reference / snapshot (tutti i feed)
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# Heartbeat DoubleZero
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

Puoi restringere queste regole alle sole porte dei feed a cui sei iscritto (vedi [Indirizzi dei feed](#feed-addresses)).

---

## Passaggio 2: Scegli un metro

Identifica la località con la latenza più bassa rispetto alla macchina che riceverà il feed:

```bash
doublezero latency
```

Annota il metro / la città dal risultato con la latenza più bassa. Selezionerai quella città nel modulo di richiesta. Consulta la [mappa della topologia](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) per vedere come sono raggruppati i metro.

**Prezzi**


I feed sono tariffati per regione di consegna. Il prezzo segue dove vengono consegnati i dati, non dove si trova l'acquirente. Un pacchetto Tokyo consegna ai ricevitori di Tokyo; la consegna altrove richiede il pacchetto Global. Sono inclusi due host riceventi (IP) per feed, per metro.

| Feed | Tokyo /mese | Global /mese |
| --- | --- | --- |
| Hyperliquid perps Top-of-Book (L1) | $900 | $1.500 |
| Hyperliquid perps Market-by-Order (L4) | $3.000 | $5.000 |
| trade.xyz perps Top-of-Book (L1) | $900 | $1.500 |
| trade.xyz perps Market-by-Order (L4) | $3.000 | $5.000 |
| **Tutti i feed (bundle ~30% di sconto)** | **$5.500** | **$9.000** |

---

## Passaggio 3: Invia la richiesta

1. Vai su [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Seleziona **Hyperliquid** e i feed di cui hai bisogno.
3. Seleziona la **città** (metro) di cui hai bisogno. Usa la tabella sopra e `doublezero latency` per scegliere.
4. Completa il modulo di richiesta.

Assegnerai un DoubleZero ID (chiave esistente o generane una nuova) a ciascuna richiesta di feed nella pagina [accounts](https://doublezero.xyz/shreds/account). La **chiave privata corrispondente deve essere presente sulla macchina che riceverà il feed** — non assegnare una pubkey la cui chiave privata non puoi spostare su quell'host.

Scegli un **metro** e una **pubkey**. **Non** vincoli un IP pubblico al momento della richiesta. Durante la sottoscrizione puoi spostare l'accesso tra IP **all'interno dei metro scelti**.

Sarai contattato con ulteriori istruzioni in tempi brevi (prevedi **1-3 giorni lavorativi**).

---

## Passaggio 4: Connessione dopo l'approvazione

Dopo aver inviato la richiesta, riceverai una fattura; una volta pagata, connettiti su ciascuna macchina approvata. L'accesso viene abilitato nella data di inizio scelta. Scegli **un** percorso qui sotto.

### 4a. Edge Connect

Se un `doublezerod` dell'host è già in esecuzione (dalla [configurazione](/setup/)), fermalo prima — entra in conflitto con il daemon del container per lo stesso tunnel:

```bash
sudo systemctl stop doublezerod
```

Installa [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) **dopo** l'approvazione e il pagamento. Il bridge si unisce a DoubleZero all'interno di un container `--network host` e serve JSON normalizzato su `ws://<host>:8081`.

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**Tutti i comandi `doublezero` passano attraverso il container**, non la CLI dell'host:

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    Puoi creare un alias per comandi rapidi verso il container. Questo esempio abilita `dz status` a funzionare come `doublezero status` all'interno del container:

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

Aspettati `BGP Session Up` e i tuoi gruppi `edge-hyper-…` sottoscritti.

Poi apri il WebSocket (`ws://127.0.0.1:8081`). Contratto: [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md). Guida completa: runbook [MCP](/mcp/) `hyperliquid-edge`.

### 4b. Multicast nativo

Sull'host che possiede la chiave privata assegnata (con `doublezerod` dell'host in esecuzione), iscriviti ai feed acquistati:

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

Feed multipli, separati da spazio:

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

Controlla il tunnel:

```bash
doublezero status
```

Aspettati `BGP Session Up` sulla rete DoubleZero corretta. Poi decodifica il wire tu stesso — vedi [Decodifica del feed](#decode-the-feed).

---

## Fatturazione

I posti sono addebitati **mensilmente**. Tieni d'occhio la data di scadenza del posto.

Devi pagare la fattura prima della scadenza del posto. **Il mancato pagamento comporta la rimozione del posto.**

---

## Indirizzi dei feed

L'IP seleziona il gruppo multicast. La porta seleziona lo stream su quel gruppo. Verifica i valori IP attivi con:

```bash
doublezero multicast group list
```

| Feed | Descrizione | Gruppo multicast | Market | Reference | Snapshot | Spec |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Miglior bid/offer e stampe di trade per i perps Hyperliquid | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Book completo ordine per ordine per i perps Hyperliquid | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | Miglior bid/offer e stampe di trade per i perps trade.xyz | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | Book completo ordine per ordine per i perps trade.xyz | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

Ogni feed ha il proprio indirizzo di gruppo multicast. Porte: reference = market + `1`; snapshot (solo MBO) = market + `2`. Consigliamo di associare market e reference insieme; per MBO, associare anche snapshot.

Potresti anche vedere piccoli pacchetti UDP sulla porta `5765` su `doublezero1` — heartbeat di DoubleZero, non dati di mercato.

I frame sono binari a dimensione fissa little-endian. I perps nativi di Hyperliquid usano `source_id=1`; i perps di trade.xyz usano `source_id=7`.

---

## Decodifica del feed

!!! note "Edge Connect"
    Se stai usando `doublezero-edge-connect`, il feed è già decodificato come JSON via WebSocket — salta la decodifica manuale.

**Usa un parser di riferimento**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) include subscriber multicast che decodificano il formato wire e lo ripubblicano come JSON su un socket Unix:

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) per Top-of-Book & Trades
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) per Market-by-Order

Consulta il [README principale](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines) per la pipeline completa.

**Scrivi il tuo decoder**

Decodifica seguendo [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Inizia dall'header del frame, poi dai layout dei messaggi per il feed che stai ricevendo.

**Header del tunnel GRE — XDP**

Il traffico di dati di mercato consegnato sulla rete è incapsulato in GRE nell'ultimo miglio. Su `doublezero1`, il client presenta multicast UDP semplice. Se termini il GRE tu stesso (es. una pipeline XDP), rimuovi l'header GRE prima di passare i dati al tuo decoder. Vedi [`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap).

---

## Risoluzione dei problemi

Se riscontri un problema non coperto qui, contattaci tramite il tuo canale esistente prima di cercare soluzioni alternative. Se non hai un canale, vedi [Supporto](/support/).

**Assicurati che il tuo client sia aggiornato**


```bash
sudo apt update && sudo apt install doublezero
```

**Il tunnel non si attiva**


1. **Edge Connect:** esegui lo status nel container — `docker exec doublezero-edge-connect doublezero status`. Lo `doublezero status` dell'host spesso fallisce mentre il feed funziona correttamente (il container gestisce il daemon). Conferma che il `doublezerod` dell'host sia fermato.
2. **Nativo:** verifica che il daemon dell'host sia in esecuzione: `sudo systemctl status doublezerod`
3. Verifica che le regole del firewall siano in atto (GRE, BGP, PIM, porte UDP di Hyperliquid e `5765` su `doublezero1`)
4. Conferma che la fattura per questo posto sia pagata e che la data di inizio sia passata
5. Esegui connect sul percorso che hai scelto ([4a](#4a-edge-connect) o [4b](#4b-native-multicast)) con la chiave che corrisponde alla pagina accounts
6. Aspettati `BGP Session Up` dallo stesso posto in cui hai eseguito connect (container o host)

**Nessun pacchetto dopo l'iscrizione**


1. Conferma di essere iscritto: `doublezero user list`
2. Conferma che il feed appaia sotto i tuoi gruppi: `doublezero multicast group list`
3. Cattura sul tunnel, es. Hyperliquid TOB: `sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. Preferisci associare market e reference insieme (e snapshot per MBO) per il feed desiderato

**Feed acquistato mancante (Edge Connect)**

Se un feed acquistato manca da `doublezero status`, iscriviti all'interno del container:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-code>
```

Feed multipli, separati da spazio:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

**Posto scaduto o rimosso**


I posti sono mensili. Se la fattura non viene pagata prima della scadenza, il posto viene rimosso e il tunnel non rimarrà attivo.

**"Multicast user already exists"**


Hai già una sottoscrizione attiva attraverso un percorso diverso. Disconnettiti prima, poi riprova la connessione:

- **Edge Connect:** `docker exec doublezero-edge-connect doublezero disconnect`
- **Nativo:** `doublezero disconnect`

Poi riprova `doublezero connect multicast --subscribe-feed <feed-code>` sullo stesso percorso (container o host).

**Specifico per AWS**


Disabilita il controllo sorgente/destinazione sull'ENI dell'istanza. Senza questo, il multicast incapsulato in GRE potrebbe essere scartato.