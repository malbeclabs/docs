# Glossário

Esta página define a terminologia específica do DoubleZero usada em toda a documentação.

---

## Infraestrutura de Rede

### DZD (Dispositivo DoubleZero)
O hardware de switching de rede físico que termina links DoubleZero e executa o software DoubleZero Agent. Os DZDs são implantados em data centers e fornecem serviços de roteamento, processamento de pacotes e conectividade de usuários. Cada DZD requer [especificações de hardware](contribute.md#dzd-network-hardware) específicas e executa tanto o [Config Agent](#config-agent) quanto o [Telemetry Agent](#telemetry-agent).

### DZX (DoubleZero Exchange)
Pontos de interconexão na rede mesh onde diferentes links de [contribuidores](#contributor) são conectados. Os DZXs estão localizados nas principais áreas metropolitanas (por exemplo, NYC, LON, TYO) onde ocorrem interseções de rede. Os contribuidores de rede devem fazer cross-connect de seus links na mesh DoubleZero mais ampla no DZX mais próximo. Semelhante em conceito a um Internet Exchange (IX).

### Link WAN
Um link de Wide Area Network entre dois [DZDs](#dzd-doublezero-device) operados pelo **mesmo** contribuidor. Os links WAN fornecem conectividade de backbone dentro da infraestrutura de um único contribuidor.

### Link DZX
Um link entre [DZDs](#dzd-doublezero-device) operados por **diferentes** contribuidores, estabelecido em um [DZX](#dzx-doublezero-exchange). Os links DZX requerem aceitação explícita de ambas as partes.

### Prefixo DZ
Alocações de endereços IP em formato CIDR atribuídas a um [DZD](#dzd-doublezero-device) para endereçamento de rede overlay. Especificado durante a [criação de dispositivos](contribute-provisioning.md#step-32-create-your-device-onchain) usando o parâmetro `--dz-prefixes`.

---

## Tipos de Dispositivos

### Dispositivo de Borda
Um [DZD](#dzd-doublezero-device) que fornece conectividade de usuários à rede DoubleZero. Os dispositivos de borda utilizam interfaces [CYOA](#cyoa-choose-your-own-adventure) para terminar usuários (validadores, operadores de RPC) e conectá-los à rede.

### Dispositivo de Trânsito
Um [DZD](#dzd-doublezero-device) que fornece conectividade de backbone dentro da rede DoubleZero. Os dispositivos de trânsito movem tráfego entre DZDs, mas não terminam conexões de usuários diretamente.

### Dispositivo Híbrido
Um [DZD](#dzd-doublezero-device) que combina funcionalidade de [borda](#edge-device) e [trânsito](#transit-device), fornecendo tanto conectividade de usuários quanto roteamento de backbone.

---

## Conectividade

### CYOA (Choose Your Own Adventure)
Tipos de interface que permitem aos [contribuidores](#contributor) registrar opções de conectividade para que os usuários se conectem à rede DoubleZero. As interfaces CYOA incluem vários métodos como [DIA](#dia-direct-internet-access), túneis GRE e peering privado. Consulte [Criando Interfaces CYOA](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices) para detalhes de configuração.

### DIA (Acesso Direto à Internet)
Um termo de rede padrão para conectividade fornecida pela internet pública. No DoubleZero, DIA é um tipo de interface [CYOA](#cyoa-choose-your-own-adventure) onde os usuários (validadores, operadores de RPC) se conectam a um [DZD](#dzd-doublezero-device) pela sua conexão de internet existente.

### IBRL (Increase Bandwidth Reduce Latency)
Um modo de conexão que permite que validadores e nós RPC se conectem ao DoubleZero sem reiniciar seus clientes blockchain. O IBRL usa o endereço IP público existente e estabelece um túnel overlay para o [DZD](#dzd-doublezero-device) mais próximo. Consulte [Conexão Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) para instruções de configuração.

### Multicast
Um método de entrega de pacotes um-para-muitos suportado pelo DoubleZero. O modo multicast tem dois papéis: **publicador** (envia pacotes pela rede) e **assinante** (recebe pacotes do publicador). Usado por equipes de desenvolvimento para distribuição eficiente de dados. Consulte [Outra Conexão Multicast](Other%20Multicast%20Connection.md) para detalhes de conexão.

---

## Componentes de Software

### doublezerod
O serviço daemon do DoubleZero que é executado em servidores de usuários (validadores, nós RPC). Ele gerencia a conexão com a rede DoubleZero, lida com o estabelecimento de túneis e mantém a conectividade com os [DZDs](#dzd-doublezero-device). Configurado via systemd e controlado pelo CLI [`doublezero`](#doublezero-cli).

### doublezero (CLI)
A interface de linha de comando para interagir com a rede DoubleZero. Usada para conectar, gerenciar identidades, verificar status e operações administrativas. Comunica-se com o daemon [`doublezerod`](#doublezerod).

### Config Agent
Agente de software executado nos [DZDs](#dzd-doublezero-device) que gerencia a configuração do dispositivo. Lê a configuração do serviço [Controller](#controller) e aplica mudanças ao dispositivo. Consulte [Instalação do Config Agent](contribute-provisioning.md#step-44-install-config-agent) para configuração.

### Telemetry Agent
Agente de software executado nos [DZDs](#dzd-doublezero-device) que coleta métricas de desempenho (latência, jitter, perda de pacotes) e as envia ao ledger DoubleZero. Consulte [Instalação do Telemetry Agent](contribute-provisioning.md#step-45-install-telemetry-agent) para configuração.

### Controller
Um serviço que fornece configuração para agentes [DZD](#dzd-doublezero-device). O Controller deriva as configurações do dispositivo a partir do estado [onchain](#onchain) no ledger DoubleZero.

---

## Estados de Link

### Ativado
O estado operacional normal de um link. O tráfego flui pelo link e ele participa das decisões de roteamento.

### Drenagem Suave
Um estado de manutenção onde o tráfego será desencorajado em um link específico. Usado para janelas de manutenção gradual. Pode transitar para [ativado](#activated) ou [drenagem rígida](#hard-drained).

### Drenagem Rígida
Um estado de manutenção onde o link é completamente removido do serviço. Nenhum tráfego flui pelo link. Deve transitar para [drenagem suave](#soft-drained) antes de retornar para [ativado](#activated).

---

## Organizações e Tokens

### DZF (DoubleZero Foundation)
A DoubleZero Foundation é uma empresa de fundação sem membros nas Ilhas Cayman, sem fins lucrativos, formada para apoiar o desenvolvimento, descentralização, segurança e adoção da rede DoubleZero.

### Token 2Z
O token nativo da rede DoubleZero. Usado para pagar taxas de validadores e distribuído como recompensas aos [contribuidores](#contributor). Os validadores podem pagar taxas em 2Z via um programa de swap onchain. Consulte [Pagando Taxas com 2Z](paying-fees2z.md) e [Trocando SOL por 2Z](Swapping-sol-to-2z.md).

### Contribuidor
Um provedor de infraestrutura de rede que contribui com largura de banda e hardware para a rede DoubleZero. Os contribuidores operam [DZDs](#dzd-doublezero-device), fornecem links [WAN](#wan-link) e [DZX](#dzx-link) e recebem incentivos em tokens [2Z](#2z-token) por sua contribuição. Consulte a [Documentação para Contribuidores](contribute-overview.md) para começar.

---

## Conceitos de Rede

### MTU (Unidade Máxima de Transmissão)
O maior tamanho de pacote (em bytes) que pode ser transmitido por um link de rede. Os links WAN do DoubleZero normalmente usam MTU 9000 (jumbo frames) para eficiência.

### VRF (Virtual Routing and Forwarding)
Uma tecnologia que permite que múltiplas tabelas de roteamento isoladas existam no mesmo roteador físico. Os contribuidores frequentemente usam um VRF de gerenciamento separado para isolar o tráfego de gerenciamento do switch do tráfego de produção.

### GRE (Generic Routing Encapsulation)
Um protocolo de tunelamento que encapsula pacotes de rede dentro de pacotes IP. Usado por conexões [IBRL](#ibrl-increase-bandwidth-reduce-latency) e [CYOA](#cyoa-choose-your-own-adventure) para criar túneis overlay entre usuários e DZDs.

### BGP (Border Gateway Protocol)
O protocolo de roteamento usado para trocar informações de roteamento entre redes na internet. O DoubleZero usa BGP internamente com ASN 65342.

### ASN (Número de Sistema Autônomo)
Um identificador único atribuído a uma rede para roteamento BGP. Todos os dispositivos DoubleZero usam **ASN 65342** para o processo BGP interno.

### Interface Loopback
Uma interface de rede virtual em um roteador/switch usada para fins de gerenciamento e roteamento. Os DZDs usam Loopback255 (VPNv4) e Loopback256 (IPv4) para roteamento interno.

### CIDR (Roteamento Inter-Domínio sem Classe)
Uma notação para especificar intervalos de endereços IP. O formato é `IP/comprimento-prefixo` onde o comprimento do prefixo indica o tamanho da rede (por exemplo, `/29` = 8 endereços, `/24` = 256 endereços).

### Jitter
Variação na latência de pacotes ao longo do tempo. Baixo jitter é crítico para aplicações em tempo real.

### RTT (Round-Trip Time)
O tempo para um pacote viajar da origem ao destino e de volta. Usado para medir a latência de rede entre dispositivos.

### TWAMP (Protocolo de Medição Ativa Bidirecional)
Um protocolo para medir métricas de desempenho de rede como latência e perda de pacotes. O [Telemetry Agent](#telemetry-agent) usa TWAMP para coletar métricas entre DZDs.

### IS-IS (Intermediate System to Intermediate System)
Um protocolo de roteamento de estado de link usado internamente pela rede DoubleZero. As métricas IS-IS são ajustadas durante operações de [drenagem de link](#soft-drained).

---

## Blockchain e Chaves

### Onchain
No contexto do DoubleZero, onchain refere-se a dados e operações registrados no ledger DoubleZero. Ao contrário das redes tradicionais onde as configurações de dispositivos e links vivem em sistemas de gerenciamento centralizados, o DoubleZero registra registros de dispositivos, configurações de links e envios de telemetria onchain — tornando o estado da rede transparente e verificável por todos os participantes.

### Chave de Serviço
Um keypair criptográfico usado para autenticar operações do CLI. Esta é a sua identidade de contribuidor para interagir com o contrato inteligente do DoubleZero. Armazenada em `~/.config/solana/id.json`.

### Chave do Editor de Métricas
Um keypair criptográfico usado pelo [Telemetry Agent](#telemetry-agent) para assinar envios de métricas à blockchain. Separada da chave de serviço para isolamento de segurança. Armazenada em `~/.config/doublezero/metrics-publisher.json`.

---

## Hardware e Software

### EOS (Extensible Operating System)
O sistema operacional de rede da Arista que é executado nos switches DZD. Os contribuidores instalam o [Config Agent](#config-agent) e o [Telemetry Agent](#telemetry-agent) como extensões EOS.

### Extensão EOS
Um pacote de software que pode ser instalado em switches Arista EOS. Os agentes DZ são distribuídos como arquivos `.rpm` e instalados via o comando `extension`.
