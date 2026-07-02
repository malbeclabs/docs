---
description: Ejecute doublezero-edge-connect para reenviar shreds de Solana a un puerto UDP local y consumir datos de mercado normalizados de Edge a través de un WebSocket local.
---

# Conexión Edge

!!! warning "Al conectarme a DoubleZero acepto los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol). Los datos son únicamente para uso interno y no pueden ser retransmitidos (véase la Sección 2(e))."

`doublezero-edge-connect` es un puente que se une al **multicast binario de DoubleZero Edge** y lo redistribuye localmente como dos flujos:

1. **Reenvío de shreds de Solana** — shreds deduplicados (opcionalmente con verificación de firma) distribuidos a uno o más destinos UDP locales, listos para su validador o RPC.
2. **Datos de mercado normalizados** — feeds de venues de Edge decodificados, con precisión corregida, y redistribuidos como un único WebSocket JSON en `ws://host:8081`.

Ambos se ejecutan desde el mismo contenedor y la misma instalación de una sola línea. Habilite los feeds que su autorización onchain le permita.

```
                                        ┌─ UDP datagrams ──▶  validator / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binary)             (dedup · decode · normalize)  └─ WebSocket (JSON) ──▶  trading engine
                                                          ws://host:8081
```

---

## Requisitos

- Host **Linux/amd64** con una dirección IPv4 pública autorizada onchain para el entorno objetivo.
- **Docker** (el instalador de una línea lo instala si no está presente).
- **Conectividad GRE** — permita el protocolo IP 47 en su proveedor de nube; en AWS deshabilite la verificación source/dest del ENI.
- Un **secreto de acceso DoubleZero**: un token base64 con prefijo `DZ_` o una ruta a un archivo de keypair, obtenido del proceso de [incorporación a DoubleZero](setup.md).

---

## Paso 1: Instalar y Ejecutar

Un solo comando prepara el host e inicia el contenedor puente. Se une a la red DoubleZero e inicia cada feed que su autorización permita — reenvío de shreds y/o el WebSocket de datos de mercado en `:8081`:

=== "Mainnet-beta"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect | bash
    ```

=== "Testnet"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect-testnet | bash
    ```

=== "Devnet (privada)"

    ```bash
    # Requiere un token GHCR con read:packages
    DZ_GHCR_TOKEN=<your-token> curl -fsSL https://get.doublezero.xyz/connect-devnet | bash
    ```

Lo que hace el script:

1. Verifica que el host sea Linux/amd64.
2. Carga su secreto de acceso (se solicita una vez si `DZ_SECRET` no está configurado) y **verifica su pase de acceso onchain antes de instalar nada** — una comprobación puramente del lado del host contra el JSON-RPC público del ledger. Si el pase está vinculado a una IP diferente a la del host, aborta (cuando la IP se proporcionó explícitamente vía `DZ_CLIENT_IP`) o advierte y continúa (cuando la IP fue solo autodetectada, lo cual puede ser incorrecto detrás de NAT), dejando `doublezero connect` como la verificación real.
3. Se asegura de que Docker esté presente (ofrece instalarlo) y prepara el kernel del host para el túnel GRE: carga `tun`/`ip_gre`, eleva `net.core.rmem_max`, advierte sobre reglas de firewall y del proveedor de nube.
4. Ejecuta el contenedor puente (`--network host`, `NET_ADMIN`/`NET_RAW`, `/dev/net/tun`) y ejecuta `doublezero connect multicast`.

!!! tip "Instalación no interactiva"
    Configure `DZ_SECRET=DZ_…` antes del pipe para ejecutar completamente desatendido — sin ningún prompt.

---

## Paso 2: Configurar

Toda la configuración se realiza mediante **variables de entorno establecidas antes del pipe**. No hay archivo de configuración.

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### Variables del instalador

| Variable | Valor por defecto | Propósito |
|----------|-------------------|-----------|
| `DZ_SECRET` | *(se solicita)* | Token base64 con prefijo `DZ_` **o** ruta a un archivo de keypair. Un token se inyecta en el contenedor y nunca se escribe en disco; un archivo se monta como solo lectura (bind-mount). |
| `DZ_ENV` | según el script | `mainnet-beta` \| `testnet` \| `devnet`. |
| `DZ_IMAGE` | según el script | Sobrescribir la imagen del contenedor. |
| `DZ_NAME` | `doublezero-edge-connect` | Nombre del contenedor. |
| `DZ_FEEDS` | *(todos)* | Venues separados por comas para limitar la ingesta de datos de mercado (ej. `VenueA,VenueB`). No afecta al reenvío de shreds de Solana. |
| `DZ_CLIENT_IP` | *(autodetectada)* | Sobrescribir la IPv4 pública usada por la pre-verificación del pase de acceso onchain. Configúrela cuando la autodetección sea incorrecta (ej. detrás de NAT) para que la pre-verificación pueda confirmar en lugar de solo advertir. |
| `DZ_LEDGER_RPC_URL` | según el entorno | Sobrescribir el endpoint RPC del ledger de DoubleZero usado por la pre-verificación. |
| `DZ_ASSUME_YES` | `0` | Omitir prompts de confirmación (ej. el prompt de instalación de Docker). |
| `DZ_GHCR_TOKEN` | — | **Solo Devnet** — un token GHCR con `read:packages` (la imagen de devnet es privada). |
| `DZ_GHCR_USER` | `malbeclabs` | **Solo Devnet** — nombre de usuario GHCR para el login. |

### Variables del puente

El instalador reenvía **cualquier variable no vacía** del puente directamente al contenedor. Las más comunes:

| Variable | Valor por defecto | Propósito |
|----------|-------------------|-----------|
| `DZ_IFACE` | `doublezero1` | Interfaz de red en la que escuchar. |
| `DZ_RECV_BUF` | `8388608` | Sobrescritura del buffer de recepción UDP (bytes; por defecto 8 MiB). |
| `METRICS_BIND` | *(vacío / desactivado)* | Habilitar el endpoint Prometheus `/metrics` (ej. `127.0.0.1:9090`). |
| `RUST_LOG` | `warn,doublezero_edge_connect=info` | Nivel de log (`debug`, `warn`, etc.). |
| `DZ_SHRED_FORWARD` | — | Destino(s) UDP local(es) para shreds reenviados — véase [Reenvío de Shreds de Solana](#reenvio-de-shreds-de-solana). |
| `WS_BIND` | `0.0.0.0:8081` | Dirección de enlace del WebSocket de datos de mercado — véase [WebSocket de Datos de Mercado](#websocket-de-datos-de-mercado). |
| `WS_MAX_CLIENTS` | `64` | Máximo de clientes WebSocket concurrentes. |
| `WS_INPUT_COINS` | *(vacío / desactivado)* | Habilitar el respaldo de WebSocket público de Hyperliquid para símbolos listados (ej. `BTC,ETH`) — véase [Fuentes de entrada](#fuentes-de-entrada-y-el-respaldo-websocket). |
| `WS_INPUT_URL` | `wss://api.hyperliquid.xyz/ws` | URL del WebSocket público de Hyperliquid para el respaldo. |
| `PHOENIX_WS_INPUT_MARKETS` | *(vacío / desactivado)* | Habilitar el respaldo de WebSocket público de Phoenix (solo trades) para tickers listados (ej. `SOL,BTC`). |
| `PHOENIX_WS_INPUT_URL` | `wss://perp-api.phoenix.trade/v1/ws` | URL del WebSocket público de Phoenix para el respaldo. |

**Ejemplos:**

```bash
# Reenviar shreds a un validador/RPC local:
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# No interactivo, testnet:
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# Limitar datos de mercado a venues específicos, logging detallado, puerto WS no predeterminado:
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# Habilitar métricas y un respaldo WS público:
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    El instalador reenvía solo valores **no vacíos**, con una excepción: `WS_BIND` se reenvía incluso cuando se establece vacío, por lo que `WS_BIND=""` **sí** desactiva el sink WebSocket a través del instalador de una línea. Para cualquier otra variable, una sobrescritura vacía no puede pasarse a través del pipe — use un `docker run` manual para eso (véase [Autoalojamiento](#avanzado-autoalojamiento)).

---

## Reenvío de Shreds de Solana

El puente se une a los grupos multicast de shreds `edge-solana-*` y distribuye cada datagrama a uno o más destinos UDP locales — alimentando su validador o RPC directamente desde la red Edge. Se activa automáticamente al descubrimiento cuando esos grupos están presentes en su autorización.

```bash
# Predeterminado (solo dedup, reenviar al puerto local 20000):
DZ_SHRED_FORWARD=127.0.0.1:20000 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# Con verificación de firma:
DZ_SHRED_DEDUP_MODE=sigverify \
  DZ_SHRED_RPC_URL=https://api.mainnet-beta.solana.com \
  DZ_SHRED_FORWARD=127.0.0.1:20000 \
  DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

| Variable | Valor por defecto | Propósito |
|----------|-------------------|-----------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | Destino(s) para shreds reenviados (repetible). |
| `DZ_SHRED_DISABLE` | `0` | Desactivación maestra (`--shred-forward-disable`). Mantiene el reenviador apagado independientemente de lo que su autorización permita — configúrelo cuando ningún consumidor local esté escuchando, para evitar gastar CPU reenviando el flujo completo de shreds a la nada. |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup` (una copia por shred), `sigverify` (+ verificación ed25519), `none` (todos los datagramas). |
| `DZ_SHRED_RPC_URL` | — | Endpoint RPC de Solana; requerido por el modo `sigverify`. |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | Tamaño de la ventana de deduplicación. |

Véase [Reenvío de shreds](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md) para el pipeline completo y las consideraciones.

---

## WebSocket de Datos de Mercado

Abra un WebSocket a `ws://<host>:8081` y lea frames JSON. Recibirá todos los venues para los que esté autorizado. Un mensaje `subscribe` opcional reduce el flujo a venues y símbolos específicos.

Cualquier motor que hable WebSocket + JSON puede consumirlo con un adaptador pequeño (~50–100 líneas). El multicast binario, la división de dos puertos por venue y el handshake de manifiesto/precisión permanecen dentro del puente; el único contrato contra el que un consumidor programa es el WebSocket JSON.

!!! note
    El sink WebSocket se activa solo cuando al menos un feed de datos de mercado está activo para su autorización — un host solo de shreds no sirve WebSocket. La activación es controlada por un reconciliador de suscripciones onchain que se actualiza cada 30s (`--subscription-refresh-secs`); `--subscription-gating-disable` desactiva el control de acceso.

### Ciclo de vida de la conexión

En cada nueva conexión el puente:

1. **Reproduce las definiciones de instrumentos actuales** — un mensaje `instrument` por símbolo conocido — para que el consumidor tenga la precisión antes de la primera cotización.
2. **Reproduce la última instantánea de profundidad** por símbolo (si el feed Market-by-Order está activo).
3. **Transmite** mensajes `quote` / `trade` / `midpoint` / `depth` conforme llegan, distribuidos a todos los consumidores conectados.

```
connect → instrument (×N) → depth (×M, latest books) → quote → trade → depth → …
```

### Tipos de mensaje

Cada mensaje es un objeto JSON etiquetado por un campo `type`:

| `type` | Significado |
|--------|-------------|
| `instrument` | Definición de instrumento/precisión. |
| `quote` | Actualización del tope del libro (estado completo). |
| `trade` | Impresión de operación (última venta). |
| `midpoint` | Precio medio derivado. |
| `depth` | Instantánea completa de profundidad del libro de órdenes. |
| `status` | Transición de salud del feed a nivel de venue. |

Los consumidores **deben ignorar valores `type` desconocidos y campos desconocidos** (compatibilidad futura).

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

Se envía al conectar y cada vez que las definiciones cambian. `price_exponent` y `qty_exponent` dan el tick size y el paso de tamaño del venue como potencias de diez.

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

Cada `quote` es **estado completo** — un mensaje perdido se autocorrige con la siguiente cotización, no se necesita resincronización. Las cuatro marcas de tiempo descomponen la latencia de extremo a extremo:

```
source_ts_ns → kernel_rx_ts_ns → recv_ts_ns → ws_send_ts_ns → (consumer recv)
  venue book      wire arrival      post-decode    WS hand-off
```

`0` es el valor centinela para "no disponible" — trátelo como ausente, no como 1970.

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

`aggressor_side` es `"buy"`, `"sell"` o `"unknown"`. Los trades son eventos puntuales y no se reproducen al reconectar.

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

Los `bids` están ordenados del precio más alto al más bajo; los `asks` están ordenados del precio más bajo al más alto. Cada `depth` es una **instantánea completa** — reemplace, no fusione.

#### `status`

```json
{"type":"status","venue":"ExampleVenue","state":"down","stale_ms":30000,"ts_ns":...}
```

Se emite en el edge cuando el multicast de cotizaciones de un venue queda en silencio (`state:"down"`) o se recupera (`state:"ok"`). Úselo para atenuar un venue en su interfaz. La entrega de cotizaciones no está condicionada al estado — el feed se autocorrige con la siguiente cotización.

### Suscripciones

Por defecto recibe todo. Envíe un mensaje de control para reducir el flujo:

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Omitir un campo coincide con cualquier valor (`{"symbol":"SOL"}` = SOL en todos los venues). `venue` se compara sin distinción de mayúsculas/minúsculas.

**Confirmación del servidor:**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Los errores devuelven `{"channel":"error","error":"<reason>"}`.

### Heartbeat y verificación de actividad

- El servidor envía un **WebSocket Ping** cada 20 segundos; los clientes compatibles responden Pong automáticamente.
- Los clientes silenciosos durante 60 segundos son cerrados y eliminados.
- Keepalive a nivel de aplicación: `{"method":"ping"}` → `{"channel":"pong"}`.

### Esqueleto de consumidor

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
    # tipos desconocidos: ignorar silenciosamente (compatibilidad futura)

ws = websocket.WebSocketApp("ws://localhost:8081", on_message=on_message)
ws.run_forever()
```

### Fuentes de entrada y el respaldo WebSocket

El feed multicast Edge está siempre activo. **Respaldos de WebSocket públicos** opcionales pueden llenar vacíos cuando el feed Edge se detiene. Hay dos disponibles, cada uno desactivado por defecto y habilitado independientemente por venue:

| Respaldo | Habilitar con | Cubre | URL por defecto |
|----------|---------------|-------|-----------------|
| **Hyperliquid** | `WS_INPUT_COINS` (ej. `BTC,ETH`) | cotizaciones + trades | `wss://api.hyperliquid.xyz/ws` (`WS_INPUT_URL`) |
| **Phoenix** | `PHOENIX_WS_INPUT_MARKETS` (tickers, ej. `SOL,BTC`) | **solo trades** | `wss://perp-api.phoenix.trade/v1/ws` (`PHOENIX_WS_INPUT_URL`) |

```bash
# Habilitar el respaldo de Hyperliquid para BTC y ETH:
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# Habilitar el respaldo de trades de Phoenix para SOL:
PHOENIX_WS_INPUT_MARKETS=SOL DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

Para cada tick `(venue, symbol, source_ts)`, las fuentes Edge y pública compiten dentro de un árbitro compartido. En estado estable, la fuente Edge gana (sub-ms vs. decenas de ms por internet); cuando Edge tiene vacíos, la copia pública los llena. La salida WebSocket es idéntica independientemente de qué fuente entregó una actualización dada. (Los respaldos de Phoenix cubren solo trades — Edge sigue siendo la única fuente de cotizaciones de Phoenix.)

---

## Gestionar el Contenedor

```bash
# Transmitir logs
sudo docker logs -f doublezero-edge-connect

# Verificar estado del túnel
sudo docker exec -it doublezero-edge-connect doublezero status

# Verificar latencias del dispositivo
sudo docker exec -it doublezero-edge-connect doublezero latency

# Detener y eliminar
sudo docker stop doublezero-edge-connect && sudo docker rm doublezero-edge-connect
```

!!! note "Sin TLS"
    El puente está diseñado para una red confiable/local. Termine TLS en un proxy inverso si expone el endpoint WebSocket externamente.

---

## Monitoreo (Métricas Prometheus)

El endpoint de métricas está **desactivado por defecto**. Habilítelo con `METRICS_BIND`:

```bash
METRICS_BIND=127.0.0.1:9090 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

Luego consulte:

```bash
curl -s localhost:9090/metrics | grep '^dz_'
```

Métricas clave:

| Métrica | Qué rastrea |
|---------|-------------|
| `dz_feed_up{venue}` | `1` mientras el multicast de ese venue está activo, `0` mientras está en silencio. |
| `dz_datagrams_received_total{venue}` | Volumen de ingesta por venue. |
| `dz_emit_total{venue,kind}` | Mensajes emitidos después de dedup, por tipo. |
| `dz_quotes_admitted_total{venue,publisher}` | Cotizaciones admitidas por el árbitro, atribuidas a la fuente ganadora. Un aumento en `publisher="public"` significa que un respaldo está llenando un vacío de Edge (vs. `publisher="edge"` en estado estable). |
| `dz_quotes_dropped_total{venue}` | Cotizaciones obsoletas/duplicadas suprimidas. |
| `dz_ws_clients` | Clientes WebSocket actualmente conectados. |
| `dz_ws_messages_sent_total{kind}` | Mensajes reenviados a los clientes. |
| `dz_ws_client_lagged_total` | Veces que un cliente lento fue descartado para proteger el feed. |

Un probe de liveness `GET /healthz` también se sirve en la misma dirección de enlace.

---

## Avanzado: Autoalojamiento

El contenedor está disponible en GHCR:

| Entorno | Imagen | Etiqueta |
|---------|--------|----------|
| Mainnet-beta | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:mainnet-beta` |
| Testnet | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:testnet` |
| Devnet (privada) | `ghcr.io/malbeclabs/doublezero-edge-connect-devnet` | `:latest` |

Ejecútelo manualmente (necesario para opciones que el instalador no puede reenviar, como `WS_BIND=""`):

```bash
docker run --rm --network host --cap-add NET_ADMIN --device /dev/net/tun \
  -e DZ_SECRET=DZ_… \
  -e DZ_SHRED_FORWARD=127.0.0.1:20000 \
  -e WS_BIND=0.0.0.0:8081 \
  -e METRICS_BIND=127.0.0.1:9090 \
  ghcr.io/malbeclabs/doublezero-edge-connect:mainnet-beta
```

**Compilar desde el código fuente:**

```bash
git clone https://github.com/malbeclabs/doublezero-edge-connect
cd doublezero-edge-connect
cargo build --release
cargo test

./target/release/doublezero-edge-connect \
  --iface doublezero1 \
  --ws-bind 0.0.0.0:8081
```

Se recomienda un buffer de recepción del kernel más grande para feeds con ráfagas:

```bash
sudo sysctl -w net.core.rmem_max=268435456
```

---

## Límites y Contrapresión

| Límite | Valor por defecto | Comportamiento cuando se excede |
|--------|-------------------|--------------------------------|
| Clientes concurrentes (`WS_MAX_CLIENTS`) | 64 | La nueva conexión es rechazada. |
| Suscripciones por cliente (`WS_MAX_SUBS`) | 256 | El `subscribe` es rechazado con un error. |
| Mensajes de control entrantes / cliente / min (`WS_MAX_INBOUND_PER_MIN`) | 600 | El cliente es desconectado. |
| Buffer de broadcast (`WS_BROADCAST_CAPACITY`) | 4096 | Un cliente lento **descarta los mensajes más antiguos** (nunca detiene el feed). |

Dado que cada `quote` y `depth` es estado completo, un consumidor que pierde mensajes bajo contrapresión se autocorrige con el siguiente mensaje — no se requiere handshake de resincronización.

---

## Resolución de Problemas

### No llegan shreds al puerto local

- Confirme que su acceso está autorizado para los grupos de shreds `edge-solana-*` onchain.
- Verifique que el túnel esté activo: `sudo docker exec -it doublezero-edge-connect doublezero status`
- Revise los logs en busca de errores de unión: `sudo docker logs -f doublezero-edge-connect`
- Confirme que `DZ_SHRED_FORWARD` apunta a un destino UDP local accesible.

### No hay mensajes de un venue

- Verifique que el túnel esté activo: `sudo docker exec -it doublezero-edge-connect doublezero status`
- Revise los logs en busca de errores de unión: `sudo docker logs -f doublezero-edge-connect`
- Confirme que su acceso está autorizado para ese venue onchain.
- Limite la ingesta a ese venue con `DZ_FEEDS=<VenueName>` para aislar el problema.

### El WebSocket se conecta pero no llegan cotizaciones

- Los mensajes `instrument` siempre llegan primero; las cotizaciones siguen una vez que el handshake de datos de referencia se completa. Espere 10–20 segundos después de conectar antes de concluir que faltan datos.
- Verifique `dz_feed_up{venue}` en las métricas — `0` significa que el multicast está en silencio en su host.
- Verifique que las reglas de firewall permitan UDP multicast en la interfaz `doublezero1`.

### Alto `dz_ws_client_lagged_total`

Su consumidor está leyendo más lento de lo que el puente está publicando. Aumente el buffer de broadcast con `WS_BROADCAST_CAPACITY`, reduzca el tiempo de procesamiento por mensaje, o agregue un hilo de lectura dedicado.

### El contenedor se cierra inmediatamente

- El puente requiere `--network host` y el dispositivo `/dev/net/tun`; un `docker run` simple sin esos flags fallará.
- Use el instalador de una línea o el comando `docker run` exacto mostrado en [Autoalojamiento](#avanzado-autoalojamiento).

### El túnel GRE no se establece

Consulte [Resolución de problemas](troubleshooting.md) y asegúrese de que el protocolo IP 47 esté permitido en su proveedor de nube. En AWS, deshabilite la verificación source/dest del ENI para el host.