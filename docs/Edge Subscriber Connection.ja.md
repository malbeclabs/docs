---
description: GRE、BGP、PIM、およびシュレッドトラフィック用のクライアントセットアップとファイアウォールルールを含む、DoubleZero シュレッドフィードを受信するためのエッジサブスクライバーのセットアップ。
---

# エッジサブスクライバー接続
!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol) に同意したものとみなされます。データはお客様の内部目的のみに使用され、再送信は許可されていません（セクション 2(e) を参照）。"

!!! warning "すでに CLI サブスクリプションをご利用ですか？"
    **CLI** を通じてサブスクライブした場合（`doublezero-solana shreds pay` / エスクローシート）、それらのコマンドについては [CLI サブスクリプションページ](Edge Subscriber CLI.md) を参照してください。このシステムは **2026年8月30日に廃止予定** です。新規サブスクリプションはこのページに従ってください。

## ステップ 1: DoubleZero セットアップ

### セットアップの完了

[Solana CLI](https://docs.anza.xyz/cli/install) をインストールします。

[セットアップ](setup.md) 手順に従って、DoubleZero クライアントをインストールおよび設定します。

以前に DoubleZero をセットアップしたことがある場合は、`sudo apt update && sudo apt install doublezero-solana` で最新の Doublezero-Solana CLI がインストールされていることを確認してください。

### ファイアウォールの設定

GRE、BGP、PIM、およびシュレッドトラフィックを許可します。

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

---

## ステップ 2: メトロの選択

シュレッドを受信するマシンから最も低レイテンシのロケーションを特定します：

```bash
doublezero latency
```

最も低レイテンシの結果からメトロ / 都市を確認してください。申請フォームでその都市を選択します。メトロのグループ分けについては [トポロジマップ](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) を参照してください。

### 料金

シートは、選択したメトロにおいて、マシンごとに **月額** で請求されます：

| メトロ | 料金 |
|--------|-------|
| フランクフルト、アムステルダム | $1,500 / 月 |
| ロンドン、ニューヨーク、シンガポール、東京 | $900 / 月 |
| その他すべてのロケーション | $450 / 月 |

---

## ステップ 3: リクエストの送信

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) にアクセスします。
2. **Solana Shreds** を選択します。
3. 必要な **都市**（メトロ）を選択します。上記の表と `doublezero latency` を使用して選択してください。
4. 申請フォームを完了します。

[アカウント](https://doublezero.xyz/shreds/account) ページで、各フィードリクエストに DoubleZero ID（既存のキー、または新しいキーを生成）を割り当てます。対応する **秘密鍵はシュレッドを受信するマシン上に存在する必要があります** — そのホストに移動できない秘密鍵の公開鍵は割り当てないでください。

**メトロ** と **公開鍵** を選択します。申請時にパブリック IP をバインドする **必要はありません**。サブスクリプション期間中、**選択したメトロ内で** IP 間のアクセスを移動できます。

タイムリーに追加の手順についてご連絡いたします（**1〜3 営業日** を想定してください）。

---

## ステップ 4: 承認後の接続

申請を送信すると、請求書が届きます。支払いが完了したら、承認された各マシンで接続します。アクセスは選択した開始日に有効になります。

```bash
doublezero connect multicast --subscribe-feed solana-shreds-full
```

トンネルを確認します：

```bash
doublezero status
```

正しい DoubleZero ネットワークで `BGP Session Up` が表示されることを確認してください。

---

## 請求

シートは **月額** で請求されます。シートの有効期限にご注意ください。

シートの有効期限が切れる前に請求書を支払う必要があります。**未払いの場合、シートは削除されます。**

---

## シュレッドアドレス（IP と ポート）

リーダーシュレッドと高ステークのリトランスミットシュレッドは、`doublezero1` インターフェース上のポート `7733` で到着します。`doublezero0` インターフェースはユニキャストトラフィック用です。ポート `5765` はシュレッドパブリッシャーからのハートビートモニターであり、シュレッドは含まれません。

シュレッドの消費において、**IP アドレス** はマルチキャストストリームを識別し、**ポート** はそのストリーム上の UDP サービスを識別します。  
以下のすべてのシュレッドストリームは `doublezero1` 上の UDP ポート `7733` を使用します。

任意のマルチキャストグループの IP は以下で確認できます：

```bash
doublezero multicast group list
```

### リーダーシュレッド

- `edge-solana-shreds`: `233.84.178.1:7733`

### ルートシュレッド

- `edge-solana-root`: `233.84.178.16:7733`

### リトランスミットシュレッド

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## GRE トンネルヘッダー — XDP

!!! note "ネットワーク経由で配信されるシュレッドトラフィックは GRE カプセル化されています。既存のパイプライン（例：XDP ベースのデシュレッダー）にデータを送る前に、GRE ヘッダーを除去する必要がある場合があります。"

---

## ツールとダッシュボード

### [Edge スコアボード](https://data.doublezero.xyz/dz/shreds/scoreboard)

スコアボードは、DoubleZero Edge と他のプロバイダー間のシュレッド配信速度を、スロットレベルのデータを使用してリアルタイムでパフォーマンスを比較するベンチマークです。このダッシュボードを使用して、他のプロバイダーに対する Edge シュレッドの勝率を確認できます。リーダーシュレッドのみの結果や、フルフィードの比較を表示できます。また、リージョンごとにドリルダウンして、期待されるパフォーマンスを確認することもできます。

### [Edge パブリッシャー](https://data.doublezero.xyz/dz/shreds/publishers)

ダッシュボードの左上にある「Publishing Shreds」メトリクスは、DoubleZero Edge でリーダーシュレッドを公開しているすべての Solana バリデーターのステークウェイトの合計パーセンテージを示しています。ネットワーク上の各パブリッシャーの詳細を確認できます。

### [Edge サブスクライバー、デバイス、アクティビティ](https://data.doublezero.xyz/dz/shreds/subscribers)

このページでクライアント IP を検索して、サブスクライブ済みのシートとステータスを確認できます。また、[デバイス](https://data.doublezero.xyz/dz/shreds/devices) ページで利用可能なデバイスを確認したり、[アクティビティ](https://data.doublezero.xyz/dz/shreds/activity) ページですべての最近のアクティビティを確認したりすることもできます。

### データ API ドキュメント

データエンドポイントへのプログラムによるアクセスについては、API ドキュメントを参照してください: [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)。

---

## トラブルシューティング

ここで取り上げられていない問題が発生した場合は、回避策を講じる前に、既存のチャネルを通じてお問い合わせください。チャネルがない場合は、[Discord](https://discord.gg/U2fEb4Jq) で検索し、必要に応じてチケットを作成してください。

### クライアントが最新であることを確認してください：

実行: `sudo apt update && sudo apt install doublezero-solana`

### トンネルが確立されない

1. デーモンが実行中であることを確認: `sudo systemctl status doublezerod`
2. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、`doublezero1` 上のシュレッドトラフィック、`doublezero0` 上のポート 44880）
3. このシートの請求書が支払い済みで、開始日を過ぎていることを確認
4. 割り当てられた秘密鍵を保持するマシンで `doublezero connect multicast --subscribe-feed solana-shreds-full` を実行
5. 接続ステータスを確認: `doublezero status`

アカウントページで使用される DoubleZero ID は、このホスト上のキーと一致する必要があります。

### シートの期限切れまたは削除

シートは月額制です。有効期限前に請求書が支払われない場合、シートは削除され、トンネルは維持されません。

### "Multicast user already exists"

別の経路でアクティブなサブスクリプションが既に存在します。まず `doublezero disconnect` で切断してから、`doublezero connect multicast --subscribe-feed solana-shreds-full` を再試行してください。