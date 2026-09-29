---
description: Exigences matérielles, de bande passante et de connectivité, ainsi que l'architecture pour contribuer de la capacité au réseau DoubleZero.
---

# Exigences et architecture pour les contributeurs

## Résumé

Toute personne souhaitant monétiser ses câbles à fibre optique et son matériel réseau sous-utilisés peut contribuer au réseau DoubleZero. Les contributeurs réseau doivent fournir une bande passante dédiée entre deux points, exploiter des appareils compatibles DoubleZero (DZD) à chaque extrémité, ainsi qu'une connexion à l'internet public à chaque extrémité. Les contributeurs réseau doivent également exécuter le logiciel DoubleZero sur chaque DZD pour fournir des services tels que le multicast, la recherche d'utilisateurs et le filtrage en périphérie.

Le smart contract DoubleZero est la pierre angulaire garantissant que le réseau maintient des liaisons de haute qualité pouvant être mesurées et intégrées dans la topologie, permettant à nos contrôleurs réseau de développer le chemin de bout en bout le plus efficace entre nos différents utilisateurs et points d'extrémité. Lors de l'exécution du smart contract et du déploiement de l'équipement réseau et de la bande passante, une entité est classée comme contributeur réseau. Consultez [DoubleZero Economics](https://economics.doublezero.xyz/overview) pour mieux comprendre les aspects économiques de la participation à DoubleZero en tant que contributeur réseau.

---

## Exigences pour devenir contributeur réseau DoubleZero

- Une bande passante dédiée pouvant fournir une connectivité IPv4 et un MTU de 2048 octets entre deux centres de données
- Un matériel DoubleZero Device (DZD) compatible avec le protocole DoubleZero
- Une connectivité à internet et aux autres contributeurs réseau DoubleZero
- L'installation du logiciel DoubleZero sur le DZD

## Guide de démarrage rapide

En tant que contributeur réseau, la manière la plus simple de démarrer avec DoubleZero est d'identifier la capacité de votre réseau pouvant être dédiée à DoubleZero. Une fois identifiée, les DZD doivent être déployés, facilitant le réseau overlay DoubleZero qui ne nécessite que la joignabilité IPv4 et un MTU minimum de 2048 octets comme dépendances du réseau du contributeur.

La figure 1 illustre le modèle le plus simple pour contribuer de la bande passante et des services d'envoi et de traitement de paquets. Un DZD est déployé dans chaque centre de données, s'interfaçant avec le réseau interne du contributeur pour fournir la connectivité WAN DoubleZero. Ceci est complété par un accès internet local, généralement une solution d'accès internet dédié (DIA), utilisée comme rampe d'accès pour les utilisateurs DoubleZero. Bien qu'il soit attendu que le DIA soit l'option privilégiée pour faciliter l'accès aux utilisateurs de DoubleZero, de nombreux modèles de connectivité sont possibles, par exemple : câblage physique vers les serveurs, extension de la fabric réseau, etc. Nous désignons ces options sous le nom de Choose Your Own Adventure (CYOA), offrant au contributeur la flexibilité de connecter des utilisateurs locaux ou distants de la manière la mieux adaptée à ses politiques réseau internes.

Comme pour tout réseau, la joignabilité est un élément fondamental de l'architecture car les contributeurs réseau ne peuvent pas vivre en isolation. Ainsi, le DZD *doit* avoir une liaison vers un DoubleZero Exchange (DZX) pour créer un réseau contigu entre les participants.

<figure markdown="span">
  ![Image title](images/figure1.png){ width="800" }
  <figcaption>Figure 1 : Contribution de bande passante au réseau DoubleZero entre 2 centres de données - Contributeur unique</figcaption>
</figure>

### Exemples de contributions

Les façons dont un contributeur réseau peut développer ses contributions à DoubleZero sont nombreuses, notamment :

- Améliorer les caractéristiques de performance de ses contributions existantes : augmenter la bande passante, réduire la latence
- Ajouter plusieurs liaisons entre les mêmes centres de données
- Ajouter une nouvelle liaison d'un centre de données existant vers un nouveau centre de données
- Ajouter une nouvelle liaison indépendante entre deux nouveaux centres de données

#### Exemple 1 : Contributeur unique, 3 centres de données, deux liaisons
<figure markdown="span">
  ![Image title](images/figure2.png){ width="800" }
  <figcaption>Figure 2 : Contribution de bande passante au réseau DoubleZero entre 3 centres de données - Contributeur unique</figcaption>
</figure>

Un seul DZD peut prendre en charge plusieurs liaisons contribuées à DoubleZero. La figure 2 illustre une topologie potentielle lorsqu'un seul centre de données, désigné comme 1, termine la bande passante vers deux centres de données distants différents, 2 et 3. Dans ce scénario, chaque centre de données contient un seul DZD. Tous les DZD utilisent le DIA comme rampes d'accès utilisateur pour leur interface CYOA.

#### Exemple 2 : Contributeur unique, 3 centres de données, trois liaisons

La figure 3 décrit la topologie DoubleZero lorsqu'un contributeur unique déploie trois liaisons dans une topologie en triangle entre 3 centres de données. Dans un scénario similaire à l'exemple 1, un seul DZD est déployé dans les centres de données 1, 2 et 3, chacun supportant 2 liaisons réseau indépendantes. La topologie résultante est un triangle ou un anneau entre les centres de données.

<figure markdown="span">
  ![Image title](images/figure3.png){ width="800" }
  <figcaption>Figure 3 : Contribution de bande passante au réseau DoubleZero entre 3 centres de données - Contributeur unique</figcaption>
</figure>

### DoubleZero Exchange

La création d'un réseau contigu est un élément fondamental de l'architecture DoubleZero. Les contributeurs s'interfacent via un DoubleZero Exchange (DZX) au sein d'une zone métropolitaine, qui est une ville telle que New York (NYC), Londres (LON) ou Tokyo (TYO). Un DZX est une fabric réseau similaire à un Internet Exchange, permettant le peering et l'échange de routes.

Dans la figure 4, le contributeur réseau 1 opère dans les centres de données 1, 2 et 3, tandis que le contributeur réseau 2 opère dans les centres de données 2, 4 et 5. En s'interconnectant dans le centre de données 2, la portée du réseau DoubleZero s'étend à 5 centres de données contigus.

<figure markdown="span">
  ![Image title](images/figure4.png){ width="1000" }
  <figcaption>Figure 4 : Contribution de bande passante au réseau DoubleZero entre 2 contributeurs de bande passante réseau</figcaption>
</figure>

### Options de contribution de bande passante

DoubleZero exige d'un contributeur réseau qu'il offre une connectivité intégrée via un profil garanti de bande passante, de latence et de gigue entre les DZD de deux centres de données terminaux, exprimé via un smart contract. DoubleZero ne prescrit pas la manière dont un contributeur réseau implémente sa contribution ; cependant, dans les sections suivantes, nous fournissons des options indicatives à utiliser à sa seule discrétion.

Les domaines importants à considérer pour un contributeur réseau peuvent être :

- La capacité à garantir les performances réseau du service DoubleZero : bande passante, latence et gigue
- La ségrégation par rapport à ses services réseau internes existants
- Les conflits d'adressage IPv4, spécifiquement avec l'espace d'adressage underlay du tunnel
- La disponibilité et le temps de fonctionnement
- Les considérations CAPEX et OPEX

#### Bande passante de couche 1
<figure markdown="span">
  ![Image title](images/figure5.png){ width="800" }
  <figcaption>Figure 5 : Services optiques de couche 1</figcaption>
</figure>

La bande passante de couche 1, plus formellement décrite comme services de longueur d'onde, peut voir une capacité dédiée provisionnée sur une infrastructure optique existante, telle que DWDM, CWDM ou via des multiplexeurs optiques (MUX). Dans la figure 5, les DZD utilisent une optique colorée qui est câblée à un MUX L1, qui entrelace la longueur d'onde du DZD sur une fibre noire existante.

Cette solution présente de nombreux avantages pour les contributeurs réseau qui exploitent déjà un réseau cœur existant. Les modifications opérationnelles itératives, ainsi que les exigences supplémentaires en CAPEX et OPEX, sont modestes. Cette option est particulièrement robuste pour offrir une ségrégation par rapport aux services réseau du contributeur.

#### Bande passante commutée par paquets

Les réseaux commutés par paquets peuvent être considérés comme un réseau d'entreprise typique, exécutant des protocoles standard de routage et de commutation supportant les applications métier. De nombreuses technologies réseau permettent d'atteindre la connectivité, par exemple les extensions de couche 2 (L2) utilisant des tags VLAN.

##### Extension L2
<figure markdown="span">
  ![Image title](images/figure6.png){ width="800" }
  <figcaption>Figure 6 : Réseaux commutés par paquets - Extension L2</figcaption>
</figure>

Une extension L2 comme illustrée dans la figure 6 peut être facilitée par le tagging VLAN. Le port d'un DZD peut être câblé au commutateur réseau interne d'un contributeur, le port du commutateur étant configuré comme port d'accès dans, par exemple, le VLAN 10. Grâce au tagging 802.1q, ce VLAN peut être transporté sur plusieurs sauts de commutateurs sur le réseau du contributeur, se terminant au commutateur interfacé avec le DZD distant.

Cette solution bénéficie d'un support large et d'une mise en œuvre relativement facile tout en créant une segmentation entre DoubleZero et les services internes de couche 3. La bande passante peut être contrôlée en fonction de la vitesse d'interface du commutateur ou routeur interne du contributeur. Une attention particulière doit être portée aux performances sur le réseau L2 interne partagé grâce à des technologies telles que la qualité de service (QoS) ou d'autres politiques de gestion du trafic. Cependant, les investissements supplémentaires en CAPEX et OPEX devraient être modestes si la capacité existante est disponible au sein du réseau cœur du contributeur.

#### Bande passante dédiée tierce
<figure markdown="span">
  ![Image title](images/figure7.png){ width="800" }
  <figcaption>Figure 7 : Bande passante dédiée tierce</figcaption>
</figure>

Bien que la réutilisation de la capacité disponible soit attrayante pour de nombreux contributeurs réseau, on peut également dédier une bande passante nouvellement acquise à DoubleZero. Dans un tel scénario, le DZD se connecterait directement à l'opérateur tiers sans qu'aucun équipement interne du contributeur ne soit en ligne (figure 7).

Cette option est attrayante car elle garantit une bande passante dédiée pour DoubleZero, est simple sur le plan opérationnel et assure une segmentation complète par rapport à tout autre service réseau. Cette option entraînera probablement l'augmentation d'OPEX la plus élevée et nécessite de nouveaux contrats de service avec des opérateurs tiers.

---

## Exigences matérielles

### Contribution de bande passante 100 Gbps

Notez que les quantités ci-dessous reflètent l'équipement nécessaire dans deux centres de données, c'est-à-dire le matériel total requis pour déployer 1 câble à fibre optique pour la contribution de bande passante.

??? warning "*Tous les FPGA sont soumis aux tests finaux. Les contributions 10G peuvent être prises en charge à l'aide de commutateurs Arista 7130LBR avec doubles FPGA Virtex® UltraScale+™ intégrés (si vous avez des questions, DoubleZero Foundation / Malbec Labs se feront un plaisir de fournir plus d'informations).*"

#### Exigences de fonctions et de ports

| Fonction                    | Vitesse du port | Exigence DZ | QTÉ | Note |
|-----------------------------|------------|----------------|-----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Bande passante privée           | 100G       | Oui            | 1   |                                                                                                                                                                   |
| Accès Internet Dédié (DIA) | 10G       | Oui            | 2   |                                                                                                                                                                   |
| DoubleZero eXchange (DZX)   | 100G       | Oui*           | 1   | Doit être pris en charge dès que plus de 3 fournisseurs opèrent dans la même zone métropolitaine ; en amont de cela, des cross-connects ou d'autres arrangements de peering peuvent être utilisés pour s'interconnecter avec d'autres fournisseurs. |
| Gestion                  |            | Non            | 1   | Déterminé par les politiques de gestion internes propres au contributeur.                                                                                                    |
| Console                     |            | Non             | 1   | Déterminé par les politiques de gestion internes propres au contributeur.                                                                                                    |

#### Matériel réseau DZD

| Fabricant     | Modèle            | Référence           | Exigence DZ | QTÉ | Note |
|----------|-----------------|----------------------|----------------|-----|-----------------------------------------------------------|
| AMD*      | V80*           | 24540474    | Oui            | 4   |                                                           |
| Arista   | 7280CR3A        | DCS-7280CR3A-32S    | Oui            | 2   | Des alternatives peuvent être possibles si les délais de livraison sont contraignants. |

---

#### Optiques - 100G

| Fabricant   | Modèle         | Référence     | Exigence DZ | QTÉ | Note |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 100GBASE-LR | QSFP-100G-LR    | Non             | 16  | Le câblage et le choix des optiques sont à la discrétion du contributeur. 100G requis pour connecter les FPGA. |

---

#### Optiques - 10G

| Fabricant   | Modèle         | Référence     | Exigence DZ | QTÉ | Note |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 10GBASE-LR | SFP-10G-LR    | Non             | 2   | Le câblage et le choix des optiques sont à la discrétion du contributeur. |
| Finisar | DynamiX QSA™ | MAM1Q00A-QSA   | Non             | 2   | Le câblage et le choix des optiques sont à la discrétion du contributeur. |

---

#### Adressage IP

| Adressage IP | Taille minimale du sous-réseau | Exigence DZ | Note |
|--------------|-------------------|----------------|----------------------------------------------------------|
| Public IPv4  | /29               | Oui (pour les DZD edge/hybrides)           | Doit être routable via DIA. Nous pourrions éliminer ce besoin au fil du temps. |

Veuillez vous assurer que le pool /29 complet est disponible pour le protocole DZ. Toute exigence d'adressage point à point, par exemple sur les interfaces DIA, doit être gérée via un pool d'adresses différent.

### Contribution de bande passante 10 Gbps

Notez que les quantités reflètent l'équipement de deux centres de données, c'est-à-dire le matériel total requis pour déployer 1 contribution de bande passante.

#### Exigences de fonctions et de ports

| Fonction                    | Vitesse du port | Exigence DZ | QTÉ | Note |
|-----------------------------|------------|----------------|-----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Bande passante privée           | 10G        | Oui            | 1   |                                                                                                                                                                   |
| Accès Internet Dédié (DIA) | 10G        | Oui            | 2   |                                                                                                                                                                   |
| DoubleZero eXchange (DZX)   | 100G       | Oui*           | 1   | Doit être pris en charge dès que plus de 3 fournisseurs opèrent dans la même zone métropolitaine ; en amont de cela, des cross-connects ou d'autres arrangements de peering peuvent être utilisés pour s'interconnecter avec d'autres fournisseurs. |
| Gestion                  |            | Non             | 1   | Déterminé par les politiques de gestion internes propres au contributeur.                                                                                                    |
| Console                     |            | Non             | 1   | Déterminé par les politiques de gestion internes propres au contributeur.                                                                                                    |

---

#### Matériel

| Fabricant     | Modèle            | Référence           | Exigence DZ | QTÉ | Note |
|----------|-----------------|----------------------|----------------|-----|-----------------------------------------------------------|
| AMD*      | V80*           | 24540474*    | Oui            | 4   |                                                           |              |
| Arista   | 7280CR3A        | DCS-7280CR3A-32S    | Oui            | 2   | Des alternatives peuvent être possibles si les délais de livraison sont contraignants. |

---

#### Optiques - 100G

| Fabricant   | Modèle         | Référence     | Exigence DZ | QTÉ | Note |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 100GBASE-LR | QSFP-100G-LR    | Non             | 14  | Le câblage et le choix des optiques sont à la discrétion du contributeur. 100G requis pour connecter les FPGA. |

---

#### Optiques - 10G

| Fabricant   | Modèle         | Référence     | Exigence DZ | QTÉ | Note |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 10GBASE-LR | SFP-10G-LR    | Non             | 4   | Le câblage et le choix des optiques sont à la discrétion du contributeur. |
 Finisar | DynamiX QSA™ | MAM1Q00A-QSA   | Non             | 4   | Le câblage et le choix des optiques sont à la discrétion du contributeur. |
---

#### Adressage IP

| Adressage IP | Taille minimale du sous-réseau | Exigence DZ | Note |
|--------------|-------------------|----------------|----------------------------------------------------------|
| Public IPv4  | /29               | Oui (pour les DZD edge/hybrides)            | Doit être routable via DIA. Nous pourrions éliminer ce besoin au fil du temps. |

Veuillez vous assurer que le pool /29 complet est disponible pour le protocole DZ. Toute exigence d'adressage point à point, par exemple sur les interfaces DIA, doit être gérée via un pool d'adresses différent.

### Exigences du centre de données

#### Exigences en rack et alimentation

| Exigence  | Spécification |
|-------------|--------------|
| Espace rack  | 4U           |
| Alimentation       | 4KW (recommandé) |

---

## Prochaines étapes

Prêt à provisionner votre premier DZD ? Continuez vers le [Guide de provisionnement des appareils](contribute-provisioning.md).