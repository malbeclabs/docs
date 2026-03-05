# Documentation Contributeur

!!! info "Terminologie"
    Nouveau sur DoubleZero ? Consultez le [Glossaire](glossary.md) pour les définitions des termes clés comme [DZD](glossary.md#dzd-doublezero-device), [DZX](glossary.md#dzx-doublezero-exchange) et [CYOA](glossary.md#cyoa-choose-your-own-adventure).

Bienvenue dans la documentation des contributeurs DoubleZero. Cette section couvre tout ce dont vous avez besoin pour devenir un contributeur réseau.

!!! tip "Intéressé à devenir un contributeur réseau ?"
    Consultez la page [Exigences et Architecture](contribute.md) pour comprendre le matériel, la bande passante et la connectivité nécessaires pour contribuer au réseau DoubleZero.

---

## Checklist d'Intégration

Utilisez cette checklist pour suivre votre progression. **Tous les éléments doivent être complétés avant que votre contribution soit techniquement opérationnelle.**

### Phase 1 : Prérequis
- [ ] CLI DoubleZero installée sur un serveur de gestion
- [ ] Matériel procuré et conforme aux [exigences](contribute.md#hardware-requirements)
- [ ] Espace rack et alimentation disponibles en centre de données (4U, 4KW recommandé)
- [ ] DZD physiquement installé avec connectivité de gestion
- [ ] Bloc IPv4 public alloué pour le protocole DZ (**voir [Règles du Préfixe DZ](#dz-prefix-rules)**)

### Phase 2 : Configuration du Compte
- [ ] Keypair de service générée (`doublezero keygen`)
- [ ] Keypair d'éditeur de métriques générée
- [ ] Clé de service soumise à DZF pour autorisation
- [ ] Compte contributeur créé on-chain (vérifier avec `doublezero contributor list`)
- [ ] Accès accordé au dépôt [malbeclabs/contributors](https://github.com/malbeclabs/contributors)

### Phase 3 : Provisionnement du Dispositif
- [ ] Configuration de base du dispositif appliquée (depuis le dépôt contributeurs)
- [ ] Dispositif créé on-chain (`doublezero device create`)
- [ ] Interfaces du dispositif enregistrées
- [ ] Interfaces loopback créées (Loopback255 vpnv4, Loopback256 ipv4)
- [ ] Interfaces CYOA/DIA configurées (si dispositif edge/hybride)

### Phase 4 : Établissement des Liens & Installation des Agents
- [ ] Liens WAN créés (le cas échéant)
- [ ] Lien DZX créé (statut : `requested`)
- [ ] Lien DZX accepté par le contributeur pair
- [ ] Config Agent installé et en cours d'exécution
- [ ] Config Agent recevant la configuration du contrôleur
- [ ] Telemetry Agent installé et en cours d'exécution
- [ ] Éditeur de métriques enregistré on-chain
- [ ] Soumissions de télémétrie visibles sur le registre

### Phase 5 : Burn-in du Lien
- [ ] Tous les liens drainés pendant la période de burn-in de 24 heures
- [ ] [metrics.doublezero.xyz](https://metrics.doublezero.xyz) montre zéro perte et zéro erreur pendant 24h
- [ ] Liens non drainés après un burn-in propre

### Phase 6 : Vérification & Activation
- [ ] `doublezero device list` affiche votre dispositif (avec `max_users = 0`)
- [ ] `doublezero link list` affiche vos liens
- [ ] Les logs du Config Agent montrent des récupérations de configuration réussies
- [ ] Les logs du Telemetry Agent montrent des soumissions de métriques réussies
- [ ] **Coordonner avec DZ/Malbec Labs** pour exécuter un test de connectivité (connexion, réception des routes, routage sur DZ)
- [ ] Après que le test est réussi, définir `max_users` à 96 via `doublezero device update`

---

## Obtenir de l'Aide

Dans le cadre de l'intégration, DZF vous ajoutera aux canaux Slack des contributeurs :

| Canal | Objectif |
|---------|---------|
| **#dz-contributor-announcements** | Communications officielles de DZF et Malbec Labs — mises à niveau CLI/agent, changements majeurs, annonces de sécurité. Surveiller pour les mises à jour critiques ; poser des questions dans les fils de discussion. |
| **#dz-contributor-incidents** | Événements imprévus ayant un impact sur le service. Les incidents sont publiés automatiquement via l'API/formulaire web avec la gravité et les dispositifs/liens affectés. Discussion et résolution de problèmes dans les fils de discussion. |
| **#dz-contributor-maintenance** | Activités de maintenance planifiées (mises à niveau, réparations). Planifiées via l'API/formulaire web avec les heures de début/fin prévues. Discussion dans les fils de discussion. |
| **#dz-contributor-ops** | Discussion ouverte pour tous les contributeurs — questions opérationnelles, aide CLI, partage de runbooks et de playbooks. |

Vous obtiendrez également un **canal privé DZ/Malbec Labs** pour le support direct de votre organisation.

---

## Règles du Préfixe DZ

!!! warning "Critique : Utilisation du Pool de Préfixes DZ"
    Le pool de préfixes DZ que vous fournissez est **géré par le protocole DoubleZero pour l'allocation IP**.

    **Comment les préfixes DZ sont utilisés :**

    - **Premier IP** : Réservé pour votre dispositif (attribué à l'interface Loopback100)
    - **IP Restants** : Alloués à des types d'utilisateurs spécifiques se connectant à votre DZD :
        - Utilisateurs `IBRLWithAllocatedIP`
        - Utilisateurs `EdgeFiltering`
        - Éditeurs multicast
    - **Utilisateurs IBRL** : N'utilisent PAS ce pool (ils utilisent leur propre IP public)

    **Vous NE POUVEZ PAS utiliser ces adresses pour :**

    - Votre propre équipement réseau
    - Liens point à point sur les interfaces DIA
    - Interfaces de gestion
    - Toute infrastructure en dehors du protocole DZ

    **Exigences :**

    - Doivent être des adresses IPv4 **globalement routables (publiques)**
    - Les plages IP privées (10.x, 172.16-31.x, 192.168.x) sont rejetées par le contrat intelligent
    - **Taille minimale : /29** (8 adresses), préfixes plus grands préférés (p. ex., /28, /27)
    - Le bloc entier doit être disponible - ne pas pré-allouer d'adresses

    Si vous avez besoin d'adresses pour votre propre équipement (IP d'interface DIA, gestion, etc.), utilisez un **pool d'adresses séparé**.

---

## Référence Rapide : Termes Clés

Nouveau sur DoubleZero ? Voici les termes essentiels (voir le [Glossaire complet](glossary.md)) :

| Terme | Définition |
|------|------------|
| **DZD** | DoubleZero Device - votre commutateur Arista physique exécutant les agents DZ |
| **DZX** | DoubleZero Exchange - point d'interconnexion métropolitain où les contributeurs font du peering |
| **CYOA** | Choose Your Own Adventure - méthode de connectivité utilisateur (GREOverDIA, GREOverFabric, etc.) |
| **DIA** | Direct Internet Access - connectivité internet requise par tous les DZD pour le contrôleur et la télémétrie, couramment utilisée comme type CYOA pour la connectivité utilisateur sur les dispositifs edge/hybrides |
| **Lien WAN** | Lien entre vos propres DZD (même contributeur) |
| **Lien DZX** | Lien vers le DZD d'un autre contributeur (nécessite une acceptation mutuelle) |
| **Config Agent** | Interroge le contrôleur, applique la configuration à votre DZD |
| **Telemetry Agent** | Collecte les métriques de latence/perte TWAMP, soumet au registre on-chain |
| **Clé de Service** | Votre clé d'identité de contributeur pour les opérations CLI |
| **Clé d'Éditeur de Métriques** | Clé pour signer les soumissions de télémétrie on-chain |

---

---

## Structure de la Documentation

| Guide | Description |
|-------|-------------|
| [Exigences et Architecture](contribute.md) | Spécifications matérielles, architecture réseau, options de bande passante |
| [Provisionnement des Dispositifs](contribute-provisioning.md) | Étape par étape : clés → accès au dépôt → dispositif → liens → agents |
| [Opérations](contribute-operations.md) | Mises à niveau des agents, gestion des liens, surveillance |
| [Glossaire](glossary.md) | Toute la terminologie DoubleZero définie |

---

## Bases du Réseau pour les Non-Ingénieurs Réseau

Si vous n'avez pas de formation en ingénierie réseau, voici une introduction aux concepts utilisés dans cette documentation :

### Adressage IP

- **Adresse IPv4** : Un identifiant unique pour un dispositif sur un réseau (p. ex., `192.168.1.1`)
- **Notation CIDR** (`/29`, `/24`) : Indique la taille du sous-réseau. `/29` = 8 adresses, `/24` = 256 adresses
- **IP Public** : Routable sur internet ; **IP Privé** : Réseaux internes uniquement (10.x, 172.16-31.x, 192.168.x)

### Couches Réseau

- **Couche 1 (Physique)** : Câbles, optiques, longueurs d'onde
- **Couche 2 (Liaison de Données)** : Commutateurs, VLANs, adresses MAC
- **Couche 3 (Réseau)** : Routeurs, adresses IP, protocoles de routage

### Termes Courants

- **MTU** : Maximum Transmission Unit - taille maximale des paquets (typiquement 9000 octets pour les liens WAN)
- **VLAN** : Virtual LAN - sépare logiquement le trafic sur une infrastructure partagée
- **VRF** : Virtual Routing and Forwarding - isole les tables de routage sur le même dispositif
- **BGP** : Border Gateway Protocol - échange de routes inter-réseau
- **GRE** : Generic Routing Encapsulation - protocole de tunneling pour les réseaux overlay
- **TWAMP** : Two-Way Active Measurement Protocol - mesure la latence/perte entre les dispositifs

### Spécifique à DoubleZero

- **On-chain** : Dans DoubleZero, les enregistrements de dispositifs, les configurations de liens et la télémétrie sont enregistrés sur le registre DoubleZero — rendant l'état du réseau transparent et vérifiable par tous les participants
- **Contrôleur** : Service qui dérive la configuration DZD à partir de l'état on-chain sur le registre DoubleZero

---

Prêt à commencer ? Commencez par [Exigences et Architecture](contribute.md).
