---
description: Utilisez le portail DoubleZero OPS Management pour consigner et suivre les incidents réseau et les maintenances planifiées.
---

# OPS Management

Le portail DoubleZero OPS Management est l'endroit où les contributeurs consignent et suivent les incidents (pannes imprévues) et les maintenances (travaux planifiés) sur l'ensemble du réseau. Tous les tickets sont visibles par tous les contributeurs.

**Portail :** [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management)

## Portail vs Slack

Le portail OPS Management et Slack fonctionnent ensemble. Tous les incidents et maintenances sont suivis sous forme de tickets, accessibles via le portail ou l'API. Chaque ticket notifie automatiquement les bons canaux Slack et offre à chaque contributeur une vue partagée de ce qui se passe sur le réseau. Slack est l'endroit où la conversation a lieu : partage de logs, coordination avec d'autres contributeurs et collaboration sur les problèmes en cours.

Les tickets constituent l'enregistrement de référence, qu'ils soient créés via le portail ou l'API. Les fils Slack ne le sont pas : ils ne mettent pas à jour le statut des tickets et ne sont pas stockés de manière permanente. Maintenez toujours le statut du ticket à jour, même si la conversation se déroule sur Slack.

Le portail et Slack ont des usages différents. Utilisez les deux, mais chacun pour ce qui lui convient.

| Utilisez le portail (ou l'API) pour... | Utilisez Slack pour... |
|-------------------------------|-----------------|
| Ouvrir, mettre à jour et clôturer des tickets | Converser et collaborer sur un problème en cours |
| Enregistrer les transitions de statut | Partager des logs, des captures d'écran ou lancer un appel |
| Assigner ou escalader un ticket | Attirer rapidement l'attention sur un problème |
| Définir la cause racine à la clôture | Coordonner avec d'autres contributeurs |



---

## Intégration initiale

Effectuez ces étapes une seule fois avant d'utiliser le portail.

### 1. Définir votre clé Ops Manager

Enregistrez une clé publique de portefeuille Solana comme clé Ops Manager. Portefeuilles pris en charge : Phantom, Solflare, Coinbase Wallet.

```bash
doublezero contributor update \
  --ops-manager <OPS_MANAGER_PUBKEY> \
  --pubkey <CONTRIBUTOR_PUBKEY>
```

### 2. Connecter votre portefeuille sur le portail

1. Accédez à [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management).
2. Cliquez sur **Connect Your Wallet** et sélectionnez votre portefeuille.
3. Signez le message pour prouver que vous possédez votre clé Ops Manager.

Une fois authentifié, le **Tableau de suivi des incidents** s'affiche.

Les paramètres du compte se trouvent dans le menu **Settings** (l'icône en forme d'engrenage, en haut à droite) : API Key Management, User Management et Escalation Contacts. Les options affichées dépendent de votre rôle.

### 3. Créer des clés API (optionnel)

Pour un accès programmatique au lieu du formulaire web :

1. Ouvrez le menu **Settings** (icône d'engrenage) et choisissez **API Key Management**.
2. Créez une ou plusieurs clés API.
3. Téléchargez la documentation de l'API depuis cette page.

---

## Incidents

Un incident est un événement imprévu ayant un impact sur le service.

### Niveaux de sévérité {#severity-levels}

Attribuez la sévérité en fonction de l'impact sur le réseau DoubleZero. Vous pouvez mettre à jour la sévérité à mesure que la situation évolue.

| Sévérité | Impact | Réponse |
|----------|--------|----------|
| `sev1` | Panne totale ou rupture majeure du plan de contrôle/données sans solution de repli | Tout arrêter immédiatement, même en dehors des heures de travail. Escalader à la DoubleZero Foundation immédiatement. |
| `sev2` | Impact partiel mais substantiel ; service dégradé avec repli possible | Traiter comme urgent. Coordonner activement. Réponse de nuit requise en cas de dégradation prolongée. |
| `sev3` | Impact limité ou non visible par les utilisateurs ; risque d'escalade si non résolu | Priorité maximale pendant les heures de travail. Surveiller de près. Pas d'escalade en dehors des heures sauf si l'impact augmente. |

??? note "Exemples de sévérité"

    **Exemples Sev1**

    - Plus de 10 % du trafic utilisateur absorbé (blackholed) sur DoubleZero, sans repli vers l'internet public
    - Plus de 80 % des tentatives d'intégration, connexion ou déconnexion des utilisateurs en échec
    - Plus de 20 % des DZDs signalant des erreurs d'interface
    - Le contrôleur retourne des configurations valides mais incorrectes aux agents DZD

    **Exemples Sev2**

    - Plus de 20 % des utilisateurs incapables d'envoyer/recevoir du trafic via les tunnels DoubleZero, mais avec repli vers l'internet public
    - 0–10 % du trafic utilisateur absorbé (blackholed) sur DoubleZero sans repli
    - 20–80 % des tentatives d'intégration, connexion ou déconnexion des nouveaux utilisateurs en échec
    - Plus de 20 % des agents de configuration n'appliquant pas la configuration DZD
    - 0–20 % des DZDs signalant des erreurs d'interface
    - Problèmes en amont causant une perte d'observabilité (monitoring/alertes indisponibles)
    - Pipeline de données onchain en panne ou produisant des données incorrectes
    - Plus de 20 % de la collecte ou soumission de latence internet en échec
    - Contrôleur inaccessible par les agents DZD
    - Le contrôleur retourne des configurations invalides aux DZDs qui ne seront pas appliquées

    **Exemples Sev3**

    - 0–20 % des utilisateurs incapables d'envoyer/recevoir du trafic via les tunnels DoubleZero, avec repli vers l'internet public
    - 0–20 % des DZDs signalant des erreurs d'interface
    - 0–20 % des DZDs subissant des échecs d'agent de configuration
    - 0–20 % des tentatives d'intégration, connexion ou déconnexion des utilisateurs en échec
    - Plus de 20 % de la collecte ou soumission de latence internet en échec pour un seul fournisseur de données
    - 0–20 % de la collecte ou soumission de latence internet en échec pour tous les fournisseurs de données
    - Bugs ou dette technique causant du bruit d'alertes impossible à supprimer
    - DIA en panne ou problèmes réseau du RPC du registre pour 0–20 % des appareils pendant plusieurs heures
    - Problèmes à faible impact tels que bugs mineurs, erreurs cosmétiques ou incidents isolés n'affectant pas le trafic client
    - Petite fraction d'appareils signalant des erreurs de manière intermittente sans interruption de service

### Ouvrir un incident

Cliquez sur **Create New Record**, sélectionnez Type = **Incident** sur le portail, ou soumettez via l'API.

**Obligatoire :**

| Champ | Description |
|-------|-------------|
| `title` | Résumé court (100 caractères max.) |
| `description` | Explication détaillée (500 caractères max.) |
| `severity` | `sev1`, `sev2` ou `sev3` |
| `status` | Ne peut pas être défini sur un état terminal (`resolved`, `closed`) à la création |
| Device et/ou Link | Au moins un requis. Sur le formulaire web, sélectionnez depuis un menu déroulant de vos codes d'appareils et de liens. Via l'API, passez les clés publiques correspondantes en tant que `device_pubkey` et/ou `affected_link_pubkey`. |

**Optionnel :**

| Champ | Description |
|-------|-------------|
| `reporter_name` / `reporter_email` | Vos coordonnées |
| `assignee` | Personne responsable de la résolution |
| `internal_reference` | Votre identifiant de ticket interne (ex. Jira, ServiceNow) |
| `start_at` | Par défaut l'heure de création ; modifiable |

Une fois créé, une notification est publiée dans le canal Slack des incidents contributeurs avec l'identifiant du ticket, la sévérité, les appareils/liens affectés et le nom du contributeur.

### Mettre à jour un incident

Au fur et à mesure de l'évolution de l'incident, maintenez le statut du ticket à jour. C'est le signal que les autres contributeurs et DZ utilisent pour comprendre ce qui est en cours de traitement.

| Statut | Quand le définir |
|--------|----------------|
| `open` | État initial : problème signalé, pas encore pris en charge |
| `acknowledged` | Vous l'avez vu et en avez pris la responsabilité |
| `investigating` | Diagnostic actif en cours : collecte de logs, vérification des métriques |
| `mitigating` | Cause racine connue ou suspectée ; application d'un correctif ou d'un contournement |
| `monitoring` | Correctif appliqué ; surveillance pour confirmer qu'il tient |
| `resolved` | Problème confirmé résolu ; **cause racine requise** |
| `closed` | Entièrement terminé ; aucune action supplémentaire ; **cause racine requise** |

```
open → acknowledged → investigating → mitigating → monitoring → resolved → closed
```

Vous pouvez sauter des statuts si c'est approprié. Par exemple, passer directement de `open` à `investigating` si vous commencez immédiatement à travailler dessus. Utilisez toujours le statut le plus précis pour l'état actuel.

Chaque mise à jour de statut publie une réponse dans le fil de la notification Slack d'origine.

### Clôturer un incident

Pour faire passer un incident à `resolved` ou `closed`, une **cause racine** doit être définie. Vous pouvez définir la cause racine à un stade antérieur si vous la connaissez déjà ; elle devient obligatoire à la clôture.

| Code | Description |
|------|-------------|
| `hardware` | Réparation, remplacement ou mise à niveau matérielle (SFP, NIC, câble, appareil) |
| `software` | Correctif logiciel ou firmware, mise à jour ou redémarrage |
| `configuration` | Modification, correction ou rollback de configuration |
| `capacity` | Congestion, limites de capacité ou gestion du trafic |
| `carrier` | Problème de circuit, longueur d'onde ou cross-connect du fournisseur |
| `network_external` | Problème réseau externe hors du contrôle du contributeur |
| `facility` | Problème d'infrastructure du datacenter (alimentation, refroidissement) |
| `fiber_cut` | Dommage physique de fibre réparé |
| `security` | Incident de sécurité atténué |
| `human_error` | Erreur opérationnelle corrigée |
| `false_positive` | Aucun problème réel trouvé après investigation |
| `duplicate` | Déjà suivi dans un autre ticket |
| `self_resolved` | Problème résolu sans intervention |
| `dz_managed` | Problème avec un composant logiciel géré par DoubleZero (activator, controller, etc.) |

---

## Maintenance

Un enregistrement de maintenance est une activité planifiée, limitée dans le temps, pouvant affecter la disponibilité. Créez-le à l'avance pour que les autres contributeurs puissent le voir et éviter les fenêtres conflictuelles.

### Planifier une maintenance

Cliquez sur **Create New Record** > **Maintenance** sur le portail, ou soumettez via l'API.

**Obligatoire :**

| Champ | Description |
|-------|-------------|
| `title` | Résumé court (100 caractères max.) |
| `description` | Explication détaillée (500 caractères max.) |
| `severity` | `sev1`, `sev2` ou `sev3`. Définissez-la selon l'impact utilisateur attendu (voir la note ci-dessous). |
| `start_at` | Heure de début planifiée (UTC) |
| `end_at` | Heure de fin planifiée (UTC) ; doit être postérieure à `start_at` |
| Device et/ou Link | Au moins un requis. Sur le formulaire web, sélectionnez depuis un menu déroulant de vos codes d'appareils et de liens. Via l'API, passez les clés publiques correspondantes en tant que `device_pubkey` et/ou `affected_link_pubkey`. |

La sévérité s'applique à la maintenance de la même manière qu'aux incidents. Définissez-la selon l'impact utilisateur que vous attendez pendant la fenêtre, en utilisant les [niveaux de sévérité ci-dessus](#severity-levels).

Une fois créé, une notification est publiée dans le canal Slack des maintenances contributeurs avec l'identifiant du ticket, les appareils/liens affectés, la fenêtre planifiée et le nom du contributeur.

### Gérer le statut de maintenance

Maintenez le statut à jour au fur et à mesure de la progression de la fenêtre.

| Statut | Quand le définir |
|--------|----------------|
| `planned` | Planifié, pas encore démarré |
| `in-progress` | Les travaux ont commencé |
| `completed` | Travaux terminés avec succès |
| `closed` | Défini automatiquement 24 heures après `end_at` |
| `cancelled` | Annulé avant ou pendant l'exécution |

```
planned → in-progress → completed → closed (auto 24h after end_at)
    ↓          ↓
    └──────────┴──→ cancelled
```

---

## Contacts d'escalade

Les contacts d'escalade indiquent à DoubleZero et aux autres contributeurs qui contacter lorsque votre partie du réseau rencontre un problème. Vous configurez vos propres contacts pour votre organisation. Un contact peut être une personne ou une équipe, comme votre NOC. Chaque contact a un ou plusieurs moyens de le joindre et un planning indiquant quand il est d'astreinte.

Ouvrez le menu **Settings** (icône d'engrenage) et choisissez **Escalation Contacts**. Seuls les ops managers peuvent ajouter ou modifier des contacts.

### Ajouter un contact

Pour chaque contact, définissez :

| Champ | Description |
|-------|-------------|
| Name | Un nom pour le contact, qu'il s'agisse d'une personne ou d'une équipe comme votre NOC |
| Timezone | Le fuseau horaire local, utilisé pour lire le planning |
| Availability | **24/7**, ou un ou plusieurs créneaux hebdomadaires pendant lesquels le contact est d'astreinte |
| Contact methods | Un ou plusieurs moyens de joindre le contact, par ordre de priorité |

Les méthodes de contact prises en charge sont email, téléphone, Slack, Telegram et WhatsApp. L'ordre compte : la première méthode est celle à essayer en premier.

### Disponibilité et lacunes de couverture

Un contact est soit disponible en permanence (24/7), soit disponible pendant des créneaux hebdomadaires que vous définissez, par exemple du lundi au vendredi, de 09h00 à 17h00. Les créneaux sont saisis dans le fuseau horaire local du contact et affichés en UTC, de sorte que le changement d'heure est géré pour vous.

La vue **coverage gaps** (lacunes de couverture) montre les moments de chaque semaine où personne de votre organisation n'est d'astreinte. Utilisez-la pour identifier et combler les lacunes.

### Fenêtres de rotation

La semaine est divisée en créneaux de trente minutes. Pour chaque créneau, vous pouvez définir l'ordre dans lequel vos contacts sont sollicités. Cela vous permet de gérer une rotation d'astreinte sans modifier chaque contact individuellement.

### Visibilité

Vous contrôlez qui peut voir vos contacts. DoubleZero peut toujours les voir. Vous choisissez qui d'autre le peut :

| Paramètre | Qui d'autre peut voir vos contacts |
|---------|-------------------------------|
| DoubleZero only (par défaut) | Aucun autre contributeur |
| Everybody | Tous les contributeurs |
| Some contributors | Uniquement les contributeurs que vous sélectionnez |

Votre propre équipe peut toujours voir vos contacts. La visibilité est définie une seule fois pour l'ensemble de votre organisation et s'applique à tous vos contacts.

---

## Gestion des utilisateurs

Par défaut, votre clé Ops Manager est le seul compte pouvant agir pour votre organisation. Vous pouvez ajouter des membres d'équipe afin que plusieurs personnes puissent gérer vos tickets.

Ouvrez le menu **Settings** (icône d'engrenage) et choisissez **User Management**. Seuls les ops managers peuvent ajouter ou supprimer des membres d'équipe.

Pour chaque membre d'équipe, définissez :

| Champ | Description |
|-------|-------------|
| Name | Le nom de la personne |
| Wallet pubkey | Le portefeuille Solana avec lequel elle se connecte |
| Access level | **Read** ou **Read-write** |

Niveaux d'accès :

- **Read** : peut consulter les tickets et les contacts d'escalade, et créer des clés API en lecture seule. Ne peut pas créer, mettre à jour ou clôturer des tickets.
- **Read-write** : accès complet pour créer, mettre à jour et clôturer des tickets, et peut créer des clés API de tout niveau.

Chaque membre d'équipe se connecte avec son propre portefeuille, de la même manière que vous avez connecté votre clé Ops Manager.

---

## Permissions et escalade

### Ce que les contributeurs peuvent faire

- Créer et gérer des tickets uniquement pour leurs propres appareils et liens.
- S'assigner des tickets ou les escalader à DZ/Malbeclabs.
- Voir tous les tickets de tous les contributeurs.
- Ajouter des membres d'équipe et définir leur niveau d'accès (ops managers uniquement).
- Gérer les contacts d'escalade de leur organisation (ops managers uniquement).

### Ce que les administrateurs DZ/Malbeclabs peuvent faire

- Créer des tickets pour les appareils et liens de n'importe quel contributeur.
- Assigner ou réassigner des tickets entre contributeurs.
- Traiter les escalades et les demandes de support.

### Propriété des liens DZX

Les liens DZX connectent des appareils de deux contributeurs différents. Le contributeur **côté A** (premier appareil dans le nom du lien) est propriétaire du lien et est le seul à pouvoir créer des tickets pour celui-ci.

**Exemple :** Pour le lien `deviceA:deviceB`, le contributeur propriétaire de `deviceA` est propriétaire du lien.

**Si le problème est côté Z :**

1. Le contributeur côté A crée un ticket pour le lien DZX.
2. Assigne le ticket à DZ/Malbeclabs.
3. DZ/Malbeclabs investigue et réassigne au contributeur côté Z si nécessaire.

Nous reconnaissons que ce flux de travail est limité. Les contributeurs côté Z ne peuvent actuellement pas créer de tickets pour les liens DZX dont ils ne sont pas propriétaires, ce qui signifie que la coordination doit passer par DZ/Malbeclabs. Nous travaillons à améliorer cela afin que les deux côtés d'un lien DZX puissent déclarer des incidents et des maintenances de manière indépendante.