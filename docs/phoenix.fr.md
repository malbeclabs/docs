---
description: Obtenez les données de marché des perpétuels Phoenix sur DoubleZero Edge — Edge Connect ou multicast natif.
---

# Connexion abonné Phoenix Edge

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol). Veuillez noter que les données sont réservées à votre usage interne et ne peuvent pas être retransmises (voir Section 2(e))."

Les flux Phoenix diffusent les données de marché des perpétuels Phoenix sur le réseau DoubleZero Edge en multicast UDP. Il existe deux flux :

- Top of Book (TOB) : meilleur bid et ask, plus les impressions de trades
- Market by Price (MBP) : profondeur par niveau de prix, plus les impressions de trades

## Tarification {#pricing}

Les flux sont facturés **par mois** :

| Flux | Prix |
|------|------|
| `phoenix-tob` | 50 $ / mois |
| `phoenix-mbp` | 100 $ / mois |

## Quel chemin dois-je prendre ? {#which-path-should-i-take}

| # | Chemin | Idéal pour | Effort |
|---|--------|------------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Les agents et applications qui veulent un CLI simple et du JSON décodé via WebSocket | Le plus faible |
| **2** | [Multicast natif](#2-native-multicast-advanced) | Construire votre propre décodeur sur le format brut du réseau | Le plus élevé |

Avant tout chemin : achetez les flux dont vous avez besoin sur [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). En achetant, vous acceptez les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol).

---

## 1. Edge Connect (recommandé) {#1-edge-connect-recommended}

**Commencez ici.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) est le chemin adapté aux agents : une seule commande d'installation, l'hôte rejoint DoubleZero, et votre application consomme du **JSON décodé via WebSocket** (`ws://<host>:8081`) au lieu de décoder du multicast binaire.

Edge Connect répond aux besoins de sa base d'utilisateurs en expansion. C'est la méthode de connexion la plus simple, et elle devrait être utilisée sauf si vous avez un besoin technique spécifique.

Version courte :

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

L'installeur demande votre secret : un jeton d'accès `DZ_…` **ou** le chemin vers le fichier JSON de la paire de clés Solana qui détient votre pass d'accès / achat de flux.

Si un `doublezerod` hôte est déjà en cours d'exécution, celui-ci et le daemon du conteneur se lient tous deux au port UDP `44880`, de sorte que le daemon du conteneur s'arrête juste après le démarrage. L'installeur propose d'arrêter et de désactiver le daemon hôte, et le fait sans demander lorsque `DZ_ASSUME_YES=1` est défini. Pour le faire vous-même :

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Ensuite, vérifiez le statut **à l'intérieur du conteneur** (attendez-vous à `BGP Session Up` et votre groupe Phoenix) et connectez un client WebSocket au port `:8081` :

```bash
docker exec doublezero-edge-connect doublezero status
```

Edge Connect arbitre entre les éditeurs Phoenix, de sorte que les clients WebSocket voient une seule copie de chaque mise à jour.

**Contrat WebSocket :** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast natif (avancé) {#2-native-multicast-advanced}

!!! warning "Connaissances techniques approfondies requises"
    Le multicast natif signifie que vous rejoignez le groupe vous-même et décodez le format brut Edge sur votre hôte. Seuls les utilisateurs les plus techniquement compétents devraient choisir ce chemin. Vous devrez lire et comprendre les spécifications, en commençant par [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) et le reste de [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Préférez [Edge Connect](#1-edge-connect-recommended) sauf si vous avez un besoin impératif de posséder le décodeur.

### Configuration du client DoubleZero {#doublezero-client-setup}

Suivez les instructions de [configuration](setup.md) pour installer et configurer le client DoubleZero. Gardez le client à jour :

```bash
sudo apt update && sudo apt install doublezero
```

### Acheter un flux {#buy-a-feed}

Avec `doublezerod` en cours d'exécution, identifiez le dispositif à la latence la plus faible avant d'acheter :

```bash
doublezero latency
```

Achetez sur [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configurer le pare-feu {#configure-the-firewall}

Autorisez GRE, BGP, PIM et le trafic des flux Phoenix. Les ports UDP Phoenix se situent dans la plage `9201`–`9213` : `9201`/`9202` transportent les données de marché et de référence Top of Book, et `9211`/`9212`/`9213` transportent les données de marché, de référence et de snapshot Market by Price. Voir [Adresses des flux](#feed-addresses).

**iptables :**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Phoenix market / reference / snapshot (les deux flux)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 9201:9213 -j ACCEPT
```


**UFW :**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Phoenix market / reference / snapshot (les deux flux)
sudo ufw allow in on doublezero1 to any port 9201:9213 proto udp
```

UFW n'a pas de protocole `pim`. Le PIM sortant est autorisé par la politique sortante par défaut d'UFW ; si vous refusez le trafic sortant, ajoutez une règle brute pour PIM dans `/etc/ufw/before.rules`.


### S'abonner {#subscribe}

Rejoignez chaque flux que vous avez acheté (client v0.35.0 ou ultérieur) :

```bash
doublezero connect multicast
```

Ou nommez les flux par **code de flux** :

```bash
doublezero connect multicast --subscribe-feed phoenix-tob phoenix-mbp
```

Utilisez les codes de flux `phoenix-tob` / `phoenix-mbp`, pas les noms de flux par métro (comme `phoenix-tob-cmh`) et pas les codes de groupe (`edge-phoenix-…`). S'abonner par code de groupe avec `--subscribe` échoue avec un pass acheté.

Attendez-vous à `✅  User Provisioned`. Attendez environ 60 secondes, puis :

```bash
doublezero status
```

Attendez-vous à `BGP Session Up` sur le bon réseau DoubleZero.

```bash
doublezero user list --client-ip <your ip>
```

Vos flux apparaissent dans la colonne `groups`. Inspectez les IPs de groupe avec :

```bash
doublezero multicast group list
```


### Décoder le format brut vous-même {#decode-the-wire-yourself}

La version du schéma est **`3`** — ignorez les datagrammes dont la version n'est pas implémentée par votre décodeur. Formats de référence : [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluant [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md), [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) et le [GLOSSARY](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md).

Chaque datagramme commence par un en-tête de datagramme de 24 octets, suivi d'un ou plusieurs messages applicatifs empaquetés jusqu'au MTU. Les datagrammes sont en petit-boutiste (little-endian) et à disposition fixe.

| Champ | Notes |
|-------|-------|
| Magic | `u16` à l'offset 0 : `0x445A` pour TOB, `0x4442` pour MBP. Validez-le. |
| Version du schéma | `3` |
| Channel ID | Les deux flux Phoenix utilisent le channel `1` |
| Séquence | Monotone par adresse IP source, Channel ID et port de destination — chaque port a sa propre série. Utilisez-la pour la détection de lacunes. |
| Horodatage d'envoi | Nanosecondes depuis l'époque Unix |
| Nombre de messages | Messages empaquetés dans ce datagramme |
| Compteur de réinitialisation | Tout changement (y compris le passage de `255` à `0`) est une réinitialisation ; supprimez l'état du channel de cet éditeur. MBP peut aussi l'incrémenter en cours de session lors d'un ré-ensemencement à l'échelle du venue. |
| Longueur du datagramme | Nombre total d'octets |

**Plus d'un éditeur envoie chaque flux Phoenix**, sur les mêmes groupes, channel et ports. Indexez tout l'état du channel et des instruments sur l'adresse IP source en plus du Channel ID, sinon les séries de séquence de deux éditeurs s'entrelacent en une seule. Un abonné natif reçoit une copie de chaque trade par éditeur.

#### Messages applicatifs (TOB) {#application-messages-tob}

| Type | ID | Taille | Port | Contenu |
|------|----|--------|------|---------|
| Heartbeat | `0x01` | 16 o | market | Signe de vie quand le marché est calme |
| InstrumentDefinition | `0x02` | 130 o | reference | Symbole, exposants, tick et lot, expiration |
| Quote | `0x03` | 60 o | market | Meilleur bid et ask, prix et taille, drapeaux de mise à jour |
| Trade | `0x04` | 52 o | market | Prix, taille, côté agresseur, identifiant de trade |
| EndOfSession | `0x06` | 12 o | market | Arrêt propre |
| ManifestSummary | `0x07` | 24 o | reference | Drapeau de validité, compteur de changement Manifest Seq, nombre d'instruments, horodatage |

Phoenix n'envoie pas `0x08` (Liquidation). Le Source ID de Phoenix dans le registre edge-feed-spec est `2`. Lisez `price_exponent` et `qty_exponent` depuis chaque `InstrumentDefinition` — ne les codez pas en dur. L'exposant est la précision du prix, pas le tick : BTC sur Phoenix utilise l'exposant `-2` avec une taille de tick de `100`, donc il évolue par dollars entiers.

Le flux MBP utilise le jeu de messages market-by-price. Consultez les spécifications market-by-price et reference-data dans edge-feed-spec. Les deux flux proviennent du même processus éditeur, ils partagent donc les identifiants d'instruments, et le port de données de marché MBP transporte les mêmes impressions de trades que TOB. Les identifiants de trade Phoenix sont des numéros de séquence par marché, donc dédupliquez les trades sur **(instrument ID, trade ID)**, jamais sur le trade ID seul.

La livraison est en UDP sans retransmission (fire-and-forget), et le port de données de référence ne répare pas les données de marché : il ne fait que répéter `InstrumentDefinition` (au moins une fois toutes les 30 s) et `ManifestSummary` (au moins une fois par seconde). Un Quote TOB perdu reste perdu jusqu'à ce que le meilleur bid ou ask de ce marché change. Seul MBP a un mécanisme de réparation — son cycle de snapshot — et un démarrage à froid MBP doit se connecter au port de snapshot.

---

## Adresses des flux {#feed-addresses}

| Code du flux | Code du groupe | Description | Groupe multicast | Données de marché | Données de référence | Snapshot |
|--------------|----------------|-------------|------------------|-------------------|----------------------|----------|
| `phoenix-tob` | `edge-phoenix-tob` | Top-of-book et trades des perpétuels | `233.84.178.24` | `9201` | `9202` | — |
| `phoenix-mbp` | `edge-phoenix-mbp` | Market-by-price des perpétuels | `233.84.178.25` | `9211` | `9212` | `9213` |

Abonnez-vous avec le code du flux ; `doublezero status` et `multicast group list` affichent le code du groupe.

Le groupe sélectionne le flux ; le port sélectionne les données de marché, les données de référence ou le snapshot au sein de celui-ci. La réplication multicast se fait par adresse IP source et groupe, et le réseau n'inspecte jamais le port UDP, donc rejoindre un groupe délivre tout ce qui transite sur ce groupe à travers votre tunnel DoubleZero. Le port est un filtre de socket appliqué sur votre propre hôte après l'arrivée des octets.

---

## Dépannage {#troubleshooting}

Si vous rencontrez un problème non couvert ici, veuillez nous contacter via votre canal existant avant de chercher une solution de contournement. Si vous n'avez pas de canal, consultez [Support](support/index.md).

### Assurez-vous que votre client est à jour {#ensure-your-client-is-up-to-date}

Exécutez : `sudo apt update && sudo apt install doublezero`

### Aucun datagramme n'arrive {#no-datagrams-arriving}

1. Confirmez que le flux a été acheté sur [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un flux non acheté ne délivre aucun trafic.
2. Confirmez que BGP est actif : `doublezero status` devrait afficher `BGP Session Up` sur le bon réseau DoubleZero.
3. Confirmez que l'abonnement est actif : `doublezero user list --client-ip <your ip>` devrait lister le flux sous `groups`.
4. Confirmez que le groupe est rejoint sur la bonne interface. Le multicast arrive sur `doublezero1`, pas `doublezero0`.
5. Confirmez que le pare-feu autorise les ports UDP du flux en entrée sur `doublezero1`.

### Lacunes de séquence {#sequence-gaps}

Suivez la séquence par adresse IP source, Channel ID et port de destination ; un décodeur indexé uniquement sur le Channel ID verra de fausses lacunes. Une vraie lacune signifie des datagrammes perdus. Sur MBP, les marchés affectés se rétablissent lors du prochain cycle de snapshot. Sur TOB, il n'y a pas de réparation : le quote d'un marché redevient à jour uniquement lorsque son meilleur bid ou ask change à nouveau.

### Changements du compteur de réinitialisation {#reset-count-changes}

Tout changement du compteur de réinitialisation signifie que cet éditeur a redémarré ou ré-ensemencé le channel. Supprimez l'état pour cette adresse IP source et ce channel, récupérez les définitions depuis le port de données de référence, et sur MBP reconstruisez les carnets d'ordres depuis le port de snapshot.

### Le tunnel ne s'établit pas {#tunnel-not-coming-up}

1. **Edge Connect :** exécutez le statut dans le conteneur — `docker exec doublezero-edge-connect doublezero status`. Le `doublezero status` de l'hôte échoue souvent alors que le flux fonctionne correctement (le conteneur possède le daemon). Confirmez que le `doublezerod` de l'hôte est arrêté.
2. **Natif :** vérifiez que le daemon hôte est en cours d'exécution : `sudo systemctl status doublezerod`
3. Vérifiez que les règles de pare-feu sont en place (GRE, BGP, PIM et les ports du flux sur `doublezero1`)
4. Vérifiez le statut de connexion depuis le même endroit où vous vous êtes connecté (conteneur ou hôte) — attendez-vous à `BGP Session Up` sur le bon réseau DoubleZero

L'IP du client est auto-détectée à partir de l'IP publique de votre hôte. Vérifiez qu'elle correspond à l'IP que vous avez utilisée lors de l'achat du flux.

---

## Design de référence pour la recherche {#research-reference-design}

Optionnel. Si vous avez déjà un tunnel DoubleZero et un abonnement sur l'hôte et que vous souhaitez **enregistrer et visualiser** les données du flux, le design de référence pour la recherche exécute multicast → parser → topofbook-bot → ClickHouse → Grafana avec Docker Compose :

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Ceci pointe la démo vers Phoenix TOB (voir [Adresses des flux](#feed-addresses)) :

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.24/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=9201/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=9202/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana est généralement accessible à `http://localhost:3000` sur l'hôte. Détails et tableaux de bord : le [README de la démo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Ceci visualise les données que vous recevez déjà. Cela ne remplace pas l'achat du flux, l'abonnement, ni l'un des chemins de connexion ci-dessus.