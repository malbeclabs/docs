---
description: Guida alla connessione con permessi per gli utenti del Testnet Shelby che si connettono a DoubleZero in modalità IBRL.
---

# Shelby
!!! warning "Connettendomi a DoubleZero accetto i [Termini di Servizio di DoubleZero](https://doublezero.xyz/terms-protocol)"

### Ottieni il tuo DoubleZeroID

Dovrai fornire il tuo `DoubleZeroID` e il `public ipv4 address` tramite questo [modulo](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)


- In futuro potrebbero essere previsti costi associati all'utilizzo come Utente con Permessi.
- Dopo l'invio del modulo, monitora il tuo contatto Telegram principale.
- Al momento Shelby è in grado di connettersi solo al Testnet di DoubleZero.


### Connessione al Testnet in Modalità IBRL

Gli utenti con permessi Shelby completeranno la connessione al Testnet di DoubleZero, come descritto in questa pagina.

## 1. Configurazione dell'Ambiente

Segui le istruzioni di [configurazione](setup.md) prima di procedere.

L'ultimo passaggio della configurazione consisteva nel disconnettersi dalla rete. Questo per assicurarsi che sulla tua macchina sia aperto un solo tunnel verso DoubleZero, e che tale tunnel sia sulla rete corretta.

Per configurare la CLI del Client DoubleZero (`doublezero`) per connettersi al tenant Shelby su DoubleZero:
```bash
doublezero config set --tenant shelby
```

Applica regole Firewall aggiuntive specifiche per Shelby:

iptables:
```
sudo iptables -A INPUT -i doublezero0 -p tcp --dport 39431 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 39431 -j DROP
```

UFW:
```
sudo ufw allow in on doublezero0 to any port 39431 proto tcp
sudo ufw deny in to any port 39431 proto tcp
```

## 2. Contatta la Fondazione DoubleZero

La fondazione DoubleZero. Dovrai fornire il tuo `DoubleZeroID` e il `public ipv4 address` da cui ti connetterai.


## 3. Connessione in Modalità IBRL

Sul server, con l'utente che si connetterà a DoubleZero, esegui il comando `connect` per stabilire la connessione a DoubleZero.

```bash
doublezero connect ibrl
```

Dovresti vedere un output che indica il provisioning, come ad esempio:

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
Attendi un minuto affinché il tunnel venga completato. Fino al completamento del tunnel, l'output dello stato potrebbe restituire "down" o "Unknown"

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

Potrai visualizzare le rotte propagate da altri utenti su DoubleZero eseguendo:

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