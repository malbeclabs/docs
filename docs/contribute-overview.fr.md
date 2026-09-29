---
description: Vue d'ensemble et checklist d'intégration pour devenir contributeur au réseau DoubleZero.
---

# Documentation Contributeur

!!! info "Terminologie"
    Nouveau sur DoubleZero ? Consultez le [Glossaire](glossary.md) pour les définitions des termes clés comme [DZD](glossary.md#dzd-doublezero-device), [DZX](glossary.md#dzx-doublezero-exchange), et [CYOA](glossary.md#cyoa-choose-your-own-adventure).

Bienvenue dans la documentation contributeur de DoubleZero. Cette section couvre tout ce dont vous avez besoin pour devenir contributeur au réseau.

!!! tip "Intéressé pour devenir contributeur au réseau ?"
    Consultez la page [Prérequis & Architecture](contribute.md) pour comprendre le matériel, la bande passante et la connectivité nécessaires pour contribuer au réseau DoubleZero.

---

## Checklist d'intégration

Utilisez cette checklist pour suivre votre progression. **Tous les éléments doivent être complétés avant que votre contribution soit techniquement opérationnelle.**

### Phase 1 : Prérequis
- [ ] DoubleZero CLI installé sur un serveur de gestion
- [ ] Matériel acquis et conforme aux [exigences](contribute.md#hardware-requirements)
- [ ] Espace rack et alimentation disponibles dans le centre de données (4U, 4KW recommandés)
- [ ] DZD physiquement installé avec la connectivité de gestion
- [ ] Bloc IPv4 public alloué pour le protocole DZ (**voir [Règles de préfixe DZ](#dz-prefix-rules)**)

### Phase 2 : Configuration du compte
- [ ] Paire de clés de service générée (`doublezero keygen`)
- [ ] Paire de clés du publieur de métriques générée
- [ ] Clé de service soumise à la DZF pour autorisation
- [ ] Compte contributeur créé onchain (vérifier avec `doublezero contributor list`)
- [ ] Accès accordé au dépôt [malbeclabs/contributors](https://github.com/malbeclabs/contributors)

### Phase 3 : Provisionnement de l'appareil
- [ ] Configuration de base de l'appareil appliquée (depuis le dépôt contributors)
- [ ] Appareil créé onchain (`doublezero device create`)
- [ ] Interfaces de l'appareil enregistrées
- [ ] Interfaces loopback créées (Loopback255 vpnv4, Loopback256 ipv4)
- [ ] Interfaces CYOA/DIA configurées (si appareil edge/hybride)

### Phase 4 : Établissement des liens & Installation de l'agent
- [ ] Liens WAN créés (le cas échéant)
- [ ] Lien DZX créé (statut : `requested`)
- [ ] Lien DZX accepté par le contributeur pair
- [ ] Config Agent installé et en fonctionnement
- [ ] Config Agent recevant la configuration du contrôleur
- [ ] Telemetry Agent installé et en fonctionnement
- [ ] Publieur de métriques enregistré onchain
- [ ] Soumissions de télémétrie visibles sur le ledger

### Phase 5 : Rodage des liens
- [ ] Tous les liens drainés pour une période de rodage de 24 heures
- [ ] [metrics.doublezero.xyz](https://metrics.doublezero.xyz) affiche zéro perte et zéro erreur pendant 24h
- [ ] Liens dédrainés après un rodage propre

### Phase 6 : Vérification & Activation
- [ ] `doublezero device list` affiche votre appareil (avec `max_users = 0`)
- [ ] `doublezero link list` affiche vos liens
- [ ] Les logs du Config Agent montrent des récupérations de configuration réussies
- [ ] Les logs du Telemetry Agent montrent des soumissions de métriques réussies
- [ ] **Coordonner avec DZ/Malbec Labs** pour exécuter un test de connectivité (connexion, réception de routes, routage via DZ)
- [ ] Après la réussite du test, définir `max_users` à 96 via `doublezero device update`

---

## Obtenir de l'aide

Dans le cadre de l'intégration, la DZF vous ajoutera aux canaux Slack des contributeurs :

| Canal | Objectif |
|-------|----------|
| **#dz-contributor-announcements** | Communications officielles de la DZF et Malbec Labs — mises à jour CLI/agents, changements majeurs, annonces de sécurité. Surveillez les mises à jour critiques ; posez vos questions dans les fils de discussion. |
| **#dz-contributor-incidents** | Événements non planifiés impactant le service. Les incidents sont publiés automatiquement via l'API/formulaire web avec la sévérité et les appareils/liens affectés. Discussion et dépannage dans les fils de discussion. |
| **#dz-contributor-maintenance** | Activités de maintenance planifiées (mises à jour, réparations). Programmées via l'API/formulaire web avec les horaires de début/fin prévus. Discussion dans les fils de discussion. |
| **#dz-contributor-ops** | Discussion ouverte pour tous les contributeurs — questions opérationnelles, aide CLI, partage de runbooks et playbooks. |

Vous obtiendrez également un **canal privé DZ/Malbec Labs** pour un support direct pour votre organisation.

---

## Règles de préfixe DZ

!!! warning "Critique : Utilisation du pool de préfixes DZ"
    Le pool de préfixes DZ que vous fournissez est **géré par le protocole DoubleZero pour l'allocation d'adresses IP**.

    **Comment les préfixes DZ sont utilisés :**

    - **Première IP** : Réservée pour votre appareil (assignée à l'interface Loopback100)
    - **IPs restantes** : Allouées à des types d'utilisateurs spécifiques se connectant à votre DZD :
        - Utilisateurs `IBRLWithAllocatedIP`
        - Utilisateurs `EdgeFiltering`
        - Publieurs multicast
    - **Utilisateurs IBRL** : Ne consomment PAS depuis ce pool (ils utilisent leur propre IP publique)

    **Vous NE POUVEZ PAS utiliser ces adresses pour :**

    - Votre propre équipement réseau
    - Les liens point à point sur les interfaces DIA
    - Les interfaces de gestion
    - Toute infrastructure en dehors du protocole DZ

    **Exigences :**

    - Doivent être des adresses IPv4 **routables globalement (publiques)**
    - Les plages d'IP privées (10.x, 172.16-31.x, 192.168.x) sont rejetées par le smart contract
    - **Taille minimale : /29** (8 adresses), les préfixes plus grands sont préférés (ex. : /28, /27)
    - Le bloc entier doit être disponible — ne pré-allouez aucune adresse

    Si vous avez besoin d'adresses pour votre propre équipement (IPs d'interface DIA, gestion, etc.), utilisez un **pool d'adresses séparé**.

---

## Référence rapide : Termes clés

Nouveau sur DoubleZero ? Voici les termes essentiels (voir le [Glossaire complet](glossary.md)) :

| Terme | Définition |
|-------|------------|
| **DZD** | DoubleZero Device - votre switch Arista physique exécutant les agents DZ |
| **DZX** | DoubleZero Exchange - point d'interconnexion métropolitain où les contributeurs s'appairent |
| **CYOA** | Choose Your Own Adventure - méthode de connectivité utilisateur (GREOverDIA, GREOverFabric, etc.) |
| **DIA** | Direct Internet Access - connectivité internet requise par tous les DZDs pour le contrôleur et la télémétrie, couramment utilisée comme type CYOA pour la connectivité utilisateur sur les appareils edge/hybrides |
| **WAN Link** | Lien entre vos propres DZDs (même contributeur) |
| **DZX Link** | Lien vers le DZD d'un autre contributeur (nécessite une acceptation mutuelle) |
| **Config Agent** | Interroge le contrôleur, applique la configuration à votre DZD |
| **Telemetry Agent** | Collecte les métriques de latence/perte TWAMP, les soumet au ledger onchain |
| **Service Key** | Votre clé d'identité contributeur pour les opérations CLI |
| **Metrics Publisher Key** | Clé pour signer les soumissions de télémétrie onchain |

---

---

## Structure de la documentation

| Guide | Description |
|-------|-------------|
| [Prérequis & Architecture](contribute.md) | Spécifications matérielles, architecture réseau, options de bande passante |
| [Provisionnement de l'appareil](contribute-provisioning.md) | Étape par étape : clés → accès au dépôt → appareil → liens → agents |
| [Opérations](contribute-operations.md) | Mises à jour des agents, gestion des liens, surveillance |
| [Déploiement de Geoprobe](contribute-geolocation.md) | Déploiement et configuration des agents geoProbe pour la géolocalisation |
| [Glossaire](glossary.md) | Toute la terminologie DoubleZero définie |

---

## Bases réseau pour les non-ingénieurs réseau

Si vous ne venez pas d'un parcours en ingénierie réseau, voici une introduction aux concepts utilisés dans cette documentation :

### Adressage IP

- **Adresse IPv4** : Un identifiant unique pour un appareil sur un réseau (ex. : `192.168.1.1`)
- **Notation CIDR** (`/29`, `/24`) : Indique la taille du sous-réseau. `/29` = 8 adresses, `/24` = 256 adresses
- **IP publique** : Routable sur internet ; **IP privée** : Réseaux internes uniquement (10.x, 172.16-31.x, 192.168.x)

### Couches réseau

- **Couche 1 (Physique)** : Câbles, optiques, longueurs d'onde
- **Couche 2 (Liaison de données)** : Commutateurs, VLANs, adresses MAC
- **Couche 3 (Réseau)** : Routeurs, adresses IP, protocoles de routage

### Termes courants

- **MTU** : Maximum Transmission Unit - taille maximale de paquet (typiquement 9000 octets pour les liens WAN)
- **VLAN** : Virtual LAN - sépare logiquement le trafic sur une infrastructure partagée
- **VRF** : Virtual Routing and Forwarding - isole les tables de routage sur le même appareil
- **BGP** : Border Gateway Protocol - échange de routes inter-réseaux
- **GRE** : Generic Routing Encapsulation - protocole de tunnelisation pour les réseaux overlay
- **TWAMP** : Two-Way Active Measurement Protocol - mesure la latence/perte entre appareils

### Spécifique à DoubleZero

- **Onchain** : Dans DoubleZero, les enregistrements d'appareils, les configurations de liens et la télémétrie sont enregistrés sur le ledger DoubleZero — rendant l'état du réseau transparent et vérifiable par tous les participants
- **Contrôleur** : Service qui dérive la configuration des DZD à partir de l'état onchain sur le ledger DoubleZero

---

Prêt à commencer ? Démarrez avec [Prérequis & Architecture](contribute.md).