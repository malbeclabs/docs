---
description: "DoubleZero Edge で Hyperliquid マーケットデータを購読する — セットアップ、メトロ、フィードリクエスト、承認後の接続。"
---

# Hyperliquid を購読する (Edge)

!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol) に同意したものとみなされます。データは内部利用のみを目的としており、再配信は禁止されています（セクション 2(e) を参照）。"

Hyperliquid フィードは、DoubleZero Edge を介して UDP マルチキャストでマーケットデータを配信します。Hyperliquid ネイティブ perps（`hl`）および [trade.xyz](https://trade.xyz) perps（`xyz`）をカバーする 4 つのコアフィードがあります：

| フィード | 説明 |
|------|-------------|
| `hyper-hl-tob` | Hyperliquid perps のベストビッド/オファーおよび約定プリント |
| `hyper-hl-mbo` | Hyperliquid perps のフルオーダー単位板情報（追加、キャンセル、約定） |
| `hyper-xyz-tob` | trade.xyz perps のベストビッド/オファーおよび約定プリント |
| `hyper-xyz-mbo` | trade.xyz perps のフルオーダー単位板情報（追加、キャンセル、約定） |

サービス概要: [Hyperliquid](/hyperliquid/)。

## どのパスを選ぶべきか？

| モード | 提供内容 | 使用シーン |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — デコード済み + 正規化 JSON WebSocket | 利用可能なクォートストリームへの最速パス |
| **ネイティブマルチキャスト** | `doublezero1` で購読し、バイナリ UDP を自分でデコード（またはリファレンスパーサーを使用） | ワイヤレベルの完全な制御 |

共通ステップが先です：ファイアウォール、メトロ、申請、支払い（ステップ 1〜3）。承認後、[ステップ 4](#step-4-connect-after-approval) で分岐します — **Edge Connect** または **ネイティブ**。同じホスト上で両方を混在させないでください。

AI にインストールを手伝ってほしい場合は、[DoubleZero MCP](/mcp/) に接続して、Hyperliquid Edge のセットアップを案内するよう依頼してください。

---

## ステップ 1: DoubleZero セットアップ

**セットアップの完了**


[セットアップ](/setup/) の手順に従い、ホストに DoubleZero クライアントをインストールおよび設定してください。

以前にネイティブ用途でホストに DoubleZero をセットアップしたことがある場合は、クライアントが最新であることを確認してください：

```bash
sudo apt update && sudo apt install doublezero
```

**ファイアウォールの設定**


`doublezero1` 上で GRE、BGP、PIM、および Hyperliquid フィードトラフィックを許可してください。Hyperliquid の UDP ポートは `20000`–`20999`（Top-of-Book および Market-by-Order のマーケット、リファレンス、スナップショット）の範囲にあります。また、トンネル上の DoubleZero ハートビート用に UDP `5765` も許可してください。新しいフィードの追加時にファイアウォール変更が不要になるよう、フィード帯域を開放してください。[フィードアドレス](#feed-addresses) を参照してください。

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
sudo ufw allow out on doublezero1 proto pim from any to any
# Hyperliquid market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# DoubleZero heartbeats
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

購読するフィードのポートのみに制限してルールを厳格化することも可能です（[フィードアドレス](#feed-addresses) を参照）。

---

## ステップ 2: メトロを選択する

フィードを受信するマシンから最も低レイテンシーのロケーションを特定します：

```bash
doublezero latency
```

最も低レイテンシーの結果からメトロ / 都市を確認してください。申請フォームでその都市を選択します。メトロのグループ分けについては [トポロジーマップ](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) を参照してください。

**料金**


フィードは配信リージョンごとに価格設定されています。価格は購入者の所在地ではなく、データの配信先に基づきます。東京パッケージは東京の受信者に配信されます。他の場所への配信にはグローバルパッケージが必要です。各フィード、各メトロにつき 2 つの受信ホスト（IP）が含まれます。

| フィード | 東京 /月 | グローバル /月 |
| --- | --- | --- |
| Hyperliquid perps Top-of-Book (L1) | $900 | $1,500 |
| Hyperliquid perps Market-by-Order (L4) | $3,000 | $5,000 |
| trade.xyz perps Top-of-Book (L1) | $900 | $1,500 |
| trade.xyz perps Market-by-Order (L4) | $3,000 | $5,000 |
| **全フィード（バンドル 約30%割引）** | **$5,500** | **$9,000** |

---

## ステップ 3: リクエストを送信する

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) にアクセスします。
2. **Hyperliquid** と必要なフィードを選択します。
3. 必要な **都市**（メトロ）を選択します。上記の表と `doublezero latency` を使って選んでください。
4. 申請フォームに記入します。

[accounts](https://doublezero.xyz/shreds/account) ページで、各フィードリクエストに DoubleZero ID（既存のキー、または新しいキーを生成）を割り当てます。対応する **秘密鍵はフィードを受信するマシンに存在している必要があります** — そのホストに移動できない秘密鍵の公開鍵を割り当てないでください。

**メトロ** と **公開鍵** を選択します。申請時にパブリック IP を紐付ける **必要はありません**。サブスクリプション期間中、**選択したメトロ内で** IP 間のアクセスを移動できます。

タイムリーに追加の手順が連絡されます（**1〜3 営業日** を見込んでください）。

---

## ステップ 4: 承認後に接続する {#step-4-connect-after-approval}

申請を送信すると請求書が届きます。支払いが完了したら、承認された各マシンで接続します。アクセスは選択した開始日に有効化されます。以下のパスのうち **1 つ** を選択してください。

### 4a. Edge Connect

ホストで `doublezerod` が既に実行中の場合（[セットアップ](/setup/) から）、まず停止してください — コンテナのデーモンと同じトンネルを奪い合います：

```bash
sudo systemctl stop doublezerod
```

承認と支払い **の後に** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) をインストールします。ブリッジは `--network host` コンテナ内で DoubleZero に参加し、正規化された JSON を `ws://<host>:8081` で提供します。

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**すべての `doublezero` コマンドはコンテナを通じて実行します**。ホストの CLI ではありません：

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    コンテナへのコマンドを簡単にするためにエイリアスを作成できます。この例では、コンテナ内の `doublezero status` と同じように `dz status` が動作するようにします：

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

`BGP Session Up` と `edge-hyper-…` グループの購読が表示されることを確認してください。

次に WebSocket（`ws://127.0.0.1:8081`）を開きます。プロトコル仕様: [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。完全なウォークスルー: [MCP](/mcp/) ランブック `hyperliquid-edge`。

### 4b. ネイティブマルチキャスト

割り当てられた秘密鍵を保持するホスト（ホストの `doublezerod` が実行中）で、購入したフィードを購読します：

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

複数のフィードはスペース区切りで指定：

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

トンネルを確認します：

```bash
doublezero status
```

正しい DoubleZero ネットワーク上で `BGP Session Up` が表示されることを確認してください。その後、ワイヤを自分でデコードします — [フィードのデコード](#decode-the-feed) を参照してください。

---

## 請求

シートは **月額** で課金されます。シートの有効期限にご注意ください。

シートの有効期限前に請求書を支払う必要があります。**未払いの場合、シートは削除されます。**

---

## フィードアドレス {#feed-addresses}

IP はマルチキャストグループを指定します。ポートはそのグループ上のストリームを指定します。IP のライブ値は以下で確認できます：

```bash
doublezero multicast group list
```

| フィード | 説明 | マルチキャストグループ | マーケット | リファレンス | スナップショット | 仕様 |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Hyperliquid perps のベストビッド/オファーおよび約定プリント | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Hyperliquid perps のフルオーダー単位板情報 | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | trade.xyz perps のベストビッド/オファーおよび約定プリント | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | trade.xyz perps のフルオーダー単位板情報 | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

各フィードにはそれぞれのマルチキャストグループアドレスがあります。ポート: リファレンス = マーケット + `1`、スナップショット（MBO のみ）= マーケット + `2`。マーケットとリファレンスを一緒にバインドすることを推奨します。MBO の場合はスナップショットもバインドしてください。

`doublezero1` のポート `5765` で小さな UDP パケットが見られることもあります — これは DoubleZero ハートビートであり、マーケットデータではありません。

フレームはリトルエンディアンの固定サイズバイナリです。Hyperliquid ネイティブ perps は `source_id=1` を使用し、trade.xyz perps は `source_id=7` を使用します。

---

## フィードのデコード {#decode-the-feed}

!!! note "Edge Connect"
    `doublezero-edge-connect` を使用している場合、フィードは WebSocket 経由で既に JSON としてデコードされています — 手動デコードは不要です。

**リファレンスパーサーを使用する**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) は、ワイヤフォーマットをデコードし Unix ソケット上で JSON として再配信するマルチキャストサブスクライバーを提供します：

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) — Top-of-Book & Trades 用
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) — Market-by-Order 用

完全なパイプラインについては [メイン README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines) を参照してください。

**独自のデコーダーを作成する**

[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) に基づいてデコードしてください。フレームヘッダーから始め、次に受信するフィードのメッセージレイアウトを参照してください。

**GRE トンネルヘッダー — XDP**

ネットワーク経由で配信されるマーケットデータトラフィックは、ラストマイルで GRE カプセル化されています。`doublezero1` 上では、クライアントがプレーンな UDP マルチキャストを提示します。GRE を自分で終端する場合（例：XDP パイプライン）、デコーダーにデータを渡す前に GRE ヘッダーをストリップしてください。[`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap) を参照してください。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試す前に既存のチャネルでお問い合わせください。チャネルがない場合は、[サポート](/support/) を参照してください。

**クライアントが最新であることを確認する**


```bash
sudo apt update && sudo apt install doublezero
```

**トンネルが起動しない**


1. **Edge Connect:** コンテナ内でステータスを実行します — `docker exec doublezero-edge-connect doublezero status`。フィードが正常でもホストの `doublezero status` はしばしば失敗します（コンテナがデーモンを所有しているため）。ホストの `doublezerod` が停止していることを確認してください。
2. **ネイティブ:** ホストデーモンが実行中であることを確認します：`sudo systemctl status doublezerod`
3. ファイアウォールルールが適用されていることを確認します（GRE、BGP、PIM、Hyperliquid UDP ポートおよび `doublezero1` 上の `5765`）
4. このシートの請求書が支払い済みで、開始日を過ぎていることを確認します
5. 選択したパス（[4a](#4a-edge-connect) または [4b](#4b-native-multicast)）で、accounts ページのキーと一致するキーを使って connect を実行します
6. connect を実行した場所（コンテナまたはホスト）と同じ場所で `BGP Session Up` が表示されることを確認します

**購読後にパケットが来ない**


1. 購読済みであることを確認します：`doublezero user list`
2. グループの下にフィードが表示されることを確認します：`doublezero multicast group list`
3. トンネル上でキャプチャします。例：Hyperliquid TOB の場合：`sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. 必要なフィードに対して、マーケットとリファレンスを一緒にバインドすることを推奨します（MBO の場合はスナップショットも）

**購入済みフィードが表示されない（Edge Connect）**

購入済みフィードが `doublezero status` に表示されない場合は、コンテナ内で購読してください：

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-code>
```

複数のフィードはスペース区切りで指定：

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

**シートの有効期限切れまたは削除**


シートは月額です。有効期限前に請求書が支払われない場合、シートは削除され、トンネルは維持されません。

**"Multicast user already exists"**


別のパスを通じてアクティブなサブスクリプションが既に存在しています。まず切断してから、connect を再試行してください：

- **Edge Connect:** `docker exec doublezero-edge-connect doublezero disconnect`
- **ネイティブ:** `doublezero disconnect`

その後、同じパス（コンテナまたはホスト）で `doublezero connect multicast --subscribe-feed <feed-code>` を再試行してください。

**AWS 固有の注意事項**


インスタンスの ENI でソース/宛先チェックを無効にしてください。これがないと、GRE カプセル化されたマルチキャストがドロップされる可能性があります。