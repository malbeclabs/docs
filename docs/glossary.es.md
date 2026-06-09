---
description: Definiciones de la terminología específica de DoubleZero utilizada a lo largo de la documentación.
---

# Glosario

Esta página define la terminología específica de DoubleZero utilizada a lo largo de la documentación.

---

## Infraestructura de Red

### DZD (DoubleZero Device)
El hardware físico de conmutación de red que termina los enlaces de DoubleZero y ejecuta el software DoubleZero Agent. Los DZDs se despliegan en centros de datos y proporcionan servicios de enrutamiento, procesamiento de paquetes y conectividad de usuarios. Cada DZD requiere [especificaciones de hardware](contribute.md#dzd-network-hardware) específicas y ejecuta tanto el [Config Agent](#config-agent) como el [Telemetry Agent](#telemetry-agent).

### DZX (DoubleZero Exchange)
Puntos de interconexión en la red mallada donde se conectan los enlaces de diferentes [contribuidores](#contributor). Los DZXs están ubicados en las principales áreas metropolitanas (por ejemplo, NYC, LON, TYO) donde ocurren las intersecciones de red. Los contribuidores de red deben interconectar sus enlaces en la malla más amplia de DoubleZero en el DZX más cercano. Similar en concepto a un punto de intercambio de Internet (IX).

### WAN Link
Un enlace de Red de Área Amplia (Wide Area Network) entre dos [DZDs](#dzd-doublezero-device) operados por el **mismo** contribuidor. Los enlaces WAN proporcionan conectividad troncal dentro de la infraestructura de un único contribuidor.

### DZX Link
Un enlace entre [DZDs](#dzd-doublezero-device) operados por contribuidores **diferentes**, establecido en un [DZX](#dzx-doublezero-exchange). Los enlaces DZX requieren la aceptación explícita de ambas partes.

### DZ Prefix
Asignaciones de direcciones IP en formato CIDR asignadas a un [DZD](#dzd-doublezero-device) para el direccionamiento de la red superpuesta. Se especifican durante la [creación del dispositivo](contribute-provisioning.md#step-32-create-your-device-onchain) usando el parámetro `--dz-prefixes`.

---

## Tipos de Dispositivos

### Edge Device
Un [DZD](#dzd-doublezero-device) que proporciona conectividad de usuario a la red DoubleZero. Los dispositivos edge aprovechan las interfaces [CYOA](#cyoa-choose-your-own-adventure) para conectar usuarios (validadores, operadores RPC) a la red.

### Transit Device
Un [DZD](#dzd-doublezero-device) que proporciona conectividad troncal dentro de la red DoubleZero. Los dispositivos transit mueven tráfico entre DZDs pero no terminan conexiones de usuario directamente.

### Hybrid Device
Un [DZD](#dzd-doublezero-device) que combina la funcionalidad tanto de [edge](#edge-device) como de [transit](#transit-device), proporcionando conectividad de usuario y enrutamiento troncal.

---

## Conectividad

### CYOA (Choose Your Own Adventure)
Tipos de interfaz que permiten a los [contribuidores](#contributor) registrar opciones de conectividad para que los usuarios se conecten a la red DoubleZero. Las interfaces CYOA incluyen varios métodos como [DIA](#dia-direct-internet-access), túneles GRE y peering privado. Consulte [Creación de Interfaces CYOA](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices) para detalles de configuración.

### DIA (Direct Internet Access)
Un término estándar de redes para la conectividad proporcionada a través de la internet pública. En DoubleZero, DIA es un tipo de interfaz [CYOA](#cyoa-choose-your-own-adventure) donde los usuarios (validadores, operadores RPC) se conectan a un [DZD](#dzd-doublezero-device) a través de su conexión a internet existente.

### IBRL (Increase Bandwidth Reduce Latency)
Un modo de conexión que permite a los validadores y nodos RPC conectarse a DoubleZero sin reiniciar sus clientes de blockchain. IBRL utiliza la dirección IP pública existente y establece un túnel superpuesto al [DZD](#dzd-doublezero-device) más cercano. Consulte [Conexión Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) para instrucciones de configuración.

### Multicast
Un método de entrega de paquetes de uno a muchos soportado por DoubleZero. El modo multicast tiene dos roles: **publisher** (envía paquetes a través de la red) y **subscriber** (recibe paquetes del publisher). Utilizado por equipos de desarrollo para la distribución eficiente de datos. Consulte [Otra Conexión Multicast](Other%20Multicast%20Connection.md) para detalles de conexión.

---

## Componentes de Software

### doublezerod
El servicio daemon de DoubleZero que se ejecuta en los servidores de los usuarios (validadores, nodos RPC). Gestiona la conexión a la red DoubleZero, maneja el establecimiento de túneles y mantiene la conectividad con los [DZDs](#dzd-doublezero-device). Se configura mediante systemd y se controla a través del CLI [`doublezero`](#doublezero-cli).

### doublezero (CLI)
La interfaz de línea de comandos para interactuar con la red DoubleZero. Se utiliza para conectar, gestionar identidades, verificar el estado y operaciones administrativas. Se comunica con el daemon [`doublezerod`](#doublezerod).

### Config Agent
Agente de software que se ejecuta en los [DZDs](#dzd-doublezero-device) y gestiona la configuración del dispositivo. Lee la configuración del servicio [Controller](#controller) y aplica los cambios al dispositivo. Consulte [Instalación del Config Agent](contribute-provisioning.md#step-44-install-config-agent) para la configuración.

### Telemetry Agent
Agente de software que se ejecuta en los [DZDs](#dzd-doublezero-device) y recopila métricas de rendimiento (latencia, jitter, pérdida de paquetes) y las envía al ledger de DoubleZero. Consulte [Instalación del Telemetry Agent](contribute-provisioning.md#step-45-install-telemetry-agent) para la configuración.

### Controller
Un servicio que proporciona configuración a los agentes de los [DZD](#dzd-doublezero-device). El Controller deriva las configuraciones de los dispositivos del estado [onchain](#onchain) en el ledger de DoubleZero.

---

## Estados de los Enlaces

### Activated
El estado operativo normal para un enlace. El tráfico fluye a través del enlace y participa en las decisiones de enrutamiento.

### Soft-Drained
Un estado de mantenimiento donde se desalentará el tráfico en un enlace específico. Se utiliza para ventanas de mantenimiento planificado. Puede transicionar a [activated](#activated) o [hard-drained](#hard-drained).

### Hard-Drained
Un estado de mantenimiento donde el enlace se retira completamente del servicio. No fluye tráfico a través del enlace. Debe transicionar a [soft-drained](#soft-drained) antes de regresar a [activated](#activated).

---

## Organizaciones y Tokens

### DZF (DoubleZero Foundation)
DoubleZero Foundation es una fundación sin miembros constituida como compañía fundacional sin fines de lucro en las Islas Caimán, creada para apoyar el desarrollo, descentralización, seguridad y adopción de la red DoubleZero.

### 2Z Token
El token nativo de la red DoubleZero. Se utiliza para pagar las comisiones de los validadores y se distribuye como recompensas a los [contribuidores](#contributor). Los validadores pueden pagar las comisiones en 2Z a través de un programa de intercambio onchain. Consulte [Intercambio de SOL a 2Z](Swapping-sol-to-2z.md).

### Contributor
Un proveedor de infraestructura de red que contribuye ancho de banda y hardware a la red DoubleZero. Los contribuidores operan [DZDs](#dzd-doublezero-device), proporcionan enlaces [WAN](#wan-link) y [DZX](#dzx-link), y reciben incentivos en tokens [2Z](#2z-token) por su contribución. Consulte la [Documentación para Contribuidores](contribute-overview.md) para comenzar.

---

## Conceptos de Redes

### MTU (Maximum Transmission Unit)
El tamaño máximo de paquete (en bytes) que puede transmitirse a través de un enlace de red. Los enlaces WAN de DoubleZero generalmente utilizan MTU 9000 (jumbo frames) para mayor eficiencia.

### VRF (Virtual Routing and Forwarding)
Una tecnología que permite que múltiples tablas de enrutamiento aisladas coexistan en el mismo router físico. Los contribuidores a menudo utilizan un VRF de gestión separado para aislar el tráfico de administración del switch del tráfico de producción.

### GRE (Generic Routing Encapsulation)
Un protocolo de tunelización que encapsula paquetes de red dentro de paquetes IP. Utilizado por las conexiones [IBRL](#ibrl-increase-bandwidth-reduce-latency) y [CYOA](#cyoa-choose-your-own-adventure) para crear túneles superpuestos entre usuarios y DZDs.

### BGP (Border Gateway Protocol)
El protocolo de enrutamiento utilizado para intercambiar información de enrutamiento entre redes en internet. DoubleZero utiliza BGP internamente con ASN 65342.

### ASN (Autonomous System Number)
Un identificador único asignado a una red para el enrutamiento BGP. Todos los dispositivos DoubleZero utilizan **ASN 65342** para el proceso BGP interno.

### Loopback Interface
Una interfaz de red virtual en un router/switch utilizada para fines de gestión y enrutamiento. Los DZDs utilizan Loopback255 (VPNv4) y Loopback256 (IPv4) para el enrutamiento interno.

### CIDR (Classless Inter-Domain Routing)
Una notación para especificar rangos de direcciones IP. El formato es `IP/prefix-length` donde la longitud del prefijo indica el tamaño de la red (por ejemplo, `/29` = 8 direcciones, `/24` = 256 direcciones).

### Jitter
Variación en la latencia de los paquetes a lo largo del tiempo. Un jitter bajo es crítico para aplicaciones en tiempo real.

### RTT (Round-Trip Time)
El tiempo que tarda un paquete en viajar desde el origen al destino y regresar. Se utiliza para medir la latencia de red entre dispositivos.

### TWAMP (Two-Way Active Measurement Protocol)
Un protocolo para medir métricas de rendimiento de red como la latencia y la pérdida de paquetes. El [Telemetry Agent](#telemetry-agent) utiliza TWAMP para recopilar métricas entre DZDs.

### IS-IS (Intermediate System to Intermediate System)
Un protocolo de enrutamiento de estado de enlace utilizado internamente por la red DoubleZero. Las métricas de IS-IS se ajustan durante las operaciones de [drenaje de enlaces](#soft-drained).

---

## Geolocalización

### Geolocation
Un servicio de DoubleZero que verifica la ubicación física de los dispositivos mediante mediciones de latencia. Las mediciones de [RTT](#rtt-round-trip-time) entre infraestructura de ubicación conocida ([DZDs](#dzd-doublezero-device)) y los dispositivos objetivo proporcionan prueba firmada criptográficamente de que un dispositivo se encuentra dentro de cierta distancia de un punto de referencia. El registro onchain de las mediciones está planificado para una versión futura. Consulte [Geolocalización](geolocation.md) para la documentación de usuario.

### geoProbe
Un servidor bare metal que actúa como intermediario para las mediciones de latencia en el sistema de [Geolocalización](#geolocation). Los geoProbes están ubicados a ~1ms de un [DZD](#dzd-doublezero-device), reciben LocationOffsets firmados de los DZDs padre, y miden el [RTT](#rtt-round-trip-time) hacia los dispositivos objetivo mediante [TWAMP](#twamp-two-way-active-measurement-protocol), TWAMP firmado o ICMP echo. Cada geoProbe se registra [onchain](#onchain) y se vincula a uno o más DZDs padre. Consulte [Despliegue de Geoprobe](contribute-geolocation.md) para la documentación de contribuidores.

### LocationOffset
Una estructura de datos firmada que contiene la ubicación geográfica de un [DZD](#dzd-doublezero-device) (latitud y longitud) y una cadena de relaciones de latencia entre entidades (DZD↔Probe o Probe↔Target). Los LocationOffsets se firman con Ed25519 y se envían vía UDP a través de la cadena de medición. Los offsets compuestos incluyen referencias a mediciones anteriores, creando un rastro auditable.

---

## Blockchain y Claves

### Onchain
En el contexto de DoubleZero, onchain se refiere a datos y operaciones registrados en el ledger de DoubleZero. A diferencia de las redes tradicionales donde las configuraciones de dispositivos y enlaces residen en sistemas de gestión centralizados, DoubleZero registra los registros de dispositivos, las configuraciones de enlaces y los envíos de telemetría onchain, haciendo que el estado de la red sea transparente y verificable por todos los participantes.

### Service Key
Un par de claves criptográficas utilizado para autenticar las operaciones del CLI. Esta es su identidad como contribuidor para interactuar con el contrato inteligente de DoubleZero. Se almacena en `~/.config/solana/id.json`.

### Metrics Publisher Key
Un par de claves criptográficas utilizado por el [Telemetry Agent](#telemetry-agent) para firmar los envíos de métricas al blockchain. Separado de la service key para aislamiento de seguridad. Se almacena en `~/.config/doublezero/metrics-publisher.json`.

---

## Hardware y Software

### EOS (Extensible Operating System)
El sistema operativo de red de Arista que se ejecuta en los switches DZD. Los contribuidores instalan el [Config Agent](#config-agent) y el [Telemetry Agent](#telemetry-agent) como extensiones de EOS.

### EOS Extension
Un paquete de software que puede instalarse en los switches Arista EOS. Los agentes DZ se distribuyen como archivos `.rpm` y se instalan mediante el comando `extension`.