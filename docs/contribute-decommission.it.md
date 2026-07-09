# Guida alla Dismissione di un Sito per i Contributori

Questa guida descrive come dismettere un DoubleZero Device (DZD) o uscire da un sito: come rimuovere i propri dispositivi e link dalla rete senza creare disservizi agli utenti connessi, per poi eliminarli onchain.

Il processo si articola in tre fasi: limitare il dispositivo 31 giorni prima del giorno di dismissione, notificare gli utenti connessi durante una finestra di preavviso affinché possano spostarsi, quindi svuotare ed eliminare link, interfacce e dispositivo nel giorno della dismissione.

> ⚠️ **Coordinarsi prima con DoubleZero:**
> Allinearsi sempre con il team DoubleZero prima di dismettere un dispositivo o un sito, e concordare con noi la data e l'ora della dismissione. Dalla nostra parte eseguiamo alcuni passaggi in corrispondenza di quella finestra temporale, quindi è necessario essere pianificati. Concordare date e piano prima di limitare un dispositivo o svuotare un link.

> ⚠️ **Switch e link DZX:**
> Se il dispositivo che si sta dismettendo è uno switch DZX, o ha link DZX, identificare i contributori coinvolti il prima possibile e avvisarli, poiché potrebbero dover spostare o ricostruire i propri link prima della data prevista. Creare inoltre un evento di manutenzione nel [portale OPS](contribute-ops-management.md) per la data di dismissione.

---

## Panoramica

| Quando | Azione | Chi |
|--------|--------|-----|
| 31 giorni prima | Limitare il dispositivo in modo che nessun nuovo utente possa connettersi (`--max-users 0`) | Contributore |
| 14 giorni prima | Gli utenti connessi vengono notificati di spostarsi su un altro dispositivo | Team DoubleZero |
| Finestra di preavviso | Gli utenti si riconnettono autonomamente ad altri DZD | Utenti |
| Giorno di dismissione | Svuotare ed eliminare link, interfacce e dispositivo | Contributore |

Principi:

- **Bloccare presto i nuovi utenti, spostare gradualmente quelli esistenti.** Limitare il dispositivo in anticipo significa che da quel momento in poi perderà solo utenti. Gli utenti esistenti continuano a funzionare e migrano secondo i propri tempi.
- **Mantenere tutto operativo durante la finestra di preavviso.** Non svuotare i link né il dispositivo fino al giorno della dismissione, affinché gli utenti in fase di migrazione mantengano un servizio regolare.
- **L'ordine di rimozione è imposto dal contratto.** Non è possibile eliminare un link o un dispositivo mentre è attivo, pertanto i passaggi seguenti prevedono prima lo svuotamento e poi l'eliminazione.

> ⚠️ **Preavviso breve:**
> Se si hanno meno di 31 giorni prima dell'uscita, iniziare immediatamente. Limitare il dispositivo subito e ridurre le finestre temporali per adattarle al tempo disponibile. L'ordine dei passaggi non cambia.

---

## Fase 1 — Limitazione del dispositivo (31 giorni prima)

Limitare il dispositivo in modo che nessun nuovo utente possa connettersi:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

Gli utenti esistenti non vengono toccati e continuano a funzionare. Ripetere per ogni dispositivo in fase di dismissione nel sito. I link e il dispositivo restano pienamente attivi, quindi gli utenti connessi mantengono un servizio regolare.

---

## Fase 2 — Finestra di preavviso (14 giorni prima)

Il team DoubleZero notifica gli utenti connessi, chiedendo loro di riconnettersi a un DZD diverso prima della data di dismissione. Coordinarsi con il team su chi contatta quali utenti.

Nulla viene svuotato durante questa finestra, quindi gli utenti mantengono un servizio regolare. Gli utenti si riconnettono autonomamente secondo i propri tempi. Monitorare il numero di utenti con:

```bash
doublezero device list
```

---

## Fase 3 — Giorno di dismissione

Prima di iniziare, determinare esattamente cosa deve essere rimosso: il dispositivo, i link ad esso collegati e le interfacce da ripulire. È possibile trovare tutte queste informazioni con:

```bash
doublezero device list | grep <CONTRIBUTOR_CODE>    # trovare il proprio dispositivo: codice e pubkey
doublezero link list | grep <DEVICE_CODE>           # trovare i link collegati al dispositivo
doublezero device interface list <DEVICE_CODE>      # elencare le interfacce sul dispositivo da rimuovere
```

Eseguire questi passaggi nell'ordine indicato. Ogni passaggio sblocca il successivo.

> ⚠️ **Prima dell'eliminazione finale del dispositivo:**
> Notificare la DoubleZero Foundation prima di eseguire l'ultimo passaggio. La Foundation rimuove gli utenti che non hanno effettuato la migrazione in tempo, cosa che altrimenti bloccherebbe l'eliminazione, e completa eventuali passaggi richiesti lato foundation.

### 1. Svuotare i link

Prima soft-drain, poi hard-drain. Consultare [Link Draining](contribute-operations.md#link-draining) per capire cosa comporta ciascuno stato.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
# una volta che il traffico si è spostato:
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

Ripetere per ogni link sui dispositivi in fase di rimozione.

### 2. Eliminare i link

```bash
doublezero link delete --pubkey <LINK_PUBKEY>
```

Questo libera le interfacce utilizzate dai link.

### 3. Eliminare le interfacce

```bash
doublezero device interface delete <DEVICE_CODE> <INTERFACE_NAME>
```

Ripetere per ogni interfaccia sul dispositivo.

### 4. Svuotare il dispositivo

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --status drained
```

Lo svuotamento rimuove il dispositivo dal routing e chiude eventuali sessioni utente rimanenti. Inoltre sposta il dispositivo fuori dal suo stato attivo, rendendone possibile l'eliminazione.

### 5. Eliminare il dispositivo

```bash
doublezero device delete --pubkey <DEVICE_PUBKEY>
```

Il dispositivo può essere eliminato solo quando non è più attivo, non ha link che lo referenziano e non ha più interfacce rimaste, condizioni gestite dai passaggi precedenti.

---

## Annullamento o posticipo

La limitazione e lo svuotamento sono reversibili fino a quando non si inizia a eliminare:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users <ORIGINAL_VALUE>   # ripristinare la capacità
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained             # da hard-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated                # tornare attivo
doublezero device update --pubkey <DEVICE_PUBKEY> --status activated            # annullare lo svuotamento del dispositivo
```

L'eliminazione di link, interfacce o dispositivo è permanente: chiude gli account onchain. Iniziare a eliminare solo quando l'uscita è confermata.