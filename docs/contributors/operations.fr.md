---
description: Tâches opérationnelles courantes pour les contributeurs DoubleZero — mises à jour des agents, des appareils et interfaces, gestion des liens et journalisation des incidents.
---

# Guide des opérations pour les contributeurs


Ce guide couvre les tâches opérationnelles courantes pour la maintenance de vos appareils DoubleZero (DZD), y compris les mises à jour des agents, les modifications d'appareils/interfaces et la gestion des liens.

## Journalisation des incidents et maintenances

Toute maintenance planifiée ou tout problème imprévu lié à un lien/appareil doit être consigné dans le [portail de gestion OPS](ops-management.md). Cela donne à tous les contributeurs une visibilité sur ce qui se passe à travers le réseau et évite les investigations en double.

- **Travaux planifiés** (par ex. remplacement d'un module optique, maintenance programmée de l'opérateur) : créez un enregistrement de maintenance avant de commencer.
- **Problèmes imprévus** (par ex. lien coupé, erreurs d'interface, perte de paquets) : ouvrez un incident dès que vous commencez à investiguer.

Consultez le [guide de gestion OPS](ops-management.md) pour les étapes d'intégration et la création de tickets.

---

**Prérequis** : Avant d'utiliser ce guide, assurez-vous d'avoir :

- Complété le [Guide de provisionnement des appareils](provisioning.md)
- Votre DZD est entièrement opérationnel avec les agents Config et Telemetry en fonctionnement

---

## Mises à jour des appareils

Utilisez `doublezero device update` pour modifier les paramètres d'un appareil après le provisionnement initial.

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**Options de mise à jour courantes :**

| Option | Description |
|--------|-------------|
| `--device-type <TYPE>` | Changer le mode opérationnel : `hybrid`, `transit`, `edge` (voir [Types d'appareils](provisioning.md#understanding-device-types)) |
| `--location <LOCATION>` | Déplacer l'appareil vers un autre emplacement |
| `--metrics-publisher <PUBKEY>` | Changer la clé du publisher de métriques |

---

## Mises à jour des interfaces

Utilisez `doublezero device interface update` pour modifier les interfaces existantes. Cette commande accepte les mêmes options que `interface create`.

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

Pour la liste complète des options d'interface, y compris les paramètres CYOA/DIA, consultez [Création d'interfaces](provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices).

**Exemple - Ajouter des paramètres CYOA à une interface existante :**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### Lister les interfaces

```bash
doublezero device interface list              # All interfaces across all devices
doublezero device interface list <DEVICE>     # Interfaces for a specific device
```

---

## Mise à jour de l'agent Config

Lorsqu'une nouvelle version de l'agent Config est publiée, suivez ces étapes pour effectuer la mise à jour.

### 1. Télécharger la dernière version

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget AGENT_DOWNLOAD_URL
# exit
$ exit
```

### 2. Arrêter l'agent

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 3. Supprimer l'ancienne version

Tout d'abord, trouvez le nom de fichier de l'ancienne version :
```
switch# show extensions
```

Exécutez les commandes suivantes pour supprimer l'ancienne version. Remplacez `<OLD_VERSION>` par l'ancienne version obtenue dans la sortie ci-dessus :
```
switch# delete flash:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. Installer la nouvelle version

```
switch# copy flash:AGENT_FILENAME extension:
switch# extension AGENT_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. Réactiver l'agent

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# no shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 6. Vérifier la mise à jour

Le statut doit être « A, I, B ».
```
switch# show extensions
```

### 7. Vérifier les logs de l'agent Config

```
show agent doublezero-agent log
```

---

## Mise à jour de l'agent Telemetry

Lorsqu'une nouvelle version de l'agent Telemetry est publiée, suivez ces étapes pour effectuer la mise à jour.

### 1. Télécharger la dernière version

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget TELEMETRY_DOWNLOAD_URL
# exit
$ exit
```

### 2. Arrêter l'agent

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 3. Supprimer l'ancienne version

Tout d'abord, trouvez le nom de fichier de l'ancienne version :
```
switch# show extensions
```

Exécutez les commandes suivantes pour supprimer l'ancienne version. Remplacez `<OLD_VERSION>` par l'ancienne version obtenue dans la sortie ci-dessus :
```
switch# delete flash:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. Installer la nouvelle version

```
switch# copy flash:TELEMETRY_FILENAME extension:
switch# extension TELEMETRY_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. Réactiver l'agent

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# no shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 6. Vérifier la mise à jour

Le statut doit être « A, I, B ».
```
switch# show extensions
```

### 7. Vérifier les logs de l'agent Telemetry

```
show agent doublezero-telemetry log
```

---

## Surveillance {#monitoring}

> ⚠️ **Important :**
>
>  1. Pour les exemples de configuration ci-dessous, veuillez prendre en compte si vos agents utilisent un VRF de management.
>  2. L'agent de configuration et l'agent de télémétrie utilisent le même port d'écoute (:8080) pour leur endpoint de métriques par défaut. Si vous activez les métriques sur les deux, utilisez le flag `-metrics-addr` pour définir des ports d'écoute uniques pour chaque agent.

### Métriques de l'agent Config

L'agent de configuration sur l'appareil DoubleZero a la capacité d'exposer des métriques compatibles Prometheus en définissant le flag `-metrics-enable` dans la configuration du daemon `doublezero-agent`. Le port d'écoute par défaut est tcp/8080 mais peut être modifié pour s'adapter à l'environnement via `-metrics-addr` :
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

Les métriques spécifiques à DoubleZero suivantes sont exposées, accompagnées des métriques d'exécution spécifiques à Go :
```
$ curl -s 10.0.0.11:2112/metrics | grep doublezero

# HELP doublezero_agent_apply_config_errors_total Number of errors encountered while applying config to the device
# TYPE doublezero_agent_apply_config_errors_total counter
doublezero_agent_apply_config_errors_total 0

# HELP doublezero_agent_bgp_neighbors_errors_total Number of errors encountered while retrieving BGP neighbors from the device
# TYPE doublezero_agent_bgp_neighbors_errors_total counter
doublezero_agent_bgp_neighbors_errors_total 0

# HELP doublezero_agent_build_info Build information of the agent
# TYPE doublezero_agent_build_info gauge
doublezero_agent_build_info{commit="4378018f",date="2025-09-23T14:07:48Z",version="0.6.5~git20250923140746.4378018f"} 1

# HELP doublezero_agent_get_config_errors_total Number of errors encountered while getting config from the controller
# TYPE doublezero_agent_get_config_errors_total counter
doublezero_agent_get_config_errors_total 0
```

#### Erreurs à fort signal

- `up` - Il s'agit de la métrique de série temporelle générée automatiquement par Prometheus si l'instance de collecte est saine et accessible. Si ce n'est pas le cas, soit l'agent n'est pas accessible, soit l'agent ne fonctionne pas.
- `doublezero_agent_apply_config_errors_total` - La configuration que l'agent tente d'appliquer a échoué. Dans cette situation, les utilisateurs ne pourront pas s'intégrer à l'appareil et les modifications de configuration on-chain ne seront pas appliquées tant que le problème ne sera pas résolu.
- `doublezero_agent_get_config_errors_total` - Cela signale que l'agent de configuration local ne peut pas communiquer avec le contrôleur DoubleZero. Dans la plupart des cas, cela peut être dû à un problème de connectivité de management sur l'appareil. Comme pour la métrique ci-dessus, les utilisateurs ne pourront pas s'intégrer à l'appareil et les modifications de configuration on-chain ne seront pas appliquées tant que le problème ne sera pas résolu.

### Métriques de l'agent Telemetry

L'agent de télémétrie sur l'appareil DoubleZero a la capacité d'exposer des métriques compatibles Prometheus en définissant le flag `-metrics-enable` dans la configuration du daemon `doublezero-telemetry`. Le port d'écoute par défaut est tcp/8080 mais peut être modifié pour s'adapter à l'environnement via `-metrics-addr` :
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

Les métriques spécifiques à DoubleZero suivantes sont exposées, accompagnées des métriques d'exécution spécifiques à Go :
```
$ curl -s 10.0.0.11:2113/metrics | grep doublezero

# HELP doublezero_device_telemetry_agent_build_info Build information of the device telemetry agent
# TYPE doublezero_device_telemetry_agent_build_info gauge
doublezero_device_telemetry_agent_build_info{commit="4378018f",date="2025-09-23T14:07:45Z",version="0.6.5~git20250923140743.4378018f"} 1

# HELP doublezero_device_telemetry_agent_errors_total Number of errors encountered
# TYPE doublezero_device_telemetry_agent_errors_total counter
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_program_load"} 7
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_write_samples"} 8
doublezero_device_telemetry_agent_errors_total{error_type="collector_submit_samples_on_close"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_getting_local_interfaces"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_finding_local_tunnel"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_link_tunnel_net_invalid"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_initialize_account"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_retries_exhausted"} 0

# HELP doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels Number of local tunnel interfaces not found during peer discovery
# TYPE doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels gauge
doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels{local_device_pk="8PQkip3CxWhQTdP7doCyhT2kwjSL2csRTdnRg2zbDPs1"} 0
```

#### Erreurs à fort signal

- `up` - Il s'agit de la métrique de série temporelle générée automatiquement par Prometheus si l'instance de collecte est saine et accessible. Si ce n'est pas le cas, soit l'agent n'est pas accessible, soit l'agent ne fonctionne pas.
- `doublezero_device_telemetry_agent_errors_total` avec un `error_type` de `submitter_failed_to_write_samples` - Cela signale que l'agent de télémétrie ne peut pas écrire les échantillons on-chain, ce qui pourrait être dû à des problèmes de connectivité de management sur l'appareil.

---

## Gestion des liens

### Drainage des liens {#link-draining}

Le drainage des liens permet aux contributeurs de retirer gracieusement un lien du service actif pour la maintenance ou le dépannage. Il existe deux états de drainage :

| Statut | Comportement IS-IS | Description |
|--------|-------------------|-------------|
| `soft-drained` | Métrique définie à 1 000 000 | Le lien est dépriorisé. Le trafic utilisera des chemins alternatifs si disponibles, mais utilisera toujours ce lien s'il s'agit de la seule option. |
| `hard-drained` | Défini en passif | Le lien est complètement retiré du routage. Aucun trafic ne traversera ce lien. |

### Transitions d'état

Les transitions d'état suivantes sont autorisées :

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (must go through soft-drained first)
```

> ⚠️ **Remarque :**
> Vous ne pouvez pas passer directement de `hard-drained` à `activated`. Vous devez d'abord effectuer la transition vers `soft-drained`, puis vers `activated`.

### Drainage doux d'un lien

Le drainage doux dépriorise un lien en définissant sa métrique IS-IS à 1 000 000. Le trafic préférera les chemins alternatifs mais pourra toujours utiliser ce lien si nécessaire.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### Drainage dur d'un lien

Le drainage dur retire complètement le lien du routage en mettant IS-IS en mode passif. Aucun trafic ne traversera ce lien.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### Restaurer un lien en état actif

Pour remettre un lien drainé en fonctionnement normal :

```bash
# From soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# From hard-drained (must go through soft-drained first)
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### Substitution du délai

La fonctionnalité de substitution du délai permet aux contributeurs de modifier temporairement le délai effectif d'un lien sans modifier la valeur de délai réellement mesurée. Ceci est utile pour rétrograder temporairement un lien du chemin primaire au chemin secondaire.

### Définir une substitution de délai

Pour substituer le délai d'un lien (le rendant moins préféré dans le routage) :

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

Les valeurs valides vont de `0.01` à `1000` millisecondes.

### Effacer une substitution de délai

Pour supprimer la substitution et revenir à l'utilisation du délai réellement mesuré :

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **Remarque :**
> Lorsqu'un lien est en état `soft-drained`, `delay_ms` et `delay_override_ms` sont tous deux remplacés par 1000 ms (1 seconde) pour garantir la dépriorisation.