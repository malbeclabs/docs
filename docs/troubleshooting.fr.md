# Résolution des Problèmes

Ce guide couvre une variété de problèmes et est en cours d'élaboration. Si vous avez complété le guide, vous pouvez chercher une aide supplémentaire sur le discord [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701).


## Commandes Courantes et Sorties

Pour commencer, examinez la sortie des commandes suivantes et leur sortie attendue. Elles vous aideront à résoudre les problèmes de manière plus détaillée.
Si vous ouvrez un ticket, on pourrait vous demander leur sortie.

#### 1. Vérifier la Version
Commande :

`doublezero --version`

Exemple de sortie :
```
DoubleZero 0.6.3
```

#### 2. Vérifier l'Adresse DoubleZero
Commande :

`doublezero address`

Exemple de sortie :
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```

#### 3. Vérifier votre Pass d'Accès

Exemple de clé publique : `MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` remplacez cela par votre clé publique lors de l'exécution de la commande.

Commande :

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

Sortie : [notez que nous utilisons `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'` pour afficher l'en-tête dans cette sortie]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
```

#### 4. Vérifier les Crédits du Registre DoubleZero
Commande :

`doublezero balance`

Exemple de sortie :
```
0.78 Credits
```

#### 5. Vérifier l'État de la Connexion
Commande :

`doublezero status`

Exemple de sortie :

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```


#### 6. Vérifier la Latence
Commande :

`doublezero latency`

Exemple de sortie :
```
 pubkey                                       | code         | ip             | min      | max      | avg      | reachable
 6E1fuqbDBG5ejhYEGKHNkWG5mSTczjy4R77XCKEdUtpb | nyc-dz001    | 64.86.249.22   | 2.49ms   | 2.61ms   | 2.56ms   | true
 Cpt3doj17dCF6bEhvc7VeAuZbXLD88a1EboTyE8uj6ZL | lon-dz001    | 195.219.120.66 | 71.94ms  | 72.11ms  | 72.02ms  | true
 CT8mP6RUoRcAB67HjKV9am7SBTCpxaJEwfQrSjVLdZfD | lax-dz001    | 207.45.216.134 | 72.42ms  | 72.51ms  | 72.45ms  | true
 4Wr7PQr5kyqCNJo3RKa8675K7ZtQ6fBUeorcexgp49Zp | ams-dz001    | 195.219.138.50 | 76.50ms  | 76.71ms  | 76.60ms  | true
 29ghthsKeH2ZCUmN2sUvhJtpEXn2ZxqAuq4sZFBFZmEs | fra-dz001    | 195.219.220.58 | 83.00ms  | 83.14ms  | 83.08ms  | true
 hWffRFpLrsZoF5r9qJS6AL2D9TEmSvPUBEbDrLc111Y  | fra-dz-001-x | 195.12.227.250 | 84.81ms  | 84.89ms  | 84.85ms  | true
 8jyamHfu3rumSEJt9YhtYw3J4a7aKeiztdqux17irGSj | prg-dz-001-x | 195.12.228.250 | 104.81ms | 104.83ms | 104.82ms | true
 5tqXoiQtZmuL6CjhgAC6vA49JRUsgB9Gsqh4fNjEhftU | tyo-dz001    | 180.87.154.78  | 178.04ms | 178.23ms | 178.13ms | true
 D3ZjDiLzvrGi5NJGzmM7b3YZg6e2DrUcBCQznJr3KfC8 | sin-dz001    | 180.87.102.98  | 227.67ms | 227.85ms | 227.75ms | true
```

# Exemples de Résolution des Problèmes
Maintenant que nous avons examiné les sorties de base et ce qui est attendu dans un déploiement sain, nous pouvons examiner quelques exemples courants de résolution de problèmes.

### Problème : ❌ Erreur lors de la création d'un utilisateur

Ce problème est généralement lié à une discordance entre la combinaison clé publique/IP attendue et la combinaison clé publique/IP avec laquelle l'utilisateur essaie d'accéder à DoubleZero.

**Symptômes :**
- Lors de la connexion avec `doublezero connect ibrl`, l'utilisateur rencontre `❌ Error creating user`


**Solutions :**
1. Vérifiez

    `doublezero address`

    Exemple de sortie :
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. Vérifiez que cette adresse est dans la liste autorisée :

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    Exemple de sortie :
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
    ```
     La clé publique de `doublezero address` doit correspondre à la clé publique user_payer et l'adresse IP depuis laquelle vous essayez de vous connecter doit correspondre à l'IP dans le Pass d'Accès.
    `doublezero address` est sourcé depuis le fichier id.json dans ~/.config/doublezero/ par défaut. Voir l'[étape 6 ici](https://docs.malbeclabs.com/setup/)

3. Si ce qui précède semble correct et que vous obtenez une erreur lors de la connexion, ou si le mappage ci-dessus est incorrect, veuillez contacter le support sur [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)

### Problème : ❌ Erreur de provisionnement du service : malformed stuff: cannot provision multiple tunnels at the same time
Cette erreur indique qu'un dispositif est déjà connecté à DoubleZero.

**Symptômes :**
- L'utilisateur essaie de se connecter à DoubleZero
- `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time` est rencontré.

**Solutions :**
1. Vérifiez
    `doublezero status`

    Sortie :
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. -`up`- indique une connexion saine.
3. L'erreur apparaît parce qu'un tunnel vers DoubleZero avec l'IP DoubleZero spécifique est déjà actif sur cette machine.

    Cette erreur est souvent rencontrée après une mise à niveau du client DoubleZero. Les mises à niveau DoubleZero redémarrent automatiquement le service doublezerod et vous reconnecteront si vous étiez connecté avant le redémarrage du service.


### Problème : Le statut DoubleZero est inconnu ou down
Ce problème est souvent lié au tunnel GRE qui a été activé avec succès entre le serveur et le DoubleZero Device, mais un pare-feu empêche l'établissement de la session BGP. À cause de cela, vous ne recevez pas de routes depuis le réseau ou n'envoyez pas de trafic via DoubleZero.

**Symptômes :**
- `doublezero connect ibrl` a réussi. Cependant, `doublezero status` retourne `down` ou `unknown`
    ```
    doublezero connect ibrl
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
    ✅  User Provisioned
    ```

    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```

**Solutions :**
1. Vérifiez vos règles de pare-feu !

   DoubleZero utilise l'espace d'adresses link-local : 169.254.0.0/16 pour les interfaces de tunnel GRE entre votre machine et le DoubleZero Device. 169.254.0.0/16 est typiquement un espace « non routable » et donc les bonnes pratiques de sécurité recommandent de bloquer les communications vers/depuis cet espace. Vous devrez autoriser une règle dans votre pare-feu qui permet à src 169.254.0.0/16 de communiquer avec dst 169.254.0.0/16 sur le port tcp 179. Cette règle devra être placée au-dessus de toutes les règles qui refusent le trafic vers 169.254.0.0/16.

    Dans un pare-feu comme ufw, vous pouvez exécuter `sudo ufw status` pour afficher les règles du pare-feu et

    Exemple de sortie qui pourrait être similaire à ce qu'un validateur Solana aurait.
    ```
    To                         Action      From
    --                         ------      ----
    22/tcp                     ALLOW       Anywhere
    8899/tcp                   ALLOW       Anywhere
    8000:10000/tcp             ALLOW       Anywhere
    8000:10000/udp             ALLOW       Anywhere
    11200:11300/udp            ALLOW       Anywhere
    11200:11300/tcp            ALLOW       Anywhere

    To                         Action      From
    --                         ------      ----
    10.0.0.0/8                 DENY OUT    Anywhere
    169.254.0.0/16             DENY OUT    Anywhere
    172.16.0.0/12              DENY OUT    Anywhere
    192.168.0.0/16             DENY OUT    Anywhere
    ```

    Dans la sortie ci-dessus, vous voyez que tout le trafic vers 169.254.0.0/16, sauf pour les ports spécifiés, est refusé.
    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179` pour insérer la règle à la position <N>. c'est-à-dire que si N = 1, vous insérerez cette règle comme première règle.
    `sudo ufw status numbered` vous montrera l'ordre numérique des règles.

### Problème : Le dispositif DoubleZero le plus proche a changé

Ce n'est pas une erreur, mais cela peut être une optimisation. Voici une bonne pratique qui peut être exécutée de temps en temps ou automatisée.

**Solutions :**

1. Vérifiez la latence vers le dispositif le plus proche
    - exécutez `doublezero latency`

        sortie
        ```
         pubkey                                       | code          | ip              | min      | max      | avg      | reachable
         2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.80ms   | 1.90ms   | 1.84ms   | true
         ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.83ms   | 2.10ms   | 1.92ms   | true
         8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.87ms   | 2.66ms   | 2.15ms   | true
         8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.33ms   | 2.39ms   | 2.37ms   | true
         FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.29ms   | 2.59ms   | 2.40ms   | true
        ```
        notez ci-dessus que le dispositif le plus proche est `dz-ny7-sw01`

        Nous voulons nous connecter à ce dispositif. :

2. Déterminez si vous êtes déjà connecté au dispositif cible
    - exécutez `doublezero user list --env testnet | grep 111.11.11.11` remplacez `111.11.11.11` par l'adresse IPv4 publique de votre dispositif connecté à DoubleZero. Vous pouvez également utiliser votre ID de validateur ou l'ID doublezero.

        sortie
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
        ```
        Dans cet exemple, nous sommes déjà connectés au dispositif le plus proche. Plus d'étapes ne sont nécessaires, nous pouvons nous arrêter ici.


        Considérons plutôt si la sortie était
         ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | fra-dz-001-x     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
        ```
        Ce serait une connexion sous-optimale. Considérons si une reconnexion est nécessaire.

        Avant la connexion, nous vérifierons si le dispositif a des tunnels utilisateur disponibles.

3. Optionnel : examiner le réseau pour les dispositifs disponibles

    À des fins éducatives, nous allons d'abord :
    - exécuter `doublezero device list` pour une liste complète des dispositifs. Nous avons extrait 2 dispositifs comme exemple pour expliquer la sortie.

        sortie :
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp
        ```
        Notez ci-dessus que `ams001-dz002` a 69 utilisateurs et 128 utilisateurs maximum. Ce dispositif peut accueillir 59 utilisateurs supplémentaires.

        Cependant, `dz-fr5-sw01` a 0 utilisateurs et 0 utilisateurs maximum. Vous ne pourrez pas vous connecter à ce dispositif. Avec un max_users de 0, le dispositif n'accepte aucune connexion.

        Revenons maintenant à la connexion à notre dispositif le plus proche.

4. Déterminez si le dispositif cible a une connexion disponible
    - exécutez `doublezero device list | grep dz-ny7-sw01` remplacez `dz-ny7-sw01` par votre dispositif cible

        sortie
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp
        ```
        ici nous pouvons voir que `dz-ny7-sw01` dispose d'espace disponible pour la connexion.

5. Se connecter au dispositif DoubleZero le plus proche

    Nous allons nous déconnecter, puis nous reconnecter à doublezero.

    Exécutez d'abord
    - `doublezero disconnect`

      sortie

        ```
        DoubleZero Service Provisioning
        🔍  Decommissioning User
        Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
        \ [00:00:00] [##########>-----------------------------] 1/4 deleting user       account...                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     🔍  Deleting User Account for: 6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW
        🔍  User Account deleted
        ✅  Deprovisioning Complete
        ```
    maintenant nous vérifions le statut pour confirmer notre déconnexion avec
    - `doublezero status`

    sortie

    ```
    Tunnel status | Last Session Update | Tunnel Name | Tunnel src | Tunnel dst | Doublezero IP | User Type
    disconnected  | no session data     |             |            |            |               |
    ```
    Enfin nous nous reconnecterons avec
    - `doublezero connect ibrl`

    sortie
    ```
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: dz-ny7-sw01
    Service provisioned with status: ok
    ✅  User Provisioned
    ```
    notez dans la sortie ci-dessus que nous avons `Connected to device: dz-ny7-sw01` c'est le résultat souhaité de notre enquête initiale à l'étape 1, où nous avons découvert que `dz-ny7-sw01` était le dispositif avec la latence la plus faible.

### Problème : `doublezero status` retourne certains champs avec N/A

Ce problème est généralement lié à une discordance entre le daemon et le client actuels, par rapport au daemon et au client avec lesquels le tunnel DZ connecté a été établi.

**Symptômes :**
- Lors de l'exécution de `doublezero status`, l'utilisateur rencontre `N/A` dans certains champs




**Solutions :**
1. Exécutez
`doublezero status`

    Exemple :

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro | Network
    up            | 2025-10-20 20:06:18 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | N/A            | ✅ dz-ny7-sw01        | N/A   | mainnet-beta
    ```

    Notez dans notre exemple de sortie ci-dessus que le `Tunnel status` est `up`. Notre `Network` est `mainnet-beta`. Cependant, `Current Device` et `Metro` sont `N/A`

    Cela indique un tunnel ouvert sur votre machine qui n'est pas dans votre environnement actuel.
    Dans ce cas, le statut `up`, sans `Current Device` trouvé sur `mainnet-beta` nous révèle que notre tunnel est sur testnet !

2. Changez votre environnement.

    Pour rectifier la discordance, vous changerez votre environnement vers l'opposé de l'environnement retournant `N/A`

    ```bash
    DESIRED_DOUBLEZERO_ENV=testnet \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

    Pour configurer la CLI Client DoubleZero (`doublezero`) et le daemon (`doublezerod`) afin de se connecter au **mainnet-beta DoubleZero** :

    ```bash
    DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

3. Vérifiez votre statut

    Après avoir changé d'environnement, exécutez :

    ```
    doublezero status
    ```

    La sortie attendue devrait être similaire à :

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro    | Network
    up            | 2025-10-21 12:32:12 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | nyc-dz001      | ✅ nyc-dz001          | New York | testnet
    ```
Avec tous les champs remplis, vous êtes maintenant dans le bon environnement.
