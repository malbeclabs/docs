---
description: DoubleZero シュレッドフィードを受信するためのエッジサブスクライバーのセットアップ。クライアントのセットアップおよび GRE、BGP、PIM、シュレッドトラフィックのファイアウォールルールを含みます。
---

# エッジサブスクライバー接続
!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データはお客様の内部利用目的に限定され、再送信は禁止されていることにご注意ください（第2条(e)参照）。"

## ステップ 1: DoubleZero のセットアップ

### 1. セットアップの完了

[Solana CLI](https://docs.anza.xyz/cli/install) をインストールします。

[セットアップ](setup.md)の手順に従って、DoubleZero クライアントをインストールおよび設定します。

以前に DoubleZero をセットアップ済みの場合は、`sudo apt update && sudo apt install doublezero-solana` で最新の Doublezero-Solana CLI を入手してください。

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

### 4. サーバーの DoubleZero アイデンティティの取得

DoubleZero アイデンティティを確認します。このアイデンティティは、お使いのマシンと DoubleZero 間の接続を作成するために使用されます。

```bash
doublezero address
```

**出力:**
```
YourDoubleZeroAddress11111111111111111111111111111
```

---

## ステップ 2: ウォレットのセットアップ

### 1. Solana キーペアの作成

`doublezero-solana` CLI は、オンチェーンのシート管理に標準的な Solana キーペアを使用します。キーペアをお持ちでない場合:

```bash
solana-keygen new
```

これにより `~/.config/solana/id.json` に書き込まれます。別のパスを使用する場合は、任意の `doublezero-solana` コマンドに `--keypair <path>` を渡してください。

ウォレットアドレスを表示:

```bash
solana address
```

### 2. ウォレットへの資金投入

ウォレットには2種類のトークンが必要です:

- **SOL** — Solana のトランザクション手数料用。上記で表示されたウォレットアドレスに SOL を送金してください。
- **USDC** — シートの資金調達用。CLI はメインネット USDC ミント (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`) のウォレットの Associated Token Account (ATA) から引き出します。

---

## ステップ 3: シートの購入

### 1. 最寄りのデバイスを見つける

シートを購入する前に、お使いのマシンからレイテンシーが最も低いデバイスを特定します:

```bash
doublezero latency
```

最もレイテンシーが低い結果のデバイスコード（例: `<Device_Name>`）をメモしてください。シート購入時に使用します。

### 2. 料金の確認

資金をコミットする前に、現在のデバイス料金を確認します。料金は**基本メトロ料金**と**デバイスごとのプレミアム**の2つの要素で構成されます。料金はエポックごとに更新されます。料金と空き状況は[こちら](https://data.malbeclabs.com/dz/shreds/devices)でも確認できます。

**全デバイス:**

```bash
doublezero-solana shreds price
```

**特定のデバイス:**

```bash
doublezero-solana shreds price --device-code <Device_Name>
doublezero-solana shreds price --device <PUBKEY>
```

**メトロ内の全デバイス:**

```bash
doublezero-solana shreds price --metro <PUBKEY>
```

出力カラム: `Device Code`、`Metro Code`、`Metro Name`、`Status`、`Settled Seats`、`Available Seats`、`Base Price (USDC)`、`Premium (USDC)`、`Epoch Price (USDC)`。

エポック料金は、そのデバイスのシートあたりのエポックごとの合計コスト（基本 + プレミアム）です。`--wide` を使用するとフルの公開鍵が表示され、`--json` を使用すると JSON 出力になります。

### 3. シートの購入

1つのコマンドでシートを購入します。これによりシートの初期化、エスクローへの資金投入、および割り当てリクエストが行われます:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**パラメータ:**

| フラグ | 説明 |
|------|-------------|
| `--device <PUBKEY>` | 公開鍵でターゲットデバイスを指定（`--device-code` と排他） |
| `--device-code <CODE>` | 人間が読めるコードでターゲットデバイスを指定（例: `<Device_Name>`） |
| `--client-ip <IP>` | お使いのマシンのパブリック IPv4 アドレス |
| `--amount <USDC>` | 投入する USDC（10進数形式、例: `100` = 100 USDC）。最低エポック料金を満たす必要があります。 |
| `--source-token-account <PUBKEY>` | カスタム USDC ソースアカウント（デフォルトはウォレットの ATA） |
| `--accept-partial-epoch` | エポック残り時間の警告をスキップ（下記参照） |
| `--fee-payer <PATH>` | SOL トランザクション手数料に別のウォレットを使用 |
| `--dry-run` | 実行せずにトランザクションをシミュレート |
| `--with-compute-unit-price <PRICE>` | 混雑時により早く含まれるようにコンピュートユニット価格を設定 |

シートが割り当てられると、デーモンが自動的に GRE トンネルを確立します。接続を確認するには:

```bash
doublezero status
```

### エポックのタイミング

シートは Solana のエポックごと（約2日）に割り当てられます。支払い時に現在のエポックの残りが 10% 未満の場合、CLI はシートが即座に割り当てられるものの現在のエポックの残りのみをカバーする旨の警告を表示します。次のエポック開始時にエスクローから別途支払いが差し引かれます。

!!! info "シートを失わないよう、一度に1エポック分以上の資金を投入することをお勧めします。エポックの残り時間は[こちら](https://explorer.solana.com/)で確認できます。"

この警告は `--accept-partial-epoch` でバイパスできます。

### エスクローの資金を維持する

!!! warning "決済時にエスクロー残高がエポック料金を下回っている場合、シートは割り当てられず、トンネルは切断され、蓄積されたテニュアが失われます。テニュアは将来のエポックでの優先順位を決定するため、失うと新規参入者として再度競争することになります。"

このアカウントに複数エポック分の資金を投入することができます。各決済でエスクローからエポック1回分の料金が差し引かれ、残りの残高は繰り越されます。例えば、エポックあたりの料金の5倍を投入すると、再投入なしで最大5エポック分シートがアクティブに保たれます。

エスクローに追加資金を投入するには、いつでも `shreds pay` を再度実行してください:

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

`Target_IP` はシュレッドを受信するマシンのパブリック IPv4 アドレスである必要があります。ターゲットマシンで `curl -4 ifconfig.me` のようなコマンドを実行して確認できます。

### シートの監視

このセクションでは、CLI を使用してシートを確認する方法を説明します。[https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs) を使用してシートの監視やエスクローアカウントの管理を支援することもできます。

アクティブなシートとエスクロー残高を表示:

**すべてのシート:**

```bash
doublezero-solana shreds list
```

**デバイスでフィルター:**

```bash
doublezero-solana shreds list --device-code <Device_Name>
```

**クライアント IP でフィルター:**

```bash
doublezero-solana shreds list --client-ip <Target_IP>
```

**ウォレットでフィルター:**

```bash
doublezero-solana shreds list --withdraw-authority <PUBKEY>
```

出力カラム: `Device Code`、`Client IP`、`Tenure`、`Balance (USDC)`、`Est. Epochs Paid`。

「Est. Epochs Paid」カラムは、現在の料金で現在の残高が何エポック分をカバーするかを示します。料金が変更されると、この推定値も調整されます。

### 資金の引き出し

エスクローを閉じ、残りの USDC をウォレットに返金:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

他のコマンドと同様に、`--device <PUBKEY>` または `--device-code <CODE>` のいずれかでデバイスを指定できます。

別のトークンアカウントに返金する場合:

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "引き出しを行うと、シートおよび蓄積されたテニュアが失われます。"

---

## シュレッドアドレス（IP vs ポート）

リーダーシュレッドおよび高ステークのリトランスミットシュレッドは、`doublezero1` インターフェースを介してポート `7733` で到着します。`doublezero0` インターフェースはユニキャストトラフィック用です。ポート `5765` はシュレッドパブリッシャーからのハートビートモニターであり、シュレッドは含まれません。

シュレッド消費において、**IP アドレス**はマルチキャストストリームを識別し、**ポート**はそのストリーム上の UDP サービスを識別します。  
以下のすべてのシュレッドストリームは `doublezero1` 上の UDP ポート `7733` を使用します。

マルチキャストグループの IP は以下のコマンドで確認できます:

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

!!! note "ネットワーク上で配信されるシュレッドトラフィックは GRE カプセル化されています。既存のパイプライン（例: XDP ベースのデシュレッダー）にデータを入力する前に、GRE ヘッダーを除去する必要がある場合があります。"

---

## ツールとダッシュボード

### [Edge スコアボード](https://data.malbeclabs.com/dz/shreds/scoreboard)

スコアボードは、DoubleZero Edge と他のプロバイダー間のシュレッド配信速度をベンチマークし、スロットレベルのデータを使用してリアルタイムでパフォーマンスを比較します。このダッシュボードを使用して、他のプロバイダーに対する Edge シュレッドの勝率を確認できます。リーダーシュレッドのみの結果やフルフィード比較を表示できます。また、地域別にドリルダウンして予想されるパフォーマンスを確認することもできます。

### [Edge パブリッシャー](https://data.malbeclabs.com/dz/shreds/publishers)

ダッシュボード左上の「Publishing Shreds」メトリックは、DoubleZero Edge 上でリーダーシュレッドを公開しているすべての Solana バリデーターの合計ステークウェイトの割合を示します。ネットワーク上の各パブリッシャーの詳細を確認できます。

### [Edge サブスクライバー、デバイスおよびアクティビティ](https://data.malbeclabs.com/dz/shreds/subscribers)

このページでクライアント IP を簡単に検索して、購読中のシートとステータスを確認できます。特定のシートサブスクリプションをクリックすると、支払い履歴とアクティビティを表示できます。また、利用可能なデバイスは [Devices](https://data.malbeclabs.com/dz/shreds/devices) ページで、最近のすべてのアクティビティは [Activity](https://data.malbeclabs.com/dz/shreds/activity) ページで確認できます。

### Data API ドキュメント

データエンドポイントへのプログラムによるアクセスについては、API ドキュメントを参照してください: [https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs)。

---

## トラブルシューティング

ここでカバーされていない問題が発生した場合は、回避策を講じる前に既存のチャネルを通じてお問い合わせください。チャネルをお持ちでない場合は、[Discord](https://discord.gg/U2fEb4Jq) を検索し、必要に応じてチケットを開いてください。

### クライアントが最新であることを確認:

実行: `sudo apt update && sudo apt install doublezero-solana`

### エスクロー残高不足

決済時にエスクロー残高がエポック料金を下回っている場合、シートは割り当てられず、トンネルは切断され、テニュアが失われます。次の決済前に `shreds pay` で追加資金を投入してください。

### 支払い後にシートが割り当てられない

- エポックの後半に支払った可能性があります — シートは次のエポックから有効になります。
- デバイス上のすべてのシートがテニュアの高い既存ユーザーに占有されている可能性があります。`shreds price` で空きシートを確認してください。
- 決済前に引き出しを行った場合、シートは対象外となります。

### トンネルが起動しない

1. デーモンが実行中か確認: `sudo systemctl status doublezerod`
2. リコンサイラーが有効か確認: `doublezero enable`
3. ファイアウォールルールが設定されているか確認（GRE、BGP、PIM、`doublezero1` 上のシュレッドトラフィック、`doublezero0` 上のポート 44880）
4. 現在のエポックでシートがアクティブか確認: `doublezero-solana shreds list`
5. 接続状態を確認: `doublezero status`

デーモンのクライアント IP はホストのパブリック IP から自動検出されます — シートコマンドで使用した `--client-ip` と一致しているか確認してください。

### エポック警告プロンプト

エポックの残りが 10% 未満の場合、CLI が警告を表示します。選択肢:

- シートを即座に取得したい場合は `--accept-partial-epoch` で受け入れる
- フルエポック分のカバレッジを得るために次のエポックまで待つ

### 「Amount is below the current price」

`pay` コマンドは、最低エポック料金（メトロ基本料金 + デバイスプレミアム）に対して金額を検証します。`shreds price` で現在の料金を確認し、金額を増やしてください。

### 「Multicast user already exists」

別の経路でアクティブなサブスクリプションが既に存在します。まず `doublezero disconnect` で切断してから、`shreds pay` を再試行してください。