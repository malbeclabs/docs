---
description: "S'abonner aux données de marché Hyperliquid sur DoubleZero Edge — configuration, métro, demande de flux et connexion après approbation."
---

# S'abonner à Hyperliquid (Edge)

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol). Veuillez noter que les données sont destinées à votre usage interne uniquement et ne peuvent pas être retransmises (voir Section 2(e))."

Les flux Hyperliquid diffusent des données de marché via DoubleZero Edge en multicast UDP. Quatre flux principaux couvrent les perps natifs Hyperliquid (`hl`) et les perps [trade.xyz](https://trade.xyz) (`xyz`) :

| Flux | Description |
|------|-------------|
| `hyper-hl-tob` | Meilleure offre/demande et impressions de transactions pour les perps Hyperliquid |
| `hyper-hl-mbo` | Carnet d'ordres complet ordre par ordre pour les perps Hyperliquid (ajouts, annulations, exécutions) |
| `hyper-xyz-tob` | Meilleure offre/demande et impressions de transactions pour les perps trade.xyz |
| `hyper-xyz-mbo` | Carnet d'ordres complet ordre par ordre pour les perps trade.xyz (ajouts, annulations, exécutions) |

Aperçu du service : [Hyperliquid](index.md).

## Quel chemin dois-je prendre ?

| Mode | Ce que vous obtenez | Quand l'utiliser |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — décodage + WebSocket JSON normalisé | Le plus rapide pour obtenir un flux de cotations utilisable |
| **Multicast natif** | S'abonner sur `doublezero1`, décoder le binaire UDP vous-même (ou avec les parseurs de référence) | Contrôle total du fil |

Étapes communes d'abord : pare-feu, métro, candidature et paiement (Étapes 1–3). Après approbation, l'[Étape 4](#step-4-connect-after-approval) se divise — **Edge Connect** ou **natif**. Ne les mélangez pas sur le même hôte.

Vous souhaitez qu'une IA fasse l'installation avec vous ? Connectez le [DoubleZero MCP](../mcp.md) et demandez-lui de vous guider à travers Hyperliquid Edge.

---

## Étape 1 : Configuration de DoubleZero

**Configuration complète**


Suivez les instructions de [configuration](../setup.md) pour installer et configurer le client DoubleZero sur l'hôte.

Si vous avez précédemment configuré DoubleZero sur l'hôte pour une utilisation native, assurez-vous que le client est à jour :

```bash
sudo apt update && sudo apt install doublezero
```

**Configurer le pare-feu**


Autorisez le trafic GRE, BGP, PIM et le trafic des flux Hyperliquid sur `doublezero1`. Les ports UDP Hyperliquid se situent dans la plage `20000`–`20999` (Top-of-Book et Market-by-Order, référence et snapshot). Autorisez également le port UDP `5765` pour les heartbeats DoubleZero sur le tunnel. Ouvrez la bande de flux pour que les nouveaux flux ne nécessitent pas une autre modification du pare-feu. Voir [Adresses des flux](#feed-addresses).

**iptables :**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid market / reference / snapshot (tous les flux)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 20000:20999 -j ACCEPT
# Heartbeats DoubleZero
sudo iptables -A INPUT -i doublezero1 -p udp --dport 5765 -j ACCEPT
```

**UFW :**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Hyperliquid market / reference / snapshot (tous les flux)
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# Heartbeats DoubleZero
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

Vous pouvez restreindre ces règles aux seuls ports des flux auxquels vous êtes abonné (voir [Adresses des flux](#feed-addresses)).

---

## Étape 2 : Choisir un métro

Identifiez l'emplacement à la latence la plus faible depuis la machine qui recevra le flux :

```bash
doublezero latency
```

Notez le métro / la ville du résultat avec la latence la plus faible. Vous sélectionnerez cette ville dans le formulaire de candidature. Consultez la [carte de topologie](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) pour voir comment les métros sont regroupés.

**Tarification**


Les flux sont tarifés par région de livraison. Le prix dépend de l'endroit où les données sont livrées, pas de l'endroit où se trouve l'acheteur. Un forfait Tokyo livre aux récepteurs de Tokyo ; la livraison ailleurs nécessite le forfait Global. Deux hôtes récepteurs (IP) sont inclus par flux, par métro.

| Flux | Tokyo /mois | Global /mois |
| --- | --- | --- |
| Hyperliquid perps Top-of-Book (L1) | 900 $ | 1 500 $ |
| Hyperliquid perps Market-by-Order (L4) | 3 000 $ | 5 000 $ |
| trade.xyz perps Top-of-Book (L1) | 900 $ | 1 500 $ |
| trade.xyz perps Market-by-Order (L4) | 3 000 $ | 5 000 $ |
| **Tous les flux (ensemble ~30 % de réduction)** | **5 500 $** | **9 000 $** |

---

## Étape 3 : Soumettre la demande

1. Rendez-vous sur [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Sélectionnez **Hyperliquid** et les flux dont vous avez besoin.
3. Sélectionnez la **ville** (métro) dont vous avez besoin. Utilisez le tableau ci-dessus et `doublezero latency` pour choisir.
4. Complétez le formulaire de candidature.

Vous assignerez un DoubleZero ID (clé existante ou en générer une nouvelle) à chaque demande de flux sur la page [accounts](https://doublezero.xyz/shreds/account). La **clé privée correspondante doit être présente sur la machine qui recevra le flux** — n'assignez pas une clé publique dont vous ne pouvez pas transférer la clé privée sur cet hôte.

Vous choisissez un **métro** et une **clé publique**. Vous ne liez **pas** une IP publique au moment de la candidature. Pendant l'abonnement, vous pouvez déplacer l'accès entre les IP **au sein des métros choisis**.

Vous serez contacté avec des instructions supplémentaires dans les meilleurs délais (prévoyez **1 à 3 jours ouvrables**).

---

## Étape 4 : Se connecter après approbation

Après avoir soumis la candidature, vous recevrez une facture ; une fois celle-ci payée, connectez-vous sur chaque machine approuvée. L'accès est activé à la date de début choisie. Choisissez **un seul** chemin ci-dessous.

### 4a. Edge Connect

Si `doublezerod` est déjà en cours d'exécution sur l'hôte (suite à la [configuration](../setup.md)), arrêtez-le d'abord — il entre en conflit avec le démon du conteneur pour le même tunnel :

```bash
sudo systemctl stop doublezerod
```

Installez [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) **après** approbation et paiement. Le bridge rejoint DoubleZero dans un conteneur `--network host` et sert du JSON normalisé sur `ws://<host>:8081`.

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**Toutes les commandes `doublezero` passent par le conteneur**, pas par le CLI de l'hôte :

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    Vous pouvez créer un alias pour faciliter les commandes vers le conteneur. Cet exemple permet à `dz status` de fonctionner comme `doublezero status` à l'intérieur du conteneur :

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

Attendez-vous à `BGP Session Up` et à vos groupe(s) `edge-hyper-…` abonnés.

Ensuite, ouvrez le WebSocket (`ws://127.0.0.1:8081`). Contrat : [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md). Guide complet : runbook [MCP](../mcp.md) `hyperliquid-edge`.

### 4b. Multicast natif

Sur l'hôte qui détient la clé privée assignée (avec `doublezerod` en cours d'exécution sur l'hôte), abonnez-vous aux flux que vous avez achetés :

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

Plusieurs flux, séparés par des espaces :

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

Vérifiez le tunnel :

```bash
doublezero status
```

Attendez-vous à `BGP Session Up` sur le bon réseau DoubleZero. Ensuite, décodez le fil vous-même — voir [Décoder le flux](#decode-the-feed).

---

## Facturation

Les places sont facturées **mensuellement**. Surveillez la date d'expiration de la place.

Vous devez payer la facture avant l'expiration de la place. **Le non-paiement entraîne la suppression de la place.**

---

## Adresses des flux

L'IP sélectionne le groupe multicast. Le port sélectionne le flux sur ce groupe. Vérifiez les valeurs IP en direct avec :

```bash
doublezero multicast group list
```

| Flux | Description | Groupe multicast | Market | Reference | Snapshot | Spéc. |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Meilleure offre/demande et impressions de transactions pour les perps Hyperliquid | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Carnet d'ordres complet ordre par ordre pour les perps Hyperliquid | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | Meilleure offre/demande et impressions de transactions pour les perps trade.xyz | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | Carnet d'ordres complet ordre par ordre pour les perps trade.xyz | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

Chaque flux possède sa propre adresse de groupe multicast. Ports : reference = market + `1` ; snapshot (MBO uniquement) = market + `2`. Nous recommandons de lier market et reference ensemble ; pour MBO, liez également snapshot.

Vous pouvez également voir de petits paquets UDP sur le port `5765` sur `doublezero1` — ce sont des heartbeats DoubleZero, pas des données de marché.

Les trames sont en binaire little-endian à taille fixe. Les perps natifs Hyperliquid utilisent `source_id=1` ; les perps trade.xyz utilisent `source_id=7`.

---

## Décoder le flux

!!! note "Edge Connect"
    Si vous utilisez `doublezero-edge-connect`, le flux est déjà décodé en JSON via WebSocket — ignorez le décodage manuel.

**Utiliser un parseur de référence**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) fournit des abonnés multicast qui décodent le format binaire et le republient en JSON sur un socket Unix :

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) pour Top-of-Book & Trades
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) pour Market-by-Order

Consultez le [README principal](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines) pour le pipeline complet.

**Écrire votre propre décodeur**

Décodez selon [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Commencez par l'en-tête de trame, puis les structures de messages pour le flux que vous recevez.

**En-tête du tunnel GRE — XDP**

Le trafic de données de marché livré sur le réseau est encapsulé en GRE au dernier kilomètre. Sur `doublezero1`, le client présente du multicast UDP simple. Si vous terminez le GRE vous-même (par ex. un pipeline XDP), retirez l'en-tête GRE avant d'alimenter les données dans votre décodeur. Voir [`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap).

---

## Dépannage

Si vous rencontrez un problème non couvert ici, veuillez contacter votre canal existant avant de chercher une solution de contournement. Si vous n'avez pas de canal, consultez [Support](../support.md).

**Assurez-vous que votre client est à jour**


```bash
sudo apt update && sudo apt install doublezero
```

**Le tunnel ne se monte pas**


1. **Edge Connect :** exécutez status dans le conteneur — `docker exec doublezero-edge-connect doublezero status`. La commande `doublezero status` sur l'hôte échoue souvent alors que le flux fonctionne correctement (le conteneur possède le démon). Confirmez que `doublezerod` sur l'hôte est arrêté.
2. **Natif :** vérifiez que le démon de l'hôte est en cours d'exécution : `sudo systemctl status doublezerod`
3. Vérifiez que les règles de pare-feu sont en place (GRE, BGP, PIM, ports UDP Hyperliquid et `5765` sur `doublezero1`)
4. Confirmez que la facture pour cette place est payée et que la date de début est passée
5. Exécutez connect sur le chemin que vous avez choisi ([4a](#4a-edge-connect) ou [4b](#4b-native-multicast)) avec la clé qui correspond à la page accounts
6. Attendez-vous à `BGP Session Up` depuis le même endroit où vous avez exécuté connect (conteneur ou hôte)

**Pas de paquets après l'abonnement**


1. Confirmez que vous êtes abonné : `doublezero user list`
2. Confirmez que le flux apparaît dans vos groupes : `doublezero multicast group list`
3. Capturez sur le tunnel, par ex. Hyperliquid TOB : `sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. Privilégiez le binding de market et reference ensemble (et snapshot pour MBO) pour le flux souhaité

**Flux acheté manquant (Edge Connect)**

Si un flux acheté est absent de `doublezero status`, abonnez-vous à l'intérieur du conteneur :

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-code>
```

Plusieurs flux, séparés par des espaces :

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

**Place expirée ou supprimée**


Les places sont mensuelles. Si la facture n'est pas payée avant l'expiration, la place est supprimée et le tunnel ne restera pas actif.

**"Multicast user already exists"**


Vous avez déjà un abonnement actif via un chemin différent. Déconnectez-vous d'abord, puis réessayez connect :

- **Edge Connect :** `docker exec doublezero-edge-connect doublezero disconnect`
- **Natif :** `doublezero disconnect`

Puis réessayez `doublezero connect multicast --subscribe-feed <feed-code>` sur le même chemin (conteneur ou hôte).

**Spécifique à AWS**


Désactivez la vérification source/destination sur l'ENI de l'instance. Sans cela, le multicast encapsulé en GRE peut être rejeté.