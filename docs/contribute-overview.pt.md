# Documentação para Contribuidores

!!! info "Terminologia"
    Novo no DoubleZero? Consulte o [Glossário](glossary.md) para definições de termos-chave como [DZD](glossary.md#dzd-doublezero-device), [DZX](glossary.md#dzx-doublezero-exchange) e [CYOA](glossary.md#cyoa-choose-your-own-adventure).

Bem-vindo à documentação para contribuidores do DoubleZero. Esta seção cobre tudo que você precisa para se tornar um contribuidor de rede.

!!! tip "Interessado em se tornar um contribuidor de rede?"
    Revise a página de [Requisitos e Arquitetura](contribute.md) para entender o hardware, a largura de banda e a conectividade necessários para contribuir com a rede DoubleZero.

---

## Lista de Verificação de Integração

Use esta lista de verificação para acompanhar seu progresso. **Todos os itens devem ser concluídos antes que sua contribuição esteja tecnicamente operacional.**

### Fase 1: Pré-requisitos
- [ ] CLI do DoubleZero instalado em um servidor de gerenciamento
- [ ] Hardware adquirido e atendendo aos [requisitos](contribute.md#hardware-requirements)
- [ ] Espaço em rack e energia do data center disponíveis (4U, 4KW recomendado)
- [ ] DZD instalado fisicamente com conectividade de gerenciamento
- [ ] Bloco IPv4 público alocado para o protocolo DZ (**consulte as [Regras de Prefixo DZ](#dz-prefix-rules)**)

### Fase 2: Configuração de Conta
- [ ] Par de chaves de serviço gerado (`doublezero keygen`)
- [ ] Par de chaves do editor de métricas gerado
- [ ] Chave de serviço enviada ao DZF para autorização
- [ ] Conta de contribuidor criada onchain (verificar com `doublezero contributor list`)
- [ ] Acesso concedido ao repositório [malbeclabs/contributors](https://github.com/malbeclabs/contributors)

### Fase 3: Provisionamento de Dispositivos
- [ ] Configuração base do dispositivo aplicada (do repositório de contribuidores)
- [ ] Dispositivo criado onchain (`doublezero device create`)
- [ ] Interfaces do dispositivo registradas
- [ ] Interfaces loopback criadas (Loopback255 vpnv4, Loopback256 ipv4)
- [ ] Interfaces CYOA/DIA configuradas (se dispositivo de borda/híbrido)

### Fase 4: Estabelecimento de Link e Instalação de Agentes
- [ ] Links WAN criados (se aplicável)
- [ ] Link DZX criado (status: `requested`)
- [ ] Link DZX aceito pelo contribuidor par
- [ ] Config Agent instalado e em execução
- [ ] Config Agent recebendo configuração do controlador
- [ ] Telemetry Agent instalado e em execução
- [ ] Editor de métricas registrado onchain
- [ ] Envios de telemetria visíveis no ledger

### Fase 5: Rodagem do Link
- [ ] Todos os links drenados durante um período de rodagem de 24 horas
- [ ] [metrics.doublezero.xyz](https://metrics.doublezero.xyz) mostra zero perdas e zero erros durante 24h
- [ ] Links sem drenagem após uma rodagem limpa

### Fase 6: Verificação e Ativação
- [ ] `doublezero device list` mostra seu dispositivo (com `max_users = 0`)
- [ ] `doublezero link list` mostra seus links
- [ ] Os logs do Config Agent mostram extrações de configuração bem-sucedidas
- [ ] Os logs do Telemetry Agent mostram envios de métricas bem-sucedidos
- [ ] **Coordenar com DZ/Malbec Labs** para executar um teste de conectividade (conectar, receber rotas, rotear sobre DZ)
- [ ] Após o teste passar, definir `max_users` como 96 via `doublezero device update`

---

## Obter Ajuda

Como parte da integração, o DZF irá adicioná-lo aos canais Slack de contribuidores:

| Canal | Propósito |
|---------|---------|
| **#dz-contributor-announcements** | Comunicações oficiais do DZF e Malbec Labs — atualizações de CLI/agentes, mudanças importantes, anúncios de segurança. Monitore para atualizações críticas; faça perguntas nas threads. |
| **#dz-contributor-incidents** | Eventos não planejados que afetam o serviço. Os incidentes são postados automaticamente via API/formulário web com severidade e dispositivos/links afetados. A discussão e resolução de problemas ocorrem nas threads. |
| **#dz-contributor-maintenance** | Atividades de manutenção planejadas (atualizações, reparos). Agendadas via API/formulário web com horários de início/fim planejados. Discussão nas threads. |
| **#dz-contributor-ops** | Discussão aberta para todos os contribuidores — perguntas operacionais, ajuda com CLI, compartilhamento de runbooks e playbooks. |

Você também receberá um **canal privado do DZ/Malbec Labs** para suporte direto da sua organização.

---

## Regras de Prefixo DZ

!!! warning "Crítico: Uso do Pool de Prefixos DZ"
    O pool de prefixos DZ que você fornece é **gerenciado pelo protocolo DoubleZero para alocação de IP**.

    **Como os prefixos DZ são usados:**

    - **Primeiro IP**: Reservado para o seu dispositivo (atribuído à interface Loopback100)
    - **IPs restantes**: Alocados para tipos específicos de usuários que se conectam ao seu DZD:
        - Usuários `IBRLWithAllocatedIP`
        - Usuários `EdgeFiltering`
        - Publicadores multicast
    - **Usuários IBRL**: NÃO consomem deste pool (usam seu próprio IP público)

    **NÃO pode usar esses endereços para:**

    - Seu próprio equipamento de rede
    - Links ponto a ponto em interfaces DIA
    - Interfaces de gerenciamento
    - Qualquer infraestrutura fora do protocolo DZ

    **Requisitos:**

    - Devem ser endereços IPv4 **globalmente roteáveis (públicos)**
    - Intervalos de IP privados (10.x, 172.16-31.x, 192.168.x) são rejeitados pelo contrato inteligente
    - **Tamanho mínimo: /29** (8 endereços), prefixos maiores são preferidos (por exemplo, /28, /27)
    - Todo o bloco deve estar disponível — não pré-aloque nenhum endereço

    Se você precisar de endereços para seu próprio equipamento (IPs de interface DIA, gerenciamento, etc.), use um **pool de endereços separado**.

---

## Referência Rápida: Termos-Chave

Novo no DoubleZero? Aqui estão os termos essenciais (consulte o [Glossário completo](glossary.md)):

| Termo | Definição |
|------|------------|
| **DZD** | Dispositivo DoubleZero — seu switch físico Arista que executa os agentes DZ |
| **DZX** | DoubleZero Exchange — ponto de interconexão metropolitana onde os contribuidores se conectam entre si |
| **CYOA** | Choose Your Own Adventure — método de conectividade de usuários (GREOverDIA, GREOverFabric, etc.) |
| **DIA** | Acesso Direto à Internet — conectividade à internet requerida por todos os DZDs para o controlador e a telemetria, comumente usado como tipo CYOA para conectividade de usuários em dispositivos de borda/híbridos |
| **Link WAN** | Link entre seus próprios DZDs (mesmo contribuidor) |
| **Link DZX** | Link para o DZD de outro contribuidor (requer aceitação mútua) |
| **Config Agent** | Consulta o controlador, aplica a configuração ao seu DZD |
| **Telemetry Agent** | Coleta métricas de latência/perda TWAMP, envia ao ledger onchain |
| **Chave de Serviço** | Sua chave de identidade de contribuidor para operações do CLI |
| **Chave do Editor de Métricas** | Chave para assinar envios de telemetria onchain |

---

---

## Estrutura da Documentação

| Guia | Descrição |
|-------|-------------|
| [Requisitos e Arquitetura](contribute.md) | Especificações de hardware, arquitetura de rede, opções de largura de banda |
| [Provisionamento de Dispositivos](contribute-provisioning.md) | Passo a passo: chaves → acesso ao repositório → dispositivo → links → agentes |
| [Operações](contribute-operations.md) | Atualizações de agentes, gerenciamento de links, monitoramento |
| [Glossário](glossary.md) | Toda a terminologia do DoubleZero definida |

---

## Conceitos de Rede para Não-Engenheiros de Rede

Se você não tem experiência em engenharia de rede, aqui está uma introdução aos conceitos usados nesta documentação:

### Endereçamento IP

- **Endereço IPv4**: Um identificador único para um dispositivo em uma rede (por exemplo, `192.168.1.1`)
- **Notação CIDR** (`/29`, `/24`): Indica o tamanho da sub-rede. `/29` = 8 endereços, `/24` = 256 endereços
- **IP público**: Roteável na internet; **IP privado**: Somente redes internas (10.x, 172.16-31.x, 192.168.x)

### Camadas de Rede

- **Camada 1 (Física)**: Cabos, óptica, comprimentos de onda
- **Camada 2 (Enlace de Dados)**: Switches, VLANs, endereços MAC
- **Camada 3 (Rede)**: Roteadores, endereços IP, protocolos de roteamento

### Termos Comuns

- **MTU**: Unidade Máxima de Transmissão — tamanho máximo de pacote (tipicamente 9000 bytes para links WAN)
- **VLAN**: LAN Virtual — separa logicamente o tráfego em infraestrutura compartilhada
- **VRF**: Virtual Routing and Forwarding — isola tabelas de roteamento no mesmo dispositivo
- **BGP**: Border Gateway Protocol — troca de rotas entre redes
- **GRE**: Generic Routing Encapsulation — protocolo de tunelamento para redes overlay
- **TWAMP**: Two-Way Active Measurement Protocol — mede latência/perda entre dispositivos

### Específico do DoubleZero

- **Onchain**: No DoubleZero, os registros de dispositivos, as configurações de links e a telemetria são registrados no ledger DoubleZero, tornando o estado da rede transparente e verificável por todos os participantes
- **Controlador**: Serviço que deriva a configuração do DZD a partir do estado onchain no ledger DoubleZero

---

Pronto para começar? Comece com [Requisitos e Arquitetura](contribute.md).
