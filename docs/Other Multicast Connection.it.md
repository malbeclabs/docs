---
description: Connettiti a DoubleZero in modalità multicast per pubblicare o sottoscrivere uno o più feed.
---

# Altra Connessione Multicast
!!! warning "Connettendomi a DoubleZero accetto i [Termini di Servizio di DoubleZero](https://doublezero.xyz/terms-protocol)"
 
Informazioni dettagliate sulla connessione: 

### 1. Installazione del Client DoubleZero
Segui le istruzioni di [configurazione](setup.md) per installare e configurare il client DoubleZero.

### 2. Istruzioni di Connessione 

Connettiti a DoubleZero in Modalità Multicast
Come publisher: 

```doublezero connect multicast --publish <feed name>```

o come subscriber: 

```doublezero connect multicast --subscribe <feed name>```

o per pubblicare e sottoscrivere: 

```doublezero connect multicast --publish <feed name> --subscribe <feed name>```

Per pubblicare o sottoscrivere più feed puoi includere più nomi di feed separati da spazi.
Questo può essere utilizzato anche per pubblicare e sottoscrivere feed di pubblicazione.
Ad esempio 
```doublezero connect multicast --subscribe feed1 feed2 feed3```

Dovresti vedere un output simile al seguente:
```
⚡  Connecting to devnet...
    DoubleZero ID: <your DoubleZero ID>
⚡  Provisioning for IP: <your public ip>
    Creating account for IP: <your public ip>
    Device selected: <the doublezero device you are connecting to>
✅  User Provisioned
```
### 3. Verifica la tua connessione multicast attiva. 
Attendi 60 secondi e poi esegui

```
doublezero status
```
Risultato atteso:
- Sessione BGP attiva sulla rete DoubleZero corretta 
- Se sei un publisher, il tuo IP DoubleZero sarà diverso dal tuo Tunnel Src IP. Questo è previsto.
- Se sei solo un subscriber, `doublezero status` lascia vuoto l'IP DoubleZero. `doublezero user list` lo mostra.

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

Verifica i gruppi a cui sei connesso: 
```
doublezero user list --client-ip <your ip>
```

|account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
|wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan|