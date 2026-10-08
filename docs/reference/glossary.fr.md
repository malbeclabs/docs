---
description: Définitions de la terminologie spécifique à DoubleZero utilisée dans l'ensemble de la documentation.
---

# Glossaire

Cette page définit la terminologie spécifique à DoubleZero utilisée dans l'ensemble de la documentation.

---

## Infrastructure réseau

### DZD (DoubleZero Device) {#dzd-doublezero-device}
L'équipement physique de commutation réseau qui termine les liens DoubleZero et exécute le logiciel DoubleZero Agent. Les DZD sont déployés dans les centres de données et fournissent des services de routage, de traitement des paquets et de connectivité utilisateur. Chaque DZD nécessite des [spécifications matérielles](../contributors/requirements.md#dzd-network-hardware) spécifiques et exécute à la fois le [Config Agent](#config-agent) et le [Telemetry Agent](#telemetry-agent).

### DZX (DoubleZero Exchange) {#dzx-doublezero-exchange}
Points d'interconnexion dans le réseau maillé où les liens de différents [contributeurs](#contributor) sont reliés entre eux. Les DZX sont situés dans les grandes zones métropolitaines (par ex., NYC, LON, TYO) où se produisent les intersections réseau. Les contributeurs réseau doivent interconnecter leurs liens au maillage DoubleZero plus large au DZX le plus proche. Concept similaire à un point d'échange Internet (IX).

### Lien WAN {#wan-link}
Un lien réseau étendu (Wide Area Network) entre deux [DZD](#dzd-doublezero-device) exploités par le **même** contributeur. Les liens WAN fournissent la connectivité dorsale au sein de l'infrastructure d'un seul contributeur.

### Lien DZX {#dzx-link}
Un lien entre des [DZD](#dzd-doublezero-device) exploités par des contributeurs **différents**, établi au niveau d'un [DZX](#dzx-doublezero-exchange). Les liens DZX nécessitent l'acceptation explicite des deux parties.

### Préfixe DZ
Allocations d'adresses IP au format CIDR attribuées à un [DZD](#dzd-doublezero-device) pour l'adressage du réseau overlay. Spécifié lors de la [création du dispositif](../contributors/provisioning.md#step-32-create-your-device-onchain) à l'aide du paramètre `--dz-prefixes`.

---

## Types de dispositifs

### Dispositif Edge {#edge-device}
Un [DZD](#dzd-doublezero-device) qui fournit la connectivité utilisateur au réseau DoubleZero. Les dispositifs edge exploitent les interfaces [CYOA](#cyoa-choose-your-own-adventure) pour terminer les utilisateurs (validateurs, opérateurs RPC) et les connecter au réseau.

### Dispositif Transit {#transit-device}
Un [DZD](#dzd-doublezero-device) qui fournit la connectivité dorsale au sein du réseau DoubleZero. Les dispositifs transit acheminent le trafic entre les DZD mais ne terminent pas directement les connexions utilisateur.

### Dispositif hybride
Un [DZD](#dzd-doublezero-device) qui combine les fonctionnalités [edge](#edge-device) et [transit](#transit-device), fournissant à la fois la connectivité utilisateur et le routage dorsal.

---

## Connectivité

### CYOA (Choose Your Own Adventure) {#cyoa-choose-your-own-adventure}
Types d'interfaces qui permettent aux [contributeurs](#contributor) d'enregistrer des options de connectivité pour que les utilisateurs se connectent au réseau DoubleZero. Les interfaces CYOA incluent diverses méthodes comme le [DIA](#dia-direct-internet-access), les tunnels GRE et le peering privé. Voir [Création des interfaces CYOA](../contributors/provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices) pour les détails de configuration.

### DIA (Direct Internet Access) {#dia-direct-internet-access}
Un terme réseau standard désignant la connectivité fournie via l'internet public. Dans DoubleZero, le DIA est un type d'interface [CYOA](#cyoa-choose-your-own-adventure) où les utilisateurs (validateurs, opérateurs RPC) se connectent à un [DZD](#dzd-doublezero-device) via leur connexion internet existante.

### IBRL (Increase Bandwidth Reduce Latency) {#ibrl-increase-bandwidth-reduce-latency}
Un mode de connexion qui permet aux validateurs et aux nœuds RPC de se connecter à DoubleZero sans redémarrer leurs clients blockchain. IBRL utilise l'adresse IP publique existante et établit un tunnel overlay vers le [DZD](#dzd-doublezero-device) le plus proche. Voir [Connexion Mainnet-Beta](../solana/ibrl/publish.md) pour les instructions de configuration.

### Multicast
Une méthode de livraison de paquets de type un-vers-plusieurs prise en charge par DoubleZero. Le mode multicast comporte deux rôles : **éditeur** (envoie les paquets à travers le réseau) et **abonné** (reçoit les paquets de l'éditeur). Utilisé par les équipes de développement pour la distribution efficace des données. Voir [Autre connexion Multicast](other-multicast.md) pour les détails de connexion.

---

## Composants logiciels

### doublezerod {#doublezerod}
Le service daemon DoubleZero qui s'exécute sur les serveurs des utilisateurs (validateurs, nœuds RPC). Il gère la connexion au réseau DoubleZero, prend en charge l'établissement des tunnels et maintient la connectivité avec les [DZD](#dzd-doublezero-device). Configuré via systemd et contrôlé via la CLI [`doublezero`](#doublezero-cli).

### doublezero (CLI) {#doublezero-cli}
L'interface en ligne de commande pour interagir avec le réseau DoubleZero. Utilisée pour se connecter, gérer les identités, vérifier l'état et effectuer des opérations administratives. Communique avec le daemon [`doublezerod`](#doublezerod).

### Config Agent {#config-agent}
Agent logiciel exécuté sur les [DZD](#dzd-doublezero-device) qui gère la configuration des dispositifs. Lit la configuration depuis le service [Controller](#controller) et applique les modifications au dispositif. Voir [Installation du Config Agent](../contributors/provisioning.md#step-44-install-config-agent) pour la mise en place.

### Telemetry Agent {#telemetry-agent}
Agent logiciel exécuté sur les [DZD](#dzd-doublezero-device) qui collecte les métriques de performance (latence, gigue, perte de paquets) et les soumet au registre DoubleZero. Voir [Installation du Telemetry Agent](../contributors/provisioning.md#step-45-install-telemetry-agent) pour la mise en place.

### Controller {#controller}
Un service qui fournit la configuration aux agents des [DZD](#dzd-doublezero-device). Le Controller dérive les configurations des dispositifs à partir de l'état [onchain](#onchain) sur le registre DoubleZero.

---

## États des liens

### Activé {#activated}
L'état opérationnel normal d'un lien. Le trafic circule à travers le lien et celui-ci participe aux décisions de routage.

### Drainage progressif (Soft-Drained) {#soft-drained}
Un état de maintenance où le trafic sera découragé sur un lien spécifique. Utilisé pour des fenêtres de maintenance progressives. Peut passer à l'état [activé](#activated) ou [drainage complet](#hard-drained).

### Drainage complet (Hard-Drained) {#hard-drained}
Un état de maintenance où le lien est complètement retiré du service. Aucun trafic ne circule à travers le lien. Doit passer par l'état [drainage progressif](#soft-drained) avant de revenir à l'état [activé](#activated).

---

## Organisations et jetons

### DZF (DoubleZero Foundation) {#dzf-doublezero-foundation}
La DoubleZero Foundation est une société-fondation à but non lucratif sans membres, constituée aux îles Caïmans, créée pour soutenir le développement, la décentralisation, la sécurité et l'adoption du réseau DoubleZero.

### Jeton 2Z {#2z-token}
Le jeton natif du réseau DoubleZero. Utilisé pour payer les frais de validateur et distribué en tant que récompenses aux [contributeurs](#contributor). Les validateurs peuvent payer les frais en 2Z via un programme d'échange onchain. Voir [Échange de SOL en 2Z](../Swapping-sol-to-2z.md).

### Contributeur {#contributor}
Un fournisseur d'infrastructure réseau qui contribue en bande passante et en matériel au réseau DoubleZero. Les contributeurs exploitent des [DZD](#dzd-doublezero-device), fournissent des liens [WAN](#wan-link) et [DZX](#dzx-link), et reçoivent des incitations en jetons [2Z](#2z-token) pour leur contribution. Voir la [Documentation des contributeurs](../contributors/index.md) pour commencer.

---

## Concepts réseau

### MTU (Maximum Transmission Unit)
La taille maximale de paquet (en octets) qui peut être transmise sur un lien réseau. Les liens WAN DoubleZero utilisent généralement un MTU de 9000 (trames jumbo) pour plus d'efficacité.

### VRF (Virtual Routing and Forwarding)
Une technologie qui permet à plusieurs tables de routage isolées de coexister sur le même routeur physique. Les contributeurs utilisent souvent un VRF de gestion séparé pour isoler le trafic de gestion du commutateur du trafic de production.

### GRE (Generic Routing Encapsulation)
Un protocole de tunnelisation qui encapsule les paquets réseau dans des paquets IP. Utilisé par les connexions [IBRL](#ibrl-increase-bandwidth-reduce-latency) et [CYOA](#cyoa-choose-your-own-adventure) pour créer des tunnels overlay entre les utilisateurs et les DZD.

### BGP (Border Gateway Protocol)
Le protocole de routage utilisé pour échanger des informations de routage entre les réseaux sur internet. DoubleZero utilise BGP en interne avec l'ASN 65342.

### ASN (Autonomous System Number)
Un identifiant unique attribué à un réseau pour le routage BGP. Tous les dispositifs DoubleZero utilisent l'**ASN 65342** pour le processus BGP interne.

### Interface Loopback
Une interface réseau virtuelle sur un routeur/commutateur utilisée à des fins de gestion et de routage. Les DZD utilisent Loopback255 (VPNv4) et Loopback256 (IPv4) pour le routage interne.

### CIDR (Classless Inter-Domain Routing)
Une notation pour spécifier les plages d'adresses IP. Le format est `IP/longueur-de-préfixe` où la longueur du préfixe indique la taille du réseau (par ex., `/29` = 8 adresses, `/24` = 256 adresses).

### Gigue (Jitter)
Variation de la latence des paquets dans le temps. Une faible gigue est essentielle pour les applications en temps réel.

### RTT (Round-Trip Time) {#rtt-round-trip-time}
Le temps nécessaire pour qu'un paquet voyage de la source à la destination et revienne. Utilisé pour mesurer la latence réseau entre les dispositifs.

### TWAMP (Two-Way Active Measurement Protocol) {#twamp-two-way-active-measurement-protocol}
Un protocole pour mesurer les métriques de performance réseau telles que la latence et la perte de paquets. Le [Telemetry Agent](#telemetry-agent) utilise TWAMP pour collecter les métriques entre les DZD.

### IS-IS (Intermediate System to Intermediate System)
Un protocole de routage à état de liens utilisé en interne par le réseau DoubleZero. Les métriques IS-IS sont ajustées lors des opérations de [drainage de liens](#soft-drained).

---

## Géolocalisation {#geolocation}

### Géolocalisation
Un service DoubleZero qui vérifie l'emplacement physique des dispositifs à l'aide de mesures de latence. Les mesures de [RTT](#rtt-round-trip-time) entre l'infrastructure à emplacement connu ([DZD](#dzd-doublezero-device)) et les dispositifs cibles fournissent une preuve signée cryptographiquement qu'un dispositif se trouve à une certaine distance d'un point de référence. L'enregistrement onchain des mesures est prévu pour une version future. Voir [Géolocalisation](geolocation.md) pour la documentation utilisateur.

### geoProbe
Un serveur bare metal qui sert d'intermédiaire pour les mesures de latence dans le système de [Géolocalisation](#geolocation). Les geoProbes sont situés à ~1 ms d'un [DZD](#dzd-doublezero-device), reçoivent des LocationOffsets signés des DZD parents, et mesurent le [RTT](#rtt-round-trip-time) vers les dispositifs cibles via [TWAMP](#twamp-two-way-active-measurement-protocol), TWAMP signé ou écho ICMP. Chaque geoProbe est enregistré [onchain](#onchain) et lié à un ou plusieurs DZD parents. Voir [Déploiement des Geoprobes](../contributors/geolocation.md) pour la documentation des contributeurs.

### LocationOffset
Une structure de données signée contenant l'emplacement géographique d'un [DZD](#dzd-doublezero-device) (latitude et longitude) et une chaîne de relations de latence entre entités (DZD↔Probe ou Probe↔Cible). Les LocationOffsets sont signés avec Ed25519 et envoyés via UDP à travers la chaîne de mesure. Les offsets composites incluent des références aux mesures précédentes, créant une piste auditable.

---

## Blockchain et clés

### Onchain {#onchain}
Dans le contexte de DoubleZero, onchain fait référence aux données et opérations enregistrées sur le registre DoubleZero. Contrairement aux réseaux traditionnels où les configurations des dispositifs et des liens résident dans des systèmes de gestion centralisés, DoubleZero enregistre les enregistrements de dispositifs, les configurations de liens et les soumissions de télémétrie onchain — rendant l'état du réseau transparent et vérifiable par tous les participants.

### Clé de service
Une paire de clés cryptographiques utilisée pour authentifier les opérations CLI. Il s'agit de votre identité de contributeur pour interagir avec le contrat intelligent DoubleZero. Stockée à `~/.config/solana/id.json`.

### Clé d'éditeur de métriques
Une paire de clés cryptographiques utilisée par le [Telemetry Agent](#telemetry-agent) pour signer les soumissions de métriques à la blockchain. Séparée de la clé de service pour l'isolation de sécurité. Stockée à `~/.config/doublezero/metrics-publisher.json`.

---

## Matériel et logiciels

### EOS (Extensible Operating System)
Le système d'exploitation réseau d'Arista qui s'exécute sur les commutateurs DZD. Les contributeurs installent le [Config Agent](#config-agent) et le [Telemetry Agent](#telemetry-agent) en tant qu'extensions EOS.

### Extension EOS
Un paquet logiciel qui peut être installé sur les commutateurs Arista EOS. Les agents DZ sont distribués sous forme de fichiers `.rpm` et installés via la commande `extension`.