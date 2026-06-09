---
description: Aperçu des acteurs et des composants qui constituent l'architecture du réseau DoubleZero.
---

# Architecture

Quels sont les différents acteurs et composants qui constituent le réseau DoubleZero ?

<figure markdown="span">
  ![Image title](images/figure8.png){ width="800" }
  <figcaption>Figure 1 : Composants de l'architecture réseau</figcaption>
</figure>

## Contributeurs

Le réseau DoubleZero est constitué de contributions en connectivité et en traitement de paquets provenant d'une communauté croissante de fournisseurs d'infrastructure réseau distribués dans des villes à travers le monde. Les contributeurs apportent des liaisons en fibre optique et des ressources de traitement de l'information au protocole afin de fournir le réseau maillé décentralisé.

### Contributeurs en bande passante réseau

Les contributeurs réseau doivent fournir une bande passante dédiée entre deux points, exploiter des appareils compatibles DoubleZero (DZD) à chaque extrémité, ainsi qu'une connexion à Internet à chaque extrémité. Les contributeurs réseau doivent également exécuter le logiciel DoubleZero sur chaque DZD pour fournir des services tels que la multidiffusion, la recherche d'utilisateurs et les services de filtrage en périphérie.

Les liaisons physiques du réseau DoubleZero sont fournies sous forme de câbles à fibre optique, communément appelés services de longueur d'onde. Les contributeurs réseau engagent des liaisons réseau sous-utilisées, détenues ou louées auprès de fournisseurs d'infrastructure, entre deux centres de données ou plus. Ces liaisons sont terminées aux deux extrémités par des DoubleZero Devices, qui sont des boîtiers physiques de commutation réseau exécutant des instances du logiciel DoubleZero Agent.

#### DoubleZero Exchange (DZX / Site d'interconnexion)

Les DoubleZero Exchanges (DZX) sont des points d'interconnexion dans le réseau maillé où les différentes liaisons des contributeurs sont reliées entre elles. Les DZX sont situés dans les grandes zones métropolitaines à travers le monde où se produisent des intersections réseau. Les contributeurs réseau doivent raccorder leurs liaisons au réseau maillé DoubleZero plus large au niveau des DZX géographiquement situés au plus près des extrémités de leurs liaisons.

### Contributeurs en ressources de calcul

Distincts des contributeurs réseau, les contributeurs en ressources sont un groupe décentralisé de participants au réseau qui effectuent diverses tâches de maintenance et de surveillance nécessaires au maintien de l'intégrité technique et du fonctionnement continu du réseau DoubleZero. Plus précisément, ils (i) suivent les transactions et les paiements des utilisateurs ; (ii) calculent les frais pour les contributeurs réseau ; (iii) enregistrent les résultats de (i) et (ii) ; (iv) administrent, strictement de manière non discrétionnaire, les contrats intelligents qui contrôlent la tokenomique du protocole ; (v) relaient les attestations vers la blockchain applicable ; et (vi) publient des données de télémétrie concernant la qualité et l'utilisation des liaisons afin de fournir des métriques de performance transparentes et en temps réel pour tous les contributeurs réseau.

## Composants

### DoubleZero Daemon

Le logiciel DoubleZero Daemon s'exécute sur les serveurs nécessitant une communication via le réseau DoubleZero. Le daemon s'interface avec la pile réseau du noyau de l'hôte pour créer et gérer les interfaces tunnel, les tables de routage et les routes.

### Activator

Le service Activator, hébergé par un ou plusieurs membres contributeurs en ressources de calcul de la communauté DoubleZero, surveille les événements de contrat nécessitant des allocations d'adresses IP et des changements d'état, et gère ces modifications pour le compte du réseau.

### Controller

Le service Controller, hébergé par un ou plusieurs contributeurs en ressources de calcul de la communauté DoubleZero, sert d'interface de configuration pour les DoubleZero Device Agents afin de restituer leur configuration actuelle en fonction des événements des contrats intelligents.

### Agent

Le logiciel Agent s'exécute directement sur les DoubleZero Devices et applique les modifications de configuration aux appareils telles qu'interprétées par le service Controller. Le logiciel Agent interroge le Controller pour détecter les changements de configuration, calcule les différences entre la version canonique on-chain de l'état de l'appareil et la configuration active sur l'appareil, puis applique les modifications nécessaires pour réconcilier la configuration active.

### Device

Le boîtier physique fournissant le routage et la terminaison de liaison pour le réseau DoubleZero. Les DZD exécutent le logiciel DoubleZero Agent et sont configurés en fonction des données lues depuis le service Controller.