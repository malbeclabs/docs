---
description: Runbook orienté LLM — configurer un validateur Solana connecté pour publier les shreds leader vers DoubleZero Edge. Servi au MCP via GitHub raw ; non publié sur le site de documentation.
---

# Publier des shreds (Edge) — runbook

Cette page est destinée au MCP DoubleZero (`get_onboarding_runbook`) via GitHub raw. Elle n'est
pas publiée sur le site de documentation.

1. Connectez le [MCP DoubleZero](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Confirmez que le validateur est **déjà sur DoubleZero IBRL** (mainnet-beta). Si ce n'est pas le cas, terminez d'abord [Connecter un validateur (IBRL Mainnet)](solana-ibrl-runbook.md).
3. Suivez les étapes ci-dessous. Guide utilisateur : [Validator Multicast Connection](Validator Multicast Connection.md).

**À quoi ressemble le succès :** le validateur envoie les shreds leader vers `233.84.178.1:7733`, la publication multicast sur `edge-solana-shreds` est active, et [publisher-check](https://data.doublezero.xyz/dz/publisher-check) indique la publication après au moins un slot leader.

Ce parcours est destiné aux **validateurs**. Les sociétés de trading qui souhaitent *s'abonner* utilisent [S'abonner aux shreds](solana-shreds-runbook.md).

---

## Prérequis

| Besoin | Notes |
|--------|--------|
| Tunnel IBRL déjà actif | [Runbook IBRL Mainnet](solana-ibrl-runbook.md) / [guide utilisateur](DZ Mainnet-beta Connection.md). |
| Client supporté | Jito-Agave **3.1.9+**, JitoBam 3.1.9+, Frankendancer, ou Harmonic **3.1.11+**. Les autres versions ne publieront pas. |
| Fenêtre de redémarrage | L'ajout de la destination shred nécessite un redémarrage du validateur. |

---

## Étapes

### 1. Pointer le client vers le groupe shred Edge

**Jito-Agave (v3.1.9+) et Harmonic (3.1.11+)** — dans le script de démarrage du validateur, ajoutez :

```text
--shred-receiver-address 233.84.178.1:7733
```

Vous pouvez envoyer vers Jito et `edge-solana-shreds` en même temps. Redémarrez le validateur.

**Frankendancer** — dans `config.toml` :

```toml
[tiles.shred]
additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
```

Redémarrez le validateur.

### 2. Publier sur le groupe multicast

```bash
doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds
```

**Vérification :** `doublezero status` indique toujours IBRL/up, et l'utilisateur est bien un publisher sur `edge-solana-shreds`.

IP des groupes en direct : `doublezero multicast group list`. Tous les flux shred utilisent UDP **`7733`** ; l'IP sélectionne le flux.

| Flux | Adresse |
|------|---------|
| `edge-solana-shreds` (leader) | `233.84.178.1:7733` |
| `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| `edge-solana-retrans-amer` | `233.84.178.14:7733` |

### 3. Confirmer la publication

Ouvrez [publisher-check](https://data.doublezero.xyz/dz/publisher-check). Vous ne verrez pas de confirmation tant que le validateur n'aura pas publié de shreds leader pendant **au moins un slot**.

Normal : pics sortants alignés avec les slots leader (en dents de scie). Un flux sortant constant sans motif de slot est du **retransmit** (mauvais).

---

## Pièges courants

1. **Mauvaise version du client.** Pas 3.1.9+ / 3.1.11+ → rien d'utile sur le réseau.
2. **Flag retransmit laissé actif.** Supprimez `--shred-retransmit-receiver-address` de Jito-Agave. Vérifiez la colonne **No Retransmit Shreds** sur publisher-check (vues 2-epoch vs recent-slot).
3. **Pas encore leader.** Le tableau de bord reste vide jusqu'à un slot leader.
4. **IBRL non actif.** Ne commencez pas ici ; terminez d'abord IBRL.

---

## Voir aussi

- [Validator Multicast Connection](Validator Multicast Connection.md)
- [Validator Rewards](Validator Rewards.md)