---
description: "Peering Hyperliquid: gossip arbitrado via Block Proxy para nós não validadores."
---

# Acesso de Peering

O peering oferece aos nós não validadores um feed de gossip Hyperliquid deduplicado e de baixa latência através de um Block Proxy, incluindo mempool. Não inclui feeds de dados de mercado Edge. Para esses, consulte [Assinar Hyperliquid (Edge)](edge.md). Visão geral: [Hyperliquid](index.md).

| | |
|--|--|
| Para quem é | Nós não validadores que você opera |
| O que você recebe | Um feed de gossip arbitrado via Block Proxy (blocos + mempool) |
| Hosts receptores | 1 IP incluído |
| Preço | $999/mês (sem dados de mercado Edge) |
| Meta de disponibilidade | 99,9% mensal |

## Solicitar peering

Mais informações sobre peering estão disponíveis via [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Inclua o IP público estático do seu nó (e a região). Espere os detalhes do peer dentro de **1–3 dias úteis** após termos os detalhes do seu nó e o pagamento ser concluído.

## Conectar seu nó

Após a aprovação, enviamos o seu **IP do peer**. Aponte seu nó não validador para ele, abra seu firewall para ele e reinicie o nó.

### 1. Definir a configuração de gossip

Substitua `~/override_gossip_config.json` pelo seguinte, usando o IP do seu peer:

```json
{
  "root_node_ips": [{"Ip": "<PEER_IP>"}],
  "try_new_peers": false,
  "split_client_blocks": true,
  "chain": "Mainnet"
}
```

| Configuração | Motivo |
|--|--|
| `root_node_ips` | Seu peer DoubleZero é seu único upstream. |
| `try_new_peers: false` | Mantém o nó no peer DoubleZero. Ele não mudará para peers públicos. |
| `split_client_blocks: true` | Transmite transações do mempool para `~/hl/data/mempool_txs/`. |

### 2. Abrir seu firewall para o peer

Permita **TCP e UDP de entrada nas portas 4001–4002 vindos de `<PEER_IP>`**. Faça isso no security group da sua nuvem e no firewall do host.

Quando seu nó se conecta, o peer se conecta de volta ao seu nó nas portas 4001 e 4002 para verificar se ele está acessível. Se essa verificação for bloqueada, a conexão é aberta mas nenhum dado chega. Permita também conexões de saída para o peer nas portas 4001–4002.

### 3. Reiniciar o nó

```bash
sudo systemctl restart hl-node   # or however you run hl-visor
```

O nó lê este arquivo ao iniciar. Alterações feitas enquanto ele está em execução podem não ter efeito completo, então reinicie após cada alteração. A sincronização geralmente leva de 5 a 15 minutos.

### 4. Verificar se está funcionando

```bash
ss -tn state established '( dport = :4001 )'     # one connection, to <PEER_IP>
journalctl -u hl-node -f | grep 'applied block'  # blocks are being applied
ls -l ~/hl/data/mempool_txs/                     # mempool files are growing
```

!!! warning "Conectado mas sem dados"
    O peer não consegue alcançar seu nó nas portas 4001–4002. Verifique as regras de entrada do passo 2.

!!! note "Sem fallback para peers públicos"
    Com `try_new_peers: false`, seu nó aguarda pelo peer DoubleZero se ele estiver inacessível. Ele não muda para peers públicos. Entre em contato conosco se você observar `Peer full` repetido ou timeouts de conexão.

## Por que peering pago

Os root peers públicos do Hyperliquid são compartilhados: os slots são disputados, os peers rotacionam ou aplicam rate-limit, e muitos não encaminham o mempool. Um slot de peering reservado oferece um upstream estável no DoubleZero em vez de competir por essa capacidade pública.

## Como funciona

- Duas fontes de gossip: um feed A do nó não validador da Hyper Foundation e um feed B de um sentry.
- Os clientes fazem peering com uma camada de Block Proxy que escala horizontalmente. Cada proxy faz peering com ambos os nossos nós não validadores e aparece como um único peer de gossip comum para cada um deles.
- O proxy arbitra A e B em um único feed de gossip deduplicado para seus peers, de modo que qualquer uma das fontes pode cair sem interromper o fluxo.
- Adicione proxies para adicionar capacidade. A carga nos nossos nós não validadores não cresce com o número de peers.

<pre class="ascii-diagram"><code>  ┌─────────────────────┐                    ┌─────────────────────┐
  │     Foundation      │                    │       Sentry        │
  │ Non-Validating Node │                    │                     │
  └──────────┬──────────┘                    └──────────┬──────────┘
             │                                          │
┈┈┈┈┈┈┈┈┈┈┈┈┈│┈┈┈┈┈┈┈┈┈┈ DOUBLEZERO INFRA ┈┈┈┈┈┈┈┈┈┈┈┈┈┈│┈┈┈┈┈┈┈┈┈┈┈┈
             ▼                                          ▼
  ┌─────────────────────┐                    ┌─────────────────────┐
  │       Primary       │                    │      Secondary      │
  │ Non-Validating Node │                    │ Non-Validating Node │
  └──────────┬──────────┘                    └──────────┬──────────┘
             │                                          │
             │   A feed                        B feed   │
             └──────────────┐              ┌────────────┘
                            ▼              ▼
                    ┌────────────────────────┐         ┌──────────────────┐
                    │      Block Proxy       │◀╌╌╌╌╌╌╌╌│ Snapshot Service │
                    │  (arbitrates A and B)  │         │   (on demand)    │
                    └───────────┬────────────┘         └──────────────────┘
                                │
                                │  one deduplicated gossip feed
                                ▼
                          ┌───────────┐
                          │   Peers   │
                          └───────────┘</code></pre>

O nó da Hyper Foundation faz peering com o nosso primário; um sentry alimenta o nosso secundário. Cada Block Proxy faz peering com ambos, mescla seus feeds para os clientes e obtém snapshots de bootstrap do serviço de snapshots quando necessário.

## Disponibilidade

Meta: 99,9% de disponibilidade mensal.

- Feed redundante. Cada proxy faz peering com ambos os nossos nós não validadores. Esses nós recebem blocos de fontes independentes (Foundation e sentry). Se uma sessão ou fonte cair, a outra mantém os blocos fluindo enquanto o caminho com falha se recupera.
- Nossos nós ficam atrás da camada de proxy. Peers externos só alcançam os Block Proxies. Se um proxy falhar, seus peers se reconectam a outro proxy saudável. A carga nunca recai sobre nossos nós.
- Os proxies mantêm apenas caches descartáveis (snapshot, janela de blocos recentes, buffers ao vivo), não o estado autoritativo da cadeia. Um proxy com problemas é substituído automaticamente. Um substituto só entra em serviço após as sessões upstream e caches passarem nas verificações de prontidão. Nossos nós não validadores não são reiniciados para isso.

## Autoescalonamento

- Escale adicionando um proxy. Cada proxy atende muitos peers, mas conta como um único peer em cada um dos nossos nós não validadores.
- A carga dos nós acompanha o número de proxies, não o número de peers.
- Um novo proxy entra em operação assim que os caches estão aquecidos e as verificações de prontidão passam. Não precisa de uma ressincronização completa da cadeia.
- Um peer que está entrando obtém seu snapshot de bootstrap do serviço de snapshots e os blocos de catch-up do próprio armazenamento do proxy, nunca dos nossos nós não validadores. Um pico de novos peers atinge a camada de proxy em vez disso.

## Preços

$999/mês para peering. Inclui mempool. Não inclui feeds de dados de mercado Edge. Um host receptor (IP) está incluído. O peering não é agrupado nem tem desconto com dados de mercado Edge.