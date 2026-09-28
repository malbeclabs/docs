---
description: Requisitos de hardware, largura de banda e conectividade, bem como arquitetura para contribuir com capacidade para a rede DoubleZero.
---

# Requisitos e Arquitetura para Contribuidores

## Resumo

Qualquer pessoa que deseje monetizar seus cabos de fibra óptica e hardware de rede subutilizados pode contribuir para a rede DoubleZero. Os contribuidores de rede devem fornecer largura de banda dedicada entre dois pontos, operar dispositivos compatíveis com DoubleZero (DZDs) em cada extremidade e uma conexão à internet pública em cada extremidade. Os contribuidores de rede também devem executar o software DoubleZero em cada DZD para fornecer serviços como multicast, busca de usuários e filtragem de borda.

O contrato inteligente DoubleZero é a pedra angular para garantir que a rede mantenha links de alta qualidade que possam ser medidos e integrados à topologia, permitindo que nossos controladores de rede desenvolvam o caminho ponta a ponta mais eficiente entre nossos diferentes usuários e endpoints. Após a execução do contrato inteligente e implantação do equipamento de rede e largura de banda, uma entidade é classificada como contribuidor de rede. Consulte [DoubleZero Economics](https://economics.doublezero.xyz/overview) para entender melhor a economia por trás da participação no DoubleZero como contribuidor de rede.

---

## Requisitos para ser um Contribuidor de Rede DoubleZero

- Largura de banda dedicada que possa fornecer conectividade IPv4 e um MTU de 2048 bytes entre dois data centers
- Hardware DoubleZero Device (DZD) compatível com o protocolo DoubleZero
- Conectividade com a internet e outros contribuidores de rede DoubleZero
- Instalação do software DoubleZero no DZD

## Guia de Início Rápido

Como contribuidor de rede, a maneira mais simples de começar no DoubleZero é identificando capacidade na sua rede que possa ser dedicada ao DoubleZero. Uma vez identificada, os DZDs devem ser implantados, facilitando a rede overlay DoubleZero que requer apenas alcançabilidade IPv4 e um MTU mínimo de 2048 bytes como suas dependências da rede do contribuidor.

A Figura 1 destaca o modelo mais simples para contribuição de largura de banda e serviços de envio e processamento de pacotes. Um DZD é implantado em cada data center, fazendo interface com a rede interna do contribuidor de rede para fornecer conectividade WAN DoubleZero. Isso é complementado por internet local, tipicamente uma solução de Acesso Direto à Internet (DIA), que é usada como pontos de entrada para usuários DoubleZero. Embora se espere que o DIA seja a opção preferida para facilitar o acesso aos usuários do DoubleZero, diversos modelos de conectividade são possíveis, por exemplo, cabeamento físico para servidores, extensão de fabric de rede, etc. Referimo-nos a essas opções como Choose Your Own Adventure (CYOA), proporcionando ao contribuidor flexibilidade para conectar usuários locais ou remotos da maneira que melhor se adeque às suas políticas internas de rede.

Como em qualquer rede, a alcançabilidade é uma parte fundamental da arquitetura, pois os contribuidores de rede não podem existir isoladamente. Assim, o DZD *deve* ter um link para um DoubleZero Exchange (DZX) para criar uma rede contígua entre os participantes.

<figure markdown="span">
  ![Image title](images/figure1.png){ width="800" }
  <figcaption>Figura 1: Contribuição de Largura de Banda da Rede DoubleZero Entre 2 Data Centers - Contribuidor Único</figcaption>
</figure>

### Exemplos de Contribuições

As maneiras pelas quais um contribuidor de rede pode expandir suas contribuições ao DoubleZero são muitas, incluindo:

- Melhorar as características de desempenho de suas contribuições existentes: aumentar largura de banda, reduzir latência
- Adicionar múltiplos links entre os mesmos data centers
- Adicionar um novo link de um data center existente para um novo data center
- Adicionar um novo link independente entre dois novos data centers

#### Exemplo 1: Contribuidor Único, 3 Data Centers, Dois Links
<figure markdown="span">
  ![Image title](images/figure2.png){ width="800" }
  <figcaption>Figura 2: Contribuição de Largura de Banda da Rede DoubleZero Entre 3 Data Centers - Contribuidor Único</figcaption>
</figure>

Um único DZD pode suportar múltiplos links contribuídos ao DoubleZero. A Figura 2 ilustra uma topologia potencial se um único data center, denominado como 1, terminar largura de banda para dois data centers remotos diferentes, 2 e 3. Neste cenário, cada data center contém apenas 1 DZD. Todos os DZDs estão usando DIA para pontos de entrada de usuários como sua interface CYOA.

#### Exemplo 2: Contribuidor Único, 3 Data Centers, Três Links

A Figura 3 descreve a topologia DoubleZero quando um único contribuidor implanta três links em uma topologia triangular entre 3 data centers. Em um cenário semelhante ao exemplo 1, um único DZD é implantado nos data centers 1, 2 e 3, cada um suportando 2 links de rede independentes. A topologia resultante é um triângulo ou anel entre data centers.

<figure markdown="span">
  ![Image title](images/figure3.png){ width="800" }
  <figcaption>Figura 3: Contribuição de Largura de Banda da Rede DoubleZero Entre 3 Data Centers - Contribuidor Único</figcaption>
</figure>

### DoubleZero Exchange

A criação de uma rede contígua é um bloco fundamental da arquitetura DoubleZero. Os contribuidores se interconectam via um DoubleZero Exchange (DZX) dentro de uma área metropolitana, que é uma cidade como Nova York (NYC), Londres (LON) ou Tóquio (TYO). Um DZX é um fabric de rede semelhante a um Internet Exchange, permitindo peering e troca de rotas.

Na Figura 4, o contribuidor de rede 1 opera nos data centers 1, 2 e 3, enquanto o contribuidor de rede 2 opera nos data centers 2, 4 e 5. Ao se interconectar no data center 2, o alcance da rede DoubleZero aumenta para 5 data centers contíguos.

<figure markdown="span">
  ![Image title](images/figure4.png){ width="1000" }
  <figcaption>Figura 4: Contribuição de Largura de Banda da Rede DoubleZero Entre 2 Contribuidores de Largura de Banda de Rede</figcaption>
</figure>

### Opções de Contribuição de Largura de Banda

O DoubleZero requer que um contribuidor de rede ofereça conectividade integrada via um perfil garantido de largura de banda, latência e jitter entre DZDs em dois data centers terminais, expresso por meio de um contrato inteligente. O DoubleZero não determina como um contribuidor de rede implementa sua contribuição; no entanto, nas seções seguintes, fornecemos opções indicativas para uso a seu exclusivo critério.

Áreas importantes a serem consideradas por um contribuidor de rede podem ser:

- Capacidade de garantir o desempenho de rede do serviço DoubleZero: largura de banda, latência e jitter
- Segregação de seus serviços de rede internos existentes
- Conflitos de endereçamento IPv4, especificamente com o espaço de endereços do underlay do túnel
- Tempo de atividade e disponibilidade
- Considerações de CAPEX e OPEX

#### Largura de Banda Camada 1
<figure markdown="span">
  ![Image title](images/figure5.png){ width="800" }
  <figcaption>Figura 5: Serviços Ópticos Camada 1</figcaption>
</figure>

A largura de banda Camada 1, mais formalmente descrita como serviços de comprimento de onda, pode ter capacidade dedicada provisionada em uma infraestrutura óptica existente, como DWDM, CWDM ou via multiplexadores ópticos (MUX). Na Figura 5, os DZDs usam uma óptica colorida que é cabeada a um MUX L1, que intercala o comprimento de onda do DZD em uma fibra escura existente.

Esta solução tem inúmeros benefícios para contribuidores de rede que já operam uma rede core existente. As mudanças operacionais iterativas, bem como os requisitos adicionais de CAPEX e OPEX, são modestos. Esta opção é particularmente robusta em oferecer segregação dos serviços de rede do contribuidor.

#### Largura de Banda Comutada por Pacotes

Redes comutadas por pacotes podem ser consideradas uma rede corporativa típica, executando protocolos padrão de roteamento e comutação que suportam aplicações de negócios. Existem inúmeras tecnologias de rede que alcançam conectividade, por exemplo, extensões de camada 2 (L2) usando tags VLAN.

##### Extensão L2
<figure markdown="span">
  ![Image title](images/figure6.png){ width="800" }
  <figcaption>Figura 6: Redes Comutadas por Pacotes - Extensão L2</figcaption>
</figure>

Uma extensão L2, conforme mostrado na Figura 6, pode ser facilitada através de marcação VLAN. A porta de um DZD pode ser cabeada ao switch da rede interna do contribuidor, com a porta do switch sendo configurada como uma porta de acesso em, por exemplo, VLAN 10. Através da marcação 802.1q, esta VLAN pode ser transportada por múltiplos saltos de switch na rede do contribuidor, terminando no switch que faz interface com o DZD remoto.

Esta solução se beneficia por ser amplamente suportada e relativamente fácil de implementar, criando segmentação entre o DoubleZero e os serviços internos de camada 3. A largura de banda pode ser controlada com base na velocidade da interface do switch ou roteador interno do contribuidor. Consideração cuidadosa deve ser dada ao desempenho na rede L2 interna compartilhada através de tecnologias como Qualidade de Serviço (QoS) ou outras políticas de gerenciamento de tráfego. No entanto, investimentos adicionais de CAPEX e OPEX devem ser modestos se capacidade existente estiver disponível na rede core do contribuidor.

#### Largura de Banda Dedicada de Terceiros
<figure markdown="span">
  ![Image title](images/figure7.png){ width="800" }
  <figcaption>Figura 7: Largura de Banda Dedicada de Terceiros</figcaption>
</figure>

Embora a reutilização da capacidade disponível seja atraente para muitos contribuidores de rede, também é possível dedicar largura de banda recém-adquirida ao DoubleZero. Em tal cenário, o DZD se conectaria diretamente à operadora de terceiros sem nenhum dispositivo interno do contribuidor em linha (Figura 7).

Esta opção é atraente pois garante largura de banda dedicada para o DoubleZero, é operacionalmente simples e assegura segmentação completa de quaisquer outros serviços de rede. Esta opção provavelmente terá o maior aumento de OPEX e requer novos contratos de serviço com operadoras de terceiros.

---

## Requisitos de Hardware

### Contribuição de Largura de Banda de 100Gbps

Observe que as quantidades abaixo refletem o equipamento necessário em dois data centers, ou seja, o total de hardware necessário para implantar 1 cabo de fibra óptica para contribuição de largura de banda.

??? warning "*Todos os FPGAs estão sujeitos a testes finais. Contribuições de 10G podem ser suportadas usando switches Arista 7130LBR com FPGAs Virtex® UltraScale+™ duplos integrados (se você tiver alguma dúvida, a DoubleZero Foundation / Malbec Labs terá prazer em fornecer mais informações)."

#### Requisitos de Função e Portas

| Função                      | Velocidade da Porta | Requisito DZ | QTD | Nota |
|-----------------------------|------------|----------------|-----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Private Bandwidth           | 100G       | Sim            | 1   |                                                                                                                                                                   |
| Direct Internet Access (DIA) | 10G       | Sim            | 2   |                                                                                                                                                                   |
| DoubleZero eXchange (DZX)   | 100G       | Sim*           | 1   | Deve ser suportado quando mais de 3 provedores operam na mesma área metropolitana; antes disso, cross-connects ou outros arranjos de peering podem ser usados para interconectar com outros provedores. |
| Gerenciamento               |            | Não            | 1   | Determinado pelas políticas internas de gerenciamento do contribuidor.                                                                                            |
| Console                     |            | Não            | 1   | Determinado pelas políticas internas de gerenciamento do contribuidor.                                                                                            |

#### Hardware de Rede DZD

| Fabricante | Modelo          | Número de Peça        | Requisito DZ | QTD | Nota |
|----------|-----------------|----------------------|----------------|-----|-----------------------------------------------------------|
| AMD*      | V80*           | 24540474    | Sim            | 4   |                                                           |
| Arista   | 7280CR3A        | DCS-7280CR3A-32S    | Sim            | 2   | Alternativas podem ser possíveis se os prazos de entrega forem desafiadores. |

---

#### Ópticas - 100G

| Fabricante | Modelo        | Número de Peça  | Requisito DZ | QTD | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 100GBASE-LR | QSFP-100G-LR    | Não            | 16  | Cabeamento e escolha de óptica disponíveis a critério do contribuidor. 100G necessário para conectar FPGAs. |

---

#### Ópticas - 10G

| Fabricante | Modelo        | Número de Peça  | Requisito DZ | QTD | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 10GBASE-LR | SFP-10G-LR    | Não            | 2   | Cabeamento e escolha de óptica disponíveis a critério do contribuidor. |
| Finisar | DynamiX QSA™ | MAM1Q00A-QSA   | Não            | 2   | Cabeamento e escolha de óptica disponíveis a critério do contribuidor. |

---

#### Endereçamento IP

| Endereçamento IP | Tamanho Mínimo da Sub-rede | Requisito DZ | Nota |
|--------------|-------------------|----------------|----------------------------------------------------------|
| Public IPv4  | /29               | Sim (para DZDs de borda/híbridos) | Deve ser roteável via DIA. Podemos eliminar a necessidade disso ao longo do tempo. |

Certifique-se de que o pool /29 completo esteja disponível para o protocolo DZ. Quaisquer requisitos de endereçamento ponto a ponto, por exemplo, em interfaces DIA, devem ser gerenciados por meio de um pool de endereços diferente.

### Contribuição de Largura de Banda de 10Gbps

Observe que as quantidades refletem o equipamento de dois data centers, ou seja, o total de hardware necessário para implantar 1 contribuição de largura de banda.

#### Requisitos de Função e Portas

| Função                      | Velocidade da Porta | Requisito DZ | QTD | Nota |
|-----------------------------|------------|----------------|-----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Private Bandwidth           | 10G        | Sim            | 1   |                                                                                                                                                                   |
| Direct Internet Access (DIA) | 10G        | Sim            | 2   |                                                                                                                                                                   |
| DoubleZero eXchange (DZX)   | 100G       | Sim*           | 1   | Deve ser suportado quando mais de 3 provedores operam na mesma área metropolitana; antes disso, cross-connects ou outros arranjos de peering podem ser usados para interconectar com outros provedores. |
| Gerenciamento               |            | Não            | 1   | Determinado pelas políticas internas de gerenciamento do contribuidor.                                                                                            |
| Console                     |            | Não            | 1   | Determinado pelas políticas internas de gerenciamento do contribuidor.                                                                                            |

---

#### Hardware

| Fabricante | Modelo          | Número de Peça        | Requisito DZ | QTD | Nota |
|----------|-----------------|----------------------|----------------|-----|-----------------------------------------------------------|
| AMD*      | V80*           | 24540474*    | Sim            | 4   |                                                           |              |
| Arista   | 7280CR3A        | DCS-7280CR3A-32S    | Sim            | 2   | Alternativas podem ser possíveis se os prazos de entrega forem desafiadores. |

---

#### Ópticas - 100G

| Fabricante | Modelo        | Número de Peça  | Requisito DZ | QTD | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 100GBASE-LR | QSFP-100G-LR    | Não            | 14  | Cabeamento e escolha de óptica disponíveis a critério do contribuidor. 100G necessário para conectar FPGAs. |

---

#### Ópticas - 10G

| Fabricante | Modelo        | Número de Peça  | Requisito DZ | QTD | Nota |
|--------|-------------|----------------|----------------|-----|-------------------------------------------------------------|
| Arista | 10GBASE-LR | SFP-10G-LR    | Não            | 4   | Cabeamento e escolha de óptica disponíveis a critério do contribuidor. |
 Finisar | DynamiX QSA™ | MAM1Q00A-QSA   | Não            | 4   | Cabeamento e escolha de óptica disponíveis a critério do contribuidor. |
---

#### Endereçamento IP

| Endereçamento IP | Tamanho Mínimo da Sub-rede | Requisito DZ | Nota |
|--------------|-------------------|----------------|----------------------------------------------------------|
| Public IPv4  | /29               | Sim (para DZDs de borda/híbridos) | Deve ser roteável via DIA. Podemos eliminar a necessidade disso ao longo do tempo. |

Certifique-se de que o pool /29 completo esteja disponível para o protocolo DZ. Quaisquer requisitos de endereçamento ponto a ponto, por exemplo, em interfaces DIA, devem ser gerenciados por meio de um pool de endereços diferente.

### Requisitos do Data Center

#### Requisitos de Rack e Energia

Os valores abaixo são **por DZD**, portanto por data center. Uma contribuição de largura de banda de 100G ou 10G coloca um DZD em cada extremidade do link, então planeje isso duas vezes.

##### Espaço em rack

| Item | Unidades de rack | Necessário |
|------|-----------|--------|
| Switch DZD (Arista 7280CR3A-32S ou 7130LBR) | 1U | Agora |
| Appliance de filtragem de borda | 1U | Posteriormente, apenas em dispositivos de borda e híbridos |

**Reserve 2U por DZD.** Uma unidade está em uso hoje. Mantenha a segunda livre para que o appliance de filtragem de borda possa ser instalado próximo ao switch sem necessidade de remanejamento no rack. Deixe espaço para fluxo de ar e gerenciamento de cabos conforme sua instalação exigir.

##### Energia

| Item | Consumo típico |
|------|-------------|
| Arista 7280CR3A-32S | ~300 W |
| Ópticas, por 100G QSFP | ~5 W |

**Solicite 2 kW por DZD, divididos em duas alimentações independentes.** Dimensione cada alimentação para suportar toda a carga sozinha. O switch possui fontes de alimentação redundantes e, após uma falha de alimentação, uma delas pode ser tudo o que resta.

2 kW é confortável em vez de justo. Um DZD apenas com switch, que é o que quase toda implantação executa hoje, consome bem abaixo de 500 W com todas as suas ópticas acesas. O restante dos 2 kW é reservado para o appliance de filtragem de borda, que contém os FPGAs e será instalado posteriormente.

!!! warning "Não solicite energia em excesso"
    Você paga pela energia que reserva, independentemente de utilizá-la ou não. Um DZD é uma única unidade de rack de comutação, não um chassi de computação, portanto consome muito menos do que sua posição no rack poderia fornecer. Reservar mais de 2 kW por DZD significa pagar por capacidade que fica ociosa.

!!! note "Verifique seu próprio hardware antes de fazer o pedido"
    Estes são valores de referência de nossas próprias implantações. Seu consumo real depende da configuração da fonte de alimentação, quantas portas você ativa e quais ópticas você escolhe. Confirme com as especificações de potência da fonte de alimentação na ficha técnica do fabricante para o hardware exato que você comprar.

    Também não reduza o pedido ao mínimo absoluto. A energia precisa estar disponível no rack, e adicionar uma alimentação posteriormente geralmente significa um novo pedido com a instalação, o que pode levar semanas.

---

## Próximos Passos

Pronto para provisionar seu primeiro DZD? Continue para o [Guia de Provisionamento de Dispositivos](contribute-provisioning.md).