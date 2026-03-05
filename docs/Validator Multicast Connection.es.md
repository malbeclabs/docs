# Conexión Multicast para Validadores
!!! warning "Al conectarme a DoubleZero acepto los [Términos de Servicio de DoubleZero](https://doublezero.xyz/terms-protocol)"

Si aún no está conectado a DoubleZero, complete primero la documentación de [Configuración](setup.md) y de conexión para validadores [Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md).

Si ya es un validador conectado a DoubleZero puede continuar con esta guía.

#### Jito-Agave (versión 3.1.9 o superior)

1. En el script de inicio de su validador, añada: `--shred-receiver-address 233.84.178.1:7733`

    Puede enviar a Jito y al grupo `bebop` al mismo tiempo.

    ejemplo:

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...El resto de su configuración...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. Reinicie su validador.

3. Conéctese al grupo multicast `bebop` de DoubleZero como publicador:
   `doublezero connect multicast --publish bebop`



#### Frankendancer

1. En `config.toml`, añada:
   ```toml
   [tiles.shred]
   additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
   ```
2. Reinicie su validador.

3. Conéctese al grupo multicast `bebop` de DoubleZero como publicador:
   `doublezero connect multicast --publish bebop`



!!! note inline end
    Los usuarios de Frankendancer en modo driver XDP no pueden usar tcpdump. Actualmente no hay forma de confirmar que está publicando, pero pronto habrá una solución disponible.

#### Confirme que está publicando

Durante su próximo slot de líder, use `tcpdump` para confirmar que está publicando al grupo multicast. Debería ver un heartbeat cada 10 segundos para verificar que está publicando shreds.

Ejecute: `sudo tcpdump -vv -c5 -ni doublezero1 port 7733 or port 5765`

Ejemplo de salida cuando se está publicando:

```
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
tcpdump: verbose output suppressed, use -v[v]... for full protocol decodetcpdump -vv -c5 -ni doublezero1 port 7733 or port 5765
tcpdump: listening on doublezero1, link-type LINUX_SLL (Linux cooked v1), snapshot length 262144 bytes
21:53:11.018243 IP (tos 0x0, ttl 32, id 47109, offset 0, flags [DF], proto UDP (17), length 32)
    148.51.120.2.38319 > 233.84.178.1.5765: [bad udp cksum 0xa7a9 -> 0x67ba!] UDP, length 4
21:53:21.018217 IP (tos 0x0, ttl 32, id 47558, offset 0, flags [DF], proto UDP (17), length 32)
    148.51.120.2.38319 > 233.84.178.1.5765: [bad udp cksum 0xa7a9 -> 0x67ba!] UDP, length 4
21:53:31.018042 IP (tos 0x0, ttl 32, id 47919, offset 0, flags [DF], proto UDP (17), length 32)
    148.51.120.2.38319 > 233.84.178.1.5765: [bad udp cksum 0xa7a9 -> 0x67ba!] UDP, length 4
21:53:32.822061 IP (tos 0x0, ttl 64, id 5721, offset 0, flags [DF], proto UDP (17), length 1231)
    148.51.120.2.57512 > 233.84.178.1.7733: [bad udp cksum 0xac58 -> 0xadfc!] UDP, length 1203
21:53:32.822110 IP (tos 0x0, ttl 64, id 5722, offset 0, flags [DF], proto UDP (17), length 1231)
    148.51.120.2.57512 > 233.84.178.1.7733: [bad udp cksum 0xac58 -> 0x9e62!] UDP, length 1203
5 packets captured
204 packets received by filter
0 packets dropped by kernel
```
