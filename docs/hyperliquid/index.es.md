---
description: "Ofertas de DoubleZero para Hyperliquid: feeds de datos de mercado Edge y peering para nodos no validadores."
---

# Hyperliquid

*Descripción general*

Hyperliquid tiene dos productos en DoubleZero: feeds de datos de mercado Edge y peering para nodos no validadores.

| Oferta | Qué es | Para quién es | Guía |
| --- | --- | --- | --- |
| **Market Data Feeds (Edge)** | Top-of-Book y Market-by-Order como UDP multicast en DoubleZero Edge. | Traders | [Suscribirse a Hyperliquid (Edge)](/hyperliquid/edge/) |
| **Peering** | Un feed de gossip de Hyperliquid deduplicado a través de Block Proxy (sin datos de mercado). | Nodos no validadores | [Acceso de Peering](/hyperliquid/peering/) |

## Market Data Feeds (Edge)

Los publishers reconstruyen el libro de órdenes y envían mensajes binarios de tamaño fijo como UDP multicast a través de DoubleZero Edge.

Los feeds principales cubren los perps nativos de Hyperliquid (`hl`) y los perps de [trade.xyz](https://trade.xyz) (`xyz`):

| Feed | Descripción |
|------|-------------|
| `hyper-hl-tob` | Mejor oferta de compra/venta e impresiones de operaciones para perps de Hyperliquid |
| `hyper-hl-mbo` | Libro completo orden por orden para perps de Hyperliquid (adiciones, cancelaciones, ejecuciones) |
| `hyper-xyz-tob` | Mejor oferta de compra/venta e impresiones de operaciones para perps de trade.xyz |
| `hyper-xyz-mbo` | Libro completo orden por orden para perps de trade.xyz (adiciones, cancelaciones, ejecuciones) |

- Top-of-Book y Trades: mejor oferta de compra y venta por instrumento, más impresiones de operaciones.
- Market-by-Order: cada orden en reposo (adición, cancelación, ejecución), con snapshot en banda y recuperación de deltas.

Ejecutamos múltiples publishers para que los traders puedan hacer failover o elegir el stream más rápido.

Cómo conectarse: [Suscribirse a Hyperliquid (Edge)](/hyperliquid/edge/).

## Peering

El peering es para nodos no validadores que necesitan gossip de Hyperliquid sin recibir datos de mercado. Se conecta con un nivel de Block Proxy que fusiona dos fuentes de gossip upstream (Hyper Foundation y sentry) en un único feed deduplicado, de modo que cualquiera de las fuentes puede caer sin detener el stream.

Cada proxy se presenta como un único peer de gossip ordinario para nuestros nodos. La capacidad crece añadiendo proxies; la carga en esos nodos no aumenta con el número de peers. El objetivo de disponibilidad es del 99,9% mensual. El servicio no incluye feeds de datos de mercado Edge.

Cómo conectarse: [Acceso de Peering](/hyperliquid/peering/).