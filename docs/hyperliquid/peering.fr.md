---
description: "Peering Hyperliquid : gossip arbitré via Block Proxy pour les nœuds non-validateurs."
---

# Accès au peering

Le peering offre aux nœuds non-validateurs un flux de gossip Hyperliquid dédupliqué et à faible latence via un Block Proxy, incluant le mempool. Il n'inclut pas les flux de données de marché Edge. Pour ceux-ci, consultez [S'abonner à Hyperliquid (Edge)](/hyperliquid/edge/). Vue d'ensemble : [Hyperliquid](/hyperliquid/).

| | |
|--|--|
| À qui c'est destiné | Les nœuds non-validateurs que vous exploitez |
| Ce que vous obtenez | Un flux de gossip arbitré via Block Proxy (blocs + mempool) |
| Hôtes de réception | 1 IP incluse |
| Prix | 999 $/mois (pas de données de marché Edge) |
| Objectif de disponibilité | 99,9 % mensuel |

## Demander le peering

Plus d'informations sur le peering sont disponibles via [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Incluez l'IP publique statique de votre nœud (et la région). Comptez sur la réception des détails de peering sous **1 à 3 jours ouvrés** après que nous ayons les informations de votre nœud et que le paiement soit effectué.

## Pourquoi le peering est payant

Les pairs racine publics Hyperliquid sont partagés : les emplacements sont disputés, les pairs changent ou appliquent des limites de débit, et beaucoup ne retransmettent pas le mempool. Un emplacement de peering réservé vous offre un upstream stable sur DoubleZero au lieu de rivaliser pour cette capacité publique.

## Comment ça fonctionne

- Deux sources de gossip : un flux A provenant du nœud non-validateur de Hyper Foundation, et un flux B provenant d'un sentry.
- Les clients se connectent en peering avec un niveau Block Proxy qui s'adapte horizontalement. Chaque proxy se connecte en peering avec nos deux nœuds non-validateurs et apparaît comme un pair de gossip ordinaire pour chacun d'eux.
- Le proxy arbitre les flux A et B en un seul flux de gossip dédupliqué pour ses pairs, de sorte que l'une ou l'autre source peut tomber sans interrompre le flux.
- Ajoutez des proxies pour ajouter de la capacité. La charge sur nos nœuds non-validateurs n'augmente pas avec le nombre de pairs.

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

Le nœud Hyper Foundation se connecte en peering avec notre nœud primaire ; un sentry alimente notre nœud secondaire. Chaque Block Proxy se connecte en peering avec les deux, fusionne leurs flux pour ses clients, et récupère les snapshots d'amorçage depuis le service de snapshots en cas de besoin.

## Disponibilité

Objectif : 99,9 % de disponibilité mensuelle.

- Flux redondant. Chaque proxy se connecte en peering avec nos deux nœuds non-validateurs. Ces nœuds reçoivent les blocs de sources indépendantes (Foundation et sentry). Si une session ou une source tombe, l'autre maintient le flux de blocs pendant que le chemin en échec se rétablit.
- Nos nœuds restent derrière le niveau proxy. Les pairs externes n'atteignent que les Block Proxies. Si un proxy tombe en panne, ses pairs se reconnectent à un autre proxy sain. La charge ne retombe jamais sur nos nœuds.
- Les proxies ne conservent que des caches éphémères (snapshot, fenêtre glissante de blocs, tampons en direct), pas l'état autoritaire de la chaîne. Un proxy défaillant est remplacé automatiquement. Un remplacement n'entre en service qu'après que les sessions upstream et les caches ont passé les vérifications de disponibilité. Nos nœuds non-validateurs ne sont pas redémarrés pour cela.

## Mise à l'échelle automatique

- Montez en charge en ajoutant un proxy. Chaque proxy dessert de nombreux pairs mais ne compte que comme un seul pair sur chacun de nos nœuds non-validateurs.
- La charge des nœuds suit le nombre de proxies, pas le nombre de pairs.
- Un nouveau proxy démarre une fois que les caches sont remplis et que les vérifications de disponibilité sont validées. Il n'a pas besoin d'une resynchronisation complète de la chaîne.
- Un pair rejoignant prend son snapshot d'amorçage depuis le service de snapshots et les blocs de rattrapage depuis le propre stockage du proxy, jamais depuis nos nœuds non-validateurs. Un afflux de nouveaux pairs impacte le niveau proxy à la place.

## Tarification

999 $/mois pour le peering. Inclut le mempool. N'inclut pas les flux de données de marché Edge. Un hôte de réception (IP) est inclus. Le peering n'est ni groupé ni remisé avec les données de marché Edge.