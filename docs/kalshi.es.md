---
description: Obtén datos de mercado de Kalshi en DoubleZero Edge — Edge Connect o multicast nativo.
---

# Conexión de suscriptor Kalshi Edge

!!! warning "Al conectarme a DoubleZero acepto los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol). Ten en cuenta que los datos son exclusivamente para tu uso interno y no pueden ser retransmitidos (ver Sección 2(e))."

Los feeds de Kalshi entregan datos de mercado de perps y deportes a través de la red DoubleZero Edge como multicast UDP. Hay cuatro feeds:

- perps Top of Book (TOB)
- perps Market by Price (MBP)
- deportes Top of Book (TOB)
- deportes Market by Price (MBP)

## ¿Qué ruta debo tomar?

| # | Ruta | Ideal para | Esfuerzo |
|---|------|------------|----------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agentes y aplicaciones que desean un CLI simple y JSON decodificado sobre WebSocket | Mínimo |
| **2** | [Multicast nativo](#2-native-multicast-advanced) | Construir tu propio decodificador contra el formato binario crudo | Máximo |

Antes de cualquier ruta: adquiere los feeds que necesites en [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Al comprar, aceptas los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol) y los [Términos de Servicio de Kalshi](https://doublezero.xyz/dz-edge-kalshi-terms).

¿Quieres que una IA te ayude con la instalación? Conecta el [DoubleZero MCP](mcp.md) y pídele que te guíe a través de Kalshi / Edge Connect.

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

Luego verifica el estado **dentro del contenedor** (espera `BGP Session Up` y tu grupo de Kalshi) y conecta un cliente WebSocket al puerto `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

**Pasos completos, verificación y problemas comunes:** conecta el [DoubleZero MCP](mcp.md) y pídele que te guíe a través de Edge Connect para Kalshi.  
**Contrato WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avanzado) {#2-native-multicast-advanced}

!!! warning "Se requiere conocimiento técnico avanzado"
    Multicast nativo significa que tú mismo te unes al grupo y decodificas el formato binario **crudo** de Edge en tu host. Solo los usuarios con mayor capacidad técnica deberían tomar esta ruta. Necesitarás leer y comprender las especificaciones, empezando por [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) y el resto de [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefiere [Edge Connect](#1-edge-connect-recommended) a menos que tengas un requisito estricto de poseer el decodificador.

### Configuración del cliente DoubleZero

Sigue las instrucciones de [configuración](setup.md) para instalar y configurar el cliente DoubleZero. Mantén el cliente actualizado:

```bash
sudo apt update && sudo apt install doublezero
```

### Comprar un feed

Con `doublezerod` en ejecución, identifica el dispositivo de menor latencia antes de comprar:

```bash
doublezero latency
```

Compra en [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configurar el firewall

Permite GRE, BGP, PIM y el tráfico del feed de Kalshi. Los puertos UDP de Kalshi están en el rango `30000`–`59999`: el primer dígito es la clase de tráfico (`3` datos de mercado, `4` datos de referencia, `5` snapshot) y el segundo dígito es el feed, por lo que referencia siempre es mercado + `10000` y snapshot siempre es mercado + `20000`. Abre toda la banda en `doublezero1` para que nuevos canales y feeds no requieran otro cambio de firewall — ver [Direcciones de feeds](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi market / reference / snapshot (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```


**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Kalshi market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

UFW no tiene protocolo `pim`. El PIM saliente está permitido por la política de salida predeterminada de UFW; si deniegan el tráfico saliente, añade una regla raw para PIM en `/etc/ufw/before.rules`.


### Suscribirse

Únete a cada feed que hayas comprado (cliente v0.35.0 o posterior):

```bash
doublezero connect multicast
```

O nombra los feeds por **código de feed**, separados por espacios:

```bash
doublezero connect multicast --subscribe-feed kalshi-perps-tob kalshi-perps-mbp kalshi-sports-tob kalshi-sports-mbp
```

Usa los códigos de feed (`kalshi-…`), no los nombres de feed por metro ni los códigos de grupo (`edge-kalshi-…`). Suscribirse por código de grupo con `--subscribe` falla con un pase comprado.

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


### Decodificar el formato binario tú mismo

La versión del esquema es **`3`** — descarta los datagramas cuya versión tu decodificador no implemente. Diseños autoritativos: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluyendo [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md).

Cada datagrama comienza con un encabezado de datagrama de 24 bytes, seguido de uno o más mensajes de aplicación empaquetados hasta el MTU. Los datagramas son little-endian y de diseño fijo.

| Campo | Notas |
|-------|-------|
| Magic | `u16` en el offset 0: `0x445A` en TOB, `0x4442` en MBP. Valídalo. |
| Versión del esquema | `3` |
| Channel ID | Demultiplexa canales que comparten un puerto |
| Sequence | Monotónico por dirección IP de origen, Channel ID y puerto de destino — cada puerto tiene su propia serie. Úsalo para detección de brechas. |
| Send timestamp | Nanosegundos desde la época Unix |
| Message count | Mensajes empaquetados en este datagrama |
| Reset count | Cualquier cambio (incluyendo el salto `255` → `0`) es un reinicio; descarta el estado del canal de ese publicador. MBP también puede incrementarlo a mitad de sesión en una re-siembra a nivel de venue. |
| Datagram length | Bytes totales |

#### Mensajes de aplicación (TOB)

| Tipo | ID | Tamaño | Puerto | Contenido |
|------|----|--------|--------|-----------|
| Heartbeat | `0x01` | 16 B | market | Señal de vida mientras el mercado está en calma |
| InstrumentDefinition | `0x02` | 130 B | reference | Símbolo, exponentes, tick y lote, expiración |
| Quote | `0x03` | 60 B | market | Mejor bid y ask, precio y tamaño, flags de actualización |
| Trade | `0x04` | 52 B | market | Precio, tamaño, lado agresor, ID de operación |
| EndOfSession | `0x06` | 12 B | market | Cierre limpio |
| ManifestSummary | `0x07` | 24 B | reference | Flag de validez, contador de cambio Manifest Seq, cantidad de instrumentos, timestamp |
| PerpStats | `0x30` | 124 B | sibling | Funding, precios mark y oracle, interés abierto, volumen diario |

El Source ID de Kalshi en el registro de edge-feed-spec es `3`. Lee `price_exponent` y `qty_exponent` de cada `InstrumentDefinition` — no los codifiques directamente.

Los feeds MBP usan el conjunto de mensajes market-by-price. Consulta las especificaciones de market-by-price y reference-data en edge-feed-spec.

La entrega es UDP fire-and-forget sin retransmisión, y el puerto de datos de referencia no repara datos de mercado: solo repite `InstrumentDefinition` (al menos una vez cada 30 s) y `ManifestSummary` (al menos una vez cada 1 s). Un Quote TOB perdido permanece perdido hasta que el mejor bid o ask de ese mercado cambie. Solo los feeds MBP tienen una ruta de reparación — el ciclo de snapshot — y un arranque en frío de MBP debe vincular el puerto de snapshot. Deduplica operaciones por **(instrument ID, trade ID)**, nunca solo por trade ID.

---

## Direcciones de feeds {#feed-addresses}

| Código de feed | Código de grupo | Descripción | Grupo multicast | Datos de mercado | Datos de referencia | Snapshot |
|----------------|-----------------|-------------|-----------------|------------------|---------------------|----------|
| `kalshi-perps-tob` | `edge-kalshi-perps-tob` | Perps top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `kalshi-perps-mbp` | `edge-kalshi-perps-mbp` | Perps market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `kalshi-sports-tob` | `edge-kalshi-sports-tob` | Deportes top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `kalshi-sports-mbp` | `edge-kalshi-sports-mbp` | Deportes market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

Suscríbete con el código de feed; `doublezero status` y `multicast group list` muestran el código de grupo.

Esquema de puertos: el primer dígito es la clase de tráfico (`3` mercado, `4` referencia, `5` snapshot); el segundo dígito es el feed. Referencia es mercado + `10000`; snapshot es mercado + `20000`. Los puertos de perps son fijos. Los puertos de deportes son `base + channel id` (por ejemplo, id `10` en `edge-kalshi-sports-mbp` usa `34010` / `44010` / `54010`).

El grupo selecciona el feed; el puerto selecciona datos de mercado, datos de referencia o snapshot dentro de él. La replicación multicast ocurre por dirección IP de origen y grupo, y la estructura de red nunca inspecciona el puerto UDP, por lo que unirse a un grupo entrega todo en ese grupo a través de tu túnel DoubleZero. El puerto es un filtro de socket aplicado en tu propio host después de que llegan los bytes.

---

## Solución de problemas

Si encuentras un problema no cubierto aquí, comunícate a través de tu canal existente antes de intentar resolverlo por tu cuenta. Si no tienes un canal, consulta [Soporte](support.md).

### Asegúrate de que tu cliente esté actualizado

Ejecuta: `sudo apt update && sudo apt install doublezero`

### No llegan datagramas

1. Confirma que el feed fue comprado en [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un feed no comprado no entrega tráfico.
2. Confirma que BGP está activo: `doublezero status` debe mostrar `BGP Session Up` en la red DoubleZero correcta.
3. Confirma que la suscripción está activa: `doublezero user list --client-ip <your ip>` debe listar el feed bajo `groups`.
4. Confirma que el grupo está unido en la interfaz correcta. El multicast llega en `doublezero1`, no en `doublezero0`.
5. Confirma que el firewall permite los puertos UDP del feed como entrada en `doublezero1`.

### Brechas de secuencia

Rastrea la secuencia por dirección IP de origen, Channel ID y puerto de destino; un decodificador que solo use Channel ID como clave verá brechas falsas. Una brecha real significa datagramas perdidos. En feeds MBP, los mercados afectados se recuperan del siguiente ciclo de snapshot. En feeds TOB no hay reparación: la cotización de un mercado vuelve a estar actualizada una vez que su mejor bid o ask cambie nuevamente.

### Cambios en el reset count

Cualquier cambio en el reset count significa que el publicador reinició o re-sembró el canal. Descarta el estado para esa dirección IP de origen y canal, recopila las definiciones del puerto de datos de referencia nuevamente, y en feeds MBP reconstruye los libros desde el puerto de snapshot.

### El túnel no se levanta

1. **Edge Connect:** ejecuta status dentro del contenedor — `docker exec doublezero-edge-connect doublezero status`. El `doublezero status` del host a menudo falla mientras el feed está funcionando bien (el contenedor posee el daemon). Confirma que el `doublezerod` del host está detenido.
2. **Nativo:** verifica que el daemon del host está en ejecución: `sudo systemctl status doublezerod`
3. Verifica que las reglas de firewall estén configuradas (GRE, BGP, PIM y los puertos del feed en `doublezero1`)
4. Verifica el estado de la conexión desde el mismo lugar donde te conectaste (contenedor o host) — espera `BGP Session Up` en la red DoubleZero correcta

La IP del cliente se descubre automáticamente desde la IP pública de tu host. Verifica que coincida con la IP que usaste al comprar el feed.

---

## Diseño de referencia para investigación

Opcional. Si ya tienes un túnel DoubleZero y una suscripción en el host y deseas **grabar y graficar** datos del feed, el diseño de referencia para investigación ejecuta multicast → parser → topofbook-bot → ClickHouse → Grafana con Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Esto apunta la demo a Kalshi perps TOB. Para otro feed, usa su grupo y puertos de [Direcciones de feeds](#feed-addresses):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.3/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=31000/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=41000/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana normalmente está en `http://localhost:3000` en el host. Detalles y dashboards: el [README de la demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Esto visualiza datos que ya estás recibiendo. No reemplaza la compra del feed, la suscripción ni ninguna de las rutas de conexión anteriores.