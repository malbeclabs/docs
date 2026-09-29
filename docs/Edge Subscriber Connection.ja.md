---
description: DoubleZero シュレッドフィードを受信するためのエッジサブスクライバーのセットアップ方法。クライアントのセットアップおよび GRE、BGP、PIM、シュレッドトラフィック用のファイアウォールルールを含みます。
---

# エッジサブスクライバー接続
!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol) に同意したものとみなされます。データはお客様の内部目的のみに使用でき、再送信は禁止されています（第 2 条(e) を参照）。"

!!! warning "すでに CLI サブスクリプションをご利用ですか？"
    **CLI** を通じてサブスクリプションを行った場合（`doublezero-solana shreds pay` / エスクローシート）、該当するコマンドについては [CLI サブスクリプションページ](Edge Subscriber CLI.md) をご参照ください。このシステムは **2026 年 8 月 30 日に廃止予定** です。新規サブスクリプションはこのページの手順に従ってください。

## ステップ 1: DoubleZero セットアップ

### セットアップの完了

[Solana CLI](https://docs.anza.xyz/cli/install) をインストールします。

[セットアップ](setup.md) の手順に従って DoubleZero クライアントをインストールおよび設定します。

以前に DoubleZero をセットアップ済みの場合は、`sudo apt update && sudo apt install doublezero-solana` で最新の Doublezero-Solana CLI に更新してください。

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

## ステップ 2: メトロを選択する

シュレッドを受信するマシンから最もレイテンシが低いロケーションを特定します：

```bash
doublezero latency
```

最もレイテンシが低い結果のメトロ / 都市を記録してください。申請フォームでその都市を選択します。メトロのグループ分けについては [トポロジーマップ](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) を参照してください。

### 料金

シートは選択したメトロにおいて、マシンごとに **月額** で課金されます：

| メトロ | 料金 |
|--------|-------|
| Frankfurt、Amsterdam | $1,500 / 月 |
| London、New York、Singapore、Tokyo | $900 / 月 |
| その他すべてのロケーション | $450 / 月 |

---

## ステップ 3: リクエストを送信する

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) にアクセスします。
2. **Solana Shreds** を選択します。
3. 必要な **都市**（メトロ）を選択します。上記の表と `doublezero latency` を参考にしてください。
4. 申請フォームを完了します。

各フィードリクエストに対して、[アカウント](https://doublezero.xyz/shreds/account) ページで DoubleZero ID（既存のキー、または新規生成）を割り当てます。対応する **秘密鍵はシュレッドを受信するマシン上に存在する必要があります** — そのホストに移動できない秘密鍵の公開鍵は割り当てないでください。

選択するのは **メトロ** と **公開鍵** です。申請時にパブリック IP を紐付ける必要は **ありません**。サブスクリプション期間中、**選択したメトロ内で** IP 間のアクセスを移動できます。

適切な時間内に追加の手順についてご連絡いたします（**1〜3 営業日** を見込んでください）。

---

## ステップ 4: 承認後に接続する

申請を送信すると請求書が届きます。支払いが完了したら、承認された各マシンで接続します。アクセスは選択した開始日に有効になります。

```bash
doublezero connect multicast --subscribe-feed solana-shreds-full
```

トンネルを確認します：

```bash
doublezero status
```

正しい DoubleZero ネットワーク上で `BGP Session Up` が表示されることを確認してください。

---

## 課金

シートは **月額** で課金されます。シートの有効期限にご注意ください。

シートの有効期限が切れる前に請求書を支払う必要があります。**未払いの場合、シートは削除されます。**

---

## シュレッドアドレス（IP とポート）

リーダーシュレッドおよび高ステークリトランスミットシュレッドは、`doublezero1` インターフェース上のポート `7733` で到着します。`doublezero0` インターフェースはユニキャストトラフィック用です。ポート `5765` はシュレッドパブリッシャーからのハートビートモニターであり、シュレッドは含まれません。

シュレッドの受信において、**IP アドレス** はマルチキャストストリームを識別し、**ポート** はそのストリーム上の UDP サービスを識別します。  
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

!!! note "ネットワーク経由で配信されるシュレッドトラフィックは GRE カプセル化されています。既存のパイプライン（例：XDP ベースのデシュレッダー）にデータを渡す前に、GRE ヘッダーを除去する必要がある場合があります。"

---

## ツールとダッシュボード

### [Edge Scoreboard](https://data.doublezero.xyz/dz/shreds/scoreboard)

Scoreboard は、スロットレベルのデータを使用して、DoubleZero Edge と他のプロバイダー間のシュレッド配信速度をリアルタイムで比較するベンチマークです。このダッシュボードを使用して、他のプロバイダーに対する Edge シュレッドの勝率を確認できます。リーダーシュレッドのみの結果や、フルフィードの比較を表示できます。また、リージョン別にドリルダウンして期待されるパフォーマンスを確認することもできます。

### [Edge Publishers](https://data.doublezero.xyz/dz/shreds/publishers)

ダッシュボード左上の「Publishing Shreds」メトリクスは、DoubleZero Edge でリーダーシュレッドをパブリッシュしているすべての Solana バリデーターの合計ステークウェイト割合を示します。ネットワーク上の各パブリッシャーの詳細を確認できます。

### [Edge Subscribers, Devices and Activity](https://data.doublezero.xyz/dz/shreds/subscribers)

このページでクライアント IP を検索して、サブスクライブ済みシートとステータスを確認できます。また、[Devices](https://data.doublezero.xyz/dz/shreds/devices) ページで利用可能なデバイスを、[Activity](https://data.doublezero.xyz/dz/shreds/activity) ページで最近のすべてのアクティビティを確認できます。

### Data API ドキュメント

データエンドポイントへのプログラムによるアクセスについては、API ドキュメントを参照してください：[https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を講じる前に既存のチャネルを通じてお問い合わせください。チャネルをお持ちでない場合は、[Discord](https://discord.gg/U2fEb4Jq) で検索し、必要に応じてチケットを作成してください。

### クライアントが最新であることを確認してください：

実行：`sudo apt update && sudo apt install doublezero-solana`

### トンネルが確立されない

1. デーモンが実行中であることを確認：`sudo systemctl status doublezerod`
2. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、`doublezero1` 上のシュレッドトラフィック、`doublezero0` 上のポート 44880）
3. このシートの請求書が支払い済みで、開始日を過ぎていることを確認
4. 割り当てられた秘密鍵を保持するマシン上で `doublezero connect multicast --subscribe-feed solana-shreds-full` を実行
5. 接続状態を確認：`doublezero status`

アカウントページで使用した DoubleZero ID は、このホスト上のキーと一致する必要があります。

### シートの期限切れまたは削除

シートは月額制です。有効期限前に請求書が支払われない場合、シートは削除され、トンネルは維持されません。

### "Multicast user already exists"

別の経路を通じてすでにアクティブなサブスクリプションがあります。まず `doublezero disconnect` で切断してから、`doublezero connect multicast --subscribe-feed solana-shreds-full` を再試行してください。