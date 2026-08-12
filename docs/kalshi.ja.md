---
description: DoubleZero Edge上でKalshiのマーケットデータを取得 — Edge Connectまたはネイティブマルチキャスト。
---

# Kalshi Edge サブスクライバー接続

!!! warning "DoubleZeroに接続することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データは内部目的のみに使用可能であり、再送信は禁止されています（セクション2(e)を参照）。"

Kalshiフィードは、DoubleZero EdgeネットワークでUDPマルチキャストとして永久先物（perps）およびスポーツのマーケットデータを配信します。4つのフィードがあります：

- 永久先物 Top of Book (TOB)
- 永久先物 Market by Price (MBP)
- スポーツ Top of Book (TOB)
- スポーツ Market by Price (MBP)

## どのパスを選ぶべきか？

2つのパスがあります。デコーダーを自前で管理する必要がない限り、Edge Connectを推奨します。

| # | パス | 最適な用途 | 導入の手間 |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-推奨) | シンプルなCLIと正規化されたJSON WebSocketを求めるエージェントやアプリ | 最小 |
| **2** | [ネイティブマルチキャスト](#2-ネイティブマルチキャスト上級) | 生のワイヤーフォーマットに対して独自のデコーダーを構築する場合 | 最大 |

いずれのパスを選ぶ前に、[doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で必要なフィードを購入してください。購入により、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol) および [Kalshi利用規約](https://doublezero.xyz/dz-edge-kalshi-terms) に同意したものとみなされます。

AIにインストールを手伝ってもらいたい場合は、[DoubleZero MCP](mcp.md) に接続して、Kalshi / Edge Connectのセットアップをガイドしてもらうよう依頼してください。

---

## 1. Edge Connect（推奨）

**ここから始めてください。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) はエージェント向けの最適なパスです：1つのインストールコマンドでホストがDoubleZeroに参加し、アプリはバイナリマルチキャストをデコードする代わりに **WebSocket経由の正規化されたJSON** (`ws://<host>:8081`) を利用できます。

チームは拡大するユーザーベースのニーズに応じてEdge Connectを進化させています。これは最も簡単な接続方法であり、特定の技術的要件がない限りこちらを使用すべきです。

簡易版：

```bash
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

`DZ_SECRET` は `DZ_…` アクセストークン **または** アクセスパス / フィード購入を所有するSolanaキーペアJSONのパスです。

次に `doublezero status` を実行して確認し（`BGP Session Up` とKalshiグループが表示されることを期待）、WebSocketクライアントを `:8081` に接続します。

**詳細な手順、確認方法、注意事項：** [DoubleZero MCP](mcp.md) に接続して、Kalshi向けEdge Connectのセットアップをガイドしてもらうよう依頼してください。  
**WebSocketプロトコル仕様：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. ネイティブマルチキャスト（上級）

!!! warning "高度な技術知識が必要です"
    ネイティブマルチキャストでは、自分でグループに参加し、ホスト上で **生の** Edgeワイヤーフォーマットをデコードします。このパスは最も技術的に高度なユーザーのみが選択すべきです。[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) をはじめとする [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) の仕様を読んで理解する必要があります。デコーダーを自前で管理する厳密な要件がない限り、[Edge Connect](#1-edge-connect-推奨) を推奨します。

### フィードを購入する

<div data-wizard-step="kalshi-buy-feed" markdown>

購入前に最低レイテンシのデバイスを特定してください：

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で購入してください。

</div>

### DoubleZeroクライアントのセットアップ

[セットアップ](setup.md)の手順に従い、DoubleZeroクライアントをインストールおよび設定してください。クライアントは常に最新の状態を維持してください：

```bash
sudo apt update && sudo apt install doublezero
```

### ファイアウォールの設定

GRE、BGP、PIM、およびKalshiフィードのトラフィックを許可してください。KalshiのUDPポートは `30000`〜`59999` の範囲です：先頭の桁はトラフィッククラス（`3` マーケットデータ、`4` リファレンスデータ、`5` スナップショット）で、2桁目はフィードを示します。したがって、リファレンスは常にマーケット + `10000`、スナップショットは常にマーケット + `20000` です。新しいチャネルやフィードの追加時にファイアウォール変更が不要になるよう、`doublezero1` で全帯域を開放してください — [フィードアドレス](#フィードアドレス) を参照。

<div data-wizard-step="kalshi-firewall-iptables" markdown>

**iptables：**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi マーケット / リファレンス / スナップショット（全フィード）
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```

</div>

<div data-wizard-step="kalshi-firewall-ufw" markdown>

**UFW：**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Kalshi マーケット / リファレンス / スナップショット（全フィード）
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

</div>

### サブスクライブ

<div data-wizard-step="kalshi-subscribe" markdown>

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob
```

複数のフィードを指定する場合はスペース区切り：

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob edge-kalshi-perps-mbp edge-kalshi-sports-tob edge-kalshi-sports-mbp
```

プロビジョニング出力の例：

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <your dz_id>
🔍  Provisioning User for IP: <your public ip>
    The Device has been selected: <the doublezero device you are connecting to>
    Service provisioned with status: ok
✅  User Provisioned
```

約60秒待ってから：

```bash
doublezero status
```

正しいDoubleZeroネットワーク上で `BGP Session Up` が表示されることを確認してください。サブスクライバーの場合、DoubleZero IPはトンネルソースIPと一致します。

```bash
doublezero user list --client-ip <your ip>
```

`groups` カラムにフィードが表示されます。グループIPの確認：

```bash
doublezero multicast group list
```

</div>

### ワイヤーフォーマットを自分でデコードする

スキーマバージョンは **`3`** です — デコーダーが実装していないバージョンのフレームは破棄してください。正式なレイアウト：[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)、[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) を含みます。

各データグラムはフレームヘッダーで始まり、その後にMTUまでパックされた1つ以上のアプリケーションメッセージが続きます。フレームはリトルエンディアンで固定レイアウトです。

| フィールド | 備考 |
|-------|-------|
| スキーマバージョン | `3` |
| チャネルID | ポートを共有するストリームの多重分離に使用 |
| シーケンス | チャネルごとに単調増加 — ギャップ検出に使用 |
| 送信タイムスタンプ | Unixエポックからのナノ秒 |
| メッセージ数 | このフレームにパックされたメッセージ数 |
| リセットカウント | セッションごとに増加。増加した場合はステートをコールドスタートしてください。 |
| フレーム長 | 合計バイト数 |

#### アプリケーションメッセージ（TOB）

| タイプ | ID | サイズ | ポート | 内容 |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | マーケットが静かな間の生存確認 |
| InstrumentDefinition | `0x02` | 130 B | reference | シンボル、指数、ティックとロット、満期 |
| Quote | `0x03` | 60 B | market | 最良ビッド・アスク、価格とサイズ、更新フラグ |
| Trade | `0x04` | 52 B | market | 価格、サイズ、アグレッサー側、取引ID |
| ChannelReset | `0x05` | 12 B | both | セッション開始または再開 |
| EndOfSession | `0x06` | 12 B | both | 正常なシャットダウン |
| ManifestSummary | `0x07` | 24 B | reference | アクティブセットのフィンガープリントと銘柄数 |
| PerpStats | `0x30` | 124 B | sibling | ファンディング、マーク価格とオラクル価格、建玉、日次出来高 |

edge-feed-specレジストリにおけるKalshiのソースIDは `3` です。各 `InstrumentDefinition` から `price_exponent` と `qty_exponent` を読み取ってください — ハードコードしないでください。

MBPフィードはmarket-by-priceメッセージセットを使用します。edge-feed-specのmarket-by-priceおよびreference-dataの仕様を参照してください。

配信は再送なしのファイアアンドフォーゲットUDPです。欠落したデータグラムはリファレンスデータサイクル（およびMBPフィードのスナップショットプレーン）から復元してください。リファレンスデータは1回限りではなく、定期的に再送信されます。

---

## フィードアドレス

| フィード | 説明 | マルチキャストグループ | マーケットデータ | リファレンスデータ | スナップショット |
|------|-------------|-----------------|-------------|----------------|----------|
| `edge-kalshi-perps-tob` | 永久先物 top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | 永久先物 market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | スポーツ top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `edge-kalshi-sports-mbp` | スポーツ market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

ポートスキーム：先頭の桁はトラフィッククラス（`3` マーケット、`4` リファレンス、`5` スナップショット）、2桁目はフィードです。リファレンスはマーケット + `10000`、スナップショットはマーケット + `20000` です。永久先物のポートは固定です。スポーツのポートは `ベース + チャネルID` です（例：`edge-kalshi-sports-mbp` のID `10` は `34010` / `44010` / `54010` を使用します）。

グループでフィードを選択し、ポートでその中のマーケットデータ、リファレンスデータ、またはスナップショットを選択します。マルチキャストの複製はソースとグループごとに行われ、ファブリックはUDPポートを検査しないため、グループに参加するとEdge Connectリンク上のそのグループの全トラフィックが配信されます。ポートはバイトが到着した後にホスト上で適用されるソケットフィルターです。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試す前に既存のチャネルを通じてお問い合わせください。チャネルがない場合は、[サポート](support.md) を参照してください。

### クライアントが最新であることを確認する

実行：`sudo apt update && sudo apt install doublezero`

### データグラムが到着しない

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードが購入済みであることを確認してください。未購入のフィードはトラフィックを配信しません。
2. BGPが稼働していることを確認：`doublezero status` で正しいDoubleZeroネットワーク上に `BGP Session Up` が表示されるべきです。
3. サブスクリプションがアクティブであることを確認：`doublezero user list --client-ip <your ip>` で `groups` にフィードが表示されるべきです。
4. 正しいインターフェースでグループに参加していることを確認してください。マルチキャストは `doublezero0` ではなく `doublezero1` に到着します。
5. ファイアウォールが `doublezero1` でフィードのUDPポートの受信を許可していることを確認してください。

### シーケンスギャップ

シーケンスはチャネルごとに単調増加です。ギャップはデータグラムのドロップを意味します。次のリファレンスデータサイクルで銘柄ステートが復元されます。

### フレームが停止し、新しいリセットカウントで再開する

パブリッシャーの再起動によりフレームヘッダーのリセットカウントが増加します。前のセッションのステートを破棄し、次のリファレンスデータサイクルからコールドスタートしてください。

### トンネルが確立されない

1. デーモンが実行中であることを確認：`sudo systemctl status doublezerod`（ネイティブパス）またはEdge Connectコンテナが稼働中であること
2. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、および `doublezero1` 上のフィードポート）
3. 接続ステータスを確認：`doublezero status` — 正しいDoubleZeroネットワーク上で `BGP Session Up` が表示されることを期待

クライアントIPはホストのパブリックIPから自動検出されます。フィード購入時に使用したIPと一致することを確認してください。

---

## リサーチリファレンスデザイン

オプションです。ホスト上にDoubleZeroトンネルとサブスクリプションが既にあり、フィードデータを **記録およびチャート化** したい場合、リサーチリファレンスデザインはDocker Composeでマルチキャスト → パーサー → topofbook-bot → ClickHouse → Grafana を実行します：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

`.env` をKalshiグループとポートに設定し（[フィードアドレス](#フィードアドレス) を参照）、以下を実行：

```bash
cd demo
cp .env.example .env
# DZ_MULTICAST_GROUP、DZ_MARKETDATA_PORT、DZ_REFDATA_PORT、DZ_INTERFACE=doublezero1 を設定
docker compose up -d --build
```

Grafanaは通常、ホスト上の `http://localhost:3000` でアクセスできます。詳細とダッシュボード：[demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md)。

これは既に受信しているデータを可視化するものです。フィード購入、サブスクリプション、または上記いずれかの接続パスの代替にはなりません。