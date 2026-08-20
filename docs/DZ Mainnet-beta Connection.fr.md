---
description: Connecter un validateur Solana Mainnet-Beta et jusqu'à trois machines de secours à DoubleZero en mode IBRL, incluant la preuve d'identité et la demande de connexion.
---

# Connexion d'un validateur Mainnet-Beta en mode IBRL
!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol)"



### Connexion au Mainnet-Beta en mode IBRL

!!! Note inline end
    Le mode IBRL ne nécessite pas de redémarrer les clients validateurs, car il utilise votre adresse IP publique existante.

Les validateurs Solana Mainnet effectueront la connexion au Mainnet-beta de DoubleZero, dont les détails sont présentés sur cette page.

Chaque validateur Solana possède sa propre **paire de clés d'identité** ; à partir de celle-ci, extrayez la clé publique connue sous le nom d'**ID de nœud**. C'est l'empreinte unique du validateur sur le réseau Solana.

Une fois le DoubleZeroID et l'ID de nœud identifiés, vous prouverez la propriété de votre machine. Cela se fait en créant un message qui inclut le DoubleZeroID signé avec la clé d'identité du validateur. La signature cryptographique résultante sert de preuve vérifiable que vous contrôlez le validateur.

Enfin, vous soumettrez une **demande de connexion à DoubleZero**. Cette demande communique : *« Voici mon identité, voici la preuve de propriété, et voici comment je souhaite me connecter. »* DoubleZero valide ces informations, accepte la preuve et provisionne l'accès réseau pour le validateur sur DoubleZero.

Ce guide permet à 1 validateur principal de s'enregistrer, ainsi que jusqu'à 3 machines de secours/basculement en même temps.

## Prérequis

- Solana CLI installé et dans le $PATH
- Pour les validateurs : permission d'accès au fichier de la paire de clés d'identité du validateur (par ex., validator-keypair.json) sous l'utilisateur sol
- Pour les validateurs : vérifier que la clé d'identité du validateur Solana connecté dispose d'au moins 1 SOL
- Les règles de pare-feu autorisent les connexions sortantes pour DoubleZero et Solana RPC selon les besoins, y compris
 GRE (ip proto 47) et BGP (169.254.0.0/16 sur tcp/179)

!!! info
    L'ID du validateur sera vérifié par rapport au gossip Solana pour déterminer l'IP cible. L'IP cible et l'ID DoubleZero seront ensuite utilisés lors de l'ouverture d'un tunnel GRE entre votre machine et le dispositif DoubleZero cible.

    À noter : dans le cas où vous avez un ID temporaire et un ID principal sur la même IP, seul l'ID principal sera utilisé pour l'enregistrement de la machine. En effet, l'ID temporaire n'apparaîtra pas dans le gossip et ne pourra donc pas être utilisé pour vérifier l'IP de la machine cible.

## 1. Confirmer le réseau client

Veuillez suivre les instructions de [configuration](setup.md) avant de continuer. Installez les paquets **Mainnet-Beta** — Testnet et Mainnet-Beta utilisent des dépôts de paquets différents.

La dernière étape de la configuration consistait à se déconnecter du réseau. Cela permet de s'assurer qu'un seul tunnel est ouvert sur votre machine vers DoubleZero, et que ce tunnel est sur le bon réseau.

Confirmez que le client est sur mainnet-beta :

```bash
doublezero status
```

La colonne `Network` devrait afficher `mainnet-beta`. Si elle affiche `testnet`, ou si vous avez installé le mauvais paquet, utilisez le basculement par copier-coller dans [dépannage](troubleshooting.md#issue-wrong-doublezero-environment).

Après environ 30 secondes, vous verrez les dispositifs DoubleZero disponibles :

```bash
doublezero latency
```
Exemple de sortie (Mainnet-Beta)
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
La sortie Testnet sera identique en structure, mais avec moins de dispositifs.

## 2. Ouvrir le port 44880

Les utilisateurs doivent ouvrir le port 44880 pour utiliser certaines [fonctionnalités de routage](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

Pour ouvrir le port 44880, vous pouvez mettre à jour les tables IP comme suit :

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

notez les options `-i doublezero0`, `-o doublezero0` qui restreignent cette règle uniquement à l'interface DoubleZero

Ou avec UFW comme suit :

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

notez les options `in on doublezero0`, `out on doublezero0` qui restreignent cette règle uniquement à l'interface DoubleZero

## 3. Attester la propriété du validateur

<div data-wizard-step="mainnet-find-validator" markdown>

Avec votre environnement DoubleZero configuré, il est maintenant temps d'attester de votre propriété du validateur.

L'ID DoubleZero que vous avez créé lors de la [configuration](setup.md) de votre validateur principal doit être utilisé sur toutes les machines de secours.

L'ID sur votre machine principale peut être trouvé avec `doublezero address`. Le même ID doit se trouver dans `~/.config/doublezero/id.json` sur toutes les machines du cluster.

Pour ce faire, vous vérifierez d'abord que la machine sur laquelle vous exécutez les commandes est votre **validateur principal** avec :

```
doublezero-solana passport find-validator -u mainnet-beta
```

Cela vérifie que le validateur est enregistré dans le gossip et apparaît dans le calendrier des leaders.

Sortie attendue :

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 11.11.11.111
Validator ID: ValidatorIdentity111111111111111111111111111
Gossip IP: 11.11.11.111
In Leader scheduler
✅ This validator can connect as a primary in DoubleZero 🖥️  💎. It is a leader scheduled validator.
```

!!! info
    Le même workflow est utilisé pour une ou plusieurs machines.
    Pour enregistrer une seule machine, excluez les arguments "--backup-validator-ids" ou "backup_ids=" de toutes les commandes sur cette page.

Maintenant, sur toutes les machines de secours sur lesquelles vous avez l'intention d'exécuter votre **validateur principal**, exécutez la commande suivante :
```
doublezero-solana passport find-validator -u mainnet-beta
```

Sortie attendue :

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
Cette sortie est attendue. Le nœud de secours ne peut pas être dans le calendrier des leaders au moment de la création du pass.

Vous allez maintenant exécuter cette commande sur **toutes les machines de secours** sur lesquelles vous prévoyez d'utiliser le compte de vote et l'identité de votre **validateur principal**.

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### Préparer la connexion

Exécutez la commande suivante sur la machine du **validateur principal**. C'est la machine sur laquelle vous avez du stake actif, qui est dans le calendrier des leaders avec l'ID de votre validateur principal dans le gossip Solana sur la machine depuis laquelle vous exécutez la commande :

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


Exemple de sortie :

```
DoubleZero Passport - Prepare Validator Access Request
Connected to Solana: mainnet-beta

Primary validator 🖥️  💎:
  ID: ValidatorIdentity111111111111111111111111111
  Gossip: ✅ OK 11.11.11.111)
  Leader scheduler: ✅ OK (Stake: 1,050,000.00 SOL)

Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity222222222222222222222222222
  Gossip: ✅ OK (22.22.22.222)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity333333333333333333333333333
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


  Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity444444444444444444444444444
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)

  To request access, sign the following message with your validator's identity key:

  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>

```
Notez la sortie à la fin de cette commande. C'est la structure pour l'étape suivante.

</div>

## 4. Générer la signature

<div data-wizard-step="mainnet-sign-message" markdown>

À la fin de l'étape précédente, nous avons reçu une sortie pré-formatée pour `solana sign-offchain-message`

À partir de la sortie ci-dessus, nous allons exécuter cette commande sur la machine du **validateur principal**.

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**Sortie :**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```

</div>

## 5. Initier une demande de connexion dans DoubleZero

<div data-wizard-step="mainnet-request-access" markdown>

Utilisez la commande `request-validator-access` pour créer un compte sur Solana pour la demande de connexion. L'agent DoubleZero Sentinel détecte le nouveau compte, valide son identité et sa signature, et crée le pass d'accès dans DoubleZero afin que le serveur puisse établir une connexion.


Utilisez l'ID de nœud, le DoubleZeroID et la signature.

!!! note inline end
      Dans cet exemple, nous utilisons `-k /home/user/.config/solana/id.json` pour trouver l'identité du validateur. Utilisez l'emplacement approprié pour votre déploiement local.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**Sortie :**

Cette sortie peut être utilisée pour voir la transaction sur un explorateur Solana. Assurez-vous de changer l'explorateur vers mainnet. Cette vérification est optionnelle.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

En cas de succès, DoubleZero enregistrera le validateur principal avec ses machines de secours. Vous pouvez désormais basculer entre les IP enregistrées dans le pass d'accès. DoubleZero maintiendra automatiquement la connectivité lors du basculement vers les nœuds de secours enregistrés de cette manière.

</div>

## 6. Se connecter en mode IBRL

<div data-wizard-step="mainnet-connect-ibrl" markdown>

Sur le serveur, avec l'utilisateur qui se connectera à DoubleZero, exécutez la commande `connect` pour établir la connexion à DoubleZero.

```
doublezero connect ibrl
```

Vous devriez voir une sortie indiquant le provisionnement, comme :

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
Attendez une minute que le tunnel GRE finisse de se configurer. Tant que le tunnel GRE n'est pas configuré, la sortie de votre statut peut renvoyer "down" ou "Unknown"

Vérifiez votre connexion :

```bash
doublezero status
```

**Sortie :**
!!! note inline end
    Examinez cette sortie. Notez que le `Tunnel src` et le `DoubleZero IP` correspondent à l'adresse IPv4 publique de votre machine.
    <!--`Tunnel dst` est l'adresse du dispositif DZ auquel vous êtes connecté.-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```
Un statut `up` signifie que vous êtes connecté avec succès.

Vous pourrez voir les routes propagées par d'autres utilisateurs sur DoubleZero en exécutant :

```
ip route
```


```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```

</div>

### Étape suivante : Publication des Shreds via Multicast

Si vous avez terminé cette configuration et prévoyez de publier des shreds via multicast, passez à la [page suivante](Validator%20Multicast%20Connection.md).