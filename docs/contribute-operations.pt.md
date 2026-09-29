---
description: Tarefas operacionais contínuas para contribuidores DoubleZero — atualizações de agentes, atualizações de dispositivos e interfaces, gerenciamento de links e registro de incidentes.
---

# Guia de Operações para Contribuidores


Este guia abrange as tarefas operacionais contínuas para manutenção dos seus DoubleZero Devices (DZDs), incluindo atualizações de agentes, atualizações de dispositivos/interfaces e gerenciamento de links.

## Registro de Incidentes e Manutenção

Qualquer manutenção planejada ou problema não planejado de link/dispositivo deve ser registrado no [portal de Gerenciamento de OPS](contribute-ops-management.md). Isso dá a todos os contribuidores visibilidade sobre o que está acontecendo em toda a rede e evita investigações duplicadas.

- **Trabalho planejado** (ex.: substituição de um módulo óptico, manutenção programada da operadora): crie um registro de manutenção antes de começar.
- **Problemas não planejados** (ex.: link inativo, erros de interface, perda de pacotes): abra um incidente assim que começar a investigar.

Consulte o [guia de Gerenciamento de OPS](contribute-ops-management.md) para etapas de integração e como criar tickets.

---

**Pré-requisitos**: Antes de usar este guia, certifique-se de que você:

- Concluiu o [Guia de Provisionamento de Dispositivos](contribute-provisioning.md)
- Seu DZD está totalmente operacional com ambos os agentes de Configuração e Telemetria em execução

---

## Atualizações de Dispositivos

Use `doublezero device update` para modificar as configurações do dispositivo após o provisionamento inicial.

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**Opções comuns de atualização:**

| Opção | Descrição |
|-------|-----------|
| `--device-type <TYPE>` | Alterar modo de operação: `hybrid`, `transit`, `edge` (veja [Tipos de Dispositivos](contribute-provisioning.md#understanding-device-types)) |
| `--location <LOCATION>` | Mover dispositivo para uma localização diferente |
| `--metrics-publisher <PUBKEY>` | Alterar a chave do publicador de métricas |

---

## Atualizações de Interfaces

Use `doublezero device interface update` para modificar interfaces existentes. Este comando aceita as mesmas opções que `interface create`.

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

Para a lista completa de opções de interface incluindo configurações CYOA/DIA, veja [Criando Interfaces](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices).

**Exemplo - Adicionar configurações CYOA a uma interface existente:**

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
doublezero device interface list <DEVICE>     # Interfaces para um dispositivo específico
```

---

## Atualização do Agente de Configuração

Quando uma nova versão do Agente de Configuração é lançada, siga estas etapas para atualizar.

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

### 3. Remover a versão antiga

Primeiro, encontre o nome do arquivo da versão antiga:
```
switch# show extensions
```

Execute os seguintes comandos para remover a versão antiga. Substitua `<OLD_VERSION>` pela versão antiga do output acima:
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

O Status deve ser "A, I, B".
```
switch# show extensions
```

### 7. Verificar o Log de Saída do Agente de Configuração

```
show agent doublezero-agent log
```

---

## Atualização do Agente de Telemetria

Quando uma nova versão do Agente de Telemetria é lançada, siga estas etapas para atualizar.

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

### 3. Remover a versão antiga

Primeiro, encontre o nome do arquivo da versão antiga:
```
switch# show extensions
```

Execute os seguintes comandos para remover a versão antiga. Substitua `<OLD_VERSION>` pela versão antiga do output acima:
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

O Status deve ser "A, I, B".
```
switch# show extensions
```

### 7. Verificar o Log de Saída do Agente de Telemetria

```
show agent doublezero-telemetry log
```

---

## Monitoramento {#monitoring}

> ⚠️ **Importante:**
>
>  1. Para os exemplos de configuração abaixo, esteja atento se seus agentes estão usando um VRF de gerenciamento.
>  2. O agente de configuração e o agente de telemetria usam a mesma porta de escuta (:8080) para seu endpoint de métricas por padrão. Se você estiver habilitando métricas em ambos, use a flag `-metrics-addr` para definir portas de escuta únicas para cada agente.

### Métricas do Agente de Configuração

O agente de configuração no dispositivo DoubleZero tem a capacidade de expor métricas compatíveis com prometheus definindo a flag `-metrics-enable` na configuração do daemon `doublezero-agent`. A porta de escuta padrão é tcp/8080, mas pode ser alterada para se adequar ao ambiente via `-metrics-addr`:
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

As seguintes métricas específicas do DoubleZero são expostas junto com métricas de runtime específicas do go:
```
$ curl -s 10.0.0.11:2112/metrics | grep doublezero

# HELP doublezero_agent_apply_config_errors_total Number of errors encountered while applying config to the device
# TYPE doublezero_agent_apply_config_errors_total counter
doublezero_agent_apply_config_errors_total 0

# HELP doublezero_agent_bgp_neighbors_errors_total Number of errors encountered while retrieving BGP neighbors from the device
# TYPE doublezero_agent_bgp_neighbors_errors_total counter
doublezero_agent_bgp_neighbors_errors_total 0

# HELP doublezero_agent_build_info Build information of the agent
# TYPE doublezero_agent_build_info gauge
doublezero_agent_build_info{commit="4378018f",date="2025-09-23T14:07:48Z",version="0.6.5~git20250923140746.4378018f"} 1

# HELP doublezero_agent_get_config_errors_total Number of errors encountered while getting config from the controller
# TYPE doublezero_agent_get_config_errors_total counter
doublezero_agent_get_config_errors_total 0
```

#### Erros de Alto Sinal

- `up` - Esta é a métrica de série temporal gerada automaticamente pelo prometheus se a instância de coleta está saudável e acessível. Se não estiver, o agente não está acessível ou o agente não está em execução.
- `doublezero_agent_apply_config_errors_total` - A configuração que o agente tentou aplicar falhou. Nesta situação, os usuários não conseguirão se conectar ao dispositivo e as alterações de configuração onchain não serão aplicadas até que isso seja resolvido.
- `doublezero_agent_get_config_errors_total` - Isso sinaliza que o agente de configuração local não consegue se comunicar com o controlador DoubleZero. Na maioria dos casos, isso pode ser devido a um problema com a conectividade de gerenciamento no dispositivo. Similar à métrica acima, os usuários não conseguirão se conectar ao dispositivo e as alterações de configuração onchain não serão aplicadas até que isso seja resolvido.

### Métricas do Agente de Telemetria

O agente de telemetria no dispositivo DoubleZero tem a capacidade de expor métricas compatíveis com prometheus definindo a flag `-metrics-enable` na configuração do daemon `doublezero-telemetry`. A porta de escuta padrão é tcp/8080, mas pode ser alterada para se adequar ao ambiente via `-metrics-addr`:
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

As seguintes métricas específicas do DoubleZero são expostas junto com métricas de runtime específicas do go:
```
$ curl -s 10.0.0.11:2113/metrics | grep doublezero

# HELP doublezero_device_telemetry_agent_build_info Build information of the device telemetry agent
# TYPE doublezero_device_telemetry_agent_build_info gauge
doublezero_device_telemetry_agent_build_info{commit="4378018f",date="2025-09-23T14:07:45Z",version="0.6.5~git20250923140743.4378018f"} 1

# HELP doublezero_device_telemetry_agent_errors_total Number of errors encountered
# TYPE doublezero_device_telemetry_agent_errors_total counter
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_program_load"} 7
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_write_samples"} 8
doublezero_device_telemetry_agent_errors_total{error_type="collector_submit_samples_on_close"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_getting_local_interfaces"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_finding_local_tunnel"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_link_tunnel_net_invalid"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_initialize_account"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_retries_exhausted"} 0

# HELP doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels Number of local tunnel interfaces not found during peer discovery
# TYPE doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels gauge
doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels{local_device_pk="8PQkip3CxWhQTdP7doCyhT2kwjSL2csRTdnRg2zbDPs1"} 0
```

#### Erros de Alto Sinal

- `up` - Esta é a métrica de série temporal gerada automaticamente pelo prometheus se a instância de coleta está saudável e acessível. Se não estiver, o agente não está acessível ou o agente não está em execução.
- `doublezero_device_telemetry_agent_errors_total` com um `error_type` de `submitter_failed_to_write_samples` - Este é um sinal de que o agente de telemetria não consegue gravar amostras onchain, o que pode ser devido a problemas de conectividade de gerenciamento no dispositivo.

---

## Gerenciamento de Links

### Drenagem de Link {#link-draining}

A drenagem de link permite que contribuidores removam graciosamente um link do serviço ativo para manutenção ou resolução de problemas. Existem dois estados de drenagem:

| Status | Comportamento IS-IS | Descrição |
|--------|---------------------|-----------|
| `soft-drained` | Métrica definida para 1.000.000 | Link é desprioritizado. O tráfego usará caminhos alternativos se disponíveis, mas ainda usará este link se for a única opção. |
| `hard-drained` | Definido como passivo | Link é completamente removido do roteamento. Nenhum tráfego atravessará este link. |

### Transições de Estado

As seguintes transições de estado são permitidas:

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (deve passar por soft-drained primeiro)
```

> ⚠️ **Nota:**
> Você não pode ir diretamente de `hard-drained` para `activated`. Você deve primeiro fazer a transição para `soft-drained` e depois para `activated`.

### Drenagem Suave de um Link

A drenagem suave desprioritiza um link definindo sua métrica IS-IS para 1.000.000. O tráfego preferirá caminhos alternativos, mas ainda pode usar este link se necessário.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### Drenagem Forçada de um Link

A drenagem forçada remove o link do roteamento inteiramente, definindo o IS-IS para modo passivo. Nenhum tráfego atravessará este link.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### Restaurar um Link para Ativo

Para retornar um link drenado à operação normal:

```bash
# A partir de soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# A partir de hard-drained (deve passar por soft-drained primeiro)
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### Substituição de Atraso

O recurso de substituição de atraso permite que contribuidores alterem temporariamente o atraso efetivo de um link sem modificar o valor real de atraso medido. Isso é útil para rebaixar temporariamente um link de caminho primário para secundário.

### Definir uma Substituição de Atraso

Para substituir o atraso de um link (tornando-o menos preferido no roteamento):

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

Valores válidos são de `0.01` a `1000` milissegundos.

### Limpar uma Substituição de Atraso

Para remover a substituição e retornar ao uso do atraso real medido:

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **Nota:**
> Quando um link está em `soft-drained`, tanto `delay_ms` quanto `delay_override_ms` são substituídos para 1000ms (1 segundo) para garantir a desprioritização.