---
description: Runbook orienté LLM — acheter un siège Edge shreds et recevoir le multicast Solana shreds sur doublezero1. Servi au MCP via GitHub raw ; non publié sur le site de documentation.
---

# S'abonner aux shreds (Edge) — runbook

Cette page est destinée au DoubleZero MCP (`get_onboarding_runbook`) via GitHub raw. Elle
n'est pas publiée sur le site de documentation.

1. Connectez le [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Indiquez-lui l'hôte Linux qui va **recevoir** les shreds (ou SSH), le wallet/keypair pour `doublezero-solana`, et quel flux (leader vs retransmit).
3. Suivez les étapes ci-dessous dans l'ordre. Guide utilisateur : [Edge Subscriber Connection](Edge Subscriber Connection.md).

**À quoi ressemble le succès :** siège alloué pour l'époque en cours, `doublezero status` montre le tunnel actif, shreds UDP sur `doublezero1` port `7733` (groupe leader `233.84.178.1`).

En se connectant, l'utilisateur accepte les [Conditions d'utilisation DoubleZero](https://doublezero.xyz/terms-protocol). Les données sont à usage interne et ne peuvent pas être retransmises.

---

## Prérequis

| Besoin | Notes |
|--------|--------|
| Hôte Linux/amd64 | IPv4 publique, pas de NAT. Sur AWS : désactiver la vérification source/dest de l'ENI. |
| Solana CLI + `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` |
| Wallet | `~/.config/solana/id.json` (ou `--keypair`). Nécessite du **SOL** (frais) + **USDC** (escrow du siège). |
| Mint USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Pare-feu | GRE, BGP (`169.254.0.0/16` tcp/179), PIM, UDP `7733` sur `doublezero1`, UDP `44880` sur `doublezero0`. |

---

## Étapes

### 1. Installer le client + les paquets

Suivez la [configuration](setup.md), puis :

```bash
sudo apt update && sudo apt install doublezero-solana
```

Sauvegardez `~/.config/doublezero/id.json`.

### 2. Pare-feu

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

Variantes UFW : voir le guide utilisateur.

### 3. Activer le réconcilieur

Nécessaire pour que les sièges provisionnent automatiquement le tunnel.

```bash
doublezero enable
```

### 4. Wallet

```bash
solana-keygen new    # si nécessaire — écrit ~/.config/solana/id.json ; sauvegardez-le
solana address
```

Approvisionnez en SOL et USDC.

### 5. Choisir le dispositif + le prix

```bash
doublezero latency
doublezero-solana shreds price
doublezero-solana shreds price --device-code <Device_Name>
```

Notez le **code du dispositif** à la latence la plus faible et le prix par époque (base + premium). Préférez un financement de **>1 époque**. Interface des prix : [devices](https://data.doublezero.xyz/dz/shreds/devices).

### 6. Acheter un siège (bloquant)

Sur l'hôte récepteur :

```bash
curl -4 -s ifconfig.me; echo
```

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

`--client-ip` doit être l'IPv4 publique de la machine qui recevra les shreds. `--amount` est en décimal USDC (par ex. `100`) et doit atteindre le prix de l'époque.

S'il reste moins de 10 % de l'époque, le CLI émet un avertissement. `--accept-partial-epoch` prend le reste maintenant ; sinon attendez. Un escrow sous-financé au moment du règlement → siège perdu, tunnel démonté, **ancienneté perdue**.

Une fois alloué, le daemon établit le tunnel GRE.

```bash
doublezero status
doublezero-solana shreds list
```

### 7. Confirmer les shreds

Shreds leader : `233.84.178.1:7733` sur `doublezero1`. Découvrez les groupes avec `doublezero multicast group list`.

| Flux | Groupe | Adresse |
|------|--------|---------|
| Leader | `edge-solana-shreds` | `233.84.178.1:7733` |
| Root | `edge-solana-root` | `233.84.178.16:7733` |
| Retransmit EU | `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| Retransmit APAC | `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| Retransmit AMER | `edge-solana-retrans-amer` | `233.84.178.14:7733` |

Le port `5765` est un heartbeat de l'éditeur — pas des shreds. Le trafic est encapsulé en GRE ; certains pipelines (deshredders XDP) doivent retirer le GRE.

```bash
sudo tcpdump -ni doublezero1 host 233.84.178.1 and udp port 7733
```

---

## Pièges courants

1. **Réconcilieur désactivé.** Sans `doublezero enable`, le paiement n'établit pas le tunnel.
2. **`--client-ip` ≠ IP du daemon.** La découverte automatique doit correspondre au siège.
3. **`Multicast user already exists`.** Déconnectez d'abord : `doublezero disconnect`, puis réessayez `shreds pay`.
4. **Montant inférieur au prix actuel.** Revérifiez `shreds price` et augmentez `--amount`.
5. **Siège non alloué après le paiement.** Époque tardive (époque suivante), dispositif complet (ancienneté plus élevée), ou retrait avant le règlement.
6. **Maintenez l'escrow financé.** Rechargez avec un autre `shreds pay` ; ne laissez pas le solde descendre en dessous du prix de l'époque.

---

## Voir aussi

- [Edge Subscriber Connection](Edge Subscriber Connection.md)
- [Support](support.md)
- Tableau de bord / sièges : [data.doublezero.xyz](https://data.doublezero.xyz/dz/shreds/scoreboard)