# Tarification et Frais des Validateurs
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


**Tarification simple et alignée pour les validateurs Solana**

Les frais commenceront à l'époque 859, qui débute le samedi 4 octobre à 4h du matin ET. Des frais fixes de 5 % sont prélevés sur les récompenses de signature de blocs et les frais de priorité.

Les frais financent directement l'infrastructure qui rend DoubleZero possible. Y compris les lignes de fibre physiques et l'équipement dans les centres de données.

Une exploration approfondie de la raison d'être des frais et du modèle de tarification des validateurs se trouve [ici](https://doublezero.xyz/fees).

***Ce guide se concentre sur la façon dont les frais sont payés d'un point de vue technique.***

## **Modèle de Règlement**

- Les frais sont libellés en SOL et réglés par époque
- La dette du validateur est calculée on-chain par le programme de Distribution des Revenus
- Chaque validateur dispose d'un compte de dépôt (PDA) pour les paiements
- Fenêtre de financement : Les frais sont déposés pendant l'époque Solana suivant leur accumulation. C'est-à-dire que les frais accumulés pendant l'époque 860 doivent être payés à l'époque 861.

- Le pré-financement est pris en charge. Les soldes diminuent au fil des époques

---

# **Estimation des Frais**

Les estimations historiques et les données par clé publique sont disponibles dans le [Dépôt d'Estimation des Frais](http://github.com/doublezerofoundation/fees). Le dépôt ne remplace pas les données on-chain. Vous êtes responsable du solde on-chain, pas du solde dans ce dépôt.

Questions ? Contactez Nihar Shah à nihar@doublezero.us

# Détails pour les Développeurs

### Interface de Ligne de Commande
La CLI DoubleZero fournit des commandes pour gérer les dépôts des validateurs et surveiller les soldes.
Vous aurez besoin de SOL dans le compte depuis lequel vous exécutez ces commandes pour payer les frais de gaz.

<div data-wizard-step="fee-check" markdown>

### Étape 1 : Comprendre la Dette Due

Pour consulter la dette à une adresse spécifique, vous pouvez utiliser ce format :
```
doublezero-solana revenue-distribution fetch validator-debts --node-id ValidatorIdentity111111111111111111111111111
```
Nous examinerons un exemple de sortie ci-dessous :

```
| node_id                                      |    total_amount | deposit_balance | note                   |
|----------------------------------------------|-----------------|-----------------|------------------------|
| ValidatorIdentity111111111111111111111111111 | 0.632736605 SOL | 0.000220966 SOL | 0.632515639 SOL needed |
| ValidatorIdentity111111111111111111111111111 | 24.520162479 SOL| 0.000000000 SOL | Not funded             |
```
Dans l'exemple de sortie, deux résultats différents sont possibles sous `note`. `Not funded` signifie que le compte n'a pas été financé. Dans l'exemple, `0.632515639 SOL needed` est le montant SOL restant nécessaire pour payer toutes les dettes actuellement dues associées à l'ID Validateur cible.

</div>

<div data-wizard-step="fee-pay" markdown>

### Étape 2 : Payer la Dette Due

!!! note inline end
      Vous pouvez planifier l'exécution de cette commande à intervalles réguliers.

Pour rembourser la dette due, vous pouvez utiliser la commande suivante. Cela utilisera automatiquement la keypair par défaut dans `$HOME/.config/solana/id.json`

Vous pouvez spécifier la keypair avec laquelle vous souhaitez payer votre dette en ajoutant l'argument `-k path/to/keypair.json` à la fin de la commande.

```
doublezero-solana revenue-distribution validator-deposit --fund-outstanding-debt --node-id ValidatorIdentity111111111111111111111111111
```
Un exemple de sortie est fourni ci-dessous

```
Solana validator deposit: DZ_PDA_MvFTgPku3dUrw2W3dbeK5dhxmXYKKYETDUK1V
Funded: TransactionHashHVxSobvdY2r14CkEwsBDhwf2dBmFatyeftisrdfSocMM2tXPjFvXPRmVs1xagiqKSX4b92fgt
Node ID: ValidatorIdentity111111111111111111111111111
Balance: 0.309294915 SOL
```

`Solana validator deposit:` renvoie le compte de dépôt qui a été financé

`Funded:` renvoie le hash de transaction, que vous pouvez consulter dans votre explorateur Solana préféré

`Node ID:` renvoie l'ID Validateur pour lequel le paiement a été effectué

`Balance:` renvoie le montant de SOL dans le compte de dépôt, après le transfert terminé

</div>
