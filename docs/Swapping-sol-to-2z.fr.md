**Lisez le Avertissement avant d'accéder ou d'utiliser le code ou tout matériel associé.**
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


<!-- https://github.com/doublezerofoundation/doublezero-offchain/pull/159 -->

??? warning "Avertissement"

    Ce document et le code associé sont fournis à des fins d'information et techniques uniquement. La fonctionnalité de conversion de tokens décrite ici est non-custodiale — les utilisateurs interagissent directement avec les contrats intelligents sous-jacents et conservent le plein contrôle de leurs actifs à tout moment.

    Le système peut s'appuyer sur ou interagir avec du code tiers, des sources de données, ou des mécanismes de tarification et de frais (par exemple, des contrats intelligents, des API, ou des échanges décentralisés) qui ne sont pas développés, contrôlés, ou examinés par le(s) développeur(s) ou éditeur(s). Aucune représentation ou garantie n'est faite quant à l'exactitude, la fonctionnalité, ou la sécurité de tout composant tiers.
    Le(s) développeur(s) et éditeur(s) de ce code ne garantissent pas son exactitude, son exhaustivité, ou sa disponibilité continue. Le code et les matériaux associés sont fournis "tels quels", et peuvent contenir des bugs, des erreurs, ou des vulnérabilités. L'utilisation est entièrement à vos propres risques.
    Le(s) développeur(s) et éditeur(s) ne reçoivent aucuns frais en rapport avec l'utilisation de ces contrats. Ils n'ont aucune obligation de maintenir, mettre à jour, ou soutenir le code ou la documentation associée.

    Ce document ne constitue pas une offre de vente, une sollicitation d'achat, ou une recommandation de participer à une conversion de tokens, un échange ou une autre transaction. Aucun conseil juridique, financier, ou d'investissement n'est fourni.
    Les utilisateurs sont seuls responsables de déterminer la légalité de leurs activités. Ils doivent examiner les lois et réglementations applicables dans leur juridiction et consulter des conseillers indépendants avant d'utiliser le code ou de participer à une conversion. L'utilisation est interdite là où elle serait illégale, y compris par des personnes ou entités soumises à des sanctions ou dans des juridictions restreintes.

    Dans la mesure maximale permise par la loi, le(s) développeur(s) et éditeur(s) déclinent toute responsabilité pour toute perte, dommage, ou réclamation découlant de ou en rapport avec l'utilisation du code ou la participation à la conversion.

    L'examen et l'utilisation de ce document et du code associé sont soumis aux [Conditions Générales du Site Web](https://doublezero.xyz/terms) et aux [Conditions Générales du Protocole](https://doublezero.xyz/terms-protocol).

Le protocole DoubleZero collecte des revenus libellés en SOL auprès de ses validateurs mais distribue des récompenses libellées en 2Z aux contributeurs. Il doit donc convertir des SOL en 2Z.

**Pour ce faire, les participants éligibles peuvent trader contre un contrat de swap DoubleZero, en achetant des SOL au contrat et en vendant des 2Z. La tarification est basée sur les flux de prix Pyth avec un mécanisme de remise programmatique.**

Ce court guide explique comment utiliser le programme.

***Lisez l'Avertissement à la fin de ce document avant d'accéder ou d'utiliser le code ou tout matériel associé.***

---

## Conception du Programme

Le programme de swap est effectivement un pool de liquidité unilatéral qui vend des SOL par lots fixes de 1 SOL par trade. Tout participant éligible peut retirer des SOL du programme en déposant des 2Z, à un prix déterminé par un prix oracle de Pyth et une remise dynamique. Au fil du temps, cela exécute l'objectif du programme de convertir les tokens natifs en 2Z.

Pour l'utiliser, un trader doit fournir deux prix Pyth récents (SOL/USD et 2Z/USD) et une quantité de 2Z. Le programme calcule ensuite les 2Z nécessaires pour acheter ce 1 SOL sur la base du prix implicite SOL/2Z. Il prend ensuite quelques étapes supplémentaires :

- Il vérifie que les prix Pyth sont suffisamment frais, c'est-à-dire qu'ils ne sont pas périmés de plus de 5 secondes.
- Il vérifie que les intervalles de confiance des deux prix sont suffisamment petits. C'est-à-dire que la somme de deux écarts-types de Laplace (c'est-à-dire le paramètre `conf` dans le prix Pyth) pour les deux prix, normalisée par leurs niveaux, doit être inférieure ou égale à 30 points de base.
- Il ajuste le prix SOL/2Z par une remise dynamique, exprimée en pourcentage du prix Pyth. Cette remise est une fonction du temps écoulé depuis le dernier trade. La formule ci-dessous spécifie la remise, en supposant que le dernier trade a été effectué au slot $s_{\text{last}}$ et que le slot actuel est $s_{\text{now}}$. (Par exemple, si 200 slots se sont écoulés depuis le dernier trade, la remise est de 40 points de base.)

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

À ce stade, si le trader a fourni suffisamment de 2Z pour exécuter la transaction à ce prix calculé (remise incluse), elle s'exécute à ce prix calculé. Il retourne au trader la quantité de SOL achetée et tout excédent de 2Z.

Le contrat ne permet ensuite plus aucun trade pour ce slot. Ceci est pour empêcher le contrat de payer un slippage excessivement élevé si le prix Pyth est loin du vrai prix à un moment donné d'une manière que les filtres existants ne détectent pas.

---

## Exécution Atomique Sans Gaz

Cette section détaillera comment utiliser la commande `harvest-dz`. Cette commande effectuera atomiquement 2 actions.
1. La commande demande un devis à Jupiter contre le programme de conversion natif SOL <> 2Z.
2. Lorsque la route Jupiter rapporte plus de 2Z par SOL que ce que le programme de conversion natif requiert, `harvest-2z` exécute un swap, retournant à votre portefeuille 1 SOL plus la différence en 2Z.

### Harvest 2Z

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

Cette section traite de la vérification des taux de conversion et de l'exécution de la conversion à l'aide de la CLI `doublezero-solana`. Et à la fin, nous discutons de l'interface pour les intégrations personnalisées avec le contrat de swap DoubleZero.

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

Le Journal Balance informe l'utilisateur de la liquidité SOL disponible dans le contrat intelligent de Distribution des Revenus. Un utilisateur peut trader tant que le Journal Balance dépasse la taille de trade fixe de 1 SOL.

La première ligne affiche le "vrai" prix de conversion SOL/2Z via un oracle hors chaîne. La deuxième ligne est le prix de conversion utilisé onchain pour le swap, qui ajuste simplement le vrai prix pour la remise algorithmique.

### Comment convertir vos 2Z en SOL via `doublezero-solana`

Pour convertir vos tokens 2Z en SOL, exécutez la commande suivante :

```bash
doublezero-solana revenue-distribution convert-2z
```

Par défaut, si il y a suffisamment de liquidité SOL et que votre ATA a suffisamment de 2Z pour effectuer le swap, cette transaction réussira. Vous pouvez affiner davantage le swap en spécifiant les arguments suivants :

```bash
      --limit-price <DECIMAL>                    Limit price defaults to the current SOL/2Z oracle price
      --source-2z-account <PUBKEY>               Token account must be owned by the signer. Defaults to signer ATA if not specified
      --checked-sol-amount <SOL>                 Explicitly check SOL amount. When specified, this amount will be checked against the fixed fill quantity
```

Le prix limite spécifié détermine le prix dans le pire cas que vous êtes prêt à accepter lors de l'exécution de la conversion SOL/2Z. Par exemple, supposons que le prix 2Z actualisé pour le SOL soit de 800, ce qui signifie 800 tokens 2Z pour 1 SOL. Si vous spécifiez un prix limite de 790, vous n'êtes pas prêt à effectuer le swap parce que vous exigez d'échanger au maximum 790 tokens 2Z pour 1 SOL. Mais si vous spécifiez 810, le trade passera parce que vous étiez prêt à échanger au maximum 810 tokens 2Z (et dans ce cas, vous n'aurez échangé que 800 tokens 2Z dans cette transaction).

Le compte de tokens 2Z source remplace l'ATA par défaut en utilisant le signataire comme propriétaire de cet ATA 2Z. Mais si vous avez un autre compte de tokens que vous souhaitez utiliser pour effectuer le swap, fournissez la pubkey avec cet argument.

Optionnellement, vous pouvez spécifier le montant SOL vérifié à la taille de remplissage standard (fixée à 1 SOL au lancement). Si elle ne correspond pas à la taille de remplissage du programme, le swap échoue. Cela atténue le risque que la taille de remplissage du programme change et que vous ne le remarquiez pas.

### Interface pour Acheter des SOL

L'interface et la CLI `doublezero-solana` se trouvent dans [ce dépôt](https://github.com/doublezerofoundation/doublezero-offchain). Le code source de l'interface du contrat de swap DoubleZero peut être trouvé [ici](https://github.com/doublezerofoundation/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09). L'ID du programme est `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`.

Une façon pratique de générer les comptes nécessaires pour l'instruction d'achat de SOL est d'utiliser la méthode `new` (trouvée dans *instruction/account.rs*).

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

La `fill_registry_key` peut être récupérée soit depuis le `ProgramState`

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

Alternativement, vous pouvez appeler `getProgramAccounts` via le RPC Solana avec son discriminateur. Mais nous recommandons de mettre cette pubkey en cache car elle ne changera jamais.

La `user_key` est un signataire pour l'instruction d'achat de SOL et doit être le propriétaire du `user_token_account_key`. Comme décrit ci-dessus, cela N'a PAS besoin d'être un ATA. Tant que votre compte de tokens 2Z est détenu par la `user_key`, cette instruction réussira.

La struct `BuySolAccounts` implémente `Into<Vec<AccountMeta>>` afin que vous puissiez générer tous les account metas dont vous avez besoin pour construire l'instruction.

Les données d'instruction sont

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

Ces données d'instruction sont sérialisées en Borsh et ont un sélecteur Anchor de 8 octets, qui sera tout sérialisé lors de l'utilisation de `BorshSerialize::serialize`.

Les données de prix oracle peuvent être récupérées depuis cet endpoint public : [https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate). Les données sont désérialisables avec serde en utilisant la struct OraclePriceData trouvée dans *oracle.rs*.

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

Exemple de récupération avec le [crate reqwest](https://docs.rs/reqwest/latest/reqwest/) :

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

Avec l'ID du programme, les comptes et les données d'instruction, vous devriez être en mesure de construire l'instruction pour acheter des SOL depuis le contrat de swap DoubleZero.

