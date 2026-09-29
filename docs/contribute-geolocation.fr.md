---
description: Déployez et configurez les agents geoProbe qui effectuent les mesures de latence derrière le service de Géolocalisation DoubleZero.
---

# Déploiement de Geoprobe

Ce guide couvre le déploiement et la configuration des **agents geoProbe** — les serveurs qui effectuent les mesures de latence pour le service de [Géolocalisation](geolocation.md) DoubleZero.

Un geoProbe se situe entre les [DZDs](glossary.md#dzd-doublezero-device) et les appareils cibles dans la chaîne de mesure à trois niveaux. Il reçoit des LocationOffsets signés des DZDs parents et mesure le [RTT](glossary.md#rtt-round-trip-time) vers les cibles enregistrées via [TWAMP](glossary.md#twamp-two-way-active-measurement-protocol), TWAMP signé ou écho ICMP. Chaque geoProbe est enregistré onchain et lié à un ou plusieurs DZDs parents.

Pour une vue d'ensemble de l'architecture de géolocalisation et des flux de mesure, consultez le [guide utilisateur de Géolocalisation](geolocation.md).

---

## Prérequis

!!! warning "Version de l'agent de télémétrie DZD"
    Les DZDs parents doivent exécuter **la version 0.17.0 ou ultérieure de l'agent de télémétrie** pour prendre en charge le service de géolocalisation. Les versions antérieures n'incluent pas les extensions de découverte de sondes, de ping TWAMP et de publication d'offsets requises pour la géolocalisation. Vérifiez les versions des agents avant de déployer une sonde — une sonde associée à un DZD ancien ne recevra pas d'offsets.

Avant de déployer un geoProbe, assurez-vous de disposer de :

- **Serveur Linux bare metal** — Un VPS peut fonctionner, mais est moins idéal.
- **Proximité réseau avec un DZD** — moins de 1ms de RTT entre la sonde et son DZD parent. Idéalement 0,1ms ou moins.
- **Capacité `CAP_NET_RAW`** pour le processus de l'agent (requise pour le sondage par écho ICMP avec des sockets raw)
- **Paire de clés Ed25519** pour l'identité de signature de la sonde
- **Autorisation de la Fondation** — l'enregistrement des sondes est actuellement contrôlé par la fondation ; coordonnez-vous avec la [DZF](glossary.md#dzf-doublezero-foundation) avant de procéder
- **DZD(s) parent(s)** exécutant l'agent de télémétrie v0.17.0+

---

## Installation

Installez à la fois le démon de l'agent et le CLI doublezero :

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt install doublezero-geoprobe-agent doublezero
```

| Paquet | Fonction |
|--------|----------|
| `doublezero-geoprobe-agent` | Démon de l'agent qui s'exécute sur le serveur de la sonde, effectuant les mesures de latence et générant des offsets signés |
| `doublezero` | Outil CLI utilisé pour l'enregistrement des sondes et les commandes de gestion |

---

## Enregistrement Onchain

L'enregistrement d'une sonde nécessite l'autorisation de la fondation. Coordonnez-vous avec la DZF avant de procéder.

### Étape 1 : Enregistrer la sonde

```bash
doublezero geolocation probe create \
  --code <probe-code> \
  --exchange <exchange-pubkey> \
  --public-ip <probe-ip> \
  --signing-pubkey <signing-key-pubkey>
```

| Paramètre | Description |
|-----------|-------------|
| `--code` | Identifiant unique de la sonde (par ex., `ams-tn-gp1`) — 32 caractères maximum |
| `--exchange` | Clé publique du compte Serviceability Exchange auquel cette sonde est associée |
| `--public-ip` | Adresse IPv4 publique sur laquelle la sonde écoute |
| `--signing-pubkey` | Clé publique utilisée pour signer les offsets et la télémétrie |

### Étape 2 : Lier les DZDs parents

```bash
doublezero geolocation probe add-parent \
  --probe <probe-code> \
  --device <dzd-code>
```

Chaque DZD parent doit être un appareil activé dans le Serviceability Program. Les DZDs découvrent automatiquement les sondes enfants toutes les 60 secondes — une fois liés, le DZD commence automatiquement les mesures TWAMP et la génération d'offsets.

---

## Exécution de l'Agent

```bash
doublezero-geoprobe-agent \
  --env mainnet-beta \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey>
```

### Options Requises

| Option | Description |
|--------|-------------|
| `--keypair` | Chemin vers le fichier de paire de clés Ed25519 pour la signature des offsets |
| `--geoprobe-pubkey` | Clé publique [onchain](glossary.md#onchain) de la sonde (issue de `probe create`) |
| `--env` | Environnement réseau : `testnet`, `devnet` ou `mainnet-beta` (définit l'URL RPC du registre) |

Alternativement, utilisez `--ledger-rpc-url` au lieu de `--env` pour spécifier un point de terminaison RPC Solana personnalisé.

### Options Facultatives

| Option | Par défaut | Description |
|--------|------------|-------------|
| `--twamp-listen-port` | 8925 | Port pour les mesures TWAMP des DZDs parents |
| `--signed-twamp-port` | 8924 | Port pour les sondes TWAMP signées des cibles entrantes |
| `--udp-listen-port` | 8923 | Port pour la réception des datagrammes LocationOffset des DZDs |
| `--probe-interval` | 30s | Fréquence de mesure de chaque cible |
| `--max-offset-age` | 1h | Âge maximum d'un offset DZD en cache avant qu'il ne soit supprimé |
| `--verify-interval` | 29s | Fréquence de re-vérification des assignations de cibles depuis le registre |
| `--verbose` | false | Activer la journalisation détaillée |
| `--metrics-enable` | false | Activer le point de terminaison de métriques Prometheus |
| `--metrics-addr` | — | Adresse du point de terminaison de métriques Prometheus (par ex., `0.0.0.0:9090`) |

---

## Ports et Pare-feu

L'agent geoprobe nécessite l'ouverture de plusieurs ports :

| Port | Protocole | Direction | Fonction |
|------|-----------|-----------|----------|
| 8923/udp | UDP | Entrant depuis les DZDs | Réception des datagrammes LocationOffset signés |
| 8924/udp | UDP | Entrant depuis les cibles | Réflecteur TWAMP signé (flux de sonde entrant) |
| 8925/udp | UDP | Entrant depuis les DZDs | Mesures TWAMP des DZDs parents |
| ICMP | ICMP | Sortant vers les cibles | Requêtes d'écho ICMP pour les cibles OutboundIcmp |

!!! note
    L'agent nécessite également du trafic UDP sortant vers les cibles pour le sondage TWAMP (flux sortant) et pour la livraison des résultats LocationOffset signés aux cibles.

---

## Surveillance

Activez le point de terminaison de métriques Prometheus pour une visibilité opérationnelle :

```bash
doublezero-geoprobe-agent \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey> \
  --env testnet \
  --metrics-enable \
  --metrics-addr 0.0.0.0:9090
```

Métriques clés à surveiller :

- **Disponibilité de la sonde** — temps de fonctionnement du processus de l'agent
- **Latence DZD vers sonde** — devrait être inférieure à 1ms ; des valeurs plus élevées indiquent un problème de placement
- **Cibles actives** — nombre de cibles que la sonde mesure actuellement
- **Échecs de vérification de signature** — des valeurs non nulles peuvent indiquer une mauvaise configuration des clés ou des paquets altérés
- **Taux de succès du cache d'offsets** — un taux faible signifie que la sonde attend fréquemment de nouveaux offsets DZD

Consultez le [guide Opérations](contribute-operations.md#monitoring) pour des recommandations générales sur les modèles de scraping Prometheus et d'alertes utilisés à travers les agents DoubleZero.

---

## Commandes de Gestion des Sondes

Le CLI `doublezero geolocation` fournit les sous-commandes suivantes pour la gestion des sondes :

| Sous-commande | Description |
|---------------|-------------|
| `probe create` | Enregistrer un nouveau geoProbe onchain |
| `probe get` | Obtenir les détails d'une sonde spécifique par code |
| `probe list` | Lister toutes les sondes enregistrées |
| `probe update` | Mettre à jour la configuration de la sonde (IP, port, clé de signature) |
| `probe delete` | Supprimer une sonde (nécessite aucune référence de cible active) |
| `probe add-parent` | Lier un DZD parent à la sonde |
| `probe remove-parent` | Retirer un DZD parent de la sonde |

Toutes les sous-commandes acceptent `--env` ou `--rpc-url` pour sélectionner le réseau. Les opérations d'écriture (`create`, `update`, `delete`, `add-parent`, `remove-parent`) nécessitent `--keypair`.

??? note "Exemple : lister les sondes"

    ```bash
    doublezero geolocation probe list
    ```

    Retourne toutes les sondes enregistrées avec leurs codes, IPs publiques, DZDs parents et statut actuel.