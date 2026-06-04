# Gestão OPS

O portal de Gestão OPS do DoubleZero é onde os contribuidores registam e acompanham incidentes (interrupções não planeadas) e manutenções (trabalhos planeados) em toda a rede. Todos os tickets são visíveis para todos os contribuidores.

**Portal:** [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management)

## Portal vs Slack

O portal de Gestão OPS e o Slack trabalham em conjunto. Todos os incidentes e manutenções são rastreados como tickets, acessíveis através do portal ou da API. Cada ticket notifica automaticamente os canais Slack corretos e dá a cada contribuidor uma visão partilhada do que está a acontecer na rede. O Slack é onde a conversa acontece: partilhar logs, coordenar com outros contribuidores e colaborar em problemas ativos.

Os tickets são o registo canónico, sejam criados pelo portal ou pela API. As threads do Slack não são: elas não atualizam o estado do ticket e não são armazenadas permanentemente. Mantenha sempre o estado do ticket atualizado, mesmo que a conversa esteja a decorrer no Slack.

O portal e o Slack servem propósitos diferentes. Use ambos, mas para as coisas certas.

| Use o portal (ou API) para... | Use o Slack para... |
|-------------------------------|-----------------|
| Abrir, atualizar e fechar tickets | Conversa e colaboração sobre um problema ativo |
| Registar transições de estado | Partilhar logs, capturas de ecrã ou iniciar uma chamada |
| Atribuir ou escalar um ticket | Obter atenção rápida sobre um problema |
| Definir causa raiz ao fechar | Coordenar com outros contribuidores |



---

## Integração

Complete estes passos uma vez antes de usar o portal.

### 1. Definir a Sua Chave de Ops Manager

Registe uma pubkey de carteira Solana como a sua chave de Ops Manager. Carteiras suportadas: Phantom, Solflare, Coinbase Wallet.

```bash
doublezero contributor update \
  --ops-manager <OPS_MANAGER_PUBKEY> \
  --pubkey <CONTRIBUTOR_PUBKEY>
```

### 2. Conectar a Sua Carteira no Portal

1. Navegue até [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management).
2. Clique em **Connect Your Wallet** e selecione a sua carteira.
3. Assine a mensagem para provar a propriedade da sua chave de Ops Manager.

Após a autenticação, a **Tabela de Rastreamento de Incidentes** é apresentada.

As configurações da conta encontram-se no menu **Settings** (ícone de engrenagem, canto superior direito): API Key Management, User Management e Escalation Contacts. As opções que vê dependem do seu papel.

### 3. Criar Chaves de API (Opcional)

Para acesso programático em vez do formulário web:

1. Abra o menu **Settings** (ícone de engrenagem) e escolha **API Key Management**.
2. Crie uma ou mais chaves de API.
3. Faça download da documentação da API a partir desta página.

---

## Incidentes

Um incidente é um evento não planeado com impacto no serviço.

### Níveis de Severidade

Atribua a severidade com base no impacto na rede DoubleZero. Pode atualizar a severidade à medida que a situação evolui.

| Severidade | Impacto | Resposta |
|----------|--------|----------|
| `sev1` | Interrupção total ou falha grave no plano de controlo/dados sem alternativa | Largue tudo imediatamente, mesmo fora do horário de trabalho. Escale para a DoubleZero Foundation imediatamente. |
| `sev2` | Impacto parcial mas substancial; serviço degradado com possível alternativa | Trate como urgente. Coordene ativamente. Resposta noturna necessária para degradação sustentada. |
| `sev3` | Impacto limitado ou sem impacto visível para o utilizador; potencial de escalar se não resolvido | Prioridade máxima durante o horário de trabalho. Monitorize de perto. Não é necessária escalação fora de horas, a menos que o impacto aumente. |

??? note "Exemplos de severidade"

    **Exemplos Sev1**

    - Mais de 10% do tráfego de utilizadores em blackhole no DoubleZero, sem alternativa para a internet pública
    - Mais de 80% das tentativas de onboarding, conexão ou desconexão de utilizadores a falhar
    - Mais de 20% dos DZDs a reportar erros de interface
    - Controlador a devolver configurações válidas mas incorretas aos agentes DZD

    **Exemplos Sev2**

    - Mais de 20% dos utilizadores incapazes de enviar/receber tráfego através dos túneis DoubleZero, mas com fallback para a internet pública
    - 0–10% do tráfego de utilizadores em blackhole no DoubleZero sem alternativa
    - 20–80% das novas tentativas de onboarding, conexão ou desconexão de utilizadores a falhar
    - Mais de 20% dos agentes de configuração a falhar na aplicação da configuração DZD
    - 0–20% dos DZDs a reportar erros de interface
    - Problemas upstream a causar perda de observabilidade (monitorização/alertas em baixo)
    - Pipeline de dados onchain em baixo ou a produzir dados incorretos
    - Mais de 20% da recolha ou submissão de latência de internet a falhar
    - Controlador inacessível pelos agentes DZD
    - Controlador a devolver configurações inválidas aos DZDs que não serão aplicadas

    **Exemplos Sev3**

    - 0–20% dos utilizadores incapazes de enviar/receber tráfego através dos túneis DoubleZero, com fallback para a internet pública
    - 0–20% dos DZDs a reportar erros de interface
    - 0–20% dos DZDs a experienciar falhas no agente de configuração
    - 0–20% das tentativas de onboarding, conexão ou desconexão de utilizadores a falhar
    - Mais de 20% da recolha ou submissão de latência de internet a falhar para um único fornecedor de dados
    - 0–20% da recolha ou submissão de latência de internet a falhar para todos os fornecedores de dados
    - Bugs ou dívida técnica a causar ruído de alertas que não pode ser silenciado
    - DIA em baixo ou problemas de rede RPC do ledger para 0–20% dos dispositivos durante várias horas
    - Problemas de baixo impacto como bugs menores, erros cosméticos ou incidentes isolados que não afetam o tráfego do cliente
    - Pequena fração de dispositivos a reportar erros intermitentemente sem interrupção do serviço

### Abrir um Incidente

Clique em **Create New Record**, selecione Type = **Incident** no portal, ou submeta via a API.

**Obrigatório:**

| Campo | Descrição |
|-------|-------------|
| `title` | Resumo curto (máximo 100 caracteres) |
| `description` | Explicação detalhada (máximo 500 caracteres) |
| `severity` | `sev1`, `sev2` ou `sev3` |
| `status` | Não pode ser definido para um estado terminal (`resolved`, `closed`) na criação |
| Dispositivo e/ou Link | Pelo menos um obrigatório. No formulário web, selecione a partir de um dropdown dos seus códigos de dispositivo e link. Ao usar a API, passe as pubkeys correspondentes como `device_pubkey` e/ou `affected_link_pubkey`. |

**Opcional:**

| Campo | Descrição |
|-------|-------------|
| `reporter_name` / `reporter_email` | Os seus dados de contacto |
| `assignee` | Quem é responsável pela resolução |
| `internal_reference` | O seu ID de ticket interno (ex.: Jira, ServiceNow) |
| `start_at` | Por defeito é a hora de criação; editável |

Após a criação, uma notificação é publicada no canal Slack de incidentes do contribuidor com o ID do ticket, severidade, dispositivos/links afetados e nome do contribuidor.

### Atualizar um Incidente

À medida que o incidente progride, mantenha o estado do ticket atualizado. Este é o sinal que outros contribuidores e a DZ usam para entender o que está a ser trabalhado.

| Estado | Quando definir |
|--------|----------------|
| `open` | Estado inicial: problema reportado, ainda não a ser trabalhado |
| `acknowledged` | Viu e assumiu a responsabilidade |
| `investigating` | A diagnosticar ativamente: a recolher logs, a verificar métricas |
| `mitigating` | Causa raiz conhecida ou suspeita; a aplicar correção ou solução alternativa |
| `monitoring` | Correção aplicada; a monitorizar para confirmar que se mantém |
| `resolved` | Problema confirmado como resolvido; **causa raiz obrigatória** |
| `closed` | Totalmente concluído; sem mais ações; **causa raiz obrigatória** |

```
open → acknowledged → investigating → mitigating → monitoring → resolved → closed
```

Pode saltar estados se apropriado. Por exemplo, saltar diretamente de `open` para `investigating` se começar a trabalhar imediatamente. Use sempre o estado mais preciso para a situação atual.

Cada atualização de estado publica uma resposta na thread da notificação original do Slack.

### Fechar um Incidente

Para mover um incidente para `resolved` ou `closed`, uma **causa raiz** deve ser definida. Pode definir a causa raiz em qualquer fase anterior se já a conhecer; torna-se obrigatória no fecho.

| Código | Descrição |
|------|-------------|
| `hardware` | Reparação, substituição ou atualização de hardware (SFP, NIC, cabo, dispositivo) |
| `software` | Correção, atualização ou reinício de software ou firmware |
| `configuration` | Alteração, correção ou reversão de configuração |
| `capacity` | Congestionamento, limites de capacidade ou gestão de tráfego |
| `carrier` | Problema com o fornecedor de circuito, comprimento de onda ou cross-connect |
| `network_external` | Problema de rede externo fora do controlo do contribuidor |
| `facility` | Problema de infraestrutura do datacenter (energia, refrigeração) |
| `fiber_cut` | Dano físico na fibra reparado |
| `security` | Incidente de segurança mitigado |
| `human_error` | Erro operacional corrigido |
| `false_positive` | Nenhum problema real encontrado após investigação |
| `duplicate` | Já rastreado noutro ticket |
| `self_resolved` | Problema resolvido sem intervenção |
| `dz_managed` | Problema com um componente de software gerido pelo DoubleZero (activator, controller, etc.) |

---

## Manutenção

Um registo de manutenção é uma atividade planeada e limitada no tempo que pode afetar a disponibilidade. Crie-o antecipadamente para que outros contribuidores possam ver e evitar janelas em conflito.

### Agendar Manutenção

Clique em **Create New Record** > **Maintenance** no portal, ou submeta via a API.

**Obrigatório:**

| Campo | Descrição |
|-------|-------------|
| `title` | Resumo curto (máximo 100 caracteres) |
| `description` | Explicação detalhada (máximo 500 caracteres) |
| `severity` | `sev1`, `sev2` ou `sev3`. Defina para o impacto esperado no utilizador (ver nota abaixo). |
| `start_at` | Hora de início planeada (UTC) |
| `end_at` | Hora de fim planeada (UTC); deve ser posterior a `start_at` |
| Dispositivo e/ou Link | Pelo menos um obrigatório. No formulário web, selecione a partir de um dropdown dos seus códigos de dispositivo e link. Ao usar a API, passe as pubkeys correspondentes como `device_pubkey` e/ou `affected_link_pubkey`. |

A severidade aplica-se à manutenção da mesma forma que aos incidentes. Defina-a para o impacto no utilizador que espera durante a janela, usando os [níveis de severidade acima](#niveis-de-severidade).

Após a criação, uma notificação é publicada no canal Slack de manutenção do contribuidor com o ID do ticket, dispositivos/links afetados, janela planeada e nome do contribuidor.

### Gerir o Estado da Manutenção

Mantenha o estado atualizado à medida que a janela progride.

| Estado | Quando definir |
|--------|----------------|
| `planned` | Agendada, ainda não iniciada |
| `in-progress` | O trabalho começou |
| `completed` | Trabalho concluído com sucesso |
| `closed` | Definido automaticamente 24 horas após `end_at` |
| `cancelled` | Cancelada antes ou durante a execução |

```
planned → in-progress → completed → closed (auto 24h após end_at)
    ↓          ↓
    └──────────┴──→ cancelled
```

---

## Contactos de Escalação

Os contactos de escalação informam o DoubleZero e outros contribuidores quem contactar quando a sua parte da rede tem um problema. Configura os seus próprios contactos para a sua organização. Um contacto pode ser uma pessoa ou uma equipa, como o seu NOC. Cada contacto tem uma ou mais formas de ser alcançado e um horário para quando está de serviço.

Abra o menu **Settings** (ícone de engrenagem) e escolha **Escalation Contacts**. Apenas ops managers podem adicionar ou editar contactos.

### Adicionar um Contacto

Para cada contacto, defina:

| Campo | Descrição |
|-------|-------------|
| Nome | Um nome para o contacto, seja uma pessoa ou uma equipa como o seu NOC |
| Fuso horário | O fuso horário local, usado para ler o horário |
| Disponibilidade | **24/7**, ou um ou mais intervalos semanais quando o contacto está de serviço |
| Métodos de contacto | Uma ou mais formas de alcançar o contacto, por ordem de prioridade |

Os métodos de contacto suportados são email, telefone, Slack, Telegram e WhatsApp. A ordem importa: o primeiro método é o que deve ser tentado primeiro.

### Disponibilidade e Lacunas de Cobertura

Um contacto está disponível permanentemente (24/7) ou disponível durante intervalos semanais que define, por exemplo segunda a sexta, 09:00 às 17:00. Os intervalos são introduzidos no fuso horário local do contacto e apresentados em UTC, para que a hora de verão seja tratada automaticamente.

A vista de **lacunas de cobertura** mostra os horários em cada semana em que ninguém da sua organização está de serviço. Use-a para encontrar e eliminar lacunas.

### Janelas de Rotação

A semana é dividida em janelas de meia hora. Para cada janela pode definir a ordem em que os seus contactos são alcançados. Isto permite-lhe executar uma rotação de serviço sem editar cada contacto.

### Visibilidade

Controla quem pode ver os seus contactos. O DoubleZero pode sempre vê-los. Escolhe quem mais pode:

| Definição | Quem mais pode ver os seus contactos |
|---------|-------------------------------|
| Apenas DoubleZero (padrão) | Nenhum outro contribuidor |
| Todos | Todos os contribuidores |
| Alguns contribuidores | Apenas os contribuidores que selecionar |

A sua própria equipa pode sempre ver os seus contactos. A visibilidade é definida uma vez para toda a sua organização e aplica-se a todos os seus contactos.

---

## Gestão de Utilizadores

Por defeito, a sua chave de Ops Manager é a única conta que pode agir em nome da sua organização. Pode adicionar membros da equipa para que mais do que uma pessoa possa gerir os seus tickets.

Abra o menu **Settings** (ícone de engrenagem) e escolha **User Management**. Apenas ops managers podem adicionar ou remover membros da equipa.

Para cada membro da equipa, defina:

| Campo | Descrição |
|-------|-------------|
| Nome | O nome da pessoa |
| Wallet pubkey | A carteira Solana com que iniciam sessão |
| Nível de acesso | **Read** ou **Read-write** |

Níveis de acesso:

- **Read**: pode ver tickets e contactos de escalação, e criar chaves de API apenas de leitura. Não pode criar, atualizar ou fechar tickets.
- **Read-write**: acesso total para criar, atualizar e fechar tickets, e pode criar chaves de API de qualquer nível.

Cada membro da equipa inicia sessão com a sua própria carteira, da mesma forma que conectou a sua chave de Ops Manager.

---

## Permissões e Escalação

### O Que os Contribuidores Podem Fazer

- Criar e gerir tickets apenas para os seus próprios dispositivos e links.
- Atribuir tickets a si próprios ou escalar para DZ/Malbeclabs.
- Ver todos os tickets de todos os contribuidores.
- Adicionar membros da equipa e definir o seu nível de acesso (apenas ops managers).
- Gerir contactos de escalação para a sua organização (apenas ops managers).

### O Que os Admins DZ/Malbeclabs Podem Fazer

- Criar tickets para dispositivos e links de qualquer contribuidor.
- Atribuir ou reatribuir tickets entre contribuidores.
- Tratar escalações e pedidos de suporte.

### Propriedade de Links DZX

Os links DZX conectam dispositivos de dois contribuidores diferentes. O contribuidor do **lado A** (primeiro dispositivo no nome do link) é proprietário do link e é o único que pode criar tickets para ele.

**Exemplo:** Para o link `deviceA:deviceB`, o contribuidor que é proprietário do `deviceA` é proprietário do link.

**Se o problema está no lado Z:**

1. O contribuidor do lado A cria um ticket para o link DZX.
2. Atribui o ticket a DZ/Malbeclabs.
3. DZ/Malbeclabs investiga e reatribui ao contribuidor do lado Z se necessário.

Reconhecemos que este fluxo de trabalho é limitado. Os contribuidores do lado Z atualmente não podem criar tickets para links DZX que não possuem, o que significa que a coordenação tem de passar por DZ/Malbeclabs. Estamos a trabalhar para melhorar isto para que ambos os lados de um link DZX possam declarar incidentes e manutenções de forma independente.