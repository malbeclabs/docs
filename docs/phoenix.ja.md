---
description: DoubleZero Edge で Phoenix 無期限先物マーケットデータを取得 — Edge Connect またはネイティブマルチキャスト。
---

# Phoenix Edge サブスクライバー接続

!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データはお客様の内部目的のみに使用でき、再配信は禁止されています（セクション 2(e) を参照）。"

Phoenix フィードは、DoubleZero Edge ネットワーク上で UDP マルチキャストとして Phoenix 無期限先物マーケットデータを配信します。フィードは 2 種類あります：

- Top of Book (TOB): 最良ビッド・アスク、およびトレードプリント
- Market by Price (MBP): 価格レベルの板深度、およびトレードプリント

## 料金 {#pricing}

フィードは **月額** で課金されます：

| フィード | 料金 |
|------|-------|
| `phoenix-tob` | $50 / 月 |
| `phoenix-mbp` | $100 / 月 |

## どのパスを選ぶべきか？ {#which-path-should-i-take}

| # | パス | 最適な用途 | 導入の手間 |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | シンプルな CLI とデコード済み JSON over WebSocket を求めるエージェントやアプリ | 最小 |
| **2** | [ネイティブマルチキャスト](#2-native-multicast-advanced) | 生のワイヤーフォーマットに対して独自のデコーダーを構築する場合 | 最大 |

どのパスを選ぶ場合でも、まず [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で必要なフィードを購入してください。購入することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。

AI にインストールを手伝ってもらいたい場合は、[DoubleZero MCP](mcp.md) に接続して、Phoenix / Edge Connect のセットアップをガイドしてもらうよう依頼してください。

---

## 1. Edge Connect（推奨） {#1-edge-connect-recommended}

**ここから始めましょう。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) はエージェントフレンドリーなパスです。インストールコマンド 1 つでホストが DoubleZero に参加し、バイナリマルチキャストをデコードする代わりに、アプリは **デコード済み JSON over WebSocket**（`ws://<host>:8081`）を利用できます。

Edge Connect は拡大するユーザーベースのニーズを満たしています。これは最も簡単な接続方法であり、特定の技術的要件がない限りこちらを使用すべきです。

簡易版：

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

インストーラーがシークレットの入力を求めます：`DZ_…` アクセストークン、**または**アクセスパス／フィード購入を所有する Solana キーペア JSON のパスです。

ホストで `doublezerod` が既に実行中の場合、ホストのデーモンとコンテナ独自のデーモンの両方が UDP ポート `44880` をバインドするため、コンテナのデーモンは起動直後に終了します。インストーラーはホストデーモンの停止と無効化を提案し、`DZ_ASSUME_YES=1` が設定されている場合は確認なしで実行します。手動で行う場合は：

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

次に、**コンテナ内で**ステータスを確認し（`BGP Session Up` と Phoenix グループが表示されることを期待）、WebSocket クライアントを `:8081` に接続します：

```bash
docker exec doublezero-edge-connect doublezero status
```

Edge Connect は Phoenix パブリッシャー間の調停を行うため、WebSocket クライアントには各アップデートのコピーが 1 つだけ表示されます。

**完全な手順、検証、および注意点：** [DoubleZero MCP](mcp.md) に接続して、Phoenix 向け Edge Connect のセットアップをガイドしてもらうよう依頼してください。
**WebSocket コントラクト：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. ネイティブマルチキャスト（上級者向け） {#2-native-multicast-advanced}

!!! warning "高度な技術知識が必要です"
    ネイティブマルチキャストとは、自分でグループに参加し、ホスト上で **生の** Edge ワイヤーフォーマットをデコードすることを意味します。このパスは最も技術力の高いユーザーのみが選択すべきです。[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) および [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) の残りの仕様を読んで理解する必要があります。デコーダーを自分で所有する必要が明確にある場合を除き、[Edge Connect](#1-edge-connect-recommended) を推奨します。

### DoubleZero クライアントのセットアップ {#doublezero-client-setup}

[セットアップ](setup.md)の手順に従って DoubleZero クライアントをインストール・設定してください。クライアントは常に最新の状態に保ってください：

```bash
sudo apt update && sudo apt install doublezero
```

### フィードの購入 {#buy-a-feed}

`doublezerod` が実行中の状態で、購入前に最も低レイテンシーのデバイスを特定してください：

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で購入してください。

### ファイアウォールの設定 {#configure-the-firewall}

GRE、BGP、PIM、および Phoenix フィードのトラフィックを許可してください。Phoenix の UDP ポートは `9201`–`9213` の範囲にあります：`9201`/`9202` は Top of Book のマーケットデータとリファレンスデータを、`9211`/`9212`/`9213` は Market by Price のマーケットデータ、リファレンスデータ、スナップショットデータを伝送します。[フィードアドレス](#feed-addresses)を参照してください。

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Phoenix market / reference / snapshot (both feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 9201:9213 -j ACCEPT
```


**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Phoenix market / reference / snapshot (both feeds)
sudo ufw allow in on doublezero1 to any port 9201:9213 proto udp
```

UFW には `pim` プロトコルがありません。アウトバウンド PIM は UFW のデフォルトの送信ポリシーにより許可されます。送信トラフィックを拒否している場合は、`/etc/ufw/before.rules` に PIM の raw ルールを追加してください。


### サブスクライブ {#subscribe}

購入したすべてのフィードに参加してください（クライアント v0.35.0 以降）：

```bash
doublezero connect multicast
```

または **フィードコード** でフィードを指定します：

```bash
doublezero connect multicast --subscribe-feed phoenix-tob phoenix-mbp
```

フィードコード `phoenix-tob` / `phoenix-mbp` を使用してください。メトロごとのフィード名（`phoenix-tob-cmh` など）やグループコード（`edge-phoenix-…`）は使用しないでください。`--subscribe` でグループコードを指定してサブスクライブすると、購入済みパスでは失敗します。

`✅  User Provisioned` と表示されることを確認してください。約 60 秒待ってから：

```bash
doublezero status
```

正しい DoubleZero ネットワーク上で `BGP Session Up` と表示されることを確認してください。

```bash
doublezero user list --client-ip <your ip>
```

`groups` 列にフィードが表示されます。グループ IP を確認するには：

```bash
doublezero multicast group list
```


### ワイヤーフォーマットの自前デコード {#decode-the-wire-yourself}

スキーマバージョンは **`3`** です — デコーダーが実装していないバージョンのデータグラムは破棄してください。正式なレイアウト：[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)（[top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md)、[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md)、および [GLOSSARY](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md) を含む）。

各データグラムは 24 バイトのデータグラムヘッダーで始まり、その後に MTU まで詰め込まれた 1 つ以上のアプリケーションメッセージが続きます。データグラムはリトルエンディアンで固定レイアウトです。

| フィールド | 備考 |
|-------|-------|
| Magic | オフセット 0 の `u16`：TOB は `0x445A`、MBP は `0x4442`。検証してください。 |
| スキーマバージョン | `3` |
| チャネル ID | 両方の Phoenix フィードはチャネル `1` を使用 |
| シーケンス | ソース IP アドレス、チャネル ID、および宛先ポートごとに単調増加 — 各ポートが独自のシリーズを持ちます。ギャップ検出に使用してください。 |
| 送信タイムスタンプ | Unix エポックからのナノ秒 |
| メッセージ数 | このデータグラムに格納されたメッセージ数 |
| リセットカウント | 任意の変化（`255` → `0` のラップを含む）はリセットです。そのパブリッシャーのチャネル状態を破棄してください。MBP はベニュー全体の再シード時にセッション中にバンプすることもあります。 |
| データグラム長 | 合計バイト数 |

**各 Phoenix フィードは複数のパブリッシャーから送信されます**。同じグループ、チャネル、ポートを使用します。チャネルおよびインストゥルメントの状態は、チャネル ID だけでなくソース IP アドレスでもキーイングしてください。そうしないと、2 つのパブリッシャーのシーケンスシリーズが 1 つにインターリーブされます。ネイティブサブスクライバーは、パブリッシャーごとに各トレードのコピーを 1 つ受信します。

#### アプリケーションメッセージ（TOB） {#application-messages-tob}

| タイプ | ID | サイズ | ポート | 内容 |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | マーケットが静かな間の生存確認 |
| InstrumentDefinition | `0x02` | 130 B | reference | シンボル、指数、ティックとロット、満期 |
| Quote | `0x03` | 60 B | market | 最良ビッドとアスク、価格とサイズ、更新フラグ |
| Trade | `0x04` | 52 B | market | 価格、サイズ、アグレッサーサイド、トレード ID |
| EndOfSession | `0x06` | 12 B | market | クリーンシャットダウン |
| ManifestSummary | `0x07` | 24 B | reference | 有効フラグ、Manifest Seq 変更カウンター、インストゥルメント数、タイムスタンプ |

Phoenix は `0x08`（Liquidation）を送信しません。edge-feed-spec レジストリにおける Phoenix の Source ID は `2` です。各 `InstrumentDefinition` から `price_exponent` と `qty_exponent` を読み取ってください — ハードコードしないでください。指数は価格精度であり、ティックではありません：Phoenix 上の BTC は指数 `-2` でティックサイズ `100` を使用するため、ドル単位で動きます。

MBP フィードは market-by-price メッセージセットを使用します。edge-feed-spec の market-by-price および reference-data の仕様を参照してください。両方のフィードは同じパブリッシャープロセスから送信されるため、インストゥルメント ID を共有し、MBP のマーケットデータポートは TOB と同じトレードプリントを伝送します。Phoenix のトレード ID はマーケットごとのシーケンス番号であるため、トレードの重複排除は **（インストゥルメント ID, トレード ID）** で行い、トレード ID 単独では行わないでください。

配信は再送なしのファイアアンドフォーゲット UDP であり、リファレンスデータポートはマーケットデータの修復を行いません。リファレンスデータポートは `InstrumentDefinition`（少なくとも 30 秒ごとに 1 回）と `ManifestSummary`（少なくとも 1 秒ごとに 1 回）のみを繰り返します。失われた TOB Quote は、そのマーケットの最良ビッドまたはアスクが変化するまで失われたままです。修復パスがあるのは MBP のみで、そのスナップショットサイクルにより修復されます。MBP のコールドスタートではスナップショットポートをバインドする必要があります。

---

## フィードアドレス {#feed-addresses}

| フィードコード | グループコード | 説明 | マルチキャストグループ | マーケットデータ | リファレンスデータ | スナップショット |
|-----------|------------|-------------|-----------------|-------------|----------------|----------|
| `phoenix-tob` | `edge-phoenix-tob` | 無期限先物 Top-of-Book およびトレード | `233.84.178.24` | `9201` | `9202` | — |
| `phoenix-mbp` | `edge-phoenix-mbp` | 無期限先物 Market-by-Price | `233.84.178.25` | `9211` | `9212` | `9213` |

フィードコードでサブスクライブしてください。`doublezero status` と `multicast group list` にはグループコードが表示されます。

グループによりフィードが選択され、ポートによりその中のマーケットデータ、リファレンスデータ、またはスナップショットが選択されます。マルチキャストの複製はソース IP アドレスとグループごとに行われ、ファブリックは UDP ポートを検査しません。そのため、グループに参加すると、DoubleZero トンネルを通じてそのグループ上のすべてが配信されます。ポートは、バイトが到着した後にホスト上で適用されるソケットフィルターです。

---

## トラブルシューティング {#troubleshooting}

ここに記載されていない問題が発生した場合は、回避策を試す前に既存のチャネルでお問い合わせください。チャネルがない場合は、[サポート](support.md)を参照してください。

### クライアントが最新であることを確認 {#ensure-your-client-is-up-to-date}

実行: `sudo apt update && sudo apt install doublezero`

### データグラムが到着しない {#no-datagrams-arriving}

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードが購入済みであることを確認してください。未購入のフィードはトラフィックを配信しません。
2. BGP が稼働していることを確認してください：`doublezero status` で正しい DoubleZero ネットワーク上に `BGP Session Up` と表示されるべきです。
3. サブスクリプションが有効であることを確認してください：`doublezero user list --client-ip <your ip>` で `groups` にフィードが表示されるべきです。
4. 正しいインターフェースでグループに参加していることを確認してください。マルチキャストは `doublezero0` ではなく `doublezero1` に到着します。
5. ファイアウォールが `doublezero1` 上でフィードの UDP ポートの受信を許可していることを確認してください。

### シーケンスギャップ {#sequence-gaps}

ソース IP アドレス、チャネル ID、および宛先ポートごとにシーケンスを追跡してください。チャネル ID のみでキーイングしたデコーダーでは偽のギャップが発生します。実際のギャップはデータグラムがドロップされたことを意味します。MBP では、影響を受けたマーケットは次のスナップショットサイクルで回復します。TOB には修復がありません：マーケットの Quote は、そのマーケットの最良ビッドまたはアスクが次に変化した時点で再び最新になります。

### リセットカウントの変化 {#reset-count-changes}

リセットカウントの任意の変化は、そのパブリッシャーがチャネルを再起動または再シードしたことを意味します。そのソース IP アドレスとチャネルの状態を破棄し、リファレンスデータポートから定義を再収集してください。MBP の場合はスナップショットポートからブックを再構築してください。

### トンネルが起動しない {#tunnel-not-coming-up}

1. **Edge Connect：** コンテナ内でステータスを確認してください — `docker exec doublezero-edge-connect doublezero status`。ホストの `doublezero status` はフィードが正常でも失敗することが多いです（コンテナがデーモンを所有しているため）。ホストの `doublezerod` が停止していることを確認してください。
2. **ネイティブ：** ホストデーモンが実行中であることを確認してください：`sudo systemctl status doublezerod`
3. ファイアウォールルールが設定されていることを確認してください（GRE、BGP、PIM、および `doublezero1` 上のフィードポート）
4. 接続した場所（コンテナまたはホスト）と同じ場所から接続状態を確認してください — 正しい DoubleZero ネットワーク上で `BGP Session Up` が表示されることを期待してください

クライアント IP はホストのパブリック IP から自動検出されます。フィード購入時に使用した IP と一致していることを確認してください。

---

## リサーチ向けリファレンスデザイン {#research-reference-design}

オプションです。ホスト上に DoubleZero トンネルとサブスクリプションが既にあり、フィードデータを**記録・チャート化**したい場合、リサーチ向けリファレンスデザインが Docker Compose でマルチキャスト → パーサー → topofbook-bot → ClickHouse → Grafana を実行します：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

以下は Phoenix TOB をデモに設定する例です（[フィードアドレス](#feed-addresses)を参照）：

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.24/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=9201/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=9202/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana は通常、ホスト上の `http://localhost:3000` でアクセスできます。詳細とダッシュボード：[デモの README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md)。

これは既に受信しているデータを可視化するものです。フィードの購入、サブスクリプション、または上記のいずれかの接続パスを置き換えるものではありません。