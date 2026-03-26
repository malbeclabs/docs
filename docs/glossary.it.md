# Glossario
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


Questa pagina definisce la terminologia specifica di DoubleZero utilizzata in tutta la documentazione.

---

## Infrastruttura di Rete

### DZD (DoubleZero Device)
L'hardware di switching di rete fisico che termina i link DoubleZero ed esegue il software DoubleZero Agent. I DZD vengono distribuiti nei data center e forniscono servizi di routing, elaborazione dei pacchetti e connettività degli utenti. Ogni DZD richiede [specifiche hardware](contribute.md#hardware-requirements) specifiche ed esegue sia il [Config Agent](#config-agent) che il [Telemetry Agent](#telemetry-agent).

### DZX (DoubleZero Exchange)
Punti di interconnessione nella rete mesh dove diversi link dei [contributori](#contributor) vengono collegati insieme. Le DZX sono situate nelle principali aree metropolitane (es. NYC, LON, TYO) dove si verificano le intersezioni di rete. I contributori di rete devono cross-connectare i propri link nella più ampia rete DoubleZero mesh presso la DZX più vicina. Concettualmente simile a un Internet Exchange (IX).

### WAN Link
Un link Wide Area Network tra due [DZD](#dzd-doublezero-device) operati dallo **stesso** contributore. I WAN link forniscono connettività backbone all'interno dell'infrastruttura di un singolo contributore.

### DZX Link
Un link tra [DZD](#dzd-doublezero-device) operati da **diversi** contributori, stabilito presso una [DZX](#dzx-doublezero-exchange). I DZX link richiedono accettazione esplicita da entrambe le parti.

### DZ Prefix
Allocazioni di indirizzi IP in formato CIDR assegnate a un [DZD](#dzd-doublezero-device) per l'indirizzamento della rete overlay. Specificato durante la [creazione del dispositivo](contribute-provisioning.md#step-32-create-your-device-onchain) usando il parametro `--dz-prefixes`.

---

## Tipi di Dispositivo

### Dispositivo Edge
Un [DZD](#dzd-doublezero-device) che fornisce connettività utente alla rete DoubleZero. I dispositivi edge sfruttano le interfacce [CYOA](#cyoa-choose-your-own-adventure) per terminare gli utenti (validatori, operatori RPC) e connetterli alla rete.

### Dispositivo Transit
Un [DZD](#dzd-doublezero-device) che fornisce connettività backbone all'interno della rete DoubleZero. I dispositivi transit spostano il traffico tra i DZD ma non terminano direttamente le connessioni utente.

### Dispositivo Hybrid
Un [DZD](#dzd-doublezero-device) che combina le funzionalità sia di [edge](#edge-device) che di [transit](#transit-device), fornendo sia connettività utente che routing backbone.

---

## Connettività

### CYOA (Choose Your Own Adventure)
Tipi di interfaccia che consentono ai [contributori](#contributor) di registrare opzioni di connettività per gli utenti per connettersi alla rete DoubleZero. Le interfacce CYOA includono vari metodi come [DIA](#dia-direct-internet-access), tunnel GRE e peering privato. Consulta [Creazione Interfacce CYOA](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices) per i dettagli di configurazione.

### DIA (Direct Internet Access)
Un termine di rete standard per la connettività fornita tramite l'internet pubblico. In DoubleZero, DIA è un tipo di interfaccia [CYOA](#cyoa-choose-your-own-adventure) dove gli utenti (validatori, operatori RPC) si connettono a un [DZD](#dzd-doublezero-device) tramite la loro connessione internet esistente.

### IBRL (Increase Bandwidth Reduce Latency)
Una modalità di connessione che consente a validatori e nodi RPC di connettersi a DoubleZero senza riavviare i propri client blockchain. IBRL utilizza l'indirizzo IP pubblico esistente e stabilisce un tunnel overlay verso il [DZD](#dzd-doublezero-device) più vicino. Consulta [Connessione Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) per le istruzioni di configurazione.

### Multicast
Un metodo di consegna dei pacchetti one-to-many supportato da DoubleZero. La modalità multicast ha due ruoli: **publisher** (invia pacchetti attraverso la rete) e **subscriber** (riceve pacchetti dal publisher). Utilizzato dai team di sviluppo per la distribuzione efficiente dei dati. Consulta [Altra Connessione Multicast](Other%20Multicast%20Connection.md) per i dettagli di connessione.

---

## Componenti Software

### doublezerod
Il servizio daemon DoubleZero che viene eseguito sui server degli utenti (validatori, nodi RPC). Gestisce la connessione alla rete DoubleZero, gestisce la creazione dei tunnel e mantiene la connettività ai [DZD](#dzd-doublezero-device). Configurato tramite systemd e controllato attraverso la CLI [`doublezero`](#doublezero-cli).

### doublezero (CLI)
L'interfaccia a riga di comando per interagire con la rete DoubleZero. Utilizzata per connettersi, gestire le identità, controllare lo stato ed eseguire operazioni amministrative. Comunica con il daemon [`doublezerod`](#doublezerod).

### Config Agent
Agente software in esecuzione sui [DZD](#dzd-doublezero-device) che gestisce la configurazione del dispositivo. Legge la configurazione dal servizio [Controller](#controller) e applica le modifiche al dispositivo. Consulta [Installazione Config Agent](contribute-provisioning.md#step-44-install-config-agent) per la configurazione.

### Telemetry Agent
Agente software in esecuzione sui [DZD](#dzd-doublezero-device) che raccoglie metriche di prestazione (latenza, jitter, perdita di pacchetti) e le invia al registro DoubleZero. Consulta [Installazione Telemetry Agent](contribute-provisioning.md#step-45-install-telemetry-agent) per la configurazione.

### Controller
Un servizio che fornisce la configurazione agli agenti [DZD](#dzd-doublezero-device). Il Controller deriva le configurazioni dei dispositivi dallo stato [onchain](#onchain) nel registro DoubleZero.

---

## Stati dei Link

### Activated
Lo stato operativo normale di un link. Il traffico scorre attraverso il link e partecipa alle decisioni di routing.

### Soft-Drained
Uno stato di manutenzione in cui il traffico sarà scoraggiato su un link specifico. Utilizzato per finestre di manutenzione graduali. Può passare a [activated](#activated) o [hard-drained](#hard-drained).

### Hard-Drained
Uno stato di manutenzione in cui il link è completamente rimosso dal servizio. Nessun traffico scorre attraverso il link. Deve passare a [soft-drained](#soft-drained) prima di tornare a [activated](#activated).

---

## Organizzazioni e Token

### DZF (DoubleZero Foundation)
La DoubleZero Foundation è una società fondazionale senza soci delle Isole Cayman costituita per supportare lo sviluppo, la decentralizzazione, la sicurezza e l'adozione della rete DoubleZero.

### Token 2Z
Il token nativo della rete DoubleZero. Utilizzato per pagare le commissioni dei validatori e distribuito come ricompense ai [contributori](#contributor). I validatori possono pagare le commissioni in 2Z tramite un programma di swap on-chain. [Scambio SOL per 2Z](Swapping-sol-to-2z.md).

### Contributor
Un provider di infrastrutture di rete che contribuisce larghezza di banda e hardware alla rete DoubleZero. I contributori operano [DZD](#dzd-doublezero-device), forniscono link [WAN](#wan-link) e [DZX](#dzx-link), e ricevono incentivi in token [2Z](#2z-token) per il loro contributo. Consulta la [Documentazione Contributori](contribute-overview.md) per iniziare.

---

## Concetti di Rete

### MTU (Maximum Transmission Unit)
La dimensione massima del pacchetto (in byte) che può essere trasmessa su un link di rete. I WAN link DoubleZero utilizzano tipicamente MTU 9000 (jumbo frame) per l'efficienza.

### VRF (Virtual Routing and Forwarding)
Una tecnologia che consente a più tabelle di routing isolate di esistere sullo stesso router fisico. I contributori spesso utilizzano un VRF di gestione separato per isolare il traffico di gestione degli switch dal traffico di produzione.

### GRE (Generic Routing Encapsulation)
Un protocollo di tunneling che incapsula i pacchetti di rete all'interno di pacchetti IP. Utilizzato dalle connessioni [IBRL](#ibrl-increase-bandwidth-reduce-latency) e [CYOA](#cyoa-choose-your-own-adventure) per creare tunnel overlay tra utenti e DZD.

### BGP (Border Gateway Protocol)
Il protocollo di routing utilizzato per lo scambio di informazioni di routing tra reti su internet. DoubleZero utilizza BGP internamente con ASN 65342.

### ASN (Autonomous System Number)
Un identificatore univoco assegnato a una rete per il routing BGP. Tutti i dispositivi DoubleZero utilizzano **ASN 65342** per il processo BGP interno.

### Interfaccia Loopback
Un'interfaccia di rete virtuale su un router/switch utilizzata per scopi di gestione e routing. I DZD utilizzano Loopback255 (VPNv4) e Loopback256 (IPv4) per il routing interno.

### CIDR (Classless Inter-Domain Routing)
Una notazione per specificare gli intervalli di indirizzi IP. Il formato è `IP/lunghezza-prefisso` dove la lunghezza del prefisso indica le dimensioni della rete (es. `/29` = 8 indirizzi, `/24` = 256 indirizzi).

### Jitter
Variazione nella latenza dei pacchetti nel tempo. Il jitter basso è fondamentale per le applicazioni in tempo reale.

### RTT (Round-Trip Time)
Il tempo necessario a un pacchetto per viaggiare dalla sorgente alla destinazione e ritorno. Utilizzato per misurare la latenza di rete tra i dispositivi.

### TWAMP (Two-Way Active Measurement Protocol)
Un protocollo per la misurazione delle metriche di prestazione di rete come latenza e perdita di pacchetti. Il [Telemetry Agent](#telemetry-agent) utilizza TWAMP per raccogliere metriche tra i DZD.

### IS-IS (Intermediate System to Intermediate System)
Un protocollo di routing link-state utilizzato internamente dalla rete DoubleZero. Le metriche IS-IS vengono regolate durante le operazioni di [drenaggio dei link](#soft-drained).

---

## Blockchain e Chiavi

### Onchain
Nel contesto DoubleZero, onchain si riferisce a dati e operazioni registrati nel registro DoubleZero. A differenza delle reti tradizionali dove le configurazioni di dispositivi e link risiedono in sistemi di gestione centralizzati, DoubleZero registra le registrazioni dei dispositivi, le configurazioni dei link e le trasmissioni di telemetria onchain, rendendo lo stato della rete trasparente e verificabile da tutti i partecipanti.

### Service Key
Un keypair crittografico utilizzato per autenticare le operazioni CLI. Questa è la tua identità di contributore per interagire con lo smart contract DoubleZero. Memorizzata in `~/.config/solana/id.json`.

### Metrics Publisher Key
Un keypair crittografico utilizzato dal [Telemetry Agent](#telemetry-agent) per firmare le trasmissioni di metriche alla blockchain. Separata dalla service key per l'isolamento della sicurezza. Memorizzata in `~/.config/doublezero/metrics-publisher.json`.

---

## Hardware e Software

### EOS (Extensible Operating System)
Il sistema operativo di rete di Arista che viene eseguito sugli switch DZD. I contributori installano [Config Agent](#config-agent) e [Telemetry Agent](#telemetry-agent) come estensioni EOS.

### EOS Extension
Un pacchetto software che può essere installato sugli switch Arista EOS. Gli agenti DZ vengono distribuiti come file `.rpm` e installati tramite il comando `extension`.
