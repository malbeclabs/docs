---
description: Runbook orientado a LLM — comprar un asiento de shreds en Edge y recibir multicast de shreds de Solana en doublezero1. Servido al MCP a través de GitHub raw; no publicado en el sitio de documentación.
---

# Suscribirse a shreds (Edge) — runbook

Esta página es para el MCP de DoubleZero (`get_onboarding_runbook`) a través de GitHub raw. No está publicada en el sitio de documentación.

1. Conectar el [MCP de DoubleZero](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Indicarle el host Linux que **recibirá** shreds (o SSH), la wallet/keypair para `doublezero-solana`, y qué feed (leader vs retransmit).
3. Seguir los pasos a continuación en orden. Guía para humanos: [Edge Subscriber Connection](Edge Subscriber Connection.md).

**Cómo se ve el éxito:** asiento asignado para la época actual, `doublezero status` muestra el túnel activo, shreds UDP en `doublezero1` puerto `7733` (grupo leader `233.84.178.1`).

Al conectarse, el usuario acepta los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol). Los datos son para uso interno y no pueden ser retransmitidos.

---

## Prerrequisitos

| Necesario | Notas |
|-----------|-------|
| Host Linux/amd64 | IPv4 pública, sin NAT. En AWS: deshabilitar la verificación de origen/destino del ENI. |
| Solana CLI + `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` |
| Wallet | `~/.config/solana/id.json` (o `--keypair`). Necesita **SOL** (comisiones) + **USDC** (escrow del asiento). |
| Mint de USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Firewall | GRE, BGP (`169.254.0.0/16` tcp/179), PIM, UDP `7733` en `doublezero1`, UDP `44880` en `doublezero0`. |

---

## Pasos

### 1. Instalar cliente + paquetes

Seguir [setup](setup.md), luego:

```bash
sudo apt update && sudo apt install doublezero-solana
```

Respaldar `~/.config/doublezero/id.json`.

### 2. Firewall

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

Variantes con UFW: ver guía para humanos.

### 3. Habilitar el reconciliador

Necesario para que los asientos aprovisionen automáticamente el túnel.

```bash
doublezero enable
```

### 4. Wallet

```bash
solana-keygen new    # si es necesario — escribe en ~/.config/solana/id.json; respaldarlo
solana address
```

Fondear SOL y USDC.

### 5. Elegir dispositivo + precio

```bash
doublezero latency
doublezero-solana shreds price
doublezero-solana shreds price --device-code <Device_Name>
```

Anotar el **código de dispositivo** con menor latencia y el precio por época (base + premium). Se recomienda fondear **>1 época**. Interfaz de precios: [devices](https://data.doublezero.xyz/dz/shreds/devices).

### 6. Comprar un asiento (bloqueante)

En el host receptor:

```bash
curl -4 -s ifconfig.me; echo
```

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

`--client-ip` debe ser la IPv4 pública de la máquina que recibirá shreds. `--amount` es USDC en decimal (ej. `100`) y debe cumplir el precio de la época.

Si queda menos del 10% de la época, el CLI advierte. `--accept-partial-epoch` toma el remanente ahora; de lo contrario, esperar. Escrow sin fondos suficientes al momento de la liquidación → asiento perdido, túnel eliminado, **tenencia perdida**.

Una vez asignado, el daemon levanta el túnel GRE.

```bash
doublezero status
doublezero-solana shreds list
```

### 7. Confirmar shreds

Shreds de leader: `233.84.178.1:7733` en `doublezero1`. Descubrir grupos con `doublezero multicast group list`.

| Feed | Grupo | Dirección |
|------|-------|-----------|
| Leader | `edge-solana-shreds` | `233.84.178.1:7733` |
| Root | `edge-solana-root` | `233.84.178.16:7733` |
| Retransmit EU | `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| Retransmit APAC | `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| Retransmit AMER | `edge-solana-retrans-amer` | `233.84.178.14:7733` |

El puerto `5765` es un heartbeat del publicador — no shreds. El tráfico está encapsulado en GRE; algunos pipelines (deshredders XDP) deben eliminar el encapsulado GRE.

```bash
sudo tcpdump -ni doublezero1 host 233.84.178.1 and udp port 7733
```

---

## Problemas comunes

1. **Reconciliador desactivado.** Sin `doublezero enable`, pagar no levanta el túnel.
2. **`--client-ip` ≠ IP del daemon.** La auto-detección debe coincidir con el asiento.
3. **`Multicast user already exists`.** Desconectar primero: `doublezero disconnect`, luego reintentar `shreds pay`.
4. **Monto por debajo del precio actual.** Verificar nuevamente `shreds price` y aumentar `--amount`.
5. **Asiento no asignado después del pago.** Época tardía (siguiente época), dispositivo lleno (mayor tenencia), o retiro antes de la liquidación.
6. **Mantener el escrow fondeado.** Recargar con otro `shreds pay`; no permitir que el saldo caiga por debajo del precio de la época.

---

## Ver también

- [Edge Subscriber Connection](Edge Subscriber Connection.md)
- [Soporte](support.md)
- Scoreboard / asientos: [data.doublezero.xyz](https://data.doublezero.xyz/dz/shreds/scoreboard)