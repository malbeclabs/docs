---
description: "Peering Hyperliquid: gossip arbitrado via Block Proxy para nós não validadores."
---

# Acesso de Peering

O peering oferece a nós não validadores um feed de gossip Hyperliquid de baixa latência e deduplicado através de um Block Proxy, incluindo mempool. Não inclui feeds de dados de mercado do Edge. Para esses, consulte [Assinar Hyperliquid (Edge)](/hyperliquid/edge/). Visão geral: [Hyperliquid](/hyperliquid/).

| | |
|--|--|
| Para quem é | Nós não validadores que você opera |
| O que você recebe | Um feed de gossip arbitrado via Block Proxy (blocos + mempool) |
| Hosts receptores | 1 IP incluído |
| Preço | $999/mês (sem dados de mercado Edge) |
| Meta de disponibilidade | 99,9% mensal |

## Solicitar peering

Mais informações sobre peering estão disponíveis via [Telegram](https://t.me/doublezero_telegram_bot?start=fromwebsite). Inclua o IP público estático do seu nó (e região). Espere os detalhes do peer dentro de **1–3 dias úteis** após termos os detalhes do seu nó e o pagamento ser concluído.

## Por que peering pago

Os root peers públicos do Hyperliquid são compartilhados: os slots são disputados, os peers rotacionam ou aplicam rate-limit, e muitos não encaminham mempool. Um slot de peering reservado oferece um upstream estável no DoubleZero em vez de competir por essa capacidade pública.

## Como funciona

- Duas fontes de gossip: um feed A do nó não validador da Hyper Foundation, e um feed B de um sentry.
- Os clientes fazem peering com uma camada de Block Proxy que escala horizontalmente. Cada proxy faz peering com ambos os nossos nós não validadores e aparenta ser um único peer de gossip comum para cada um deles.
- O proxy arbitra A e B em um único feed de gossip deduplicado para seus peers, de modo que qualquer uma das fontes pode cair sem interromper o fluxo.
- Adicione proxies para aumentar a capacidade. A carga nos nossos nós não validadores não cresce com o número de peers.

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

O nó da Hyper Foundation faz peering com nosso primário; um sentry alimenta nosso secundário. Cada Block Proxy faz peering com ambos, mescla seus feeds para seus clientes e obtém snapshots de bootstrap do serviço de snapshots quando necessário.

## Disponibilidade

Meta: 99,9% de disponibilidade mensal.

- Feed redundante. Cada proxy faz peering com ambos os nossos nós não validadores. Esses nós recebem blocos de fontes independentes (Foundation e sentry). Se uma sessão ou fonte cair, a outra mantém os blocos fluindo enquanto o caminho com falha se recupera.
- Nossos nós ficam atrás da camada de proxy. Peers externos só alcançam os Block Proxies. Se um proxy falhar, seus peers reconectam a outro proxy saudável. A carga nunca recai sobre nossos nós.
- Os proxies mantêm apenas caches descartáveis (snapshot, janela de blocos rolante, buffers ao vivo), não estado autoritativo da chain. Um proxy com problemas é substituído automaticamente. Um substituto só entra em serviço após as sessões upstream e os caches passarem nas verificações de prontidão. Nossos nós não validadores não são reiniciados para isso.

## Autoescalonamento

- Escale adicionando um proxy. Cada proxy serve muitos peers, mas conta como um único peer em cada um dos nossos nós não validadores.
- A carga dos nós acompanha o número de proxies, não o número de peers.
- Um novo proxy fica disponível assim que os caches estiverem aquecidos e as verificações de prontidão passarem. Não é necessário um resync completo da chain.
- Um peer que está se conectando obtém seu snapshot de bootstrap do serviço de snapshots e blocos de recuperação do armazenamento do próprio proxy, nunca dos nossos nós não validadores. Um pico de novos peers atinge a camada de proxy em vez disso.

## Preços

$999/mês para peering. Inclui mempool. Não inclui feeds de dados de mercado Edge. Um host receptor (IP) está incluído. O peering não é agrupado nem tem desconto com dados de mercado Edge.