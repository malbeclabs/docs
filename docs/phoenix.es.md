---
description: Obtén datos de mercado de perpetuos Phoenix en DoubleZero Edge — Edge Connect o multicast nativo.
---

# Conexión de suscriptor Phoenix Edge

!!! warning "Al conectarme a DoubleZero acepto los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol). Ten en cuenta que los datos son solo para tus fines internos y no pueden ser retransmitidos (ver Sección 2(e))."

Los feeds de Phoenix entregan datos de mercado de perpetuos Phoenix a través de la red DoubleZero Edge como multicast UDP. Hay dos feeds:

- Top of Book (TOB): mejor oferta de compra y venta, más impresiones de operaciones
- Market by Price (MBP): profundidad por nivel de precio, más impresiones de operaciones

## Precios {#pricing}

Los feeds se facturan **por mes**:

| Feed | Precio |
|------|--------|
| `phoenix-tob` | $50 / mes |
| `phoenix-mbp` | $100 / mes |

## ¿Qué camino debo tomar? {#which-path-should-i-take}

| # | Camino | Ideal para | Esfuerzo |
|---|--------|------------|----------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agentes y aplicaciones que desean un CLI simple y JSON decodificado sobre WebSocket | Mínimo |
| **2** | [Multicast nativo](#2-native-multicast-advanced) | Construir tu propio decodificador contra el formato binario en bruto | Máximo |

Antes de cualquier camino: compra los feeds que necesites en [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Al comprar, aceptas los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol).

---

## 1. Edge Connect (recomendado) {#1-edge-connect-recommended}

**Comienza aquí.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) es el camino amigable para agentes: un solo comando de instalación, el host se une a DoubleZero y tu aplicación consume **JSON decodificado sobre WebSocket** (`ws://<host>:8081`) en lugar de decodificar multicast binario.

Edge Connect satisface las necesidades de su creciente base de usuarios. Este es el método de conexión más fácil y debe utilizarse a menos que tengas una necesidad técnica específica.

Versión corta:

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

El instalador solicita tu secreto: un token de acceso `DZ_…` **o** la ruta al archivo JSON del keypair de Solana que posee tu pase de acceso / compra de feed.

Si un `doublezerod` del host ya está ejecutándose, tanto él como el demonio propio del contenedor intentan enlazar el puerto UDP `44880`, por lo que el demonio del contenedor se cierra justo después de iniciar. El instalador ofrece detener y deshabilitar el demonio del host, y lo hace sin preguntar cuando `DZ_ASSUME_YES=1` está configurado. Para hacerlo tú mismo:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Luego verifica el estado **dentro del contenedor** (espera `BGP Session Up` y tu grupo de Phoenix) y conecta un cliente WebSocket al `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

Edge Connect arbitra entre los publicadores de Phoenix, por lo que los clientes WebSocket ven una sola copia de cada actualización.

**Contrato WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avanzado) {#2-native-multicast-advanced}

!!! warning "Se requiere conocimiento técnico más profundo"
    Multicast nativo significa que tú mismo te unes al grupo y decodificas el formato **en bruto** del protocolo Edge en tu host. Solo los usuarios con mayor capacidad técnica deberían tomar este camino. Necesitarás leer y comprender las especificaciones, comenzando por [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) y el resto de [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefiere [Edge Connect](#1-edge-connect-recommended) a menos que tengas un requisito estricto de poseer el decodificador.

### Configuración del cliente DoubleZero {#doublezero-client-setup}

Sigue las instrucciones de [configuración](setup.md) para instalar y configurar el cliente DoubleZero. Mantén el cliente actualizado:

```bash
sudo apt update && sudo apt install doublezero
```

### Comprar un feed {#buy-a-feed}

Con `doublezerod` ejecutándose, identifica el dispositivo de menor latencia antes de comprar:

```bash
doublezero latency
```

Compra en [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configurar el firewall {#configure-the-firewall}

Permite GRE, BGP, PIM y el tráfico del feed de Phoenix. Los puertos UDP de Phoenix están en el rango `9201`–`9213`: `9201`/`9202` transportan datos de mercado y referencia de Top of Book, y `9211`/`9212`/`9213` transportan datos de mercado, referencia y snapshot de Market by Price. Ver [Direcciones de feeds](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Phoenix market / reference / snapshot (ambos feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 9201:9213 -j ACCEPT
```


**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Phoenix market / reference / snapshot (ambos feeds)
sudo ufw allow in on doublezero1 to any port 9201:9213 proto udp
```

UFW no tiene protocolo `pim`. El PIM de salida está permitido por la política de salida predeterminada de UFW; si denegas el tráfico saliente, agrega una regla raw para PIM en `/etc/ufw/before.rules`.


### Suscribirse {#subscribe}

Únete a cada feed que compraste (cliente v0.35.0 o posterior):

```bash
doublezero connect multicast
```

O nombra los feeds por **código de feed**:

```bash
doublezero connect multicast --subscribe-feed phoenix-tob phoenix-mbp
```

Usa los códigos de feed `phoenix-tob` / `phoenix-mbp`, no los nombres de feed por metro (como `phoenix-tob-cmh`) ni los códigos de grupo (`edge-phoenix-…`). Suscribirse por código de grupo con `--subscribe` falla con un pase comprado.

Espera `✅  User Provisioned`. Aguarda unos 60 segundos, luego:

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


### Decodificar el protocolo tú mismo {#decode-the-wire-yourself}

La versión del esquema es **`3`** — descarta datagramas cuya versión tu decodificador no implemente. Layouts autoritativos: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluyendo [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md), [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md), y el [GLOSSARY](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md).

Cada datagrama comienza con un encabezado de datagrama de 24 bytes, seguido de uno o más mensajes de aplicación empaquetados hasta el MTU. Los datagramas son little-endian y de layout fijo.

| Campo | Notas |
|-------|-------|
| Magic | `u16` en offset 0: `0x445A` en TOB, `0x4442` en MBP. Valídalo. |
| Versión de esquema | `3` |
| Channel ID | Ambos feeds de Phoenix usan el canal `1` |
| Secuencia | Monótona por dirección IP de origen, Channel ID y puerto de destino — cada puerto tiene su propia serie. Úsala para detección de huecos. |
| Marca de tiempo de envío | Nanosegundos desde la época Unix |
| Conteo de mensajes | Mensajes empaquetados en este datagrama |
| Conteo de resets | Cualquier cambio (incluyendo el wrap de `255` → `0`) es un reset; descarta el estado del canal de ese publicador. MBP también puede incrementarlo a mitad de sesión en un re-seed a nivel de venue. |
| Longitud del datagrama | Total de bytes |

**Más de un publicador envía cada feed de Phoenix**, en los mismos grupos, canal y puertos. Indexa todo el estado de canal e instrumento por la dirección IP de origen además del Channel ID, o las series de secuencia de dos publicadores se intercalarán en una sola. Un suscriptor nativo recibe una copia de cada operación por publicador.

#### Mensajes de aplicación (TOB) {#application-messages-tob}

| Tipo | ID | Tamaño | Puerto | Contenido |
|------|----|--------|--------|-----------|
| Heartbeat | `0x01` | 16 B | market | Señal de vida mientras el mercado está en calma |
| InstrumentDefinition | `0x02` | 130 B | reference | Símbolo, exponentes, tick y lote, vencimiento |
| Quote | `0x03` | 60 B | market | Mejor oferta de compra y venta, precio y tamaño, flags de actualización |
| Trade | `0x04` | 52 B | market | Precio, tamaño, lado agresor, ID de operación |
| EndOfSession | `0x06` | 12 B | market | Apagado limpio |
| ManifestSummary | `0x07` | 24 B | reference | Flag de validez, contador de cambio de Manifest Seq, conteo de instrumentos, marca de tiempo |

Phoenix no envía `0x08` (Liquidation). El Source ID de Phoenix en el registro de edge-feed-spec es `2`. Lee `price_exponent` y `qty_exponent` de cada `InstrumentDefinition` — no los codifiques de forma fija. El exponente es la precisión del precio, no el tick: BTC en Phoenix usa el exponente `-2` con un tamaño de tick de `100`, así que se mueve en dólares enteros.

El feed MBP usa el conjunto de mensajes de market-by-price. Consulta las especificaciones de market-by-price y reference-data en edge-feed-spec. Ambos feeds provienen del mismo proceso publicador, por lo que comparten IDs de instrumento, y el puerto de datos de mercado de MBP transporta las mismas impresiones de operaciones que TOB. Los IDs de operación de Phoenix son números de secuencia por mercado, así que deduplica operaciones por **(instrument ID, trade ID)**, nunca por trade ID solo.

La entrega es UDP fire-and-forget sin retransmisión, y el puerto de reference-data no repara datos de mercado: solo repite `InstrumentDefinition` (al menos una vez cada 30 s) y `ManifestSummary` (al menos una vez cada 1 s). Un Quote de TOB perdido permanece perdido hasta que el mejor bid o ask de ese mercado cambie. Solo MBP tiene un mecanismo de reparación — su ciclo de snapshots — y un inicio en frío de MBP debe enlazar el puerto de snapshot.

---

## Direcciones de feeds {#feed-addresses}

| Código de feed | Código de grupo | Descripción | Grupo multicast | Datos de mercado | Datos de referencia | Snapshot |
|----------------|-----------------|-------------|-----------------|------------------|---------------------|----------|
| `phoenix-tob` | `edge-phoenix-tob` | Top-of-book y operaciones de perpetuos | `233.84.178.24` | `9201` | `9202` | — |
| `phoenix-mbp` | `edge-phoenix-mbp` | Market-by-price de perpetuos | `233.84.178.25` | `9211` | `9212` | `9213` |

Suscríbete con el código de feed; `doublezero status` y `multicast group list` muestran el código de grupo.

El grupo selecciona el feed; el puerto selecciona datos de mercado, datos de referencia o snapshot dentro de él. La replicación multicast ocurre por dirección IP de origen y grupo, y la infraestructura nunca inspecciona el puerto UDP, por lo que unirse a un grupo entrega todo en ese grupo a través de tu túnel DoubleZero. El puerto es un filtro de socket aplicado en tu propio host después de que los bytes llegan.

---

## Solución de problemas {#troubleshooting}

Si encuentras un problema no cubierto aquí, por favor comunícate a través de tu canal existente antes de intentar solucionarlo por tu cuenta. Si no tienes un canal, consulta [Soporte](support/index.md).

### Asegúrate de que tu cliente esté actualizado {#ensure-your-client-is-up-to-date}

Ejecuta: `sudo apt update && sudo apt install doublezero`

### No llegan datagramas {#no-datagrams-arriving}

1. Confirma que el feed fue comprado en [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un feed no comprado no entrega tráfico.
2. Confirma que BGP está activo: `doublezero status` debe mostrar `BGP Session Up` en la red DoubleZero correcta.
3. Confirma que la suscripción está activa: `doublezero user list --client-ip <your ip>` debe listar el feed bajo `groups`.
4. Confirma que el grupo está unido en la interfaz correcta. El multicast llega por `doublezero1`, no por `doublezero0`.
5. Confirma que el firewall permite los puertos UDP del feed como tráfico entrante en `doublezero1`.

### Huecos de secuencia {#sequence-gaps}

Rastrea la secuencia por dirección IP de origen, Channel ID y puerto de destino; un decodificador indexado solo por Channel ID ve huecos falsos. Un hueco real significa datagramas descartados. En MBP, los mercados afectados se recuperan del siguiente ciclo de snapshots. En TOB no hay reparación: la cotización de un mercado vuelve a estar vigente una vez que su mejor bid o ask cambia nuevamente.

### Cambios en el conteo de resets {#reset-count-changes}

Cualquier cambio en el conteo de resets significa que el publicador reinició o realizó un re-seed del canal. Descarta el estado para esa dirección IP de origen y canal, recopila las definiciones del puerto de reference-data nuevamente, y en MBP reconstruye los libros desde el puerto de snapshots.

### El túnel no se establece {#tunnel-not-coming-up}

1. **Edge Connect:** ejecuta status dentro del contenedor — `docker exec doublezero-edge-connect doublezero status`. El `doublezero status` del host a menudo falla mientras el feed está bien (el contenedor posee el demonio). Confirma que el `doublezerod` del host esté detenido.
2. **Nativo:** verifica que el demonio del host esté ejecutándose: `sudo systemctl status doublezerod`
3. Verifica que las reglas del firewall estén en su lugar (GRE, BGP, PIM y los puertos del feed en `doublezero1`)
4. Comprueba el estado de conexión desde el mismo lugar donde te conectaste (contenedor o host) — espera `BGP Session Up` en la red DoubleZero correcta

La IP del cliente se descubre automáticamente desde la IP pública de tu host. Verifica que coincida con la IP que usaste al comprar el feed.

---

## Diseño de referencia para investigación {#research-reference-design}

Opcional. Si ya tienes un túnel DoubleZero y una suscripción en el host y deseas **grabar y graficar** datos del feed, el diseño de referencia para investigación ejecuta multicast → parser → topofbook-bot → ClickHouse → Grafana con Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Esto apunta la demo a Phoenix TOB (ver [Direcciones de feeds](#feed-addresses)):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.24/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=9201/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=9202/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana normalmente está en `http://localhost:3000` en el host. Detalles y dashboards: el [README de la demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Esto visualiza datos que ya estás recibiendo. No reemplaza la compra del feed, la suscripción ni ninguno de los caminos de conexión anteriores.