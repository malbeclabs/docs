# Architettura

Quali sono i diversi attori e componenti della rete DoubleZero?

<figure markdown="span">
  ![Image title](images/figure8.png){ width="800" }
  <figcaption>Figura 1: Componenti dell'architettura di rete</figcaption>
</figure>

## Contributori

La rete DoubleZero è composta da contributi di connettività ed elaborazione di pacchetti da parte di una comunità in crescita di provider distribuiti di infrastrutture di rete in città di tutto il mondo. I contributori portano al protocollo link in fibra ottica e risorse di elaborazione delle informazioni per fornire la rete mesh decentralizzata.

### Contributori di Larghezza di Banda di Rete

I contributori di rete devono fornire larghezza di banda dedicata tra due punti, operare dispositivi compatibili con DoubleZero (DZD) a ciascuna estremità, e una connessione a internet a ciascuna estremità. I contributori di rete devono anche eseguire software DoubleZero su ogni DZD per fornire servizi come multicast, ricerca utenti e servizi di filtraggio al margine.

I link fisici della rete DoubleZero sono forniti sotto forma di cavi in fibra ottica, comunemente denominati servizi a lunghezza d'onda. I contributori di rete destinano link di rete sottoutilizzati, di proprietà o in locazione da provider di infrastrutture, tra due o più data center. Questi link sono terminati ad entrambe le estremità da DoubleZero Device, che sono enclosure di switching di rete fisiche che eseguono istanze del software DoubleZero Agent.

#### DoubleZero Exchange (DZX / Sito di Cross-connect)

Le DoubleZero Exchange (DZX) sono punti di interconnessione nella rete mesh dove diversi link dei contributori vengono collegati insieme. Le DZX sono situate nelle principali aree metropolitane del mondo dove si verificano le intersezioni di rete. I contributori di rete devono cross-connectare i propri link nella più ampia rete mesh DoubleZero presso le DZX geograficamente più vicine ai loro endpoint di link.

### Contributori di Risorse Computazionali

Separatamente dai contributori di rete, i contributori di risorse sono un gruppo decentralizzato di partecipanti alla rete che svolgono vari compiti di manutenzione e monitoraggio necessari per sostenere l'integrità tecnica e la funzionalità continua della rete DoubleZero. Nello specifico, essi (i) tracciano le transazioni e i pagamenti degli utenti; (ii) calcolano le commissioni per i contributori di rete; (iii) registrano i risultati di (i) e (ii); (iv) amministrano, in modo strettamente non discrezionale, gli smart contract che controllano la tokenomica del protocollo; (v) trasmettono attestazioni alla blockchain applicabile; e (vi) pubblicano dati di telemetria sulla qualità e l'utilizzo dei link per fornire metriche di prestazione in tempo reale e trasparenti per tutti i contributori di rete.

## Componenti

### DoubleZero Daemon

Il software DoubleZero Daemon viene eseguito su server che necessitano di comunicare sulla rete DoubleZero. Il daemon si interfaccia con lo stack di rete del kernel dell'host per creare e gestire interfacce tunnel, tabelle di routing e route.

### Activator

Il servizio Activator, ospitato da uno o più membri contributori di risorse computazionali della comunità DoubleZero, monitora gli eventi contrattuali che richiedono allocazioni di indirizzi IP e cambiamenti di stato e gestisce tali cambiamenti per conto della rete.

### Controller

Il servizio Controller, ospitato da uno o più contributori di risorse computazionali della comunità DoubleZero, funge da interfaccia di configurazione per i DoubleZero Device Agent per rendere la loro configurazione corrente in base agli eventi degli smart contract.

### Agent

Il software Agent viene eseguito direttamente sui DoubleZero Device e applica le modifiche di configurazione ai dispositivi come interpretate dal servizio Controller. Il software Agent interroga il Controller per le modifiche alla configurazione, calcola eventuali differenze tra la versione canonica on-chain dello stato del dispositivo e la configurazione attiva sul dispositivo e applica le modifiche necessarie per riconciliare la configurazione attiva.

### Device

L'enclosure del dispositivo fisico che fornisce il routing e la terminazione dei link per la rete DoubleZero. I DZD eseguono il software DoubleZero Agent e vengono configurati in base ai dati letti dal servizio Controller.
