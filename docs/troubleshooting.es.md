# Solución de Problemas

Esta guía cubre una variedad de problemas y está en continuo desarrollo. Si completa la guía puede buscar soporte adicional en el Discord de [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701).


## Comandos Comunes y Salidas

Para comenzar, examine la salida de los siguientes comandos y sus salidas esperadas. Estos le ayudarán en una solución de problemas más detallada.
Si abre un ticket, es posible que le pidan sus salidas.

#### 1. Verificar Versión
Comando:

`doublezero --version`

Salida de Ejemplo:
```
DoubleZero 0.6.3
```

#### 2. Verificar Dirección DoubleZero
Comando:

`doublezero address`

Salida de Ejemplo:
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```

#### 3. Verificar su Pase de Acceso

Pubkey de ejemplo: `MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` reemplácela con su pubkey al ejecutar el comando.

Comando:

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

Salida: [nota: usamos `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'` para mostrarle el encabezado en esta salida]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
```

#### 4. Verificar Créditos del Ledger DoubleZero
Comando:

`doublezero balance`

Salida de Ejemplo:
```
0.78 Credits
```

#### 5. Verificar Estado de Conexión
Comando:

`doublezero status`

Salida de Ejemplo:

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```

#### 6. Verificar Latencia
Comando:

`doublezero latency`

Salida de Ejemplo:
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

# Ejemplos de Solución de Problemas
Ahora que hemos examinado las salidas básicas y lo que se espera en un despliegue saludable, podemos examinar algunos ejemplos comunes de solución de problemas.

### Problema: ❌ Error al crear usuario

Este problema generalmente está relacionado con una discrepancia entre el par pubkey/IP esperado y el par pubkey/IP con el que el usuario intenta acceder a DoubleZero.

**Síntomas:**
- Al conectarse con `doublezero connect ibrl` el usuario encuentra `❌ Error creating user`


**Soluciones:**
1. Verifique

    `doublezero address`

    Salida de Ejemplo:
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. Verifique que esta dirección esté en la lista de permitidos:

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    Salida de Ejemplo:
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
    ```
     La pubkey de `doublezero address` debe coincidir con la pubkey user_payer y la dirección IP desde la que intenta conectarse debe coincidir con la IP en el Pase de Acceso.
    `doublezero address` proviene del archivo id.json en `~/.config/doublezero/` por defecto. Consulte el [paso 6 aquí](https://docs.malbeclabs.com/setup/)

3. Si lo anterior parece correcto y está obteniendo un error al conectarse, o si el mapeo anterior es incorrecto, contacte a soporte en [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)

### Problema: ❌ Error al aprovisionar servicio: cosas malformadas: no se pueden aprovisionar múltiples túneles al mismo tiempo
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
2. `up` indica una conexión saludable.
3. El error aparece porque ya hay un túnel activo hacia DoubleZero con la IP DoubleZero específica en esta máquina.

    Este error se encuentra con frecuencia después de una actualización del cliente DoubleZero. Las actualizaciones de DoubleZero reinician automáticamente el servicio doublezerod y le reconectarán si estaba conectado antes del reinicio del servicio.


### Problema: El estado de DoubleZero es desconocido o caído
Este problema generalmente está relacionado con que el túnel GRE se activó correctamente entre el servidor y el Dispositivo DoubleZero, pero un firewall impide el establecimiento de la sesión BGP. Por ello no está recibiendo rutas de la red ni enviando tráfico a través de DoubleZero.

**Síntomas:**
- `doublezero connect ibrl` fue exitoso. Sin embargo, `doublezero status` devuelve `down` o `unknown`

**Soluciones:**
1. ¡Verifique las reglas de su firewall!

   DoubleZero utiliza el espacio de direcciones link-local: 169.254.0.0/16 para las interfaces del túnel GRE entre su máquina y el Dispositivo DoubleZero. 169.254.0.0/16 es típicamente espacio "no enrutable" y por lo tanto las buenas prácticas de seguridad recomendarán bloquear las comunicaciones hacia/desde este espacio. Necesitará permitir una regla en su firewall que permita que src 169.254.0.0/16 se comunique con dst 169.254.0.0/16 en el puerto tcp 179. Esa regla debe colocarse por encima de cualquier regla que deniegue tráfico a 169.254.0.0/16.

    En un firewall como ufw puede ejecutar `sudo ufw status` para ver las reglas del firewall.

    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179` para insertar la regla en la posición <N>. Por ejemplo, si N = 1 insertará esta regla como la primera regla.
    `sudo ufw status numbered` le mostrará el orden numérico de las reglas.

### Problema: El dispositivo DoubleZero más cercano ha cambiado

Esto no es un error, pero puede ser una optimización. A continuación se muestra una buena práctica que se puede ejecutar de vez en cuando o automatizar.

**Soluciones:**

1. Verifique la latencia al dispositivo más cercano
    - Ejecute `doublezero latency`

2. Determine si ya está conectado al dispositivo objetivo
    - Ejecute `doublezero user list --env testnet | grep 111.11.11.11` reemplazando `111.11.11.11` con la dirección IPv4 pública de su dispositivo conectado a DoubleZero.

3. Opcional: examine la red para ver los dispositivos disponibles
    - Ejecute `doublezero device list` para obtener una lista completa de dispositivos.

4. Determine si el dispositivo objetivo tiene una conexión disponible
    - Ejecute `doublezero device list | grep dz-ny7-sw01` reemplazando `dz-ny7-sw01` con su dispositivo objetivo.

5. Conéctese al Dispositivo DoubleZero más cercano

    Primero ejecute
    - `doublezero disconnect`

    Luego verifique el estado con
    - `doublezero status`

    Por último reconéctese con
    - `doublezero connect ibrl`

### Problema: `doublezero status` devuelve algunos campos con N/A

Este problema generalmente está relacionado con una discrepancia entre el daemon y cliente actuales versus el daemon y cliente con los que se estableció el túnel DZ conectado.

**Síntomas:**
- Al ejecutar `doublezero status` el usuario encuentra `N/A` en algunos campos

**Soluciones:**
1. Ejecute
`doublezero status`

    Note que el `Tunnel status` es `up` y `Network` es `mainnet-beta` pero `Current Device` y `Metro` son `N/A`. Esto indica un túnel abierto en su máquina que no está en su entorno actual.

2. Cambie su entorno.

    Para configurar el CLI `doublezero` y el daemon `doublezerod` para conectarse a **DoubleZero testnet**:

    ```bash
    DESIRED_DOUBLEZERO_ENV=testnet \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

    Para configurar el CLI `doublezero` y el daemon `doublezerod` para conectarse a **DoubleZero mainnet-beta**:

    ```bash
    DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

3. Verifique su estado

    Después de cambiar el entorno ejecute:

    ```
    doublezero status
    ```

    Con todos los campos completados ahora está en el entorno correcto.
