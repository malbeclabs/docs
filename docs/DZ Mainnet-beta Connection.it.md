---
description: Connetti un validatore Solana Mainnet-Beta e fino a tre backup a DoubleZero in modalità IBRL, inclusa la prova di identità e la richiesta di connessione.
---

# Connessione Validatore Mainnet-Beta in Modalità IBRL
!!! warning "Connettendomi a DoubleZero accetto i [Termini di Servizio di DoubleZero](https://doublezero.xyz/terms-protocol)"



### Connessione a Mainnet-Beta in Modalità IBRL

!!! Note inline end
    La modalità IBRL non richiede il riavvio dei client del validatore, poiché utilizza il tuo indirizzo IP pubblico esistente.

I Validatori Solana Mainnet completeranno la connessione a DoubleZero Mainnet-beta, come descritto in questa pagina.

Ogni validatore Solana ha il proprio **keypair di identità**; da questo, si estrae la chiave pubblica nota come **node ID**. Questo è l'identificativo univoco del validatore sulla rete Solana.

Con il DoubleZeroID e il node ID identificati, dovrai dimostrare la proprietà della tua macchina. Questo viene fatto creando un messaggio che include il DoubleZeroID firmato con la chiave di identità del validatore. La firma crittografica risultante serve come prova verificabile che controlli il validatore.

Infine, invierai una **richiesta di connessione a DoubleZero**. Questa richiesta comunica: *"Ecco la mia identità, ecco la prova di proprietà, ed ecco come intendo connettermi."* DoubleZero valida queste informazioni, accetta la prova e predispone l'accesso alla rete per il validatore su DoubleZero.

Questa guida permette a 1 Validatore Primario di registrarsi, e fino a 3 macchine di backup/failover contemporaneamente.

## Prerequisiti

- Solana CLI installata e nel $PATH
- Per i validatori: Permesso di accesso al file keypair di identità del validatore (es., validator-keypair.json) sotto l'utente sol
- Per i validatori: Verificare che la chiave di identità del validatore Solana da connettere abbia almeno 1 SOL
- Le regole del firewall permettono connessioni in uscita per DoubleZero e Solana RPC come necessario, inclusi
 GRE (ip proto 47) e BGP (169.254.0.0/16 su tcp/179)

!!! info
    Il Validator ID verrà controllato rispetto al gossip di Solana per determinare l'IP di destinazione. L'IP di destinazione e il DoubleZero ID verranno poi utilizzati per aprire un tunnel GRE tra la tua macchina e il dispositivo DoubleZero di destinazione.

    Considera: Nel caso in cui tu abbia un ID fittizio e un ID Primario sullo stesso IP, solo l'ID Primario verrà utilizzato nella registrazione della macchina. Questo perché l'ID fittizio non apparirà nel gossip e quindi non può essere usato per verificare l'IP della macchina di destinazione.

## 1. Confermare la rete del client

Segui le istruzioni di [setup](setup.md) prima di procedere. Installa i pacchetti **Mainnet-Beta** — Testnet e Mainnet-Beta utilizzano repository di pacchetti diversi.

L'ultimo passaggio del setup era la disconnessione dalla rete. Questo per garantire che sulla tua macchina sia aperto un solo tunnel verso DoubleZero, e che quel tunnel sia sulla rete corretta.

Conferma che il client sia su mainnet-beta:

```bash
doublezero status
```

La colonna `Network` dovrebbe essere `mainnet-beta`. Se è `testnet`, o hai installato il pacchetto sbagliato, usa il cambio copia-incolla nella sezione [risoluzione problemi](troubleshooting.md#issue-wrong-doublezero-environment).

Dopo circa 30 secondi vedrai i dispositivi DoubleZero disponibili:

```bash
doublezero latency
```
Output di esempio (Mainnet-Beta)
```bash
 pubkey                                       | code          | ip              | min      | max      | avg      | reachable
 2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.74ms   | 1.92ms   | 1.84ms   | true
 ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.88ms   | 4.39ms   | 2.72ms   | true
 8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.45ms   | 3.30ms   | 2.74ms   | true
 8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.88ms   | 5.13ms   | 3.02ms   | true
 uzyg9iYw2FEbtdTHaDb5HoeEWYAPRPQgvsgyd873qPS  | nyc001-dz002  | 4.42.212.122    | 3.17ms   | 3.63ms   | 3.33ms   | true
 FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.33ms   | 5.46ms   | 3.39ms   | true
 9oKLaL6Hwno5TyAFutTbbkNrzxm1fw9fhzkiUHgsxgGx | dz-dc10-sw01  | 137.239.200.186 | 6.84ms   | 7.01ms   | 6.91ms   | true
 DESzDP8GkSTpQLkrUegLkt4S2ynGfZX5bTDzZf3sEE58 | was001-dz002  | 38.88.214.133   | 7.39ms   | 7.44ms   | 7.41ms   | true
 HHNCpqB7CwHVLxAiB1S86ko6gJRzLCtw78K1tc7ZpT5P | was001-dz001  | 66.198.11.74    | 7.67ms   | 7.85ms   | 7.76ms   | true
 9LFtjDzohKvCBzSquQD4YtL3HwuvkKBDE7KSzb8ztV2b | dz-mtl11-sw01 | 134.195.161.10  | 9.88ms   | 10.01ms  | 9.95ms   | true
 9M7FfYYyjM4wGinKPofZRNmQFcCjCKRbXscGBUiXvXnG | dz-tor1-sw01  | 209.42.165.10   | 14.52ms  | 14.53ms  | 14.52ms  | true
```
L'output di Testnet sarà identico nella struttura, ma con meno dispositivi.

## 2. Aprire la porta 44880

Gli utenti devono aprire la porta 44880 per utilizzare alcune [funzionalità di routing](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

Per aprire la porta 44880 puoi aggiornare le IP tables in questo modo:

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

nota i flag `-i doublezero0`, `-o doublezero0` che limitano questa regola alla sola interfaccia DoubleZero

Oppure UFW in questo modo:

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

nota i flag `in on doublezero0`, `out on doublezero0` che limitano questa regola alla sola interfaccia DoubleZero

## 3. Attestare la Proprietà del Validatore

<div data-wizard-step="mainnet-find-validator" markdown>

Con il tuo Ambiente DoubleZero configurato, è ora il momento di attestare la Proprietà del tuo Validatore.

Il DoubleZero ID che hai creato nel [setup](setup.md) del tuo validatore primario deve essere utilizzato su tutte le macchine di backup.

L'ID sulla tua macchina primaria può essere trovato con `doublezero address`. Lo stesso ID deve trovarsi in `~/.config/doublezero/id.json` su tutte le macchine del cluster.

Per fare ciò, verificherai prima che la macchina da cui stai eseguendo i comandi sia il tuo **Validatore Primario** con:

```
doublezero-solana passport find-validator -u mainnet-beta
```

Questo verifica che il validatore sia registrato nel gossip e appaia nella schedule dei leader.

Output atteso:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 11.11.11.111
Validator ID: ValidatorIdentity111111111111111111111111111
Gossip IP: 11.11.11.111
In Leader scheduler
✅ This validator can connect as a primary in DoubleZero 🖥️  💎. It is a leader scheduled validator.
```

!!! info
    Lo stesso flusso di lavoro viene utilizzato per una o più macchine.
    Per registrare una sola macchina, escludi gli argomenti "--backup-validator-ids" o "backup_ids=" da qualsiasi comando in questa pagina.

Ora, su tutte le macchine di backup su cui intendi eseguire il tuo **Validatore Primario**, esegui il seguente comando:
```
doublezero-solana passport find-validator -u mainnet-beta
```

Output atteso:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
Questo output è atteso. Il nodo di backup non può essere nella schedule dei leader al momento della creazione del pass.

Ora eseguirai questo comando su **tutte le macchine di backup** su cui prevedi di utilizzare l'account di voto e l'identità del tuo **Validatore Primario**.

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### Preparare la Connessione

Esegui il seguente comando sulla macchina del **Validatore Primario**. Questa è la macchina su cui hai stake attivo, che è nella schedule dei leader con il tuo ID del validatore primario nel gossip di Solana sulla macchina da cui stai eseguendo il comando:

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


Output di esempio:

```
DoubleZero Passport - Prepare Validator Access Request
Connected to Solana: mainnet-beta

Primary validator 🖥️  💎:
  ID: ValidatorIdentity111111111111111111111111111
  Gossip: ✅ OK 11.11.11.111)
  Leader scheduler: ✅ OK (Stake: 1,050,000.00 SOL)

Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity222222222222222222222222222
  Gossip: ✅ OK (22.22.22.222)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity333333333333333333333333333
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


  Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity444444444444444444444444444
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)

  To request access, sign the following message with your validator's identity key:

  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>

```
Nota l'output alla fine di questo comando. È la struttura per il passaggio successivo.

</div>

## 4. Generare la Firma

<div data-wizard-step="mainnet-sign-message" markdown>

Alla fine dell'ultimo passaggio, abbiamo ricevuto un output pre-formattato per `solana sign-offchain-message`

Dall'output precedente eseguiremo questo comando sulla macchina del **Validatore Primario**.

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**Output:**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```

</div>

## 5. Avviare una Richiesta di Connessione in DoubleZero

<div data-wizard-step="mainnet-request-access" markdown>

Usa il comando `request-validator-access` per creare un account su Solana per la richiesta di connessione. L'agente DoubleZero Sentinel rileva il nuovo account, ne valida l'identità e la firma, e crea il pass di accesso in DoubleZero affinché il server possa stabilire una connessione.


Usa il node ID, il DoubleZeroID e la firma.

!!! note inline end
      In questo esempio usiamo `-k /home/user/.config/solana/id.json` per trovare l'Identity del validatore. Usa il percorso appropriato per il tuo deployment locale.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**Output:**

Questo output può essere usato per visualizzare la transazione su un explorer Solana. Assicurati di cambiare l'explorer su mainnet. Questa verifica è opzionale.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

Se la procedura ha successo, DoubleZero registrerà il primario con i suoi backup. Ora puoi effettuare il failover tra gli IP registrati nel pass di accesso. DoubleZero manterrà automaticamente la connettività quando si passa ai nodi di backup registrati in questo modo.

</div>

## 6. Connettersi in Modalità IBRL

<div data-wizard-step="mainnet-connect-ibrl" markdown>

Sul server, con l'utente che si connetterà a DoubleZero, esegui il comando `connect` per stabilire la connessione a DoubleZero.

```
doublezero connect ibrl
```

Dovresti vedere un output che indica il provisioning, come:

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.184.101.183 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
🔍  Provisioning User for IP: 137.184.101.183
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
✅  User Provisioned
```
Attendi un minuto affinché il tunnel GRE completi la configurazione. Fino a quando il tunnel GRE non sarà completamente configurato, l'output dello stato potrebbe restituire "down" o "Unknown"

Verifica la tua connessione:

```bash
doublezero status
```

**Output:**
!!! note inline end
    Esamina questo output. Nota che il `Tunnel src` e il `DoubleZero IP` corrispondono all'indirizzo IPv4 pubblico sulla tua macchina.
    <!--`Tunnel dst` è l'indirizzo del dispositivo DZ a cui sei connesso.-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```
Uno stato `up` significa che sei connesso con successo.

Potrai visualizzare le route propagate da altri utenti su DoubleZero eseguendo:

```
ip route
```


```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```

</div>

### Prossimo Passo: Pubblicazione degli Shred tramite Multicast

Se hai completato questa configurazione e prevedi di pubblicare shred tramite multicast, procedi alla [pagina successiva](Validator%20Multicast%20Connection.md).