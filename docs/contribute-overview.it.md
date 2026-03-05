# Documentazione Contributori

!!! info "Terminologia"
    Nuovo a DoubleZero? Consulta il [Glossario](glossary.md) per le definizioni dei termini chiave come [DZD](glossary.md#dzd-doublezero-device), [DZX](glossary.md#dzx-doublezero-exchange) e [CYOA](glossary.md#cyoa-choose-your-own-adventure).

Benvenuto alla documentazione per i contributori DoubleZero. Questa sezione copre tutto ciò di cui hai bisogno per diventare un contributore di rete.

!!! tip "Interessato a diventare un contributore di rete?"
    Consulta la pagina [Requisiti e Architettura](contribute.md) per comprendere l'hardware, la larghezza di banda e la connettività necessaria per contribuire alla rete DoubleZero.

---

## Lista di Controllo per l'Onboarding

Usa questa lista di controllo per monitorare i tuoi progressi. **Tutti gli elementi devono essere completati prima che il tuo contributo sia tecnicamente operativo.**

### Fase 1: Prerequisiti
- [ ] CLI DoubleZero installata su un server di gestione
- [ ] Hardware acquistato e conforme ai [requisiti](contribute.md#hardware-requirements)
- [ ] Spazio rack e alimentazione disponibili nel data center (4U, 4KW raccomandati)
- [ ] DZD installato fisicamente con connettività di gestione
- [ ] Blocco IPv4 pubblico allocato per il protocollo DZ (**vedi [Regole DZ Prefix](#dz-prefix-rules)**)

### Fase 2: Configurazione Account
- [ ] Keypair del servizio generato (`doublezero keygen`)
- [ ] Keypair del metrics publisher generato
- [ ] Service key inviata a DZF per l'autorizzazione
- [ ] Account contributore creato onchain (verifica con `doublezero contributor list`)
- [ ] Accesso concesso al repository [malbeclabs/contributors](https://github.com/malbeclabs/contributors)

### Fase 3: Provisioning del Dispositivo
- [ ] Configurazione base del dispositivo applicata (dal repository dei contributori)
- [ ] Dispositivo creato onchain (`doublezero device create`)
- [ ] Interfacce del dispositivo registrate
- [ ] Interfacce loopback create (Loopback255 vpnv4, Loopback256 ipv4)
- [ ] Interfacce CYOA/DIA configurate (se dispositivo edge/hybrid)

### Fase 4: Creazione Link e Installazione Agent
- [ ] WAN link creati (se applicabile)
- [ ] DZX link creato (stato: `requested`)
- [ ] DZX link accettato dal contributore peer
- [ ] Config Agent installato e in esecuzione
- [ ] Config Agent che riceve la configurazione dal controller
- [ ] Telemetry Agent installato e in esecuzione
- [ ] Metrics publisher registrato onchain
- [ ] Invii di telemetria visibili sul registro

### Fase 5: Burn-in del Link
- [ ] Tutti i link drenati per il periodo di burn-in di 24 ore
- [ ] [metrics.doublezero.xyz](https://metrics.doublezero.xyz) mostra zero perdite e zero errori per 24 ore
- [ ] Link ri-attivati dopo il burn-in pulito

### Fase 6: Verifica e Attivazione
- [ ] `doublezero device list` mostra il tuo dispositivo (con `max_users = 0`)
- [ ] `doublezero link list` mostra i tuoi link
- [ ] I log del Config Agent mostrano pull di configurazione riusciti
- [ ] I log del Telemetry Agent mostrano invii di metriche riusciti
- [ ] **Coordina con DZ/Malbec Labs** per eseguire un test di connettività (connetti, ricevi route, instrada su DZ)
- [ ] Dopo che il test è superato, imposta `max_users` a 96 tramite `doublezero device update`

---

## Ottenere Aiuto

Come parte dell'onboarding, DZF ti aggiungerà ai canali Slack per i contributori:

| Canale | Scopo |
|--------|-------|
| **#dz-contributor-announcements** | Comunicazioni ufficiali da DZF e Malbec Labs — aggiornamenti CLI/agent, modifiche importanti, annunci di sicurezza. Monitora per aggiornamenti critici; fai domande nei thread. |
| **#dz-contributor-incidents** | Eventi non pianificati che impattano il servizio. Gli incidenti vengono pubblicati automaticamente tramite API/web form con gravità e dispositivi/link interessati. La discussione e la risoluzione dei problemi avvengono nei thread. |
| **#dz-contributor-maintenance** | Attività di manutenzione pianificate (aggiornamenti, riparazioni). Pianificate tramite API/web form con orari di inizio/fine previsti. Discussione nei thread. |
| **#dz-contributor-ops** | Discussione aperta per tutti i contributori — domande operative, aiuto CLI, condivisione di runbook e playbook. |

Riceverai anche un **canale privato DZ/Malbec Labs** per supporto diretto alla tua organizzazione.

---

## Regole DZ Prefix

!!! warning "Critico: Utilizzo del Pool DZ Prefix"
    Il pool di DZ prefix che fornisci è **gestito dal protocollo DoubleZero per l'allocazione IP**.

    **Come vengono utilizzati i DZ prefix:**

    - **Primo IP**: Riservato al tuo dispositivo (assegnato all'interfaccia Loopback100)
    - **IP rimanenti**: Allocati a tipi specifici di utenti che si connettono al tuo DZD:
        - Utenti `IBRLWithAllocatedIP`
        - Utenti `EdgeFiltering`
        - Publisher multicast
    - **Utenti IBRL**: NON consumano da questo pool (usano il proprio IP pubblico)

    **NON puoi usare questi indirizzi per:**

    - Le tue apparecchiature di rete
    - Link punto-a-punto su interfacce DIA
    - Interfacce di gestione
    - Qualsiasi infrastruttura al di fuori del protocollo DZ

    **Requisiti:**

    - Devono essere indirizzi IPv4 **globalmente instradabili (pubblici)**
    - Gli intervalli IP privati (10.x, 172.16-31.x, 192.168.x) vengono rifiutati dallo smart contract
    - **Dimensione minima: /29** (8 indirizzi), preferibili prefissi più grandi (es. /28, /27)
    - L'intero blocco deve essere disponibile - non pre-allocare alcun indirizzo

    Se hai bisogno di indirizzi per le tue apparecchiature (IP interfacce DIA, gestione, ecc.), usa un **pool di indirizzi separato**.

---

## Riferimento Rapido: Termini Chiave

Nuovo a DoubleZero? Ecco i termini essenziali (vedi il [Glossario completo](glossary.md)):

| Termine | Definizione |
|---------|-------------|
| **DZD** | DoubleZero Device - il tuo switch fisico Arista che esegue gli agenti DZ |
| **DZX** | DoubleZero Exchange - punto di interconnessione metro dove i contributori si collegano |
| **CYOA** | Choose Your Own Adventure - metodo di connettività utente (GREOverDIA, GREOverFabric, ecc.) |
| **DIA** | Direct Internet Access - connettività internet richiesta da tutti i DZD per controller e telemetria, comunemente usata come tipo CYOA per la connettività utente su dispositivi edge/hybrid |
| **WAN Link** | Link tra i tuoi DZD (stesso contributore) |
| **DZX Link** | Link verso il DZD di un altro contributore (richiede accettazione reciproca) |
| **Config Agent** | Interroga il controller, applica la configurazione al tuo DZD |
| **Telemetry Agent** | Raccoglie metriche di latenza/perdita TWAMP, le invia al registro onchain |
| **Service Key** | La tua chiave di identità contributore per le operazioni CLI |
| **Metrics Publisher Key** | Chiave per firmare gli invii di telemetria onchain |

---

---

## Struttura della Documentazione

| Guida | Descrizione |
|-------|-------------|
| [Requisiti e Architettura](contribute.md) | Specifiche hardware, architettura di rete, opzioni di larghezza di banda |
| [Provisioning Dispositivo](contribute-provisioning.md) | Passo per passo: chiavi → accesso repo → dispositivo → link → agenti |
| [Operazioni](contribute-operations.md) | Aggiornamenti agent, gestione link, monitoraggio |
| [Glossario](glossary.md) | Tutta la terminologia DoubleZero definita |

---

## Nozioni di Base di Rete per Non-Ingegneri di Rete

Se non hai un background ingegneristico di rete, ecco un primer sui concetti utilizzati in questa documentazione:

### Indirizzamento IP

- **Indirizzo IPv4**: Un identificatore univoco per un dispositivo su una rete (es. `192.168.1.1`)
- **Notazione CIDR** (`/29`, `/24`): Indica la dimensione della subnet. `/29` = 8 indirizzi, `/24` = 256 indirizzi
- **IP Pubblico**: Instradabile su internet; **IP Privato**: Solo reti interne (10.x, 172.16-31.x, 192.168.x)

### Livelli di Rete

- **Livello 1 (Fisico)**: Cavi, ottiche, lunghezze d'onda
- **Livello 2 (Data Link)**: Switch, VLAN, indirizzi MAC
- **Livello 3 (Rete)**: Router, indirizzi IP, protocolli di routing

### Termini Comuni

- **MTU**: Maximum Transmission Unit - dimensione massima del pacchetto (tipicamente 9000 byte per link WAN)
- **VLAN**: Virtual LAN - separa logicamente il traffico su infrastruttura condivisa
- **VRF**: Virtual Routing and Forwarding - isola le tabelle di routing sullo stesso dispositivo
- **BGP**: Border Gateway Protocol - scambio di route tra reti
- **GRE**: Generic Routing Encapsulation - protocollo di tunneling per reti overlay
- **TWAMP**: Two-Way Active Measurement Protocol - misura latenza/perdita tra dispositivi

### Specifico di DoubleZero

- **Onchain**: In DoubleZero, le registrazioni dei dispositivi, le configurazioni dei link e la telemetria vengono registrate nel registro DoubleZero — rendendo lo stato della rete trasparente e verificabile da tutti i partecipanti
- **Controller**: Servizio che deriva la configurazione DZD dallo stato onchain nel registro DoubleZero

---

Pronto per iniziare? Inizia con [Requisiti e Architettura](contribute.md).
