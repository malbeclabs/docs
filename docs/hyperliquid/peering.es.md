---
description: "Peering de Hyperliquid: gossip arbitrado a través de Block Proxy para nodos no validadores."
---

# Acceso de Peering

El peering proporciona a los nodos no validadores un feed de gossip de Hyperliquid de baja latencia y deduplicado a través de un Block Proxy, incluyendo el mempool. No incluye feeds de datos de mercado de Edge. Para esos, consulte [Suscribirse a Hyperliquid (Edge)](edge.md). Visión general: [Hyperliquid](index.md).

| | |
|--|--|
| Para quién es | Nodos no validadores que usted opera |
| Qué obtiene | Un feed de gossip arbitrado a través de Block Proxy (bloques + mempool) |
| Hosts receptores | 1 IP incluida |
| Precio | $999/mes (sin datos de mercado de Edge) |
| Objetivo de disponibilidad | 99.9% mensual |

## Solicitar peering

Más información sobre peering está disponible a través de [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Incluya la IP pública estática de su nodo (y la región). Espere los detalles del peer en **1–3 días hábiles** después de que tengamos los detalles de su nodo y el pago esté completado.

## Conectar su nodo

Una vez aprobado, le enviaremos su **IP del peer**. Apunte su nodo no validador hacia ella, abra su firewall para permitirla y reinicie el nodo.

### 1. Configurar la configuración de gossip

Reemplace `~/override_gossip_config.json` con lo siguiente, usando su IP del peer:

```json
{
  "root_node_ips": [{"Ip": "<PEER_IP>"}],
  "try_new_peers": false,
  "split_client_blocks": true,
  "chain": "Mainnet"
}
```

| Configuración | Por qué |
|--|--|
| `root_node_ips` | Su peer de DoubleZero es su único upstream. |
| `try_new_peers: false` | Mantiene el nodo en el peer de DoubleZero. No cambiará a peers públicos. |
| `split_client_blocks: true` | Transmite las transacciones del mempool a `~/hl/data/mempool_txs/`. |

!!! note "Planifique para disco y ancho de banda"
    Con `split_client_blocks: true`, el nodo escribe el mempool completo en disco.
    Planifique varios cientos de GB hasta aproximadamente 1 TB de escrituras por día
    desde el mempool, y aproximadamente lo mismo desde otras salidas del nodo. El ancho
    de banda entrante es menor porque el gossip se comprime en la transmisión; nuestro
    nodo de prueba recibió aproximadamente 110 GB/día. Establezca una política de
    retención para `~/hl/data/` (por ejemplo, eliminar archivos con más de unas pocas
    horas) o el disco se llenará en un día.

### 2. Abrir su firewall para el peer

Permita **TCP y UDP entrante en los puertos 4001–4002 desde `<PEER_IP>`**. Haga esto en su grupo de seguridad en la nube y en el firewall del host.

Cuando su nodo se conecta, el peer se conecta de vuelta a su nodo en los puertos 4001 y 4002 para verificar que sea accesible. Si esa verificación está bloqueada, la conexión se abre pero no llegan datos. También permita conexiones salientes hacia el peer en los puertos 4001–4002.

### 3. Reiniciar el nodo

```bash
sudo systemctl restart hl-node   # o como ejecute hl-visor
```

El nodo lee este archivo cuando se inicia. Los cambios realizados mientras está en ejecución pueden no tener efecto completo, así que reinicie después de cada cambio. La sincronización generalmente toma 5–15 minutos.

### 4. Verificar que funciona

```bash
ss -tn state established '( dport = :4001 )'     # una conexión, hacia <PEER_IP>
journalctl -u hl-node -f | grep 'applied block'  # los bloques se están aplicando
ls -l ~/hl/data/mempool_txs/                     # los archivos del mempool están creciendo
```

!!! warning "Conectado pero sin datos"
    El peer no puede alcanzar su nodo en los puertos 4001–4002. Verifique las reglas de entrada del paso 2.

!!! note "Sin respaldo a peers públicos"
    Con `try_new_peers: false`, su nodo espera al peer de DoubleZero si no está accesible. No cambiará a peers públicos. Contáctenos si ve repetidamente `Peer full` o tiempos de espera de conexión.

## Por qué peering de pago

Los peers raíz públicos de Hyperliquid son compartidos: los slots están en contención, los peers rotan o limitan la tasa, y muchos no reenvían el mempool. Un slot de peering reservado le proporciona un upstream estable en DoubleZero en lugar de competir por esa capacidad pública.

## Cómo funciona

- Dos fuentes de gossip: un feed A del nodo no validador de Hyper Foundation, y un feed B de un sentry.
- Los clientes hacen peering con un nivel de Block Proxy que escala horizontalmente. Cada proxy hace peering con ambos de nuestros nodos no validadores y se presenta como un peer de gossip ordinario para cada uno de ellos.
- El proxy arbitra A y B en un único feed de gossip deduplicado para sus peers, de modo que cualquiera de las fuentes puede caer sin detener la transmisión.
- Agregue proxies para agregar capacidad. La carga en nuestros nodos no validadores no crece con el número de peers.

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

El nodo de Hyper Foundation hace peering con nuestro primario; un sentry alimenta nuestro secundario. Cada Block Proxy hace peering con ambos, fusiona sus feeds para sus clientes, y obtiene snapshots de arranque del servicio de snapshots cuando es necesario.

## Tiempo de actividad

Objetivo: 99.9% de disponibilidad mensual.

- Feed redundante. Cada proxy hace peering con ambos de nuestros nodos no validadores. Esos nodos toman bloques de fuentes independientes (Foundation y sentry). Si una sesión o fuente cae, la otra mantiene los bloques fluyendo mientras la ruta fallida se recupera.
- Nuestros nodos permanecen detrás del nivel de proxy. Los peers externos solo alcanzan los Block Proxies. Si un proxy falla, sus peers se reconectan a otro proxy saludable. La carga nunca recae en nuestros nodos.
- Los proxies mantienen solo cachés desechables (snapshot, ventana de bloques rotativa, buffers en vivo), no estado autoritativo de la cadena. Un proxy defectuoso se reemplaza automáticamente. Un reemplazo solo entra en servicio después de que las sesiones upstream y los cachés pasen las verificaciones de preparación. Nuestros nodos no validadores no se reinician para eso.

## Autoescalado

- Escale agregando un proxy. Cada proxy sirve a muchos peers pero cuenta como un único peer en cada uno de nuestros nodos no validadores.
- La carga del nodo rastrea el número de proxies, no el número de peers.
- Un nuevo proxy se activa una vez que los cachés están calientes y las verificaciones de preparación pasan. No necesita una resincronización completa de la cadena.
- Un peer que se une toma su snapshot de arranque del servicio de snapshots y los bloques de recuperación del almacén propio del proxy, nunca de nuestros nodos no validadores. Una oleada de nuevos peers impacta el nivel de proxy en su lugar.

## Precios

$999/mes por peering. Incluye mempool. No incluye feeds de datos de mercado de Edge. Un host receptor (IP) está incluido. El peering no se incluye en paquete ni tiene descuento con los datos de mercado de Edge.