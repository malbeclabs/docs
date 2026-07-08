# Guida alla Dismissione di un Sito per i Contributor

Questa guida descrive come dismettere un DoubleZero Device (DZD) o uscire da un sito: come rimuovere i propri dispositivi e link dalla rete senza creare disservizi agli utenti connessi, per poi eliminarli onchain.

Il processo si articola in tre fasi: limitare il dispositivo 31 giorni prima del giorno della dismissione, notificare gli utenti connessi durante una finestra di preavviso affinché possano migrare, quindi drenare ed eliminare i link, le interfacce e il dispositivo nel giorno della dismissione.

> ⚠️ **Coordinati prima con DoubleZero:**
> Allineati sempre con il team di DoubleZero prima di dismettere un dispositivo o un sito. Concorda le date e il piano prima di limitare un dispositivo o drenare un link, in modo da coordinare la migrazione degli utenti e le operazioni necessarie da parte della fondazione.

---

## Panoramica

| Quando | Azione | Chi |
|--------|--------|-----|
| 31 giorni prima | Limitare il dispositivo affinché nessun nuovo utente possa connettersi (`--max-users 0`) | Contributor |
| 14 giorni prima | Gli utenti connessi vengono notificati di migrare verso un altro dispositivo | Team DoubleZero |
| Finestra di preavviso | Gli utenti si riconnettono autonomamente ad altri DZD | Utenti |
| Giorno della dismissione | Drenare ed eliminare i link, le interfacce e il dispositivo | Contributor |

Principi:

- **Bloccare i nuovi utenti in anticipo, migrare quelli esistenti gradualmente.** Limitare il dispositivo in anticipo significa che da quel momento in poi perderà solo utenti. Gli utenti esistenti continuano a funzionare e migrano secondo i propri tempi.
- **Mantenere tutto operativo durante la finestra di preavviso.** Non drenare i link né il dispositivo fino al giorno della dismissione, affinché gli utenti in fase di migrazione mantengano il servizio regolare.
- **L'ordine di smantellamento è imposto dal contratto.** Non è possibile eliminare un link o un dispositivo mentre è attivo, pertanto i passaggi seguenti prevedono prima il drenaggio e poi l'eliminazione.

> ⚠️ **Preavviso breve:**
> Se hai meno di 31 giorni prima dell'uscita, inizia immediatamente. Limita il dispositivo subito e riduci le finestre temporali per adattarle al tempo disponibile. L'ordine dei passaggi non cambia.

---

## Fase 1 — Limitare il dispositivo (31 giorni prima)

Limita il dispositivo affinché nessun nuovo utente possa connettersi:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

Gli utenti esistenti non vengono toccati e continuano a funzionare. Ripeti per ogni dispositivo in dismissione presso il sito. I link e il dispositivo restano pienamente attivi, così gli utenti connessi mantengono il servizio regolare.

---

## Fase 2 — Finestra di preavviso (14 giorni prima)

Il team di DoubleZero notifica gli utenti connessi, chiedendo loro di riconnettersi a un DZD diverso prima della data di dismissione. Coordinati con il team su chi contatta quali utenti.

Nulla viene drenato durante questa finestra, quindi gli utenti mantengono il servizio regolare. Gli utenti si riconnettono autonomamente secondo i propri tempi. Monitora il numero di utenti con:

```bash
doublezero device list
```

---

## Fase 3 — Giorno della dismissione

Esegui questi passaggi in ordine. Ogni passaggio sblocca il successivo.

> ⚠️ **Prima dell'eliminazione finale del dispositivo:**
> Notifica la DoubleZero Foundation prima di eseguire l'ultimo passaggio. La Foundation rimuove gli utenti che non hanno migrato in tempo, i quali altrimenti bloccherebbero l'eliminazione, e completa tutte le operazioni necessarie da parte della fondazione.

### 1. Drenare i link

Prima il soft-drain, poi l'hard-drain. Consulta [Link Draining](contribute-operations.md#link-draining) per capire cosa fa ciascuno stato.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
# una volta che il traffico è stato spostato:
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

Ripeti per ogni link sui dispositivi in fase di rimozione.

### 2. Eliminare i link

```bash
doublezero link delete --pubkey <LINK_PUBKEY>
```

Questo libera le interfacce che i link stavano utilizzando.

### 3. Eliminare le interfacce

```bash
doublezero device interface delete <DEVICE_CODE> <INTERFACE_NAME>
```

Ripeti per ogni interfaccia sul dispositivo.

### 4. Drenare il dispositivo

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --status drained
```

Il drenaggio rimuove il dispositivo dal routing e chiude tutte le sessioni utente rimanenti. Inoltre, sposta il dispositivo fuori dal suo stato attivo in modo che possa essere eliminato.

### 5. Eliminare il dispositivo

```bash
doublezero device delete --pubkey <DEVICE_PUBKEY>
```

Il dispositivo può essere eliminato solo quando non è più attivo, non ha link che lo referenziano e non ha più interfacce rimaste, condizioni gestite dai passaggi precedenti.

---

## Annullamento o posticipo

La limitazione e il drenaggio sono reversibili finché non si inizia a eliminare:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users <ORIGINAL_VALUE>   # ripristina la capacità
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained             # da hard-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated                # ritorno ad attivo
doublezero device update --pubkey <DEVICE_PUBKEY> --status activated            # annulla il drenaggio del dispositivo
```

L'eliminazione dei link, delle interfacce o del dispositivo è permanente: chiude gli account onchain. Inizia a eliminare solo quando l'uscita è confermata.