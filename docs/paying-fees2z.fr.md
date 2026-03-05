**Lisez le Avertissement avant d'accéder ou d'utiliser le code ou tout matériel associé.**

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

Les validateurs peuvent payer leurs frais en 2Z via un [programme de swap](https://github.com/doublezerofoundation/doublezero-offchain/tree/main/crates/solana-interface/sol-conversion) onchain. Le swap est effectué en échangeant des 2Z contre des SOL. Le solde SOL de votre compte de dépôt sera mis à jour en fonction du swap.


Ce processus utilisera **toujours** des incréments de 1 SOL. Le résultat de ce swap sera **toujours** déposé directement dans votre compte de dépôt. C'est un sens unique, vous ne pouvez pas récupérer les 2Z ou SOL de cette transaction. Ils seront envoyés à un module de distribution onchain.


#### Étape 1
Déterminez d'abord quel est le taux de conversion actuel


```
doublezero-solana revenue-distribution fetch sol-conversion
```


sortie :
```
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 800.86265341  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 797.75530631  | Includes 0.38800000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```


#### Étape 2
Placez un ordre limité. Vous exécuterez ce swap à vos propres risques. Nous ne faisons pas de recommandations sur le profil de risque, et les exemples fournis ici sont à des fins éducatives.


##### Comment structurer un ordre limité
Sur la base de l'exemple ci-dessus, nous allons maintenant placer un ordre limité 5% au-dessus du prix coté.
797.76 * 1.05 = 837.65


Dans cet exemple, nous supposons que le compte de dépôt a 0 SOL.


```
doublezero-solana revenue-distribution --convert-2z-limit-price 837.65 --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 --fund 1
```
Remarquez dans la commande ci-dessus `--fund 1`, cela finance explicitement 1 SOL dans le compte de dépôt.


Si vous choisissez un nombre autre que 1, vous déclencherez une erreur indiquant le montant incorrect :
```
Error: SOL amount must be 1.000000000 for 2Z -> SOL conversion. Got 1.500000000
```


Il vous sera demandé de confirmer la transaction :


```
⚠️  By specifying --convert-2z-limit-price, you are funding 1.000000000 SOL to your deposit account. Proceed? [y/N]
```


sortie :
```
2Z token balance: 987241.76579348
Converted 2Z to SOL: 2iaBzd4vgEeDnpfSCD9aYFMWZ3UoVzrJfUjSMhsDhfSQ6isPZKkKe3ZWQ6b5aWvV3h8Vsk8Mmde6wmCiidD4Qc6s
Converted 837.65 2Z tokens to 1.000000000 SOL
```
Remarquez que lors d'un swap réussi, le `Balance:` a été mis à jour à 1 SOL.


Si un prix est hors de la plage spécifiée, vous rencontrerez une erreur telle que :
```
Error: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x177f; 10 log messages:
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs invoke [1]
 Program log: Instruction: BuySol
 Program log: Signature verified successfully
 Program log: Timestamp verified successfully
 Program log: Bid price 79500000000
 Program log: Ask price 79862251144
 Program data: 1fxoRNOEulcAypo7AAAAAAC7kYISAAAAiD4pmBIAAAAsk/ZoAAAAAA4PxjWjgr+ERO7jDdvoOmT/WpgDFLfY+FGKKDdOw4PMAAAAAAAAAAA=
 Program log: AnchorError thrown in on-chain/programs/converter-program/src/buy_sol.rs:142. Error Code: BidTooLow. Error Number: 6015. Error Message: Provided bid is too low.
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs consumed 50754 of 90000 compute units
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs failed: custom program error: 0x177f
```

