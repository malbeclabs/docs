# Ricompense per i Validatori
!!! warning "Collegandomi a DoubleZero, accetto i [Termini di Utilizzo di DoubleZero](https://doublezero.xyz/terms-protocol)"

## Come Funziona

I validatori che pubblicano leader shred su DoubleZero Edge guadagnano ricompense ad ogni epoca. Prima che le ricompense possano essere pagate, ogni validatore deve registrare **dove** le ricompense devono essere inviate configurando un account `ValidatorPublisherRewards` su Solana. Tale account contiene:

- il **mint delle ricompense** — il token in cui vengono pagate le ricompense 2z (salvo modifica manuale)
- il **proprietario delle ricompense** — il wallet che possiede l'Associated Token Account (ATA) che riceve le ricompense

Il comando `configure` imposterà questi campi e i pagamenti automatici avverranno su base epocale da quel momento in poi. È possibile rieseguire `configure` in seguito per modificare uno dei due campi.

!!! info "Se non hai ancora completato il [Setup](setup.md), la [Connessione del Validatore a Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) e la [Connessione Multicast del Validatore](Validator%20Multicast%20Connection.md), fallo prima."

## Prerequisiti

- Validatori che pubblicano leader shred - vedi [Connessione Multicast del Validatore](Validator%20Multicast%20Connection.md).
- L'ultima versione della CLI `doublezero-solana`: `sudo apt update && sudo apt install doublezero-solana`, minimo `0.5.6`.
- Accesso al **keypair dell'identità del validatore**, sia sulla stessa macchina che conservato offline con la possibilità di firmare un messaggio.
- Una chiave pubblica del wallet di destinazione che sarà proprietario dell'ATA delle ricompense.


---

## 1. Configurare per Richiedere le Ricompense

Eseguire `configure` con il keypair dell'identità del validatore come `-k`.

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    -k <path-to-validator-identity-keypair.json>
```
Output di Esempio
```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         direct
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```
`Configured validator publisher rewards: ` restituisce il txt che puoi visualizzare in un block explorer.

| Flag | Descrizione |
|---|---|
| `--node-id` | Chiave pubblica dell'identità del nodo validatore. |
| `--rewards-token-owner` | Wallet che sarà proprietario dell'ATA ricevente. |
| `--rewards-token-mint` | Il token in cui verranno ricevute le ricompense del wallet `2z`. I token supportati includono anche `usdc` e `wsol`. |
| `-k` | Percorso al keypair dell'identità del validatore. Nel percorso diretto, la chiave pubblica del keypair deve corrispondere a `--node-id` altrimenti il comando restituirà un errore indicando di passare al percorso offchain. |

L'ATA viene auto-inizializzato nella stessa transazione se non esiste ancora.


!!! note "Se Viene Restituito un Errore"
    Se la chiave pubblica di `-k` non corrisponde a `--node-id`

    Il keypair del fee-payer che hai fornito non è l'identità del validatore. Passa il keypair dell'identità del validatore come `-k`, oppure passa al [percorso offchain](#appendice-percorso-offchain-alternativo).
---

## 2. Verificare la Configurazione

```bash
doublezero-solana shreds publisher-rewards show --node-id <NODE_ID>
```

Il comando stampa il `Node ID`, il `Rewards owner`, il `Rewards mint`, l'indirizzo ATA risolto e lo stato dell'ATA. L'**ATA Risolto** è l'indirizzo deterministico derivato dal proprietario delle ricompense + mint delle ricompense — è dove le ricompense verranno depositate ad ogni epoca.

---

## Appendice: Percorso Offchain Alternativo

Tre sotto-passaggi: preparazione, firma, configurazione.

### 1. Preparare il messaggio offchain

Eseguire questo ovunque — è in sola lettura e non necessita del keypair dell'identità del validatore. Stampa il blob esadecimale da firmare e lo slot assoluto alla scadenza della firma.

```bash
doublezero-solana shreds publisher-rewards prepare-offchain-message \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --valid-for 1h
```
Output di Esempio

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


| Flag | Descrizione |
|---|---|
| `--node-id` | Chiave pubblica dell'identità del nodo validatore. |
| `--rewards-token-owner` | Wallet che sarà proprietario dell'ATA ricevente. |
| `--rewards-token-mint` | Il token in cui verranno ricevute le ricompense del wallet `2z`. I token supportati includono anche `usdc` e `wsol`. |
| `--valid-for` | Durata della firma relativa allo slot corrente. Accetta `<n>s`, `<n>m` o `<n>h`. Predefinito: `1h`. |
| `--deadline-slot` | Alternativa a `--valid-for`: slot assoluto alla scadenza dell'autorizzazione. Mutuamente esclusivo con `--valid-for`. |
| `--json` | Produce JSON (`{ hex, deadline_slot }`) invece del riepilogo leggibile. |

Il comando stampa il messaggio di autorizzazione codificato in esadecimale, lo slot di scadenza risolto e frammenti di comandi shell pronti all'uso per i due passaggi successivi.

### 2. Firmare il messaggio

Sulla macchina che contiene il keypair dell'identità del validatore:

```bash
solana sign-offchain-message <123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3> \
--keypair <path-to-validator-identity-keypair.json>
```

Questo stampa una firma in base58.

Output di Esempio

```bash
SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp
```

### 3. Inviare `configure`

Di nuovo sulla macchina con il wallet del fee-payer:

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --signature <SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp> \
    --deadline-slot <DEADLINE_SLOT>
```

`--signature` e `--deadline-slot` devono essere passati insieme. I valori devono corrispondere a quelli prodotti nei passaggi 2b.i e 2b.ii.

L'ATA viene auto-inizializzato nella stessa transazione se non esiste ancora.

Output di Esempio

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

!!! note "Nota: Se la Firma è Scaduta"
    Ogni firma offchain ha uno slot di scadenza. Se passa troppo tempo tra `prepare-offchain-message` e `configure`, rieseguire `prepare-offchain-message`, firmare di nuovo e reinviare. La validità predefinita è 1 ora — estendila con `--valid-for 4h` o simile se hai bisogno di più tempo per un flusso di firma offline.