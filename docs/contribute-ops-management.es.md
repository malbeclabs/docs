---
description: Utilice el portal de gestión OPS de DoubleZero para registrar y dar seguimiento a incidentes de red y mantenimientos planificados.
---

# OPS Management

El portal OPS Management de DoubleZero es donde los contribuidores registran y dan seguimiento a incidentes (interrupciones no planificadas) y mantenimientos (trabajos planificados) en toda la red. Todos los tickets son visibles para todos los contribuidores.

**Portal:** [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management)

## Portal vs Slack

El portal OPS Management y Slack trabajan juntos. Todos los incidentes y mantenimientos se registran como tickets, accesibles a través del portal o la API. Cada ticket notifica automáticamente a los canales de Slack correspondientes y ofrece a cada contribuidor una vista compartida de lo que está ocurriendo en la red. Slack es donde ocurre la conversación: compartir logs, coordinarse con otros contribuidores y colaborar en problemas activos.

Los tickets son el registro canónico, ya sea que se creen a través del portal o la API. Los hilos de Slack no lo son: no actualizan el estado del ticket y no se almacenan de forma permanente. Mantenga siempre el estado del ticket actualizado, incluso si la conversación está ocurriendo en Slack.

El portal y Slack sirven para propósitos diferentes. Use ambos, pero para lo adecuado.

| Use el portal (o la API) para... | Use Slack para... |
|-------------------------------|-----------------|
| Abrir, actualizar y cerrar tickets | Conversación y colaboración sobre un problema activo |
| Registrar transiciones de estado | Compartir logs, capturas de pantalla o iniciar una llamada |
| Asignar o escalar un ticket | Hacer que otros vean un problema rápidamente |
| Establecer la causa raíz al cerrar | Coordinarse con otros contribuidores |



---

## Incorporación

Complete estos pasos una sola vez antes de usar el portal.

### 1. Configure Su Clave de Ops Manager

Registre una clave pública de billetera Solana como su clave de Ops Manager. Billeteras compatibles: Phantom, Solflare, Coinbase Wallet.

```bash
doublezero contributor update \
  --ops-manager <OPS_MANAGER_PUBKEY> \
  --pubkey <CONTRIBUTOR_PUBKEY>
```

### 2. Conecte Su Billetera en el Portal

1. Navegue a [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management).
2. Haga clic en **Connect Your Wallet** y seleccione su billetera.
3. Firme el mensaje para demostrar la propiedad de su clave de Ops Manager.

Una vez autenticado, se muestra la **Incident Tracking Table**.

La configuración de la cuenta se encuentra detrás del menú **Settings** (el ícono de engranaje, arriba a la derecha): API Key Management, User Management y Escalation Contacts. Las opciones que ve dependen de su rol.

### 3. Crear Claves de API (Opcional)

Para acceso programático en lugar del formulario web:

1. Abra el menú **Settings** (ícono de engranaje) y elija **API Key Management**.
2. Cree una o más claves de API.
3. Descargue la documentación de la API desde esta página.

---

## Incidentes

Un incidente es un evento no planificado que impacta el servicio.

### Niveles de Severidad {#severity-levels}

Asigne la severidad en función del impacto en la red DoubleZero. Puede actualizar la severidad a medida que la situación evoluciona.

| Severidad | Impacto | Respuesta |
|----------|--------|----------|
| `sev1` | Interrupción total o fallo mayor del plano de control/datos sin alternativa | Deje todo inmediatamente, incluso fuera del horario laboral. Escale a DoubleZero Foundation de inmediato. |
| `sev2` | Impacto parcial pero sustancial; servicio degradado con posible alternativa | Trate como urgente. Coordine activamente. Se requiere respuesta nocturna para degradación sostenida. |
| `sev3` | Impacto limitado o sin impacto visible para el usuario; potencial de escalamiento si no se resuelve | Máxima prioridad durante horario laboral. Monitoree de cerca. No se requiere escalamiento fuera de horario a menos que el impacto aumente. |

??? note "Ejemplos de severidad"

    **Ejemplos de Sev1**

    - Más del 10% del tráfico de usuarios descartado en DoubleZero, sin alternativa a internet público
    - Más del 80% de los intentos de incorporación, conexión o desconexión de usuarios fallando
    - Más del 20% de los DZDs reportando errores de interfaz
    - Controller devolviendo configuraciones válidas pero incorrectas a los agentes DZD

    **Ejemplos de Sev2**

    - Más del 20% de los usuarios sin poder enviar/recibir tráfico a través de los túneles DoubleZero, pero con alternativa a internet público
    - 0–10% del tráfico de usuarios descartado en DoubleZero sin alternativa
    - 20–80% de los nuevos intentos de incorporación, conexión o desconexión de usuarios fallando
    - Más del 20% de los agentes de configuración sin poder aplicar la configuración DZD
    - 0–20% de los DZDs reportando errores de interfaz
    - Problemas de upstream causando pérdida de observabilidad (monitoreo/alertas caídos)
    - Pipeline de datos onchain caído o produciendo datos incorrectos
    - Más del 20% de la recolección o envío de latencia de internet fallando
    - Controller inaccesible por los agentes DZD
    - Controller devolviendo configuraciones inválidas a los DZDs que no se aplicarán

    **Ejemplos de Sev3**

    - 0–20% de los usuarios sin poder enviar/recibir tráfico a través de los túneles DoubleZero, con alternativa a internet público
    - 0–20% de los DZDs reportando errores de interfaz
    - 0–20% de los DZDs experimentando fallos del agente de configuración
    - 0–20% de los intentos de incorporación, conexión o desconexión de usuarios fallando
    - Más del 20% de la recolección o envío de latencia de internet fallando para un único proveedor de datos
    - 0–20% de la recolección o envío de latencia de internet fallando para todos los proveedores de datos
    - Bugs o deuda técnica causando ruido en alertas que no se puede silenciar
    - DIA caído o problemas de red del ledger RPC para 0–20% de los dispositivos durante varias horas
    - Problemas de bajo impacto como bugs menores, errores cosméticos o incidentes aislados que no afectan el tráfico de clientes
    - Pequeña fracción de dispositivos reportando errores intermitentes sin interrupción del servicio

### Abrir un Incidente

Haga clic en **Create New Record**, seleccione Type = **Incident** en el portal, o envíe a través de la API.

**Obligatorio:**

| Campo | Descripción |
|-------|-------------|
| `title` | Resumen corto (máx. 100 caracteres) |
| `description` | Explicación detallada (máx. 500 caracteres) |
| `severity` | `sev1`, `sev2` o `sev3` |
| `status` | No se puede establecer en un estado terminal (`resolved`, `closed`) al crear |
| Device y/o Link | Al menos uno es obligatorio. En el formulario web, seleccione de un desplegable con los códigos de sus dispositivos y enlaces. Al usar la API, pase las claves públicas correspondientes como `device_pubkey` y/o `affected_link_pubkey`. |

**Opcional:**

| Campo | Descripción |
|-------|-------------|
| `reporter_name` / `reporter_email` | Sus datos de contacto |
| `assignee` | Quién es responsable de la resolución |
| `internal_reference` | Su ID de ticket interno (ej. Jira, ServiceNow) |
| `start_at` | Por defecto es la hora de creación; editable |

Una vez creado, se publica una notificación en el canal de Slack de incidentes de contribuidores con el ID del ticket, severidad, dispositivos/enlaces afectados y nombre del contribuidor.

### Actualizar un Incidente

A medida que el incidente progresa, mantenga el estado del ticket actualizado. Esta es la señal que otros contribuidores y DZ usan para entender en qué se está trabajando.

| Estado | Cuándo establecerlo |
|--------|----------------|
| `open` | Estado inicial: problema reportado, aún no se está trabajando en él |
| `acknowledged` | Lo ha visto y ha tomado responsabilidad |
| `investigating` | Diagnosticando activamente: recopilando logs, revisando métricas |
| `mitigating` | Causa raíz conocida o sospechada; aplicando una corrección o solución temporal |
| `monitoring` | Corrección aplicada; observando para confirmar que se mantiene |
| `resolved` | Problema confirmado como corregido; **causa raíz obligatoria** |
| `closed` | Completamente finalizado; sin más acciones; **causa raíz obligatoria** |

```
open → acknowledged → investigating → mitigating → monitoring → resolved → closed
```

Puede omitir estados si es apropiado. Por ejemplo, saltar directamente de `open` a `investigating` si comienza a trabajar en ello inmediatamente. Use siempre el estado más preciso para la situación actual.

Cada actualización de estado publica una respuesta en el hilo de la notificación original de Slack.

### Cerrar un Incidente

Para mover un incidente a `resolved` o `closed`, se debe establecer una **causa raíz**. Puede establecer la causa raíz en cualquier etapa anterior si ya la conoce; se vuelve obligatoria al cerrar.

| Código | Descripción |
|------|-------------|
| `hardware` | Reparación, reemplazo o actualización de hardware (SFP, NIC, cable, dispositivo) |
| `software` | Corrección, actualización o reinicio de software o firmware |
| `configuration` | Cambio, corrección o reversión de configuración |
| `capacity` | Congestión, límites de capacidad o gestión de tráfico |
| `carrier` | Problema del proveedor de circuito, longitud de onda o cross-connect |
| `network_external` | Problema de red externo fuera del control del contribuidor |
| `facility` | Problema de infraestructura del centro de datos (energía, refrigeración) |
| `fiber_cut` | Daño físico de fibra reparado |
| `security` | Incidente de seguridad mitigado |
| `human_error` | Error operativo corregido |
| `false_positive` | No se encontró ningún problema real después de la investigación |
| `duplicate` | Ya registrado en otro ticket |
| `self_resolved` | Problema resuelto sin intervención |
| `dz_managed` | Problema con un componente de software gestionado por DoubleZero (activator, controller, etc.) |

---

## Mantenimiento

Un registro de mantenimiento es una actividad planificada y delimitada en el tiempo que puede afectar la disponibilidad. Créelo con anticipación para que otros contribuidores puedan verlo y evitar ventanas conflictivas.

### Programar Mantenimiento

Haga clic en **Create New Record** > **Maintenance** en el portal, o envíe a través de la API.

**Obligatorio:**

| Campo | Descripción |
|-------|-------------|
| `title` | Resumen corto (máx. 100 caracteres) |
| `description` | Explicación detallada (máx. 500 caracteres) |
| `severity` | `sev1`, `sev2` o `sev3`. Establézcala según el impacto esperado en el usuario (vea la nota a continuación). |
| `start_at` | Hora de inicio planificada (UTC) |
| `end_at` | Hora de fin planificada (UTC); debe ser posterior a `start_at` |
| Device y/o Link | Al menos uno es obligatorio. En el formulario web, seleccione de un desplegable con los códigos de sus dispositivos y enlaces. Al usar la API, pase las claves públicas correspondientes como `device_pubkey` y/o `affected_link_pubkey`. |

La severidad se aplica al mantenimiento de la misma manera que a los incidentes. Establézcala según el impacto en el usuario que espera durante la ventana, usando los [niveles de severidad anteriores](#severity-levels).

Una vez creado, se publica una notificación en el canal de Slack de mantenimiento de contribuidores con el ID del ticket, dispositivos/enlaces afectados, ventana planificada y nombre del contribuidor.

### Gestión del Estado de Mantenimiento

Mantenga el estado actualizado a medida que la ventana progresa.

| Estado | Cuándo establecerlo |
|--------|----------------|
| `planned` | Programado, aún no iniciado |
| `in-progress` | El trabajo ha comenzado |
| `completed` | El trabajo finalizó exitosamente |
| `closed` | Se establece automáticamente 24 horas después de `end_at` |
| `cancelled` | Cancelado antes o durante la ejecución |

```
planned → in-progress → completed → closed (auto 24h after end_at)
    ↓          ↓
    └──────────┴──→ cancelled
```

---

## Contactos de Escalamiento

Los contactos de escalamiento indican a DoubleZero y a otros contribuidores a quién contactar cuando su parte de la red tiene un problema. Usted configura sus propios contactos para su organización. Un contacto puede ser una persona o un equipo, como su NOC. Cada contacto tiene una o más formas de comunicarse y un horario de guardia.

Abra el menú **Settings** (ícono de engranaje) y elija **Escalation Contacts**. Solo los ops managers pueden agregar o editar contactos.

### Agregar un Contacto

Para cada contacto, establezca:

| Campo | Descripción |
|-------|-------------|
| Name | Un nombre para el contacto, ya sea una persona o un equipo como su NOC |
| Timezone | La zona horaria local, utilizada para interpretar el horario |
| Availability | **24/7**, o una o más franjas horarias semanales en las que el contacto está de guardia |
| Contact methods | Una o más formas de contactar, en orden de prioridad |

Los métodos de contacto admitidos son email, teléfono, Slack, Telegram y WhatsApp. El orden importa: el primer método es el que se debe intentar primero.

### Disponibilidad y Brechas de Cobertura

Un contacto está disponible las 24 horas (24/7) o disponible durante franjas horarias semanales que usted defina, por ejemplo de lunes a viernes, de 09:00 a 17:00. Las franjas se ingresan en la zona horaria local del contacto y se muestran en UTC, por lo que el horario de verano se gestiona automáticamente.

La vista de **coverage gaps** muestra los momentos de cada semana en los que nadie de su organización está de guardia. Úsela para encontrar y cerrar brechas.

### Ventanas de Rotación

La semana se divide en ventanas de media hora. Para cada ventana puede establecer el orden en que se contacta a sus contactos. Esto le permite ejecutar una rotación de guardia sin editar cada contacto individualmente.

### Visibilidad

Usted controla quién puede ver sus contactos. DoubleZero siempre puede verlos. Usted elige quién más puede:

| Configuración | Quién más puede ver sus contactos |
|---------|-------------------------------|
| DoubleZero only (predeterminado) | Ningún otro contribuidor |
| Everybody | Todos los contribuidores |
| Some contributors | Solo los contribuidores que usted seleccione |

Su propio equipo siempre puede ver sus contactos. La visibilidad se configura una sola vez para toda su organización y se aplica a todos sus contactos.

---

## Gestión de Usuarios

De forma predeterminada, su clave de Ops Manager es la única cuenta que puede actuar en nombre de su organización. Puede agregar miembros del equipo para que más de una persona pueda gestionar sus tickets.

Abra el menú **Settings** (ícono de engranaje) y elija **User Management**. Solo los ops managers pueden agregar o eliminar miembros del equipo.

Para cada miembro del equipo, establezca:

| Campo | Descripción |
|-------|-------------|
| Name | El nombre de la persona |
| Wallet pubkey | La billetera Solana con la que inicia sesión |
| Access level | **Read** o **Read-write** |

Niveles de acceso:

- **Read**: puede ver tickets y contactos de escalamiento, y crear claves de API de solo lectura. No puede crear, actualizar ni cerrar tickets.
- **Read-write**: acceso completo para crear, actualizar y cerrar tickets, y puede crear claves de API de cualquier nivel.

Cada miembro del equipo inicia sesión con su propia billetera, de la misma manera en que usted conectó su clave de Ops Manager.

---

## Permisos y Escalamiento

### Qué Pueden Hacer los Contribuidores

- Crear y gestionar tickets solo para sus propios dispositivos y enlaces.
- Asignar tickets a sí mismos o escalar a DZ/Malbeclabs.
- Ver todos los tickets de todos los contribuidores.
- Agregar miembros del equipo y establecer su nivel de acceso (solo ops managers).
- Gestionar contactos de escalamiento para su organización (solo ops managers).

### Qué Pueden Hacer los Administradores de DZ/Malbeclabs

- Crear tickets para dispositivos y enlaces de cualquier contribuidor.
- Asignar o reasignar tickets entre contribuidores.
- Gestionar escalamientos y solicitudes de soporte.

### Propiedad de Enlaces DZX

Los enlaces DZX conectan dispositivos de dos contribuidores diferentes. El contribuidor del **lado A** (primer dispositivo en el nombre del enlace) es el propietario del enlace y es el único que puede crear tickets para él.

**Ejemplo:** Para el enlace `deviceA:deviceB`, el contribuidor que posee `deviceA` es el propietario del enlace.

**Si el problema está en el lado Z:**

1. El contribuidor del lado A crea un ticket para el enlace DZX.
2. Asigna el ticket a DZ/Malbeclabs.
3. DZ/Malbeclabs investiga y reasigna al contribuidor del lado Z si es necesario.

Reconocemos que este flujo de trabajo es limitado. Actualmente, los contribuidores del lado Z no pueden crear tickets para enlaces DZX que no poseen, lo que significa que la coordinación debe pasar a través de DZ/Malbeclabs. Estamos trabajando para mejorar esto de modo que ambos lados de un enlace DZX puedan declarar incidentes y mantenimientos de forma independiente.