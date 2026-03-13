# Glosario
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


Esta página define la terminología específica de DoubleZero utilizada en toda la documentación.

---

## Infraestructura de Red

### DZD (Dispositivo DoubleZero)
El hardware físico de conmutación de red que termina los enlaces DoubleZero y ejecuta el software Agente DoubleZero. Los DZDs se despliegan en centros de datos y proporcionan servicios de enrutamiento, procesamiento de paquetes y conectividad de usuarios. Cada DZD requiere [especificaciones de hardware](contribute.md#dzd-network-hardware) específicas y ejecuta tanto el [Agente de Configuración](#config-agent) como el [Agente de Telemetría](#telemetry-agent).

### DZX (Exchange DoubleZero)
Puntos de interconexión en la red de malla donde se unen diferentes enlaces de [contribuidores](#contributor). Los DZXs están ubicados en las principales áreas metropolitanas (por ejemplo, NYC, LON, TYO) donde se producen intersecciones de red. Los contribuidores de red deben interconectar sus enlaces a la malla DoubleZero más amplia en el DZX más cercano. Concepto similar a un Internet Exchange (IX).

### Enlace WAN
Un enlace de Red de Área Amplia entre dos [DZDs](#dzd-doublezero-device) operados por el **mismo** contribuidor. Los enlaces WAN proporcionan conectividad de backbone dentro de la infraestructura de un solo contribuidor.

### Enlace DZX
Un enlace entre [DZDs](#dzd-doublezero-device) operados por **diferentes** contribuidores, establecido en un [DZX](#dzx-doublezero-exchange). Los enlaces DZX requieren aceptación explícita de ambas partes.

### Prefijo DZ
Asignaciones de direcciones IP en formato CIDR asignadas a un [DZD](#dzd-doublezero-device) para el direccionamiento de la red superpuesta. Se especifica durante la [creación del dispositivo](contribute-provisioning.md#step-32-create-your-device-onchain) usando el parámetro `--dz-prefixes`.

---

## Tipos de Dispositivos

### Dispositivo de Borde
Un [DZD](#dzd-doublezero-device) que proporciona conectividad de usuarios a la red DoubleZero. Los dispositivos de borde utilizan interfaces [CYOA](#cyoa-choose-your-own-adventure) para terminar usuarios (validadores, operadores RPC) y conectarlos a la red.

### Dispositivo de Tránsito
Un [DZD](#dzd-doublezero-device) que proporciona conectividad de backbone dentro de la red DoubleZero. Los dispositivos de tránsito mueven el tráfico entre DZDs pero no terminan conexiones de usuarios directamente.

### Dispositivo Híbrido
Un [DZD](#dzd-doublezero-device) que combina funcionalidades de [borde](#edge-device) y [tránsito](#transit-device), proporcionando tanto conectividad de usuarios como enrutamiento de backbone.

---

## Conectividad

### CYOA (Elige Tu Propia Aventura)
Tipos de interfaz que permiten a los [contribuidores](#contributor) registrar opciones de conectividad para que los usuarios se conecten a la red DoubleZero. Las interfaces CYOA incluyen varios métodos como [DIA](#dia-direct-internet-access), túneles GRE y peering privado. Consulte [Creación de Interfaces CYOA](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices) para obtener detalles de configuración.

### DIA (Acceso Directo a Internet)
Un término de red estándar para la conectividad proporcionada a través de la internet pública. En DoubleZero, DIA es un tipo de interfaz [CYOA](#cyoa-choose-your-own-adventure) donde los usuarios (validadores, operadores RPC) se conectan a un [DZD](#dzd-doublezero-device) a través de su conexión a internet existente.

### IBRL (Aumentar Ancho de Banda Reducir Latencia)
Un modo de conexión que permite a los validadores y nodos RPC conectarse a DoubleZero sin reiniciar sus clientes blockchain. IBRL usa la dirección IP pública existente y establece un túnel superpuesto al [DZD](#dzd-doublezero-device) más cercano. Consulte [Conexión Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) para instrucciones de configuración.

### Multicast
Un método de entrega de paquetes de uno a muchos compatible con DoubleZero. El modo multicast tiene dos roles: **publicador** (envía paquetes a través de la red) y **suscriptor** (recibe paquetes del publicador). Utilizado por equipos de desarrollo para una distribución eficiente de datos. Consulte [Otra Conexión Multicast](Other%20Multicast%20Connection.md) para obtener detalles de conexión.

---

## Componentes de Software

### doublezerod
El servicio daemon DoubleZero que se ejecuta en servidores de usuarios (validadores, nodos RPC). Gestiona la conexión a la red DoubleZero, maneja el establecimiento de túneles y mantiene la conectividad con los [DZDs](#dzd-doublezero-device). Se configura mediante systemd y se controla a través de la CLI [`doublezero`](#doublezero-cli).

### doublezero (CLI)
La interfaz de línea de comandos para interactuar con la red DoubleZero. Se usa para conectarse, gestionar identidades, verificar el estado y realizar operaciones administrativas. Se comunica con el daemon [`doublezerod`](#doublezerod).

### Agente de Configuración
Agente de software que se ejecuta en los [DZDs](#dzd-doublezero-device) y gestiona la configuración del dispositivo. Lee la configuración del servicio [Controlador](#controller) y aplica los cambios al dispositivo. Consulte [Instalación del Agente de Configuración](contribute-provisioning.md#step-44-install-config-agent) para la configuración.

### Agente de Telemetría
Agente de software que se ejecuta en los [DZDs](#dzd-doublezero-device) y recopila métricas de rendimiento (latencia, jitter, pérdida de paquetes) y las envía al ledger DoubleZero. Consulte [Instalación del Agente de Telemetría](contribute-provisioning.md#step-45-install-telemetry-agent) para la configuración.

### Controlador
Un servicio que proporciona configuración a los agentes [DZD](#dzd-doublezero-device). El Controlador deriva las configuraciones de dispositivos a partir del estado [onchain](#onchain) en el ledger DoubleZero.

---

## Estados de Enlace

### Activado
El estado operativo normal de un enlace. El tráfico fluye a través del enlace y participa en las decisiones de enrutamiento.

### Drenado Suave
Un estado de mantenimiento donde el tráfico se desalienta en un enlace específico. Se usa para ventanas de mantenimiento controladas. Puede transitar a [activado](#activated) o [drenado duro](#hard-drained).

### Drenado Duro
Un estado de mantenimiento donde el enlace se retira completamente del servicio. No fluye tráfico a través del enlace. Debe transitar a [drenado suave](#soft-drained) antes de volver a [activado](#activated).

---

## Organizaciones y Tokens

### DZF (Fundación DoubleZero)
La Fundación DoubleZero es una empresa de fundación sin fines de lucro de las Islas Caimán que se formó para apoyar el desarrollo, la descentralización, la seguridad y la adopción de la red DoubleZero.

### Token 2Z
El token nativo de la red DoubleZero. Se usa para pagar las tarifas de los validadores y se distribuye como recompensas a los [contribuidores](#contributor). Los validadores pueden pagar tarifas en 2Z a través de un programa de intercambio onchain. Consulte [Pagar Tarifas con 2Z](paying-fees2z.md) e [Intercambiar SOL por 2Z](Swapping-sol-to-2z.md).

### Contribuidor
Un proveedor de infraestructura de red que aporta ancho de banda y hardware a la red DoubleZero. Los contribuidores operan [DZDs](#dzd-doublezero-device), proporcionan enlaces [WAN](#wan-link) y [DZX](#dzx-link), y reciben incentivos en tokens [2Z](#2z-token) por su contribución. Consulte la [Documentación para Contribuidores](contribute-overview.md) para comenzar.

---

## Conceptos de Redes

### MTU (Unidad Máxima de Transmisión)
El tamaño máximo de paquete (en bytes) que se puede transmitir a través de un enlace de red. Los enlaces WAN de DoubleZero típicamente usan MTU 9000 (tramas jumbo) para mayor eficiencia.

### VRF (Enrutamiento y Reenvío Virtual)
Una tecnología que permite que existan múltiples tablas de enrutamiento aisladas en el mismo router físico. Los contribuidores a menudo usan un VRF de gestión separado para aislar el tráfico de gestión del switch del tráfico de producción.

### GRE (Encapsulación de Enrutamiento Genérico)
Un protocolo de tunelización que encapsula paquetes de red dentro de paquetes IP. Usado por conexiones [IBRL](#ibrl-increase-bandwidth-reduce-latency) y [CYOA](#cyoa-choose-your-own-adventure) para crear túneles superpuestos entre usuarios y DZDs.

### BGP (Protocolo de Puerta de Enlace de Borde)
El protocolo de enrutamiento utilizado para intercambiar información de enrutamiento entre redes en internet. DoubleZero usa BGP internamente con ASN 65342.

### ASN (Número de Sistema Autónomo)
Un identificador único asignado a una red para el enrutamiento BGP. Todos los dispositivos DoubleZero usan **ASN 65342** para el proceso BGP interno.

### Interfaz Loopback
Una interfaz de red virtual en un router/switch utilizada para gestión y propósitos de enrutamiento. Los DZDs usan Loopback255 (VPNv4) y Loopback256 (IPv4) para el enrutamiento interno.

### CIDR (Enrutamiento entre Dominios sin Clases)
Una notación para especificar rangos de direcciones IP. El formato es `IP/longitud-de-prefijo` donde la longitud del prefijo indica el tamaño de la red (por ejemplo, `/29` = 8 direcciones, `/24` = 256 direcciones).

### Jitter
Variación en la latencia de los paquetes a lo largo del tiempo. El bajo jitter es crítico para aplicaciones en tiempo real.

### RTT (Tiempo de Ida y Vuelta)
El tiempo que tarda un paquete en viajar desde el origen hasta el destino y volver. Se usa para medir la latencia de red entre dispositivos.

### TWAMP (Protocolo de Medición Activa Bidireccional)
Un protocolo para medir métricas de rendimiento de red como la latencia y la pérdida de paquetes. El [Agente de Telemetría](#telemetry-agent) usa TWAMP para recopilar métricas entre DZDs.

### IS-IS (Sistema Intermedio a Sistema Intermedio)
Un protocolo de enrutamiento de estado de enlace utilizado internamente por la red DoubleZero. Las métricas IS-IS se ajustan durante las operaciones de [drenado de enlaces](#soft-drained).

---

## Blockchain y Claves

### Onchain
En el contexto de DoubleZero, onchain se refiere a los datos y operaciones registrados en el ledger DoubleZero. A diferencia de las redes tradicionales donde las configuraciones de dispositivos y enlaces viven en sistemas de gestión centralizados, DoubleZero registra las registraciones de dispositivos, las configuraciones de enlaces y las presentaciones de telemetría onchain, lo que hace que el estado de la red sea transparente y verificable por todos los participantes.

### Clave de Servicio
Un par de claves criptográficas utilizado para autenticar las operaciones de CLI. Esta es su identidad de contribuidor para interactuar con el contrato inteligente DoubleZero. Se almacena en `~/.config/solana/id.json`.

### Clave de Editor de Métricas
Un par de claves criptográficas utilizado por el [Agente de Telemetría](#telemetry-agent) para firmar las presentaciones de métricas a la blockchain. Separado de la clave de servicio para el aislamiento de seguridad. Se almacena en `~/.config/doublezero/metrics-publisher.json`.

---

## Hardware y Software

### EOS (Sistema Operativo Extensible)
El sistema operativo de red de Arista que se ejecuta en los switches DZD. Los contribuidores instalan el [Agente de Configuración](#config-agent) y el [Agente de Telemetría](#telemetry-agent) como extensiones EOS.

### Extensión EOS
Un paquete de software que puede instalarse en switches Arista EOS. Los agentes DZ se distribuyen como archivos `.rpm` y se instalan mediante el comando `extension`.
