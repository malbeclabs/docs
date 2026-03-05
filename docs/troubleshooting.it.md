# Risoluzione dei Problemi

Questa guida copre una varietà di problemi ed è in continuo aggiornamento. Se completi la guida puoi cercare ulteriore supporto nel Discord [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701).


## Comandi Comuni e Output

Per iniziare, esamina l'output dei seguenti comandi e il loro output atteso. Questi ti aiuteranno nella risoluzione dei problemi più dettagliata.
Se apri un ticket, potrebbe essere richiesto l'output di questi comandi.

#### 1. Controlla la Versione
Comando:

`doublezero --version`

Output di esempio:
```
DoubleZero 0.6.3
```

#### 2. Controlla l'Indirizzo DoubleZero
Comando:

`doublezero address`

Output di esempio:
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```

#### 3. Verifica il tuo Pass di Accesso

Chiave pubblica di esempio: `MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` - sostituiscila con la tua chiave pubblica quando esegui il comando.

Comando:

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

Output: [nota che usiamo `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'` per mostrare l'intestazione in questo output]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
```

#### 4. Controlla i Crediti del Registro DoubleZero
Comando:

`doublezero balance`

Output di esempio:
```
0.78 Credits
```

#### 5. Controlla lo Stato della Connessione
Comando:

`doublezero status`

Output di esempio:

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```


#### 6. Controlla la Latenza
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

# Esempi di Risoluzione dei Problemi
Ora che abbiamo esaminato gli output di base e ciò che è atteso in un deployment sano, possiamo esaminare alcuni esempi comuni di risoluzione dei problemi.

### Problema: ❌ Error creating user

Questo problema è generalmente correlato a una mancata corrispondenza tra la coppia chiave pubblica/IP attesa e quella che l'utente sta cercando di usare per accedere a DoubleZero.

**Sintomi:**
- Quando si connette con `doublezero connect ibrl` l'utente incontra `❌ Error creating user`


**Soluzioni:**
1. Controlla

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
     La chiave pubblica da `doublezero address` deve corrispondere alla chiave pubblica user_payer e l'indirizzo IP da cui stai cercando di connetterti deve corrispondere all'IP nell'Access-Pass.
    `doublezero address` è originato dal file id.json in ~/.config/doublezero/ per impostazione predefinita. Vedi il [passaggio 6 qui](https://docs.malbeclabs.com/setup/)

3. Se quanto sopra sembra corretto e stai ricevendo un errore durante la connessione, o se la mappatura sopra è errata, contatta il supporto in [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)

### Problema: ❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
Questo errore indica che un dispositivo è già connesso a DoubleZero.

**Sintomi:**
- L'utente cerca di connettersi a DoubleZero
- Viene incontrato `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time`.

**Soluzioni:**
1. Controlla
    `doublezero status`

    Output:
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. `-up-` indica una connessione sana.
3. L'errore appare perché un tunnel a DoubleZero con il DoubleZero IP specifico è già attivo su questa macchina.

    Questo errore si verifica spesso dopo un aggiornamento del client DoubleZero. Gli aggiornamenti DoubleZero riavviano automaticamente il servizio doublezerod e ti riconnetteranno se eri connesso prima del riavvio del servizio.


### Problema: Lo Stato DoubleZero è unknown o down
Questo problema è spesso correlato al tunnel GRE attivato con successo tra il server e il DoubleZero Device, ma un firewall che impedisce l'instaurazione della sessione BGP. Per questo motivo non stai ricevendo route dalla rete né inviando traffico su DoubleZero.

**Sintomi:**
- `doublezero connect ibrl` è riuscito. Tuttavia, `doublezero status` restituisce `down` o `unknown`
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
1. Controlla le tue regole firewall!

   DoubleZero utilizza lo spazio degli indirizzi link-local: 169.254.0.0/16 per le interfacce tunnel GRE tra la tua macchina e il DoubleZero Device. 169.254.0.0/16 è tipicamente spazio "non instradabile" e pertanto le buone pratiche di sicurezza raccomandano di bloccare le comunicazioni verso/da questo spazio. Dovrai autorizzare una regola nel tuo firewall che consenta a src 169.254.0.0/16 di comunicare con dst 169.254.0.0/16 sulla porta tcp 179. Quella regola dovrà essere posizionata sopra qualsiasi regola che nega il traffico verso 169.254.0.0/16.

    In un firewall come ufw puoi eseguire `sudo ufw status` per visualizzare le regole del firewall.

    Output di esempio che potrebbe essere simile a quello di un validatore Solana.
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

    Nell'output sopra vedi che tutto il traffico verso 169.254.0.0/16, eccetto le porte specificate, viene negato.
    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179` per inserire la regola nella posizione <N>. Cioè, se N = 1 inserirai questa regola come prima regola.
    `sudo ufw status numbered` ti mostrerà l'ordinamento numerico delle regole.

### Problema: Il dispositivo DoubleZero più vicino è cambiato

Non si tratta di un errore, ma può essere un'ottimizzazione. Di seguito è riportata una best practice che può essere eseguita di tanto in tanto, o automatizzata.

**Soluzioni:**

1. Controlla la latenza verso il dispositivo più vicino
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

        Vogliamo connetterci a questo dispositivo.

2. Determina se sei già connesso al dispositivo target
    - esegui `doublezero user list --env testnet | grep 111.11.11.11` sostituendo `111.11.11.11` con l'indirizzo IPv4 pubblico del tuo dispositivo connesso a DoubleZero.

        output
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
        ```
        In questo esempio, siamo già connessi al dispositivo più vicino. Non sono necessari altri passaggi, possiamo fermarci qui.

3. Opzionale: esamina la rete per i dispositivi disponibili

    - esegui `doublezero device list` per un elenco completo dei dispositivi.

        output:
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp
        ```
        Nota che `ams001-dz002` ha 69 utenti e 128 max utenti. Questo dispositivo può aggiungere 59 utenti.

        Tuttavia, `dz-fr5-sw01` ha 0 utenti e 0 max utenti. Non potrai connetterti a questo dispositivo.

4. Determina se il dispositivo target ha una connessione disponibile
    - esegui `doublezero device list | grep dz-ny7-sw01`

        output
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp
        ```

5. Connettiti al DoubleZero Device più vicino

    Prima esegui
    - `doublezero disconnect`

    poi controlla lo stato con
    - `doublezero status`

    poi riconnettiti con
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

### Problema: `doublezero status` restituisce alcuni campi con N/A

Questo problema è generalmente correlato a una mancata corrispondenza tra il daemon e il client correnti, rispetto al daemon e al client con cui è stato stabilito il tunnel DZ connesso.

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

    Nota nell'esempio sopra che il `Tunnel status` è `up`. La nostra `Network` è `mainnet-beta`. Tuttavia, `Current Device` e `Metro` sono `N/A`.

    Questo indica un tunnel aperto sulla tua macchina che non è nel tuo ambiente corrente.
    In questo caso lo stato `up`, senza `Current Device` trovato su `mainnet-beta`, ci rivela che il nostro tunnel è su testnet!

2. Cambia il tuo ambiente.

    Per correggere la mancata corrispondenza cambierai il tuo ambiente all'opposto dell'ambiente che restituisce il `N/A`

    ```bash
    DESIRED_DOUBLEZERO_ENV=testnet \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

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
Con tutti i campi popolati sei ora nell'ambiente corretto.
