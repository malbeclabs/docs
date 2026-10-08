---
description: Attività operative continuative per i contributori DoubleZero — aggiornamento degli agent, aggiornamenti di dispositivi e interfacce, gestione dei link e registrazione degli incidenti.
---

# Guida operativa per i contributori


Questa guida copre le attività operative continuative per la manutenzione dei vostri DoubleZero Device (DZD), inclusi l'aggiornamento degli agent, gli aggiornamenti di dispositivi/interfacce e la gestione dei link.

## Registrazione di incidenti e manutenzioni

Qualsiasi manutenzione pianificata o problema non pianificato relativo a link/dispositivi deve essere registrato nel [portale OPS Management](ops-management.md). Questo offre a tutti i contributori visibilità su ciò che sta accadendo nella rete ed evita indagini duplicate.

- **Interventi pianificati** (ad es. sostituzione di un'ottica, manutenzione programmata del carrier): creare un record di manutenzione prima di iniziare.
- **Problemi non pianificati** (ad es. link down, errori di interfaccia, packet loss): aprire un incidente non appena si inizia a investigare.

Consultare la [guida OPS Management](ops-management.md) per i passaggi di onboarding e come creare i ticket.

---

**Prerequisiti**: Prima di utilizzare questa guida, assicurarsi di aver:

- Completato la [Guida al Provisioning del Dispositivo](provisioning.md)
- Il vostro DZD è completamente operativo con entrambi gli agent Config e Telemetry in esecuzione

---

## Aggiornamenti del dispositivo

Utilizzare `doublezero device update` per modificare le impostazioni del dispositivo dopo il provisioning iniziale.

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**Opzioni di aggiornamento comuni:**

| Opzione | Descrizione |
|---------|-------------|
| `--device-type <TYPE>` | Cambiare la modalità operativa: `hybrid`, `transit`, `edge` (vedi [Tipi di dispositivo](provisioning.md#understanding-device-types)) |
| `--location <LOCATION>` | Spostare il dispositivo in una posizione diversa |
| `--metrics-publisher <PUBKEY>` | Cambiare la chiave del publisher delle metriche |

---

## Aggiornamenti delle interfacce

Utilizzare `doublezero device interface update` per modificare le interfacce esistenti. Questo comando accetta le stesse opzioni di `interface create`.

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

Per l'elenco completo delle opzioni di interfaccia incluse le impostazioni CYOA/DIA, consultare [Creazione delle interfacce](provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices).

**Esempio - Aggiungere impostazioni CYOA a un'interfaccia esistente:**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### Elencare le interfacce

```bash
doublezero device interface list              # All interfaces across all devices
doublezero device interface list <DEVICE>     # Interfaces for a specific device
```

---

## Aggiornamento del Config Agent

Quando viene rilasciata una nuova versione del Config Agent, seguire questi passaggi per l'aggiornamento.

### 1. Scaricare l'ultima versione

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget AGENT_DOWNLOAD_URL
# exit
$ exit
```

### 2. Arrestare l'agent

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 3. Rimuovere la vecchia versione

Per prima cosa, trovare il nome del file della vecchia versione:
```
switch# show extensions
```

Eseguire i seguenti comandi per rimuovere la vecchia versione. Sostituire `<OLD_VERSION>` con la vecchia versione dall'output precedente:
```
switch# delete flash:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. Installare la nuova versione

```
switch# copy flash:AGENT_FILENAME extension:
switch# extension AGENT_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. Riattivare l'agent

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# no shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 6. Verificare l'aggiornamento

Lo Status dovrebbe essere "A, I, B".
```
switch# show extensions
```

### 7. Verificare l'output del log del Config Agent

```
show agent doublezero-agent log
```

---

## Aggiornamento del Telemetry Agent

Quando viene rilasciata una nuova versione del Telemetry Agent, seguire questi passaggi per l'aggiornamento.

### 1. Scaricare l'ultima versione

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget TELEMETRY_DOWNLOAD_URL
# exit
$ exit
```

### 2. Arrestare l'agent

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 3. Rimuovere la vecchia versione

Per prima cosa, trovare il nome del file della vecchia versione:
```
switch# show extensions
```

Eseguire i seguenti comandi per rimuovere la vecchia versione. Sostituire `<OLD_VERSION>` con la vecchia versione dall'output precedente:
```
switch# delete flash:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. Installare la nuova versione

```
switch# copy flash:TELEMETRY_FILENAME extension:
switch# extension TELEMETRY_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. Riattivare l'agent

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# no shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 6. Verificare l'aggiornamento

Lo Status dovrebbe essere "A, I, B".
```
switch# show extensions
```

### 7. Verificare l'output del log del Telemetry Agent

```
show agent doublezero-telemetry log
```

---

## Monitoraggio {#monitoring}

> ⚠️ **Importante:**
>
>  1. Per gli esempi di configurazione seguenti, prestare attenzione al fatto che i vostri agent utilizzino o meno un VRF di management.
>  2. Il configuration agent e il telemetry agent utilizzano la stessa porta di ascolto (:8080) per il loro endpoint delle metriche per impostazione predefinita. Se si abilitano le metriche su entrambi, utilizzare il flag `-metrics-addr` per impostare porte di ascolto univoche per ciascun agent.

### Metriche del Config Agent

Il configuration agent sul dispositivo DoubleZero ha la capacità di esporre metriche compatibili con prometheus impostando il flag `-metrics-enable` nella configurazione del daemon `doublezero-agent`. La porta di ascolto predefinita è tcp/8080 ma può essere modificata per adattarsi all'ambiente tramite `-metrics-addr`:
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

Le seguenti metriche specifiche di DoubleZero sono esposte insieme alle metriche runtime specifiche di go:
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

#### Errori ad alto impatto

- `up` - Questa è la metrica di serie temporale generata automaticamente da prometheus se l'istanza di scrape è attiva e raggiungibile. In caso contrario, l'agent non è raggiungibile oppure non è in esecuzione.
- `doublezero_agent_apply_config_errors_total` - La configurazione che l'agent sta tentando di applicare è fallita. In questa situazione, gli utenti non potranno effettuare l'onboarding sul dispositivo e le modifiche di configurazione onchain non verranno applicate fino alla risoluzione del problema.
- `doublezero_agent_get_config_errors_total` - Questo segnala che il configuration agent locale non riesce a comunicare con il controller DoubleZero. Nella maggior parte dei casi, ciò può essere dovuto a un problema con la connettività di management sul dispositivo. Come per la metrica precedente, gli utenti non potranno effettuare l'onboarding sul dispositivo e le modifiche di configurazione onchain non verranno applicate fino alla risoluzione del problema.

### Metriche del Telemetry Agent

Il telemetry agent sul dispositivo DoubleZero ha la capacità di esporre metriche compatibili con prometheus impostando il flag `-metrics-enable` nella configurazione del daemon `doublezero-telemetry`. La porta di ascolto predefinita è tcp/8080 ma può essere modificata per adattarsi all'ambiente tramite `-metrics-addr`:
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

Le seguenti metriche specifiche di DoubleZero sono esposte insieme alle metriche runtime specifiche di go:
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

#### Errori ad alto impatto

- `up` - Questa è la metrica di serie temporale generata automaticamente da prometheus se l'istanza di scrape è attiva e raggiungibile. In caso contrario, l'agent non è raggiungibile oppure non è in esecuzione.
- `doublezero_device_telemetry_agent_errors_total` con un `error_type` di `submitter_failed_to_write_samples` - Questo è un segnale che il telemetry agent non riesce a scrivere i campioni onchain, il che potrebbe essere dovuto a problemi di connettività di management sul dispositivo.

---

## Gestione dei link

### Draining dei link {#link-draining}

Il draining dei link consente ai contributori di rimuovere con grazia un link dal servizio attivo per manutenzione o troubleshooting. Esistono due stati di drain:

| Stato | Comportamento IS-IS | Descrizione |
|-------|---------------------|-------------|
| `soft-drained` | Metrica impostata a 1.000.000 | Il link è deprioritizzato. Il traffico utilizzerà percorsi alternativi se disponibili, ma utilizzerà comunque questo link se è l'unica opzione. |
| `hard-drained` | Impostato su passive | Il link è completamente rimosso dal routing. Nessun traffico attraverserà questo link. |

### Transizioni di stato

Le seguenti transizioni di stato sono consentite:

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (must go through soft-drained first)
```

> ⚠️ **Nota:**
> Non è possibile passare direttamente da `hard-drained` ad `activated`. È necessario prima transitare a `soft-drained`, poi ad `activated`.

### Soft Drain di un link

Il soft draining deprioritizza un link impostando la sua metrica IS-IS a 1.000.000. Il traffico preferirà percorsi alternativi ma può comunque utilizzare questo link se necessario.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### Hard Drain di un link

L'hard draining rimuove completamente il link dal routing impostando IS-IS in modalità passive. Nessun traffico attraverserà questo link.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### Ripristinare un link allo stato attivo

Per riportare un link drenato al funzionamento normale:

```bash
# From soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# From hard-drained (must go through soft-drained first)
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