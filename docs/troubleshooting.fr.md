---
description: Diagnostiquez les problèmes de connexion courants de DoubleZero avec des commandes de référence, les sorties attendues et où obtenir une assistance supplémentaire.
---

# Dépannage

Ce guide couvre une variété de problèmes et est mis à jour régulièrement. Si vous avez terminé le guide, vous pouvez obtenir une assistance supplémentaire sur le Discord [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701).


## Commandes courantes et sorties

Pour commencer, examinez la sortie des commandes suivantes ainsi que leur sortie attendue. Celles-ci vous aideront dans un dépannage plus détaillé.
Si vous ouvrez un ticket, on pourra vous demander leur sortie.

#### 1. Vérifier la version
Commande :

`doublezero --version`

Exemple de sortie :
```
DoubleZero 0.6.3
```
[comment]: # (when repo is public add this link to check https://github.com/malbeclabs/doublezero)

#### 2. Vérifier l'adresse DoubleZero
Commande :

`doublezero address`

Exemple de sortie :
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```
[comment]: # ()

#### 3. Vérifier votre Access Pass

Clé publique d'exemple : `MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` remplacez-la par votre clé publique lors de l'exécution de la commande.

Commande :

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

Sortie : [notez que nous utilisons `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'` pour vous montrer l'en-tête dans cette sortie]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
```
[comment]: # ()
#### 4. Vérifier les crédits du registre DoubleZero
Commande :

`doublezero balance`

Exemple de sortie :
```
0.78 Credits
```
[comment]: # (add section linked later for 0 balance mainnet/testnet)

#### 5. Vérifier le statut de la connexion
Commande :

`doublezero status`

Exemple de sortie :

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```
[comment]: # (in next iteration add "up" "unknown" and "down" explainers, which then link to a sectino below for troubleshooting undesired states.)


#### 6. Vérifier la latence
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
[comment]: # ()

# Exemples de dépannage
Maintenant que nous avons examiné les sorties de base et ce qui est attendu dans un déploiement sain, nous pouvons examiner quelques exemples de dépannage courants.

### Problème : ❌ Error creating user

Ce problème est généralement lié à une incohérence entre la paire clé publique/IP attendue et la paire clé publique/IP avec laquelle l'utilisateur essaie d'accéder à DoubleZero.

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
     La clé publique de `doublezero address` doit correspondre à la clé publique user_payer et l'adresse IP depuis laquelle vous essayez de vous connecter doit correspondre à l'IP dans l'Access-Pass.
    `doublezero address` est extraite du fichier id.json dans ~/.config/doublezero/ par défaut. Voir l'[étape 6 ici](<setup.md>)
    
3. Si les informations ci-dessus semblent correctes et que vous obtenez une erreur lors de la connexion, ou si la correspondance ci-dessus est incorrecte, veuillez contacter le support sur [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)

### Problème : ❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
Cette erreur signifie qu'un appareil est déjà connecté à DoubleZero.

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
3. L'erreur apparaît car un tunnel vers DoubleZero avec l'IP DoubleZero spécifique est déjà actif sur cette machine.

    Cette erreur est souvent rencontrée après une mise à jour du client DoubleZero. Les mises à jour de DoubleZero redémarrent automatiquement le service doublezerod et vous reconnecteront si vous étiez connecté avant le redémarrage du service.


### Problème : Le statut DoubleZero est unknown ou down
Ce problème est souvent lié au tunnel GRE qui a été activé avec succès entre le serveur et l'appareil DoubleZero, mais un pare-feu empêche l'établissement de la session BGP. De ce fait, vous ne recevez pas de routes du réseau et n'envoyez pas de trafic via DoubleZero.

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

   DoubleZero utilise l'espace d'adresses lien-local : 169.254.0.0/16 pour les interfaces de tunnel GRE entre votre machine et l'appareil DoubleZero. 169.254.0.0/16 est généralement un espace « non routable » et les bonnes pratiques de sécurité recommandent de bloquer les communications vers/depuis cet espace. Vous devrez autoriser une règle dans votre pare-feu qui permet à src 169.254.0.0/16 de communiquer avec dst 169.254.0.0/16 sur le port tcp 179. Cette règle devra être placée au-dessus de toute règle qui refuse le trafic vers 169.254.0.0/16.

    Dans un pare-feu comme ufw, vous pouvez exécuter `sudo ufw status` pour visualiser les règles du pare-feu et

    Exemple de sortie qui pourrait ressembler à ce qu'un validateur Solana aurait.
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

    Dans la sortie ci-dessus, vous voyez que tout le trafic vers 169.254.0.0/16, à l'exception des ports spécifiés, est refusé.
    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179` pour insérer la règle à la position <N>. Par exemple : si N = 1, vous insérerez cette règle comme première règle.
    `sudo ufw status numbered` vous montrera l'ordre numérique des règles.
    
### Problème : L'appareil DoubleZero le plus proche a changé

Ce n'est pas une erreur, mais une optimisation possible. Voici une bonne pratique qui peut être exécutée de temps en temps, ou automatisée.

**Solutions :**

1. Vérifiez la latence vers l'appareil le plus proche
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
        notez ci-dessus que l'appareil le plus proche est `dz-ny7-sw01 `

        Nous voulons nous connecter à cet appareil. :

2. Déterminez si vous êtes déjà connecté à l'appareil cible
    - exécutez `doublezero user list --env testnet | grep 111.11.11.11` remplacez `111.11.11.11` par l'adresse IPv4 publique de votre appareil connecté à DoubleZero. Vous pouvez également utiliser votre ID de validateur ou votre ID DoubleZero.

        sortie
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        Dans cet exemple, nous sommes déjà connectés à l'appareil le plus proche. Aucune étape supplémentaire n'est nécessaire, nous pouvons nous arrêter ici.


        Considérons plutôt si la sortie était
         ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | fra-dz-001-x     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        Ce serait une connexion sous-optimale. Voyons si une reconnexion est nécessaire.

        Avant la connexion, nous allons vérifier si l'appareil dispose de tunnels utilisateur disponibles.

3. Optionnel : examiner le réseau pour les appareils disponibles

    À des fins pédagogiques, nous allons d'abord :
    - exécuter `doublezero device list` pour obtenir la liste complète des appareils. Nous avons extrait 2 appareils comme exemple pour expliquer la sortie.

        sortie :
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner                                        
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp 
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        Notez ci-dessus que `ams001-dz002` a 69 utilisateurs et 128 utilisateurs maximum. Cet appareil peut accueillir 59 utilisateurs supplémentaires.

        Cependant, `dz-fr5-sw01` a 0 utilisateur et 0 utilisateur maximum. Vous ne pourrez pas vous connecter à cet appareil. Avec un nombre maximum d'utilisateurs à 0, l'appareil n'accepte aucune connexion.

        Revenons maintenant à la connexion vers notre appareil le plus proche.

4. Déterminez si l'appareil cible a une connexion disponible
    - exécutez `doublezero device list | grep dz-ny7-sw01` remplacez `dz-ny7-sw01` par votre appareil cible

        sortie
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        ici nous pouvons voir que `dz-ny7-sw01` a de la place disponible pour une connexion.

5. Se connecter à l'appareil DoubleZero le plus proche

    Nous allons nous déconnecter, puis nous reconnecter à DoubleZero.

    D'abord exécutez
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
    Enfin nous nous reconnectons avec
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
    remarquez dans la sortie ci-dessus que nous avons `Connected to device: dz-ny7-sw01` — c'est le résultat souhaité suite à notre investigation initiale à l'étape 1, où nous avions découvert que `dz-ny7-sw01` était l'appareil avec la latence la plus faible.

### Problème : `doublezero status` retourne certains champs avec N/A

Ce problème est généralement lié à une incohérence entre le daemon et le client actuels, par rapport au daemon et au client avec lesquels le tunnel DZ connecté a été établi.

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

    Remarquez dans notre exemple de sortie ci-dessus que le `Tunnel status` est `up`. Notre `Network` est `mainnet-beta`. Cependant, `Current Device` et `Metro` sont `N/A`.

    Cela indique la présence d'un tunnel ouvert sur votre machine qui n'est pas dans votre environnement actuel.
    Dans ce cas, le statut `up`, sans `Current Device` trouvé sur `mainnet-beta`, nous révèle que notre tunnel est sur testnet !
 
2. Changez votre environnement.

    Afin de rectifier l'incohérence, vous allez changer votre environnement vers l'opposé de l'environnement retournant le `N/A`

    ```bash
    DESIRED_DOUBLEZERO_ENV=testnet \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

    Pour configurer le CLI client DoubleZero (`doublezero`) et le daemon (`doublezerod`) pour se connecter au **DoubleZero mainnet-beta** :

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