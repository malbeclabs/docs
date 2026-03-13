# Autre Connexion Multicast
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "En me connectant à DoubleZero, j'accepte les [Conditions d'Utilisation de DoubleZero](https://doublezero.xyz/terms-protocol)"


|Cas d'Utilisation | Première Étape | Une fois approuvé, connectez-vous via :|
|---------|------------|---------------------------|
|S'abonner à Jito Shredstream | Contactez Jito pour approbation. | ```doublezero connect multicast --subscribe jito-shredstream``` |

Informations de connexion détaillées :

### 1. Installation du Client DoubleZero
Veuillez suivre les instructions de [configuration](setup.md) pour installer et configurer le client DoubleZero.

### 2. Instructions de Connexion

Connectez-vous à DoubleZero en mode Multicast
En tant qu'éditeur :

```doublezero connect multicast --publish <nom du flux>```

ou en tant qu'abonné :

```doublezero connect multicast --subscribe <nom du flux>```

ou pour publier et s'abonner :

```doublezero connect multicast --publish <nom du flux> --subscribe <nom du flux>```

Pour publier ou s'abonner à plusieurs flux, vous pouvez inclure plusieurs noms de flux séparés par des espaces.
Cela peut également être utilisé pour publier et s'abonner à des flux de publication.
Par exemple
```doublezero connect multicast --subscribe feed1 feed2 feed3```

Vous devriez voir une sortie similaire à ce qui suit :
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
### 3. Vérifiez votre connexion multicast active.
Attendez 60 secondes puis exécutez

```
doublezero status
```
Résultat attendu :
- Session BGP active sur le bon réseau DoubleZero
- Si vous êtes un éditeur, votre IP DoubleZero sera différente de votre IP Source Tunnel. C'est normal.
- Si vous êtes uniquement abonné, votre IP DoubleZero sera identique à votre IP Source Tunnel.

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

Vérifiez les groupes auxquels vous êtes connecté :
```
doublezero user list --client-ip <your ip>
```

|account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
|wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan|
