# Connexion Multicast Validateur
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'Utilisation de DoubleZero](https://doublezero.xyz/terms-protocol)"

Si vous n'êtes pas encore connecté à DoubleZero, veuillez compléter la documentation [Configuration](setup.md) et de connexion validateur [Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md).

Si vous êtes un validateur déjà connecté à DoubleZero, vous pouvez continuer ce guide.

#### Jito-Agave (version 3.1.9 ou supérieure)

1. Dans votre script de démarrage du validateur, ajoutez : `--shred-receiver-address 233.84.178.1:7733`

    Vous pouvez envoyer à Jito et au groupe `bebop` en même temps.

    exemple :

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...The rest of your config...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. Redémarrez votre validateur.

3. Connectez-vous au groupe multicast DoubleZero `bebop` en tant qu'éditeur :
   `doublezero connect multicast --publish bebop`



#### Frankendancer

1. Dans `config.toml`, ajoutez :
   ```toml
   [tiles.shred]
   additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
   ```
2. Redémarrez votre validateur.

3. Connectez-vous au groupe multicast DoubleZero `bebop` en tant qu'éditeur :
   `doublezero connect multicast --publish bebop`



!!! note inline end
    Les utilisateurs Frankendancer en mode pilote XDP ne peuvent pas utiliser tcpdump. Il n'existe actuellement aucun moyen de confirmer que vous publiez, mais une solution sera bientôt disponible.

#### Confirmer que vous publiez

Pendant votre prochain slot de leader, utilisez `tcpdump` pour confirmer que vous publiez vers le groupe multicast. Vous devriez voir un heartbeat toutes les 10 secondes pour vérifier que vous publiez des shreds.

Exécutez : `sudo tcpdump -vv -c5 -ni doublezero1 port 7733 or port 5765`

Exemple de sortie lors de la publication :

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
