---
description: Runbook orientado a LLM — configurar un validador de Solana conectado para publicar leader shreds en DoubleZero Edge. Se sirve al MCP a través de GitHub raw; no se publica en el sitio de documentación.
---

# Publicar shreds (Edge) — runbook

Esta página es para el MCP de DoubleZero (`get_onboarding_runbook`) a través de GitHub raw. No se
publica en el sitio de documentación.

1. Conectar el [MCP de DoubleZero](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Confirmar que el validador **ya está en DoubleZero IBRL** (mainnet-beta). Si no lo está, completar primero [Conectar validador (IBRL Mainnet)](solana-ibrl-runbook.md).
3. Seguir los pasos a continuación. Guía para humanos: [Validator Multicast Connection](Validator Multicast Connection.md).

**Cómo se ve el éxito:** el validador envía leader shreds a `233.84.178.1:7733`, la publicación multicast en `edge-solana-shreds` está activa, y [publisher-check](https://data.doublezero.xyz/dz/publisher-check) muestra publicación después de al menos un leader slot.

Esta ruta es para **validadores**. Las firmas de trading que desean *suscribirse* deben usar [Suscribirse a shreds](solana-shreds-runbook.md).

---

## Requisitos previos

| Necesario | Notas |
|-----------|-------|
| Túnel IBRL ya activo | [Runbook de IBRL Mainnet](solana-ibrl-runbook.md) / [guía para humanos](DZ Mainnet-beta Connection.md). |
| Cliente compatible | Jito-Agave **3.1.9+**, JitoBam 3.1.9+, Frankendancer, o Harmonic **3.1.11+**. Otras versiones no publicarán. |
| Ventana de reinicio | Agregar el destino de shreds requiere un reinicio del validador. |

---

## Pasos

### 1. Apuntar el cliente al grupo de shreds de Edge

**Jito-Agave (v3.1.9+) y Harmonic (3.1.11+)** — en el script de inicio del validador agregar:

```text
--shred-receiver-address 233.84.178.1:7733
```

Se puede enviar a Jito y a `edge-solana-shreds` al mismo tiempo. Reiniciar el validador.

**Frankendancer** — en `config.toml`:

```toml
[tiles.shred]
additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
```

Reiniciar el validador.

### 2. Publicar en el grupo multicast

```bash
doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds
```

**Verificar:** `doublezero status` sigue mostrando IBRL/up, y el usuario es publisher en `edge-solana-shreds`.

IPs de grupos activos: `doublezero multicast group list`. Todos los feeds de shreds usan UDP **`7733`**; la IP selecciona el feed.

| Feed | Dirección |
|------|-----------|
| `edge-solana-shreds` (leader) | `233.84.178.1:7733` |
| `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| `edge-solana-retrans-amer` | `233.84.178.14:7733` |

### 3. Confirmar la publicación

Abrir [publisher-check](https://data.doublezero.xyz/dz/publisher-check). No se verá confirmación hasta que el validador haya publicado leader shreds durante **al menos un slot**.

Saludable: picos de salida alineados con los leader slots (diente de sierra). Salida constante sin patrón de slots es **retransmit** (malo).

---

## Problemas comunes

1. **Versión incorrecta del cliente.** No es 3.1.9+ / 3.1.11+ → nada útil en el cable.
2. **Flag de retransmit dejado activo.** Eliminar `--shred-retransmit-receiver-address` de Jito-Agave. Verificar la columna **No Retransmit Shreds** en publisher-check (vistas de 2 épocas vs slot reciente).
3. **Aún no es leader.** El dashboard permanece vacío hasta un leader slot.
4. **IBRL no está activo.** No comenzar aquí; completar IBRL primero.

---

## Ver también

- [Validator Multicast Connection](Validator Multicast Connection.md)
- [Validator Rewards](Validator Rewards.md)