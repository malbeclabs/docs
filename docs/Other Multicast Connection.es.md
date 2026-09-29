---
description: Conéctese a DoubleZero en modo multicast para publicar o suscribirse a uno o más feeds.
---

# Otra Conexión Multicast
!!! warning "Al conectarme a DoubleZero acepto los [Términos de Servicio de DoubleZero](https://doublezero.xyz/terms-protocol)"
 
Información detallada de conexión: 

### 1. Instalación del Cliente DoubleZero
Siga las instrucciones de [configuración](setup.md) para instalar y configurar el cliente DoubleZero.

### 2. Instrucciones de Conexión 

Conéctese a DoubleZero en Modo Multicast
Como publicador: 

```doublezero connect multicast --publish <feed name>```

o como suscriptor: 

```doublezero connect multicast --subscribe <feed name>```

o para publicar y suscribirse: 

```doublezero connect multicast --publish <feed name> --subscribe <feed name>```

Para publicar o suscribirse a múltiples feeds, puede incluir varios nombres de feeds separados por espacios.
Esto también se puede usar para publicar y suscribirse a feeds de publicación.
Por ejemplo 
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
Espere 60 segundos y luego ejecute

```
doublezero status
```
Resultado esperado:
- Sesión BGP activa en la red DoubleZero correcta 
- Si usted es un publicador, su IP de DoubleZero será diferente a su IP de origen del túnel. Esto es esperado. 
- Si usted es solo un suscriptor, su IP de DoubleZero será la misma que su IP de origen del túnel. 

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

Verifique los grupos a los que está conectado: 
```
doublezero user list --client-ip <your ip>
```

|account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
|wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan|