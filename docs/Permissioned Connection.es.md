---
description: Incorporación con permisos para no validadores y RPCs que se conectan a DoubleZero Mainnet-Beta y Testnet en modo IBRL.
---

# Conexión con permisos para no validadores a DoubleZero en modo IBRL
!!! warning "Al conectarme a DoubleZero acepto los [Términos de Servicio de DoubleZero](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### Descripción general de la incorporación de usuarios con permisos

La incorporación de usuarios actualmente requiere permisos para no validadores y RPCs. Para iniciar el flujo con permisos, por favor complete [este formulario](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z). Esto es lo que puede esperar durante este proceso:

- Puede haber tarifas asociadas con el uso de usuarios con permisos en el futuro.
- Después de enviar el formulario, monitoree su contacto principal de Telegram.

</div>

### Conexión a Mainnet-Beta y Testnet en modo IBRL

!!! Note inline end
    El modo IBRL no requiere reiniciar los clientes validadores, ya que utiliza su dirección IP pública existente.

Los usuarios con permisos completarán la conexión a DoubleZero Mainnet-beta, lo cual se detalla en esta página.

## 1. Confirmar la red del cliente

Por favor siga las instrucciones de [configuración](setup.md) antes de continuar. Instale los paquetes de Mainnet-Beta o Testnet para la red que desee — utilizan diferentes repositorios de paquetes.

El último paso en la configuración fue desconectarse de la red. Esto es para asegurar que solo un túnel esté abierto en su máquina hacia DoubleZero, y que ese túnel esté en la red correcta.

Confirme con:

```bash
doublezero status
```

La columna `Network` debe coincidir con la red a la que desea unirse. Si no coincide, utilice el cambio de copiar y pegar en [solución de problemas](troubleshooting.md#issue-wrong-doublezero-environment).

Después de aproximadamente 30 segundos verá los dispositivos de DoubleZero disponibles:

```bash
doublezero latency
```
Ejemplo de salida (Testnet)
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
La salida de Testnet será idéntica en estructura, pero con muchos más dispositivos disponibles.

## 2. Contactar a la Fundación DoubleZero

La Fundación DoubleZero. Necesitará proporcionar su `DoubleZeroID`, su `Validator ID` (ID de nodo) y la `public ipv4 address` desde la cual se conectará.


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. Conectar en modo IBRL

En el servidor, con el usuario que se conectará a DoubleZero, ejecute el comando `connect` para establecer la conexión a DoubleZero.

```bash
doublezero connect ibrl
```

Debería ver una salida indicando el aprovisionamiento, como:

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
Espere un minuto para que el túnel se complete. Hasta que el túnel esté completado, la salida de su estado puede devolver "down" o "Unknown"

Verifique su conexión:

```bash
doublezero status
```

**Salida:**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
Un estado de `up` significa que está conectado exitosamente.

Podrá ver las rutas propagadas por otros usuarios en DoubleZero ejecutando:

```
ip route
```
Salida: 

```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100 
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
...
```

</div>

### Siguiente paso: Multicast

Si ha completado esta configuración y planea usar Multicast, continúe a la [siguiente página](Other%20Multicast%20Connection.md).