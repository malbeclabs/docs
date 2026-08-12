---
description: Obtén datos de mercado de Kalshi en DoubleZero Edge — Edge Connect o multicast nativo.
---

# Conexión de suscriptor a Kalshi Edge

!!! warning "Al conectarme a DoubleZero, acepto los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol). Ten en cuenta que los datos son solo para tus propósitos internos y no pueden ser retransmitidos (consulta la Sección 2(e))."

Los feeds de Kalshi entregan datos de mercado de perps y deportes a través de la red DoubleZero Edge como multicast UDP. Hay cuatro feeds:

- perps Top of Book (TOB)
- perps Market by Price (MBP)
- sports Top of Book (TOB)
- sports Market by Price (MBP)

## ¿Qué camino debo tomar?

Dos caminos. Prefiere Edge Connect a menos que necesites ser dueño del decodificador.

| # | Camino | Ideal para | Esfuerzo |
|---|--------|------------|----------|
| **1** | [Edge Connect](#1-edge-connect-recomendado) | Agentes y aplicaciones que desean un CLI simple y un WebSocket JSON normalizado | Mínimo |
| **2** | [Multicast nativo](#2-multicast-nativo-avanzado) | Construir tu propio decodificador contra el formato de cable crudo | Máximo |

Antes de cualquier camino: compra los feeds que necesites en [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Al comprar, aceptas los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol) y los [Términos de Servicio de Kalshi](https://doublezero.xyz/dz-edge-kalshi-terms).

¿Quieres que una IA te ayude con la instalación? Conecta el [DoubleZero MCP](mcp.md) y pídele que te guíe a través de Kalshi / Edge Connect.

---

## 1. Edge Connect (recomendado)

**Comienza aquí.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) es el camino orientado a agentes: un solo comando de instalación, el host se une a DoubleZero, y tu aplicación consume **JSON normalizado sobre WebSocket** (`ws://<host>:8081`) en lugar de decodificar multicast binario.

El equipo evoluciona Edge Connect para satisfacer las necesidades de su creciente base de usuarios. Este es el método de conexión más fácil, y debe usarse a menos que tengas una necesidad técnica específica.

Versión corta:

```bash
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

`DZ_SECRET` es un token de acceso `DZ_…` **o** la ruta al archivo JSON del keypair de Solana que posee tu pase de acceso / compra de feed.

Luego verifica `doublezero status` (espera `BGP Session Up` y tu grupo de Kalshi) y conecta un cliente WebSocket al puerto `:8081`.

**Pasos completos, verificación y consideraciones:** conecta el [DoubleZero MCP](mcp.md) y pídele que te guíe a través de Edge Connect para Kalshi.  
**Contrato del WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avanzado)

!!! warning "Se requiere conocimiento técnico profundo"
    Multicast nativo significa que te unes al grupo por tu cuenta y decodificas el formato de cable **crudo** de Edge en tu host. Solo los usuarios con mayor capacidad técnica deberían tomar este camino. Necesitarás leer y comprender las especificaciones, comenzando con [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) y el resto de [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefiere [Edge Connect](#1-edge-connect-recomendado) a menos que tengas un requisito estricto de ser dueño del decodificador.

### Comprar un feed

<div data-wizard-step="kalshi-buy-feed" markdown>

Identifica el dispositivo de menor latencia antes de comprar:

```bash
doublezero latency
```

Compra en [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

</div>

### Configuración del cliente DoubleZero

Sigue las instrucciones de [configuración](setup.md) para instalar y configurar el cliente DoubleZero. Mantén el cliente actualizado:

```bash
sudo apt update && sudo apt install doublezero
```

### Configurar el firewall

Permite GRE, BGP, PIM y el tráfico del feed de Kalshi. Los puertos UDP de Kalshi están en el rango `30000`–`59999`: el primer dígito es la clase de tráfico (`3` datos de mercado, `4` datos de referencia, `5` snapshot) y el segundo dígito es el feed, por lo que referencia siempre es mercado + `10000` y snapshot siempre es mercado + `20000`. Abre la banda completa en `doublezero1` para que nuevos canales y feeds no requieran otro cambio de firewall — consulta [Direcciones de feeds](#direcciones-de-feeds).

<div data-wizard-step="kalshi-firewall-iptables" markdown>

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi market / reference / snapshot (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```

</div>

<div data-wizard-step="kalshi-firewall-ufw" markdown>

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Kalshi market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

</div>

### Suscribirse

<div data-wizard-step="kalshi-subscribe" markdown>

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob
```

Múltiples feeds, separados por espacios:

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob edge-kalshi-perps-mbp edge-kalshi-sports-tob edge-kalshi-sports-mbp
```

Ejemplo de salida de aprovisionamiento:

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <your dz_id>
🔍  Provisioning User for IP: <your public ip>
    The Device has been selected: <the doublezero device you are connecting to>
    Service provisioned with status: ok
✅  User Provisioned
```

Espera aproximadamente 60 segundos, luego:

```bash
doublezero status
```

Espera `BGP Session Up` en la red DoubleZero correcta. Como suscriptor, tu IP de DoubleZero coincide con tu IP de origen del túnel (Tunnel Src IP).

```bash
doublezero user list --client-ip <your ip>
```

Tus feeds aparecen en la columna `groups`. Inspecciona las IPs de grupo con:

```bash
doublezero multicast group list
```

</div>

### Decodifica el cable tú mismo

La versión del esquema es **`3`** — descarta tramas cuya versión tu decodificador no implemente. Layouts autoritativos: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluyendo [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md).

Cada datagrama comienza con un encabezado de trama, seguido de uno o más mensajes de aplicación empaquetados hasta el MTU. Las tramas son little-endian y de layout fijo.

| Campo | Notas |
|-------|-------|
| Versión del esquema | `3` |
| Channel ID | Demultiplexa flujos que comparten un puerto |
| Secuencia | Monótona por canal — úsala para detección de gaps |
| Marca de tiempo de envío | Nanosegundos desde la época Unix |
| Conteo de mensajes | Mensajes empaquetados en esta trama |
| Conteo de reinicios | Avanza por sesión. Un incremento significa reinicio en frío de tu estado. |
| Longitud de trama | Total de bytes |

#### Mensajes de aplicación (TOB)

| Tipo | ID | Tamaño | Puerto | Contiene |
|------|----|--------|--------|----------|
| Heartbeat | `0x01` | 16 B | market | Señal de vida mientras el mercado está en calma |
| InstrumentDefinition | `0x02` | 130 B | reference | Símbolo, exponentes, tick y lote, expiración |
| Quote | `0x03` | 60 B | market | Mejor bid y ask, precio y tamaño, flags de actualización |
| Trade | `0x04` | 52 B | market | Precio, tamaño, lado agresor, ID de operación |
| ChannelReset | `0x05` | 12 B | ambos | Inicio o reinicio de sesión |
| EndOfSession | `0x06` | 12 B | ambos | Cierre limpio |
| ManifestSummary | `0x07` | 24 B | reference | Huella digital del conjunto activo y conteo de instrumentos |
| PerpStats | `0x30` | 124 B | sibling | Funding, precios mark y oracle, interés abierto, volumen diario |

El source ID de Kalshi en el registro de edge-feed-spec es `3`. Lee `price_exponent` y `qty_exponent` de cada `InstrumentDefinition` — no los codifiques de forma fija.

Los feeds MBP usan el conjunto de mensajes market-by-price. Consulta las especificaciones de market-by-price y reference-data en edge-feed-spec.

La entrega es UDP fire-and-forget sin retransmisión. Recupera datagramas perdidos del ciclo de reference-data (y del plano de snapshot en feeds MBP), que se re-emite en una cadencia en lugar de una sola vez.

---

## Direcciones de feeds

| Feed | Descripción | Grupo multicast | Datos de mercado | Datos de referencia | Snapshot |
|------|-------------|-----------------|------------------|---------------------|----------|
| `edge-kalshi-perps-tob` | Perps top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | Perps market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | Sports top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `edge-kalshi-sports-mbp` | Sports market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

Esquema de puertos: el primer dígito es la clase de tráfico (`3` mercado, `4` referencia, `5` snapshot); el segundo dígito es el feed. Referencia es mercado + `10000`; snapshot es mercado + `20000`. Los puertos de perps son fijos. Los puertos de sports son `base + channel id` (por ejemplo, id `10` en `edge-kalshi-sports-mbp` usa `34010` / `44010` / `54010`).

El grupo selecciona el feed; el puerto selecciona datos de mercado, datos de referencia o snapshot dentro de él. La replicación multicast ocurre por fuente y grupo, y la fabric nunca inspecciona el puerto UDP, por lo que unirse a un grupo entrega todo en ese grupo a través de tu enlace Edge Connect. El puerto es un filtro de socket aplicado en tu propio host después de que llegan los bytes.

---

## Solución de problemas

Si encuentras un problema no cubierto aquí, por favor comunícate a través de tu canal existente antes de intentar una solución alternativa. Si no tienes un canal, consulta [Soporte](support.md).

### Asegúrate de que tu cliente esté actualizado

Ejecuta: `sudo apt update && sudo apt install doublezero`

### No llegan datagramas

1. Confirma que el feed fue comprado en [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un feed no comprado no entrega tráfico.
2. Confirma que BGP está activo: `doublezero status` debería mostrar `BGP Session Up` en la red DoubleZero correcta.
3. Confirma que la suscripción está activa: `doublezero user list --client-ip <your ip>` debería listar el feed bajo `groups`.
4. Confirma que el grupo está unido en la interfaz correcta. El multicast llega por `doublezero1`, no por `doublezero0`.
5. Confirma que el firewall permite los puertos UDP del feed de entrada en `doublezero1`.

### Gaps de secuencia

La secuencia es monótona por canal. Un gap significa datagramas descartados; el siguiente ciclo de reference-data restaura el estado del instrumento.

### Las tramas se detienen y reinician con un nuevo conteo de reinicios

Un reinicio del publicador incrementa el conteo de reinicios en el encabezado de trama. Descarta el estado de la sesión anterior y reinicia en frío desde el siguiente ciclo de reference-data.

### El túnel no se establece

1. Verifica que el daemon esté ejecutándose: `sudo systemctl status doublezerod` (camino nativo) o que el contenedor de Edge Connect esté activo
2. Verifica que las reglas de firewall estén en su lugar (GRE, BGP, PIM y los puertos del feed en `doublezero1`)
3. Revisa el estado de tu conexión: `doublezero status` — espera `BGP Session Up` en la red DoubleZero correcta

La IP del cliente se descubre automáticamente a partir de la IP pública de tu host. Verifica que coincida con la IP que usaste al comprar el feed.

---

## Diseño de referencia para investigación

Opcional. Si ya tienes un túnel DoubleZero y una suscripción en el host y quieres **grabar y graficar** datos del feed, el diseño de referencia para investigación ejecuta multicast → parser → topofbook-bot → ClickHouse → Grafana con Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Apunta `.env` a tu grupo y puertos de Kalshi (consulta [Direcciones de feeds](#direcciones-de-feeds)), luego:

```bash
cd demo
cp .env.example .env
# set DZ_MULTICAST_GROUP, DZ_MARKETDATA_PORT, DZ_REFDATA_PORT, DZ_INTERFACE=doublezero1
docker compose up -d --build
```

Grafana típicamente está en `http://localhost:3000` en el host. Detalles y dashboards: el [README del demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Esto visualiza datos que ya estás recibiendo. No reemplaza la compra del feed, la suscripción ni ninguno de los caminos de conexión anteriores.