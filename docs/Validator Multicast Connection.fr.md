---
description: Configurer un validateur connecté pour publier les shreds de leader vers le flux multicast edge de DoubleZero.
---

# Connexion Multicast du Validateur
!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'utilisation de DoubleZero](https://doublezero.xyz/terms-protocol)"

!!! note inline end "Sociétés de trading et entreprises"
    Si vous exploitez une société de trading ou une entreprise souhaitant s'abonner au flux, veuillez manifester votre intérêt pour obtenir plus d'informations [ici](https://doublezero.xyz/edge-form).

Si vous n'êtes pas encore connecté à DoubleZero, veuillez d'abord compléter la documentation de [Configuration](<setup.md>) et de connexion du validateur au [Mainnet-Beta](<DZ Mainnet-beta Connection.md>).

Si vous êtes un validateur déjà connecté à DoubleZero, vous pouvez poursuivre ce guide.

## 1. Configuration du Client

### Jito-Agave (v3.1.9+) et Harmonic (3.1.11+)

1. Dans votre script de démarrage du validateur, ajoutez : `--shred-receiver-address 233.84.178.1:7733`

    Vous pouvez envoyer simultanément vers Jito et le groupe `edge-solana-shreds`.

    exemple :

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...The rest of your config...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. Redémarrez votre validateur.
3. Connectez-vous au groupe multicast DoubleZero `edge-solana-shreds` en tant qu'éditeur : `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

### Frankendancer

1. Dans `config.toml`, ajoutez :

    ```toml
    [tiles.shred]
    additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
    ```

2. Redémarrez votre validateur.
3. Connectez-vous au groupe multicast DoubleZero `edge-solana-shreds` en tant qu'éditeur : `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

## 2. Confirmer que vous publiez des shreds de leader

Une fois connecté, vous pouvez vérifier [ce tableau de bord](https://data.doublezero.xyz/dz/publisher-check) pour confirmer que vous publiez des shreds. Vous ne verrez pas de confirmation tant que vous n'aurez pas publié des shreds de leader pour au moins un slot.

## Points de terminaison Multicast (IP vs Port)

Pour le trafic de shreds, l'**adresse IP** sélectionne le flux multicast et le **port** sélectionne le service UDP.
Tous les flux ci-dessous utilisent le port UDP `7733`.

Vous pouvez découvrir les IP de groupe actuelles avec :

```bash
doublezero multicast group list
```

- `edge-solana-shreds` (leader) : `233.84.178.1:7733`
- `edge-solana-retrans-eu` : `233.84.178.12:7733`
- `edge-solana-retrans-apac` : `233.84.178.13:7733`
- `edge-solana-retrans-amer` : `233.84.178.14:7733`

Pour les références API et les points de terminaison de données lisibles par machine, consultez [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

## 3. Récompenses des Validateurs

Pour chaque époque où les validateurs publient des shreds de leader, ils seront récompensés proportionnellement pour leur contribution en fonction des abonnements. Les détails de ce système seront annoncés et précisés ultérieurement.

## Dépannage

### Pas de publication de shreds de leader :

La cause la plus courante de non-transmission des shreds est la version du client :

Vous devez utiliser Jito-Agave 3.1.9+, JitoBam 3.1.9+, Frankendancer, ou Harmonic 3.1.11+. Les autres versions de client ne fonctionneront pas.

### Retransmission :

1. Une cause courante de retransmission de shreds est une simple erreur de configuration. Vous avez peut-être activé le flag d'envoi de shreds de retransmission dans votre script de démarrage ; vous devrez le désactiver.

    Le flag à supprimer dans Jito-Agave est : `--shred-retransmit-receiver-address`.

1. Consultez le [tableau de bord des éditeurs](https://data.doublezero.xyz/dz/publisher-check) et vérifiez si vous avez des shreds retransmis. Dans le tableau, regardez la colonne **No Retransmit Shreds** — un X rouge signifie que vous retransmettez.

    !!! note "vue par époque"
        Notez qu'il existe différentes fenêtres temporelles pour consulter le tableau de bord des éditeurs. Si vous voyez de la retransmission dans la **vue sur 2 époques**, mais que vous avez effectué un changement récent, essayez de basculer vers la vue **slot récent**.


    ![Tableau de bord de vérification des éditeurs](images/publisher-check-dashboard.png)

2. Trouvez l'IP de votre client et recherchez votre utilisateur dans [DoubleZero Data](https://data.doublezero.xyz/dz/users).

    ![Utilisateurs DoubleZero Data](images/doublezero-data-users.png)

3. Cliquez sur **Multicast** pour ouvrir votre vue multicast.

    La capture d'écran ci-dessous montre : **Retransmission** (indésirable) — un trafic sortant constant sans schéma de slot de leader.

    ![Vue multicast utilisateur - exemple de retransmission](images/user-multicast-view-retransmit.png)

    La capture d'écran ci-dessous montre : **Sain** (publication uniquement des shreds de leader) — un trafic sortant par pics, connu sous le nom de motif en dents de scie, qui correspond à vos slots de leader.

    ![Vue multicast utilisateur - exemple d'éditeur sain](images/user-multicast-view-healthy.png)

Le graphique indique si vous envoyez uniquement des shreds de leader. Les pics de trafic doivent correspondre aux moments où vous avez un slot de leader. Lorsque vous n'avez pas de slot de leader, il ne devrait y avoir aucun trafic. Si vous retransmettez, vous verrez un flux de trafic constant au lieu de pics alignés sur les slots.