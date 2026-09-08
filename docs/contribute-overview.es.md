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

Use esta lista de verificación para seguir su progreso. **Todos los elementos deben completarse antes de que su contribución esté técnicamente operativa.**

### Fase 1: Prerrequisitos
- [ ] CLI de DoubleZero instalado en un servidor de gestión
- [ ] Hardware adquirido y cumple con los [requisitos](contribute.md#hardware-requirements)
- [ ] Espacio en rack y alimentación eléctrica disponibles en el centro de datos (consulte [Rack y Alimentación](contribute.md#rack-power-requirements))
- [ ] DZD instalado físicamente con conectividad de gestión
- [ ] Bloque de IPv4 público asignado para el protocolo DZ (**consulte [Reglas de Prefijos DZ](#reglas-de-prefijos-dz)**)

### Fase 2: Configuración de Cuenta
- [ ] Par de claves de servicio generado (`doublezero keygen`)
- [ ] Par de claves del publicador de métricas generado
- [ ] Billetera del gestor de recompensas creada y financiada con ~0.01 SOL
- [ ] Clave de servicio, clave del gestor de recompensas y nombre de usuario de GitHub enviados a DZF (solo claves públicas)
- [ ] Cuenta de contribuidor creada onchain (verificar con `doublezero contributor list`)
- [ ] Clave del gestor de recompensas registrada onchain por DZF
- [ ] Acceso otorgado al repositorio [malbeclabs/contributors](https://github.com/malbeclabs/contributors)
- [ ] Billeteras receptoras y porcentajes configurados (**consulte [Gestión de Recompensas](contribute-rewards.md)**)
- [ ] Cada billetera receptora tiene una cuenta de token 2Z

### Fase 3: Aprovisionamiento del Dispositivo
- [ ] Configuración base del dispositivo aplicada (desde el repositorio de contribuidores)
- [ ] Dispositivo creado onchain (`doublezero device create`)
- [ ] Interfaces del dispositivo registradas
- [ ] Interfaces loopback creadas (Loopback255 vpnv4, Loopback256 ipv4)
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
- [ ] Todos los enlaces drenados para un período de prueba de 24 horas
- [ ] [metrics.doublezero.xyz](https://metrics.doublezero.xyz) muestra cero pérdida y cero errores durante 24h
- [ ] Enlaces restaurados después de una prueba limpia

### Fase 6: Verificación y Activación
- [ ] `doublezero device list` muestra su dispositivo (con `max_users = 0`)
- [ ] `doublezero link list` muestra sus enlaces
- [ ] Los registros del Config Agent muestran obtenciones de configuración exitosas
- [ ] Los registros del Telemetry Agent muestran envíos de métricas exitosos
- [ ] **Coordinar con DZ/Malbec Labs** para ejecutar prueba de conectividad (conectar, recibir rutas, enrutar por DZ)
- [ ] Después de pasar la prueba, establecer `max_users` a 96 mediante `doublezero device update`

---

## Obtener Ayuda

Como parte de la incorporación, DZF le añadirá a los canales de Slack para contribuidores:

| Canal | Propósito |
|-------|-----------|
| **#dz-contributor-announcements** | Comunicaciones oficiales de DZF y Malbec Labs — actualizaciones de CLI/agentes, cambios incompatibles, anuncios de seguridad. Monitoree para actualizaciones críticas; haga preguntas en hilos. |
| **#dz-contributor-incidents** | Eventos no planificados con impacto en el servicio. Los incidentes se publican automáticamente a través de la API/formulario web con severidad y dispositivos/enlaces afectados. La discusión y resolución de problemas ocurre en hilos. |
| **#dz-contributor-maintenance** | Actividades de mantenimiento planificadas (actualizaciones, reparaciones). Programadas a través de la API/formulario web con horarios de inicio/fin planificados. Discusión en hilos. |
| **#dz-contributor-ops** | Discusión abierta para todos los contribuidores — preguntas operativas, ayuda con CLI, compartir runbooks y playbooks. |

También recibirá un **canal privado de DZ/Malbec Labs** para soporte directo para su organización.

---

## Reglas de Prefijos DZ

!!! warning "Crítico: Uso del Pool de Prefijos DZ"
    El pool de prefijos DZ que usted proporciona es **gestionado por el protocolo DoubleZero para la asignación de IP**.

    **Cómo se utilizan los prefijos DZ:**

    - **Primera IP**: Reservada para su dispositivo (asignada a la interfaz Loopback100)
    - **IPs restantes**: Asignadas a tipos específicos de usuarios que se conectan a su DZD:
        - Usuarios `IBRLWithAllocatedIP`
        - Usuarios `EdgeFiltering`
        - Publicadores multicast
    - **Usuarios IBRL**: NO consumen de este pool (usan su propia IP pública)

    **NO PUEDE usar estas direcciones para:**

    - Su propio equipamiento de red
    - Enlaces punto a punto en interfaces DIA
    - Interfaces de gestión
    - Cualquier infraestructura fuera del protocolo DZ

    **Requisitos:**

    - Deben ser direcciones IPv4 **enrutables globalmente (públicas)**
    - Los rangos de IP privados (10.x, 172.16-31.x, 192.168.x) son rechazados por el contrato inteligente
    - **Tamaño mínimo: /29** (8 direcciones), se prefieren prefijos más grandes (ej., /28, /27)
    - El bloque completo debe estar disponible - no pre-asigne ninguna dirección

    Si necesita direcciones para su propio equipamiento (IPs de interfaz DIA, gestión, etc.), use un **pool de direcciones separado**.

---

## Referencia Rápida: Términos Clave

¿Nuevo en DoubleZero? Aquí están los términos esenciales (consulte el [Glosario completo](glossary.md)):

| Término | Definición |
|---------|------------|
| **DZD** | DoubleZero Device - su switch Arista físico ejecutando agentes DZ |
| **DZX** | DoubleZero Exchange - punto de interconexión metropolitana donde los contribuidores establecen peering |
| **CYOA** | Choose Your Own Adventure - método de conectividad de usuario (GREOverDIA, GREOverFabric, etc.) |
| **DIA** | Direct Internet Access - conectividad a internet requerida por todos los DZDs para el controlador y telemetría, comúnmente usado como tipo CYOA para conectividad de usuarios en dispositivos edge/híbridos |
| **WAN Link** | Enlace entre sus propios DZDs (mismo contribuidor) |
| **DZX Link** | Enlace al DZD de otro contribuidor (requiere aceptación mutua) |
| **Config Agent** | Consulta el controlador, aplica configuración a su DZD |
| **Telemetry Agent** | Recopila métricas de latencia/pérdida TWAMP, las envía al ledger onchain |
| **Service Key** | Su clave de identidad de contribuidor para operaciones con CLI |
| **Metrics Publisher Key** | Clave para firmar envíos de telemetría onchain |
| **Rewards Manager Key** | Clave que controla qué billeteras reciben sus recompensas |

---

---

## Estructura de la Documentación

| Guía | Descripción |
|------|-------------|
| [Requisitos y Arquitectura](contribute.md) | Especificaciones de hardware, arquitectura de red, opciones de ancho de banda |
| [Aprovisionamiento de Dispositivos](contribute-provisioning.md) | Paso a paso: claves → acceso al repositorio → dispositivo → enlaces → agentes |
| [Gestión de Recompensas](contribute-rewards.md) | Configurar las billeteras que reciben sus recompensas 2Z |
| [Operaciones](contribute-operations.md) | Actualizaciones de agentes, gestión de enlaces, monitoreo |
| [Despliegue de Geoprobe](contribute-geolocation.md) | Despliegue y configuración de agentes geoProbe para geolocalización |
| [Glosario](glossary.md) | Toda la terminología de DoubleZero definida |

---

## Conceptos Básicos de Red para No Ingenieros de Redes

Si no tiene experiencia en ingeniería de redes, aquí hay una introducción a los conceptos utilizados en esta documentación:

### Direccionamiento IP

- **Dirección IPv4**: Un identificador único para un dispositivo en una red (ej., `192.168.1.1`)
- **Notación CIDR** (`/29`, `/24`): Indica el tamaño de la subred. `/29` = 8 direcciones, `/24` = 256 direcciones
- **IP Pública**: Enrutable en internet; **IP Privada**: Solo redes internas (10.x, 172.16-31.x, 192.168.x)

### Capas de Red

- **Capa 1 (Física)**: Cables, óptica, longitudes de onda
- **Capa 2 (Enlace de Datos)**: Switches, VLANs, direcciones MAC
- **Capa 3 (Red)**: Routers, direcciones IP, protocolos de enrutamiento

### Términos Comunes

- **MTU**: Maximum Transmission Unit - tamaño máximo de paquete (típicamente 9000 bytes para enlaces WAN)
- **VLAN**: Virtual LAN - separa lógicamente el tráfico en infraestructura compartida
- **VRF**: Virtual Routing and Forwarding - aísla tablas de enrutamiento en el mismo dispositivo
- **BGP**: Border Gateway Protocol - intercambio de rutas entre redes
- **GRE**: Generic Routing Encapsulation - protocolo de tunelización para redes overlay
- **TWAMP**: Two-Way Active Measurement Protocol - mide latencia/pérdida entre dispositivos

### Específico de DoubleZero

- **Onchain**: En DoubleZero, los registros de dispositivos, configuraciones de enlaces y telemetría se registran en el ledger de DoubleZero — haciendo que el estado de la red sea transparente y verificable por todos los participantes
- **Controlador**: Servicio que deriva la configuración del DZD a partir del estado onchain en el ledger de DoubleZero

---

¿Listo para comenzar? Empiece con [Requisitos y Arquitectura](contribute.md).