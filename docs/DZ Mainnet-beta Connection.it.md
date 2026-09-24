---
description: Connettere un validatore Solana (mainnet-beta o testnet) e fino a tre backup a DoubleZero in modalità IBRL, inclusa la prova di identità e la richiesta di connessione.
---

# Connessione del Validatore in Modalità IBRL

!!! warning "Connettendomi a DoubleZero accetto i [Termini di Servizio di DoubleZero](https://doublezero.xyz/terms-protocol)"

??? warning "Connettendomi al testnet di DoubleZero accetto i termini dell'Accordo di Valutazione qui riportati (clicca per espandere)"
    <span style="font-size:14px;">DoubleZero Testnet</span>
    Evaluation Agreement

    By accessing or using the Solution (defined below), you agree as of the
    first date of such access (the "**Effective Date**") that this
    Evaluation Agreement (the "**Agreement**") sets forth the terms and
    conditions under which DoubleZero Foundation ("**DZF**") will provide
    you ("**User**" or "**you**") access to the Solution on an evaluation
    basis. In consideration of the mutual promises herein, you agree as
    follows:

    <span style="font-size:14px;">1. DEFINITIONS.</span>

    <span style="font-size:14px;">1.1 "**Confidential Information**"</span> means any and all information disclosed by either party to the other which is designated as confidential, or which should otherwise be understood to be confidential, including but not limited to, the Solution, product plans, business plans, trade secrets, technology, or any other proprietary information.

    <span style="font-size:14px;">1.2 "**Solution**" </span> means the testnet version of the DoubleZero high-performance network infrastructure for web3 projects ("**Testnet**") and related edge filtering service with integrated bandwidth ("**Information Service**") the DZ Software (defined below), any and all materials provided by DZF relating to the DZ Software ("**Documentation**"), and other materials that DZF provides to User hereunder.

    <span style="font-size:14px;">2. ACCESS. </span>

    <span style="font-size:14px;">2.1 ^^Access to Solution^^.</span> Subject to the terms and conditions of this Agreement, DZF will provide User access to the Solution through the Internet. User's access is a non-exclusive, non-transferable, limited use of the Solution to enable User to evaluate the Information Service only. With respect to any software comprising the Solution ("**DZ Software**"), DZF hereby grants User a limited, revocable license, during the Evaluation Period, to copy, download, make a reasonable number of copies of, run, and deploy (as applicable) such DZ Software solely as contemplated by the Documentation.

    <span style="font-size:14px;">2.2 ^^Restrictions^^. </span>User may use the Solution in accordance with this Agreement from the Effective Date until terminated by DZF (the "**Evaluation Period**"). User understands that any rights to use the Solution beyond the Evaluation Period will be subject to a separate commercial agreement between the parties with respect thereto, including the payment of fees. User shall not, and shall not permit any third party to: (i) modify or create any derivative works based on the Solution or any portion thereof; (ii) reproduce the Solution except as expressly permitted by this Agreement; (iii) sublicense, distribute, sell, lend, rent, lease, transfer, or grant any rights in or to all or any portion of the Solution or provide access to the Solution to third parties, on a service bureau basis or otherwise, except as an offering of the Information Services through or in connection with User's platform or product and not on a standalone basis; or (iv) use the Solution other than as provided herein.

    <span style="font-size:14px;">2.3 ^^Ownership^^.</span> DZF retains all right, title and interest, including intellectual property rights, in and to the Solution.

    <span style="font-size:14px;">3 FEEDBACK.</span>
    DZF may periodically request that User provide, and User agrees to provide to DZF, feedback regarding the use, operation, and functionality of the Solution ("Feedback"). User hereby grants DZF a non-exclusive, worldwide, perpetual, irrevocable, royalty-free, fully paid-up, fully sublicensable and transferable right and license to use and incorporate Feedback into any products and services, to make, use, sell, offer for sale, import, and otherwise exploit such products and services, and to otherwise use, copy, distribute, and otherwise exploit the Feedback without restriction.

    <span style="font-size:14px;">4. TERM AND TERMINATION.</span>

    <span style="font-size:14px;">4.1 ^^Term^^.</span> This Agreement will commence as of the Effective Date and will remain in full force and effect for the Evaluation Period. Either party may terminate this Agreement immediately for convenience, for any reason or no reason, upon written notice to the other party (email to suffice).

    <span style="font-size:14px;">4.1 ^^Effects of Termination^^.</span> Upon termination of this Agreement for any reason: (i) the rights granted to User hereunder will immediately terminate; (ii) User shall immediately discontinue any use of the Solution and shall return or destroy all Documentation and any DZ Software under its control; (iii) each party shall promptly return or destroy all Confidential Information and property of the other party; and (iv) Sections 2.2, 2.3, 3, 4.2, and 5 through 8 will survive.

    <span style="font-size:14px;">5. CONFIDENTIALITY.</span>
    Each party agrees that it will use the Confidential Information of the other party solely to perform its obligations and exercise its rights under this Agreement and it will not disclose, or permit to be disclosed, the same, except as otherwise permitted hereunder. However, either party may disclose Confidential Information to its personnel, attorneys, and other representatives who have a need to know and are bound by confidentiality obligations no less protective than those set forth in this Agreement; and as required by law (in which case the receiving party will provide the disclosing party with prior notice thereof and opportunity to contest such disclosure, and will minimize such disclosure to the extent permitted by applicable law). The obligations of confidentiality in this Section 5 shall not apply to information that: (a) is or becomes generally known or publicly available through no fault of the receiving party; (b) was properly known to the receiving party, without restriction, prior to disclosure by the disclosing party; (c) was properly disclosed to the receiving party, without restriction, by another person with the legal authority to do so; or (d) is independently developed by the receiving party without use of or reference to the disclosing party's Confidential Information. Each party agrees to exercise due care in protecting the Confidential Information of the other party from unauthorized use and disclosure. In the event of actual or threatened breach of the provisions of this Section or the licenses contained herein, the non-breaching party will be entitled to seek immediate injunctive and other equitable relief, without waiving any other rights or remedies available to it. User is responsible for maintaining the Solution and the secrecy of any passwords, seed phrases, or codes that provide access to the Solution as the Confidential Information of DZF. Nothing herein limits or restricts DZF's right or ability to use data regarding the performance, availability, usage, integrity and security of the Solution. If either party breaches, or threatens to breach the provisions of this Section 5, each party agrees that the non-breaching party will have no adequate remedy at law and is therefore entitled to immediate injunctive and other equitable relief, without bond and without the necessity of showing actual money damages.

    <span style="font-size:14px;">6. WARRANTY DISCLAIMER; LIMITATION OF LIABILITY.</span>

    <span style="font-size:14px;">6.1 ^^WARRANTY DISCLAIMER^^.</span> THE SOLUTION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. DZF MAKES NO WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE WITH RESPECT TO THE SOLUTION AND DOCUMENTATION INCLUDING THEIR CONDITION, CONFORMITY TO ANY REPRESENTATION OR DESCRIPTION, AND DZF SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.

    <span style="font-size:14px;">6.2 ^^LIMITATION OF LIABILITY^^.</span>
    EXCEPT FOR A BREACH OF SECTIONS 2.1, 2.2, AND 5, IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER FOR INDIRECT, INCIDENTAL, SPECIAL OR OTHER CONSEQUENTIAL DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS OR USE OR LOSS OF DATA, INCURRED BY YOU OR ANY THIRD PARTY, ARISING OUT OF OR RELATED TO THIS AGREEMENT WHETHER IN AN ACTION IN CONTRACT, TORT, OR OTHERWISE, EVEN IF THE OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL DZF'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED ONE HUNDRED DOLLARS (\$100), WHETHER AN ACTION IN CONTRACT, TORT, OR OTHERWISE. **THE FOREGOING LIMITATIONS WILL APPLY NOTWITHSTANDING THE FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY HEREIN.** THE PARTIES AGREE THAT THE FOREGOING LIMITATIONS REPRESENT A REASONABLE ALLOCATION OF RISK UNDER THIS AGREEMENT.

    <span style="font-size:14px;">7. GOVERNING LAW.</span>
    This Agreement and all matters arising out of or relating to this Agreement shall be governed, interpreted and constructed in accordance with the laws of the Cayman Islands. Should a controversy, dispute or claim arise out of or in relation to this Agreement ("Dispute"), the relevant party as appropriate, must give 30 days' notice of such Dispute to the other parties (the "Notice of Dispute"). Should the Dispute not be resolved at the expiration of 30 days after service of the Notice of Dispute, the relevant party may commence arbitration proceedings as provided herein. Should the Dispute remain at the expiration of 30 days after service of the Notice of Dispute, the Dispute shall be settled by arbitration administered by the Cayman International Mediation & Arbitration Centre (CI-MAC) in accordance with the CI-MAC Arbitration Rules (the "Arbitration Rules") in force as at the date of this Agreement, which Arbitration Rules are deemed to be incorporated by reference to this clause, and governed by the Arbitration Act (as amended). The arbitration shall be seated in George Town, Grand Cayman, Cayman Islands and governed by Cayman Islands law. The language of the arbitration shall be English. The arbitration shall be determined by a sole arbitrator to be appointed in accordance with the Arbitration Rules. Any award or decision made by the arbitrator shall be in writing and shall be final and binding on the parties without any right of appeal, and judgment upon any award thus obtained may be entered in or enforced by any court having jurisdiction thereof. No action at law or in equity based upon any claim arising out of or related to this Agreement shall be instituted in any court of any jurisdiction. If any litigation or arbitration is necessary to enforce the terms of this Agreement, the prevailing party will be entitled to have their attorney fees paid by the other party. Each party waives any right it may have to assert the doctrine of forum non conveniens, to assert that it is not subject to the jurisdiction of such arbitration or courts or to object to venue to the extent any proceeding is brought in accordance herewith. </span>

    <span style="font-size:14px;">8. GENERAL PROVISIONS.</span>
    This Agreement may not be transferred or assigned by User without the prior written consent of DZF. DZF may freely assign this Agreement. All notices required to be sent hereunder shall be sent by email (to DZF: legal@doublezero.xyz) and deemed received the day after sending (with transmission confirmed). If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions of this Agreement will remain in full force and effect. The waiver by either party of any default or breach of this Agreement shall not constitute a waiver of any other or subsequent default or breach. Neither party shall be liable for any delay or failure in performance due to acts of God, earthquakes, shortages of supplies, transportation difficulties, labor disputes, riots, war, fire, epidemics, and similar occurrences beyond its control, whether or not foreseeable. This Agreement together with any attachments constitutes the complete agreement between the parties and supersedes all prior or contemporaneous agreements or representations, written or oral, concerning the subject matter herein. This Agreement may not be modified or amended except in writing signed by a duly authorized representative of each party.

Scegli la rete DoubleZero corrispondente al tuo cluster Solana: `mainnet-beta` o `testnet`. Installa i pacchetti corrispondenti nella sezione [setup](setup.md), e utilizza la stessa rete per ogni comando riportato di seguito.

!!! Note inline end
    La modalità IBRL non richiede il riavvio dei client del validatore, poiché utilizza il tuo indirizzo IP pubblico esistente.

I validatori Solana si connettono a DoubleZero in modalità IBRL seguendo i passaggi di questa pagina.

Ogni validatore Solana possiede la propria **coppia di chiavi di identità**; da questa si estrae la chiave pubblica nota come **node ID**. Questo è l'identificativo univoco del validatore sulla rete Solana.

Una volta identificati il DoubleZeroID e il node ID, dovrai dimostrare la proprietà della tua macchina. Questo avviene creando un messaggio che include il DoubleZeroID firmato con la chiave di identità del validatore. La firma crittografica risultante serve come prova verificabile che controlli il validatore.

Infine, invierai una **richiesta di connessione a DoubleZero**. Questa richiesta comunica: *"Ecco la mia identità, ecco la prova di proprietà, ed ecco come intendo connettermi."* DoubleZero valida queste informazioni, accetta la prova e predispone l'accesso alla rete per il validatore su DoubleZero.

Questa guida consente a 1 Validatore Primario di registrarsi, insieme a un massimo di 3 macchine di backup/failover contemporaneamente.

## Prerequisiti

- Solana CLI installata e nel $PATH
- Per i validatori: Permesso di accesso al file della coppia di chiavi di identità del validatore (es., validator-keypair.json) sotto l'utente sol
- Per i validatori: Verificare che la chiave di Identità del validatore Solana collegato abbia almeno 1 SOL
- Le regole del firewall permettono connessioni in uscita per DoubleZero e Solana RPC secondo necessità, inclusi
 GRE (ip proto 47) e BGP (169.254.0.0/16 su tcp/179)

!!! info
    Il Validator ID verrà verificato confrontandolo con il gossip di Solana per determinare l'IP di destinazione. L'IP di destinazione e il DoubleZero ID verranno quindi utilizzati per aprire un tunnel GRE tra la tua macchina e il Dispositivo DoubleZero di destinazione.

    Nota: Nel caso in cui tu abbia un ID di scarto e un ID Primario sullo stesso IP, solo l'ID Primario verrà utilizzato nella registrazione della macchina. Questo perché l'ID di scarto non apparirà nel gossip e quindi non può essere usato per verificare l'IP della macchina di destinazione.

## 1. Confermare la rete del client

Segui le istruzioni di [setup](setup.md) prima di procedere. Installa i pacchetti per **mainnet-beta** o **testnet**. Utilizzano repository di pacchetti diversi.

L'ultimo passaggio del setup consisteva nel disconnettersi dalla rete. Questo serve a garantire che sulla tua macchina sia aperto un solo tunnel verso DoubleZero, e che quel tunnel sia sulla rete corretta.

Conferma che il client sia sulla rete che hai scelto:

```bash
doublezero status
```

La colonna `Network` dovrebbe mostrare `mainnet-beta` o `testnet`, in corrispondenza del tuo cluster Solana. Se è errata, o hai installato il pacchetto sbagliato, utilizza la procedura di cambio copia-incolla nella sezione [risoluzione problemi](troubleshooting.md#issue-wrong-doublezero-environment).

Dopo circa 30 secondi vedrai i dispositivi DoubleZero disponibili:

```bash
doublezero latency
```

Output di esempio (mainnet-beta; testnet appare uguale ma con meno dispositivi):

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

## 2. Aprire la porta 44880

Gli utenti devono aprire la porta 44880 per utilizzare alcune [funzionalità di routing](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

Per aprire la porta 44880 è possibile aggiornare le tabelle IP come segue:

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```


nota i flag `-i doublezero0`, `-o doublezero0` che limitano questa regola alla sola interfaccia DoubleZero

Oppure con UFW come segue:

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```


nota i flag `in on doublezero0`, `out on doublezero0` che limitano questa regola alla sola interfaccia DoubleZero

## 3. Attestare la Proprietà del Validatore

!!! note "Flag di rete"
    I comandi Passport riportati di seguito utilizzano `-u mainnet-beta`. Su testnet, usa `-u testnet` (o `-ut`) al suo posto.

Con il tuo Ambiente DoubleZero configurato, è ora il momento di attestare la Proprietà del tuo Validatore.

Il DoubleZero ID che hai creato nel [setup](setup.md) del tuo validatore primario deve essere utilizzato su tutte le macchine di backup.

L'ID sulla tua macchina primaria può essere trovato con `doublezero address`. Lo stesso ID deve trovarsi in `~/.config/doublezero/id.json` su tutte le macchine del cluster.

Per fare questo, prima di tutto verificherai che la macchina da cui stai eseguendo i comandi sia il tuo **Validatore Primario** con:

```
doublezero-solana passport find-validator -u mainnet-beta
```

Questo verifica che il validatore sia registrato nel gossip e che appaia nella schedule dei leader.

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
    Lo stesso flusso di lavoro è utilizzato per una o più macchine.
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
Questo output è previsto. Il nodo di backup non può essere nella schedule dei leader al momento della creazione del pass.

Ora eseguirai questo comando su **tutte le macchine di backup** su cui prevedi di utilizzare l'account di voto e l'identità del tuo **Validatore Primario**.


### Preparare la Connessione

Esegui il seguente comando sulla macchina del **Validatore Primario**. Questa è la macchina su cui hai stake attivo, che si trova nella schedule dei leader con l'ID del tuo validatore primario nel gossip di Solana sulla macchina da cui stai eseguendo il comando:

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


## 4. Generare la Firma

Al termine dell'ultimo passaggio, abbiamo ricevuto un output pre-formattato per `solana sign-offchain-message`

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


## 5. Avviare una Richiesta di Connessione in DoubleZero

Usa il comando `request-validator-access` per creare un account su Solana per la richiesta di connessione. L'agente DoubleZero Sentinel rileva il nuovo account, ne valida l'identità e la firma, e crea il pass di accesso in DoubleZero affinché il server possa stabilire una connessione.


Usa il node ID, il DoubleZeroID e la firma.

!!! note inline end
      In questo esempio usiamo `-k /home/user/.config/solana/id.json` per trovare l'Identità del validatore. Usa il percorso appropriato per la tua installazione locale.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**Output:**

Questo output può essere usato per visualizzare la transazione su un explorer Solana. Assicurati di impostare l'explorer su mainnet-beta o testnet in corrispondenza del tuo cluster. Questa verifica è opzionale.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

Se l'operazione ha successo, DoubleZero registrerà il primario con i suoi backup. Ora puoi effettuare il failover tra gli IP registrati nel pass di accesso. DoubleZero manterrà automaticamente la connettività quando si passa ai nodi di backup registrati in questo modo.


## 6. Connettersi in Modalità IBRL

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
Attendi un minuto affinché il tunnel GRE termini la configurazione. Fino a quando il tunnel GRE non sarà completamente configurato, l'output dello stato potrebbe restituire "down" o "Unknown"

Verifica la tua connessione:

```bash
doublezero status
```

**Output:**
!!! note inline end
    Esamina questo output. Nota che `Tunnel src` e `DoubleZero IP` corrispondono all'indirizzo IPv4 pubblico della tua macchina.
    <!--`Tunnel dst` è l'indirizzo del dispositivo DZ a cui sei connesso.-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```

(`Network` mostra `testnet` quando ti sei connesso su testnet.)

Uno stato `up` significa che sei connesso con successo.

Potrai visualizzare le rotte propagate dagli