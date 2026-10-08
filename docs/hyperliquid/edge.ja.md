---
description: "DoubleZero Edge で Hyperliquid のマーケットデータを購読する — セットアップ、メトロ、フィードリクエスト、承認後の接続方法。"
---

# Hyperliquid の購読 (Edge)

!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意するものとします。データはお客様の内部利用のみを目的としており、再送信することはできません（セクション 2(e) を参照）。"

Hyperliquid フィードは、DoubleZero Edge を介して UDP マルチキャストでマーケットデータを配信します。4 つのコアフィードが Hyperliquid ネイティブ perps（`hl`）と [trade.xyz](https://trade.xyz) perps（`xyz`）をカバーしています：

| フィード | 説明 |
|------|-------------|
| `hyper-hl-tob` | Hyperliquid perps のベストビッド/オファーおよびトレードプリント |
| `hyper-hl-mbo` | Hyperliquid perps の注文単位のフルオーダーブック（追加、キャンセル、約定） |
| `hyper-xyz-tob` | trade.xyz perps のベストビッド/オファーおよびトレードプリント |
| `hyper-xyz-mbo` | trade.xyz perps の注文単位のフルオーダーブック（追加、キャンセル、約定） |

サービス概要：[Hyperliquid](index.md)。

## どのパスを選ぶべきか？

| モード | 取得できるもの | 使用する場面 |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — WebSocket 経由のデコード済み JSON | 利用可能なクォートストリームへの最短パス |
| **ネイティブマルチキャスト** | `doublezero1` で購読し、バイナリ UDP を自分で（またはリファレンスパーサーで）デコード | ワイヤーの完全な制御 |

まず共通手順：ファイアウォール、メトロ、申請、支払い（ステップ 1〜3）。承認後、[ステップ 4](#step-4-connect-after-approval) で **Edge Connect** または**ネイティブ**に分岐します。同一ホストでこれらを混在させないでください。

---

## ステップ 1：DoubleZero セットアップ

**セットアップの完了**


[セットアップ](../setup.md)手順に従って、ホストに DoubleZero クライアントをインストールおよび設定してください。

以前にネイティブ用途でホストに DoubleZero をセットアップしたことがある場合は、クライアントが最新であることを確認してください：

```bash
sudo apt update && sudo apt install doublezero
```

**ファイアウォールの設定**


`doublezero1` で GRE、BGP、PIM、および Hyperliquid フィードのトラフィックを許可してください。Hyperliquid の UDP ポートは `20000`〜`20999`（Top-of-Book、Market-by-Order のマーケット、リファレンス、スナップショット）です。また、トンネル上の DoubleZero ハートビート用に UDP `5765` も許可してください。フィード帯域を開放しておくことで、新しいフィード追加時にファイアウォール変更が不要になります。[フィードアドレス](#feed-addresses)を参照してください。

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid market / reference / snapshot (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 20000:20999 -j ACCEPT
# DoubleZero heartbeats
sudo iptables -A INPUT -i doublezero1 -p udp --dport 5765 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Hyperliquid market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# DoubleZero heartbeats
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

UFW には `pim` プロトコルがありません。アウトバウンド PIM は UFW のデフォルト送信ポリシーで許可されます。送信トラフィックを拒否している場合は、`/etc/ufw/before.rules` に PIM 用のロールールを追加してください。

購読するフィードのポートのみに限定してこれらのルールを厳格化することもできます（[フィードアドレス](#feed-addresses)を参照）。

---

## ステップ 2：メトロの選択

フィードを受信するマシンから最も低レイテンシのロケーションを特定します：

```bash
doublezero latency
```

最も低レイテンシの結果からメトロ／都市をメモしてください。申請フォームでその都市を選択します。メトロのグループ化については[トポロジーマップ](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth)を参照してください。

**料金**


フィードは配信地域ごとに価格設定されています。価格は購入者の所在地ではなく、データが配信される場所に基づきます。東京パッケージは東京の受信者に配信されます。それ以外の場所への配信にはグローバルパッケージが必要です。フィードごと、メトロごとに 2 つの受信ホスト（IP）が含まれます。

| フィード | 東京 /月 | グローバル /月 |
| --- | --- | --- |
| Hyperliquid perps Top-of-Book (L1) | $900 | $1,500 |
| Hyperliquid perps Market-by-Order (L4) | $3,000 | $5,000 |
| trade.xyz perps Top-of-Book (L1) | $900 | $1,500 |
| trade.xyz perps Market-by-Order (L4) | $3,000 | $5,000 |
| **全フィード（バンドル 約30% 割引）** | **$5,500** | **$9,000** |

---

## ステップ 3：リクエストの送信

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) にアクセスします。
2. **Hyperliquid** と必要なフィードを選択します。
3. 必要な**都市**（メトロ）を選択します。上記の表と `doublezero latency` を参考に選んでください。
4. 申請フォームを完了します。

[accounts](https://doublezero.xyz/shreds/account) ページで、各フィードリクエストに DoubleZero ID（既存の鍵、または新しい鍵を生成）を割り当てます。対応する**秘密鍵はフィードを受信するマシン上に存在する必要があります**。そのホストに移動できない秘密鍵の公開鍵を割り当てないでください。

**メトロ**と**公開鍵**を選択します。申請時にパブリック IP をバインドする必要は**ありません**。サブスクリプション中に、**選択したメトロ内で** IP 間のアクセスを移動できます。

タイムリーに追加の手順についてご連絡いたします（**1〜3 営業日**を想定してください）。

---

## ステップ 4：承認後の接続 {#step-4-connect-after-approval}

申請を送信すると請求書が届きます。支払い完了後、承認された各マシンで接続してください。アクセスは選択した開始日に有効化されます。以下のいずれか**一方**のパスを選んでください。

### 4a. Edge Connect {#4a-edge-connect}

ホストで `doublezerod` が既に実行されている場合（[セットアップ](../setup.md)から）、ホストとコンテナの両方のデーモンが UDP ポート `44880` をバインドするため、コンテナのデーモンは起動直後に終了します。インストーラーはホストデーモンの停止と無効化を提案し、`DZ_ASSUME_YES=1` が設定されている場合は確認なしで実行します。手動で行う場合：

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

[doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) は承認と支払い**後に**インストールしてください。ブリッジは `--network host` コンテナ内で DoubleZero に参加し、デコード済み JSON を `ws://<host>:8081` で提供します。

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**すべての `doublezero` コマンドはコンテナ経由で実行します**。ホスト CLI ではありません：

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    コンテナへのコマンドを簡単にするためにエイリアスを作成できます。この例では、`dz status` がコンテナ内の `doublezero status` と同じように動作します：

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

`BGP Session Up` と `edge-hyper-…` グループの購読が表示されることを確認してください。

次に WebSocket（`ws://127.0.0.1:8081`）を開きます。プロトコル仕様：[PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。

### 4b. ネイティブマルチキャスト {#4b-native-multicast}

割り当てられた秘密鍵を持つホスト（ホスト `doublezerod` が実行中）で、購入したフィードを購読します：

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

複数フィードの場合、スペース区切り：

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

トンネルを確認します：

```bash
doublezero status
```

正しい DoubleZero ネットワークで `BGP Session Up` が表示されることを確認してください。その後、ワイヤーを自分でデコードします — [フィードのデコード](#decode-the-feed)を参照してください。

---

## 請求

シートは**月額**で課金されます。シートの有効期限に注意してください。

シートの有効期限前に請求書を支払う必要があります。**支払いがない場合、シートは削除されます。**

---

## フィードアドレス {#feed-addresses}

IP でマルチキャストグループを選択します。ポートでそのグループ上のストリームを選択します。IP のライブ値は以下で確認できます：

```bash
doublezero multicast group list
```

| フィード | 説明 | マルチキャストグループ | マーケット | リファレンス | スナップショット | 仕様 |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Hyperliquid perps のベストビッド/オファーおよびトレードプリント | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Hyperliquid perps の注文単位のフルオーダーブック | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | trade.xyz perps のベストビッド/オファーおよびトレードプリント | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | trade.xyz perps の注文単位のフルオーダーブック | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

各フィードには独自のマルチキャストグループアドレスがあります。ポート：リファレンス = マーケット + `1`、スナップショット（MBO のみ）= マーケット + `2`。マーケットとリファレンスを一緒にバインドすることをお勧めします。MBO の場合はスナップショットもバインドしてください。

`doublezero1` のポート `5765` で小さな UDP パケットが表示される場合があります — これは DoubleZero ハートビートであり、マーケットデータではありません。

フレームはリトルエンディアンの固定サイズバイナリです。Hyperliquid ネイティブ perps は `source_id=1` を使用し、trade.xyz perps は `source_id=7` を使用します。

---

## フィードのデコード {#decode-the-feed}

!!! note "Edge Connect"
    `doublezero-edge-connect` を使用している場合、フィードは WebSocket 経由で JSON としてデコード済みです — 手動デコードは不要です。

**リファレンスパーサーの使用**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) は、ワイヤーフォーマットをデコードして Unix ソケット上で JSON として再配信するマルチキャストサブスクライバーを提供します：

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) Top-of-Book & Trades 用
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) Market-by-Order 用

完全なパイプラインについては [main README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines) を参照してください。

**独自のデコーダーを作成する**

[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) に基づいてデコードしてください。フレームヘッダーから始め、受信するフィードのメッセージレイアウトに進みます。

**GRE トンネルヘッダー — XDP**

ネットワーク経由で配信されるマーケットデータトラフィックは、ラストマイルで GRE カプセル化されています。`doublezero1` では、クライアントはプレーンな UDP マルチキャストとして提示します。GRE を自分で終端する場合（例：XDP パイプライン）、デコーダーにデータを渡す前に GRE ヘッダーをストリップしてください。[`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap) を参照してください。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試みる前に既存のチャネルでお問い合わせください。チャネルがない場合は、[サポート](../support/index.md)を参照してください。

**クライアントが最新であることを確認する**


```bash
sudo apt update && sudo apt install doublezero
```

**トンネルが起動しない**


1. **Edge Connect:** コンテナ内でステータスを実行 — `docker exec doublezero-edge-connect doublezero status`。ホストの `doublezero status` はフィードが正常でも失敗することがよくあります（コンテナがデーモンを所有しているため）。ホストの `doublezerod` が停止していることを確認してください。
2. **ネイティブ:** ホストデーモンが実行中であることを確認：`sudo systemctl status doublezerod`
3. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、Hyperliquid UDP ポート、および `doublezero1` の `5765`）
4. このシートの請求書が支払い済みで、開始日が過ぎていることを確認
5. 選択したパス（[4a](#4a-edge-connect) または [4b](#4b-native-multicast)）で、accounts ページと一致する鍵を使用して connect を実行
6. connect を実行した場所（コンテナまたはホスト）で `BGP Session Up` が表示されることを確認

**購読後にパケットが来ない**


1. 購読されていることを確認：`doublezero user list`
2. フィードがグループの下に表示されていることを確認：`doublezero multicast group list`
3. トンネルでキャプチャ、例：Hyperliquid TOB：`sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. 目的のフィードのマーケットとリファレンスを一緒にバインドすることをお勧めします（MBO の場合はスナップショットも）

**購入したフィードが表示されない（Edge Connect）**

購入したフィードが `doublezero status` に表示されない場合、コンテナ内で購読してください：

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-code>
```

複数フィードの場合、スペース区切り：

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

**シートの有効期限切れまたは削除**


シートは月額です。有効期限前に請求書が支払われない場合、シートは削除され、トンネルは維持されません。

**"Multicast user already exists"**


別のパスを通じてアクティブなサブスクリプションが既に存在します。まず切断してから、connect を再試行してください：

- **Edge Connect:** `docker exec doublezero-edge-connect doublezero disconnect`
- **ネイティブ:** `doublezero disconnect`

その後、同じパス（コンテナまたはホスト）で `doublezero connect multicast --subscribe-feed <feed-code>` を再試行してください。

**AWS 固有の注意事項**


インスタンスの ENI でソース/宛先チェックを無効にしてください。これがないと、GRE カプセル化されたマルチキャストがドロップされる可能性があります。