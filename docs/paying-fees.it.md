# Prezzi e Commissioni per Validatori
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


**Prezzi semplici e allineati per i validatori Solana**

Le commissioni inizieranno dall'epoca 859, che inizia sabato 4 ottobre alle 4:00 ET. Viene applicata una commissione fissa del 5% sulle ricompense per la firma dei blocchi e sulle commissioni prioritarie.

Le commissioni finanziano direttamente l'infrastruttura che rende possibile DoubleZero, incluse le linee in fibra fisica e le apparecchiature nei data center.

Un'esplorazione approfondita del perché esistono le commissioni e del modello di prezzi per i validatori è disponibile [qui](https://doublezero.xyz/fees).

***Questa guida si concentra su come vengono pagate le commissioni dal punto di vista tecnico.***

## **Modello di Liquidazione**

- Le commissioni sono denominate in SOL e liquidate per epoca
- Il debito del validatore viene calcolato on-chain dal programma Revenue Distribution
- Ogni validatore ha un account di deposito (PDA) per i pagamenti
- Finestra di finanziamento: Le commissioni vengono depositate durante l'epoca Solana successiva alla loro maturazione. Ovvero, le commissioni accumulate durante l'epoca 860 devono essere pagate nell'epoca 861.

- Il pre-finanziamento è supportato. I saldi si riducono tra le epoche

---

# **Stima delle Commissioni**

Stime storiche e dati per chiave pubblica sono disponibili nel [Repository Stime Commissioni](http://github.com/doublezerofoundation/fees). Il repository non sostituisce i dati on-chain. Sei responsabile del saldo on-chain, non del saldo in questo repository.

Domande? Contatta Nihar Shah a nihar@doublezero.us

# Dettagli per Sviluppatori

### Interfaccia a Riga di Comando
La CLI DoubleZero fornisce comandi per gestire i depositi dei validatori e monitorare i saldi.
Avrai bisogno di SOL nell'account da cui esegui questi comandi per pagare il gas.

<div data-wizard-step="fee-check" markdown>

### Passo 1: Comprendere il Debito Dovuto

Per visualizzare il debito a un indirizzo specifico puoi usare questo formato:
```
doublezero-solana revenue-distribution fetch validator-debts --node-id ValidatorIdentity111111111111111111111111111
```
Esaminiamo un esempio di output di seguito:

```
| node_id                                      |    total_amount | deposit_balance | note                   |
|----------------------------------------------|-----------------|-----------------|------------------------|
| ValidatorIdentity111111111111111111111111111 | 0.632736605 SOL | 0.000220966 SOL | 0.632515639 SOL needed |
| ValidatorIdentity111111111111111111111111111 | 24.520162479 SOL| 0.000000000 SOL | Not funded             |
```
Nell'output di esempio ci sono due possibili output sotto `note`. `Not funded` significa che l'account non è stato finanziato. Nell'esempio, `0.632515639 SOL needed` è l'importo in sospeso di SOL necessario per pagare tutti i debiti attualmente dovuti associati all'ID Validatore target.

</div>

<div data-wizard-step="fee-pay" markdown>

### Passo 2: Pagare il Debito Dovuto

!!! note inline end
      Puoi pianificare l'esecuzione di questo comando a intervalli regolari.

Per pagare il debito dovuto puoi usare il seguente comando. Utilizzerà automaticamente il keypair predefinito in `$HOME/.config/solana/id.json`

Puoi specificare il keypair con cui vuoi pagare il debito aggiungendo l'argomento `-k path/to/keypair.json` alla fine del comando.

```
doublezero-solana revenue-distribution validator-deposit --fund-outstanding-debt --node-id ValidatorIdentity111111111111111111111111111
```
Di seguito è fornito un esempio di output

```
Solana validator deposit: DZ_PDA_MvFTgPku3dUrw2W3dbeK5dhxmXYKKYETDUK1V
Funded: TransactionHashHVxSobvdY2r14CkEwsBDhwf2dBmFatyeftisrdfSocMM2tXPjFvXPRmVs1xagiqKSX4b92fgt
Node ID: ValidatorIdentity111111111111111111111111111
Balance: 0.309294915 SOL
```

`Solana validator deposit:` restituisce l'account di deposito che è stato finanziato

`Funded:` restituisce l'hash della transazione, che puoi cercare nel tuo explorer Solana preferito

`Node ID:` restituisce l'ID Validatore per cui è stato effettuato il pagamento

`Balance:` restituisce l'importo di SOL nell'account di deposito, dopo il completamento del trasferimento

</div>
