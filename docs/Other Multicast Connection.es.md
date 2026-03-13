# Otras Conexiones Multicast
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "Al conectarme a DoubleZero acepto los [Términos de Servicio de DoubleZero](https://doublezero.xyz/terms-protocol)"


| Caso de Uso | Primer Paso | Cuando se apruebe, conéctese mediante: |
|---------|------------|---------------------------|
| Suscribirse a Jito Shredstream | Contacte a Jito para obtener aprobación. | ```doublezero connect multicast --subscribe jito-shredstream``` |

Información de conexión detallada:

### 1. Instalación del Cliente DoubleZero
Siga las instrucciones de [configuración](setup.md) para instalar y configurar el cliente DoubleZero.

### 2. Instrucciones de Conexión

Conéctese a DoubleZero en modo Multicast

Como publicador:

```doublezero connect multicast --publish <nombre del feed>```

o como suscriptor:

```doublezero connect multicast --subscribe <nombre del feed>```

o para publicar y suscribirse:

```doublezero connect multicast --publish <nombre del feed> --subscribe <nombre del feed>```

Para publicar o suscribirse a múltiples feeds puede incluir múltiples nombres de feed separados por espacios.
Esto también se puede usar para publicar y suscribirse a feeds de publicación.
Por ejemplo:
```doublezero connect multicast --subscribe feed1 feed2 feed3```

Debería ver una salida similar a la siguiente:
```
DoubleZero Service Provisioning
🔗  Start Provisioning User to devnet...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <your dz_id>
🔍  Provisioning User for IP: <your public ip>
    Creating an account for the IP: <your public ip>
    The Device has been selected: <the doublezero device you are connecting to>
    Service provisioned with status: ok
✅  User Provisioned
```

### 3. Verifique su conexión multicast activa.
Espere 60 segundos y luego ejecute:

```
doublezero status
```
Resultado esperado:
- Sesión BGP activa en la red DoubleZero correcta
- Si es publicador, su IP DoubleZero será diferente a su IP Tunnel Src. Esto es esperado.
- Si solo es suscriptor, su IP DoubleZero será igual a su IP Tunnel Src.

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

Verifique los grupos a los que está conectado:
```
doublezero user list --client-ip <su ip>
```

| account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
| wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan |
