# Guía de Operaciones para Contribuidores
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."



Esta guía cubre las tareas operativas continuas para mantener sus Dispositivos DoubleZero (DZDs), incluyendo actualizaciones de agentes, actualizaciones de dispositivos/interfaces y gestión de enlaces.

**Requisitos previos**: Antes de usar esta guía, asegúrese de haber:

- Completado la [Guía de Aprovisionamiento de Dispositivos](contribute-provisioning.md)
- Su DZD está completamente operativo con los agentes de Configuración y Telemetría en ejecución

---

## Actualizaciones de Dispositivos

Use `doublezero device update` para modificar la configuración del dispositivo después del aprovisionamiento inicial.

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**Opciones de actualización comunes:**

| Opción | Descripción |
|--------|-------------|
| `--device-type <TYPE>` | Cambiar el modo de operación: `hybrid`, `transit`, `edge` (consulte [Tipos de Dispositivos](contribute-provisioning.md#understanding-device-types)) |
| `--location <LOCATION>` | Mover el dispositivo a una ubicación diferente |
| `--metrics-publisher <PUBKEY>` | Cambiar la clave de editor de métricas |

---

## Actualizaciones de Interfaces

Use `doublezero device interface update` para modificar las interfaces existentes. Este comando acepta las mismas opciones que `interface create`.

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

Para obtener la lista completa de opciones de interfaz incluyendo configuraciones CYOA/DIA, consulte [Creación de Interfaces](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices).

**Ejemplo - Añadir configuraciones CYOA a una interfaz existente:**

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
doublezero device interface list <DEVICE>     # Interfaces de un dispositivo específico
```

---

## Actualización del Agente de Configuración

Cuando se lanza una nueva versión del Agente de Configuración, siga estos pasos para actualizar.

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

Primero, encuentre el nombre del archivo de la versión anterior:
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

El estado debe ser "A, I, B".
```
switch# show extensions
```

### 7. Verificar la salida del log del Agente de Configuración

```
show agent doublezero-agent log
```

---

## Actualización del Agente de Telemetría

Cuando se lanza una nueva versión del Agente de Telemetría, siga estos pasos para actualizar.

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

Primero, encuentre el nombre del archivo de la versión anterior:
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

El estado debe ser "A, I, B".
```
switch# show extensions
```

### 7. Verificar la salida del log del Agente de Telemetría

```
show agent doublezero-telemetry log
```

---

## Monitoreo

> ⚠️ **Importante:**
>
>  1. Para los ejemplos de configuración a continuación, tenga en cuenta si sus agentes están usando un VRF de gestión.
>  2. El agente de configuración y el agente de telemetría usan el mismo puerto de escucha (:8080) para su endpoint de métricas por defecto. Si está habilitando métricas en ambos, use el flag `-metrics-addr` para establecer puertos de escucha únicos para cada agente.

### Métricas del Agente de Configuración

El agente de configuración en el dispositivo DoubleZero tiene la capacidad de exponer métricas compatibles con Prometheus configurando el flag `-metrics-enable` en la configuración del daemon `doublezero-agent`. El puerto de escucha predeterminado es tcp/8080 pero puede cambiarse para adaptarse al entorno mediante `-metrics-addr`:
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

#### Errores de Alta Señal

- `up` - Esta es la métrica de series temporales generada automáticamente por prometheus si la instancia de scrape está saludable y es alcanzable. Si no lo está, el agente no es alcanzable o no está en ejecución.
- `doublezero_agent_apply_config_errors_total` - La configuración que el agente intenta aplicar falló. En esta situación, los usuarios no podrán incorporarse al dispositivo y los cambios de configuración onchain no se aplicarán hasta que esto se resuelva.
- `doublezero_agent_get_config_errors_total` - Esto indica que el agente de configuración local no puede comunicarse con el controlador DoubleZero. En la mayoría de los casos, esto puede deberse a un problema con la conectividad de gestión en el dispositivo. Similar a la métrica anterior, los usuarios no podrán incorporarse al dispositivo y los cambios de configuración onchain no se aplicarán hasta que esto se resuelva.

### Métricas del Agente de Telemetría

El agente de telemetría en el dispositivo DoubleZero tiene la capacidad de exponer métricas compatibles con Prometheus configurando el flag `-metrics-enable` en la configuración del daemon `doublezero-telemetry`. El puerto de escucha predeterminado es tcp/8080 pero puede cambiarse para adaptarse al entorno mediante `-metrics-addr`:
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

#### Errores de Alta Señal

- `up` - Esta es la métrica de series temporales generada automáticamente por prometheus si la instancia de scrape está saludable y es alcanzable. Si no lo está, el agente no es alcanzable o no está en ejecución.
- `doublezero_device_telemetry_agent_errors_total` con un `error_type` de `submitter_failed_to_write_samples` - Esta es una señal de que el agente de telemetría no puede escribir muestras onchain, lo que podría deberse a problemas de conectividad de gestión en el dispositivo.

---

## Gestión de Enlaces

### Drenado de Enlaces

El drenado de enlaces permite a los contribuidores retirar gradualmente un enlace del servicio activo para mantenimiento o solución de problemas. Hay dos estados de drenado:

| Estado | Comportamiento IS-IS | Descripción |
|--------|----------------|-------------|
| `soft-drained` | Métrica establecida en 1,000,000 | El enlace se desprioriza. El tráfico usará rutas alternativas si están disponibles, pero aún usará este enlace si es la única opción. |
| `hard-drained` | Establecido como pasivo | El enlace se retira completamente del enrutamiento. Ningún tráfico atravesará este enlace. |

### Transiciones de Estado

Se permiten las siguientes transiciones de estado:

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (debe pasar primero por soft-drained)
```

> ⚠️ **Nota:**
> No puede ir directamente de `hard-drained` a `activated`. Primero debe transitar a `soft-drained`, luego a `activated`.

### Drenar Suavemente un Enlace

El drenado suave desprioriza un enlace estableciendo su métrica IS-IS en 1,000,000. El tráfico preferirá rutas alternativas pero aún puede usar este enlace si es necesario.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### Drenar Duramente un Enlace

El drenado duro elimina el enlace del enrutamiento por completo estableciendo IS-IS en modo pasivo. Ningún tráfico atravesará este enlace.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### Restaurar un Enlace a Activo

Para devolver un enlace drenado a operación normal:

```bash
# Desde soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# Desde hard-drained (debe pasar primero por soft-drained)
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### Anulación de Retardo

La función de anulación de retardo permite a los contribuidores cambiar temporalmente el retardo efectivo de un enlace sin modificar el valor de retardo medido real. Esto es útil para demotar temporalmente un enlace de ruta primaria a secundaria.

### Establecer una Anulación de Retardo

Para anular el retardo de un enlace (haciéndolo menos preferido en el enrutamiento):

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

Los valores válidos son de `0.01` a `1000` milisegundos.

### Borrar una Anulación de Retardo

Para eliminar la anulación y volver a usar el retardo medido real:

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **Nota:**
> Cuando un enlace está en soft-drained, tanto `delay_ms` como `delay_override_ms` se anulan a 1000ms (1 segundo) para garantizar la desriorización.
