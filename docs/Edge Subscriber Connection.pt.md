---
description: Configure um assinante edge para receber feeds de shreds do DoubleZero, incluindo configuração do cliente e regras de firewall para GRE, BGP, PIM e tráfego de shreds.
---

# Conexão de Assinante Edge
!!! warning "Ao conectar-se ao DoubleZero, eu concordo com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol). Observe que os dados são apenas para seus fins internos e não podem ser retransmitidos (veja a Seção 2(e))."

!!! warning "Já está na assinatura via CLI?"
    Se você se inscreveu através da **CLI** (`doublezero-solana shreds pay` / escrow seats), use a [página de assinatura via CLI](Edge Subscriber CLI.md) para esses comandos. Esse sistema está sendo **descontinuado em 30 de agosto de 2026**. Novas assinaturas seguem esta página.

## Passo 1: Configuração do DoubleZero

### Configuração Completa

Instale a [Solana CLI](https://docs.anza.xyz/cli/install).

Siga as instruções de [configuração](setup.md) para instalar e configurar o cliente DoubleZero.

Se você já configurou o DoubleZero anteriormente, certifique-se de ter a versão mais recente da CLI Doublezero-Solana com `sudo apt update && sudo apt install doublezero-solana`

### Configure o Firewall

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

---

## Passo 2: Escolha um metro

Identifique a localização com menor latência a partir da máquina que receberá os shreds:

```bash
doublezero latency
```

Anote o metro / cidade do resultado com menor latência. Você selecionará essa cidade no formulário de inscrição. Veja o [mapa de topologia](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) para ver como os metros são agrupados.

### Preços

Os assentos são cobrados **por mês**, por máquina, no metro que você selecionar:

| Metros | Preço |
|--------|-------|
| Frankfurt, Amsterdã | $1.500 / mês |
| Londres, Nova York, Singapura, Tóquio | $900 / mês |
| Todas as outras localizações | $450 / mês |

---

## Passo 3: Envie a Solicitação

1. Acesse [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Selecione **Solana Shreds**.
3. Selecione a **cidade** (metro) que você precisa. Use a tabela acima e `doublezero latency` para escolher.
4. Preencha o formulário de inscrição.

Você atribuirá um DoubleZero ID (chave existente ou gere uma nova) a cada solicitação de feed na página de [contas](https://doublezero.xyz/shreds/account). A **chave privada correspondente deve estar presente na máquina que receberá os shreds** — não atribua uma pubkey cuja chave privada você não possa mover para esse host.

Você escolhe um **metro** e uma **pubkey**. Você **não** vincula um IP público no momento da inscrição. Durante a assinatura, você pode mover o acesso entre IPs **dentro dos metros escolhidos**.

Nossa equipe analisa as inscrições e entra em contato em tempo hábil (espere **2 dias úteis**).

---

## Passo 4: Conecte após a aprovação

Depois que entrarmos em contato com você, você receberá uma fatura, e após o pagamento dessa fatura, conecte em cada máquina aprovada:

```bash
doublezero connect multicast --subscribe-feed solana-shreds-full
```

O acesso é habilitado na data de início escolhida (tipicamente 9:01 AM ET). Verifique o túnel com:

```bash
doublezero status
```

---

## Faturamento

Os assentos são cobrados **mensalmente**. Fique atento à data de expiração do assento.

Você receberá uma fatura alguns dias antes do assento expirar. **O não pagamento leva à remoção do assento.**

---

## Endereços de Shred (IP vs Porta)

Os Leader Shreds e os Retransmit Shreds de alto stake chegarão pela porta `7733`, pela interface `doublezero1`. A interface `doublezero0` é para tráfego unicast. A porta `5765` é um monitor de heartbeat dos publicadores de shreds — ela não conterá shreds.

Para consumo de shreds, o **endereço IP** identifica o fluxo multicast e a **porta** identifica o serviço UDP nesse fluxo.  
Todos os fluxos de shred abaixo usam a porta UDP `7733` em `doublezero1`.

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

!!! note "O tráfego de shreds entregue pela rede é encapsulado em GRE. Pode ser necessário remover o cabeçalho GRE antes de alimentar os dados no seu pipeline existente (por exemplo, um deshredder baseado em XDP)."

---

## Ferramentas e Dashboards

### [Edge Scoreboard](https://data.doublezero.xyz/dz/shreds/scoreboard)

O Scoreboard avalia a velocidade de entrega de shreds entre o DoubleZero Edge e outros provedores, usando dados em nível de slot para comparar o desempenho em tempo real. Use este dashboard para ver uma visão das taxas de vitória dos shreds Edge em relação a outros provedores. Você pode visualizar resultados apenas para leader shreds, além da comparação completa do feed. Também é possível detalhar por região para ver o desempenho esperado.

### [Edge Publishers](https://data.doublezero.xyz/dz/shreds/publishers)

A métrica "Publishing Shreds" no canto superior esquerdo do dashboard mostra o percentual total de peso de stake de todos os validadores Solana publicando leader shreds no DoubleZero Edge. Você pode ver detalhes de cada publicador na rede.

### [Assinantes, Dispositivos e Atividade Edge](https://data.doublezero.xyz/dz/shreds/subscribers)

Você pode pesquisar seu IP de Cliente nesta página para assentos inscritos e visualizar o status. Você também pode ver os dispositivos disponíveis na página de [Dispositivos](https://data.doublezero.xyz/dz/shreds/devices) e toda a atividade recente na página de [Atividade](https://data.doublezero.xyz/dz/shreds/activity).

### Documentação da API de Dados

Para acesso programático aos endpoints de dados, consulte a documentação da API: [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

---

## Solução de Problemas

Se você encontrar um problema não coberto aqui, entre em contato pelo seu canal existente antes de tentar contorná-lo. Se você não tem um canal, pesquise no [Discord](https://discord.gg/U2fEb4Jq) e abra um ticket se necessário.

### Certifique-se de que seu Cliente está atualizado:

Execute: `sudo apt update && sudo apt install doublezero-solana`

### O túnel não está subindo

1. Verifique se o daemon está em execução: `sudo systemctl status doublezerod`
2. Verifique se as regras de firewall estão configuradas (GRE, BGP, PIM, tráfego de shreds em `doublezero1`, porta 44880 em `doublezero0`)
3. Confirme que a fatura deste assento foi paga e a data de início já passou
4. Execute `doublezero connect multicast --subscribe-feed solana-shreds-full` na máquina que possui a chave privada atribuída
5. Verifique o status da sua conexão: `doublezero status`

O DoubleZero ID usado na página de contas deve corresponder à chave neste host.

### Assento expirado ou removido

Os assentos são mensais. Se a fatura enviada antes da expiração não for paga, o assento é removido e o túnel não permanecerá ativo.

### "Multicast user already exists"

Você já tem uma assinatura ativa por um caminho diferente. Desconecte primeiro com `doublezero disconnect`, depois tente novamente `doublezero connect multicast --subscribe-feed solana-shreds-full`.