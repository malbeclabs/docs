---
description: "Peering Hyperliquid : gossip arbitré via Block Proxy pour les nœuds non-validateurs."
---

# Accès au peering

Le peering offre aux nœuds non-validateurs un flux gossip Hyperliquid dédupliqué et à faible latence via un Block Proxy, incluant le mempool. Il n'inclut pas les flux de données de marché Edge. Pour ceux-ci, consultez [S'abonner à Hyperliquid (Edge)](edge.md). Vue d'ensemble : [Hyperliquid](index.md).

| | |
|--|--|
| À qui c'est destiné | Les nœuds non-validateurs que vous exploitez |
| Ce que vous obtenez | Un flux gossip arbitré via Block Proxy (blocs + mempool) |
| Hôtes récepteurs | 1 IP incluse |
| Prix | 999 $/mois (pas de données de marché Edge) |
| Objectif de disponibilité | 99,9 % mensuel |

## Demander le peering

Plus d'informations sur le peering sont disponibles via [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Incluez l'IP publique statique de votre nœud (et la région). Comptez sur la réception des détails de peering sous **1 à 3 jours ouvrés** après réception des détails de votre nœud et finalisation du paiement.

## Connecter votre nœud

Une fois approuvé, nous vous envoyons votre **IP de peer**. Dirigez votre nœud non-validateur vers celle-ci, ouvrez votre pare-feu pour cette IP et redémarrez le nœud.

### 1. Configurer le gossip

Remplacez `~/override_gossip_config.json` par ceci, en utilisant votre IP de peer :

```json
{
  "root_node_ips": [{"Ip": "<PEER_IP>"}],
  "try_new_peers": false,
  "split_client_blocks": true,
  "chain": "Mainnet"
}
```

| Paramètre | Pourquoi |
|--|--|
| `root_node_ips` | Votre peer DoubleZero est votre seul upstream. |
| `try_new_peers: false` | Maintient le nœud sur le peer DoubleZero. Il ne basculera pas vers les peers publics. |
| `split_client_blocks: true` | Diffuse les transactions du mempool vers `~/hl/data/mempool_txs/`. |

### 2. Ouvrir votre pare-feu au peer

Autorisez les **connexions entrantes TCP et UDP 4001–4002 depuis `<PEER_IP>`**. Faites-le dans votre groupe de sécurité cloud et sur le pare-feu de l'hôte.

Lorsque votre nœud se connecte, le peer se reconnecte à votre nœud sur les ports 4001 et 4002 pour vérifier qu'il est joignable. Si cette vérification est bloquée, la connexion s'ouvre mais aucune donnée n'arrive. Autorisez également les connexions sortantes vers le peer sur les ports 4001–4002.

### 3. Redémarrer le nœud

```bash
sudo systemctl restart hl-node   # or however you run hl-visor
```

Le nœud lit ce fichier au démarrage. Les modifications effectuées pendant son exécution peuvent ne pas prendre pleinement effet, donc redémarrez après chaque changement. Le rattrapage prend généralement 5 à 15 minutes.

### 4. Vérifier que ça fonctionne

```bash
ss -tn state established '( dport = :4001 )'     # one connection, to <PEER_IP>
journalctl -u hl-node -f | grep 'applied block'  # blocks are being applied
ls -l ~/hl/data/mempool_txs/                     # mempool files are growing
```

!!! warning "Connecté mais aucune donnée"
    Le peer ne peut pas joindre votre nœud sur les ports 4001–4002. Vérifiez les règles entrantes de l'étape 2.

!!! note "Pas de repli vers les peers publics"
    Avec `try_new_peers: false`, votre nœud attend le peer DoubleZero s'il est injoignable. Il ne bascule pas vers les peers publics. Contactez-nous si vous voyez des messages répétés `Peer full` ou des délais d'expiration de connexion.

## Pourquoi le peering payant

Les peers racine publics d'Hyperliquid sont partagés : les créneaux sont disputés, les peers tournent ou limitent le débit, et beaucoup ne relaient pas le mempool. Un créneau de peering réservé vous offre un upstream stable sur DoubleZero au lieu de concourir pour cette capacité publique.

## Comment ça fonctionne

- Deux sources de gossip : un flux A provenant du nœud non-validateur de Hyper Foundation, et un flux B provenant d'une sentinelle.
- Les clients se connectent à un niveau de Block Proxy qui évolue horizontalement. Chaque proxy se connecte aux deux nœuds non-validateurs et apparaît comme un seul peer gossip ordinaire pour chacun d'eux.
- Le proxy arbitre les flux A et B en un seul flux gossip dédupliqué pour ses peers, de sorte que l'une ou l'autre source peut tomber sans interrompre le flux.
- Ajoutez des proxies pour augmenter la capacité. La charge sur nos nœuds non-validateurs ne croît pas avec le nombre de peers.

<pre class="ascii-diagram"><code>  ┌─────────────────────┐                    ┌─────────────────────┐
  │     Foundation      │                    │       Sentry        │
  │ Non-Validating Node │                    │                     │
  └──────────┬──────────┘                    └──────────┬──────────┘
             │                                          │
┈┈┈┈┈┈┈┈┈┈┈┈┈│┈┈┈┈┈┈┈┈┈┈ DOUBLEZERO INFRA ┈┈┈┈┈┈┈┈┈┈┈┈┈┈│┈┈┈┈┈┈┈┈┈┈┈┈
             ▼                                          ▼
  ┌─────────────────────┐                    ┌─────────────────────┐
  │       Primary       │                    │      Secondary      │
  │ Non-Validating Node │                    │ Non-Validating Node │
  └──────────┬──────────┘                    └──────────┬──────────┘
             │                                          │
             │   A feed                        B feed   │
             └──────────────┐              ┌────────────┘
                            ▼              ▼
                    ┌────────────────────────┐         ┌──────────────────┐
                    │      Block Proxy       │◀╌╌╌╌╌╌╌╌│ Snapshot Service │
                    │  (arbitrates A and B)  │         │   (on demand)    │
                    └───────────┬────────────┘         └──────────────────┘
                                │
                                │  one deduplicated gossip feed
                                ▼
                          ┌───────────┐
                          │   Peers   │
                          └───────────┘</code></pre>

Le nœud Hyper Foundation se connecte à notre primaire ; une sentinelle alimente notre secondaire. Chaque Block Proxy se connecte aux deux, fusionne leurs flux pour ses clients, et récupère des snapshots de démarrage depuis le service de snapshots si nécessaire.

## Disponibilité

Objectif : 99,9 % de disponibilité mensuelle.

- Flux redondant. Chaque proxy se connecte aux deux nœuds non-validateurs. Ces nœuds reçoivent les blocs de sources indépendantes (Foundation et sentinelle). Si une session ou une source tombe, l'autre maintient le flux de blocs pendant que le chemin défaillant se rétablit.
- Nos nœuds restent derrière le niveau de proxy. Les peers externes n'atteignent que les Block Proxies. Si un proxy tombe, ses peers se reconnectent à un autre proxy sain. La charge ne retombe jamais sur nos nœuds.
- Les proxies ne détiennent que des caches éphémères (snapshot, fenêtre glissante de blocs, tampons en direct), pas l'état autoritaire de la chaîne. Un proxy défaillant est remplacé automatiquement. Un remplacement n'entre en service qu'après que les sessions upstream et les caches ont passé les vérifications de disponibilité. Nos nœuds non-validateurs ne sont pas redémarrés pour cela.

## Mise à l'échelle automatique

- Montez en charge en ajoutant un proxy. Chaque proxy dessert de nombreux peers mais ne compte que comme un seul peer sur chacun de nos nœuds non-validateurs.
- La charge des nœuds dépend du nombre de proxies, pas du nombre de peers.
- Un nouveau proxy démarre une fois les caches préchauffés et les vérifications de disponibilité passées. Il n'a pas besoin d'une resynchronisation complète de la chaîne.
- Un peer qui rejoint prend son snapshot de démarrage depuis le service de snapshots et les blocs de rattrapage depuis le stockage propre du proxy, jamais depuis nos nœuds non-validateurs. Un afflux de nouveaux peers impacte le niveau de proxy uniquement.

## Tarification

999 $/mois pour le peering. Inclut le mempool. N'inclut pas les flux de données de marché Edge. Un hôte récepteur (IP) est inclus. Le peering n'est pas groupé ni remisé avec les données de marché Edge.