# Como configurar o DoubleZero

!!! info "Terminologia"
    Novo no DoubleZero? Consulte o [Glossário](glossary.md) para definições de termos como [doublezerod](glossary.md#doublezerod), [IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency) e [DZD](glossary.md#dzd-doublezero-device).

!!! warning "Ao conectar ao DoubleZero, concordo com os [Termos de Serviço do DoubleZero](https://doublezero.xyz/terms-protocol)"


## Pré-requisitos
!!! warning inline end
    Para validadores: o DoubleZero precisa ser instalado diretamente no host do validador, não em um contêiner.
- Conectividade à internet com um endereço IP público (sem NAT)
- Servidor x86_64
- SO suportado: Ubuntu 22.04+ ou Debian 11+, ou Rocky Linux / RHEL 8+
- Privilégios de root ou sudo no servidor onde o DoubleZero será executado
- Opcional, mas útil: jq e curl para depuração

## Conectando ao DoubleZero

O Testnet do DoubleZero e o Mainnet-Beta do DoubleZero são redes fisicamente distintas. Por favor, escolha a rede apropriada durante a instalação.

Ao integrar ao DoubleZero, você estabelecerá uma **identidade DoubleZero**, representada por uma chave pública chamada **DoubleZero ID**. Essa chave faz parte de como o DoubleZero reconhece sua máquina.

## 1. Instalar os Pacotes do DoubleZero

<div data-wizard-step="install-version-info" markdown>

!!! info "Versões Atuais"
    | Pacote | Mainnet-Beta | Testnet |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |

</div>

Siga estas etapas dependendo do seu sistema operacional:

### Ubuntu / Debian

<div data-wizard-step="install-deb-mainnet-beta" markdown>

A implantação recomendada atual para Mainnet-Beta é:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

<div data-wizard-step="install-deb-testnet" markdown>

A implantação recomendada atual para Testnet é:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

### Rocky Linux / RHEL

<div data-wizard-step="install-rpm-mainnet-beta" markdown>

A implantação recomendada atual para Mainnet-Beta é:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-rpm-testnet" markdown>

A implantação recomendada atual para Testnet é:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-network-warning" markdown>

??? info "Apenas Usuários Existentes: Mudar um pacote de *Testnet para Mainnet-Beta*, ou de *Mainnet-Beta para Testnet*"
    Quando você instala a partir de um dos repositórios de pacotes acima, ele é específico para o **Testnet** do DoubleZero ou o **DoubleZero Mainnet Beta**. Se você trocar de rede em algum momento, precisará remover os repositórios de pacotes instalados anteriormente e atualizar para o repositório de destino.

    Este exemplo mostrará a migração do Testnet para o Mainnet-Beta.

    As mesmas etapas podem ser concluídas para mover do Mainnet-Beta para o Testnet, substituindo o passo 3 pelo comando de instalação do Testnet acima.


    1. Encontrar Arquivos de Repositório Antigos

        Primeiro, localize quaisquer arquivos de configuração de repositório do DoubleZero existentes em seu sistema:

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. Remover Arquivos de Repositório Antigos

        Remova os arquivos de repositório antigos encontrados na etapa anterior, por exemplo:

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. Instalar a partir do Novo Repositório

        Adicione o novo repositório Mainnet-Beta e instale o pacote mais recente:

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<versao_recomendada_atual_acima>
        ```


</div>

<div data-wizard-step="install-verify-daemon" markdown>

#### Verificar o status do `doublezerod`

Após a instalação do pacote, uma nova unidade systemd é instalada, ativada e iniciada. Para ver o status, execute:
```
sudo systemctl status doublezerod
```

</div>

### Configurar Firewall para GRE e BGP

O DoubleZero usa tunelamento GRE (protocolo IP 47) e roteamento BGP (tcp/179 em endereços link-local). Certifique-se de que seu firewall permita esses protocolos:

Permitir GRE e BGP via iptables:

<div data-wizard-step="firewall-gre-bgp-iptables" markdown>

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```

</div>

Ou permitir GRE e BGP via UFW:

<div data-wizard-step="firewall-gre-bgp-ufw" markdown>

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```

</div>

## 2. Criar Nova Identidade DoubleZero

Crie uma Identidade DoubleZero em seu servidor com o seguinte comando:

```bash
doublezero keygen
```

!!! info
    Se você tiver um ID existente que gostaria de usar, pode seguir estas etapas opcionais.

    Criar o diretório de configuração do doublezero

    ```
    mkdir -p ~/.config/doublezero
    ```

    Copie ou vincule o `id.json` que deseja usar com o DoubleZero no diretório de configuração do doublezero.

    ```
    sudo cp </caminho/para/id.json> ~/.config/doublezero/
    ```
## 3. Recuperar a identidade DoubleZero do servidor

Revise sua Identidade DoubleZero. Esta identidade será usada para criar a conexão entre sua máquina e o DoubleZero.

```bash
doublezero address
```

**Saída:**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. Verificar se o doublezerod descobriu os dispositivos DZ

Antes de conectar, certifique-se de que o `doublezerod` tenha descoberto e feito ping em cada um dos switches DZ testnet disponíveis:

```
doublezero latency
```

Exemplo de saída:

```
$ doublezero latency
 pubkey                                       | name      | ip             | min      | max      | avg      | reachable
 96AfeBT6UqUmREmPeFZxw6PbLrbfET51NxBFCCsVAnek | la2-dz01  | 207.45.216.134 |   0.38ms |   0.45ms |   0.42ms | true
 CCTSmqMkxJh3Zpa9gQ8rCzhY7GiTqK7KnSLBYrRriuan | ny5-dz01  | 64.86.249.22   |  68.81ms |  68.87ms |  68.85ms | true
 BX6DYCzJt3XKRc1Z3N8AMSSqctV6aDdJryFMGThNSxDn | ty2-dz01  | 180.87.154.78  | 112.16ms | 112.25ms | 112.22ms | true
 55tfaZ1kRGxugv7MAuinXP4rHATcGTbNyEKrNsbuVLx2 | ld4-dz01  | 195.219.120.66 | 138.15ms | 138.21ms | 138.17ms | true
 3uGKPEjinn74vd9LHtC4VJvAMAZZgU9qX9rPxtc6pF2k | ams-dz001 | 195.219.138.50 | 141.84ms | 141.97ms | 141.91ms | true
 65DqsEiFucoFWPLHnwbVHY1mp3d7MNM2gNjDTgtYZtFQ | frk-dz01  | 195.219.220.58 | 143.52ms | 143.62ms | 143.58ms | true
 9uhh2D5c14WJjbwgM7BudztdoPZYCjbvqcTPgEKtTMZE | sg1-dz01  | 180.87.102.98  | 176.66ms | 176.76ms | 176.72ms | true
```

Se nenhum dispositivo for retornado na saída, aguarde 10-20 segundos e tente novamente.

## 5. Desconectar do DoubleZero

Nas próximas seções, você definirá seu Ambiente DoubleZero. Para garantir o sucesso, desconecte a sessão atual. Isso evitará problemas relacionados a múltiplos túneis abertos em sua máquina.

Verifique

```bash
doublezero status
```

se estiver `up`, execute:

```bash
doublezero disconnect
```

### Próxima Etapa: Tenant

A conexão ao DoubleZero será diferente com base no seu caso de uso. No DoubleZero, Tenants são grupos que têm perfis de usuário semelhantes. Exemplos incluem Blockchains, Camadas de Transferência de Dados, etc.

### [Prossiga para escolher seu tenant aqui](tenant.md)


# Opcional: Habilitar Métricas Prometheus

Operadores familiarizados com métricas Prometheus podem querer habilitá-las para monitoramento do DoubleZero. Isso fornece visibilidade sobre o desempenho do cliente DoubleZero, status de conexão e saúde operacional.

## Quais Métricas Estão Disponíveis

O DoubleZero expõe várias métricas principais:
- **Informações de Build**: Versão, hash de commit e data de build
- **Status da Sessão**: Se a sessão DoubleZero está ativa
- **Métricas de Conexão**: Informações de latência e conectividade
- **Dados de Desempenho**: Throughput e taxas de erro

## Habilitar Métricas Prometheus

Para habilitar métricas Prometheus no cliente DoubleZero, siga estas etapas:

### 1. Modificar o comando de inicialização do serviço systemd doublezerod

Crie ou edite a configuração de substituição do systemd:

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

Substitua por esta configuração:

Note que o flag `-env` precisa apontar para `testnet` ou `mainnet-beta` dependendo de qual rede você gostaria de coletar dados. No bloco de exemplo, `testnet` é usado. Você pode substituí-lo por `mainnet-beta` se necessário.

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env testnet -metrics-enable -metrics-addr localhost:2113
```

### 2. Recarregar e reiniciar o serviço

```bash
sudo systemctl daemon-reload
sudo systemctl restart doublezerod
sudo systemctl status doublezerod
```

### 3. Verificar se as métricas estão disponíveis

Teste se o endpoint de métricas está respondendo:

```bash
curl -s localhost:2113/metrics | grep doublezero
```

Saída esperada:

```
# HELP doublezero_build_info Build information of the client
# TYPE doublezero_build_info gauge
doublezero_build_info{commit="0d684e1b",date="2025-09-10T16:30:25Z",version="0.6.4"} 1
# HELP doublezero_session_is_up Status of session to doublezero
# TYPE doublezero_session_is_up gauge
doublezero_session_is_up 0
```
## Resolução de Problemas

Se as métricas não aparecerem:

1. **Verificar status do serviço**: `sudo systemctl status doublezerod`
2. **Verificar configuração**: `sudo systemctl cat doublezerod`
3. **Verificar logs**: `sudo journalctl -u doublezerod -f`
4. **Testar endpoint**: `curl -v localhost:2113/metrics`
5. **Verificar porta**: `netstat -tlnp | grep 2113`


## Configurar Servidor Prometheus

Configuração e segurança estão além do escopo desta documentação.
O Grafana é uma excelente opção para visualização e possui documentação disponível [aqui](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/) detalhando como coletar métricas Prometheus.

## Dashboard Grafana (Opcional)

Para visualização, você pode criar um dashboard Grafana usando as métricas do DoubleZero. Painéis comuns incluem:
- Status da sessão ao longo do tempo
- Informações de build
- Tendências de latência de conexão
- Monitoramento de taxa de erros
