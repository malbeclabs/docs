# Guia de Operações para Contribuidores


Este guia cobre as tarefas operacionais contínuas para manter seus Dispositivos DoubleZero (DZDs), incluindo atualizações de agentes, atualizações de dispositivos/interfaces e gerenciamento de links.

**Pré-requisitos**: Antes de usar este guia, certifique-se de ter:

- Concluído o [Guia de Provisionamento de Dispositivos](contribute-provisioning.md)
- Seu DZD está totalmente operacional com os agentes de Configuração e Telemetria em execução

---

## Atualizações de Dispositivos

Use `doublezero device update` para modificar a configuração do dispositivo após o provisionamento inicial.

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**Opções de atualização comuns:**

| Opção | Descrição |
|--------|-------------|
| `--device-type <TYPE>` | Alterar o modo de operação: `hybrid`, `transit`, `edge` (consulte [Tipos de Dispositivos](contribute-provisioning.md#understanding-device-types)) |
| `--location <LOCATION>` | Mover o dispositivo para um local diferente |
| `--metrics-publisher <PUBKEY>` | Alterar a chave do editor de métricas |

---

## Atualizações de Interfaces

Use `doublezero device interface update` para modificar interfaces existentes. Este comando aceita as mesmas opções que `interface create`.

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

Para a lista completa de opções de interface incluindo configurações CYOA/DIA, consulte [Criação de Interfaces](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices).

**Exemplo — Adicionar configurações CYOA a uma interface existente:**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### Listar Interfaces

```bash
doublezero device interface list              # Todas as interfaces em todos os dispositivos
doublezero device interface list <DEVICE>     # Interfaces de um dispositivo específico
```

---

## Atualização do Config Agent

Quando uma nova versão do Config Agent é lançada, siga estas etapas para atualizar.

### 1. Baixar a versão mais recente

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget AGENT_DOWNLOAD_URL
# exit
$ exit
```

### 2. Desligar o agente

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 3. Remover a versão anterior

Primeiro, encontre o nome do arquivo da versão anterior:
```
switch# show extensions
```

Execute os seguintes comandos para remover a versão anterior. Substitua `<OLD_VERSION>` pela versão anterior da saída acima:
```
switch# delete flash:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. Instalar a nova versão

```
switch# copy flash:AGENT_FILENAME extension:
switch# extension AGENT_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. Reativar o agente

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# no shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 6. Verificar a atualização

O status deve ser "A, I, B".
```
switch# show extensions
```

### 7. Verificar a saída do log do Config Agent

```
show agent doublezero-agent log
```

---

## Atualização do Telemetry Agent

Quando uma nova versão do Telemetry Agent é lançada, siga estas etapas para atualizar.

### 1. Baixar a versão mais recente

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget TELEMETRY_DOWNLOAD_URL
# exit
$ exit
```

### 2. Desligar o agente

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 3. Remover a versão anterior

Primeiro, encontre o nome do arquivo da versão anterior:
```
switch# show extensions
```

Execute os seguintes comandos para remover a versão anterior. Substitua `<OLD_VERSION>` pela versão anterior da saída acima:
```
switch# delete flash:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. Instalar a nova versão

```
switch# copy flash:TELEMETRY_FILENAME extension:
switch# extension TELEMETRY_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. Reativar o agente

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# no shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 6. Verificar a atualização

O status deve ser "A, I, B".
```
switch# show extensions
```

### 7. Verificar a saída do log do Telemetry Agent

```
show agent doublezero-telemetry log
```

---

## Monitoramento

> ⚠️ **Importante:**
>
>  1. Para os exemplos de configuração abaixo, leve em consideração se seus agentes estão usando um VRF de gerenciamento.
>  2. O config agent e o telemetry agent usam a mesma porta de escuta (:8080) para seu endpoint de métricas por padrão. Se estiver habilitando métricas em ambos, use o flag `-metrics-addr` para definir portas de escuta únicas para cada agente.

### Métricas do Config Agent

O config agent no dispositivo DoubleZero tem a capacidade de expor métricas compatíveis com Prometheus configurando o flag `-metrics-enable` na configuração do daemon `doublezero-agent`. A porta de escuta padrão é tcp/8080, mas pode ser alterada para se adequar ao ambiente via `-metrics-addr`:
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

#### Erros de Alto Sinal

- `up` — Esta é a métrica de série temporal gerada automaticamente pelo prometheus se a instância de scrape estiver saudável e acessível. Se não estiver, o agente não está acessível ou não está em execução.
- `doublezero_agent_apply_config_errors_total` — A configuração que o agente tenta aplicar falhou. Nesta situação, os usuários não poderão se integrar ao dispositivo e as alterações de configuração onchain não serão aplicadas até que isso seja resolvido.
- `doublezero_agent_get_config_errors_total` — Isso indica que o config agent local não consegue se comunicar com o controlador DoubleZero. Na maioria dos casos, isso pode ser devido a um problema com a conectividade de gerenciamento no dispositivo. Semelhante à métrica anterior, os usuários não poderão se integrar ao dispositivo e as alterações de configuração onchain não serão aplicadas até que isso seja resolvido.

### Métricas do Telemetry Agent

O telemetry agent no dispositivo DoubleZero tem a capacidade de expor métricas compatíveis com Prometheus configurando o flag `-metrics-enable` na configuração do daemon `doublezero-telemetry`. A porta de escuta padrão é tcp/8080, mas pode ser alterada para se adequar ao ambiente via `-metrics-addr`:
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

#### Erros de Alto Sinal

- `up` — Esta é a métrica de série temporal gerada automaticamente pelo prometheus se a instância de scrape estiver saudável e acessível. Se não estiver, o agente não está acessível ou não está em execução.
- `doublezero_device_telemetry_agent_errors_total` com um `error_type` de `submitter_failed_to_write_samples` — Este é um sinal de que o telemetry agent não consegue gravar amostras onchain, o que pode ser devido a problemas de conectividade de gerenciamento no dispositivo.

---

## Gerenciamento de Links

### Drenagem de Links

A drenagem de links permite que os contribuidores retirem gradualmente um link do serviço ativo para manutenção ou solução de problemas. Há dois estados de drenagem:

| Estado | Comportamento IS-IS | Descrição |
|--------|----------------|-------------|
| `soft-drained` | Métrica definida como 1.000.000 | O link é despriorizado. O tráfego usará rotas alternativas se disponíveis, mas ainda usará este link se for a única opção. |
| `hard-drained` | Definido como passivo | O link é completamente retirado do roteamento. Nenhum tráfego atravessará este link. |

### Transições de Estado

As seguintes transições de estado são permitidas:

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (deve passar primeiro por soft-drained)
```

> ⚠️ **Nota:**
> Você não pode ir diretamente de `hard-drained` para `activated`. Primeiro deve fazer a transição para `soft-drained`, depois para `activated`.

### Dreno Suave de um Link

O dreno suave desprioriza um link definindo sua métrica IS-IS como 1.000.000. O tráfego preferirá rotas alternativas, mas ainda pode usar este link se necessário.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### Dreno Rígido de um Link

O dreno rígido remove o link do roteamento completamente definindo IS-IS no modo passivo. Nenhum tráfego atravessará este link.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### Restaurar um Link para Ativo

Para devolver um link drenado à operação normal:

```bash
# A partir de soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# A partir de hard-drained (deve passar primeiro por soft-drained)
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### Substituição de Atraso

O recurso de substituição de atraso permite que os contribuidores alterem temporariamente o atraso efetivo de um link sem modificar o valor de atraso medido real. Isso é útil para rebaixar temporariamente um link de rota primária para secundária.

### Definir uma Substituição de Atraso

Para substituir o atraso de um link (tornando-o menos preferido no roteamento):

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

Os valores válidos são de `0,01` a `1000` milissegundos.

### Limpar uma Substituição de Atraso

Para remover a substituição e voltar a usar o atraso medido real:

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **Nota:**
> Quando um link está em soft-drained, tanto `delay_ms` quanto `delay_override_ms` são substituídos para 1000ms (1 segundo) para garantir a despriorização.
