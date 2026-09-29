---
description: Despliegue y configure agentes geoProbe que realizan las mediciones de latencia detrás del servicio de Geolocalización de DoubleZero.
---

# Despliegue de Geoprobe

Esta guía cubre el despliegue y la configuración de **agentes geoProbe** — los servidores que realizan mediciones de latencia para el servicio de [Geolocalización](geolocation.md) de DoubleZero.

Un geoProbe se sitúa entre los [DZDs](glossary.md#dzd-doublezero-device) y los dispositivos objetivo en la cadena de medición de tres niveles. Recibe LocationOffsets firmados de los DZDs padre y mide el [RTT](glossary.md#rtt-round-trip-time) hacia los objetivos registrados mediante [TWAMP](glossary.md#twamp-two-way-active-measurement-protocol), TWAMP firmado o eco ICMP. Cada geoProbe se registra onchain y se vincula a uno o más DZDs padre.

Para una visión general de la arquitectura de geolocalización y los flujos de medición, consulte la [guía de usuario de Geolocalización](geolocation.md).

---

## Requisitos previos

!!! warning "Versión del Agente de Telemetría del DZD"
    Los DZDs padre deben ejecutar la **versión 0.17.0 o posterior del agente de telemetría del dispositivo** para soportar el servicio de geolocalización. Las versiones anteriores no incluyen las extensiones de descubrimiento de sondas, ping TWAMP y publicación de offsets necesarias para la geolocalización. Verifique las versiones del agente antes de desplegar una sonda — una sonda emparejada con un DZD antiguo no recibirá offsets.

Antes de desplegar un geoProbe, asegúrese de tener:

- **Servidor Linux bare metal** — Un VPS puede funcionar, pero es menos ideal.
- **Proximidad de red a un DZD** — menos de 1ms de RTT entre la sonda y su DZD padre. Idealmente 0.1ms o menos.
- **Capacidad `CAP_NET_RAW`** para el proceso del agente (requerida para el sondeo de eco ICMP con sockets raw)
- **Par de claves Ed25519** para la identidad de firma de la sonda
- **Autorización de la Fundación** — el registro de sondas está controlado por la fundación en este momento; coordine con la [DZF](glossary.md#dzf-doublezero-foundation) antes de proceder
- **DZD(s) padre** ejecutando el agente de telemetría v0.17.0+

---

## Instalación

Instale tanto el daemon del agente como la CLI de doublezero:

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt install doublezero-geoprobe-agent doublezero
```

| Paquete | Propósito |
|---------|-----------|
| `doublezero-geoprobe-agent` | Daemon del agente que se ejecuta en el servidor de la sonda, realizando mediciones de latencia y generando offsets firmados |
| `doublezero` | Herramienta CLI utilizada para el registro de sondas y comandos de gestión |

---

## Registro Onchain

El registro de sondas requiere autorización de la fundación. Coordine con la DZF antes de proceder.

### Paso 1: Registrar la sonda

```bash
doublezero geolocation probe create \
  --code <probe-code> \
  --exchange <exchange-pubkey> \
  --public-ip <probe-ip> \
  --signing-pubkey <signing-key-pubkey>
```

| Parámetro | Descripción |
|-----------|-------------|
| `--code` | Identificador único para la sonda (p. ej., `ams-tn-gp1`) — máximo 32 caracteres |
| `--exchange` | Clave pública de la cuenta del Serviceability Exchange con la que esta sonda está asociada |
| `--public-ip` | Dirección IPv4 pública donde la sonda escucha |
| `--signing-pubkey` | Clave pública utilizada para firmar offsets y telemetría |

### Paso 2: Vincular DZDs padre

```bash
doublezero geolocation probe add-parent \
  --probe <probe-code> \
  --device <dzd-code>
```

Cada DZD padre debe ser un dispositivo activado en el Serviceability Program. Los DZDs descubren automáticamente las sondas hijas cada 60 segundos — una vez vinculado, el DZD inicia las mediciones TWAMP y la generación de offsets automáticamente.

---

## Ejecución del Agente

```bash
doublezero-geoprobe-agent \
  --env mainnet-beta \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey>
```

### Flags Requeridos

| Flag | Descripción |
|------|-------------|
| `--keypair` | Ruta al archivo de par de claves Ed25519 para firmar offsets |
| `--geoprobe-pubkey` | La clave pública [onchain](glossary.md#onchain) de la sonda (obtenida de `probe create`) |
| `--env` | Entorno de red: `testnet`, `devnet` o `mainnet-beta` (establece la URL del RPC del ledger) |

Alternativamente, use `--ledger-rpc-url` en lugar de `--env` para especificar un endpoint RPC de Solana personalizado.

### Flags Opcionales

| Flag | Predeterminado | Descripción |
|------|----------------|-------------|
| `--twamp-listen-port` | 8925 | Puerto para mediciones TWAMP desde DZDs padre |
| `--signed-twamp-port` | 8924 | Puerto para sondas TWAMP firmadas desde objetivos entrantes |
| `--udp-listen-port` | 8923 | Puerto para recibir datagramas LocationOffset desde DZDs |
| `--probe-interval` | 30s | Con qué frecuencia medir cada objetivo |
| `--max-offset-age` | 1h | Edad máxima de un offset de DZD en caché antes de ser descartado |
| `--verify-interval` | 29s | Con qué frecuencia re-verificar las asignaciones de objetivos desde el ledger |
| `--verbose` | false | Habilitar logging detallado |
| `--metrics-enable` | false | Habilitar endpoint de métricas Prometheus |
| `--metrics-addr` | — | Dirección para el endpoint de métricas Prometheus (p. ej., `0.0.0.0:9090`) |

---

## Puertos y Firewall

El agente geoprobe requiere varios puertos abiertos:

| Puerto | Protocolo | Dirección | Propósito |
|--------|-----------|-----------|-----------|
| 8923/udp | UDP | Entrante desde DZDs | Recibe datagramas LocationOffset firmados |
| 8924/udp | UDP | Entrante desde objetivos | Reflector TWAMP firmado (flujo de sonda entrante) |
| 8925/udp | UDP | Entrante desde DZDs | Mediciones TWAMP desde DZDs padre |
| ICMP | ICMP | Saliente hacia objetivos | Solicitudes de eco ICMP para objetivos OutboundIcmp |

!!! note
    El agente también necesita UDP saliente hacia los objetivos para el sondeo TWAMP (flujo saliente) y para entregar resultados de LocationOffset firmados a los objetivos.

---

## Monitorización

Habilite el endpoint de métricas Prometheus para visibilidad operativa:

```bash
doublezero-geoprobe-agent \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey> \
  --env testnet \
  --metrics-enable \
  --metrics-addr 0.0.0.0:9090
```

Métricas clave a monitorizar:

- **Disponibilidad de la sonda** — tiempo de actividad del proceso del agente
- **Latencia DZD-a-Sonda** — debe ser inferior a 1ms; valores más altos indican un problema de ubicación
- **Objetivos activos** — número de objetivos que la sonda está midiendo actualmente
- **Fallos de verificación de firma** — valores distintos de cero pueden indicar una mala configuración de claves o paquetes manipulados
- **Tasa de acierto de caché de offsets** — una tasa de acierto baja significa que la sonda espera frecuentemente offsets frescos del DZD

Consulte la [guía de Operaciones](contribute-operations.md#monitoring) para orientación general sobre patrones de scraping y alertas de Prometheus utilizados en los agentes de DoubleZero.

---

## Comandos de Gestión de Sondas

La CLI `doublezero geolocation` proporciona los siguientes subcomandos para gestionar sondas:

| Subcomando | Descripción |
|------------|-------------|
| `probe create` | Registrar un nuevo geoProbe onchain |
| `probe get` | Obtener detalles de una sonda específica por código |
| `probe list` | Listar todas las sondas registradas |
| `probe update` | Actualizar la configuración de la sonda (IP, puerto, clave de firma) |
| `probe delete` | Eliminar una sonda (requiere que no haya referencias activas de objetivos) |
| `probe add-parent` | Vincular un DZD padre a la sonda |
| `probe remove-parent` | Eliminar un DZD padre de la sonda |

Todos los subcomandos aceptan `--env` o `--rpc-url` para seleccionar la red. Las operaciones de escritura (`create`, `update`, `delete`, `add-parent`, `remove-parent`) requieren `--keypair`.

??? note "Ejemplo: listar sondas"

    ```bash
    doublezero geolocation probe list
    ```

    Devuelve todas las sondas registradas con sus códigos, IPs públicas, DZDs padre y estado actual.