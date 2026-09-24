---
description: "Ofertas DoubleZero para Hyperliquid: feeds de dados de mercado Edge e peering para nós não validadores."
---

# Hyperliquid

*Visão geral*

A Hyperliquid possui dois produtos na DoubleZero: feeds de dados de mercado Edge e peering para nós não validadores.

| Oferta | O que é | Para quem é | Guia |
| --- | --- | --- | --- |
| **Feeds de Dados de Mercado (Edge)** | Top-of-Book e Market-by-Order como UDP multicast na DoubleZero Edge. | Traders | [Assinar Hyperliquid (Edge)](/hyperliquid/edge/) |
| **Peering** | Um feed de gossip Hyperliquid deduplicado via Block Proxy (sem dados de mercado). | Nós não validadores | [Acesso de Peering](/hyperliquid/peering/) |

## Feeds de Dados de Mercado (Edge)

Os publishers reconstroem o livro de ofertas e enviam mensagens binárias de tamanho fixo como UDP multicast pela DoubleZero Edge.

Os feeds principais cobrem perps nativos da Hyperliquid (`hl`) e perps da [trade.xyz](https://trade.xyz) (`xyz`):

| Feed | Descrição |
|------|-----------|
| `hyper-hl-tob` | Melhor oferta de compra/venda e registros de negociação para perps Hyperliquid |
| `hyper-hl-mbo` | Livro completo ordem por ordem para perps Hyperliquid (adições, cancelamentos, execuções) |
| `hyper-xyz-tob` | Melhor oferta de compra/venda e registros de negociação para perps trade.xyz |
| `hyper-xyz-mbo` | Livro completo ordem por ordem para perps trade.xyz (adições, cancelamentos, execuções) |

- Top-of-Book e Negociações: melhor oferta de compra e venda por instrumento, além de registros de negociação.
- Market-by-Order: cada ordem em repouso (adição, cancelamento, execução), com snapshot in-band e recuperação de delta.

Operamos múltiplos publishers para que os traders possam fazer failover ou escolher o stream mais rápido.

Como conectar: [Assinar Hyperliquid (Edge)](/hyperliquid/edge/).

## Peering

O peering é destinado a nós não validadores que precisam do gossip da Hyperliquid sem receber dados de mercado. Você se conecta a uma camada de Block Proxy que mescla duas fontes de gossip upstream (Hyper Foundation e sentry) em um único feed deduplicado, de modo que qualquer uma das fontes pode cair sem interromper o stream.

Cada proxy aparece como um único peer de gossip comum para nossos nós. A capacidade cresce adicionando proxies; a carga nesses nós não aumenta com a quantidade de peers. A meta de disponibilidade é de 99,9% mensal. O serviço não inclui feeds de dados de mercado Edge.

Como conectar: [Acesso de Peering](/hyperliquid/peering/).