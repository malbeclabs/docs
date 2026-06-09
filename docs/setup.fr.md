---
description: Guide étape par étape pour installer doublezerod et connecter votre validateur ou nœud au réseau DoubleZero.
---

# Comment configurer DoubleZero

!!! info "Terminologie"
    Nouveau sur DoubleZero ? Consultez le [Glossaire](glossary.md) pour les définitions de termes comme [doublezerod](glossary.md#doublezerod), [IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency) et [DZD](glossary.md#dzd-doublezero-device).

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol)"


## Prérequis
!!! warning inline end
    Pour les validateurs : DoubleZero doit être installé directement sur votre hôte validateur, pas dans un conteneur.
- Connectivité Internet avec une adresse IP publique (pas de NAT)
- Serveur x86_64
- Système d'exploitation pris en charge : Ubuntu 22.04+ ou Debian 11+, ou Rocky Linux / RHEL 9+
- Privilèges root ou sudo sur le serveur où DoubleZero sera exécuté
- Optionnel mais utile : jq et curl pour le débogage

## Connexion à DoubleZero

DoubleZero Testnet et DoubleZero Mainnet-Beta sont des réseaux physiquement distincts. Veuillez choisir le réseau approprié lors de l'installation.

Lors de l'intégration à DoubleZero, vous établirez une **identité DoubleZero**, représentée par une clé publique appelée **DoubleZero ID**. Cette clé fait partie de la manière dont DoubleZero reconnaît votre machine.

## 1. Installer les paquets DoubleZero

<div data-wizard-step="install-version-info" markdown>

!!! info "Versions actuelles"
    | Paquet | Mainnet-Beta | Testnet |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |

</div>

Suivez ces étapes en fonction de votre système d'exploitation :

### Ubuntu / Debian

<div data-wizard-step="install-deb-mainnet-beta" markdown>

Le déploiement actuellement recommandé pour Mainnet-Beta est :
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

<div data-wizard-step="install-deb-testnet" markdown>

Le déploiement actuellement recommandé pour Testnet est :
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

### Rocky Linux / RHEL

<div data-wizard-step="install-rpm-mainnet-beta" markdown>

Le déploiement actuellement recommandé pour Mainnet-Beta est :
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-rpm-testnet" markdown>

Le déploiement actuellement recommandé pour Testnet est :
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-network-warning" markdown>

??? info "Utilisateurs existants uniquement : Changer un paquet de *Testnet vers Mainnet-Beta*, ou de *Mainnet-Beta vers Testnet*"
    Lorsque vous installez depuis l'un des dépôts de paquets ci-dessus, celui-ci est spécifique à DoubleZero **Testnet** ou **DoubleZero Mainnet Beta**. Si vous changez de réseau à un moment donné, vous devrez supprimer les dépôts de paquets précédemment installés et mettre à jour vers le dépôt cible.

    Cet exemple vous guidera à travers la migration de Testnet vers Mainnet-Beta

    Les mêmes étapes peuvent être effectuées pour passer de Mainnet-Beta à Testnet, en remplaçant l'étape 3 par la commande d'installation pour Testnet ci-dessus.


    1. Trouver les anciens fichiers de dépôt

        Tout d'abord, localisez les fichiers de configuration de dépôt DoubleZero existants sur votre système :

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. Supprimer les anciens fichiers de dépôt

        Supprimez les anciens fichiers de dépôt trouvés à l'étape précédente, par exemple

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. Installer depuis le nouveau dépôt

        Ajoutez le nouveau dépôt Mainnet-Beta et installez le dernier paquet :

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<current_recomended_version_above>
        ```


</div>

<div data-wizard-step="install-verify-daemon" markdown>

#### Vérifier le statut de `doublezerod`

Après l'installation du paquet, une nouvelle unité systemd est installée, activée et démarrée. Pour voir le statut, vous pouvez exécuter :
```
sudo systemctl status doublezerod
```

</div>

### Configurer le pare-feu pour GRE et BGP

DoubleZero utilise le tunneling GRE (protocole IP 47) et le routage BGP (tcp/179 sur les adresses link-local). Assurez-vous que votre pare-feu autorise ces protocoles :

Autoriser GRE et BGP via iptables :

<div data-wizard-step="firewall-gre-bgp-iptables" markdown>

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```

</div>

Ou autoriser GRE et BGP via UFW :

<div data-wizard-step="firewall-gre-bgp-ufw" markdown>

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```

</div>

## 2. Créer une nouvelle identité DoubleZero

Créez une identité DoubleZero sur votre serveur avec la commande suivante :

```bash
doublezero keygen
```

!!! info
    Si vous avez un ID existant que vous souhaitez utiliser, vous pouvez suivre ces étapes optionnelles.

    Créer le répertoire de configuration doublezero

    ```
    mkdir -p ~/.config/doublezero
    ```

    Copiez ou liez le fichier `id.json` que vous souhaitez utiliser avec DoubleZero dans le répertoire de configuration doublezero.

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```
## 3. Récupérer l'identité DoubleZero du serveur

Consultez votre identité DoubleZero. Cette identité sera utilisée pour créer la connexion entre votre machine et DoubleZero

```bash
doublezero address
```

**Sortie :**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. Vérifier que doublezerod a découvert les appareils DZ

Avant de vous connecter, assurez-vous que `doublezerod` a découvert et pingé chacun des commutateurs DZ testnet disponibles :

```
doublezero latency
```

Exemple de sortie :

```
$ doublezero latency
 pubkey                                       | name      | ip             | min      | max      | avg      | reachable
 96AfeBT6UqUmREmPeFZxw6PbLrbfET51NxBFCCsVAnek | la2-dz01  | 207.45.216.134 |   0.38ms |   0.45ms |   0.42ms | true
 CCTSmqMkxJh3Zpa9gQ8rCzhY7GiTqK7KnSLBYrRriuan | ny5-dz01  | 64.86.249.22   |  68.81ms |  68.87ms |  68.85ms | true
 BX6DYCzJt3XKRc1Z3N8AMSSqctV6aDdJryFMGThNSxDn | ty2-dz01  | 180.87.154.78  | 112.16ms | 112.25ms | 112.22ms | true
 55tfaZ1kRGxugv7MAuinXP4rHATcGTbNyEKrNsbuVLx2 | ld4-dz01  | 195.219.120.66 | 138.15ms | 138.21ms | 138.17ms | true
 3uGKPEjinn74vd9LHtC4VJvAMAZZgU9qX9rPxtc6pF2k | ams-dz001 | 195.219.138.50 | 141.84ms | 141.97ms | 141.91ms | true
 65DqsEiFucoFWPLHnwbVHY1mp3d7MNM2gNjDTgtYZtFQ | frk-dz01  | 195.219.220.58 | 143.52ms | 143.62ms | 143.58ms | true
 9uhh2D5c14WJjbwgM7BudztdoPZYCjbvqcTPgEKtTMZE | sg1-dz01  | 180.87.102.98  | 176.66ms | 176.76ms | 176.72ms | true
```

Si aucun appareil n'est retourné dans la sortie, attendez 10 à 20 secondes et réessayez.

## 5. Se déconnecter de DoubleZero

Dans les sections suivantes, vous configurerez votre environnement DoubleZero. Afin de garantir le succès, déconnectez la session en cours. Cela évitera les problèmes liés à plusieurs tunnels ouverts sur votre machine.

Vérifiez

```bash
doublezero status
```

s'il est `up`, exécutez :

```bash
doublezero disconnect
```

### Étape suivante : Tenant

La connexion à DoubleZero diffère selon votre cas d'utilisation. Sur DoubleZero, les Tenants sont des groupes ayant des profils utilisateur similaires. Les exemples incluent les Blockchains, les couches de transfert de données, etc.

### [Cliquez ici pour choisir votre tenant](tenant.md)


# Optionnel : Activer les métriques Prometheus

Les opérateurs familiers avec les métriques Prometheus peuvent souhaiter les activer pour la surveillance de DoubleZero. Cela offre une visibilité sur les performances du client DoubleZero, le statut de connexion et la santé opérationnelle.

## Quelles métriques sont disponibles

DoubleZero expose plusieurs métriques clés :
- **Informations de build** : Version, hash de commit et date de build
- **Statut de session** : Indique si la session DoubleZero est active
- **Métriques de connexion** : Latence et informations de connectivité
- **Données de performance** : Débit et taux d'erreur

## Activer les métriques Prometheus

Pour activer les métriques Prometheus sur le client DoubleZero, suivez ces étapes :

### 1. Modifier la commande de démarrage du service systemd doublezerod

Créez ou modifiez la configuration de remplacement systemd :

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

Remplacez par cette configuration :

Notez que le flag `-env` doit pointer vers `testnet` ou `mainnet-beta` selon le réseau dont vous souhaitez collecter les données. Dans le bloc d'exemple, `testnet` est utilisé. Vous pouvez le remplacer par `mainnet-beta` si nécessaire.

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env testnet -metrics-enable -metrics-addr localhost:2113
```

### 2. Recharger et redémarrer le service

```bash
sudo systemctl daemon-reload
sudo systemctl restart doublezerod
sudo systemctl status doublezerod
```

### 3. Vérifier que les métriques sont disponibles

Testez que le point de terminaison des métriques répond :

```bash
curl -s localhost:2113/metrics | grep doublezero
```

Sortie attendue :

```
# HELP doublezero_build_info Build information of the client
# TYPE doublezero_build_info gauge
doublezero_build_info{commit="0d684e1b",date="2025-09-10T16:30:25Z",version="0.6.4"} 1
# HELP doublezero_session_is_up Status of session to doublezero
# TYPE doublezero_session_is_up gauge
doublezero_session_is_up 0
```
## Dépannage

Si les métriques n'apparaissent pas :

1. **Vérifier le statut du service** : `sudo systemctl status doublezerod`
2. **Vérifier la configuration** : `sudo systemctl cat doublezerod`
3. **Consulter les logs** : `sudo journalctl -u doublezerod -f`
4. **Tester le point de terminaison** : `curl -v localhost:2113/metrics`
5. **Vérifier le port** : `netstat -tlnp | grep 2113`


## Configurer le serveur Prometheus

La configuration et la sécurité dépassent le cadre de cette documentation.
Grafana est une excellente option pour la visualisation et dispose d'une documentation disponible [ici](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/) détaillant comment collecter les métriques Prometheus.

## Tableau de bord Grafana (Optionnel)

Pour la visualisation, vous pouvez créer un tableau de bord Grafana en utilisant les métriques DoubleZero. Les panneaux courants incluent :
- Statut de session dans le temps
- Informations de build
- Tendances de latence de connexion
- Surveillance du taux d'erreur