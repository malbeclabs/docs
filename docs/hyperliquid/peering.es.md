---
description: "Peering de Hyperliquid: gossip arbitrado a través de Block Proxy para nodos no validadores."
---

# Acceso de Peering

El peering proporciona a los nodos no validadores un feed de gossip de Hyperliquid de baja latencia y deduplicado a través de un Block Proxy, incluyendo mempool. No incluye feeds de datos de mercado de Edge. Para esos, consulte [Suscribirse a Hyperliquid (Edge)](edge.md). Descripción general: [Hyperliquid](index.md).

| | |
|--|--|
| Para quién es | Nodos no validadores que usted opera |
| Qué obtiene | Un feed de gossip arbitrado a través de Block Proxy (bloques + mempool) |
| Hosts receptores | 1 IP incluida |
| Precio | $999/mes (sin datos de mercado de Edge) |
| Objetivo de disponibilidad | 99.9% mensual |

## Solicitar peering

Más información sobre peering está disponible a través de [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Incluya la IP pública estática de su nodo (y región). Espere los detalles de peering dentro de **1–3 días hábiles** después de que tengamos los detalles de su nodo y el pago esté realizado.

## Por qué el peering es de pago

Los peers raíz públicos de Hyperliquid son compartidos: los slots están disputados, los peers rotan o aplican límites de tasa, y muchos no reenvían el mempool. Un slot de peering reservado le brinda un upstream estable en DoubleZero en lugar de competir por esa capacidad pública.

## Cómo funciona

- Dos fuentes de gossip: un feed A del nodo no validador de Hyper Foundation, y un feed B de un sentry.
- Los clientes se conectan con un nivel de Block Proxy que escala horizontalmente. Cada proxy se conecta con ambos nodos no validadores nuestros y aparece como un peer de gossip ordinario para cada uno de ellos.
- El proxy arbitra A y B en un solo feed de gossip deduplicado para sus peers, de modo que cualquiera de las fuentes puede caer sin detener el flujo.
- Agregue proxies para agregar capacidad. La carga en nuestros nodos no validadores no crece con la cantidad de peers.

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

El nodo de Hyper Foundation se conecta con nuestro primario; un sentry alimenta nuestro secundario. Cada Block Proxy se conecta con ambos, fusiona sus feeds para sus clientes y obtiene snapshots de arranque del servicio de snapshots cuando es necesario.

## Tiempo de actividad

Objetivo: 99.9% de disponibilidad mensual.

- Feed redundante. Cada proxy se conecta con ambos nodos no validadores nuestros. Esos nodos reciben bloques de fuentes independientes (Foundation y sentry). Si una sesión o fuente cae, la otra mantiene el flujo de bloques mientras la ruta fallida se recupera.
- Nuestros nodos permanecen detrás del nivel de proxy. Los peers externos solo alcanzan los Block Proxies. Si un proxy falla, sus peers se reconectan a otro proxy saludable. La carga nunca recae sobre nuestros nodos.
- Los proxies mantienen solo cachés desechables (snapshot, ventana de bloques rotativa, buffers en vivo), no estado de cadena autoritativo. Un proxy defectuoso se reemplaza automáticamente. Un reemplazo solo entra en servicio después de que las sesiones upstream y los cachés pasen las verificaciones de preparación. Nuestros nodos no validadores no se reinician para eso.

## Autoescalado

- Escale agregando un proxy. Cada proxy sirve a muchos peers pero cuenta como un solo peer en cada uno de nuestros nodos no validadores.
- La carga de los nodos depende de la cantidad de proxies, no de la cantidad de peers.
- Un nuevo proxy se activa una vez que los cachés están calientes y las verificaciones de preparación pasan. No necesita una resincronización completa de la cadena.
- Un peer que se une toma su snapshot de arranque del servicio de snapshots y los bloques de recuperación del almacén propio del proxy, nunca de nuestros nodos no validadores. Una oleada de nuevos peers impacta el nivel de proxy en su lugar.

## Precios

$999/mes por peering. Incluye mempool. No incluye feeds de datos de mercado de Edge. Un host receptor (IP) está incluido. El peering no se agrupa ni se descuenta con datos de mercado de Edge.