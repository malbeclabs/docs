---
description: DoubleZero Edge上でKalshiのマーケットデータを取得 — Edge Connectまたはネイティブマルチキャスト。
---

# Kalshi Edge サブスクライバー接続

!!! warning "DoubleZeroに接続することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データはお客様の内部目的のみに使用可能であり、再送信することはできません（セクション2(e)を参照）。"

Kalshiフィードは、パープス（perps）およびスポーツマーケットデータをDoubleZero EdgeネットワークからUDPマルチキャストで配信します。フィードは4つあります：

- パープス Top of Book (TOB)
- パープス Market by Price (MBP)
- スポーツ Top of Book (TOB)
- スポーツ Market by Price (MBP)

## どのパスを選ぶべきか？

| # | パス | 最適な用途 | 導入コスト |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | シンプルなCLIとWebSocket経由のデコード済みJSONを求めるエージェントやアプリ | 最も低い |
| **2** | [ネイティブマルチキャスト](#2-native-multicast-advanced) | 生のワイヤーフォーマットに対して独自のデコーダーを構築する場合 | 最も高い |

いずれのパスを選ぶ場合も、まず [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で必要なフィードを購入してください。購入することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)および[Kalshi利用規約](https://doublezero.xyz/dz-edge-kalshi-terms)に同意したものとみなされます。

---

## 1. Edge Connect（推奨） {#1-edge-connect-recommended}

**ここから始めましょう。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) はエージェントフレンドリーなパスです：1つのインストールコマンドでホストがDoubleZeroに参加し、アプリはバイナリマルチキャストをデコードする代わりに **WebSocket経由のデコード済みJSON**（`ws://<host>:8081`）を利用できます。

Edge Connectは拡大するユーザーベースのニーズに応えています。これは最も簡単な接続方法であり、特定の技術的要件がない限り、こちらを使用してください。

簡易版：

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

インストーラーはシークレットの入力を求めます：`DZ_…` アクセストークン **または** アクセスパス／フィード購入を所有するSolanaキーペアJSONのパスです。

ホストの `doublezerod` がすでに実行中の場合、ホストとコンテナ内のデーモンの両方がUDPポート `44880` をバインドするため、コンテナのデーモンは起動直後に終了します。インストーラーはホストデーモンの停止と無効化を提案し、`DZ_ASSUME_YES=1` が設定されている場合は確認なしで実行します。手動で行うには：

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

次に**コンテナ内で**ステータスを確認し（`BGP Session Up` とKalshiグループが表示されることを確認）、WebSocketクライアントを `:8081` に接続します：

```bash
docker exec doublezero-edge-connect doublezero status
```

**WebSocketプロトコル仕様：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. ネイティブマルチキャスト（上級者向け） {#2-native-multicast-advanced}

!!! warning "高度な技術知識が必要です"
    ネイティブマルチキャストでは、自分でグループに参加し、ホスト上で**生の** Edgeワイヤーフォーマットをデコードします。このパスは最も技術的に高度なユーザーのみが選択すべきです。[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) をはじめとする [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) の仕様を読み、理解する必要があります。デコーダーを自前で持つ必要がない限り、[Edge Connect](#1-edge-connect-recommended) を推奨します。

### DoubleZeroクライアントのセットアップ

[セットアップ](setup.md)手順に従って、DoubleZeroクライアントをインストール・設定してください。クライアントは常に最新の状態に保ってください：

```bash
sudo apt update && sudo apt install doublezero
```

### フィードの購入

`doublezerod` が実行中の状態で、購入前に最も低レイテンシーのデバイスを確認します：

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で購入してください。

### ファイアウォールの設定

GRE、BGP、PIM、およびKalshiフィードトラフィックを許可します。KalshiのUDPポートは `30000`～`59999` の範囲です：先頭の数字はトラフィッククラス（`3` マーケットデータ、`4` リファレンスデータ、`5` スナップショット）、2番目の数字はフィードを示します。したがってリファレンスは常にマーケット + `10000`、スナップショットは常にマーケット + `20000` です。新しいチャネルやフィードの追加時にファイアウォール変更が不要となるよう、`doublezero1` 上で全帯域を開放してください — [フィードアドレス](#feed-addresses)を参照。

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

UFWには `pim` プロトコルがありません。アウトバウンドPIMはUFWのデフォルト送信ポリシーで許可されます。送信トラフィックを拒否している場合は、`/etc/ufw/before.rules` にPIMの rawルールを追加してください。


### サブスクライブ

購入した全フィードに参加します（クライアント v0.35.0 以降）：

```bash
doublezero connect multicast
```

または、**フィードコード**をスペース区切りで指定します：

```bash
doublezero connect multicast --subscribe-feed kalshi-perps-tob kalshi-perps-mbp kalshi-sports-tob kalshi-sports-mbp
```

フィードコード（`kalshi-…`）を使用してください。メトロごとのフィード名やグループコード（`edge-kalshi-…`）は使用しないでください。購入済みパスに対して `--subscribe` でグループコードを指定すると失敗します。

`✅  User Provisioned` が表示されるはずです。約60秒待ってから：

```bash
doublezero status
```

正しいDoubleZeroネットワーク上で `BGP Session Up` が表示されることを確認してください。

```bash
doublezero user list --client-ip <your ip>
```

フィードが `groups` 列に表示されます。グループIPを確認するには：

```bash
doublezero multicast group list
```


### ワイヤーフォーマットの自前デコード

スキーマバージョンは **`3`** です — デコーダーが実装していないバージョンのデータグラムは破棄してください。正式なレイアウト定義：[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)、[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) を含みます。

各データグラムは24バイトのデータグラムヘッダーで始まり、その後にMTUまでパックされた1つ以上のアプリケーションメッセージが続きます。データグラムはリトルエンディアンで固定レイアウトです。

| フィールド | 備考 |
|-------|-------|
| Magic | オフセット0の `u16`：TOBでは `0x445A`、MBPでは `0x4442`。必ず検証してください。 |
| スキーマバージョン | `3` |
| チャネルID | ポートを共有するチャネルの多重分離に使用 |
| シーケンス | 送信元IPアドレス、チャネルID、宛先ポートごとに単調増加 — 各ポートが独自のシリーズを持ちます。ギャップ検出に使用してください。 |
| 送信タイムスタンプ | Unixエポックからのナノ秒 |
| メッセージ数 | このデータグラムにパックされたメッセージ数 |
| リセットカウント | 任意の変更（`255` → `0` のラップアラウンドを含む）はリセットを意味します。そのパブリッシャーのチャネル状態を破棄してください。MBPでは、ベニュー全体の再シードによりセッション中にもインクリメントされることがあります。 |
| データグラム長 | 総バイト数 |

#### アプリケーションメッセージ（TOB）

| タイプ | ID | サイズ | ポート | 内容 |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | マーケットが静かな間の生存確認 |
| InstrumentDefinition | `0x02` | 130 B | reference | シンボル、指数、ティックとロット、満期 |
| Quote | `0x03` | 60 B | market | 最良ビッドとアスク、価格とサイズ、更新フラグ |
| Trade | `0x04` | 52 B | market | 価格、サイズ、アグレッサー側、トレードID |
| EndOfSession | `0x06` | 12 B | market | 正常シャットダウン |
| ManifestSummary | `0x07` | 24 B | reference | 有効フラグ、Manifest Seq変更カウンター、銘柄数、タイムスタンプ |
| PerpStats | `0x30` | 124 B | sibling | ファンディング、マーク価格とオラクル価格、建玉、日次出来高 |

edge-feed-specレジストリにおけるKalshiのSource IDは `3` です。各 `InstrumentDefinition` から `price_exponent` と `qty_exponent` を読み取ってください — ハードコードしないでください。

MBPフィードはmarket-by-priceメッセージセットを使用します。edge-feed-specのmarket-by-priceおよびreference-dataの仕様を参照してください。

配信はリトランスミットなしのファイア・アンド・フォーゲットUDPであり、リファレンスデータポートはマーケットデータの修復を行いません：`InstrumentDefinition`（少なくとも30秒に1回）と `ManifestSummary`（少なくとも1秒に1回）の繰り返し送信のみです。失われたTOB Quoteは、そのマーケットの最良ビッドまたはアスクが変化するまで復旧しません。修復パス（スナップショットサイクル）があるのはMBPフィードのみであり、MBPのコールドスタートではスナップショットポートをバインドする必要があります。トレードは **(instrument ID, trade ID)** で重複排除してください。trade ID単独では行わないでください。

---

## フィードアドレス {#feed-addresses}

| フィードコード | グループコード | 説明 | マルチキャストグループ | マーケットデータ | リファレンスデータ | スナップショット |
|-----------|------------|-------------|-----------------|-------------|----------------|----------|
| `kalshi-perps-tob` | `edge-kalshi-perps-tob` | パープス Top-of-Book | `233.84.178.3` | `31000` | `41000` | — |
| `kalshi-perps-mbp` | `edge-kalshi-perps-mbp` | パープス Market-by-Price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `kalshi-sports-tob` | `edge-kalshi-sports-tob` | スポーツ Top-of-Book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `kalshi-sports-mbp` | `edge-kalshi-sports-mbp` | スポーツ Market-by-Price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

フィードコードでサブスクライブします。`doublezero status` および `multicast group list` ではグループコードが表示されます。

ポート体系：先頭の数字はトラフィッククラス（`3` マーケット、`4` リファレンス、`5` スナップショット）、2番目の数字はフィードです。リファレンスはマーケット + `10000`、スナップショットはマーケット + `20000` です。パープスのポートは固定です。スポーツのポートは `ベース + チャネルID` です（例：`edge-kalshi-sports-mbp` のID `10` は `34010` / `44010` / `54010` を使用）。

グループがフィードを選択し、ポートがその中のマーケットデータ、リファレンスデータ、またはスナップショットを選択します。マルチキャストレプリケーションは送信元IPアドレスとグループ単位で行われ、ファブリックはUDPポートを検査しません。そのため、グループに参加するとDoubleZeroトンネル上のそのグループのすべてのデータが配信されます。ポートはバイト到着後にホスト上で適用されるソケットフィルターです。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試す前に既存のチャネルを通じてお問い合わせください。チャネルがない場合は、[サポート](support/index.md)を参照してください。

### クライアントが最新であることを確認する

実行：`sudo apt update && sudo apt install doublezero`

### データグラムが届かない

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードが購入済みであることを確認してください。未購入のフィードはトラフィックが配信されません。
2. BGPが起動していることを確認：`doublezero status` で正しいDoubleZeroネットワーク上に `BGP Session Up` が表示されるはずです。
3. サブスクリプションがアクティブであることを確認：`doublezero user list --client-ip <your ip>` で `groups` の下にフィードが表示されるはずです。
4. 正しいインターフェースでグループに参加していることを確認。マルチキャストは `doublezero0` ではなく `doublezero1` に到着します。
5. ファイアウォールが `doublezero1` 上でフィードのUDPポートのインバウンドを許可していることを確認してください。

### シーケンスギャップ

送信元IPアドレス、チャネルID、宛先ポートごとにシーケンスを追跡してください。チャネルIDのみをキーにしたデコーダーでは偽のギャップが検出されます。実際のギャップはデータグラムのドロップを意味します。MBPフィードでは、影響を受けたマーケットは次のスナップショットサイクルで復旧します。TOBフィードには修復手段がありません：マーケットのクォートは、そのマーケットの最良ビッドまたはアスクが次に変化するまで最新にはなりません。

### リセットカウントの変化

リセットカウントの変化は、そのパブリッシャーがチャネルを再起動または再シードしたことを意味します。その送信元IPアドレスとチャネルの状態を破棄し、リファレンスデータポートから定義を再収集してください。MBPフィードではスナップショットポートからブックを再構築してください。

### トンネルが起動しない

1. **Edge Connect：** コンテナ内でステータスを実行 — `docker exec doublezero-edge-connect doublezero status`。フィードが正常でもホストの `doublezero status` は失敗することがあります（コンテナがデーモンを所有しているため）。ホストの `doublezerod` が停止していることを確認してください。
2. **ネイティブ：** ホストデーモンが実行中であることを確認：`sudo systemctl status doublezerod`
3. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、および `doublezero1` 上のフィードポート）
4. 接続した場所（コンテナまたはホスト）から接続状態を確認 — 正しいDoubleZeroネットワーク上で `BGP Session Up` が表示されるはずです

クライアントIPはホストのパブリックIPから自動検出されます。フィード購入時に使用したIPと一致することを確認してください。

---

## リサーチリファレンスデザイン

オプションです。ホスト上にDoubleZeroトンネルとサブスクリプションが既にあり、フィードデータの**記録と可視化**を行いたい場合、リサーチリファレンスデザインはDocker Composeでマルチキャスト → パーサー → topofbook-bot → ClickHouse → Grafanaを実行します：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

これはKalshiパープスTOBをデモの対象としています。別のフィードの場合は、[フィードアドレス](#feed-addresses)のグループとポートを使用してください：

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.3/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=31000/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=41000/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafanaは通常、ホスト上の `http://localhost:3000` でアクセスできます。詳細とダッシュボード：[デモREADME](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md)。

これは既に受信しているデータを可視化するものです。フィードの購入、サブスクリプション、または上記のいずれかの接続パスの代替にはなりません。