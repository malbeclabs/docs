---
description: "Ofertas DoubleZero para Hyperliquid: Feeds de dados de mercado Edge e peering para nós não validadores."
---

# Hyperliquid

*Visão geral*

A Hyperliquid possui dois produtos na DoubleZero: feeds de dados de mercado Edge e peering para nós não validadores.

| Oferta | O que é | Para quem é | Guia |
| --- | --- | --- | --- |
| **Feeds de Dados de Mercado (Edge)** | Top-of-Book e Market-by-Order como UDP multicast na DoubleZero Edge. | Traders | [Assinar Hyperliquid (Edge)](edge.md) |
| **Peering** | Um feed de gossip Hyperliquid deduplicado via Block Proxy (sem dados de mercado). | Nós não validadores | [Acesso de Peering](peering.md) |

## Feeds de Dados de Mercado (Edge)

Os publishers reconstroem o livro de ordens e enviam mensagens binárias de tamanho fixo como UDP multicast pela DoubleZero Edge.

Os feeds principais cobrem perps nativos da Hyperliquid (`hl`) e perps da [trade.xyz](https://trade.xyz) (`xyz`):

| Feed | Descrição |
|------|-----------|
| `hyper-hl-tob` | Melhor oferta de compra/venda e registros de negociação para perps da Hyperliquid |
| `hyper-hl-mbo` | Livro completo ordem por ordem para perps da Hyperliquid (adições, cancelamentos, execuções) |
| `hyper-xyz-tob` | Melhor oferta de compra/venda e registros de negociação para perps da trade.xyz |
| `hyper-xyz-mbo` | Livro completo ordem por ordem para perps da trade.xyz (adições, cancelamentos, execuções) |

- Top-of-Book e Negociações: melhor oferta de compra e venda por instrumento, além de registros de negociação.
- Market-by-Order: cada ordem em repouso (adição, cancelamento, execução), com snapshot in-band e recuperação de delta.

Executamos múltiplos publishers para que os traders possam fazer failover ou escolher o stream mais rápido.

Como conectar: [Assinar Hyperliquid (Edge)](edge.md).

## Peering

O peering é destinado a nós não validadores que precisam do gossip da Hyperliquid sem receber dados de mercado. Você se conecta a um nível de Block Proxy que combina duas fontes de gossip upstream (Hyper Foundation e sentry) em um único feed deduplicado, de modo que qualquer uma das fontes pode cair sem interromper o stream.

Cada proxy aparece como um único peer de gossip comum para os nossos nós. A capacidade cresce adicionando proxies; a carga nesses nós não aumenta com a quantidade de peers. A meta de disponibilidade é de 99,9% mensal. O serviço não inclui feeds de dados de mercado Edge.

Como conectar: [Acesso de Peering](peering.md).