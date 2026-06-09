---
description: Descripción general de los actores y componentes que conforman la arquitectura de red de DoubleZero.
---

# Arquitectura

¿Cuáles son los diferentes actores y componentes de la red DoubleZero?

<figure markdown="span">
  ![Image title](images/figure8.png){ width="800" }
  <figcaption>Figura 1: Componentes de la arquitectura de red</figcaption>
</figure>

## Contribuidores

La red DoubleZero está compuesta por contribuciones de conectividad y procesamiento de paquetes provenientes de una comunidad creciente de proveedores de infraestructura de red distribuida en ciudades de todo el mundo. Los contribuidores aportan enlaces de cable de fibra óptica y recursos de procesamiento de información al protocolo para proporcionar la red mesh descentralizada.

### Contribuidores de Ancho de Banda de Red

Los contribuidores de red deben proporcionar ancho de banda dedicado entre dos puntos, operar dispositivos compatibles con DoubleZero (DZDs) en cada extremo y una conexión a internet en cada extremo. Los contribuidores de red también deben ejecutar el software de DoubleZero en cada DZD para proporcionar servicios como multicast, búsqueda de usuarios y servicios de filtrado en el borde.

Los enlaces físicos de la red DoubleZero se proporcionan en forma de cables de fibra óptica, comúnmente denominados servicios de longitud de onda. Los contribuidores de red comprometen enlaces de red infrautilizados, propios o arrendados a proveedores de infraestructura, entre dos o más centros de datos. Estos enlaces se terminan en ambos extremos mediante DoubleZero Devices, que son gabinetes físicos de conmutación de red que ejecutan instancias del software DoubleZero Agent.

#### DoubleZero Exchange (DZX / Sitio de Interconexión)

Los DoubleZero Exchanges (DZXs) son puntos de interconexión en la red mesh donde se conectan entre sí los enlaces de diferentes contribuidores. Los DZXs se encuentran ubicados en las principales áreas metropolitanas del mundo donde se producen intersecciones de red. Los contribuidores de red deben interconectar sus enlaces en la red mesh más amplia de DoubleZero en los DZXs geográficamente más cercanos a los puntos finales de sus enlaces.

### Contribuidores de Recursos Computacionales

De forma separada a los contribuidores de red, los contribuidores de recursos son un grupo descentralizado de participantes de la red que realizan diversas tareas de mantenimiento y monitoreo necesarias para mantener la integridad técnica y el funcionamiento continuo de la red DoubleZero. Específicamente, ellos (i) rastrean las transacciones y pagos de los usuarios; (ii) calculan las tarifas para los contribuidores de red; (iii) registran los resultados de (i) y (ii); (iv) administran, estrictamente de forma no discrecional, los contratos inteligentes que controlan la tokenomía del protocolo; (v) retransmiten atestaciones a la blockchain correspondiente; y (vi) publican datos de telemetría sobre la calidad y utilización de los enlaces para proporcionar métricas de rendimiento transparentes y en tiempo real para todos los contribuidores de red.

## Componentes

### DoubleZero Daemon

El software DoubleZero Daemon se ejecuta en servidores que necesitan comunicarse a través de la red DoubleZero. El daemon interactúa con la pila de red del kernel del host para crear y gestionar interfaces de túnel, tablas de enrutamiento y rutas.

### Activator

El servicio Activator, alojado por uno o más miembros contribuidores de recursos computacionales de la comunidad DoubleZero, monitorea eventos de contratos que requieren asignaciones de direcciones IP y cambios de estado, y gestiona dichos cambios en nombre de la red.

### Controller

El servicio Controller, alojado por uno o más contribuidores de recursos computacionales de la comunidad DoubleZero, sirve como la interfaz de configuración para los DoubleZero Device Agents, permitiéndoles renderizar su configuración actual basándose en eventos de contratos inteligentes.

### Agent

El software Agent se ejecuta directamente en los DoubleZero Devices y aplica cambios de configuración a los dispositivos según lo interpretado por el servicio Controller. El software Agent consulta al Controller en busca de cambios de configuración, calcula las diferencias entre la versión canónica en cadena del estado del dispositivo y la configuración activa en el dispositivo, y aplica los cambios necesarios para reconciliar la configuración activa.

### Device

El gabinete de dispositivo físico que proporciona el enrutamiento y la terminación de enlaces para la red DoubleZero. Los DZDs ejecutan el software DoubleZero Agent y se configuran basándose en los datos leídos del servicio Controller.