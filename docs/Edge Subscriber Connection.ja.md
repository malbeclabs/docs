---
description: DoubleZero シュレッドフィードを受信するためのエッジサブスクライバーのセットアップ方法。クライアントのセットアップや GRE、BGP、PIM、シュレッドトラフィック用のファイアウォールルールを含みます。
---

# エッジサブスクライバー接続
!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データはお客様の内部利用目的に限られ、再送信は許可されていません（セクション 2(e) を参照）。"

## ステップ 1: DoubleZero のセットアップ

### 1. セットアップの完了

[Solana CLI](https://docs.anza.xyz/cli/install) をインストールします。

[セットアップ](setup.md)の手順に従って、DoubleZero クライアントをインストールおよび設定します。

以前に DoubleZero をセットアップしたことがある場合は、`sudo apt update && sudo apt install doublezero-solana` で最新の Doublezero-Solana CLI をインストールしてください。

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

リコンサイラーはオンチェーンの状態を監視し、シートが割り当てられると自動的にトンネルをプロビジョニングします。デフォルトでは有効になっていません。

```bash
doublezero enable
```

---

## ステップ 2: ウォレットのセットアップ

### 1. Solana キーペアの作成

`doublezero-solana` CLI は、オンチェーンのシート管理に標準的な Solana キーペアを使用します。まだお持ちでない場合：

```bash
solana-keygen new
```

これにより `~/.config/solana/id.json` に書き込まれます。別のパスを使用する場合は、任意の `doublezero-solana` コマンドに `--keypair <path>` を渡してください。

ウォレットアドレスを表示します：

```bash
solana address
```

### 2. ウォレットへの入金

ウォレットには 2 種類のトークンが必要です：

- **SOL** — Solana のトランザクション手数料用。上記で表示されたウォレットアドレスに SOL を送金してください。
- **USDC** — シートの資金用。CLI はメインネット USDC ミント（`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`）のウォレットの Associated Token Account（ATA）から引き出します。

---

## ステップ 3: シートの購入

### 1. 最寄りのデバイスを見つける

シートを購入する前に、お使いのマシンから最も低レイテンシーのデバイスを特定します：

```bash
doublezero latency
```

最低レイテンシーの結果からデバイスコードをメモしてください（例：`<Device_Name>`）。シートの購入時にこれを使用します。

### 2. 価格の確認

資金を投入する前に、現在のデバイス価格を確認します。価格は **基本メトロ価格** と **デバイスごとのプレミアム** の 2 つの要素で構成されます。価格と空き状況は[こちら](https://data.malbeclabs.com/dz/shreds/devices)でも確認できます。

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

エポック価格は、そのデバイスのシートに対するエポックごとの合計コストです（基本 + プレミアム）。完全な公開鍵を表示するには `--wide` を、JSON 出力には `--json` を使用してください。

### 3. シートの購入

1 つのコマンドでシートを購入します。これによりシートの初期化、エスクローへの入金、および割り当てリクエストが行われます：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**パラメータ：**

| フラグ | 説明 |
|------|-------------|
| `--device <PUBKEY>` | 公開鍵でターゲットデバイスを指定（`--device-code` とは排他） |
| `--device-code <CODE>` | 人間が読めるコードでターゲットデバイスを指定（例：`<Device_Name>`） |
| `--client-ip <IP>` | お使いのマシンのパブリック IPv4 アドレス |
| `--amount <USDC>` | 入金する USDC（小数形式、例：`100` = 100 USDC）。最低エポック価格を満たす必要があります。 |
| `--source-token-account <PUBKEY>` | カスタム USDC ソースアカウント（デフォルトはウォレットの ATA） |
| `--accept-partial-epoch` | エポック残量の警告をスキップ（下記参照） |
| `--fee-payer <PATH>` | SOL トランザクション手数料に別のウォレットを使用 |
| `--dry-run` | トランザクションを実行せずにシミュレーション |
| `--with-compute-unit-price <PRICE>` | 混雑時のインクルージョンを高速化するためのコンピュートユニット価格を設定 |

シートが割り当てられると、デーモンが自動的に GRE トンネルを確立します。接続状況を確認するには：

```bash
doublezero status
```

### エポックのタイミング

シートは Solana エポック（約 2 日間）ごとに割り当てられます。支払い時に現在のエポックの残りが 10% 未満の場合、CLI はシートが即座に割り当てられるものの、現在のエポックの残り期間のみをカバーすることを警告します。次のエポックが始まると、エスクローから別途支払いが差し引かれます。

!!! info "シートを失わないように、1 エポック分以上を入金しておくことをお勧めします。エポックの残り時間は[こちら](https://explorer.solana.com/)で確認できます。"

`--accept-partial-epoch` でこの警告をバイパスできます。

### エスクローの残高を維持する

!!! warning "決済時にエスクロー残高がエポック価格を下回っている場合、シートは割り当てられず、トンネルは切断され、蓄積されたテニュアが失われます。テニュアは将来のエポックにおける優先順位を決定するため、失うと新規参入者として再び競争することになります。"

このアカウントに複数エポック分を超過入金することができます。各決済ではエスクローから 1 エポック分の価格が差し引かれ、残りの残高は繰り越されます。例えば、エポックあたりの価格の 5 倍を入金すれば、再入金なしで最大 5 エポック間シートをアクティブに保つことができます。

エスクローを追加入金するには、いつでも `shreds pay` を再実行してください：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

`Target_IP` はシュレッドを受信するマシンのパブリック IPv4 アドレスである必要があります。ターゲットマシンで `curl -4 ifconfig.me` のようなコマンドを実行して確認できます。

### シートの監視

このセクションでは、CLI を使用してシートを表示する方法を説明します。[https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs) を使用してシートを監視し、エスクローアカウントの管理を支援することもできます。

アクティブなシートとエスクロー残高を表示します：

**すべてのシート：**

```bash
doublezero-solana shreds list
```

**デバイスでフィルター：**

```bash
doublezero-solana shreds list --device-code <Device_Name>
```

**クライアント IP でフィルター：**

```bash
doublezero-solana shreds list --client-ip <Target_IP>
```

**ウォレットでフィルター：**

```bash
doublezero-solana shreds list --withdraw-authority <PUBKEY>
```

出力列：`Device Code`、`Client IP`、`Tenure`、`Balance (USDC)`、`Est. Epochs Paid`。

「Est. Epochs Paid」列は、現在の価格設定で現在の残高が何エポック分をカバーするかを示します。価格が変更された場合、この見積もりは調整されます。

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

リーダーシュレッドと高ステークのリトランスミットシュレッドはポート `7733` 経由で `doublezero1` インターフェース上に到着します。`doublezero0` インターフェースはユニキャストトラフィック用です。ポート `5765` はシュレッドパブリッシャーからのハートビートモニターであり、シュレッドは含まれません。

シュレッドの消費において、**IP アドレス** はマルチキャストストリームを識別し、**ポート** はそのストリーム上の UDP サービスを識別します。
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

!!! note "ネットワーク経由で配信されるシュレッドトラフィックは GRE カプセル化されています。既存のパイプライン（例：XDP ベースのデシュレッダー）にデータを入力する前に、GRE ヘッダーを除去する必要がある場合があります。"

---

## ツールとダッシュボード

### [Edge Scoreboard](https://data.malbeclabs.com/dz/shreds/scoreboard)

Scoreboard は、スロットレベルのデータを使用して、DoubleZero Edge と他のプロバイダー間のシュレッド配信速度をリアルタイムで比較するベンチマークです。このダッシュボードを使用して、Edge シュレッドの他のプロバイダーに対する勝率を確認できます。リーダーシュレッドのみの結果や、フルフィードの比較を表示できます。リージョン別にドリルダウンして、期待されるパフォーマンスを確認することもできます。

### [Edge Publishers](https://data.malbeclabs.com/dz/shreds/publishers)

ダッシュボードの左上にある「Publishing Shreds」メトリックは、DoubleZero Edge 上でリーダーシュレッドを公開しているすべての Solana バリデーターのステークウェイトの合計パーセントを示します。ネットワーク上の各パブリッシャーの詳細を確認できます。

### [Edge Subscribers, Devices and Activity](https://data.malbeclabs.com/dz/shreds/subscribers)

このページでクライアント IP を簡単に検索して、サブスクライブされたシートとステータスを確認できます。特定のシートサブスクリプションをクリックすると、支払い履歴とアクティビティを表示できます。利用可能なデバイスは [Devices](https://data.malbeclabs.com/dz/shreds/devices) ページで、最近のすべてのアクティビティは [Activity](https://data.malbeclabs.com/dz/shreds/activity) ページで確認できます。

### Data API ドキュメント

データエンドポイントへのプログラムによるアクセスについては、API ドキュメントを参照してください：[https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs)。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を講じる前に既存のチャネルでお問い合わせください。チャネルがない場合は、[Discord](https://discord.gg/U2fEb4Jq) を検索し、必要に応じてチケットを作成してください。

### クライアントが最新であることを確認する：

実行：`sudo apt update && sudo apt install doublezero-solana`

### エスクロー残高不足

決済時にエスクロー残高がエポック価格を下回っている場合、シートは割り当てられず、トンネルは切断され、テニュアが失われます。次の決済前に `shreds pay` で追加入金してください。

### 支払い後にシートが割り当てられない

- エポックの遅い時期に支払った可能性があります — シートは次のエポックから有効になります。
- デバイス上のすべてのシートが、より高いテニュアを持つ既存ユーザーによって占有されている可能性があります。`shreds price` で空きシートを確認してください。
- 決済前に引き出しを行った場合、シートは対象外でした。

### トンネルが確立されない

1. デーモンが実行中であることを確認：`sudo systemctl status doublezerod`
2. リコンサイラーが有効であることを確認：`doublezero enable`
3. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、`doublezero1` 上のシュレッドトラフィック、`doublezero0` 上のポート 44880）
4. 現在のエポックでシートがアクティブであることを確認：`doublezero-solana shreds list`
5. 接続状況を確認：`doublezero status`

デーモンのクライアント IP はホストのパブリック IP から自動検出されます — シートコマンドで使用した `--client-ip` と一致していることを確認してください。

### エポック警告プロンプト

CLI はエポックの残りが 10% 未満の場合に警告します。選択肢は以下の通りです：

- シートをすぐに取得したい場合は `--accept-partial-epoch` で受け入れる
- フルエポック分のカバレッジを得るために次のエポックを待つ

### 「Amount is below the current price」

`pay` コマンドは、最低エポック価格（メトロ基本 + デバイスプレミアム）に対して金額を検証します。`shreds price` で現在の価格を確認し、金額を増やしてください。

### 「Multicast user already exists」

別のパスを通じてすでにアクティブなサブスクリプションがあります。まず `doublezero disconnect` で切断してから、`shreds pay` を再試行してください。