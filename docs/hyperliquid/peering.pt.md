---
description: "Peering Hyperliquid: gossip arbitrado via Block Proxy para nós não-validadores."
---

# Acesso de Peering

O peering oferece a nós não-validadores um feed de gossip Hyperliquid deduplicado e de baixa latência através de um Block Proxy, incluindo mempool. Não inclui feeds de dados de mercado Edge. Para esses, consulte [Assinar Hyperliquid (Edge)](edge.md). Visão geral: [Hyperliquid](index.md).

| | |
|--|--|
| Para quem é | Nós não-validadores que você opera |
| O que você recebe | Um feed de gossip arbitrado via Block Proxy (blocos + mempool) |
| Hosts receptores | 1 IP incluído |
| Preço | $999/mês (sem dados de mercado Edge) |
| Meta de disponibilidade | 99,9% mensal |

## Solicitar peering

Mais informações sobre peering estão disponíveis via [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Inclua o IP público estático do seu nó (e a região). Espere os detalhes de peering dentro de **1–3 dias úteis** após termos os detalhes do seu nó e o pagamento estar concluído.

## Por que peering pago

Os root peers públicos da Hyperliquid são compartilhados: os slots são disputados, os peers rotacionam ou aplicam rate-limit, e muitos não encaminham mempool. Um slot de peering reservado oferece um upstream estável na DoubleZero em vez de competir por essa capacidade pública.

## Como funciona

- Duas fontes de gossip: um feed A do nó não-validador da Hyper Foundation, e um feed B de um sentry.
- Os clientes fazem peering com uma camada de Block Proxy que escala horizontalmente. Cada proxy faz peering com ambos os nossos nós não-validadores e aparece como um peer de gossip comum para cada um deles.
- O proxy arbitra A e B em um único feed de gossip deduplicado para seus peers, de modo que qualquer uma das fontes pode cair sem interromper o fluxo.
- Adicione proxies para adicionar capacidade. A carga nos nossos nós não-validadores não cresce com o número de peers.

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

O nó da Hyper Foundation faz peering com o nosso primário; um sentry alimenta o nosso secundário. Cada Block Proxy faz peering com ambos, mescla seus feeds para seus clientes, e obtém snapshots de bootstrap do serviço de snapshots quando necessário.

## Disponibilidade

Meta: 99,9% de disponibilidade mensal.

- Feed redundante. Cada proxy faz peering com ambos os nossos nós não-validadores. Esses nós recebem blocos de fontes independentes (Foundation e sentry). Se uma sessão ou fonte cair, a outra mantém os blocos fluindo enquanto o caminho com falha se recupera.
- Nossos nós ficam atrás da camada de proxy. Peers externos só alcançam Block Proxies. Se um proxy falhar, seus peers reconectam a outro proxy saudável. A carga nunca recai sobre os nossos nós.
- Os proxies mantêm apenas caches descartáveis (snapshot, janela rolante de blocos, buffers ao vivo), não estado autoritativo da chain. Um proxy com problemas é substituído automaticamente. Um substituto só entra em serviço após as sessões upstream e os caches passarem nas verificações de prontidão. Nossos nós não-validadores não são reiniciados para isso.

## Autoescalamento

- Escale adicionando um proxy. Cada proxy atende muitos peers, mas conta como um único peer em cada um dos nossos nós não-validadores.
- A carga dos nós acompanha o número de proxies, não o número de peers.
- Um novo proxy fica disponível assim que os caches estão aquecidos e as verificações de prontidão passam. Não precisa de uma ressincronização completa da chain.
- Um peer que está ingressando obtém seu snapshot de bootstrap do serviço de snapshots e blocos de atualização do próprio armazenamento do proxy, nunca dos nossos nós não-validadores. Um pico de novos peers atinge a camada de proxy em vez disso.

## Preços

$999/mês para peering. Inclui mempool. Não inclui feeds de dados de mercado Edge. Um host receptor (IP) está incluído. O peering não é agrupado nem tem desconto com dados de mercado Edge.