# Architecture

Quels sont les différents acteurs et composants du réseau DoubleZero ?

<figure markdown="span">
  ![Image title](images/figure8.png){ width="800" }
  <figcaption>Figure 1 : Composants de l'architecture réseau</figcaption>
</figure>

## Contributeurs

Le réseau DoubleZero est composé de contributions en matière de connectivité et de traitement des paquets d'une communauté croissante de fournisseurs d'infrastructure réseau distribués dans des villes du monde entier. Les contributeurs apportent des liens en câble fibre optique et des ressources de traitement de l'information au protocole pour fournir le réseau maillé décentralisé.

### Contributeurs en Bande Passante Réseau

Les contributeurs réseau doivent fournir une bande passante dédiée entre deux points, exploiter des dispositifs compatibles DoubleZero (DZD) à chaque extrémité, et une connexion à internet à chaque extrémité. Les contributeurs réseau doivent également exécuter le logiciel DoubleZero sur chaque DZD pour fournir des services tels que le multicast, la recherche d'utilisateurs et les services de filtration en périphérie.

Les liens physiques du réseau DoubleZero sont fournis sous forme de câbles en fibre optique, communément appelés services à longueur d'onde. Les contributeurs réseau s'engagent avec des liens réseau sous-utilisés, possédés ou loués auprès de fournisseurs d'infrastructure, entre deux ou plusieurs centres de données. Ces liens sont terminés aux deux extrémités par des DoubleZero Devices, qui sont des boîtiers de commutation réseau physiques exécutant des instances du logiciel DoubleZero Agent.

#### DoubleZero Exchange (DZX / Site de Cross-connect)

Les DoubleZero Exchanges (DZX) sont des points d'interconnexion dans le réseau maillé où différents liens de contributeurs sont reliés ensemble. Les DZX sont situés dans les grandes zones métropolitaines du monde entier où se produisent les intersections de réseau. Les contributeurs réseau doivent cross-connecter leurs liens dans le réseau maillé DoubleZero plus large au niveau des DZX situés géographiquement le plus près de leurs extrémités de liens.

### Contributeurs en Ressources Informatiques

Séparément des contributeurs réseau, les contributeurs en ressources sont un groupe décentralisé de participants réseau qui effectuent diverses tâches de maintenance et de surveillance nécessaires pour maintenir l'intégrité technique et la fonctionnalité continue du réseau DoubleZero. Plus précisément, ils (i) suivent les transactions et les paiements des utilisateurs ; (ii) calculent les frais pour les contributeurs réseau ; (iii) enregistrent les résultats de (i) et (ii) ; (iv) administrent, strictement sur une base non discrétionnaire, les contrats intelligents qui contrôlent la tokenomique du protocole ; (v) transmettent les attestations à la blockchain applicable ; et (vi) publient des données de télémétrie sur la qualité et l'utilisation des liens pour fournir des métriques de performance transparentes en temps réel pour tous les contributeurs réseau.

## Composants

### DoubleZero Daemon

Le logiciel DoubleZero Daemon s'exécute sur les serveurs qui ont besoin de communiquer sur le réseau DoubleZero. Le daemon s'interface avec la pile réseau du noyau de l'hôte pour créer et gérer les interfaces de tunnel, les tables de routage et les routes.

### Activateur

Le service Activateur, hébergé par un ou plusieurs membres contributeurs en ressources informatiques de la communauté DoubleZero, surveille les événements de contrat nécessitant des allocations d'adresses IP et des changements d'état, et gère ces changements au nom du réseau.

### Contrôleur

Le service Contrôleur, hébergé par un ou plusieurs contributeurs en ressources informatiques de la communauté DoubleZero, sert d'interface de configuration pour que les DoubleZero Device Agents rendent leur configuration actuelle basée sur les événements de contrat intelligent.

### Agent

Le logiciel Agent s'exécute directement sur les DoubleZero Devices et applique les changements de configuration aux dispositifs tels qu'interprétés par le service Contrôleur. Le logiciel Agent interroge le Contrôleur pour les changements de configuration, calcule toute différence entre la version canonique on-chain de l'état du Device et la configuration active sur le dispositif et applique les changements nécessaires pour réconcilier la configuration active.

### Dispositif

Le boîtier de dispositif physique fournissant le routage et la terminaison de liens pour le réseau DoubleZero. Les DZD exécutent le logiciel DoubleZero Agent et sont configurés sur la base des données lues depuis le service Contrôleur.
