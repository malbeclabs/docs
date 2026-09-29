---
description: Tareas operativas continuas para contribuidores de DoubleZero — actualizaciones de agentes, actualizaciones de dispositivos e interfaces, gestión de enlaces y registro de incidentes.
---

# Guía de Operaciones para Contribuidores


Esta guía cubre las tareas operativas continuas para el mantenimiento de sus DoubleZero Devices (DZDs), incluyendo actualizaciones de agentes, actualizaciones de dispositivos/interfaces y gestión de enlaces.

## Registro de Incidentes y Mantenimiento

Cualquier mantenimiento planificado o problema no planificado de enlace/dispositivo debe registrarse en el [portal de gestión OPS](contribute-ops-management.md). Esto brinda a todos los contribuidores visibilidad sobre lo que está sucediendo en la red y evita investigaciones duplicadas.

- **Trabajo planificado** (por ejemplo, reemplazar un óptico, mantenimiento programado del operador): cree un registro de mantenimiento antes de comenzar.
- **Problemas no planificados** (por ejemplo, enlace caído, errores de interfaz, pérdida de paquetes): abra un incidente tan pronto como comience a investigar.

Consulte la [guía de gestión OPS](contribute-ops-management.md) para los pasos de incorporación y cómo crear tickets.

---

**Requisitos previos**: Antes de usar esta guía, asegúrese de haber:

- Completado la [Guía de Aprovisionamiento de Dispositivos](contribute-provisioning.md)
- Su DZD está completamente operativo con ambos agentes de Configuración y Telemetría en ejecución

---

## Actualizaciones de Dispositivos

Use `doublezero device update` para modificar la configuración del dispositivo después del aprovisionamiento inicial.

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**Opciones comunes de actualización:**

| Opción | Descripción |
|--------|-------------|
| `--device-type <TYPE>` | Cambiar modo de operación: `hybrid`, `transit`, `edge` (ver [Tipos de Dispositivos](contribute-provisioning.md#understanding-device-types)) |
| `--location <LOCATION>` | Mover el dispositivo a una ubicación diferente |
| `--metrics-publisher <PUBKEY>` | Cambiar la clave del publicador de métricas |

---

## Actualizaciones de Interfaces

Use `doublezero device interface update` para modificar interfaces existentes. Este comando acepta las mismas opciones que `interface create`.

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

Para la lista completa de opciones de interfaz incluyendo configuraciones CYOA/DIA, consulte [Creación de Interfaces](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices).

**Ejemplo - Agregar configuraciones CYOA a una interfaz existente:**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### Listar Interfaces

```bash
doublezero device interface list              # Todas las interfaces en todos los dispositivos
doublezero device interface list <DEVICE>     # Interfaces para un dispositivo específico
```

---

## Actualización del Agente de Configuración

Cuando se publica una nueva versión del Agente de Configuración, siga estos pasos para actualizar.

### 1. Descargar la última versión

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget AGENT_DOWNLOAD_URL
# exit
$ exit
```

### 2. Apagar el agente

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 3. Eliminar la versión anterior

Primero, encuentre el nombre de archivo de la versión anterior:
```
switch# show extensions
```

Ejecute los siguientes comandos para eliminar la versión anterior. Reemplace `<OLD_VERSION>` con la versión anterior de la salida anterior:
```
switch# delete flash:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. Instalar la nueva versión

```
switch# copy flash:AGENT_FILENAME extension:
switch# extension AGENT_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. Reactivar el agente

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# no shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 6. Verificar la actualización

El Estado debe ser "A, I, B".
```
switch# show extensions
```

### 7. Verificar la salida de registro del Agente de Configuración

```
show agent doublezero-agent log
```

---

## Actualización del Agente de Telemetría

Cuando se publica una nueva versión del Agente de Telemetría, siga estos pasos para actualizar.

### 1. Descargar la última versión

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget TELEMETRY_DOWNLOAD_URL
# exit
$ exit
```

### 2. Apagar el agente

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 3. Eliminar la versión anterior

Primero, encuentre el nombre de archivo de la versión anterior:
```
switch# show extensions
```

Ejecute los siguientes comandos para eliminar la versión anterior. Reemplace `<OLD_VERSION>` con la versión anterior de la salida anterior:
```
switch# delete flash:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. Instalar la nueva versión

```
switch# copy flash:TELEMETRY_FILENAME extension:
switch# extension TELEMETRY_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. Reactivar el agente

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# no shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 6. Verificar la actualización

El Estado debe ser "A, I, B".
```
switch# show extensions
```

### 7. Verificar la salida de registro del Agente de Telemetría

```
show agent doublezero-telemetry log
```

---

## Monitorización {#monitoring}

> ⚠️ **Importante:**
>
>  1. Para los ejemplos de configuración a continuación, tenga en cuenta si sus agentes están utilizando un VRF de gestión.
>  2. El agente de configuración y el agente de telemetría utilizan el mismo puerto de escucha (:8080) para su endpoint de métricas por defecto. Si está habilitando métricas en ambos, use el flag `-metrics-addr` para establecer puertos de escucha únicos para cada agente.

### Métricas del Agente de Configuración

El agente de configuración en el dispositivo DoubleZero tiene la capacidad de exponer métricas compatibles con prometheus configurando el flag `-metrics-enable` en la configuración del daemon `doublezero-agent`. El puerto de escucha predeterminado es tcp/8080 pero puede cambiarse para adaptarse al entorno mediante `-metrics-addr`:
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

Las siguientes métricas específicas de DoubleZero se exponen junto con métricas de runtime específicas de go:
```
$ curl -s 10.0.0.11:2112/metrics | grep doublezero

# HELP doublezero_agent_apply_config_errors_total Number of errors encountered while applying config to the device
# TYPE doublezero_agent_apply_config_errors_total counter
doublezero_agent_apply_config_errors_total 0

# HELP doublezero_agent_bgp_neighbors_errors_total Number of errors encountered while retrieving BGP neighbors from the device
# TYPE doublezero_agent_bgp_neighbors_errors_total counter
doublezero_agent_bgp_neighbors_errors_total 0

# HELP doublezero_agent_build_info Build information of the agent
# TYPE doublezero_agent_build_info gauge
doublezero_agent_build_info{commit="4378018f",date="2025-09-23T14:07:48Z",version="0.6.5~git20250923140746.4378018f"} 1

# HELP doublezero_agent_get_config_errors_total Number of errors encountered while getting config from the controller
# TYPE doublezero_agent_get_config_errors_total counter
doublezero_agent_get_config_errors_total 0
```

#### Errores de Alta Señal

- `up` - Esta es la métrica de serie temporal generada automáticamente por prometheus si la instancia de scrape está saludable y accesible. Si no lo está, el agente no es accesible o el agente no está en ejecución.
- `doublezero_agent_apply_config_errors_total` - La configuración que el agente intenta aplicar ha fallado. En esta situación, los usuarios no podrán incorporarse al dispositivo y los cambios de configuración on-chain no se aplicarán hasta que esto se resuelva.
- `doublezero_agent_get_config_errors_total` - Esto indica que el agente de configuración local no puede comunicarse con el controlador de DoubleZero. En la mayoría de los casos, esto puede deberse a un problema con la conectividad de gestión del dispositivo. Similar a la métrica anterior, los usuarios no podrán incorporarse al dispositivo y los cambios de configuración on-chain no se aplicarán hasta que esto se resuelva.

### Métricas del Agente de Telemetría

El agente de telemetría en el dispositivo DoubleZero tiene la capacidad de exponer métricas compatibles con prometheus configurando el flag `-metrics-enable` en la configuración del daemon `doublezero-telemetry`. El puerto de escucha predeterminado es tcp/8080 pero puede cambiarse para adaptarse al entorno mediante `-metrics-addr`:
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

Las siguientes métricas específicas de DoubleZero se exponen junto con métricas de runtime específicas de go:
```
$ curl -s 10.0.0.11:2113/metrics | grep doublezero

# HELP doublezero_device_telemetry_agent_build_info Build information of the device telemetry agent
# TYPE doublezero_device_telemetry_agent_build_info gauge
doublezero_device_telemetry_agent_build_info{commit="4378018f",date="2025-09-23T14:07:45Z",version="0.6.5~git20250923140743.4378018f"} 1

# HELP doublezero_device_telemetry_agent_errors_total Number of errors encountered
# TYPE doublezero_device_telemetry_agent_errors_total counter
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_program_load"} 7
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_write_samples"} 8
doublezero_device_telemetry_agent_errors_total{error_type="collector_submit_samples_on_close"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_getting_local_interfaces"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_finding_local_tunnel"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_link_tunnel_net_invalid"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_initialize_account"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_retries_exhausted"} 0

# HELP doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels Number of local tunnel interfaces not found during peer discovery
# TYPE doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels gauge
doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels{local_device_pk="8PQkip3CxWhQTdP7doCyhT2kwjSL2csRTdnRg2zbDPs1"} 0
```

#### Errores de Alta Señal

- `up` - Esta es la métrica de serie temporal generada automáticamente por prometheus si la instancia de scrape está saludable y accesible. Si no lo está, el agente no es accesible o el agente no está en ejecución.
- `doublezero_device_telemetry_agent_errors_total` con un `error_type` de `submitter_failed_to_write_samples` - Esta es una señal de que el agente de telemetría no puede escribir muestras on-chain, lo cual podría deberse a problemas de conectividad de gestión en el dispositivo.

---

## Gestión de Enlaces

### Drenaje de Enlaces {#link-draining}

El drenaje de enlaces permite a los contribuidores retirar de forma ordenada un enlace del servicio activo para mantenimiento o resolución de problemas. Hay dos estados de drenaje:

| Estado | Comportamiento IS-IS | Descripción |
|--------|----------------------|-------------|
| `soft-drained` | Métrica establecida en 1.000.000 | El enlace es despriorizado. El tráfico utilizará rutas alternativas si están disponibles, pero seguirá usando este enlace si es la única opción. |
| `hard-drained` | Establecido como pasivo | El enlace se elimina completamente del enrutamiento. Ningún tráfico atravesará este enlace. |

### Transiciones de Estado

Las siguientes transiciones de estado están permitidas:

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (debe pasar por soft-drained primero)
```

> ⚠️ **Nota:**
> No puede pasar directamente de `hard-drained` a `activated`. Primero debe transicionar a `soft-drained` y luego a `activated`.

### Drenaje Suave de un Enlace

El drenaje suave desprioriza un enlace estableciendo su métrica IS-IS en 1.000.000. El tráfico preferirá rutas alternativas pero aún puede usar este enlace si es necesario.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### Drenaje Duro de un Enlace

El drenaje duro elimina el enlace del enrutamiento completamente estableciendo IS-IS en modo pasivo. Ningún tráfico atravesará este enlace.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### Restaurar un Enlace a Activo

Para devolver un enlace drenado a la operación normal:

```bash
# Desde soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# Desde hard-drained (debe pasar por soft-drained primero)
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### Sobreescritura de Retardo

La función de sobreescritura de retardo permite a los contribuidores cambiar temporalmente el retardo efectivo de un enlace sin modificar el valor de retardo medido real. Esto es útil para degradar temporalmente un enlace de ruta primaria a secundaria.

### Establecer una Sobreescritura de Retardo

Para sobreescribir el retardo de un enlace (haciéndolo menos preferido en el enrutamiento):

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

Los valores válidos son de `0.01` a `1000` milisegundos.

### Eliminar una Sobreescritura de Retardo

Para eliminar la sobreescritura y volver a usar el retardo medido real:

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **Nota:**
> Cuando un enlace está en estado soft-drained, tanto `delay_ms` como `delay_override_ms` se sobreescriben a 1000ms (1 segundo) para asegurar la despriorización.