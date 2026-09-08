---
description: Guida passo-passo per il provisioning di un DoubleZero Device (DZD) e la registrazione delle sue interfacce e ruoli on-chain.
---

# Guida al Provisioning dei Dispositivi

Questa guida ti accompagna nel provisioning di un DoubleZero Device (DZD) dall'inizio alla fine. Ogni fase corrisponde alla [Checklist di Onboarding](contribute-overview.md#onboarding-checklist).

---

## Come si integra il tutto

Questa guida ti accompagna nella registrazione della tua infrastruttura on-chain in modo che la rete DoubleZero possa instradare il traffico attraverso di essa. Più la registrazione del tuo dispositivo è completa, più questo risulta utile per la rete. Una rappresentazione on-chain completa del tuo dispositivo consente un miglior troubleshooting, una migliore pianificazione della capacità e permette al controller di prendere decisioni informate. Nel tempo, l'obiettivo è che il controller assuma una parte sempre maggiore della responsabilità di configurazione.

### Concetti chiave

**Interfacce**

Le interfacce su un DZD si presentano in diverse forme: porte Ethernet, port channel (LAG composti da più porte Ethernet) e loopback. Ogni interfaccia che svolge un ruolo nella rete deve essere registrata on-chain con i flag appropriati affinché il protocollo sappia quale funzione svolge.

Le porte Ethernet e i port channel possono svolgere i seguenti ruoli:

| Flag | Significato |
|------|-------------|
| `--interface-dia dia` | Contrassegna l'interfaccia come uplink di accesso diretto a internet |
| `--interface-cyoa <subtype>` | Dichiara come gli utenti stabiliscono i tunnel GRE attraverso questa interfaccia (es. tramite internet pubblico, tramite un link di peering privato) |
| `--user-tunnel-endpoint true` | Questa interfaccia possiede un IP pubblico su cui gli utenti terminano i tunnel GRE |

Le interfacce utilizzate per link WAN o DZX non hanno un flag specifico: vengono registrate con la loro larghezza di banda e poi referenziate quando il link viene creato.

Le interfacce loopback svolgono diversi scopi:

| Loopback | Significato |
|----------|-------------|
| **Loopback100 / 101** | Portano IP pubblici su cui gli utenti terminano i tunnel GRE. Registrate con `--user-tunnel-endpoint true`. |
| **Loopback255** (`vpnv4`) | Registrata affinché il controller possa assegnare un IP utilizzato per il router ID BGP, il peering VPN-IPv4 (unicast), l'identità IS-IS e il segment routing |
| **Loopback256** (`ipv4`) | Registrata affinché il controller possa assegnare un IP utilizzato per il peering BGP IPv4 (multicast) e le sessioni MSDP |

**Link**

I link vengono registrati separatamente dalle interfacce, e le interfacce devono esistere on-chain prima che un link possa referenziarle. Quando crei un link WAN o DZX, specifichi un'interfaccia già registrata come endpoint fisico del link. Non tutte le interfacce sono associate a un link: le interfacce DIA, CYOA e loopback non sono collegate a un link.

| Termine | Significato |
|---------|-------------|
| **WAN Link** | Un link tra due dei tuoi DZD |
| **DZX Link** | Un link tra il tuo DZD e il DZD di un altro contributore |

### Panoramica dell'architettura

```mermaid
flowchart TB
    subgraph Onchain
        SC[DoubleZero Ledger]
    end

    subgraph Your Infrastructure
        MGMT[Management Server<br/>DoubleZero CLI]
        subgraph DZD[Your DZD]
            CYOA["DIA · CYOA interface<br/>(user-facing uplink)"]
            WAN_INTF["WAN link interface"]
            DZX_INTF["DZX link interface"]
            LO100["Loopback100/101<br/>(user tunnel endpoint)"]
        end
        DZD2[Your other DZD]
    end

    subgraph Other Contributor
        OtherDZD[Their DZD]
    end

    USERS["Users"]

    MGMT -.->|Registers devices,<br/>links, interfaces| SC
    WAN_INTF ---|WAN Link| DZD2
    DZX_INTF ---|DZX Link| OtherDZD
    USERS -.|GRE tunnel|.-> CYOA
    CYOA ---|routes to| LO100
```

---

## Fase 1: Prerequisiti

Prima di poter effettuare il provisioning di un dispositivo, è necessario predisporre l'hardware fisico e allocare alcuni indirizzi IP.

### Cosa ti serve

| Requisito | Perché è necessario |
|-----------|---------------------|
| **Hardware DZD** | Switch Arista 7280CR3A (vedi [specifiche hardware](contribute.md#hardware-requirements)) |
| **Spazio Rack** | 1U per DZD, con flusso d'aria adeguato. Vedi [Rack e Alimentazione](contribute.md#rack-power-requirements) |
| **Alimentazione** | Due linee di alimentazione indipendenti, ciascuna in grado di sostenere l'intero carico da sola. Vedi [Rack e Alimentazione](contribute.md#rack-power-requirements) |
| **Accesso di gestione** | Accesso SSH/console per configurare lo switch |
| **Connettività Internet** | Per la pubblicazione delle metriche e per ottenere la configurazione dal controller |
| **Blocco IPv4 Pubblico** | Minimo /29 per il pool di prefissi DZ (vedi sotto) |

### Installare la CLI DoubleZero

La CLI DoubleZero (`doublezero`) viene utilizzata durante tutto il provisioning per registrare dispositivi, creare link e gestire il tuo contributo. Deve essere installata su un **server di gestione o una VM** — non sullo switch DZD stesso. Lo switch esegue solo il Config Agent e il Telemetry Agent (installati nella [Fase 4](#fase-4-creazione-dei-link-e-installazione-degli-agent)).

**Ubuntu / Debian:**
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

**Rocky Linux / RHEL:**
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

Verifica che il daemon sia in esecuzione:
```bash
sudo systemctl status doublezerod
```

### Comprendere il tuo prefisso DZ

Il tuo prefisso DZ è un blocco di indirizzi IP pubblici che il protocollo DoubleZero gestisce per l'allocazione IP.

```mermaid
flowchart LR
    subgraph "Your /29 Block (8 IPs)"
        IP1["First IP<br/>Reserved for<br/>your device"]
        IP2["IP 2"]
        IP3["IP 3"]
        IP4["..."]
        IP8["IP 8"]
    end

    IP1 -->|Assigned to| LO[Loopback100<br/>on your DZD]
    IP2 -->|Allocated to| U1[User 1]
    IP3 -->|Allocated to| U2[User 2]
```

**Come vengono utilizzati i prefissi DZ:**

- **Primo IP**: Riservato per il tuo dispositivo (assegnato all'interfaccia Loopback100)
- **IP rimanenti**: Allocati a specifici tipi di utenti che si connettono al tuo DZD:
    - Utenti `IBRLWithAllocatedIP`
    - Utenti `EdgeFiltering` (caso d'uso futuro)
- **Utenti IBRL**: NON consumano da questo pool (usano il proprio IP pubblico)

!!! warning "Regole del Prefisso DZ"
    **NON puoi usare questi indirizzi per:**

    - Le tue apparecchiature di rete
    - Link punto-punto sulle interfacce DIA
    - Interfacce di gestione
    - Qualsiasi infrastruttura al di fuori del protocollo DZ

    **Requisiti:**

    - Devono essere indirizzi IPv4 **globalmente instradabili (pubblici)**
    - Gli intervalli IP privati (10.x, 172.16-31.x, 192.168.x) vengono rifiutati dallo smart contract
    - **Dimensione minima: /29** (8 indirizzi), prefissi più grandi sono preferibili (es. /28, /27)
    - L'intero blocco deve essere disponibile — non pre-allocare alcun indirizzo

    Se hai bisogno di indirizzi per le tue apparecchiature (IP delle interfacce DIA, gestione, ecc.), usa un **pool di indirizzi separato**.

---

## Fase 2: Configurazione dell'account

In questa fase, crei le chiavi crittografiche che ti identificano te e i tuoi dispositivi sulla rete, e indichi dove devono essere pagati i tuoi reward.

Da questa fase si ottengono tre chiavi: una chiave di servizio, una chiave per la pubblicazione delle metriche e una chiave per la gestione dei reward. Invia le chiavi pubbliche di tutte e tre alla DZF insieme nel [Passo 2.4](#passo-24-inviare-le-chiavi-alla-dzf). [Gestione dei Reward](contribute-rewards.md) copre in dettaglio il lato dei reward.

### Dove eseguire la CLI

!!! warning "NON installare la CLI sul tuo switch"
    La CLI DoubleZero (`doublezero`) deve essere installata su un **server di gestione o una VM**, non sul tuo switch Arista.

    ```mermaid
    flowchart LR
        subgraph "Management Server/VM"
            CLI[DoubleZero CLI]
            KEYS[Your Keypairs]
        end

        subgraph "Your DZD Switch"
            CA[Config Agent]
            TA[Telemetry Agent]
        end

        CLI -->|Creates devices, links| BC[Blockchain]
        CA -->|Pulls config| CTRL[Controller]
        TA -->|Submits metrics| BC
    ```

    | Installare sul server di gestione | Installare sullo switch |
    |----------------------------------|------------------------|
    | CLI `doublezero` | Config Agent |
    | Il tuo keypair di servizio | Telemetry Agent |
    | Il tuo keypair per la pubblicazione delle metriche | Keypair per la pubblicazione delle metriche (copia) |

### Cosa sono le chiavi?

Pensa alle chiavi come credenziali di accesso sicure:

- **Chiave di servizio**: La tua identità come contributore — usata per eseguire i comandi CLI
- **Chiave per la pubblicazione delle metriche**: L'identità del tuo dispositivo per l'invio dei dati di telemetria
- **Chiave per la gestione dei reward**: Controlla quali wallet ricevono i tuoi reward — vedi [Gestione dei Reward](contribute-rewards.md)

Tutte e tre sono coppie di chiavi crittografiche (una chiave pubblica che condividi, una chiave privata che mantieni segreta).

```mermaid
flowchart LR
    subgraph "Your Keys"
        SK[Service Key<br/>~/.config/solana/id.json]
        MK[Metrics Publisher Key<br/>~/.config/doublezero/metrics-publisher.json]
        RK[Rewards Manager Key<br/>keep offline]
    end

    SK -->|Used for| CLI[CLI Commands<br/>doublezero device create<br/>doublezero link create]
    MK -->|Used for| TEL[Telemetry Agent<br/>Submits metrics onchain]
    RK -->|Used for| REW[Rewards Portal<br/>Sets recipient wallets]
```

!!! note "Tieni la chiave per la gestione dei reward separata"
    La chiave di servizio e la chiave per la pubblicazione delle metriche risiedono sul tuo server di gestione e sullo switch. La chiave per la gestione dei reward controlla dove vanno i tuoi fondi, quindi tienila lontana da queste macchine. È necessaria solo quando cambi i tuoi wallet destinatari.

### Passo 2.1: Generare la chiave di servizio

Questa è la tua identità principale per interagire con DoubleZero.

```bash
doublezero keygen
```

Questo crea un keypair nella posizione predefinita. L'output mostra la tua **chiave pubblica** — è quella che condividerai con la DZF.

### Passo 2.2: Generare la chiave per la pubblicazione delle metriche

Questa chiave viene utilizzata dal Telemetry Agent per firmare l'invio delle metriche.

```bash
doublezero keygen -o ~/.config/doublezero/metrics-publisher.json
```

### Passo 2.3: Creare il wallet per la gestione dei reward

Questa è la terza chiave. Controlla quali wallet ricevono i tuoi reward, e non li custodisce mai direttamente.

Crea un wallet Solana che controlli e con cui puoi firmare, poi finanzialo con circa 0.01 SOL per coprire le commissioni di transazione. Un hardware wallet è una buona scelta. Non riutilizzare la tua chiave di servizio.

A questo punto hai bisogno solo del wallet. Imposterai i wallet che riceveranno effettivamente i tuoi reward nel [Passo 2.7](#passo-27-impostare-i-destinatari-dei-reward), dopo che la DZF avrà registrato questa chiave.

### Passo 2.4: Inviare le chiavi alla DZF

Contatta la DoubleZero Foundation o Malbec Labs e fornisci:

1. La tua **chiave pubblica di servizio**
2. La tua **chiave pubblica per la gestione dei reward** (dal Passo 2.3)
3. Il tuo **username GitHub** (per l'accesso al repository)

Inviale tutte e tre insieme. La DZF registra la chiave di servizio e la chiave per la gestione dei reward in transazioni onchain separate, quindi inviarle contemporaneamente risparmia un passaggio.

!!! danger "Solo chiavi pubbliche"
    Non inviare mai una chiave privata o un file keypair a nessuno, inclusa la DZF. La DZF ha bisogno solo delle tue chiavi pubbliche.

Loro faranno:

- Creare il tuo **account contributore** onchain
- Registrare la tua **chiave per la gestione dei reward** associata alla tua chiave di servizio
- Concedere l'accesso al **repository privato dei contributori**

### Passo 2.5: Verificare il tuo account

Una volta confermato, verifica che il tuo account contributore esista:

```bash
doublezero contributor list
```

Dovresti vedere il tuo codice contributore nella lista.

Verifica anche che la tua chiave per la gestione dei reward sia stata registrata:

```bash
doublezero-solana revenue-distribution fetch contributor-rewards \
    --service-key <YourServiceKeyPublicKey> -u mainnet-beta
```

La colonna `manager` dovrebbe mostrare la tua chiave pubblica per la gestione dei reward. Se è vuota, chiedi alla DZF di completare quel passaggio.

### Passo 2.6: Accedere al repository dei contributori

Il repository [malbeclabs/contributors](https://github.com/malbeclabs/contributors) contiene:

- Configurazioni base dei dispositivi
- Profili TCAM
- Configurazioni ACL
- Istruzioni di configurazione aggiuntive

Segui le istruzioni presenti per la configurazione specifica del dispositivo.

### Passo 2.7: Impostare i destinatari dei reward

Ora indica quali wallet ricevono i tuoi reward e in quali proporzioni. Fallo prima che il tuo dispositivo inizi a trasportare traffico. I reward si accumulano dal momento in cui i tuoi link sono attivi, ma il protocollo non può erogarli finché non hai nominato i wallet destinatari.

Accedi a [doublezero.xyz/rewards](https://doublezero.xyz/rewards) con il tuo wallet per la gestione dei reward, seleziona la tua chiave di servizio, poi inserisci ciascun wallet destinatario e la sua percentuale. Le percentuali devono sommare a 100.

!!! warning "Ogni destinatario necessita di un token account 2Z"
    Il protocollo invia 2Z con un semplice trasferimento di token e non crea il token account al posto tuo. Un wallet destinatario senza token account 2Z causa il fallimento del pagamento di quell'epoca.

Vedi [Gestione dei Reward](contribute-rewards.md) per la guida completa, inclusa l'alternativa tramite CLI, come verificare il token account e come verificare il risultato.

---

## Fase 3: Provisioning del dispositivo

Ora registrerai il tuo dispositivo fisico sulla blockchain e configurerai le sue interfacce.

### Comprendere i tipi di dispositivo

**Edge** — accetta solo connessioni utente

```mermaid
flowchart LR
    subgraph EDZD[Edge DZD]
        E_CYOA["DIA · CYOA interface"]
        E_TUN["Loopback100/101
        (user tunnel endpoint)"]
        E_DZX["DZX link interface"]
        E_CYOA --- E_TUN
    end
    EU["Users"] -.|GRE tunnel|.-> E_CYOA
    E_DZX <-->|DZX Link| ED["DZD (different contributor)"]
```

**Transit** — muove il traffico tra dispositivi, nessuna connessione utente

```mermaid
flowchart LR
    subgraph TDZD[Transit DZD]
        T_WAN["WAN link interface"]
        T_DZX["DZX link interface"]
    end
    T_WAN <-->|WAN Link| T2["DZD (same contributor)"]
    T_DZX <-->|DZX Link| TD["DZD (different contributor)"]
```

**Hybrid** — connessioni utente e backbone, il più comune

```mermaid
flowchart LR
    subgraph HDZD[Hybrid DZD]
        H_CYOA["DIA · CYOA interface"]
        H_TUN["Loopback100/101
        (user tunnel endpoint)"]
        H_WAN["WAN link interface"]
        H_DZX["DZX link interface"]
        H_CYOA --- H_TUN
    end
    HU["Users"] -.|GRE tunnel|.-> H_CYOA
    H_WAN <-->|WAN Link| H2["DZD (same contributor)"]
    H_DZX <-->|DZX Link| HD["DZD (different contributor)"]
```

| Tipo | Cosa fa | Quando usarlo |
|------|---------|---------------|
| **Edge** | Accetta solo connessioni utente | Singola posizione, solo rivolto agli utenti |
| **Transit** | Muove il traffico tra dispositivi | Connettività backbone, nessun utente |
| **Hybrid** | Sia connessioni utente CHE backbone | Il più comune — fa tutto |

### Passo 3.1: Trovare la tua posizione e exchange

Prima di creare il tuo dispositivo, cerca i codici per la posizione del tuo data center e l'exchange più vicino:

```bash
# Elencare le posizioni disponibili (data center)
doublezero location list

# Elencare gli exchange disponibili (punti di interconnessione)
doublezero exchange list
```

### Passo 3.2: Creare il tuo dispositivo onchain

Registra il tuo dispositivo sulla blockchain:

```bash
doublezero device create \
  --code <YOUR_DEVICE_CODE> \
  --contributor <YOUR_CONTRIBUTOR_CODE> \
  --device-type hybrid \
  --location <LOCATION_CODE> \
  --exchange <EXCHANGE_CODE> \
  --public-ip <DEVICE_PUBLIC_IP> \
  --dz-prefixes <YOUR_DZ_PREFIX>
```

**Esempio:**

```bash
doublezero device create \
  --code nyc-dz001 \
  --contributor acme \
  --device-type hybrid \
  --location EQX-NY5 \
  --exchange nyc \
  --public-ip "203.0.113.10" \
  --dz-prefixes "198.51.100.0/28"
```

**Output atteso:**

```
Signature: 4vKz8H...truncated...7xPq2
```

Verifica che il tuo dispositivo sia stato creato:

```bash
doublezero device list | grep nyc-dz001
```

**Spiegazione dei parametri:**

| Parametro | Significato |
|-----------|-------------|
| `--code` | Un nome univoco per il tuo dispositivo (es. `nyc-dz001`) |
| `--contributor` | Il tuo codice contributore (fornito dalla DZF) |
| `--device-type` | `hybrid`, `transit` o `edge` |
| `--location` | Codice del data center da `location list` |
| `--exchange` | Codice dell'exchange più vicino da `exchange list` |
| `--public-ip` | L'IP pubblico tramite cui gli utenti si connettono al tuo dispositivo via internet |
| `--dz-prefixes` | Il tuo blocco IP allocato per gli utenti |

### Passo 3.3: Creare le interfacce loopback richieste

Ogni dispositivo necessita di due interfacce loopback per il routing interno:

```bash
# Loopback VPNv4
doublezero device interface create <DEVICE_CODE> Loopback255 --loopback-type vpnv4

# Loopback IPv4
doublezero device interface create <DEVICE_CODE> Loopback256 --loopback-type ipv4
```

**Output atteso (per ciascun comando):**

```
Signature: 3mNx9K...truncated...8wRt5
```

### Passo 3.4: Creare le interfacce fisiche

Registra le interfacce fisiche che verranno utilizzate per i link WAN o DZX. Queste interfacce devono esistere on-chain prima che tu possa creare un link che le referenzia. In questo passo registri solo l'interfaccia e la sua larghezza di banda; il link viene creato in un passo successivo.

```bash
doublezero device interface create <DEVICE_CODE> <INTERFACE_NAME> \
  --bandwidth <PORT_SPEED>
```

**Esempio:**

```bash
doublezero device interface create nyc-dz001 Ethernet1/1 \
  --bandwidth 10Gbps
```

**Output atteso:**

```
Signature: 7pQw2R...truncated...4xKm9
```

Ripeti per ogni interfaccia che verrà utilizzata come endpoint di un link WAN o DZX. Le interfacce CYOA e DIA vengono registrate separatamente nel passo successivo.

### Passo 3.5: Creare l'interfaccia CYOA (per dispositivi Edge/Hybrid)

I DZD hybrid e edge necessitano di **due indirizzi IP pubblici** su cui gli utenti terminano i loro tunnel GRE. Gli utenti possono connettersi tramite unicast, multicast o entrambi, e quale IP serve quale scopo ruota per ogni utente.

Entrambi gli IP devono essere registrati con `--user-tunnel-endpoint true`, su un'interfaccia fisica o un loopback. Questo include l'IP che hai fornito al momento della creazione del dispositivo: quell'IP deve comunque essere registrato esplicitamente qui.

Se hai vincoli di IP, puoi utilizzare il primo `/32` del tuo prefisso DZ come uno dei due IP.

#### CYOA e DIA

| Tipo | Flag | Scopo |
|------|------|-------|
| DIA | `--interface-dia dia` | Contrassegna la porta come accesso diretto a internet |
| CYOA | `--interface-cyoa <subtype>` | Dichiara come gli utenti connettono i tunnel GRE al tuo dispositivo |

Il flag CYOA viene sempre impostato su un'**interfaccia fisica** (porta Ethernet o port channel). Mai su un loopback.

| Sottotipo CYOA | Quando usarlo |
|----------------|---------------|
| `gre-over-dia` | Gli utenti si connettono tramite internet pubblico. Il più comune. |
| `gre-over-private-peering` | Gli utenti si connettono tramite una cross-connect diretta o un circuito privato |
| `gre-over-public-peering` | Gli utenti fanno peering con te presso un Internet Exchange (IX) |
| `gre-over-fabric` | Gli utenti sono co-locati e si connettono tramite un fabric locale |
| `gre-over-cable` | Connessione diretta via cavo a un singolo utente dedicato |

#### Scenario A: Singola interfaccia fisica

Un singolo uplink fisico verso l'ISP. Ethernet1/1 è l'interfaccia CYOA e DIA e porta uno dei due IP pubblici. Loopback100 porta il secondo IP pubblico.

```mermaid
flowchart LR
    USERS(["End Users"])

    subgraph DZD["DZD"]
        E1["Eth1/1
        203.0.113.1/30
        CYOA · DIA · user tunnel endpoint"]
        LO["Loopback100
        198.51.100.1/32\n        user tunnel endpoint"]
        E1 --- LO
    end

    ISP["ISP Router
    203.0.113.2/30"]

    ISP -- "10GbE" --- E1
    USERS -. "GRE tunnels" .-> E1
    USERS -. "GRE tunnels" .-> LO
```

| Interfaccia | `--interface-cyoa` | `--interface-dia` | `--ip-net` | `--bandwidth` | `--cir` | `--routing-mode` | `--user-tunnel-endpoint` |
|-------------|-------------------|------------------|------------|---------------|---------|-----------------|--------------------------|
| Ethernet1/1 | `gre-over-dia` | `dia` | IP/subnet assegnato dal contributore | velocità della porta | tasso garantito | `bgp` o `static` | `true` |
| Loopback100 | — | — | il tuo /32 pubblico | `0bps` | — | — | `true` |

Esempio di comandi da eseguire per lo Scenario A:
```bash
doublezero device interface create mydzd-nyc01 Ethernet1/1 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --ip-net 203.0.113.1/30 \
  --bandwidth 10Gbps \
  --cir 1Gbps \
  --routing-mode bgp \
  --user-tunnel-endpoint true

doublezero device interface create mydzd-nyc01 Loopback100 \
  --ip-net 198.51.100.1/32 \
  --bandwidth 0bps \
  --user-tunnel-endpoint true
```

#### Scenario B: Port channel (LAG)

Il DZD si connette al dispositivo upstream tramite un port channel con un IP. Il port channel porta un IP pubblico ed è l'endpoint CYOA. Loopback100 porta il secondo IP pubblico.

```mermaid
flowchart LR
    USERS(["End Users"])

    subgraph SW["Upstream Router / Switch"]
        SWPC(["bond0
        203.0.113.2/30"])
    end

    subgraph DZD["DZD"]
        subgraph PC["Port-Channel1 · 203.0.113.1/30 · CYOA · DIA · user tunnel endpoint"]
            E1["Eth1/1"]
            E2["Eth2/1"]
        end
        LO["Loopback100
        198.51.100.1/32\n        user tunnel endpoint"]
        PC --- LO
    end

    SWPC -- "2x 10GbE" --- PC
    USERS -. "GRE tunnels" .-> PC
    USERS -. "GRE tunnels" .-> LO
```

| Interfaccia | `--interface-cyoa` | `--interface-dia` | `--ip-net` | `--bandwidth` | `--cir` | `--routing-mode` | `--user-tunnel-endpoint` |
|-------------|-------------------|------------------|------------|---------------|---------|-----------------|--------------------------|
| Port-Channel1 | `gre-over-dia` | `dia` | IP/subnet assegnato dal contributore | velocità LAG combinata | tasso garantito | `bgp` o `static` | `true` |
| Loopback100 | — | — | il tuo /32 pubblico | `0bps` | — | — | `true` |

Esempio di comandi da eseguire per lo Scenario B:
```bash
doublezero device interface create mydzd-fra01 Port-Channel1 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --ip-net 203.0.113.1/30 \
  --bandwidth 20Gbps \
  --cir 2Gbps \
  --routing-mode bgp \
  --user-tunnel-endpoint true

doublezero device interface create mydzd-fra01 Loopback100 \
  --ip-net 198.51.100.1/32 \
  --bandwidth 0bps \
  --user-tunnel-endpoint true
```


#### Scenario C: Doppio uplink fisico verso router separati

Ogni interfaccia fisica si connette a un router upstream diverso. I due IP pubblici risiedono su Loopback100 e Loopback101, entrambi registrati come endpoint per i tunnel utente.

```mermaid
flowchart LR
    USERS(["End Users"])

    RA["Router A
    203.0.113.2/30"]
    RB["Router B
    203.0.113.6/30"]

    subgraph DZD["DZD"]
        E1["Eth1/1
        203.0.113.1/30
        CYOA · DIA"]
        E2["Eth2/1
        203.0.113.5/30
        CYOA · DIA"]
        LO0["Loopback100
        198.51.100.1/32\n        user tunnel endpoint"]
        L