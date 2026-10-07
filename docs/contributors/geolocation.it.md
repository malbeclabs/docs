---
description: Distribuisci e configura gli agenti geoProbe che eseguono le misurazioni di latenza alla base del servizio di Geolocalizzazione di DoubleZero.
---

# Distribuzione di Geoprobe

Questa guida illustra la distribuzione e la configurazione degli **agenti geoProbe** — i server che eseguono le misurazioni di latenza per il servizio di [Geolocalizzazione](../reference/geolocation.md) di DoubleZero.

Un geoProbe si posiziona tra i [DZD](../reference/glossary.md#dzd-doublezero-device) e i dispositivi target nella catena di misurazione a tre livelli. Riceve LocationOffset firmati dai DZD padre e misura l'[RTT](../reference/glossary.md#rtt-round-trip-time) verso i target registrati tramite [TWAMP](../reference/glossary.md#twamp-two-way-active-measurement-protocol), TWAMP firmato o ICMP echo. Ogni geoProbe è registrato onchain e collegato a uno o più DZD padre.

Per una panoramica dell'architettura di geolocalizzazione e dei flussi di misurazione, consulta la [guida utente sulla Geolocalizzazione](../reference/geolocation.md).

---

## Prerequisiti {#prerequisites}

!!! warning "Versione dell'Agente di Telemetria DZD"
    I DZD padre devono eseguire la **versione 0.17.0 o successiva dell'agente di telemetria del dispositivo** per supportare il servizio di geolocalizzazione. Le versioni precedenti non includono le estensioni per la scoperta delle sonde, il pinging TWAMP e la pubblicazione degli offset necessarie per la geolocalizzazione. Verifica le versioni degli agenti prima di distribuire una sonda — una sonda abbinata a un DZD con versione precedente non riceverà gli offset.

Prima di distribuire un geoProbe, assicurati di avere:

- **Server Linux bare metal** — Un VPS può funzionare, ma è meno ideale.
- **Prossimità di rete a un DZD** — meno di 1ms di RTT tra la sonda e il suo DZD padre. Idealmente 0,1ms o meno.
- **Capability `CAP_NET_RAW`** per il processo dell'agente (necessaria per il probing ICMP echo con socket raw)
- **Coppia di chiavi Ed25519** per l'identità di firma della sonda
- **Autorizzazione della Foundation** — la registrazione della sonda è attualmente controllata dalla foundation; coordinarsi con la [DZF](../reference/glossary.md#dzf-doublezero-foundation) prima di procedere
- **DZD padre** con agente di telemetria v0.17.0+

---

## Installazione {#installation}

Installa sia il daemon dell'agente che la CLI doublezero:

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt install doublezero-geoprobe-agent doublezero
```

| Pacchetto | Scopo |
|-----------|-------|
| `doublezero-geoprobe-agent` | Daemon dell'agente che viene eseguito sul server della sonda, eseguendo misurazioni di latenza e generando offset firmati |
| `doublezero` | Strumento CLI utilizzato per la registrazione della sonda e i comandi di gestione |

---

## Registrazione Onchain {#onchain-registration}

La registrazione della sonda richiede l'autorizzazione della foundation. Coordinarsi con la DZF prima di procedere.

### Passaggio 1: Registrare la sonda {#step-1-register-the-probe}

```bash
doublezero geolocation probe create \
  --code <probe-code> \
  --exchange <exchange-pubkey> \
  --public-ip <probe-ip> \
  --signing-pubkey <signing-key-pubkey>
```

| Parametro | Descrizione |
|-----------|-------------|
| `--code` | Identificatore univoco per la sonda (es., `ams-tn-gp1`) — massimo 32 caratteri |
| `--exchange` | Chiave pubblica dell'account Serviceability Exchange a cui questa sonda è associata |
| `--public-ip` | Indirizzo IPv4 pubblico su cui la sonda è in ascolto |
| `--signing-pubkey` | Chiave pubblica utilizzata per firmare offset e telemetria |

### Passaggio 2: Collegare i DZD padre {#step-2-link-parent-dzds}

```bash
doublezero geolocation probe add-parent \
  --probe <probe-code> \
  --device <dzd-code>
```

Ogni DZD padre deve essere un dispositivo attivato nel Serviceability Program. I DZD scoprono automaticamente le sonde figlie ogni 60 secondi — una volta collegato, il DZD avvia automaticamente le misurazioni TWAMP e la generazione degli offset.

---

## Esecuzione dell'Agente {#running-the-agent}

```bash
doublezero-geoprobe-agent \
  --env mainnet-beta \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey>
```

### Flag Obbligatori {#required-flags}

| Flag | Descrizione |
|------|-------------|
| `--keypair` | Percorso del file della coppia di chiavi Ed25519 per la firma degli offset |
| `--geoprobe-pubkey` | La chiave pubblica [onchain](../reference/glossary.md#onchain) della sonda (da `probe create`) |
| `--env` | Ambiente di rete: `testnet`, `devnet` o `mainnet-beta` (imposta l'URL RPC del ledger) |

In alternativa, utilizza `--ledger-rpc-url` al posto di `--env` per specificare un endpoint RPC Solana personalizzato.

### Flag Opzionali {#optional-flags}

| Flag | Predefinito | Descrizione |
|------|-------------|-------------|
| `--twamp-listen-port` | 8925 | Porta per le misurazioni TWAMP dai DZD padre |
| `--signed-twamp-port` | 8924 | Porta per le sonde TWAMP firmate dai target in ingresso |
| `--udp-listen-port` | 8923 | Porta per la ricezione dei datagrammi LocationOffset dai DZD |
| `--probe-interval` | 30s | Frequenza di misurazione per ogni target |
| `--max-offset-age` | 1h | Età massima di un offset DZD memorizzato nella cache prima che venga scartato |
| `--verify-interval` | 29s | Frequenza di ri-verifica delle assegnazioni dei target dal ledger |
| `--verbose` | false | Abilita il logging dettagliato |
| `--metrics-enable` | false | Abilita l'endpoint delle metriche Prometheus |
| `--metrics-addr` | — | Indirizzo per l'endpoint delle metriche Prometheus (es., `0.0.0.0:9090`) |

---

## Porte e Firewall {#ports-and-firewall}

L'agente geoprobe richiede diverse porte aperte:

| Porta | Protocollo | Direzione | Scopo |
|-------|------------|-----------|-------|
| 8923/udp | UDP | In ingresso dai DZD | Ricezione dei datagrammi LocationOffset firmati |
| 8924/udp | UDP | In ingresso dai target | Riflettore TWAMP firmato (flusso sonde in ingresso) |
| 8925/udp | UDP | In ingresso dai DZD | Misurazioni TWAMP dai DZD padre |
| ICMP | ICMP | In uscita verso i target | Richieste ICMP echo per target OutboundIcmp |

!!! note
    L'agente necessita anche di UDP in uscita verso i target per il probing TWAMP (flusso in uscita) e per la consegna dei risultati LocationOffset firmati ai target.

---

## Monitoraggio {#monitoring}

Abilita l'endpoint delle metriche Prometheus per la visibilità operativa:

```bash
doublezero-geoprobe-agent \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey> \
  --env testnet \
  --metrics-enable \
  --metrics-addr 0.0.0.0:9090
```

Metriche chiave da monitorare:

- **Disponibilità della sonda** — uptime del processo dell'agente
- **Latenza DZD-Sonda** — dovrebbe essere inferiore a 1ms; valori più alti indicano un problema di posizionamento
- **Target attivi** — numero di target che la sonda sta attualmente misurando
- **Errori di verifica della firma** — valori diversi da zero possono indicare una configurazione errata delle chiavi o pacchetti manomessi
- **Tasso di hit della cache degli offset** — un tasso basso significa che la sonda è frequentemente in attesa di offset DZD aggiornati

Consulta la [guida alle Operazioni](operations.md#monitoring) per indicazioni generali su scraping Prometheus e pattern di alerting utilizzati negli agenti DoubleZero.

---

## Comandi di Gestione delle Sonde {#probe-management-commands}

La CLI `doublezero geolocation` fornisce i seguenti sottocomandi per la gestione delle sonde:

| Sottocomando | Descrizione |
|--------------|-------------|
| `probe create` | Registra un nuovo geoProbe onchain |
| `probe get` | Ottieni i dettagli di una sonda specifica tramite codice |
| `probe list` | Elenca tutte le sonde registrate |
| `probe update` | Aggiorna la configurazione della sonda (IP, porta, chiave di firma) |
| `probe delete` | Elimina una sonda (richiede l'assenza di riferimenti a target attivi) |
| `probe add-parent` | Collega un DZD padre alla sonda |
| `probe remove-parent` | Rimuovi un DZD padre dalla sonda |

Tutti i sottocomandi accettano `--env` o `--rpc-url` per selezionare la rete. Le operazioni di scrittura (`create`, `update`, `delete`, `add-parent`, `remove-parent`) richiedono `--keypair`.

??? note "Esempio: elenco delle sonde"

    ```bash
    doublezero geolocation probe list
    ```

    Restituisce tutte le sonde registrate con i relativi codici, IP pubblici, DZD padre e stato attuale.