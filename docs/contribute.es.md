# Requisitos y Arquitectura para Contribuidores

## Resumen

Cualquier persona que desee monetizar sus cables de fibra óptica y hardware de red subutilizados puede contribuir a la red DoubleZero. Los contribuidores de red deben proporcionar ancho de banda dedicado entre dos puntos, operar dispositivos compatibles con DoubleZero (DZDs) en cada extremo, y una conexión a internet pública en cada extremo. Los contribuidores de red también deben ejecutar software DoubleZero en cada DZD para proporcionar servicios como multicast, búsqueda de usuarios y filtrado de borde.

El contrato inteligente de DoubleZero es la piedra angular para garantizar que la red mantenga enlaces de alta calidad que puedan medirse e integrarse en la topología, permitiendo a nuestros controladores de red desarrollar la ruta más eficiente de extremo a extremo entre nuestros diferentes usuarios y puntos finales. Tras la ejecución del contrato inteligente y el despliegue del equipo de red y el ancho de banda, una entidad se clasifica como contribuidor de red. Consulte [Economía de DoubleZero](https://economics.doublezero.xyz/overview) para comprender mejor la economía detrás de participar en DoubleZero como contribuidor de red.

---

## Requisitos para ser Contribuidor de Red DoubleZero

- Ancho de banda dedicado que pueda proporcionar conectividad IPv4 y un MTU de 2048 bytes entre dos centros de datos
- Hardware de Dispositivo DoubleZero (DZD) compatible con el protocolo DoubleZero
- Conectividad a internet y a otros contribuidores de red DoubleZero
- Instalación del software DoubleZero en el DZD

## Guía de Inicio Rápido

Como contribuidor de red, la forma más sencilla de comenzar en DoubleZero es identificando capacidad en su red que pueda dedicarse a DoubleZero. Una vez identificados, los DZDs deben desplegarse, facilitando la red superpuesta DoubleZero que solo requiere alcanzabilidad IPv4 y un MTU mínimo de 2048 bytes como dependencias de la red del contribuidor.

La Figura 1 destaca el modelo más simple para contribuir con ancho de banda y servicios de envío y procesamiento de paquetes. Se despliega un DZD en cada centro de datos, interactuando con la red interna del contribuidor de red para proporcionar conectividad WAN de DoubleZero. Esto se complementa con internet local, típicamente una solución de Acceso Directo a Internet (DIA), que se usa como rampas de acceso para los usuarios de DoubleZero. Si bien se espera que DIA sea la opción preferida para facilitar el acceso a los usuarios de DoubleZero, son posibles numerosos modelos de conectividad, por ejemplo, cableado físico a servidores, extensión de fabric de red, etc. Nos referimos a estas opciones como Elige Tu Propia Aventura (CYOA), proporcionando al contribuidor flexibilidad para conectar usuarios locales o remotos de una manera que mejor se adapte a sus políticas de red internas.

Como con cualquier red, la alcanzabilidad es una parte fundamental de la arquitectura, ya que los contribuidores de red no pueden vivir en aislamiento. Como tal, el DZD *debe* tener un enlace a un Exchange DoubleZero (DZX) para crear una red contigua entre los participantes.

<figure markdown="span">
  ![Image title](images/figure1.png){ width="800" }
  <figcaption>Figura 1: Contribución de Ancho de Banda de Red DoubleZero Entre 2 Centros de Datos - Contribuidor Único</figcaption>
</figure>

### Ejemplos de Contribuciones

Las formas en que un contribuidor de red puede hacer crecer sus contribuciones a DoubleZero son muchas, incluyendo:

- Mejorar las características de rendimiento de sus contribuciones existentes: aumentar el ancho de banda, reducir la latencia
- Agregar múltiples enlaces entre los mismos centros de datos
- Agregar un nuevo enlace desde un centro de datos existente a un nuevo centro de datos
- Agregar un nuevo enlace independiente entre dos nuevos centros de datos

#### Ejemplo 1: Contribuidor Único, 3 Centros de Datos, Dos Enlaces
<figure markdown="span">
  ![Image title](images/figure2.png){ width="800" }
  <figcaption>Figura 2: Contribución de Ancho de Banda de Red DoubleZero Entre 3 Centros de Datos - Contribuidor Único</figcaption>
</figure>

Un solo DZD puede soportar múltiples enlaces contribuidos a DoubleZero. La Figura 2 ilustra una topología potencial si un solo centro de datos, denominado 1, termina el ancho de banda hacia dos centros de datos remotos diferentes, 2 y 3. En este escenario, cada centro de datos contiene solo 1 DZD. Todos los DZDs utilizan DIA para las rampas de acceso de usuarios como su interfaz CYOA.

#### Ejemplo 2: Contribuidor Único, 3 Centros de Datos, Tres Enlaces

La Figura 3 describe la topología de DoubleZero cuando un único contribuidor despliega tres enlaces en una topología triangular entre 3 centros de datos. En un escenario similar al ejemplo 1, se despliega un único DZD en los centros de datos 1, 2 y 3, cada uno soportando 2 enlaces de red independientes. La topología resultante es un triángulo o anillo entre los centros de datos.

<figure markdown="span">
  ![Image title](images/figure3.png){ width="800" }
  <figcaption>Figura 3: Contribución de Ancho de Banda de Red DoubleZero Entre 3 Centros de Datos - Contribuidor Único </figcaption>
</figure>

### Exchange DoubleZero

La creación de una red contigua es un elemento fundamental de la arquitectura DoubleZero. Los contribuidores se interconectan a través de un Exchange DoubleZero (DZX) dentro de un área metropolitana, que es una ciudad como Nueva York (NYC), Londres (LON) o Tokio (TYO). Un DZX es un fabric de red similar a un Exchange de Internet, que permite el peering y el intercambio de rutas.

En la figura 4, el contribuidor de red 1 opera en los centros de datos 1, 2 y 3, mientras que el contribuidor de red 2 opera en los centros de datos 2, 4 y 5. Al interconectarse en el centro de datos 2, el alcance de la red DoubleZero aumenta a 5 centros de datos contiguos.

<figure markdown="span">
  ![Image title](images/figure4.png){ width="1000" }
  <figcaption>Figura 4: Contribución de Ancho de Banda de Red DoubleZero Entre 2 Contribuidores de Ancho de Banda de Red </figcaption>
</figure>

### Opciones de Contribución de Ancho de Banda

DoubleZero requiere que un contribuidor de red ofrezca conectividad integrada mediante un perfil garantizado de ancho de banda, latencia y jitter entre DZDs en dos centros de datos terminales expresado a través de un contrato inteligente. DoubleZero no exige cómo un contribuidor de red implementa su contribución; sin embargo, en las siguientes secciones proporcionamos opciones indicativas para su uso a su sola discreción.

Las áreas importantes a considerar para un contribuidor de red podrían ser:

- Capacidad de garantizar el rendimiento de la red del servicio DoubleZero: ancho de banda, latencia y jitter
- Segregación de sus servicios de red interna existentes
- Conflictos de direccionamiento IPv4, específicamente con el espacio de direcciones del underlay del túnel
- Tiempo de actividad y disponibilidad
- Consideraciones de CAPEX y OPEX

#### Ancho de Banda de Capa 1
<figure markdown="span">
  ![Image title](images/figure5.png){ width="800" }
  <figcaption>Figura 5: Servicios Ópticos de Capa 1 </figcaption>
</figure>

El ancho de banda de Capa 1, descrito más formalmente como servicios de longitud de onda, puede ver capacidad dedicada aprovisionada en una infraestructura óptica existente, como DWDM, CWDM o mediante multiplexores ópticos (MUX). En la figura 5, los DZDs utilizan una óptica de color que se conecta a un MUX L1, que intercala la longitud de onda del DZD en una fibra oscura existente.

Esta solución tiene numerosos beneficios para los contribuidores de red que ya operan una red troncal existente. Los cambios operativos iterativos, así como los requisitos adicionales de CAPEX y OPEX, son modestos. Esta opción es particularmente robusta para ofrecer segregación de los servicios de red del contribuidor.

#### Ancho de Banda de Red Conmutada por Paquetes

Las redes conmutadas por paquetes pueden considerarse una red empresarial típica, ejecutando protocolos estándar de enrutamiento y conmutación para soportar aplicaciones de negocios. Hay numerosas tecnologías de red que logran conectividad, por ejemplo, extensiones de capa 2 (L2) usando etiquetas VLAN.

##### Extensión L2
<figure markdown="span">
  ![Image title](images/figure6.png){ width="800" }
  <figcaption>Figura 6: Redes Conmutadas por Paquetes - Extensión L2 </figcaption>
</figure>

Una extensión L2 como se muestra en la Figura 6 puede facilitarse mediante el etiquetado de VLAN. El puerto de un DZD puede conectarse al switch de red interna de un contribuidor, con el puerto del switch configurado como puerto de acceso en, por ejemplo, VLAN 10. Mediante el etiquetado 802.1q, esta VLAN puede llevarse a través de múltiples saltos de switch en la red del contribuidor, terminando en el switch que interactúa con el DZD remoto.

Esta solución se beneficia de ser ampliamente compatible y relativamente fácil de implementar, al tiempo que crea segmentación entre DoubleZero y los servicios de capa 3 internos. El ancho de banda puede controlarse según la velocidad de interfaz del switch o enrutador interno del contribuidor. Se debe prestar especial atención al rendimiento a través de la red L2 interna compartida mediante tecnologías como Calidad de Servicio (QoS) u otras políticas de gestión de tráfico. Sin embargo, las inversiones adicionales de CAPEX y OPEX deberían ser modestas si hay capacidad disponible dentro de la red troncal del contribuidor.

#### Ancho de Banda Dedicado de Terceros
<figure markdown="span">
  ![Image title](images/figure7.png){ width="800" }
  <figcaption>Figura 7: Ancho de Banda Dedicado de Terceros </figcaption>
</figure>

Si bien reutilizar la capacidad disponible será atractivo para muchos contribuidores de red, también se puede dedicar ancho de banda recién adquirido a DoubleZero. En tal escenario, el DZD se conectaría directamente al operador de terceros sin ningún dispositivo interno del contribuidor en línea (figura 7).

Esta opción es atractiva ya que garantiza ancho de banda dedicado para DoubleZero, es operativamente simple y asegura una segmentación completa de cualquier otro servicio de red. Esta opción probablemente tendrá el mayor aumento de OPEX y requiere nuevos contratos de servicio con operadores de terceros.

---

## Requisitos de Hardware

### Contribución de Ancho de Banda de 100 Gbps

Tenga en cuenta que las cantidades a continuación reflejan el equipo necesario en dos centros de datos, es decir, el hardware total necesario para desplegar 1 cable de fibra óptica para la contribución de ancho de banda.

??? warning "*Todas las FPGAs están sujetas a pruebas finales. Las contribuciones de 10G pueden ser compatibles usando switches Arista 7130LBR con FPGAs Virtex® UltraScale+™ integradas duales (si tiene alguna pregunta, la Fundación DoubleZero / Malbec Labs están felices de proporcionar más información)."

#### Requisitos de Función y Puerto

| Función                    | Velocidad de Puerto | Requisito DZ | CANT | Nota |
|-----------------------------|------------|----------------|-----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Ancho de Banda Privado           | 100G       | Sí            | 1   |                                                                                                                                                                   |
| Acceso Directo a Internet (DIA) | 10G       | Sí            | 2   |                                                                                                                                                                   |
| DoubleZero eXchange (DZX)   | 100G       | Sí*           | 1   | Debe ser compatible cuando más de 3 proveedores operan en la misma área metropolitana; antes de esto, se pueden usar conexiones cruzadas u otros acuerdos de peering para interconectarse con otros proveedores. |
| Gestión                  |            | No            | 1   | Determinado por las propias políticas de gestión interna del contribuidor.                                                                                                    |
| Consola                     |            | No             | 1   | Determinado por las propias políticas de gestión interna del contribuidor.                                                                                                    |

#### Hardware de Red DZD

| Fabricante     | Modelo            | Número de Parte           | Requisito DZ | CANT | Nota |
|----------|-----------------|----------------------|----------------|-----|-----------------------------------------------------------|
| AMD*      | V80*           | 24540474    | Sí            | 4   |                                                           |
| Arista   | 7280CR3A        | DCS-7280CR3A-32S    | Sí            | 2   | Pueden ser posibles alternativas si los tiempos de entrega son desafiantes. |

---

#### Óptica - 100G

| Fabricante   | Modelo         | Número de Parte     | Requisito DZ | CANT | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 100GBASE-LR | QSFP-100G-LR    | No             | 16  | La elección de cableado y óptica está disponible a discreción del contribuidor. Se requieren 100G para conectar FPGAs. |

---

#### Óptica - 10G

| Fabricante   | Modelo         | Número de Parte     | Requisito DZ | CANT | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 10GBASE-LR | SFP-10G-LR    | No             | 2   | La elección de cableado y óptica está disponible a discreción del contribuidor. |
| Finisar | DynamiX QSA™ | MAM1Q00A-QSA   | No             | 2   | La elección de cableado y óptica está disponible a discreción del contribuidor. |

---

#### Direccionamiento IP

| Direccionamiento IP | Tamaño Mínimo de Subred | Requisito DZ | Nota |
|--------------|-------------------|----------------|----------------------------------------------------------|
| IPv4 Pública  | /29               | Sí (para DZDs de borde/híbridos)           | Debe ser enrutable a través de DIA. Podemos eliminar la necesidad de esto con el tiempo. |

Asegúrese de que el pool /29 completo esté disponible para el protocolo DZ. Cualquier requisito de direccionamiento punto a punto, por ejemplo, en interfaces DIA, debe gestionarse mediante un pool de direcciones diferente.

### Contribución de Ancho de Banda de 10 Gbps

Tenga en cuenta que las cantidades reflejan el equipo de dos centros de datos, es decir, el hardware total necesario para desplegar 1 contribución de ancho de banda.

#### Requisitos de Función y Puerto

| Función                    | Velocidad de Puerto | Requisito DZ | CANT | Nota |
|-----------------------------|------------|----------------|-----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Ancho de Banda Privado           | 10G        | Sí            | 1   |                                                                                                                                                                   |
| Acceso Directo a Internet (DIA) | 10G        | Sí            | 2   |                                                                                                                                                                   |
| DoubleZero eXchange (DZX)   | 100G       | Sí*           | 1   | Debe ser compatible cuando más de 3 proveedores operan en la misma área metropolitana; antes de esto, se pueden usar conexiones cruzadas u otros acuerdos de peering para interconectarse con otros proveedores. |
| Gestión                  |            | No             | 1   | Determinado por las propias políticas de gestión interna del contribuidor.                                                                                                    |
| Consola                     |            | No             | 1   | Determinado por las propias políticas de gestión interna del contribuidor.                                                                                                    |

---

#### Hardware

| Fabricante     | Modelo            | Número de Parte           | Requisito DZ | CANT | Nota |
|----------|-----------------|----------------------|----------------|-----|-----------------------------------------------------------|
| AMD*      | V80*           | 24540474*    | Sí            | 4   |                                                           |              |
| Arista   | 7280CR3A        | DCS-7280CR3A-32S    | Sí            | 2   | Pueden ser posibles alternativas si los tiempos de entrega son desafiantes. |

---

#### Óptica - 100G

| Fabricante   | Modelo         | Número de Parte     | Requisito DZ | CANT | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 100GBASE-LR | QSFP-100G-LR    | No             | 14  | La elección de cableado y óptica está disponible a discreción del contribuidor. Se requieren 100G para conectar FPGAs. |

---

#### Óptica - 10G

| Fabricante   | Modelo         | Número de Parte     | Requisito DZ | CANT | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 10GBASE-LR | SFP-10G-LR    | No             | 4   | La elección de cableado y óptica está disponible a discreción del contribuidor. |
 Finisar | DynamiX QSA™ | MAM1Q00A-QSA   | No             | 4   | La elección de cableado y óptica está disponible a discreción del contribuidor. |
---

#### Direccionamiento IP

| Direccionamiento IP | Tamaño Mínimo de Subred | Requisito DZ | Nota |
|--------------|-------------------|----------------|----------------------------------------------------------|
| IPv4 Pública  | /29               | Sí (para DZDs de borde/híbridos)            | Debe ser enrutable a través de DIA. Podemos eliminar la necesidad de esto con el tiempo. |

Asegúrese de que el pool /29 completo esté disponible para el protocolo DZ. Cualquier requisito de direccionamiento punto a punto, por ejemplo, en interfaces DIA, debe gestionarse mediante un pool de direcciones diferente.

### Requisitos del Centro de Datos

#### Requisitos de Rack y Energía

| Requisito  | Especificación |
|-------------|--------------|
| Espacio en Rack  | 4U           |
| Energía       | 4KW (recomendado) |

---

## Próximos Pasos

¿Listo para aprovisionar su primer DZD? Continúe a la [Guía de Aprovisionamiento de Dispositivos](contribute-provisioning.md).
