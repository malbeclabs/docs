# Connessione Validatore Mainnet-Beta in Modalità IBRL
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "Connettendomi a DoubleZero accetto i [Termini di Servizio DoubleZero](https://doublezero.xyz/terms-protocol)"



### Connessione a Mainnet-Beta in Modalità IBRL

!!! Note inline end
    La modalità IBRL non richiede il riavvio dei client validatori, perché utilizza il tuo indirizzo IP pubblico esistente.

I validatori Solana Mainnet completeranno la connessione a DoubleZero Mainnet-beta, che è dettagliata su questa pagina.

Ogni validatore Solana ha il proprio **keypair di identità**; da questo, estrai la chiave pubblica nota come **node ID**. Questa è l'impronta digitale univoca del validatore sulla rete Solana.

Con il DoubleZeroID e il node ID identificati, dimostrerai la proprietà della tua macchina. Questo viene fatto creando un messaggio che include il DoubleZeroID firmato con la chiave di identità del validatore. La firma crittografica risultante serve come prova verificabile che controlli il validatore.

Infine, invierai una **richiesta di connessione a DoubleZero**. Questa richiesta comunica: *"Ecco la mia identità, ecco la prova di proprietà, ed ecco come intendo connettermi."* DoubleZero valida queste informazioni, accetta la prova e fornisce l'accesso alla rete per il validatore su DoubleZero.

Questa guida consente a 1 Validatore Primario di registrarsi, e fino a 3 macchine di backup/failover contemporaneamente.

## Prerequisiti

- Solana CLI installata e nel $PATH
- Per i validatori: Permesso di accesso al file keypair di identità del validatore (es. validator-keypair.json) sotto l'utente sol
- Per i validatori: Verifica che la chiave Identity del validatore Solana che si connette abbia almeno 1 SOL
- Le regole firewall permettono le connessioni in uscita per DoubleZero e Solana RPC come necessario, inclusi GRE (ip proto 47) e BGP (169.254.0.0/16 su tcp/179)

!!! info
    L'ID Validatore verrà verificato con Solana gossip per determinare l'IP target. L'IP target e il DoubleZero ID verranno poi utilizzati per aprire un tunnel GRE tra la tua macchina e il DoubleZero Device target.

    Considera: Nel caso in cui tu abbia un ID junk e un ID Primario allo stesso IP, solo l'ID Primario verrà usato nella registrazione della macchina. Questo perché l'ID junk non apparirà nel gossip, e quindi non può essere usato per verificare l'IP della macchina target.

## 1. Configurazione dell'Ambiente

Segui le istruzioni di [setup](setup.md) prima di procedere.

L'ultimo passo del setup era disconnettersi dalla rete. Questo serve a garantire che sia aperto solo un tunnel sulla tua macchina verso DoubleZero, e che quel tunnel sia sulla rete corretta.

<div data-wizard-step="mainnet-env-config" markdown>

Per configurare la CLI DoubleZero Client (`doublezero`) e il daemon (`doublezerod`) per connettersi al **mainnet-beta DoubleZero**:
```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Dovresti vedere il seguente output:
`
✅ doublezerod configured for environment mainnet-beta
`

Dopo circa 30 secondi vedrai i dispositivi DoubleZero disponibili:

```bash
doublezero latency
```
Esempio di output (Mainnet-Beta)
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
L'output del Testnet sarà identico nella struttura, ma con meno dispositivi.
</details>

</div>

## 2. Apri la porta 44880

Gli utenti devono aprire la porta 44880 per utilizzare alcune [funzionalità di routing](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

Per aprire la porta 44880 puoi aggiornare le IP tables come:

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

nota i flag `-i doublezero0`, `-o doublezero0` che limitano questa regola solo all'interfaccia DoubleZero

O UFW come:

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

nota i flag `in on doublezero0`, `out on doublezero0` che limitano questa regola solo all'interfaccia DoubleZero

## 3. Attesta la Proprietà del Validatore

<div data-wizard-step="mainnet-find-validator" markdown>

Con il tuo ambiente DoubleZero impostato, è ora il momento di attestare la proprietà del tuo Validatore.

Il DoubleZero ID creato nel [setup](setup.md) del tuo validatore primario deve essere utilizzato su tutte le macchine di backup.

L'ID sulla tua macchina primaria può essere trovato con `doublezero address`. Lo stesso ID deve essere in `~/.config/doublezero/id.json` su tutte le macchine del cluster.

Per fare questo verificherai prima che la macchina da cui stai eseguendo i comandi sia il tuo **Validatore Primario** con:

```
doublezero-solana passport find-validator -u mainnet-beta
```

Questo verifica che il validatore sia registrato nel gossip e appaia nel programma leader.

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
    Per registrare una macchina, escludi gli argomenti "--backup-validator-ids" o "backup_ids=" da qualsiasi comando in questa pagina.

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
Questo output è atteso. Il nodo di backup non può essere nel programma leader al momento della creazione del pass.

Eseguirai ora questo comando su **tutte le macchine di backup** su cui intendi utilizzare l'account di voto e l'identità del tuo **Validatore Primario**.

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### Prepara la Connessione

Esegui il seguente comando sulla macchina del **Validatore Primario**. Questa è la macchina su cui hai stake attivo, che è nel programma leader con il tuo ID validatore primario nel gossip Solana sulla macchina da cui stai eseguendo il comando:

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


Esempio di output:

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
Nota l'output alla fine di questo comando. È la struttura per il passo successivo.

</div>

## 4. Genera la Firma

<div data-wizard-step="mainnet-sign-message" markdown>

Alla fine dell'ultimo passo, abbiamo ricevuto un output pre-formattato per `solana sign-offchain-message`

Dall'output sopra eseguiremo questo comando sulla macchina del **Validatore Primario**.

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

## 5. Avvia una Richiesta di Connessione in DoubleZero

<div data-wizard-step="mainnet-request-access" markdown>

Usa il comando `request-validator-access` per creare un account su Solana per la richiesta di connessione. L'agente DoubleZero Sentinel rileva il nuovo account, valida la sua identità e firma, e crea il pass di accesso in DoubleZero in modo che il server possa stabilire una connessione.


Usa il node ID, il DoubleZeroID e la firma.

!!! note inline end
      In questo esempio usiamo `-k /home/user/.config/solana/id.json` per trovare l'Identità del validatore. Usa la posizione appropriata per il tuo deployment locale.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**Output:**

Questo output può essere usato per vedere la transazione su un explorer Solana. Assicurati di cambiare l'explorer su mainnet. Questa verifica è facoltativa.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

Se ha successo, DoubleZero registrerà il primario con i suoi backup. Ora puoi fare failover tra gli IP registrati nel pass di accesso. DoubleZero manterrà automaticamente la connettività quando passi ai nodi di backup registrati in questo modo.

</div>

## 6. Connettiti in Modalità IBRL

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
Attendi un minuto per il completamento del tunnel GRE. Finché il tunnel GRE non è completato, l'output dello stato potrebbe restituire "down" o "Unknown"

Verifica la tua connessione:

```bash
doublezero status
```

**Output:**
!!! note inline end
    Esamina questo output. Nota che il `Tunnel src` e il `DoubleZero IP` corrispondono all'indirizzo IPv4 pubblico sulla tua macchina.

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

### Passo Successivo: Pubblicazione degli Shred via Multicast

Se hai completato questa configurazione e prevedi di pubblicare shred via multicast, procedi alla [pagina successiva](Validator%20Multicast%20Connection.md).
