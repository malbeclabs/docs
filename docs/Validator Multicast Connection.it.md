---
description: Configura un validatore connesso per pubblicare leader shreds nel feed multicast edge di DoubleZero.
---

# Connessione Multicast del Validatore
!!! warning "Collegandomi a DoubleZero accetto i [Termini di Servizio di DoubleZero](https://doublezero.xyz/terms-protocol)"

!!! note inline end "Società di trading e aziende"
    Se gestisci una società di trading o un'azienda interessata a sottoscrivere il feed, registra il tuo interesse per ottenere maggiori informazioni [qui](https://doublezero.xyz/edge-form).

Se non sei ancora connesso a DoubleZero, completa prima la documentazione relativa al [Setup](<setup.md>) e alla connessione del validatore su [Mainnet-Beta](<DZ Mainnet-beta Connection.md>).

Se sei un validatore già connesso a DoubleZero puoi proseguire con questa guida.

## 1. Configurazione del Client

### Jito-Agave (v3.1.9+) e Harmonic (3.1.11+)

1. Nel tuo script di avvio del validatore, aggiungi: `--shred-receiver-address 233.84.178.1:7733`

    È possibile inviare contemporaneamente a Jito e al gruppo `edge-solana-shreds`.

    esempio:

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...The rest of your config...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. Riavvia il tuo validatore.
3. Connettiti al gruppo multicast DoubleZero `edge-solana-shreds` come publisher: `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

### Frankendancer

1. In `config.toml`, aggiungi:

    ```toml
    [tiles.shred]
    additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
    ```

2. Riavvia il tuo validatore.
3. Connettiti al gruppo multicast DoubleZero `edge-solana-shreds` come publisher: `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

## 2. Verifica che stai pubblicando leader shreds

Una volta connesso, puoi controllare [questa dashboard](https://data.doublezero.xyz/dz/publisher-check) per confermare che stai pubblicando shreds. Non vedrai la conferma fino a quando non avrai pubblicato leader shreds per almeno uno slot.

## Endpoint Multicast (IP vs Porta)

Per il traffico di shred, l'**indirizzo IP** seleziona il feed multicast e la **porta** seleziona il servizio UDP.  
Tutti i feed sottostanti utilizzano la porta UDP `7733`.

Puoi scoprire gli IP dei gruppi correnti con:

```bash
doublezero multicast group list
```

- `edge-solana-shreds` (leader): `233.84.178.1:7733`
- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`

Per i riferimenti API e gli endpoint dati leggibili da macchina, consulta [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

## 3. Ricompense per i Validatori

Per ogni epoca in cui i validatori pubblicano leader shreds, saranno ricompensati proporzionalmente per il loro contributo in base alle sottoscrizioni. I dettagli di questo sistema verranno annunciati e descritti in una data successiva.

## Risoluzione dei Problemi

### Mancata Pubblicazione dei Leader Shreds:

La causa più comune della mancata trasmissione degli shreds è la versione del client:

Devi utilizzare Jito-Agave 3.1.9+, JitoBam 3.1.9+, Frankendancer o Harmonic 3.1.11+. Altre versioni del client non funzioneranno.

### Ritrasmissione:

1. Una causa comune della ritrasmissione degli shreds è una semplice configurazione errata. Potresti avere il flag abilitato per inviare shreds di ritrasmissione nel tuo script di avvio; dovrai disabilitarlo.

    Il flag da rimuovere in Jito-Agave è: `--shred-retransmit-receiver-address`.

1. Controlla la [dashboard dei publisher](https://data.doublezero.xyz/dz/publisher-check) e verifica se hai shreds ritrasmessi. Nella tabella, guarda la colonna **No Retransmit Shreds** — una X rossa significa che stai ritrasmettendo.

    !!! note "vista per epoca"
        Nota che ci sono diverse finestre temporali per visualizzare la dashboard dei publisher. Se vedi ritrasmissione nella **vista a 2 epoche**, ma hai apportato una modifica recente, prova a passare alla vista **slot recente**.


    ![Dashboard di verifica publisher](images/publisher-check-dashboard.png)

2. Trova l'IP del tuo client e cerca il tuo utente in [DoubleZero Data](https://data.doublezero.xyz/dz/users).

    ![Utenti DoubleZero Data](images/doublezero-data-users.png)

3. Clicca su **Multicast** per aprire la tua vista multicast.

    Lo screenshot qui sotto mostra: **Ritrasmissione** (indesiderata) traffico in uscita costante senza pattern di leader-slot.

    ![Vista multicast utente - esempio di ritrasmissione](images/user-multicast-view-retransmit.png)

    Lo screenshot qui sotto mostra: **Stato sano** (pubblicazione dei soli leader shreds) traffico in uscita a picchi, noto come pattern a dente di sega, che si allineano con i tuoi leader slot.

    ![Vista multicast utente - esempio di publisher sano](images/user-multicast-view-healthy.png)

Il grafico mostra se stai inviando solo leader shreds. I picchi di traffico dovrebbero allinearsi con i momenti in cui hai un leader slot. Quando non hai un leader slot non dovrebbe esserci traffico. Se stai ritrasmettendo, vedrai un flusso costante di traffico anziché picchi allineati agli slot.