---
description: Diagnostica i problemi di connessione DoubleZero più comuni con comandi di riferimento, output attesi e dove ottenere ulteriore supporto.
---

# Risoluzione dei problemi

Questa guida copre una varietà di problemi ed è in continuo aggiornamento. Se completi la guida puoi cercare ulteriore supporto nel discord di [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701).


## Comandi e output comuni

Per iniziare, esamina l'output dei seguenti comandi e il loro output atteso. Questi ti assisteranno in una risoluzione dei problemi più dettagliata.
Se apri un ticket, potrebbe esserti richiesto il loro output.

#### 1. Verifica della versione
Comando:

`doublezero --version`

Output di esempio:
```
DoubleZero 0.6.3
```
[comment]: # (when repo is public add this link to check https://github.com/malbeclabs/doublezero)

#### 2. Verifica dell'indirizzo DoubleZero
Comando:

`doublezero address`

Output di esempio:
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```
[comment]: # ()

#### 3. Verifica del tuo Access Pass

Pubkey di esempio: `MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` sostituiscila con la tua pubkey quando esegui il comando.

Comando:

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

Output: [nota: usiamo `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'` per mostrarti ora l'intestazione in questo output]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
```
[comment]: # ()
#### 4. Verifica dei crediti nel ledger DoubleZero
Comando:

`doublezero balance`

Output di esempio:
```
0.78 Credits
```
[comment]: # (add section linked later for 0 balance mainnet/testnet)

#### 5. Verifica dello stato della connessione
Comando:

`doublezero status`

Output di esempio:

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```
[comment]: # (in next iteration add "up" "unknown" and "down" explainers, which then link to a sectino below for troubleshooting undesired states.)


#### 6. Verifica della latenza
Comando:

`doublezero latency`

Output di esempio:
```
 pubkey                                       | code         | ip             | min      | max      | avg      | reachable 
 6E1fuqbDBG5ejhYEGKHNkWG5mSTczjy4R77XCKEdUtpb | nyc-dz001    | 64.86.249.22   | 2.49ms   | 2.61ms   | 2.56ms   | true
 Cpt3doj17dCF6bEhvc7VeAuZbXLD88a1EboTyE8uj6ZL | lon-dz001    | 195.219.120.66 | 71.94ms  | 72.11ms  | 72.02ms  | true
 CT8mP6RUoRcAB67HjKV9am7SBTCpxaJEwfQrSjVLdZfD | lax-dz001    | 207.45.216.134 | 72.42ms  | 72.51ms  | 72.45ms  | true
 4Wr7PQr5kyqCNJo3RKa8675K7ZtQ6fBUeorcexgp49Zp | ams-dz001    | 195.219.138.50 | 76.50ms  | 76.71ms  | 76.60ms  | true
 29ghthsKeH2ZCUmN2sUvhJtpEXn2ZxqAuq4sZFBFZmEs | fra-dz001    | 195.219.220.58 | 83.00ms  | 83.14ms  | 83.08ms  | true
 hWffRFpLrsZoF5r9qJS6AL2D9TEmSvPUBEbDrLc111Y  | fra-dz-001-x | 195.12.227.250 | 84.81ms  | 84.89ms  | 84.85ms  | true
 8jyamHfu3rumSEJt9YhtYw3J4a7aKeiztdqux17irGSj | prg-dz-001-x | 195.12.228.250 | 104.81ms | 104.83ms | 104.82ms | true
 5tqXoiQtZmuL6CjhgAC6vA49JRUsgB9Gsqh4fNjEhftU | tyo-dz001    | 180.87.154.78  | 178.04ms | 178.23ms | 178.13ms | true
 D3ZjDiLzvrGi5NJGzmM7b3YZg6e2DrUcBCQznJr3KfC8 | sin-dz001    | 180.87.102.98  | 227.67ms | 227.85ms | 227.75ms | true
```
[comment]: # ()

# Esempi di risoluzione dei problemi
Ora che abbiamo esaminato gli output di base e ciò che è atteso in un deployment sano, possiamo esaminare alcuni esempi comuni di risoluzione dei problemi.

### Problema: ❌ Error creating user

Questo problema è generalmente legato a una discrepanza tra la coppia pubkey/IP attesa e la coppia pubkey/IP con cui l'utente sta cercando di accedere a DoubleZero.

**Sintomi:**
- Quando ci si connette con `doublezero connect ibrl` l'utente incontra `❌ Error creating user`


**Soluzioni:**
1. Verifica

    `doublezero address`

    Output di esempio:
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. Verifica che questo indirizzo sia nella lista consentita:

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    Output di esempio:
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
    ```
     La pubkey ottenuta da `doublezero address` deve corrispondere alla pubkey user_payer e l'indirizzo IP da cui stai cercando di connetterti deve corrispondere all'ip nell'Access-Pass.
    `doublezero address` è ricavato dal file id.json in ~/.config/doublezero/ per impostazione predefinita. Vedi il [passo 6 qui](<setup.md>)
    
3. Se quanto sopra sembra corretto e stai ricevendo un errore durante la connessione, o se la mappatura sopra è errata, contatta il supporto su [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)

### Problema: ❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
Questo errore indica che un dispositivo è già connesso a DoubleZero.

**Sintomi:**
- L'utente cerca di connettersi a DoubleZero
- Si incontra `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time`.

**Soluzioni:**
1. Verifica
    `doublezero status`

    Output:
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. -`up`- indica una connessione sana.
3. L'errore appare perché un tunnel verso DoubleZero con lo specifico IP DoubleZero è già attivo su questa macchina.

    Questo errore si incontra spesso dopo un aggiornamento del client DoubleZero. Gli aggiornamenti di DoubleZero riavviano automaticamente il servizio doublezerod e ti riconnetteranno se eri connesso prima del riavvio del servizio.


### Problema: Lo stato di DoubleZero è unknown o down
Questo problema è spesso legato al tunnel GRE che viene attivato con successo tra il server e il dispositivo DoubleZero, ma un firewall impedisce l'instaurazione della sessione BGP. Per questo motivo non stai ricevendo rotte dalla rete né inviando traffico attraverso DoubleZero.

**Sintomi:**
- `doublezero connect ibrl` ha avuto successo. Tuttavia, `doublezero status` restituisce `down` o `unknown`
    ```
    doublezero connect ibrl                                                                                                                                                                                                                                                                                                                                  
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
    ✅  User Provisioned
    ```

    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```

**Soluzioni:**
1. Controlla le regole del firewall!

   DoubleZero utilizza lo spazio di indirizzi link local: 169.254.0.0/16 per le interfacce del tunnel GRE tra la tua macchina e il dispositivo DoubleZero. 169.254.0.0/16 è tipicamente uno spazio "non instradabile" e quindi le buone pratiche di sicurezza raccomandano di bloccare le comunicazioni da/verso questo spazio. Dovrai consentire una regola nel tuo firewall che permetta alla sorgente 169.254.0.0/16 di comunicare con la destinazione 169.254.0.0/16 sulla porta tcp 179. Questa regola dovrà essere posizionata sopra qualsiasi regola che nega il traffico verso 169.254.0.0/16.

    In un firewall come ufw puoi eseguire `sudo ufw status` per visualizzare le regole del firewall e

    Output di esempio che potrebbe essere simile a quello che avrebbe un validatore Solana.
    ```
    To                         Action      From
    --                         ------      ----
    22/tcp                     ALLOW       Anywhere
    8899/tcp                   ALLOW       Anywhere
    8000:10000/tcp             ALLOW       Anywhere
    8000:10000/udp             ALLOW       Anywhere
    11200:11300/udp            ALLOW       Anywhere
    11200:11300/tcp            ALLOW       Anywhere

    To                         Action      From
    --                         ------      ----
    10.0.0.0/8                 DENY OUT    Anywhere
    169.254.0.0/16             DENY OUT    Anywhere
    172.16.0.0/12              DENY OUT    Anywhere
    192.168.0.0/16             DENY OUT    Anywhere
    ```

    Nell'output sopra puoi vedere che tutto il traffico verso 169.254.0.0/16, eccetto per le porte specificate, è negato.
    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179` per inserire la regola nella posizione <N>. Es.: se N = 1 inserirai questa regola come prima regola.
    `sudo ufw status numbered` ti mostrerà l'ordinamento numerico delle regole.
    
### Problema: Il dispositivo DoubleZero più vicino è cambiato

Questo non è un errore, ma può essere un'ottimizzazione. Di seguito una buona pratica che può essere eseguita di tanto in tanto, o automatizzata.

**Soluzioni:**

1. Verifica la latenza verso il dispositivo più vicino
    - esegui `doublezero latency`

        output
        ```
         pubkey                                       | code          | ip              | min      | max      | avg      | reachable 
         2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.80ms   | 1.90ms   | 1.84ms   | true      
         ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.83ms   | 2.10ms   | 1.92ms   | true      
         8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.87ms   | 2.66ms   | 2.15ms   | true      
         8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.33ms   | 2.39ms   | 2.37ms   | true      
         FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.29ms   | 2.59ms   | 2.40ms   | true   
        ```
        nota sopra che il dispositivo più vicino è `dz-ny7-sw01`

        Vogliamo connetterci a questo dispositivo. :

2. Determina se sei già connesso al dispositivo target
    - esegui `doublezero user list --env testnet | grep 111.11.11.11` sostituisci `111.11.11.11` con l'indirizzo IPv4 pubblico del tuo dispositivo connesso a DoubleZero. Puoi anche usare il tuo validator ID o doublezero ID.

        output
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        In questo esempio, siamo già connessi al dispositivo più vicino. Non sono necessari altri passaggi, possiamo fermarci qui.


        Consideriamo invece se l'output fosse stato
         ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | fra-dz-001-x     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        Questa sarebbe una connessione sub-ottimale. Valutiamo se è necessaria una riconnessione.

        Prima della connessione, verificheremo se il dispositivo ha tunnel utente disponibili.

3. Opzionale: esaminare la rete per i dispositivi disponibili

    A scopo didattico per prima cosa:
    - esegui `doublezero device list` per un elenco completo dei dispositivi. Abbiamo estratto 2 dispositivi come esempio per spiegare l'output.

        output:
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner                                        
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp 
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        Nota sopra che `ams001-dz002` ha 69 utenti e 128 utenti massimi. Questo dispositivo può aggiungere 59 utenti.

        Tuttavia, `dz-fr5-sw01` ha 0 utenti e 0 utenti massimi. Non sarà possibile connettersi a questo dispositivo. Con un massimo di 0 utenti, il dispositivo non accetta alcuna connessione.

        Ora torniamo alla connessione al nostro dispositivo più vicino.

4. Determina se il dispositivo target ha una connessione disponibile
    - esegui `doublezero device list | grep dz-ny7-sw01` sostituisci `dz-ny7-sw01` con il tuo dispositivo target

        output
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        qui possiamo vedere che `dz-ny7-sw01` ha spazio disponibile per la connessione.

5. Connettiti al dispositivo DoubleZero più vicino

    Ci disconnetteremo e poi ci riconnetteremo a DoubleZero.

    Prima esegui
    - `doublezero disconnect`

      output

        ```
        DoubleZero Service Provisioning
        🔍  Decommissioning User
        Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
        \ [00:00:00] [##########>-----------------------------] 1/4 deleting user       account...                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     🔍  Deleting User Account for: 6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW
        🔍  User Account deleted
        ✅  Deprovisioning Complete
        ```
    ora controlliamo lo stato per confermare la nostra disconnessione con
    - `doublezero status`

    output

    ```
    Tunnel status | Last Session Update | Tunnel Name | Tunnel src | Tunnel dst | Doublezero IP | User Type 
    disconnected  | no session data     |             |            |            |               |    
    ```
    Infine ci riconnetteremo con
    - `doublezero connect ibrl`

    output
    ```
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: dz-ny7-sw01 
    Service provisioned with status: ok
    ✅  User Provisioned
    ```
    nota nell'output sopra che ci siamo `Connected to device: dz-ny7-sw01` questo è il risultato desiderato dalla nostra indagine iniziale al passo 1, dove abbiamo scoperto che `dz-ny7-sw01` era il dispositivo con la latenza più bassa.

### Problema: ambiente DoubleZero errato

Mainnet-Beta e Testnet utilizzano repository di pacchetti diversi. `doublezero status` mostra a quale rete il client è connesso (colonna `Network`). Se un utente ha installato il client sbagliato, o il daemon è ancora puntato verso l'altro ambiente, usa questi comandi copia-incolla per il cambio.

Per configurare la CLI del client DoubleZero (`doublezero`) e il daemon (`doublezerod`) per connettersi a **DoubleZero testnet**:

```bash
DESIRED_DOUBLEZERO_ENV=testnet \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Per configurare la CLI del client DoubleZero (`doublezero`) e il daemon (`doublezerod`) per connettersi a **DoubleZero mainnet-beta**:

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Dovresti vedere: `✅ doublezerod configured for environment mainnet-beta` (o `testnet`). Poi `doublezero status` dovrebbe mostrare il `Network` corrispondente.

### Problema: `doublezero status` restituisce alcuni campi con N/A

Questo problema è generalmente legato a una discrepanza tra il daemon e il client attuali rispetto al daemon e al client con cui il tunnel DZ connesso era stato stabilito.

**Sintomi:**
- Quando si esegue `doublezero status` l'utente incontra `N/A` in alcuni campi




**Soluzioni:**
1. Esegui
`doublezero status`

    Esempio:

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro | Network
    up            | 2025-10-20 20:06:18 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | N/A            | ✅ dz-ny7-sw01        | N/A   | mainnet-beta
    ```

    Nota nell'output di esempio sopra che il `Tunnel status` è `up`. Il nostro `Network` è `mainnet-beta` Tuttavia, `Current Device` e `Metro` sono `N/A`

    Questo indica un tunnel aperto sulla tua macchina che non si trova nel tuo ambiente attuale.
    In questo caso lo stato `up`, senza alcun `Current Device` trovato su `mainnet-beta`, ci rivela che il nostro tunnel è su testnet!
 
2. Cambia ambiente usando i comandi copia-incolla in [ambiente DoubleZero errato](#problema-ambiente-doublezero-errato). Usa l'opposto del valore `Network` che restituisce `N/A`.

3. Controlla il tuo stato

    Dopo aver cambiato ambiente esegui:

    ```
    doublezero status
    ```

    L'output atteso dovrebbe essere simile a:

    ``` 
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro    | Network 
    up            | 2025-10-21 12:32:12 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | nyc-dz001      | ✅ nyc-dz001          | New York | testnet 
    ```
Con tutti i campi popolati ora ti trovi nell'ambiente corretto.