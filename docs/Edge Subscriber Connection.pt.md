---
description: Configure um assinante de borda para receber feeds de shred do DoubleZero, incluindo configuração do cliente e regras de firewall para GRE, BGP, PIM e tráfego de shred.
---

# Conexão de Assinante de Borda
!!! warning "Ao conectar-se ao DoubleZero, eu concordo com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol). Por favor, note que os dados são apenas para seus propósitos internos e não podem ser retransmitidos (veja a Seção 2(e))."

## Passo 1: Configuração do DoubleZero

### 1. Concluir a Configuração

Instale o [Solana CLI](https://docs.anza.xyz/cli/install).

Siga as instruções de [configuração](setup.md) para instalar e configurar o cliente DoubleZero.

Se você já configurou o DoubleZero anteriormente, certifique-se de ter o CLI Doublezero-Solana mais recente com `sudo apt update && sudo apt install doublezero-solana`

### 2. Configurar o Firewall

Permita tráfego GRE, BGP, PIM e shred.

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

O reconciliador monitora o estado onchain e provisiona automaticamente os túneis quando sua vaga é alocada. Ele não está habilitado por padrão.

```bash
doublezero enable
```

---

## Passo 2: Configurar Sua Carteira

### 1. Criar um Par de Chaves Solana

O CLI `doublezero-solana` usa um par de chaves Solana padrão para gerenciamento de vagas onchain. Se você não tiver um:

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
- **USDC** — para financiamento de vagas. O CLI utiliza a Conta de Token Associada (ATA) da sua carteira para o mint USDC da mainnet (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`).

---

## Passo 3: Comprar uma Vaga

### 1. Encontrar o Dispositivo Mais Próximo

Antes de comprar uma vaga, identifique o dispositivo com a menor latência a partir da sua máquina:

```bash
doublezero latency
```

Anote o código do dispositivo do resultado com menor latência (ex.: `<Device_Name>`). Você usará isso ao comprar uma vaga.

### 2. Verificar Preços

Veja os preços atuais dos dispositivos antes de comprometer fundos. Os preços têm dois componentes: um **preço base do metro** e um **prêmio por dispositivo**. Você também pode ver preços e disponibilidade [aqui](https://data.doublezero.xyz/dz/shreds/devices).

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

O preço por época é o custo total por época para uma vaga naquele dispositivo (base + prêmio). Use `--wide` para exibir chaves públicas completas, ou `--json` para saída em JSON.

### 3. Comprar uma Vaga

Compre uma vaga com um único comando. Isso inicializa sua vaga, financia o escrow e solicita a alocação:

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
| `--amount <USDC>` | USDC para financiar (formato decimal, ex.: `100` = 100 USDC). Deve atender ao preço mínimo por época. |
| `--source-token-account <PUBKEY>` | Conta de origem USDC personalizada (padrão é a ATA da sua carteira) |
| `--accept-partial-epoch` | Pular o aviso de época restante (veja abaixo) |
| `--fee-payer <PATH>` | Usar uma carteira diferente para taxas de transação SOL |
| `--dry-run` | Simular a transação sem executá-la |
| `--with-compute-unit-price <PRICE>` | Definir um preço de unidade de computação para inclusão mais rápida durante congestionamento |

Uma vez que sua vaga é alocada, o daemon estabelece o túnel GRE automaticamente. Verifique sua conexão com:

```bash
doublezero status
```

### Temporização de Época

Vagas são alocadas por época Solana (~2 dias). Se menos de 10% da época atual restar quando você pagar, o CLI avisa que sua vaga será alocada imediatamente, mas cobrirá apenas o restante da época atual. Um pagamento separado será deduzido do seu escrow quando a próxima época começar.

!!! info "É aconselhável financiar para mais de 1 época de cada vez para não perder sua vaga. Você pode verificar o tempo restante em uma época [aqui](https://explorer.solana.com/)."

Você pode ignorar este aviso com `--accept-partial-epoch`.

### Mantenha Seu Escrow Financiado

!!! warning "Se o saldo do seu escrow estiver abaixo do preço da época no momento da liquidação, sua vaga não será alocada, o túnel será encerrado e você perderá sua permanência acumulada. A permanência determina sua prioridade para épocas futuras — perdê-la significa que você competirá como um novato novamente."

Você pode sobrefinanciar esta conta para financiar múltiplas épocas. Cada liquidação deduz o preço de uma época do seu escrow, e o saldo restante é transferido para frente. Por exemplo, financiar 5x o preço por época mantém sua vaga ativa por até 5 épocas sem refinanciamento.

Para recarregar seu escrow, execute `shreds pay` novamente a qualquer momento:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

Note que o `Target_IP` deve ser um endereço IPv4 público na máquina que receberá os shreds. Você pode encontrá-lo executando um comando como `curl -4 ifconfig.me` na máquina alvo.

### Monitorar Vagas

Esta seção detalha como visualizar vagas via CLI. Você também pode usar [https://data.malbeclabs.com/api/v1/docs](https://data.doublezero.xyz/api/v1/docs) para monitorar vagas e auxiliar no gerenciamento da sua conta de escrow.

Veja suas vagas ativas e saldos de escrow:

**Todas as suas vagas:**

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

A coluna "Est. Epochs Paid" mostra quantas épocas seu saldo atual cobre com os preços atuais. Se os preços mudarem, esta estimativa se ajusta.

### Retirar Fundos

Feche seu escrow e reembolse o USDC restante para sua carteira:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

Você pode identificar o dispositivo por `--device <PUBKEY>` ou `--device-code <CODE>`, assim como em outros comandos.

Para enviar o reembolso para uma conta de token diferente:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "Retirar significa que você perde sua vaga e a permanência acumulada."

---

## Endereços de Shred (IP vs Porta)

Shreds de Líder e Shreds de Retransmissão de alto stake chegarão pela porta `7733`, através da interface `doublezero1`. A interface `doublezero0` é para tráfego unicast. A porta `5765` é um monitor de heartbeat dos publicadores de shred — esta não conterá shreds.

Para consumo de shreds, o **endereço IP** identifica o fluxo multicast e a **porta** identifica o serviço UDP nesse fluxo.  
Todos os fluxos de shred abaixo usam a porta UDP `7733` em `doublezero1`.

Você pode examinar os IPs de qualquer grupo multicast com:

```bash
doublezero multicast group list
```

### Shreds de Líder

- `edge-solana-shreds`: `233.84.178.1:7733`

### Shreds de Raiz

- `edge-solana-root`: `233.84.178.16:7733`

### Shreds de Retransmissão

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## Cabeçalho do Túnel GRE — XDP

!!! note "O tráfego de shred entregue pela rede é encapsulado em GRE. Você pode precisar remover o cabeçalho GRE antes de alimentar os dados no seu pipeline existente (ex.: um deshredder baseado em XDP)."

---

## Ferramentas e Painéis

### [Placar do Edge](https://data.malbeclabs.com/dz/shreds/scoreboard)

O Placar compara a velocidade de entrega de shreds entre o DoubleZero Edge e outros provedores, usando dados em nível de slot para comparar desempenho em tempo real. Use este painel para ver uma visão das taxas de vitória dos shreds do Edge contra outros provedores. Você pode ver resultados apenas para shreds de líder, além de comparação de feed completo. Você também pode detalhar por região para ver o desempenho esperado.

### [Publicadores do Edge](https://data.malbeclabs.com/dz/shreds/publishers)

A métrica "Publishing Shreds" no canto superior esquerdo do painel mostra o percentual total de peso de stake de todos os validadores Solana publicando shreds de líder no DoubleZero Edge. Você pode ver detalhes de cada publicador na rede.

### [Assinantes, Dispositivos e Atividade do Edge](https://data.malbeclabs.com/dz/shreds/subscribers)

Você pode facilmente pesquisar seu IP de Cliente nesta página para vagas assinadas e visualizar o status. Clique em assinaturas de vagas específicas para ver o histórico de pagamentos e atividade. Você também pode ver dispositivos disponíveis na página [Dispositivos](https://data.doublezero.xyz/dz/shreds/devices) e toda a atividade recente na página [Atividade](https://data.malbeclabs.com/dz/shreds/activity).

### Documentação da API de Dados

Para acesso programático aos endpoints de dados, veja a documentação da API: [https://data.malbeclabs.com/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

---

## Solução de Problemas

Se você encontrar um problema não coberto aqui, por favor entre em contato pelo seu canal existente antes de tentar uma solução alternativa. Se você não tiver um canal, por favor pesquise no [Discord](https://discord.gg/U2fEb4Jq) e abra um ticket se necessário.

### Certifique-se de que seu Cliente está atualizado:

Execute: `sudo apt update && sudo apt install doublezero-solana`

### Saldo de escrow insuficiente

Se o saldo do seu escrow estiver abaixo do preço da época no momento da liquidação, a vaga não é alocada, o túnel é encerrado e a permanência é perdida. Recarregue com `shreds pay` antes da próxima liquidação.

### Vaga não alocada após pagamento

- Você pode ter pago no final da época — a vaga entra em vigor na próxima época.
- Todas as vagas no dispositivo podem estar ocupadas por titulares com maior permanência. Verifique vagas disponíveis com `shreds price`.
- Se você retirou antes da liquidação, a vaga não era elegível.

### Túnel não está subindo

1. Verifique se o daemon está em execução: `sudo systemctl status doublezerod`
2. Verifique se o reconciliador está habilitado: `doublezero enable`
3. Verifique se as regras de firewall estão configuradas (GRE, BGP, PIM, tráfego de shred em `doublezero1`, porta 44880 em `doublezero0`)
4. Verifique se sua vaga está ativa para a época atual: `doublezero-solana shreds list`
5. Verifique o status da sua conexão: `doublezero status`

O IP do cliente do daemon é descoberto automaticamente a partir do IP público do seu host — verifique se ele corresponde ao `--client-ip` usado nos seus comandos de vaga.

### Aviso de época

O CLI avisa quando menos de 10% da época resta. Suas opções:

- Aceitar com `--accept-partial-epoch` se você quiser a vaga imediatamente
- Aguardar a próxima época para obter cobertura completa de uma época

### "Amount is below the current price"

O comando `pay` valida seu valor contra o preço mínimo por época (base do metro + prêmio do dispositivo). Use `shreds price` para verificar os preços atuais e aumente seu valor.

### "Multicast user already exists"

Você já tem uma assinatura ativa por um caminho diferente. Desconecte primeiro com `doublezero disconnect`, depois tente `shreds pay` novamente.