# Conexión a DoubleZero en modo IBRL para usuarios de Shelby Testnet
!!! warning "Al conectarme a DoubleZero acepto los [Términos de Servicio de DoubleZero](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### Obtenga su DoubleZeroID

Deberá proporcionar su `DoubleZeroID` y la `dirección IPv4 pública` en este [formulario](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)


- Es posible que haya tarifas asociadas con el uso de Usuarios con Permisos en el futuro.
- Después de enviar el formulario, monitoree su contacto principal de Telegram.
- En este momento, Shelby solo puede conectarse a DoubleZero Testnet.

</div>

### Conexión a Testnet en modo IBRL

Los usuarios con permisos de Shelby completarán la conexión a DoubleZero Testnet, que se detalla en esta página.

## 1. Configuración del Entorno

Siga las instrucciones de [configuración](setup.md) antes de continuar.

El último paso en la configuración fue desconectarse de la red. Esto es para asegurar que solo un túnel esté abierto en su máquina hacia DoubleZero, y que ese túnel esté en la red correcta.

Para configurar el CLI DoubleZero (`doublezero`) para conectarse al inquilino Shelby en DoubleZero:
```bash
doublezero config set --tenant shelby
```

Aplique reglas de firewall adicionales específicas de Shelby:

iptables:
```
sudo iptables -A INPUT -i doublezero0 -p tcp --dport 39431 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 39431 -j DROP
```

UFW:
```
sudo ufw allow in on doublezero0 to any port 39431 proto tcp
sudo ufw deny in to any port 39431 proto tcp
```

## 2. Contactar a la Fundación DoubleZero

La Fundación DoubleZero. Deberá proporcionar su `DoubleZeroID` y la `dirección IPv4 pública` desde la que se conectará.


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. Conectarse en modo IBRL

En el servidor, con el usuario que se conectará a DoubleZero, ejecute el comando `connect` para establecer la conexión a DoubleZero.

```bash
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
Espere un minuto para que el túnel se complete. Hasta que el túnel esté completado, su salida de estado puede devolver "down" o "Unknown"

Verifique su conexión:

```bash
doublezero status
```

**Salida:**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
Un estado de `up` significa que está conectado correctamente.

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
