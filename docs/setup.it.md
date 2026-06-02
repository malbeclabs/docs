# Come configurare DoubleZero

!!! info "Terminologia"
    Sei nuovo su DoubleZero? Consulta il [Glossario](glossary.md) per le definizioni di termini come [doublezerod](glossary.md#doublezerod), [IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency) e [DZD](glossary.md#dzd-doublezero-device).

!!! warning "Collegandomi a DoubleZero accetto i [Termini di Servizio di DoubleZero](https://doublezero.xyz/terms-protocol)"


## Prerequisiti
!!! warning inline end
    Per i validatori: DoubleZero deve essere installato direttamente sull'host del validatore, non in un container.
- Connettività Internet con un indirizzo IP pubblico (senza NAT)
- Server x86_64
- SO supportato: Ubuntu 22.04+ o Debian 11+, oppure Rocky Linux / RHEL 9+
- Privilegi root o sudo sul server dove verrà eseguito DoubleZero
- Opzionale ma utile: jq e curl per il debug

## Connessione a DoubleZero

DoubleZero Testnet e DoubleZero Mainnet-Beta sono reti fisicamente distinte. Scegli la rete appropriata durante l'installazione.

Durante l'onboarding su DoubleZero stabilirai un'**identità DoubleZero**, rappresentata da una chiave pubblica chiamata **DoubleZero ID**. Questa chiave fa parte del modo in cui DoubleZero riconosce la tua macchina.

## 1. Installare i pacchetti DoubleZero

<div data-wizard-step="install-version-info" markdown>

!!! info "Versioni attuali"
    | Pacchetto | Mainnet-Beta | Testnet |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |

</div>

Segui questi passaggi in base al tuo sistema operativo:

### Ubuntu / Debian

<div data-wizard-step="install-deb-mainnet-beta" markdown>

Il deployment attualmente raccomandato per Mainnet-Beta è:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

<div data-wizard-step="install-deb-testnet" markdown>

Il deployment attualmente raccomandato per Testnet è:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

### Rocky Linux / RHEL

<div data-wizard-step="install-rpm-mainnet-beta" markdown>

Il deployment attualmente raccomandato per Mainnet-Beta è:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-rpm-testnet" markdown>

Il deployment attualmente raccomandato per Testnet è:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-network-warning" markdown>

??? info "Solo utenti esistenti: Cambiare un pacchetto da *Testnet a Mainnet-Beta*, o da *Mainnet-Beta a Testnet*"
    Quando installi da uno dei repository di pacchetti sopra indicati, è specifico per DoubleZero **Testnet** o **DoubleZero Mainnet Beta**. Se cambi rete in qualsiasi momento, dovrai rimuovere i repository di pacchetti precedentemente installati e aggiornare al repository di destinazione.

    Questo esempio illustrerà la migrazione da Testnet a Mainnet-Beta

    Gli stessi passaggi possono essere completati per passare da Mainnet-Beta a Testnet, sostituendo il passaggio 3 con il comando di installazione per Testnet indicato sopra.


    1. Trovare i vecchi file del repository

        Per prima cosa, individua tutti i file di configurazione del repository DoubleZero esistenti sul tuo sistema:

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. Rimuovere i vecchi file del repository

        Rimuovi i vecchi file del repository trovati nel passaggio precedente, ad esempio

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. Installare dal nuovo repository

        Aggiungi il nuovo repository Mainnet-Beta e installa l'ultimo pacchetto:

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<current_recomended_version_above>
        ```


</div>

<div data-wizard-step="install-verify-daemon" markdown>

#### Verificare lo stato di `doublezerod`

Dopo l'installazione del pacchetto, una nuova unità systemd viene installata, attivata e avviata. Per visualizzare lo stato puoi eseguire:
```
sudo systemctl status doublezerod
```

</div>

### Configurare il firewall per GRE e BGP

DoubleZero utilizza il tunneling GRE (protocollo IP 47) e il routing BGP (tcp/179 su indirizzi link-local). Assicurati che il tuo firewall consenta questi protocolli:

Consentire GRE e BGP tramite iptables:

<div data-wizard-step="firewall-gre-bgp-iptables" markdown>

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```

</div>

Oppure consentire GRE e BGP tramite UFW:

<div data-wizard-step="firewall-gre-bgp-ufw" markdown>

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```

</div>

## 2. Creare una nuova identità DoubleZero

Crea un'identità DoubleZero sul tuo server con il seguente comando:

```bash
doublezero keygen
```

!!! info
    Se hai un ID esistente che desideri utilizzare, puoi seguire questi passaggi opzionali.

    Crea la directory di configurazione di doublezero

    ```
    mkdir -p ~/.config/doublezero
    ```

    Copia o collega il file `id.json` che vuoi utilizzare con DoubleZero nella directory di configurazione di doublezero.

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```
## 3. Recuperare l'identità DoubleZero del server

Visualizza la tua identità DoubleZero. Questa identità verrà utilizzata per creare la connessione tra la tua macchina e DoubleZero

```bash
doublezero address
```

**Output:**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. Verificare che doublezerod abbia scoperto i dispositivi DZ

Prima di connetterti, assicurati che `doublezerod` abbia scoperto e pingato ciascuno degli switch DZ testnet disponibili:

```
doublezero latency
```

Output di esempio:

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

Se nell'output non vengono restituiti dispositivi, attendi 10-20 secondi e riprova.

## 5. Disconnettersi da DoubleZero

Nelle prossime sezioni configurerai il tuo ambiente DoubleZero. Per garantire il successo, disconnetti la sessione corrente. Questo eviterà problemi legati a tunnel multipli aperti sulla tua macchina.

Verifica

```bash
doublezero status
```

se è `up` esegui:

```bash
doublezero disconnect
```

### Prossimo passo: Tenant

La connessione a DoubleZero varierà in base al tuo caso d'uso. Su DoubleZero, i Tenant sono gruppi che hanno profili utente simili. Esempi includono Blockchain, Data Transfer Layer, ecc.

### [Procedi per scegliere il tuo tenant qui](tenant.md)


# Opzionale: Abilitare le metriche Prometheus

Gli operatori che hanno familiarità con le metriche Prometheus potrebbero volerle abilitare per il monitoraggio di DoubleZero. Questo fornisce visibilità sulle prestazioni del client DoubleZero, sullo stato della connessione e sulla salute operativa.

## Quali metriche sono disponibili

DoubleZero espone diverse metriche chiave:
- **Informazioni sulla build**: Versione, hash del commit e data di build
- **Stato della sessione**: Se la sessione DoubleZero è attiva
- **Metriche di connessione**: Latenza e informazioni sulla connettività
- **Dati sulle prestazioni**: Throughput e tassi di errore

## Abilitare le metriche Prometheus

Per abilitare le metriche Prometheus sul client DoubleZero, segui questi passaggi:

### 1. Modificare il comando di avvio del servizio systemd doublezerod

Crea o modifica la configurazione di override di systemd:

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

Sostituisci con questa configurazione:

Nota che il flag `-env` deve puntare a `testnet` o `mainnet-beta` a seconda della rete da cui desideri raccogliere i dati. Nel blocco di esempio viene utilizzato `testnet`. Puoi sostituirlo con `mainnet-beta` se necessario.

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env testnet -metrics-enable -metrics-addr localhost:2113
```

### 2. Ricaricare e riavviare il servizio

```bash
sudo systemctl daemon-reload
sudo systemctl restart doublezerod
sudo systemctl status doublezerod
```

### 3. Verificare che le metriche siano disponibili

Testa che l'endpoint delle metriche stia rispondendo:

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
## Risoluzione dei problemi

Se le metriche non vengono visualizzate:

1. **Verifica lo stato del servizio**: `sudo systemctl status doublezerod`
2. **Verifica la configurazione**: `sudo systemctl cat doublezerod`
3. **Controlla i log**: `sudo journalctl -u doublezerod -f`
4. **Testa l'endpoint**: `curl -v localhost:2113/metrics`
5. **Verifica la porta**: `netstat -tlnp | grep 2113`


## Configurare il server Prometheus

La configurazione e la sicurezza esulano dall'ambito di questa documentazione.
Grafana è un'eccellente opzione per la visualizzazione e dispone di documentazione disponibile [qui](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/) che descrive come raccogliere le metriche Prometheus.

## Dashboard Grafana (Opzionale)

Per la visualizzazione, puoi creare una dashboard Grafana utilizzando le metriche di DoubleZero. I pannelli comuni includono:
- Stato della sessione nel tempo
- Informazioni sulla build
- Tendenze della latenza di connessione
- Monitoraggio del tasso di errore