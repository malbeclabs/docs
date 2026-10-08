---
description: Registra y configura las recompensas de publicación de validadores para que los validadores que publican shreds en DoubleZero Edge reciban pagos en cada epoch.
---

# Recompensas de Validadores
!!! warning "Al conectarme a DoubleZero, acepto los [Términos de Uso de DoubleZero](https://doublezero.xyz/terms-protocol)"

## Cómo Funciona

Los validadores que publican shreds de líder en DoubleZero Edge obtienen recompensas en cada epoch. Antes de que se puedan realizar los pagos, cada validador debe registrar **dónde** se enviarán las recompensas configurando una cuenta `ValidatorPublisherRewards` en Solana. Esa cuenta almacena:

- el **mint de recompensas** — el token en el que se pagan las recompensas 2z (a menos que se cambie manualmente)
- el **propietario de recompensas** — la wallet propietaria de la Associated Token Account (ATA) que recibe las recompensas

El comando `configure` establecerá estos campos, y los pagos automáticos se realizarán epoch a epoch a partir de ese momento. Puedes volver a ejecutar `configure` más tarde para cambiar cualquiera de los campos.

!!! info "Si aún no has completado [Configuración](../../setup.md), [Conexión del Validador a Mainnet-Beta](../ibrl/publish.md) y [Conexión Multicast del Validador](publish.md), hazlo primero."

## Prerrequisitos

- Validadores publicando shreds de líder - consulta [Conexión Multicast del Validador](publish.md).
- La última versión del CLI `doublezero-solana`: `sudo apt update && sudo apt install doublezero-solana`, como mínimo `0.5.6`.
- Acceso al **keypair de identidad del validador**, ya sea en la misma máquina o mantenido offline con la capacidad de firmar un mensaje.
- Una clave pública de wallet de destino que será propietaria de la ATA de recompensas.


---

## 1. Configurar para Reclamar Recompensas

Ejecuta `configure` con el keypair de identidad del validador como `-k`.

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    -k <path-to-validator-identity-keypair.json>
```
Ejemplo de Salida
```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         direct
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```
`Configured validator publisher rewards: ` muestra el txt que puedes ver en un explorador de bloques.

| Flag | Descripción |
|---|---|
| `--node-id` | Clave pública de identidad del nodo validador. |
| `--rewards-token-owner` | Wallet que será propietaria de la ATA receptora. |
| `--rewards-token-mint` | El token en el que se recibirán las recompensas de la wallet `2z`. Los tokens compatibles también incluyen `usdc` y `wsol`. |
| `-k` | Ruta al keypair de identidad del validador. En la ruta directa, la clave pública del keypair debe coincidir con `--node-id` o el comando dará error e indicará que cambies a la ruta offchain. |

La ATA se inicializa automáticamente en la misma transacción si aún no existe.


!!! note "Si se Devuelve un Error"
    Si la clave pública de `-k` no coincide con `--node-id`

    El keypair pagador de comisiones que proporcionaste no es la identidad del validador. Proporciona el keypair de identidad del validador como `-k`, o cambia a la [ruta offchain](#apendix-offchain-path-alternative).
---

## 2. Verificar la Configuración

```bash
doublezero-solana shreds publisher-rewards show --node-id <NODE_ID>
```

El comando imprime el `Node ID`, `Rewards owner`, `Rewards mint`, la dirección ATA resuelta y el estado de la ATA. La **ATA Resuelta** es la dirección determinística derivada del propietario de recompensas + mint de recompensas — es donde se depositarán las recompensas en cada epoch.

---

## Apéndice: Alternativa con Ruta Offchain {#apendix-offchain-path-alternative}

Tres sub-pasos: preparar, firmar, configurar.

### 1. Preparar el mensaje offchain

Ejecuta esto en cualquier lugar — es de solo lectura y no necesita el keypair de identidad del validador. Imprime el blob hexadecimal a firmar y el slot absoluto en el que expira la firma.

```bash
doublezero-solana shreds publisher-rewards prepare-offchain-message \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --valid-for 1h
```
Ejemplo de Salida

```bash
Hex message:    123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3
Deadline slot:  422954444

Sign with:
  solana sign-offchain-message 123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3 --keypair <validator-identity>

Then submit:
  doublezero-solana shreds publisher-rewards configure \
    --node-id ValidatorIdentity111111111111111111111111111 --rewards-token-mint J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd --rewards-token-owner Wallet567Identity111111111111111111111111111 \
    --deadline-slot 422954444 --signature <BASE58>
```


| Flag | Descripción |
|---|---|
| `--node-id` | Clave pública de identidad del nodo validador. |
| `--rewards-token-owner` | Wallet que será propietaria de la ATA receptora. |
| `--rewards-token-mint` | El token en el que se recibirán las recompensas de la wallet `2z`. Los tokens compatibles también incluyen `usdc` y `wsol`. |
| `--valid-for` | Tiempo de vida de la firma relativo al slot actual. Acepta `<n>s`, `<n>m` o `<n>h`. Valor predeterminado: `1h`. |
| `--deadline-slot` | Alternativa a `--valid-for`: slot absoluto en el que expira la autorización. Mutuamente exclusivo con `--valid-for`. |
| `--json` | Emite JSON (`{ hex, deadline_slot }`) en lugar del resumen legible. |

El comando imprime el mensaje de autorización codificado en hexadecimal, el slot de vencimiento resuelto y fragmentos de shell listos para ejecutar para los dos pasos siguientes.

### 2. Firmar el mensaje

En la máquina que contiene el keypair de identidad del validador:

```bash
solana sign-offchain-message <123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3> \
--keypair <path-to-validator-identity-keypair.json>
```

Esto imprime una firma en base58.

Ejemplo de Salida

```bash
SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp
```

### 3. Enviar `configure`

De vuelta en la máquina con tu wallet pagadora de comisiones:

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --signature <SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp> \
    --deadline-slot <DEADLINE_SLOT>
```

`--signature` y `--deadline-slot` deben proporcionarse juntos. Los valores deben coincidir con los producidos en los pasos 2b.i y 2b.ii.

La ATA se inicializa automáticamente en la misma transacción si aún no existe.

Ejemplo de Salida

```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         offchain
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```

---

!!! note "Nota: Si la Firma ha Expirado"
    Cada firma offchain tiene un slot de vencimiento. Si pasa demasiado tiempo entre `prepare-offchain-message` y `configure`, vuelve a ejecutar `prepare-offchain-message`, firma de nuevo y reenvía. La validez predeterminada es de 1 hora — extiéndela con `--valid-for 4h` o similar si necesitas más tiempo para un flujo de firma offline.