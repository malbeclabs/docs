---
description: DoubleZero Edge 上で Kalshi マーケットデータを取得 — Edge Connect またはネイティブマルチキャスト。
---

# Kalshi Edge サブスクライバー接続

!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データはお客様の内部利用目的に限定されており、再送信することはできません（セクション 2(e) をご参照ください）。"

Kalshi フィードは、DoubleZero Edge ネットワーク上で perps およびスポーツマーケットデータを UDP マルチキャストとして配信します。フィードは 4 種類あります：

- perps Top of Book (TOB)
- perps Market by Price (MBP)
- sports Top of Book (TOB)
- sports Market by Price (MBP)

## どのパスを選ぶべきか？

2 つのパスがあります。デコーダーを自前で持つ必要がない限り、Edge Connect を推奨します。

| # | パス | 最適な用途 | 難易度 |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | シンプルな CLI と正規化された JSON WebSocket を求めるエージェントやアプリ | 最も低い |
| **2** | [ネイティブマルチキャスト](#2-native-multicast-advanced) | 生のワイヤーフォーマットに対して独自のデコーダーを構築する場合 | 最も高い |

どのパスを選ぶ場合でも、まず [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で必要なフィードを購入してください。購入により、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)および [Kalshi 利用規約](https://doublezero.xyz/dz-edge-kalshi-terms)に同意したものとみなされます。

AI にインストールを手伝ってもらいたいですか？ [DoubleZero MCP](mcp.md) に接続し、Kalshi / Edge Connect のセットアップをガイドしてもらうよう依頼してください。

---

## 1. Edge Connect（推奨） {#1-edge-connect-recommended}

**ここから始めてください。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) はエージェントフレンドリーなパスです。インストールコマンド 1 つでホストが DoubleZero に参加し、アプリはバイナリマルチキャストをデコードする代わりに **WebSocket 経由の正規化された JSON**（`ws://<host>:8081`）を利用できます。

チームは拡大するユーザーベースのニーズに合わせて Edge Connect を進化させています。これは最も簡単な接続方法であり、特定の技術的要件がない限りこちらを使用してください。

簡略版：

```bash
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

`DZ_SECRET` は `DZ_…` アクセストークン、**または**アクセスパス / フィード購入を所有する Solana キーペア JSON へのパスです。

ホストで `doublezerod` が既に実行中の場合は、先に停止してください — コンテナのデーモンと同じトンネルを取り合います：

```bash
sudo systemctl stop doublezerod
```

次に、**コンテナ内で**ステータスを確認し（`BGP Session Up` と Kalshi グループが表示されることを期待）、WebSocket クライアントを `:8081` に接続します：

```bash
docker exec doublezero-edge-connect doublezero status
```

**詳細な手順、検証、注意点：** [DoubleZero MCP](mcp.md) に接続し、Kalshi 向けの Edge Connect セットアップをガイドしてもらうよう依頼してください。
**WebSocket コントラクト：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. ネイティブマルチキャスト（上級者向け） {#2-native-multicast-advanced}

!!! warning "高度な技術知識が必要です"
    ネイティブマルチキャストでは、自分でグループに参加し、ホスト上で**生の** Edge ワイヤーフォーマットをデコードします。このパスは最も技術力の高いユーザーのみが選択すべきです。[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) をはじめとする [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) の仕様を読んで理解する必要があります。デコーダーを自前で持つ厳密な要件がない限り、[Edge Connect](#1-edge-connect-recommended) を推奨します。

### フィードを購入する

購入前に最も低レイテンシのデバイスを特定してください：

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で購入してください。


### DoubleZero クライアントのセットアップ

[セットアップ](setup.md)手順に従って DoubleZero クライアントをインストール・設定してください。クライアントは常に最新の状態を維持してください：

```bash
sudo apt update && sudo apt install doublezero
```

### ファイアウォールの設定

GRE、BGP、PIM、および Kalshi フィードトラフィックを許可します。Kalshi UDP ポートは `30000`–`59999` の範囲にあります。先頭の桁はトラフィッククラス（`3` マーケットデータ、`4` リファレンスデータ、`5` スナップショット）、2 桁目はフィードを示します。そのため、リファレンスは常にマーケット + `10000`、スナップショットは常にマーケット + `20000` です。新しいチャネルやフィードが追加された際にファイアウォール変更が不要になるよう、`doublezero1` 上で全帯域を開放してください — [フィードアドレス](#feed-addresses)を参照。

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

約 60 秒待ってから：

```bash
doublezero status
```

正しい DoubleZero ネットワーク上で `BGP Session Up` が表示されることを確認してください。サブスクライバーの場合、DoubleZero IP は Tunnel Src IP と一致します。

```bash
doublezero user list --client-ip <your ip>
```

フィードが `groups` 列に表示されます。グループ IP は以下で確認できます：

```bash
doublezero multicast group list
```


### ワイヤーフォーマットを自分でデコードする

スキーマバージョンは **`3`** です — デコーダーが実装していないバージョンのフレームは破棄してください。正式なレイアウト: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)（[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) を含む）。

各データグラムはフレームヘッダーで始まり、その後に MTU まで詰められた 1 つ以上のアプリケーションメッセージが続きます。フレームはリトルエンディアンで固定レイアウトです。

| フィールド | 備考 |
|-------|-------|
| スキーマバージョン | `3` |
| チャネル ID | ポートを共有するストリームの分離用 |
| シーケンス | チャネルごとに単調増加 — ギャップ検出に使用 |
| 送信タイムスタンプ | Unix エポックからのナノ秒 |
| メッセージ数 | このフレームに格納されたメッセージ数 |
| リセットカウント | セッションごとに増加。増加した場合はステートをコールドスタートしてください。 |
| フレーム長 | 合計バイト数 |

#### アプリケーションメッセージ（TOB）

| タイプ | ID | サイズ | ポート | 内容 |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | マーケットが静かな間のライブネス |
| InstrumentDefinition | `0x02` | 130 B | reference | シンボル、エクスポーネント、ティックとロット、満期 |
| Quote | `0x03` | 60 B | market | 最良売買気配、価格とサイズ、更新フラグ |
| Trade | `0x04` | 52 B | market | 価格、サイズ、アグレッサー側、取引 ID |
| ChannelReset | `0x05` | 12 B | both | セッションの開始またはリスタート |
| EndOfSession | `0x06` | 12 B | both | クリーンシャットダウン |
| ManifestSummary | `0x07` | 24 B | reference | アクティブセットのフィンガープリントと銘柄数 |
| PerpStats | `0x30` | 124 B | sibling | ファンディング、マークおよびオラクル価格、建玉、日次出来高 |

edge-feed-spec レジストリにおける Kalshi のソース ID は `3` です。各 `InstrumentDefinition` から `price_exponent` と `qty_exponent` を読み取ってください — ハードコードしないでください。

MBP フィードは market-by-price メッセージセットを使用します。edge-feed-spec の market-by-price および reference-data の仕様を参照してください。

配信は再送なしのファイアアンドフォーゲット UDP です。欠落したデータグラムは、一度きりではなく定期的に再送出されるリファレンスデータサイクル（および MBP フィードのスナップショットプレーン）から復旧してください。

---

## フィードアドレス {#feed-addresses}

| フィード | 説明 | マルチキャストグループ | マーケットデータ | リファレンスデータ | スナップショット |
|------|-------------|-----------------|-------------|----------------|----------|
| `edge-kalshi-perps-tob` | Perps トップオブブック | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | Perps マーケットバイプライス | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | Sports トップオブブック | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `edge-kalshi-sports-mbp` | Sports マーケットバイプライス | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

ポートスキーム：先頭の桁はトラフィッククラス（`3` マーケット、`4` リファレンス、`5` スナップショット）、2 桁目はフィード。リファレンスはマーケット + `10000`、スナップショットはマーケット + `20000`。Perps ポートは固定です。Sports ポートは `ベース + チャネル id`（例：`edge-kalshi-sports-mbp` の id `10` は `34010` / `44010` / `54010` を使用）。

グループはフィードを選択し、ポートはそのフィード内のマーケットデータ、リファレンスデータ、またはスナップショットを選択します。マルチキャストのレプリケーションはソースおよびグループ単位で行われ、ファブリックは UDP ポートを検査しません。そのため、グループに参加すると、Edge Connect リンク上のそのグループの全トラフィックが配信されます。ポートは、バイトが到着した後にホスト上で適用されるソケットフィルターです。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試みる前に、既存のチャネルを通じてお問い合わせください。チャネルがない場合は、[サポート](support.md)をご確認ください。

### クライアントが最新であることを確認する

実行: `sudo apt update && sudo apt install doublezero`

### データグラムが到着しない

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードが購入済みであることを確認してください。未購入のフィードではトラフィックは配信されません。
2. BGP が有効であることを確認してください: `doublezero status` で正しい DoubleZero ネットワーク上に `BGP Session Up` が表示される必要があります。
3. サブスクリプションがアクティブであることを確認してください: `doublezero user list --client-ip <your ip>` で `groups` にフィードが表示される必要があります。
4. 正しいインターフェースでグループに参加していることを確認してください。マルチキャストは `doublezero0` ではなく `doublezero1` に到着します。
5. ファイアウォールが `doublezero1` 上でフィードの UDP ポートの受信を許可していることを確認してください。

### シーケンスギャップ

シーケンスはチャネルごとに単調増加します。ギャップはデータグラムのドロップを意味します。次のリファレンスデータサイクルで銘柄ステートが復元されます。

### フレームが停止し、新しいリセットカウントで再開する

パブリッシャーのリスタートにより、フレームヘッダーのリセットカウントが増加します。前のセッションのステートを破棄し、次のリファレンスデータサイクルからコールドスタートしてください。

### トンネルが確立しない

1. **Edge Connect:** コンテナ内でステータスを確認してください — `docker exec doublezero-edge-connect doublezero status`。フィードが正常でもホストの `doublezero status` は失敗することがあります（コンテナがデーモンを所有しているため）。ホストの `doublezerod` が停止していることを確認してください。
2. **ネイティブ:** ホストデーモンが実行中であることを確認してください: `sudo systemctl status doublezerod`
3. ファイアウォールルールが設定されていることを確認してください（GRE、BGP、PIM、および `doublezero1` 上のフィードポート）
4. 接続した場所（コンテナまたはホスト）から接続ステータスを確認してください — 正しい DoubleZero ネットワーク上で `BGP Session Up` が表示されることを期待します

クライアント IP はホストのパブリック IP から自動検出されます。フィード購入時に使用した IP と一致していることを確認してください。

---

## リサーチリファレンスデザイン

オプションです。ホスト上に既に DoubleZero トンネルとサブスクリプションがあり、フィードデータの**記録とチャート表示**をしたい場合、リサーチリファレンスデザインは Docker Compose でマルチキャスト → パーサー → topofbook-bot → ClickHouse → Grafana を実行します：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

`.env` を Kalshi グループとポートに向けて設定し（[フィードアドレス](#feed-addresses)を参照）、以下を実行します：

```bash
cd demo
cp .env.example .env
# DZ_MULTICAST_GROUP, DZ_MARKETDATA_PORT, DZ_REFDATA_PORT, DZ_INTERFACE=doublezero1 を設定
docker compose up -d --build
```

Grafana は通常、ホスト上の `http://localhost:3000` でアクセスできます。詳細とダッシュボード: [demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md)。

これは既に受信しているデータを可視化するものです。フィードの購入、サブスクリプション、または上記のいずれかの接続パスを置き換えるものではありません。