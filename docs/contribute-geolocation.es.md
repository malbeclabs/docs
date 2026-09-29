---
description: Despliega y configura agentes geoProbe que realizan las mediciones de latencia detrás del servicio de Geolocalización de DoubleZero.
---

# Despliegue de Geoprobe

Esta guía cubre el despliegue y la configuración de **agentes geoProbe** — los servidores que realizan mediciones de latencia para el servicio de [Geolocalización](geolocation.md) de DoubleZero.

Un geoProbe se sitúa entre los [DZDs](glossary.md#dzd-doublezero-device) y los dispositivos objetivo en la cadena de medición de tres niveles. Recibe LocationOffsets firmados de los DZDs padre y mide el [RTT](glossary.md#rtt-round-trip-time) hacia los objetivos registrados mediante [TWAMP](glossary.md#twamp-two-way-active-measurement-protocol), TWAMP firmado o ICMP echo. Cada geoProbe se registra onchain y se vincula a uno o más DZDs padre.

Para una visión general de la arquitectura de geolocalización y los flujos de medición, consulta la [guía de usuario de Geolocalización](geolocation.md).

---

## Prerrequisitos {#prerequisites}

!!! warning "Versión del Agente de Telemetría del DZD"
    Los DZDs padre deben ejecutar **la versión 0.17.0 o superior del agente de telemetría del dispositivo** para soportar el servicio de geolocalización. Las versiones anteriores no incluyen las extensiones de descubrimiento de probes, ping TWAMP y publicación de offsets requeridas para la geolocalización. Verifica las versiones del agente antes de desplegar un probe — un probe emparejado con un DZD más antiguo no recibirá offsets.

Antes de desplegar un geoProbe, asegúrate de contar con:

- **Servidor Linux bare metal** — Un VPS puede funcionar, pero es menos ideal.
- **Proximidad de red a un DZD** — menos de 1ms de RTT entre el probe y su DZD padre. Idealmente 0.1ms o menos.
- **Capacidad `CAP_NET_RAW`** para el proceso del agente (requerida para el sondeo ICMP echo con raw sockets)
- **Par de claves Ed25519** para la identidad de firma del probe
- **Autorización de la Fundación** — el registro de probes está controlado por la fundación en este momento; coordina con [DZF](glossary.md#dzf-doublezero-foundation) antes de proceder
- **DZD(s) padre** ejecutando el agente de telemetría v0.17.0+

---

## Instalación {#installation}

Instala tanto el daemon del agente como la CLI de doublezero:

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt install doublezero-geoprobe-agent doublezero
```

| Paquete | Propósito |
|---------|-----------|
| `doublezero-geoprobe-agent` | Daemon del agente que se ejecuta en el servidor del probe, realizando mediciones de latencia y generando offsets firmados |
| `doublezero` | Herramienta CLI utilizada para el registro del probe y comandos de gestión |

---

## Registro Onchain {#onchain-registration}

El registro del probe requiere autorización de la fundación. Coordina con DZF antes de proceder.

### Paso 1: Registrar el probe {#step-1-register-the-probe}

```bash
doublezero geolocation probe create \
  --code <probe-code> \
  --exchange <exchange-pubkey> \
  --public-ip <probe-ip> \
  --signing-pubkey <signing-key-pubkey>
```

| Parámetro | Descripción |
|-----------|-------------|
| `--code` | Identificador único para el probe (ej., `ams-tn-gp1`) — máximo 32 caracteres |
| `--exchange` | Clave pública de la cuenta del Serviceability Exchange con la que este probe está asociado |
| `--public-ip` | Dirección IPv4 pública donde el probe escucha |
| `--signing-pubkey` | Clave pública utilizada para firmar offsets y telemetría |

### Paso 2: Vincular DZDs padre {#step-2-link-parent-dzds}

```bash
doublezero geolocation probe add-parent \
  --probe <probe-code> \
  --device <dzd-code>
```

Cada DZD padre debe ser un dispositivo activado en el Serviceability Program. Los DZDs descubren automáticamente los probes hijos cada 60 segundos — una vez vinculado, el DZD comienza las mediciones TWAMP y la generación de offsets automáticamente.

---

## Ejecución del Agente {#running-the-agent}

```bash
doublezero-geoprobe-agent \
  --env mainnet-beta \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey>
```

### Flags Requeridos {#required-flags}

| Flag | Descripción |
|------|-------------|
| `--keypair` | Ruta al archivo de par de claves Ed25519 para firmar offsets |
| `--geoprobe-pubkey` | La clave pública [onchain](glossary.md#onchain) del probe (obtenida de `probe create`) |
| `--env` | Entorno de red: `testnet`, `devnet` o `mainnet-beta` (establece la URL RPC del ledger) |

Alternativamente, usa `--ledger-rpc-url` en lugar de `--env` para especificar un endpoint RPC de Solana personalizado.

### Flags Opcionales {#optional-flags}

| Flag | Por defecto | Descripción |
|------|-------------|-------------|
| `--twamp-listen-port` | 8925 | Puerto para mediciones TWAMP desde los DZDs padre |
| `--signed-twamp-port` | 8924 | Puerto para probes TWAMP firmados desde objetivos entrantes |
| `--udp-listen-port` | 8923 | Puerto para recibir datagramas LocationOffset de los DZDs |
| `--probe-interval` | 30s | Frecuencia con la que se mide cada objetivo |
| `--max-offset-age` | 1h | Edad máxima de un offset de DZD en caché antes de descartarlo |
| `--verify-interval` | 29s | Frecuencia con la que se re-verifican las asignaciones de objetivos desde el ledger |
| `--verbose` | false | Habilitar logging detallado |
| `--metrics-enable` | false | Habilitar endpoint de métricas Prometheus |
| `--metrics-addr` | — | Dirección para el endpoint de métricas Prometheus (ej., `0.0.0.0:9090`) |

---

## Puertos y Firewall {#ports-and-firewall}

El agente geoprobe requiere varios puertos abiertos:

| Puerto | Protocolo | Dirección | Propósito |
|--------|-----------|-----------|-----------|
| 8923/udp | UDP | Entrante desde DZDs | Recibe datagramas LocationOffset firmados |
| 8924/udp | UDP | Entrante desde objetivos | Reflector TWAMP firmado (flujo de probe entrante) |
| 8925/udp | UDP | Entrante desde DZDs | Mediciones TWAMP desde los DZDs padre |
| ICMP | ICMP | Saliente hacia objetivos | Solicitudes ICMP echo para objetivos OutboundIcmp |

!!! note
    El agente también necesita UDP saliente hacia los objetivos para el sondeo TWAMP (flujo saliente) y para entregar resultados de LocationOffset firmados a los objetivos.

---

## Monitorización {#monitoring}

Habilita el endpoint de métricas Prometheus para visibilidad operativa:

```bash
doublezero-geoprobe-agent \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey> \
  --env testnet \
  --metrics-enable \
  --metrics-addr 0.0.0.0:9090
```

Métricas clave a monitorizar:

- **Disponibilidad del probe** — tiempo de actividad del proceso del agente
- **Latencia DZD-a-Probe** — debe ser menor a 1ms; valores más altos indican un problema de ubicación
- **Objetivos activos** — número de objetivos que el probe está midiendo actualmente
- **Fallos de verificación de firma** — valores distintos de cero pueden indicar una configuración errónea de claves o paquetes manipulados
- **Tasa de acierto de caché de offsets** — una tasa baja significa que el probe está esperando frecuentemente offsets frescos del DZD

Consulta la [guía de Operaciones](contribute-operations.md#monitoring) para orientación general sobre patrones de scraping y alertas de Prometheus utilizados en los agentes de DoubleZero.

---

## Comandos de Gestión de Probes {#probe-management-commands}

La CLI `doublezero geolocation` proporciona los siguientes subcomandos para gestionar probes:

| Subcomando | Descripción |
|------------|-------------|
| `probe create` | Registrar un nuevo geoProbe onchain |
| `probe get` | Obtener detalles de un probe específico por código |
| `probe list` | Listar todos los probes registrados |
| `probe update` | Actualizar la configuración del probe (IP, puerto, clave de firma) |
| `probe delete` | Eliminar un probe (requiere que no haya referencias activas de objetivos) |
| `probe add-parent` | Vincular un DZD padre al probe |
| `probe remove-parent` | Eliminar un DZD padre del probe |

Todos los subcomandos aceptan `--env` o `--rpc-url` para seleccionar la red. Las operaciones de escritura (`create`, `update`, `delete`, `add-parent`, `remove-parent`) requieren `--keypair`.

??? note "Ejemplo: listar probes"

    ```bash
    doublezero geolocation probe list
    ```

    Devuelve todos los probes registrados con sus códigos, IPs públicas, DZDs padre y estado actual.