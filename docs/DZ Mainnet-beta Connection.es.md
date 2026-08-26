---
description: Conecta un validador de Solana Mainnet-Beta y hasta tres respaldos a DoubleZero en modo IBRL, incluyendo la prueba de identidad y la solicitud de conexión.
---

# Conexión de Validador Mainnet-Beta en Modo IBRL
!!! warning "Al conectarme a DoubleZero, acepto los [Términos de Servicio de DoubleZero](https://doublezero.xyz/terms-protocol)"



### Conexión a Mainnet-Beta en Modo IBRL

!!! Note inline end
    El modo IBRL no requiere reiniciar los clientes del validador, porque utiliza tu dirección IP pública existente.

Los Validadores de Solana Mainnet completarán la conexión a DoubleZero Mainnet-beta, lo cual se detalla en esta página.

Cada validador de Solana tiene su propio **par de claves de identidad**; de este, se extrae la clave pública conocida como el **ID de nodo**. Esta es la huella digital única del validador en la red de Solana.

Con el DoubleZeroID y el ID de nodo identificados, probarás la propiedad de tu máquina. Esto se hace creando un mensaje que incluye el DoubleZeroID firmado con la clave de identidad del validador. La firma criptográfica resultante sirve como prueba verificable de que controlas el validador.

Finalmente, enviarás una **solicitud de conexión a DoubleZero**. Esta solicitud comunica: *"Aquí está mi identidad, aquí está la prueba de propiedad, y aquí está cómo pretendo conectarme."* DoubleZero valida esta información, acepta la prueba y aprovisiona el acceso a la red para el validador en DoubleZero.

Esta guía permite registrar 1 Validador Primario y hasta 3 máquinas de respaldo/conmutación por error al mismo tiempo.

## Prerrequisitos

- Solana CLI instalado y en $PATH
- Para validadores: Permiso de acceso al archivo del par de claves de identidad del validador (por ejemplo, validator-keypair.json) bajo el usuario sol
- Para validadores: Verificar que la clave de identidad del validador de Solana que se conecta tiene al menos 1 SOL
- Las reglas del firewall permiten conexiones salientes para DoubleZero y Solana RPC según sea necesario, incluyendo
 GRE (ip proto 47) y BGP (169.254.0.0/16 en tcp/179)

!!! info
    El ID del Validador se verificará contra el gossip de Solana para determinar la IP de destino. La IP de destino y el DoubleZero ID se utilizarán luego al abrir un túnel GRE entre tu máquina y el Dispositivo DoubleZero de destino.

    Considere: En el caso de que tengas un ID basura y un ID Primario en la misma IP, solo se utilizará el ID Primario en el registro de la máquina. Esto se debe a que el ID basura no aparecerá en el gossip y, por lo tanto, no se puede usar para verificar la IP de la máquina de destino.

## 1. Confirmar la red del cliente

Por favor sigue las instrucciones de [configuración](setup.md) antes de continuar. Instala los paquetes de **Mainnet-Beta** — Testnet y Mainnet-Beta usan repositorios de paquetes diferentes.

El último paso en la configuración fue desconectarse de la red. Esto es para asegurar que solo un túnel esté abierto en tu máquina hacia DoubleZero, y que ese túnel esté en la red correcta.

Confirma que el cliente está en mainnet-beta:

```bash
doublezero status
```

La columna `Network` debería ser `mainnet-beta`. Si es `testnet`, o instalaste el paquete incorrecto, usa el interruptor de copiar y pegar en [solución de problemas](troubleshooting.md#issue-wrong-doublezero-environment).

Después de aproximadamente 30 segundos verás los dispositivos DoubleZero disponibles:

```bash
doublezero latency
```
Salida de ejemplo (Mainnet-Beta)
```bash
 pubkey                                       | code          | ip              | min      | max      | avg      | reachable
 2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.74ms   | 1.92ms   | 1.84ms   | true
 ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.88ms   | 4.39ms   | 2.72ms   | true
 8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.45ms   | 3.30ms   | 2.74ms   | true
 8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.88ms   | 5.13ms   | 3.02ms   | true
 uzyg9iYw2FEbtdTHaDb5HoeEWYAPRPQgvsgyd873qPS  | nyc001-dz002  | 4.42.212.122    | 3.17ms   | 3.63ms   | 3.33ms   | true
 FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.33ms   | 5.46ms   | 3.39ms   | true
 9oKLaL6Hwno5TyAFutTbbkNrzxm1fw9fhzkiUHgsxgGx | dz-dc10-sw01  | 137.239.200.186 | 6.84ms   | 7.01ms   | 6.91ms   | true
 DESzDP8GkSTpQLkrUegLkt4S2ynGfZX5bTDzZf3sEE58 | was001-dz002  | 38.88.214.133   | 7.39ms   | 7.44ms   | 7.41ms   | true
 HHNCpqB7CwHVLxAiB1S86ko6gJRzLCtw78K1tc7ZpT5P | was001-dz001  | 66.198.11.74    | 7.67ms   | 7.85ms   | 7.76ms   | true
 9LFtjDzohKvCBzSquQD4YtL3HwuvkKBDE7KSzb8ztV2b | dz-mtl11-sw01 | 134.195.161.10  | 9.88ms   | 10.01ms  | 9.95ms   | true
 9M7FfYYyjM4wGinKPofZRNmQFcCjCKRbXscGBUiXvXnG | dz-tor1-sw01  | 209.42.165.10   | 14.52ms  | 14.53ms  | 14.52ms  | true
```
La salida de Testnet será idéntica en estructura, pero con menos dispositivos.

## 2. Abrir el puerto 44880

Los usuarios necesitan abrir el puerto 44880 para utilizar algunas [funciones de enrutamiento](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

Para abrir el puerto 44880 podrías actualizar las tablas IP de la siguiente manera:

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

nota los flags `-i doublezero0`, `-o doublezero0` que restringen esta regla solo a la interfaz DoubleZero

O UFW de la siguiente manera:

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

nota los flags `in on doublezero0`, `out on doublezero0` que restringen esta regla solo a la interfaz DoubleZero

## 3. Atestiguar la Propiedad del Validador

<div data-wizard-step="mainnet-find-validator" markdown>

Con tu Entorno DoubleZero configurado, ahora es momento de atestiguar la Propiedad de tu Validador.

El DoubleZero ID que creaste en la [configuración](setup.md) de tu validador primario debe usarse en todas las máquinas de respaldo.

El ID en tu máquina primaria se puede encontrar con `doublezero address`. El mismo ID debe estar en `~/.config/doublezero/id.json` en todas las máquinas del clúster.

Para lograr esto, primero verificarás que la máquina desde la que estás ejecutando los comandos es tu **Validador Primario** con:

```
doublezero-solana passport find-validator -u mainnet-beta
```

Esto verifica que el validador está registrado en el gossip y aparece en el programa de líderes.

Salida esperada:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 11.11.11.111
Validator ID: ValidatorIdentity111111111111111111111111111
Gossip IP: 11.11.11.111
In Leader scheduler
✅ This validator can connect as a primary in DoubleZero 🖥️  💎. It is a leader scheduled validator.
```

!!! info
    El mismo flujo de trabajo se usa para una o muchas máquinas.
    Para registrar una sola máquina, excluye los argumentos "--backup-validator-ids" o "backup_ids=" de cualquier comando en esta página.

Ahora, en todas las máquinas de respaldo en las que pretendes ejecutar tu **Validador Primario**, ejecuta lo siguiente:
```
doublezero-solana passport find-validator -u mainnet-beta
```

Salida esperada:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
Esta salida es esperada. El nodo de respaldo no puede estar en el programa de líderes al momento de la creación del pase.

Ahora ejecutarás este comando en **todas las máquinas de respaldo** en las que planeas usar la cuenta de voto e identidad de tu **Validador Primario**.

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### Preparar la Conexión

Ejecuta el siguiente comando en la máquina del **Validador Primario**. Esta es la máquina en la que tienes stake activo, que está en el programa de líderes con tu ID de validador primario en el gossip de Solana en la máquina desde la que estás ejecutando el comando:

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


Salida de ejemplo:

```
DoubleZero Passport - Prepare Validator Access Request
Connected to Solana: mainnet-beta

Primary validator 🖥️  💎:
  ID: ValidatorIdentity111111111111111111111111111
  Gossip: ✅ OK 11.11.11.111)
  Leader scheduler: ✅ OK (Stake: 1,050,000.00 SOL)

Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity222222222222222222222222222
  Gossip: ✅ OK (22.22.22.222)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity333333333333333333333333333
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


  Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity444444444444444444444444444
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)

  To request access, sign the following message with your validator's identity key:

  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>

```
Nota la salida al final de este comando. Es la estructura para el siguiente paso.

</div>

## 4. Generar la Firma

<div data-wizard-step="mainnet-sign-message" markdown>

Al final del último paso, recibimos una salida preformateada para `solana sign-offchain-message`

De la salida anterior ejecutaremos este comando en la máquina del **Validador Primario**.

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**Salida:**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```

</div>

## 5. Iniciar una Solicitud de Conexión en DoubleZero

<div data-wizard-step="mainnet-request-access" markdown>

Usa el comando `request-validator-access` para crear una cuenta en Solana para la solicitud de conexión. El agente DoubleZero Sentinel detecta la nueva cuenta, valida su identidad y firma, y crea el pase de acceso en DoubleZero para que el servidor pueda establecer una conexión.


Usa el ID de nodo, DoubleZeroID y la firma.

!!! note inline end
      En este ejemplo usamos `-k /home/user/.config/solana/id.json` para encontrar la Identidad del validador. Usa la ubicación apropiada para tu despliegue local.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**Salida:**

Esta salida se puede usar para ver la transacción en un explorador de Solana. Asegúrate de cambiar el explorador a mainnet. Esta verificación es opcional.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

Si tiene éxito, DoubleZero registrará el primario con sus respaldos. Ahora puedes conmutar entre las IPs registradas en el pase de acceso. DoubleZero mantendrá la conectividad automáticamente al cambiar a nodos de respaldo registrados de esta manera.

</div>

## 6. Conectar en Modo IBRL

<div data-wizard-step="mainnet-connect-ibrl" markdown>

En el servidor, con el usuario que se conectará a DoubleZero, ejecuta el comando `connect` para establecer la conexión con DoubleZero.

```
doublezero connect ibrl
```

Deberías ver una salida indicando el aprovisionamiento, como:

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.184.101.183 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
🔍  Provisioning User for IP: 137.184.101.183
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
✅  User Provisioned
```
Espera un minuto para que el túnel GRE termine de configurarse. Hasta que el túnel GRE termine de configurarse, la salida de tu estado puede devolver "down" o "Unknown"

Verifica tu conexión:

```bash
doublezero status
```

**Salida:**
!!! note inline end
    Examina esta salida. Observa que el `Tunnel src` y la `DoubleZero IP` coinciden con la dirección IPv4 pública de tu máquina.
    <!--`Tunnel dst` es la dirección del dispositivo DZ al que estás conectado.-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```
Un estado de `up` significa que estás conectado exitosamente.

Podrás ver las rutas propagadas por otros usuarios en DoubleZero ejecutando:

```
ip route
```


```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```

</div>

### Siguiente Paso: Publicación de Shreds vía Multicast

Si has completado esta configuración y planeas publicar shreds vía multicast, continúa a la [siguiente página](Validator%20Multicast%20Connection.md).