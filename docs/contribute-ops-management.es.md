# Gestión OPS

El portal de Gestión OPS de DoubleZero es donde los contribuidores registran y hacen seguimiento de incidentes (interrupciones no planificadas) y mantenimientos (trabajos planificados) en toda la red. Todos los tickets son visibles para todos los contribuidores.

**Portal:** [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management)

## Portal vs Slack

El portal de Gestión OPS y Slack trabajan juntos. Todos los incidentes y mantenimientos se registran como tickets, accesibles a través del portal o la API. Cada ticket notifica automáticamente a los canales de Slack correspondientes y proporciona a cada contribuidor una vista compartida de lo que está ocurriendo en la red. Slack es donde sucede la conversación: compartir registros, coordinarse con otros contribuidores y colaborar en problemas activos.

Los tickets son el registro canónico, ya sean creados a través del portal o la API. Los hilos de Slack no lo son: no actualizan el estado del ticket y no se almacenan de forma permanente. Mantén siempre el estado del ticket actualizado, incluso si la conversación está ocurriendo en Slack.

El portal y Slack sirven para propósitos diferentes. Usa ambos, pero para las cosas adecuadas.

| Usa el portal (o la API) para... | Usa Slack para... |
|-------------------------------|-----------------|
| Abrir, actualizar y cerrar tickets | Conversación y colaboración sobre un problema activo |
| Registrar transiciones de estado | Compartir registros, capturas de pantalla o iniciar una llamada |
| Asignar o escalar un ticket | Conseguir atención rápida sobre un problema |
| Establecer la causa raíz al cerrar | Coordinarse con otros contribuidores |



---

## Incorporación

Completa estos pasos una vez antes de usar el portal.

### 1. Configura tu clave de Ops Manager

Registra una pubkey de wallet de Solana como tu clave de Ops Manager. Wallets compatibles: Phantom, Solflare, Coinbase Wallet.

```bash
doublezero contributor update \
  --ops-manager <OPS_MANAGER_PUBKEY> \
  --pubkey <CONTRIBUTOR_PUBKEY>
```

### 2. Conecta tu wallet en el portal

1. Navega a [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management).
2. Haz clic en **Connect Your Wallet** y selecciona tu wallet.
3. Firma el mensaje para demostrar la propiedad de tu clave de Ops Manager.

Una vez autenticado, se muestra la **Tabla de seguimiento de incidentes**.

La configuración de la cuenta se encuentra detrás del menú **Settings** (el icono de engranaje, arriba a la derecha): Gestión de claves API, Gestión de usuarios y Contactos de escalación. Las opciones que ves dependen de tu rol.

### 3. Crear claves API (opcional)

Para acceso programático en lugar del formulario web:

1. Abre el menú **Settings** (icono de engranaje) y elige **API Key Management**.
2. Crea una o más claves API.
3. Descarga la documentación de la API desde esta página.

---

## Incidentes

Un incidente es un evento no planificado que impacta el servicio.

### Niveles de severidad

Asigna la severidad según el impacto en la red de DoubleZero. Puedes actualizar la severidad a medida que la situación evoluciona.

| Severidad | Impacto | Respuesta |
|----------|--------|----------|
| `sev1` | Interrupción total o rotura importante del plano de control/datos sin alternativa | Deja todo inmediatamente, incluso fuera del horario laboral. Escala a la Fundación DoubleZero de inmediato. |
| `sev2` | Impacto parcial pero sustancial; servicio degradado con posible alternativa | Tratar como urgente. Coordinar activamente. Se requiere respuesta nocturna para degradación sostenida. |
| `sev3` | Impacto limitado o no visible para el usuario; potencial de escalar si no se resuelve | Máxima prioridad durante el horario laboral. Monitorear de cerca. No se requiere escalación fuera de horario a menos que el impacto aumente. |

??? note "Ejemplos de severidad"

    **Ejemplos de Sev1**

    - Más del 10% del tráfico de usuarios descartado en DoubleZero, sin alternativa a internet público
    - Más del 80% de los intentos de incorporación, conexión o desconexión de usuarios fallando
    - Más del 20% de los DZDs reportando errores de interfaz
    - El controlador devolviendo configuraciones válidas pero incorrectas a los agentes DZD

    **Ejemplos de Sev2**

    - Más del 20% de los usuarios sin poder enviar/recibir tráfico por túneles de DoubleZero, pero con alternativa a internet público
    - 0–10% del tráfico de usuarios descartado en DoubleZero sin alternativa
    - 20–80% de los nuevos intentos de incorporación, conexión o desconexión de usuarios fallando
    - Más del 20% de los agentes de configuración sin poder aplicar la configuración de DZD
    - 0–20% de los DZDs reportando errores de interfaz
    - Problemas upstream causando pérdida de observabilidad (monitoreo/alertas caídos)
    - Pipeline de datos onchain caído o produciendo datos incorrectos
    - Más del 20% de la recolección o envío de latencia de internet fallando
    - Controlador inaccesible por los agentes DZD
    - Controlador devolviendo configuraciones inválidas a los DZDs que no serán aplicadas

    **Ejemplos de Sev3**

    - 0–20% de los usuarios sin poder enviar/recibir tráfico por túneles de DoubleZero, con alternativa a internet público
    - 0–20% de los DZDs reportando errores de interfaz
    - 0–20% de los DZDs experimentando fallos del agente de configuración
    - 0–20% de los intentos de incorporación, conexión o desconexión de usuarios fallando
    - Más del 20% de la recolección o envío de latencia de internet fallando para un solo proveedor de datos
    - 0–20% de la recolección o envío de latencia de internet fallando para todos los proveedores de datos
    - Bugs o deuda técnica causando ruido en las alertas que no puede ser silenciado
    - DIA caído o problemas de red del ledger RPC para 0–20% de los dispositivos durante varias horas
    - Problemas de bajo impacto como bugs menores, errores cosméticos o incidentes aislados que no afectan el tráfico de clientes
    - Una pequeña fracción de dispositivos reportando errores intermitentes sin interrupción del servicio

### Abrir un incidente

Haz clic en **Create New Record**, selecciona Type = **Incident** en el portal, o envía a través de la API.

**Obligatorio:**

| Campo | Descripción |
|-------|-------------|
| `title` | Resumen breve (máximo 100 caracteres) |
| `description` | Explicación detallada (máximo 500 caracteres) |
| `severity` | `sev1`, `sev2` o `sev3` |
| `status` | No se puede establecer en un estado terminal (`resolved`, `closed`) al crear |
| Dispositivo y/o Enlace | Al menos uno obligatorio. En el formulario web, selecciona de un desplegable con los códigos de tus dispositivos y enlaces. Al usar la API, pasa las pubkeys correspondientes como `device_pubkey` y/o `affected_link_pubkey`. |

**Opcional:**

| Campo | Descripción |
|-------|-------------|
| `reporter_name` / `reporter_email` | Tus datos de contacto |
| `assignee` | Quién es responsable de la resolución |
| `internal_reference` | Tu ID de ticket interno (ej. Jira, ServiceNow) |
| `start_at` | Por defecto es la hora de creación; editable |

Una vez creado, se publica una notificación en el canal de Slack de incidentes de contribuidores con el ID del ticket, la severidad, los dispositivos/enlaces afectados y el nombre del contribuidor.

### Actualizar un incidente

A medida que el incidente progresa, mantén el estado del ticket actualizado. Esta es la señal que otros contribuidores y DZ usan para entender en qué se está trabajando.

| Estado | Cuándo establecerlo |
|--------|----------------|
| `open` | Estado inicial: problema reportado, aún no se está trabajando en él |
| `acknowledged` | Lo has visto y has tomado responsabilidad |
| `investigating` | Diagnosticando activamente: recopilando registros, verificando métricas |
| `mitigating` | Causa raíz conocida o sospechada; aplicando una solución o alternativa |
| `monitoring` | Solución aplicada; observando para confirmar que se mantiene |
| `resolved` | Problema confirmado como resuelto; **causa raíz obligatoria** |
| `closed` | Completamente finalizado; sin más acciones; **causa raíz obligatoria** |

```
open → acknowledged → investigating → mitigating → monitoring → resolved → closed
```

Puedes omitir estados si es apropiado. Por ejemplo, saltar directamente de `open` a `investigating` si comienzas a trabajar en ello inmediatamente. Usa siempre el estado más preciso para la situación actual.

Cada actualización de estado publica una respuesta en el hilo de la notificación original de Slack.

### Cerrar un incidente

Para mover un incidente a `resolved` o `closed`, se debe establecer una **causa raíz**. Puedes establecer la causa raíz en cualquier etapa anterior si ya la conoces; se vuelve obligatoria al cerrar.

| Código | Descripción |
|------|-------------|
| `hardware` | Reparación, reemplazo o actualización de hardware (SFP, NIC, cable, dispositivo) |
| `software` | Corrección, actualización o reinicio de software o firmware |
| `configuration` | Cambio, corrección o reversión de configuración |
| `capacity` | Congestión, límites de capacidad o gestión de tráfico |
| `carrier` | Problema del proveedor de circuito, longitud de onda o cross-connect |
| `network_external` | Problema de red externa fuera del control del contribuidor |
| `facility` | Problema de infraestructura del centro de datos (energía, refrigeración) |
| `fiber_cut` | Daño físico de fibra reparado |
| `security` | Incidente de seguridad mitigado |
| `human_error` | Error operativo corregido |
| `false_positive` | No se encontró ningún problema real tras la investigación |
| `duplicate` | Ya registrado en otro ticket |
| `self_resolved` | Problema resuelto sin intervención |
| `dz_managed` | Problema con un componente de software gestionado por DoubleZero (activator, controller, etc.) |

---

## Mantenimiento

Un registro de mantenimiento es una actividad planificada y con tiempo limitado que puede afectar la disponibilidad. Créalo con antelación para que otros contribuidores puedan verlo y evitar ventanas conflictivas.

### Programar un mantenimiento

Haz clic en **Create New Record** > **Maintenance** en el portal, o envía a través de la API.

**Obligatorio:**

| Campo | Descripción |
|-------|-------------|
| `title` | Resumen breve (máximo 100 caracteres) |
| `description` | Explicación detallada (máximo 500 caracteres) |
| `start_at` | Hora de inicio planificada (UTC) |
| `end_at` | Hora de fin planificada (UTC); debe ser posterior a `start_at` |
| Dispositivo y/o Enlace | Al menos uno obligatorio. En el formulario web, selecciona de un desplegable con los códigos de tus dispositivos y enlaces. Al usar la API, pasa las pubkeys correspondientes como `device_pubkey` y/o `affected_link_pubkey`. |

Una vez creado, se publica una notificación en el canal de Slack de mantenimiento de contribuidores con el ID del ticket, los dispositivos/enlaces afectados, la ventana planificada y el nombre del contribuidor.

### Gestionar el estado del mantenimiento

Mantén el estado actualizado a medida que la ventana progresa.

| Estado | Cuándo establecerlo |
|--------|----------------|
| `planned` | Programado, aún no iniciado |
| `in-progress` | El trabajo ha comenzado |
| `completed` | Trabajo finalizado exitosamente |
| `closed` | Se establece automáticamente 24 horas después de `end_at` |
| `cancelled` | Cancelado antes o durante la ejecución |

```
planned → in-progress → completed → closed (auto 24h after end_at)
    ↓          ↓
    └──────────┴──→ cancelled
```

---

## Contactos de escalación

Los contactos de escalación indican a DoubleZero y a otros contribuidores a quién contactar cuando tu parte de la red tiene un problema. Tú configuras tus propios contactos para tu organización. Un contacto puede ser una persona o un equipo, como tu NOC. Cada contacto tiene una o más formas de contactarlo y un horario de cuándo está de guardia.

Abre el menú **Settings** (icono de engranaje) y elige **Escalation Contacts**. Solo los ops managers pueden añadir o editar contactos.

### Añadir un contacto

Para cada contacto, establece:

| Campo | Descripción |
|-------|-------------|
| Nombre | Un nombre para el contacto, ya sea una persona o un equipo como tu NOC |
| Zona horaria | La zona horaria local, utilizada para leer el horario |
| Disponibilidad | **24/7**, o uno o más intervalos semanales cuando el contacto está de guardia |
| Métodos de contacto | Una o más formas de contactar, en orden de prioridad |

Los métodos de contacto admitidos son email, teléfono, Slack, Telegram y WhatsApp. El orden importa: el primer método es el que se debe intentar primero.

### Disponibilidad y brechas de cobertura

Un contacto está disponible las 24 horas del día (24/7) o disponible durante intervalos semanales que defines, por ejemplo de lunes a viernes, de 09:00 a 17:00. Los intervalos se introducen en la zona horaria local del contacto y se muestran en UTC, por lo que el horario de verano se gestiona automáticamente.

La vista de **brechas de cobertura** muestra los momentos de cada semana en los que nadie de tu organización está de guardia. Úsala para encontrar y cerrar brechas.

### Ventanas de rotación

La semana se divide en ventanas de media hora. Para cada ventana puedes establecer el orden en que se contacta a tus contactos. Esto te permite ejecutar una rotación de guardia sin editar cada contacto.

### Visibilidad

Tú controlas quién puede ver tus contactos. DoubleZero siempre puede verlos. Tú eliges quién más puede:

| Configuración | Quién más puede ver tus contactos |
|---------|-------------------------------|
| Solo DoubleZero (por defecto) | Ningún otro contribuidor |
| Todos | Todos los contribuidores |
| Algunos contribuidores | Solo los contribuidores que selecciones |

Tu propio equipo siempre puede ver tus contactos. La visibilidad se configura una vez para toda tu organización y se aplica a todos tus contactos.

---

## Gestión de usuarios

Por defecto, tu clave de Ops Manager es la única cuenta que puede actuar en nombre de tu organización. Puedes añadir miembros del equipo para que más de una persona pueda gestionar tus tickets.

Abre el menú **Settings** (icono de engranaje) y elige **User Management**. Solo los ops managers pueden añadir o eliminar miembros del equipo.

Para cada miembro del equipo, establece:

| Campo | Descripción |
|-------|-------------|
| Nombre | El nombre de la persona |
| Pubkey de wallet | La wallet de Solana con la que inician sesión |
| Nivel de acceso | **Read** o **Read-write** |

Niveles de acceso:

- **Read**: puede ver tickets y contactos de escalación, y crear claves API de solo lectura. No puede crear, actualizar ni cerrar tickets.
- **Read-write**: acceso completo para crear, actualizar y cerrar tickets, y puede crear claves API de cualquier nivel.

Cada miembro del equipo inicia sesión con su propia wallet, de la misma manera que conectaste tu clave de Ops Manager.

---

## Permisos y escalación

### Qué pueden hacer los contribuidores

- Crear y gestionar tickets solo para sus propios dispositivos y enlaces.
- Asignar tickets a sí mismos o escalar a DZ/Malbeclabs.
- Ver todos los tickets de todos los contribuidores.
- Añadir miembros del equipo y establecer su nivel de acceso (solo ops managers).
- Gestionar contactos de escalación para su organización (solo ops managers).

### Qué pueden hacer los administradores de DZ/Malbeclabs

- Crear tickets para los dispositivos y enlaces de cualquier contribuidor.
- Asignar o reasignar tickets entre contribuidores.
- Gestionar escalaciones y solicitudes de soporte.

### Propiedad de enlaces DZX

Los enlaces DZX conectan dispositivos de dos contribuidores diferentes. El contribuidor del **lado A** (primer dispositivo en el nombre del enlace) es el propietario del enlace y es el único que puede crear tickets para él.

**Ejemplo:** Para el enlace `deviceA:deviceB`, el contribuidor que posee `deviceA` es el propietario del enlace.

**Si el problema está en el lado Z:**

1. El contribuidor del lado A crea un ticket para el enlace DZX.
2. Asigna el ticket a DZ/Malbeclabs.
3. DZ/Malbeclabs investiga y reasigna al contribuidor del lado Z si es necesario.

Reconocemos que este flujo de trabajo es limitado. Los contribuidores del lado Z actualmente no pueden crear tickets para enlaces DZX que no poseen, lo que significa que la coordinación tiene que pasar por DZ/Malbeclabs. Estamos trabajando para mejorar esto de modo que ambos lados de un enlace DZX puedan declarar incidentes y mantenimientos de forma independiente.