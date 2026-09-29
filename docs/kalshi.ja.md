---
description: DoubleZero Edge上でKalshiマーケットデータを取得 — Edge Connectまたはネイティブマルチキャスト。
---

# Kalshi Edge サブスクライバー接続

!!! warning "DoubleZeroに接続することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データはお客様の内部利用目的に限定されており、再送信は禁止されています（セクション2(e)を参照）。"

Kalshiフィードは、DoubleZero Edgeネットワーク上でUDPマルチキャストとして、パープスおよびスポーツのマーケットデータを配信します。フィードは4種類あります：

- パープス Top of Book (TOB)
- パープス Market by Price (MBP)
- スポーツ Top of Book (TOB)
- スポーツ Market by Price (MBP)

## どのパスを選択すべきか？

| # | パス | 最適な用途 | 作業量 |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | シンプルなCLIとWebSocket経由のデコード済みJSONを必要とするエージェントやアプリ | 最小 |
| **2** | [ネイティブマルチキャスト](#2-native-multicast-advanced) | 生のワイヤフォーマットに対して独自のデコーダーを構築する場合 | 最大 |

いずれのパスを選択する前に：[doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で必要なフィードを購入してください。購入することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)および[Kalshi利用規約](https://doublezero.xyz/dz-edge-kalshi-terms)に同意したものとみなされます。

AIにインストールを手伝ってもらいたい場合は、[DoubleZero MCP](mcp.md) に接続し、Kalshi / Edge Connectの手順を案内してもらうよう依頼してください。

---

## 1. Edge Connect（推奨） {#1-edge-connect-recommended}

**ここから始めてください。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) はエージェントフレンドリーなパスです：インストールコマンド1つでホストがDoubleZeroに参加し、アプリはバイナリマルチキャストをデコードする代わりに、**WebSocket経由のデコード済みJSON**（`ws://<host>:8081`）を利用できます。

Edge Connectは拡大するユーザーベースのニーズに対応しています。これは最も簡単な接続方法であり、特定の技術的要件がない限り、こちらを使用すべきです。

簡易版：

```bash
curl -fsSL https://get.doublezero.xyz/connect | \
  DZ_SECRET=/path/to/keypair.json DZ_FEEDS=KALSHI DZ_ASSUME_YES=1 bash
```

変数はパイプの後に配置し、インストーラー（`bash`）が受け取れるようにします。`DZ_SECRET` は `DZ_…` アクセストークン **または** アクセスパス/フィード購入を所有するSolanaキーペアJSONへのパスです。

ホストで `doublezerod` が既に実行されている場合、ホストのデーモンとコンテナ内のデーモンの両方がUDPポート `44880` をバインドするため、コンテナのデーモンは起動直後に終了します。インストーラーはホストデーモンの停止と無効化を提案し、`DZ_ASSUME_YES=1` が設定されている場合は確認なしで実行します。手動で行う場合：

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

次に、**コンテナ内で**ステータスを確認し（`BGP Session Up` とKalshiグループが表示されることを期待）、WebSocketクライアントを `:8081` に接続します：

```bash
docker exec doublezero-edge-connect doublezero status
```

**詳細な手順、確認方法、注意点：** [DoubleZero MCP](mcp.md) に接続し、Kalshi向けEdge Connectの手順を案内してもらうよう依頼してください。  
**WebSocketプロトコル仕様：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. ネイティブマルチキャスト（上級者向け） {#2-native-multicast-advanced}

!!! warning "より深い技術知識が必要です"
    ネイティブマルチキャストでは、自分でグループに参加し、ホスト上で**生の** Edgeワイヤフォーマットをデコードする必要があります。このパスは最も技術力のあるユーザーのみが選択すべきです。[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) をはじめとする [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) の仕様を読んで理解する必要があります。デコーダーを自前で持つ明確な要件がない限り、[Edge Connect](#1-edge-connect-recommended) を推奨します。

### DoubleZeroクライアントのセットアップ

[セットアップ](setup.md)の手順に従い、DoubleZeroクライアントをインストールおよび設定してください。クライアントを常に最新の状態に保ってください：

```bash
sudo apt update && sudo apt install doublezero
```

### フィードの購入

`doublezerod` が実行中の状態で、購入前に最も低レイテンシーのデバイスを確認してください：

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で購入してください。

### ファイアウォールの設定

GRE、BGP、PIM、およびKalshiフィードトラフィックを許可してください。KalshiのUDPポートは `30000`–`59999` の範囲にあります：先頭の桁はトラフィッククラス（`3` マーケットデータ、`4` リファレンスデータ、`5` スナップショット）、2桁目はフィードを示します。したがってリファレンスは常にマーケット + `10000`、スナップショットは常にマーケット + `20000` です。新しいチャネルやフィードが追加された際にファイアウォール変更が不要になるよう、`doublezero1` で全帯域を開放してください — [フィードアドレス](#feed-addresses)を参照。

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
# Kalshi マーケット / リファレンス / スナップショット（全フィード）
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

UFWには `pim` プロトコルがありません。アウトバウンドPIMはUFWのデフォルトの送信ポリシーで許可されています。送信トラフィックを拒否している場合は、`/etc/ufw/before.rules` にPIM用のrawルールを追加してください。


### サブスクライブ

購入したすべてのフィードに参加します（クライアント v0.35.0 以降）：

```bash
doublezero connect multicast
```

または**フィードコード**をスペース区切りで指定します：

```bash
doublezero connect multicast --subscribe-feed kalshi-perps-tob kalshi-perps-mbp kalshi-sports-tob kalshi-sports-mbp
```

フィードコード（`kalshi-…`）を使用してください。メトロごとのフィード名やグループコード（`edge-kalshi-…`）ではありません。`--subscribe` でグループコードを指定してサブスクライブすると、購入済みパスでは失敗します。

`✅  User Provisioned` が表示されることを確認してください。約60秒待ってから：

```bash
doublezero status
```

正しいDoubleZeroネットワーク上で `BGP Session Up` が表示されることを確認してください。

```bash
doublezero user list --client-ip <your ip>
```

フィードが `groups` 列に表示されます。グループIPは以下で確認できます：

```bash
doublezero multicast group list
```


### 自前でワイヤフォーマットをデコードする

スキーマバージョンは **`3`** です — デコーダーが実装していないバージョンのデータグラムは破棄してください。正式なレイアウト：[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)（[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) を含む）。

すべてのデータグラムは24バイトのデータグラムヘッダーで始まり、その後にMTUまでパックされた1つ以上のアプリケーションメッセージが続きます。データグラムはリトルエンディアンで固定レイアウトです。

| フィールド | 説明 |
|-------|-------|
| Magic | オフセット0の `u16`：TOBでは `0x445A`、MBPでは `0x4442`。必ず検証してください。 |
| Schema version | `3` |
| Channel ID | ポートを共有するチャネルの多重分離 |
| Sequence | ソースIPアドレス、Channel ID、宛先ポートごとに単調増加 — 各ポートが独自のシリーズを持ちます。ギャップ検出に使用してください。 |
| Send timestamp | Unixエポックからのナノ秒 |
| Message count | このデータグラムにパックされたメッセージ数 |
| Reset count | 変更があった場合（`255` → `0` のラップを含む）はリセットです。そのパブリッシャーのチャネル状態を破棄してください。MBPではベニュー全体の再シード時にセッション中にバンプされることもあります。 |
| Datagram length | 合計バイト数 |

#### アプリケーションメッセージ（TOB）

| タイプ | ID | サイズ | ポート | 内容 |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | マーケットが静かな間の生存確認 |
| InstrumentDefinition | `0x02` | 130 B | reference | シンボル、指数、ティックとロット、満期 |
| Quote | `0x03` | 60 B | market | 最良ビッドとアスク、価格とサイズ、更新フラグ |
| Trade | `0x04` | 52 B | market | 価格、サイズ、アグレッサーサイド、取引ID |
| EndOfSession | `0x06` | 12 B | market | クリーンシャットダウン |
| ManifestSummary | `0x07` | 24 B | reference | 有効フラグ、Manifest Seq変更カウンター、銘柄数、タイムスタンプ |
| PerpStats | `0x30` | 124 B | sibling | ファンディング、マーク価格とオラクル価格、建玉、日次出来高 |

edge-feed-specレジストリにおけるKalshiのSource IDは `3` です。各 `InstrumentDefinition` から `price_exponent` と `qty_exponent` を読み取ってください — ハードコードしないでください。

MBPフィードはmarket-by-priceメッセージセットを使用します。edge-feed-specのmarket-by-priceおよびreference-dataの仕様を参照してください。

配信はファイア・アンド・フォーゲットのUDPで、再送信はありません。reference-dataポートはマーケットデータの修復を行いません：`InstrumentDefinition`（少なくとも30秒に1回）と `ManifestSummary`（少なくとも1秒に1回）の繰り返し送信のみです。失われたTOB Quoteは、そのマーケットの最良ビッドまたはアスクが変化するまで失われたままです。修復パス（スナップショットサイクル）があるのはMBPフィードのみであり、MBPのコールドスタートではスナップショットポートをバインドする必要があります。トレードの重複排除は**（instrument ID, trade ID）**で行ってください。trade ID単体では行わないでください。

---

## フィードアドレス {#feed-addresses}

| フィードコード | グループコード | 説明 | マルチキャストグループ | マーケットデータ | リファレンスデータ | スナップショット |
|-----------|------------|-------------|-----------------|-------------|----------------|----------|
| `kalshi-perps-tob` | `edge-kalshi-perps-tob` | パープス top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `kalshi-perps-mbp` | `edge-kalshi-perps-mbp` | パープス market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `kalshi-sports-tob` | `edge-kalshi-sports-tob` | スポーツ top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `kalshi-sports-mbp` | `edge-kalshi-sports-mbp` | スポーツ market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

フィードコードでサブスクライブしてください。`doublezero status` と `multicast group list` ではグループコードが表示されます。

ポートスキーム：先頭の桁はトラフィッククラス（`3` マーケット、`4` リファレンス、`5` スナップショット）、2桁目はフィードです。リファレンスはマーケット + `10000`、スナップショットはマーケット + `20000` です。パープスのポートは固定です。スポーツのポートは `base + channel id` です（例：`edge-kalshi-sports-mbp` のid `10` は `34010` / `44010` / `54010` を使用）。

グループがフィードを選択し、ポートがその中のマーケットデータ、リファレンスデータ、またはスナップショットを選択します。マルチキャストの複製はソースIPアドレスとグループごとに行われ、ファブリックはUDPポートを検査しないため、グループに参加するとそのグループのすべてのトラフィックがDoubleZeroトンネル経由で配信されます。ポートは、バイトが到着した後にホスト上で適用されるソケットフィルターです。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試みる前に既存のチャネルでお問い合わせください。チャネルがない場合は、[サポート](support.md)を参照してください。

### クライアントが最新であることを確認する

実行：`sudo apt update && sudo apt install doublezero`

### データグラムが到着しない

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードが購入済みであることを確認してください。未購入のフィードではトラフィックは配信されません。
2. BGPが起動していることを確認してください：`doublezero status` で正しいDoubleZeroネットワーク上に `BGP Session Up` が表示されるはずです。
3. サブスクリプションがアクティブであることを確認してください：`doublezero user list --client-ip <your ip>` で `groups` にフィードが表示されるはずです。
4. 正しいインターフェースでグループに参加していることを確認してください。マルチキャストは `doublezero0` ではなく `doublezero1` に到着します。
5. ファイアウォールが `doublezero1` 上のフィードのUDPポートのインバウンドを許可していることを確認してください。

### シーケンスギャップ

シーケンスはソースIPアドレス、Channel ID、宛先ポートごとに追跡してください。Channel IDのみでキーイングしたデコーダーは偽のギャップを検出します。実際のギャップはデータグラムの欠落を意味します。MBPフィードでは、影響を受けたマーケットは次のスナップショットサイクルで回復します。TOBフィードには修復手段がありません：マーケットの気配値は、最良ビッドまたはアスクが次に変化した時点で再び最新になります。

### リセットカウントの変更

リセットカウントの変更は、そのパブリッシャーがチャネルを再起動またはリシードしたことを意味します。そのソースIPアドレスとチャネルの状態を破棄し、reference-dataポートから定義を再取得し、MBPフィードではスナップショットポートからブックを再構築してください。

### トンネルが起動しない

1. **Edge Connect：** コンテナ内でステータスを実行してください — `docker exec doublezero-edge-connect doublezero status`。フィードが正常でもホストの `doublezero status` は失敗することがよくあります（コンテナがデーモンを所有しているため）。ホストの `doublezerod` が停止していることを確認してください。
2. **ネイティブ：** ホストデーモンが実行中であることを確認してください：`sudo systemctl status doublezerod`
3. ファイアウォールルールが設定されていることを確認してください（GRE、BGP、PIM、および `doublezero1` 上のフィードポート）
4. 接続した場所（コンテナまたはホスト）と同じ場所から接続ステータスを確認してください — 正しいDoubleZeroネットワーク上で `BGP Session Up` が表示されることを期待してください

クライアントIPはホストのパブリックIPから自動検出されます。フィード購入時に使用したIPと一致していることを確認してください。

---

## リサーチリファレンスデザイン

オプションです。ホスト上にDoubleZeroトンネルとサブスクリプションが既にあり、フィードデータを**記録してチャート化**したい場合、リサーチリファレンスデザインはDocker Composeでマルチキャスト → パーサー → topofbook-bot → ClickHouse → Grafana を実行します：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

これはデモをKalshiパープスTOBに向けています。別のフィードの場合は、[フィードアドレス](#feed-addresses)から該当するグループとポートを使用してください：

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.3/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=31000/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=41000/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafanaは通常、ホスト上の `http://localhost:3000` でアクセスできます。詳細とダッシュボード：[demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md)。

これは既に受信しているデータを可視化するものです。フィードの購入、サブスクリプション、または上記いずれかの接続パスの代替にはなりません。