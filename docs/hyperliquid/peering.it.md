---
description: "Peering Hyperliquid: gossip arbitrato tramite Block Proxy per nodi non validatori."
---

# Accesso al Peering

Il peering offre ai nodi non validatori un feed gossip Hyperliquid deduplicato e a bassa latenza attraverso un Block Proxy, incluso il mempool. Non include i feed di dati di mercato Edge. Per quelli, consulta [Iscriviti a Hyperliquid (Edge)](edge.md). Panoramica: [Hyperliquid](index.md).

| | |
|--|--|
| A chi è destinato | Nodi non validatori che gestisci |
| Cosa ottieni | Un feed gossip arbitrato tramite Block Proxy (blocchi + mempool) |
| Host riceventi | 1 IP incluso |
| Prezzo | $999/mese (senza dati di mercato Edge) |
| Obiettivo di disponibilità | 99,9% mensile |

## Richiedere il peering

Maggiori informazioni sul peering sono disponibili tramite [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Includi l'IP pubblico statico del tuo nodo (e la regione). I dettagli del peer vengono forniti entro **1–3 giorni lavorativi** dopo aver ricevuto i dettagli del tuo nodo e completato il pagamento.

## Collegare il tuo nodo

Una volta approvato, ti invieremo il tuo **peer IP**. Punta il tuo nodo non validatore verso di esso, apri il firewall verso di esso e riavvia il nodo.

### 1. Configurare il gossip

Sostituisci `~/override_gossip_config.json` con quanto segue, usando il tuo peer IP:

```json
{
  "root_node_ips": [{"Ip": "<PEER_IP>"}],
  "try_new_peers": false,
  "split_client_blocks": true,
  "chain": "Mainnet"
}
```

| Impostazione | Motivo |
|--|--|
| `root_node_ips` | Il tuo peer DoubleZero è l'unico upstream. |
| `try_new_peers: false` | Mantiene il nodo sul peer DoubleZero. Non passerà ai peer pubblici. |
| `split_client_blocks: true` | Trasmette in streaming le transazioni del mempool in `~/hl/data/mempool_txs/`. |

### 2. Aprire il firewall verso il peer

Consenti **TCP e UDP in entrata sulle porte 4001–4002 da `<PEER_IP>`**. Esegui questa operazione nel security group del tuo cloud e nel firewall dell'host.

Quando il tuo nodo si connette, il peer si ricollega al tuo nodo sulle porte 4001 e 4002 per verificare che sia raggiungibile. Se quel controllo è bloccato, la connessione si apre ma non arrivano dati. Consenti anche le connessioni in uscita verso il peer sulle porte 4001–4002.

### 3. Riavviare il nodo

```bash
sudo systemctl restart hl-node   # or however you run hl-visor
```

Il nodo legge questo file all'avvio. Le modifiche apportate durante l'esecuzione potrebbero non avere pieno effetto, quindi riavvia dopo ogni modifica. Il recupero richiede solitamente 5–15 minuti.

### 4. Verificare che funzioni

```bash
ss -tn state established '( dport = :4001 )'     # one connection, to <PEER_IP>
journalctl -u hl-node -f | grep 'applied block'  # blocks are being applied
ls -l ~/hl/data/mempool_txs/                     # mempool files are growing
```

!!! warning "Connesso ma nessun dato"
    Il peer non riesce a raggiungere il tuo nodo sulle porte 4001–4002. Controlla le regole in entrata dal passaggio 2.

!!! note "Nessun fallback ai peer pubblici"
    Con `try_new_peers: false`, il tuo nodo attende il peer DoubleZero se non è raggiungibile. Non passa ai peer pubblici. Contattaci se vedi ripetuti messaggi `Peer full` o timeout di connessione.

## Perché il peering a pagamento

I root peer pubblici di Hyperliquid sono condivisi: gli slot sono contesi, i peer ruotano o applicano limiti di frequenza, e molti non inoltrano il mempool. Uno slot di peering riservato ti offre un upstream stabile su DoubleZero invece di competere per quella capacità pubblica.

## Come funziona

- Due sorgenti gossip: un feed A dal nodo non validatore della Hyper Foundation e un feed B da un sentry.
- I clienti si connettono a un livello di Block Proxy che scala orizzontalmente. Ogni proxy si connette a entrambi i nostri nodi non validatori e appare come un singolo peer gossip ordinario per ciascuno di essi.
- Il proxy arbitra A e B in un unico feed gossip deduplicato per i suoi peer, così una delle due sorgenti può cadere senza interrompere il flusso.
- Aggiungi proxy per aggiungere capacità. Il carico sui nostri nodi non validatori non cresce con il numero di peer.

<pre class="ascii-diagram"><code>  ┌─────────────────────┐                    ┌─────────────────────┐
  │     Foundation      │                    │       Sentry        │
  │ Non-Validating Node │                    │                     │
  └──────────┬──────────┘                    └──────────┬──────────┘
             │                                          │
┈┈┈┈┈┈┈┈┈┈┈┈┈│┈┈┈┈┈┈┈┈┈┈ DOUBLEZERO INFRA ┈┈┈┈┈┈┈┈┈┈┈┈┈┈│┈┈┈┈┈┈┈┈┈┈┈┈
             ▼                                          ▼
  ┌─────────────────────┐                    ┌─────────────────────┐
  │       Primary       │                    │      Secondary      │
  │ Non-Validating Node │                    │ Non-Validating Node │
  └──────────┬──────────┘                    └──────────┬──────────┘
             │                                          │
             │   A feed                        B feed   │
             └──────────────┐              ┌────────────┘
                            ▼              ▼
                    ┌────────────────────────┐         ┌──────────────────┐
                    │      Block Proxy       │◀╌╌╌╌╌╌╌╌│ Snapshot Service │
                    │  (arbitrates A and B)  │         │   (on demand)    │
                    └───────────┬────────────┘         └──────────────────┘
                                │
                                │  one deduplicated gossip feed
                                ▼
                          ┌───────────┐
                          │   Peers   │
                          └───────────┘</code></pre>

Il nodo della Hyper Foundation si connette al nostro primario; un sentry alimenta il nostro secondario. Ogni Block Proxy si connette a entrambi, unisce i loro feed per i propri clienti e recupera snapshot di bootstrap dal servizio di snapshot quando necessario.

## Uptime

Obiettivo: 99,9% di disponibilità mensile.

- Feed ridondante. Ogni proxy si connette a entrambi i nostri nodi non validatori. Quei nodi ricevono blocchi da sorgenti indipendenti (Foundation e sentry). Se una sessione o sorgente cade, l'altra mantiene il flusso di blocchi mentre il percorso fallito si ripristina.
- I nostri nodi restano dietro il livello proxy. I peer esterni raggiungono solo i Block Proxy. Se un proxy fallisce, i suoi peer si riconnettono a un altro proxy funzionante. Il carico non ricade mai sui nostri nodi.
- I proxy mantengono solo cache usa e getta (snapshot, finestra di blocchi scorrevole, buffer live), non lo stato autoritativo della chain. Un proxy difettoso viene sostituito automaticamente. Un sostituto entra in servizio solo dopo che le sessioni upstream e le cache superano i controlli di readiness. I nostri nodi non validatori non vengono riavviati per questo.

## Autoscaling

- Scala aggiungendo un proxy. Ogni proxy serve molti peer ma conta come un singolo peer su ciascuno dei nostri nodi non validatori.
- Il carico sui nodi dipende dal numero di proxy, non dal numero di peer.
- Un nuovo proxy diventa operativo una volta che le cache sono pronte e i controlli di readiness vengono superati. Non necessita di una risincronizzazione completa della chain.
- Un peer che si unisce prende il proprio snapshot di bootstrap dal servizio di snapshot e i blocchi di recupero dallo store del proxy, mai dai nostri nodi non validatori. Un'ondata di nuovi peer colpisce il livello proxy.

## Prezzi

$999/mese per il peering. Include il mempool. Non include i feed di dati di mercato Edge. È incluso un host ricevente (IP). Il peering non è incluso in bundle né scontato con i dati di mercato Edge.