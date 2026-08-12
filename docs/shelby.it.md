# Connessione a DoubleZero in Modalità IBRL per Utenti Shelby Testnet
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "Connettendomi a DoubleZero accetto i [Termini di Servizio DoubleZero](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### Ottieni il tuo DoubleZeroID

Dovrai fornire il tuo `DoubleZeroID` e il `indirizzo IPv4 pubblico` in questo [modulo](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)


- In futuro potrebbero essere associate commissioni all'utilizzo degli Utenti con Permesso.
- Dopo l'invio del modulo, monitora il tuo contatto Telegram principale.
- Al momento Shelby può connettersi solo al Testnet DoubleZero.

</div>

### Connessione al Testnet in Modalità IBRL

Gli utenti con permesso Shelby completeranno la connessione al Testnet DoubleZero, che è dettagliata su questa pagina.

## 1. Configurazione dell'Ambiente

Segui le istruzioni di [setup](setup.md) prima di procedere.

L'ultimo passo del setup era disconnettersi dalla rete. Questo serve a garantire che sia aperto solo un tunnel sulla tua macchina verso DoubleZero, e che quel tunnel sia sulla rete corretta.

Per configurare la CLI DoubleZero Client (`doublezero`) per connettersi al tenant Shelby su DoubleZero:
```bash
doublezero config set --tenant shelby
```

Applica regole firewall aggiuntive specifiche per Shelby:

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

## 2. Contatta la DoubleZero Foundation

La DoubleZero Foundation. Dovrai fornire il tuo `DoubleZeroID` e il `indirizzo IPv4 pubblico` da cui ti connetterai.


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
