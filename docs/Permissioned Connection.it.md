# Connessione con Permesso Non-Validatore a DoubleZero in Modalità IBRL
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "Connettendomi a DoubleZero accetto i [Termini di Servizio DoubleZero](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### Panoramica dell'Onboarding degli Utenti con Permesso

L'onboarding degli utenti è attualmente con permesso per i non-validatori e gli RPC. Per iniziare il flusso con permesso, compila [questo modulo](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z). Ecco cosa aspettarsi durante questo processo:

- In futuro potrebbero essere associate commissioni all'utilizzo degli Utenti con Permesso.
- Dopo l'invio del modulo, monitora il tuo contatto Telegram principale.

</div>

### Connessione a Mainnet-Beta e Testnet in Modalità IBRL

!!! Note inline end
    La modalità IBRL non richiede il riavvio dei client validatori, perché utilizza il tuo indirizzo IP pubblico esistente.

Gli Utenti con Permesso completeranno la connessione a DoubleZero Mainnet-beta, che è dettagliata su questa pagina.

## 1. Configurazione dell'Ambiente

Segui le istruzioni di [setup](setup.md) prima di procedere.

L'ultimo passo del setup era disconnettersi dalla rete. Questo serve a garantire che sia aperto solo un tunnel sulla tua macchina verso DoubleZero, e che quel tunnel sia sulla rete corretta.

Per configurare la CLI DoubleZero Client (`doublezero`) e il daemon (`doublezerod`) per connettersi al **testnet DoubleZero**:
```bash
DESIRED_DOUBLEZERO_ENV=testnet \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```
Per configurare la CLI DoubleZero Client (`doublezero`) e il daemon (`doublezerod`) per connettersi al **mainnet-beta DoubleZero**:
```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Dovresti vedere il seguente output:
```
✅ doublezerod configured for environment mainnet-beta
```
Dovresti vedere il seguente output:
`
✅ doublezerod configured for environment testnet
`

Dopo circa 30 secondi vedrai i dispositivi DoubleZero disponibili:

```bash
doublezero latency
```
Esempio di output (Testnet)
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
</details>


## 2. Contatta la DoubleZero Foundation

La DoubleZero Foundation. Dovrai fornire il tuo `DoubleZeroID`, il tuo `ID Validatore` (node ID) e il `indirizzo IPv4 pubblico` da cui ti connetterai.


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. Connettiti in Modalità IBRL

Sul server, con l'utente che si connetterà a DoubleZero, esegui il comando `connect` per stabilire la connessione a DoubleZero.

```bash
doublezero connect ibrl
```

Dovresti vedere un output che indica il provisioning, come:

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
Attendi un minuto per il completamento del tunnel. Finché il tunnel non è completato, l'output dello stato potrebbe restituire "down" o "Unknown"

Verifica la tua connessione:

```bash
doublezero status
```

**Output:**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
Uno stato `up` significa che sei connesso con successo.

Potrai visualizzare le route propagate da altri utenti su DoubleZero eseguendo:

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

### Passo Successivo: Multicast

Se hai completato questa configurazione e prevedi di usare il Multicast, procedi alla [pagina successiva](Other%20Multicast%20Connection.md).
