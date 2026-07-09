# Guia de Descomissionamento de Site para Contribuidores

Este guia descreve como descomissionar um Dispositivo DoubleZero (DZD) ou sair de um site: como remover seus dispositivos e links da rede sem interromper os usuários conectados e, em seguida, excluí-los onchain.

O processo é executado em três estágios: limitar o dispositivo 31 dias antes do dia do descomissionamento, notificar os usuários conectados durante uma janela de aviso para que possam migrar e, então, drenar e excluir os links, interfaces e dispositivo no dia do descomissionamento.

> ⚠️ **Coordene com a DoubleZero primeiro:**
> Sempre alinhe com a equipe da DoubleZero antes de descomissionar um dispositivo ou site, e agende sua data e horário de descomissionamento conosco. Executamos algumas etapas do nosso lado nesse período, então precisamos estar agendados. Combine as datas e o plano antes de limitar um dispositivo ou drenar um link.

> ⚠️ **Switches e links DZX:**
> Se o dispositivo que você está descomissionando é um switch DZX, ou possui quaisquer links DZX, identifique os contribuidores afetados o mais cedo possível e notifique-os, pois eles podem precisar mover ou reconstruir seus links antes da sua data. Também crie um evento de manutenção no [portal OPS](contribute-ops-management.md) para a data de descomissionamento.

---

## Visão Geral

| Quando | Ação | Quem |
|--------|------|------|
| 31 dias antes | Limitar o dispositivo para que novos usuários não possam se conectar (`--max-users 0`) | Contribuidor |
| 14 dias antes | Usuários conectados são notificados para migrar para outro dispositivo | Equipe DoubleZero |
| Janela de aviso | Usuários se reconectam a outros DZDs | Usuários |
| Dia do descomissionamento | Drenar e excluir os links, interfaces e dispositivo | Contribuidor |

Princípios:

- **Pare novos usuários cedo, mova os existentes gradualmente.** Limitar o dispositivo cedo significa que ele apenas perde usuários a partir desse ponto. Usuários existentes continuam funcionando e migram no seu próprio ritmo.
- **Mantenha tudo ativo durante a janela de aviso.** Não drene os links ou o dispositivo até o dia do descomissionamento, para que os usuários em migração mantenham o serviço normal.
- **A ordem de desmontagem é imposta pelo contrato.** Você não pode excluir um link ou dispositivo enquanto ele estiver ativo, então os passos abaixo drenam primeiro e excluem por último.

> ⚠️ **Aviso curto:**
> Se você tem menos de 31 dias antes da saída, comece imediatamente. Limite o dispositivo agora e encurte as janelas para caber no tempo disponível. A ordem dos passos não muda.

---

## Fase 1 — Limitar o dispositivo (31 dias antes)

Limite o dispositivo para que novos usuários não possam se conectar:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

Os usuários existentes não são afetados e continuam funcionando. Repita para cada dispositivo sendo descomissionado no site. Os links e o dispositivo permanecem totalmente ativos, então os usuários conectados mantêm o serviço normal.

---

## Fase 2 — Janela de aviso (14 dias antes)

A equipe da DoubleZero notifica os usuários conectados, pedindo que se reconectem a um DZD diferente antes da data de descomissionamento. Coordene com a equipe sobre quem contata quais usuários.

Nada é drenado durante esta janela, então os usuários mantêm o serviço normal. Os usuários se reconectam no seu próprio ritmo. Monitore a contagem de usuários com:

```bash
doublezero device list
```

---

## Fase 3 — Dia do descomissionamento

Antes de começar, identifique exatamente o que precisa ser removido: o dispositivo, os links conectados a ele e as interfaces a serem limpas. Você pode encontrar tudo isso com:

```bash
doublezero device list | grep <CONTRIBUTOR_CODE>    # encontre seu dispositivo: seu código e pubkey
doublezero link list | grep <DEVICE_CODE>           # encontre os links conectados ao dispositivo
doublezero device interface list <DEVICE_CODE>      # liste as interfaces no dispositivo a remover
```

Execute estes passos em ordem. Cada passo desbloqueia o próximo.

> ⚠️ **Antes da exclusão final do dispositivo:**
> Notifique a Fundação DoubleZero antes de executar o último passo. A Fundação remove quaisquer usuários que não migraram a tempo, o que de outra forma bloquearia a exclusão, e completa quaisquer etapas necessárias do lado da fundação.

### 1. Drenar os links

Faça soft-drain primeiro, depois hard-drain. Veja [Drenagem de Links](contribute-operations.md#link-draining) para saber o que cada estado faz.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
# quando o tráfego tiver saído:
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

Repita para cada link nos dispositivos sendo removidos.

### 2. Excluir os links

```bash
doublezero link delete --pubkey <LINK_PUBKEY>
```

Isso libera as interfaces que os links estavam usando.

### 3. Excluir as interfaces

```bash
doublezero device interface delete <DEVICE_CODE> <INTERFACE_NAME>
```

Repita para cada interface no dispositivo.

### 4. Drenar o dispositivo

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --status drained
```

Drenar remove o dispositivo do roteamento e encerra quaisquer sessões de usuário restantes. Também move o dispositivo para fora do seu estado ativo, permitindo que ele seja excluído.

### 5. Excluir o dispositivo

```bash
doublezero device delete --pubkey <DEVICE_PUBKEY>
```

O dispositivo só pode ser excluído quando não estiver mais ativo, não tiver links referenciando-o e não tiver interfaces restantes, o que os passos anteriores resolvem.

---

## Cancelando ou adiando

Limitar e drenar são reversíveis até que você comece a excluir:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users <ORIGINAL_VALUE>   # restaurar capacidade
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained             # de hard-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated                # de volta ao ativo
doublezero device update --pubkey <DEVICE_PUBKEY> --status activated            # reverter drenagem do dispositivo
```

Excluir os links, interfaces ou dispositivo é permanente: isso fecha as contas onchain. Só comece a excluir quando a saída estiver confirmada.