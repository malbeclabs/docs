# Connexion Autorisée Non-Validateur à DoubleZero en Mode IBRL
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'Utilisation de DoubleZero](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### Aperçu de l'Intégration des Utilisateurs Autorisés

L'intégration des utilisateurs est actuellement autorisée pour les non-validateurs et les RPC. Pour commencer le processus d'autorisation, veuillez remplir [ce formulaire](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z). Voici ce à quoi vous pouvez vous attendre au cours de ce processus :

- Des frais pourront être associés à l'utilisation des Utilisateurs Autorisés à l'avenir.
- Après la soumission du formulaire, surveillez votre contact Telegram principal.

</div>

### Connexion à Mainnet-Beta et Testnet en Mode IBRL

!!! Note inline end
    Le mode IBRL ne nécessite pas de redémarrer les clients validateurs, car il utilise votre adresse IP publique existante.

Les Utilisateurs Autorisés complèteront la connexion au Mainnet-beta DoubleZero, qui est décrite sur cette page.

## 1. Configuration de l'Environnement

Veuillez suivre les instructions de [configuration](setup.md) avant de procéder.

La dernière étape de la configuration consistait à se déconnecter du réseau. Cela garantit qu'un seul tunnel est ouvert sur votre machine vers DoubleZero, et que ce tunnel est sur le bon réseau.

Pour configurer la CLI Client DoubleZero (`doublezero`) et le daemon (`doublezerod`) afin de se connecter au **testnet DoubleZero** :
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

Vous devriez voir la sortie suivante :
```
✅ doublezerod configured for environment mainnet-beta
```
Vous devriez voir la sortie suivante :
`
✅ doublezerod configured for environment testnet
`

Après environ 30 secondes, vous verrez les dispositifs DoubleZero disponibles :

```bash
doublezero latency
```
Exemple de sortie (Testnet)
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
La sortie du testnet sera identique dans sa structure, mais avec beaucoup plus de dispositifs disponibles.
</details>


## 2. Contacter la DoubleZero Foundation

La DoubleZero Foundation. Vous devrez fournir votre `DoubleZeroID`, votre `ID Validateur` (node ID) et l'`adresse IPv4 publique` depuis laquelle vous vous connecterez.


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

### Prochaine Étape : Multicast

Si vous avez terminé cette configuration et prévoyez d'utiliser le Multicast, passez à la [page suivante](Other%20Multicast%20Connection.md).
