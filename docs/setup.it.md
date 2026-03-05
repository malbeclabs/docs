# Configurazione di DoubleZero

!!! info "Terminologia"
    Nuovo a DoubleZero? Consulta il [Glossario](glossary.md) per le definizioni di termini come [doublezerod](glossary.md#doublezerod), [IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency), [DZD](glossary.md#dzd-doublezero-device) e altri.

!!! warning "Connettendosi a DoubleZero, accetti i [Termini di Servizio DoubleZero](https://doublezero.xyz/terms-protocol)"


## Prerequisiti
!!! warning inline end
    Per i validatori: DoubleZero deve essere installato direttamente sull'host del validatore, non in un container.
- Connessione internet con indirizzo IP pubblico (senza NAT)
- Server x86_64
- Sistema operativo supportato: Ubuntu 22.04+ o Debian 11+, oppure Rocky Linux / RHEL 8+
- Privilegi root o sudo sul server che esegue DoubleZero
- Facoltativo ma utile: jq e curl per il debug

## Connessione a DoubleZero

Il Testnet DoubleZero e il Mainnet Beta DoubleZero sono reti fisicamente distinte. Scegli la rete appropriata durante l'installazione.

Unendoti a DoubleZero, stabilisci una **identità DoubleZero** (una chiave pubblica chiamata **DoubleZero ID**). Questa chiave è uno dei modi in cui DoubleZero identifica la tua macchina.

## 1. Installa il pacchetto DoubleZero

<div data-wizard-step="install-version-info" markdown>

!!! info "Versione Corrente"
    | Pacchetto | Mainnet Beta | Testnet |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |

</div>

Segui le istruzioni seguenti in base al tuo sistema operativo:

### Ubuntu / Debian

<div data-wizard-step="install-deb-mainnet-beta" markdown>

Deployment corrente raccomandato per Mainnet Beta:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

<div data-wizard-step="install-deb-testnet" markdown>

Deployment corrente raccomandato per Testnet:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

### Rocky Linux / RHEL

<div data-wizard-step="install-rpm-mainnet-beta" markdown>

Deployment corrente raccomandato per Mainnet Beta:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-rpm-testnet" markdown>

Deployment corrente raccomandato per Testnet:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-network-warning" markdown>

??? info "Solo utenti esistenti: Passaggio del pacchetto da *Testnet a Mainnet Beta*, o da *Mainnet Beta a Testnet*"
    Installando dai repository di pacchetti sopra, il **Testnet** DoubleZero o il **Mainnet Beta DoubleZero** hanno ciascuno il proprio repository dedicato. Se ad un certo punto devi cambiare rete, dovrai rimuovere il repository del pacchetto precedentemente installato e aggiornare al repository target.

    Questo esempio mostra la migrazione da Testnet a Mainnet Beta.

    Seguendo gli stessi passaggi ma sostituendo il passaggio 3 con il comando di installazione Testnet sopra, è possibile completare la migrazione da Mainnet Beta a Testnet.


    1. Trova i vecchi file del repository

        Prima, identifica i file di configurazione del repository DoubleZero esistenti sul sistema:

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. Rimuovi i vecchi file del repository

        Rimuovi i vecchi file del repository trovati nel passaggio precedente. Ad esempio:

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. Installa dal nuovo repository

        Aggiungi il nuovo repository Mainnet Beta e installa l'ultimo pacchetto:

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<versione_corrente_raccomandata_sopra>
        ```


</div>

<div data-wizard-step="install-verify-daemon" markdown>

#### Controlla lo stato di `doublezerod`

Dopo l'installazione del pacchetto, verrà installata, abilitata e avviata una nuova unità systemd. Per controllare lo stato, esegui il seguente comando:
```
sudo systemctl status doublezerod
```

</div>

### Configurazione Firewall per GRE e BGP

DoubleZero utilizza tunnel GRE (protocollo IP 47) e routing BGP (tcp/179 per indirizzi link-local). Assicurati che il tuo firewall consenta questi protocolli:

Consenti GRE e BGP con iptables:

<div data-wizard-step="firewall-gre-bgp-iptables" markdown>

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```

</div>

O consenti GRE e BGP con UFW:

<div data-wizard-step="firewall-gre-bgp-ufw" markdown>

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```

</div>

## 2. Crea una Nuova Identità DoubleZero

Usa il seguente comando per creare un'identità DoubleZero sul server:

```bash
doublezero keygen
```

!!! info
    Se hai un ID esistente che vuoi utilizzare, puoi seguire i passaggi opzionali seguenti.

    Crea la directory di configurazione di doublezerod

    ```
    mkdir -p ~/.config/doublezero
    ```

    Copia o collega il file `id.json` che vuoi usare in DoubleZero nella directory di configurazione doublezero.

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```

## 3. Ottieni l'Identità DoubleZero del Server

Conferma la tua identità DoubleZero. Questa identità viene utilizzata per creare la connessione tra la tua macchina e DoubleZero.

```bash
doublezero address
```

**Output:**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. Conferma che doublezerod ha Rilevato i Dispositivi DZ

Prima di connetterti, conferma che `doublezerod` ha rilevato e pingato ogni switch DZ testnet disponibile:

```
doublezero latency
```

Esempio di output:

```
$ doublezero latency
 pubkey                                       | name      | ip             | min      | max      | avg      | reachable
 96AfeBT6UqUmREmPeFZxw6PbLrbfET51NxBFCCsVAnek | la2-dz01  | 207.45.216.134 |   0.38ms |   0.45ms |   0.42ms | true
 CCTSmqMkxJh3Zpa9gQ8rCzhY7GiTqK7KnSLBYrRriuan | ny5-dz01  | 64.86.249.22   |  68.81ms |  68.87ms |  68.85ms | true
 BX6DYCzJt3XKRc1Z3N8AMSSqctV6aDdJryFMGThNSxDn | ty2-dz01  | 180.87.154.78  | 112.16ms | 112.25ms | 112.22ms | true
 55tfaZ1kRGxugv7MAuinXP4rHATcGTbNyEKrNsbuVLx2 | ld4-dz01  | 195.219.120.66 | 138.15ms | 138.21ms | 138.17ms | true
 3uGKPEjinn74vd9LHtC4VJvAMAZZgU9qX9rPxtc6pF2k | ams-dz001 | 195.219.138.50 | 141.84ms | 141.97ms | 141.91ms | true
 65DqsEiFucoFWPLHnwbVHY1mp3d7MNM2gNjDTgtYZtFQ | frk-dz01  | 195.219.220.58 | 143.52ms | 143.62ms | 143.58ms | true
 9uhh2D5c14WJjbwgM7BudztdoPZYCjbvqcTPgEKtTMZE | sg1-dz01  | 180.87.102.98  | 176.66ms | 176.76ms | 176.72ms | true
```

Se i dispositivi non appaiono nell'output, attendi 10-20 secondi e riprova.

## 5. Disconnettiti da DoubleZero

La sezione successiva configurerà l'ambiente DoubleZero. Per garantire il successo, disconnetti la sessione corrente. Questo evita problemi con più tunnel aperti sulla macchina.

Conferma

```bash
doublezero status
```

Se lo stato è `up`, esegui:

```bash
doublezero disconnect
```

### Passo Successivo: Tenant

La connessione a DoubleZero varia in base al caso d'uso. In DoubleZero, i tenant sono gruppi con profili utente simili. Ad esempio: blockchain, livelli di trasferimento dati, ecc.

### [Seleziona il Tenant e Continua qui](tenant.md)


# Opzionale: Abilitare le Metriche Prometheus

Gli operatori che conoscono le metriche Prometheus potrebbero voler abilitarle per il monitoraggio DoubleZero. Questo ti permetterà di ottenere informazioni sulle prestazioni del client DoubleZero, sullo stato della connessione e sulla salute operativa.

## Metriche Disponibili

DoubleZero espone diverse metriche chiave:
- **Informazioni di build**: versione, hash commit, data di build
- **Stato della sessione**: se la sessione DoubleZero è attiva
- **Metriche di connessione**: latenza e informazioni di connessione
- **Dati di prestazione**: throughput e tassi di errore

## Abilitazione delle Metriche Prometheus

Per abilitare le metriche Prometheus sul client DoubleZero, segui questi passaggi:

### 1. Modifica il comando di avvio del servizio systemd doublezerod

Crea o modifica la configurazione di override systemd:

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

Sostituisci con questa configurazione:

Il flag `-env` deve puntare a `testnet` o `mainnet-beta` a seconda della rete da cui vuoi raccogliere dati. Nel blocco di esempio viene utilizzato `testnet`. Se necessario, può essere cambiato in `mainnet-beta`.

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env testnet -metrics-enable -metrics-addr localhost:2113
```

### 2. Ricarica e riavvia il servizio

```bash
sudo systemctl daemon-reload
sudo systemctl restart doublezerod
sudo systemctl status doublezerod
```

### 3. Conferma che le metriche siano disponibili

Conferma che l'endpoint delle metriche stia rispondendo:

```bash
curl -s localhost:2113/metrics | grep doublezero
```

Output atteso:

```
# HELP doublezero_build_info Build information of the client
# TYPE doublezero_build_info gauge
doublezero_build_info{commit="0d684e1b",date="2025-09-10T16:30:25Z",version="0.6.4"} 1
# HELP doublezero_session_is_up Status of session to doublezero
# TYPE doublezero_session_is_up gauge
doublezero_session_is_up 0
```

## Risoluzione dei Problemi

Se le metriche non vengono visualizzate:

1. **Controlla lo stato del servizio**: `sudo systemctl status doublezerod`
2. **Verifica la configurazione**: `sudo systemctl cat doublezerod`
3. **Controlla i log**: `sudo journalctl -u doublezerod -f`
4. **Testa l'endpoint**: `curl -v localhost:2113/metrics`
5. **Controlla la porta**: `netstat -tlnp | grep 2113`


## Configurazione del Server Prometheus

La configurazione e la sicurezza esulano dall'ambito di questo documento.
Grafana è un'ottima opzione per la visualizzazione, e la documentazione Grafana [qui](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/) descrive come raccogliere metriche Prometheus.

## Dashboard Grafana (Opzionale)

Per la visualizzazione, puoi creare una dashboard Grafana con le metriche DoubleZero. I pannelli comuni includono:
- Stato della sessione nel tempo
- Informazioni di build
- Tendenze della latenza di connessione
- Monitoraggio del tasso di errore
