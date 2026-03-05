# Cómo configurar DoubleZero

!!! info "Terminología"
    ¿Nuevo en DoubleZero? Consulte el [Glosario](glossary.md) para ver definiciones de términos como [doublezerod](glossary.md#doublezerod), [IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency) y [DZD](glossary.md#dzd-doublezero-device).

!!! warning "Al conectarme a DoubleZero acepto los [Términos de Servicio de DoubleZero](https://doublezero.xyz/terms-protocol)"


## Requisitos Previos
!!! warning inline end
    Para validadores: DoubleZero debe instalarse directamente en el host del validador, no en un contenedor.
- Conectividad a internet con una dirección IP pública (sin NAT)
- Servidor x86_64
- SO soportado: Ubuntu 22.04+ o Debian 11+, o Rocky Linux / RHEL 8+
- Privilegios de root o sudo en el servidor donde se ejecutará DoubleZero
- Opcional pero útil: jq y curl para depuración

## Conexión a DoubleZero

DoubleZero Testnet y DoubleZero Mainnet-Beta son redes físicamente distintas. Seleccione la red apropiada durante la instalación.

Al incorporarse a DoubleZero establecerá una **identidad DoubleZero**, representada por una clave pública llamada **DoubleZero ID**. Esta clave forma parte de cómo DoubleZero reconoce su máquina.

## 1. Instalar los Paquetes de DoubleZero

<div data-wizard-step="install-version-info" markdown>

!!! info "Versiones Actuales"
    | Paquete | Mainnet-Beta | Testnet |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |

</div>

Siga estos pasos dependiendo de su sistema operativo:

### Ubuntu / Debian

<div data-wizard-step="install-deb-mainnet-beta" markdown>

El despliegue recomendado actualmente para Mainnet-Beta es:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

<div data-wizard-step="install-deb-testnet" markdown>

El despliegue recomendado actualmente para Testnet es:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

### Rocky Linux / RHEL

<div data-wizard-step="install-rpm-mainnet-beta" markdown>

El despliegue recomendado actualmente para Mainnet-Beta es:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-rpm-testnet" markdown>

El despliegue recomendado actualmente para Testnet es:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-network-warning" markdown>

??? info "Solo Usuarios Existentes: Cambiar un paquete de *Testnet a Mainnet-Beta*, o de *Mainnet-Beta a Testnet*"
    Cuando instala desde uno de los repositorios de paquetes anteriores, este es específico para DoubleZero **Testnet** o **DoubleZero Mainnet Beta**. Si cambia de red en algún momento, deberá eliminar los repositorios de paquetes instalados previamente y actualizar al repositorio de destino.

    Este ejemplo le guiará a través de la migración de Testnet a Mainnet-Beta.

    Los mismos pasos pueden completarse para pasar de Mainnet-Beta a Testnet, reemplazando el paso 3 con el comando de instalación para Testnet arriba.


    1. Encontrar los Archivos de Repositorio Antiguos

        Primero, localice cualquier archivo de configuración de repositorio DoubleZero existente en su sistema:

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. Eliminar los Archivos de Repositorio Antiguos

        Elimine los archivos de repositorio antiguos encontrados en el paso anterior, por ejemplo:

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. Instalar desde el Nuevo Repositorio

        Agregue el nuevo repositorio Mainnet-Beta e instale el último paquete:

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<current_recomended_version_above>
        ```


</div>

<div data-wizard-step="install-verify-daemon" markdown>

#### Verificar el estado de `doublezerod`

Después de que el paquete esté instalado, se instala, activa e inicia una nueva unidad systemd. Para ver el estado puede ejecutar:
```
sudo systemctl status doublezerod
```

</div>

### Configurar el Firewall para GRE y BGP

DoubleZero utiliza tunelización GRE (protocolo IP 47) y enrutamiento BGP (tcp/179 en direcciones link-local). Asegúrese de que su firewall permita estos protocolos:

Permitir GRE y BGP a través de iptables:

<div data-wizard-step="firewall-gre-bgp-iptables" markdown>

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```

</div>

O permitir GRE y BGP a través de UFW:

<div data-wizard-step="firewall-gre-bgp-ufw" markdown>

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```

</div>

## 2. Crear una Nueva Identidad DoubleZero

Cree una Identidad DoubleZero en su servidor con el siguiente comando:

```bash
doublezero keygen
```

!!! info
    Si tiene un ID existente que desea usar, puede seguir estos pasos opcionales.

    Crear el directorio de configuración de doublezero

    ```
    mkdir -p ~/.config/doublezero
    ```

    Copie o enlace el `id.json` que desea usar con DoubleZero al directorio de configuración de doublezero.

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```
## 3. Recuperar la identidad DoubleZero del servidor

Revise su Identidad DoubleZero. Esta identidad se utilizará para crear la conexión entre su máquina y DoubleZero.

```bash
doublezero address
```

**Salida:**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. Verificar que doublezerod ha descubierto los dispositivos DZ

Antes de conectarse, asegúrese de que `doublezerod` haya descubierto y pingueado cada uno de los switches de testnet DZ disponibles:

```
doublezero latency
```

Ejemplo de salida:

```
$ doublezero latency
 pubkey                                       | name      | ip             | min      | max      | avg      | reachable
 96AfeBT6UqUmREmPeFZxw6PbLrbfET51NxBFCCsVAnek | la2-dz01  | 207.45.216.134 |   0.38ms |   0.45ms |   0.42ms | true
 CCTSmqMkxJh3Zpa9gQ8rCzhY7GiTqK7KnSLBYrRriuan | ny5-dz01  | 64.86.249.22   |  68.81ms |  68.87ms |  68.85ms | true
 BX6DYCzJt3XKRc1Z3N8AMSSqctV6aDdJryFMGThNSxDn | ty2-dz01  | 180.87.154.78  | 112.16ms | 112.25ms | 112.22ms | true
 55tfaZ1kRGxugv7MAuinXP4rHATcGTbNyEKrNsbuVLx2 | ld4-dz01  | 195.219.120.66 | 138.15ms | 138.21ms | 138.17ms | true
 3uGKPEjinn74vd9LHtC4VJvAMAZZgU9qX9rPxtc6pF2k | ams-dz001 | 195.219.138.50 | 141.84ms | 141.97ms | 141.91ms | true
 65DqsEiFucoFWPLHnwbVHY1mp3d7MNM2gNjDTgtYZtFQ | frk-dz01  | 195.219.220.58 | 143.52ms | 143.62ms | 143.58ms | true
 9uhh2D5c14WJjbwgM7BudztdoPZYCjbvqcTPgEKtTMZE | sg1-dz01  | 180.87.102.98  | 176.66ms | 176.76ms | 176.72ms | true
```

Si no se devuelven dispositivos en la salida, espere 10-20 segundos y vuelva a intentarlo.

## 5. Desconectarse de DoubleZero

En las siguientes secciones configurará su Entorno DoubleZero. Para garantizar el éxito, desconecte la sesión actual. Esto evitará problemas relacionados con múltiples túneles abiertos en su máquina.

Verifique

```bash
doublezero status
```

si está `up` ejecute:

```bash
doublezero disconnect
```

### Siguiente Paso: Inquilino

La conexión a DoubleZero diferirá según su caso de uso. En DoubleZero, los Inquilinos son grupos que tienen perfiles de usuario similares. Algunos ejemplos incluyen Blockchains, Capas de Transferencia de Datos, etc.

### [Proceda a elegir su inquilino aquí](tenant.md)


# Opcional: Habilitar Métricas de Prometheus

Los operadores familiarizados con las métricas de Prometheus pueden querer habilitarlas para el monitoreo de DoubleZero. Esto proporciona visibilidad sobre el rendimiento del cliente DoubleZero, el estado de la conexión y la salud operacional.

## Qué Métricas Están Disponibles

DoubleZero expone varias métricas clave:
- **Información de Compilación**: Versión, hash de commit y fecha de compilación
- **Estado de Sesión**: Si la sesión de DoubleZero está activa
- **Métricas de Conexión**: Información de latencia y conectividad
- **Datos de Rendimiento**: Rendimiento y tasas de error

## Habilitar Métricas de Prometheus

Para habilitar las métricas de Prometheus en el cliente DoubleZero, siga estos pasos:

### 1. Modificar el comando de inicio del servicio systemd de doublezerod

Cree o edite la configuración de anulación de systemd:

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

Reemplace con esta configuración:

Tenga en cuenta que el flag `-env` debe apuntar a `testnet` o `mainnet-beta` dependiendo de qué red desea recopilar datos. En el bloque de ejemplo se usa `testnet`. Puede reemplazarlo por `mainnet-beta` si es necesario.

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env testnet -metrics-enable -metrics-addr localhost:2113
```

### 2. Recargar y reiniciar el servicio

```bash
sudo systemctl daemon-reload
sudo systemctl restart doublezerod
sudo systemctl status doublezerod
```

### 3. Verificar que las métricas estén disponibles

Compruebe que el endpoint de métricas esté respondiendo:

```bash
curl -s localhost:2113/metrics | grep doublezero
```

Salida esperada:

```
# HELP doublezero_build_info Build information of the client
# TYPE doublezero_build_info gauge
doublezero_build_info{commit="0d684e1b",date="2025-09-10T16:30:25Z",version="0.6.4"} 1
# HELP doublezero_session_is_up Status of session to doublezero
# TYPE doublezero_session_is_up gauge
doublezero_session_is_up 0
```
## Solución de Problemas

Si las métricas no aparecen:

1. **Verificar el estado del servicio**: `sudo systemctl status doublezerod`
2. **Verificar la configuración**: `sudo systemctl cat doublezerod`
3. **Revisar los logs**: `sudo journalctl -u doublezerod -f`
4. **Probar el endpoint**: `curl -v localhost:2113/metrics`
5. **Verificar el puerto**: `netstat -tlnp | grep 2113`


## Configurar el Servidor de Prometheus

La configuración y seguridad están fuera del alcance de esta documentación.
Grafana es una excelente opción para la visualización, y tiene documentación disponible [aquí](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/) que detalla cómo recopilar métricas de Prometheus.

## Panel de Grafana (Opcional)

Para la visualización, puede crear un panel de Grafana usando las métricas de DoubleZero. Los paneles comunes incluyen:
- Estado de sesión a lo largo del tiempo
- Información de compilación
- Tendencias de latencia de conexión
- Monitoreo de tasa de errores
