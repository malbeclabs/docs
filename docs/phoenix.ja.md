---
description: DoubleZero Edge で Phoenix パーペチュアルの市場データを取得 — Edge Connect またはネイティブマルチキャスト。
---

# Phoenix Edge サブスクライバー接続

!!! warning "[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol) に同意の上、DoubleZero に接続してください。データは内部利用のみを目的としており、再送信は禁止されています（セクション 2(e) を参照）。"

Phoenix フィードは、DoubleZero Edge ネットワーク上で Phoenix パーペチュアルの市場データを UDP マルチキャストとして配信します。フィードは 2 種類あります：

- Top of Book (TOB)：最良買値・売値およびトレードプリント
- Market by Price (MBP)：価格水準ごとの板情報およびトレードプリント

## 料金 {#pricing}

フィードは**月額**で請求されます：

| フィード | 料金 |
|------|-------|
| `phoenix-tob` | $50 / 月 |
| `phoenix-mbp` | $100 / 月 |

## どのパスを選ぶべきか？ {#which-path-should-i-take}

| # | パス | 適している用途 | 導入負荷 |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | シンプルな CLI と WebSocket 経由のデコード済み JSON を求めるエージェントやアプリ | 最小 |
| **2** | [ネイティブマルチキャスト](#2-native-multicast-advanced) | 生のワイヤーフォーマットに対して独自のデコーダーを構築する場合 | 最大 |

どのパスを選ぶ場合でも、まず [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で必要なフィードを購入してください。購入をもって [DoubleZero 利用規約](https://doublezero.xyz/terms-protocol) に同意したものとみなされます。

AI にインストールを手伝ってもらいたい場合は、[DoubleZero MCP](mcp.md) に接続して、Phoenix / Edge Connect のセットアップをガイドしてもらうよう依頼してください。

---

## 1. Edge Connect（推奨） {#1-edge-connect-recommended}

**ここから始めてください。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) はエージェントフレンドリーなパスです。インストールコマンド 1 つでホストが DoubleZero に参加し、アプリはバイナリマルチキャストのデコードではなく、**WebSocket 経由のデコード済み JSON**（`ws://<host>:8081`）を利用できます。

Edge Connect は拡大するユーザーベースのニーズを満たしています。これは最も簡単な接続方法であり、特定の技術的要件がない限りこちらを使用してください。

簡易版：

```bash
curl -fsSL https://get.doublezero.xyz/connect | \
  DZ_SECRET=/path/to/keypair.json DZ_FEEDS=PHOENIX DZ_ASSUME_YES=1 bash
```

変数はパイプの後に配置され、インストーラー（`bash`）がそれらを受け取ります。`DZ_SECRET` は `DZ_…` アクセストークン、**または**アクセスパス／フィード購入を所有する Solana キーペア JSON のパスです。

ホスト上で `doublezerod` がすでに実行されている場合、ホストのデーモンとコンテナ内のデーモンの両方が UDP ポート `44880` をバインドするため、コンテナのデーモンは起動直後に終了します。インストーラーはホストデーモンの停止と無効化を提案し、`DZ_ASSUME_YES=1` が設定されている場合は確認なしで実行します。手動で行う場合：

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

次に、**コンテナ内で**ステータスを確認し（`BGP Session Up` と Phoenix グループが表示されることを確認）、WebSocket クライアントを `:8081` に接続します：

```bash
docker exec doublezero-edge-connect doublezero status
```

Edge Connect は Phoenix パブリッシャー間の調停を行うため、WebSocket クライアントには各更新のコピーが 1 つだけ届きます。

**詳細な手順、検証、および注意事項：** [DoubleZero MCP](mcp.md) に接続して、Phoenix 向け Edge Connect のセットアップをガイドしてもらうよう依頼してください。
**WebSocket コントラクト：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. ネイティブマルチキャスト（上級者向け） {#2-native-multicast-advanced}

!!! warning "高度な技術知識が必要です"
    ネイティブマルチキャストでは、自分でグループに参加し、ホスト上で**生の** Edge ワイヤーフォーマットをデコードします。このパスは最も技術力の高いユーザーのみが選択してください。[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) および [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) の残りの仕様を読み、理解する必要があります。デコーダーを自前で持つ必要が明確にない限り、[Edge Connect](#1-edge-connect-recommended) を推奨します。

### DoubleZero クライアントのセットアップ {#doublezero-client-setup}

[セットアップ](setup.md)手順に従って DoubleZero クライアントをインストールおよび設定してください。クライアントは常に最新状態に保ってください：

```bash
sudo apt update && sudo apt install doublezero
```

### フィードの購入 {#buy-a-feed}

`doublezerod` を実行した状態で、購入前に最も低遅延のデバイスを確認します：

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で購入してください。

### ファイアウォールの設定 {#configure-the-firewall}

GRE、BGP、PIM、および Phoenix フィードのトラフィックを許可します。Phoenix の UDP ポートは `9201`–`9213` の範囲です：`9201`/`9202` は Top of Book のマーケットデータとリファレンスデータを、`9211`/`9212`/`9213` は Market by Price のマーケットデータ、リファレンスデータ、スナップショットデータを送信します。[フィードアドレス](#feed-addresses) を参照してください。

**iptables：**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Phoenix market / reference / snapshot (both feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 9201:9213 -j ACCEPT
```


**UFW：**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Phoenix market / reference / snapshot (both feeds)
sudo ufw allow in on doublezero1 to any port 9201:9213 proto udp
```

UFW には `pim` プロトコルがありません。アウトバウンド PIM は UFW のデフォルトの送信ポリシーで許可されますが、送信トラフィックを拒否している場合は `/etc/ufw/before.rules` に PIM の raw ルールを追加してください。


### サブスクライブ {#subscribe}

購入したすべてのフィードに参加します（クライアント v0.35.0 以降）：

```bash
doublezero connect multicast
```

または**フィードコード**を指定してフィードを名前で指定します：

```bash
doublezero connect multicast --subscribe-feed phoenix-tob phoenix-mbp
```

フィードコード `phoenix-tob` / `phoenix-mbp` を使用してください。メトロごとのフィード名（`phoenix-tob-cmh` など）やグループコード（`edge-phoenix-…`）は使用しないでください。`--subscribe` でグループコードを指定してサブスクライブすると、購入済みパスでは失敗します。

`✅  User Provisioned` が表示されることを確認してください。約 60 秒待ってから：

```bash
doublezero status
```

正しい DoubleZero ネットワーク上で `BGP Session Up` が表示されることを確認してください。

```bash
doublezero user list --client-ip <your ip>
```

`groups` 列にフィードが表示されます。グループ IP を確認するには：

```bash
doublezero multicast group list
```


### 自分でワイヤーをデコードする {#decode-the-wire-yourself}

スキーマバージョンは **`3`** です。デコーダーが実装していないバージョンのデータグラムは破棄してください。正式なレイアウトは [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) にあり、[top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md)、[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md)、および [GLOSSARY](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md) が含まれます。

各データグラムは 24 バイトのデータグラムヘッダーで始まり、MTU まで詰め込まれた 1 つ以上のアプリケーションメッセージが続きます。データグラムはリトルエンディアンで固定レイアウトです。

| フィールド | 備考 |
|-------|-------|
| Magic | オフセット 0 の `u16`：TOB では `0x445A`、MBP では `0x4442`。検証してください。 |
| スキーマバージョン | `3` |
| チャネル ID | 両方の Phoenix フィードはチャネル `1` を使用 |
| シーケンス | ソース IP アドレス、チャネル ID、および宛先ポートごとに単調増加 — 各ポートには独自のシリーズがあります。ギャップ検出に使用してください。 |
| 送信タイムスタンプ | Unix エポックからのナノ秒 |
| メッセージ数 | このデータグラムに格納されたメッセージ数 |
| リセットカウント | 変化があれば（`255` → `0` のラップを含む）リセットです。そのパブリッシャーのチャネル状態を破棄してください。MBP ではベニュー全体の再シードによりセッション中にバンプされることもあります。 |
| データグラム長 | 合計バイト数 |

**各 Phoenix フィードは複数のパブリッシャーから送信されます**。同一のグループ、チャネル、ポートが使用されます。チャネルおよびインストゥルメントの状態は、チャネル ID だけでなくソース IP アドレスもキーにしてください。そうしないと、2 つのパブリッシャーのシーケンスシリーズが 1 つに混在します。ネイティブサブスクライバーはパブリッシャーごとに各トレードのコピーを 1 つ受信します。

#### アプリケーションメッセージ（TOB） {#application-messages-tob}

| タイプ | ID | サイズ | ポート | 内容 |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | マーケットが静かな間の生存確認 |
| InstrumentDefinition | `0x02` | 130 B | reference | シンボル、指数、ティックとロット、満期 |
| Quote | `0x03` | 60 B | market | 最良買値・売値、価格とサイズ、更新フラグ |
| Trade | `0x04` | 52 B | market | 価格、サイズ、アグレッサー側、トレード ID |
| EndOfSession | `0x06` | 12 B | market | クリーンシャットダウン |
| ManifestSummary | `0x07` | 24 B | reference | 有効フラグ、Manifest Seq 変更カウンター、インストゥルメント数、タイムスタンプ |

Phoenix は `0x08`（Liquidation）を送信しません。Phoenix の edge-feed-spec レジストリにおける Source ID は `2` です。各 `InstrumentDefinition` から `price_exponent` と `qty_exponent` を読み取ってください — ハードコードしないでください。指数は価格精度であり、ティックではありません：Phoenix 上の BTC は指数 `-2` でティックサイズ `100` を使用するため、1 ドル単位で動きます。

MBP フィードは market-by-price メッセージセットを使用します。edge-feed-spec の market-by-price および reference-data の仕様を参照してください。両フィードは同じパブリッシャープロセスから送信されるため、インストゥルメント ID を共有し、MBP のマーケットデータポートは TOB と同じトレードプリントを送信します。Phoenix のトレード ID はマーケットごとのシーケンス番号であるため、トレードの重複排除は **（インストゥルメント ID、トレード ID）** で行い、トレード ID 単体では行わないでください。

配信は再送なしのファイア・アンド・フォーゲット UDP であり、リファレンスデータポートはマーケットデータの修復を行いません。リファレンスデータポートは `InstrumentDefinition`（少なくとも 30 秒に 1 回）と `ManifestSummary`（少なくとも 1 秒に 1 回）を繰り返すのみです。失われた TOB Quote は、そのマーケットの最良買値または売値が変更されるまで失われたままです。修復パスがあるのは MBP のみ — そのスナップショットサイクル — であり、MBP のコールドスタートではスナップショットポートをバインドする必要があります。

---

## フィードアドレス {#feed-addresses}

| フィードコード | グループコード | 説明 | マルチキャストグループ | マーケットデータ | リファレンスデータ | スナップショット |
|-----------|------------|-------------|-----------------|-------------|----------------|----------|
| `phoenix-tob` | `edge-phoenix-tob` | パーペチュアル Top-of-Book およびトレード | `233.84.178.24` | `9201` | `9202` | — |
| `phoenix-mbp` | `edge-phoenix-mbp` | パーペチュアル Market-by-Price | `233.84.178.25` | `9211` | `9212` | `9213` |

フィードコードでサブスクライブします。`doublezero status` および `multicast group list` にはグループコードが表示されます。

グループはフィードを選択し、ポートはその中のマーケットデータ、リファレンスデータ、またはスナップショットを選択します。マルチキャストレプリケーションはソース IP アドレスとグループごとに行われ、ファブリックは UDP ポートを検査しません。そのため、グループに参加すると DoubleZero トンネル上のそのグループのすべてのトラフィックが配信されます。ポートは、バイトが到着した後にホスト上で適用されるソケットフィルターです。

---

## トラブルシューティング {#troubleshooting}

ここでカバーされていない問題が発生した場合は、回避策を試みる前に既存のチャネルでお問い合わせください。チャネルがない場合は [サポート](support.md) を参照してください。

### クライアントが最新であることを確認する {#ensure-your-client-is-up-to-date}

実行: `sudo apt update && sudo apt install doublezero`

### データグラムが到着しない {#no-datagrams-arriving}

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードが購入済みであることを確認してください。未購入のフィードはトラフィックを配信しません。
2. BGP が稼働していることを確認してください：`doublezero status` で正しい DoubleZero ネットワーク上に `BGP Session Up` が表示されるはずです。
3. サブスクリプションがアクティブであることを確認してください：`doublezero user list --client-ip <your ip>` で `groups` の下にフィードが表示されるはずです。
4. 正しいインターフェースでグループに参加していることを確認してください。マルチキャストは `doublezero0` ではなく `doublezero1` に到着します。
5. ファイアウォールが `doublezero1` 上でフィードの UDP ポートのインバウンドを許可していることを確認してください。

### シーケンスギャップ {#sequence-gaps}

シーケンスはソース IP アドレス、チャネル ID、および宛先ポートごとに追跡してください。チャネル ID のみをキーにしたデコーダーは偽のギャップを検出します。実際のギャップはデータグラムのドロップを意味します。MBP では、影響を受けたマーケットは次のスナップショットサイクルで回復します。TOB には修復手段がなく、そのマーケットの最良買値または売値が次に変更されるまでクォートは最新になりません。

### リセットカウントの変化 {#reset-count-changes}

リセットカウントの変化は、そのパブリッシャーがチャネルを再起動または再シードしたことを意味します。そのソース IP アドレスとチャネルの状態を破棄し、リファレンスデータポートからデフィニションを再収集し、MBP ではスナップショットポートから板情報を再構築してください。

### トンネルが確立しない {#tunnel-not-coming-up}

1. **Edge Connect：** コンテナ内でステータスを確認してください — `docker exec doublezero-edge-connect doublezero status`。フィードが正常でもホストの `doublezero status` は失敗することがよくあります（コンテナがデーモンを所有しているため）。ホストの `doublezerod` が停止していることを確認してください。
2. **ネイティブ：** ホストデーモンが実行中であることを確認してください：`sudo systemctl status doublezerod`
3. ファイアウォールルールが設定されていることを確認してください（GRE、BGP、PIM、および `doublezero1` 上のフィードポート）
4. 接続した場所（コンテナまたはホスト）と同じ場所から接続ステータスを確認してください — 正しい DoubleZero ネットワーク上で `BGP Session Up` が表示されるはずです

クライアント IP はホストのパブリック IP から自動検出されます。フィード購入時に使用した IP と一致していることを確認してください。

---

## リサーチ向けリファレンスデザイン {#research-reference-design}

オプションです。ホスト上で DoubleZero トンネルとサブスクリプションがすでに設定済みで、フィードデータを**記録およびチャート化**したい場合、リサーチ向けリファレンスデザインは Docker Compose でマルチキャスト → パーサー → topofbook-bot → ClickHouse → Grafana を実行します：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

以下は Phoenix TOB にデモを向ける設定です（[フィードアドレス](#feed-addresses) を参照）：

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.24/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=9201/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=9202/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

Grafana は通常ホスト上の `http://localhost:3000` でアクセスできます。詳細およびダッシュボードについては [demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md) を参照してください。

これはすでに受信しているデータを可視化するものです。フィードの購入、サブスクリプション、または上記のいずれかの接続パスの代わりにはなりません。