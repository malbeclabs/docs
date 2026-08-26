**Leggere il Disclaimer prima di accedere o utilizzare il codice o qualsiasi materiale correlato.**

<!-- https://github.com/malbeclabs/doublezero-offchain/pull/159 -->

??? warning "Disclaimer"
    
    Questo documento e il codice associato sono forniti esclusivamente a scopo informativo e tecnico. La funzionalità di conversione dei token descritta nel presente documento è non-custodial: gli utenti interagiscono direttamente con gli smart contract sottostanti e mantengono il pieno controllo dei propri asset in ogni momento.

    Il sistema può fare affidamento su o interagire con codice di terze parti, fonti di dati o meccanismi di pricing e commissioni (ad esempio, smart contract, API o exchange decentralizzati) che non sono sviluppati, controllati o revisionati dallo/dagli sviluppatore/i o editore/i. Non viene rilasciata alcuna dichiarazione o garanzia in merito all'accuratezza, alla funzionalità o alla sicurezza di qualsiasi componente di terze parti.
    Lo/gli sviluppatore/i e l'editore/i di questo codice non garantiscono la sua accuratezza, completezza o disponibilità continua. Il codice e i materiali correlati sono forniti "così come sono" e possono contenere bug, errori o vulnerabilità. L'utilizzo è interamente a proprio rischio.
    Lo/gli sviluppatore/i e l'editore/i non ricevono alcuna commissione in relazione all'utilizzo di questi contratti. Non hanno alcun obbligo di mantenere, aggiornare o supportare il codice o la documentazione correlata.

    Questo documento non costituisce un'offerta di vendita, una sollecitazione all'acquisto o una raccomandazione a partecipare a qualsiasi conversione di token, swap o altra transazione. Non viene fornita alcuna consulenza legale, finanziaria o di investimento.
    Gli utenti sono i soli responsabili nel determinare la legalità delle proprie attività. Dovrebbero esaminare le leggi e i regolamenti applicabili nella propria giurisdizione e consultare consulenti indipendenti prima di utilizzare il codice o partecipare a qualsiasi conversione. L'utilizzo è vietato laddove risulterebbe illegale, incluso per persone o entità soggette a sanzioni o in giurisdizioni con restrizioni.

    Nella misura massima consentita dalla legge, lo/gli sviluppatore/i e l'editore/i declinano ogni responsabilità per qualsiasi perdita, danno o reclamo derivante da o in relazione all'utilizzo del codice o alla partecipazione alla conversione.

    La consultazione e l'utilizzo di questo documento e del codice associato sono soggetti ai [Termini e Condizioni del Sito Web](https://doublezero.xyz/terms) e ai [Termini e Condizioni del Protocollo](https://doublezero.xyz/terms-protocol).

Il protocollo DoubleZero raccoglie entrate denominate in SOL dai suoi validatori utenti, ma distribuisce ricompense denominate in 2Z ai contributori. Pertanto, deve convertire SOL in 2Z.

**Per farlo, i partecipanti idonei possono operare contro uno swap contract di DoubleZero, acquistando SOL dal contratto e vendendo 2Z. Il pricing si basa sui price feed di Pyth con un meccanismo di sconto programmatico.**

Questa breve guida spiega come utilizzare il programma.

***Leggere il Disclaimer alla fine di questo documento prima di accedere o utilizzare il codice o qualsiasi materiale correlato.***

---

## Design del Programma

Il programma di swap è di fatto un pool di liquidità unilaterale che vende SOL in lotti fissi di 1 SOL per operazione. Qualsiasi partecipante idoneo può prelevare SOL dal programma depositando 2Z, a un prezzo determinato da un prezzo oracle da Pyth e uno sconto dinamico. Nel tempo, questo realizza l'obiettivo del programma di convertire token nativi in 2Z.

Per utilizzarlo, un trader deve fornire due prezzi Pyth recenti (SOL/USD e 2Z/USD) e una quantità di 2Z. Il programma calcola quindi la quantità di 2Z necessaria per acquistare 1 SOL sulla base del prezzo implicito SOL/2Z. Successivamente, esegue alcuni passaggi aggiuntivi:

- Verifica che i prezzi Pyth siano sufficientemente aggiornati, ovvero che non siano obsoleti da più di 5 secondi.
- Verifica che gli intervalli di confidenza dei due prezzi siano sufficientemente piccoli. Ovvero, la somma di due deviazioni standard laplaciane (cioè il parametro `conf` nel prezzo Pyth) per i due prezzi, normalizzata per i rispettivi livelli, deve essere inferiore o uguale a 30 punti base.
- Regola il prezzo SOL/2Z con uno sconto dinamico, espresso come percentuale del prezzo Pyth. Questo sconto è una funzione del tempo trascorso dall'ultima operazione. La formula seguente specifica lo sconto, assumendo che l'ultima operazione sia stata effettuata allo slot $s_{\text{last}}$ e lo slot corrente sia $s_{\text{now}}$. (Ad esempio, se sono trascorsi 200 slot dall'ultima operazione, lo sconto è di 40 punti base.)

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

A questo punto, se il trader ha fornito abbastanza 2Z per eseguire la transazione a questo prezzo calcolato (incluso lo sconto), l'operazione viene eseguita a questo prezzo calcolato. Al trader viene restituita la quantità di SOL acquistata e l'eventuale eccedenza di 2Z.

Il contratto non consente ulteriori operazioni per quello slot. Questo serve a impedire che il contratto paghi uno slippage eccessivamente alto nel caso in cui il prezzo Pyth sia lontano dal prezzo reale in un dato momento, in modi che i filtri esistenti non riescano a rilevare.

---

## Esecuzione Atomica Senza Gas

Questa sezione descrive come utilizzare il comando `harvest-dz`. Questo comando eseguirà atomicamente 2 azioni.
1. Il comando richiede una quotazione da Jupiter rispetto al programma nativo di conversione SOL <> 2Z.
2. Quando il percorso Jupiter offre più 2Z per SOL rispetto a quanto richiesto dal programma di conversione nativo, `harvest-2z` esegue uno swap, restituendo al tuo wallet 1 SOL più la differenza in 2Z.

### Harvest 2Z

Per eseguire, lancia il seguente comando:
```
doublezero-solana revenue-distribution harvest-2z
```
L'output sarà simile a:
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
Il comando può anche essere simulato con l'argomento `--dry-run`. Il dry-run produrrà i log del programma e un output simile a:

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## Conversione del Protocollo

Questa sezione illustra come verificare i tassi di conversione ed eseguire la conversione utilizzando la CLI `doublezero-solana`. Alla fine, discutiamo l'interfaccia per integrazioni personalizzate con lo swap contract di DoubleZero.

### Come verificare il prezzo di conversione SOL/2Z tramite `doublezero-solana`

Per trovare i tassi di conversione SOL/2Z su mainnet-beta, eseguire il seguente comando:

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

L'output che vedrai sarà simile a:

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

Il Journal Balance informa l'utente sulla quantità di liquidità SOL presente nello smart contract Revenue Distribution. Un utente può operare finché il Journal Balance supera la dimensione fissa dell'operazione di 1 SOL.

La prima riga mostra il prezzo di conversione SOL/2Z "reale" tramite un oracle offchain. La seconda riga è il prezzo di conversione utilizzato on-chain per lo swap, che semplicemente aggiusta il prezzo reale applicando lo sconto algoritmico.

### Come convertire i tuoi 2Z in SOL tramite `doublezero-solana`

Per convertire i tuoi token 2Z in SOL, eseguire il seguente comando:

```bash
doublezero-solana revenue-distribution convert-2z
```

Per impostazione predefinita, se c'è sufficiente liquidità SOL e il tuo ATA ha abbastanza 2Z per eseguire lo swap, questa transazione avrà successo. Puoi perfezionare lo swap specificando i seguenti argomenti:

```bash
      --limit-price <DECIMAL>                    Limit price defaults to the current SOL/2Z oracle price
      --source-2z-account <PUBKEY>               Token account must be owned by the signer. Defaults to signer ATA if not specified
      --checked-sol-amount <SOL>                 Explicitly check SOL amount. When specified, this amount will be checked against the fixed fill quantity
```

Il prezzo limite specificato determina il prezzo peggiore che sei disposto ad accettare quando esegui la conversione SOL/2Z. Ad esempio, supponiamo che il prezzo scontato in 2Z per SOL sia 800, il che significa 800 token 2Z per 1 SOL. Se specifichi un prezzo limite di 790, non sei disposto a eseguire lo swap perché stai richiedendo di scambiare al massimo 790 token 2Z per 1 SOL. Ma se specifichi 810, l'operazione andrà a buon fine perché eri disposto a scambiare al massimo 810 token 2Z (e in questo caso, avrai scambiato solo 800 token 2Z in questa transazione).

L'account token 2Z di origine sovrascrive l'ATA predefinito utilizzando il firmatario come proprietario di questo ATA 2Z. Ma se hai un altro account token che desideri utilizzare per eseguire lo swap, fornisci la pubkey corrispondente con questo argomento.

Facoltativamente, puoi specificare l'importo SOL verificato alla dimensione di fill standard (impostata a 1 SOL al lancio). Se non corrisponde alla dimensione di fill del programma, lo swap fallisce. Questo mitiga il rischio che la dimensione di fill del programma cambi senza che tu te ne accorga.

### Interfaccia per Acquistare SOL

L'interfaccia e la CLI `doublezero-solana` si trovano in [questo repository](https://github.com/malbeclabs/doublezero-offchain). Il codice sorgente per l'interfaccia dello swap contract di DoubleZero è disponibile [qui](https://github.com/malbeclabs/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09). Il program ID è `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`.

Un modo conveniente per generare gli account necessari per l'istruzione buy SOL è utilizzare il metodo `new` (che si trova in *instruction/account.rs*).

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

La `fill_registry_key` può essere ottenuta dal `ProgramState`

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

In alternativa, puoi chiamare `getProgramAccounts` tramite Solana RPC con il suo discriminatore. Ma raccomandiamo di memorizzare in cache questa pubkey poiché non cambierà mai.

La `user_key` è un firmatario per l'istruzione buy SOL e deve essere il proprietario della `user_token_account_key`. Come descritto sopra, questo NON deve necessariamente essere un ATA. A condizione che il tuo account token 2Z sia posseduto dalla `user_key`, questa istruzione avrà successo.

La struct `BuySolAccounts` implementa `Into<Vec<AccountMeta>>` così puoi generare tutti gli account meta necessari per costruire l'istruzione.

I dati dell'istruzione sono

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

Questi dati dell'istruzione sono serializzati con Borsh e hanno un selettore Anchor di 8 byte, che verranno tutti serializzati utilizzando `BorshSerialize::serialize`.

I dati del prezzo oracle possono essere ottenuti da questo endpoint pubblico: [https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate). I dati sono deserializzabili con serde utilizzando la struct OraclePriceData che si trova in *oracle.rs*.

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

Esempio di come effettuare la richiesta utilizzando il [crate reqwest](https://docs.rs/reqwest/latest/reqwest/):

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

Con il program ID, gli account e i dati dell'istruzione, dovresti essere in grado di costruire l'istruzione per acquistare SOL dallo swap contract di DoubleZero.