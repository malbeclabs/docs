---
description: "Suscríbete a los datos de mercado de Hyperliquid en DoubleZero Edge — configuración, metro, solicitud de feed y conexión tras aprobación."
---

# Suscribirse a Hyperliquid (Edge)

!!! warning "Al conectarme a DoubleZero acepto los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol). Ten en cuenta que los datos son solo para tus propósitos internos y no pueden ser retransmitidos (véase la Sección 2(e))."

Los feeds de Hyperliquid entregan datos de mercado a través de DoubleZero Edge como multicast UDP. Cuatro feeds principales cubren los perps nativos de Hyperliquid (`hl`) y los perps de [trade.xyz](https://trade.xyz) (`xyz`):

| Feed | Descripción |
|------|-------------|
| `hyper-hl-tob` | Mejor oferta/demanda e impresiones de operaciones para perps de Hyperliquid |
| `hyper-hl-mbo` | Libro completo orden por orden para perps de Hyperliquid (altas, cancelaciones, ejecuciones) |
| `hyper-xyz-tob` | Mejor oferta/demanda e impresiones de operaciones para perps de trade.xyz |
| `hyper-xyz-mbo` | Libro completo orden por orden para perps de trade.xyz (altas, cancelaciones, ejecuciones) |

Visión general del servicio: [Hyperliquid](index.md).

## ¿Qué camino debo seguir?

| Modo | Lo que obtienes | Cuándo usarlo |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — JSON decodificado sobre WebSocket | El más rápido para obtener un flujo de cotizaciones utilizable |
| **Multicast nativo** | Suscríbete en `doublezero1`, decodifica UDP binario tú mismo (o con parsers de referencia) | Control total del cable |

Primero los pasos compartidos: firewall, metro, solicitud y pago (Pasos 1–3). Tras la aprobación, el [Paso 4](#step-4-connect-after-approval) se divide — **Edge Connect** o **nativo**. No los mezcles en el mismo host.

¿Quieres que una IA haga la instalación contigo? Conecta el [DoubleZero MCP](../mcp.md) y pídele que te guíe a través de Hyperliquid Edge.

---

## Paso 1: Configuración de DoubleZero

**Completar la configuración**


Sigue las instrucciones de [configuración](../setup.md) para instalar y configurar el cliente de DoubleZero en el host.

Si anteriormente configuraste DoubleZero en el host para uso nativo, asegúrate de que el cliente esté actualizado:

```bash
sudo apt update && sudo apt install doublezero
```

**Configurar el firewall**


Permite tráfico GRE, BGP, PIM y de feeds de Hyperliquid en `doublezero1`. Los puertos UDP de Hyperliquid están en el rango `20000`–`20999` (Top-of-Book y Market-by-Order market, reference y snapshot). También permite UDP `5765` para los heartbeats de DoubleZero en el túnel. Abre la banda de feeds para que nuevos feeds no requieran otro cambio de firewall. Consulta [Direcciones de feeds](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid market / reference / snapshot (todos los feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 20000:20999 -j ACCEPT
# Heartbeats de DoubleZero
sudo iptables -A INPUT -i doublezero1 -p udp --dport 5765 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Hyperliquid market / reference / snapshot (todos los feeds)
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# Heartbeats de DoubleZero
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

UFW no tiene protocolo `pim`. El PIM saliente está permitido por la política de salida predeterminada de UFW; si deniega el tráfico saliente, agregue una regla raw para PIM en `/etc/ufw/before.rules`.

Puedes restringir estas reglas solo a los puertos de los feeds a los que te suscribas (consulta [Direcciones de feeds](#feed-addresses)).

---

## Paso 2: Elegir un metro

Identifica la ubicación de menor latencia desde la máquina que recibirá el feed:

```bash
doublezero latency
```

Anota el metro / ciudad del resultado con menor latencia. Seleccionarás esa ciudad en el formulario de solicitud. Consulta el [mapa de topología](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) para ver cómo se agrupan los metros.

**Precios**


Los feeds se cobran por región de entrega. El precio depende de dónde se entregan los datos, no de dónde está el comprador. Un paquete de Tokio entrega a receptores en Tokio; la entrega en otro lugar requiere el paquete Global. Se incluyen dos hosts receptores (IPs) por feed, por metro.

| Feed | Tokio /mes | Global /mes |
| --- | --- | --- |
| Hyperliquid perps Top-of-Book (L1) | $900 | $1,500 |
| Hyperliquid perps Market-by-Order (L4) | $3,000 | $5,000 |
| trade.xyz perps Top-of-Book (L1) | $900 | $1,500 |
| trade.xyz perps Market-by-Order (L4) | $3,000 | $5,000 |
| **Todos los feeds (paquete ~30% descuento)** | **$5,500** | **$9,000** |

---

## Paso 3: Enviar solicitud

1. Ve a [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Selecciona **Hyperliquid** y los feeds que necesitas.
3. Selecciona la **ciudad** (metro) que necesitas. Usa la tabla anterior y `doublezero latency` para elegir.
4. Completa el formulario de solicitud.

Asignarás un ID de DoubleZero (clave existente o genera una nueva) a cada solicitud de feed en la página de [cuentas](https://doublezero.xyz/shreds/account). La **clave privada correspondiente debe estar presente en la máquina que recibirá el feed** — no asignes una clave pública cuya clave privada no puedas mover a ese host.

Eliges un **metro** y una **clave pública**. **No** vinculas una IP pública en el momento de la solicitud. Durante la suscripción puedes mover el acceso entre IPs **dentro de los metros elegidos**.

Serás contactado con más instrucciones en tiempo oportuno (espera **1-3 días hábiles**).

---

## Paso 4: Conectar tras la aprobación {#step-4-connect-after-approval}

Después de enviar la solicitud, recibirás una factura; una vez pagada, conéctate en cada máquina aprobada. El acceso se habilita en la fecha de inicio elegida. Elige **un** camino a continuación.

### 4a. Edge Connect {#4a-edge-connect}

Si `doublezerod` ya se está ejecutando en el host (desde la [configuración](../setup.md)), tanto él como el daemon propio del contenedor intentan vincular el puerto UDP `44880`, por lo que el daemon del contenedor se detiene justo después de iniciar. El instalador ofrece detener y deshabilitar el daemon del host, y lo hace sin preguntar cuando `DZ_ASSUME_YES=1` está configurado. Para hacerlo tú mismo:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Instala [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) **después** de la aprobación y el pago. El puente se une a DoubleZero dentro de un contenedor `--network host` y sirve JSON decodificado en `ws://<host>:8081`.

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**Todos los comandos `doublezero` se ejecutan a través del contenedor**, no del CLI del host:

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    Puedes crear un alias para comandos fáciles al contenedor. Este ejemplo permite que `dz status` funcione igual que `doublezero status` dentro del contenedor:

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

Espera `BGP Session Up` y tu(s) grupo(s) `edge-hyper-…` suscritos.

Luego abre el WebSocket (`ws://127.0.0.1:8081`). Contrato: [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md). Guía completa: runbook [MCP](../mcp.md) `hyperliquid-edge`.

### 4b. Multicast nativo {#4b-native-multicast}

En el host que tiene la clave privada asignada (con `doublezerod` del host en ejecución), suscríbete a los feeds que compraste:

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

Múltiples feeds, separados por espacios:

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

Verifica el túnel:

```bash
doublezero status
```

Espera `BGP Session Up` en la red DoubleZero correcta. Luego decodifica el cable tú mismo — consulta [Decodificar el feed](#decode-the-feed).

---

## Facturación

Los asientos se cobran **mensualmente**. Vigila la fecha de expiración del asiento.

Necesitas pagar la factura antes de que expire el asiento. **No pagar conlleva la eliminación del asiento.**

---

## Direcciones de feeds {#feed-addresses}

La IP selecciona el grupo multicast. El puerto selecciona el flujo en ese grupo. Verifica los valores IP en vivo con:

```bash
doublezero multicast group list
```

| Feed | Descripción | Grupo multicast | Market | Reference | Snapshot | Spec |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Mejor oferta/demanda e impresiones de operaciones para perps de Hyperliquid | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Libro completo orden por orden para perps de Hyperliquid | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | Mejor oferta/demanda e impresiones de operaciones para perps de trade.xyz | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | Libro completo orden por orden para perps de trade.xyz | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

Cada feed tiene su propia dirección de grupo multicast. Puertos: reference = market + `1`; snapshot (solo MBO) = market + `2`. Recomendamos vincular market y reference juntos; para MBO, también vincular snapshot.

También puedes ver pequeños paquetes UDP en el puerto `5765` en `doublezero1` — son heartbeats de DoubleZero, no datos de mercado.

Los frames son binarios de tamaño fijo en little-endian. Los perps nativos de Hyperliquid usan `source_id=1`; los perps de trade.xyz usan `source_id=7`.

---

## Decodificar el feed {#decode-the-feed}

!!! note "Edge Connect"
    Si estás usando `doublezero-edge-connect`, el feed ya está decodificado como JSON sobre WebSocket — omite la decodificación manual.

**Usar un parser de referencia**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) incluye suscriptores multicast que decodifican el formato de cable y lo republican como JSON en un socket Unix:

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) para Top-of-Book y Trades
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) para Market-by-Order

Consulta el [README principal](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines) para ver el pipeline completo.

**Escribir tu propio decodificador**

Decodifica según [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Comienza con el encabezado del frame, luego los layouts de mensaje para el feed que estás recibiendo.

**Encabezado del túnel GRE — XDP**

El tráfico de datos de mercado entregado a través de la red está encapsulado en GRE en la última milla. En `doublezero1`, el cliente presenta multicast UDP plano. Si terminas GRE tú mismo (por ejemplo, un pipeline XDP), elimina el encabezado GRE antes de alimentar los datos a tu decodificador. Consulta [`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap).

---

## Resolución de problemas

Si encuentras un problema no cubierto aquí, por favor comunícate a través de tu canal existente antes de intentar solucionarlo por tu cuenta. Si no tienes un canal, consulta [Soporte](../support.md).

**Asegúrate de que tu cliente esté actualizado**


```bash
sudo apt update && sudo apt install doublezero
```

**El túnel no se levanta**


1. **Edge Connect:** ejecuta status en el contenedor — `docker exec doublezero-edge-connect doublezero status`. El `doublezero status` del host frecuentemente falla mientras el feed está bien (el contenedor controla el daemon). Confirma que el `doublezerod` del host está detenido.
2. **Nativo:** verifica que el daemon del host esté ejecutándose: `sudo systemctl status doublezerod`
3. Verifica que las reglas de firewall estén configuradas (GRE, BGP, PIM, puertos UDP de Hyperliquid y `5765` en `doublezero1`)
4. Confirma que la factura de este asiento está pagada y que la fecha de inicio ha pasado
5. Ejecuta connect en el camino que elegiste ([4a](#4a-edge-connect) o [4b](#4b-native-multicast)) con la clave que coincide con la página de cuentas
6. Espera `BGP Session Up` desde el mismo lugar donde ejecutaste connect (contenedor o host)

**Sin paquetes después de suscribirse**


1. Confirma que estás suscrito: `doublezero user list`
2. Confirma que el feed aparece en tus grupos: `doublezero multicast group list`
3. Captura en el túnel, por ejemplo Hyperliquid TOB: `sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. Preferiblemente vincula market y reference juntos (y snapshot para MBO) para el feed que deseas

**Feed comprado faltante (Edge Connect)**

Si un feed comprado no aparece en `doublezero status`, suscríbete dentro del contenedor:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-code>
```

Múltiples feeds, separados por espacios:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

**Asiento expirado o eliminado**


Los asientos son mensuales. Si la factura no se paga antes de la expiración, el asiento se elimina y el túnel no se mantendrá activo.

**"Multicast user already exists"**


Ya tienes una suscripción activa a través de un camino diferente. Desconéctate primero, luego reintenta la conexión:

- **Edge Connect:** `docker exec doublezero-edge-connect doublezero disconnect`
- **Nativo:** `doublezero disconnect`

Luego reintenta `doublezero connect multicast --subscribe-feed <feed-code>` en el mismo camino (contenedor o host).

**Específico de AWS**


Deshabilita la verificación de origen/destino en la ENI de la instancia. Sin esto, el multicast encapsulado en GRE puede ser descartado.