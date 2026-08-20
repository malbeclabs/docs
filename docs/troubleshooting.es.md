---
description: Diagnostica problemas comunes de conexión de DoubleZero con comandos de referencia, salidas esperadas y dónde obtener soporte adicional.
---

# Solución de problemas

Esta guía cubrirá una variedad de problemas y se actualiza continuamente. Si completa la guía, puede buscar soporte adicional en el discord de [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701).


## Comandos comunes y sus salidas

Para comenzar, examine la salida de los siguientes comandos y su salida esperada. Estos le ayudarán en una solución de problemas más detallada.
Si abre un ticket, es posible que le soliciten sus salidas.

#### 1. Verificar la versión
Comando:

`doublezero --version`

Salida de ejemplo:
```
DoubleZero 0.6.3
```
[comment]: # (when repo is public add this link to check https://github.com/malbeclabs/doublezero)

#### 2. Verificar la dirección de DoubleZero
Comando:

`doublezero address`

Salida de ejemplo:
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```
[comment]: # ()

#### 3. Verificar su Access Pass

Pubkey de ejemplo: `MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` reemplace esto con su pubkey al ejecutar el comando.

Comando:

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

Salida: [note que usamos `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'` para mostrarle el encabezado en esta salida]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
```
[comment]: # ()
#### 4. Verificar los créditos del libro mayor de DoubleZero
Comando:

`doublezero balance`

Salida de ejemplo:
```
0.78 Credits
```
[comment]: # (add section linked later for 0 balance mainnet/testnet)

#### 5. Verificar el estado de la conexión
Comando:

`doublezero status`

Salida de ejemplo:

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```
[comment]: # (in next iteration add "up" "unknown" and "down" explainers, which then link to a sectino below for troubleshooting undesired states.)


#### 6. Verificar la latencia
Comando:

`doublezero latency`

Salida de ejemplo:
```
 pubkey                                       | code         | ip             | min      | max      | avg      | reachable 
 6E1fuqbDBG5ejhYEGKHNkWG5mSTczjy4R77XCKEdUtpb | nyc-dz001    | 64.86.249.22   | 2.49ms   | 2.61ms   | 2.56ms   | true
 Cpt3doj17dCF6bEhvc7VeAuZbXLD88a1EboTyE8uj6ZL | lon-dz001    | 195.219.120.66 | 71.94ms  | 72.11ms  | 72.02ms  | true
 CT8mP6RUoRcAB67HjKV9am7SBTCpxaJEwfQrSjVLdZfD | lax-dz001    | 207.45.216.134 | 72.42ms  | 72.51ms  | 72.45ms  | true
 4Wr7PQr5kyqCNJo3RKa8675K7ZtQ6fBUeorcexgp49Zp | ams-dz001    | 195.219.138.50 | 76.50ms  | 76.71ms  | 76.60ms  | true
 29ghthsKeH2ZCUmN2sUvhJtpEXn2ZxqAuq4sZFBFZmEs | fra-dz001    | 195.219.220.58 | 83.00ms  | 83.14ms  | 83.08ms  | true
 hWffRFpLrsZoF5r9qJS6AL2D9TEmSvPUBEbDrLc111Y  | fra-dz-001-x | 195.12.227.250 | 84.81ms  | 84.89ms  | 84.85ms  | true
 8jyamHfu3rumSEJt9YhtYw3J4a7aKeiztdqux17irGSj | prg-dz-001-x | 195.12.228.250 | 104.81ms | 104.83ms | 104.82ms | true
 5tqXoiQtZmuL6CjhgAC6vA49JRUsgB9Gsqh4fNjEhftU | tyo-dz001    | 180.87.154.78  | 178.04ms | 178.23ms | 178.13ms | true
 D3ZjDiLzvrGi5NJGzmM7b3YZg6e2DrUcBCQznJr3KfC8 | sin-dz001    | 180.87.102.98  | 227.67ms | 227.85ms | 227.75ms | true
```
[comment]: # ()

# Ejemplos de solución de problemas
Ahora que hemos examinado las salidas básicas y lo que se espera en un despliegue saludable, podemos examinar algunos ejemplos comunes de solución de problemas.

### Problema: ❌ Error creating user

Este problema generalmente está relacionado con una discrepancia entre el emparejamiento esperado de pubkey/IP y el emparejamiento de pubkey/IP con el que el usuario está intentando acceder a DoubleZero.

**Síntomas:**
- Al conectarse con `doublezero connect ibrl` el usuario encuentra `❌ Error creating user`


**Soluciones:**
1. Verifique

    `doublezero address`

    Salida de ejemplo:
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. Verifique que esta dirección está en la lista de permitidos:

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    Salida de ejemplo:
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
    ```
     La pubkey de `doublezero address` debe coincidir con la pubkey de user_payer y la dirección IP desde la que está intentando conectarse debe coincidir con la ip en el Access-Pass.
    `doublezero address` se obtiene del archivo id.json en ~/.config/doublezero/ por defecto. Consulte el [paso 6 aquí](<setup.md>)
    
3. Si lo anterior parece correcto y está obteniendo un error al conectarse, o si el mapeo anterior es incorrecto, por favor contacte con soporte en [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)

### Problema: ❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
Este error indica que un dispositivo ya está conectado a DoubleZero.

**Síntomas:**
- El usuario intenta conectarse a DoubleZero
- Se encuentra `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time`.

**Soluciones:**
1. Verifique
    `doublezero status`

    Salida:
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. -`up`- indica una conexión saludable.
3. El error aparece porque un túnel hacia DoubleZero con la IP específica de DoubleZero ya está activo en esta máquina.

    Este error se encuentra frecuentemente después de una actualización del cliente DoubleZero. Las actualizaciones de DoubleZero reinician automáticamente el servicio doublezerod y lo reconectarán si estaba conectado antes del reinicio del servicio.


### Problema: El estado de DoubleZero es unknown o down
Este problema a menudo está relacionado con que el túnel GRE se activó exitosamente entre el servidor y el dispositivo DoubleZero, pero un firewall está impidiendo el establecimiento de la sesión BGP. Debido a esto, no está recibiendo rutas de la red ni enviando tráfico a través de DoubleZero.

**Síntomas:**
- `doublezero connect ibrl` fue exitoso. Sin embargo, `doublezero status` devuelve `down` o `unknown`
    ```
    doublezero connect ibrl                                                                                                                                                                                                                                                                                                                                  
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
    ✅  User Provisioned
    ```

    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```

**Soluciones:**
1. ¡Verifique sus reglas de firewall!

   DoubleZero utiliza el espacio de direcciones link local: 169.254.0.0/16 para las interfaces del túnel GRE entre su máquina y el dispositivo DoubleZero. 169.254.0.0/16 es típicamente un espacio "no enrutable" y por lo tanto las buenas prácticas de seguridad recomendarán bloquear las comunicaciones hacia/desde este espacio. Necesitará permitir una regla en su firewall que habilite a src 169.254.0.0/16 comunicarse con dst 169.254.0.0/16 en el puerto tcp 179. Esa regla deberá colocarse por encima de cualquier regla que deniegue el tráfico hacia 169.254.0.0/16.

    En un firewall como ufw puede ejecutar `sudo ufw status` para ver las reglas del firewall y

    Salida de ejemplo que puede ser algo similar a lo que tendría un validador de Solana.
    ```
    To                         Action      From
    --                         ------      ----
    22/tcp                     ALLOW       Anywhere
    8899/tcp                   ALLOW       Anywhere
    8000:10000/tcp             ALLOW       Anywhere
    8000:10000/udp             ALLOW       Anywhere
    11200:11300/udp            ALLOW       Anywhere
    11200:11300/tcp            ALLOW       Anywhere

    To                         Action      From
    --                         ------      ----
    10.0.0.0/8                 DENY OUT    Anywhere
    169.254.0.0/16             DENY OUT    Anywhere
    172.16.0.0/12              DENY OUT    Anywhere
    192.168.0.0/16             DENY OUT    Anywhere
    ```

    En la salida anterior puede ver que todo el tráfico hacia 169.254.0.0/16, excepto los puertos especificados, está denegado.
    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179` para insertar la regla en la posición <N>. Es decir, si N = 1 entonces insertará esta regla como la primera regla.
    `sudo ufw status numbered` le mostrará el orden numérico de las reglas.
    
### Problema: El dispositivo DoubleZero más cercano ha cambiado

Esto no es un error, pero puede ser una optimización. A continuación se muestra una mejor práctica que puede ejecutarse de vez en cuando, o automatizarse.

**Soluciones:**

1. Verifique la latencia al dispositivo más cercano
    - ejecute `doublezero latency`

        salida
        ```
         pubkey                                       | code          | ip              | min      | max      | avg      | reachable 
         2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.80ms   | 1.90ms   | 1.84ms   | true      
         ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.83ms   | 2.10ms   | 1.92ms   | true      
         8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.87ms   | 2.66ms   | 2.15ms   | true      
         8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.33ms   | 2.39ms   | 2.37ms   | true      
         FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.29ms   | 2.59ms   | 2.40ms   | true   
        ```
        note arriba que el dispositivo más cercano es `dz-ny7-sw01`

        Queremos conectarnos a este dispositivo:

2. Determine si ya está conectado al dispositivo objetivo
    - ejecute `doublezero user list --env testnet | grep 111.11.11.11` reemplace `111.11.11.11` con la dirección IPv4 pública de su dispositivo que está conectado a DoubleZero. También puede usar su ID de validador o ID de DoubleZero.

        salida
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        En este ejemplo, ya estamos conectados al dispositivo más cercano. No se necesitan más pasos, podemos detenernos aquí.


        Consideremos en cambio si la salida fuera
         ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | fra-dz-001-x     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        Esta sería una conexión subóptima. Consideremos si es necesaria una reconexión.

        Antes de conectarse, verificaremos si el dispositivo tiene túneles de usuario disponibles.

3. Opcional: examinar la red en busca de dispositivos disponibles

    Con fines educativos primero:
    - ejecute `doublezero device list` para obtener una lista completa de dispositivos. Hemos extraído 2 dispositivos como ejemplo para explicar la salida.

        salida:
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner                                        
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp 
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        Note arriba que `ams001-dz002` tiene 69 usuarios y 128 usuarios máximos. Este dispositivo puede agregar 59 usuarios.

        Sin embargo, `dz-fr5-sw01` tiene 0 usuarios y 0 usuarios máximos. No podrá conectarse a este dispositivo. Con un máximo de usuarios de 0, el dispositivo no acepta ninguna conexión.

        Ahora volvamos a conectarnos a nuestro dispositivo más cercano.

4. Determine si el dispositivo objetivo tiene una conexión disponible
    - ejecute `doublezero device list | grep dz-ny7-sw01` reemplace `dz-ny7-sw01` con su dispositivo objetivo

        salida
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        aquí podemos ver que `dz-ny7-sw01` tiene espacio disponible para conexión.

5. Conectarse al dispositivo DoubleZero más cercano

    Nos desconectaremos y luego nos reconectaremos a DoubleZero.

    Primero ejecute
    - `doublezero disconnect`

      salida

        ```
        DoubleZero Service Provisioning
        🔍  Decommissioning User
        Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
        \ [00:00:00] [##########>-----------------------------] 1/4 deleting user       account...                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     🔍  Deleting User Account for: 6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW
        🔍  User Account deleted
        ✅  Deprovisioning Complete
        ```
    ahora verificamos el estado para confirmar nuestra desconexión con
    - `doublezero status`

    salida

    ```
    Tunnel status | Last Session Update | Tunnel Name | Tunnel src | Tunnel dst | Doublezero IP | User Type 
    disconnected  | no session data     |             |            |            |               |    
    ```
    Por último nos reconectaremos con
    - `doublezero connect ibrl`

    salida
    ```
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: dz-ny7-sw01 
    Service provisioned with status: ok
    ✅  User Provisioned
    ```
    observe en la salida anterior que nos `Connected to device: dz-ny7-sw01` este es el resultado deseado de nuestra investigación inicial en el paso 1, donde descubrimos que `dz-ny7-sw01` era el dispositivo con la latencia más baja.

### Problema: Entorno de DoubleZero incorrecto

Mainnet-Beta y Testnet utilizan repositorios de paquetes diferentes. `doublezero status` muestra a qué red está conectado el cliente (columna `Network`). Si un usuario instaló el cliente incorrecto, o el daemon todavía apunta al otro entorno, use estos cambios de copiar y pegar.

Para configurar el CLI del cliente DoubleZero (`doublezero`) y el daemon (`doublezerod`) para conectarse a **DoubleZero testnet**:

```bash
DESIRED_DOUBLEZERO_ENV=testnet \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Para configurar el CLI del cliente DoubleZero (`doublezero`) y el daemon (`doublezerod`) para conectarse a **DoubleZero mainnet-beta**:

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Debería ver: `✅ doublezerod configured for environment mainnet-beta` (o `testnet`). Luego `doublezero status` debería mostrar el `Network` correspondiente.

### Problema: `doublezero status` devuelve algunos campos con N/A

Este problema generalmente está relacionado con una discrepancia entre el daemon y cliente actuales, frente al daemon y cliente con los que se estableció el túnel DZ conectado.

**Síntomas:**
- Al ejecutar `doublezero status` el usuario encuentra `N/A` en algunos campos




**Soluciones:**
1. Ejecute
`doublezero status`

    Ejemplo:

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro | Network
    up            | 2025-10-20 20:06:18 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | N/A            | ✅ dz-ny7-sw01        | N/A   | mainnet-beta
    ```

    Observe en nuestra salida de ejemplo anterior que el `Tunnel status` es `up`. Nuestro `Network` es `mainnet-beta`. Sin embargo, `Current Device` y `Metro` son `N/A`

    Esto es indicativo de un túnel abierto en su máquina que no está en su entorno actual.
    En este caso, el estado `up`, sin `Current Device` encontrado en `mainnet-beta`, nos revela que ¡nuestro túnel está en testnet!
 
2. Cambie de entorno usando los comandos de copiar y pegar en [entorno de DoubleZero incorrecto](#problema-entorno-de-doublezero-incorrecto). Use el opuesto del valor de `Network` que está devolviendo `N/A`.

3. Verifique su estado

    Después de cambiar de entorno ejecute:

    ```
    doublezero status
    ```

    La salida esperada debería ser similar a:

    ``` 
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro    | Network 
    up            | 2025-10-21 12:32:12 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | nyc-dz001      | ✅ nyc-dz001          | New York | testnet 
    ```
Con todos los campos completados, ahora se encuentra en el entorno correcto.