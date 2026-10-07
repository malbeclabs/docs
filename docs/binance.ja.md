---
description: DoubleZero Edge上でBinance SpotおよびUSD-M先物のマーケットデータを取得 — Edge Connectまたはネイティブマルチキャスト。
---

# Binance Edge サブスクライバー接続

!!! warning "DoubleZeroに接続することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データはお客様の内部目的のみに使用可能であり、再送信することはできません（セクション2(e)を参照）。"

Binanceフィードは、BinanceのTop-of-BookマーケットデータをDoubleZero EdgeネットワークからUDPマルチキャストで配信します。データは東京でBinanceから取り込まれ、DoubleZeroの専用ファイバーで運ばれるため、パブリックインターネットよりも早く他のメトロに届きます。Binanceは多くのスポットペアで価格発見が行われる場であり、そのデータは他のマーケットの先行指標となります。

フィードは2つあり、Binanceのマッチングエンジンごとに1つずつです：

| フィード | 銘柄 | クォートのタイムスタンプ |
|------|-------------|-----------------|
| Binance Spot | 法定通貨建てペアを含む、取引中のすべてのスポットペア | ゲートウェイ送信時刻、µs精度 |
| Binance USD-M | USDTおよびUSDC建てのパーペチュアル。限月先物とTradFiパーペチュアルは含まれません | マッチングエンジン時刻、ms精度 |

銘柄セットはBinanceの上場状況に従います：ペアや契約は取引の開始・終了に合わせて追加・削除されます。

## 料金 {#pricing}

フィードは**月額**で課金されます：

| フィード | 価格 |
|------|-------|
| Binance Spot | $100 / 月 |
| Binance USD-M | $100 / 月 |

## どのパスを選ぶべきか？ {#which-path-should-i-take}

| # | パス | 最適な用途 | 導入コスト |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | シンプルなCLIとWebSocket経由のデコード済みJSONを求めるエージェントやアプリ | 最も低い |
| **2** | [ネイティブマルチキャスト](#2-native-multicast-advanced) | 生のワイヤーフォーマットに対して独自のデコーダーを構築する場合 | 最も高い |

いずれのパスを選ぶ場合も、まず [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で必要なフィードを購入してください。購入することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。

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

次に**コンテナ内で**ステータスを確認し（`BGP Session Up` とBinanceグループが表示されることを確認）、WebSocketクライアントを `:8081` に接続します：

```bash
docker exec doublezero-edge-connect doublezero status
```

WebSocket上のすべてのBinanceメッセージには `"source_name":"BINANCE"` が含まれます。両エンジンはこの名前を共有しているため、`source_id` で区別してください：`8` がSpot、`6` がUSD-Mです。同じシンボルが両方に存在することがあり（`BTCUSDT` は一方ではスポットペア、もう一方ではパーペチュアル）、銘柄IDはエンジンごとに割り当てられるため、シンボルや銘柄IDに加えて `source_id` もキーにしてください。

**WebSocketプロトコル仕様：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. ネイティブマルチキャスト（上級者向け） {#2-native-multicast-advanced}

!!! warning "高度な技術知識が必要です"
    ネイティブマルチキャストでは、自分でグループに参加し、ホスト上で**生の** Edgeワイヤーフォーマットをデコードします。このパスは最も技術的に高度なユーザーのみが選択すべきです。[top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) をはじめとする [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) の仕様を読み、理解する必要があります。デコーダーを自前で持つ必要がない限り、[Edge Connect](#1-edge-connect-recommended) を推奨します。

### DoubleZeroクライアントのセットアップ {#doublezero-client-setup}

[セットアップ](setup.md)手順に従って、DoubleZeroクライアントをインストール・設定してください。クライアントは常に最新の状態に保ってください：

```bash
sudo apt update && sudo apt install doublezero
```

### フィードの購入 {#buy-a-feed}

`doublezerod` が実行中の状態で、購入前に最も低レイテンシーのデバイスを確認します：

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で購入してください。

### ファイアウォールの設定 {#configure-the-firewall}

GRE、BGP、PIM、およびBinanceフィードトラフィックを許可します。両フィードともマーケットデータをUDP `30001`、リファレンスデータを `30002` で配信します。フィードはポートではなくマルチキャストグループで区別されます。[フィードアドレス](#feed-addresses)を参照してください。

**iptables：**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Binance market / reference (both feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30001:30002 -j ACCEPT
```

**UFW：**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Binance market / reference (both feeds)
sudo ufw allow in on doublezero1 to any port 30001:30002 proto udp
```

UFWには `pim` プロトコルがありません。アウトバウンドPIMはUFWのデフォルト送信ポリシーで許可されます。送信トラフィックを拒否している場合は、`/etc/ufw/before.rules` にPIMの rawルールを追加してください。

### サブスクライブ {#subscribe}

購入した全フィードに参加します（クライアント v0.35.0 以降）：

```bash
doublezero connect multicast
```

購入済みパスに対して `--subscribe` でグループコードを指定すると失敗します。

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

### ワイヤーフォーマットの自前デコード {#decode-the-wire-yourself}

スキーマバージョンは **`3`** です — デコーダーが実装していないバージョンのデータグラムは破棄してください。正式なレイアウト定義：[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)、[top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md)、[Source IDレジストリ](https://github.com/malbeclabs/edge-feed-spec/blob/main/sources/spec.md)、[GLOSSARY](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md) を含みます。

各データグラムは24バイトのデータグラムヘッダーで始まり、その後にMTUまでパックされた1つ以上のアプリケーションメッセージが続きます。データグラムはリトルエンディアンで固定レイアウトです。

| フィールド | 備考 |
|-------|-------|
| Magic | オフセット0の `u16`：`0x445A`。必ず検証してください。 |
| スキーマバージョン | `3` |
| チャネルID | Spotはチャネル `1`、USD-Mはチャネル `0` を使用 |
| シーケンス | 送信元IPアドレス、チャネルID、宛先ポートごとに単調増加 — 各ポートが独自のシリーズを持ちます。ギャップ検出に使用してください。 |
| 送信タイムスタンプ | Unixエポックからのナノ秒 |
| メッセージ数 | このデータグラムにパックされたメッセージ数 |
| リセットカウント | 任意の変更（`255` → `0` のラップアラウンドを含む）はリセットを意味します。そのパブリッシャーのチャネル状態を破棄してください。 |
| データグラム長 | 総バイト数 |

#### アプリケーションメッセージ {#application-messages}

| タイプ | ID | サイズ | ポート | 内容 |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | マーケットが静かな間の生存確認 |
| InstrumentDefinition | `0x02` | 130 B | reference | シンボル、指数、ティックとロット、満期 |
| Quote | `0x03` | 60 B | market | 最良ビッドとアスク、価格とサイズ、更新フラグ |
| Trade | `0x04` | 52 B | market | 価格、サイズ、アグレッサー側、トレードID |
| EndOfSession | `0x06` | 12 B | market | 正常シャットダウン |
| ManifestSummary | `0x07` | 24 B | reference | 有効フラグ、Manifest Seq変更カウンター、銘柄数、タイムスタンプ |

**Source IDがエンジンのキーです。** 両フィードともベニューコード `BINANCE` を使用しますが、各エンジンはedge-feed-specレジストリで独自のSource IDを持ちます：`8` がBinance Spot、`6` がBinance USD-Margined Futuresです。両エンジンには重複するシンボルが上場されており（`BTCUSDT` はスポットペアでもありUSD-Mパーペチュアルでもあります）、各エンジンは銘柄IDを独立して割り当てるため、同じ銘柄IDが両フィードで異なる銘柄を指すことがあります。銘柄とブックは **(Source ID, instrument ID)** をキーにしてください。シンボルや銘柄ID単独では行わないでください。各 `InstrumentDefinition` から `price_exponent` と `qty_exponent` を読み取ってください — ハードコードしないでください。指数は価格精度であり、ティックではありません：取引可能な刻みは `tick_size × 10^price_exponent` です。

配信はリトランスミットなしのファイア・アンド・フォーゲットUDPであり、リファレンスデータポートはマーケットデータの修復を行いません：`InstrumentDefinition`（両フィードとも少なくとも30秒に1回）と `ManifestSummary`（USD-Mでは少なくとも1秒に1回、Spotでは5秒に1回）の繰り返し送信のみです。失われたQuoteは、その銘柄の最良ビッドまたはアスクが変化するまで復旧しません。トレードは **(Source ID, instrument ID, trade ID)** で重複排除してください。trade ID単独では行わないでください。

Binanceは最良ビッドとアスクの更新をフィードに届く前に集約（コンフレーション）します：高負荷時には、あるシンボルの古い更新は新しい更新を優先して破棄されます。ブックの変化よりクォートが少ないのはベニューの通常の挙動であり、ロスではありません — ロスの検出にはデータグラムのシーケンス番号を使用してください。

デコーダーが想定しがちな内容と異なるリファレンスデータの詳細：

- **タイムスタンプ。** USD-Mの `Quote` と `Trade` はマッチングエンジン時刻をミリ秒精度で保持します。Spotの `Quote` はゲートウェイ送信時刻、Spotの `Trade` は約定時刻を保持し、いずれもマイクロ秒精度です。ワイヤー上ではすべてナノ秒で表現されます。
- **`Leg1` は8バイトです。** 長いベースアセット名（例：`1000FLOKI` や `BROCCOLI714`）は切り詰められます。完全な名前は常に `Symbol` にあります。
- **すべてのシンボルがASCIIとは限りません。** 一部のUSD-Mパーペチュアルは中国語の名前を持ち、その `Symbol` と `Leg1` にはUTF-8バイトが含まれます。これらのフィールドをデコードする際はASCIIを前提にしないでください。
- **`Expiry` は `0`** です。USD-Mの銘柄はすべてパーペチュアルであるため、すべての銘柄で該当します。
- **`Bid Source Count` と `Ask Source Count` は常に `0` です。** Binanceは最良気配における注文数を公開していません。
- **USD-MはRetail Price Improvement（RPI）注文を**最良ビッドとアスクから除外しているため、RPI注文を含むデプススナップショットとは異なる場合があります。

---

## フィードアドレス {#feed-addresses}

| グループコード | エンジン | Source ID | チャネルID | マルチキャストグループ | マーケットデータ | リファレンスデータ |
|------------|--------|-----------|------------|-----------------|-------------|----------------|
| `edge-binance-spot-tob` | Spot | `8` | `1` | `233.84.178.31` | `30001` | `30002` |
| `edge-binance-usdsm-tob` | USD-M パーペチュアル | `6` | `0` | `233.84.178.23` | `30001` | `30002` |

`doublezero status` および `multicast group list` ではグループコードが表示されます。

グループがフィードを選択し、ポートがその中のマーケットデータまたはリファレンスデータを選択します。マルチキャストレプリケーションは送信元IPアドレスとグループ単位で行われ、ファブリックはUDPポートを検査しません。そのため、グループに参加するとDoubleZeroトンネル上のそのグループのすべてのデータが配信されます。ポートはバイト到着後にホスト上で適用されるソケットフィルターです。フィード間でポートを共有しているため、両方のBinanceグループに参加したホストで `30001` にバインドしたソケットは両方を受信します。宛先グループまたはSource IDでフィルタリングしてください。

---

## トラブルシューティング {#troubleshooting}

ここに記載されていない問題が発生した場合は、回避策を試す前に既存のチャネルを通じてお問い合わせください。チャネルがない場合は、[サポート](support/index.md)を参照してください。

### クライアントが最新であることを確認する {#ensure-your-client-is-up-to-date}

実行：`sudo apt update && sudo apt install doublezero`

### データグラムが届かない {#no-datagrams-arriving}

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードが購入済みであることを確認してください。未購入のフィードはトラフィックが配信されません。
2. BGPが起動していることを確認：`doublezero status` で正しいDoubleZeroネットワーク上に `BGP Session Up` が表示されるはずです。
3. サブスクリプションがアクティブであることを確認：`doublezero user list --client-ip <your ip>` で `groups` の下にフィードが表示されるはずです。
4. 正しいインターフェースでグループに参加していることを確認。マルチキャストは `doublezero0` ではなく `doublezero1` に到着します。
5. ファイアウォールが `doublezero1` 上でUDP `30001`–`30002` のインバウンドを許可していることを確認してください。

### 2つのエンジンが混在する {#two-engines-mixed-together}

SpotとUSD-Mはどちらも `BTCUSDT` などのシンボルを上場し、銘柄IDを独立して割り当て、ポートを共有しています。シンボルや銘柄ID単独でブックをキーにするデコーダーや、宛先グループを確認せずにすべてのグループに1つのソケットをバインドするデコーダーは、2つの異なる銘柄を1つのブックにマージしてしまいます。銘柄IDに加えてSource ID（または宛先グループ）もキーにしてください。

### シーケンスギャップ {#sequence-gaps}

送信元IPアドレス、チャネルID、宛先ポートごとにシーケンスを追跡してください。チャネルIDのみをキーにしたデコーダーでは偽のギャップが検出されます。実際のギャップはデータグラムのドロップを意味します。修復手段はありません：銘柄のクォートは、その最良ビッドまたはアスクが次に変化した時点で再び最新になります。

### リセットカウントの変化 {#reset-count-changes}

リセットカウントの変化は、そのパブリッシャーがチャネルを再起動または再シードしたことを意味します。その送信元IPアドレスとチャネルの状態を破棄し、リファレンスデータポートから定義を再収集してください。

### トンネルが起動しない {#tunnel-not-coming-up}

1. **Edge Connect：** コンテナ内でステータスを実行 — `docker exec doublezero-edge-connect doublezero status`。フィードが正常でもホストの `doublezero status` は失敗することがあります（コンテナがデーモンを所有しているため）。ホストの `doublezerod` が停止していることを確認してください。
2. **ネイティブ：** ホストデーモンが実行中であることを確認：`sudo systemctl status doublezerod`
3. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、および `doublezero1` 上のフィードポート）
4. 接続した場所（コンテナまたはホスト）から接続状態を確認 — 正しいDoubleZeroネットワーク上で `BGP Session Up` が表示されるはずです

クライアントIPはホストのパブリックIPから自動検出されます。フィード購入時に使用したIPと一致することを確認してください。

---

## リサーチリファレンスデザイン {#research-reference-design}

オプションです。ホスト上にDoubleZeroトンネルとサブスクリプションが既にあり、フィードデータの**記録と可視化**を行いたい場合、リサーチリファレンスデザインはDocker Composeでマルチキャスト → パーサー → topofbook-bot → ClickHouse → Grafanaを実行します：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

これはBinance Spotをデモの対象としています。別のフィードの場合は、[フィードアドレス](#feed-addresses)のグループを使用してください：

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.31/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=30001/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=30002/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafanaは通常、ホスト上の `http://localhost:3000` でアクセスできます。詳細とダッシュボード：[デモREADME](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md)。

これは既に受信しているデータを可視化するものです。フィードの購入、サブスクリプション、または上記のいずれかの接続パスの代替にはなりません。
