---
description: Definizioni della terminologia specifica di DoubleZero utilizzata in tutta la documentazione.
---

# Glossario

Questa pagina definisce la terminologia specifica di DoubleZero utilizzata in tutta la documentazione.

---

## Infrastruttura di Rete

### DZD (DoubleZero Device)
L'hardware fisico di switching di rete che termina i link DoubleZero ed esegue il software DoubleZero Agent. I DZD vengono distribuiti nei data center e forniscono servizi di routing, elaborazione dei pacchetti e connettività utente. Ogni DZD richiede [specifiche hardware](contribute.md#dzd-network-hardware) specifiche ed esegue sia il [Config Agent](#config-agent) che il [Telemetry Agent](#telemetry-agent).

### DZX (DoubleZero Exchange)
Punti di interconnessione nella rete mesh dove i link di diversi [contributori](#contributor) vengono collegati tra loro. I DZX si trovano nelle principali aree metropolitane (ad es. NYC, LON, TYO) dove si verificano le intersezioni di rete. I contributori di rete devono effettuare il cross-connect dei loro link nella più ampia mesh DoubleZero presso il DZX più vicino. Concetto simile a un Internet Exchange (IX).

### WAN Link
Un link Wide Area Network tra due [DZD](#dzd-doublezero-device) gestiti dallo **stesso** contributore. I WAN link forniscono connettività backbone all'interno dell'infrastruttura di un singolo contributore.

### DZX Link
Un link tra [DZD](#dzd-doublezero-device) gestiti da contributori **diversi**, stabilito presso un [DZX](#dzx-doublezero-exchange). I DZX link richiedono l'accettazione esplicita da parte di entrambe le parti.

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
Tipi di interfaccia che consentono ai [contributori](#contributor) di registrare opzioni di connettività per permettere agli utenti di connettersi alla rete DoubleZero. Le interfacce CYOA includono vari metodi come [DIA](#dia-direct-internet-access), tunnel GRE e peering privato. Consulta [Creazione delle Interfacce CYOA](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices) per i dettagli di configurazione.

### DIA (Direct Internet Access)
Un termine di networking standard per la connettività fornita tramite internet pubblico. In DoubleZero, DIA è un tipo di interfaccia [CYOA](#cyoa-choose-your-own-adventure) in cui gli utenti (validatori, operatori RPC) si connettono a un [DZD](#dzd-doublezero-device) tramite la loro connessione internet esistente.

### IBRL (Increase Bandwidth Reduce Latency)
Una modalità di connessione che consente a validatori e nodi RPC di connettersi a DoubleZero senza riavviare i loro client blockchain. IBRL utilizza l'indirizzo IP pubblico esistente e stabilisce un tunnel overlay verso il [DZD](#dzd-doublezero-device) più vicino. Consulta [Connessione Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) per le istruzioni di configurazione.

### Multicast
Un metodo di consegna dei pacchetti uno-a-molti supportato da DoubleZero. La modalità multicast ha due ruoli: **publisher** (invia pacchetti attraverso la rete) e **subscriber** (riceve pacchetti dal publisher). Utilizzato dai team di sviluppo per la distribuzione efficiente dei dati. Consulta [Altra Connessione Multicast](Other%20Multicast%20Connection.md) per i dettagli di connessione.

---

## Componenti Software

### doublezerod
Il servizio daemon DoubleZero che viene eseguito sui server degli utenti (validatori, nodi RPC). Gestisce la connessione alla rete DoubleZero, si occupa dell'instaurazione dei tunnel e mantiene la connettività verso i [DZD](#dzd-doublezero-device). Configurato tramite systemd e controllato attraverso la CLI [`doublezero`](#doublezero-cli).

### doublezero (CLI)
L'interfaccia a riga di comando per interagire con la rete DoubleZero. Utilizzata per connettersi, gestire le identità, verificare lo stato e le operazioni amministrative. Comunica con il daemon [`doublezerod`](#doublezerod).

### Config Agent
Agente software in esecuzione sui [DZD](#dzd-doublezero-device) che gestisce la configurazione del dispositivo. Legge la configurazione dal servizio [Controller](#controller) e applica le modifiche al dispositivo. Consulta [Installazione del Config Agent](contribute-provisioning.md#step-44-install-config-agent) per la configurazione.

### Telemetry Agent
Agente software in esecuzione sui [DZD](#dzd-doublezero-device) che raccoglie metriche di prestazione (latenza, jitter, perdita di pacchetti) e le invia al ledger DoubleZero. Consulta [Installazione del Telemetry Agent](contribute-provisioning.md#step-45-install-telemetry-agent) per la configurazione.

### Controller
Un servizio che fornisce la configurazione agli agenti [DZD](#dzd-doublezero-device). Il Controller deriva le configurazioni dei dispositivi dallo stato [onchain](#onchain) sul ledger DoubleZero.

---

## Stati dei Link

### Activated
Lo stato operativo normale di un link. Il traffico fluisce attraverso il link e quest'ultimo partecipa alle decisioni di routing.

### Soft-Drained
Uno stato di manutenzione in cui il traffico viene scoraggiato su un link specifico. Utilizzato per finestre di manutenzione graduali. Può transitare verso [activated](#activated) o [hard-drained](#hard-drained).

### Hard-Drained
Uno stato di manutenzione in cui il link viene completamente rimosso dal servizio. Nessun traffico fluisce attraverso il link. Deve transitare verso [soft-drained](#soft-drained) prima di tornare ad [activated](#activated).

---

## Organizzazioni e Token

### DZF (DoubleZero Foundation)
La DoubleZero Foundation è una fondazione senza membri costituita come società delle Isole Cayman, creata per supportare lo sviluppo, la decentralizzazione, la sicurezza e l'adozione della rete DoubleZero.

### 2Z Token
Il token nativo della rete DoubleZero. Utilizzato per il pagamento delle commissioni dei validatori e distribuito come ricompensa ai [contributori](#contributor). I validatori possono pagare le commissioni in 2Z tramite un programma di swap onchain. Consulta [Scambio di SOL in 2Z](Swapping-sol-to-2z.md).

### Contributor
Un fornitore di infrastruttura di rete che contribuisce con banda e hardware alla rete DoubleZero. I contributori gestiscono [DZD](#dzd-doublezero-device), forniscono link [WAN](#wan-link) e [DZX](#dzx-link), e ricevono incentivi in token [2Z](#2z-token) per il loro contributo. Consulta la [Documentazione per i Contributori](contribute-overview.md) per iniziare.

---

## Concetti di Networking

### MTU (Maximum Transmission Unit)
La dimensione massima del pacchetto (in byte) che può essere trasmessa su un link di rete. I WAN link di DoubleZero utilizzano tipicamente MTU 9000 (jumbo frame) per efficienza.

### VRF (Virtual Routing and Forwarding)
Una tecnologia che consente a più tabelle di routing isolate di coesistere sullo stesso router fisico. I contributori spesso utilizzano un VRF di gestione separato per isolare il traffico di gestione dello switch dal traffico di produzione.

### GRE (Generic Routing Encapsulation)
Un protocollo di tunneling che incapsula pacchetti di rete all'interno di pacchetti IP. Utilizzato dalle connessioni [IBRL](#ibrl-increase-bandwidth-reduce-latency) e [CYOA](#cyoa-choose-your-own-adventure) per creare tunnel overlay tra utenti e DZD.

### BGP (Border Gateway Protocol)
Il protocollo di routing utilizzato per lo scambio di informazioni di routing tra reti su internet. DoubleZero utilizza BGP internamente con ASN 65342.

### ASN (Autonomous System Number)
Un identificatore univoco assegnato a una rete per il routing BGP. Tutti i dispositivi DoubleZero utilizzano **ASN 65342** per il processo BGP interno.

### Loopback Interface
Un'interfaccia di rete virtuale su un router/switch utilizzata per scopi di gestione e routing. I DZD utilizzano Loopback255 (VPNv4) e Loopback256 (IPv4) per il routing interno.

### CIDR (Classless Inter-Domain Routing)
Una notazione per specificare intervalli di indirizzi IP. Il formato è `IP/prefix-length` dove la lunghezza del prefisso indica la dimensione della rete (ad es. `/29` = 8 indirizzi, `/24` = 256 indirizzi).

### Jitter
Variazione della latenza dei pacchetti nel tempo. Un basso jitter è fondamentale per le applicazioni in tempo reale.

### RTT (Round-Trip Time)
Il tempo necessario a un pacchetto per viaggiare dalla sorgente alla destinazione e ritorno. Utilizzato per misurare la latenza di rete tra i dispositivi.

### TWAMP (Two-Way Active Measurement Protocol)
Un protocollo per la misurazione delle metriche di prestazione della rete come latenza e perdita di pacchetti. Il [Telemetry Agent](#telemetry-agent) utilizza TWAMP per raccogliere metriche tra i DZD.

### IS-IS (Intermediate System to Intermediate System)
Un protocollo di routing link-state utilizzato internamente dalla rete DoubleZero. Le metriche IS-IS vengono regolate durante le operazioni di [draining dei link](#soft-drained).

---

## Geolocalizzazione

### Geolocation
Un servizio DoubleZero che verifica la posizione fisica dei dispositivi utilizzando misurazioni di latenza. Le misurazioni [RTT](#rtt-round-trip-time) tra infrastrutture a posizione nota ([DZD](#dzd-doublezero-device)) e dispositivi target forniscono una prova firmata crittograficamente che un dispositivo si trova entro una certa distanza da un punto di riferimento. La registrazione onchain delle misurazioni è prevista per una versione futura. Consulta [Geolocalizzazione](geolocation.md) per la documentazione utente.

### geoProbe
Un server bare metal che funge da intermediario per le misurazioni di latenza nel sistema di [Geolocalizzazione](#geolocation). I geoProbe sono situati entro ~1ms da un [DZD](#dzd-doublezero-device), ricevono LocationOffset firmati dai DZD parent e misurano l'[RTT](#rtt-round-trip-time) verso i dispositivi target tramite [TWAMP](#twamp-two-way-active-measurement-protocol), TWAMP firmato o ICMP echo. Ogni geoProbe è registrato [onchain](#onchain) e collegato a uno o più DZD parent. Consulta [Distribuzione dei Geoprobe](contribute-geolocation.md) per la documentazione per i contributori.

### LocationOffset
Una struttura dati firmata contenente la posizione geografica (latitudine e longitudine) di un [DZD](#dzd-doublezero-device) e una catena di relazioni di latenza tra entità (DZD↔Probe o Probe↔Target). I LocationOffset sono firmati con Ed25519 e inviati tramite UDP attraverso la catena di misurazione. Gli offset compositi includono riferimenti a misurazioni precedenti, creando una traccia verificabile.

---

## Blockchain e Chiavi

### Onchain
Nel contesto DoubleZero, onchain si riferisce a dati e operazioni registrati sul ledger DoubleZero. A differenza delle reti tradizionali dove le configurazioni di dispositivi e link risiedono in sistemi di gestione centralizzati, DoubleZero registra le registrazioni dei dispositivi, le configurazioni dei link e gli invii di telemetria onchain — rendendo lo stato della rete trasparente e verificabile da tutti i partecipanti.

### Service Key
Una coppia di chiavi crittografiche utilizzata per autenticare le operazioni CLI. Questa è la tua identità come contributore per interagire con lo smart contract DoubleZero. Memorizzata in `~/.config/solana/id.json`.

### Metrics Publisher Key
Una coppia di chiavi crittografiche utilizzata dal [Telemetry Agent](#telemetry-agent) per firmare gli invii di metriche alla blockchain. Separata dalla service key per l'isolamento della sicurezza. Memorizzata in `~/.config/doublezero/metrics-publisher.json`.

---

## Hardware e Software

### EOS (Extensible Operating System)
Il sistema operativo di rete di Arista che viene eseguito sugli switch DZD. I contributori installano il [Config Agent](#config-agent) e il [Telemetry Agent](#telemetry-agent) come estensioni EOS.

### EOS Extension
Un pacchetto software che può essere installato sugli switch Arista EOS. Gli agenti DZ vengono distribuiti come file `.rpm` e installati tramite il comando `extension`.