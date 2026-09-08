---
description: Requisiti hardware, di banda e di connettività e architettura per contribuire capacità alla rete DoubleZero.
---

# Requisiti e Architettura per i Contributori

## Riepilogo

Chiunque desideri monetizzare i propri cavi in fibra ottica e hardware di rete sottoutilizzati può contribuire alla rete DoubleZero. I contributori di rete devono fornire banda dedicata tra due punti, operare dispositivi compatibili con DoubleZero (DZD) a ciascuna estremità e una connessione alla rete internet pubblica a ciascuna estremità. I contributori di rete devono inoltre eseguire il software DoubleZero su ciascun DZD per fornire servizi come multicast, ricerca utenti e filtraggio perimetrale.

Lo smart contract di DoubleZero è il pilastro fondamentale per garantire che la rete mantenga collegamenti di alta qualità che possano essere misurati e integrati nella topologia, consentendo ai nostri controller di rete di sviluppare il percorso end-to-end più efficiente tra i diversi utenti e endpoint. Al momento dell'esecuzione dello smart contract e del deployment delle apparecchiature di rete e della banda, un'entità viene classificata come contributore di rete. Consultare [DoubleZero Economics](https://economics.doublezero.xyz/overview) per comprendere meglio gli aspetti economici della partecipazione a DoubleZero come contributore di rete.

---

## Requisiti per Diventare un Contributore della Rete DoubleZero

- Banda dedicata in grado di fornire connettività IPv4 e un MTU di 2048 byte tra due data center
- Hardware DoubleZero Device (DZD) compatibile con il protocollo DoubleZero
- Connettività a internet e ad altri contributori della rete DoubleZero
- Installazione del software DoubleZero sul DZD

## Guida Rapida

Come contributore di rete, il modo più semplice per iniziare con DoubleZero è identificare la capacità nella propria rete che può essere dedicata a DoubleZero. Una volta identificata, i DZD devono essere distribuiti, facilitando la rete overlay DoubleZero che richiede solo raggiungibilità IPv4 e un MTU minimo di 2048 byte come dipendenze dalla rete del contributore.

La Figura 1 illustra il modello più semplice per contribuire banda e servizi di invio ed elaborazione dei pacchetti. Un DZD viene distribuito in ciascun data center, interfacciandosi con la rete interna del contributore per fornire connettività WAN DoubleZero. Questo è completato da internet locale, tipicamente una soluzione di Accesso Internet Diretto (DIA), utilizzata come punto di accesso per gli utenti DoubleZero. Sebbene si preveda che il DIA sarà l'opzione preferita per facilitare l'accesso agli utenti di DoubleZero, sono possibili numerosi modelli di connettività, ad esempio cablaggio fisico ai server, estensione del fabric di rete, ecc. Ci riferiamo a queste opzioni come Choose Your Own Adventure (CYOA), fornendo al contributore la flessibilità di connettere utenti locali o remoti nel modo più adatto alle proprie politiche di rete interna.

Come per qualsiasi rete, la raggiungibilità è una parte fondamentale dell'architettura poiché i contributori di rete non possono operare in isolamento. Pertanto, il DZD *deve* avere un collegamento a un DoubleZero Exchange (DZX) per creare una rete contigua tra i partecipanti.

<figure markdown="span">
  ![Image title](images/figure1.png){ width="800" }
  <figcaption>Figura 1: Contribuzione di Banda alla Rete DoubleZero tra 2 Data Center - Singolo Contributore</figcaption>
</figure>

### Esempi di Contribuzione

I modi in cui un contributore di rete può ampliare le proprie contribuzioni a DoubleZero sono molteplici, tra cui:

- Migliorare le caratteristiche prestazionali delle contribuzioni esistenti: aumentare la banda, ridurre la latenza
- Aggiungere più collegamenti tra gli stessi data center
- Aggiungere un nuovo collegamento da un data center esistente a un nuovo data center
- Aggiungere un nuovo collegamento indipendente tra due nuovi data center

#### Esempio 1: Singolo Contributore, 3 Data Center, Due Collegamenti
<figure markdown="span">
  ![Image title](images/figure2.png){ width="800" }
  <figcaption>Figura 2: Contribuzione di Banda alla Rete DoubleZero tra 3 Data Center - Singolo Contributore</figcaption>
</figure>

Un singolo DZD può supportare più collegamenti contribuiti a DoubleZero. La Figura 2 illustra una possibile topologia nel caso in cui un singolo data center, indicato come 1, termini la banda verso due diversi data center remoti 2 e 3. In questo scenario, ciascun data center contiene solo 1 DZD. Tutti i DZD utilizzano DIA per i punti di accesso utente come interfaccia CYOA.

#### Esempio 2: Singolo Contributore, 3 Data Center, Tre Collegamenti

La Figura 3 descrive la topologia DoubleZero quando un singolo contributore distribuisce tre collegamenti in una topologia a triangolo tra 3 data center. In uno scenario simile all'esempio 1, un singolo DZD viene distribuito nei data center 1, 2 e 3, ciascuno con supporto per 2 collegamenti di rete indipendenti. La topologia risultante è un triangolo o anello tra i data center.

<figure markdown="span">
  ![Image title](images/figure3.png){ width="800" }
  <figcaption>Figura 3: Contribuzione di Banda alla Rete DoubleZero tra 3 Data Center - Singolo Contributore</figcaption>
</figure>

### DoubleZero Exchange

La creazione di una rete contigua è un elemento fondamentale dell'architettura DoubleZero. I contributori si interfacciano tramite un DoubleZero Exchange (DZX) all'interno di un'area metropolitana, ovvero una città come New York (NYC), Londra (LON) o Tokyo (TYO). Un DZX è un fabric di rete simile a un Internet Exchange, che consente il peering e lo scambio di rotte.

Nella Figura 4, il contributore di rete 1 opera nei data center 1, 2 e 3, mentre il contributore di rete 2 opera nei data center 2, 4 e 5. Interconnettendosi nel data center 2, la copertura della rete DoubleZero aumenta a 5 data center contigui.

<figure markdown="span">
  ![Image title](images/figure4.png){ width="1000" }
  <figcaption>Figura 4: Contribuzione di Banda alla Rete DoubleZero tra 2 Contributori di Banda di Rete</figcaption>
</figure>

### Opzioni di Contribuzione della Banda

DoubleZero richiede che un contributore di rete offra connettività integrata tramite un profilo garantito di banda, latenza e jitter tra i DZD in due data center terminali, espresso tramite uno smart contract. DoubleZero non impone come un contributore di rete implementi la propria contribuzione; tuttavia, nelle sezioni seguenti forniamo opzioni indicative da utilizzare a propria discrezione.

Aree importanti da considerare per un contributore di rete potrebbero essere:

- Capacità di garantire le prestazioni di rete del servizio DoubleZero: banda, latenza e jitter
- Segregazione dai servizi di rete interni esistenti
- Conflitti di indirizzamento IPv4, specificamente con lo spazio di indirizzi dell'underlay del tunnel
- Uptime e disponibilità
- Considerazioni su CAPEX e OPEX

#### Banda Layer 1
<figure markdown="span">
  ![Image title](images/figure5.png){ width="800" }
  <figcaption>Figura 5: Servizi Ottici Layer 1</figcaption>
</figure>

La banda Layer 1, più formalmente descritta come servizi a lunghezza d'onda, può prevedere capacità dedicata fornita su un'infrastruttura ottica esistente, come DWDM, CWDM o tramite multiplexer ottici (MUX). Nella Figura 5, i DZD utilizzano un'ottica colorata collegata a un MUX L1, che inserisce la lunghezza d'onda del DZD su una fibra ottica spenta esistente.

Questa soluzione offre numerosi vantaggi per i contributori di rete che operano già una rete core esistente. Le modifiche operative incrementali, così come i requisiti aggiuntivi di CAPEX e OPEX, sono modesti. Questa opzione è particolarmente robusta nell'offrire segregazione dai servizi di rete del contributore.

#### Banda a Commutazione di Pacchetto

Le reti a commutazione di pacchetto possono essere considerate una tipica rete aziendale, che esegue protocolli standard di routing e switching a supporto delle applicazioni aziendali. Esistono numerose tecnologie di rete che garantiscono la connettività, ad esempio estensioni layer 2 (L2) tramite tag VLAN.

##### Estensione L2
<figure markdown="span">
  ![Image title](images/figure6.png){ width="800" }
  <figcaption>Figura 6: Reti a Commutazione di Pacchetto - Estensione L2</figcaption>
</figure>

Un'estensione L2 come mostrata nella Figura 6 può essere facilitata tramite il tagging VLAN. La porta di un DZD può essere collegata allo switch di rete interno del contributore, con la porta dello switch configurata come porta di accesso, ad esempio nella VLAN 10. Attraverso il tagging 802.1q, questa VLAN può essere trasportata su più hop di switch nella rete del contributore, terminando allo switch che si interfaccia con il DZD remoto.

Questa soluzione beneficia di un ampio supporto e di una relativa facilità di implementazione, creando al contempo segmentazione tra DoubleZero e i servizi layer 3 interni. La banda può essere controllata in base alla velocità dell'interfaccia dello switch o router interno del contributore. È necessario prestare particolare attenzione alle prestazioni sulla rete L2 interna condivisa attraverso tecnologie come Quality of Service (QoS) o altre politiche di gestione del traffico. Tuttavia, gli investimenti aggiuntivi in CAPEX e OPEX dovrebbero essere modesti se è disponibile capacità esistente all'interno della rete core del contributore.

#### Banda Dedicata di Terze Parti
<figure markdown="span">
  ![Image title](images/figure7.png){ width="800" }
  <figcaption>Figura 7: Banda Dedicata di Terze Parti</figcaption>
</figure>

Sebbene il riutilizzo della capacità disponibile sarà attraente per molti contributori di rete, è anche possibile dedicare banda di nuova acquisizione a DoubleZero. In tale scenario, il DZD si collegherebbe direttamente al carrier di terze parti senza che alcun dispositivo interno del contributore si trovi in linea (Figura 7).

Questa opzione è attraente in quanto garantisce banda dedicata per DoubleZero, è semplice dal punto di vista operativo e assicura una segmentazione completa da qualsiasi altro servizio di rete. Questa opzione comporterà probabilmente il maggiore incremento di OPEX e richiede nuovi contratti di servizio con carrier di terze parti.

---

## Requisiti Hardware

### Contribuzione di Banda a 100Gbps

Si noti che le quantità riportate di seguito riflettono l'attrezzatura necessaria in due data center, ovvero l'hardware totale richiesto per distribuire 1 cavo in fibra ottica per la contribuzione di banda.

??? warning "*Tutti gli FPGA sono soggetti a test finali. Le contribuzioni a 10G possono essere supportate utilizzando switch Arista 7130LBR con doppi FPGA Virtex® UltraScale+™ integrati (per qualsiasi domanda, DoubleZero Foundation / Malbec Labs sono lieti di fornire ulteriori informazioni)."

#### Requisiti di Funzione e Porte

| Funzione                    | Velocità Porta | Requisito DZ | QTÀ | Nota |
|-----------------------------|------------|----------------|-----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Private Bandwidth           | 100G       | Sì            | 1   |                                                                                                                                                                   |
| Direct Internet Access (DIA) | 10G       | Sì            | 2   |                                                                                                                                                                   |
| DoubleZero eXchange (DZX)   | 100G       | Sì*           | 1   | Deve essere supportato quando più di 3 provider operano nella stessa area metropolitana; prima di ciò, è possibile utilizzare cross-connect o altri accordi di peering per interconnettersi ad altri provider. |
| Management                  |            | No            | 1   | Determinato dalle politiche di gestione interne del contributore.                                                                                                    |
| Console                     |            | No             | 1   | Determinato dalle politiche di gestione interne del contributore.                                                                                                    |

#### Hardware di Rete DZD

| Produttore | Modello          | Codice Prodotto       | Requisito DZ | QTÀ | Nota |
|----------|-----------------|----------------------|----------------|-----|-----------------------------------------------------------|
| AMD*      | V80*           | 24540474    | Sì            | 4   |                                                           |
| Arista   | 7280CR3A        | DCS-7280CR3A-32S    | Sì            | 2   | Potrebbero essere possibili alternative in caso di tempi di consegna difficili. |

---

#### Ottiche - 100G

| Produttore | Modello       | Codice Prodotto | Requisito DZ | QTÀ | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 100GBASE-LR | QSFP-100G-LR    | No             | 16  | Cablaggio e scelta delle ottiche a discrezione del contributore. 100G richiesti per connettere gli FPGA. |

---

#### Ottiche - 10G

| Produttore | Modello       | Codice Prodotto | Requisito DZ | QTÀ | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 10GBASE-LR | SFP-10G-LR    | No             | 2   | Cablaggio e scelta delle ottiche a discrezione del contributore. |
| Finisar | DynamiX QSA™ | MAM1Q00A-QSA   | No             | 2   | Cablaggio e scelta delle ottiche a discrezione del contributore. |

---

#### Indirizzamento IP

| Indirizzamento IP | Dimensione Minima Subnet | Requisito DZ | Nota |
|--------------|-------------------|----------------|----------------------------------------------------------|
| Public IPv4  | /29               | Sì (per DZD edge/ibridi)           | Deve essere instradabile tramite DIA. Potremmo eliminare questa necessità nel tempo. |

Assicurarsi che l'intero pool /29 sia disponibile per il protocollo DZ. Eventuali requisiti di indirizzamento point-to-point, ad esempio sulle interfacce DIA, devono essere gestiti tramite un pool di indirizzi diverso.

### Contribuzione di Banda a 10Gbps

Si noti che le quantità riflettono l'attrezzatura per due data center, ovvero l'hardware totale richiesto per distribuire 1 contribuzione di banda.

#### Requisiti di Funzione e Porte

| Funzione                    | Velocità Porta | Requisito DZ | QTÀ | Nota |
|-----------------------------|------------|----------------|-----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Private Bandwidth           | 10G        | Sì            | 1   |                                                                                                                                                                   |
| Direct Internet Access (DIA) | 10G        | Sì            | 2   |                                                                                                                                                                   |
| DoubleZero eXchange (DZX)   | 100G       | Sì*           | 1   | Deve essere supportato quando più di 3 provider operano nella stessa area metropolitana; prima di ciò, è possibile utilizzare cross-connect o altri accordi di peering per interconnettersi ad altri provider. |
| Management                  |            | No             | 1   | Determinato dalle politiche di gestione interne del contributore.                                                                                                    |
| Console                     |            | No             | 1   | Determinato dalle politiche di gestione interne del contributore.                                                                                                    |

---

#### Hardware

| Produttore | Modello          | Codice Prodotto       | Requisito DZ | QTÀ | Nota |
|----------|-----------------|----------------------|----------------|-----|-----------------------------------------------------------|
| AMD*      | V80*           | 24540474*    | Sì            | 4   |                                                           |              |
| Arista   | 7280CR3A        | DCS-7280CR3A-32S    | Sì            | 2   | Potrebbero essere possibili alternative in caso di tempi di consegna difficili. |

---

#### Ottiche - 100G

| Produttore | Modello       | Codice Prodotto | Requisito DZ | QTÀ | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 100GBASE-LR | QSFP-100G-LR    | No             | 14  | Cablaggio e scelta delle ottiche a discrezione del contributore. 100G richiesti per connettere gli FPGA. |

---

#### Ottiche - 10G

| Produttore | Modello       | Codice Prodotto | Requisito DZ | QTÀ | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 10GBASE-LR | SFP-10G-LR    | No             | 4   | Cablaggio e scelta delle ottiche a discrezione del contributore. |
 Finisar | DynamiX QSA™ | MAM1Q00A-QSA   | No             | 4   | Cablaggio e scelta delle ottiche a discrezione del contributore. |
---

#### Indirizzamento IP

| Indirizzamento IP | Dimensione Minima Subnet | Requisito DZ | Nota |
|--------------|-------------------|----------------|----------------------------------------------------------|
| Public IPv4  | /29               | Sì (per DZD edge/ibridi)            | Deve essere instradabile tramite DIA. Potremmo eliminare questa necessità nel tempo. |

Assicurarsi che l'intero pool /29 sia disponibile per il protocollo DZ. Eventuali requisiti di indirizzamento point-to-point, ad esempio sulle interfacce DIA, devono essere gestiti tramite un pool di indirizzi diverso.

### Requisiti del Data Center

#### Requisiti di Rack e Alimentazione

Le cifre seguenti sono **per DZD**, quindi per data center. Una contribuzione di banda a 100G o 10G posiziona un DZD a ciascuna estremità del collegamento, quindi pianificare il tutto due volte.

##### Spazio rack

| Elemento | Unità rack | Necessario |
|------|-----------|--------|
| Switch DZD (Arista 7280CR3A-32S o 7130LBR) | 1U | Ora |
| Appliance di filtraggio perimetrale | 1U | In seguito, solo sui dispositivi edge e ibridi |

**Riservare 2U per DZD.** Un'unità è in uso oggi. Mantenere la seconda libera in modo che l'appliance di filtraggio perimetrale possa essere posizionata accanto allo switch senza spostamenti nel rack. Lasciare spazio per il flusso d'aria e la gestione dei cavi come richiesto dalla propria struttura.

##### Alimentazione

| Elemento | Consumo tipico |
|------|-------------|
| Arista 7280CR3A-32S | ~300 W |
| Ottiche, per 100G QSFP | ~5 W |

**Ordinare 2 kW per DZD, suddivisi su due alimentazioni indipendenti.** Dimensionare ciascuna alimentazione in modo da poter sostenere l'intero carico autonomamente. Lo switch dispone di alimentatori ridondanti e, dopo un guasto di una linea, uno di essi potrebbe essere l'unico rimasto.

2 kW è una misura confortevole piuttosto che risicata. Un DZD con solo switch, che è ciò che esegue quasi ogni deployment oggi, consuma ben meno di 500 W con tutte le ottiche attive. Il resto dei 2 kW è riservato all'appliance di filtraggio perimetrale, che contiene gli FPGA e viene installata successivamente.

!!! warning "Non sovradimensionare l'alimentazione"
    Si paga per la potenza riservata, indipendentemente dal fatto che venga consumata o meno. Un DZD è una singola unità rack di switching, non un chassis di calcolo, quindi consuma molto meno di quanto la sua posizione nel rack potrebbe fornire. Riservare più di 2 kW per DZD significa pagare per capacità inutilizzata.

!!! note "Verificare il proprio hardware prima di ordinare"
    Queste sono cifre indicative dai nostri deployment. Il consumo reale dipende dalla configurazione degli alimentatori, dal numero di porte attivate e dalle ottiche scelte. Verificare rispetto alle specifiche degli alimentatori nel datasheet del produttore per l'hardware esatto acquistato.

    Non ridurre l'ordine al minimo indispensabile. L'alimentazione deve essere disponibile nel rack, e aggiungere una linea successivamente di solito comporta un nuovo ordine presso la struttura, che può richiedere settimane.

---

## Prossimi Passi

Pronti a effettuare il provisioning del vostro primo DZD? Proseguire alla [Guida al Provisioning del Dispositivo](contribute-provisioning.md).