---
description: "Peering Hyperliquid: gossip arbitrato tramite Block Proxy per nodi non validatori."
---

# Accesso al Peering

Il peering offre ai nodi non validatori un feed gossip Hyperliquid deduplicato e a bassa latenza attraverso un Block Proxy, incluso il mempool. Non include i feed di dati di mercato Edge. Per quelli, consulta [Iscriviti a Hyperliquid (Edge)](/hyperliquid/edge/). Panoramica: [Hyperliquid](/hyperliquid/).

| | |
|--|--|
| A chi è destinato | Nodi non validatori da te gestiti |
| Cosa ottieni | Un feed gossip arbitrato tramite Block Proxy (blocchi + mempool) |
| Host riceventi | 1 IP incluso |
| Prezzo | $999/mese (nessun dato di mercato Edge) |
| Obiettivo di disponibilità | 99,9% mensile |

## Richiedere il peering

Ulteriori informazioni sul peering sono disponibili tramite [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Includi l'IP pubblico statico del tuo nodo (e la regione). I dettagli del peer sono attesi entro **1–3 giorni lavorativi** dopo che avremo i dettagli del tuo nodo e il pagamento sarà completato.

## Perché il peering è a pagamento

I root peer pubblici di Hyperliquid sono condivisi: gli slot sono contesi, i peer ruotano o applicano rate-limit, e molti non inoltrano il mempool. Uno slot di peering riservato ti offre un upstream stabile su DoubleZero invece di competere per quella capacità pubblica.

## Come funziona

- Due sorgenti gossip: un feed A dal nodo non validatore di Hyper Foundation e un feed B da un sentry.
- I clienti si connettono in peering con un livello Block Proxy che scala orizzontalmente. Ogni proxy si connette in peering con entrambi i nostri nodi non validatori e appare come un normale peer gossip per ciascuno di essi.
- Il proxy arbitra A e B in un unico feed gossip deduplicato per i suoi peer, così che una delle due sorgenti può cadere senza interrompere il flusso.
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

Il nodo Hyper Foundation si connette in peering con il nostro nodo primario; un sentry alimenta il nostro secondario. Ogni Block Proxy si connette in peering con entrambi, unisce i loro feed per i propri clienti e preleva snapshot di bootstrap dal servizio snapshot quando necessario.

## Uptime

Obiettivo: 99,9% di disponibilità mensile.

- Feed ridondante. Ogni proxy si connette in peering con entrambi i nostri nodi non validatori. Quei nodi ricevono blocchi da sorgenti indipendenti (Foundation e sentry). Se una sessione o una sorgente cade, l'altra mantiene il flusso dei blocchi mentre il percorso fallito si ripristina.
- I nostri nodi restano dietro il livello proxy. I peer esterni raggiungono solo i Block Proxy. Se un proxy fallisce, i suoi peer si riconnettono a un altro proxy funzionante. Il carico non ricade mai sui nostri nodi.
- I proxy mantengono solo cache temporanee (snapshot, finestra di blocchi scorrevole, buffer live), non lo stato autoritativo della chain. Un proxy difettoso viene sostituito automaticamente. Un sostituto entra in servizio solo dopo che le sessioni upstream e le cache superano i controlli di prontezza. I nostri nodi non validatori non vengono riavviati per questo.

## Autoscaling

- Scala aggiungendo un proxy. Ogni proxy serve molti peer ma conta come un singolo peer su ciascuno dei nostri nodi non validatori.
- Il carico sui nodi è proporzionale al numero di proxy, non al numero di peer.
- Un nuovo proxy diventa operativo una volta che le cache sono cariche e i controlli di prontezza sono superati. Non necessita di una risincronizzazione completa della chain.
- Un peer che si unisce preleva il suo snapshot di bootstrap dal servizio snapshot e i blocchi di recupero dallo store del proxy stesso, mai dai nostri nodi non validatori. Un'ondata di nuovi peer colpisce il livello proxy.

## Prezzi

$999/mese per il peering. Include il mempool. Non include i feed di dati di mercato Edge. Un host ricevente (IP) è incluso. Il peering non è in bundle né scontato con i dati di mercato Edge.