# Glossaire
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


Cette page définit la terminologie spécifique à DoubleZero utilisée dans toute la documentation.

---

## Infrastructure Réseau

### DZD (DoubleZero Device)
Le matériel de commutation réseau physique qui termine les liens DoubleZero et exécute le logiciel DoubleZero Agent. Les DZD sont déployés dans des centres de données et fournissent des services de routage, de traitement des paquets et de connectivité utilisateur. Chaque DZD nécessite des [spécifications matérielles](contribute.md#dzd-network-hardware) spécifiques et exécute à la fois le [Config Agent](#config-agent) et le [Telemetry Agent](#telemetry-agent).

### DZX (DoubleZero Exchange)
Points d'interconnexion dans le réseau maillé où différents liens de [contributeurs](#contributeur) sont reliés ensemble. Les DZX sont situés dans les grandes zones métropolitaines (p. ex., NYC, LON, TYO) où se produisent les intersections de réseau. Les contributeurs réseau doivent cross-connecter leurs liens dans le maillage DoubleZero plus large au niveau du DZX le plus proche. Concept similaire à un Internet Exchange (IX).

### Lien WAN
Un lien Wide Area Network entre deux [DZD](#dzd-doublezero-device) exploités par le **même** contributeur. Les liens WAN fournissent une connectivité backbone au sein de l'infrastructure d'un seul contributeur.

### Lien DZX
Un lien entre des [DZD](#dzd-doublezero-device) exploités par des **contributeurs différents**, établi au niveau d'un [DZX](#dzx-doublezero-exchange). Les liens DZX nécessitent une acceptation explicite des deux parties.

### Préfixe DZ
Allocations d'adresses IP au format CIDR attribuées à un [DZD](#dzd-doublezero-device) pour l'adressage du réseau overlay. Spécifié lors de la [création du dispositif](contribute-provisioning.md#step-32-create-your-device-onchain) en utilisant le paramètre `--dz-prefixes`.

---

## Types de Dispositifs

### Dispositif Edge
Un [DZD](#dzd-doublezero-device) qui fournit une connectivité utilisateur au réseau DoubleZero. Les dispositifs edge exploitent les interfaces [CYOA](#cyoa-choose-your-own-adventure) pour terminer les utilisateurs (validateurs, opérateurs RPC) et les connecter au réseau.

### Dispositif Transit
Un [DZD](#dzd-doublezero-device) qui fournit une connectivité backbone au sein du réseau DoubleZero. Les dispositifs transit déplacent le trafic entre les DZD mais ne terminent pas directement les connexions utilisateur.

### Dispositif Hybride
Un [DZD](#dzd-doublezero-device) qui combine à la fois les fonctionnalités [edge](#dispositif-edge) et [transit](#dispositif-transit), fournissant à la fois la connectivité utilisateur et le routage backbone.

---

## Connectivité

### CYOA (Choose Your Own Adventure)
Types d'interfaces qui permettent aux [contributeurs](#contributeur) d'enregistrer des options de connectivité pour que les utilisateurs se connectent au réseau DoubleZero. Les interfaces CYOA incluent diverses méthodes comme [DIA](#dia-direct-internet-access), les tunnels GRE et le peering privé. Consultez [Création d'Interfaces CYOA](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices) pour les détails de configuration.

### DIA (Direct Internet Access)
Un terme réseau standard pour la connectivité fournie via l'internet public. Dans DoubleZero, DIA est un type d'interface [CYOA](#cyoa-choose-your-own-adventure) où les utilisateurs (validateurs, opérateurs RPC) se connectent à un [DZD](#dzd-doublezero-device) via leur connexion internet existante.

### IBRL (Increase Bandwidth Reduce Latency)
Un mode de connexion qui permet aux validateurs et aux nœuds RPC de se connecter à DoubleZero sans redémarrer leurs clients blockchain. IBRL utilise l'adresse IP publique existante et établit un tunnel overlay vers le [DZD](#dzd-doublezero-device) le plus proche. Consultez [Connexion Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) pour les instructions de configuration.

### Multicast
Une méthode de livraison de paquets un-vers-plusieurs prise en charge par DoubleZero. Le mode multicast a deux rôles : **éditeur** (envoie des paquets sur le réseau) et **abonné** (reçoit des paquets de l'éditeur). Utilisé par les équipes de développement pour une distribution efficace des données. Consultez [Autre Connexion Multicast](Other%20Multicast%20Connection.md) pour les détails de connexion.

---

## Composants Logiciels

### doublezerod
Le service daemon DoubleZero qui s'exécute sur les serveurs utilisateurs (validateurs, nœuds RPC). Il gère la connexion au réseau DoubleZero, gère l'établissement des tunnels et maintient la connectivité aux [DZD](#dzd-doublezero-device). Configuré via systemd et contrôlé via l'interface de ligne de commande [`doublezero`](#doublezero-cli).

### doublezero (CLI)
L'interface de ligne de commande pour interagir avec le réseau DoubleZero. Utilisée pour se connecter, gérer les identités, vérifier le statut et effectuer des opérations administratives. Communique avec le daemon [`doublezerod`](#doublezerod).

### Config Agent
Agent logiciel s'exécutant sur les [DZD](#dzd-doublezero-device) qui gère la configuration des dispositifs. Lit la configuration depuis le service [Contrôleur](#contrôleur) et applique les changements au dispositif. Consultez [Installation du Config Agent](contribute-provisioning.md#step-44-install-config-agent) pour la configuration.

### Telemetry Agent
Agent logiciel s'exécutant sur les [DZD](#dzd-doublezero-device) qui collecte les métriques de performance (latence, gigue, perte de paquets) et les soumet au registre DoubleZero. Consultez [Installation du Telemetry Agent](contribute-provisioning.md#step-45-install-telemetry-agent) pour la configuration.

### Contrôleur
Un service qui fournit la configuration aux agents [DZD](#dzd-doublezero-device). Le Contrôleur dérive les configurations des dispositifs à partir de l'état [on-chain](#on-chain) sur le registre DoubleZero.

---

## États des Liens

### Activé
L'état opérationnel normal pour un lien. Le trafic circule à travers le lien et il participe aux décisions de routage.

### Soft-Drained
Un état de maintenance où le trafic sera découragé sur un lien spécifique. Utilisé pour les fenêtres de maintenance progressives. Peut passer à [activé](#activé) ou [hard-drained](#hard-drained).

### Hard-Drained
Un état de maintenance où le lien est complètement retiré du service. Aucun trafic ne circule à travers le lien. Doit passer à [soft-drained](#soft-drained) avant de revenir à [activé](#activé).

---

## Organisations & Tokens

### DZF (DoubleZero Foundation)
La DoubleZero Foundation est une société fondation des Îles Caïmans à but non lucratif sans membres, créée pour soutenir le développement, la décentralisation, la sécurité et l'adoption du réseau DoubleZero.

### Token 2Z
Le token natif du réseau DoubleZero. Utilisé pour payer les frais des validateurs et distribué comme récompenses aux [contributeurs](#contributeur). Les validateurs peuvent payer les frais en 2Z via un programme d'échange on-chain. [Échanger SOL contre 2Z](Swapping-sol-to-2z.md).

### Contributeur
Un fournisseur d'infrastructure réseau qui contribue de la bande passante et du matériel au réseau DoubleZero. Les contributeurs exploitent des [DZD](#dzd-doublezero-device), fournissent des liens [WAN](#lien-wan) et [DZX](#lien-dzx), et reçoivent des incitations en tokens [2Z](#token-2z) pour leur contribution. Consultez [Documentation Contributeur](contribute-overview.md) pour commencer.

---

## Concepts Réseau

### MTU (Maximum Transmission Unit)
La taille de paquet maximale (en octets) pouvant être transmise sur un lien réseau. Les liens WAN DoubleZero utilisent généralement MTU 9000 (trames jumbo) pour l'efficacité.

### VRF (Virtual Routing and Forwarding)
Une technologie qui permet à plusieurs tables de routage isolées d'exister sur le même routeur physique. Les contributeurs utilisent souvent un VRF de gestion séparé pour isoler le trafic de gestion du commutateur du trafic de production.

### GRE (Generic Routing Encapsulation)
Un protocole de tunneling qui encapsule des paquets réseau dans des paquets IP. Utilisé par les connexions [IBRL](#ibrl-increase-bandwidth-reduce-latency) et [CYOA](#cyoa-choose-your-own-adventure) pour créer des tunnels overlay entre les utilisateurs et les DZD.

### BGP (Border Gateway Protocol)
Le protocole de routage utilisé pour échanger des informations de routage entre les réseaux sur internet. DoubleZero utilise BGP en interne avec l'ASN 65342.

### ASN (Autonomous System Number)
Un identifiant unique attribué à un réseau pour le routage BGP. Tous les dispositifs DoubleZero utilisent **ASN 65342** pour le processus BGP interne.

### Interface Loopback
Une interface réseau virtuelle sur un routeur/commutateur utilisée à des fins de gestion et de routage. Les DZD utilisent Loopback255 (VPNv4) et Loopback256 (IPv4) pour le routage interne.

### CIDR (Classless Inter-Domain Routing)
Une notation pour spécifier des plages d'adresses IP. Le format est `IP/longueur-préfixe` où la longueur du préfixe indique la taille du réseau (p. ex., `/29` = 8 adresses, `/24` = 256 adresses).

### Gigue (Jitter)
Variation de la latence des paquets dans le temps. Une faible gigue est essentielle pour les applications en temps réel.

### RTT (Round-Trip Time)
Le temps pour qu'un paquet voyage de la source à la destination et retour. Utilisé pour mesurer la latence réseau entre les dispositifs.

### TWAMP (Two-Way Active Measurement Protocol)
Un protocole pour mesurer les métriques de performance réseau telles que la latence et la perte de paquets. Le [Telemetry Agent](#telemetry-agent) utilise TWAMP pour collecter des métriques entre les DZD.

### IS-IS (Intermediate System to Intermediate System)
Un protocole de routage à état de lien utilisé en interne par le réseau DoubleZero. Les métriques IS-IS sont ajustées lors des opérations de [vidage de lien](#soft-drained).

---

## Blockchain & Clés

### On-chain
Dans le contexte DoubleZero, on-chain fait référence aux données et opérations enregistrées sur le registre DoubleZero. Contrairement aux réseaux traditionnels où les configurations des dispositifs et des liens résident dans des systèmes de gestion centralisés, DoubleZero enregistre les enregistrements de dispositifs, les configurations de liens et les soumissions de télémétrie on-chain — rendant l'état du réseau transparent et vérifiable par tous les participants.

### Clé de Service
Une paire de clés cryptographiques utilisée pour authentifier les opérations CLI. Il s'agit de votre identité de contributeur pour interagir avec le contrat intelligent DoubleZero. Stockée dans `~/.config/solana/id.json`.

### Clé d'Éditeur de Métriques
Une paire de clés cryptographiques utilisée par le [Telemetry Agent](#telemetry-agent) pour signer les soumissions de métriques à la blockchain. Séparée de la clé de service pour l'isolation de sécurité. Stockée dans `~/.config/doublezero/metrics-publisher.json`.

---

## Matériel & Logiciel

### EOS (Extensible Operating System)
Le système d'exploitation réseau d'Arista qui s'exécute sur les commutateurs DZD. Les contributeurs installent le [Config Agent](#config-agent) et le [Telemetry Agent](#telemetry-agent) comme extensions EOS.

### Extension EOS
Un paquet logiciel pouvant être installé sur les commutateurs Arista EOS. Les agents DZ sont distribués sous forme de fichiers `.rpm` et installés via la commande `extension`.
