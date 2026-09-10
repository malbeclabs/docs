---
description: Panoramica e checklist di onboarding per diventare un contributore della rete DoubleZero.
---

# Documentazione per i Contributori

!!! info "Terminologia"
    Nuovo su DoubleZero? Consulta il [Glossario](glossary.md) per le definizioni dei termini chiave come [DZD](glossary.md#dzd-doublezero-device), [DZX](glossary.md#dzx-doublezero-exchange) e [CYOA](glossary.md#cyoa-choose-your-own-adventure).

Benvenuto nella documentazione per i contributori di DoubleZero. Questa sezione copre tutto ciò che serve per diventare un contributore della rete.

!!! tip "Interessato a diventare un contributore della rete?"
    Consulta la pagina [Requisiti e Architettura](contribute.md) per comprendere l'hardware, la larghezza di banda e la connettività necessari per contribuire alla rete DoubleZero.

---

## Checklist di Onboarding

Usa questa checklist per monitorare i tuoi progressi. **Tutti i punti devono essere completati prima che il tuo contributo sia tecnicamente operativo.**

### Fase 1: Prerequisiti
- [ ] DoubleZero CLI installata su un server di gestione
- [ ] Hardware acquistato e conforme ai [requisiti](contribute.md#hardware-requirements)
- [ ] Spazio rack e alimentazione disponibili nel data center (vedi [Rack e Alimentazione](contribute.md#rack-power-requirements))
- [ ] DZD fisicamente installato con connettività di gestione
- [ ] Blocco IPv4 pubblico allocato per il protocollo DZ (**vedi [Regole sui Prefissi DZ](#regole-sui-prefissi-dz)**)

### Fase 2: Configurazione Account

Questa fase alterna tra il contributore e DZF. Ogni elemento **DZF** deve essere confermato prima che il gruppo successivo possa iniziare.

**Contributore**

- [ ] Nome utente GitHub inviato a DZF

**DZF**

- [ ] Accesso concesso al repository [malbeclabs/contributors](https://github.com/malbeclabs/contributors)

**Contributore**

- [ ] Coppia di chiavi di servizio generata (`doublezero keygen`)
- [ ] Coppia di chiavi del publisher delle metriche generata
- [ ] **Chiave pubblica** della chiave di servizio inviata a DZF

**DZF**

- [ ] Account contributore creato onchain

**Contributore**

- [ ] Account contributore verificato (`doublezero contributor list`)
- [ ] Gestione delle ricompense configurata (non blocca l'attivazione, **vedi [Rewards Management](https://github.com/malbeclabs/contributors#rewards-management) nel repository dei contributori**)

### Fase 3: Provisioning del Dispositivo
- [ ] Configurazione base del dispositivo applicata (dal repo dei contributori)
- [ ] Dispositivo creato onchain (`doublezero device create`)
- [ ] Interfacce del dispositivo registrate
- [ ] Interfacce loopback create (Loopback255 vpnv4, Loopback256 ipv4)
- [ ] Interfacce CYOA/DIA configurate (se dispositivo edge/ibrido)

### Fase 4: Attivazione dei Link e Installazione degli Agent
- [ ] Link WAN creati (se applicabile)
- [ ] Link DZX creato (stato: `requested`)
- [ ] Link DZX accettato dal contributore peer
- [ ] Config Agent installato e in esecuzione
- [ ] Config Agent che riceve la configurazione dal controller
- [ ] Telemetry Agent installato e in esecuzione
- [ ] Publisher delle metriche registrato onchain
- [ ] Invii di telemetria visibili sul ledger

### Fase 5: Burn-in dei Link
- [ ] Tutti i link in drain per un periodo di burn-in di 24 ore
- [ ] La [dashboard dello stato dei link](https://data.doublezero.xyz/status/links) mostra zero perdite e zero errori per 24h
- [ ] Link riattivati dopo un burn-in pulito

### Fase 6: Verifica e Attivazione
- [ ] `doublezero device list` mostra il tuo dispositivo (con `max_users = 0`)
- [ ] `doublezero link list` mostra i tuoi link
- [ ] I log del Config Agent mostrano pull di configurazione riusciti
- [ ] I log del Telemetry Agent mostrano invii di metriche riusciti
- [ ] **Coordinamento con DZ/Malbec Labs** per eseguire il test di connettività (connessione, ricezione rotte, instradamento su DZ)
- [ ] Dopo il superamento del test, impostare `max_users` a 96 tramite `doublezero device update`

---

## Ottenere Supporto

Come parte dell'onboarding, DZF ti aggiungerà ai canali Slack per i contributori:

| Canale | Scopo |
|--------|-------|
| **#dz-contributor-announcements** | Comunicazioni ufficiali da DZF e Malbec Labs — aggiornamenti CLI/agent, breaking change, annunci di sicurezza. Monitora per aggiornamenti critici; fai domande nei thread. |
| **#dz-contributor-incidents** | Eventi non pianificati con impatto sul servizio. Gli incidenti vengono pubblicati automaticamente tramite API/modulo web con severità e dispositivi/link interessati. Discussione e risoluzione nei thread. |
| **#dz-contributor-maintenance** | Attività di manutenzione pianificata (aggiornamenti, riparazioni). Programmate tramite API/modulo web con orari di inizio/fine pianificati. Discussione nei thread. |
| **#dz-contributor-ops** | Discussione aperta per tutti i contributori — domande operative, aiuto con la CLI, condivisione di runbook e playbook. |

Riceverai anche un **canale privato DZ/Malbec Labs** per il supporto diretto alla tua organizzazione.

---

## Regole sui Prefissi DZ

!!! warning "Critico: Utilizzo del Pool di Prefissi DZ"
    Il pool di prefissi DZ che fornisci è **gestito dal protocollo DoubleZero per l'allocazione degli IP**.

    **Come vengono utilizzati i prefissi DZ:**

    - **Primo IP**: Riservato al tuo dispositivo (assegnato all'interfaccia Loopback100)
    - **IP rimanenti**: Allocati a tipi specifici di utenti che si connettono al tuo DZD:
        - Utenti `IBRLWithAllocatedIP`
        - Utenti `EdgeFiltering`
        - Publisher multicast
    - **Utenti IBRL**: NON consumano da questo pool (utilizzano il proprio IP pubblico)

    **NON puoi utilizzare questi indirizzi per:**

    - Le tue apparecchiature di rete
    - Link punto-punto sulle interfacce DIA
    - Interfacce di gestione
    - Qualsiasi infrastruttura al di fuori del protocollo DZ

    **Requisiti:**

    - Devono essere indirizzi IPv4 **globalmente instradabili (pubblici)**
    - Gli intervalli IP privati (10.x, 172.16-31.x, 192.168.x) vengono rifiutati dallo smart contract
    - **Dimensione minima: /29** (8 indirizzi), prefissi più grandi preferibili (es. /28, /27)
    - L'intero blocco deve essere disponibile - non pre-allocare alcun indirizzo

    Se hai bisogno di indirizzi per le tue apparecchiature (IP interfaccia DIA, gestione, ecc.), utilizza un **pool di indirizzi separato**.

---

## Riferimento Rapido: Termini Chiave

Nuovo su DoubleZero? Ecco i termini essenziali (vedi il [Glossario completo](glossary.md)):

| Termine | Definizione |
|---------|-------------|
| **DZD** | DoubleZero Device - il tuo switch fisico Arista che esegue gli agent DZ |
| **DZX** | DoubleZero Exchange - punto di interconnessione metropolitano dove i contributori si interconnettono |
| **CYOA** | Choose Your Own Adventure - metodo di connettività utente (GREOverDIA, GREOverFabric, ecc.) |
| **DIA** | Direct Internet Access - connettività internet richiesta da tutti i DZD per controller e telemetria, comunemente usata come tipo CYOA per la connettività utente su dispositivi edge/ibridi |
| **WAN Link** | Link tra i tuoi DZD (stesso contributore) |
| **DZX Link** | Link verso il DZD di un altro contributore (richiede accettazione reciproca) |
| **Config Agent** | Interroga il controller, applica la configurazione al tuo DZD |
| **Telemetry Agent** | Raccoglie metriche di latenza/perdita TWAMP, le invia al ledger onchain |
| **Service Key** | La tua chiave di identità contributore per le operazioni CLI |
| **Metrics Publisher Key** | Chiave per la firma degli invii di telemetria onchain |
| **Rewards Manager Key** | Chiave che controlla quali wallet ricevono le tue ricompense (vedi il repository dei contributori) |

---

---

## Struttura della Documentazione

| Guida | Descrizione |
|-------|-------------|
| [Requisiti e Architettura](contribute.md) | Specifiche hardware, architettura di rete, opzioni di larghezza di banda |
| [Provisioning del Dispositivo](contribute-provisioning.md) | Passo dopo passo: accesso al repo → chiavi → dispositivo → link → agent |
| [Operazioni](contribute-operations.md) | Aggiornamenti agent, gestione link, monitoraggio |
| [Deployment di Geoprobe](contribute-geolocation.md) | Deployment e configurazione degli agent geoProbe per la geolocalizzazione |
| [Glossario](glossary.md) | Tutta la terminologia DoubleZero definita |

---

## Nozioni di Rete per Non Ingegneri di Rete

Se non hai un background di ingegneria di rete, ecco un'introduzione ai concetti utilizzati in questa documentazione:

### Indirizzamento IP

- **Indirizzo IPv4**: Un identificatore univoco per un dispositivo su una rete (es. `192.168.1.1`)
- **Notazione CIDR** (`/29`, `/24`): Indica la dimensione della sottorete. `/29` = 8 indirizzi, `/24` = 256 indirizzi
- **IP pubblico**: Instradabile su internet; **IP privato**: Solo reti interne (10.x, 172.16-31.x, 192.168.x)

### Livelli di Rete

- **Livello 1 (Fisico)**: Cavi, ottiche, lunghezze d'onda
- **Livello 2 (Data Link)**: Switch, VLAN, indirizzi MAC
- **Livello 3 (Rete)**: Router, indirizzi IP, protocolli di routing

### Termini Comuni

- **MTU**: Maximum Transmission Unit - dimensione massima del pacchetto (tipicamente 9000 byte per i link WAN)
- **VLAN**: Virtual LAN - separa logicamente il traffico su infrastruttura condivisa
- **VRF**: Virtual Routing and Forwarding - isola le tabelle di routing sullo stesso dispositivo
- **BGP**: Border Gateway Protocol - scambio di rotte tra reti
- **GRE**: Generic Routing Encapsulation - protocollo di tunneling per reti overlay
- **TWAMP**: Two-Way Active Measurement Protocol - misura latenza/perdita tra dispositivi

### Specifici di DoubleZero

- **Onchain**: In DoubleZero, le registrazioni dei dispositivi, le configurazioni dei link e la telemetria vengono registrate sul ledger DoubleZero — rendendo lo stato della rete trasparente e verificabile da tutti i partecipanti
- **Controller**: Servizio che deriva la configurazione del DZD dallo stato onchain sul ledger DoubleZero

---

Pronto per iniziare? Parti da [Requisiti e Architettura](contribute.md).