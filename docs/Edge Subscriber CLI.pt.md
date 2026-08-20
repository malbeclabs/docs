---
description: Configure um assinante edge para receber feeds de shreds DoubleZero, incluindo configuração do cliente e regras de firewall para GRE, BGP, PIM e tráfego de shreds.
---

# Conexão de Assinante Edge (CLI)

!!! warning "Assinatura legada via CLI — descontinuada em **30 de agosto de 2026**"
    Esta página é para usuários que já utilizam a assinatura via **CLI / seat onchain** (`doublezero-solana shreds pay`). Esse sistema será descontinuado em **30 de agosto de 2026**.

    Novas assinaturas utilizam o fluxo pelo portal em [Assinar shreds (Edge)](Edge Subscriber Connection.md).

!!! warning "Ao conectar-se ao DoubleZero, concordo com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol). Observe que os dados são apenas para seus fins internos e não podem ser retransmitidos (consulte a Seção 2(e))."

## Passo 1: Configuração do DoubleZero

### 1. Concluir a Configuração

Instale a [Solana CLI](https://docs.anza.xyz/cli/install).

Siga as instruções de [configuração](setup.md) para instalar e configurar o cliente DoubleZero.

Se você já configurou o DoubleZero anteriormente, certifique-se de ter a versão mais recente do Doublezero-Solana CLI com `sudo apt update && sudo apt install doublezero-solana`

### 2. Configurar o Firewall

Permita tráfego GRE, BGP, PIM e de shreds.

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

### 3. Habilitar o Reconciliador

O reconciliador monitora o estado onchain e provisiona túneis automaticamente quando seu seat é alocado. Ele não é habilitado por padrão.

```bash
doublezero enable
```

---

## Passo 2: Configurar Sua Carteira

### 1. Criar um Par de Chaves Solana

O CLI `doublezero-solana` utiliza um par de chaves Solana padrão para gerenciamento de seats onchain. Se você não tiver um:

```bash
solana-keygen new
```

Isso grava em `~/.config/solana/id.json`. Para usar um caminho diferente, passe `--keypair <path>` para qualquer comando `doublezero-solana`.

Imprima o endereço da sua carteira:

```bash
solana address
```

### 2. Financiar Sua Carteira

Sua carteira precisa de dois tokens:

- **SOL** — para taxas de transação Solana. Transfira SOL para o endereço da carteira impresso acima.
- **USDC** — para financiamento do seat. O CLI utiliza a Associated Token Account (ATA) da sua carteira para o mint USDC da mainnet (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`).

---

## Passo 3: Comprar um Seat

### 1. Encontrar o Dispositivo Mais Próximo

Antes de comprar um seat, identifique o dispositivo com a menor latência a partir da sua máquina:

```bash
doublezero latency
```

Anote o código do dispositivo com o resultado de menor latência (ex.: `<Device_Name>`). Você usará isso ao comprar um seat.

### 2. Verificar Preços

Veja os preços atuais dos dispositivos antes de comprometer fundos. Os preços têm dois componentes: um **preço base do metro** e um **premium por dispositivo**. Você também pode ver preços e disponibilidade [aqui](https://data.doublezero.xyz/dz/shreds/devices).

**Todos os dispositivos:**

```bash
doublezero-solana shreds price
```

**Dispositivo específico:**

```bash
doublezero-solana shreds price --device-code <Device_Name>
doublezero-solana shreds price --device <PUBKEY>
```

**Todos os dispositivos em um metro:**

```bash
doublezero-solana shreds price --metro <PUBKEY>
```

Colunas de saída: `Device Code`, `Metro Code`, `Metro Name`, `Status`, `Settled Seats`, `Available Seats`, `Base Price (USDC)`, `Premium (USDC)`, `Epoch Price (USDC)`.

O preço por epoch é o custo total por epoch para um seat naquele dispositivo (base + premium). Use `--wide` para exibir pubkeys completas, ou `--json` para saída em JSON.

### 3. Comprar um Seat

Compre um seat com um único comando. Isso inicializa seu seat, financia o escrow e solicita a alocação:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**Parâmetros:**

| Flag | Descrição |
|------|-----------|
| `--device <PUBKEY>` | Dispositivo alvo por chave pública (mutuamente exclusivo com `--device-code`) |
| `--device-code <CODE>` | Dispositivo alvo por código legível (ex.: `<Device_Name>`) |
| `--client-ip <IP>` | Endereço IPv4 público da sua máquina |
| `--amount <USDC>` | USDC a financiar (formato decimal, ex.: `100` = 100 USDC). Deve atender ao preço mínimo por epoch. |
| `--source-token-account <PUBKEY>` | Conta de origem USDC personalizada (padrão é a ATA da sua carteira) |
| `--accept-partial-epoch` | Ignora o aviso de epoch restante (veja abaixo) |
| `--fee-payer <PATH>` | Usar uma carteira diferente para taxas de transação SOL |
| `--dry-run` | Simula a transação sem executá-la |
| `--with-compute-unit-price <PRICE>` | Define um preço de unidade de computação para inclusão mais rápida durante congestionamento |

Uma vez que seu seat seja alocado, o daemon estabelece o túnel GRE automaticamente. Verifique sua conexão com:

```bash
doublezero status
```

### Temporização de Epoch

Os seats são alocados por epoch Solana (~2 dias). Se restar menos de 10% do epoch atual quando você pagar, o CLI avisa que seu seat será alocado imediatamente, mas cobre apenas o restante do epoch atual. Um pagamento separado será deduzido do seu escrow quando o próximo epoch começar.

!!! info "É aconselhável financiar por mais de 1 epoch de cada vez para não perder seu seat. Você pode verificar o tempo restante em um epoch [aqui](https://explorer.solana.com/)."

Você pode ignorar este aviso com `--accept-partial-epoch`.

### Mantenha Seu Escrow Financiado

!!! warning "Se o saldo do seu escrow estiver abaixo do preço do epoch no momento da liquidação, seu seat não será alocado, o túnel será encerrado e você perderá sua tenure acumulada. A tenure determina sua prioridade para epochs futuros — perdê-la significa que você compete como um novato novamente."

Você pode financiar a mais nesta conta para cobrir múltiplos epochs. Cada liquidação deduz o preço de um epoch do seu escrow, e o saldo restante é transportado. Por exemplo, financiar 5x o preço por epoch mantém seu seat ativo por até 5 epochs sem refinanciamento.

Para reabastecer seu escrow, execute `shreds pay` novamente a qualquer momento:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

Observe que o `Target_IP` deve ser um endereço IPv4 público na máquina que receberá os shreds. Você pode encontrá-lo executando um comando como `curl -4 ifconfig.me` na máquina de destino.

### Monitorar Seats

Esta seção detalha como visualizar seats via CLI. Você também pode usar [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs) para monitorar seats e auxiliar no gerenciamento da sua conta escrow.

Veja seus seats ativos e saldos de escrow:

**Todos os seus seats:**

```bash
doublezero-solana shreds list
```

**Filtrar por dispositivo:**

```bash
doublezero-solana shreds list --device-code <Device_Name>
```

**Filtrar por IP do cliente:**

```bash
doublezero-solana shreds list --client-ip <Target_IP>
```

**Filtrar por carteira:**

```bash
doublezero-solana shreds list --withdraw-authority <PUBKEY>
```

Colunas de saída: `Device Code`, `Client IP`, `Tenure`, `Balance (USDC)`, `Est. Epochs Paid`.

A coluna "Est. Epochs Paid" mostra quantos epochs seu saldo atual cobre com os preços atuais. Se os preços mudarem, esta estimativa se ajusta.

### Retirar Seat e Escrow

Este comando libera seu seat e encerra o escrow. Você recebe um reembolso proporcional pela parte não utilizada do epoch atual, mais qualquer saldo restante do escrow, devolvido à sua carteira. Você perde o seat e toda a tenure acumulada.

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

Você pode identificar o dispositivo por `--device <PUBKEY>` ou `--device-code <CODE>`, assim como nos outros comandos.

Para enviar o reembolso USDC para uma conta de token diferente:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "Isso não pode ser desfeito. Após a retirada, seu seat é perdido e a tenure é redefinida."

---

## Endereços de Shreds (IP vs Porta)

Leader Shreds e Retransmit Shreds de alto stake chegarão pela porta `7733`, pela interface `doublezero1`. A interface `doublezero0` é para tráfego unicast. A porta `5765` é um monitor de heartbeat dos publicadores de shreds — ela não conterá shreds.

Para consumo de shreds, o **endereço IP** identifica o stream multicast e a **porta** identifica o serviço UDP nesse stream.
Todos os streams de shreds abaixo usam a porta UDP `7733` em `doublezero1`.

Você pode examinar os IPs de qualquer grupo multicast com:

```bash
doublezero multicast group list
```

### Leader Shreds

- `edge-solana-shreds`: `233.84.178.1:7733`

### Root Shreds

- `edge-solana-root`: `233.84.178.16:7733`

### Retransmit Shreds

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## Cabeçalho do Túnel GRE — XDP

!!! note "O tráfego de shreds entregue pela rede é encapsulado em GRE. Pode ser necessário remover o cabeçalho GRE antes de alimentar os dados no seu pipeline existente (ex.: um deshredder baseado em XDP)."

---

## Ferramentas e Dashboards

### [Placar Edge](https://data.doublezero.xyz/dz/shreds/scoreboard)

O placar compara a velocidade de entrega de shreds entre o DoubleZero Edge e outros provedores, usando dados em nível de slot para comparar desempenho em tempo real. Use este dashboard para ver as taxas de vitória dos shreds Edge em comparação com outros provedores. Você pode visualizar resultados apenas para leader shreds, além da comparação completa do feed. Também é possível detalhar por região para ver o desempenho esperado.

### [Publicadores Edge](https://data.doublezero.xyz/dz/shreds/publishers)

A métrica "Publishing Shreds" no canto superior esquerdo do dashboard mostra o percentual total de peso de stake de todos os validadores Solana publicando leader shreds no DoubleZero Edge. Você pode ver detalhes de cada publicador na rede.

### [Assinantes, Dispositivos e Atividade Edge](https://data.doublezero.xyz/dz/shreds/subscribers)

Você pode facilmente pesquisar seu IP do Cliente nesta página para seats assinados e ver o status. Clique em assinaturas de seats específicos para ver o histórico de pagamentos e atividade. Você também pode ver dispositivos disponíveis na página de [Dispositivos](https://data.doublezero.xyz/dz/shreds/devices) e toda a atividade recente na página de [Atividade](https://data.doublezero.xyz/dz/shreds/activity).

### Documentação da API de Dados

Para acesso programático aos endpoints de dados, consulte a documentação da API: [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

---

## Solução de Problemas

Se você encontrar um problema não coberto aqui, entre em contato pelo seu canal existente antes de tentar uma solução alternativa. Se você não tiver um canal, pesquise no [Discord](https://discord.gg/U2fEb4Jq) e abra um ticket se necessário.

### Certifique-se de que seu Cliente está atualizado:

Execute: `sudo apt update && sudo apt install doublezero-solana`

### Saldo de escrow insuficiente

Se o saldo do seu escrow estiver abaixo do preço do epoch no momento da liquidação, o seat não será alocado, o túnel será encerrado e a tenure será perdida. Recarregue com `shreds pay` antes da próxima liquidação.

### Seat não alocado após o pagamento

- Você pode ter pago tarde no epoch — o seat entra em vigor no próximo epoch.
- Todos os seats no dispositivo podem estar ocupados por incumbentes com maior tenure. Verifique seats disponíveis com `shreds price`.
- Se você fez uma retirada antes da liquidação, o seat não era elegível.

### Túnel não está subindo

1. Verifique se o daemon está em execução: `sudo systemctl status doublezerod`
2. Verifique se o reconciliador está habilitado: `doublezero enable`
3. Verifique se as regras de firewall estão configuradas (GRE, BGP, PIM, tráfego de shreds em `doublezero1`, porta 44880 em `doublezero0`)
4. Verifique se seu seat está ativo para o epoch atual: `doublezero-solana shreds list`
5. Verifique o status da sua conexão: `doublezero status`

O IP do cliente do daemon é descoberto automaticamente a partir do IP público do seu host — verifique se ele corresponde ao `--client-ip` usado nos seus comandos de seat.

### Aviso de prompt de epoch

O CLI avisa quando resta menos de 10% do epoch. Suas opções:

- Aceitar com `--accept-partial-epoch` se você quiser o seat imediatamente
- Esperar pelo próximo epoch para obter a cobertura completa de um epoch

### "Amount is below the current price"

O comando `pay` valida seu valor contra o preço mínimo por epoch (base do metro + premium do dispositivo). Use `shreds price` para verificar os preços atuais e aumente seu valor.

### "Multicast user already exists"

Você já tem uma assinatura ativa por um caminho diferente. Desconecte primeiro com `doublezero disconnect`, depois tente `shreds pay` novamente.