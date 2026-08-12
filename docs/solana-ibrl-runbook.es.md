---
description: Runbook orientado a LLM — conectar un validador de Solana Mainnet-Beta a DoubleZero en modo IBRL. Servido al MCP a través de GitHub raw; no se publica en el sitio de documentación.
---

# Conectar validador (IBRL Mainnet) — runbook

Esta página es para el MCP de DoubleZero (`get_onboarding_runbook`) a través de GitHub raw. No se publica en el sitio de documentación.

1. Conecta el [MCP de DoubleZero](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Indícale que se trata de un **validador de Solana Mainnet-Beta**, el host Linux (o SSH), y dónde se encuentra el keypair de identidad del validador.
3. Sigue los pasos a continuación en orden. ¿Prefieres hacerlo manualmente? Usa la [guía para humanos](DZ Mainnet-beta Connection.md).

**Cómo se ve el éxito:** `doublezero status` muestra el túnel **up**, User Type **IBRL**, Network **mainnet-beta**. `Tunnel src` y `Doublezero IP` coinciden con la IPv4 pública del host.

IBRL no requiere reiniciar los clientes del validador; utiliza la IP pública existente.

---

## Requisitos previos

| Necesario | Notas |
|------|--------|
| Host Linux/amd64 | Instala DoubleZero **en el host del validador**, no en un contenedor. |
| IPv4 pública, sin NAT | La IP de gossip debe coincidir con este host. |
| Solana CLI en `$PATH` | Para `solana sign-offchain-message`. |
| Keypair de identidad del validador | Legible por el usuario que ejecuta los comandos (a menudo bajo el usuario `sol`). |
| ≥1 SOL en la identidad | Passport / solicitud onchain. |
| GRE (protocolo IP 47) + BGP | BGP en `169.254.0.0/16` tcp/179. |
| `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` (o equivalente de la distribución). |

El Validator ID se verifica contra el gossip de Solana para determinar la IP de destino. Un ID inválido en la misma IP se ignora; solo se utiliza el ID primario en gossip.

---

## Pasos

### 1. Instalar el cliente

Sigue [setup](setup.md) si `doublezero` no está instalado. Paquetes para mainnet:

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

Rocky / RHEL: usa `setup.rpm.sh` y `sudo yum install doublezero`.

**Verificar:** `sudo systemctl status doublezerod` está activo. Haz una copia de seguridad de `~/.config/doublezero/id.json`.

### 2. Apuntar el daemon a mainnet-beta

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Espera ~30s, luego `doublezero latency` debería listar los dispositivos de mainnet.

### 3. Abrir UDP 44880 en `doublezero0`

```bash
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW: `sudo ufw allow in on doublezero0 to any port 44880 proto udp` y la regla `out` correspondiente. También permite GRE y BGP como se indica en [setup](setup.md).

### 4. Confirmar el ID de DoubleZero y el validador primario

El ID de DoubleZero del setup en el **primario** debe estar en cada respaldo (`~/.config/doublezero/id.json`).

```bash
doublezero address
doublezero-solana passport find-validator -u mainnet-beta
```

Se espera del primario: en gossip, en el leader schedule, "can connect as a primary". En los respaldos, ejecuta el mismo `find-validator`; **no** deberían estar programados como leader.

Si solo hay una máquina: omite `--backup-validator-ids` / `backup_ids=` en los comandos posteriores.

### 5. Preparar el mensaje de acceso (primario)

En el primario (con stake activo, identidad en gossip):

```bash
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address <DOUBLEZERO_ADDRESS> \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4>
```

Omite `--backup-validator-ids` si no hay respaldos (máximo 3). Copia la línea `solana sign-offchain-message …` de la salida.

### 6. Firmar con la clave de identidad del validador

En el primario, ejecuta el comando impreso (keypair de identidad, **no** solo la clave de DoubleZero):

```bash
solana sign-offchain-message \
   service_key=<DOUBLEZERO_ADDRESS>,backup_ids=<ID2>,<ID3>,<ID4> \
   -k <identity-keypair-file.json>
```

**Produce:** una cadena de firma. Llévala al siguiente paso.

### 7. Solicitar acceso de validador

```bash
doublezero-solana passport request-validator-access -k <path-to-keypair> -u mainnet-beta \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4> \
  --signature <SIGNATURE> \
  --doublezero-address <DOUBLEZERO_ADDRESS>
```

Espera a que Sentinel valide y cree el pase de acceso. Opcional: el agente puede llamar a **`check_edge_access`** con `pubkey` (`doublezero address`) y la IP pública del host hasta que el pase esté presente.

### 8. Conectar IBRL

```bash
doublezero connect ibrl
```

Espera ~1 minuto para GRE. Hasta entonces, el estado puede ser `down` / `Unknown`.

```bash
doublezero status
```

**Correcto:** `up`, User Type `IBRL`, Network `mainnet-beta`, túnel típicamente `doublezero0`.

```bash
ip route
```

Se esperan rutas aprendidas por BGP a través de `doublezero0`.

---

## Problemas comunes

1. **Entorno incorrecto.** Los paquetes de testnet / `DESIRED_DOUBLEZERO_ENV=testnet` no funcionarán en mainnet-beta.
2. **La identidad no está en gossip.** Los IDs inválidos en la misma IP no pueden registrar la máquina.
3. **Los respaldos deben compartir el ID de DoubleZero del primario.** Copia `id.json`; no generes una segunda identidad con keygen.
4. **Firma con la identidad del validador**, no con la clave de DoubleZero.
5. **Estado down durante ~1 minuto** después de `connect ibrl` es normal mientras GRE se establece.

---

## Ver también

- [Conexión de Validador a Mainnet-Beta](DZ Mainnet-beta Connection.md)
- [Setup](setup.md)
- Siguiente: [Publicar shreds (Edge)](solana-shreds-publisher-runbook.md)