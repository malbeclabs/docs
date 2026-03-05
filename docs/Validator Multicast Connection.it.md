# Connessione Multicast Validatore
!!! warning "Connettendomi a DoubleZero accetto i [Termini di Servizio DoubleZero](https://doublezero.xyz/terms-protocol)"

Se non sei ancora connesso a DoubleZero, completa prima la documentazione di [Setup](setup.md) e di connessione [Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) per validatori.

Se sei un validatore già connesso a DoubleZero, puoi continuare con questa guida.

#### Jito-Agave (versione 3.1.9 o superiore)

1. Nel tuo script di avvio del validatore, aggiungi: `--shred-receiver-address 233.84.178.1:7733`

    Puoi inviare a Jito e al gruppo `bebop` contemporaneamente.

    esempio:

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...Il resto della tua configurazione...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. Riavvia il tuo validatore.

3. Connettiti al gruppo multicast DoubleZero `bebop` come publisher:
   `doublezero connect multicast --publish bebop`



#### Frankendancer

1. In `config.toml`, aggiungi:
   ```toml
   [tiles.shred]
   additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
   ```
2. Riavvia il tuo validatore.

3. Connettiti al gruppo multicast DoubleZero `bebop` come publisher:
   `doublezero connect multicast --publish bebop`



!!! note inline end
    Gli utenti Frankendancer in modalità driver XDP non possono usare tcpdump. Al momento non c'è modo di confermare che stai pubblicando, ma una soluzione sarà disponibile a breve.

#### Conferma che stai pubblicando

Durante il tuo prossimo slot leader, usa `tcpdump` per confermare che stai pubblicando nel gruppo multicast. Dovresti vedere un heartbeat ogni 10 secondi per verificare che stai pubblicando shred.

Esegui: `sudo tcpdump -vv -c5 -ni doublezero1 port 7733 or port 5765`

Esempio di output quando si pubblica:

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
