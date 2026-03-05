# Conexión de Validador a Mainnet-Beta en modo IBRL
!!! warning "Al conectarme a DoubleZero acepto los [Términos de Servicio de DoubleZero](https://doublezero.xyz/terms-protocol)"



###  Conectando a Mainnet-Beta en modo IBRL

!!! Note inline end
    El modo IBRL no requiere reiniciar los clientes de validadores, ya que usa su dirección IP pública existente.

Los Validadores Mainnet de Solana completarán la conexión a DoubleZero Mainnet-beta, que se detalla en esta página.

Cada validador Solana tiene su propio **keypair de identidad**; de él se extrae la clave pública conocida como el **node ID**. Esta es la huella digital única del validador en la red Solana.

Con el DoubleZeroID y el node ID identificados, demostrará la propiedad de su máquina. Esto se hace creando un mensaje que incluye el DoubleZeroID firmado con la clave de identidad del validador. La firma criptográfica resultante sirve como prueba verificable de que controla el validador.

Finalmente, enviará una **solicitud de conexión a DoubleZero**. Esta solicitud comunica: *"Aquí está mi identidad, aquí está la prueba de propiedad y aquí está cómo pretendo conectarme."* DoubleZero valida esta información, acepta la prueba y provisiona acceso a la red para el validador en DoubleZero.

Esta guía permite que 1 Validador Primario se registre a sí mismo, y hasta 3 máquinas de respaldo/failover al mismo tiempo.

## Requisitos Previos

- CLI de Solana instalada y en $PATH
- Para validadores: Permiso para acceder al archivo keypair de identidad del validador (por ejemplo, validator-keypair.json) bajo el usuario sol
- Para validadores: Verificar que la clave de identidad del validador Solana que se conecta tiene al menos 1 SOL
- Las reglas del firewall permiten conexiones salientes para DoubleZero y Solana RPC según sea necesario, incluyendo GRE (ip proto 47) y BGP (169.254.0.0/16 en tcp/179)

!!! info
    El ID del Validador se verificará contra el gossip de Solana para determinar la IP objetivo. La IP objetivo y el ID DoubleZero se utilizarán luego para abrir un túnel GRE entre su máquina y el Dispositivo DoubleZero objetivo.

    Considere: En el caso en que tenga un ID junk y un ID Primario en la misma IP, solo el ID Primario se usará en el registro de la máquina. Esto se debe a que el ID junk no aparecerá en el gossip y, por lo tanto, no puede usarse para verificar la IP de la máquina objetivo.

## 1. Configuración del Entorno

Siga las instrucciones de [configuración](setup.md) antes de continuar.

El último paso en la configuración fue desconectarse de la red. Esto es para asegurar que solo un túnel esté abierto en su máquina hacia DoubleZero, y que ese túnel esté en la red correcta.

<div data-wizard-step="mainnet-env-config" markdown>

Para configurar el CLI DoubleZero (`doublezero`) y el daemon (`doublezerod`) para conectarse a **DoubleZero mainnet-beta**:
```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Debería ver la siguiente salida:
`
✅ doublezerod configured for environment mainnet-beta
`

Después de aproximadamente 30 segundos verá los dispositivos DoubleZero disponibles:

```bash
doublezero latency
```

</div>

## 2. Abrir el puerto 44880

Los usuarios necesitan abrir el puerto 44880 para utilizar algunas [funciones de enrutamiento](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

Para abrir el puerto 44880 puede actualizar IP tables de la siguiente manera:

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

note los flags `-i doublezero0`, `-o doublezero0` que restringen esta regla únicamente a la interfaz DoubleZero

O UFW de la siguiente manera:

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

note los flags `in on doublezero0`, `out on doublezero0` que restringen esta regla únicamente a la interfaz DoubleZero

## 3. Atestar la Propiedad del Validador

<div data-wizard-step="mainnet-find-validator" markdown>

Con su Entorno DoubleZero configurado, es hora de atestar la Propiedad de su Validador.

El ID DoubleZero que creó en la [configuración](setup.md) de su validador primario debe usarse en todas las máquinas de respaldo.

El ID en su máquina primaria se puede encontrar con `doublezero address`. El mismo ID debe estar en `~/.config/doublezero/id.json` en todas las máquinas del clúster.

Para lograr esto, primero verificará que la máquina desde la que ejecuta los comandos sea su **Validador Primario** con:

```
doublezero-solana passport find-validator -u mainnet-beta
```

Esto verifica que el validador esté registrado en el gossip y aparezca en el cronograma de líderes.

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
    Para registrar una máquina, excluya los argumentos "--backup-validator-ids" o "backup_ids=" de cualquier comando en esta página.

Ahora, en todas las máquinas de respaldo en las que planea ejecutar su **Validador Primario**, ejecute lo siguiente:
```
doublezero-solana passport find-validator -u mainnet-beta
```

Esta salida es esperada. El nodo de respaldo no puede estar en el cronograma de líderes en el momento de la creación del pase.

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### Preparar la Conexión

Ejecute el siguiente comando en la máquina del **Validador Primario**. Esta es la máquina en la que tiene stake activo, que está en el cronograma de líderes con su ID de validador primario en el gossip de Solana en la máquina desde la que ejecuta el comando:

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```

Note la salida al final de este comando. Es la estructura para el siguiente paso.

</div>

## 4. Generar Firma

<div data-wizard-step="mainnet-sign-message" markdown>

Al final del último paso, recibimos una salida preformateada para `solana sign-offchain-message`.

Desde la salida anterior ejecutaremos este comando en la máquina del **Validador Primario**.

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

Use el comando `request-validator-access` para crear una cuenta en Solana para la solicitud de conexión. El agente Sentinel de DoubleZero detecta la nueva cuenta, valida su identidad y firma, y crea el pase de acceso en DoubleZero para que el servidor pueda establecer una conexión.

Use el node ID, el DoubleZeroID y la firma.

!!! note inline end
      En este ejemplo usamos `-k /home/user/.config/solana/id.json` para encontrar la Identidad del validador. Use la ubicación apropiada para su despliegue local.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**Salida:**

Esta salida puede usarse para ver la transacción en un explorador Solana. Asegúrese de cambiar el explorador a mainnet. Esta verificación es opcional.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

Si tiene éxito, DoubleZero registrará el primario con sus respaldos. Ahora puede hacer failover entre las IPs registradas en el pase de acceso. DoubleZero mantendrá la conectividad automáticamente al cambiar a nodos de respaldo registrados de esta manera.

</div>

## 6. Conectarse en modo IBRL

<div data-wizard-step="mainnet-connect-ibrl" markdown>

En el servidor, con el usuario que se conectará a DoubleZero, ejecute el comando `connect` para establecer la conexión a DoubleZero.

```
doublezero connect ibrl
```

Debería ver una salida que indique el aprovisionamiento, como:

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
Espere un minuto para que el túnel GRE termine de configurarse. Hasta que el túnel GRE esté configurado, su salida de estado puede devolver "down" o "Unknown".

Verifique su conexión:

```bash
doublezero status
```

**Salida:**
!!! note inline end
    Examine esta salida. Note que `Tunnel src` y `DoubleZero IP` coinciden con la dirección IPv4 pública de su máquina.

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```
Un estado de `up` significa que está conectado correctamente.

Podrá ver las rutas propagadas por otros usuarios en DoubleZero ejecutando:

```
ip route
```

</div>

### Siguiente Paso: Publicar Shreds mediante Multicast

Si ha completado esta configuración y planea publicar shreds mediante multicast, continúe a la [siguiente página](Validator%20Multicast%20Connection.md).
