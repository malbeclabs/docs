---
description: Attività operative continuative per i contributori DoubleZero — aggiornamento degli agent, aggiornamenti di dispositivi e interfacce, gestione dei link e registrazione degli incidenti.
---

# Guida operativa per i contributori


Questa guida copre le attività operative continuative per la manutenzione dei tuoi DoubleZero Device (DZD), inclusi gli aggiornamenti degli agent, gli aggiornamenti di dispositivi/interfacce e la gestione dei link.

## Registrazione incidenti e manutenzione

Qualsiasi manutenzione pianificata o problema non pianificato relativo a link/dispositivi deve essere registrato nel [portale OPS Management](contribute-ops-management.md). Questo garantisce a tutti i contributori visibilità su ciò che accade nella rete ed evita indagini duplicate.

- **Lavori pianificati** (es. sostituzione di un'ottica, manutenzione programmata del carrier): crea un record di manutenzione prima di iniziare.
- **Problemi non pianificati** (es. link down, errori di interfaccia, perdita di pacchetti): apri un incidente non appena inizi l'indagine.

Consulta la [guida OPS Management](contribute-ops-management.md) per le procedure di onboarding e la creazione dei ticket.

---

**Prerequisiti**: Prima di utilizzare questa guida, assicurati di aver:

- Completato la [Guida al Provisioning dei Dispositivi](contribute-provisioning.md)
- Il tuo DZD è completamente operativo con entrambi gli agent Config e Telemetry in esecuzione

---

## Aggiornamenti del dispositivo

Usa `doublezero device update` per modificare le impostazioni del dispositivo dopo il provisioning iniziale.

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**Opzioni di aggiornamento comuni:**

| Opzione | Descrizione |
|---------|-------------|
| `--device-type <TYPE>` | Cambia la modalità operativa: `hybrid`, `transit`, `edge` (vedi [Tipi di dispositivo](contribute-provisioning.md#understanding-device-types)) |
| `--location <LOCATION>` | Sposta il dispositivo in una posizione diversa |
| `--metrics-publisher <PUBKEY>` | Cambia la chiave del metrics publisher |

---

## Aggiornamenti delle interfacce

Usa `doublezero device interface update` per modificare le interfacce esistenti. Questo comando accetta le stesse opzioni di `interface create`.

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

Per l'elenco completo delle opzioni di interfaccia, incluse le impostazioni CYOA/DIA, vedi [Creazione delle interfacce](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices).

**Esempio - Aggiungere impostazioni CYOA a un'interfaccia esistente:**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### Elenco delle interfacce

```bash
doublezero device interface list              # Tutte le interfacce su tutti i dispositivi
doublezero device interface list <DEVICE>     # Interfacce per un dispositivo specifico
```

---

## Aggiornamento del Config Agent

Quando viene rilasciata una nuova versione del Config Agent, segui questi passaggi per l'aggiornamento.

### 1. Scarica l'ultima versione

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget AGENT_DOWNLOAD_URL
# exit
$ exit
```

### 2. Arresta l'agent

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 3. Rimuovi la vecchia versione

Prima, trova il nome del file della vecchia versione:
```
switch# show extensions
```

Esegui i seguenti comandi per rimuovere la vecchia versione. Sostituisci `<OLD_VERSION>` con la vecchia versione dall'output precedente:
```
switch# delete flash:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. Installa la nuova versione

```
switch# copy flash:AGENT_FILENAME extension:
switch# extension AGENT_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. Riavvia l'agent

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# no shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 6. Verifica l'aggiornamento

Lo Status dovrebbe essere "A, I, B".
```
switch# show extensions
```

### 7. Verifica l'output del log del Config Agent

```
show agent doublezero-agent log
```

---

## Aggiornamento del Telemetry Agent

Quando viene rilasciata una nuova versione del Telemetry Agent, segui questi passaggi per l'aggiornamento.

### 1. Scarica l'ultima versione

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget TELEMETRY_DOWNLOAD_URL
# exit
$ exit
```

### 2. Arresta l'agent

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 3. Rimuovi la vecchia versione

Prima, trova il nome del file della vecchia versione:
```
switch# show extensions
```

Esegui i seguenti comandi per rimuovere la vecchia versione. Sostituisci `<OLD_VERSION>` con la vecchia versione dall'output precedente:
```
switch# delete flash:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. Installa la nuova versione

```
switch# copy flash:TELEMETRY_FILENAME extension:
switch# extension TELEMETRY_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. Riavvia l'agent

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# no shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 6. Verifica l'aggiornamento

Lo Status dovrebbe essere "A, I, B".
```
switch# show extensions
```

### 7. Verifica l'output del log del Telemetry Agent

```
show agent doublezero-telemetry log
```

---

## Monitoraggio

> ⚠️ **Importante:**
>
>  1. Per gli esempi di configurazione seguenti, presta attenzione al fatto che i tuoi agent stiano utilizzando o meno un VRF di gestione.
>  2. Il configuration agent e il telemetry agent utilizzano la stessa porta di ascolto (:8080) per il loro endpoint di metriche per impostazione predefinita. Se stai abilitando le metriche su entrambi, usa il flag `-metrics-addr` per impostare porte di ascolto univoche per ciascun agent.

### Metriche del Config Agent

Il configuration agent sul dispositivo DoubleZero ha la capacità di esporre metriche compatibili con Prometheus impostando il flag `-metrics-enable` nella configurazione del daemon `doublezero-agent`. La porta di ascolto predefinita è tcp/8080, ma può essere modificata per adattarsi all'ambiente tramite `-metrics-addr`:
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

Le seguenti metriche specifiche di DoubleZero vengono esposte insieme alle metriche di runtime specifiche di Go:
```
$ curl -s 10.0.0.11:2112/metrics | grep doublezero

# HELP doublezero_agent_apply_config_errors_total Number of errors encountered while applying config to the device
# TYPE doublezero_agent_apply_config_errors_total counter
doublezero_agent_apply_config_errors_total 0

# HELP doublezero_agent_bgp_neighbors_errors_total Number of errors encountered while retrieving BGP neighbors from the device
# TYPE doublezero_agent_bgp_neighbors_errors_total counter
doublezero_agent_bgp_neighbors_errors_total 0

# HELP doublezero_agent_build_info Build information of the agent
# TYPE doublezero_agent_build_info gauge
doublezero_agent_build_info{commit="4378018f",date="2025-09-23T14:07:48Z",version="0.6.5~git20250923140746.4378018f"} 1

# HELP doublezero_agent_get_config_errors_total Number of errors encountered while getting config from the controller
# TYPE doublezero_agent_get_config_errors_total counter
doublezero_agent_get_config_errors_total 0
```

#### Errori ad alto segnale

- `up` - Questa è la metrica time series generata automaticamente da Prometheus se l'istanza di scrape è sana e raggiungibile. Se non lo è, l'agent non è raggiungibile oppure non è in esecuzione.
- `doublezero_agent_apply_config_errors_total` - La configurazione che l'agent sta tentando di applicare è fallita. In questa situazione, gli utenti non potranno eseguire l'onboarding sul dispositivo e le modifiche alla configurazione on-chain non saranno applicate fino alla risoluzione del problema.
- `doublezero_agent_get_config_errors_total` - Questo indica che il configuration agent locale non riesce a comunicare con il controller DoubleZero. Nella maggior parte dei casi, ciò può essere dovuto a un problema con la connettività di gestione sul dispositivo. Come per la metrica precedente, gli utenti non potranno eseguire l'onboarding sul dispositivo e le modifiche alla configurazione on-chain non saranno applicate fino alla risoluzione del problema.

### Metriche del Telemetry Agent

Il telemetry agent sul dispositivo DoubleZero ha la capacità di esporre metriche compatibili con Prometheus impostando il flag `-metrics-enable` nella configurazione del daemon `doublezero-telemetry`. La porta di ascolto predefinita è tcp/8080, ma può essere modificata per adattarsi all'ambiente tramite `-metrics-addr`:
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

Le seguenti metriche specifiche di DoubleZero vengono esposte insieme alle metriche di runtime specifiche di Go:
```
$ curl -s 10.0.0.11:2113/metrics | grep doublezero

# HELP doublezero_device_telemetry_agent_build_info Build information of the device telemetry agent
# TYPE doublezero_device_telemetry_agent_build_info gauge
doublezero_device_telemetry_agent_build_info{commit="4378018f",date="2025-09-23T14:07:45Z",version="0.6.5~git20250923140743.4378018f"} 1

# HELP doublezero_device_telemetry_agent_errors_total Number of errors encountered
# TYPE doublezero_device_telemetry_agent_errors_total counter
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_program_load"} 7
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_write_samples"} 8
doublezero_device_telemetry_agent_errors_total{error_type="collector_submit_samples_on_close"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_getting_local_interfaces"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_finding_local_tunnel"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_link_tunnel_net_invalid"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_initialize_account"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_retries_exhausted"} 0

# HELP doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels Number of local tunnel interfaces not found during peer discovery
# TYPE doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels gauge
doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels{local_device_pk="8PQkip3CxWhQTdP7doCyhT2kwjSL2csRTdnRg2zbDPs1"} 0
```

#### Errori ad alto segnale

- `up` - Questa è la metrica time series generata automaticamente da Prometheus se l'istanza di scrape è sana e raggiungibile. Se non lo è, l'agent non è raggiungibile oppure non è in esecuzione.
- `doublezero_device_telemetry_agent_errors_total` con `error_type` uguale a `submitter_failed_to_write_samples` - Questo indica che il telemetry agent non riesce a scrivere i campioni on-chain, il che potrebbe essere dovuto a problemi di connettività di gestione sul dispositivo.

---

## Gestione dei link

### Drenaggio dei link

Il drenaggio dei link consente ai contributori di rimuovere in modo controllato un link dal servizio attivo per manutenzione o risoluzione dei problemi. Esistono due stati di drenaggio:

| Stato | Comportamento IS-IS | Descrizione |
|-------|---------------------|-------------|
| `soft-drained` | Metrica impostata a 1.000.000 | Il link è deprioritizzato. Il traffico utilizzerà percorsi alternativi se disponibili, ma continuerà a usare questo link se è l'unica opzione. |
| `hard-drained` | Impostato su passive | Il link è completamente rimosso dal routing. Nessun traffico attraverserà questo link. |

### Transizioni di stato

Sono consentite le seguenti transizioni di stato:

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (deve prima passare per soft-drained)
```

> ⚠️ **Nota:**
> Non è possibile passare direttamente da `hard-drained` ad `activated`. È necessario prima transitare a `soft-drained`, poi ad `activated`.

### Soft drain di un link

Il soft drain deprioritizza un link impostando la sua metrica IS-IS a 1.000.000. Il traffico preferirà percorsi alternativi ma potrà comunque utilizzare questo link se necessario.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### Hard drain di un link

L'hard drain rimuove completamente il link dal routing impostando IS-IS in modalità passive. Nessun traffico attraverserà questo link.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### Ripristino di un link allo stato attivo

Per riportare un link drenato al funzionamento normale:

```bash
# Da soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# Da hard-drained (deve prima passare per soft-drained)
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### Override del ritardo

La funzionalità di override del ritardo consente ai contributori di modificare temporaneamente il ritardo effettivo di un link senza alterare il valore di ritardo effettivamente misurato. Questo è utile per declassare temporaneamente un link da percorso primario a secondario.

### Impostare un override del ritardo

Per sovrascrivere il ritardo di un link (rendendolo meno preferito nel routing):

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

I valori validi vanno da `0.01` a `1000` millisecondi.

### Rimuovere un override del ritardo

Per rimuovere l'override e tornare a utilizzare il ritardo effettivamente misurato:

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **Nota:**
> Quando un link è in stato soft-drained, sia `delay_ms` che `delay_override_ms` vengono sovrascritti a 1000ms (1 secondo) per garantire la deprioritizzazione.