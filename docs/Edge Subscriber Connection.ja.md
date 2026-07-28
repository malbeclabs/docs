---
description: DoubleZero シュレッドフィードを受信するためのエッジサブスクライバーの設定方法。クライアントセットアップ、GRE、BGP、PIM、シュレッドトラフィックのファイアウォールルールを含みます。
---

# エッジサブスクライバー接続
!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データはお客様の内部目的のみに使用可能であり、再送信は許可されていません（第2条(e)を参照）。"

## ステップ 1: DoubleZero セットアップ

### 1. セットアップの完了

[Solana CLI](https://docs.anza.xyz/cli/install) をインストールします。

[セットアップ](setup.md)の手順に従って、DoubleZero クライアントをインストールおよび設定します。

以前に DoubleZero をセットアップしたことがある場合は、`sudo apt update && sudo apt install doublezero-solana` で最新の Doublezero-Solana CLI に更新してください。

### 2. ファイアウォールの設定

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

### 3. リコンサイラーの有効化

リコンサイラーはオンチェーンの状態を監視し、シートが割り当てられたときに自動的にトンネルをプロビジョニングします。デフォルトでは有効になっていません。

```bash
doublezero enable
```

---

## ステップ 2: ウォレットの設定

### 1. Solana キーペアの作成

`doublezero-solana` CLI は、オンチェーンのシート管理に標準の Solana キーペアを使用します。まだお持ちでない場合：

```bash
solana-keygen new
```

これは `~/.config/solana/id.json` に書き込まれます。別のパスを使用する場合は、任意の `doublezero-solana` コマンドに `--keypair <path>` を渡してください。

ウォレットアドレスを表示：

```bash
solana address
```

### 2. ウォレットへの入金

ウォレットには2種類のトークンが必要です：

- **SOL** — Solana トランザクション手数料用。上記で表示されたウォレットアドレスに SOL を送金してください。
- **USDC** — シートの資金用。CLI はメインネット USDC ミント (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`) のウォレットの Associated Token Account (ATA) から引き出します。

---

## ステップ 3: シートの購入

### 1. 最寄りのデバイスを見つける

シートを購入する前に、お使いのマシンからレイテンシーが最も低いデバイスを特定します：

```bash
doublezero latency
```

最もレイテンシーが低い結果のデバイスコード（例：`<Device_Name>`）をメモしてください。シート購入時に使用します。

### 2. 料金の確認

資金を投入する前に、現在のデバイス料金を確認してください。料金は**メトロ基本料金**と**デバイスごとのプレミアム**の2つのコンポーネントで構成されています。料金と空き状況は[こちら](https://data.doublezero.xyz/dz/shreds/devices)でも確認できます。

**全デバイス：**

```bash
doublezero-solana shreds price
```

**特定のデバイス：**

```bash
doublezero-solana shreds price --device-code <Device_Name>
doublezero-solana shreds price --device <PUBKEY>
```

**メトロ内の全デバイス：**

```bash
doublezero-solana shreds price --metro <PUBKEY>
```

出力列：`Device Code`、`Metro Code`、`Metro Name`、`Status`、`Settled Seats`、`Available Seats`、`Base Price (USDC)`、`Premium (USDC)`、`Epoch Price (USDC)`。

エポック価格は、そのデバイスのシートあたりのエポックごとの合計コスト（基本料金 + プレミアム）です。`--wide` を使用すると完全な公開鍵を表示し、`--json` を使用すると JSON 出力になります。

### 3. シートの購入

1つのコマンドでシートを購入できます。これにより、シートの初期化、エスクローへの資金投入、割り当てリクエストが行われます：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**パラメータ：**

| フラグ | 説明 |
|------|-------------|
| `--device <PUBKEY>` | 公開鍵でターゲットデバイスを指定（`--device-code` とは排他的） |
| `--device-code <CODE>` | 人間が読めるコードでターゲットデバイスを指定（例：`<Device_Name>`） |
| `--client-ip <IP>` | お使いのマシンのパブリック IPv4 アドレス |
| `--amount <USDC>` | 資金投入する USDC（小数形式、例：`100` = 100 USDC）。最低エポック価格を満たす必要があります。 |
| `--source-token-account <PUBKEY>` | カスタム USDC ソースアカウント（デフォルトはウォレットの ATA） |
| `--accept-partial-epoch` | エポック残量の警告をスキップ（下記参照） |
| `--fee-payer <PATH>` | SOL トランザクション手数料に別のウォレットを使用 |
| `--dry-run` | 実行せずにトランザクションをシミュレート |
| `--with-compute-unit-price <PRICE>` | 混雑時の迅速な取り込みのためにコンピュートユニット価格を設定 |

シートが割り当てられると、デーモンが自動的に GRE トンネルを確立します。接続を確認するには：

```bash
doublezero status
```

### エポックのタイミング

シートは Solana エポック（約2日）ごとに割り当てられます。支払い時に現在のエポックの残りが 10% 未満の場合、CLI はシートが即座に割り当てられるものの現在のエポックの残りのみをカバーすると警告します。次のエポック開始時にエスクローから別途支払いが差し引かれます。

!!! info "シートを失わないよう、1エポック以上分の資金を投入することをお勧めします。エポックの残り時間は[こちら](https://explorer.solana.com/)で確認できます。"

この警告は `--accept-partial-epoch` でバイパスできます。

### エスクローの資金を維持する

!!! warning "決済時にエスクロー残高がエポック価格を下回っている場合、シートは割り当てられず、トンネルは切断され、蓄積されたテニュアが失われます。テニュアは将来のエポックでの優先順位を決定します。これを失うと、新規参入者として再び競争することになります。"

このアカウントに複数エポック分の資金を投入することができます。各決済でエスクローから1エポック分の価格が差し引かれ、残りの残高は繰り越されます。例えば、エポックごとの価格の5倍を投入すると、再入金なしで最大5エポック間シートをアクティブに保つことができます。

エスクローに追加入金するには、いつでも `shreds pay` を再度実行してください：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

`Target_IP` はシュレッドを受信するマシンのパブリック IPv4 アドレスである必要があります。ターゲットマシンで `curl -4 ifconfig.me` のようなコマンドを実行して確認できます。

### シートの監視

このセクションでは、CLI を使用してシートを表示する方法を説明します。[https://data.malbeclabs.com/api/v1/docs](https://data.doublezero.xyz/api/v1/docs) を使用してシートの監視やエスクローアカウントの管理を支援することもできます。

アクティブなシートとエスクロー残高を表示：

**全シート：**

```bash
doublezero-solana shreds list
```

**デバイスでフィルタ：**

```bash
doublezero-solana shreds list --device-code <Device_Name>
```

**クライアント IP でフィルタ：**

```bash
doublezero-solana shreds list --client-ip <Target_IP>
```

**ウォレットでフィルタ：**

```bash
doublezero-solana shreds list --withdraw-authority <PUBKEY>
```

出力列：`Device Code`、`Client IP`、`Tenure`、`Balance (USDC)`、`Est. Epochs Paid`。

「Est. Epochs Paid」列は、現在の価格で現在の残高が何エポック分をカバーするかを示します。価格が変更された場合、この見積もりは調整されます。

### 資金の引き出し

エスクローを閉じて、残りの USDC をウォレットに返金します：

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

他のコマンドと同様に、`--device <PUBKEY>` または `--device-code <CODE>` のいずれかでデバイスを指定できます。

別のトークンアカウントに返金を送る場合：

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "引き出しを行うと、シートと蓄積されたテニュアが失われます。"

---

## シュレッドアドレス（IP とポート）

リーダーシュレッドと高ステークのリトランスミットシュレッドはポート `7733` を通じて `doublezero1` インターフェースで到着します。`doublezero0` インターフェースはユニキャストトラフィック用です。ポート `5765` はシュレッドパブリッシャーからのハートビートモニターであり、シュレッドは含まれません。

シュレッドの消費において、**IP アドレス**はマルチキャストストリームを識別し、**ポート**はそのストリーム上の UDP サービスを識別します。  
以下のすべてのシュレッドストリームは `doublezero1` 上の UDP ポート `7733` を使用します。

任意のマルチキャストグループの IP を確認するには：

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

### [Edge Scoreboard](https://data.malbeclabs.com/dz/shreds/scoreboard)

Scoreboard は、スロットレベルのデータを使用して、DoubleZero Edge と他のプロバイダー間のシュレッド配信速度をリアルタイムで比較しベンチマークします。このダッシュボードを使用して、他のプロバイダーに対する Edge シュレッドの勝率を確認できます。リーダーシュレッドのみの結果や、フルフィードの比較を表示できます。また、地域別にドリルダウンして期待されるパフォーマンスを確認することもできます。

### [Edge Publishers](https://data.malbeclabs.com/dz/shreds/publishers)

ダッシュボードの左上にある「Publishing Shreds」メトリックは、DoubleZero Edge でリーダーシュレッドを公開しているすべての Solana バリデーターの合計ステークウェイトの割合を示します。ネットワーク上の各パブリッシャーの詳細を確認できます。

### [Edge Subscribers, Devices and Activity](https://data.malbeclabs.com/dz/shreds/subscribers)

このページでクライアント IP を簡単に検索して、サブスクライブ済みのシートとステータスを確認できます。特定のシートサブスクリプションをクリックして、支払い履歴とアクティビティを表示できます。また、[Devices](https://data.doublezero.xyz/dz/shreds/devices) ページで利用可能なデバイスを、[Activity](https://data.malbeclabs.com/dz/shreds/activity) ページで最近のすべてのアクティビティを確認できます。

### データ API ドキュメント

データエンドポイントへのプログラムからのアクセスについては、API ドキュメントを参照してください：[https://data.malbeclabs.com/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試みる前に既存のチャネルを通じてお問い合わせください。チャネルをお持ちでない場合は、[Discord](https://discord.gg/U2fEb4Jq) で検索し、必要に応じてチケットを開いてください。

### クライアントが最新であることを確認：

実行：`sudo apt update && sudo apt install doublezero-solana`

### エスクロー残高不足

決済時にエスクロー残高がエポック価格を下回っている場合、シートは割り当てられず、トンネルは切断され、テニュアが失われます。次の決済前に `shreds pay` で追加入金してください。

### 支払い後にシートが割り当てられない

- エポックの後半に支払った可能性があります。シートは次のエポックから有効になります。
- そのデバイスのすべてのシートがテニュアの長い既存ユーザーに占められている可能性があります。`shreds price` で空きシートを確認してください。
- 決済前に引き出しを行った場合、そのシートは対象外でした。

### トンネルが確立されない

1. デーモンが動作していることを確認：`sudo systemctl status doublezerod`
2. リコンサイラーが有効であることを確認：`doublezero enable`
3. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、`doublezero1` でのシュレッドトラフィック、`doublezero0` でのポート 44880）
4. 現在のエポックでシートがアクティブであることを確認：`doublezero-solana shreds list`
5. 接続状態を確認：`doublezero status`

デーモンのクライアント IP はホストのパブリック IP から自動検出されます。シートコマンドで使用した `--client-ip` と一致していることを確認してください。

### エポック警告プロンプト

エポックの残りが 10% 未満の場合、CLI が警告を表示します。選択肢：

- シートを即座に取得したい場合は `--accept-partial-epoch` で承認
- フルエポック分のカバレッジを得るために次のエポックまで待つ

### 「Amount is below the current price」

`pay` コマンドは、最低エポック価格（メトロ基本料金 + デバイスプレミアム）に対して金額を検証します。`shreds price` で現在の価格を確認し、金額を増やしてください。

### 「Multicast user already exists」

別のパスを通じてアクティブなサブスクリプションが既に存在します。まず `doublezero disconnect` で切断してから、`shreds pay` を再試行してください。