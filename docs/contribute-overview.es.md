---
description: Descripción general y lista de verificación de incorporación para convertirse en contribuidor de la red DoubleZero.
---

# Documentación para Contribuidores

!!! info "Terminología"
    ¿Nuevo en DoubleZero? Consulte el [Glosario](glossary.md) para definiciones de términos clave como [DZD](glossary.md#dzd-doublezero-device), [DZX](glossary.md#dzx-doublezero-exchange) y [CYOA](glossary.md#cyoa-choose-your-own-adventure).

Bienvenido a la documentación para contribuidores de DoubleZero. Esta sección cubre todo lo que necesita para convertirse en un contribuidor de la red.

!!! tip "¿Interesado en convertirse en contribuidor de la red?"
    Revise la página de [Requisitos y Arquitectura](contribute.md) para comprender el hardware, el ancho de banda y la conectividad necesarios para contribuir a la red DoubleZero.

---

## Lista de Verificación de Incorporación

Utilice esta lista de verificación para seguir su progreso. **Todos los elementos deben completarse antes de que su contribución esté técnicamente operativa.**

### Fase 1: Prerrequisitos
- [ ] CLI de DoubleZero instalado en un servidor de gestión
- [ ] Hardware adquirido y que cumple con los [requisitos](contribute.md#hardware-requirements)
- [ ] Espacio en rack del centro de datos y energía disponibles (ver [Rack y Energía](contribute.md#rack-power-requirements))
- [ ] DZD instalado físicamente con conectividad de gestión
- [ ] Bloque público de IPv4 asignado para el protocolo DZ (**ver [Reglas de Prefijos DZ](#reglas-de-prefijos-dz)**)

### Fase 2: Configuración de Cuenta

Esta fase alterna entre el contribuidor y DZF. Cada elemento de **DZF** debe confirmarse antes de que pueda comenzar el siguiente grupo.

**Contribuidor**

- [ ] Nombre de usuario de GitHub enviado a DZF

**DZF**

- [ ] Acceso concedido al repositorio [malbeclabs/contributors](https://github.com/malbeclabs/contributors)

**Contribuidor**

- [ ] Par de claves de servicio generado (`doublezero keygen`)
- [ ] Par de claves del publicador de métricas generado
- [ ] **Clave pública** de la clave de servicio enviada a DZF

**DZF**

- [ ] Cuenta de contribuidor creada onchain

**Contribuidor**

- [ ] Cuenta de contribuidor verificada (`doublezero contributor list`)
- [ ] Gestión de recompensas configurada (no bloquea la puesta en producción, **ver [Rewards Management](https://github.com/malbeclabs/contributors#rewards-management) en el repositorio de contribuidores**)

### Fase 3: Aprovisionamiento de Dispositivos
- [ ] Configuración base del dispositivo aplicada (desde el repositorio de contribuidores)
- [ ] Dispositivo creado onchain (`doublezero device create`)
- [ ] Interfaces del dispositivo registradas
- [ ] Interfaces de loopback creadas (Loopback255 vpnv4, Loopback256 ipv4)
- [ ] Interfaces CYOA/DIA configuradas (si es dispositivo edge/híbrido)

### Fase 4: Establecimiento de Enlaces e Instalación de Agentes
- [ ] Enlaces WAN creados (si aplica)
- [ ] Enlace DZX creado (estado: `requested`)
- [ ] Enlace DZX aceptado por el contribuidor par
- [ ] Config Agent instalado y en ejecución
- [ ] Config Agent recibiendo configuración del controlador
- [ ] Telemetry Agent instalado y en ejecución
- [ ] Publicador de métricas registrado onchain
- [ ] Envíos de telemetría visibles en el ledger

### Fase 5: Período de Prueba de Enlaces
- [ ] Todos los enlaces drenados durante un período de prueba de 24 horas
- [ ] El [panel de estado de enlaces](https://data.doublezero.xyz/status/links) muestra cero pérdidas y cero errores durante 24h
- [ ] Enlaces restaurados después de una prueba limpia

### Fase 6: Verificación y Activación
- [ ] `doublezero device list` muestra su dispositivo (con `max_users = 0`)
- [ ] `doublezero link list` muestra sus enlaces
- [ ] Los registros del Config Agent muestran obtenciones de configuración exitosas
- [ ] Los registros del Telemetry Agent muestran envíos de métricas exitosos
- [ ] **Coordinar con DZ/Malbec Labs** para ejecutar la prueba de conectividad (conectar, recibir rutas, enrutar sobre DZ)
- [ ] Después de que la prueba pase, establecer `max_users` a 96 mediante `doublezero device update`

---

## Obtener Ayuda

Como parte de la incorporación, DZF lo añadirá a los canales de Slack para contribuidores:

| Canal | Propósito |
|-------|-----------|
| **#dz-contributor-announcements** | Comunicaciones oficiales de DZF y Malbec Labs — actualizaciones de CLI/agentes, cambios incompatibles, anuncios de seguridad. Monitoree para actualizaciones críticas; haga preguntas en hilos. |
| **#dz-contributor-incidents** | Eventos no planificados que impactan el servicio. Los incidentes se publican automáticamente vía la API/formulario web con severidad y dispositivos/enlaces afectados. La discusión y resolución de problemas ocurre en hilos. |
| **#dz-contributor-maintenance** | Actividades de mantenimiento planificado (actualizaciones, reparaciones). Programadas vía la API/formulario web con tiempos de inicio/fin planificados. Discusión en hilos. |
| **#dz-contributor-ops** | Discusión abierta para todos los contribuidores — preguntas operativas, ayuda con CLI, compartir runbooks y playbooks. |

También obtendrá un **canal privado de DZ/Malbec Labs** para soporte directo para su organización.

---

## Reglas de Prefijos DZ

!!! warning "Crítico: Uso del Pool de Prefijos DZ"
    El pool de prefijos DZ que usted proporciona es **gestionado por el protocolo DoubleZero para la asignación de IPs**.

    **Cómo se usan los prefijos DZ:**

    - **Primera IP**: Reservada para su dispositivo (asignada a la interfaz Loopback100)
    - **IPs restantes**: Asignadas a tipos específicos de usuarios que se conectan a su DZD:
        - Usuarios `IBRLWithAllocatedIP`
        - Usuarios `EdgeFiltering`
        - Publicadores de multicast
    - **Usuarios IBRL**: NO consumen de este pool (usan su propia IP pública)

    **NO PUEDE usar estas direcciones para:**

    - Su propio equipamiento de red
    - Enlaces punto a punto en interfaces DIA
    - Interfaces de gestión
    - Cualquier infraestructura fuera del protocolo DZ

    **Requisitos:**

    - Deben ser direcciones IPv4 **enrutables globalmente (públicas)**
    - Los rangos de IP privadas (10.x, 172.16-31.x, 192.168.x) son rechazados por el contrato inteligente
    - **Tamaño mínimo: /29** (8 direcciones), se prefieren prefijos más grandes (ej., /28, /27)
    - El bloque completo debe estar disponible - no pre-asigne ninguna dirección

    Si necesita direcciones para su propio equipamiento (IPs de interfaces DIA, gestión, etc.), use un **pool de direcciones separado**.

---

## Referencia Rápida: Términos Clave

¿Nuevo en DoubleZero? Estos son los términos esenciales (ver [Glosario completo](glossary.md)):

| Término | Definición |
|---------|------------|
| **DZD** | DoubleZero Device - su switch Arista físico ejecutando agentes DZ |
| **DZX** | DoubleZero Exchange - punto de interconexión metropolitano donde los contribuidores establecen peering |
| **CYOA** | Choose Your Own Adventure - método de conectividad del usuario (GREOverDIA, GREOverFabric, etc.) |
| **DIA** | Direct Internet Access - conectividad a internet requerida por todos los DZDs para el controlador y la telemetría, comúnmente utilizada como tipo CYOA para la conectividad de usuarios en dispositivos edge/híbridos |
| **WAN Link** | Enlace entre sus propios DZDs (mismo contribuidor) |
| **DZX Link** | Enlace al DZD de otro contribuidor (requiere aceptación mutua) |
| **Config Agent** | Consulta al controlador y aplica la configuración a su DZD |
| **Telemetry Agent** | Recopila métricas de latencia/pérdida TWAMP, las envía al ledger onchain |
| **Service Key** | Su clave de identidad de contribuidor para operaciones con CLI |
| **Metrics Publisher Key** | Clave para firmar envíos de telemetría onchain |
| **Rewards Manager Key** | Clave que controla qué wallets reciben sus recompensas (ver el repositorio de contribuidores) |

---

---

## Estructura de la Documentación

| Guía | Descripción |
|------|-------------|
| [Requisitos y Arquitectura](contribute.md) | Especificaciones de hardware, arquitectura de red, opciones de ancho de banda |
| [Aprovisionamiento de Dispositivos](contribute-provisioning.md) | Paso a paso: acceso al repositorio → claves → dispositivo → enlaces → agentes |
| [Operaciones](contribute-operations.md) | Actualización de agentes, gestión de enlaces, monitoreo |
| [Despliegue de Geoprobe](contribute-geolocation.md) | Despliegue y configuración de agentes geoProbe para geolocalización |
| [Glosario](glossary.md) | Toda la terminología de DoubleZero definida |

---

## Conceptos Básicos de Redes para No Ingenieros de Redes

Si no proviene de un contexto de ingeniería de redes, aquí tiene una introducción a los conceptos utilizados en esta documentación:

### Direccionamiento IP

- **Dirección IPv4**: Un identificador único para un dispositivo en una red (ej., `192.168.1.1`)
- **Notación CIDR** (`/29`, `/24`): Indica el tamaño de la subred. `/29` = 8 direcciones, `/24` = 256 direcciones
- **IP Pública**: Enrutable en internet; **IP Privada**: Solo redes internas (10.x, 172.16-31.x, 192.168.x)

### Capas de Red

- **Capa 1 (Física)**: Cables, ópticas, longitudes de onda
- **Capa 2 (Enlace de Datos)**: Switches, VLANs, direcciones MAC
- **Capa 3 (Red)**: Routers, direcciones IP, protocolos de enrutamiento

### Términos Comunes

- **MTU**: Unidad Máxima de Transmisión - tamaño máximo de paquete (típicamente 9000 bytes para enlaces WAN)
- **VLAN**: LAN Virtual - separa lógicamente el tráfico en infraestructura compartida
- **VRF**: Virtual Routing and Forwarding - aísla tablas de enrutamiento en el mismo dispositivo
- **BGP**: Border Gateway Protocol - intercambio de rutas entre redes
- **GRE**: Generic Routing Encapsulation - protocolo de tunelización para redes overlay
- **TWAMP**: Two-Way Active Measurement Protocol - mide latencia/pérdida entre dispositivos

### Específico de DoubleZero

- **Onchain**: En DoubleZero, los registros de dispositivos, las configuraciones de enlaces y la telemetría se registran en el ledger de DoubleZero — haciendo que el estado de la red sea transparente y verificable por todos los participantes
- **Controlador**: Servicio que deriva la configuración del DZD a partir del estado onchain en el ledger de DoubleZero

---

¿Listo para comenzar? Comience con [Requisitos y Arquitectura](contribute.md).