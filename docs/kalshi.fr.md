---
description: Obtenez les données de marché Kalshi sur DoubleZero Edge — Edge Connect ou multicast natif.
---

# Connexion abonné Kalshi Edge

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol). Veuillez noter que les données sont destinées à votre usage interne uniquement et ne peuvent pas être retransmises (voir Section 2(e))."

Les flux Kalshi fournissent des données de marché perps et sports sur le réseau DoubleZero Edge en multicast UDP. Il existe quatre flux :

- perps Top of Book (TOB)
- perps Market by Price (MBP)
- sports Top of Book (TOB)
- sports Market by Price (MBP)

## Quel chemin dois-je prendre ?

Deux chemins. Préférez Edge Connect sauf si vous avez besoin de posséder le décodeur.

| # | Chemin | Idéal pour | Effort |
|---|--------|------------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommande) | Les agents et applications qui veulent un CLI simple et un WebSocket JSON normalisé | Le plus faible |
| **2** | [Multicast natif](#2-multicast-natif-avance) | Construire votre propre décodeur sur le format brut du fil | Le plus élevé |

Avant tout chemin : achetez les flux dont vous avez besoin sur [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). En achetant, vous acceptez les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol) et les [Conditions de service Kalshi](https://doublezero.xyz/dz-edge-kalshi-terms).

Vous voulez qu'une IA fasse l'installation avec vous ? Connectez le [DoubleZero MCP](mcp.md) et demandez-lui de vous guider à travers Kalshi / Edge Connect.

---

## 1. Edge Connect (recommandé)

**Commencez ici.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) est le chemin adapté aux agents : une seule commande d'installation, l'hôte rejoint DoubleZero, et votre application consomme du **JSON normalisé via WebSocket** (`ws://<host>:8081`) au lieu de décoder du multicast binaire.

L'équipe fait évoluer Edge Connect pour répondre aux besoins de sa base d'utilisateurs croissante. C'est la méthode de connexion la plus simple, et elle devrait être utilisée sauf si vous avez un besoin technique spécifique.

Version courte :

```bash
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

`DZ_SECRET` est un jeton d'accès `DZ_…` **ou** le chemin vers le fichier JSON de paire de clés Solana qui possède votre pass d'accès / achat de flux.

Ensuite, vérifiez `doublezero status` (attendez `BGP Session Up` et votre groupe Kalshi) et connectez un client WebSocket au port `:8081`.

**Étapes complètes, vérification et pièges :** connectez le [DoubleZero MCP](mcp.md) et demandez-lui de vous guider à travers Edge Connect pour Kalshi.  
**Contrat WebSocket :** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast natif (avancé)

!!! warning "Connaissances techniques approfondies requises"
    Le multicast natif signifie que vous rejoignez le groupe vous-même et décodez le format brut du fil Edge sur votre hôte. Seuls les utilisateurs les plus techniquement compétents devraient prendre ce chemin. Vous devrez lire et comprendre les spécifications, en commençant par [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) et le reste de [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Préférez [Edge Connect](#1-edge-connect-recommande) sauf si vous avez une exigence impérative de posséder le décodeur.

### Acheter un flux

<div data-wizard-step="kalshi-buy-feed" markdown>

Identifiez le dispositif à la latence la plus faible avant d'acheter :

```bash
doublezero latency
```

Achetez sur [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

</div>

### Configuration du client DoubleZero

Suivez les instructions de [configuration](setup.md) pour installer et configurer le client DoubleZero. Maintenez le client à jour :

```bash
sudo apt update && sudo apt install doublezero
```

### Configurer le pare-feu

Autorisez GRE, BGP, PIM et le trafic des flux Kalshi. Les ports UDP Kalshi se situent dans la plage `30000`–`59999` : le premier chiffre est la classe de trafic (`3` données de marché, `4` données de référence, `5` snapshot) et le second chiffre est le flux, donc la référence est toujours marché + `10000` et le snapshot est toujours marché + `20000`. Ouvrez la bande complète sur `doublezero1` afin que les nouveaux canaux et flux ne nécessitent pas un autre changement de pare-feu — voir [Adresses des flux](#adresses-des-flux).

<div data-wizard-step="kalshi-firewall-iptables" markdown>

**iptables :**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi market / reference / snapshot (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```

</div>

<div data-wizard-step="kalshi-firewall-ufw" markdown>

**UFW :**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Kalshi market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

</div>

### S'abonner

<div data-wizard-step="kalshi-subscribe" markdown>

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob
```

Plusieurs flux, séparés par des espaces :

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob edge-kalshi-perps-mbp edge-kalshi-sports-tob edge-kalshi-sports-mbp
```

Exemple de sortie de provisionnement :

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <your dz_id>
🔍  Provisioning User for IP: <your public ip>
    The Device has been selected: <the doublezero device you are connecting to>
    Service provisioned with status: ok
✅  User Provisioned
```

Attendez environ 60 secondes, puis :

```bash
doublezero status
```

Attendez `BGP Session Up` sur le réseau DoubleZero correct. En tant qu'abonné, votre IP DoubleZero correspond à votre IP source du tunnel.

```bash
doublezero user list --client-ip <your ip>
```

Vos flux apparaissent dans la colonne `groups`. Inspectez les IP des groupes avec :

```bash
doublezero multicast group list
```

</div>

### Décoder le fil vous-même

La version du schéma est **`3`** — rejetez les trames dont la version n'est pas implémentée par votre décodeur. Dispositions faisant autorité : [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluant [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md).

Chaque datagramme commence par un en-tête de trame, suivi d'un ou plusieurs messages applicatifs empaquetés jusqu'au MTU. Les trames sont en little-endian et à disposition fixe.

| Champ | Notes |
|-------|-------|
| Version du schéma | `3` |
| ID de canal | Démultiplexage des flux partageant un port |
| Séquence | Monotone par canal — utilisez-la pour la détection de lacunes |
| Horodatage d'envoi | Nanosecondes depuis l'époque Unix |
| Nombre de messages | Messages empaquetés dans cette trame |
| Compteur de réinitialisation | Incrémenté par session. Une augmentation signifie un démarrage à froid de votre état. |
| Longueur de trame | Nombre total d'octets |

#### Messages applicatifs (TOB)

| Type | ID | Taille | Port | Contenu |
|------|----|--------|------|---------|
| Heartbeat | `0x01` | 16 o | marché | Signal de vie lorsque le marché est calme |
| InstrumentDefinition | `0x02` | 130 o | référence | Symbole, exposants, tick et lot, expiration |
| Quote | `0x03` | 60 o | marché | Meilleur bid et ask, prix et taille, indicateurs de mise à jour |
| Trade | `0x04` | 52 o | marché | Prix, taille, côté agresseur, ID de transaction |
| ChannelReset | `0x05` | 12 o | les deux | Démarrage ou redémarrage de session |
| EndOfSession | `0x06` | 12 o | les deux | Arrêt propre |
| ManifestSummary | `0x07` | 24 o | référence | Empreinte de l'ensemble actif et nombre d'instruments |
| PerpStats | `0x30` | 124 o | associé | Financement, prix mark et oracle, intérêt ouvert, volume journalier |

L'ID source de Kalshi dans le registre edge-feed-spec est `3`. Lisez `price_exponent` et `qty_exponent` depuis chaque `InstrumentDefinition` — ne les codez pas en dur.

Les flux MBP utilisent l'ensemble de messages market-by-price. Consultez les spécifications market-by-price et reference-data dans edge-feed-spec.

La livraison est en UDP « fire-and-forget » sans retransmission. Récupérez les datagrammes manqués à partir du cycle de données de référence (et du plan snapshot sur les flux MBP), qui est réémis à une cadence régulière plutôt qu'une seule fois.

---

## Adresses des flux

| Flux | Description | Groupe multicast | Données de marché | Données de référence | Snapshot |
|------|-------------|------------------|-------------------|----------------------|----------|
| `edge-kalshi-perps-tob` | Perps top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | Perps market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | Sports top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `edge-kalshi-sports-mbp` | Sports market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

Schéma des ports : le premier chiffre est la classe de trafic (`3` marché, `4` référence, `5` snapshot) ; le second chiffre est le flux. La référence est marché + `10000` ; le snapshot est marché + `20000`. Les ports perps sont fixes. Les ports sports sont `base + id de canal` (par exemple, l'id `10` sur `edge-kalshi-sports-mbp` utilise `34010` / `44010` / `54010`).

Le groupe sélectionne le flux ; le port sélectionne les données de marché, les données de référence ou le snapshot au sein de celui-ci. La réplication multicast se fait par source et par groupe, et le réseau n'inspecte jamais le port UDP, donc rejoindre un groupe délivre tout ce qui est sur ce groupe via votre lien Edge Connect. Le port est un filtre de socket appliqué sur votre propre hôte après l'arrivée des octets.

---

## Dépannage

Si vous rencontrez un problème non couvert ici, veuillez nous contacter via votre canal existant avant de chercher une solution de contournement. Si vous n'avez pas de canal, consultez [Support](support.md).

### Assurez-vous que votre client est à jour

Exécutez : `sudo apt update && sudo apt install doublezero`

### Aucun datagramme ne arrive

1. Confirmez que le flux a été acheté sur [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Un flux non acheté ne délivre aucun trafic.
2. Confirmez que BGP est actif : `doublezero status` devrait afficher `BGP Session Up` sur le réseau DoubleZero correct.
3. Confirmez que l'abonnement est actif : `doublezero user list --client-ip <your ip>` devrait lister le flux sous `groups`.
4. Confirmez que le groupe est rejoint sur la bonne interface. Le multicast arrive sur `doublezero1`, pas `doublezero0`.
5. Confirmez que le pare-feu autorise les ports UDP du flux en entrée sur `doublezero1`.

### Lacunes de séquence

La séquence est monotone par canal. Une lacune signifie des datagrammes perdus ; le prochain cycle de données de référence restaure l'état des instruments.

### Les trames s'arrêtent puis redémarrent avec un nouveau compteur de réinitialisation

Un redémarrage de l'éditeur incrémente le compteur de réinitialisation dans l'en-tête de trame. Supprimez l'état de la session précédente et effectuez un démarrage à froid à partir du prochain cycle de données de référence.

### Le tunnel ne s'établit pas

1. Vérifiez que le démon est en cours d'exécution : `sudo systemctl status doublezerod` (chemin natif) ou que le conteneur Edge Connect est actif
2. Vérifiez que les règles de pare-feu sont en place (GRE, BGP, PIM et les ports du flux sur `doublezero1`)
3. Vérifiez l'état de votre connexion : `doublezero status` — attendez `BGP Session Up` sur le réseau DoubleZero correct

L'IP client est automatiquement découverte à partir de l'IP publique de votre hôte. Vérifiez qu'elle correspond à l'IP que vous avez utilisée lors de l'achat du flux.

---

## Design de référence pour la recherche

Optionnel. Si vous disposez déjà d'un tunnel DoubleZero et d'un abonnement sur l'hôte et que vous souhaitez **enregistrer et visualiser** les données du flux, le design de référence pour la recherche exécute multicast → parser → topofbook-bot → ClickHouse → Grafana avec Docker Compose :

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Pointez `.env` vers votre groupe Kalshi et vos ports (voir [Adresses des flux](#adresses-des-flux)), puis :

```bash
cd demo
cp .env.example .env
# set DZ_MULTICAST_GROUP, DZ_MARKETDATA_PORT, DZ_REFDATA_PORT, DZ_INTERFACE=doublezero1
docker compose up -d --build
```

Grafana est généralement accessible à `http://localhost:3000` sur l'hôte. Détails et tableaux de bord : le [README du demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Cela visualise les données que vous recevez déjà. Cela ne remplace pas l'achat du flux, l'abonnement, ni l'un des deux chemins de connexion ci-dessus.