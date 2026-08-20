---
description: Configure un suscriptor edge para recibir feeds de shreds de DoubleZero, incluyendo la configuración del cliente y las reglas de firewall para GRE, BGP, PIM y tráfico de shreds.
---

# Conexión de Suscriptor Edge (CLI)

!!! warning "Suscripción legacy por CLI — desactivada el **30 de agosto de 2026**"
    Esta página es para usuarios que ya están en la suscripción por **CLI / asiento onchain** (`doublezero-solana shreds pay`). Ese sistema será desactivado el **30 de agosto de 2026**.

    Las nuevas suscripciones utilizan el flujo del portal en [Suscribirse a shreds (Edge)](Edge Subscriber Connection.md).

!!! warning "Al conectarme a DoubleZero acepto los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol). Tenga en cuenta que los datos son solo para sus propósitos internos y no pueden ser retransmitidos (ver Sección 2(e))."

## Paso 1: Configuración de DoubleZero

### 1. Completar la Configuración

Instale la [Solana CLI](https://docs.anza.xyz/cli/install).

Siga las instrucciones de [configuración](setup.md) para instalar y configurar el cliente de DoubleZero.

Si ha configurado DoubleZero anteriormente, asegúrese de tener la última versión de Doublezero-Solana CLI con `sudo apt update && sudo apt install doublezero-solana`

### 2. Configurar el Firewall

Permita el tráfico GRE, BGP, PIM y de shreds.

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

### 3. Habilitar el Reconciliador

El reconciliador monitorea el estado onchain y aprovisiona túneles automáticamente cuando su asiento es asignado. No está habilitado por defecto.

```bash
doublezero enable
```

---

## Paso 2: Configurar su Wallet

### 1. Crear un Keypair de Solana

La CLI `doublezero-solana` utiliza un keypair estándar de Solana para la gestión de asientos onchain. Si no tiene uno:

```bash
solana-keygen new
```

Esto escribe en `~/.config/solana/id.json`. Para usar una ruta diferente, pase `--keypair <path>` a cualquier comando de `doublezero-solana`.

Imprima la dirección de su wallet:

```bash
solana address
```

### 2. Financiar su Wallet

Su wallet necesita dos tokens:

- **SOL** — para las comisiones de transacción de Solana. Transfiera SOL a la dirección del wallet impresa anteriormente.
- **USDC** — para la financiación del asiento. La CLI extrae de la Cuenta de Token Asociada (ATA) de su wallet para el mint de USDC en mainnet (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`).

---

## Paso 3: Comprar un Asiento

### 1. Encontrar su Dispositivo Más Cercano

Antes de comprar un asiento, identifique el dispositivo con la latencia más baja desde su máquina:

```bash
doublezero latency
```

Anote el código del dispositivo del resultado con menor latencia (por ejemplo, `<Device_Name>`). Lo usará al comprar un asiento.

### 2. Consultar Precios

Vea los precios actuales del dispositivo antes de comprometer fondos. Los precios tienen dos componentes: un **precio base de metro** y una **prima por dispositivo**. También puede ver precios y disponibilidad [aquí](https://data.doublezero.xyz/dz/shreds/devices).

**Todos los dispositivos:**

```bash
doublezero-solana shreds price
```

**Dispositivo específico:**

```bash
doublezero-solana shreds price --device-code <Device_Name>
doublezero-solana shreds price --device <PUBKEY>
```

**Todos los dispositivos en un metro:**

```bash
doublezero-solana shreds price --metro <PUBKEY>
```

Columnas de salida: `Device Code`, `Metro Code`, `Metro Name`, `Status`, `Settled Seats`, `Available Seats`, `Base Price (USDC)`, `Premium (USDC)`, `Epoch Price (USDC)`.

El precio por epoch es el costo total por epoch para un asiento en ese dispositivo (base + prima). Use `--wide` para mostrar las pubkeys completas, o `--json` para salida en JSON.

### 3. Comprar un Asiento

Compre un asiento con un solo comando. Esto inicializa su asiento, financia el escrow y solicita la asignación:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**Parámetros:**

| Flag | Descripción |
|------|-------------|
| `--device <PUBKEY>` | Dispositivo destino por clave pública (mutuamente excluyente con `--device-code`) |
| `--device-code <CODE>` | Dispositivo destino por código legible (por ejemplo, `<Device_Name>`) |
| `--client-ip <IP>` | Dirección IPv4 pública de su máquina |
| `--amount <USDC>` | USDC a financiar (formato decimal, por ejemplo `100` = 100 USDC). Debe cumplir el precio mínimo por epoch. |
| `--source-token-account <PUBKEY>` | Cuenta fuente de USDC personalizada (por defecto la ATA de su wallet) |
| `--accept-partial-epoch` | Omitir la advertencia de epoch restante (ver más abajo) |
| `--fee-payer <PATH>` | Usar un wallet diferente para las comisiones de transacción en SOL |
| `--dry-run` | Simular la transacción sin ejecutarla |
| `--with-compute-unit-price <PRICE>` | Establecer un precio de unidad de cómputo para inclusión más rápida durante congestión |

Una vez que su asiento sea asignado, el daemon establece el túnel GRE automáticamente. Verifique su conexión con:

```bash
doublezero status
```

### Temporización de Epoch

Los asientos se asignan por epoch de Solana (~2 días). Si queda menos del 10% del epoch actual cuando paga, la CLI advierte que su asiento será asignado inmediatamente pero solo cubre el resto del epoch actual. Un pago separado se deducirá de su escrow cuando comience el siguiente epoch.

!!! info "Es recomendable financiar más de 1 epoch a la vez para no perder su asiento. Puede consultar el tiempo restante en un epoch [aquí](https://explorer.solana.com/)."

Puede omitir esta advertencia con `--accept-partial-epoch`.

### Mantener su Escrow Financiado

!!! warning "Si el saldo de su escrow está por debajo del precio del epoch en el momento de la liquidación, su asiento no será asignado, el túnel será desmontado y perderá su antigüedad acumulada. La antigüedad determina su prioridad para epochs futuros — perderla significa que compite como un nuevo participante de nuevo."

Puede sobre-financiar esta cuenta para cubrir múltiples epochs. Cada liquidación deduce el precio de un epoch de su escrow, y el saldo restante se traslada. Por ejemplo, financiar 5 veces el precio por epoch mantiene su asiento activo hasta por 5 epochs sin necesidad de re-financiar.

Para recargar su escrow, ejecute `shreds pay` de nuevo en cualquier momento:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

Tenga en cuenta que `Target_IP` debe ser una dirección IPv4 pública en la máquina que recibirá los shreds. Puede encontrarla ejecutando un comando como `curl -4 ifconfig.me` en la máquina destino.

### Monitorear Asientos

Esta sección detalla cómo ver los asientos a través de la CLI. También puede usar [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs) para monitorear asientos y ayudar a gestionar su cuenta de escrow.

Vea sus asientos activos y saldos de escrow:

**Todos sus asientos:**

```bash
doublezero-solana shreds list
```

**Filtrar por dispositivo:**

```bash
doublezero-solana shreds list --device-code <Device_Name>
```

**Filtrar por IP del cliente:**

```bash
doublezero-solana shreds list --client-ip <Target_IP>
```

**Filtrar por wallet:**

```bash
doublezero-solana shreds list --withdraw-authority <PUBKEY>
```

Columnas de salida: `Device Code`, `Client IP`, `Tenure`, `Balance (USDC)`, `Est. Epochs Paid`.

La columna "Est. Epochs Paid" muestra cuántos epochs cubre su saldo actual a los precios actuales. Si los precios cambian, esta estimación se ajusta.

### Retirar Asiento y Escrow

Este comando libera su asiento y cierra el escrow. Recibirá un reembolso prorrateado por la porción no utilizada del epoch actual, más cualquier saldo restante del escrow, devuelto a su wallet. Perderá el asiento y cualquier antigüedad acumulada.

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

Puede identificar el dispositivo con `--device <PUBKEY>` o `--device-code <CODE>`, igual que en otros comandos.

Para enviar el reembolso en USDC a una cuenta de token diferente:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "Esto no se puede deshacer. Después de retirar, su asiento desaparece y la antigüedad se restablece."

---

## Direcciones de Shreds (IP vs Puerto)

Los Leader Shreds y los Retransmit Shreds de alto stake llegarán por el puerto `7733`, a través de la interfaz `doublezero1`. La interfaz `doublezero0` es para tráfico unicast. El puerto `5765` es un monitor de heartbeat de los publicadores de shreds — este no contendrá shreds.

Para el consumo de shreds, la **dirección IP** identifica el flujo multicast y el **puerto** identifica el servicio UDP en ese flujo.
Todos los flujos de shreds a continuación usan el puerto UDP `7733` en `doublezero1`.

Puede examinar las IPs de cualquier grupo multicast con:

```bash
doublezero multicast group list
```

### Leader Shreds

- `edge-solana-shreds`: `233.84.178.1:7733`

### Root Shreds

- `edge-solana-root`: `233.84.178.16:7733`

### Retransmit Shreds

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## Encabezado del Túnel GRE — XDP

!!! note "El tráfico de shreds entregado a través de la red está encapsulado con GRE. Es posible que necesite eliminar el encabezado GRE antes de alimentar los datos en su pipeline existente (por ejemplo, un deshredder basado en XDP)."

---

## Herramientas y Paneles

### [Edge Scoreboard](https://data.doublezero.xyz/dz/shreds/scoreboard)

El Scoreboard evalúa la velocidad de entrega de shreds en DoubleZero Edge y otros proveedores, utilizando datos a nivel de slot para comparar el rendimiento en tiempo real. Use este panel para ver las tasas de victoria de los shreds de Edge frente a otros proveedores. Puede ver resultados solo para leader shreds, además de la comparación del feed completo. También puede desglosar por región para ver el rendimiento esperado.

### [Edge Publishers](https://data.doublezero.xyz/dz/shreds/publishers)

La métrica "Publishing Shreds" en la parte superior izquierda del panel muestra el porcentaje total de peso de stake de todos los validadores de Solana que publican leader shreds en DoubleZero Edge. Puede ver los detalles de cada publicador en la red.

### [Suscriptores, Dispositivos y Actividad de Edge](https://data.doublezero.xyz/dz/shreds/subscribers)

Puede buscar fácilmente su IP de Cliente en esta página para ver los asientos suscritos y su estado. Haga clic en suscripciones de asientos específicas para ver el historial de pagos y actividad. También puede ver los dispositivos disponibles en la página de [Dispositivos](https://data.doublezero.xyz/dz/shreds/devices) y toda la actividad reciente en la página de [Actividad](https://data.doublezero.xyz/dz/shreds/activity).

### Documentación de la API de Datos

Para acceso programático a los endpoints de datos, consulte la documentación de la API: [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

---

## Solución de Problemas

Si encuentra un problema no cubierto aquí, por favor comuníquese a través de su canal existente antes de intentar solucionarlo por su cuenta. Si no tiene un canal, busque en [Discord](https://discord.gg/U2fEb4Jq) y abra un ticket si es necesario.

### Asegúrese de que su Cliente esté actualizado:

Ejecute: `sudo apt update && sudo apt install doublezero-solana`

### Saldo de escrow insuficiente

Si el saldo de su escrow está por debajo del precio del epoch en el momento de la liquidación, el asiento no es asignado, el túnel es desmontado y la antigüedad se pierde. Recargue con `shreds pay` antes de la próxima liquidación.

### Asiento no asignado después de pagar

- Puede haber pagado tarde en el epoch — el asiento toma efecto en el próximo epoch.
- Todos los asientos en el dispositivo pueden estar ocupados por incumbentes con mayor antigüedad. Verifique los asientos disponibles con `shreds price`.
- Si retiró antes de la liquidación, el asiento no era elegible.

### El túnel no se establece

1. Verifique que el daemon esté ejecutándose: `sudo systemctl status doublezerod`
2. Verifique que el reconciliador esté habilitado: `doublezero enable`
3. Verifique que las reglas del firewall estén configuradas (GRE, BGP, PIM, tráfico de shreds en `doublezero1`, puerto 44880 en `doublezero0`)
4. Verifique que su asiento esté activo para el epoch actual: `doublezero-solana shreds list`
5. Verifique el estado de su conexión: `doublezero status`

La IP del cliente del daemon se descubre automáticamente desde la IP pública de su host — verifique que coincida con el `--client-ip` usado en sus comandos de asiento.

### Aviso de epoch

La CLI advierte cuando queda menos del 10% del epoch. Sus opciones son:

- Aceptar con `--accept-partial-epoch` si desea el asiento inmediatamente
- Esperar al próximo epoch para obtener la cobertura de un epoch completo

### "Amount is below the current price"

El comando `pay` valida su monto contra el precio mínimo por epoch (base del metro + prima del dispositivo). Use `shreds price` para consultar los precios actuales y aumente su monto.

### "Multicast user already exists"

Ya tiene una suscripción activa a través de una ruta diferente. Desconéctese primero con `doublezero disconnect`, luego reintente `shreds pay`.