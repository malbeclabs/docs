---
description: Exécutez doublezero-edge-connect pour retransmettre les shreds Solana vers un port UDP local et consommer les données de marché normalisées Edge via un WebSocket local.
---

# Connexion Edge

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol). Les données sont destinées à votre usage interne uniquement et ne peuvent pas être retransmises (voir Section 2(e))."

`doublezero-edge-connect` est un pont qui rejoint le **multicast binaire DoubleZero Edge** et le redistribue localement sous forme de deux flux :

1. **Retransmission de shreds Solana** — shreds dédupliqués (avec vérification optionnelle de signature) distribués vers une ou plusieurs destinations UDP locales, prêts pour votre validateur ou RPC.
2. **Données de marché normalisées** — flux des venues Edge décodés, avec correction de précision, et redistribués sous forme d'un WebSocket JSON unique sur `ws://host:8081`.

Les deux fonctionnent depuis le même conteneur et la même installation en une seule ligne. Activez les flux que votre autorisation onchain vous accorde.

```
                                        ┌─ UDP datagrams ──▶  validateur / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binaire)            (dedup · décodage · normalisation)  └─ WebSocket (JSON) ──▶  moteur de trading
                                                          ws://host:8081
```

---

## Prérequis

- Hôte **Linux/amd64** avec une adresse IPv4 publique autorisée onchain pour l'environnement cible.
- **Docker** (l'installation en une ligne l'installe s'il est absent).
- **Connectivité GRE** — autorisez le protocole IP 47 chez votre fournisseur cloud ; sur AWS, désactivez la vérification source/dest de l'ENI.
- Un **secret d'accès DoubleZero** : un jeton base64 préfixé `DZ_` ou un chemin vers un fichier keypair, obtenu lors du processus d'[onboarding DoubleZero](setup.md).

---

## Étape 1 : Installation et exécution

Une seule commande prépare l'hôte et démarre le conteneur pont. Il rejoint le réseau DoubleZero et démarre chaque flux que votre autorisation accorde — retransmission de shreds et/ou WebSocket de données de marché sur `:8081` :

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

1. Vérifie que l'hôte est Linux/amd64, s'assure que Docker est présent (propose de l'installer).
2. Prépare le noyau de l'hôte pour le tunnel GRE : charge `tun`/`ip_gre`, augmente `net.core.rmem_max`, avertit concernant les règles de pare-feu et du fournisseur cloud.
3. Charge votre secret d'accès (demandé une fois si `DZ_SECRET` n'est pas défini).
4. Lance le conteneur pont (`--network host`, `NET_ADMIN`/`NET_RAW`, `/dev/net/tun`) et exécute `doublezero connect multicast`.

!!! tip "Installation non interactive"
    Définissez `DZ_SECRET=DZ_…` avant le pipe pour une exécution entièrement automatique — aucune invite.

---

## Étape 2 : Configuration

Toute la configuration se fait via des **variables d'environnement définies avant le pipe**. Il n'y a pas de fichier de configuration.

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### Variables de l'installateur

| Variable | Défaut | Objectif |
|----------|--------|----------|
| `DZ_SECRET` | *(demandé)* | Jeton base64 préfixé `DZ_` **ou** chemin vers un fichier keypair. Un jeton est injecté dans le conteneur et n'est jamais écrit sur le disque ; un fichier est monté en bind en lecture seule. |
| `DZ_ENV` | selon le script | `mainnet-beta` \| `testnet` \| `devnet`. |
| `DZ_IMAGE` | selon le script | Remplacer l'image du conteneur. |
| `DZ_NAME` | `doublezero-edge-connect` | Nom du conteneur. |
| `DZ_FEEDS` | *(tous)* | Venues séparées par des virgules pour restreindre l'ingestion de données de marché (ex. `VenueA,VenueB`). N'affecte pas la retransmission de shreds Solana. |
| `DZ_ASSUME_YES` | `0` | Ignorer les invites de confirmation (ex. l'invite d'installation de Docker). |
| `DZ_GHCR_TOKEN` | — | **Devnet uniquement** — un jeton GHCR avec `read:packages` (l'image devnet est privée). |
| `DZ_GHCR_USER` | `malbeclabs` | **Devnet uniquement** — nom d'utilisateur GHCR pour la connexion. |

### Variables du pont

L'installateur transmet directement **toute variable de pont non vide** au conteneur. Les plus courantes :

| Variable | Défaut | Objectif |
|----------|--------|----------|
| `DZ_IFACE` | `doublezero1` | Interface réseau d'écoute. |
| `DZ_RECV_BUF` | — | Remplacement du tampon de réception UDP (octets). |
| `METRICS_BIND` | *(vide / désactivé)* | Activer le endpoint Prometheus `/metrics` (ex. `127.0.0.1:9090`). |
| `RUST_LOG` | `info` | Niveau de log (`debug`, `warn`, etc.). |
| `DZ_SHRED_FORWARD` | — | Destination(s) UDP locale(s) pour les shreds retransmis — voir [Retransmission de shreds Solana](#retransmission-de-shreds-solana). |
| `WS_BIND` | `0.0.0.0:8081` | Adresse de liaison du WebSocket de données de marché — voir [WebSocket de données de marché](#websocket-de-donnees-de-marche). |
| `WS_MAX_CLIENTS` | `64` | Nombre maximum de clients WebSocket simultanés. |
| `WS_INPUT_COINS` | *(vide / désactivé)* | Activer le WebSocket public de secours pour les symboles listés (ex. `BTC,ETH`). |

**Exemples :**

```bash
# Retransmettre les shreds vers un validateur/RPC local :
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# Non interactif, testnet :
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# Restreindre les données de marché à des venues spécifiques, logs verbeux, port WS non standard :
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# Activer les métriques et un WS public de secours :
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    Parce que l'installateur ne transmet que les valeurs **non vides**, vous ne pouvez pas passer un remplacement vide (ex. `WS_BIND=""` pour désactiver le sink WebSocket) via la commande en une ligne. Utilisez un `docker run` écrit manuellement pour cela — voir [Auto-hébergement](#avance-auto-hebergement).

---

## Retransmission de shreds Solana

Le pont rejoint les groupes multicast de shreds `edge-solana-*` et distribue chaque datagramme vers une ou plusieurs destinations UDP locales — alimentant votre validateur ou RPC directement depuis le réseau Edge. Il s'active automatiquement à la découverte lorsque ces groupes sont présents dans votre autorisation.

```bash
# Par défaut (dédup uniquement, retransmission vers le port local 20000) :
DZ_SHRED_FORWARD=127.0.0.1:20000 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# Avec vérification de signature :
DZ_SHRED_DEDUP_MODE=sigverify \
  DZ_SHRED_RPC_URL=https://api.mainnet-beta.solana.com \
  DZ_SHRED_FORWARD=127.0.0.1:20000 \
  DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

| Variable | Défaut | Objectif |
|----------|--------|----------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | Destination(s) pour les shreds retransmis (répétable). |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup` (une copie par shred), `sigverify` (+ vérification ed25519), `none` (tous les datagrammes). |
| `DZ_SHRED_RPC_URL` | — | Endpoint RPC Solana ; requis par le mode `sigverify`. |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | Taille de la fenêtre de déduplication. |

Voir [Retransmission de shreds](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md) pour le pipeline complet et les mises en garde.

---

## WebSocket de données de marché

Ouvrez un WebSocket vers `ws://<host>:8081` et lisez les trames JSON. Vous recevez toutes les venues pour lesquelles vous êtes autorisé. Un message `subscribe` optionnel permet de restreindre le flux à des venues et symboles spécifiques.

Tout moteur compatible WebSocket + JSON peut le consommer avec un adaptateur léger (~50–100 lignes). Le multicast binaire, la séparation deux-ports par venue, et le handshake manifeste/précision restent tous à l'intérieur du pont ; le seul contrat contre lequel un consommateur doit coder est le WebSocket JSON.

### Cycle de vie de la connexion

À chaque nouvelle connexion, le pont :

1. **Rejoue les définitions d'instruments actuelles** — un message `instrument` par symbole connu — afin que le consommateur dispose de la précision avant la première cotation.
2. **Rejoue le dernier snapshot de profondeur** par symbole (si le flux Market-by-Order est actif).
3. **Diffuse** les messages `quote` / `trade` / `midpoint` / `depth` au fur et à mesure de leur arrivée, distribués à tous les consommateurs connectés.

```
connexion → instrument (×N) → depth (×M, derniers carnets) → quote → trade → depth → …
```

### Types de messages

Chaque message est un objet JSON identifié par un champ `type` :

| `type` | Signification |
|--------|---------------|
| `instrument` | Définition d'instrument/précision. |
| `quote` | Mise à jour du meilleur achat/vente (état complet). |
| `trade` | Impression de transaction (dernière vente). |
| `midpoint` | Prix milieu dérivé. |
| `depth` | Snapshot complet de la profondeur du carnet d'ordres. |
| `status` | Transition de santé du flux au niveau de la venue. |

Les consommateurs **doivent ignorer les valeurs `type` inconnues et les champs inconnus** (compatibilité ascendante).

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

Envoyé à la connexion et à chaque modification des définitions. `price_exponent` et `qty_exponent` donnent le pas de cotation et le pas de taille de la venue sous forme de puissances de dix.

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
  carnet venue    arrivée fil      post-décodage    transfert WS
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

`aggressor_side` est `"buy"`, `"sell"`, ou `"unknown"`. Les transactions sont des événements ponctuels et ne sont pas rejouées à la reconnexion.

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

Les `bids` sont triés du prix le plus élevé au plus bas ; les `asks` sont triés du prix le plus bas au plus élevé. Chaque `depth` est un **snapshot complet** — remplacez, ne fusionnez pas.

#### `status`

```json
{"type":"status","venue":"ExampleVenue","state":"down","stale_ms":30000,"ts_ns":...}
```

Émis en périphérie lorsque le multicast de cotations d'une venue devient silencieux (`state:"down"`) ou récupère (`state:"ok"`). Utilisez-le pour griser une venue dans votre interface. La livraison des cotations n'est pas conditionnée par le statut — le flux se corrige automatiquement à la prochaine cotation.

### Abonnements

Par défaut, vous recevez tout. Envoyez un message de contrôle pour restreindre le flux :

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Omettre un champ correspond à toute valeur (`{"symbol":"SOL"}` = SOL sur chaque venue). `venue` est comparé sans tenir compte de la casse.

**Accusé de réception du serveur :**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Les erreurs retournent `{"channel":"error","error":"<reason>"}`.

### Heartbeat et vivacité

- Le serveur envoie un **Ping WebSocket** toutes les 20 secondes ; les clients conformes répondent automatiquement par un Pong.
- Les clients silencieux pendant 60 secondes sont fermés et supprimés.
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

### Sources d'entrée et WebSocket de secours

Le flux multicast Edge est toujours actif. Un **WebSocket public de secours** optionnel peut combler les lacunes lorsque le flux Edge cale :

```bash
# Activer le secours pour BTC et ETH :
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

Les deux sources sont en concurrence par tick `(venue, symbol, source_ts)` au sein d'un arbitre partagé. En régime permanent, la source Edge gagne (sub-ms contre des dizaines de ms via internet) ; lorsque l'Edge a des lacunes, la copie publique prend le relais. La sortie WebSocket est identique quel que soit la source ayant livré une mise à jour donnée.

---

## Gestion du conteneur

```bash
# Diffuser les logs
sudo docker logs -f doublezero-edge-connect

# Vérifier le statut du tunnel
sudo docker exec -it doublezero-edge-connect doublezero status

# Vérifier les latences des appareils
sudo docker exec -it doublezero-edge-connect doublezero latency

# Arrêter et supprimer
sudo docker stop doublezero-edge-connect && sudo docker rm doublezero-edge-connect
```

!!! note "Pas de TLS"
    Le pont cible un réseau de confiance/local. Terminez le TLS au niveau d'un reverse proxy si vous exposez le endpoint WebSocket à l'extérieur.

---

## Surveillance (Métriques Prometheus)

Le endpoint de métriques est **désactivé par défaut**. Activez-le avec `METRICS_BIND` :

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
| `dz_feed_up{venue}` | `1` tant que le multicast de cette venue est actif, `0` lorsqu'il est silencieux. |
| `dz_datagrams_received_total{venue}` | Volume d'ingestion par venue. |
| `dz_emit_total{venue,kind}` | Messages diffusés après déduplication, par type. |
| `dz_quotes_dropped_total{venue}` | Cotations obsolètes/dupliquées supprimées. |
| `dz_ws_clients` | Clients WebSocket actuellement connectés. |
| `dz_ws_messages_sent_total{kind}` | Messages transférés aux clients. |
| `dz_ws_client_lagged_total` | Nombre de fois qu'un client lent a été éjecté pour protéger le flux. |

Une sonde de vivacité `GET /healthz` est également servie sur la même adresse de liaison.

---

## Avancé : Auto-hébergement

Le conteneur est disponible sur GHCR :

| Environnement | Image | Tag |
|---------------|-------|-----|
| Mainnet-beta | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:mainnet-beta` |
| Testnet | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:testnet` |
| Devnet (privé) | `ghcr.io/malbeclabs/doublezero-edge-connect-devnet` | `:latest` |

Lancez-le manuellement (nécessaire pour les options que l'installateur ne peut pas transmettre, comme `WS_BIND=""`) :

```bash
docker run --rm --network host --cap-add NET_ADMIN --device /dev/net/tun \
  -e DZ_SECRET=DZ_… \
  -e DZ_SHRED_FORWARD=127.0.0.1:20000 \
  -e WS_BIND=0.0.0.0:8081 \
  -e METRICS_BIND=127.0.0.1:9090 \
  ghcr.io/malbeclabs/doublezero-edge-connect:mainnet-beta
```

**Compilation depuis les sources :**

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

## Limites et contre-pression

| Limite | Défaut | Comportement en cas de dépassement |
|--------|--------|------------------------------------|
| Clients simultanés (`WS_MAX_CLIENTS`) | 64 | La nouvelle connexion est refusée. |
| Abonnements par client (`WS_MAX_SUBS`) | 256 | Le `subscribe` est refusé avec une erreur. |
| Messages de contrôle entrants / client / min (`WS_MAX_INBOUND_PER_MIN`) | 600 | Le client est déconnecté. |
| Tampon de diffusion (`WS_BROADCAST_CAPACITY`) | 4096 | Un client lent **perd les messages les plus anciens** (ne bloque jamais le flux). |

Parce que chaque `quote` et `depth` est un état complet, un consommateur qui perd des messages sous contre-pression se corrige automatiquement au prochain message — aucun handshake de resynchronisation requis.

---

## Dépannage

### Aucun shred n'arrive au port local

- Confirmez que votre accès est autorisé pour les groupes de shreds `edge-solana-*` onchain.
- Vérifiez que le tunnel est actif : `sudo docker exec -it doublezero-edge-connect doublezero status`
- Vérifiez les erreurs de jointure dans les logs : `sudo docker logs -f doublezero-edge-connect`
- Confirmez que `DZ_SHRED_FORWARD` pointe vers une destination UDP locale accessible.

### Aucun message d'une venue

- Vérifiez que le tunnel est actif : `sudo docker exec -it doublezero-edge-connect doublezero status`
- Vérifiez les erreurs de jointure dans les logs : `sudo docker logs -f doublezero-edge-connect`
- Confirmez que votre accès est autorisé pour cette venue onchain.
- Restreignez l'ingestion à cette venue avec `DZ_FEEDS=<VenueName>` pour isoler le problème.

### Le WebSocket se connecte mais aucune cotation n'arrive

- Les messages `instrument` arrivent toujours en premier ; les cotations suivent une fois le handshake de données de référence terminé. Attendez 10–20 secondes après la connexion avant de conclure que les données sont manquantes.
- Vérifiez `dz_feed_up{venue}` dans les métriques — `0` signifie que le multicast est silencieux sur votre hôte.
- Vérifiez que les règles de pare-feu autorisent le multicast UDP sur l'interface `doublezero1`.

### `dz_ws_client_lagged_total` élevé

Votre consommateur lit plus lentement que le pont ne publie. Augmentez le tampon de diffusion avec `WS_BROADCAST_CAPACITY`, réduisez le temps de traitement par message, ou ajoutez un thread de lecture dédié.

### Le conteneur se ferme immédiatement

- Le pont nécessite `--network host` et le périphérique `/dev/net/tun` ; un simple `docker run` sans ces flags échouera.
- Utilisez la commande d'installation en une ligne ou la commande `docker run` exacte indiquée dans [Auto-hébergement](#avance-auto-hebergement).

### Le tunnel GRE ne s'établit pas

Consultez [Dépannage](troubleshooting.md) et assurez-vous que le protocole IP 47 est autorisé chez votre fournisseur cloud. Sur AWS, désactivez la vérification source/dest de l'ENI pour l'hôte.