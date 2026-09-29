---
description: DoubleZero シュレッドフィードを受信するためのエッジサブスクライバーのセットアップ。クライアントのセットアップと GRE、BGP、PIM、シュレッドトラフィックのファイアウォールルールを含みます。
---

# エッジサブスクライバー接続
!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol) に同意するものとします。データはお客様の内部目的のみに使用でき、再送信は許可されていません（第 2 条(e) を参照）。"

!!! warning "既に CLI サブスクリプションをお使いですか？"
    **CLI** を通じてサブスクリプションを行った場合（`doublezero-solana shreds pay` / エスクローシート）、それらのコマンドについては [CLI サブスクリプションページ](Edge Subscriber CLI.md) を参照してください。このシステムは **2026 年 8 月 30 日に廃止予定** です。新規サブスクリプションはこのページの手順に従ってください。

## ステップ 1: DoubleZero セットアップ

### 完全セットアップ

[Solana CLI](https://docs.anza.xyz/cli/install) をインストールします。

[セットアップ](setup.md) の手順に従って、DoubleZero クライアントをインストールおよび設定します。

以前に DoubleZero をセットアップしたことがある場合は、`sudo apt update && sudo apt install doublezero-solana` で最新の DoubleZero-Solana CLI に更新してください。

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
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

UFW には `pim` プロトコルがありません。アウトバウンド PIM は UFW のデフォルトの送信ポリシーにより許可されています。送信トラフィックを拒否している場合は、`/etc/ufw/before.rules` に PIM の raw ルールを追加してください。

---

## ステップ 2: メトロを選択する

シュレッドを受信するマシンから最も低レイテンシのロケーションを特定します:

```bash
doublezero latency
```

最も低レイテンシの結果からメトロ / 都市名をメモしてください。申請フォームでその都市を選択します。メトロのグループ分けについては [トポロジーマップ](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) を参照してください。

### 料金

シートは選択したメトロで、マシンごとに **月額** で課金されます:

| メトロ | 料金 |
|--------|------|
| Frankfurt, Amsterdam | $1,500 / 月 |
| London, New York, Singapore, Tokyo | $900 / 月 |
| その他すべてのロケーション | $450 / 月 |

---

## ステップ 3: リクエストを送信する

1. [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) にアクセスします。
2. **Solana Shreds** を選択します。
3. 必要な **都市**（メトロ）を選択します。上記の料金表と `doublezero latency` を参考に選択してください。
4. 申請フォームを完了します。

[アカウント](https://doublezero.xyz/shreds/account) ページで、各フィードリクエストに DoubleZero ID（既存のキー、または新規生成）を割り当てます。対応する **秘密鍵はシュレッドを受信するマシン上に存在する必要があります** — そのホストに移動できない秘密鍵の公開鍵は割り当てないでください。

選択するのは **メトロ** と **公開鍵** です。申請時にパブリック IP をバインドする必要は **ありません**。サブスクリプション期間中、**選択したメトロ内で** IP 間のアクセスを移動できます。

追加の手順については、適時ご連絡いたします（**1〜3 営業日** を見込んでください）。

---

## ステップ 4: 承認後に接続する

申請を送信すると請求書が届きます。支払いが完了したら、承認された各マシンで接続します。アクセスは選択した開始日に有効化されます。

```bash
doublezero connect multicast --subscribe-feed solana-shreds-full
```

トンネルを確認します:

```bash
doublezero status
```

正しい DoubleZero ネットワーク上で `BGP Session Up` が表示されることを確認してください。

---

## 請求

シートは **月額** で課金されます。シートの有効期限にご注意ください。

シートの有効期限前に請求書を支払う必要があります。**未払いの場合、シートは削除されます。**

---

## シュレッドアドレス（IP とポート）

リーダーシュレッドと高ステークのリトランスミットシュレッドは、`doublezero1` インターフェース上のポート `7733` で到着します。`doublezero0` インターフェースはユニキャストトラフィック用です。ポート `5765` はシュレッドパブリッシャーからのハートビートモニターであり、シュレッドは含まれません。

シュレッドの受信において、**IP アドレス** はマルチキャストストリームを識別し、**ポート** はそのストリーム上の UDP サービスを識別します。  
以下のすべてのシュレッドストリームは、`doublezero1` 上の UDP ポート `7733` を使用します。

任意のマルチキャストグループの IP は以下で確認できます:

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

!!! note "ネットワーク上で配信されるシュレッドトラフィックは GRE カプセル化されています。既存のパイプライン（例: XDP ベースのデシュレッダー）にデータを渡す前に、GRE ヘッダーを除去する必要がある場合があります。"

---

## ツールとダッシュボード

### [Edge スコアボード](https://data.doublezero.xyz/dz/shreds/scoreboard)

スコアボードは、スロットレベルのデータを使用して DoubleZero Edge と他のプロバイダー間のシュレッド配信速度をベンチマークし、リアルタイムでパフォーマンスを比較します。このダッシュボードを使用して、Edge シュレッドの他プロバイダーに対する勝率を確認できます。リーダーシュレッドのみの結果や、フルフィードの比較も表示できます。また、リージョン別にドリルダウンして期待されるパフォーマンスを確認することもできます。

### [Edge パブリッシャー](https://data.doublezero.xyz/dz/shreds/publishers)

ダッシュボード左上の「Publishing Shreds」メトリクスは、DoubleZero Edge 上でリーダーシュレッドをパブリッシュしている全 Solana バリデーターのステークウェイト合計パーセンテージを示します。ネットワーク上の各パブリッシャーの詳細を確認できます。

### [Edge サブスクライバー、デバイス、アクティビティ](https://data.doublezero.xyz/dz/shreds/subscribers)

このページでクライアント IP を検索して、サブスクリプション済みシートとステータスを確認できます。また、[デバイス](https://data.doublezero.xyz/dz/shreds/devices) ページで利用可能なデバイスを、[アクティビティ](https://data.doublezero.xyz/dz/shreds/activity) ページで最近のすべてのアクティビティを確認できます。

### Data API ドキュメント

データエンドポイントへのプログラマティックアクセスについては、API ドキュメントを参照してください: [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を講じる前に、既存のチャンネルを通じてお問い合わせください。チャンネルをお持ちでない場合は、[Discord](https://discord.gg/U2fEb4Jq) で検索し、必要に応じてチケットを作成してください。

### クライアントが最新であることを確認してください:

実行: `sudo apt update && sudo apt install doublezero-solana`

### トンネルが起動しない

1. デーモンが実行中であることを確認: `sudo systemctl status doublezerod`
2. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、`doublezero1` 上のシュレッドトラフィック、`doublezero0` 上のポート 44880）
3. このシートの請求書が支払い済みで、開始日が過ぎていることを確認
4. 割り当てられた秘密鍵を持つマシンで `doublezero connect multicast --subscribe-feed solana-shreds-full` を実行
5. 接続ステータスを確認: `doublezero status`

アカウントページで使用した DoubleZero ID は、このホスト上のキーと一致する必要があります。

### シートの有効期限切れまたは削除

シートは月額です。有効期限前に請求書が支払われない場合、シートは削除され、トンネルは維持されません。

### "Multicast user already exists"

別のパスを通じてアクティブなサブスクリプションが既に存在しています。まず `doublezero disconnect` で切断してから、`doublezero connect multicast --subscribe-feed solana-shreds-full` を再試行してください。