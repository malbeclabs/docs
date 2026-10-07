---
description: Obtén datos de mercado de Binance Spot y futuros USD-M en DoubleZero Edge — Edge Connect o multicast nativo.
---

# Conexión de suscriptor Binance Edge

!!! warning "Al conectarme a DoubleZero acepto los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol). Ten en cuenta que los datos son exclusivamente para tu uso interno y no pueden ser retransmitidos (ver Sección 2(e))."

Los feeds de Binance entregan datos de mercado top-of-book de Binance a través de la red DoubleZero Edge como multicast UDP. Los datos se ingieren desde Binance en Tokio y se transportan por la fibra dedicada de DoubleZero, por lo que llegan a otras metros antes de lo que los entrega el internet público. Binance es donde ocurre el descubrimiento de precios para muchos pares spot, por lo que sus datos son un indicador adelantado para otros mercados.

Hay dos feeds, uno por cada motor de matching de Binance:

| Feed | Instrumentos | Timestamp de cotización |
|------|-------------|-----------------|
| Binance Spot | Todos los pares spot en negociación, incluidos los pares cotizados en fiat | Hora de envío del gateway, precisión de µs |
| Binance USD-M | Perpetuos cotizados en USDT y USDC. No se incluyen los futuros con vencimiento ni los perpetuos TradFi | Hora del motor de matching, precisión de ms |

El conjunto de instrumentos sigue los listados de Binance: los pares y contratos se añaden y eliminan a medida que entran y salen de negociación.

## Precios {#pricing}

Los feeds se facturan **por mes**:

| Feed | Precio |
|------|-------|
| Binance Spot | $100 / mes |
| Binance USD-M | $100 / mes |

## ¿Qué ruta debo tomar? {#which-path-should-i-take}

| # | Ruta | Ideal para | Esfuerzo |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agentes y aplicaciones que desean un CLI simple y JSON decodificado sobre WebSocket | Mínimo |
| **2** | [Multicast nativo](#2-native-multicast-advanced) | Construir tu propio decodificador contra el formato binario crudo | Máximo |

Antes de cualquier ruta: adquiere los feeds que necesites en [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Al comprar, aceptas los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol).

---

## 1. Edge Connect (recomendado) {#1-edge-connect-recommended}

**Empieza aquí.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) es la ruta amigable para agentes: un solo comando de instalación, el host se une a DoubleZero, y tu aplicación consume **JSON decodificado sobre WebSocket** (`ws://<host>:8081`) en lugar de decodificar multicast binario.

Edge Connect satisface las necesidades de su creciente base de usuarios. Este es el método de conexión más sencillo y debe usarse a menos que tengas una necesidad técnica específica.

Versión corta:

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

El instalador solicita tu secreto: un token de acceso `DZ_…` **o** la ruta al archivo JSON del keypair de Solana que posee tu pase de acceso / compra de feed.

Si ya se está ejecutando un `doublezerod` en el host, tanto este como el daemon propio del contenedor intentan vincular el puerto UDP `44880`, por lo que el daemon del contenedor se detiene inmediatamente después de iniciar. El instalador ofrece detener y deshabilitar el daemon del host, y lo hace sin preguntar cuando se establece `DZ_ASSUME_YES=1`. Para hacerlo manualmente:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Luego verifica el estado **dentro del contenedor** (espera `BGP Session Up` y tu grupo de Binance) y conecta un cliente WebSocket al puerto `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

Cada mensaje de Binance en el WebSocket lleva `"source_name":"BINANCE"`. Los motores comparten ese nombre, así que distínguelos por `source_id`: `8` es Spot y `6` es USD-M. El mismo símbolo puede existir en ambos — `BTCUSDT` es un par spot en uno y un perpetuo en el otro — y los instrument IDs se asignan por motor, así que usa `source_id` como clave además del símbolo o el instrument ID.

**Contrato WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avanzado) {#2-native-multicast-advanced}

!!! warning "Se requiere conocimiento técnico avanzado"
    Multicast nativo significa que tú mismo te unes al grupo y decodificas el formato binario **crudo** de Edge en tu host. Solo los usuarios con mayor capacidad técnica deberían tomar esta ruta. Necesitarás leer y comprender las especificaciones, empezando por [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) y el resto de [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefiere [Edge Connect](#1-edge-connect-recommended) a menos que tengas un requisito estricto de poseer el decodificador.

### Configuración del cliente DoubleZero {#doublezero-client-setup}

Sigue las instrucciones de [configuración](setup.md) para instalar y configurar el cliente DoubleZero. Mantén el cliente actualizado:

```bash
sudo apt update && sudo apt install doublezero
```

### Comprar un feed {#buy-a-feed}

Con `doublezerod` en ejecución, identifica el dispositivo de menor latencia antes de comprar:

```bash
doublezero latency
```

Compra en [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configurar el firewall {#configure-the-firewall}

Permite GRE, BGP, PIM y el tráfico de los feeds de Binance. Ambos feeds publican datos de mercado en UDP `30001` y datos de referencia en `30002`; se distinguen por grupo multicast, no por puerto. Ver [Direcciones de feeds](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Binance market / reference (both feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30001:30002 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Binance market / reference (both feeds)
sudo ufw allow in on doublezero1 to any port 30001:30002 proto udp
```

UFW no tiene protocolo `pim`. El PIM saliente está permitido por la política de salida predeterminada de UFW; si deniegas el tráfico saliente, añade una regla raw para PIM en `/etc/ufw/before.rules`.

### Suscribirse {#subscribe}

Únete a cada feed que hayas comprado (cliente v0.35.0 o posterior):

```bash
doublezero connect multicast
```

Suscribirse por código de grupo con `--subscribe` falla con un pase comprado.

Espera `✅  User Provisioned`. Espera unos 60 segundos, luego:

```bash
doublezero status
```

Espera `BGP Session Up` en la red DoubleZero correcta.

```bash
doublezero user list --client-ip <your ip>
```

Tus feeds aparecen en la columna `groups`. Inspecciona las IPs de grupo con:

```bash
doublezero multicast group list
```

### Decodificar el formato binario tú mismo {#decode-the-wire-yourself}

La versión del esquema es **`3`** — descarta los datagramas cuya versión tu decodificador no implemente. Diseños autoritativos: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluyendo [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md), el [Registro de Source ID](https://github.com/malbeclabs/edge-feed-spec/blob/main/sources/spec.md) y el [GLOSARIO](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md).

Cada datagrama comienza con un encabezado de datagrama de 24 bytes, seguido de uno o más mensajes de aplicación empaquetados hasta el MTU. Los datagramas son little-endian y de diseño fijo.

| Campo | Notas |
|-------|-------|
| Magic | `u16` en el offset 0: `0x445A`. Valídalo. |
| Versión del esquema | `3` |
| Channel ID | Spot usa el canal `1`, USD-M el canal `0` |
| Sequence | Monotónico por dirección IP de origen, Channel ID y puerto de destino — cada puerto tiene su propia serie. Úsalo para detección de brechas. |
| Send timestamp | Nanosegundos desde la época Unix |
| Message count | Mensajes empaquetados en este datagrama |
| Reset count | Cualquier cambio (incluyendo el salto `255` → `0`) es un reinicio; descarta el estado del canal de ese publicador. |
| Datagram length | Bytes totales |

#### Mensajes de aplicación {#application-messages}

| Tipo | ID | Tamaño | Puerto | Contenido |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | Señal de vida mientras el mercado está en calma |
| InstrumentDefinition | `0x02` | 130 B | reference | Símbolo, exponentes, tick y lote, expiración |
| Quote | `0x03` | 60 B | market | Mejor bid y ask, precio y tamaño, flags de actualización |
| Trade | `0x04` | 52 B | market | Precio, tamaño, lado agresor, ID de operación |
| EndOfSession | `0x06` | 12 B | market | Cierre limpio |
| ManifestSummary | `0x07` | 24 B | reference | Flag de validez, contador de cambio Manifest Seq, cantidad de instrumentos, timestamp |

**El Source ID es la clave del motor.** Ambos feeds usan el código de venue `BINANCE`, pero cada motor tiene su propio Source ID en el registro de edge-feed-spec: `8` Binance Spot, `6` Binance USD-Margined Futures. Los motores listan símbolos superpuestos (`BTCUSDT` es tanto un par spot como un perpetuo USD-M), y cada motor asigna instrument IDs de forma independiente, por lo que el mismo instrument ID puede aparecer en ambos feeds para instrumentos distintos. Usa **(Source ID, instrument ID)** como clave de instrumentos y libros, nunca solo el símbolo o el instrument ID. Lee `price_exponent` y `qty_exponent` de cada `InstrumentDefinition` — no los codifiques directamente. El exponente es la precisión del precio, no el tick: el incremento negociable es `tick_size × 10^price_exponent`.

La entrega es UDP fire-and-forget sin retransmisión, y el puerto de datos de referencia no repara datos de mercado: solo repite `InstrumentDefinition` (al menos una vez cada 30 s en ambos feeds) y `ManifestSummary` (al menos una vez cada 1 s en USD-M, cada 5 s en Spot). Un Quote perdido permanece perdido hasta que el mejor bid o ask de ese instrumento cambie. Deduplica operaciones por **(Source ID, instrument ID, trade ID)**, nunca solo por trade ID.

Binance consolida las actualizaciones del mejor bid y ask antes de que lleguen al feed: bajo carga, una actualización superada de un símbolo se descarta en favor de la más reciente. Recibir menos cotizaciones que cambios en el libro es un comportamiento normal del venue, no una pérdida — usa el número de secuencia del datagrama para detectar pérdidas.

Detalles de los datos de referencia que difieren de lo que un decodificador podría suponer:

- **Timestamps.** `Quote` y `Trade` de USD-M llevan la hora del motor de matching, con precisión de milisegundos. `Quote` de Spot lleva la hora de envío del gateway y `Trade` de Spot la hora de ejecución, ambos con precisión de microsegundos. Todos se expresan en nanosegundos en el formato binario.
- **`Leg1` tiene 8 bytes.** Los activos base más largos (por ejemplo `1000FLOKI` o `BROCCOLI714`) se truncan; el nombre completo siempre está en `Symbol`.
- **No todos los símbolos son ASCII.** Algunos perpetuos USD-M tienen nombres en chino, y sus `Symbol` y `Leg1` llevan bytes UTF-8. No asumas ASCII al decodificar estos campos.
- **`Expiry` es `0`** en todos los instrumentos USD-M, ya que todos son perpetuos.
- **`Bid Source Count` y `Ask Source Count` siempre son `0`.** Binance no publica la cantidad de órdenes en el mejor nivel.
- **USD-M excluye las órdenes Retail Price Improvement (RPI)** del mejor bid y ask, por lo que puede diferir de un snapshot de profundidad que las incluya.

---

## Direcciones de feeds {#feed-addresses}

| Código de grupo | Motor | Source ID | Channel ID | Grupo multicast | Datos de mercado | Datos de referencia |
|------------|--------|-----------|------------|-----------------|-------------|----------------|
| `edge-binance-spot-tob` | Spot | `8` | `1` | `233.84.178.31` | `30001` | `30002` |
| `edge-binance-usdsm-tob` | Perpetuos USD-M | `6` | `0` | `233.84.178.23` | `30001` | `30002` |

`doublezero status` y `multicast group list` muestran el código de grupo.

El grupo selecciona el feed; el puerto selecciona datos de mercado o datos de referencia dentro de él. La replicación multicast ocurre por dirección IP de origen y grupo, y la estructura de red nunca inspecciona el puerto UDP, por lo que unirse a un grupo entrega todo en ese grupo a través de tu túnel DoubleZero. El puerto es un filtro de socket aplicado en tu propio host después de que llegan los bytes. Como los feeds comparten puertos, un socket vinculado a `30001` en un host unido a ambos grupos de Binance recibe ambos; filtra por el grupo de destino o por Source ID.

---

## Solución de problemas {#troubleshooting}

Si encuentras un problema no cubierto aquí, comunícate a través de tu canal existente antes de intentar resolverlo por tu cuenta. Si no tienes un canal, consulta [Soporte](support/index.md).

### Asegúrate de que tu cliente esté actualizado {#ensure-your-client-is-up-to-date}

Ejecuta: `sudo apt update && sudo apt install doublezero`

### No llegan datagramas {#no-datagrams-arriving}

1. Confirma que el feed fue comprado en [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un feed no comprado no entrega tráfico.
2. Confirma que BGP está activo: `doublezero status` debe mostrar `BGP Session Up` en la red DoubleZero correcta.
3. Confirma que la suscripción está activa: `doublezero user list --client-ip <your ip>` debe listar el feed bajo `groups`.
4. Confirma que el grupo está unido en la interfaz correcta. El multicast llega en `doublezero1`, no en `doublezero0`.
5. Confirma que el firewall permite UDP `30001`–`30002` como entrada en `doublezero1`.

### Dos motores mezclados {#two-engines-mixed-together}

Spot y USD-M listan símbolos como `BTCUSDT`, asignan instrument IDs de forma independiente y comparten puertos. Un decodificador que usa solo el símbolo o el instrument ID como clave de los libros, o que vincula un único socket para todos los grupos sin comprobar el grupo de destino, fusiona dos instrumentos distintos en un solo libro. Usa el Source ID (o el grupo de destino) como clave además del instrument ID.

### Brechas de secuencia {#sequence-gaps}

Rastrea la secuencia por dirección IP de origen, Channel ID y puerto de destino; un decodificador que solo use Channel ID como clave verá brechas falsas. Una brecha real significa datagramas perdidos. No hay reparación: la cotización de un instrumento vuelve a estar actualizada una vez que su mejor bid o ask cambie nuevamente.

### Cambios en el reset count {#reset-count-changes}

Cualquier cambio en el reset count significa que el publicador reinició o re-sembró el canal. Descarta el estado para esa dirección IP de origen y canal, y recopila las definiciones del puerto de datos de referencia nuevamente.

### El túnel no se levanta {#tunnel-not-coming-up}

1. **Edge Connect:** ejecuta status dentro del contenedor — `docker exec doublezero-edge-connect doublezero status`. El `doublezero status` del host a menudo falla mientras el feed está funcionando bien (el contenedor posee el daemon). Confirma que el `doublezerod` del host está detenido.
2. **Nativo:** verifica que el daemon del host está en ejecución: `sudo systemctl status doublezerod`
3. Verifica que las reglas de firewall estén configuradas (GRE, BGP, PIM y los puertos del feed en `doublezero1`)
4. Verifica el estado de la conexión desde el mismo lugar donde te conectaste (contenedor o host) — espera `BGP Session Up` en la red DoubleZero correcta

La IP del cliente se descubre automáticamente desde la IP pública de tu host. Verifica que coincida con la IP que usaste al comprar el feed.

---

## Diseño de referencia para investigación {#research-reference-design}

Opcional. Si ya tienes un túnel DoubleZero y una suscripción en el host y deseas **grabar y graficar** datos del feed, el diseño de referencia para investigación ejecuta multicast → parser → topofbook-bot → ClickHouse → Grafana con Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Esto apunta la demo a Binance Spot. Para otro feed, usa su grupo de [Direcciones de feeds](#feed-addresses):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.31/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=30001/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=30002/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana normalmente está en `http://localhost:3000` en el host. Detalles y dashboards: el [README de la demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Esto visualiza datos que ya estás recibiendo. No reemplaza la compra del feed, la suscripción ni ninguna de las rutas de conexión anteriores.
