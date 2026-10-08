---
description: Obtenez les données de marché Binance Spot et des contrats à terme USD-M sur DoubleZero Edge — Edge Connect ou multicast natif.
---

# Connexion abonné Binance Edge

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol). Veuillez noter que les données sont destinées à votre usage interne uniquement et ne peuvent pas être retransmises (voir Section 2(e))."

Les flux Binance fournissent les données de marché top-of-book de Binance via le réseau DoubleZero Edge sous forme de multicast UDP. Les données sont ingérées depuis Binance à Tokyo et acheminées sur la fibre dédiée de DoubleZero, de sorte qu'elles atteignent les autres métros plus tôt que via l'internet public. Binance est le lieu où se fait la découverte des prix pour de nombreuses paires spot, ses données sont donc un indicateur avancé pour les autres marchés.

Il y a deux flux, un par moteur d'appariement Binance :

| Flux | Instruments | Horodatage de cotation |
|------|-------------|------------------------|
| Binance Spot | Toutes les paires spot négociées, y compris les paires cotées en monnaie fiduciaire | Heure d'envoi de la passerelle, précision à la µs |
| Binance USD-M | Perpétuels cotés en USDT et USDC. Les contrats à terme datés et les perpétuels TradFi ne sont pas inclus | Heure du moteur d'appariement, précision à la ms |

L'ensemble des instruments suit les cotations de Binance : les paires et les contrats sont ajoutés et retirés à mesure qu'ils entrent en négociation et en sortent.

## Tarifs {#pricing}

Les flux sont facturés **par mois** :

| Flux | Prix |
|------|------|
| Binance Spot | 100 $ / mois |
| Binance USD-M | 100 $ / mois |

## Quel chemin dois-je prendre ? {#which-path-should-i-take}

| # | Chemin | Idéal pour | Effort |
|---|--------|------------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agents et applications souhaitant un CLI simple et du JSON décodé via WebSocket | Le plus faible |
| **2** | [Multicast natif](#2-native-multicast-advanced) | Construire votre propre décodeur sur le format brut | Le plus élevé |

Avant tout chemin : achetez les flux dont vous avez besoin sur [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). En achetant, vous acceptez les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol).

---

## 1. Edge Connect (recommandé) {#1-edge-connect-recommended}

**Commencez ici.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) est le chemin adapté aux agents : une seule commande d'installation, l'hôte rejoint DoubleZero, et votre application consomme du **JSON décodé via WebSocket** (`ws://<host>:8081`) au lieu de décoder du multicast binaire.

Edge Connect répond aux besoins de sa base d'utilisateurs en expansion. C'est la méthode de connexion la plus simple, et elle doit être utilisée sauf si vous avez un besoin technique spécifique.

Version courte :

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

L'installateur demande votre secret : un jeton d'accès `DZ_…` **ou** le chemin vers le fichier JSON de la keypair Solana qui possède votre pass d'accès / achat de flux.

Si un `doublezerod` hôte est déjà en cours d'exécution, celui-ci et le daemon du conteneur se lient tous deux au port UDP `44880`, de sorte que le daemon du conteneur se termine juste après le démarrage. L'installateur propose d'arrêter et de désactiver le daemon hôte, et le fait sans demander lorsque `DZ_ASSUME_YES=1` est défini. Pour le faire vous-même :

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Puis vérifiez le statut **à l'intérieur du conteneur** (attendez-vous à `BGP Session Up` et votre groupe Binance) et connectez un client WebSocket sur `:8081` :

```bash
docker exec doublezero-edge-connect doublezero status
```

Chaque message Binance sur le WebSocket porte `"source_name":"BINANCE"`. Les moteurs partagent ce nom, distinguez-les donc par `source_id` : `8` correspond à Spot et `6` à USD-M. Le même symbole peut exister sur les deux — `BTCUSDT` est une paire spot sur l'un et un perpétuel sur l'autre — et les identifiants d'instrument sont attribués par moteur, indexez donc sur `source_id` en plus du symbole ou de l'identifiant d'instrument.

**Contrat WebSocket :** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast natif (avancé) {#2-native-multicast-advanced}

!!! warning "Connaissances techniques approfondies requises"
    Le multicast natif signifie que vous rejoignez le groupe vous-même et décodez le format **brut** Edge sur votre hôte. Seuls les utilisateurs les plus techniquement compétents devraient emprunter ce chemin. Vous devrez lire et comprendre les spécifications, en commençant par [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) et le reste de [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Préférez [Edge Connect](#1-edge-connect-recommended) sauf si vous avez un besoin impératif de posséder le décodeur.

### Configuration du client DoubleZero {#doublezero-client-setup}

Suivez les instructions de [configuration](setup.md) pour installer et configurer le client DoubleZero. Maintenez le client à jour :

```bash
sudo apt update && sudo apt install doublezero
```

### Acheter un flux {#buy-a-feed}

Avec `doublezerod` en cours d'exécution, identifiez le périphérique à la latence la plus faible avant d'acheter :

```bash
doublezero latency
```

Achetez sur [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configurer le pare-feu {#configure-the-firewall}

Autorisez GRE, BGP, PIM et le trafic des flux Binance. Les deux flux publient les données de marché sur le port UDP `30001` et les données de référence sur `30002` ; ils se distinguent par le groupe multicast, pas par le port. Voir [Adresses des flux](#feed-addresses).

**iptables :**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Binance market / reference (both feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30001:30002 -j ACCEPT
```

**UFW :**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Binance market / reference (both feeds)
sudo ufw allow in on doublezero1 to any port 30001:30002 proto udp
```

UFW n'a pas de protocole `pim`. Le PIM sortant est autorisé par la politique sortante par défaut de UFW ; si vous bloquez le trafic sortant, ajoutez une règle brute pour PIM dans `/etc/ufw/before.rules`.

### S'abonner {#subscribe}

Rejoignez chaque flux acheté (client v0.35.0 ou ultérieur) :

```bash
doublezero connect multicast
```

S'abonner par code de groupe avec `--subscribe` échoue avec un pass acheté.

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

### Décoder le format vous-même {#decode-the-wire-yourself}

La version du schéma est **`3`** — ignorez les datagrammes dont la version n'est pas implémentée par votre décodeur. Formats de référence : [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluant [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md), le [registre des Source ID](https://github.com/malbeclabs/edge-feed-spec/blob/main/sources/spec.md) et le [GLOSSAIRE](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md).

Chaque datagramme commence par un en-tête de 24 octets, suivi d'un ou plusieurs messages applicatifs empaquetés jusqu'au MTU. Les datagrammes sont en little-endian et à disposition fixe.

| Champ | Notes |
|-------|-------|
| Magic | `u16` à l'offset 0 : `0x445A`. Validez-le. |
| Version du schéma | `3` |
| Channel ID | Spot utilise le canal `1`, USD-M le canal `0` |
| Sequence | Monotone par adresse IP source, Channel ID et port de destination — chaque port a sa propre série. À utiliser pour la détection de lacunes. |
| Horodatage d'envoi | Nanosecondes depuis l'époque Unix |
| Nombre de messages | Messages empaquetés dans ce datagramme |
| Compteur de reset | Tout changement (y compris le passage de `255` à `0`) est un reset ; supprimez l'état du canal de cet émetteur. |
| Longueur du datagramme | Nombre total d'octets |

#### Messages applicatifs {#application-messages}

| Type | ID | Taille | Port | Contenu |
|------|----|--------|------|---------|
| Heartbeat | `0x01` | 16 o | market | Signal de vie lorsque le marché est calme |
| InstrumentDefinition | `0x02` | 130 o | reference | Symbole, exposants, tick et lot, expiration |
| Quote | `0x03` | 60 o | market | Meilleur bid et ask, prix et taille, indicateurs de mise à jour |
| Trade | `0x04` | 52 o | market | Prix, taille, côté agresseur, identifiant de trade |
| EndOfSession | `0x06` | 12 o | market | Arrêt propre |
| ManifestSummary | `0x07` | 24 o | reference | Indicateur de validité, compteur de changement Manifest Seq, nombre d'instruments, horodatage |

**Le Source ID est la clé du moteur.** Les deux flux utilisent le code de place `BINANCE`, mais chaque moteur a son propre Source ID dans le registre edge-feed-spec : `8` Binance Spot, `6` Binance USD-Margined Futures. Les moteurs listent des symboles qui se recoupent (`BTCUSDT` est à la fois une paire spot et un perpétuel USD-M), et chaque moteur attribue les identifiants d'instrument indépendamment, de sorte que le même identifiant d'instrument peut apparaître sur les deux flux pour des instruments différents. Indexez les instruments et les carnets sur **(Source ID, instrument ID)**, jamais sur le symbole ou l'identifiant d'instrument seul. Lisez `price_exponent` et `qty_exponent` de chaque `InstrumentDefinition` — ne les codez pas en dur. L'exposant est la précision du prix, pas le tick : l'incrément négociable est `tick_size × 10^price_exponent`.

La livraison est en UDP sans retransmission (fire-and-forget), et le port de données de référence ne répare pas les données de marché : il ne répète que `InstrumentDefinition` (au moins une fois toutes les 30 s sur les deux flux) et `ManifestSummary` (au moins une fois toutes les 1 s sur USD-M, toutes les 5 s sur Spot). Un Quote perdu reste perdu jusqu'à ce que le meilleur bid ou ask de cet instrument change. Dédupliquez les trades sur **(Source ID, instrument ID, trade ID)**, jamais sur le trade ID seul.

Binance agrège les mises à jour du meilleur bid et ask avant qu'elles n'atteignent le flux : sous charge, une mise à jour devenue obsolète pour un symbole est abandonnée au profit de la plus récente. Avoir moins de cotations que de changements du carnet est un comportement normal de la place, pas une perte — utilisez le numéro de séquence du datagramme pour détecter les pertes.

Détails des données de référence qui diffèrent de ce qu'un décodeur pourrait supposer :

- **Horodatages.** Les `Quote` et `Trade` USD-M portent l'heure du moteur d'appariement, à la précision de la milliseconde. Le `Quote` Spot porte l'heure d'envoi de la passerelle et le `Trade` Spot l'heure d'exécution, tous deux à la précision de la microseconde. Tous sont exprimés en nanosecondes sur le réseau.
- **`Leg1` fait 8 octets.** Les actifs de base plus longs (par exemple `1000FLOKI` ou `BROCCOLI714`) sont tronqués ; le nom complet figure toujours dans `Symbol`.
- **Tous les symboles ne sont pas en ASCII.** Quelques perpétuels USD-M ont des noms chinois, et leurs `Symbol` et `Leg1` contiennent des octets UTF-8. Ne supposez pas de l'ASCII lors du décodage de ces champs.
- **`Expiry` vaut `0`** sur chaque instrument USD-M, puisque tous sont des perpétuels.
- **`Bid Source Count` et `Ask Source Count` valent toujours `0`.** Binance ne publie pas le nombre d'ordres au meilleur prix.
- **USD-M exclut les ordres Retail Price Improvement (RPI)** du meilleur bid et ask, il peut donc différer d'un snapshot de profondeur qui les inclut.

---

## Adresses des flux {#feed-addresses}

| Code de groupe | Moteur | Source ID | Channel ID | Groupe multicast | Données de marché | Données de référence |
|----------------|--------|-----------|------------|------------------|-------------------|----------------------|
| `edge-binance-spot-tob` | Spot | `8` | `1` | `233.84.178.31` | `30001` | `30002` |
| `edge-binance-usdsm-tob` | Perpétuels USD-M | `6` | `0` | `233.84.178.23` | `30001` | `30002` |

`doublezero status` et `multicast group list` affichent le code de groupe.

Le groupe sélectionne le flux ; le port sélectionne les données de marché ou les données de référence à l'intérieur de celui-ci. La réplication multicast se fait par adresse IP source et groupe, et le fabric n'inspecte jamais le port UDP, donc rejoindre un groupe délivre tout ce qui est sur ce groupe via votre tunnel DoubleZero. Le port est un filtre de socket appliqué sur votre propre hôte après l'arrivée des octets. Comme les flux partagent les mêmes ports, un socket lié à `30001` sur un hôte ayant rejoint les deux groupes Binance reçoit les deux ; filtrez sur le groupe de destination ou sur le Source ID.

---

## Dépannage {#troubleshooting}

Si vous rencontrez un problème non couvert ici, veuillez nous contacter via votre canal existant avant de tenter de le contourner. Si vous n'avez pas de canal, consultez [Support](support/index.md).

### Assurez-vous que votre client est à jour {#ensure-your-client-is-up-to-date}

Exécutez : `sudo apt update && sudo apt install doublezero`

### Aucun datagramme reçu {#no-datagrams-arriving}

1. Confirmez que le flux a été acheté sur [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un flux non acheté ne délivre aucun trafic.
2. Confirmez que BGP est actif : `doublezero status` devrait afficher `BGP Session Up` sur le bon réseau DoubleZero.
3. Confirmez que l'abonnement est actif : `doublezero user list --client-ip <your ip>` devrait lister le flux sous `groups`.
4. Confirmez que le groupe est rejoint sur la bonne interface. Le multicast arrive sur `doublezero1`, pas `doublezero0`.
5. Confirmez que le pare-feu autorise les ports UDP `30001`–`30002` en entrée sur `doublezero1`.

### Deux moteurs mélangés {#two-engines-mixed-together}

Spot et USD-M listent tous deux des symboles tels que `BTCUSDT`, attribuent les identifiants d'instrument indépendamment et partagent les mêmes ports. Un décodeur qui indexe les carnets uniquement sur le symbole ou l'identifiant d'instrument, ou qui lie un seul socket pour tous les groupes sans vérifier le groupe de destination, fusionne deux instruments différents dans un seul carnet. Indexez sur le Source ID (ou le groupe de destination) en plus de l'identifiant d'instrument.

### Lacunes de séquence {#sequence-gaps}

Suivez la séquence par adresse IP source, Channel ID et port de destination ; un décodeur indexé uniquement sur le Channel ID verra de fausses lacunes. Une vraie lacune signifie des datagrammes perdus. Il n'y a pas de réparation : la cotation d'un instrument redevient actuelle lorsque son meilleur bid ou ask change à nouveau.

### Changements du compteur de reset {#reset-count-changes}

Tout changement du compteur de reset signifie que cet émetteur a redémarré ou ré-ensemencé le canal. Supprimez l'état pour cette adresse IP source et ce canal, et recueillez à nouveau les définitions depuis le port de données de référence.

### Le tunnel ne s'établit pas {#tunnel-not-coming-up}

1. **Edge Connect :** exécutez le statut dans le conteneur — `docker exec doublezero-edge-connect doublezero status`. Le `doublezero status` de l'hôte échoue souvent alors que le flux fonctionne (le conteneur possède le daemon). Confirmez que le `doublezerod` de l'hôte est arrêté.
2. **Natif :** vérifiez que le daemon hôte est en cours d'exécution : `sudo systemctl status doublezerod`
3. Vérifiez que les règles de pare-feu sont en place (GRE, BGP, PIM et les ports du flux sur `doublezero1`)
4. Vérifiez le statut de connexion depuis le même endroit où vous vous êtes connecté (conteneur ou hôte) — attendez-vous à `BGP Session Up` sur le bon réseau DoubleZero

L'IP client est détectée automatiquement à partir de l'IP publique de votre hôte. Vérifiez qu'elle correspond à l'IP utilisée lors de l'achat du flux.

---

## Design de référence pour la recherche {#research-reference-design}

Optionnel. Si vous avez déjà un tunnel DoubleZero et un abonnement sur l'hôte et souhaitez **enregistrer et visualiser** les données du flux, le design de référence pour la recherche exécute multicast → parser → topofbook-bot → ClickHouse → Grafana avec Docker Compose :

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Ceci pointe la démo vers Binance Spot. Pour un autre flux, utilisez son groupe depuis [Adresses des flux](#feed-addresses) :

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.31/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=30001/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=30002/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana est généralement accessible à `http://localhost:3000` sur l'hôte. Détails et tableaux de bord : le [README de la démo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Ceci visualise les données que vous recevez déjà. Cela ne remplace pas l'achat du flux, l'abonnement, ni l'un des chemins de connexion ci-dessus.
