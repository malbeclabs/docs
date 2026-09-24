---
description: "Offerte DoubleZero per Hyperliquid: feed di dati di mercato Edge e peering per nodi non validatori."
---

# Hyperliquid

*Panoramica*

Hyperliquid ha due prodotti su DoubleZero: feed di dati di mercato Edge e peering per nodi non validatori.

| Offerta | Cos'è | A chi è destinata | Guida |
| --- | --- | --- | --- |
| **Feed di Dati di Mercato (Edge)** | Top-of-Book e Market-by-Order come multicast UDP su DoubleZero Edge. | Trader | [Iscriversi a Hyperliquid (Edge)](edge.md) |
| **Peering** | Un feed gossip Hyperliquid deduplicato tramite Block Proxy (nessun dato di mercato). | Nodi non validatori | [Accesso al Peering](peering.md) |

## Feed di Dati di Mercato (Edge)

I publisher ricostruiscono il book degli ordini e inviano messaggi binari a dimensione fissa come multicast UDP su DoubleZero Edge.

I feed principali coprono i perp nativi di Hyperliquid (`hl`) e i perp di [trade.xyz](https://trade.xyz) (`xyz`):

| Feed | Descrizione |
|------|-------------|
| `hyper-hl-tob` | Migliore bid/offer e stampe delle operazioni per i perp Hyperliquid |
| `hyper-hl-mbo` | Book completo ordine per ordine per i perp Hyperliquid (aggiunte, cancellazioni, esecuzioni) |
| `hyper-xyz-tob` | Migliore bid/offer e stampe delle operazioni per i perp trade.xyz |
| `hyper-xyz-mbo` | Book completo ordine per ordine per i perp trade.xyz (aggiunte, cancellazioni, esecuzioni) |

- Top-of-Book e Trade: migliore bid e offer per strumento, più stampe delle operazioni.
- Market-by-Order: ogni ordine a riposo (aggiunta, cancellazione, esecuzione), con snapshot in-band e recupero delta.

Gestiamo più publisher in modo che i trader possano effettuare il failover o scegliere lo stream più veloce.

Come connettersi: [Iscriversi a Hyperliquid (Edge)](edge.md).

## Peering

Il peering è destinato ai nodi non validatori che necessitano del gossip Hyperliquid senza ricevere dati di mercato. Il peering avviene con un livello Block Proxy che unisce due sorgenti gossip upstream (Hyper Foundation e sentry) in un unico feed deduplicato, così che una delle due sorgenti può interrompersi senza bloccare lo stream.

Ogni proxy appare come un singolo peer gossip ordinario per i nostri nodi. La capacità cresce aggiungendo proxy; il carico su quei nodi non aumenta con il numero di peer. L'obiettivo di disponibilità è del 99,9% mensile. Il servizio non include i feed di dati di mercato Edge.

Come connettersi: [Accesso al Peering](peering.md).