# Guide des Opérations pour les Contributeurs
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."



Ce guide couvre les tâches opérationnelles courantes pour maintenir vos DoubleZero Devices (DZD), notamment les mises à niveau des agents, les mises à jour des dispositifs/interfaces, et la gestion des liens.

**Prérequis** : Avant d'utiliser ce guide, assurez-vous d'avoir :

- Complété le [Guide de Provisionnement des Dispositifs](contribute-provisioning.md)
- Votre DZD est entièrement opérationnel avec les deux agents de Configuration et de Télémétrie en cours d'exécution

---

## Mises à Jour des Dispositifs

Utilisez `doublezero device update` pour modifier les paramètres du dispositif après le provisionnement initial.

```bash
doublezero device update --pubkey <PUBKEY_DISPOSITIF> [OPTIONS]
```

**Options de mise à jour courantes :**

| Option | Description |
|--------|-------------|
| `--device-type <TYPE>` | Changer le mode de fonctionnement : `hybrid`, `transit`, `edge` (voir [Types de Dispositifs](contribute-provisioning.md#understanding-device-types)) |
| `--location <EMPLACEMENT>` | Déplacer le dispositif vers un emplacement différent |
| `--metrics-publisher <PUBKEY>` | Changer la clé de publication de métriques |

---

## Mises à Jour des Interfaces

Utilisez `doublezero device interface update` pour modifier les interfaces existantes. Cette commande accepte les mêmes options que `interface create`.

```bash
doublezero device interface update <DISPOSITIF> <NOM> [OPTIONS]
```

Pour la liste complète des options d'interface incluant les paramètres CYOA/DIA, voir [Création d'Interfaces](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices).

**Exemple - Ajouter des paramètres CYOA à une interface existante :**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### Lister les Interfaces

```bash
doublezero device interface list              # Toutes les interfaces sur tous les dispositifs
doublezero device interface list <DISPOSITIF> # Interfaces pour un dispositif spécifique
```

---

## Mise à Niveau de l'Agent de Configuration

Lorsqu'une nouvelle version de l'Agent de Configuration est publiée, suivez ces étapes pour mettre à niveau.

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

D'abord, trouvez le nom de fichier de l'ancienne version :
```
switch# show extensions
```

Exécutez les commandes suivantes pour supprimer l'ancienne version. Remplacez `<ANCIENNE_VERSION>` par l'ancienne version de la sortie ci-dessus :
```
switch# delete flash:doublezero-agent_<ANCIENNE_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<ANCIENNE_VERSION>_linux_amd64.rpm
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

### 6. Vérifier la mise à niveau

Le Statut devrait être "A, I, B".
```
switch# show extensions
```

### 7. Vérifier la Sortie de Log de l'Agent de Configuration

```
show agent doublezero-agent log
```

---

## Mise à Niveau de l'Agent de Télémétrie

Lorsqu'une nouvelle version de l'Agent de Télémétrie est publiée, suivez ces étapes pour mettre à niveau.

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

D'abord, trouvez le nom de fichier de l'ancienne version :
```
switch# show extensions
```

Exécutez les commandes suivantes pour supprimer l'ancienne version. Remplacez `<ANCIENNE_VERSION>` par l'ancienne version de la sortie ci-dessus :
```
switch# delete flash:doublezero-device-telemetry-agent_<ANCIENNE_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-device-telemetry-agent_<ANCIENNE_VERSION>_linux_amd64.rpm
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

### 6. Vérifier la mise à niveau

Le Statut devrait être "A, I, B".
```
switch# show extensions
```

### 7. Vérifier la Sortie de Log de l'Agent de Télémétrie

```
show agent doublezero-telemetry log
```

---

## Surveillance

> ⚠️ **Important :**
>
>  1. Pour les exemples de configuration ci-dessous, veuillez tenir compte du fait que vos agents utilisent ou non un VRF de gestion.
>  2. L'agent de configuration et l'agent de télémétrie utilisent le même port d'écoute (:8080) pour leur endpoint de métriques par défaut. Si vous activez les métriques sur les deux, utilisez le flag `-metrics-addr` pour définir des ports d'écoute uniques pour chaque agent.

### Métriques de l'Agent de Configuration

L'agent de configuration sur le dispositif DoubleZero a la capacité d'exposer des métriques compatibles Prometheus en définissant le flag `-metrics-enable` dans la configuration du démon `doublezero-agent`. Le port d'écoute par défaut est tcp/8080 mais peut être changé pour s'adapter à l'environnement via `-metrics-addr` :
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

Les métriques spécifiques à DoubleZero suivantes sont exposées avec les métriques de runtime spécifiques à go :
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

#### Erreurs à Haute Signification

- `up` — C'est la métrique de série temporelle générée automatiquement par Prometheus si l'instance de scrape est saine et accessible. Si ce n'est pas le cas, soit l'agent n'est pas accessible, soit l'agent n'est pas en cours d'exécution.
- `doublezero_agent_apply_config_errors_total` — La configuration tentant d'être appliquée par l'agent a échoué. Dans cette situation, les utilisateurs ne pourront pas s'intégrer au dispositif et les modifications de configuration onchain ne seront pas appliquées jusqu'à ce que cela soit résolu.
- `doublezero_agent_get_config_errors_total` — Cela signale que l'agent de configuration local ne peut pas communiquer avec le contrôleur DoubleZero. Dans la plupart des cas, cela peut être dû à un problème de connectivité de gestion sur le dispositif. Similaire à la métrique ci-dessus, les utilisateurs ne pourront pas s'intégrer au dispositif et les modifications de configuration onchain ne seront pas appliquées jusqu'à ce que cela soit résolu.

### Métriques de l'Agent de Télémétrie

L'agent de télémétrie sur le dispositif DoubleZero a la capacité d'exposer des métriques compatibles Prometheus en définissant le flag `-metrics-enable` dans la configuration du démon `doublezero-telemetry`. Le port d'écoute par défaut est tcp/8080 mais peut être changé pour s'adapter à l'environnement via `-metrics-addr` :
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

Les métriques spécifiques à DoubleZero suivantes sont exposées avec les métriques de runtime spécifiques à go :
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

#### Erreurs à Haute Signification

- `up` — C'est la métrique de série temporelle générée automatiquement par Prometheus si l'instance de scrape est saine et accessible. Si ce n'est pas le cas, soit l'agent n'est pas accessible, soit l'agent n'est pas en cours d'exécution.
- `doublezero_device_telemetry_agent_errors_total` avec un `error_type` de `submitter_failed_to_write_samples` — C'est un signal que l'agent de télémétrie ne peut pas écrire d'échantillons onchain, ce qui pourrait être dû à des problèmes de connectivité de gestion sur le dispositif.

---

## Gestion des Liens

### Drainage des Liens

Le drainage des liens permet aux contributeurs de retirer gracieusement un lien du service actif pour la maintenance ou le dépannage. Il y a deux états de drainage :

| Statut | Comportement IS-IS | Description |
|--------|-------------------|-------------|
| `soft-drained` | Métrique fixée à 1 000 000 | Le lien est déprioritisé. Le trafic utilisera des chemins alternatifs si disponibles, mais utilisera encore ce lien si c'est la seule option. |
| `hard-drained` | Mis en passif | Le lien est complètement retiré du routage. Aucun trafic ne traversera ce lien. |

### Transitions d'État

Les transitions d'état suivantes sont autorisées :

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (doit passer par soft-drained d'abord)
```

> ⚠️ **Note :**
> Vous ne pouvez pas passer directement de `hard-drained` à `activated`. Vous devez d'abord passer à `soft-drained`, puis à `activated`.

### Drainer Doucement un Lien

Le drainage doux déprioritise un lien en fixant sa métrique IS-IS à 1 000 000. Le trafic préférera les chemins alternatifs mais peut encore utiliser ce lien si nécessaire.

```bash
doublezero link update --pubkey <PUBKEY_LIEN> --status soft-drained
```

### Drainer Fortement un Lien

Le drainage fort retire le lien du routage entièrement en mettant IS-IS en mode passif. Aucun trafic ne traversera ce lien.

```bash
doublezero link update --pubkey <PUBKEY_LIEN> --status hard-drained
```

### Restaurer un Lien en Service Actif

Pour remettre un lien drainé en fonctionnement normal :

```bash
# Depuis soft-drained
doublezero link update --pubkey <PUBKEY_LIEN> --status activated

# Depuis hard-drained (doit passer par soft-drained d'abord)
doublezero link update --pubkey <PUBKEY_LIEN> --status soft-drained
doublezero link update --pubkey <PUBKEY_LIEN> --status activated
```

### Remplacement de Délai

La fonctionnalité de remplacement de délai permet aux contributeurs de modifier temporairement le délai effectif d'un lien sans modifier la valeur de délai mesurée réelle. Ceci est utile pour démoter temporairement un lien du chemin principal au chemin secondaire.

### Définir un Remplacement de Délai

Pour remplacer le délai d'un lien (le rendant moins préféré dans le routage) :

```bash
doublezero link update --pubkey <PUBKEY_LIEN> --delay-override-ms 100
```

Les valeurs valides sont de `0.01` à `1000` millisecondes.

### Effacer un Remplacement de Délai

Pour supprimer le remplacement et revenir à l'utilisation du délai mesuré réel :

```bash
doublezero link update --pubkey <PUBKEY_LIEN> --delay-override-ms 0
```

> ⚠️ **Note :**
> Lorsqu'un lien est soft-drained, `delay_ms` et `delay_override_ms` sont tous deux remplacés à 1000ms (1 seconde) pour assurer la déprioritisation.
