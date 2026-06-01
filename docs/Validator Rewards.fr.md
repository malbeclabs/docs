# Récompenses des validateurs
!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol)"

Les validateurs qui publient des leader shreds vers DoubleZero Edge reçoivent des récompenses à chaque époque. Avant que les récompenses puissent être versées, chaque validateur doit enregistrer **où** les récompenses sont envoyées en configurant un compte `ValidatorPublisherRewards` sur Solana. Ce compte stocke :

- le **mint des récompenses** — le jeton dans lequel les récompenses sont versées, 2z (sauf modification manuelle)
- le **propriétaire des récompenses** — le portefeuille qui détient le compte de jetons associé (ATA) recevant les récompenses

La commande `configure` définira ces champs, et les versements automatiques se feront époque par époque par la suite. Vous pouvez relancer `configure` ultérieurement pour modifier l'un ou l'autre champ.

!!! info "Si vous n'avez pas encore terminé la [Configuration](setup.md), la [Connexion Validateur Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) et la [Connexion Multicast Validateur](Validator%20Multicast%20Connection.md), faites-le d'abord."

## Prérequis

- Validateurs publiant des leader shreds — voir [Connexion Multicast Validateur](Validator%20Multicast%20Connection.md).
- La dernière version du CLI `doublezero-solana` : `sudo apt update && sudo apt install doublezero-solana`, au minimum `0.5.6`.
- Accès à la **paire de clés d'identité du validateur**, soit sur la même machine, soit conservée hors ligne avec la possibilité de signer un message.
- Une clé publique de portefeuille de destination qui détiendra l'ATA des récompenses.

---

## 1. Choisir un chemin d'authentification

La configuration du compte de récompenses nécessite une autorisation de la clé d'identité du validateur. Il existe deux façons de la fournir :

| Chemin | Quand l'utiliser |
|---|---|
| **Direct** | La paire de clés d'identité du validateur se trouve sur la machine depuis laquelle vous exécutez les commandes. |
| **Hors chaîne** | La paire de clés d'identité du validateur est conservée hors ligne ou sur une machine distincte de celle du portefeuille payeur de frais. |

---

## 2a. Chemin direct

Exécutez `configure` avec la paire de clés d'identité du validateur en tant que `-k`.

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    -k <path-to-validator-identity-keypair.json>
```
Exemple de sortie
```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         direct
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```
`Configured validator publisher rewards: ` affiche la transaction que vous pouvez consulter dans un explorateur de blocs.

| Drapeau | Description |
|---|---|
| `--node-id` | Clé publique d'identité du nœud validateur. |
| `--rewards-token-owner` | Portefeuille qui détiendra l'ATA recevant les récompenses. |
| `--rewards-token-mint` | Le jeton dans lequel les récompenses seront reçues, `2z`. Les jetons pris en charge incluent également `usdc` et `wsol`. |
| `-k` | Chemin vers la paire de clés d'identité du validateur. Sur le chemin direct, la clé publique de la paire de clés doit correspondre à `--node-id`, sinon la commande échouera et vous indiquera de passer au chemin hors chaîne. |

L'ATA est automatiquement initialisé dans la même transaction s'il n'existe pas encore.

Passez directement à l'[étape 3](#3-verifier-la-configuration).

---

## 2b. Chemin hors chaîne

Trois sous-étapes : préparer, signer, configurer.

### 2b.i. Préparer le message hors chaîne

Exécutez ceci n'importe où — c'est en lecture seule et ne nécessite pas la paire de clés d'identité du validateur. La commande affiche le blob hexadécimal à signer et le slot absolu auquel la signature expire.

```bash
doublezero-solana shreds publisher-rewards prepare-offchain-message \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --valid-for 1h
```
Exemple de sortie

```bash
Hex message:    123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3
Deadline slot:  422954444

Sign with:
  solana sign-offchain-message 123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3 --keypair <validator-identity>

Then submit:
  doublezero-solana shreds publisher-rewards configure \
    --node-id ValidatorIdentity111111111111111111111111111 --rewards-token-mint J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd --rewards-token-owner Wallet567Identity111111111111111111111111111 \
    --deadline-slot 422954444 --signature <BASE58>
```


| Drapeau | Description |
|---|---|
| `--node-id` | Clé publique d'identité du nœud validateur. |
| `--rewards-token-owner` | Portefeuille qui détiendra l'ATA recevant les récompenses. |
| `--rewards-token-mint` | Le jeton dans lequel les récompenses seront reçues, `2z`. Les jetons pris en charge incluent également `usdc` et `wsol`. |
| `--valid-for` | Durée de vie de la signature relative au slot actuel. Accepte `<n>s`, `<n>m` ou `<n>h`. Par défaut : `1h`. |
| `--deadline-slot` | Alternative à `--valid-for` : slot absolu auquel l'autorisation expire. Mutuellement exclusif avec `--valid-for`. |
| `--json` | Émet du JSON (`{ hex, deadline_slot }`) au lieu du résumé lisible. |

La commande affiche le message d'authentification encodé en hexadécimal, le slot limite résolu et des extraits de commandes shell prêts à l'emploi pour les deux étapes suivantes.

### 2b.ii. Signer le message

Sur la machine qui détient la paire de clés d'identité du validateur :

```bash
solana sign-offchain-message <123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3> \
--keypair <path-to-validator-identity-keypair.json>
```

Cela affiche une signature en base58.

Exemple de sortie

```bash
SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp
```

### 2b.iii. Soumettre `configure`

De retour sur la machine avec votre portefeuille payeur de frais :

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --signature <SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp> \
    --deadline-slot <DEADLINE_SLOT>
```

`--signature` et `--deadline-slot` doivent être passés ensemble. Les valeurs doivent correspondre à celles produites aux étapes 2b.i et 2b.ii.

L'ATA est automatiquement initialisé dans la même transaction s'il n'existe pas encore.


Exemple de sortie

```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         offchain
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```

---

## 3. Vérifier la configuration

```bash
doublezero-solana shreds publisher-rewards show --node-id <NODE_ID>
```

La commande affiche le `Node ID`, le `Rewards owner`, le `Rewards mint`, l'adresse ATA résolue et le statut de l'ATA. Le **Resolved ATA** est l'adresse déterministe dérivée du propriétaire des récompenses + du mint des récompenses — c'est là que les récompenses seront déposées à chaque époque.

---

## Dépannage

### Chemin direct : la clé publique de `-k` ne correspond pas à `--node-id`

La paire de clés du payeur de frais que vous avez fournie n'est pas l'identité du validateur. Passez soit la paire de clés d'identité du validateur en tant que `-k`, soit basculez vers le [chemin hors chaîne](#2b-chemin-hors-chaine).

### Signature expirée

Chaque signature hors chaîne a un slot limite. Si trop de temps s'écoule entre `prepare-offchain-message` et `configure`, relancez `prepare-offchain-message`, re-signez et re-soumettez. La validité par défaut est de 1 heure — prolongez avec `--valid-for 4h` ou similaire si vous avez besoin de plus de temps pour un processus de signature hors ligne.