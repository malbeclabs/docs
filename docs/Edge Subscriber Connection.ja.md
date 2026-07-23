---
description: DoubleZero シュレッドフィードを受信するためのエッジサブスクライバーのセットアップ（クライアント設定、GRE・BGP・PIM・シュレッドトラフィック用ファイアウォールルールを含む）。
---

# エッジサブスクライバー接続
!!! warning "DoubleZero に接続することで、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データは社内目的のみに使用可能であり、再送信することはできません（セクション 2(e) を参照）。"

## ステップ 1: DoubleZero セットアップ

### 1. セットアップの完了

[Solana CLI](https://docs.anza.xyz/cli/install) をインストールします。

[セットアップ](setup.md)の手順に従って、DoubleZero クライアントをインストール・設定します。

以前に DoubleZero をセットアップ済みの場合は、`sudo apt update && sudo apt install doublezero-solana` で最新の Doublezero-Solana CLI に更新してください。

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

リコンサイラーはオンチェーン状態を監視し、シートが割り当てられたときに自動的にトンネルをプロビジョニングします。デフォルトでは有効になっていません。

```bash
doublezero enable
```

---

## ステップ 2: ウォレットのセットアップ

### 1. Solana キーペアの作成

`doublezero-solana` CLI は、オンチェーンシート管理に標準的な Solana キーペアを使用します。キーペアをお持ちでない場合：

```bash
solana-keygen new
```

これにより `~/.config/solana/id.json` に書き込まれます。別のパスを使用する場合は、`doublezero-solana` コマンドに `--keypair <path>` を渡してください。

ウォレットアドレスを表示するには：

```bash
solana address
```

### 2. ウォレットへの入金

ウォレットには 2 種類のトークンが必要です：

- **SOL** — Solana トランザクション手数料用。上記で表示されたウォレットアドレスに SOL を送金してください。
- **USDC** — シートの資金用。CLI はメインネット USDC ミント（`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`）のウォレットの Associated Token Account（ATA）から引き出します。

---

## ステップ 3: シートの購入

### 1. 最寄りのデバイスを見つける

シートを購入する前に、お使いのマシンからのレイテンシが最も低いデバイスを特定します：

```bash
doublezero latency
```

最も低いレイテンシの結果からデバイスコードをメモしてください（例：`<Device_Name>`）。シート購入時にこれを使用します。

### 2. 価格の確認

資金を投入する前に、現在のデバイス価格を確認してください。価格は **基本メトロ価格** と **デバイスごとのプレミアム** の 2 つの要素で構成されます。価格はエポックごとに更新されます。価格と空き状況は[こちら](https://data.malbeclabs.com/dz/shreds/devices)でも確認できます。

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

出力カラム：`Device Code`、`Metro Code`、`Metro Name`、`Status`、`Settled Seats`、`Available Seats`、`Base Price (USDC)`、`Premium (USDC)`、`Epoch Price (USDC)`。

エポック価格は、そのデバイスのシートあたりのエポックごとの合計コスト（基本 + プレミアム）です。`--wide` を使用すると完全な公開鍵が表示され、`--json` を使用すると JSON 出力になります。

### 3. シートの購入

1 つのコマンドでシートを購入します。これによりシートの初期化、エスクローへの入金、割り当てリクエストが行われます：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**パラメータ：**

| フラグ | 説明 |
|------|-------------|
| `--device <PUBKEY>` | 公開鍵でターゲットデバイスを指定（`--device-code` と排他的） |
| `--device-code <CODE>` | 人間が読めるコードでターゲットデバイスを指定（例：`<Device_Name>`） |
| `--client-ip <IP>` | お使いのマシンのパブリック IPv4 アドレス |
| `--amount <USDC>` | 入金する USDC（10進数形式、例：`100` = 100 USDC）。最低エポック価格を満たす必要があります。 |
| `--source-token-account <PUBKEY>` | カスタム USDC ソースアカウント（デフォルトはウォレットの ATA） |
| `--accept-partial-epoch` | エポック残量の警告をスキップ（下記参照） |
| `--fee-payer <PATH>` | SOL トランザクション手数料に別のウォレットを使用 |
| `--dry-run` | トランザクションを実行せずにシミュレーション |
| `--with-compute-unit-price <PRICE>` | 混雑時に処理を高速化するためのコンピュートユニット価格を設定 |

シートが割り当てられると、デーモンが自動的に GRE トンネルを確立します。接続を確認するには：

```bash
doublezero status
```

### エポックのタイミング

シートは Solana エポック（約 2 日間）ごとに割り当てられます。支払い時に現在のエポックの残り時間が 10% 未満の場合、CLI はシートがすぐに割り当てられるものの、現在のエポックの残り期間のみカバーされることを警告します。次のエポック開始時にエスクローから別途支払いが差し引かれます。

!!! info "シートを失わないよう、1 エポック以上の資金を入金することをお勧めします。エポックの残り時間は[こちら](https://explorer.solana.com/)で確認できます。"

`--accept-partial-epoch` を使用してこの警告をバイパスできます。

### エスクローの資金を維持する

!!! warning "決済時にエスクロー残高がエポック価格を下回っている場合、シートは割り当てられず、トンネルは切断され、蓄積されたテニュアが失われます。テニュアは将来のエポックでの優先順位を決定するため、テニュアを失うと新規参入者として再び競争することになります。"

複数エポック分の資金をこのアカウントに過剰入金することができます。各決済でエスクローから 1 エポック分の価格が差し引かれ、残りの残高は繰り越されます。例えば、エポックあたりの価格の 5 倍を入金すると、再入金なしで最大 5 エポック分シートがアクティブに維持されます。

エスクローに追加入金するには、いつでも `shreds pay` を再度実行してください：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

`Target_IP` はシュレッドを受信するマシンのパブリック IPv4 アドレスである必要があります。ターゲットマシンで `curl -4 ifconfig.me` のようなコマンドを実行して確認できます。

### シートの監視

このセクションでは、CLI を使用してシートを表示する方法を説明します。[https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs) を使用してシートの監視やエスクローアカウントの管理を支援することもできます。

アクティブなシートとエスクロー残高を表示：

**すべてのシート：**

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

出力カラム：`Device Code`、`Client IP`、`Tenure`、`Balance (USDC)`、`Est. Epochs Paid`。

「Est. Epochs Paid」カラムは、現在の価格設定で現在の残高がカバーするエポック数を表示します。価格が変更された場合、この見積もりは調整されます。

### 資金の引き出し

エスクローを閉じ、残りの USDC をウォレットに返金します：

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

リーダーシュレッドと高ステークのリトランスミットシュレッドは、`doublezero1` インターフェースのポート `7733` で到着します。`doublezero0` インターフェースはユニキャストトラフィック用です。ポート `5765` はシュレッドパブリッシャーからのハートビートモニターであり、シュレッドは含まれません。

シュレッド消費において、**IP アドレス** はマルチキャストストリームを識別し、**ポート** はそのストリーム上の UDP サービスを識別します。  
以下のすべてのシュレッドストリームは、`doublezero1` 上の UDP ポート `7733` を使用します。

マルチキャストグループの IP は以下のコマンドで確認できます：

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

### [Edge スコアボード](https://data.malbeclabs.com/dz/shreds/scoreboard)

スコアボードは、スロットレベルのデータを使用して、DoubleZero Edge と他のプロバイダー間のシュレッド配信速度をリアルタイムで比較・ベンチマークします。このダッシュボードを使用して、他のプロバイダーに対する Edge シュレッドの勝率を確認できます。リーダーシュレッドのみの結果や、フルフィード比較を表示できます。また、リージョン別にドリルダウンして期待されるパフォーマンスを確認することもできます。

### [Edge パブリッシャー](https://data.malbeclabs.com/dz/shreds/publishers)

ダッシュボード左上の「Publishing Shreds」メトリクスは、DoubleZero Edge でリーダーシュレッドを公開しているすべての Solana バリデーターの合計ステークウェイト割合を示しています。ネットワーク上の各パブリッシャーの詳細を確認できます。

### [Edge サブスクライバー、デバイス、アクティビティ](https://data.malbeclabs.com/dz/shreds/subscribers)

このページでクライアント IP を簡単に検索し、サブスクリプション済みシートとそのステータスを確認できます。特定のシートサブスクリプションをクリックすると、支払い履歴とアクティビティを表示できます。また、[デバイス](https://data.malbeclabs.com/dz/shreds/devices)ページで利用可能なデバイスを、[アクティビティ](https://data.malbeclabs.com/dz/shreds/activity)ページで最近のすべてのアクティビティを確認できます。

### データ API ドキュメント

データエンドポイントへのプログラムによるアクセスについては、API ドキュメントを参照してください：[https://data.malbeclabs.com/api/v1/docs](https://data.malbeclabs.com/api/v1/docs)。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を実行する前に、既存のチャネルを通じてお問い合わせください。チャネルをお持ちでない場合は、[Discord](https://discord.gg/U2fEb4Jq) で検索し、必要に応じてチケットを作成してください。

### クライアントが最新であることを確認：

実行：`sudo apt update && sudo apt install doublezero-solana`

### エスクロー残高不足

決済時にエスクロー残高がエポック価格を下回っている場合、シートは割り当てられず、トンネルは切断され、テニュアが失われます。次の決済前に `shreds pay` で追加入金してください。

### 支払い後にシートが割り当てられない

- エポック後半に支払った可能性があります — シートは次のエポックから有効になります。
- デバイスのすべてのシートが、より高いテニュアを持つ既存利用者によって占有されている可能性があります。`shreds price` で空きシートを確認してください。
- 決済前に引き出しを行った場合、シートは対象外です。

### トンネルが起動しない

1. デーモンが実行中であることを確認：`sudo systemctl status doublezerod`
2. リコンサイラーが有効であることを確認：`doublezero enable`
3. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、`doublezero1` 上のシュレッドトラフィック、`doublezero0` 上のポート 44880）
4. 現在のエポックでシートがアクティブであることを確認：`doublezero-solana shreds list`
5. 接続状態を確認：`doublezero status`

デーモンのクライアント IP はホストのパブリック IP から自動検出されます。シートコマンドで使用した `--client-ip` と一致していることを確認してください。

### エポック警告プロンプト

エポックの残り時間が 10% 未満の場合、CLI が警告を表示します。選択肢：

- シートをすぐに取得したい場合は `--accept-partial-epoch` で承認
- フルエポック分のカバレッジを得るために次のエポックまで待機

### 「Amount is below the current price」

`pay` コマンドは、最低エポック価格（メトロ基本 + デバイスプレミアム）に対して金額を検証します。`shreds price` で現在の価格を確認し、金額を増やしてください。

### 「Multicast user already exists」

別の経路を通じてアクティブなサブスクリプションが既に存在します。まず `doublezero disconnect` で切断してから、`shreds pay` を再試行してください。