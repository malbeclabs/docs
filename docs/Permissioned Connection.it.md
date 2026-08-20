---
description: Onboarding con permessi per non-validatori e RPC che si connettono a DoubleZero Mainnet-Beta e Testnet in modalità IBRL.
---

# Connessione con Permessi per Non-Validatori a DoubleZero in Modalità IBRL
!!! warning "Connettendomi a DoubleZero accetto i [Termini di Servizio di DoubleZero](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### Panoramica dell'Onboarding per Utenti con Permessi

L'onboarding degli utenti è attualmente soggetto a permessi per non-validatori e RPC. Per avviare il flusso con permessi, compilare [questo modulo](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z). Ecco cosa aspettarsi durante questo processo:

- In futuro potrebbero essere previsti costi associati all'utilizzo da parte degli Utenti con Permessi.
- Dopo l'invio del modulo, monitorare il proprio contatto Telegram principale.

</div>

###  Connessione a Mainnet-Beta e Testnet in Modalità IBRL

!!! Note inline end
    La modalità IBRL non richiede il riavvio dei client validatori, poiché utilizza il vostro indirizzo IP pubblico esistente.

Gli Utenti con Permessi completeranno la connessione a DoubleZero Mainnet-beta, descritta in dettaglio in questa pagina.

## 1. Verificare la rete del client

Seguire le istruzioni di [setup](setup.md) prima di procedere. Installare i pacchetti Mainnet-Beta o Testnet per la rete desiderata — utilizzano repository di pacchetti diversi.

L'ultimo passaggio del setup era disconnettersi dalla rete. Questo per assicurarsi che sulla propria macchina sia aperto un solo tunnel verso DoubleZero, e che quel tunnel sia sulla rete corretta.

Verificare con:

```bash
doublezero status
```

La colonna `Network` dovrebbe corrispondere alla rete a cui si intende unirsi. In caso contrario, utilizzare il comando di cambio copia-incolla nella sezione [risoluzione problemi](troubleshooting.md#issue-wrong-doublezero-environment).

Dopo circa 30 secondi sarà possibile visualizzare i dispositivi DoubleZero disponibili:

```bash
doublezero latency
```
Output di esempio (Testnet)
```bash
 pubkey                                       | code          | ip              | min      | max      | avg      | reachable 
 2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.74ms   | 1.92ms   | 1.84ms   | true      
 ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.88ms   | 4.39ms   | 2.72ms   | true      
 8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.45ms   | 3.30ms   | 2.74ms   | true      
 8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.88ms   | 5.13ms   | 3.02ms   | true      
 uzyg9iYw2FEbtdTHaDb5HoeEWYAPRPQgvsgyd873qPS  | nyc001-dz002  | 4.42.212.122    | 3.17ms   | 3.63ms   | 3.33ms   | true      
 FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.33ms   | 5.46ms   | 3.39ms   | true      
 9oKLaL6Hwno5TyAFutTbbkNrzxm1fw9fhzkiUHgsxgGx | dz-dc10-sw01  | 137.239.200.186 | 6.84ms   | 7.01ms   | 6.91ms   | true      
 DESzDP8GkSTpQLkrUegLkt4S2ynGfZX5bTDzZf3sEE58 | was001-dz002  | 38.88.214.133   | 7.39ms   | 7.44ms   | 7.41ms   | true      
 HHNCpqB7CwHVLxAiB1S86ko6gJRzLCtw78K1tc7ZpT5P | was001-dz001  | 66.198.11.74    | 7.67ms   | 7.85ms   | 7.76ms   | true      
 9LFtjDzohKvCBzSquQD4YtL3HwuvkKBDE7KSzb8ztV2b | dz-mtl11-sw01 | 134.195.161.10  | 9.88ms   | 10.01ms  | 9.95ms   | true      
 9M7FfYYyjM4wGinKPofZRNmQFcCjCKRbXscGBUiXvXnG | dz-tor1-sw01  | 209.42.165.10   | 14.52ms  | 14.53ms  | 14.52ms  | true           
```
L'output del Testnet sarà identico nella struttura, ma con molti più dispositivi disponibili.

## 2. Contattare la DoubleZero Foundation

La DoubleZero Foundation. Sarà necessario fornire il proprio `DoubleZeroID`, il proprio `Validator ID` (ID del nodo) e l'`public ipv4 address` da cui ci si connetterà.


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. Connettersi in Modalità IBRL

Sul server, con l'utente che si connetterà a DoubleZero, eseguire il comando `connect` per stabilire la connessione a DoubleZero.

```bash
doublezero connect ibrl
```

Dovrebbe apparire un output che indica il provisioning, come:

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.184.101.183 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
🔍  Provisioning User for IP: 137.184.101.183
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
✅  User Provisioned
```
Attendere un minuto affinché il tunnel venga completato. Fino al completamento del tunnel, l'output dello stato potrebbe restituire "down" o "Unknown"

Verificare la connessione:

```bash
doublezero status
```

**Output:**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
Uno stato `up` significa che la connessione è stata stabilita con successo.

Sarà possibile visualizzare le rotte propagate da altri utenti su DoubleZero eseguendo:

```
ip route
```
Output:

```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100 
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
...
```

</div>

### Prossimo Passo: Multicast

Se avete completato questa configurazione e prevedete di utilizzare Multicast, procedere alla [pagina successiva](Other%20Multicast%20Connection.md).