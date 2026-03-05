# Connexion à DoubleZero en Mode IBRL pour les Utilisateurs du Testnet Shelby
!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'Utilisation de DoubleZero](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### Obtenir votre DoubleZeroID

Vous devrez fournir votre `DoubleZeroID` et l'`adresse IPv4 publique` sur ce [formulaire](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)


- Des frais pourront être associés à l'utilisation des Utilisateurs Autorisés à l'avenir.
- Après la soumission du formulaire, surveillez votre contact Telegram principal.
- Pour l'instant, Shelby ne peut se connecter qu'au Testnet DoubleZero.

</div>

### Connexion au Testnet en Mode IBRL

Les utilisateurs autorisés Shelby complèteront la connexion au Testnet DoubleZero, qui est décrite sur cette page.

## 1. Configuration de l'Environnement

Veuillez suivre les instructions de [configuration](setup.md) avant de procéder.

La dernière étape de la configuration consistait à se déconnecter du réseau. Cela garantit qu'un seul tunnel est ouvert sur votre machine vers DoubleZero, et que ce tunnel est sur le bon réseau.

Pour configurer la CLI Client DoubleZero (`doublezero`) afin de se connecter au tenant Shelby sur DoubleZero :
```bash
doublezero config set --tenant shelby
```

Appliquez des règles de pare-feu supplémentaires spécifiques à Shelby :

iptables :
```
sudo iptables -A INPUT -i doublezero0 -p tcp --dport 39431 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 39431 -j DROP
```

UFW :
```
sudo ufw allow in on doublezero0 to any port 39431 proto tcp
sudo ufw deny in to any port 39431 proto tcp
```

## 2. Contacter la DoubleZero Foundation

La DoubleZero Foundation. Vous devrez fournir votre `DoubleZeroID` et l'`adresse IPv4 publique` depuis laquelle vous vous connecterez.


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. Se Connecter en Mode IBRL

Sur le serveur, avec l'utilisateur qui se connectera à DoubleZero, exécutez la commande `connect` pour établir la connexion à DoubleZero.

```bash
doublezero connect ibrl
```

Vous devriez voir une sortie indiquant le provisionnement, telle que :

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
Attendez une minute que le tunnel soit complété. Jusqu'à ce que le tunnel soit établi, votre sortie de statut peut indiquer "down" ou "Unknown"

Vérifiez votre connexion :

```bash
doublezero status
```

**Sortie :**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
Un statut `up` signifie que vous êtes connecté avec succès.

Vous pourrez voir les routes propagées par d'autres utilisateurs sur DoubleZero en exécutant :

```
ip route
```
Sortie :

```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```


</div>
