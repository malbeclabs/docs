---
description: Définitions de la terminologie spécifique à DoubleZero utilisée dans l'ensemble de la documentation.
---

# Glossaire

Cette page définit la terminologie spécifique à DoubleZero utilisée dans l'ensemble de la documentation.

---

## Infrastructure réseau

### DZD (DoubleZero Device)
Le matériel physique de commutation réseau qui termine les liens DoubleZero et exécute le logiciel DoubleZero Agent. Les DZDs sont déployés dans les centres de données et fournissent des services de routage, de traitement des paquets et de connectivité utilisateur. Chaque DZD nécessite des [spécifications matérielles](contribute.md#dzd-network-hardware) spécifiques et exécute à la fois le [Config Agent](#config-agent) et le [Telemetry Agent](#telemetry-agent).

### DZX (DoubleZero Exchange)
Points d'interconnexion dans le réseau maillé où les liens de différents [contributeurs](#contributeur) sont reliés entre eux. Les DZXs sont situés dans les grandes zones métropolitaines (par ex., NYC, LON, TYO) où se produisent les intersections réseau. Les contributeurs réseau doivent raccorder leurs liens au maillage DoubleZero global au DZX le plus proche. Concept similaire à un point d'échange Internet (IX).

### Lien WAN
Un lien de réseau étendu (Wide Area Network) entre deux [DZDs](#dzd-doublezero-device) opérés par le **même** contributeur. Les liens WAN fournissent la connectivité dorsale au sein de l'infrastructure d'un seul contributeur.

### Lien DZX
Un lien entre [DZDs](#dzd-doublezero-device) opérés par des contributeurs **différents**, établi au niveau d'un [DZX](#dzx-doublezero-exchange). Les liens DZX nécessitent une acceptation explicite des deux parties.

### Préfixe DZ
Allocations d'adresses IP au format CIDR attribuées à un [DZD](#dzd-doublezero-device) pour l'adressage du réseau overlay. Spécifié lors de la [création du dispositif](contribute-provisioning.md#step-32-create-your-device-onchain) à l'aide du paramètre `--dz-prefixes`.

---

## Types de dispositifs

### Dispositif Edge
Un [DZD](#dzd-doublezero-device) qui fournit la connectivité utilisateur au réseau DoubleZero. Les dispositifs edge exploitent les interfaces [CYOA](#cyoa-choose-your-own-adventure) pour terminer les utilisateurs (validateurs, opérateurs RPC) et les connecter au réseau.

### Dispositif Transit
Un [DZD](#dzd-doublezero-device) qui fournit la connectivité dorsale au sein du réseau DoubleZero. Les dispositifs transit acheminent le trafic entre les DZDs mais ne terminent pas directement les connexions utilisateur.

### Dispositif Hybride
Un [DZD](#dzd-doublezero-device) qui combine les fonctionnalités [edge](#dispositif-edge) et [transit](#dispositif-transit), fournissant à la fois la connectivité utilisateur et le routage dorsal.

---

## Connectivité

### CYOA (Choose Your Own Adventure)
Types d'interfaces qui permettent aux [contributeurs](#contributeur) d'enregistrer des options de connectivité pour que les utilisateurs se connectent au réseau DoubleZero. Les interfaces CYOA incluent diverses méthodes comme le [DIA](#dia-direct-internet-access), les tunnels GRE et le peering privé. Voir [Création des interfaces CYOA](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices) pour les détails de configuration.

### DIA (Direct Internet Access)
Un terme réseau standard désignant la connectivité fournie via l'internet public. Dans DoubleZero, le DIA est un type d'interface [CYOA](#cyoa-choose-your-own-adventure) où les utilisateurs (validateurs, opérateurs RPC) se connectent à un [DZD](#dzd-doublezero-device) via leur connexion internet existante.

### IBRL (Increase Bandwidth Reduce Latency)
Un mode de connexion qui permet aux validateurs et aux nœuds RPC de se connecter à DoubleZero sans redémarrer leurs clients blockchain. IBRL utilise l'adresse IP publique existante et établit un tunnel overlay vers le [DZD](#dzd-doublezero-device) le plus proche. Voir [Connexion Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) pour les instructions de configuration.

### Multicast
Une méthode de livraison de paquets un-vers-plusieurs prise en charge par DoubleZero. Le mode multicast a deux rôles : **éditeur** (envoie les paquets à travers le réseau) et **abonné** (reçoit les paquets de l'éditeur). Utilisé par les équipes de développement pour une distribution efficace des données. Voir [Autre connexion Multicast](Other%20Multicast%20Connection.md) pour les détails de connexion.

---

## Composants logiciels

### doublezerod
Le service daemon DoubleZero qui s'exécute sur les serveurs utilisateur (validateurs, nœuds RPC). Il gère la connexion au réseau DoubleZero, assure l'établissement des tunnels et maintient la connectivité vers les [DZDs](#dzd-doublezero-device). Configuré via systemd et contrôlé par le CLI [`doublezero`](#doublezero-cli).

### doublezero (CLI)
L'interface en ligne de commande pour interagir avec le réseau DoubleZero. Utilisée pour se connecter, gérer les identités, vérifier l'état et effectuer des opérations d'administration. Communique avec le daemon [`doublezerod`](#doublezerod).

### Config Agent
Agent logiciel s'exécutant sur les [DZDs](#dzd-doublezero-device) qui gère la configuration du dispositif. Lit la configuration depuis le service [Controller](#controller) et applique les modifications au dispositif. Voir [Installation du Config Agent](contribute-provisioning.md#step-44-install-config-agent) pour la mise en place.

### Telemetry Agent
Agent logiciel s'exécutant sur les [DZDs](#dzd-doublezero-device) qui collecte les métriques de performance (latence, gigue, perte de paquets) et les soumet au registre DoubleZero. Voir [Installation du Telemetry Agent](contribute-provisioning.md#step-45-install-telemetry-agent) pour la mise en place.

### Controller
Un service qui fournit la configuration aux agents [DZD](#dzd-doublezero-device). Le Controller dérive les configurations des dispositifs à partir de l'état [onchain](#onchain) sur le registre DoubleZero.

---

## États des liens

### Activé
L'état opérationnel normal d'un lien. Le trafic circule à travers le lien et celui-ci participe aux décisions de routage.

### Drainage progressif (Soft-Drained)
Un état de maintenance où le trafic sera découragé sur un lien spécifique. Utilisé pour des fenêtres de maintenance gracieuses. Peut transiter vers l'état [activé](#activé) ou [drainage complet](#drainage-complet-hard-drained).

### Drainage complet (Hard-Drained)
Un état de maintenance où le lien est complètement retiré du service. Aucun trafic ne circule à travers le lien. Doit transiter vers l'état [drainage progressif](#drainage-progressif-soft-drained) avant de revenir à l'état [activé](#activé).

---

## Organisations et jetons

### DZF (DoubleZero Foundation)
La DoubleZero Foundation est une société-fondation sans membres à but non lucratif des îles Caïmans, créée pour soutenir le développement, la décentralisation, la sécurité et l'adoption du réseau DoubleZero.

### Jeton 2Z
Le jeton natif du réseau DoubleZero. Utilisé pour payer les frais des validateurs et distribué comme récompenses aux [contributeurs](#contributeur). Les validateurs peuvent payer les frais en 2Z via un programme d'échange onchain. Voir [Échange de SOL en 2Z](Swapping-sol-to-2z.md).

### Contributeur
Un fournisseur d'infrastructure réseau qui contribue en bande passante et en matériel au réseau DoubleZero. Les contributeurs opèrent des [DZDs](#dzd-doublezero-device), fournissent des liens [WAN](#lien-wan) et [DZX](#lien-dzx), et reçoivent des incitations en jetons [2Z](#jeton-2z) pour leur contribution. Voir la [Documentation des contributeurs](contribute-overview.md) pour commencer.

---

## Concepts réseau

### MTU (Maximum Transmission Unit)
La plus grande taille de paquet (en octets) pouvant être transmise sur un lien réseau. Les liens WAN DoubleZero utilisent généralement un MTU de 9000 (trames jumbo) pour plus d'efficacité.

### VRF (Virtual Routing and Forwarding)
Une technologie qui permet à plusieurs tables de routage isolées de coexister sur le même routeur physique. Les contributeurs utilisent souvent un VRF de gestion séparé pour isoler le trafic de gestion du commutateur du trafic de production.

### GRE (Generic Routing Encapsulation)
Un protocole de tunnelisation qui encapsule les paquets réseau à l'intérieur de paquets IP. Utilisé par les connexions [IBRL](#ibrl-increase-bandwidth-reduce-latency) et [CYOA](#cyoa-choose-your-own-adventure) pour créer des tunnels overlay entre les utilisateurs et les DZDs.

### BGP (Border Gateway Protocol)
Le protocole de routage utilisé pour l'échange d'informations de routage entre les réseaux sur Internet. DoubleZero utilise BGP en interne avec l'ASN 65342.

### ASN (Autonomous System Number)
Un identifiant unique attribué à un réseau pour le routage BGP. Tous les dispositifs DoubleZero utilisent l'**ASN 65342** pour le processus BGP interne.

### Interface Loopback
Une interface réseau virtuelle sur un routeur/commutateur utilisée à des fins de gestion et de routage. Les DZDs utilisent Loopback255 (VPNv4) et Loopback256 (IPv4) pour le routage interne.

### CIDR (Classless Inter-Domain Routing)
Une notation pour spécifier les plages d'adresses IP. Le format est `IP/longueur-de-préfixe` où la longueur du préfixe indique la taille du réseau (par ex., `/29` = 8 adresses, `/24` = 256 adresses).

### Gigue (Jitter)
Variation de la latence des paquets au fil du temps. Une faible gigue est essentielle pour les applications en temps réel.

### RTT (Round-Trip Time)
Le temps nécessaire pour qu'un paquet voyage de la source à la destination et revienne. Utilisé pour mesurer la latence réseau entre les dispositifs.

### TWAMP (Two-Way Active Measurement Protocol)
Un protocole pour mesurer les métriques de performance réseau comme la latence et la perte de paquets. Le [Telemetry Agent](#telemetry-agent) utilise TWAMP pour collecter les métriques entre les DZDs.

### IS-IS (Intermediate System to Intermediate System)
Un protocole de routage à état de lien utilisé en interne par le réseau DoubleZero. Les métriques IS-IS sont ajustées lors des opérations de [drainage de lien](#drainage-progressif-soft-drained).

---

## Géolocalisation

### Géolocalisation
Un service DoubleZero qui vérifie l'emplacement physique des dispositifs à l'aide de mesures de latence. Les mesures de [RTT](#rtt-round-trip-time) entre l'infrastructure à emplacement connu ([DZDs](#dzd-doublezero-device)) et les dispositifs cibles fournissent une preuve signée cryptographiquement qu'un dispositif se trouve à une certaine distance d'un point de référence. L'enregistrement onchain des mesures est prévu pour une version future. Voir [Géolocalisation](geolocation.md) pour la documentation utilisateur.

### geoProbe
Un serveur bare metal qui agit comme intermédiaire pour les mesures de latence dans le système de [Géolocalisation](#géolocalisation). Les geoProbes sont situés à ~1ms d'un [DZD](#dzd-doublezero-device), reçoivent des LocationOffsets signés des DZDs parents, et mesurent le [RTT](#rtt-round-trip-time) vers les dispositifs cibles via [TWAMP](#twamp-two-way-active-measurement-protocol), TWAMP signé, ou écho ICMP. Chaque geoProbe est enregistré [onchain](#onchain) et lié à un ou plusieurs DZDs parents. Voir [Déploiement des Geoprobes](contribute-geolocation.md) pour la documentation des contributeurs.

### LocationOffset
Une structure de données signée contenant la position géographique d'un [DZD](#dzd-doublezero-device) (latitude et longitude) et une chaîne de relations de latence entre entités (DZD↔Probe ou Probe↔Cible). Les LocationOffsets sont signés avec Ed25519 et envoyés via UDP à travers la chaîne de mesure. Les offsets composites incluent des références aux mesures précédentes, créant une piste d'audit vérifiable.

---

## Blockchain et clés

### Onchain
Dans le contexte DoubleZero, onchain fait référence aux données et opérations enregistrées sur le registre DoubleZero. Contrairement aux réseaux traditionnels où les configurations des dispositifs et des liens résident dans des systèmes de gestion centralisés, DoubleZero enregistre les inscriptions de dispositifs, les configurations de liens et les soumissions de télémétrie onchain — rendant l'état du réseau transparent et vérifiable par tous les participants.

### Clé de service (Service Key)
Une paire de clés cryptographiques utilisée pour authentifier les opérations CLI. C'est votre identité de contributeur pour interagir avec le contrat intelligent DoubleZero. Stockée dans `~/.config/solana/id.json`.

### Clé d'éditeur de métriques (Metrics Publisher Key)
Une paire de clés cryptographiques utilisée par le [Telemetry Agent](#telemetry-agent) pour signer les soumissions de métriques sur la blockchain. Séparée de la clé de service pour l'isolation de sécurité. Stockée dans `~/.config/doublezero/metrics-publisher.json`.

---

## Matériel et logiciel

### EOS (Extensible Operating System)
Le système d'exploitation réseau d'Arista qui s'exécute sur les commutateurs DZD. Les contributeurs installent le [Config Agent](#config-agent) et le [Telemetry Agent](#telemetry-agent) en tant qu'extensions EOS.

### Extension EOS
Un paquet logiciel pouvant être installé sur les commutateurs Arista EOS. Les agents DZ sont distribués sous forme de fichiers `.rpm` et installés via la commande `extension`.