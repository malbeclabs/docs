---
description: "Offerte DoubleZero per Hyperliquid: feed di dati di mercato Edge e peering per nodi non validatori."
---

# Hyperliquid

*Panoramica*

Hyperliquid offre due prodotti su DoubleZero: feed di dati di mercato Edge e peering per nodi non validatori.

| Offerta | Cos'è | A chi è destinata | Guida |
| --- | --- | --- | --- |
| **Feed di Dati di Mercato (Edge)** | Top-of-Book e Market-by-Order come multicast UDP su DoubleZero Edge. | Trader | [Iscriviti a Hyperliquid (Edge)](/hyperliquid/edge/) |
| **Peering** | Un feed gossip Hyperliquid deduplicato tramite Block Proxy (senza dati di mercato). | Nodi non validatori | [Accesso al Peering](/hyperliquid/peering/) |

## Feed di Dati di Mercato (Edge)

I publisher ricostruiscono il book degli ordini e inviano messaggi binari a dimensione fissa come multicast UDP su DoubleZero Edge.

I feed principali coprono i perp nativi di Hyperliquid (`hl`) e i perp di [trade.xyz](https://trade.xyz) (`xyz`):

| Feed | Descrizione |
|------|-------------|
| `hyper-hl-tob` | Migliore bid/offer e stampe delle operazioni per i perp Hyperliquid |
| `hyper-hl-mbo` | Book completo ordine per ordine per i perp Hyperliquid (aggiunte, cancellazioni, esecuzioni) |
| `hyper-xyz-tob` | Migliore bid/offer e stampe delle operazioni per i perp trade.xyz |
| `hyper-xyz-mbo` | Book completo ordine per ordine per i perp trade.xyz (aggiunte, cancellazioni, esecuzioni) |

- Top-of-Book e Trades: migliore bid e offer per strumento, più stampe delle operazioni.
- Market-by-Order: ogni ordine a riposo (aggiunta, cancellazione, esecuzione), con snapshot in-band e recupero delta.

Utilizziamo più publisher in modo che i trader possano effettuare failover o scegliere lo stream più veloce.

Come connettersi: [Iscriviti a Hyperliquid (Edge)](/hyperliquid/edge/).

## Peering

Il peering è destinato ai nodi non validatori che necessitano del gossip Hyperliquid senza ricevere dati di mercato. Si effettua il peering con un livello Block Proxy che unisce due sorgenti gossip a monte (Hyper Foundation e sentry) in un unico feed deduplicato, in modo che una delle due sorgenti possa cadere senza interrompere lo stream.

Ogni proxy appare come un singolo peer gossip ordinario per i nostri nodi. La capacità cresce aggiungendo proxy; il carico su quei nodi non aumenta con il numero di peer. L'obiettivo di disponibilità è del 99,9% mensile. Il servizio non include i feed di dati di mercato Edge.

Come connettersi: [Accesso al Peering](/hyperliquid/peering/).