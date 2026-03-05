# Configuration de DoubleZero

!!! info "Terminologie"
    Nouveau sur DoubleZero ? Consultez le [Glossaire](glossary.md) pour les définitions des termes comme [doublezerod](glossary.md#doublezerod), [IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency), [DZD](glossary.md#dzd-doublezero-device) et autres.

!!! warning "En vous connectant à DoubleZero, vous acceptez les [Conditions d'Utilisation de DoubleZero](https://doublezero.xyz/terms-protocol)"


## Prérequis
!!! warning inline end
    Pour les validateurs : DoubleZero doit être installé directement sur l'hôte du validateur, pas dans un conteneur.
- Connexion internet avec adresse IP publique (sans NAT)
- Serveur x86_64
- Système d'exploitation pris en charge : Ubuntu 22.04+ ou Debian 11+, ou Rocky Linux / RHEL 8+
- Privilèges root ou sudo sur le serveur exécutant DoubleZero
- Facultatif mais utile : jq et curl pour le débogage

## Connexion à DoubleZero

Le Testnet DoubleZero et le Mainnet Beta DoubleZero sont des réseaux physiquement distincts. Choisissez le réseau approprié lors de l'installation.

En rejoignant DoubleZero, vous établissez une **identité DoubleZero** (une clé publique appelée **DoubleZero ID**). Cette clé est l'un des moyens par lesquels DoubleZero identifie votre machine.

## 1. Installer le paquet DoubleZero

<div data-wizard-step="install-version-info" markdown>

!!! info "Version Actuelle"
    | Paquet | Mainnet Beta | Testnet |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |

</div>

Suivez les instructions ci-dessous selon votre système d'exploitation :

### Ubuntu / Debian

<div data-wizard-step="install-deb-mainnet-beta" markdown>

Déploiement actuel recommandé pour Mainnet Beta :
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

<div data-wizard-step="install-deb-testnet" markdown>

Déploiement actuel recommandé pour Testnet :
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

### Rocky Linux / RHEL

<div data-wizard-step="install-rpm-mainnet-beta" markdown>

Déploiement actuel recommandé pour Mainnet Beta :
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-rpm-testnet" markdown>

Déploiement actuel recommandé pour Testnet :
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-network-warning" markdown>

??? info "Utilisateurs existants uniquement : Passer du paquet *Testnet à Mainnet Beta*, ou de *Mainnet Beta à Testnet*"
    En installant depuis les dépôts de paquets ci-dessus, le **Testnet** DoubleZero ou le **Mainnet Beta DoubleZero** disposent chacun de leur propre dépôt dédié. Si vous devez changer de réseau à un moment donné, vous devrez supprimer le dépôt de paquets précédemment installé et mettre à jour vers le dépôt cible.

    Cet exemple montre la migration de Testnet vers Mainnet Beta.

    En suivant les mêmes étapes mais en remplaçant l'étape 3 par la commande d'installation Testnet ci-dessus, il est possible de compléter la migration de Mainnet Beta vers Testnet.


    1. Trouver les anciens fichiers de dépôt

        Premièrement, identifiez les fichiers de configuration de dépôt DoubleZero existants sur le système :

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. Supprimer les anciens fichiers de dépôt

        Supprimez les anciens fichiers de dépôt trouvés à l'étape précédente. Par exemple :

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. Installer depuis le nouveau dépôt

        Ajoutez le nouveau dépôt Mainnet Beta et installez le dernier paquet :

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<version_actuelle_recommandée_ci-dessus>
        ```


</div>

<div data-wizard-step="install-verify-daemon" markdown>

#### Vérifier l'état de `doublezerod`

Après l'installation du paquet, une nouvelle unité systemd sera installée, activée et démarrée. Pour vérifier l'état, exécutez la commande suivante :
```
sudo systemctl status doublezerod
```

</div>

### Configuration du Pare-feu pour GRE et BGP

DoubleZero utilise des tunnels GRE (protocole IP 47) et le routage BGP (tcp/179 pour les adresses link-local). Assurez-vous que votre pare-feu autorise ces protocoles :

Autoriser GRE et BGP avec iptables :

<div data-wizard-step="firewall-gre-bgp-iptables" markdown>

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```

</div>

Ou autoriser GRE et BGP avec UFW :

<div data-wizard-step="firewall-gre-bgp-ufw" markdown>

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```

</div>

## 2. Créer une Nouvelle Identité DoubleZero

Utilisez la commande suivante pour créer une identité DoubleZero sur le serveur :

```bash
doublezero keygen
```

!!! info
    Si vous avez un ID existant que vous souhaitez utiliser, vous pouvez suivre les étapes optionnelles ci-dessous.

    Créez le répertoire de configuration de doublezerod

    ```
    mkdir -p ~/.config/doublezero
    ```

    Copiez ou liez le fichier `id.json` que vous souhaitez utiliser dans DoubleZero dans le répertoire de configuration doublezero.

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```

## 3. Obtenir l'Identité DoubleZero du Serveur

Confirmez votre identité DoubleZero. Cette identité est utilisée pour créer la connexion entre votre machine et DoubleZero.

```bash
doublezero address
```

**Sortie :**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. Confirmer que doublezerod a Détecté les Dispositifs DZ

Avant de vous connecter, confirmez que `doublezerod` a détecté et pingé chaque commutateur DZ testnet disponible :

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

Si les dispositifs n'apparaissent pas dans la sortie, attendez 10 à 20 secondes et réessayez.

## 5. Se Déconnecter de DoubleZero

La section suivante configurera l'environnement DoubleZero. Pour garantir le succès, déconnectez la session actuelle. Cela évite les problèmes liés à plusieurs tunnels ouverts sur la machine.

Confirmez

```bash
doublezero status
```

Si le statut est `up`, exécutez :

```bash
doublezero disconnect
```

### Prochaine Étape : Tenant

La connexion à DoubleZero varie selon le cas d'utilisation. Dans DoubleZero, les tenants sont des groupes avec des profils utilisateurs similaires. Par exemple : blockchain, couches de transfert de données, etc.

### [Sélectionnez le Tenant et Continuez ici](tenant.md)


# Optionnel : Activer les Métriques Prometheus

Les opérateurs familiers avec les métriques Prometheus pourraient vouloir les activer pour la surveillance DoubleZero. Cela vous permettra d'obtenir des informations sur les performances du client DoubleZero, l'état de la connexion et la santé opérationnelle.

## Métriques Disponibles

DoubleZero expose plusieurs métriques clés :
- **Informations de build** : version, hash de commit, date de build
- **État de la session** : si la session DoubleZero est active
- **Métriques de connexion** : latence et informations de connexion
- **Données de performance** : débit et taux d'erreur

## Activation des Métriques Prometheus

Pour activer les métriques Prometheus sur le client DoubleZero, suivez ces étapes :

### 1. Modifier la commande de démarrage du service systemd doublezerod

Créez ou modifiez la configuration de remplacement systemd :

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

Remplacez par cette configuration :

Le flag `-env` doit pointer vers `testnet` ou `mainnet-beta` selon le réseau depuis lequel vous souhaitez collecter des données. Dans l'exemple de bloc, `testnet` est utilisé. Si nécessaire, il peut être changé en `mainnet-beta`.

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

### 3. Confirmer que les métriques sont disponibles

Confirmez que l'endpoint des métriques répond :

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

## Résolution des Problèmes

Si les métriques ne s'affichent pas :

1. **Vérifiez l'état du service** : `sudo systemctl status doublezerod`
2. **Vérifiez la configuration** : `sudo systemctl cat doublezerod`
3. **Vérifiez les logs** : `sudo journalctl -u doublezerod -f`
4. **Testez l'endpoint** : `curl -v localhost:2113/metrics`
5. **Vérifiez le port** : `netstat -tlnp | grep 2113`


## Configuration du Serveur Prometheus

La configuration et la sécurité dépassent le cadre de ce document.
Grafana est une excellente option pour la visualisation, et la documentation Grafana [ici](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/) décrit comment collecter les métriques Prometheus.

## Tableau de Bord Grafana (Optionnel)

Pour la visualisation, vous pouvez créer un tableau de bord Grafana avec les métriques DoubleZero. Les panneaux courants incluent :
- État de la session dans le temps
- Informations de build
- Tendances de latence de connexion
- Surveillance du taux d'erreur
