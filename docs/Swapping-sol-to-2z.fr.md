**Consultez l'Avertissement avant d'accéder ou d'utiliser le code ou tout matériel associé.**

<!-- https://github.com/malbeclabs/doublezero-offchain/pull/159 -->

??? warning "Avertissement"
    
    Ce document et le code associé sont fournis à des fins d'information et à des fins techniques uniquement. La fonctionnalité de conversion de jetons décrite ici est non-custodiale — les utilisateurs interagissent directement avec les contrats intelligents sous-jacents et conservent le contrôle total de leurs actifs à tout moment.

    Le système peut s'appuyer sur ou interagir avec du code tiers, des sources de données ou des mécanismes de tarification et de frais (par exemple, des contrats intelligents, des API ou des échanges décentralisés) qui ne sont pas développés, contrôlés ou examinés par le(s) développeur(s) ou le(s) éditeur(s). Aucune déclaration ni garantie n'est faite quant à l'exactitude, la fonctionnalité ou la sécurité de tout composant tiers.
    Le(s) développeur(s) et le(s) éditeur(s) de ce code ne garantissent pas son exactitude, son exhaustivité ou sa disponibilité continue. Le code et les matériels associés sont fournis « en l'état » et peuvent contenir des bogues, des erreurs ou des vulnérabilités. L'utilisation se fait entièrement à vos propres risques.
    Le(s) développeur(s) et le(s) éditeur(s) ne reçoivent aucuns frais en lien avec l'utilisation de ces contrats. Ils n'ont aucune obligation de maintenir, mettre à jour ou supporter le code ou la documentation associée.

    Ce document ne constitue pas une offre de vente, une sollicitation d'achat, ni une recommandation de participer à une conversion, un échange de jetons ou toute autre transaction. Aucun conseil juridique, financier ou en investissement n'est fourni.
    Les utilisateurs sont seuls responsables de déterminer la légalité de leurs activités. Ils doivent examiner les lois et réglementations applicables dans leur juridiction et consulter des conseillers indépendants avant d'utiliser le code ou de participer à toute conversion. L'utilisation est interdite lorsqu'elle serait illégale, y compris pour les personnes ou entités soumises à des sanctions ou dans des juridictions restreintes.

    Dans toute la mesure permise par la loi, le(s) développeur(s) et le(s) éditeur(s) déclinent toute responsabilité pour toute perte, dommage ou réclamation découlant de ou en relation avec l'utilisation du code ou la participation à la conversion.

    La consultation et l'utilisation de ce document et du code associé sont soumises aux [Conditions Générales du Site Web](https://doublezero.xyz/terms) et aux [Conditions Générales du Protocole](https://doublezero.xyz/terms-protocol).

Le protocole DoubleZero collecte des revenus libellés en SOL auprès de ses utilisateurs validateurs, mais distribue des récompenses libellées en 2Z aux contributeurs. Il doit donc convertir du SOL en 2Z.

**Pour ce faire, les participants éligibles peuvent effectuer des transactions contre un contrat de swap DoubleZero, en achetant du SOL au contrat et en le vendant contre du 2Z. La tarification est basée sur les flux de prix Pyth avec un mécanisme de remise programmatique.**

Ce court guide explique comment utiliser le programme.

***Consultez l'Avertissement à la fin de ce document avant d'accéder ou d'utiliser le code ou tout matériel associé.***

---

## Conception du Programme

Le programme de swap est essentiellement un pool de liquidité unilatéral qui vend du SOL par lots fixes de 1 SOL par transaction. Tout participant éligible peut retirer du SOL du programme en déposant du 2Z, à un prix déterminé par un prix oracle provenant de Pyth et une remise dynamique. Au fil du temps, cela accomplit l'objectif du programme de convertir des jetons natifs en 2Z.

Pour l'utiliser, un trader doit fournir deux prix Pyth récents (SOL/USD et 2Z/USD) ainsi qu'une quantité de 2Z. Le programme calcule ensuite la quantité de 2Z nécessaire pour acheter ce 1 SOL en se basant sur le prix implicite SOL/2Z. Il effectue ensuite quelques étapes supplémentaires :

- Il vérifie que les prix Pyth sont suffisamment récents, c'est-à-dire qu'ils ne sont pas périmés de plus de 5 secondes.
- Il vérifie que les intervalles de confiance des deux prix sont suffisamment petits. C'est-à-dire que la somme de deux écarts-types laplaciens (c'est-à-dire le paramètre `conf` dans le prix Pyth) pour les deux prix, normalisée par leurs niveaux, doit être inférieure ou égale à 30 points de base.
- Il ajuste le prix SOL/2Z par une remise dynamique, exprimée en pourcentage du prix Pyth. Cette remise est fonction du temps écoulé depuis la dernière transaction. La formule ci-dessous spécifie la remise, en supposant que la dernière transaction a été effectuée au slot $s_{\text{last}}$ et que le slot actuel est $s_{\text{now}}$. (Par exemple, si 200 slots se sont écoulés depuis la dernière transaction, la remise est de 40 points de base.)

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

À ce stade, si le trader a fourni suffisamment de 2Z pour exécuter la transaction à ce prix calculé (remise incluse), elle s'exécute à ce prix calculé. Le programme retourne au trader la quantité de SOL achetée ainsi que tout excédent de 2Z.

Le contrat n'autorise ensuite plus de transactions pour ce slot. Cela vise à empêcher le contrat de payer un slippage excessivement élevé dans le cas où le prix Pyth serait éloigné du vrai prix à un moment donné, d'une manière que les filtres existants ne détecteraient pas.

---

## Exécution Atomique Sans Frais de Gas

Cette section détaille comment utiliser la commande `harvest-dz`. Cette commande effectuera atomiquement 2 actions.
1. La commande demande une cotation auprès de Jupiter par rapport au programme natif de conversion SOL <> 2Z.
2. Lorsque la route Jupiter fournit plus de 2Z par SOL que ce que le programme natif de conversion requiert, `harvest-2z` exécute un swap, retournant à votre portefeuille 1 SOL plus la différence en 2Z.

### Récolter des 2Z

Pour exécuter, lancez la commande suivante :
```
doublezero-solana revenue-distribution harvest-2z
```
La sortie ressemblera à :
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
La commande peut également être simulée avec l'argument `--dry-run`. Le dry-run produira des logs de programme et une sortie ressemblant à :

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## Conversion du Protocole

Cette section traite de la vérification des taux de conversion et de l'exécution de la conversion à l'aide du CLI `doublezero-solana`. Et à la fin, nous présentons l'interface pour les intégrations personnalisées avec le contrat de swap DoubleZero.

### Comment vérifier le prix de conversion SOL/2Z via `doublezero-solana`

Pour trouver les taux de conversion SOL/2Z sur mainnet-beta, exécutez la commande suivante :

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

Et la sortie que vous verrez ressemblera à :

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

Le Journal Balance informe l'utilisateur de la quantité de liquidité SOL disponible dans le contrat intelligent de distribution des revenus. Un utilisateur peut effectuer une transaction tant que le Journal Balance dépasse la taille fixe de transaction de 1 SOL.

La première ligne affiche le « vrai » prix de conversion SOL/2Z via un oracle hors chaîne. La deuxième ligne est le prix de conversion utilisé on-chain pour le swap, qui ajuste simplement le vrai prix en tenant compte de la remise algorithmique.

### Comment convertir vos 2Z en SOL via `doublezero-solana`

Pour convertir vos jetons 2Z en SOL, exécutez la commande suivante :

```bash
doublezero-solana revenue-distribution convert-2z
```

Par défaut, s'il y a suffisamment de liquidité SOL et que votre ATA dispose de suffisamment de 2Z pour effectuer le swap, cette transaction réussira. Vous pouvez affiner le swap en spécifiant les arguments suivants :

```bash
      --limit-price <DECIMAL>                    Limit price defaults to the current SOL/2Z oracle price
      --source-2z-account <PUBKEY>               Token account must be owned by the signer. Defaults to signer ATA if not specified
      --checked-sol-amount <SOL>                 Explicitly check SOL amount. When specified, this amount will be checked against the fixed fill quantity
```

Le prix limite spécifié détermine le pire prix que vous êtes prêt à accepter lors de la conversion SOL/2Z. Par exemple, supposons que le prix 2Z avec remise pour le SOL est de 800, ce qui signifie 800 jetons 2Z pour 1 SOL. Si vous spécifiez un prix limite de 790, vous n'êtes pas disposé à effectuer le swap car vous exigez de ne swapper qu'au maximum 790 jetons 2Z pour 1 SOL. Mais si vous spécifiez 810, la transaction sera exécutée car vous étiez prêt à swapper au maximum 810 jetons 2Z (et dans ce cas, vous n'aurez swappé que 800 jetons 2Z dans cette transaction).

Le compte source de jetons 2Z remplace l'ATA par défaut utilisant le signataire comme propriétaire de cet ATA 2Z. Mais si vous avez un autre compte de jetons que vous souhaitez utiliser pour effectuer le swap, fournissez sa clé publique avec cet argument.

Optionnellement, vous pouvez spécifier le montant vérifié de SOL correspondant à la taille de remplissage standard (fixée à 1 SOL au lancement). S'il ne correspond pas à la taille de remplissage du programme, le swap échoue. Cela atténue le risque que la taille de remplissage du programme change sans que vous ne le remarquiez.

### Interface pour Acheter du SOL

L'interface et le CLI `doublezero-solana` se trouvent dans [ce dépôt](https://github.com/malbeclabs/doublezero-offchain). Le code source de l'interface du contrat de swap DoubleZero peut être trouvé [ici](https://github.com/malbeclabs/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09). L'ID du programme est `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`.

Un moyen pratique de générer les comptes nécessaires pour l'instruction d'achat de SOL est d'utiliser la méthode `new` (trouvée dans *instruction/account.rs*).

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

Le `fill_registry_key` peut être récupéré soit depuis le `ProgramState`

```rust
pub struct ProgramState {
    pub admin_key: Pubkey,
    pub fills_registry_key: Pubkey, // this key
    pub is_paused: bool,
    pub configuration_registry_bump: u8,
    pub program_state_bump: u8,
    pub deny_list_registry_bump: u8,
    pub withdraw_authority_bump: u8,
    pub last_trade_slot: u64,
    pub deny_list_authority: Pubkey,
}
```

Alternativement, vous pouvez appeler `getProgramAccounts` via Solana RPC avec son discriminateur. Mais nous recommandons de mettre en cache cette clé publique car elle ne changera jamais.

Le `user_key` est un signataire pour l'instruction d'achat de SOL et doit être le propriétaire du `user_token_account_key`. Comme décrit ci-dessus, il n'est PAS nécessaire que ce soit un ATA. Tant que votre compte de jetons 2Z est détenu par le `user_key`, cette instruction réussira.

La struct `BuySolAccounts` implémente `Into<Vec<AccountMeta>>` afin que vous puissiez générer tous les account metas nécessaires pour construire l'instruction.

Les données d'instruction sont :

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

Ces données d'instruction sont sérialisées en Borsh et possèdent un sélecteur Anchor de 8 octets, qui sera entièrement sérialisé lors de l'utilisation de `BorshSerialize::serialize`.

Les données de prix oracle peuvent être récupérées depuis ce point de terminaison public : [https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate). Les données sont désérialisables via serde en utilisant la struct OraclePriceData trouvée dans *oracle.rs*.

```rust
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default, PartialEq, Eq)]
#[cfg_attr(
    feature = "serde",
    derive(serde::Deserialize),
    serde(rename_all = "camelCase")
)]
pub struct OraclePriceData {
    pub swap_rate: u64,
    pub timestamp: i64,
    pub signature: String,
}
```

Exemple de récupération en utilisant le [crate reqwest](https://docs.rs/reqwest/latest/reqwest/) :

```rust
use anyhow::{Context, Result};

pub async fn try_request_oracle_conversion_price(oracle_endpoint: &str) -> Result<OraclePriceData> {
    reqwest::Client::new()
        .get(oracle_endpoint)
        .header("User-Agent", "SOL buyoooooooor")
        .send()
        .await?
        .json()
        .await
        .with_context(|| format!("Failed to request SOL/2Z price from {oracle_endpoint}"))
}
```

Avec l'ID du programme, les comptes et les données d'instruction, vous devriez être en mesure de construire l'instruction pour acheter du SOL auprès du contrat de swap DoubleZero.