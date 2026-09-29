---
description: "Offres DoubleZero pour Hyperliquid : flux de données de marché Edge et peering pour les nœuds non-validateurs."
---

# Hyperliquid

*Aperçu*

Hyperliquid propose deux produits sur DoubleZero : les flux de données de marché Edge et le peering pour les nœuds non-validateurs.

| Offre | Description | Public cible | Guide |
| --- | --- | --- | --- |
| **Market Data Feeds (Edge)** | Top-of-Book et Market-by-Order en multicast UDP sur DoubleZero Edge. | Traders | [S'abonner à Hyperliquid (Edge)](/hyperliquid/edge/) |
| **Peering** | Un flux gossip Hyperliquid dédupliqué via Block Proxy (sans données de marché). | Nœuds non-validateurs | [Accès au Peering](/hyperliquid/peering/) |

## Market Data Feeds (Edge)

Les publishers reconstruisent le carnet d'ordres et envoient des messages binaires de taille fixe en multicast UDP sur DoubleZero Edge.

Les flux principaux couvrent les perps natifs Hyperliquid (`hl`) et les perps [trade.xyz](https://trade.xyz) (`xyz`) :

| Flux | Description |
|------|-------------|
| `hyper-hl-tob` | Meilleure offre/demande et transactions pour les perps Hyperliquid |
| `hyper-hl-mbo` | Carnet d'ordres complet ordre par ordre pour les perps Hyperliquid (ajouts, annulations, exécutions) |
| `hyper-xyz-tob` | Meilleure offre/demande et transactions pour les perps trade.xyz |
| `hyper-xyz-mbo` | Carnet d'ordres complet ordre par ordre pour les perps trade.xyz (ajouts, annulations, exécutions) |

- Top-of-Book et Trades : meilleure offre et demande par instrument, plus les transactions.
- Market-by-Order : chaque ordre au repos (ajout, annulation, exécution), avec snapshot intégré et récupération par delta.

Nous faisons tourner plusieurs publishers afin que les traders puissent basculer en cas de panne ou choisir le flux le plus rapide.

Comment se connecter : [S'abonner à Hyperliquid (Edge)](/hyperliquid/edge/).

## Peering

Le peering est destiné aux nœuds non-validateurs qui ont besoin du gossip Hyperliquid sans recevoir les données de marché. Vous vous connectez à un niveau Block Proxy qui fusionne deux sources gossip en amont (Hyper Foundation et sentry) en un seul flux dédupliqué, de sorte que l'une ou l'autre source peut tomber sans interrompre le flux.

Chaque proxy apparaît comme un unique pair gossip ordinaire pour vos nœuds. La capacité augmente en ajoutant des proxies ; la charge sur ces nœuds n'augmente pas avec le nombre de pairs. L'objectif de disponibilité est de 99,9 % par mois. Le service n'inclut pas les flux de données de marché Edge.

Comment se connecter : [Accès au Peering](/hyperliquid/peering/).