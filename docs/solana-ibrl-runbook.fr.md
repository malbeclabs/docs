---
description: Runbook orienté LLM — connecter un validateur Solana Mainnet-Beta à DoubleZero en mode IBRL. Servi au MCP via GitHub raw ; non publié sur le site de documentation.
---

# Connecter un validateur (IBRL Mainnet) — runbook

Cette page est destinée au DoubleZero MCP (`get_onboarding_runbook`) via GitHub raw. Elle n'est
pas publiée sur le site de documentation.

1. Connectez le [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Indiquez-lui qu'il s'agit d'un **validateur Solana Mainnet-Beta**, l'hôte Linux (ou SSH), et l'emplacement du keypair d'identité du validateur.
3. Suivez les étapes ci-dessous dans l'ordre. Vous préférez le faire manuellement ? Utilisez le [guide pour humains](DZ Mainnet-beta Connection.md).

**À quoi ressemble le succès :** `doublezero status` affiche le tunnel **up**, User Type **IBRL**, Network **mainnet-beta**. `Tunnel src` et `Doublezero IP` correspondent à l'IPv4 publique de l'hôte.

IBRL ne nécessite pas de redémarrer les clients validateurs ; il utilise l'IP publique existante.

---

## Prérequis

| Besoin | Notes |
|--------|--------|
| Hôte Linux/amd64 | Installez DoubleZero **sur l'hôte du validateur**, pas dans un conteneur. |
| IPv4 publique, pas de NAT | L'IP de gossip doit correspondre à cet hôte. |
| Solana CLI dans le `$PATH` | Pour `solana sign-offchain-message`. |
| Keypair d'identité du validateur | Lisible par l'utilisateur exécutant les commandes (souvent sous l'utilisateur `sol`). |
| ≥1 SOL sur l'identité | Passport / requête onchain. |
| GRE (protocole IP 47) + BGP | BGP sur `169.254.0.0/16` tcp/179. |
| `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` (ou équivalent pour votre distribution). |

Le Validator ID est vérifié par rapport au gossip Solana pour déterminer l'IP cible. Un ID invalide sur la même IP est ignoré ; seul l'ID principal dans le gossip est utilisé.

---

## Étapes

### 1. Installer le client

Suivez [setup](setup.md) si `doublezero` n'est pas installé. Paquets mainnet :

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

Rocky / RHEL : utilisez `setup.rpm.sh` et `sudo yum install doublezero`.

**Vérification :** `sudo systemctl status doublezerod` est actif. Sauvegardez `~/.config/doublezero/id.json`.

### 2. Pointer le daemon vers mainnet-beta

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Attendez ~30s, puis `doublezero latency` devrait lister les appareils mainnet.

### 3. Ouvrir le port UDP 44880 sur `doublezero0`

```bash
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW : `sudo ufw allow in on doublezero0 to any port 44880 proto udp` et la règle `out` correspondante. Autorisez également GRE et BGP comme indiqué dans [setup](setup.md).

### 4. Confirmer l'ID DoubleZero et le validateur principal

L'ID DoubleZero issu du setup sur le **principal** doit être présent sur chaque backup (`~/.config/doublezero/id.json`).

```bash
doublezero address
doublezero-solana passport find-validator -u mainnet-beta
```

Résultat attendu pour le principal : présent dans le gossip, dans le planning de leader, "can connect as a primary". Sur les backups, exécutez le même `find-validator` ; ils ne devraient **pas** être dans le planning de leader.

Machine unique : omettez `--backup-validator-ids` / `backup_ids=` des commandes suivantes.

### 5. Préparer le message d'accès (principal)

Sur le principal (stake actif, identité dans le gossip) :

```bash
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address <DOUBLEZERO_ADDRESS> \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4>
```

Omettez `--backup-validator-ids` s'il n'y a pas de backups (max 3). Copiez la ligne `solana sign-offchain-message …` depuis la sortie.

### 6. Signer avec la clé d'identité du validateur

Sur le principal, exécutez la commande affichée (keypair d'identité, **pas** uniquement la clé DoubleZero) :

```bash
solana sign-offchain-message \
   service_key=<DOUBLEZERO_ADDRESS>,backup_ids=<ID2>,<ID3>,<ID4> \
   -k <identity-keypair-file.json>
```

**Produit :** une chaîne de signature. Conservez-la pour l'étape suivante.

### 7. Demander l'accès validateur

```bash
doublezero-solana passport request-validator-access -k <path-to-keypair> -u mainnet-beta \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4> \
  --signature <SIGNATURE> \
  --doublezero-address <DOUBLEZERO_ADDRESS>
```

Attendez que Sentinel valide et crée le pass d'accès. Optionnel : l'agent peut appeler **`check_edge_access`** avec `pubkey` (`doublezero address`) et l'IP publique de l'hôte jusqu'à ce que le pass soit présent.

### 8. Connecter IBRL

```bash
doublezero connect ibrl
```

Attendez ~1 minute pour le GRE. Jusque-là, le statut peut être `down` / `Unknown`.

```bash
doublezero status
```

**Succès :** `up`, User Type `IBRL`, Network `mainnet-beta`, tunnel typiquement `doublezero0`.

```bash
ip route
```

Attendez-vous à voir des routes apprises par BGP via `doublezero0`.

---

## Pièges courants

1. **Mauvais environnement.** Les paquets testnet / `DESIRED_DOUBLEZERO_ENV=testnet` ne fonctionneront pas sur mainnet-beta.
2. **Identité absente du gossip.** Les IDs invalides sur la même IP ne peuvent pas enregistrer la machine.
3. **Les backups doivent partager l'ID DoubleZero du principal.** Copiez `id.json` ; ne générez pas une seconde identité avec keygen.
4. **Signez avec l'identité du validateur**, pas avec la clé DoubleZero.
5. **Statut down pendant ~1 minute** après `connect ibrl` est normal pendant que le GRE s'établit.

---

## Voir aussi

- [Connexion Validateur Mainnet-Beta](DZ Mainnet-beta Connection.md)
- [Setup](setup.md)
- Suivant : [Publier des shreds (Edge)](solana-shreds-publisher-runbook.md)