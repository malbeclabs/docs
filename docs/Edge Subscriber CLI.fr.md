---
description: Configurez un abonné edge pour recevoir les flux de shreds DoubleZero, incluant la configuration du client et les règles de pare-feu pour GRE, BGP, PIM et le trafic de shreds.
---

# Connexion d'abonné Edge (CLI)

!!! warning "Abonnement CLI legacy — mis hors service le **30 août 2026**"
    Cette page s'adresse aux utilisateurs déjà sur l'abonnement **CLI / siège onchain** (`doublezero-solana shreds pay`). Ce système sera mis hors service le **30 août 2026**.

    Les nouveaux abonnements utilisent le flux via le portail sur [S'abonner aux shreds (Edge)](Edge Subscriber Connection.md).

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol). Veuillez noter que les données sont destinées uniquement à votre usage interne et ne peuvent pas être retransmises (voir Section 2(e))."

## Étape 1 : Configuration de DoubleZero

### 1. Terminer la configuration

Installez le [Solana CLI](https://docs.anza.xyz/cli/install).

Suivez les instructions de [configuration](setup.md) pour installer et configurer le client DoubleZero.

Si vous avez précédemment configuré DoubleZero, assurez-vous d'avoir la dernière version du CLI Doublezero-Solana avec `sudo apt update && sudo apt install doublezero-solana`

### 2. Configurer le pare-feu

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

### 3. Activer le réconciliateur

Le réconciliateur surveille l'état onchain et provisionne automatiquement les tunnels lorsque votre siège est attribué. Il n'est pas activé par défaut.

```bash
doublezero enable
```

---

## Étape 2 : Configurer votre portefeuille

### 1. Créer une paire de clés Solana

Le CLI `doublezero-solana` utilise une paire de clés Solana standard pour la gestion des sièges onchain. Si vous n'en avez pas :

```bash
solana-keygen new
```

Cela écrit dans `~/.config/solana/id.json`. Pour utiliser un chemin différent, passez `--keypair <path>` à n'importe quelle commande `doublezero-solana`.

Affichez l'adresse de votre portefeuille :

```bash
solana address
```

### 2. Approvisionner votre portefeuille

Votre portefeuille a besoin de deux jetons :

- **SOL** — pour les frais de transaction Solana. Transférez des SOL à l'adresse du portefeuille affichée ci-dessus.
- **USDC** — pour le financement du siège. Le CLI prélève depuis le compte de jetons associé (ATA) de votre portefeuille pour le mint USDC mainnet (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`).

---

## Étape 3 : Acheter un siège

### 1. Trouver votre appareil le plus proche

Avant d'acheter un siège, identifiez l'appareil avec la latence la plus faible depuis votre machine :

```bash
doublezero latency
```

Notez le code de l'appareil avec le résultat de latence le plus bas (par ex., `<Device_Name>`). Vous l'utiliserez lors de l'achat d'un siège.

### 2. Vérifier les tarifs

Consultez les tarifs actuels des appareils avant d'engager des fonds. La tarification comporte deux composantes : un **prix de base métropolitain** et une **prime par appareil**. Vous pouvez également consulter les tarifs et la disponibilité [ici](https://data.doublezero.xyz/dz/shreds/devices).

**Tous les appareils :**

```bash
doublezero-solana shreds price
```

**Appareil spécifique :**

```bash
doublezero-solana shreds price --device-code <Device_Name>
doublezero-solana shreds price --device <PUBKEY>
```

**Tous les appareils dans une métropole :**

```bash
doublezero-solana shreds price --metro <PUBKEY>
```

Colonnes de sortie : `Device Code`, `Metro Code`, `Metro Name`, `Status`, `Settled Seats`, `Available Seats`, `Base Price (USDC)`, `Premium (USDC)`, `Epoch Price (USDC)`.

Le prix par epoch est le coût total par epoch pour un siège sur cet appareil (base + prime). Utilisez `--wide` pour afficher les clés publiques complètes, ou `--json` pour une sortie JSON.

### 3. Acheter un siège

Achetez un siège avec une seule commande. Cela initialise votre siège, finance le séquestre et demande l'attribution :

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**Paramètres :**

| Indicateur | Description |
|------|-------------|
| `--device <PUBKEY>` | Appareil cible par clé publique (mutuellement exclusif avec `--device-code`) |
| `--device-code <CODE>` | Appareil cible par code lisible (par ex., `<Device_Name>`) |
| `--client-ip <IP>` | Adresse IPv4 publique de votre machine |
| `--amount <USDC>` | USDC à financer (format décimal, par ex. `100` = 100 USDC). Doit atteindre le prix minimum par epoch. |
| `--source-token-account <PUBKEY>` | Compte source USDC personnalisé (par défaut l'ATA de votre portefeuille) |
| `--accept-partial-epoch` | Ignorer l'avertissement d'epoch restant (voir ci-dessous) |
| `--fee-payer <PATH>` | Utiliser un portefeuille différent pour les frais de transaction SOL |
| `--dry-run` | Simuler la transaction sans l'exécuter |
| `--with-compute-unit-price <PRICE>` | Définir un prix d'unité de calcul pour une inclusion plus rapide en cas de congestion |

Une fois votre siège attribué, le daemon établit automatiquement le tunnel GRE. Vérifiez votre connexion avec :

```bash
doublezero status
```

### Timing des epochs

Les sièges sont attribués par epoch Solana (~2 jours). S'il reste moins de 10 % de l'epoch en cours lorsque vous payez, le CLI vous avertit que votre siège sera attribué immédiatement mais ne couvre que le reste de l'epoch en cours. Un paiement séparé sera déduit de votre séquestre lorsque l'epoch suivant commencera.

!!! info "Il est conseillé de financer pour plus d'un epoch à la fois afin de ne pas perdre votre siège. Vous pouvez vérifier le temps restant dans un epoch [ici](https://explorer.solana.com/)."

Vous pouvez contourner cet avertissement avec `--accept-partial-epoch`.

### Maintenir votre séquestre approvisionné

!!! warning "Si le solde de votre séquestre est inférieur au prix de l'epoch lors du règlement, votre siège ne sera pas attribué, le tunnel sera démonté et vous perdrez votre ancienneté accumulée. L'ancienneté détermine votre priorité pour les epochs futurs — la perdre signifie que vous êtes à nouveau en concurrence comme nouvel arrivant."

Vous pouvez sur-approvisionner ce compte pour financer plusieurs epochs. Chaque règlement déduit le prix d'un epoch de votre séquestre, et le solde restant est reporté. Par exemple, financer 5 fois le prix par epoch maintient votre siège actif pendant jusqu'à 5 epochs sans ré-approvisionnement.

Pour compléter votre séquestre, exécutez à nouveau `shreds pay` à tout moment :

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

Notez que le `Target_IP` doit être une adresse IPv4 publique sur la machine qui recevra les shreds. Vous pouvez la trouver en exécutant une commande comme `curl -4 ifconfig.me` sur la machine cible.

### Surveiller les sièges

Cette section détaille comment visualiser les sièges via le CLI. Vous pouvez également utiliser [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs) pour surveiller les sièges et vous aider à gérer votre compte de séquestre.

Visualisez vos sièges actifs et soldes de séquestre :

**Tous vos sièges :**

```bash
doublezero-solana shreds list
```

**Filtrer par appareil :**

```bash
doublezero-solana shreds list --device-code <Device_Name>
```

**Filtrer par IP client :**

```bash
doublezero-solana shreds list --client-ip <Target_IP>
```

**Filtrer par portefeuille :**

```bash
doublezero-solana shreds list --withdraw-authority <PUBKEY>
```

Colonnes de sortie : `Device Code`, `Client IP`, `Tenure`, `Balance (USDC)`, `Est. Epochs Paid`.

La colonne « Est. Epochs Paid » indique combien d'epochs votre solde actuel couvre aux tarifs en vigueur. Si les prix changent, cette estimation s'ajuste.

### Retirer le siège et le séquestre

Cette commande libère votre siège et ferme le séquestre. Vous recevez un remboursement au prorata pour la portion inutilisée de l'epoch en cours, plus tout solde de séquestre restant, retourné à votre portefeuille. Vous perdez le siège et toute ancienneté accumulée.

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

Vous pouvez identifier l'appareil soit par `--device <PUBKEY>` soit par `--device-code <CODE>`, comme pour les autres commandes.

Pour envoyer le remboursement USDC vers un compte de jetons différent :

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "Cette action est irréversible. Après le retrait, votre siège est perdu et l'ancienneté est réinitialisée."

---

## Adresses de shreds (IP vs Port)

Les shreds de leader et les shreds de retransmission à fort enjeu arriveront sur le port `7733`, via l'interface `doublezero1`. L'interface `doublezero0` est destinée au trafic unicast. Le port `5765` est un moniteur de battement de cœur provenant des éditeurs de shreds — il ne contiendra pas de shreds.

Pour la consommation de shreds, l'**adresse IP** identifie le flux multicast et le **port** identifie le service UDP sur ce flux.  
Tous les flux de shreds ci-dessous utilisent le port UDP `7733` sur `doublezero1`.

Vous pouvez examiner les IP de n'importe quel groupe multicast avec :

```bash
doublezero multicast group list
```

### Shreds de leader

- `edge-solana-shreds`: `233.84.178.1:7733`

### Shreds root

- `edge-solana-root`: `233.84.178.16:7733`

### Shreds de retransmission

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## En-tête de tunnel GRE — XDP

!!! note "Le trafic de shreds livré sur le réseau est encapsulé en GRE. Vous devrez peut-être retirer l'en-tête GRE avant d'injecter les données dans votre pipeline existant (par ex. un deshredder basé sur XDP)."

---

## Outils et tableaux de bord

### [Tableau de classement Edge](https://data.doublezero.xyz/dz/shreds/scoreboard)

Le tableau de classement évalue la vitesse de livraison des shreds entre DoubleZero Edge et d'autres fournisseurs, en utilisant des données au niveau des slots pour comparer les performances en temps réel. Utilisez ce tableau de bord pour voir les taux de victoire des shreds Edge par rapport aux autres fournisseurs. Vous pouvez consulter les résultats pour les shreds de leader uniquement, en plus de la comparaison du flux complet. Vous pouvez également explorer par région pour voir les performances attendues.

### [Éditeurs Edge](https://data.doublezero.xyz/dz/shreds/publishers)

La métrique « Publishing Shreds » en haut à gauche du tableau de bord montre le pourcentage total du poids de stake de tous les validateurs Solana publiant des shreds de leader sur DoubleZero Edge. Vous pouvez voir les détails de chaque éditeur sur le réseau.

### [Abonnés, appareils et activité Edge](https://data.doublezero.xyz/dz/shreds/subscribers)

Vous pouvez facilement rechercher votre IP client sur cette page pour les sièges souscrits et voir leur statut. Cliquez sur des abonnements de sièges spécifiques pour voir l'historique des paiements et l'activité. Vous pouvez également consulter les appareils disponibles sur la page [Appareils](https://data.doublezero.xyz/dz/shreds/devices) et toute l'activité récente sur la page [Activité](https://data.doublezero.xyz/dz/shreds/activity).

### Documentation de l'API de données

Pour un accès programmatique aux points de terminaison de données, consultez la documentation de l'API : [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

---

## Dépannage

Si vous rencontrez un problème non couvert ici, veuillez nous contacter via votre canal existant avant de tenter un contournement. Si vous n'avez pas de canal, veuillez chercher sur [Discord](https://discord.gg/U2fEb4Jq) et ouvrir un ticket si nécessaire.

### Assurez-vous que votre client est à jour :

Exécutez : `sudo apt update && sudo apt install doublezero-solana`

### Solde de séquestre insuffisant

Si le solde de votre séquestre est inférieur au prix de l'epoch lors du règlement, le siège n'est pas attribué, le tunnel est démonté et l'ancienneté est perdue. Complétez avec `shreds pay` avant le prochain règlement.

### Siège non attribué après le paiement

- Vous avez peut-être payé tard dans l'epoch — le siège prend effet à l'epoch suivant.
- Tous les sièges sur l'appareil peuvent être pris par des titulaires ayant une ancienneté plus élevée. Vérifiez les sièges disponibles avec `shreds price`.
- Si vous avez retiré avant le règlement, le siège n'était pas éligible.

### Le tunnel ne s'établit pas

1. Vérifiez que le daemon est en cours d'exécution : `sudo systemctl status doublezerod`
2. Vérifiez que le réconciliateur est activé : `doublezero enable`
3. Vérifiez que les règles de pare-feu sont en place (GRE, BGP, PIM, trafic de shreds sur `doublezero1`, port 44880 sur `doublezero0`)
4. Vérifiez que votre siège est actif pour l'epoch en cours : `doublezero-solana shreds list`
5. Vérifiez l'état de votre connexion : `doublezero status`

L'IP client du daemon est auto-découverte à partir de l'IP publique de votre hôte — vérifiez qu'elle correspond au `--client-ip` utilisé dans vos commandes de siège.

### Avertissement de l'invite d'epoch

Le CLI avertit lorsqu'il reste moins de 10 % de l'epoch. Vos options :

- Accepter avec `--accept-partial-epoch` si vous voulez le siège immédiatement
- Attendre l'epoch suivant pour obtenir une couverture complète d'un epoch

### « Amount is below the current price »

La commande `pay` valide votre montant par rapport au prix minimum par epoch (base métropolitaine + prime de l'appareil). Utilisez `shreds price` pour vérifier les tarifs en vigueur et augmentez votre montant.

### « Multicast user already exists »

Vous avez déjà un abonnement actif via un chemin différent. Déconnectez-vous d'abord avec `doublezero disconnect`, puis réessayez `shreds pay`.