---
description: Use o portal DoubleZero OPS Management para registrar e acompanhar incidentes de rede e manutenções planejadas.
---

# OPS Management

O portal DoubleZero OPS Management é onde os contribuidores registram e acompanham incidentes (interrupções não planejadas) e manutenções (trabalhos planejados) em toda a rede. Todos os tickets são visíveis para todos os contribuidores.

**Portal:** [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management)

## Portal vs Slack

O portal OPS Management e o Slack funcionam juntos. Todos os incidentes e manutenções são rastreados como tickets, acessíveis pelo portal ou pela API. Cada ticket notifica automaticamente os canais corretos do Slack e oferece a todos os contribuidores uma visão compartilhada do que está acontecendo na rede. O Slack é onde a conversa acontece: compartilhando logs, coordenando com outros contribuidores e colaborando em problemas ativos.

Os tickets são o registro canônico, seja criados pelo portal ou pela API. As threads do Slack não são: elas não atualizam o status do ticket e não são armazenadas permanentemente. Sempre mantenha o status do ticket atualizado, mesmo que a conversa esteja acontecendo no Slack.

O portal e o Slack servem a propósitos diferentes. Use ambos, mas para as finalidades certas.

| Use o portal (ou API) para... | Use o Slack para... |
|-------------------------------|-----------------|
| Abrir, atualizar e fechar tickets | Conversa e colaboração em um problema ativo |
| Registrar transições de status | Compartilhar logs, capturas de tela ou iniciar uma chamada |
| Atribuir ou escalar um ticket | Chamar atenção para um problema rapidamente |
| Definir causa raiz no fechamento | Coordenar com outros contribuidores |



---

## Integração

Complete estes passos uma vez antes de usar o portal.

### 1. Configure Sua Chave de Ops Manager

Registre uma pubkey de carteira Solana como sua chave de Ops Manager. Carteiras suportadas: Phantom, Solflare, Coinbase Wallet.

```bash
doublezero contributor update \
  --ops-manager <OPS_MANAGER_PUBKEY> \
  --pubkey <CONTRIBUTOR_PUBKEY>
```

### 2. Conecte Sua Carteira no Portal

1. Navegue até [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management).
2. Clique em **Connect Your Wallet** e selecione sua carteira.
3. Assine a mensagem para comprovar a propriedade da sua chave de Ops Manager.

Uma vez autenticado, a **Incident Tracking Table** é exibida.

As configurações da conta ficam no menu **Settings** (ícone de engrenagem, canto superior direito): API Key Management, User Management e Escalation Contacts. As opções que você vê dependem da sua função.

### 3. Criar Chaves de API (Opcional)

Para acesso programático em vez do formulário web:

1. Abra o menu **Settings** (ícone de engrenagem) e escolha **API Key Management**.
2. Crie uma ou mais chaves de API.
3. Baixe a documentação da API nesta página.

---

## Incidentes

Um incidente é um evento não planejado que impacta o serviço.

### Níveis de Severidade {#severity-levels}

Atribua a severidade com base no impacto à rede DoubleZero. Você pode atualizar a severidade conforme a situação evolui.

| Severidade | Impacto | Resposta |
|----------|--------|----------|
| `sev1` | Interrupção total ou quebra importante do plano de controle/dados sem alternativa | Abandone tudo imediatamente, mesmo fora do horário de trabalho. Escale para a DoubleZero Foundation imediatamente. |
| `sev2` | Impacto parcial mas substancial; serviço degradado com possível alternativa | Trate como urgente. Coordene ativamente. Resposta noturna necessária para degradação sustentada. |
| `sev3` | Impacto limitado ou sem impacto visível ao usuário; potencial de escalar se não resolvido | Prioridade máxima durante o horário de trabalho. Monitore de perto. Nenhuma escalação fora do horário é necessária, a menos que o impacto aumente. |

??? note "Exemplos de severidade"

    **Exemplos Sev1**

    - Mais de 10% do tráfego de usuários em blackhole no DoubleZero, sem alternativa para a internet pública
    - Mais de 80% das tentativas de onboarding, conexão ou desconexão de usuários falhando
    - Mais de 20% dos DZDs reportando erros de interface
    - Controller retornando configurações válidas mas incorretas para os agentes DZD

    **Exemplos Sev2**

    - Mais de 20% dos usuários incapazes de enviar/receber tráfego pelos túneis DoubleZero, mas com fallback para a internet pública
    - 0–10% do tráfego de usuários em blackhole no DoubleZero sem alternativa
    - 20–80% das novas tentativas de onboarding, conexão ou desconexão de usuários falhando
    - Mais de 20% dos agentes de configuração falhando ao aplicar a configuração do DZD
    - 0–20% dos DZDs reportando erros de interface
    - Problemas upstream causando perda de observabilidade (monitoramento/alertas fora do ar)
    - Pipeline de dados onchain fora do ar ou produzindo dados incorretos
    - Mais de 20% da coleta ou envio de latência da internet falhando
    - Controller inacessível pelos agentes DZD
    - Controller retornando configurações inválidas para os DZDs que não serão aplicadas

    **Exemplos Sev3**

    - 0–20% dos usuários incapazes de enviar/receber tráfego pelos túneis DoubleZero, com fallback para a internet pública
    - 0–20% dos DZDs reportando erros de interface
    - 0–20% dos DZDs com falhas no agente de configuração
    - 0–20% das tentativas de onboarding, conexão ou desconexão de usuários falhando
    - Mais de 20% da coleta ou envio de latência da internet falhando para um único provedor de dados
    - 0–20% da coleta ou envio de latência da internet falhando para todos os provedores de dados
    - Bugs ou débito técnico causando ruído de alertas que não pode ser silenciado
    - DIA fora do ar ou problemas de rede RPC do ledger para 0–20% dos dispositivos por várias horas
    - Problemas de baixo impacto como bugs menores, erros cosméticos ou incidentes isolados sem afetar o tráfego do cliente
    - Pequena fração de dispositivos reportando erros intermitentes sem interrupção do serviço

### Abrindo um Incidente

Clique em **Create New Record**, selecione Type = **Incident** no portal, ou envie via API.

**Obrigatório:**

| Campo | Descrição |
|-------|-------------|
| `title` | Resumo curto (máximo 100 caracteres) |
| `description` | Explicação detalhada (máximo 500 caracteres) |
| `severity` | `sev1`, `sev2` ou `sev3` |
| `status` | Não pode ser definido como estado terminal (`resolved`, `closed`) na criação |
| Device e/ou Link | Pelo menos um obrigatório. No formulário web, selecione a partir de um dropdown dos seus códigos de dispositivo e link. Ao usar a API, passe as pubkeys correspondentes como `device_pubkey` e/ou `affected_link_pubkey`. |

**Opcional:**

| Campo | Descrição |
|-------|-------------|
| `reporter_name` / `reporter_email` | Seus detalhes de contato |
| `assignee` | Quem é responsável pela resolução |
| `internal_reference` | Seu ID de ticket interno (ex.: Jira, ServiceNow) |
| `start_at` | Padrão é o horário de criação; editável |

Uma vez criado, uma notificação é postada no canal Slack de incidentes dos contribuidores com o ID do ticket, severidade, dispositivos/links afetados e nome do contribuidor.

### Atualizando um Incidente

Conforme o incidente progride, mantenha o status do ticket atualizado. Este é o sinal que outros contribuidores e a DZ usam para entender o que está sendo trabalhado.

| Status | Quando definir |
|--------|----------------|
| `open` | Estado inicial: problema reportado, ainda não sendo trabalhado |
| `acknowledged` | Você viu e assumiu a responsabilidade |
| `investigating` | Diagnosticando ativamente: coletando logs, verificando métricas |
| `mitigating` | Causa raiz conhecida ou suspeita; aplicando correção ou solução alternativa |
| `monitoring` | Correção aplicada; observando para confirmar que se mantém |
| `resolved` | Problema confirmado como corrigido; **causa raiz obrigatória** |
| `closed` | Totalmente concluído; nenhuma ação adicional; **causa raiz obrigatória** |

```
open → acknowledged → investigating → mitigating → monitoring → resolved → closed
```

Você pode pular status se apropriado. Por exemplo, ir direto de `open` para `investigating` se você começar a trabalhar imediatamente. Sempre use o status mais preciso para o estado atual.

Cada atualização de status posta uma resposta na thread da notificação original do Slack.

### Fechando um Incidente

Para mover um incidente para `resolved` ou `closed`, uma **causa raiz** deve ser definida. Você pode definir a causa raiz em qualquer estágio anterior se já a conhecer; ela se torna obrigatória no fechamento.

| Código | Descrição |
|------|-------------|
| `hardware` | Reparo, substituição ou upgrade de hardware (SFP, NIC, cabo, dispositivo) |
| `software` | Correção, atualização ou reinício de software ou firmware |
| `configuration` | Alteração, correção ou rollback de configuração |
| `capacity` | Congestionamento, limites de capacidade ou gerenciamento de tráfego |
| `carrier` | Problema de circuito, comprimento de onda ou provedor de cross-connect |
| `network_external` | Problema de rede externa fora do controle do contribuidor |
| `facility` | Problema de infraestrutura do datacenter (energia, refrigeração) |
| `fiber_cut` | Dano físico de fibra reparado |
| `security` | Incidente de segurança mitigado |
| `human_error` | Erro operacional corrigido |
| `false_positive` | Nenhum problema real encontrado após investigação |
| `duplicate` | Já rastreado em outro ticket |
| `self_resolved` | Problema resolvido sem intervenção |
| `dz_managed` | Problema com um componente de software gerenciado pela DoubleZero (activator, controller, etc.) |

---

## Manutenção

Um registro de manutenção é uma atividade planejada, com tempo limitado, que pode afetar a disponibilidade. Crie-o com antecedência para que outros contribuidores possam ver e evitar janelas conflitantes.

### Agendando Manutenção

Clique em **Create New Record** > **Maintenance** no portal, ou envie via API.

**Obrigatório:**

| Campo | Descrição |
|-------|-------------|
| `title` | Resumo curto (máximo 100 caracteres) |
| `description` | Explicação detalhada (máximo 500 caracteres) |
| `severity` | `sev1`, `sev2` ou `sev3`. Defina conforme o impacto esperado ao usuário (veja nota abaixo). |
| `start_at` | Horário de início planejado (UTC) |
| `end_at` | Horário de término planejado (UTC); deve ser após `start_at` |
| Device e/ou Link | Pelo menos um obrigatório. No formulário web, selecione a partir de um dropdown dos seus códigos de dispositivo e link. Ao usar a API, passe as pubkeys correspondentes como `device_pubkey` e/ou `affected_link_pubkey`. |

A severidade se aplica à manutenção da mesma forma que aos incidentes. Defina conforme o impacto ao usuário que você espera durante a janela, usando os [níveis de severidade acima](#severity-levels).

Uma vez criado, uma notificação é postada no canal Slack de manutenção dos contribuidores com o ID do ticket, dispositivos/links afetados, janela planejada e nome do contribuidor.

### Gerenciando o Status da Manutenção

Mantenha o status atualizado conforme a janela progride.

| Status | Quando definir |
|--------|----------------|
| `planned` | Agendada, ainda não iniciada |
| `in-progress` | O trabalho começou |
| `completed` | Trabalho finalizado com sucesso |
| `closed` | Definido automaticamente 24 horas após `end_at` |
| `cancelled` | Cancelada antes ou durante a execução |

```
planned → in-progress → completed → closed (auto 24h after end_at)
    ↓          ↓
    └──────────┴──→ cancelled
```

---

## Contatos de Escalação

Os contatos de escalação informam à DoubleZero e a outros contribuidores quem contatar quando a sua parte da rede tem um problema. Você configura seus próprios contatos para sua organização. Um contato pode ser uma pessoa ou uma equipe, como seu NOC. Cada contato tem uma ou mais formas de ser alcançado e um cronograma de quando está de plantão.

Abra o menu **Settings** (ícone de engrenagem) e escolha **Escalation Contacts**. Somente ops managers podem adicionar ou editar contatos.

### Adicionando um Contato

Para cada contato, defina:

| Campo | Descrição |
|-------|-------------|
| Name | Um nome para o contato, seja uma pessoa ou uma equipe como seu NOC |
| Timezone | O fuso horário local, usado para ler o cronograma |
| Availability | **24/7**, ou um ou mais intervalos semanais quando o contato está de plantão |
| Contact methods | Uma ou mais formas de alcançar o contato, em ordem de prioridade |

Os métodos de contato suportados são email, telefone, Slack, Telegram e WhatsApp. A ordem importa: o primeiro método é o que deve ser tentado primeiro.

### Disponibilidade e Lacunas de Cobertura

Um contato está disponível o tempo todo (24/7) ou disponível durante intervalos semanais que você define, por exemplo, segunda a sexta, 09:00 às 17:00. Os intervalos são inseridos no fuso horário local do contato e exibidos em UTC, então o horário de verão é tratado automaticamente.

A visualização de **coverage gaps** (lacunas de cobertura) mostra os horários de cada semana quando ninguém da sua organização está de plantão. Use-a para encontrar e fechar lacunas.

### Janelas de Rotação

A semana é dividida em janelas de meia hora. Para cada janela, você pode definir a ordem na qual seus contatos são acionados. Isso permite executar uma rotação de plantão sem editar cada contato.

### Visibilidade

Você controla quem pode ver seus contatos. A DoubleZero sempre pode vê-los. Você escolhe quem mais pode:

| Configuração | Quem mais pode ver seus contatos |
|---------|-------------------------------|
| Somente DoubleZero (padrão) | Nenhum outro contribuidor |
| Todos | Todos os contribuidores |
| Alguns contribuidores | Somente os contribuidores que você selecionar |

Sua própria equipe sempre pode ver seus contatos. A visibilidade é definida uma vez para toda a sua organização e se aplica a todos os seus contatos.

---

## Gerenciamento de Usuários

Por padrão, sua chave de Ops Manager é a única conta que pode agir pela sua organização. Você pode adicionar membros da equipe para que mais de uma pessoa possa gerenciar seus tickets.

Abra o menu **Settings** (ícone de engrenagem) e escolha **User Management**. Somente ops managers podem adicionar ou remover membros da equipe.

Para cada membro da equipe, defina:

| Campo | Descrição |
|-------|-------------|
| Name | O nome da pessoa |
| Wallet pubkey | A carteira Solana com a qual ela faz login |
| Access level | **Read** ou **Read-write** |

Níveis de acesso:

- **Read**: pode visualizar tickets e contatos de escalação, e criar chaves de API somente leitura. Não pode criar, atualizar ou fechar tickets.
- **Read-write**: acesso total para criar, atualizar e fechar tickets, e pode criar chaves de API de qualquer nível.

Cada membro da equipe faz login com sua própria carteira, da mesma forma que você conectou sua chave de Ops Manager.

---

## Permissões e Escalação

### O Que os Contribuidores Podem Fazer

- Criar e gerenciar tickets apenas para seus próprios dispositivos e links.
- Atribuir tickets a si mesmos ou escalar para DZ/Malbeclabs.
- Visualizar todos os tickets de todos os contribuidores.
- Adicionar membros da equipe e definir seu nível de acesso (somente ops managers).
- Gerenciar contatos de escalação para sua organização (somente ops managers).

### O Que os Admins DZ/Malbeclabs Podem Fazer

- Criar tickets para dispositivos e links de qualquer contribuidor.
- Atribuir ou reatribuir tickets entre contribuidores.
- Tratar escalações e solicitações de suporte.

### Propriedade de Links DZX

Os links DZX conectam dispositivos de dois contribuidores diferentes. O contribuidor do **lado A** (primeiro dispositivo no nome do link) é o proprietário do link e é o único que pode criar tickets para ele.

**Exemplo:** Para o link `deviceA:deviceB`, o contribuidor que possui `deviceA` é o proprietário do link.

**Se o problema está no lado Z:**

1. O contribuidor do lado A cria um ticket para o link DZX.
2. Atribua o ticket ao DZ/Malbeclabs.
3. O DZ/Malbeclabs investiga e reatribui ao contribuidor do lado Z se necessário.

Reconhecemos que este fluxo de trabalho é limitado. Contribuidores do lado Z atualmente não podem criar tickets para links DZX que não possuem, o que significa que a coordenação precisa passar pelo DZ/Malbeclabs. Estamos trabalhando para melhorar isso, de modo que ambos os lados de um link DZX possam declarar incidentes e manutenções de forma independente.