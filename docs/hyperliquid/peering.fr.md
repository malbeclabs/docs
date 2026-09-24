---
description: "Peering Hyperliquid : gossip arbitré via Block Proxy pour les nœuds non-validateurs."
---

# Accès au Peering

Le peering offre aux nœuds non-validateurs un flux de gossip Hyperliquid dédupliqué et à faible latence via un Block Proxy, incluant le mempool. Il n'inclut pas les flux de données de marché Edge. Pour ceux-ci, consultez [S'abonner à Hyperliquid (Edge)](edge.md). Vue d'ensemble : [Hyperliquid](index.md).

| | |
|--|--|
| À qui c'est destiné | Les nœuds non-validateurs que vous exploitez |
| Ce que vous obtenez | Un flux de gossip arbitré via Block Proxy (blocs + mempool) |
| Hôtes récepteurs | 1 IP incluse |
| Prix | 999 $/mois (pas de données de marché Edge) |
| Objectif de disponibilité | 99,9 % mensuel |

## Demander le peering

Plus d'informations sur le peering sont disponibles via [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Incluez l'IP publique statique de votre nœud (et la région). Comptez sur la réception des détails de peering sous **1 à 3 jours ouvrés** après réception des détails de votre nœud et finalisation du paiement.

## Pourquoi le peering est payant

Les pairs racines publics d'Hyperliquid sont partagés : les emplacements sont disputés, les pairs changent ou limitent le débit, et beaucoup ne relaient pas le mempool. Un emplacement de peering réservé vous offre un flux amont stable sur DoubleZero au lieu de rivaliser pour cette capacité publique.

## Comment ça fonctionne

- Deux sources de gossip : un flux A provenant du nœud non-validateur de la Hyper Foundation, et un flux B provenant d'une sentinelle.
- Les clients se connectent à un niveau de Block Proxy qui évolue horizontalement. Chaque proxy se connecte à nos deux nœuds non-validateurs et apparaît comme un pair de gossip ordinaire pour chacun d'entre eux.
- Le proxy arbitre les flux A et B en un seul flux de gossip dédupliqué pour ses pairs, de sorte que l'une ou l'autre source peut tomber sans interrompre le flux.
- Ajoutez des proxies pour augmenter la capacité. La charge sur nos nœuds non-validateurs ne croît pas avec le nombre de pairs.

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

Le nœud de la Hyper Foundation se connecte à notre nœud primaire ; une sentinelle alimente notre nœud secondaire. Chaque Block Proxy se connecte aux deux, fusionne leurs flux pour ses clients, et récupère des snapshots de démarrage depuis le service de snapshots lorsque nécessaire.

## Disponibilité

Objectif : 99,9 % de disponibilité mensuelle.

- Flux redondant. Chaque proxy se connecte à nos deux nœuds non-validateurs. Ces nœuds reçoivent les blocs de sources indépendantes (Foundation et sentinelle). Si une session ou une source tombe, l'autre maintient le flux de blocs pendant que le chemin défaillant se rétablit.
- Nos nœuds restent derrière le niveau de proxies. Les pairs externes n'atteignent que les Block Proxies. Si un proxy tombe en panne, ses pairs se reconnectent à un autre proxy sain. La charge ne retombe jamais sur nos nœuds.
- Les proxies ne conservent que des caches jetables (snapshot, fenêtre glissante de blocs, tampons en direct), pas l'état autoritatif de la chaîne. Un proxy défaillant est remplacé automatiquement. Un remplacement n'entre en service qu'après que les sessions amont et les caches ont passé les vérifications de disponibilité. Nos nœuds non-validateurs ne sont pas redémarrés pour cela.

## Mise à l'échelle automatique

- Montez en charge en ajoutant un proxy. Chaque proxy dessert de nombreux pairs mais ne compte que comme un seul pair sur chacun de nos nœuds non-validateurs.
- La charge des nœuds suit le nombre de proxies, pas le nombre de pairs.
- Un nouveau proxy démarre une fois que les caches sont chauds et que les vérifications de disponibilité sont passées. Il n'a pas besoin d'une resynchronisation complète de la chaîne.
- Un pair rejoignant le réseau récupère son snapshot de démarrage depuis le service de snapshots et les blocs de rattrapage depuis le stockage propre du proxy, jamais depuis nos nœuds non-validateurs. Un afflux de nouveaux pairs impacte le niveau de proxies à la place.

## Tarification

999 $/mois pour le peering. Mempool inclus. N'inclut pas les flux de données de marché Edge. Un hôte récepteur (IP) est inclus. Le peering n'est ni regroupé ni remisé avec les données de marché Edge.