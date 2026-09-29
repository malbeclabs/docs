---
description: Distribuisci e configura gli agenti geoProbe che eseguono le misurazioni di latenza alla base del servizio di Geolocalizzazione DoubleZero.
---

# Distribuzione Geoprobe

Questa guida illustra la distribuzione e la configurazione degli **agenti geoProbe** — i server che eseguono le misurazioni di latenza per il servizio di [Geolocalizzazione](geolocation.md) DoubleZero.

Un geoProbe si colloca tra i [DZD](glossary.md#dzd-doublezero-device) e i dispositivi target nella catena di misurazione a tre livelli. Riceve LocationOffset firmati dai DZD padre e misura l'[RTT](glossary.md#rtt-round-trip-time) verso i target registrati tramite [TWAMP](glossary.md#twamp-two-way-active-measurement-protocol), TWAMP firmato o ICMP echo. Ogni geoProbe è registrato onchain e collegato a uno o più DZD padre.

Per una panoramica dell'architettura di geolocalizzazione e dei flussi di misurazione, consulta la [guida utente alla Geolocalizzazione](geolocation.md).

---

## Prerequisiti

!!! warning "Versione dell'Agente di Telemetria DZD"
    I DZD padre devono eseguire la **versione dell'agente di telemetria del dispositivo 0.17.0 o successiva** per supportare il servizio di geolocalizzazione. Le versioni precedenti non includono le estensioni di scoperta dei probe, ping TWAMP e pubblicazione degli offset necessarie per la geolocalizzazione. Verificare le versioni degli agenti prima di distribuire un probe — un probe associato a un DZD più vecchio non riceverà gli offset.

Prima di distribuire un geoProbe, assicurati di avere:

- **Server Linux bare metal** — Un VPS può funzionare, ma è meno ideale.
- **Prossimità di rete a un DZD** — meno di 1ms di RTT tra il probe e il suo DZD padre. Idealmente 0,1ms o meno.
- **Capability `CAP_NET_RAW`** per il processo dell'agente (necessaria per il probing ICMP echo con raw socket)
- **Coppia di chiavi Ed25519** per l'identità di firma del probe
- **Autorizzazione della Foundation** — la registrazione del probe è attualmente soggetta all'approvazione della Foundation; coordinati con la [DZF](glossary.md#dzf-doublezero-foundation) prima di procedere
- **DZD padre** che eseguono l'agente di telemetria v0.17.0+

---

## Installazione

Installa sia il daemon dell'agente che la CLI doublezero:

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt install doublezero-geoprobe-agent doublezero
```

| Pacchetto | Scopo |
|-----------|-------|
| `doublezero-geoprobe-agent` | Daemon dell'agente che viene eseguito sul server del probe, effettuando misurazioni di latenza e generando offset firmati |
| `doublezero` | Strumento CLI utilizzato per la registrazione del probe e i comandi di gestione |

---

## Registrazione Onchain

La registrazione del probe richiede l'autorizzazione della Foundation. Coordinati con la DZF prima di procedere.

### Passo 1: Registrare il probe

```bash
doublezero geolocation probe create \
  --code <probe-code> \
  --exchange <exchange-pubkey> \
  --public-ip <probe-ip> \
  --signing-pubkey <signing-key-pubkey>
```

| Parametro | Descrizione |
|-----------|-------------|
| `--code` | Identificatore univoco per il probe (es. `ams-tn-gp1`) — massimo 32 caratteri |
| `--exchange` | Chiave pubblica dell'account Serviceability Exchange a cui questo probe è associato |
| `--public-ip` | Indirizzo IPv4 pubblico su cui il probe è in ascolto |
| `--signing-pubkey` | Chiave pubblica utilizzata per firmare offset e telemetria |

### Passo 2: Collegare i DZD padre

```bash
doublezero geolocation probe add-parent \
  --probe <probe-code> \
  --device <dzd-code>
```

Ogni DZD padre deve essere un dispositivo attivato nel Serviceability Program. I DZD scoprono automaticamente i probe figli ogni 60 secondi — una volta collegato, il DZD avvia automaticamente le misurazioni TWAMP e la generazione degli offset.

---

## Esecuzione dell'Agente

```bash
doublezero-geoprobe-agent \
  --env mainnet-beta \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey>
```

### Flag Obbligatori

| Flag | Descrizione |
|------|-------------|
| `--keypair` | Percorso del file della coppia di chiavi Ed25519 per la firma degli offset |
| `--geoprobe-pubkey` | La chiave pubblica [onchain](glossary.md#onchain) del probe (da `probe create`) |
| `--env` | Ambiente di rete: `testnet`, `devnet` o `mainnet-beta` (imposta l'URL RPC del ledger) |

In alternativa, usa `--ledger-rpc-url` al posto di `--env` per specificare un endpoint RPC Solana personalizzato.

### Flag Opzionali

| Flag | Default | Descrizione |
|------|---------|-------------|
| `--twamp-listen-port` | 8925 | Porta per le misurazioni TWAMP dai DZD padre |
| `--signed-twamp-port` | 8924 | Porta per i probe TWAMP firmati dai target in ingresso |
| `--udp-listen-port` | 8923 | Porta per la ricezione dei datagrammi LocationOffset dai DZD |
| `--probe-interval` | 30s | Frequenza di misurazione di ogni target |
| `--max-offset-age` | 1h | Età massima di un offset DZD in cache prima che venga scartato |
| `--verify-interval` | 29s | Frequenza di ri-verifica delle assegnazioni dei target dal ledger |
| `--verbose` | false | Abilita il logging dettagliato |
| `--metrics-enable` | false | Abilita l'endpoint di metriche Prometheus |
| `--metrics-addr` | — | Indirizzo per l'endpoint di metriche Prometheus (es. `0.0.0.0:9090`) |

---

## Porte e Firewall

L'agente geoprobe richiede l'apertura di diverse porte:

| Porta | Protocollo | Direzione | Scopo |
|-------|------------|-----------|-------|
| 8923/udp | UDP | In ingresso dai DZD | Ricezione dei datagrammi LocationOffset firmati |
| 8924/udp | UDP | In ingresso dai target | Riflettore TWAMP firmato (flusso di probing in ingresso) |
| 8925/udp | UDP | In ingresso dai DZD | Misurazioni TWAMP dai DZD padre |
| ICMP | ICMP | In uscita verso i target | Richieste ICMP echo per i target OutboundIcmp |

!!! note
    L'agente necessita anche di UDP in uscita verso i target per il probing TWAMP (flusso in uscita) e per la consegna dei risultati LocationOffset firmati ai target.

---

## Monitoraggio

Abilita l'endpoint di metriche Prometheus per la visibilità operativa:

```bash
doublezero-geoprobe-agent \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey> \
  --env testnet \
  --metrics-enable \
  --metrics-addr 0.0.0.0:9090
```

Metriche chiave da monitorare:

- **Disponibilità del probe** — uptime del processo dell'agente
- **Latenza DZD-Probe** — dovrebbe essere inferiore a 1ms; valori più alti indicano un problema di posizionamento
- **Target attivi** — numero di target che il probe sta attualmente misurando
- **Errori di verifica della firma** — valori diversi da zero possono indicare una configurazione errata delle chiavi o pacchetti manomessi
- **Tasso di hit della cache degli offset** — un tasso basso significa che il probe è frequentemente in attesa di offset DZD aggiornati

Consulta la [guida alle Operazioni](contribute-operations.md#monitoring) per indicazioni generali sullo scraping Prometheus e sui pattern di alerting utilizzati tra gli agenti DoubleZero.

---

## Comandi di Gestione del Probe

La CLI `doublezero geolocation` fornisce i seguenti sottocomandi per la gestione dei probe:

| Sottocomando | Descrizione |
|--------------|-------------|
| `probe create` | Registra un nuovo geoProbe onchain |
| `probe get` | Ottieni i dettagli di un probe specifico tramite codice |
| `probe list` | Elenca tutti i probe registrati |
| `probe update` | Aggiorna la configurazione del probe (IP, porta, chiave di firma) |
| `probe delete` | Elimina un probe (richiede che non vi siano riferimenti a target attivi) |
| `probe add-parent` | Collega un DZD padre al probe |
| `probe remove-parent` | Rimuovi un DZD padre dal probe |

Tutti i sottocomandi accettano `--env` o `--rpc-url` per selezionare la rete. Le operazioni di scrittura (`create`, `update`, `delete`, `add-parent`, `remove-parent`) richiedono `--keypair`.

??? note "Esempio: elenco dei probe"

    ```bash
    doublezero geolocation probe list
    ```

    Restituisce tutti i probe registrati con i relativi codici, IP pubblici, DZD padre e stato attuale.