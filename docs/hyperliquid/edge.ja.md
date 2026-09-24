---
description: "DoubleZero Edge で Hyperliquid のマーケットデータを購読する — セットアップ、メトロ、フィードリクエスト、承認後の接続。"
---

# Hyperliquid の購読 (Edge)

!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データはお客様の内部目的のみに使用されるものであり、再送信することはできません（セクション 2(e) を参照）。"

Hyperliquid フィードは、DoubleZero Edge を通じて UDP マルチキャストとしてマーケットデータを配信します。4 つのコアフィードが Hyperliquid ネイティブ無期限先物（`hl`）と [trade.xyz](https://trade.xyz) 無期限先物（`xyz`）をカバーしています：

| フィード | 説明 |
|------|-------------|
| `hyper-hl-tob` | Hyperliquid 無期限先物のベストビッド/オファーおよび約定情報 |
| `hyper-hl-mbo` | Hyperliquid 無期限先物のフルオーダー単位板情報（追加、キャンセル、約定） |
| `hyper-xyz-tob` | trade.xyz 無期限先物のベストビッド/オファーおよび約定情報 |
| `hyper-xyz-mbo` | trade.xyz 無期限先物のフルオーダー単位板情報（追加、キャンセル、約定） |

サービス概要：[Hyperliquid](/hyperliquid/)。

## どのパスを選ぶべきか？

| モード | 取得できるもの | 使用すべきタイミング |
|------|----------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — デコード + 正規化された JSON WebSocket | 使用可能なクオートストリームへの最速ルート |
| **ネイティブマルチキャスト** | `doublezero1` でサブスクライブし、バイナリ UDP を自分で（またはリファレンスパーサーを使って）デコード | ワイヤの完全な制御 |

まず共通の手順：ファイアウォール、メトロ、申請、支払い（ステップ 1〜3）。承認後、[ステップ 4](#step-4-connect-after-approval) で分岐します — **Edge Connect** または **ネイティブ**。同じホスト上で両方を混在させないでください。

AI にインストールを手伝ってもらいたい場合は、[DoubleZero MCP](/mcp/) に接続して、Hyperliquid Edge のセットアップをガイドしてもらうよう依頼してください。

---

## ステップ 1: DoubleZero セットアップ

**セットアップの完了**


[セットアップ](/setup/)の手順に従って、ホストに DoubleZero クライアントをインストールおよび設定してください。

以前にネイティブ使用のためにホストで DoubleZero をセットアップしたことがある場合は、クライアントが最新であることを確認してください：

```bash
sudo apt update && sudo apt install doublezero
```

**ファイアウォールの設定**


`doublezero1` 上で GRE、BGP、PIM、および Hyperliquid フィードトラフィックを許可してください。Hyperliquid の UDP ポートは `20000`–`20999` の範囲にあります（Top-of-Book、Market-by-Order、リファレンス、スナップショット）。また、トンネル上の DoubleZero ハートビート用に UDP `5765` も許可してください。新しいフィードのためにファイアウォール変更が不要になるよう、フィード帯域を開放してください。[フィードアドレス](#feed-addresses)を参照。

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

購読するフィードのポートのみに絞ってルールを厳格化することもできます（[フィードアドレス](#feed-addresses)を参照）。

---

## ステップ 2: メトロを選択

フィードを受信するマシンから最も低レイテンシーのロケーションを特定します：

```bash
doublezero latency
```

最も低レイテンシーの結果からメトロ / 都市を確認してください。申請フォームでその都市を選択します。メトロのグループ化については[トポロジーマップ](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth)を参照してください。

**料金**


フィードは配信リージョンごとに価格設定されます。価格はデータの配信先に基づき、購入者の所在地ではありません。東京パッケージは東京の受信者に配信されます。それ以外の場所への配信にはグローバルパッケージが必要です。フィードごと、メトロごとに 2 つの受信ホスト（IP）が含まれます。

| フィード | 東京 /月 | グローバル /月 |
| --- | --- | --- |
| Hyperliquid 無期限先物 Top-of-Book (L1) | $900 | $1,500 |
| Hyperliquid 無期限先物 Market-by-Order (L4) | $3,000 | $5,000 |
| trade.xyz 無期限先物 Top-of-Book (L1) | $900 | $1,500 |
| trade.xyz 無期限先物 Market-by-Order (L4) | $3,000 | $5,000 |
| **全フィード（バンドル 約30%割引）** | **$5,500** | **$9,000** |

---

## ステップ 3: リクエストの送信

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) にアクセスします。
2. **Hyperliquid** と必要なフィードを選択します。
3. 必要な**都市**（メトロ）を選択します。上記の表と `doublezero latency` を使用して選んでください。
4. 申請フォームを完了します。

[accounts](https://doublezero.xyz/shreds/account) ページで、各フィードリクエストに DoubleZero ID（既存の鍵、または新しい鍵を生成）を割り当てます。対応する**秘密鍵はフィードを受信するマシン上に存在する必要があります** — そのホストに移動できない公開鍵は割り当てないでください。

**メトロ**と**公開鍵**を選択します。申請時にパブリック IP をバインドする必要は**ありません**。サブスクリプション期間中、**選択したメトロ内で** IP 間のアクセスを移動できます。

適時に追加の手順についてご連絡いたします（**1〜3 営業日**を見込んでください）。

---

## ステップ 4: 承認後の接続

申請を送信すると請求書が届きます。支払い完了後、承認された各マシンで接続してください。アクセスは選択した開始日に有効化されます。以下の**いずれか一方**のパスを選んでください。

### 4a. Edge Connect

ホストで `doublezerod` がすでに実行中の場合（[セットアップ](/setup/)から）、まず停止してください — コンテナのデーモンと同じトンネルを奪い合います：

```bash
sudo systemctl stop doublezerod
```

承認と支払いの**後に** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) をインストールします。ブリッジは `--network host` コンテナ内で DoubleZero に参加し、`ws://<host>:8081` で正規化された JSON を提供します。

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**すべての `doublezero` コマンドはホスト CLI ではなく、コンテナ経由で実行します**：

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    コンテナへのコマンドを簡単にするためにエイリアスを作成できます。この例では、コンテナ内の `doublezero status` と同じ動作を `dz status` で実行できるようにします：

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

`BGP Session Up` と `edge-hyper-…` グループのサブスクライブが表示されることを確認してください。

次に WebSocket（`ws://127.0.0.1:8081`）を開きます。プロトコル：[PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md)。完全なウォークスルー：[MCP](/mcp/) ランブック `hyperliquid-edge`。

### 4b. ネイティブマルチキャスト

割り当てられた秘密鍵を持つホスト（ホストの `doublezerod` が実行中）で、購入したフィードにサブスクライブします：

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

複数のフィードはスペース区切り：

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

トンネルを確認します：

```bash
doublezero status
```

正しい DoubleZero ネットワークで `BGP Session Up` が表示されることを確認してください。その後、ワイヤを自分でデコードします — [フィードのデコード](#decode-the-feed)を参照。

---

## 課金

シートは**月単位**で課金されます。シートの有効期限日に注意してください。

シートの有効期限前に請求書を支払う必要があります。**未払いの場合、シートは削除されます。**

---

## フィードアドレス

IP でマルチキャストグループを選択します。ポートでそのグループ上のストリームを選択します。IP のライブ値は以下で確認できます：

```bash
doublezero multicast group list
```

| フィード | 説明 | マルチキャストグループ | マーケット | リファレンス | スナップショット | 仕様 |
|------|-------------|-----------------|--------|-----------|----------|------|
| `hyper-hl-tob` | Hyperliquid 無期限先物のベストビッド/オファーおよび約定情報 | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Hyperliquid 無期限先物のフルオーダー単位板情報 | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | trade.xyz 無期限先物のベストビッド/オファーおよび約定情報 | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | trade.xyz 無期限先物のフルオーダー単位板情報 | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

各フィードには固有のマルチキャストグループアドレスがあります。ポート：リファレンス = マーケット + `1`、スナップショット（MBO のみ）= マーケット + `2`。マーケットとリファレンスを一緒にバインドすることを推奨します。MBO の場合はスナップショットもバインドしてください。

`doublezero1` 上のポート `5765` で小さな UDP パケットが表示される場合があります — これは DoubleZero ハートビートであり、マーケットデータではありません。

フレームはリトルエンディアンの固定サイズバイナリです。Hyperliquid ネイティブ無期限先物は `source_id=1` を使用し、trade.xyz 無期限先物は `source_id=7` を使用します。

---

## フィードのデコード

!!! note "Edge Connect"
    `doublezero-edge-connect` を使用している場合、フィードはすでに WebSocket 上の JSON としてデコードされています — 手動デコードはスキップしてください。

**リファレンスパーサーを使用する**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) は、ワイヤフォーマットをデコードし Unix ソケット上で JSON として再配信するマルチキャストサブスクライバーを同梱しています：

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) — Top-of-Book & Trades 用
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) — Market-by-Order 用

完全なパイプラインについては [main README](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines) を参照してください。

**独自のデコーダーを作成する**

[edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec) に基づいてデコードしてください。フレームヘッダーから始めて、受信しているフィードのメッセージレイアウトに進みます。

**GRE トンネルヘッダー — XDP**

ネットワーク経由で配信されるマーケットデータトラフィックは、ラストマイルで GRE カプセル化されています。`doublezero1` 上では、クライアントはプレーンな UDP マルチキャストを提示します。GRE を自分で終端する場合（例：XDP パイプライン）、デコーダーにデータを渡す前に GRE ヘッダーを除去してください。[`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap) を参照。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試す前に既存のチャネルでお問い合わせください。チャネルがない場合は、[サポート](/support/)を参照してください。

**クライアントが最新であることを確認**


```bash
sudo apt update && sudo apt install doublezero
```

**トンネルが確立しない**


1. **Edge Connect:** コンテナ内でステータスを確認 — `docker exec doublezero-edge-connect doublezero status`。ホストの `doublezero status` はフィードが正常でも失敗することがよくあります（コンテナがデーモンを所有しているため）。ホストの `doublezerod` が停止していることを確認してください。
2. **ネイティブ:** ホストデーモンが実行中であることを確認：`sudo systemctl status doublezerod`
3. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、Hyperliquid UDP ポートおよび `doublezero1` 上の `5765`）
4. このシートの請求書が支払済みで、開始日を過ぎていることを確認
5. 選択したパス（[4a](#4a-edge-connect) または [4b](#4b-native-multicast)）で、accounts ページと一致する鍵を使用して接続を実行
6. 接続を実行した同じ場所（コンテナまたはホスト）で `BGP Session Up` が表示されることを確認

**サブスクライブ後にパケットがない**


1. サブスクライブ済みであることを確認：`doublezero user list`
2. グループの下にフィードが表示されていることを確認：`doublezero multicast group list`
3. トンネル上でキャプチャ（例：Hyperliquid TOB）：`sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. 目的のフィードについて、マーケットとリファレンスを一緒に（MBO の場合はスナップショットも）バインドすることを推奨

**購入済みフィードが表示されない（Edge Connect）**

購入済みフィードが `doublezero status` に表示されない場合、コンテナ内でサブスクライブしてください：

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-code>
```

複数のフィードはスペース区切り：

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

**シートの有効期限切れまたは削除**


シートは月単位です。有効期限前に請求書が支払われない場合、シートは削除され、トンネルは維持されません。

**"Multicast user already exists"**


別のパスを通じてアクティブなサブスクリプションがすでに存在しています。まず切断してから、接続を再試行してください：

- **Edge Connect:** `docker exec doublezero-edge-connect doublezero disconnect`
- **ネイティブ:** `doublezero disconnect`

その後、同じパス（コンテナまたはホスト）で `doublezero connect multicast --subscribe-feed <feed-code>` を再試行してください。

**AWS 固有の注意事項**


インスタンスの ENI で送信元/送信先チェックを無効にしてください。これがないと、GRE カプセル化されたマルチキャストがドロップされる場合があります。