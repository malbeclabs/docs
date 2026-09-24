---
description: DoubleZero Edge上でKalshiのマーケットデータを取得 — Edge Connectまたはネイティブマルチキャスト。
---

# Kalshi Edge サブスクライバー接続

!!! warning "DoubleZeroに接続することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意します。データはお客様の内部目的のみに使用でき、再送信することはできません（セクション2(e)を参照）。"

Kalshiフィードは、DoubleZero Edgeネットワーク上でUDPマルチキャストとしてパープスおよびスポーツのマーケットデータを配信します。フィードは4種類あります：

- パープス Top of Book (TOB)
- パープス Market by Price (MBP)
- スポーツ Top of Book (TOB)
- スポーツ Market by Price (MBP)

## どのパスを選ぶべきか？

2つのパスがあります。デコーダーを自前で持つ必要がない限り、Edge Connectを推奨します。

| # | パス | 最適な用途 | 労力 |
|---|------|----------|------|
| **1** | [Edge Connect](#1-edge-connect-推奨) | シンプルなCLIと正規化されたJSON WebSocketを求めるエージェントやアプリ | 最小 |
| **2** | [ネイティブマルチキャスト](#2-ネイティブマルチキャスト上級者向け) | 生のワイヤーフォーマットに対して独自のデコーダーを構築する場合 | 最大 |

いずれのパスを選ぶ前に：[doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で必要なフィードを購入してください。購入により、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)および[Kalshi利用規約](https://doublezero.xyz/dz-edge-kalshi-terms)に同意したことになります。

AIにインストールを手伝ってもらいたい場合は、[DoubleZero MCP](mcp.md) に接続し、Kalshi / Edge Connectのセットアップをガイドしてもらうよう依頼してください。

---

## 1. Edge Connect（推奨）

**ここから始めてください。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) はエージェント向けのパスです：インストールコマンド1つでホストがDoubleZeroに参加し、バイナリマルチキャストをデコードする代わりに、アプリは **WebSocket経由の正規化されたJSON**（`ws://<host>:8081`）を消費できます。

チームはEdge Connectを拡大するユーザーベースのニーズに合わせて進化させています。これは最も簡単な接続方法であり、特定の技術的要件がない限り使用すべきです。

簡易版：

```bash
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

`DZ_SECRET` は `DZ_…` アクセストークン、**または**アクセスパス／フィード購入を所有するSolanaキーペアJSONへのパスです。

ホストで `doublezerod` が既に実行中の場合は、先に停止してください — コンテナのデーモンと同じトンネルを奪い合います：

```bash
sudo systemctl stop doublezerod
```

次に、**コンテナ内で**ステータスを確認し（`BGP Session Up` とKalshiグループが表示されることを期待）、WebSocketクライアントを `:8081` に接続します：

```bash
docker exec doublezero-edge-connect doublezero status
```

**詳細な手順、検証、注意事項：** [DoubleZero MCP](mcp.md) に接続し、Kalshi向けEdge Connectのセットアップをガイドしてもらうよう依頼してください。  
**WebSocketプロトコル仕様：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. ネイティブマルチキャスト（上級者向け）

!!! warning "高度な技術知識が必要です"
    ネイティブマルチキャストでは、自分でグループに参加し、ホスト上で**生の** Edgeワイヤーフォーマットをデコードします。このパスは最も技術力の高いユーザーのみが選択すべきです。[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) をはじめとする [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) の仕様を読んで理解する必要があります。デコーダーを自前で持つ必須要件がない限り、[Edge Connect](#1-edge-connect-推奨) を推奨します。

### フィードの購入

購入前に最も低レイテンシのデバイスを特定してください：

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で購入してください。


### DoubleZeroクライアントのセットアップ

[セットアップ](setup.md)の手順に従い、DoubleZeroクライアントをインストールおよび設定してください。クライアントは最新の状態を保ってください：

```bash
sudo apt update && sudo apt install doublezero
```

### ファイアウォールの設定

GRE、BGP、PIM、およびKalshiフィードのトラフィックを許可してください。KalshiのUDPポートは `30000`–`59999` の範囲です：先頭の数字はトラフィッククラス（`3` マーケットデータ、`4` リファレンスデータ、`5` スナップショット）、2桁目はフィードを示します。リファレンスは常にマーケット + `10000`、スナップショットは常にマーケット + `20000` です。新しいチャネルやフィードが追加されてもファイアウォール変更が不要になるよう、`doublezero1` で全帯域を開放してください — [フィードアドレス](#フィードアドレス)を参照。

**iptables：**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi マーケット / リファレンス / スナップショット（全フィード）
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```


**UFW：**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Kalshi マーケット / リファレンス / スナップショット（全フィード）
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```


### サブスクライブ

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob
```

複数フィードの場合はスペース区切り：

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

正しいDoubleZeroネットワーク上で `BGP Session Up` が表示されることを確認してください。サブスクライバーの場合、DoubleZero IPはTunnel Src IPと一致します。

```bash
doublezero user list --client-ip <your ip>
```

フィードが `groups` 列に表示されます。グループIPを確認するには：

```bash
doublezero multicast group list
```


### 自分でワイヤーをデコードする

スキーマバージョンは **`3`** です — デコーダーが実装していないバージョンのフレームは破棄してください。正式なレイアウト：[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)（[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) を含む）。

すべてのデータグラムはフレームヘッダーで始まり、その後にMTUまでパックされた1つ以上のアプリケーションメッセージが続きます。フレームはリトルエンディアンで固定レイアウトです。

| フィールド | 備考 |
|-----------|------|
| スキーマバージョン | `3` |
| チャネルID | ポートを共有するストリームのデマルチプレックス |
| シーケンス | チャネルごとに単調増加 — ギャップ検出に使用 |
| 送信タイムスタンプ | Unixエポックからのナノ秒 |
| メッセージ数 | このフレームにパックされたメッセージ数 |
| リセットカウント | セッションごとに増加。増加した場合はステートをコールドスタートしてください。 |
| フレーム長 | 合計バイト数 |

#### アプリケーションメッセージ（TOB）

| タイプ | ID | サイズ | ポート | 内容 |
|-------|----|--------|--------|------|
| Heartbeat | `0x01` | 16 B | market | マーケットが静かな間の生存確認 |
| InstrumentDefinition | `0x02` | 130 B | reference | シンボル、指数、ティックとロット、満期 |
| Quote | `0x03` | 60 B | market | 最良ビッドとアスク、価格とサイズ、更新フラグ |
| Trade | `0x04` | 52 B | market | 価格、サイズ、アグレッサーサイド、取引ID |
| ChannelReset | `0x05` | 12 B | both | セッション開始または再開 |
| EndOfSession | `0x06` | 12 B | both | 正常シャットダウン |
| ManifestSummary | `0x07` | 24 B | reference | アクティブセットのフィンガープリントと銘柄数 |
| PerpStats | `0x30` | 124 B | sibling | ファンディング、マークおよびオラクル価格、建玉、日次出来高 |

edge-feed-specレジストリにおけるKalshiのソースIDは `3` です。各 `InstrumentDefinition` から `price_exponent` と `qty_exponent` を読み取ってください — ハードコードしないでください。

MBPフィードはmarket-by-priceメッセージセットを使用します。edge-feed-specのmarket-by-priceおよびreference-dataの仕様を参照してください。

配信はリトランスミットなしのファイア・アンド・フォーゲットUDPです。欠落したデータグラムはリファレンスデータサイクル（およびMBPフィードのスナップショットプレーン）から復元してください。これらは一度きりではなく、一定間隔で再送出されます。

---

## フィードアドレス

| フィード | 説明 | マルチキャストグループ | マーケットデータ | リファレンスデータ | スナップショット |
|---------|------|---------------------|----------------|-------------------|---------------|
| `edge-kalshi-perps-tob` | パープス Top-of-Book | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | パープス Market-by-Price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | スポーツ Top-of-Book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `edge-kalshi-sports-mbp` | スポーツ Market-by-Price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

ポート体系：先頭の数字はトラフィッククラス（`3` マーケット、`4` リファレンス、`5` スナップショット）；2桁目はフィードです。リファレンスはマーケット + `10000`、スナップショットはマーケット + `20000` です。パープスのポートは固定です。スポーツのポートは `ベース + チャネルID` です（例：`edge-kalshi-sports-mbp` のID `10` は `34010` / `44010` / `54010` を使用）。

グループがフィードを選択し、ポートがその中のマーケットデータ、リファレンスデータ、またはスナップショットを選択します。マルチキャストのレプリケーションはソースとグループごとに行われ、ファブリックはUDPポートを検査しないため、グループに参加するとEdge Connectリンク上のそのグループの全トラフィックが配信されます。ポートは、バイトが到着した後にホスト上で適用されるソケットフィルターです。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試す前に既存のチャネルからお問い合わせください。チャネルがない場合は、[サポート](support.md)を参照してください。

### クライアントが最新であることを確認する

実行：`sudo apt update && sudo apt install doublezero`

### データグラムが到着しない

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードが購入済みであることを確認してください。未購入のフィードはトラフィックを配信しません。
2. BGPが稼働していることを確認してください：`doublezero status` で正しいDoubleZeroネットワーク上に `BGP Session Up` が表示されるはずです。
3. サブスクリプションが有効であることを確認してください：`doublezero user list --client-ip <your ip>` で `groups` の下にフィードが表示されるはずです。
4. グループが正しいインターフェースで参加されていることを確認してください。マルチキャストは `doublezero0` ではなく `doublezero1` に到着します。
5. ファイアウォールが `doublezero1` 上でフィードのUDPポートの受信を許可していることを確認してください。

### シーケンスギャップ

シーケンスはチャネルごとに単調増加です。ギャップはデータグラムがドロップされたことを意味します。次のリファレンスデータサイクルで銘柄のステートが復元されます。

### フレームが停止し、新しいリセットカウントで再開する

パブリッシャーの再起動によりフレームヘッダーのリセットカウントが増加します。前のセッションのステートを破棄し、次のリファレンスデータサイクルからコールドスタートしてください。

### トンネルが確立しない

1. **Edge Connect：** コンテナ内でステータスを実行してください — `docker exec doublezero-edge-connect doublezero status`。フィードが正常でもホストの `doublezero status` は失敗することがよくあります（コンテナがデーモンを所有しているため）。ホストの `doublezerod` が停止されていることを確認してください。
2. **ネイティブ：** ホストデーモンが実行中であることを確認してください：`sudo systemctl status doublezerod`
3. ファイアウォールルールが設定されていることを確認してください（GRE、BGP、PIM、および `doublezero1` 上のフィードポート）
4. 接続した場所（コンテナまたはホスト）と同じ場所から接続状態を確認してください — 正しいDoubleZeroネットワーク上で `BGP Session Up` が表示されることを期待してください

クライアントIPはホストのパブリックIPから自動検出されます。フィード購入時に使用したIPと一致していることを確認してください。

---

## リサーチ用リファレンスデザイン

オプションです。ホスト上にDoubleZeroトンネルとサブスクリプションが既にあり、フィードデータを**記録およびチャート化**したい場合、リサーチ用リファレンスデザインはDocker Composeでマルチキャスト → パーサー → topofbook-bot → ClickHouse → Grafana を実行します：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

`.env` をKalshiのグループとポートに向けて設定し（[フィードアドレス](#フィードアドレス)を参照）、以下を実行します：

```bash
cd demo
cp .env.example .env
# DZ_MULTICAST_GROUP, DZ_MARKETDATA_PORT, DZ_REFDATA_PORT, DZ_INTERFACE=doublezero1 を設定
docker compose up -d --build
```

Grafanaは通常ホスト上の `http://localhost:3000` で利用できます。詳細とダッシュボード：[demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md)。

これは既に受信しているデータを可視化するものです。フィードの購入、サブスクリプション、または上記のいずれかの接続パスの代替にはなりません。