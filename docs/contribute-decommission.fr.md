# Guide de mise hors service d'un site pour les contributeurs

Ce guide décrit comment mettre hors service un DoubleZero Device (DZD) ou quitter un site : comment retirer vos appareils et liens du réseau sans perturber les utilisateurs connectés, puis les supprimer onchain.

Le processus se déroule en trois étapes : plafonner l'appareil 31 jours avant le jour de la mise hors service, notifier les utilisateurs connectés pendant une période de préavis afin qu'ils puissent migrer, puis drainer et supprimer les liens, interfaces et l'appareil le jour de la mise hors service.

> ⚠️ **Coordonnez-vous d'abord avec DoubleZero :**
> Alignez-vous toujours avec l'équipe DoubleZero avant de mettre hors service un appareil ou un site. Convenez des dates et du plan avant de plafonner un appareil ou de drainer un lien, afin que la migration des utilisateurs et les étapes requises côté fondation puissent être coordonnées.

---

## Vue d'ensemble

| Quand | Action | Qui |
|-------|--------|-----|
| 31 jours avant | Plafonner l'appareil pour qu'aucun nouvel utilisateur ne puisse s'y connecter (`--max-users 0`) | Contributeur |
| 14 jours avant | Les utilisateurs connectés sont notifiés de migrer vers un autre appareil | Équipe DoubleZero |
| Période de préavis | Les utilisateurs se reconnectent eux-mêmes à d'autres DZD | Utilisateurs |
| Jour de la mise hors service | Drainer et supprimer les liens, interfaces et l'appareil | Contributeur |

Principes :

- **Bloquer les nouveaux utilisateurs tôt, migrer les utilisateurs existants progressivement.** Plafonner l'appareil tôt signifie qu'il ne perd des utilisateurs qu'à partir de ce moment. Les utilisateurs existants continuent de fonctionner et migrent à leur propre rythme.
- **Tout maintenir en service pendant la période de préavis.** Ne drainez pas les liens ni l'appareil avant le jour de la mise hors service, afin que les utilisateurs en cours de migration conservent un service normal.
- **L'ordre de démontage est imposé par le contrat.** Vous ne pouvez pas supprimer un lien ou un appareil tant qu'il est actif, les étapes ci-dessous drainent donc en premier et suppriment en dernier.

> ⚠️ **Préavis court :**
> Si vous disposez de moins de 31 jours avant la sortie, commencez immédiatement. Plafonnez l'appareil maintenant et raccourcissez les délais pour les adapter au temps disponible. L'ordre des étapes ne change pas.

---

## Phase 1 — Plafonner l'appareil (31 jours avant)

Plafonnez l'appareil pour qu'aucun nouvel utilisateur ne puisse s'y connecter :

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

Les utilisateurs existants ne sont pas affectés et continuent de fonctionner. Répétez pour chaque appareil mis hors service sur le site. Les liens et l'appareil restent pleinement actifs, de sorte que les utilisateurs connectés conservent un service normal.

---

## Phase 2 — Période de préavis (14 jours avant)

L'équipe DoubleZero notifie les utilisateurs connectés, leur demandant de se reconnecter à un autre DZD avant la date de mise hors service. Coordonnez-vous avec l'équipe pour déterminer qui contacte quels utilisateurs.

Rien n'est drainé pendant cette période, les utilisateurs conservent donc un service normal. Les utilisateurs se reconnectent eux-mêmes à leur propre rythme. Surveillez le nombre d'utilisateurs avec :

```bash
doublezero device list
```

---

## Phase 3 — Jour de la mise hors service

Exécutez ces étapes dans l'ordre. Chaque étape déverrouille la suivante.

> ⚠️ **Avant la suppression finale de l'appareil :**
> Notifiez la DoubleZero Foundation avant d'exécuter la dernière étape. La Foundation supprime tous les utilisateurs qui n'ont pas migré à temps, ce qui bloquerait autrement la suppression, et effectue toutes les étapes requises côté fondation.

### 1. Drainer les liens

Effectuez d'abord un drainage progressif (soft-drain), puis un drainage complet (hard-drain). Consultez [Drainage des liens](contribute-operations.md#link-draining) pour comprendre ce que fait chaque état.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
# une fois le trafic déplacé :
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

Répétez pour chaque lien sur les appareils en cours de retrait.

### 2. Supprimer les liens

```bash
doublezero link delete --pubkey <LINK_PUBKEY>
```

Cela libère les interfaces que les liens utilisaient.

### 3. Supprimer les interfaces

```bash
doublezero device interface delete <DEVICE_CODE> <INTERFACE_NAME>
```

Répétez pour chaque interface de l'appareil.

### 4. Drainer l'appareil

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --status drained
```

Le drainage retire l'appareil du routage et ferme toutes les sessions utilisateur restantes. Il fait également sortir l'appareil de son état actif afin qu'il puisse être supprimé.

### 5. Supprimer l'appareil

```bash
doublezero device delete --pubkey <DEVICE_PUBKEY>
```

L'appareil ne peut être supprimé que lorsqu'il n'est plus actif, qu'aucun lien ne le référence et qu'il ne reste aucune interface, ce que les étapes précédentes gèrent.

---

## Annulation ou report

Le plafonnement et le drainage sont réversibles tant que vous n'avez pas commencé à supprimer :

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users <ORIGINAL_VALUE>   # restaurer la capacité
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained             # depuis hard-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated                # retour à l'état actif
doublezero device update --pubkey <DEVICE_PUBKEY> --status activated            # annuler le drainage de l'appareil
```

La suppression des liens, interfaces ou de l'appareil est permanente : elle ferme les comptes onchain. Ne commencez à supprimer que lorsque la sortie est confirmée.