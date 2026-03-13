# Altra Connessione Multicast
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "Connettendomi a DoubleZero accetto i [Termini di Servizio DoubleZero](https://doublezero.xyz/terms-protocol)"


|Caso d'Uso | Primo Passo | Quando approvato, connettiti tramite:|
|---------|------------|---------------------------|
|Iscriversi a Jito Shredstream | Contatta Jito per l'approvazione. | ```doublezero connect multicast --subscribe jito-shredstream``` |

Informazioni dettagliate sulla connessione:

### 1. Installazione Client DoubleZero
Segui le istruzioni di [setup](setup.md) per installare e configurare il client DoubleZero.

### 2. Istruzioni di Connessione

Connettiti a DoubleZero in Modalità Multicast
Come publisher:

```doublezero connect multicast --publish <nome feed>```

o come subscriber:

```doublezero connect multicast --subscribe <nome feed>```

o per pubblicare e sottoscrivere:

```doublezero connect multicast --publish <nome feed> --subscribe <nome feed>```

Per pubblicare o sottoscrivere a più feed puoi includere più nomi di feed separati da spazi.
Questo può essere usato anche per pubblicare e sottoscrivere feed di pubblicazione.
Ad esempio
```doublezero connect multicast --subscribe feed1 feed2 feed3```

Dovresti vedere un output simile al seguente:
```
DoubleZero Service Provisioning
🔗  Start Provisioning User to devnet...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <your dz_id>
🔍  Provisioning User for IP: <your public ip>
    Creating an account for the IP: <your public ip>
    The Device has been selected: <the doublezero device you are connecting to>
    Service provisioned with status: ok
✅  User Provisioned
```
### 3. Verifica la tua connessione multicast attiva.
Attendi 60 secondi e poi esegui

```
doublezero status
```
Risultato atteso:
- Sessione BGP attiva sulla rete DoubleZero corretta
- Se sei un publisher, il tuo IP DoubleZero sarà diverso dall'IP Tunnel Src. È previsto.
- Se sei solo un subscriber, il tuo IP DoubleZero sarà uguale all'IP Tunnel Src.

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

Verifica i gruppi a cui sei connesso:
```
doublezero user list --client-ip <il tuo ip>
```

|account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
|wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan|
