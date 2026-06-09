---
description: Panoramica degli attori e dei componenti che costituiscono l'architettura di rete di DoubleZero.
---

# Architettura

Quali sono i diversi attori e componenti che costituiscono la rete DoubleZero?

<figure markdown="span">
  ![Image title](images/figure8.png){ width="800" }
  <figcaption>Figura 1: Componenti dell'architettura di rete</figcaption>
</figure>

## Contributori

La rete DoubleZero è composta da contributi di connettività e di elaborazione dei pacchetti provenienti da una comunità in crescita di fornitori di infrastrutture di rete distribuiti in città di tutto il mondo. I contributori mettono a disposizione del protocollo collegamenti in fibra ottica e risorse di elaborazione delle informazioni per fornire la rete mesh decentralizzata.

### Contributori di Banda di Rete

I contributori di rete devono fornire larghezza di banda dedicata tra due punti, operare dispositivi compatibili con DoubleZero (DZD) a ciascuna estremità e una connessione a Internet a ciascuna estremità. I contributori di rete devono inoltre eseguire il software DoubleZero su ciascun DZD per fornire servizi come multicast, ricerca utenti e servizi di filtraggio perimetrale.

I collegamenti fisici della rete DoubleZero sono forniti sotto forma di cavi in fibra ottica, comunemente denominati servizi a lunghezza d'onda. I contributori di rete mettono a disposizione collegamenti di rete sottoutilizzati, di proprietà o in leasing da fornitori di infrastrutture, tra due o più data center. Questi collegamenti sono terminati a entrambe le estremità da DoubleZero Device, che sono apparati fisici di commutazione di rete che eseguono istanze del software DoubleZero Agent.

#### DoubleZero Exchange (DZX / Sito di Cross-connect)

I DoubleZero Exchange (DZX) sono punti di interconnessione nella rete mesh in cui i diversi collegamenti dei contributori vengono collegati tra loro. I DZX si trovano nelle principali aree metropolitane del mondo dove si verificano intersezioni di rete. I contributori di rete devono effettuare il cross-connect dei loro collegamenti nella più ampia rete mesh DoubleZero presso i DZX geograficamente più vicini alle estremità dei loro collegamenti.

### Contributori di Risorse Computazionali

Separati dai contributori di rete, i contributori di risorse sono un gruppo decentralizzato di partecipanti alla rete che svolgono varie attività di manutenzione e monitoraggio necessarie per sostenere l'integrità tecnica e la funzionalità continua della rete DoubleZero. In particolare, essi (i) tracciano le transazioni e i pagamenti degli utenti; (ii) calcolano le tariffe per i contributori di rete; (iii) registrano i risultati di (i) e (ii); (iv) amministrano, su base strettamente non discrezionale, gli smart contract che controllano la tokenomics del protocollo; (v) trasmettono le attestazioni alla blockchain applicabile; e (vi) pubblicano dati di telemetria riguardanti la qualità e l'utilizzo dei collegamenti per fornire metriche di prestazione trasparenti e in tempo reale per tutti i contributori di rete.

## Componenti

### DoubleZero Daemon

Il software DoubleZero Daemon viene eseguito sui server che necessitano di comunicare attraverso la rete DoubleZero. Il daemon si interfaccia con lo stack di rete del kernel dell'host per creare e gestire interfacce tunnel, tabelle di routing e rotte.

### Activator

Il servizio Activator, ospitato da uno o più membri contributori di risorse computazionali della comunità DoubleZero, monitora gli eventi dei contratti che richiedono allocazioni di indirizzi IP e cambiamenti di stato, e gestisce tali modifiche per conto della rete.

### Controller

Il servizio Controller, ospitato da uno o più contributori di risorse computazionali della comunità DoubleZero, funge da interfaccia di configurazione per i DoubleZero Device Agent, al fine di renderizzare la loro configurazione corrente sulla base degli eventi degli smart contract.

### Agent

Il software Agent viene eseguito direttamente sui DoubleZero Device e applica le modifiche di configurazione ai dispositivi come interpretate dal servizio Controller. Il software Agent interroga il Controller per verificare eventuali modifiche alla configurazione, calcola le differenze tra la versione canonica on-chain dello stato del dispositivo e la configurazione attiva sul dispositivo, e applica le modifiche necessarie per riconciliare la configurazione attiva.

### Device

L'apparato fisico che fornisce il routing e la terminazione dei collegamenti per la rete DoubleZero. I DZD eseguono il software DoubleZero Agent e vengono configurati sulla base dei dati letti dal servizio Controller.