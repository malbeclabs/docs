---
description: Configure um assinante de borda para receber feeds de shred do DoubleZero, incluindo configuração do cliente e regras de firewall para GRE, BGP, PIM e tráfego de shreds.
---

# Conexão do Assinante de Borda
!!! warning "Ao conectar-se ao DoubleZero, eu concordo com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol). Por favor, note que os dados são apenas para seus propósitos internos e não podem ser retransmitidos (veja a Seção 2(e))."

## Passo 1: Configuração do DoubleZero

### 1. Concluir a Configuração

Instale o [Solana CLI](https://docs.anza.xyz/cli/install).

Siga as instruções de [configuração](setup.md) para instalar e configurar o cliente DoubleZero.

Se você já configurou o DoubleZero anteriormente, certifique-se de ter o CLI Doublezero-Solana mais recente com `sudo apt update && sudo apt install doublezero-solana`

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

O reconciliador monitora o estado onchain e provisiona automaticamente túneis quando seu assento é alocado. Ele não é habilitado por padrão.

```bash
doublezero enable
```

---

## Passo 2: Configurar Sua Carteira

### 1. Criar um Par de Chaves Solana

O CLI `doublezero-solana` usa um par de chaves Solana padrão para gerenciamento de assentos onchain. Se você não tiver um:

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
- **USDC** — para financiamento de assentos. O CLI retira da Conta de Token Associada (ATA) da sua carteira para o mint USDC da mainnet (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`).

---

## Passo 3: Comprar um Assento

### 1. Encontrar o Dispositivo Mais Próximo

Antes de comprar um assento, identifique o dispositivo com a menor latência a partir da sua máquina:

```bash
doublezero latency
```

Anote o código do dispositivo do resultado com menor latência (ex.: `<Device_Name>`). Você usará isso ao comprar um assento.

### 2. Verificar Preços

Visualize os preços atuais do dispositivo antes de comprometer fundos. Os preços têm dois componentes: um **preço base do metro** e um **prêmio por dispositivo**. Você também pode visualizar preços e disponibilidade [aqui](https://data.malbeclabs.com/dz/shreds/devices).

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

O preço da epoch é o custo total por epoch para um assento naquele dispositivo (base + prêmio). Use `--wide` para mostrar chaves públicas completas, ou `--json` para saída em JSON.

### 3. Comprar um Assento

Compre um assento com um único comando. Isso inicializa seu assento, financia o escrow e solicita a alocação:

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
| `--amount <USDC>` | USDC para financiar (formato decimal, ex.: `100` = 100 USDC). Deve atender ao preço mínimo da epoch. |
| `--source-token-account <PUBKEY>` | Conta de origem USDC personalizada (padrão é a ATA da sua carteira) |
| `--accept-partial-epoch` | Pular o aviso de epoch restante (veja abaixo) |
| `--fee-payer <PATH>` | Usar uma carteira diferente para taxas de transação SOL |
| `--dry-run` | Simular a transação sem executá-la |
| `--with-compute-unit-price <PRICE>` | Definir um preço de unidade de computação para inclusão mais rápida durante congestionamento |

Uma vez que seu assento é alocado, o daemon estabelece o túnel GRE automaticamente. Verifique sua conexão com:

```bash
doublezero status
```

### Timing da Epoch

Os assentos são alocados por epoch Solana (~2 dias). Se menos de 10% da epoch atual restar quando você pagar, o CLI avisa que seu assento será alocado imediatamente, mas cobre apenas o restante da epoch atual. Um pagamento separado será deduzido do seu escrow quando a próxima epoch começar.

!!! info "É aconselhável financiar mais de 1 epoch por vez para não perder seu assento. Você pode verificar o tempo restante em uma epoch [aqui](https://explorer.solana.com/)."

Você pode ignorar este aviso com `--accept-partial-epoch`.

### Mantenha Seu Escrow Financiado

!!! warning "Se o saldo do seu escrow estiver abaixo do preço da epoch na liquidação, seu assento não será alocado, o túnel será encerrado e você perderá sua permanência acumulada. A permanência determina sua prioridade para epochs futuras — perdê-la significa que você compete como um novato novamente."

Você pode sobrefinanciar esta conta para financiar múltiplas epochs. Cada liquidação deduz o preço de uma epoch do seu escrow, e o saldo restante é transferido. Por exemplo, financiar 5x o preço por epoch mantém seu assento ativo por até 5 epochs sem refinanciamento.

Para reabastecer seu escrow, execute `shreds pay` novamente a qualquer momento:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

Note que o `Target_IP` deve ser um endereço IPv4 público na máquina que receberá os shreds. Você pode encontrá-lo executando um comando como `curl -4 ifconfig.me` na máquina de destino.

### Monitorar Assentos

Esta seção detalha como visualizar assentos via CLI. Você também pode usar [https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs) para monitorar assentos e auxiliar no gerenciamento da sua conta escrow.

Visualize seus assentos ativos e saldos de escrow:

**Todos os seus assentos:**

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

A coluna "Est. Epochs Paid" mostra quantas epochs seu saldo atual cobre com os preços atuais. Se os preços mudarem, esta estimativa se ajusta.

### Sacar Fundos

Feche seu escrow e reembolse o USDC restante para sua carteira:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

Você pode identificar o dispositivo por `--device <PUBKEY>` ou `--device-code <CODE>`, assim como outros comandos.

Para enviar o reembolso para uma conta de token diferente:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "Sacar significa que você perde seu assento e a permanência acumulada."

---

## Endereços de Shred (IP vs Porta)

Shreds de Líder e Shreds de Retransmissão de alto stake chegarão pela porta `7733`, pela interface `doublezero1`. A interface `doublezero0` é para tráfego unicast. A porta `5765` é um monitor de heartbeat dos publicadores de shreds — isso não conterá shreds.

Para consumo de shreds, o **endereço IP** identifica o fluxo multicast e a **porta** identifica o serviço UDP nesse fluxo.  
Todos os fluxos de shred abaixo usam a porta UDP `7733` em `doublezero1`.

Você pode examinar os IPs de qualquer grupo multicast com:

```bash
doublezero multicast group list
```

### Shreds de Líder

- `edge-solana-shreds`: `233.84.178.1:7733`

### Shreds de Root

- `edge-solana-root`: `233.84.178.16:7733`

### Shreds de Retransmissão

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## Cabeçalho do Túnel GRE — XDP

!!! note "O tráfego de shred entregue pela rede é encapsulado em GRE. Pode ser necessário remover o cabeçalho GRE antes de alimentar os dados no seu pipeline existente (ex.: um deshredder baseado em XDP)."

---

## Ferramentas e Painéis

### [Placar do Edge](https://data.malbeclabs.com/dz/shreds/scoreboard)

O Placar compara a velocidade de entrega de shreds entre o DoubleZero Edge e outros provedores, usando dados em nível de slot para comparar o desempenho em tempo real. Use este painel para ver as taxas de vitória dos shreds Edge contra outros provedores. Você pode visualizar resultados apenas para shreds de líder, além de comparação de feed completo. Você também pode detalhar por região para ver o desempenho esperado.

### [Publicadores Edge](https://data.malbeclabs.com/dz/shreds/publishers)

A métrica "Publishing Shreds" no canto superior esquerdo do painel mostra o percentual total de peso de stake de todos os validadores Solana publicando shreds de líder no DoubleZero Edge. Você pode ver detalhes de cada publicador na rede.

### [Assinantes, Dispositivos e Atividade do Edge](https://data.malbeclabs.com/dz/shreds/subscribers)

Você pode facilmente pesquisar seu IP de Cliente nesta página para assentos inscritos e visualizar o status. Clique em assinaturas de assentos específicas para ver o histórico de pagamentos e atividade. Você também pode visualizar dispositivos disponíveis na página de [Dispositivos](https://data.malbeclabs.com/dz/shreds/devices) e toda a atividade recente na página de [Atividade](https://data.malbeclabs.com/dz/shreds/activity).

### Documentação da API de Dados

Para acesso programático aos endpoints de dados, consulte a documentação da API: [https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs).

---

## Resolução de Problemas

Se você encontrar um problema não coberto aqui, por favor entre em contato pelo seu canal existente antes de tentar uma solução alternativa. Se você não tiver um canal, por favor pesquise no [Discord](https://discord.gg/U2fEb4Jq) e abra um ticket se necessário.

### Certifique-se de que seu Cliente está atualizado:

Execute: `sudo apt update && sudo apt install doublezero-solana`

### Saldo de escrow insuficiente

Se o saldo do seu escrow estiver abaixo do preço da epoch na liquidação, o assento não é alocado, o túnel é encerrado e a permanência é perdida. Recarregue com `shreds pay` antes da próxima liquidação.

### Assento não alocado após o pagamento

- Você pode ter pago tarde na epoch — o assento entra em vigor na próxima epoch.
- Todos os assentos no dispositivo podem estar ocupados por incumbentes com maior permanência. Verifique assentos disponíveis com `shreds price`.
- Se você sacou antes da liquidação, o assento não estava elegível.

### Túnel não está subindo

1. Verifique se o daemon está em execução: `sudo systemctl status doublezerod`
2. Verifique se o reconciliador está habilitado: `doublezero enable`
3. Verifique se as regras de firewall estão em vigor (GRE, BGP, PIM, tráfego de shred em `doublezero1`, porta 44880 em `doublezero0`)
4. Verifique se seu assento está ativo para a epoch atual: `doublezero-solana shreds list`
5. Verifique o status da sua conexão: `doublezero status`

O IP do cliente do daemon é descoberto automaticamente a partir do IP público do seu host — verifique se ele corresponde ao `--client-ip` usado nos seus comandos de assento.

### Aviso de prompt de epoch

O CLI avisa quando menos de 10% da epoch resta. Suas opções:

- Aceite com `--accept-partial-epoch` se você quiser o assento imediatamente
- Aguarde a próxima epoch para obter cobertura de uma epoch completa

### "Amount is below the current price"

O comando `pay` valida seu valor contra o preço mínimo da epoch (base do metro + prêmio do dispositivo). Use `shreds price` para verificar os preços atuais e aumente seu valor.

### "Multicast user already exists"

Você já tem uma assinatura ativa por um caminho diferente. Desconecte primeiro com `doublezero disconnect`, depois tente novamente `shreds pay`.