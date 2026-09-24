---
description: "Suscríbase a los datos de mercado de Hyperliquid en DoubleZero Edge — configuración, metro, solicitud de feed y conexión tras aprobación."
---

# Suscribirse a Hyperliquid (Edge)

!!! warning "Al conectarme a DoubleZero acepto los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol). Tenga en cuenta que los datos son únicamente para uso interno y no pueden ser retransmitidos (véase la Sección 2(e))."

Los feeds de Hyperliquid entregan datos de mercado a través de DoubleZero Edge como multicast UDP. Cuatro feeds principales cubren los perps nativos de Hyperliquid (`hl`) y los perps de [trade.xyz](https://trade.xyz) (`xyz`):

| Feed | Descripción |
|------|-------------|
| `hyper-hl-tob` | Mejor oferta/demanda e impresiones de operaciones para perps de Hyperliquid |
| `hyper-hl-mbo` | Libro completo orden por orden para perps de Hyperliquid (adiciones, cancelaciones, ejecuciones) |
| `hyper-xyz-tob` | Mejor oferta/demanda e impresiones de operaciones para perps de trade.xyz |
| `hyper-xyz-mbo` | Libro completo orden por orden para perps de trade.xyz (adiciones, cancelaciones, ejecuciones) |

Descripción general del servicio: [Hyperliquid](/hyperliquid/).

## ¿Qué camino debo tomar?

| Modo | Qué obtiene | Cuándo usarlo |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — decodificación + WebSocket JSON normalizado | Lo más rápido para obtener un flujo de cotizaciones utilizable |
| **Multicast nativo** | Suscripción en `doublezero1`, decodificación binaria UDP por cuenta propia (o con parsers de referencia) | Control total del cable |

Pasos compartidos primero: firewall, metro, solicitud y pago (Pasos 1–3). Tras la aprobación, el [Paso 4](#step-4-connect-after-approval) se divide — **Edge Connect** o **nativo**. No los mezcle en el mismo host.

¿Quiere que una IA realice la instalación con usted? Conecte el [DoubleZero MCP](/mcp/) y pídale que le guíe a través de Hyperliquid Edge.

---

## Paso 1: Configuración de DoubleZero

**Configuración completa**


Siga las instrucciones de [configuración](/setup/) para instalar y configurar el cliente de DoubleZero en el host.

Si previamente configuró DoubleZero en el host para uso nativo, asegúrese de que el cliente esté actualizado:

```bash
sudo apt update && sudo apt install doublezero
```

**Configurar el Firewall**


Permita tráfico GRE, BGP, PIM y de feeds de Hyperliquid en `doublezero1`. Los puertos UDP de Hyperliquid están en el rango `20000`–`20999` (Top-of-Book y Market-by-Order de mercado, referencia y snapshot). También permita UDP `5765` para los heartbeats de DoubleZero en el túnel. Abra la banda de feeds para que nuevos feeds no requieran otro cambio de firewall. Consulte [Direcciones de feeds](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid mercado / referencia / snapshot (todos los feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 20000:20999 -j ACCEPT
# Heartbeats de DoubleZero
sudo iptables -A INPUT -i doublezero1 -p udp --dport 5765 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Hyperliquid mercado / referencia / snapshot (todos los feeds)
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# Heartbeats de DoubleZero
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

Puede restringir estas reglas únicamente a los puertos de los feeds a los que se suscriba (consulte [Direcciones de feeds](#feed-addresses)).

---

## Paso 2: Elegir un metro

Identifique la ubicación de menor latencia desde la máquina que recibirá el feed:

```bash
doublezero latency
```

Anote el metro / ciudad del resultado con menor latencia. Seleccionará esa ciudad en el formulario de solicitud. Consulte el [mapa de topología](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) para ver cómo se agrupan los metros.

**Precios**


Los feeds tienen precio según la región de entrega. El precio sigue a donde se entregan los datos, no donde está el comprador. Un paquete de Tokio entrega a receptores en Tokio; la entrega en otro lugar requiere el paquete Global. Se incluyen dos hosts receptores (IPs) por feed, por metro.

| Feed | Tokio /mes | Global /mes |
| --- | --- | --- |
| Hyperliquid perps Top-of-Book (L1) | $900 | $1,500 |
| Hyperliquid perps Market-by-Order (L4) | $3,000 | $5,000 |
| trade.xyz perps Top-of-Book (L1) | $900 | $1,500 |
| trade.xyz perps Market-by-Order (L4) | $3,000 | $5,000 |
| **Todos los feeds (paquete ~30% de descuento)** | **$5,500** | **$9,000** |

---

## Paso 3: Enviar solicitud

1. Vaya a [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Seleccione **Hyperliquid** y los feeds que necesita.
3. Seleccione la **ciudad** (metro) que necesita. Use la tabla anterior y `doublezero latency` para elegir.
4. Complete el formulario de solicitud.

Asignará un DoubleZero ID (clave existente, o genere una nueva) a cada solicitud de feed en la página de [cuentas](https://doublezero.xyz/shreds/account). La **clave privada correspondiente debe estar presente en la máquina que recibirá el feed** — no asigne una pubkey cuya clave privada no pueda mover a ese host.

Usted elige un **metro** y una **pubkey**. **No** vincula una IP pública en el momento de la solicitud. Durante la suscripción puede mover el acceso entre IPs **dentro de los metros elegidos**.

Se le contactará con más instrucciones de manera oportuna (espere **1-3 días hábiles**).

---

## Paso 4: Conectar tras la aprobación

Después de enviar la solicitud, recibirá una factura; una vez pagada, conéctese en cada máquina aprobada. El acceso se habilita en la fecha de inicio elegida. Elija **un** camino a continuación.

### 4a. Edge Connect

Si `doublezerod` ya está ejecutándose en el host (desde la [configuración](/setup/)), deténgalo primero — compite con el daemon del contenedor por el mismo túnel:

```bash
sudo systemctl stop doublezerod
```

Instale [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) **después** de la aprobación y el pago. El bridge se une a DoubleZero dentro de un contenedor `--network host` y sirve JSON normalizado en `ws://<host>:8081`.

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**Todos los comandos `doublezero` se ejecutan a través del contenedor**, no del CLI del host:

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    Puede crear un alias para facilitar los comandos al contenedor. Este ejemplo permite que `dz status` funcione igual que `doublezero status` dentro del contenedor:

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

Espere `BGP Session Up` y sus grupos `edge-hyper-…` suscritos.

Luego abra el WebSocket (`ws://127.0.0.1:8081`). Contrato: [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md). Guía completa: runbook [MCP](/mcp/) `hyperliquid-edge`.

### 4b. Multicast nativo

En el host que tiene la clave privada asignada (con `doublezerod` ejecutándose en el host), suscríbase a los feeds que compró:

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

Múltiples feeds, separados por espacios:

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

Verifique el túnel:

```bash
doublezero status
```

Espere `BGP Session Up` en la red DoubleZero correcta. Luego decodifique el cable por su cuenta — consulte [Decodificar el feed](#decode-the-feed).

---

## Facturación

Los asientos se cobran **mensualmente**. Esté atento a la fecha de expiración del asiento.

Necesita pagar la factura antes de que el asiento expire. **No pagar conlleva la eliminación del asiento.**

---

## Direcciones de feeds

La IP selecciona el grupo multicast. El puerto selecciona el flujo en ese grupo. Verifique los valores IP en vivo con:

```bash
doublezero multicast group list
```

| Feed | Descripción | Grupo multicast | Mercado | Referencia | Snapshot | Especificación |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Mejor oferta/demanda e impresiones de operaciones para perps de Hyperliquid | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Libro completo orden por orden para perps de Hyperliquid | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | Mejor oferta/demanda e impresiones de operaciones para perps de trade.xyz | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | Libro completo orden por orden para perps de trade.xyz | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

Cada feed tiene su propia dirección de grupo multicast. Puertos: referencia = mercado + `1`; snapshot (solo MBO) = mercado + `2`. Sugerimos vincular mercado y referencia juntos; para MBO, también vincule snapshot.

También puede ver pequeños paquetes UDP en el puerto `5765` en `doublezero1` — heartbeats de DoubleZero, no datos de mercado.

Los frames son binarios de tamaño fijo en little-endian. Los perps nativos de Hyperliquid usan `source_id=1`; los perps de trade.xyz usan `source_id=7`.

---

## Decodificar el feed

!!! note "Edge Connect"
    Si está usando `doublezero-edge-connect`, el feed ya está decodificado como JSON sobre WebSocket — omita la decodificación manual.

**Usar un parser de referencia**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) incluye suscriptores multicast que decodifican el formato del cable y lo republican como JSON en un socket Unix:

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) para Top-of-Book y Trades
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) para Market-by-Order

Consulte el [README principal](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines) para el pipeline completo.

**Escribir su propio decodificador**

Decodifique contra [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Comience con el encabezado del frame, luego los layouts de mensaje para el feed que está recibiendo.

**Encabezado del Túnel GRE — XDP**

El tráfico de datos de mercado entregado a través de la red está encapsulado en GRE en el último tramo. En `doublezero1`, el cliente presenta multicast UDP simple. Si termina GRE por su cuenta (por ejemplo, un pipeline XDP), elimine el encabezado GRE antes de alimentar los datos a su decodificador. Consulte [`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap).

---

## Solución de problemas

Si encuentra un problema no cubierto aquí, comuníquese a través de su canal existente antes de buscar soluciones alternativas. Si no tiene un canal, consulte [Soporte](/support/).

**Asegúrese de que su cliente esté actualizado**


```bash
sudo apt update && sudo apt install doublezero
```

**El túnel no se levanta**


1. **Edge Connect:** ejecute status en el contenedor — `docker exec doublezero-edge-connect doublezero status`. El `doublezero status` del host a menudo falla mientras el feed funciona correctamente (el contenedor es dueño del daemon). Confirme que `doublezerod` del host esté detenido.
2. **Nativo:** verifique que el daemon del host esté ejecutándose: `sudo systemctl status doublezerod`
3. Verifique que las reglas de firewall estén configuradas (GRE, BGP, PIM, puertos UDP de Hyperliquid y `5765` en `doublezero1`)
4. Confirme que la factura de este asiento esté pagada y que la fecha de inicio haya pasado
5. Ejecute connect en el camino que eligió ([4a](#4a-edge-connect) o [4b](#4b-native-multicast)) con la clave que coincide con la página de cuentas
6. Espere `BGP Session Up` desde el mismo lugar donde ejecutó connect (contenedor o host)

**Sin paquetes después de suscribirse**


1. Confirme que está suscrito: `doublezero user list`
2. Confirme que el feed aparece en sus grupos: `doublezero multicast group list`
3. Capture en el túnel, por ejemplo Hyperliquid TOB: `sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. Prefiera vincular mercado y referencia juntos (y snapshot para MBO) para el feed que desea

**Feed comprado faltante (Edge Connect)**

Si un feed comprado no aparece en `doublezero status`, suscríbase dentro del contenedor:

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


Ya tiene una suscripción activa a través de un camino diferente. Desconéctese primero, luego reintente la conexión:

- **Edge Connect:** `docker exec doublezero-edge-connect doublezero disconnect`
- **Nativo:** `doublezero disconnect`

Luego reintente `doublezero connect multicast --subscribe-feed <feed-code>` en el mismo camino (contenedor o host).

**Específico de AWS**


Desactive la verificación de origen/destino en la ENI de la instancia. Sin esto, el multicast encapsulado en GRE puede ser descartado.