---
description: Configurez un abonné edge pour recevoir les flux de shreds DoubleZero, y compris la configuration du client et les règles de pare-feu pour GRE, BGP, PIM et le trafic de shreds.
---

# Connexion Abonné Edge
!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol). Veuillez noter que les données sont destinées à votre usage interne uniquement et ne peuvent pas être retransmises (voir Section 2(e))."

!!! warning "Déjà sur l'abonnement CLI ?"
    Si vous vous êtes abonné via le **CLI** (`doublezero-solana shreds pay` / sièges escrow), utilisez la [page d'abonnement CLI](Edge Subscriber CLI.md) pour ces commandes. Ce système sera **décommissionné le 30 août 2026**. Les nouveaux abonnements suivent cette page.

## Étape 1 : Configuration de DoubleZero

### Configuration complète

Installez le [Solana CLI](https://docs.anza.xyz/cli/install).

Suivez les instructions de [configuration](setup.md) pour installer et configurer le client DoubleZero.

Si vous avez déjà configuré DoubleZero, assurez-vous d'avoir la dernière version du CLI Doublezero-Solana avec `sudo apt update && sudo apt install doublezero-solana`

### Configurer le pare-feu

Autorisez le trafic GRE, BGP, PIM et shred.

**iptables :**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

**UFW :**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

---

## Étape 2 : Choisir un métro

Identifiez l'emplacement à la latence la plus faible depuis la machine qui recevra les shreds :

```bash
doublezero latency
```

Notez le métro / la ville du résultat à la latence la plus faible. Vous sélectionnerez cette ville sur le formulaire de candidature. Consultez la [carte de topologie](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) pour voir comment les métros sont regroupés.

### Tarification

Les sièges sont facturés **par mois**, par machine, dans le métro que vous sélectionnez :

| Métros | Prix |
|--------|------|
| Frankfurt, Amsterdam | 1 500 $ / mois |
| London, New York, Singapore, Tokyo | 900 $ / mois |
| Tous les autres emplacements | 450 $ / mois |

---

## Étape 3 : Soumettre la demande

1. Rendez-vous sur [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Sélectionnez **Solana Shreds**.
3. Sélectionnez la **ville** (métro) dont vous avez besoin. Utilisez le tableau ci-dessus et `doublezero latency` pour choisir.
4. Complétez le formulaire de candidature.

Vous assignerez un DoubleZero ID (clé existante, ou en générer une nouvelle) à chaque demande de flux sur la page [comptes](https://doublezero.xyz/shreds/account). La **clé privée correspondante doit être présente sur la machine qui recevra les shreds** — n'assignez pas une clé publique dont vous ne pouvez pas déplacer la clé privée vers cet hôte.

Vous choisissez un **métro** et une **clé publique**. Vous ne liez **pas** d'IP publique au moment de la candidature. Pendant l'abonnement, vous pouvez transférer l'accès entre les IPs **au sein des métros choisis**.

Notre équipe examine les candidatures et vous contacte dans les meilleurs délais (comptez **2 jours ouvrés**).

---

## Étape 4 : Se connecter après approbation

Après que nous vous ayons contacté, que vous ayez reçu une facture et que celle-ci soit payée, connectez-vous sur chaque machine approuvée :

```bash
doublezero connect multicast --subscribe-feed solana-shreds-full
```

L'accès est activé à la date de début choisie (généralement 9h01 ET). Vérifiez le tunnel avec :

```bash
doublezero status
```

---

## Facturation

Les sièges sont facturés **mensuellement**. Surveillez la date d'expiration du siège.

Vous recevrez une facture quelques jours avant l'expiration du siège. **Le non-paiement entraîne la suppression du siège.**

---

## Adresses de Shreds (IP vs Port)

Les Leader Shreds et les Retransmit Shreds à fort enjeu arriveront sur le port `7733`, via l'interface `doublezero1`. L'interface `doublezero0` est destinée au trafic unicast. Le port `5765` est un moniteur de battement de cœur provenant des éditeurs de shreds — il ne contiendra pas de shreds.

Pour la consommation de shreds, l'**adresse IP** identifie le flux multicast et le **port** identifie le service UDP sur ce flux.  
Tous les flux de shreds ci-dessous utilisent le port UDP `7733` sur `doublezero1`.

Vous pouvez examiner les IPs de n'importe quel groupe multicast avec :

```bash
doublezero multicast group list
```

### Leader Shreds

- `edge-solana-shreds`: `233.84.178.1:7733`

### Root Shreds

- `edge-solana-root`: `233.84.178.16:7733`

### Retransmit Shreds

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## En-tête du tunnel GRE — XDP

!!! note "Le trafic de shreds livré sur le réseau est encapsulé en GRE. Vous devrez peut-être supprimer l'en-tête GRE avant d'injecter les données dans votre pipeline existant (par exemple, un deshredder basé sur XDP)."

---

## Outils et tableaux de bord

### [Edge Scoreboard](https://data.doublezero.xyz/dz/shreds/scoreboard)

Le Scoreboard évalue la vitesse de livraison des shreds sur DoubleZero Edge et d'autres fournisseurs, en utilisant des données au niveau des slots pour comparer les performances en temps réel. Utilisez ce tableau de bord pour voir les taux de victoire des shreds Edge par rapport aux autres fournisseurs. Vous pouvez consulter les résultats pour les leader shreds uniquement, en plus de la comparaison du flux complet. Vous pouvez également affiner par région pour voir les performances attendues.

### [Edge Publishers](https://data.doublezero.xyz/dz/shreds/publishers)

La métrique « Publishing Shreds » en haut à gauche du tableau de bord indique le pourcentage total du poids de stake de tous les validateurs Solana publiant des leader shreds sur DoubleZero Edge. Vous pouvez voir les détails de chaque éditeur sur le réseau.

### [Abonnés Edge, appareils et activité](https://data.doublezero.xyz/dz/shreds/subscribers)

Vous pouvez rechercher votre IP Client sur cette page pour les sièges souscrits et voir leur statut. Vous pouvez également consulter les appareils disponibles sur la page [Appareils](https://data.doublezero.xyz/dz/shreds/devices) et toute l'activité récente sur la page [Activité](https://data.doublezero.xyz/dz/shreds/activity).

### Documentation de l'API de données

Pour un accès programmatique aux points de terminaison de données, consultez la documentation de l'API : [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

---

## Dépannage

Si vous rencontrez un problème non couvert ici, veuillez nous contacter via votre canal existant avant de chercher une solution de contournement. Si vous n'avez pas de canal, veuillez chercher sur [Discord](https://discord.gg/U2fEb4Jq) et ouvrir un ticket si nécessaire.

### Assurez-vous que votre client est à jour :

Exécutez : `sudo apt update && sudo apt install doublezero-solana`

### Le tunnel ne s'établit pas

1. Vérifiez que le démon est en cours d'exécution : `sudo systemctl status doublezerod`
2. Vérifiez que les règles de pare-feu sont en place (GRE, BGP, PIM, trafic shred sur `doublezero1`, port 44880 sur `doublezero0`)
3. Confirmez que la facture pour ce siège est payée et que la date de début est passée
4. Exécutez `doublezero connect multicast --subscribe-feed solana-shreds-full` sur la machine qui détient la clé privée assignée
5. Vérifiez le statut de votre connexion : `doublezero status`

Le DoubleZero ID utilisé sur la page des comptes doit correspondre à la clé sur cet hôte.

### Siège expiré ou supprimé

Les sièges sont mensuels. Si la facture envoyée avant l'expiration n'est pas payée, le siège est supprimé et le tunnel ne restera pas actif.

### « Multicast user already exists »

Vous avez déjà un abonnement actif via un chemin différent. Déconnectez-vous d'abord avec `doublezero disconnect`, puis réessayez `doublezero connect multicast --subscribe-feed solana-shreds-full`.