---
description: Configure un suscriptor edge para recibir feeds de shreds de DoubleZero, incluyendo la configuración del cliente y las reglas de firewall para tráfico GRE, BGP, PIM y shreds.
---

# Conexión de Suscriptor Edge
!!! warning "Al conectarme a DoubleZero acepto los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol). Tenga en cuenta que los datos son únicamente para sus fines internos y no pueden ser retransmitidos (consulte la Sección 2(e))."

!!! warning "¿Ya tiene la suscripción por CLI?"
    Si se suscribió a través del **CLI** (`doublezero-solana shreds pay` / escrow seats), utilice la [página de suscripción por CLI](Edge Subscriber CLI.md) para esos comandos. Ese sistema será **descontinuado el 30 de agosto de 2026**. Las nuevas suscripciones siguen esta página.

## Paso 1: Configuración de DoubleZero

### Configuración Completa

Instale el [Solana CLI](https://docs.anza.xyz/cli/install).

Siga las instrucciones de [configuración](setup.md) para instalar y configurar el cliente de DoubleZero.

Si ya ha configurado DoubleZero previamente, asegúrese de tener la última versión del CLI de Doublezero-Solana con `sudo apt update && sudo apt install doublezero-solana`

### Configurar el Firewall

Permita el tráfico GRE, BGP, PIM y shreds.

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

---

## Paso 2: Elegir un metro

Identifique la ubicación con menor latencia desde la máquina que recibirá los shreds:

```bash
doublezero latency
```

Anote el metro / ciudad del resultado con menor latencia. Seleccionará esa ciudad en el formulario de solicitud. Consulte el [mapa de topología](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) para ver cómo se agrupan los metros.

### Precios

Los puestos se facturan **por mes**, por máquina, en el metro que seleccione:

| Metros | Precio |
|--------|--------|
| Frankfurt, Ámsterdam | $1,500 / mes |
| Londres, Nueva York, Singapur, Tokio | $900 / mes |
| Todas las demás ubicaciones | $450 / mes |

---

## Paso 3: Enviar Solicitud

1. Vaya a [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Seleccione **Solana Shreds**.
3. Seleccione la **ciudad** (metro) que necesita. Use la tabla anterior y `doublezero latency` para elegir.
4. Complete el formulario de solicitud.

Asignará un DoubleZero ID (clave existente o genere una nueva) a cada solicitud de feed en la página de [cuentas](https://doublezero.xyz/shreds/account). La **clave privada correspondiente debe estar presente en la máquina que recibirá los shreds** — no asigne una pubkey cuya clave privada no pueda mover a ese host.

Usted elige un **metro** y una **pubkey**. **No** vincula una IP pública al momento de la solicitud. Durante la suscripción puede mover el acceso entre IPs **dentro de los metros elegidos**.

Nuestro equipo revisa las solicitudes y se comunica con usted oportunamente (espere **2 días hábiles**).

---

## Paso 4: Conectarse después de la aprobación

Después de que nos comuniquemos con usted, reciba una factura y esa factura esté pagada, conéctese en cada máquina aprobada:

```bash
doublezero connect multicast --subscribe-feed solana-shreds-full
```

El acceso se habilita en la fecha de inicio elegida (típicamente 9:01 AM ET). Verifique el túnel con:

```bash
doublezero status
```

---

## Facturación

Los puestos se cobran **mensualmente**. Esté atento a la fecha de vencimiento del puesto.

Recibirá una factura unos días antes de que el puesto expire. **No pagar conlleva la eliminación del puesto.**

---

## Direcciones de Shreds (IP vs Puerto)

Los Leader Shreds y los Retransmit Shreds de alto stake llegarán por el puerto `7733`, a través de la interfaz `doublezero1`. La interfaz `doublezero0` es para tráfico unicast. El puerto `5765` es un monitor de heartbeat de los publicadores de shreds — no contendrá shreds.

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


## Encabezado de Túnel GRE — XDP

!!! note "El tráfico de shreds entregado a través de la red está encapsulado en GRE. Es posible que necesite eliminar el encabezado GRE antes de alimentar los datos en su pipeline existente (por ejemplo, un deshredder basado en XDP)."

---

## Herramientas y Dashboards

### [Marcador de Edge](https://data.doublezero.xyz/dz/shreds/scoreboard)

El marcador evalúa la velocidad de entrega de shreds a través de DoubleZero Edge y otros proveedores, utilizando datos a nivel de slot para comparar el rendimiento en tiempo real. Use este dashboard para ver las tasas de victoria de los shreds de Edge frente a otros proveedores. Puede ver resultados solo para leader shreds, además de la comparación del feed completo. También puede filtrar por región para ver el rendimiento esperado.

### [Publicadores de Edge](https://data.doublezero.xyz/dz/shreds/publishers)

La métrica "Publishing Shreds" en la parte superior izquierda del dashboard muestra el porcentaje total de peso de stake de todos los validadores de Solana que publican leader shreds en DoubleZero Edge. Puede ver los detalles de cada publicador en la red.

### [Suscriptores, Dispositivos y Actividad de Edge](https://data.doublezero.xyz/dz/shreds/subscribers)

Puede buscar su IP de Cliente en esta página para los puestos suscritos y ver el estado. También puede ver los dispositivos disponibles en la página de [Dispositivos](https://data.doublezero.xyz/dz/shreds/devices) y toda la actividad reciente en la página de [Actividad](https://data.doublezero.xyz/dz/shreds/activity).

### Documentación de la API de Datos

Para acceso programático a los endpoints de datos, consulte la documentación de la API: [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

---

## Solución de Problemas

Si encuentra un problema no cubierto aquí, por favor comuníquese a través de su canal existente antes de intentar solucionarlo por su cuenta. Si no tiene un canal, busque en [Discord](https://discord.gg/U2fEb4Jq) y abra un ticket si es necesario.

### Asegúrese de que su Cliente esté actualizado:

Ejecute: `sudo apt update && sudo apt install doublezero-solana`

### El túnel no se establece

1. Verifique que el daemon esté ejecutándose: `sudo systemctl status doublezerod`
2. Verifique que las reglas de firewall estén configuradas (GRE, BGP, PIM, tráfico de shreds en `doublezero1`, puerto 44880 en `doublezero0`)
3. Confirme que la factura de este puesto esté pagada y que la fecha de inicio haya pasado
4. Ejecute `doublezero connect multicast --subscribe-feed solana-shreds-full` en la máquina que tiene la clave privada asignada
5. Verifique el estado de su conexión: `doublezero status`

El DoubleZero ID utilizado en la página de cuentas debe coincidir con la clave en este host.

### Puesto expirado o eliminado

Los puestos son mensuales. Si la factura enviada antes del vencimiento no se paga, el puesto se elimina y el túnel no se mantendrá activo.

### "Multicast user already exists"

Ya tiene una suscripción activa a través de una ruta diferente. Desconéctese primero con `doublezero disconnect`, luego reintente `doublezero connect multicast --subscribe-feed solana-shreds-full`.