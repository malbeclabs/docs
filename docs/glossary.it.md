---
description: Definizioni della terminologia specifica di DoubleZero utilizzata in tutta la documentazione.
---

# Glossario

Questa pagina definisce la terminologia specifica di DoubleZero utilizzata in tutta la documentazione.

---

## Infrastruttura di Rete

### DZD (DoubleZero Device)
L'hardware di commutazione di rete fisico che termina i link DoubleZero e esegue il software DoubleZero Agent. I DZD sono distribuiti nei data center e forniscono servizi di routing, elaborazione dei pacchetti e connettività utente. Ogni DZD richiede [specifiche hardware](contribute.md#dzd-network-hardware) specifiche e esegue sia il [Config Agent](#config-agent) che il [Telemetry Agent](#telemetry-agent).

### DZX (DoubleZero Exchange)
Punti di interconnessione nella rete mesh in cui i link di diversi [contributori](#contributor) vengono collegati insieme. I DZX si trovano nelle principali aree metropolitane (ad es., NYC, LON, TYO) dove si verificano intersezioni di rete. I contributori della rete devono effettuare il cross-connect dei propri link nella mesh DoubleZero più ampia presso il DZX più vicino. Concetto simile a un Internet Exchange (IX).

### WAN Link
Un link di Wide Area Network tra due [DZD](#dzd-doublezero-device) gestiti dallo **stesso** contributore. I link WAN forniscono connettività backbone all'interno dell'infrastruttura di un singolo contributore.

### DZX Link
Un link tra [DZD](#dzd-doublezero-device) gestiti da contributori **diversi**, stabilito presso un [DZX](#dzx-doublezero-exchange). I link DZX richiedono l'accettazione esplicita da entrambe le parti.

### DZ Prefix
Allocazioni di indirizzi IP in formato CIDR assegnate a un [DZD](#dzd-doublezero-device) per l'indirizzamento della rete overlay. Specificati durante la [creazione del dispositivo](contribute-provisioning.md#step-32-create-your-device-onchain) utilizzando il parametro `--dz-prefixes`.

---

## Tipi di Dispositivo

### Edge Device
Un [DZD](#dzd-doublezero-device) che fornisce connettività utente alla rete DoubleZero. I dispositivi edge sfruttano le interfacce [CYOA](#cyoa-choose-your-own-adventure) per terminare gli utenti (validatori, operatori RPC) e collegarli alla rete.

### Transit Device
Un [DZD](#dzd-doublezero-device) che fornisce connettività backbone all'interno della rete DoubleZero. I dispositivi transit spostano il traffico tra i DZD ma non terminano direttamente le connessioni utente.

### Hybrid Device
Un [DZD](#dzd-doublezero-device) che combina le funzionalità sia [edge](#edge-device) che [transit](#transit-device), fornendo sia connettività utente che routing backbone.

---

## Connettività

### CYOA (Choose Your Own Adventure)
Tipi di interfaccia che consentono ai [contributori](#contributor) di registrare opzioni di connettività per gli utenti che si collegano alla rete DoubleZero. Le interfacce CYOA includono vari metodi come [DIA](#dia-direct-internet-access), tunnel GRE e peering privato. Vedere [Creazione delle Interfacce CYOA](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices) per i dettagli di configurazione.

### DIA (Direct Internet Access)
Un termine di rete standard per la connettività fornita tramite internet pubblico. In DoubleZero, DIA è un tipo di interfaccia [CYOA](#cyoa-choose-your-own-adventure) in cui gli utenti (validatori, operatori RPC) si collegano a un [DZD](#dzd-doublezero-device) tramite la loro connessione internet esistente.

### IBRL (Increase Bandwidth Reduce Latency)
Una modalità di connessione che consente a validatori e nodi RPC di collegarsi a DoubleZero senza riavviare i propri client blockchain. IBRL utilizza l'indirizzo IP pubblico esistente e stabilisce un tunnel overlay verso il [DZD](#dzd-doublezero-device) più vicino. Vedere [Connessione Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) per le istruzioni di configurazione.

### Multicast
Un metodo di consegna dei pacchetti uno-a-molti supportato da DoubleZero. La modalità multicast ha due ruoli: **publisher** (invia pacchetti attraverso la rete) e **subscriber** (riceve pacchetti dal publisher). Utilizzato dai team di sviluppo per una distribuzione efficiente dei dati. Vedere [Altra Connessione Multicast](Other%20Multicast%20Connection.md) per i dettagli di connessione.

---

## Componenti Software

### doublezerod
Il servizio daemon DoubleZero che viene eseguito sui server degli utenti (validatori, nodi RPC). Gestisce la connessione alla rete DoubleZero, gestisce la creazione dei tunnel e mantiene la connettività verso i [DZD](#dzd-doublezero-device). Configurato tramite systemd e controllato attraverso la CLI [`doublezero`](#doublezero-cli).

### doublezero (CLI)
L'interfaccia a riga di comando per interagire con la rete DoubleZero. Utilizzata per connettersi, gestire le identità, verificare lo stato e le operazioni amministrative. Comunica con il daemon [`doublezerod`](#doublezerod).

### Config Agent
Agente software in esecuzione sui [DZD](#dzd-doublezero-device) che gestisce la configurazione del dispositivo. Legge la configurazione dal servizio [Controller](#controller) e applica le modifiche al dispositivo. Vedere [Installazione del Config Agent](contribute-provisioning.md#step-44-install-config-agent) per la configurazione.

### Telemetry Agent
Agente software in esecuzione sui [DZD](#dzd-doublezero-device) che raccoglie metriche di prestazione (latenza, jitter, perdita di pacchetti) e le invia al ledger DoubleZero. Vedere [Installazione del Telemetry Agent](contribute-provisioning.md#step-45-install-telemetry-agent) per la configurazione.

### Controller
Un servizio che fornisce la configurazione agli agenti [DZD](#dzd-doublezero-device). Il Controller deriva le configurazioni dei dispositivi dallo stato [onchain](#onchain) sul ledger DoubleZero.

---

## Stati dei Link

### Activated
Lo stato operativo normale per un link. Il traffico fluisce attraverso il link e partecipa alle decisioni di routing.

### Soft-Drained
Uno stato di manutenzione in cui il traffico viene scoraggiato su un link specifico. Utilizzato per finestre di manutenzione graduali. Può transitare verso [activated](#activated) o [hard-drained](#hard-drained).

### Hard-Drained
Uno stato di manutenzione in cui il link è completamente rimosso dal servizio. Nessun traffico fluisce attraverso il link. Deve transitare verso [soft-drained](#soft-drained) prima di tornare ad [activated](#activated).

---

## Organizzazioni e Token

### DZF (DoubleZero Foundation)
DoubleZero Foundation è una società fondazione senza membri delle Isole Cayman senza scopo di lucro, costituita per supportare lo sviluppo, la decentralizzazione, la sicurezza e l'adozione della rete DoubleZero.

### 2Z Token
Il token nativo della rete DoubleZero. Utilizzato per pagare le commissioni dei validatori e distribuito come ricompense ai [contributori](#contributor). I validatori possono pagare le commissioni in 2Z tramite un programma di swap onchain. Vedere [Scambio da SOL a 2Z](Swapping-sol-to-2z.md).

### Contributor
Un fornitore di infrastruttura di rete che contribuisce con banda e hardware alla rete DoubleZero. I contributori gestiscono [DZD](#dzd-doublezero-device), forniscono link [WAN](#wan-link) e [DZX](#dzx-link), e ricevono incentivi in token [2Z](#2z-token) per il loro contributo. Vedere la [Documentazione per i Contributori](contribute-overview.md) per iniziare.

---

## Concetti di Rete

### MTU (Maximum Transmission Unit)
La dimensione massima del pacchetto (in byte) che può essere trasmessa su un link di rete. I link WAN di DoubleZero utilizzano tipicamente MTU 9000 (jumbo frame) per maggiore efficienza.

### VRF (Virtual Routing and Forwarding)
Una tecnologia che consente a più tabelle di routing isolate di coesistere sullo stesso router fisico. I contributori spesso utilizzano un VRF di gestione separato per isolare il traffico di gestione dello switch dal traffico di produzione.

### GRE (Generic Routing Encapsulation)
Un protocollo di tunneling che incapsula i pacchetti di rete all'interno di pacchetti IP. Utilizzato dalle connessioni [IBRL](#ibrl-increase-bandwidth-reduce-latency) e [CYOA](#cyoa-choose-your-own-adventure) per creare tunnel overlay tra utenti e DZD.

### BGP (Border Gateway Protocol)
Il protocollo di routing utilizzato per lo scambio di informazioni di routing tra reti su internet. DoubleZero utilizza BGP internamente con ASN 65342.

### ASN (Autonomous System Number)
Un identificatore univoco assegnato a una rete per il routing BGP. Tutti i dispositivi DoubleZero utilizzano **ASN 65342** per il processo BGP interno.

### Loopback Interface
Un'interfaccia di rete virtuale su un router/switch utilizzata per scopi di gestione e routing. I DZD utilizzano Loopback255 (VPNv4) e Loopback256 (IPv4) per il routing interno.

### CIDR (Classless Inter-Domain Routing)
Una notazione per specificare intervalli di indirizzi IP. Il formato è `IP/prefix-length` dove la lunghezza del prefisso indica la dimensione della rete (ad es., `/29` = 8 indirizzi, `/24` = 256 indirizzi).

### Jitter
Variazione nella latenza dei pacchetti nel tempo. Un jitter basso è fondamentale per le applicazioni in tempo reale.

### RTT (Round-Trip Time)
Il tempo necessario affinché un pacchetto viaggi dalla sorgente alla destinazione e ritorno. Utilizzato per misurare la latenza di rete tra i dispositivi.

### TWAMP (Two-Way Active Measurement Protocol)
Un protocollo per misurare le metriche di prestazione della rete come latenza e perdita di pacchetti. Il [Telemetry Agent](#telemetry-agent) utilizza TWAMP per raccogliere metriche tra i DZD.

### IS-IS (Intermediate System to Intermediate System)
Un protocollo di routing link-state utilizzato internamente dalla rete DoubleZero. Le metriche IS-IS vengono regolate durante le operazioni di [draining dei link](#soft-drained).

---

## Geolocalizzazione

### Geolocation
Un servizio DoubleZero che verifica la posizione fisica dei dispositivi utilizzando misurazioni di latenza. Le misurazioni [RTT](#rtt-round-trip-time) tra infrastrutture a posizione nota ([DZD](#dzd-doublezero-device)) e dispositivi target forniscono una prova firmata crittograficamente che un dispositivo si trova entro una certa distanza da un punto di riferimento. La registrazione onchain delle misurazioni è prevista per una versione futura. Vedere [Geolocalizzazione](geolocation.md) per la documentazione utente.

### geoProbe
Un server bare metal che funge da intermediario per le misurazioni di latenza nel sistema di [Geolocalizzazione](#geolocation). I geoProbe sono posizionati entro ~1ms da un [DZD](#dzd-doublezero-device), ricevono LocationOffset firmati dai DZD parent e misurano l'[RTT](#rtt-round-trip-time) verso i dispositivi target tramite [TWAMP](#twamp-two-way-active-measurement-protocol), TWAMP firmato o ICMP echo. Ogni geoProbe è registrato [onchain](#onchain) e collegato a uno o più DZD parent. Vedere [Distribuzione dei Geoprobe](contribute-geolocation.md) per la documentazione dei contributori.

### LocationOffset
Una struttura dati firmata contenente la posizione geografica di un [DZD](#dzd-doublezero-device) (latitudine e longitudine) e una catena di relazioni di latenza tra entità (DZD↔Probe o Probe↔Target). I LocationOffset sono firmati con Ed25519 e inviati tramite UDP attraverso la catena di misurazione. Gli offset compositi includono riferimenti a misurazioni precedenti, creando una traccia verificabile.

---

## Blockchain e Chiavi

### Onchain
Nel contesto DoubleZero, onchain si riferisce a dati e operazioni registrati sul ledger DoubleZero. A differenza delle reti tradizionali in cui le configurazioni di dispositivi e link risiedono in sistemi di gestione centralizzati, DoubleZero registra le registrazioni dei dispositivi, le configurazioni dei link e le sottomissioni di telemetria onchain — rendendo lo stato della rete trasparente e verificabile da tutti i partecipanti.

### Service Key
Una coppia di chiavi crittografiche utilizzata per autenticare le operazioni CLI. Questa è la tua identità di contributore per interagire con lo smart contract DoubleZero. Memorizzata in `~/.config/solana/id.json`.

### Metrics Publisher Key
Una coppia di chiavi crittografiche utilizzata dal [Telemetry Agent](#telemetry-agent) per firmare le sottomissioni di metriche alla blockchain. Separata dalla service key per l'isolamento della sicurezza. Memorizzata in `~/.config/doublezero/metrics-publisher.json`.

### Rewards Manager Key
Una coppia di chiavi crittografiche che controlla dove vengono pagate le ricompense di un contributore. Firma le modifiche alla lista dei wallet destinatari ma non detiene mai direttamente le ricompense. Mantenuta separata dalla [Service Key](#service-key). Vedere [Gestione delle Ricompense](https://github.com/malbeclabs/contributors#rewards-management) nel repository dei contributori.

---

## Hardware e Software

### EOS (Extensible Operating System)
Il sistema operativo di rete di Arista che viene eseguito sugli switch DZD. I contributori installano il [Config Agent](#config-agent) e il [Telemetry Agent](#telemetry-agent) come estensioni EOS.

### EOS Extension
Un pacchetto software che può essere installato sugli switch Arista EOS. Gli agenti DZ sono distribuiti come file `.rpm` e installati tramite il comando `extension`.