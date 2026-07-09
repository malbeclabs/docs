# Guide de désaffectation de site pour les contributeurs

Ce guide décrit comment désaffecter un DoubleZero Device (DZD) ou quitter un site : comment retirer vos appareils et liens du réseau sans perturber les utilisateurs connectés, puis les supprimer on-chain.

Le processus se déroule en trois étapes : plafonner l'appareil 31 jours avant le jour de la désaffectation, notifier les utilisateurs connectés pendant une fenêtre de préavis afin qu'ils puissent migrer, puis drainer et supprimer les liens, interfaces et l'appareil le jour de la désaffectation.

> ⚠️ **Coordonnez-vous d'abord avec DoubleZero :**
> Alignez-vous toujours avec l'équipe DoubleZero avant de désaffecter un appareil ou un site, et planifiez votre date et heure de désaffectation avec nous. Nous effectuons quelques étapes de notre côté autour de ce créneau, il est donc nécessaire de nous inclure dans la planification. Convenez des dates et du plan avant de plafonner un appareil ou de drainer un lien.

> ⚠️ **Commutateurs et liens DZX :**
> Si l'appareil que vous désaffectez est un commutateur DZX, ou possède des liens DZX, identifiez les contributeurs concernés le plus tôt possible et prévenez-les, car ils pourraient avoir besoin de déplacer ou reconstruire leurs liens avant votre date. Créez également un événement de maintenance dans le [portail OPS](contribute-ops-management.md) pour la date de désaffectation.

---

## Vue d'ensemble

| Quand | Action | Qui |
|-------|--------|-----|
| 31 jours avant | Plafonner l'appareil pour qu'aucun nouvel utilisateur ne puisse s'y connecter (`--max-users 0`) | Contributeur |
| 14 jours avant | Les utilisateurs connectés sont notifiés de migrer vers un autre appareil | Équipe DoubleZero |
| Fenêtre de préavis | Les utilisateurs se reconnectent eux-mêmes à d'autres DZD | Utilisateurs |
| Jour de la désaffectation | Drainer et supprimer les liens, interfaces et l'appareil | Contributeur |

Principes :

- **Bloquer les nouveaux utilisateurs tôt, migrer les utilisateurs existants progressivement.** Plafonner l'appareil tôt signifie qu'il ne perd des utilisateurs qu'à partir de ce moment. Les utilisateurs existants continuent de fonctionner et migrent à leur propre rythme.
- **Tout maintenir en service pendant la fenêtre de préavis.** Ne drainez pas les liens ni l'appareil avant le jour de la désaffectation, afin que les utilisateurs en cours de migration conservent un service normal.
- **L'ordre de démontage est imposé par le contrat.** Vous ne pouvez pas supprimer un lien ou un appareil tant qu'il est actif, les étapes ci-dessous procèdent donc au drainage d'abord et à la suppression en dernier.

> ⚠️ **Préavis court :**
> Si vous disposez de moins de 31 jours avant la sortie, commencez immédiatement. Plafonnez l'appareil maintenant et raccourcissez les fenêtres pour s'adapter au temps disponible. L'ordre des étapes ne change pas.

---

## Phase 1 — Plafonner l'appareil (31 jours avant)

Plafonnez l'appareil pour qu'aucun nouvel utilisateur ne puisse s'y connecter :

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

Les utilisateurs existants ne sont pas affectés et continuent de fonctionner. Répétez l'opération pour chaque appareil en cours de désaffectation sur le site. Les liens et l'appareil restent pleinement actifs, de sorte que les utilisateurs connectés conservent un service normal.

---

## Phase 2 — Fenêtre de préavis (14 jours avant)

L'équipe DoubleZero notifie les utilisateurs connectés, leur demandant de se reconnecter à un autre DZD avant la date de désaffectation. Coordonnez-vous avec l'équipe pour déterminer qui contacte quels utilisateurs.

Rien n'est drainé pendant cette fenêtre, les utilisateurs conservent donc un service normal. Les utilisateurs se reconnectent eux-mêmes à leur propre rythme. Surveillez le nombre d'utilisateurs avec :

```bash
doublezero device list
```

---

## Phase 3 — Jour de la désaffectation

Avant de commencer, identifiez précisément ce qui doit être retiré : l'appareil, les liens qui y sont connectés et les interfaces à nettoyer. Vous pouvez trouver toutes ces informations avec :

```bash
doublezero device list | grep <CONTRIBUTOR_CODE>    # trouver votre appareil : son code et sa pubkey
doublezero link list | grep <DEVICE_CODE>           # trouver les liens connectés à l'appareil
doublezero device interface list <DEVICE_CODE>      # lister les interfaces de l'appareil à supprimer
```

Exécutez ces étapes dans l'ordre. Chaque étape déverrouille la suivante.

> ⚠️ **Avant la suppression finale de l'appareil :**
> Prévenez la DoubleZero Foundation avant d'exécuter la dernière étape. La Foundation supprime les utilisateurs qui n'ont pas migré à temps, ce qui bloquerait sinon la suppression, et complète toutes les étapes requises de son côté.

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

La suppression des liens, interfaces ou de l'appareil est permanente : elle ferme les comptes on-chain. Ne commencez à supprimer que lorsque la sortie est confirmée.