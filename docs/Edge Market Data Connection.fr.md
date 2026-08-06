---
description: Exécutez doublezero-edge-connect pour retransmettre les shreds Solana vers un port UDP local et consommer des données de marché Edge normalisées via un WebSocket local.
---

# Connexion Edge

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol). Les données sont réservées à votre usage interne et ne peuvent pas être retransmises (voir Section 2(e))."

`doublezero-edge-connect` est un pont qui rejoint le **multicast binaire DoubleZero Edge** et le redistribue localement sous forme de deux flux :

1. **Retransmission des shreds Solana** — shreds dédupliquées (avec vérification de signature optionnelle) distribuées vers une ou plusieurs destinations UDP locales, prêtes pour votre validateur ou RPC.
2. **Données de marché normalisées** — flux des plateformes Edge décodés, corrigés en précision, et redistribués sous forme d'un WebSocket JSON unique sur `ws://host:8081`.

Les deux fonctionnent depuis le même conteneur et la même installation en une ligne. Activez les flux que votre autorisation onchain vous accorde.

```
                                        ┌─ UDP datagrams ──▶  validator / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binary)             (dedup · decode · normalize)  └─ WebSocket (JSON) ──▶  trading engine
                                                          ws://host:8081
```

---

## Prérequis

- Hôte **Linux/amd64** avec une adresse IPv4 publique autorisée onchain pour l'environnement cible.
- **Docker** (l'installateur en une ligne l'installe s'il est absent).
- **Connectivité GRE** — autorisez le protocole IP 47 chez votre fournisseur cloud ; sur AWS, désactivez la vérification source/dest de l'ENI.
- Un **secret d'accès DoubleZero** : un jeton base64 préfixé `DZ_` ou un chemin vers un fichier de clés, obtenu lors du processus d'[intégration DoubleZero](setup.md).

---

## Étape 1 : Installer et Exécuter

Une seule commande prépare l'hôte et démarre le conteneur pont. Il rejoint le réseau DoubleZero et démarre chaque flux que votre autorisation accorde — retransmission des shreds et/ou le WebSocket de données de marché sur `:8081` :

=== "Mainnet-beta"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect | bash
    ```

=== "Testnet"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect-testnet | bash
    ```

=== "Devnet (privé)"

    ```bash
    # Nécessite un jeton GHCR avec read:packages
    DZ_GHCR_TOKEN=<your-token> curl -fsSL https://get.doublezero.xyz/connect-devnet | bash
    ```

Ce que fait le script :

1. Vérifie que l'hôte est Linux/amd64.
2. Charge votre secret d'accès (demandé une fois si `DZ_SECRET` n'est pas défini) et **vérifie son pass d'accès onchain avant d'installer quoi que ce soit** — une vérification côté hôte pure contre le JSON-RPC public du registre. Si le pass est lié à une IP différente de celle de l'hôte, il interrompt l'opération (lorsque l'IP a été donnée explicitement via `DZ_CLIENT_IP`) ou émet un avertissement et continue (lorsque l'IP a été auto-détectée, ce qui peut être erroné derrière un NAT), laissant `doublezero connect` comme vérification réelle.
3. S'assure que Docker est présent (propose de l'installer) et prépare le noyau de l'hôte pour le tunnel GRE : charge `tun`/`ip_gre`, augmente `net.core.rmem_max`, avertit concernant le pare-feu et les règles du fournisseur cloud.
4. Exécute le conteneur pont (`--network host`, `NET_ADMIN`/`NET_RAW`, `/dev/net/tun`) et lance `doublezero connect multicast`.

!!! tip "Installation non interactive"
    Définissez `DZ_SECRET=DZ_…` avant le pipe pour exécuter de manière entièrement automatisée — aucune invite.

---

## Étape 2 : Configurer

Toute la configuration se fait via des **variables d'environnement définies avant le pipe**. Il n'y a pas de fichier de configuration.

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### Variables de l'installateur

| Variable | Défaut | Objectif |
|----------|--------|----------|
| `DZ_SECRET` | *(demandé)* | Jeton base64 préfixé `DZ_` **ou** chemin vers un fichier de clés. Un jeton est injecté dans le conteneur et jamais écrit sur disque ; un fichier est monté en lecture seule. |
| `DZ_ENV` | par script | `mainnet-beta` \| `testnet` \| `devnet`. |
| `DZ_IMAGE` | par script | Remplacer l'image du conteneur. |
| `DZ_NAME` | `doublezero-edge-connect` | Nom du conteneur. |
| `DZ_FEEDS` | *(tous)* | Plateformes séparées par des virgules pour restreindre l'ingestion des données de marché (ex. `VenueA,VenueB`). N'affecte pas la retransmission des shreds Solana. |
| `DZ_CLIENT_IP` | *(auto-détecté)* | Remplacer l'IPv4 publique utilisée par la pré-vérification du pass d'accès onchain. Définissez-la lorsque l'auto-détection est erronée (ex. derrière un NAT) afin que la pré-vérification puisse confirmer plutôt que simplement avertir. |
| `DZ_LEDGER_RPC_URL` | par env | Remplacer le point de terminaison RPC du registre DoubleZero utilisé par la pré-vérification. |
| `DZ_ASSUME_YES` | `0` | Ignorer les invites de confirmation (ex. l'invite d'installation de Docker). |
| `DZ_GHCR_TOKEN` | — | **Devnet uniquement** — un jeton GHCR avec `read:packages` (l'image devnet est privée). |
| `DZ_GHCR_USER` | `malbeclabs` | **Devnet uniquement** — nom d'utilisateur GHCR pour la connexion. |

### Variables du pont

L'installateur transmet **toute variable non vide** du pont directement au conteneur. Les plus courantes :

| Variable | Défaut | Objectif |
|----------|--------|----------|
| `DZ_IFACE` | `doublezero1` | Interface réseau d'écoute. |
| `DZ_RECV_BUF` | `8388608` | Remplacement du tampon de réception UDP (octets ; défaut 8 Mio). |
| `METRICS_BIND` | *(vide / désactivé)* | Activer le point de terminaison Prometheus `/metrics` (ex. `127.0.0.1:9090`). |
| `RUST_LOG` | `warn,doublezero_edge_connect=info` | Niveau de journalisation (`debug`, `warn`, etc.). |
| `DZ_SHRED_FORWARD` | — | Destination(s) UDP locale(s) pour les shreds retransmises — voir [Retransmission des Shreds Solana](#retransmission-des-shreds-solana). |
| `WS_BIND` | `0.0.0.0:8081` | Adresse de liaison du WebSocket de données de marché — voir [WebSocket de Données de Marché](#websocket-de-données-de-marché). |
| `WS_MAX_CLIENTS` | `64` | Nombre maximum de clients WebSocket simultanés. |
| `WS_INPUT_COINS` | *(vide / désactivé)* | Activer le WebSocket public Hyperliquid comme solution de secours pour les symboles listés (ex. `BTC,ETH`) — voir [Sources d'entrée](#sources-dentrée-et-solution-de-secours-websocket). |
| `WS_INPUT_URL` | `wss://api.hyperliquid.xyz/ws` | URL du WebSocket public Hyperliquid pour la solution de secours. |
| `PHOENIX_WS_INPUT_MARKETS` | *(vide / désactivé)* | Activer le WebSocket public Phoenix comme solution de secours (trades uniquement) pour les tickers listés (ex. `SOL,BTC`). |
| `PHOENIX_WS_INPUT_URL` | `wss://perp-api.phoenix.trade/v1/ws` | URL du WebSocket public Phoenix pour la solution de secours. |

**Exemples :**

```bash
# Retransmettre les shreds vers un validateur/RPC local :
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# Non interactif, testnet :
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# Restreindre les données de marché à des plateformes spécifiques, journalisation détaillée, port WS non standard :
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# Activer les métriques et une solution de secours WS publique :
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    L'installateur ne transmet que les valeurs **non vides**, avec une exception : `WS_BIND` est transmis même lorsqu'il est défini vide, donc `WS_BIND=""` **désactive bien** le sink WebSocket via l'installateur en une ligne. Pour toute autre variable, un remplacement vide ne peut pas être transmis via le pipe — utilisez un `docker run` écrit manuellement pour cela (voir [Auto-hébergement](#avancé--auto-hébergement)).

---

## Retransmission des Shreds Solana

Le pont rejoint les groupes multicast de shreds `edge-solana-*` et distribue chaque datagramme vers une ou plusieurs destinations UDP locales — alimentant votre validateur ou RPC directement depuis le réseau Edge. Il s'active automatiquement lors de la découverte lorsque ces groupes sont présents dans votre autorisation.

```bash
# Par défaut (déduplication uniquement, retransmission vers le port local 20000) :
DZ_SHRED_FORWARD=127.0.0.1:20000 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# Avec vérification de signature :
DZ_SHRED_DEDUP_MODE=sigverify \
  DZ_SHRED_RPC_URL=https://api.mainnet-beta.solana.com \
  DZ_SHRED_FORWARD=127.0.0.1:20000 \
  DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

| Variable | Défaut | Objectif |
|----------|--------|----------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | Destination(s) pour les shreds retransmises (répétable). |
| `DZ_SHRED_DISABLE` | `0` | Désactivation principale (`--shred-forward-disable`). Maintient le retransmetteur désactivé quelle que soit votre autorisation — définissez-le lorsqu'aucun consommateur local n'écoute, pour éviter de gaspiller du CPU à retransmettre le flux de shreds vers nulle part. |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup` (une copie par shred), `sigverify` (+ vérification ed25519), `none` (tous les datagrammes). |
| `DZ_SHRED_RPC_URL` | — | Point de terminaison RPC Solana ; requis pour le mode `sigverify`. |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | Taille de la fenêtre de déduplication. |

Voir [Retransmission des shreds](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md) pour le pipeline complet et les mises en garde.

---

## WebSocket de Données de Marché

Ouvrez un WebSocket vers `ws://<host>:8081` et lisez les trames JSON. Vous recevez toutes les plateformes pour lesquelles vous êtes autorisé. Un message `subscribe` optionnel permet de restreindre le flux à des plateformes et symboles spécifiques.

Tout moteur qui parle WebSocket + JSON peut le consommer avec un adaptateur léger (~50–100 lignes). Le multicast binaire, la séparation en deux ports par plateforme, et le handshake manifeste/précision restent tous à l'intérieur du pont ; le seul contrat qu'un consommateur implémente est le WebSocket JSON.

!!! note
    Le sink WebSocket ne démarre que lorsqu'au moins un flux de données de marché est actif pour votre autorisation — un hôte dédié aux shreds uniquement ne sert aucun WebSocket. L'activation est pilotée par un réconciliateur d'abonnements onchain qui se rafraîchit toutes les 30 secondes (`--subscription-refresh-secs`) ; `--subscription-gating-disable` permet de désactiver le contrôle d'accès.

### Cycle de vie de la connexion

À chaque nouvelle connexion, le pont :

1. **Rejoue les définitions d'instruments actuelles** — un message `instrument` par symbole connu — afin que le consommateur dispose de la précision avant la première cotation.
2. **Rejoue le dernier instantané de profondeur** par symbole (si le flux Market-by-Order est actif).
3. **Diffuse en continu** les messages `quote` / `trade` / `midpoint` / `depth` à mesure qu'ils arrivent, distribués à tous les consommateurs connectés.

```
connect → instrument (×N) → depth (×M, derniers carnets) → quote → trade → depth → …
```

### Types de messages

Chaque message est un objet JSON identifié par un champ `type` :

| `type` | Signification |
|--------|---------------|
| `instrument` | Définition d'instrument/précision. |
| `quote` | Mise à jour du meilleur niveau (état complet). |
| `trade` | Transaction exécutée (dernière vente). |
| `midpoint` | Prix médian dérivé. |
| `depth` | Instantané complet de la profondeur du carnet d'ordres. |
| `status` | Transition de l'état de santé du flux au niveau de la plateforme. |

Les consommateurs **doivent ignorer les valeurs `type` inconnues et les champs inconnus** (compatibilité ascendante).

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

Envoyé à la connexion et chaque fois que les définitions changent. `price_exponent` et `qty_exponent` donnent le pas de cotation et l'incrément de taille de la plateforme sous forme de puissances de dix.

#### `quote`

```json
{
  "type": "quote",
  "venue": "ExampleVenue",
  "symbol": "SOL",
  "bid": 184.20, "ask": 184.21,
  "bid_size": 12.5, "ask_size": 8.0,
  "bid_n": 3, "ask_n": 2,
  "source_ts_ns": 1781019263715344015,
  "recv_ts_ns":   1781019263715501230,
  "kernel_rx_ts_ns": 1781019263715300010,
  "ws_send_ts_ns":   1781019263715600440
}
```

Chaque `quote` est un **état complet** — un message perdu se corrige automatiquement à la prochaine cotation, aucune resynchronisation nécessaire. Les quatre horodatages décomposent la latence de bout en bout :

```
source_ts_ns → kernel_rx_ts_ns → recv_ts_ns → ws_send_ts_ns → (réception consommateur)
  carnet plateforme   arrivée réseau     post-décodage    transfert WS
```

`0` est la valeur sentinelle pour « non disponible » — traitez-la comme manquante, pas comme 1970.

#### `trade`

```json
{
  "type": "trade",
  "venue": "ExampleVenue", "symbol": "SOL",
  "price": 184.20, "size": 3.5,
  "aggressor_side": "buy",
  "trade_id": 987654, "cumulative_volume": 12500.0,
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

`aggressor_side` vaut `"buy"`, `"sell"`, ou `"unknown"`. Les trades sont des événements ponctuels et ne sont pas rejoués lors de la reconnexion.

#### `depth`

```json
{
  "type": "depth",
  "venue": "MboVenue", "symbol": "SOL",
  "bids": [[184.20, 12.5], [184.19, 4.0]],
  "asks": [[184.21, 8.0], [184.22, 6.5]],
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

Les `bids` sont triés du prix le plus élevé au plus bas ; les `asks` sont triés du prix le plus bas au plus élevé. Chaque `depth` est un **instantané complet** — remplacez, ne fusionnez pas.

#### `status`

```json
{"type":"status","venue":"ExampleVenue","state":"down","stale_ms":30000,"ts_ns":...}
```

Émis à la périphérie lorsque le multicast de cotations d'une plateforme devient silencieux (`state:"down"`) ou reprend (`state:"ok"`). Utilisez-le pour griser une plateforme dans votre interface. La livraison des cotations n'est pas conditionnée par le statut — le flux se rétablit automatiquement à la prochaine cotation.

### Abonnements

Par défaut, vous recevez tout. Envoyez un message de contrôle pour restreindre le flux :

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Omettre un champ correspond à toute valeur (`{"symbol":"SOL"}` = SOL sur toutes les plateformes). `venue` est comparé sans distinction de casse.

**Accusé de réception du serveur :**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Les erreurs renvoient `{"channel":"error","error":"<reason>"}`.

### Heartbeat et vivacité

- Le serveur envoie un **Ping WebSocket** toutes les 20 secondes ; les clients conformes répondent automatiquement par un Pong.
- Les clients silencieux pendant 60 secondes sont fermés et nettoyés.
- Keepalive au niveau applicatif : `{"method":"ping"}` → `{"channel":"pong"}`.

### Squelette de consommateur

```python
import json, websocket

def on_message(ws, frame):
    msg = json.loads(frame)
    t = msg.get("type")
    if t == "instrument":
        register_instrument(msg["venue"], msg["symbol"],
                            msg["price_exponent"], msg["qty_exponent"])
    elif t == "quote":
        on_top_of_book(msg["venue"], msg["symbol"],
                       msg["bid"], msg["ask"],
                       msg["bid_size"], msg["ask_size"])
    elif t == "trade":
        on_trade(msg["venue"], msg["symbol"],
                 msg["price"], msg["size"], msg["aggressor_side"])
    elif t == "depth":
        replace_book(msg["venue"], msg["symbol"],
                     msg["bids"], msg["asks"])
    # types inconnus : ignorer silencieusement (compatibilité ascendante)

ws = websocket.WebSocketApp("ws://localhost:8081", on_message=on_message)
ws.run_forever()
```

### Sources d'entrée et solution de secours WebSocket

Le flux multicast Edge est permanent. Des **solutions de secours WebSocket publiques** optionnelles peuvent combler les lacunes lorsque le flux Edge s'interrompt. Deux sont disponibles, chacune désactivée par défaut et activée indépendamment par plateforme :

| Solution de secours | Activation avec | Couvre | URL par défaut |
|---------------------|-----------------|--------|----------------|
| **Hyperliquid** | `WS_INPUT_COINS` (ex. `BTC,ETH`) | cotations + trades | `wss://api.hyperliquid.xyz/ws` (`WS_INPUT_URL`) |
| **Phoenix** | `PHOENIX_WS_INPUT_MARKETS` (tickers, ex. `SOL,BTC`) | **trades uniquement** | `wss://perp-api.phoenix.trade/v1/ws` (`PHOENIX_WS_INPUT_URL`) |

```bash
# Activer la solution de secours Hyperliquid pour BTC et ETH :
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# Activer la solution de secours Phoenix pour les trades SOL :
PHOENIX_WS_INPUT_MARKETS=SOL DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

Pour chaque tick `(venue, symbol, source_ts)`, les sources Edge et publiques sont en compétition au sein d'un arbitre partagé. En régime permanent, la source Edge l'emporte (sub-ms vs. dizaines de ms sur internet) ; quand Edge présente des lacunes, la copie publique prend le relais. La sortie WebSocket est identique quelle que soit la source ayant livré une mise à jour donnée. (Les solutions de secours Phoenix ne couvrent que les trades — Edge reste la seule source des cotations Phoenix.)

---

## Gérer le Conteneur

```bash
# Diffuser les journaux
sudo docker logs -f doublezero-edge-connect

# Vérifier l'état du tunnel
sudo docker exec -it doublezero-edge-connect doublezero status

# Vérifier les latences des interfaces
sudo docker exec -it doublezero-edge-connect doublezero latency

# Arrêter et supprimer
sudo docker stop doublezero-edge-connect && sudo docker rm doublezero-edge-connect
```

!!! note "Pas de TLS"
    Le pont cible un réseau de confiance/local. Terminez le TLS au niveau d'un reverse proxy si vous exposez le point de terminaison WebSocket vers l'extérieur.

---

## Supervision (Métriques Prometheus)

Le point de terminaison des métriques est **désactivé par défaut**. Activez-le avec `METRICS_BIND` :

```bash
METRICS_BIND=127.0.0.1:9090 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

Puis collectez :

```bash
curl -s localhost:9090/metrics | grep '^dz_'
```

Métriques clés :

| Métrique | Ce qu'elle mesure |
|----------|-------------------|
| `dz_feed_up{venue}` | `1` tant que le multicast de cette plateforme est actif, `0` tant qu'il est silencieux. |
| `dz_datagrams_received_total{venue}` | Volume d'ingestion par plateforme. |
| `dz_emit_total{venue,kind}` | Messages diffusés après déduplication, par type. |
| `dz_quotes_admitted_total{venue,publisher}` | Cotations admises par l'arbitre, attribuées à la source gagnante. Une hausse de `publisher="public"` signifie qu'une solution de secours comble une lacune Edge (vs. `publisher="edge"` en régime permanent). |
| `dz_quotes_dropped_total{venue}` | Cotations obsolètes/dupliquées supprimées. |
| `dz_ws_clients` | Clients WebSocket actuellement connectés. |
| `dz_ws_messages_sent_total{kind}` | Messages transmis aux clients. |
| `dz_ws_client_lagged_total` | Nombre de fois qu'un client lent a été éjecté pour protéger le flux. |

Une sonde de vivacité `GET /healthz` est également servie sur la même adresse de liaison.

---

## Avancé : Auto-hébergement

Le conteneur est disponible sur GHCR :

| Environnement | Image | Tag |
|----------------|-------|-----|
| Mainnet-beta | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:mainnet-beta` |
| Testnet | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:testnet` |
| Devnet (privé) | `ghcr.io/malbeclabs/doublezero-edge-connect-devnet` | `:latest` |

Exécutez-le manuellement (requis pour les options que l'installateur ne peut pas transmettre, comme `WS_BIND=""`) :

```bash
docker run --rm --network host --cap-add NET_ADMIN --device /dev/net/tun \
  -e DZ_SECRET=DZ_… \
  -e DZ_SHRED_FORWARD=127.0.0.1:20000 \
  -e WS_BIND=0.0.0.0:8081 \
  -e METRICS_BIND=127.0.0.1:9090 \
  ghcr.io/malbeclabs/doublezero-edge-connect:mainnet-beta
```

**Compiler depuis les sources :**

```bash
git clone https://github.com/malbeclabs/doublezero-edge-connect
cd doublezero-edge-connect
cargo build --release
cargo test

./target/release/doublezero-edge-connect \
  --iface doublezero1 \
  --ws-bind 0.0.0.0:8081
```

Un tampon de réception noyau plus grand est recommandé pour les flux en rafales :

```bash
sudo sysctl -w net.core.rmem_max=268435456
```

---

## Limites et Contre-pression

| Limite | Défaut | Comportement en cas de dépassement |
|--------|--------|------------------------------------|
| Clients simultanés (`WS_MAX_CLIENTS`) | 64 | La nouvelle connexion est rejetée. |
| Abonnements par client (`WS_MAX_SUBS`) | 256 | Le `subscribe` est refusé avec une erreur. |
| Messages de contrôle entrants / client / min (`WS_MAX_INBOUND_PER_MIN`) | 600 | Le client est déconnecté. |
| Tampon de diffusion (`WS_BROADCAST_CAPACITY`) | 4096 | Un client lent **perd les messages les plus anciens** (ne bloque jamais le flux). |

Parce que chaque `quote` et `depth` est un état complet, un consommateur qui perd des messages sous contre-pression se rétablit automatiquement au message suivant — aucun handshake de resynchronisation requis.

---

## Dépannage

### Aucune shred n'arrive sur le port local

- Confirmez que votre accès est autorisé pour les groupes de shreds `edge-solana-*` onchain.
- Vérifiez que le tunnel est actif : `sudo docker exec -it doublezero-edge-connect doublezero status`
- Consultez les journaux pour les erreurs de jonction : `sudo docker logs -f doublezero-edge-connect`
- Confirmez que `DZ_SHRED_FORWARD` pointe vers une destination UDP locale accessible.

### Aucun message provenant d'une plateforme

- Vérifiez que le tunnel est actif : `sudo docker exec -it doublezero-edge-connect doublezero status`
- Consultez les journaux pour les erreurs de jonction : `sudo docker logs -f doublezero-edge-connect`
- Confirmez que votre accès est autorisé pour cette plateforme onchain.
- Restreignez l'ingestion à cette plateforme avec `DZ_FEEDS=<VenueName>` pour isoler le problème.

### Le WebSocket se connecte mais aucune cotation n'arrive

- Les messages `instrument` arrivent toujours en premier ; les cotations suivent une fois le handshake de données de référence terminé. Attendez 10–20 secondes après la connexion avant de conclure que les données sont manquantes.
- Vérifiez `dz_feed_up{venue}` dans les métriques — `0` signifie que le multicast est silencieux sur votre hôte.
- Vérifiez que les règles de pare-feu autorisent le multicast UDP sur l'interface `doublezero1`.

### Valeur élevée de `dz_ws_client_lagged_total`

Votre consommateur lit plus lentement que le pont ne publie. Aug