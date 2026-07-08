# Guia de Descomissionamento de Site para Contribuidores

Este guia descreve como descomissionar um Dispositivo DoubleZero (DZD) ou encerrar um site: como remover seus dispositivos e links da rede sem interromper os usuários conectados, e depois excluí-los onchain.

O processo ocorre em três etapas: limitar o dispositivo 31 dias antes do dia do descomissionamento, notificar os usuários conectados durante uma janela de aviso para que possam migrar, e então drenar e excluir os links, interfaces e dispositivo no dia do descomissionamento.

> ⚠️ **Coordene com a DoubleZero primeiro:**
> Sempre alinhe com a equipe da DoubleZero antes de descomissionar um dispositivo ou site. Concorde com as datas e o plano antes de limitar um dispositivo ou drenar um link, para que a migração dos usuários e as etapas necessárias do lado da fundação possam ser coordenadas.

---

## Visão Geral

| Quando | Ação | Quem |
|--------|------|------|
| 31 dias antes | Limitar o dispositivo para que novos usuários não possam se conectar (`--max-users 0`) | Contribuidor |
| 14 dias antes | Usuários conectados são notificados para migrar para outro dispositivo | Equipe DoubleZero |
| Janela de aviso | Usuários se reconectam a outros DZDs | Usuários |
| Dia do descomissionamento | Drenar e excluir os links, interfaces e dispositivo | Contribuidor |

Princípios:

- **Pare novos usuários cedo, migre usuários existentes gradualmente.** Limitar o dispositivo cedo significa que ele apenas perde usuários a partir desse ponto. Usuários existentes continuam funcionando e migram no seu próprio ritmo.
- **Mantenha tudo ativo durante a janela de aviso.** Não drene os links ou o dispositivo até o dia do descomissionamento, para que os usuários em migração mantenham o serviço normal.
- **A ordem de desmontagem é imposta pelo contrato.** Você não pode excluir um link ou dispositivo enquanto estiver ativo, então as etapas abaixo drenam primeiro e excluem por último.

> ⚠️ **Aviso com pouca antecedência:**
> Se você tiver menos de 31 dias antes da saída, comece imediatamente. Limite o dispositivo agora e encurte as janelas para caber no tempo disponível. A ordem das etapas não muda.

---

## Fase 1 — Limitar o dispositivo (31 dias antes)

Limite o dispositivo para que novos usuários não possam se conectar:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

Usuários existentes não são afetados e continuam funcionando. Repita para cada dispositivo sendo descomissionado no site. Os links e o dispositivo permanecem totalmente ativos, para que os usuários conectados mantenham o serviço normal.

---

## Fase 2 — Janela de aviso (14 dias antes)

A equipe DoubleZero notifica os usuários conectados, pedindo que se reconectem a um DZD diferente antes da data de descomissionamento. Coordene com a equipe sobre quem entra em contato com quais usuários.

Nada é drenado durante esta janela, para que os usuários mantenham o serviço normal. Os usuários se reconectam no seu próprio ritmo. Monitore a contagem de usuários com:

```bash
doublezero device list
```

---

## Fase 3 — Dia do descomissionamento

Execute estas etapas em ordem. Cada etapa desbloqueia a próxima.

> ⚠️ **Antes da exclusão final do dispositivo:**
> Notifique a Fundação DoubleZero antes de executar a última etapa. A Fundação remove quaisquer usuários que não migraram a tempo, o que de outra forma bloquearia a exclusão, e conclui quaisquer etapas necessárias do lado da fundação.

### 1. Drenar os links

Faça a drenagem suave primeiro, depois a drenagem forçada. Veja [Drenagem de Links](contribute-operations.md#link-draining) para saber o que cada estado faz.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
# quando o tráfego tiver sido movido:
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

Repita para cada link nos dispositivos sendo removidos.

### 2. Excluir os links

```bash
doublezero link delete --pubkey <LINK_PUBKEY>
```

Isso libera as interfaces que os links estavam utilizando.

### 3. Excluir as interfaces

```bash
doublezero device interface delete <DEVICE_CODE> <INTERFACE_NAME>
```

Repita para cada interface no dispositivo.

### 4. Drenar o dispositivo

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --status drained
```

A drenagem remove o dispositivo do roteamento e encerra quaisquer sessões de usuário restantes. Também move o dispositivo para fora do seu estado ativo para que possa ser excluído.

### 5. Excluir o dispositivo

```bash
doublezero device delete --pubkey <DEVICE_PUBKEY>
```

O dispositivo só pode ser excluído quando não estiver mais ativo, não tiver links referenciando-o e não tiver interfaces restantes, o que as etapas anteriores tratam.

---

## Cancelando ou adiando

Limitar e drenar são reversíveis até que você comece a excluir:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users <ORIGINAL_VALUE>   # restaurar capacidade
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained             # a partir de hard-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated                # de volta ao ativo
doublezero device update --pubkey <DEVICE_PUBKEY> --status activated            # reverter drenagem do dispositivo
```

Excluir os links, interfaces ou dispositivo é permanente: fecha as contas onchain. Só comece a excluir quando a saída estiver confirmada.