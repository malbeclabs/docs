---
description: Definições da terminologia específica do DoubleZero utilizada ao longo da documentação.
---

# Glossário

Esta página define a terminologia específica do DoubleZero utilizada ao longo da documentação.

---

## Infraestrutura de Rede

### DZD (DoubleZero Device)
O hardware físico de comutação de rede que termina os links DoubleZero e executa o software DoubleZero Agent. Os DZDs são implantados em data centers e fornecem serviços de roteamento, processamento de pacotes e conectividade de usuários. Cada DZD requer [especificações de hardware](contribute.md#dzd-network-hardware) específicas e executa tanto o [Config Agent](#config-agent) quanto o [Telemetry Agent](#telemetry-agent).

### DZX (DoubleZero Exchange)
Pontos de interconexão na rede mesh onde os links de diferentes [contribuidores](#contributor) são interligados. Os DZXs estão localizados em grandes áreas metropolitanas (ex.: NYC, LON, TYO) onde ocorrem interseções de rede. Os contribuidores da rede devem fazer a conexão cruzada de seus links na malha mais ampla do DoubleZero no DZX mais próximo. Conceito similar a um Internet Exchange (IX).

### WAN Link
Um link de Rede de Longa Distância (Wide Area Network) entre dois [DZDs](#dzd-doublezero-device) operados pelo **mesmo** contribuidor. Os links WAN fornecem conectividade de backbone dentro da infraestrutura de um único contribuidor.

### DZX Link
Um link entre [DZDs](#dzd-doublezero-device) operados por contribuidores **diferentes**, estabelecido em um [DZX](#dzx-doublezero-exchange). Os links DZX requerem aceitação explícita de ambas as partes.

### DZ Prefix
Alocações de endereços IP no formato CIDR atribuídas a um [DZD](#dzd-doublezero-device) para endereçamento da rede overlay. Especificado durante a [criação do dispositivo](contribute-provisioning.md#step-32-create-your-device-onchain) usando o parâmetro `--dz-prefixes`.

---

## Tipos de Dispositivos

### Edge Device
Um [DZD](#dzd-doublezero-device) que fornece conectividade de usuários à rede DoubleZero. Os dispositivos edge utilizam interfaces [CYOA](#cyoa-choose-your-own-adventure) para terminar usuários (validadores, operadores RPC) e conectá-los à rede.

### Transit Device
Um [DZD](#dzd-doublezero-device) que fornece conectividade de backbone dentro da rede DoubleZero. Os dispositivos transit movem tráfego entre DZDs, mas não terminam conexões de usuários diretamente.

### Hybrid Device
Um [DZD](#dzd-doublezero-device) que combina as funcionalidades de [edge](#edge-device) e [transit](#transit-device), fornecendo tanto conectividade de usuários quanto roteamento de backbone.

---

## Conectividade

### CYOA (Choose Your Own Adventure)
Tipos de interface que permitem aos [contribuidores](#contributor) registrar opções de conectividade para que os usuários se conectem à rede DoubleZero. As interfaces CYOA incluem vários métodos como [DIA](#dia-direct-internet-access), túneis GRE e peering privado. Consulte [Criando Interfaces CYOA](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices) para detalhes de configuração.

### DIA (Direct Internet Access)
Um termo padrão de redes para conectividade fornecida pela internet pública. No DoubleZero, DIA é um tipo de interface [CYOA](#cyoa-choose-your-own-adventure) onde os usuários (validadores, operadores RPC) se conectam a um [DZD](#dzd-doublezero-device) através de sua conexão de internet existente.

### IBRL (Increase Bandwidth Reduce Latency)
Um modo de conexão que permite que validadores e nós RPC se conectem ao DoubleZero sem reiniciar seus clientes blockchain. O IBRL utiliza o endereço IP público existente e estabelece um túnel overlay para o [DZD](#dzd-doublezero-device) mais próximo. Consulte [Conexão Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) para instruções de configuração.

### Multicast
Um método de entrega de pacotes de um-para-muitos suportado pelo DoubleZero. O modo multicast possui dois papéis: **publisher** (envia pacotes pela rede) e **subscriber** (recebe pacotes do publisher). Utilizado por equipes de desenvolvimento para distribuição eficiente de dados. Consulte [Outra Conexão Multicast](Other%20Multicast%20Connection.md) para detalhes de conexão.

---

## Componentes de Software

### doublezerod
O serviço daemon do DoubleZero que é executado nos servidores dos usuários (validadores, nós RPC). Ele gerencia a conexão com a rede DoubleZero, lida com o estabelecimento de túneis e mantém a conectividade com os [DZDs](#dzd-doublezero-device). Configurado via systemd e controlado através da CLI [`doublezero`](#doublezero-cli).

### doublezero (CLI)
A interface de linha de comando para interagir com a rede DoubleZero. Utilizada para conectar, gerenciar identidades, verificar status e operações administrativas. Comunica-se com o daemon [`doublezerod`](#doublezerod).

### Config Agent
Agente de software executado nos [DZDs](#dzd-doublezero-device) que gerencia a configuração do dispositivo. Lê a configuração do serviço [Controller](#controller) e aplica as alterações no dispositivo. Consulte [Instalação do Config Agent](contribute-provisioning.md#step-44-install-config-agent) para configuração.

### Telemetry Agent
Agente de software executado nos [DZDs](#dzd-doublezero-device) que coleta métricas de desempenho (latência, jitter, perda de pacotes) e as submete ao ledger do DoubleZero. Consulte [Instalação do Telemetry Agent](contribute-provisioning.md#step-45-install-telemetry-agent) para configuração.

### Controller
Um serviço que fornece configuração aos agentes dos [DZDs](#dzd-doublezero-device). O Controller deriva as configurações dos dispositivos a partir do estado [onchain](#onchain) no ledger do DoubleZero.

---

## Estados dos Links

### Activated
O estado operacional normal de um link. O tráfego flui pelo link e ele participa das decisões de roteamento.

### Soft-Drained
Um estado de manutenção onde o tráfego será desencorajado em um link específico. Utilizado para janelas de manutenção gradual. Pode transicionar para [activated](#activated) ou [hard-drained](#hard-drained).

### Hard-Drained
Um estado de manutenção onde o link é completamente removido do serviço. Nenhum tráfego flui pelo link. Deve transicionar para [soft-drained](#soft-drained) antes de retornar ao estado [activated](#activated).

---

## Organizações & Tokens

### DZF (DoubleZero Foundation)
A DoubleZero Foundation é uma empresa-fundação sem membros, sem fins lucrativos, das Ilhas Cayman, formada para apoiar o desenvolvimento, descentralização, segurança e adoção da rede DoubleZero.

### 2Z Token
O token nativo da rede DoubleZero. Utilizado para pagamento de taxas de validadores e distribuído como recompensas aos [contribuidores](#contributor). Validadores podem pagar taxas em 2Z através de um programa de swap onchain. Consulte [Trocando SOL por 2Z](Swapping-sol-to-2z.md).

### Contributor
Um provedor de infraestrutura de rede que contribui com largura de banda e hardware para a rede DoubleZero. Os contribuidores operam [DZDs](#dzd-doublezero-device), fornecem links [WAN](#wan-link) e [DZX](#dzx-link), e recebem incentivos em tokens [2Z](#2z-token) por sua contribuição. Consulte a [Documentação para Contribuidores](contribute-overview.md) para começar.

---

## Conceitos de Rede

### MTU (Maximum Transmission Unit)
O maior tamanho de pacote (em bytes) que pode ser transmitido por um link de rede. Os links WAN do DoubleZero tipicamente utilizam MTU 9000 (jumbo frames) para eficiência.

### VRF (Virtual Routing and Forwarding)
Uma tecnologia que permite que múltiplas tabelas de roteamento isoladas existam no mesmo roteador físico. Os contribuidores frequentemente utilizam um VRF de gerenciamento separado para isolar o tráfego de gerenciamento do switch do tráfego de produção.

### GRE (Generic Routing Encapsulation)
Um protocolo de tunelamento que encapsula pacotes de rede dentro de pacotes IP. Utilizado por conexões [IBRL](#ibrl-increase-bandwidth-reduce-latency) e [CYOA](#cyoa-choose-your-own-adventure) para criar túneis overlay entre usuários e DZDs.

### BGP (Border Gateway Protocol)
O protocolo de roteamento utilizado para troca de informações de roteamento entre redes na internet. O DoubleZero utiliza BGP internamente com ASN 65342.

### ASN (Autonomous System Number)
Um identificador único atribuído a uma rede para roteamento BGP. Todos os dispositivos DoubleZero utilizam **ASN 65342** para o processo BGP interno.

### Loopback Interface
Uma interface de rede virtual em um roteador/switch utilizada para fins de gerenciamento e roteamento. Os DZDs utilizam Loopback255 (VPNv4) e Loopback256 (IPv4) para roteamento interno.

### CIDR (Classless Inter-Domain Routing)
Uma notação para especificar faixas de endereços IP. O formato é `IP/prefix-length` onde o comprimento do prefixo indica o tamanho da rede (ex.: `/29` = 8 endereços, `/24` = 256 endereços).

### Jitter
Variação na latência dos pacotes ao longo do tempo. Baixo jitter é crítico para aplicações em tempo real.

### RTT (Round-Trip Time)
O tempo para um pacote viajar da origem ao destino e retornar. Utilizado para medir a latência de rede entre dispositivos.

### TWAMP (Two-Way Active Measurement Protocol)
Um protocolo para medir métricas de desempenho de rede como latência e perda de pacotes. O [Telemetry Agent](#telemetry-agent) utiliza TWAMP para coletar métricas entre DZDs.

### IS-IS (Intermediate System to Intermediate System)
Um protocolo de roteamento de estado de link utilizado internamente pela rede DoubleZero. As métricas IS-IS são ajustadas durante operações de [drenagem de link](#soft-drained).

---

## Geolocalização

### Geolocalização
Um serviço do DoubleZero que verifica a localização física dos dispositivos utilizando medições de latência. Medições de [RTT](#rtt-round-trip-time) entre infraestrutura de localização conhecida ([DZDs](#dzd-doublezero-device)) e dispositivos-alvo fornecem prova assinada criptograficamente de que um dispositivo está dentro de uma certa distância de um ponto de referência. O registro onchain das medições está planejado para uma versão futura. Consulte [Geolocalização](geolocation.md) para documentação do usuário.

### geoProbe
Um servidor bare metal que atua como intermediário para medições de latência no sistema de [Geolocalização](#geolocalização). Os geoProbes estão localizados a ~1ms de um [DZD](#dzd-doublezero-device), recebem LocationOffsets assinados dos DZDs pai e medem [RTT](#rtt-round-trip-time) para dispositivos-alvo via [TWAMP](#twamp-two-way-active-measurement-protocol), TWAMP assinado ou ICMP echo. Cada geoProbe é registrado [onchain](#onchain) e vinculado a um ou mais DZDs pai. Consulte [Implantação de Geoprobe](contribute-geolocation.md) para documentação de contribuidores.

### LocationOffset
Uma estrutura de dados assinada contendo a localização geográfica de um [DZD](#dzd-doublezero-device) (latitude e longitude) e uma cadeia de relações de latência entre entidades (DZD↔Probe ou Probe↔Alvo). Os LocationOffsets são assinados com Ed25519 e enviados via UDP através da cadeia de medição. Offsets compostos incluem referências a medições anteriores, criando uma trilha auditável.

---

## Blockchain & Chaves

### Onchain
No contexto do DoubleZero, onchain refere-se a dados e operações registrados no ledger do DoubleZero. Diferente de redes tradicionais onde as configurações de dispositivos e links residem em sistemas de gerenciamento centralizados, o DoubleZero registra registros de dispositivos, configurações de links e submissões de telemetria onchain — tornando o estado da rede transparente e verificável por todos os participantes.

### Service Key
Um par de chaves criptográficas utilizado para autenticar operações da CLI. Esta é sua identidade de contribuidor para interagir com o smart contract do DoubleZero. Armazenada em `~/.config/solana/id.json`.

### Metrics Publisher Key
Um par de chaves criptográficas utilizado pelo [Telemetry Agent](#telemetry-agent) para assinar submissões de métricas na blockchain. Separada da service key para isolamento de segurança. Armazenada em `~/.config/doublezero/metrics-publisher.json`.

### Rewards Manager Key
Um par de chaves criptográficas que controla para onde as recompensas de um contribuidor são pagas. Ele assina alterações na lista de carteiras destinatárias, mas nunca detém recompensas em si. Registrada contra a [Service Key](#service-key) do contribuidor pela [DZF](#dzf-doublezero-foundation). Consulte [Gerenciamento de Recompensas](contribute-rewards.md).

---

## Hardware & Software

### EOS (Extensible Operating System)
O sistema operacional de rede da Arista que é executado nos switches DZD. Os contribuidores instalam o [Config Agent](#config-agent) e o [Telemetry Agent](#telemetry-agent) como extensões EOS.

### EOS Extension
Um pacote de software que pode ser instalado em switches Arista EOS. Os agentes DZ são distribuídos como arquivos `.rpm` e instalados via o comando `extension`.