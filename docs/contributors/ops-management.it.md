---
description: Utilizza il portale OPS Management di DoubleZero per registrare e monitorare incidenti di rete e manutenzioni pianificate.
---

# OPS Management

Il portale OPS Management di DoubleZero è il luogo in cui i contributor registrano e monitorano incidenti (interruzioni non pianificate) e manutenzioni (interventi pianificati) sull'intera rete. Tutti i ticket sono visibili a tutti i contributor.

**Portale:** [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management)

## Portale vs Slack

Il portale OPS Management e Slack lavorano insieme. Tutti gli incidenti e le manutenzioni vengono tracciati come ticket, accessibili tramite il portale o l'API. Ogni ticket notifica automaticamente i canali Slack appropriati e offre a ogni contributor una visione condivisa di ciò che sta accadendo sulla rete. Slack è il luogo della conversazione: condivisione di log, coordinamento con altri contributor e collaborazione su problemi attivi.

I ticket sono il registro ufficiale, che siano creati tramite il portale o l'API. I thread di Slack non lo sono: non aggiornano lo stato del ticket e non vengono archiviati in modo permanente. Mantieni sempre aggiornato lo stato del ticket, anche se la conversazione avviene su Slack.

Il portale e Slack servono a scopi diversi. Usa entrambi, ma per le cose giuste.

| Usa il portale (o l'API) per... | Usa Slack per... |
|-------------------------------|-----------------|
| Aprire, aggiornare e chiudere ticket | Conversazione e collaborazione su un problema attivo |
| Registrare le transizioni di stato | Condividere log, screenshot o avviare una chiamata |
| Assegnare o escalare un ticket | Attirare rapidamente l'attenzione su un problema |
| Impostare la root cause alla chiusura | Coordinarsi con altri contributor |



---

## Onboarding

Completa questi passaggi una sola volta prima di utilizzare il portale.

### 1. Imposta la Tua Ops Manager Key

Registra una pubkey di un wallet Solana come Ops Manager key. Wallet supportati: Phantom, Solflare, Coinbase Wallet.

```bash
doublezero contributor update \
  --ops-manager <OPS_MANAGER_PUBKEY> \
  --pubkey <CONTRIBUTOR_PUBKEY>
```

### 2. Collega il Tuo Wallet sul Portale

1. Vai su [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management).
2. Clicca su **Connect Your Wallet** e seleziona il tuo wallet.
3. Firma il messaggio per dimostrare la proprietà della tua Ops Manager key.

Una volta autenticato, viene mostrata la **Incident Tracking Table**.

Le impostazioni dell'account si trovano nel menu **Settings** (l'icona a forma di ingranaggio, in alto a destra): API Key Management, User Management ed Escalation Contacts. Le opzioni visualizzate dipendono dal tuo ruolo.

### 3. Crea API Key (Opzionale)

Per l'accesso programmatico al posto del modulo web:

1. Apri il menu **Settings** (icona a forma di ingranaggio) e scegli **API Key Management**.
2. Crea una o più API key.
3. Scarica la documentazione dell'API da questa pagina.

---

## Incidenti

Un incidente è un evento non pianificato che impatta il servizio.

### Livelli di Severità {#severity-levels}

Assegna la severità in base all'impatto sulla rete DoubleZero. Puoi aggiornare la severità man mano che la situazione evolve.

| Severità | Impatto | Risposta |
|----------|--------|----------|
| `sev1` | Interruzione totale o grave rottura del piano di controllo/dati senza fallback | Lascia tutto immediatamente, anche fuori orario lavorativo. Escala immediatamente alla DoubleZero Foundation. |
| `sev2` | Impatto parziale ma sostanziale; servizio degradato con possibile fallback | Tratta come urgente. Coordinati attivamente. Risposta notturna richiesta per degradazioni prolungate. |
| `sev3` | Impatto limitato o non visibile agli utenti; potenziale escalation se non risolto | Massima priorità durante l'orario lavorativo. Monitora attentamente. Nessuna escalation fuori orario necessaria a meno che l'impatto non aumenti. |

??? note "Esempi di severità"

    **Esempi Sev1**

    - Più del 10% del traffico utente in blackhole su DoubleZero, senza fallback su internet pubblico
    - Più dell'80% dei tentativi di onboarding, connessione o disconnessione degli utenti in errore
    - Più del 20% dei DZD che riportano errori di interfaccia
    - Controller che restituisce configurazioni valide ma errate agli agenti DZD

    **Esempi Sev2**

    - Più del 20% degli utenti impossibilitati a inviare/ricevere traffico sui tunnel DoubleZero, ma con fallback su internet pubblico
    - 0–10% del traffico utente in blackhole su DoubleZero senza fallback
    - 20–80% dei nuovi tentativi di onboarding, connessione o disconnessione degli utenti in errore
    - Più del 20% degli agenti di configurazione che non riescono ad applicare la configurazione DZD
    - 0–20% dei DZD che riportano errori di interfaccia
    - Problemi upstream che causano perdita di osservabilità (monitoring/alerting non funzionanti)
    - Pipeline dati onchain non funzionante o che produce dati errati
    - Più del 20% della raccolta o invio di latenza internet in errore
    - Controller irraggiungibile dagli agenti DZD
    - Controller che restituisce configurazioni non valide ai DZD che non verranno applicate

    **Esempi Sev3**

    - 0–20% degli utenti impossibilitati a inviare/ricevere traffico sui tunnel DoubleZero, con fallback su internet pubblico
    - 0–20% dei DZD che riportano errori di interfaccia
    - 0–20% dei DZD che riscontrano errori dell'agente di configurazione
    - 0–20% dei tentativi di onboarding, connessione o disconnessione degli utenti in errore
    - Più del 20% della raccolta o invio di latenza internet in errore per un singolo fornitore di dati
    - 0–20% della raccolta o invio di latenza internet in errore per tutti i fornitori di dati
    - Bug o debito tecnico che causano rumore negli alert impossibile da silenziare
    - DIA non funzionante o problemi di networking RPC del ledger per lo 0–20% dei dispositivi per diverse ore
    - Problemi a basso impatto come bug minori, errori cosmetici o incidenti isolati che non impattano il traffico dei clienti
    - Piccola percentuale di dispositivi che riportano errori intermittenti senza interruzione del servizio

### Apertura di un Incidente

Clicca **Create New Record**, seleziona Type = **Incident** sul portale, oppure invia tramite l'API.

**Obbligatorio:**

| Campo | Descrizione |
|-------|-------------|
| `title` | Breve riepilogo (massimo 100 caratteri) |
| `description` | Spiegazione dettagliata (massimo 500 caratteri) |
| `severity` | `sev1`, `sev2` o `sev3` |
| `status` | Non può essere impostato su uno stato terminale (`resolved`, `closed`) alla creazione |
| Device e/o Link | Almeno uno obbligatorio. Sul modulo web, seleziona dal menu a tendina dei codici dei tuoi dispositivi e link. Quando usi l'API, passa le pubkey corrispondenti come `device_pubkey` e/o `affected_link_pubkey`. |

**Opzionale:**

| Campo | Descrizione |
|-------|-------------|
| `reporter_name` / `reporter_email` | I tuoi dati di contatto |
| `assignee` | Chi è responsabile della risoluzione |
| `internal_reference` | Il tuo ID ticket interno (es. Jira, ServiceNow) |
| `start_at` | Predefinito all'ora di creazione; modificabile |

Una volta creato, una notifica viene pubblicata nel canale Slack degli incidenti dei contributor con l'ID del ticket, la severità, i dispositivi/link interessati e il nome del contributor.

### Aggiornamento di un Incidente

Man mano che l'incidente progredisce, mantieni aggiornato lo stato del ticket. Questo è il segnale che altri contributor e DZ usano per capire su cosa si sta lavorando.

| Stato | Quando impostarlo |
|--------|----------------|
| `open` | Stato iniziale: problema segnalato, non ancora in lavorazione |
| `acknowledged` | Lo hai visto e ne hai preso la responsabilità |
| `investigating` | Diagnosi attiva: raccolta log, verifica metriche |
| `mitigating` | Root cause nota o sospettata; applicazione di un fix o workaround |
| `monitoring` | Fix applicato; in osservazione per confermare che regge |
| `resolved` | Problema confermato come risolto; **root cause obbligatoria** |
| `closed` | Completamente concluso; nessuna ulteriore azione; **root cause obbligatoria** |

```
open → acknowledged → investigating → mitigating → monitoring → resolved → closed
```

Puoi saltare degli stati se appropriato. Ad esempio, passa direttamente da `open` a `investigating` se inizi a lavorarci immediatamente. Usa sempre lo stato più accurato per la situazione corrente.

Ogni aggiornamento di stato pubblica una risposta nel thread della notifica Slack originale.

### Chiusura di un Incidente

Per portare un incidente a `resolved` o `closed`, è necessario impostare una **root cause**. Puoi impostare la root cause in qualsiasi fase precedente se la conosci già; diventa obbligatoria alla chiusura.

| Codice | Descrizione |
|------|-------------|
| `hardware` | Riparazione, sostituzione o aggiornamento hardware (SFP, NIC, cavo, dispositivo) |
| `software` | Fix, aggiornamento o riavvio software o firmware |
| `configuration` | Modifica, correzione o rollback della configurazione |
| `capacity` | Congestione, limiti di capacità o gestione del traffico |
| `carrier` | Problema del fornitore di circuiti, lunghezze d'onda o cross-connect |
| `network_external` | Problema di rete esterno al di fuori del controllo del contributor |
| `facility` | Problema infrastrutturale del datacenter (alimentazione, raffreddamento) |
| `fiber_cut` | Danno fisico alla fibra riparato |
| `security` | Incidente di sicurezza mitigato |
| `human_error` | Errore operativo corretto |
| `false_positive` | Nessun problema reale trovato dopo l'indagine |
| `duplicate` | Già tracciato in un altro ticket |
| `self_resolved` | Problema risolto senza intervento |
| `dz_managed` | Problema con un componente software gestito da DoubleZero (activator, controller, ecc.) |

---

## Manutenzione

Un record di manutenzione è un'attività pianificata e limitata nel tempo che può influire sulla disponibilità. Crealo in anticipo in modo che gli altri contributor possano vederlo ed evitare finestre in conflitto.

### Pianificazione della Manutenzione

Clicca **Create New Record** > **Maintenance** sul portale, oppure invia tramite l'API.

**Obbligatorio:**

| Campo | Descrizione |
|-------|-------------|
| `title` | Breve riepilogo (massimo 100 caratteri) |
| `description` | Spiegazione dettagliata (massimo 500 caratteri) |
| `severity` | `sev1`, `sev2` o `sev3`. Impostala in base all'impatto previsto sugli utenti (vedi nota sotto). |
| `start_at` | Ora di inizio pianificata (UTC) |
| `end_at` | Ora di fine pianificata (UTC); deve essere successiva a `start_at` |
| Device e/o Link | Almeno uno obbligatorio. Sul modulo web, seleziona dal menu a tendina dei codici dei tuoi dispositivi e link. Quando usi l'API, passa le pubkey corrispondenti come `device_pubkey` e/o `affected_link_pubkey`. |

La severità si applica alla manutenzione nello stesso modo in cui si applica agli incidenti. Impostala in base all'impatto sugli utenti previsto durante la finestra, utilizzando i [livelli di severità sopra indicati](#severity-levels).

Una volta creato, una notifica viene pubblicata nel canale Slack delle manutenzioni dei contributor con l'ID del ticket, i dispositivi/link interessati, la finestra pianificata e il nome del contributor.

### Gestione dello Stato della Manutenzione

Mantieni aggiornato lo stato man mano che la finestra procede.

| Stato | Quando impostarlo |
|--------|----------------|
| `planned` | Pianificata, non ancora iniziata |
| `in-progress` | Il lavoro è iniziato |
| `completed` | Lavoro completato con successo |
| `closed` | Impostato automaticamente 24 ore dopo `end_at` |
| `cancelled` | Annullata prima o durante l'esecuzione |

```
planned → in-progress → completed → closed (auto 24h after end_at)
    ↓          ↓
    └──────────┴──→ cancelled
```

---

## Contatti di Escalation

I contatti di escalation indicano a DoubleZero e agli altri contributor chi contattare quando la tua parte della rete ha un problema. Configuri i tuoi contatti per la tua organizzazione. Un contatto può essere una persona o un team, come il tuo NOC. Ogni contatto ha uno o più modi per essere raggiunto e un programma che indica quando è di turno.

Apri il menu **Settings** (icona a forma di ingranaggio) e scegli **Escalation Contacts**. Solo gli ops manager possono aggiungere o modificare contatti.

### Aggiunta di un Contatto

Per ogni contatto, imposta:

| Campo | Descrizione |
|-------|-------------|
| Name | Un nome per il contatto, che sia una persona o un team come il tuo NOC |
| Timezone | Il fuso orario locale, usato per leggere il programma |
| Availability | **24/7**, oppure una o più fasce orarie settimanali in cui il contatto è di turno |
| Contact methods | Uno o più modi per raggiungere il contatto, in ordine di priorità |

I metodi di contatto supportati sono email, telefono, Slack, Telegram e WhatsApp. L'ordine conta: il primo metodo è quello da provare per primo.

### Disponibilità e Lacune di Copertura

Un contatto è disponibile 24 ore su 24, 7 giorni su 7 (24/7), oppure disponibile durante fasce orarie settimanali che definisci tu, ad esempio dal lunedì al venerdì, dalle 09:00 alle 17:00. Le fasce vengono inserite nel fuso orario locale del contatto e mostrate in UTC, quindi l'ora legale viene gestita automaticamente.

La vista **coverage gaps** mostra i momenti di ogni settimana in cui nessuno della tua organizzazione è di turno. Usala per individuare e colmare le lacune.

### Finestre di Rotazione

La settimana è suddivisa in finestre di mezz'ora. Per ogni finestra puoi impostare l'ordine in cui i tuoi contatti vengono raggiunti. Questo ti permette di gestire una rotazione di reperibilità senza modificare ogni singolo contatto.

### Visibilità

Controlli tu chi può vedere i tuoi contatti. DoubleZero può sempre vederli. Tu scegli chi altro può:

| Impostazione | Chi altro può vedere i tuoi contatti |
|---------|-------------------------------|
| Solo DoubleZero (predefinito) | Nessun altro contributor |
| Tutti | Tutti i contributor |
| Alcuni contributor | Solo i contributor che selezioni |

Il tuo team può sempre vedere i tuoi contatti. La visibilità viene impostata una volta per l'intera organizzazione e si applica a tutti i tuoi contatti.

---

## Gestione Utenti

Per impostazione predefinita, la tua Ops Manager key è l'unico account che può agire per conto della tua organizzazione. Puoi aggiungere membri del team in modo che più di una persona possa gestire i tuoi ticket.

Apri il menu **Settings** (icona a forma di ingranaggio) e scegli **User Management**. Solo gli ops manager possono aggiungere o rimuovere membri del team.

Per ogni membro del team, imposta:

| Campo | Descrizione |
|-------|-------------|
| Name | Il nome della persona |
| Wallet pubkey | Il wallet Solana con cui effettua l'accesso |
| Access level | **Read** o **Read-write** |

Livelli di accesso:

- **Read**: può visualizzare ticket e contatti di escalation e creare API key di sola lettura. Non può creare, aggiornare o chiudere ticket.
- **Read-write**: accesso completo per creare, aggiornare e chiudere ticket, e può creare API key di qualsiasi livello.

Ogni membro del team accede con il proprio wallet, nello stesso modo in cui hai collegato la tua Ops Manager key.

---

## Permessi ed Escalation

### Cosa Possono Fare i Contributor

- Creare e gestire ticket solo per i propri dispositivi e link.
- Assegnare ticket a se stessi o escalare a DZ/Malbeclabs.
- Visualizzare tutti i ticket di tutti i contributor.
- Aggiungere membri del team e impostare il loro livello di accesso (solo ops manager).
- Gestire i contatti di escalation per la propria organizzazione (solo ops manager).

### Cosa Possono Fare gli Admin DZ/Malbeclabs

- Creare ticket per i dispositivi e link di qualsiasi contributor.
- Assegnare o riassegnare ticket tra contributor.
- Gestire escalation e richieste di supporto.

### Proprietà dei Link DZX

I link DZX collegano dispositivi di due contributor diversi. Il contributor **A-side** (primo dispositivo nel nome del link) è il proprietario del link ed è l'unico che può creare ticket per esso.

**Esempio:** Per il link `deviceA:deviceB`, il contributor proprietario di `deviceA` è il proprietario del link.

**Se il problema è sull'Z-side:**

1. Il contributor A-side crea un ticket per il link DZX.
2. Assegna il ticket a DZ/Malbeclabs.
3. DZ/Malbeclabs indaga e riassegna al contributor Z-side se necessario.

Riconosciamo che questo flusso di lavoro è limitato. I contributor Z-side attualmente non possono creare ticket per link DZX di cui non sono proprietari, il che significa che il coordinamento deve passare attraverso DZ/Malbeclabs. Stiamo lavorando per migliorare questa situazione in modo che entrambi i lati di un link DZX possano dichiarare incidenti e manutenzioni in modo indipendente.