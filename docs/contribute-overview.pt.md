---
description: Visão geral e checklist de integração para se tornar um contribuidor da rede DoubleZero.
---

# Documentação do Contribuidor

!!! info "Terminologia"
    Novo no DoubleZero? Consulte o [Glossário](glossary.md) para definições de termos-chave como [DZD](glossary.md#dzd-doublezero-device), [DZX](glossary.md#dzx-doublezero-exchange) e [CYOA](glossary.md#cyoa-choose-your-own-adventure).

Bem-vindo à documentação do contribuidor do DoubleZero. Esta seção cobre tudo o que você precisa para se tornar um contribuidor da rede.

!!! tip "Interessado em se tornar um contribuidor da rede?"
    Consulte a página [Requisitos e Arquitetura](contribute.md) para entender o hardware, a largura de banda e a conectividade necessários para contribuir com a rede DoubleZero.

---

## Checklist de Integração

Use este checklist para acompanhar seu progresso. **Todos os itens devem ser concluídos antes que sua contribuição esteja tecnicamente operacional.**

### Fase 1: Pré-requisitos
- [ ] DoubleZero CLI instalado em um servidor de gerenciamento
- [ ] Hardware adquirido e atendendo aos [requisitos](contribute.md#hardware-requirements)
- [ ] Espaço em rack e energia disponíveis no data center (veja [Rack e Energia](contribute.md#rack-power-requirements))
- [ ] DZD fisicamente instalado com conectividade de gerenciamento
- [ ] Bloco de IPv4 público alocado para o protocolo DZ (**veja [Regras de Prefixo DZ](#regras-de-prefixo-dz)**)

### Fase 2: Configuração de Conta
- [ ] Par de chaves de serviço gerado (`doublezero keygen`)
- [ ] Par de chaves do publicador de métricas gerado
- [ ] Carteira do gerenciador de recompensas criada e financiada com ~0.01 SOL
- [ ] Chave de serviço, chave do gerenciador de recompensas e nome de usuário do GitHub enviados à DZF (apenas chaves públicas)
- [ ] Conta de contribuidor criada onchain (verificar com `doublezero contributor list`)
- [ ] Chave do gerenciador de recompensas registrada onchain pela DZF
- [ ] Acesso concedido ao repositório [malbeclabs/contributors](https://github.com/malbeclabs/contributors)
- [ ] Carteiras destinatárias e percentuais configurados (**veja [Gerenciamento de Recompensas](contribute-rewards.md)**)
- [ ] Cada carteira destinatária possui uma conta de token 2Z

### Fase 3: Provisionamento de Dispositivo
- [ ] Configuração base do dispositivo aplicada (do repositório contributors)
- [ ] Dispositivo criado onchain (`doublezero device create`)
- [ ] Interfaces do dispositivo registradas
- [ ] Interfaces de loopback criadas (Loopback255 vpnv4, Loopback256 ipv4)
- [ ] Interfaces CYOA/DIA configuradas (se dispositivo edge/híbrido)

### Fase 4: Estabelecimento de Links e Instalação de Agentes
- [ ] Links WAN criados (se aplicável)
- [ ] Link DZX criado (status: `requested`)
- [ ] Link DZX aceito pelo contribuidor par
- [ ] Config Agent instalado e em execução
- [ ] Config Agent recebendo configuração do controller
- [ ] Telemetry Agent instalado e em execução
- [ ] Publicador de métricas registrado onchain
- [ ] Submissões de telemetria visíveis no ledger

### Fase 5: Período de Teste dos Links
- [ ] Todos os links drenados para período de teste de 24 horas
- [ ] [metrics.doublezero.xyz](https://metrics.doublezero.xyz) mostra zero perda e zero erros por 24h
- [ ] Links restaurados após teste limpo

### Fase 6: Verificação e Ativação
- [ ] `doublezero device list` mostra seu dispositivo (com `max_users = 0`)
- [ ] `doublezero link list` mostra seus links
- [ ] Logs do Config Agent mostram pulls de configuração bem-sucedidos
- [ ] Logs do Telemetry Agent mostram submissões de métricas bem-sucedidas
- [ ] **Coordenar com DZ/Malbec Labs** para executar teste de conectividade (conectar, receber rotas, rotear pelo DZ)
- [ ] Após aprovação no teste, definir `max_users` para 96 via `doublezero device update`

---

## Obtendo Ajuda

Como parte da integração, a DZF adicionará você aos canais do Slack para contribuidores:

| Canal | Finalidade |
|-------|------------|
| **#dz-contributor-announcements** | Comunicações oficiais da DZF e Malbec Labs — atualizações de CLI/agentes, mudanças incompatíveis, avisos de segurança. Monitore para atualizações críticas; faça perguntas em threads. |
| **#dz-contributor-incidents** | Eventos não planejados com impacto no serviço. Incidentes são publicados automaticamente via API/formulário web com severidade e dispositivos/links afetados. Discussão e troubleshooting acontecem em threads. |
| **#dz-contributor-maintenance** | Atividades de manutenção planejada (upgrades, reparos). Agendadas via API/formulário web com horários planejados de início/fim. Discussão em threads. |
| **#dz-contributor-ops** | Discussão aberta para todos os contribuidores — perguntas operacionais, ajuda com CLI, compartilhamento de runbooks e playbooks. |

Você também receberá um **canal privado DZ/Malbec Labs** para suporte direto à sua organização.

---

## Regras de Prefixo DZ

!!! warning "Crítico: Uso do Pool de Prefixos DZ"
    O pool de prefixos DZ que você fornece é **gerenciado pelo protocolo DoubleZero para alocação de IP**.

    **Como os prefixos DZ são usados:**

    - **Primeiro IP**: Reservado para seu dispositivo (atribuído à interface Loopback100)
    - **IPs restantes**: Alocados para tipos específicos de usuários que se conectam ao seu DZD:
        - Usuários `IBRLWithAllocatedIP`
        - Usuários `EdgeFiltering`
        - Publicadores multicast
    - **Usuários IBRL**: NÃO consomem deste pool (eles usam seu próprio IP público)

    **Você NÃO PODE usar esses endereços para:**

    - Seu próprio equipamento de rede
    - Links ponto a ponto em interfaces DIA
    - Interfaces de gerenciamento
    - Qualquer infraestrutura fora do protocolo DZ

    **Requisitos:**

    - Devem ser endereços IPv4 **globalmente roteáveis (públicos)**
    - Faixas de IP privado (10.x, 172.16-31.x, 192.168.x) são rejeitadas pelo smart contract
    - **Tamanho mínimo: /29** (8 endereços), prefixos maiores são preferíveis (ex.: /28, /27)
    - O bloco inteiro deve estar disponível - não pré-aloque nenhum endereço

    Se você precisar de endereços para seu próprio equipamento (IPs de interface DIA, gerenciamento, etc.), use um **pool de endereços separado**.

---

## Referência Rápida: Termos-Chave

Novo no DoubleZero? Aqui estão os termos essenciais (veja o [Glossário completo](glossary.md)):

| Termo | Definição |
|-------|-----------|
| **DZD** | DoubleZero Device - seu switch físico Arista executando agentes DZ |
| **DZX** | DoubleZero Exchange - ponto de interconexão metropolitana onde contribuidores fazem peering |
| **CYOA** | Choose Your Own Adventure - método de conectividade do usuário (GREOverDIA, GREOverFabric, etc.) |
| **DIA** | Direct Internet Access - conectividade com a internet exigida por todos os DZDs para controller e telemetria, comumente usado como tipo CYOA para conectividade de usuários em dispositivos edge/híbridos |
| **WAN Link** | Link entre seus próprios DZDs (mesmo contribuidor) |
| **DZX Link** | Link para o DZD de outro contribuidor (requer aceitação mútua) |
| **Config Agent** | Consulta o controller, aplica configuração ao seu DZD |
| **Telemetry Agent** | Coleta métricas de latência/perda TWAMP, submete ao ledger onchain |
| **Service Key** | Sua chave de identidade de contribuidor para operações via CLI |
| **Metrics Publisher Key** | Chave para assinar submissões de telemetria onchain |
| **Rewards Manager Key** | Chave que controla quais carteiras recebem suas recompensas |

---

---

## Estrutura da Documentação

| Guia | Descrição |
|------|-----------|
| [Requisitos e Arquitetura](contribute.md) | Especificações de hardware, arquitetura de rede, opções de largura de banda |
| [Provisionamento de Dispositivo](contribute-provisioning.md) | Passo a passo: chaves → acesso ao repositório → dispositivo → links → agentes |
| [Gerenciamento de Recompensas](contribute-rewards.md) | Configurando as carteiras que recebem suas recompensas 2Z |
| [Operações](contribute-operations.md) | Atualizações de agentes, gerenciamento de links, monitoramento |
| [Implantação do Geoprobe](contribute-geolocation.md) | Implantação e configuração de agentes geoProbe para geolocalização |
| [Glossário](glossary.md) | Toda a terminologia do DoubleZero definida |

---

## Conceitos Básicos de Rede para Não-Engenheiros de Rede

Se você não tem formação em engenharia de redes, aqui está uma introdução aos conceitos usados nesta documentação:

### Endereçamento IP

- **Endereço IPv4**: Um identificador único para um dispositivo em uma rede (ex.: `192.168.1.1`)
- **Notação CIDR** (`/29`, `/24`): Indica o tamanho da sub-rede. `/29` = 8 endereços, `/24` = 256 endereços
- **IP Público**: Roteável na internet; **IP Privado**: Apenas redes internas (10.x, 172.16-31.x, 192.168.x)

### Camadas de Rede

- **Camada 1 (Física)**: Cabos, óptica, comprimentos de onda
- **Camada 2 (Enlace de Dados)**: Switches, VLANs, endereços MAC
- **Camada 3 (Rede)**: Roteadores, endereços IP, protocolos de roteamento

### Termos Comuns

- **MTU**: Maximum Transmission Unit - maior tamanho de pacote (tipicamente 9000 bytes para links WAN)
- **VLAN**: Virtual LAN - separa logicamente o tráfego em infraestrutura compartilhada
- **VRF**: Virtual Routing and Forwarding - isola tabelas de roteamento no mesmo dispositivo
- **BGP**: Border Gateway Protocol - troca de rotas entre redes
- **GRE**: Generic Routing Encapsulation - protocolo de tunelamento para redes overlay
- **TWAMP**: Two-Way Active Measurement Protocol - mede latência/perda entre dispositivos

### Específico do DoubleZero

- **Onchain**: No DoubleZero, registros de dispositivos, configurações de links e telemetria são registrados no ledger do DoubleZero — tornando o estado da rede transparente e verificável por todos os participantes
- **Controller**: Serviço que deriva a configuração do DZD a partir do estado onchain no ledger do DoubleZero

---

Pronto para começar? Comece com [Requisitos e Arquitetura](contribute.md).