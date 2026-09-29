---
description: DoubleZero Edge で Kalshi のマーケットデータを取得 — Edge Connect またはネイティブマルチキャスト。
---

# Kalshi Edge サブスクライバー接続

!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データは社内利用のみを目的としており、再送信することはできません（セクション 2(e) を参照）。"

Kalshi フィードは、DoubleZero Edge ネットワークを介して、パープスおよびスポーツのマーケットデータを UDP マルチキャストで配信します。フィードは 4 種類あります：

- パープス Top of Book (TOB)
- パープス Market by Price (MBP)
- スポーツ Top of Book (TOB)
- スポーツ Market by Price (MBP)

## どのパスを選ぶべきか？ {#which-path-should-i-take}

2 つのパスがあります。デコーダーを自前で持つ必要がない限り、Edge Connect を推奨します。

| # | パス | 最適な用途 | 手間 |
|---|------|----------|------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | シンプルな CLI と正規化された JSON WebSocket を求めるエージェントやアプリ | 最小 |
| **2** | [ネイティブマルチキャスト](#2-native-multicast-advanced) | 生のワイヤフォーマットに対して独自のデコーダーを構築する場合 | 最大 |

いずれのパスを選ぶ場合も、まず [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で必要なフィードを購入してください。購入により、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)および [Kalshi 利用規約](https://doublezero.xyz/dz-edge-kalshi-terms)に同意したものとみなされます。

AI にインストールを手伝ってもらいたい場合は、[DoubleZero MCP](mcp.md) に接続して、Kalshi / Edge Connect のセットアップをガイドしてもらいましょう。

---

## 1. Edge Connect（推奨） {#1-edge-connect-recommended}

**ここから始めましょう。** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) はエージェントフレンドリーなパスです。インストールコマンド 1 つでホストが DoubleZero に参加し、アプリはバイナリマルチキャストをデコードする代わりに **WebSocket 経由の正規化された JSON**（`ws://<host>:8081`）を利用できます。

チームは拡大するユーザーベースのニーズに合わせて Edge Connect を進化させています。これは最も簡単な接続方法であり、特定の技術的要件がない限りこちらを使用してください。

短縮版：

```bash
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

`DZ_SECRET` は `DZ_…` アクセストークン、**または**アクセスパス／フィード購入を所有する Solana キーペア JSON へのパスです。

ホスト上で `doublezerod` が既に実行されている場合は、先に停止してください。コンテナのデーモンと同じトンネルを奪い合います：

```bash
sudo systemctl stop doublezerod
```

次に、**コンテナ内で**ステータスを確認し（`BGP Session Up` と Kalshi グループが表示されることを期待）、WebSocket クライアントを `:8081` に接続します：

```bash
docker exec doublezero-edge-connect doublezero status
```

**詳細な手順、検証、および注意事項：** [DoubleZero MCP](mcp.md) に接続して、Kalshi 向け Edge Connect のセットアップをガイドしてもらいましょう。  
**WebSocket コントラクト：** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

---

## 2. ネイティブマルチキャスト（上級） {#2-native-multicast-advanced}

!!! warning "高度な技術知識が必要です"
    ネイティブマルチキャストでは、自分でグループに参加し、ホスト上で **生の** Edge ワイヤフォーマットをデコードします。このパスは最も技術力の高いユーザーのみが選択すべきです。[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) をはじめとする [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) の仕様を読んで理解する必要があります。デコーダーを自前で持つ必要がない限り、[Edge Connect](#1-edge-connect-recommended) を推奨します。

### フィードを購入する

購入前に、最低レイテンシのデバイスを確認します：

```bash
doublezero latency
```

[https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) で購入します。


### DoubleZero クライアントのセットアップ

[セットアップ](setup.md)の手順に従って、DoubleZero クライアントをインストールおよび設定します。クライアントを最新の状態に保ってください：

```bash
sudo apt update && sudo apt install doublezero
```

### ファイアウォールの設定

GRE、BGP、PIM、および Kalshi フィードのトラフィックを許可します。Kalshi の UDP ポートは `30000`〜`59999` の範囲にあります。先頭の数字はトラフィッククラス（`3` マーケットデータ、`4` リファレンスデータ、`5` スナップショット）、2 桁目はフィードを示します。リファレンスは常にマーケット + `10000`、スナップショットは常にマーケット + `20000` です。新しいチャネルやフィードが追加されてもファイアウォールを変更しなくて済むよう、`doublezero1` で全帯域を開放してください — [フィードアドレス](#feed-addresses)を参照。

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi マーケット / リファレンス / スナップショット（全フィード）
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```


**UFW:**

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

複数のフィードはスペース区切りで指定します：

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

約 60 秒待ってから、以下を実行します：

```bash
doublezero status
```

正しい DoubleZero ネットワーク上で `BGP Session Up` が表示されることを確認してください。サブスクライバーとして、DoubleZero IP は Tunnel Src IP と一致します。

```bash
doublezero user list --client-ip <your ip>
```

`groups` カラムにフィードが表示されます。グループ IP を確認するには：

```bash
doublezero multicast group list
```


### ワイヤフォーマットを自分でデコードする

スキーマバージョンは **`3`** です — デコーダーが実装していないバージョンのフレームは破棄してください。正式なレイアウト：[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec)（[market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) を含む）。

各データグラムはフレームヘッダーで始まり、その後に MTU まで詰め込まれた 1 つ以上のアプリケーションメッセージが続きます。フレームはリトルエンディアンで固定レイアウトです。

| フィールド | 備考 |
|-----------|------|
| スキーマバージョン | `3` |
| チャネル ID | ポートを共有するストリームのデマルチプレクス用 |
| シーケンス | チャネルごとに単調増加 — ギャップ検出に使用 |
| 送信タイムスタンプ | Unix エポックからのナノ秒 |
| メッセージ数 | このフレームに詰め込まれたメッセージ数 |
| リセットカウント | セッションごとに増加。増加した場合はステートをコールドスタートしてください。 |
| フレーム長 | 合計バイト数 |

#### アプリケーションメッセージ（TOB）

| タイプ | ID | サイズ | ポート | 内容 |
|--------|-----|------|--------|------|
| Heartbeat | `0x01` | 16 B | market | マーケットが静かな間のライブネス確認 |
| InstrumentDefinition | `0x02` | 130 B | reference | シンボル、指数、ティック・ロット、満期 |
| Quote | `0x03` | 60 B | market | 最良ビッド・アスク、価格・サイズ、更新フラグ |
| Trade | `0x04` | 52 B | market | 価格、サイズ、アグレッサーサイド、取引 ID |
| ChannelReset | `0x05` | 12 B | both | セッションの開始または再開 |
| EndOfSession | `0x06` | 12 B | both | 正常なシャットダウン |
| ManifestSummary | `0x07` | 24 B | reference | アクティブセットのフィンガープリントと銘柄数 |
| PerpStats | `0x30` | 124 B | sibling | ファンディング、マーク価格・オラクル価格、建玉、日次出来高 |

edge-feed-spec レジストリにおける Kalshi のソース ID は `3` です。各 `InstrumentDefinition` から `price_exponent` と `qty_exponent` を読み取ってください — ハードコードしないでください。

MBP フィードは market-by-price メッセージセットを使用します。edge-feed-spec の market-by-price および reference-data の仕様を参照してください。

配信はファイア・アンド・フォーゲット方式の UDP で、再送信はありません。欠落したデータグラムは、リファレンスデータサイクル（および MBP フィードのスナップショットプレーン）から復旧してください。リファレンスデータは一度きりではなく、一定の間隔で再送出されます。

---

## フィードアドレス {#feed-addresses}

| フィード | 説明 | マルチキャストグループ | マーケットデータ | リファレンスデータ | スナップショット |
|---------|------|---------------------|----------------|------------------|--------------|
| `edge-kalshi-perps-tob` | パープス top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | パープス market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | スポーツ top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `edge-kalshi-sports-mbp` | スポーツ market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

ポート体系：先頭の数字はトラフィッククラス（`3` マーケット、`4` リファレンス、`5` スナップショット）、2 桁目はフィードです。リファレンスはマーケット + `10000`、スナップショットはマーケット + `20000` です。パープスのポートは固定です。スポーツのポートは `ベース + チャネル id` です（例：`edge-kalshi-sports-mbp` の id `10` は `34010` / `44010` / `54010` を使用）。

グループでフィードを選択し、ポートでそのフィード内のマーケットデータ、リファレンスデータ、またはスナップショットを選択します。マルチキャストレプリケーションはソースとグループ単位で行われ、ファブリックは UDP ポートを検査しません。そのため、グループに参加するとそのグループ上のすべてのデータが Edge Connect リンク経由で配信されます。ポートは、バイトが到着した後にホスト側で適用されるソケットフィルターです。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試す前に既存のチャネルからお問い合わせください。チャネルがない場合は、[サポート](support.md)を参照してください。

### クライアントが最新であることを確認する

実行：`sudo apt update && sudo apt install doublezero`

### データグラムが届かない

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードが購入済みであることを確認してください。未購入のフィードはトラフィックを配信しません。
2. BGP が起動していることを確認してください：`doublezero status` で正しい DoubleZero ネットワーク上に `BGP Session Up` が表示されるはずです。
3. サブスクリプションがアクティブであることを確認してください：`doublezero user list --client-ip <your ip>` で `groups` にフィードがリストされるはずです。
4. 正しいインターフェースでグループに参加していることを確認してください。マルチキャストは `doublezero0` ではなく `doublezero1` に到着します。
5. ファイアウォールが `doublezero1` 上でフィードの UDP ポートのインバウンドを許可していることを確認してください。

### シーケンスギャップ

シーケンスはチャネルごとに単調増加です。ギャップはデータグラムのドロップを意味します。次のリファレンスデータサイクルで銘柄ステートが復旧します。

### フレームが停止し、新しいリセットカウントで再開する

パブリッシャーの再起動により、フレームヘッダーのリセットカウントが増加します。前のセッションのステートを破棄し、次のリファレンスデータサイクルからコールドスタートしてください。

### トンネルが起動しない

1. **Edge Connect：** コンテナ内でステータスを実行してください — `docker exec doublezero-edge-connect doublezero status`。フィードは正常に動作しているのにホスト上の `doublezero status` が失敗することがよくあります（コンテナがデーモンを所有しているため）。ホストの `doublezerod` が停止していることを確認してください。
2. **ネイティブ：** ホストデーモンが実行中であることを確認してください：`sudo systemctl status doublezerod`
3. ファイアウォールルールが設定されていることを確認してください（GRE、BGP、PIM、および `doublezero1` 上のフィードポート）
4. 接続した場所（コンテナまたはホスト）と同じ場所から接続ステータスを確認してください — 正しい DoubleZero ネットワーク上で `BGP Session Up` が表示されることを期待してください

クライアント IP はホストのパブリック IP から自動検出されます。フィード購入時に使用した IP と一致していることを確認してください。

---

## リサーチ向けリファレンスデザイン

オプションです。ホスト上で DoubleZero トンネルとサブスクリプションが既にあり、フィードデータを**記録およびチャート化**したい場合、リサーチ向けリファレンスデザインは Docker Compose でマルチキャスト → パーサー → topofbook-bot → ClickHouse → Grafana を実行します：

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

`.env` を Kalshi のグループとポートに向けて設定し（[フィードアドレス](#feed-addresses)を参照）、以下を実行します：

```bash
cd demo
cp .env.example .env
# DZ_MULTICAST_GROUP, DZ_MARKETDATA_PORT, DZ_REFDATA_PORT, DZ_INTERFACE=doublezero1 を設定
docker compose up -d --build
```

Grafana は通常、ホスト上の `http://localhost:3000` でアクセスできます。詳細とダッシュボードについては、[demo README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md) を参照してください。

これは既に受信しているデータを可視化するものです。フィードの購入、サブスクリプション、または上記のいずれかの接続パスの代替にはなりません。