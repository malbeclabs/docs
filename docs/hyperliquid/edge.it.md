---
description: "Iscriviti ai dati di mercato Hyperliquid su DoubleZero Edge — configurazione, metro, richiesta feed e connessione dopo l'approvazione."
---

# Iscriviti a Hyperliquid (Edge)

!!! warning "Collegandomi a DoubleZero accetto i [Termini di Utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol). Si prega di notare che i dati sono esclusivamente per uso interno e non possono essere ritrasmessi (vedi Sezione 2(e))."

I feed Hyperliquid forniscono dati di mercato tramite DoubleZero Edge come multicast UDP. Quattro feed principali coprono i perps nativi di Hyperliquid (`hl`) e i perps di [trade.xyz](https://trade.xyz) (`xyz`):

| Feed | Descrizione |
|------|-------------|
| `hyper-hl-tob` | Miglior bid/offer e stampe dei trade per i perps Hyperliquid |
| `hyper-hl-mbo` | Book completo ordine per ordine per i perps Hyperliquid (aggiunte, cancellazioni, esecuzioni) |
| `hyper-xyz-tob` | Miglior bid/offer e stampe dei trade per i perps trade.xyz |
| `hyper-xyz-mbo` | Book completo ordine per ordine per i perps trade.xyz (aggiunte, cancellazioni, esecuzioni) |

Panoramica del servizio: [Hyperliquid](index.md).

## Quale percorso devo seguire?

| Modalità | Cosa ottieni | Quando utilizzare |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — decodifica + WebSocket JSON normalizzato | Il più veloce per ottenere uno stream di quotazioni utilizzabile |
| **Multicast nativo** | Iscriviti su `doublezero1`, decodifica il binario UDP autonomamente (o con parser di riferimento) | Controllo totale sul filo |

Prima i passaggi comuni: firewall, metro, candidatura e pagamento (Passaggi 1–3). Dopo l'approvazione, il [Passaggio 4](#step-4-connect-after-approval) si divide — **Edge Connect** o **nativo**. Non mescolarli sullo stesso host.

Vuoi che un'IA faccia l'installazione con te? Collega il [DoubleZero MCP](../mcp.md) e chiedigli di guidarti attraverso Hyperliquid Edge.

---

## Passaggio 1: Configurazione DoubleZero

**Completare la Configurazione**


Segui le istruzioni di [configurazione](../setup.md) per installare e configurare il client DoubleZero sull'host.

Se hai precedentemente configurato DoubleZero sull'host per uso nativo, assicurati che il client sia aggiornato:

```bash
sudo apt update && sudo apt install doublezero
```

**Configurare il Firewall**


Consenti il traffico GRE, BGP, PIM e dei feed Hyperliquid su `doublezero1`. Le porte UDP di Hyperliquid si trovano nell'intervallo `20000`–`20999` (Top-of-Book e Market-by-Order mercato, riferimento e snapshot). Consenti anche la porta UDP `5765` per gli heartbeat di DoubleZero sul tunnel. Apri l'intera banda dei feed in modo che nuovi feed non richiedano un'ulteriore modifica del firewall. Vedi [Indirizzi dei feed](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid mercato / riferimento / snapshot (tutti i feed)
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
# Hyperliquid mercato / riferimento / snapshot (tutti i feed)
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# Heartbeat DoubleZero
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

Puoi restringere queste regole alle sole porte dei feed a cui ti iscrivi (vedi [Indirizzi dei feed](#feed-addresses)).

---

## Passaggio 2: Scegliere un metro

Identifica la posizione con la latenza più bassa dalla macchina che riceverà il feed:

```bash
doublezero latency
```

Annota il metro / città dal risultato con la latenza più bassa. Selezionerai quella città nel modulo di candidatura. Consulta la [mappa della topologia](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) per vedere come sono raggruppati i metro.

**Prezzi**


I feed sono tariffati per regione di consegna. Il prezzo dipende da dove i dati vengono consegnati, non da dove si trova l'acquirente. Un pacchetto Tokyo consegna ai ricevitori di Tokyo; la consegna altrove richiede il pacchetto Global. Per ogni feed e per metro sono inclusi due host riceventi (IP).

| Feed | Tokyo /mese | Global /mese |
| --- | --- | --- |
| Hyperliquid perps Top-of-Book (L1) | $900 | $1.500 |
| Hyperliquid perps Market-by-Order (L4) | $3.000 | $5.000 |
| trade.xyz perps Top-of-Book (L1) | $900 | $1.500 |
| trade.xyz perps Market-by-Order (L4) | $3.000 | $5.000 |
| **Tutti i feed (bundle ~30% di sconto)** | **$5.500** | **$9.000** |

---

## Passaggio 3: Inviare la Richiesta

1. Vai su [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Seleziona **Hyperliquid** e i feed di cui hai bisogno.
3. Seleziona la **città** (metro) di cui hai bisogno. Usa la tabella sopra e `doublezero latency` per scegliere.
4. Completa il modulo di candidatura.

Assegnerai un DoubleZero ID (chiave esistente, oppure generane una nuova) a ogni richiesta di feed nella pagina [accounts](https://doublezero.xyz/shreds/account). La **chiave privata corrispondente deve essere presente sulla macchina che riceverà il feed** — non assegnare una pubkey la cui chiave privata non puoi trasferire su quell'host.

Scegli un **metro** e una **pubkey**. **Non** vincoli un IP pubblico al momento della candidatura. Durante la sottoscrizione puoi spostare l'accesso tra IP **all'interno dei metro scelti**.

Sarai contattato con ulteriori istruzioni in tempi brevi (prevedi **1-3 giorni lavorativi**).

---

## Passaggio 4: Connettersi dopo l'approvazione {#step-4-connect-after-approval}

Dopo aver inviato la candidatura, riceverai una fattura; una volta pagata, connettiti su ogni macchina approvata. L'accesso viene abilitato alla data di inizio scelta. Scegli **un** percorso qui sotto.

### 4a. Edge Connect {#4a-edge-connect}

Se un `doublezerod` dell'host è già in esecuzione (dalla [configurazione](../setup.md)), fermalo prima — entra in conflitto con il daemon del container per lo stesso tunnel:

```bash
sudo systemctl stop doublezerod
```

Installa [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) **dopo** l'approvazione e il pagamento. Il bridge si collega a DoubleZero all'interno di un container `--network host` e serve JSON normalizzato su `ws://<host>:8081`.

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**Tutti i comandi `doublezero` passano attraverso il container**, non la CLI dell'host:

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    Puoi creare un alias per comandi rapidi al container. Questo esempio abilita `dz status` a funzionare come `doublezero status` all'interno del container:

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

Aspettati `BGP Session Up` e i tuoi gruppi `edge-hyper-…` sottoscritti.

Poi apri il WebSocket (`ws://127.0.0.1:8081`). Contratto: [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md). Guida completa: [MCP](../mcp.md) runbook `hyperliquid-edge`.

### 4b. Multicast nativo {#4b-native-multicast}

Sull'host che possiede la chiave privata assegnata (con il `doublezerod` dell'host in esecuzione), iscriviti ai feed acquistati:

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

Feed multipli, separati da spazio:

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

Verifica il tunnel:

```bash
doublezero status
```

Aspettati `BGP Session Up` sulla rete DoubleZero corretta. Poi decodifica il filo autonomamente — vedi [Decodificare il feed](#decode-the-feed).

---

## Fatturazione

I posti vengono addebitati **mensilmente**. Tieni d'occhio la data di scadenza del posto.

Devi pagare la fattura prima della scadenza del posto. **Il mancato pagamento comporta la rimozione del posto.**

---

## Indirizzi dei feed {#feed-addresses}

L'IP seleziona il gruppo multicast. La porta seleziona lo stream su quel gruppo. Verifica i valori IP live con:

```bash
doublezero multicast group list
```

| Feed | Descrizione | Gruppo multicast | Mercato | Riferimento | Snapshot | Specifica |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Miglior bid/offer e stampe dei trade per i perps Hyperliquid | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Book completo ordine per ordine per i perps Hyperliquid | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | Miglior bid/offer e stampe dei trade per i perps trade.xyz | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | Book completo ordine per ordine per i perps trade.xyz | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

Ogni feed ha il proprio indirizzo di gruppo multicast. Porte: riferimento = mercato + `1`; snapshot (solo MBO) = mercato + `2`. Si consiglia di associare mercato e riferimento insieme; per MBO, associare anche lo snapshot.

Potresti anche vedere piccoli pacchetti UDP sulla porta `5765` su `doublezero1` — heartbeat di DoubleZero, non dati di mercato.

I frame sono binari a dimensione fissa little-endian. I perps nativi Hyperliquid usano `source_id=1`; i perps trade.xyz usano `source_id=7`.

---

## Decodificare il feed {#decode-the-feed}

!!! note "Edge Connect"
    Se stai usando `doublezero-edge-connect`, il feed è già decodificato come JSON tramite WebSocket — salta la decodifica manuale.

**Utilizzare un parser di riferimento**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) include subscriber multicast che decodificano il formato wire e lo ripubblicano come JSON su un socket Unix:

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) per Top-of-Book & Trades
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) per Market-by-Order

Vedi il [README principale](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines) per la pipeline completa.

**Scrivere il proprio decoder**

Decodifica seguendo [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Inizia con l'header del frame, poi i layout dei messaggi per il feed che stai ricevendo.

**Header del Tunnel GRE — XDP**

Il traffico di dati di mercato consegnato sulla rete è incapsulato in GRE nell'ultimo miglio. Su `doublezero1`, il client presenta multicast UDP puro. Se termini il GRE autonomamente (es. una pipeline XDP), rimuovi l'header GRE prima di passare i dati al tuo decoder. Vedi [`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap).

---

## Risoluzione dei problemi

Se riscontri un problema non trattato qui, contattaci tramite il tuo canale esistente prima di cercare soluzioni alternative. Se non hai un canale, vedi [Supporto](../support.md).

**Assicurati che il client sia aggiornato**


```bash
sudo apt update && sudo apt install doublezero
```

**Il tunnel non si attiva**


1. **Edge Connect:** esegui status nel container — `docker exec doublezero-edge-connect doublezero status`. Il `doublezero status` dell'host spesso fallisce mentre il feed funziona correttamente (il container possiede il daemon). Conferma che il `doublezerod` dell'host sia fermato.
2. **Nativo:** verifica che il daemon dell'host sia in esecuzione: `sudo systemctl status doublezerod`
3. Verifica che le regole del firewall siano configurate (GRE, BGP, PIM, porte UDP Hyperliquid e `5765` su `doublezero1`)
4. Conferma che la fattura per questo posto sia pagata e che la data di inizio sia passata
5. Esegui connect sul percorso scelto ([4a](#4a-edge-connect) o [4b](#4b-native-multicast)) con la chiave corrispondente alla pagina accounts
6. Aspettati `BGP Session Up` dallo stesso punto in cui hai eseguito connect (container o host)

**Nessun pacchetto dopo la sottoscrizione**


1. Conferma di essere iscritto: `doublezero user list`
2. Conferma che il feed appaia nei tuoi gruppi: `doublezero multicast group list`
3. Cattura sul tunnel, es. Hyperliquid TOB: `sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. Preferisci associare mercato e riferimento insieme (e snapshot per MBO) per il feed desiderato

**Feed acquistato mancante (Edge Connect)**

Se un feed acquistato non appare in `doublezero status`, iscriviti all'interno del container:

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


Disabilita il controllo source/destination sull'ENI dell'istanza. Senza questo, il multicast incapsulato in GRE potrebbe essere scartato.