---
description: Visão geral dos atores e componentes que compõem a arquitetura de rede do DoubleZero.
---

# Arquitetura

O que compõe os diferentes atores e componentes da rede DoubleZero?

<figure markdown="span">
  ![Image title](images/figure8.png){ width="800" }
  <figcaption>Figura 1: Componentes da arquitetura de rede</figcaption>
</figure>

## Contribuidores

A rede DoubleZero é composta por contribuições de conectividade e processamento de pacotes de uma comunidade crescente de provedores de infraestrutura de rede distribuída em cidades ao redor do mundo. Os contribuidores trazem links de cabos de fibra óptica e recursos de processamento de informação ao protocolo para fornecer a rede mesh descentralizada.

### Contribuidores de Largura de Banda de Rede

Os contribuidores de rede devem fornecer largura de banda dedicada entre dois pontos, operar dispositivos compatíveis com DoubleZero (DZDs) em cada extremidade e uma conexão à internet em cada extremidade. Os contribuidores de rede também devem executar o software DoubleZero em cada DZD para fornecer serviços como multicast, busca de usuários e serviços de filtragem de borda.

Os links físicos da rede DoubleZero são fornecidos na forma de cabos de fibra óptica, comumente referidos como serviços de comprimento de onda. Os contribuidores de rede comprometem links de rede subutilizados, próprios ou alugados de provedores de infraestrutura, entre dois ou mais data centers. Esses links são terminados em ambas as extremidades por DoubleZero Devices, que são gabinetes físicos de comutação de rede executando instâncias do software DoubleZero Agent.

#### DoubleZero Exchange (DZX / Ponto de Interconexão)

Os DoubleZero Exchanges (DZXs) são pontos de interconexão na rede mesh onde diferentes links de contribuidores são interligados. Os DZXs estão localizados em grandes áreas metropolitanas ao redor do mundo onde ocorrem interseções de rede. Os contribuidores de rede devem interconectar seus links à rede mesh mais ampla do DoubleZero nos DZXs geograficamente localizados mais próximos dos pontos de término de seus links.

### Contribuidores de Recursos Computacionais

Separados dos contribuidores de rede, os contribuidores de recursos são um grupo descentralizado de participantes da rede que realizam diversas tarefas de manutenção e monitoramento necessárias para sustentar a integridade técnica e a funcionalidade contínua da rede DoubleZero. Especificamente, eles (i) rastreiam transações e pagamentos dos usuários; (ii) calculam taxas para os contribuidores de rede; (iii) registram os resultados de (i) e (ii); (iv) administram, estritamente em base não discricionária, os contratos inteligentes que controlam a tokenomics do protocolo; (v) retransmitem atestações para a blockchain aplicável; e (vi) publicam dados de telemetria sobre a qualidade e utilização dos links para fornecer métricas de desempenho transparentes e em tempo real para todos os contribuidores de rede.

## Componentes

### DoubleZero Daemon

O software DoubleZero Daemon é executado em servidores que precisam se comunicar pela rede DoubleZero. O daemon interage com a pilha de rede do kernel do host para criar e gerenciar interfaces de túnel, tabelas de roteamento e rotas.

### Activator

O serviço Activator, hospedado por um ou mais membros contribuidores de recursos computacionais da comunidade DoubleZero, monitora eventos de contrato que requerem alocações de endereços IP e mudanças de estado, e gerencia essas mudanças em nome da rede.

### Controller

O serviço Controller, hospedado por um ou mais contribuidores de recursos computacionais da comunidade DoubleZero, serve como a interface de configuração para os DoubleZero Device Agents renderizarem sua configuração atual com base em eventos de contratos inteligentes.

### Agent

O software Agent é executado diretamente nos DoubleZero Devices e aplica alterações de configuração aos dispositivos conforme interpretado pelo serviço Controller. O software Agent consulta o Controller em busca de alterações de configuração, calcula quaisquer diferenças entre a versão canônica on-chain do estado do Device e a configuração ativa no dispositivo, e aplica as mudanças necessárias para reconciliar a configuração ativa.

### Device

O gabinete físico do dispositivo que fornece o roteamento e a terminação de link para a rede DoubleZero. Os DZDs executam o software DoubleZero Agent e são configurados com base nos dados lidos do serviço Controller.