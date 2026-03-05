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

Il protocollo DoubleZero raccoglie le entrate dagli utenti validatori denominate in SOL, ma distribuisce le ricompense ai contributori denominate in 2Z. Pertanto, è necessario convertire SOL in 2Z.

**A tal fine, i partecipanti idonei possono negoziare con il contratto di conversione DoubleZero, acquistando SOL dal contratto e vendendo 2Z. Il pricing si basa sui feed di prezzo Pyth e su un meccanismo di sconto programmato.**

Questa guida descrive come utilizzare il programma.

***Prima di accedere o utilizzare questo documento e il codice correlato, si prega di leggere il disclaimer in fondo al documento.***

---

## Design del Programma

Il programma di conversione è essenzialmente un pool di liquidità unilaterale, con una dimensione batch fissa di 1 SOL per ogni transazione. I partecipanti idonei possono depositare 2Z e prelevare SOL dal programma, con il prezzo determinato dal prezzo oracolo Pyth e da uno sconto dinamico. Nel tempo, questo realizza l'obiettivo di convertire il token nativo del programma in 2Z.

Per utilizzare il programma, i trader devono fornire due prezzi Pyth recenti (SOL/USD e 2Z/USD) e la quantità di 2Z. Il programma calcola quindi la quantità di 2Z necessaria per acquistare 1 SOL basandosi sul prezzo SOL/2Z implicito. Vengono poi eseguiti alcuni passaggi aggiuntivi:

- Verifica che i prezzi Pyth siano sufficientemente recenti, ovvero non più vecchi di 5 secondi.
- Verifica che gli intervalli di confidenza di entrambi i prezzi siano sufficientemente piccoli, ovvero che la somma delle deviazioni standard di Laplace (parametro Pyth `conf`) di entrambi i prezzi, normalizzata al loro livello, non superi i 30 punti base.
- Regola il prezzo SOL/2Z con lo sconto dinamico (espresso come percentuale del prezzo Pyth). Questo sconto è funzione del tempo trascorso dall'ultima transazione. La formula seguente specifica lo sconto, assumendo che l'ultima transazione sia avvenuta allo slot $s_{\text{last}}$ e che lo slot corrente sia $s_{\text{now}}$. (Ad esempio, se sono trascorsi 200 slot dall'ultima transazione, lo sconto è di 40 punti base.)

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

A questo punto, se il trader fornisce abbastanza 2Z per eseguire la transazione al prezzo calcolato (incluso lo sconto), la transazione verrà eseguita a quel prezzo. Il trader riceverà il SOL acquistato e il 2Z in eccesso.

Il contratto non consente quindi ulteriori transazioni nello stesso slot. Questo per evitare che il contratto paghi uno slippage eccessivo nel caso in cui il prezzo Pyth si discosti troppo dal prezzo reale in qualsiasi momento (al di là di quanto possono catturare i filtri esistenti).

---

## Esecuzione Atomica Senza Gas

Questa sezione descrive l'utilizzo del comando `harvest-dz`. Questo comando esegue atomicamente due operazioni:
1. Il comando richiede a Jupiter una quotazione contro il programma di conversione SOL nativo <> 2Z.
2. Se il routing Jupiter produce più 2Z/SOL rispetto a quanto richiesto dal programma di conversione SOL nativo, `harvest-2z` eseguirà la conversione e restituirà al portafoglio 1 SOL e la differenza in 2Z.

### Raccolta di 2Z

Per eseguire, esegui il seguente comando:
```
doublezero-solana revenue-distribution harvest-2z
```
L'output sarà simile al seguente:
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
Il comando può anche essere simulato usando il parametro `--dry-run`. L'esecuzione a secco genererà log del programma e un output come il seguente:

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## Conversione Tramite Protocollo

Questa sezione descrive come controllare il tasso di conversione e come eseguire la conversione usando la CLI `doublezero-solana`. Infine, descrive l'interfaccia per integrazioni personalizzate con il contratto di conversione DoubleZero.

### Come controllare il prezzo di conversione SOL/2Z tramite `doublezero-solana`

Per controllare il tasso di conversione SOL/2Z su Mainnet Beta, esegui il seguente comando:

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

L'output visualizzato sarà simile al seguente:

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

Il Journal Balance informa l'utente di quanta liquidità SOL è disponibile nello smart contract di distribuzione delle entrate. Finché il Journal Balance supera la dimensione della transazione fissa di 1 SOL, l'utente può negoziare.

La prima riga mostra il prezzo di conversione SOL/2Z "reale" dell'oracolo off-chain. La seconda riga è il prezzo di conversione utilizzato dalla conversione on-chain, che è il prezzo reale aggiustato per lo sconto algoritmico.

### Come convertire 2Z in SOL tramite `doublezero-solana`

Per convertire token 2Z in SOL, esegui il seguente comando:

```bash
doublezero-solana revenue-distribution convert-2z
```

Per impostazione predefinita, questa transazione avrà successo se c'è sufficiente liquidità SOL e abbastanza 2Z nell'ATA per eseguire la conversione. Specificando i seguenti parametri, puoi avere un controllo più granulare sulla conversione:

```bash
      --limit-price <DECIMAL>                    Il prezzo limite predefinito è il prezzo oracolo SOL/2Z corrente
      --source-2z-account <PUBKEY>               L'account token deve essere di proprietà del firmatario. Se non specificato, il valore predefinito è l'ATA del firmatario
      --checked-sol-amount <SOL>                 Controlla esplicitamente l'importo SOL. Se specificato, questo importo verrà verificato rispetto alla quantità di riempimento fissa
```

Il prezzo limite specificato determina il prezzo peggiore che sei disposto ad accettare quando esegui la conversione SOL/2Z. Ad esempio, supponiamo che il prezzo 2Z scontato di SOL sia 800 (800 token 2Z per 1 SOL). Se specifichi un prezzo limite di 790, non sei disposto a scambiare più di 790 token 2Z per 1 SOL, quindi non verrà tentata la conversione. Ma se specifichi 810, sei disposto a scambiare fino a 810 token 2Z (in questo caso, solo 800 token 2Z in questa transazione), quindi la transazione passerà.

L'account token 2Z di origine sovrascrive l'ATA predefinito, usando il firmatario come proprietario di questo ATA 2Z. Tuttavia, se hai un altro account token che vuoi usare per la conversione, fornisci la sua chiave pubblica tramite questo parametro.

Come opzione, puoi specificare l'importo SOL da verificare rispetto alla dimensione di riempimento standard (impostata a 1 SOL all'avvio). Se non corrisponde alla dimensione di riempimento del programma, la conversione fallirà. Questo riduce il rischio di non accorgersi che la dimensione di riempimento del programma è cambiata.

### Interfaccia per l'Acquisto di SOL

L'interfaccia e la CLI `doublezero-solana` si trovano in [questo repository](https://github.com/doublezerofoundation/doublezero-offchain). Il codice sorgente dell'interfaccia del contratto di conversione DoubleZero è [qui](https://github.com/doublezerofoundation/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09). Il Program ID è `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`.

Un metodo conveniente per generare gli account necessari per l'istruzione buy SOL è usare il metodo `new` (in *instruction/account.rs*):

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

`fill_registry_key` può essere ottenuto da `ProgramState`

```rust
pub struct ProgramState {
    pub admin_key: Pubkey,
    pub fills_registry_key: Pubkey, // questa chiave
    pub is_paused: bool,
    pub configuration_registry_bump: u8,
    pub program_state_bump: u8,
    pub deny_list_registry_bump: u8,
    pub withdraw_authority_bump: u8,
    pub last_trade_slot: u64,
    pub deny_list_authority: Pubkey,
}
```

In alternativa, puoi chiamare `getProgramAccounts` con il discriminatore tramite Solana RPC. Tuttavia, poiché questa chiave pubblica non cambierà mai, si raccomanda di metterla in cache.

`user_key` è il firmatario dell'istruzione buy SOL e deve essere il proprietario di `user_token_account_key`. Come descritto sopra, non deve essere necessariamente l'ATA. Finché l'account token 2Z è di proprietà di `user_key`, l'istruzione avrà successo.

La struttura `BuySolAccounts` implementa `Into<Vec<AccountMeta>>`, quindi può generare tutti i metadati degli account necessari per costruire l'istruzione.

I dati dell'istruzione sono

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

Questi dati dell'istruzione sono serializzati con Borsh, con un selettore Anchor di 8 byte, serializzando tutto con `BorshSerialize::serialize`.

I dati del prezzo oracolo possono essere ottenuti da questo endpoint pubblico: [https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate). I dati possono essere deserializzati usando la struttura OraclePriceData in *oracle.rs* tramite serde.

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

Esempio di recupero usando il [crate reqwest](https://docs.rs/reqwest/latest/reqwest/):

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

Con il Program ID, gli account e i dati dell'istruzione, dovresti essere in grado di costruire l'istruzione per acquistare SOL dal contratto di conversione DoubleZero.
