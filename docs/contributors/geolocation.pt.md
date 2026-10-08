---
description: Implante e configure agentes geoProbe que realizam as medições de latência por trás do serviço de Geolocalização do DoubleZero.
---

# Implantação do Geoprobe

Este guia cobre a implantação e configuração de **agentes geoProbe** — os servidores que realizam medições de latência para o serviço de [Geolocalização](../reference/geolocation.md) do DoubleZero.

Um geoProbe fica entre os [DZDs](../reference/glossary.md#dzd-doublezero-device) e os dispositivos alvo na cadeia de medição de três camadas. Ele recebe LocationOffsets assinados dos DZDs pais e mede o [RTT](../reference/glossary.md#rtt-round-trip-time) para os alvos registrados via [TWAMP](../reference/glossary.md#twamp-two-way-active-measurement-protocol), TWAMP assinado ou ICMP echo. Cada geoProbe é registrado onchain e vinculado a um ou mais DZDs pais.

Para uma visão geral da arquitetura de geolocalização e dos fluxos de medição, consulte o [guia do usuário de Geolocalização](../reference/geolocation.md).

---

## Pré-requisitos {#prerequisites}

!!! warning "Versão do Agente de Telemetria do DZD"
    Os DZDs pais devem executar a **versão 0.17.0 ou mais recente do agente de telemetria do dispositivo** para suportar o serviço de geolocalização. Versões anteriores não incluem as extensões de descoberta de probes, ping TWAMP e publicação de offsets necessárias para a geolocalização. Verifique as versões dos agentes antes de implantar um probe — um probe pareado com um DZD mais antigo não receberá offsets.

Antes de implantar um geoProbe, certifique-se de que você tem:

- **Servidor Linux bare metal** — Um VPS pode funcionar, mas é menos ideal.
- **Proximidade de rede com um DZD** — menos de 1ms de RTT entre o probe e seu DZD pai. Idealmente 0,1ms ou menos.
- **Capacidade `CAP_NET_RAW`** para o processo do agente (necessária para sondagem ICMP echo com raw sockets)
- **Par de chaves Ed25519** para a identidade de assinatura do probe
- **Autorização da Fundação** — o registro de probes é controlado pela fundação no momento; coordene com a [DZF](../reference/glossary.md#dzf-doublezero-foundation) antes de prosseguir
- **DZD(s) pai(s)** executando o agente de telemetria v0.17.0+

---

## Instalação {#installation}

Instale tanto o daemon do agente quanto a CLI do doublezero:

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt install doublezero-geoprobe-agent doublezero
```

| Pacote | Finalidade |
|--------|------------|
| `doublezero-geoprobe-agent` | Daemon do agente que executa no servidor do probe, realizando medições de latência e gerando offsets assinados |
| `doublezero` | Ferramenta CLI usada para registro de probes e comandos de gerenciamento |

---

## Registro Onchain {#onchain-registration}

O registro de probes requer autorização da fundação. Coordene com a DZF antes de prosseguir.

### Passo 1: Registrar o probe {#step-1-register-the-probe}

```bash
doublezero geolocation probe create \
  --code <probe-code> \
  --exchange <exchange-pubkey> \
  --public-ip <probe-ip> \
  --signing-pubkey <signing-key-pubkey>
```

| Parâmetro | Descrição |
|-----------|-----------|
| `--code` | Identificador único para o probe (ex.: `ams-tn-gp1`) — máximo de 32 caracteres |
| `--exchange` | Chave pública da conta do Serviceability Exchange à qual este probe está associado |
| `--public-ip` | Endereço IPv4 público onde o probe escuta |
| `--signing-pubkey` | Chave pública usada para assinar offsets e telemetria |

### Passo 2: Vincular DZDs pais {#step-2-link-parent-dzds}

```bash
doublezero geolocation probe add-parent \
  --probe <probe-code> \
  --device <dzd-code>
```

Cada DZD pai deve ser um dispositivo ativado no Serviceability Program. Os DZDs descobrem automaticamente os probes filhos a cada 60 segundos — uma vez vinculado, o DZD inicia as medições TWAMP e a geração de offsets automaticamente.

---

## Executando o Agente {#running-the-agent}

```bash
doublezero-geoprobe-agent \
  --env mainnet-beta \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey>
```

### Flags Obrigatórias {#required-flags}

| Flag | Descrição |
|------|-----------|
| `--keypair` | Caminho para o arquivo do par de chaves Ed25519 para assinatura de offsets |
| `--geoprobe-pubkey` | A chave pública [onchain](../reference/glossary.md#onchain) do probe (obtida do `probe create`) |
| `--env` | Ambiente de rede: `testnet`, `devnet` ou `mainnet-beta` (define a URL do RPC do ledger) |

Alternativamente, use `--ledger-rpc-url` em vez de `--env` para especificar um endpoint RPC Solana personalizado.

### Flags Opcionais {#optional-flags}

| Flag | Padrão | Descrição |
|------|--------|-----------|
| `--twamp-listen-port` | 8925 | Porta para medições TWAMP dos DZDs pais |
| `--signed-twamp-port` | 8924 | Porta para sondas TWAMP assinadas de alvos de entrada |
| `--udp-listen-port` | 8923 | Porta para receber datagramas LocationOffset dos DZDs |
| `--probe-interval` | 30s | Com que frequência medir cada alvo |
| `--max-offset-age` | 1h | Idade máxima de um offset DZD em cache antes de ser descartado |
| `--verify-interval` | 29s | Com que frequência reverificar as atribuições de alvos no ledger |
| `--verbose` | false | Habilitar logging detalhado |
| `--metrics-enable` | false | Habilitar endpoint de métricas Prometheus |
| `--metrics-addr` | — | Endereço para o endpoint de métricas Prometheus (ex.: `0.0.0.0:9090`) |

---

## Portas e Firewall {#ports-and-firewall}

O agente geoprobe requer várias portas abertas:

| Porta | Protocolo | Direção | Finalidade |
|-------|-----------|---------|------------|
| 8923/udp | UDP | Entrada dos DZDs | Recebe datagramas LocationOffset assinados |
| 8924/udp | UDP | Entrada dos alvos | Refletor TWAMP assinado (fluxo de sondagem de entrada) |
| 8925/udp | UDP | Entrada dos DZDs | Medições TWAMP dos DZDs pais |
| ICMP | ICMP | Saída para alvos | Requisições ICMP echo para alvos OutboundIcmp |

!!! note
    O agente também precisa de UDP de saída para alvos para sondagem TWAMP (fluxo de saída) e para entregar resultados LocationOffset assinados aos alvos.

---

## Monitoramento {#monitoring}

Habilite o endpoint de métricas Prometheus para visibilidade operacional:

```bash
doublezero-geoprobe-agent \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey> \
  --env testnet \
  --metrics-enable \
  --metrics-addr 0.0.0.0:9090
```

Métricas principais para monitorar:

- **Disponibilidade do probe** — tempo de atividade do processo do agente
- **Latência DZD-para-Probe** — deve ser inferior a 1ms; valores mais altos indicam um problema de posicionamento
- **Alvos ativos** — número de alvos que o probe está medindo atualmente
- **Falhas de verificação de assinatura** — valores diferentes de zero podem indicar configuração incorreta de chaves ou pacotes adulterados
- **Taxa de acerto do cache de offsets** — uma taxa de acerto baixa significa que o probe está frequentemente aguardando novos offsets do DZD

Consulte o [guia de Operações](operations.md#monitoring) para orientações gerais sobre coleta Prometheus e padrões de alertas usados nos agentes DoubleZero.

---

## Comandos de Gerenciamento de Probes {#probe-management-commands}

A CLI `doublezero geolocation` fornece os seguintes subcomandos para gerenciar probes:

| Subcomando | Descrição |
|------------|-----------|
| `probe create` | Registrar um novo geoProbe onchain |
| `probe get` | Obter detalhes de um probe específico por código |
| `probe list` | Listar todos os probes registrados |
| `probe update` | Atualizar a configuração do probe (IP, porta, chave de assinatura) |
| `probe delete` | Excluir um probe (requer que não haja referências ativas de alvos) |
| `probe add-parent` | Vincular um DZD pai ao probe |
| `probe remove-parent` | Remover um DZD pai do probe |

Todos os subcomandos aceitam `--env` ou `--rpc-url` para selecionar a rede. Operações de escrita (`create`, `update`, `delete`, `add-parent`, `remove-parent`) requerem `--keypair`.

??? note "Exemplo: listando probes"

    ```bash
    doublezero geolocation probe list
    ```

    Retorna todos os probes registrados com seus códigos, IPs públicos, DZDs pais e status atual.