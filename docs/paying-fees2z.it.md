**Prima di accedere o utilizzare il codice o i materiali correlati, si prega di leggere il disclaimer.**

<!-- https://github.com/doublezerofoundation/doublezero-offchain/pull/159 -->

??? warning "Disclaimer"

    Il presente documento e il codice correlato vengono forniti esclusivamente a scopo informativo e tecnico. La funzionalità di conversione token descritta in questo documento è di tipo non-custodial. Gli utenti interagiscono direttamente con gli smart contract sottostanti, mantenendo sempre il controllo completo dei propri asset.

    Il sistema può dipendere da o interagire con codice di terze parti, fonti di dati o meccanismi di prezzo e commissioni (ad esempio smart contract, API o exchange decentralizzati) non sviluppati, gestiti o revisionati dagli sviluppatori e dagli emittenti. Non vengono fornite dichiarazioni o garanzie sull'accuratezza, la funzionalità o la sicurezza dei componenti di terze parti.
    Gli sviluppatori e gli emittenti di questo codice non garantiscono la sua accuratezza, completezza o disponibilità continua. Il codice e i materiali correlati vengono forniti "COSÌ COME SONO" e possono contenere errori, difetti o vulnerabilità. L'utilizzo è a proprio rischio.
    Gli sviluppatori e gli emittenti non riceveranno alcuna commissione per l'utilizzo di questi contratti. Non vi è alcun obbligo di mantenimento, aggiornamento o supporto del codice o della documentazione correlata.

    Il presente documento non costituisce un'offerta, una sollecitazione o una raccomandazione a partecipare alla conversione di token, allo scambio o ad altre transazioni. Non vengono forniti consulenze legali, finanziarie o di investimento.
    Gli utenti sono i soli responsabili della determinazione della legalità delle proprie attività. Prima di utilizzare il codice o partecipare alle conversioni, è necessario consultare le leggi e i regolamenti applicabili nella propria giurisdizione e consultare consulenti indipendenti. L'uso è vietato dove illegale, incluso da parte di persone o organizzazioni sanzionate o da regioni soggette a restrizioni.

    Nella misura massima consentita dalla legge, gli sviluppatori e gli emittenti declinano qualsiasi responsabilità per perdite, danni o reclami derivanti da o correlati all'uso del codice o alla partecipazione alle conversioni.

    La revisione e l'utilizzo del presente documento e del codice correlato sono soggetti ai [Termini di Utilizzo del Sito Web](https://doublezero.xyz/terms) e ai [Termini di Utilizzo del Protocollo](https://doublezero.xyz/terms-protocol).

I validatori possono pagare le commissioni in 2Z tramite il [programma di conversione](https://github.com/doublezerofoundation/doublezero-offchain/tree/main/crates/solana-interface/sol-conversion) on-chain. La conversione viene eseguita scambiando 2Z per SOL. Il saldo SOL dell'account di deposito viene aggiornato in base alla conversione.


Questo processo utilizza **sempre** incrementi di 1 SOL. Il risultato di questa conversione va **sempre** direttamente all'account di deposito. È unidirezionale: non è possibile recuperare 2Z o SOL da questa transazione. Viene inviata al modulo di distribuzione on-chain.


#### Passo 1
Prima controlla il tasso di conversione corrente


```
doublezero-solana revenue-distribution fetch sol-conversion
```


Output:
```
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 800.86265341  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 797.75530631  | Includes 0.38800000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```


#### Passo 2
Invia un ordine a prezzo limite. Questa conversione viene eseguita a tuo rischio. Non raccomandiamo alcuna propensione al rischio; l'esempio fornito qui è solo a scopo educativo.


##### Come costruire un ordine a prezzo limite
Sulla base dell'esempio sopra, invieremo un ordine a prezzo limite superiore del 5% al prezzo stimato.
797.76 * 1.05 = 837.65


In questo esempio, supponiamo che ci siano 0 SOL nell'account di deposito.


```
doublezero-solana revenue-distribution --convert-2z-limit-price 837.65 --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 --fund 1
```
Il `--fund 1` nel comando sopra aggiunge esplicitamente 1 SOL all'account di deposito.


La scelta di un numero diverso da 1 risulterà in un errore che ti notifica dell'importo errato:
```
Error: SOL amount must be 1.000000000 for 2Z -> SOL conversion. Got 1.500000000
```


Ti verrà chiesto di confermare la transazione:


```
⚠️  By specifying --convert-2z-limit-price, you are funding 1.000000000 SOL to your deposit account. Proceed? [y/N]
```


Output:
```
2Z token balance: 987241.76579348
Converted 2Z to SOL: 2iaBzd4vgEeDnpfSCD9aYFMWZ3UoVzrJfUjSMhsDhfSQ6isPZKkKe3ZWQ6b5aWvV3h8Vsk8Mmde6wmCiidD4Qc6s
Converted 837.65 2Z tokens to 1.000000000 SOL
```
Nota che dopo una conversione riuscita, il `Balance:` verrà aggiornato a 1 SOL.


Se il prezzo supera l'intervallo specificato, si verificherà il seguente tipo di errore:
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
