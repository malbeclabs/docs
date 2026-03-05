# Documentación para Contribuidores

!!! info "Terminología"
    ¿Nuevo en DoubleZero? Consulte el [Glosario](glossary.md) para definiciones de términos clave como [DZD](glossary.md#dzd-doublezero-device), [DZX](glossary.md#dzx-doublezero-exchange) y [CYOA](glossary.md#cyoa-choose-your-own-adventure).

Bienvenido a la documentación para contribuidores de DoubleZero. Esta sección cubre todo lo que necesita para convertirse en un contribuidor de red.

!!! tip "¿Interesado en convertirse en contribuidor de red?"
    Revise la página de [Requisitos y Arquitectura](contribute.md) para comprender el hardware, el ancho de banda y la conectividad necesarios para contribuir a la red DoubleZero.

---

## Lista de Verificación de Incorporación

Use esta lista de verificación para hacer seguimiento de su progreso. **Todos los elementos deben estar completados antes de que su contribución sea técnicamente operativa.**

### Fase 1: Requisitos Previos
- [ ] CLI DoubleZero instalada en un servidor de gestión
- [ ] Hardware adquirido y cumple los [requisitos](contribute.md#hardware-requirements)
- [ ] Espacio en rack y energía del centro de datos disponibles (4U, 4KW recomendado)
- [ ] DZD instalado físicamente con conectividad de gestión
- [ ] Bloque IPv4 público asignado para el protocolo DZ (**consulte las [Reglas de Prefijo DZ](#dz-prefix-rules)**)

### Fase 2: Configuración de Cuenta
- [ ] Par de claves de servicio generado (`doublezero keygen`)
- [ ] Par de claves de editor de métricas generado
- [ ] Clave de servicio enviada a DZF para autorización
- [ ] Cuenta de contribuidor creada onchain (verificar con `doublezero contributor list`)
- [ ] Acceso otorgado al repositorio [malbeclabs/contributors](https://github.com/malbeclabs/contributors)

### Fase 3: Aprovisionamiento de Dispositivos
- [ ] Configuración base del dispositivo aplicada (desde el repositorio de contribuidores)
- [ ] Dispositivo creado onchain (`doublezero device create`)
- [ ] Interfaces del dispositivo registradas
- [ ] Interfaces loopback creadas (Loopback255 vpnv4, Loopback256 ipv4)
- [ ] Interfaces CYOA/DIA configuradas (si es dispositivo de borde/híbrido)

### Fase 4: Establecimiento de Enlace e Instalación de Agentes
- [ ] Enlaces WAN creados (si aplica)
- [ ] Enlace DZX creado (estado: `requested`)
- [ ] Enlace DZX aceptado por el contribuidor par
- [ ] Agente de Configuración instalado y en ejecución
- [ ] Agente de Configuración recibiendo configuración del controlador
- [ ] Agente de Telemetría instalado y en ejecución
- [ ] Editor de métricas registrado onchain
- [ ] Presentaciones de telemetría visibles en el ledger

### Fase 5: Rodaje del Enlace
- [ ] Todos los enlaces drenados durante un período de rodaje de 24 horas
- [ ] [metrics.doublezero.xyz](https://metrics.doublezero.xyz) muestra cero pérdidas y cero errores durante 24h
- [ ] Enlaces sin drenar después de un rodaje limpio

### Fase 6: Verificación y Activación
- [ ] `doublezero device list` muestra su dispositivo (con `max_users = 0`)
- [ ] `doublezero link list` muestra sus enlaces
- [ ] Los logs del Agente de Configuración muestran extracciones de configuración exitosas
- [ ] Los logs del Agente de Telemetría muestran presentaciones de métricas exitosas
- [ ] **Coordinar con DZ/Malbec Labs** para ejecutar una prueba de conectividad (conectar, recibir rutas, enrutar sobre DZ)
- [ ] Después de que la prueba pase, establecer `max_users` en 96 mediante `doublezero device update`

---

## Obtener Ayuda

Como parte de la incorporación, DZF le añadirá a los canales Slack de contribuidores:

| Canal | Propósito |
|---------|---------|
| **#dz-contributor-announcements** | Comunicaciones oficiales de DZF y Malbec Labs — actualizaciones de CLI/agentes, cambios importantes, anuncios de seguridad. Monitoree para actualizaciones críticas; haga preguntas en los hilos. |
| **#dz-contributor-incidents** | Eventos no planificados que afectan el servicio. Los incidentes se publican automáticamente a través de la API/formulario web con severidad y dispositivos/enlaces afectados. La discusión y solución de problemas ocurre en los hilos. |
| **#dz-contributor-maintenance** | Actividades de mantenimiento planificadas (actualizaciones, reparaciones). Programadas a través de la API/formulario web con tiempos de inicio/fin planificados. Discusión en hilos. |
| **#dz-contributor-ops** | Discusión abierta para todos los contribuidores — preguntas operativas, ayuda con CLI, compartir runbooks y playbooks. |

También recibirá un **canal privado de DZ/Malbec Labs** para soporte directo de su organización.

---

## Reglas de Prefijo DZ

!!! warning "Crítico: Uso del Pool de Prefijos DZ"
    El pool de prefijos DZ que proporciona es **gestionado por el protocolo DoubleZero para la asignación de IP**.

    **Cómo se usan los prefijos DZ:**

    - **Primera IP**: Reservada para su dispositivo (asignada a la interfaz Loopback100)
    - **IPs restantes**: Asignadas a tipos específicos de usuarios que se conectan a su DZD:
        - Usuarios `IBRLWithAllocatedIP`
        - Usuarios `EdgeFiltering`
        - Publicadores multicast
    - **Usuarios IBRL**: NO consumen de este pool (usan su propia IP pública)

    **NO puede usar estas direcciones para:**

    - Su propio equipo de red
    - Enlaces punto a punto en interfaces DIA
    - Interfaces de gestión
    - Cualquier infraestructura fuera del protocolo DZ

    **Requisitos:**

    - Deben ser direcciones IPv4 **globalmente enrutables (públicas)**
    - Los rangos de IP privados (10.x, 172.16-31.x, 192.168.x) son rechazados por el contrato inteligente
    - **Tamaño mínimo: /29** (8 direcciones), se prefieren prefijos más grandes (por ejemplo, /28, /27)
    - Todo el bloque debe estar disponible - no preasigne ninguna dirección

    Si necesita direcciones para su propio equipo (IPs de interfaz DIA, gestión, etc.), use un **pool de direcciones separado**.

---

## Referencia Rápida: Términos Clave

¿Nuevo en DoubleZero? Aquí están los términos esenciales (consulte el [Glosario completo](glossary.md)):

| Término | Definición |
|------|------------|
| **DZD** | Dispositivo DoubleZero - su switch físico Arista que ejecuta los agentes DZ |
| **DZX** | Exchange DoubleZero - punto de interconexión metropolitana donde los contribuidores se conectan entre sí |
| **CYOA** | Elige Tu Propia Aventura - método de conectividad de usuarios (GREOverDIA, GREOverFabric, etc.) |
| **DIA** | Acceso Directo a Internet - conectividad a internet requerida por todos los DZDs para el controlador y la telemetría, comúnmente usado como tipo CYOA para la conectividad de usuarios en dispositivos de borde/híbridos |
| **Enlace WAN** | Enlace entre sus propios DZDs (mismo contribuidor) |
| **Enlace DZX** | Enlace al DZD de otro contribuidor (requiere aceptación mutua) |
| **Agente de Configuración** | Consulta el controlador, aplica la configuración a su DZD |
| **Agente de Telemetría** | Recopila métricas de latencia/pérdida TWAMP, las envía al ledger onchain |
| **Clave de Servicio** | Su clave de identidad de contribuidor para operaciones CLI |
| **Clave de Editor de Métricas** | Clave para firmar presentaciones de telemetría onchain |

---

---

## Estructura de la Documentación

| Guía | Descripción |
|-------|-------------|
| [Requisitos y Arquitectura](contribute.md) | Especificaciones de hardware, arquitectura de red, opciones de ancho de banda |
| [Aprovisionamiento de Dispositivos](contribute-provisioning.md) | Paso a paso: claves → acceso al repositorio → dispositivo → enlaces → agentes |
| [Operaciones](contribute-operations.md) | Actualizaciones de agentes, gestión de enlaces, monitoreo |
| [Glosario](glossary.md) | Toda la terminología DoubleZero definida |

---

## Conceptos de Red para No Ingenieros de Red

Si no tiene experiencia en ingeniería de redes, aquí hay una introducción a los conceptos utilizados en esta documentación:

### Direccionamiento IP

- **Dirección IPv4**: Un identificador único para un dispositivo en una red (por ejemplo, `192.168.1.1`)
- **Notación CIDR** (`/29`, `/24`): Indica el tamaño de la subred. `/29` = 8 direcciones, `/24` = 256 direcciones
- **IP pública**: Enrutable en internet; **IP privada**: Solo redes internas (10.x, 172.16-31.x, 192.168.x)

### Capas de Red

- **Capa 1 (Física)**: Cables, óptica, longitudes de onda
- **Capa 2 (Enlace de Datos)**: Switches, VLANs, direcciones MAC
- **Capa 3 (Red)**: Routers, direcciones IP, protocolos de enrutamiento

### Términos Comunes

- **MTU**: Unidad Máxima de Transmisión - tamaño máximo de paquete (típicamente 9000 bytes para enlaces WAN)
- **VLAN**: LAN Virtual - separa lógicamente el tráfico en infraestructura compartida
- **VRF**: Enrutamiento y Reenvío Virtual - aísla tablas de enrutamiento en el mismo dispositivo
- **BGP**: Protocolo de Puerta de Enlace de Borde - intercambio de rutas entre redes
- **GRE**: Encapsulación de Enrutamiento Genérico - protocolo de tunelización para redes superpuestas
- **TWAMP**: Protocolo de Medición Activa Bidireccional - mide latencia/pérdida entre dispositivos

### Específico de DoubleZero

- **Onchain**: En DoubleZero, los registros de dispositivos, las configuraciones de enlaces y la telemetría se registran en el ledger DoubleZero, haciendo que el estado de la red sea transparente y verificable por todos los participantes
- **Controlador**: Servicio que deriva la configuración de DZD a partir del estado onchain en el ledger DoubleZero

---

¿Listo para comenzar? Empiece con [Requisitos y Arquitectura](contribute.md).
