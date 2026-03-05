# Conexão Multicast para Validadores
!!! warning "Ao conectar ao DoubleZero, concordo com os [Termos de Serviço do DoubleZero](https://doublezero.xyz/terms-protocol)"

Se você ainda não está conectado ao DoubleZero, complete a documentação de [Configuração](setup.md) e conexão de validador [Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md).

Se você é um validador já conectado ao DoubleZero, pode continuar com este guia.

#### Jito-Agave (versão 3.1.9 ou superior)

1. No script de inicialização do seu validador, adicione: `--shred-receiver-address 233.84.178.1:7733`

    Você pode enviar para o Jito e para o grupo `bebop` ao mesmo tempo.

    exemplo:

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...O restante da sua configuração...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. Reinicie seu validador.

3. Conecte-se ao grupo multicast DoubleZero `bebop` como publicador:
   `doublezero connect multicast --publish bebop`



#### Frankendancer

1. Em `config.toml`, adicione:
   ```toml
   [tiles.shred]
   additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
   ```
2. Reinicie seu validador.

3. Conecte-se ao grupo multicast DoubleZero `bebop` como publicador:
   `doublezero connect multicast --publish bebop`



!!! note inline end
    Usuários do Frankendancer no modo de driver XDP não podem usar tcpdump. Atualmente não há como confirmar que você está publicando, mas uma solução estará disponível em breve.

#### Confirme que você está publicando

Durante seu próximo slot de líder, use `tcpdump` para confirmar que você está publicando para o grupo multicast. Você deve ver um heartbeat a cada 10 segundos para verificar que está publicando shreds.

Execute: `sudo tcpdump -vv -c5 -ni doublezero1 port 7733 or port 5765`

Exemplo de saída ao publicar:

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
