---
description: DoubleZero シュレッドフィードを受信するためのエッジサブスクライバーのセットアップ（クライアント設定、GRE・BGP・PIM・シュレッドトラフィック用のファイアウォールルールを含む）。
---

# エッジサブスクライバー接続
!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データは内部利用目的に限られ、再送信は禁止されています（セクション 2(e) を参照）。"

## ステップ 1: DoubleZero セットアップ

### 1. セットアップの完了

[Solana CLI](https://docs.anza.xyz/cli/install) をインストールします。

[セットアップ](setup.md)の手順に従い、DoubleZero クライアントをインストール・設定します。

以前に DoubleZero をセットアップ済みの場合は、`sudo apt update && sudo apt install doublezero-solana` で最新の DoubleZero-Solana CLI に更新してください。

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

リコンサイラーはオンチェーンの状態を監視し、シートが割り当てられた際にトンネルを自動的にプロビジョニングします。デフォルトでは有効になっていません。

```bash
doublezero enable
```

---

## ステップ 2: ウォレットの設定

### 1. Solana キーペアの作成

`doublezero-solana` CLI は、オンチェーンのシート管理に標準的な Solana キーペアを使用します。まだ持っていない場合：

```bash
solana-keygen new
```

これにより `~/.config/solana/id.json` に書き込まれます。別のパスを使用するには、任意の `doublezero-solana` コマンドに `--keypair <path>` を渡してください。

ウォレットアドレスを表示：

```bash
solana address
```

### 2. ウォレットへの入金

ウォレットには 2 種類のトークンが必要です：

- **SOL** — Solana トランザクション手数料用。上記で表示されたウォレットアドレスに SOL を送金してください。
- **2Z** — シートの資金用。CLI はメインネット USDC ミント（`xfrsfrvsrf`）のウォレットの関連トークンアカウント（ATA）から引き出します。

---

## ステップ 3: シートの購入

### 1. 最寄りのデバイスを見つける

シートを購入する前に、お使いのマシンから最もレイテンシの低いデバイスを特定します：

```bash
doublezero latency
```

最もレイテンシの低い結果からデバイスコードをメモしてください（例：`<Device_Name>`）。シート購入時に使用します。

### 2. 料金の確認

資金を投入する前に、現在のデバイス料金を確認してください。料金は **ベースメトロ価格** と **デバイスごとのプレミアム** の 2 つのコンポーネントで構成されます。料金と空き状況は[こちら](https://data.doublezero.xyz/dz/shreds/devices)でも確認できます。

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

エポック価格は、そのデバイスのシートの 1 エポックあたりの合計コスト（ベース + プレミアム）です。`--wide` でフル公開鍵を表示、`--json` で JSON 出力を取得できます。

### 3. シートの購入

1 つのコマンドでシートを購入します。シートの初期化、エスクローへの入金、割り当てリクエストを実行します：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**パラメーター：**

| フラグ | 説明 |
|------|-------------|
| `--device <PUBKEY>` | 公開鍵でターゲットデバイスを指定（`--device-code` とは排他） |
| `--device-code <CODE>` | 人間が読めるコードでターゲットデバイスを指定（例：`<Device_Name>`） |
| `--client-ip <IP>` | マシンのパブリック IPv4 アドレス |
| `--amount <USDC>` | 入金する USDC（10 進数形式、例：`100` = 100 USDC）。最低エポック価格を満たす必要があります。 |
| `--source-token-account <PUBKEY>` | カスタム USDC ソースアカウント（デフォルトはウォレットの ATA） |
| `--accept-partial-epoch` | エポック残量警告をスキップ（下記参照） |
| `--fee-payer <PATH>` | SOL トランザクション手数料に別のウォレットを使用 |
| `--dry-run` | トランザクションを実行せずにシミュレーション |
| `--with-compute-unit-price <PRICE>` | 混雑時に高速な取り込みのためにコンピュートユニット価格を設定 |

シートが割り当てられると、デーモンが GRE トンネルを自動的に確立します。接続状況を確認するには：

```bash
doublezero status
```

### エポックのタイミング

シートは Solana エポック単位（約 2 日）で割り当てられます。支払い時に現在のエポックの残り 10% 未満の場合、CLI はシートが即座に割り当てられるものの現在のエポックの残り期間のみカバーされることを警告します。次のエポック開始時に、エスクローから別途支払いが差し引かれます。

!!! info "シートを失わないよう、一度に 1 エポック分以上の資金を入金することをお勧めします。現在のエポックの残り時間は[こちら](https://explorer.solana.com/)で確認できます。"

この警告は `--accept-partial-epoch` でバイパスできます。

### エスクローの残高を維持する

!!! warning "決済時にエスクロー残高がエポック価格を下回っている場合、シートは割り当てられず、トンネルは切断され、蓄積されたテニュア（在席期間）が失われます。テニュアは将来のエポックでの優先度を決定するため、失うと新規参加者として競争し直すことになります。"

このアカウントに多めに入金して複数エポック分を資金供給することができます。各決済でエスクローから 1 エポック分の価格が差し引かれ、残りの残高は繰り越されます。たとえば、エポック単価の 5 倍を入金すれば、再入金なしで最大 5 エポック分シートがアクティブな状態を維持できます。

エスクローを追加入金するには、いつでも `shreds pay` を再実行してください：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

`Target_IP` はシュレッドを受信するマシンのパブリック IPv4 アドレスである必要があります。対象マシンで `curl -4 ifconfig.me` のようなコマンドを実行して確認できます。

### シートの監視

このセクションでは、CLI でシートを確認する方法を説明します。[https://data.malbeclabs.com/api/v1/docs](https://data.doublezero.xyz/api/v1/docs) を使用してシートの監視やエスクローアカウントの管理を支援することもできます。

アクティブなシートとエスクロー残高を表示：

**全シート：**

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

「Est. Epochs Paid」列は、現在の料金設定で現在の残高が何エポック分をカバーするかを示します。料金が変更された場合、この推定値は調整されます。

### シートとエスクローの引き出し

このコマンドはシートを解放し、エスクローをクローズします。現在のエポックの未使用分に対する日割り返金と、残りのエスクロー残高がウォレットに返却されます。シートと蓄積されたテニュアは失われます。

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

他のコマンドと同様に、`--device <PUBKEY>` または `--device-code <CODE>` でデバイスを指定できます。

USDC 返金を別のトークンアカウントに送信する場合：

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "この操作は元に戻せません。引き出し後、シートは失われテニュアはリセットされます。"

---

## シュレッドアドレス（IP とポート）

リーダーシュレッドと高ステークの再送信シュレッドは、`doublezero1` インターフェース上のポート `7733` で到着します。`doublezero0` インターフェースはユニキャストトラフィック用です。ポート `5765` はシュレッドパブリッシャーからのハートビートモニターであり、シュレッドは含まれません。

シュレッド受信において、**IP アドレス**はマルチキャストストリームを識別し、**ポート**はそのストリーム上の UDP サービスを識別します。
以下のシュレッドストリームはすべて `doublezero1` 上の UDP ポート `7733` を使用します。

任意のマルチキャストグループの IP は以下で確認できます：

```bash
doublezero multicast group list
```

### リーダーシュレッド

- `edge-solana-shreds`: `233.84.178.1:7733`

### ルートシュレッド

- `edge-solana-root`: `233.84.178.16:7733`

### 再送信シュレッド

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## GRE トンネルヘッダー — XDP

!!! note "ネットワーク経由で配信されるシュレッドトラフィックは GRE カプセル化されています。既存のパイプライン（例：XDP ベースのデシュレッダー）にデータを投入する前に、GRE ヘッダーを除去する必要がある場合があります。"

---

## ツールとダッシュボード

### [Edge スコアボード](https://data.malbeclabs.com/dz/shreds/scoreboard)

スコアボードは、スロットレベルのデータを使用して DoubleZero Edge と他のプロバイダー間のシュレッド配信速度をベンチマークし、リアルタイムでパフォーマンスを比較します。このダッシュボードを使用して、他のプロバイダーに対する Edge シュレッドの勝率を確認できます。リーダーシュレッドのみの結果に加え、フルフィード比較も表示できます。リージョン別にドリルダウンして、期待されるパフォーマンスを確認することもできます。

### [Edge パブリッシャー](https://data.malbeclabs.com/dz/shreds/publishers)

ダッシュボード左上の「Publishing Shreds」指標は、DoubleZero Edge でリーダーシュレッドを公開しているすべての Solana バリデーターのステークウェイトの合計パーセントを示します。ネットワーク上の各パブリッシャーの詳細を確認できます。

### [Edge サブスクライバー、デバイス、アクティビティ](https://data.malbeclabs.com/dz/shreds/subscribers)

このページでクライアント IP を簡単に検索して、サブスクライブ済みのシートとステータスを確認できます。特定のシートサブスクリプションをクリックすると、支払い履歴とアクティビティを表示できます。[デバイス](https://data.doublezero.xyz/dz/shreds/devices)ページで利用可能なデバイスを、[アクティビティ](https://data.malbeclabs.com/dz/shreds/activity)ページで最近のすべてのアクティビティを確認することもできます。

### データ API ドキュメント

データエンドポイントへのプログラムによるアクセスについては、API ドキュメントを参照してください：[https://data.malbeclabs.com/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試す前に既存のチャネルからお問い合わせください。チャネルをお持ちでない場合は、[Discord](https://discord.gg/U2fEb4Jq) を検索し、必要に応じてチケットを作成してください。

### クライアントが最新であることを確認：

実行：`sudo apt update && sudo apt install doublezero-solana`

### エスクロー残高不足

決済時にエスクロー残高がエポック価格を下回っている場合、シートは割り当てられず、トンネルは切断され、テニュアが失われます。次の決済前に `shreds pay` で追加入金してください。

### 支払い後にシートが割り当てられない

- エポックの後半に支払った可能性があります — シートは次のエポックから有効になります。
- デバイスの全シートがテニュアの高い既存ユーザーに占有されている可能性があります。`shreds price` で空きシートを確認してください。
- 決済前に引き出しを行った場合、シートは対象外でした。

### トンネルが確立しない

1. デーモンが動作していることを確認：`sudo systemctl status doublezerod`
2. リコンサイラーが有効であることを確認：`doublezero enable`
3. ファイアウォールルールが設定されていることを確認（GRE、BGP、PIM、`doublezero1` 上のシュレッドトラフィック、`doublezero0` 上のポート 44880）
4. 現在のエポックでシートがアクティブであることを確認：`doublezero-solana shreds list`
5. 接続状況を確認：`doublezero status`

デーモンのクライアント IP はホストのパブリック IP から自動検出されます — シートコマンドで使用した `--client-ip` と一致していることを確認してください。

### エポック警告プロンプト

エポックの残り 10% 未満の場合、CLI が警告を表示します。選択肢：

- シートを即座に取得したい場合は `--accept-partial-epoch` で承認
- フルエポック分のカバレッジを得るために次のエポックまで待機

### 「Amount is below the current price」

`pay` コマンドは、最低エポック価格（メトロベース + デバイスプレミアム）に対して金額を検証します。`shreds price` で現在の料金を確認し、金額を増やしてください。

### 「Multicast user already exists」

別の経路で既にアクティブなサブスクリプションがあります。まず `doublezero disconnect` で切断してから、`shreds pay` を再試行してください。