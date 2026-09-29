---
description: "DoubleZero Hyperliquid の提供サービス: Edge マーケットデータフィードおよび非バリデーティングノード向けピアリング。"
---

# Hyperliquid

*概要*

Hyperliquid は DoubleZero 上で2つのプロダクトを提供しています: Edge マーケットデータフィードと、非バリデーティングノード向けピアリングです。

| 提供サービス | 内容 | 対象者 | ガイド |
| --- | --- | --- | --- |
| **Market Data Feeds (Edge)** | DoubleZero Edge 上の UDP マルチキャストによる Top-of-Book および Market-by-Order | トレーダー | [Subscribe to Hyperliquid (Edge)](edge.md) |
| **Peering** | Block Proxy 経由の重複排除済み Hyperliquid ゴシップフィード（マーケットデータなし） | 非バリデーティングノード | [Peering Access](peering.md) |

## Market Data Feeds (Edge)

パブリッシャーはオーダーブックを再構築し、固定サイズのバイナリメッセージを DoubleZero Edge 上で UDP マルチキャストとして送信します。

コアフィードは Hyperliquid ネイティブのパーペチュアル（`hl`）および [trade.xyz](https://trade.xyz) パーペチュアル（`xyz`）をカバーしています:

| フィード | 説明 |
|------|-------------|
| `hyper-hl-tob` | Hyperliquid パーペチュアルの最良気配値（ベストビッド/オファー）およびトレードプリント |
| `hyper-hl-mbo` | Hyperliquid パーペチュアルの全注文単位のブック（追加、キャンセル、約定） |
| `hyper-xyz-tob` | trade.xyz パーペチュアルの最良気配値（ベストビッド/オファー）およびトレードプリント |
| `hyper-xyz-mbo` | trade.xyz パーペチュアルの全注文単位のブック（追加、キャンセル、約定） |

- Top-of-Book and Trades: 各銘柄のベストビッドとオファー、およびトレードプリント。
- Market-by-Order: すべてのレスティングオーダー（追加、キャンセル、約定）、インバンドスナップショットとデルタリカバリを含む。

複数のパブリッシャーを運用しているため、トレーダーはフェイルオーバーや最速ストリームの選択が可能です。

接続方法: [Subscribe to Hyperliquid (Edge)](edge.md)。

## Peering

Peering は、マーケットデータを取得せずに Hyperliquid ゴシップを必要とする非バリデーティングノード向けです。Block Proxy ティアとピアリングすることで、2つの上流ゴシップソース（Hyper Foundation とセントリー）を1つの重複排除済みフィードに統合し、いずれかのソースがダウンしてもストリームが停止しないようにしています。

各プロキシはノードから見ると、通常の単一ゴシップピアのように見えます。キャパシティはプロキシの追加によって拡張でき、ピア数が増加してもそれらのノードの負荷は増加しません。可用性目標は月間 99.9% です。本サービスに Edge マーケットデータフィードは含まれません。

接続方法: [Peering Access](peering.md)。