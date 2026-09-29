---
description: Obtenez les données de marché Kalshi sur DoubleZero Edge — Edge Connect ou multicast natif.
---

# Connexion abonné Kalshi Edge

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol). Veuillez noter que les données sont destinées à votre usage interne uniquement et ne peuvent pas être retransmises (voir Section 2(e))."

Les flux Kalshi fournissent les données de marché perps et sports via le réseau DoubleZero Edge sous forme de multicast UDP. Il existe quatre flux :

- perps Top of Book (TOB)
- perps Market by Price (MBP)
- sports Top of Book (TOB)
- sports Market by Price (MBP)

## Quel chemin dois-je prendre ?

| # | Chemin | Idéal pour | Effort |
|---|--------|------------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Les agents et applications souhaitant un CLI simple et du JSON décodé via WebSocket | Le plus faible |
| **2** | [Multicast natif](#2-native-multicast-advanced) | Construire votre propre décodeur à partir du format brut sur le réseau | Le plus élevé |

Avant tout chemin : achetez les flux dont vous avez besoin sur [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). En achetant, vous acceptez les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol) et les [Conditions de service de Kalshi](https://doublezero.xyz/dz-edge-kalshi-terms).

Vous voulez qu'une IA vous accompagne dans l'installation ? Connectez le [DoubleZero MCP](mcp.md) et demandez-lui de vous guider à travers Kalshi / Edge Connect.

---

## 1. Edge Connect (recommandé) {#1-edge-connect-recommended}

**Commencez ici.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) est le chemin adapté aux agents : une seule commande d'installation, l'hôte rejoint DoubleZero, et votre application consomme du **JSON décodé via WebSocket** (`ws://<host>:8081`) au lieu de décoder du multicast binaire.

Edge Connect répond aux besoins de sa base d'utilisateurs croissante. C'est la méthode de connexion la plus simple, et elle devrait être utilisée sauf si vous avez un besoin technique spécifique.

Version courte :

```bash
curl -fsSL https://get.doublezero.xyz/connect | \
  DZ_SECRET=/path/to/keypair.json DZ_FEEDS=KALSHI DZ_ASSUME_YES=1 bash
```

Les variables vont après le pipe pour que l'installateur (`bash`) les reçoive. `DZ_SECRET` est un jeton d'accès `DZ_…` **ou** le chemin vers le fichier JSON de la paire de clés Solana qui possède votre pass d'accès / achat de flux.

Si un `doublezerod` hôte est déjà en cours d'exécution, celui-ci et le daemon propre au conteneur se lient tous deux au port UDP `44880`, ce qui fait que le daemon du conteneur s'arrête juste après le démarrage. L'installateur propose d'arrêter et de désactiver le daemon hôte, et le fait sans demander lorsque `DZ_ASSUME_YES=1` est défini. Pour le faire vous-même :

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Ensuite, vérifiez le statut **à l'intérieur du conteneur** (attendez-vous à `BGP Session Up` et votre groupe Kalshi) et connectez un client WebSocket au port `:8081` :

```bash
docker exec doublezero-edge-connect doublezero status
```

**Étapes complètes, vérification et pièges :** connectez le [DoubleZero MCP](mcp.md) et demandez-lui de vous guider à travers Edge Connect pour Kalshi.  
**Contrat WebSocket :** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast natif (avancé) {#2-native-multicast-advanced}

!!! warning "Connaissances techniques approfondies requises"
    Le multicast natif signifie que vous rejoignez le groupe vous-même et décodez le format brut Edge **raw** sur votre hôte. Seuls les utilisateurs les plus techniquement compétents devraient emprunter ce chemin. Vous devrez lire et comprendre les spécifications, en commençant par [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) et le reste de [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Préférez [Edge Connect](#1-edge-connect-recommended) sauf si vous avez une exigence absolue de posséder le décodeur.

### Configuration du client DoubleZero

Suivez les instructions de [configuration](setup.md) pour installer et configurer le client DoubleZero. Maintenez le client à jour :

```bash
sudo apt update && sudo apt install doublezero
```

### Acheter un flux

Avec `doublezerod` en cours d'exécution, identifiez le périphérique à la latence la plus faible avant d'acheter :

```bash
doublezero latency
```

Achetez sur [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configurer le pare-feu

Autorisez GRE, BGP, PIM et le trafic des flux Kalshi. Les ports UDP Kalshi se situent dans la plage `30000`–`59999` : le premier chiffre est la classe de trafic (`3` données de marché, `4` données de référence, `5` snapshot) et le deuxième chiffre est le flux, donc la référence est toujours marché + `10000` et le snapshot est toujours marché + `20000`. Ouvrez la bande complète sur `doublezero1` afin que les nouveaux canaux et flux ne nécessitent pas une autre modification du pare-feu — voir [Adresses des flux](#feed-addresses).

**iptables :**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi marché / référence / snapshot (tous les flux)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```


**UFW :**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Kalshi marché / référence / snapshot (tous les flux)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

UFW ne dispose pas du protocole `pim`. Le PIM sortant est autorisé par la politique sortante par défaut d'UFW ; si vous refusez le trafic sortant, ajoutez une règle brute pour PIM dans `/etc/ufw/before.rules`.


### S'abonner

Rejoignez chaque flux que vous avez acheté (client v0.35.0 ou ultérieur) :

```bash
doublezero connect multicast
```

Ou nommez les flux par **code de flux**, séparés par des espaces :

```bash
doublezero connect multicast --subscribe-feed kalshi-perps-tob kalshi-perps-mbp kalshi-sports-tob kalshi-sports-mbp
```

Utilisez les codes de flux (`kalshi-…`), pas les noms de flux par métro ni les codes de groupe (`edge-kalshi-…`). S'abonner par code de groupe avec `--subscribe` échoue avec un pass acheté.

Attendez-vous à `✅  User Provisioned`. Patientez environ 60 secondes, puis :

```bash
doublezero status
```

Attendez-vous à `BGP Session Up` sur le bon réseau DoubleZero.

```bash
doublezero user list --client-ip <your ip>
```

Vos flux apparaissent dans la colonne `groups`. Inspectez les IP de groupe avec :

```bash
doublezero multicast group list
```


### Décoder le flux vous-même

La version du schéma est **`3`** — ignorez les datagrammes dont la version n'est pas implémentée par votre décodeur. Dispositions faisant autorité : [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluant [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md).

Chaque datagramme commence par un en-tête de datagramme de 24 octets, suivi d'un ou plusieurs messages applicatifs empaquetés jusqu'à la MTU. Les datagrammes sont en little-endian et à disposition fixe.

| Champ | Notes |
|-------|-------|
| Magic | `u16` à l'offset 0 : `0x445A` pour TOB, `0x4442` pour MBP. Validez-le. |
| Version du schéma | `3` |
| Channel ID | Démultiplexe les canaux partageant un port |
| Séquence | Monotone par adresse IP source, Channel ID et port de destination — chaque port a sa propre série. Utilisez-la pour la détection de lacunes. |
| Horodatage d'envoi | Nanosecondes depuis l'époque Unix |
| Nombre de messages | Messages empaquetés dans ce datagramme |
| Compteur de réinitialisation | Tout changement (y compris le passage de `255` à `0`) est une réinitialisation ; supprimez l'état du canal de cet éditeur. MBP peut également l'incrémenter en cours de session lors d'un re-seed à l'échelle du lieu. |
| Longueur du datagramme | Total en octets |

#### Messages applicatifs (TOB)

| Type | ID | Taille | Port | Contenu |
|------|----|--------|------|---------|
| Heartbeat | `0x01` | 16 o | marché | Présence lorsque le marché est calme |
| InstrumentDefinition | `0x02` | 130 o | référence | Symbole, exposants, tick et lot, expiration |
| Quote | `0x03` | 60 o | marché | Meilleure offre et demande, prix et taille, indicateurs de mise à jour |
| Trade | `0x04` | 52 o | marché | Prix, taille, côté agresseur, identifiant de transaction |
| EndOfSession | `0x06` | 12 o | marché | Arrêt propre |
| ManifestSummary | `0x07` | 24 o | référence | Indicateur de validité, compteur de changement Manifest Seq, nombre d'instruments, horodatage |
| PerpStats | `0x30` | 124 o | auxiliaire | Financement, prix mark et oracle, intérêt ouvert, volume journalier |

L'identifiant source (Source ID) de Kalshi dans le registre edge-feed-spec est `3`. Lisez `price_exponent` et `qty_exponent` depuis chaque `InstrumentDefinition` — ne les codez pas en dur.

Les flux MBP utilisent l'ensemble de messages market-by-price. Consultez les spécifications market-by-price et reference-data dans edge-feed-spec.

La livraison est en UDP fire-and-forget sans retransmission, et le port de données de référence ne répare pas les données de marché : il ne fait que répéter `InstrumentDefinition` (au moins une fois toutes les 30 s) et `ManifestSummary` (au moins une fois toute les 1 s). Un Quote TOB perdu reste perdu jusqu'à ce que la meilleure offre ou demande de ce marché change. Seuls les flux MBP disposent d'un chemin de réparation — le cycle de snapshot — et un démarrage à froid MBP doit se lier au port de snapshot. Dédupliquez les transactions sur **(instrument ID, trade ID)**, jamais sur le trade ID seul.

---

## Adresses des flux {#feed-addresses}

| Code de flux | Code de groupe | Description | Groupe multicast | Données de marché | Données de référence | Snapshot |
|--------------|----------------|-------------|------------------|-------------------|----------------------|----------|
| `kalshi-perps-tob` | `edge-kalshi-perps-tob` | Perps top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `kalshi-perps-mbp` | `edge-kalshi-perps-mbp` | Perps market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `kalshi-sports-tob` | `edge-kalshi-sports-tob` | Sports top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `kalshi-sports-mbp` | `edge-kalshi-sports-mbp` | Sports market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

Abonnez-vous avec le code de flux ; `doublezero status` et `multicast group list` affichent le code de groupe.

Schéma des ports : le premier chiffre est la classe de trafic (`3` marché, `4` référence, `5` snapshot) ; le deuxième chiffre est le flux. La référence est marché + `10000` ; le snapshot est marché + `20000`. Les ports perps sont fixes. Les ports sports sont `base + channel id` (par exemple, l'id `10` sur `edge-kalshi-sports-mbp` utilise `34010` / `44010` / `54010`).

Le groupe sélectionne le flux ; le port sélectionne les données de marché, les données de référence ou le snapshot à l'intérieur de celui-ci. La réplication multicast se fait par adresse IP source et groupe, et le fabric n'inspecte jamais le port UDP, donc rejoindre un groupe délivre tout ce qui est sur ce groupe à travers votre tunnel DoubleZero. Le port est un filtre de socket appliqué sur votre propre hôte après l'arrivée des octets.

---

## Dépannage

Si vous rencontrez un problème non couvert ici, veuillez nous contacter via votre canal existant avant de chercher une solution de contournement. Si vous n'avez pas de canal, consultez [Support](support.md).

### Assurez-vous que votre client est à jour

Exécutez : `sudo apt update && sudo apt install doublezero`

### Aucun datagramme ne parvient

1. Confirmez que le flux a été acheté sur [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un flux non acheté ne délivre aucun trafic.
2. Confirmez que BGP est actif : `doublezero status` devrait afficher `BGP Session Up` sur le bon réseau DoubleZero.
3. Confirmez que l'abonnement est actif : `doublezero user list --client-ip <your ip>` devrait lister le flux sous `groups`.
4. Confirmez que le groupe est rejoint sur la bonne interface. Le multicast arrive sur `doublezero1`, pas `doublezero0`.
5. Confirmez que le pare-feu autorise les ports UDP du flux en entrée sur `doublezero1`.

### Lacunes de séquence

Suivez la séquence par adresse IP source, Channel ID et port de destination ; un décodeur indexé uniquement sur le Channel ID verra de fausses lacunes. Une vraie lacune signifie des datagrammes perdus. Sur les flux MBP, les marchés affectés se rétablissent au prochain cycle de snapshot. Sur les flux TOB, il n'y a pas de réparation : le quote d'un marché redevient à jour une fois que sa meilleure offre ou demande change à nouveau.

### Changements du compteur de réinitialisation

Tout changement du compteur de réinitialisation signifie que cet éditeur a redémarré ou re-seedé le canal. Supprimez l'état pour cette adresse IP source et ce canal, récupérez les définitions depuis le port de données de référence à nouveau, et sur les flux MBP reconstruisez les carnets d'ordres depuis le port de snapshot.

### Le tunnel ne s'établit pas

1. **Edge Connect :** exécutez le statut dans le conteneur — `docker exec doublezero-edge-connect doublezero status`. Le `doublezero status` sur l'hôte échoue souvent alors que le flux fonctionne bien (le conteneur possède le daemon). Confirmez que le `doublezerod` de l'hôte est arrêté.
2. **Natif :** vérifiez que le daemon de l'hôte est en cours d'exécution : `sudo systemctl status doublezerod`
3. Vérifiez que les règles de pare-feu sont en place (GRE, BGP, PIM et les ports de flux sur `doublezero1`)
4. Vérifiez le statut de connexion depuis le même endroit où vous vous êtes connecté (conteneur ou hôte) — attendez-vous à `BGP Session Up` sur le bon réseau DoubleZero

L'IP du client est découverte automatiquement à partir de l'IP publique de votre hôte. Vérifiez qu'elle correspond à l'IP que vous avez utilisée lors de l'achat du flux.

---

## Design de référence pour la recherche

Optionnel. Si vous avez déjà un tunnel DoubleZero et un abonnement sur l'hôte et que vous souhaitez **enregistrer et visualiser** les données de flux, le design de référence pour la recherche exécute multicast → parser → topofbook-bot → ClickHouse → Grafana avec Docker Compose :

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Ceci pointe la démo vers Kalshi perps TOB. Pour un autre flux, utilisez son groupe et ses ports depuis [Adresses des flux](#feed-addresses) :

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.3/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=31000/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=41000/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana est généralement accessible à `http://localhost:3000` sur l'hôte. Détails et tableaux de bord : le [README de la démo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Ceci visualise les données que vous recevez déjà. Cela ne remplace pas l'achat de flux, l'abonnement, ni aucun des chemins de connexion ci-dessus.