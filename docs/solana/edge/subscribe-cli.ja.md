---
description: DoubleZero シュレッドフィードを受信するためのエッジサブスクライバーのセットアップ方法。クライアントセットアップおよび GRE、BGP、PIM、シュレッドトラフィック用のファイアウォールルールを含みます。
---

# エッジサブスクライバー接続 (CLI)

!!! warning "レガシー CLI サブスクリプション — **2026年8月30日**に廃止"
    このページは、既に **CLI / オンチェーンシート**サブスクリプション（`doublezero-solana shreds pay`）を使用しているユーザー向けです。このシステムは**2026年8月30日**に廃止されます。

    新規サブスクリプションは [Subscribe to shreds (Edge)](subscribe.md) のポータルフローを使用してください。

!!! warning "DoubleZero に接続することで、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データはお客様の内部目的のみに使用でき、再送信することはできません（セクション 2(e) を参照）。"

## ステップ 1: DoubleZero セットアップ

### 1. セットアップの完了

[Solana CLI](https://docs.anza.xyz/cli/install) をインストールします。

[セットアップ](../../setup.md)の手順に従い、DoubleZero クライアントをインストールおよび設定します。

以前に DoubleZero をセットアップしたことがある場合は、`sudo apt update && sudo apt install doublezero-solana` で最新の DoubleZero-Solana CLI をお持ちであることを確認してください。

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
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

UFW には `pim` プロトコルがありません。アウトバウンド PIM は UFW のデフォルトの送信ポリシーにより許可されます。送信トラフィックを拒否している場合は、`/etc/ufw/before.rules` に PIM 用の raw ルールを追加してください。

### 3. リコンサイラーの有効化

リコンサイラーはオンチェーンの状態を監視し、シートが割り当てられると自動的にトンネルをプロビジョニングします。デフォルトでは有効になっていません。

```bash
doublezero enable
```

---

## ステップ 2: ウォレットのセットアップ

### 1. Solana キーペアの作成

`doublezero-solana` CLI は、オンチェーンシート管理に標準的な Solana キーペアを使用します。お持ちでない場合：

```bash
solana-keygen new
```

これは `~/.config/solana/id.json` に書き込まれます。別のパスを使用するには、`doublezero-solana` コマンドに `--keypair <path>` を渡してください。

ウォレットアドレスを表示します：

```bash
solana address
```

### 2. ウォレットへの資金追加

ウォレットには2つのトークンが必要です：

- **SOL** — Solana のトランザクション手数料用。上記で表示されたウォレットアドレスに SOL を送金してください。
- **USDC** — シートの資金用。CLI はメインネット USDC ミント（`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`）のウォレットの Associated Token Account (ATA) から引き出します。

---

## ステップ 3: シートの購入

### 1. 最寄りのデバイスを見つける

シートを購入する前に、お使いのマシンからレイテンシーが最も低いデバイスを特定します：

```bash
doublezero latency
```

最もレイテンシーが低い結果のデバイスコード（例: `<Device_Name>`）をメモしてください。シートの購入時に使用します。

### 2. 価格の確認

資金を投入する前に、現在のデバイス価格を確認します。価格は2つの要素で構成されます：**基本メトロ価格**と**デバイスごとのプレミアム**。価格と空き状況は[こちら](https://data.doublezero.xyz/dz/shreds/devices)でも確認できます。

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

出力列: `Device Code`、`Metro Code`、`Metro Name`、`Status`、`Settled Seats`、`Available Seats`、`Base Price (USDC)`、`Premium (USDC)`、`Epoch Price (USDC)`。

エポック価格は、そのデバイスのシートあたりのエポックごとの合計コスト（基本 + プレミアム）です。`--wide` を使用すると完全な公開鍵が表示され、`--json` を使用すると JSON 出力になります。

### 3. シートの購入

1つのコマンドでシートを購入します。これにより、シートの初期化、エスクローへの資金投入、および割り当てリクエストが行われます：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**パラメータ：**

| フラグ | 説明 |
|------|-------------|
| `--device <PUBKEY>` | 公開鍵でターゲットデバイスを指定（`--device-code` と排他） |
| `--device-code <CODE>` | 人が読める形式のコードでターゲットデバイスを指定（例: `<Device_Name>`） |
| `--client-ip <IP>` | お使いのマシンのパブリック IPv4 アドレス |
| `--amount <USDC>` | 投入する USDC（小数形式、例: `100` = 100 USDC）。最低エポック価格を満たす必要があります。 |
| `--source-token-account <PUBKEY>` | カスタム USDC ソースアカウント（デフォルトはウォレットの ATA） |
| `--accept-partial-epoch` | エポック残量の警告をスキップ（以下を参照） |
| `--fee-payer <PATH>` | SOL トランザクション手数料に別のウォレットを使用 |
| `--dry-run` | トランザクションを実行せずにシミュレーション |
| `--with-compute-unit-price <PRICE>` | 混雑時により速い取り込みのためにコンピュートユニット価格を設定 |

シートが割り当てられると、デーモンが自動的に GRE トンネルを確立します。接続を確認するには：

```bash
doublezero status
```

### エポックのタイミング

シートは Solana エポック（約2日）ごとに割り当てられます。支払い時に現在のエポックの残りが 10% 未満の場合、CLI はシートが即座に割り当てられるが現在のエポックの残り期間のみカバーすることを警告します。次のエポックが開始されると、エスクローから別途支払いが引き落とされます。

!!! info "シートを失わないよう、一度に1エポック以上の資金を投入することをお勧めします。現在のエポックの残り時間は[こちら](https://explorer.solana.com/)で確認できます。"

`--accept-partial-epoch` を使用することで、この警告をバイパスできます。

### エスクローの資金を維持する

!!! warning "決済時にエスクロー残高がエポック価格を下回っている場合、シートは割り当てられず、トンネルは切断され、蓄積されたテニュアを失います。テニュアは将来のエポックでの優先度を決定するため、失うと新規参入者として再度競争することになります。"

複数エポック分の資金を投入することも可能です。各決済でエスクローから1エポック分の価格が差し引かれ、残りの残高は繰り越されます。例えば、エポックあたりの価格の5倍を投入すると、再投入なしで最大5エポック分シートがアクティブに維持されます。

エスクローを追加するには、いつでも `shreds pay` を再度実行してください：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

`Target_IP` はシュレッドを受信するマシンのパブリック IPv4 アドレスである必要があります。ターゲットマシンで `curl -4 ifconfig.me` のようなコマンドを実行して確認できます。

### シートの監視

このセクションでは、CLI を使用してシートを表示する方法について説明します。[https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs) を使用してシートの監視やエスクローアカウントの管理を行うこともできます。

アクティブなシートとエスクロー残高を表示します：

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

出力列: `Device Code`、`Client IP`、`Tenure`、`Balance (USDC)`、`Est. Epochs Paid`。

「Est. Epochs Paid」列は、現在の価格で現在の残高が何エポック分カバーするかを示します。価格が変更された場合、この推定値は調整されます。

### シートとエスクローの引き出し

このコマンドはシートを解放し、エスクローを閉鎖します。現在のエポックの未使用分の日割り返金と残りのエスクロー残高がウォレットに返金されます。シートと蓄積されたテニュアは失われます。

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

他のコマンドと同様に、`--device <PUBKEY>` または `--device-code <CODE>` のいずれかでデバイスを指定できます。

USDC の返金を別のトークンアカウントに送信するには：

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "この操作は取り消せません。引き出し後、シートは失われ、テニュアはリセットされます。"

---

## シュレッドアドレス（IP とポート）

リーダーシュレッドと高ステークのリトランスミットシュレッドは、`doublezero1` インターフェース上のポート `7733` で到着します。`doublezero0` インターフェースはユニキャストトラフィック用です。ポート `5765` はシュレッドパブリッシャーからのハートビートモニターであり、シュレッドは含まれません。

シュレッドの受信において、**IP アドレス**はマルチキャストストリームを識別し、**ポート**はそのストリーム上の UDP サービスを識別します。  
以下のすべてのシュレッドストリームは、`doublezero1` 上の UDP ポート `7733` を使用します。

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

!!! note "ネットワーク経由で配信されるシュレッドトラフィックは GRE カプセル化されています。既存のパイプライン（例: XDP ベースのデシュレッダー）にデータを供給する前に、GRE ヘッダーを除去する必要がある場合があります。"

---

## ツールとダッシュボード

### [Edge スコアボード](https://data.doublezero.xyz/dz/shreds/scoreboard)

スコアボードは、スロットレベルのデータを使用して DoubleZero Edge と他のプロバイダー間のシュレッド配信速度をベンチマークし、リアルタイムでパフォーマンスを比較します。このダッシュボードを使用して、他のプロバイダーに対する Edge シュレッドの勝率を確認できます。リーダーシュレッドのみの結果や、フルフィード比較も表示可能です。また、リージョンごとにドリルダウンして期待されるパフォーマンスを確認することもできます。

### [Edge パブリッシャー](https://data.doublezero.xyz/dz/shreds/publishers)

ダッシュボードの左上にある「Publishing Shreds」メトリックは、DoubleZero Edge でリーダーシュレッドを公開しているすべての Solana バリデータの合計ステークウェイトのパーセンテージを示します。ネットワーク上の各パブリッシャーの詳細を確認できます。

### [Edge サブスクライバー、デバイス、アクティビティ](https://data.doublezero.xyz/dz/shreds/subscribers)

このページでクライアント IP を検索して、サブスクライブしているシートの状態を確認できます。特定のシートサブスクリプションをクリックすると、支払い履歴とアクティビティを表示できます。利用可能なデバイスは[デバイス](https://data.doublezero.xyz/dz/shreds/devices)ページで、最近のすべてのアクティビティは[アクティビティ](https://data.doublezero.xyz/dz/shreds/activity)ページで確認できます。

### Data API ドキュメント

データエンドポイントへのプログラマティックアクセスについては、API ドキュメントを参照してください: [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)。

---

## トラブルシューティング

ここに記載されていない問題が発生した場合は、回避策を試みる前に既存のチャネルを通じてお問い合わせください。チャネルがない場合は、[Discord](https://discord.gg/U2fEb4Jq) を検索し、必要に応じてチケットを作成してください。

### クライアントが最新であることを確認する：

実行: `sudo apt update && sudo apt install doublezero-solana`

### エスクロー残高不足

決済時にエスクロー残高がエポック価格を下回っている場合、シートは割り当てられず、トンネルは切断され、テニュアは失われます。次の決済前に `shreds pay` で追加してください。

### 支払い後にシートが割り当てられない

- エポックの終盤に支払った可能性があります — シートは次のエポックから有効になります。
- デバイス上のすべてのシートが、より高いテニュアの既存ユーザーによって占有されている可能性があります。`shreds price` で空きシートを確認してください。
- 決済前に引き出した場合、シートは対象外でした。

### トンネルが確立されない

1. デーモンが実行中か確認: `sudo systemctl status doublezerod`
2. リコンサイラーが有効か確認: `doublezero enable`
3. ファイアウォールルールが設定されているか確認（GRE、BGP、PIM、`doublezero1` 上のシュレッドトラフィック、`doublezero0` 上のポート 44880）
4. 現在のエポックでシートがアクティブか確認: `doublezero-solana shreds list`
5. 接続ステータスを確認: `doublezero status`

デーモンのクライアント IP はホストのパブリック IP から自動検出されます — シートコマンドで使用した `--client-ip` と一致しているか確認してください。

### エポック警告プロンプト

エポックの残りが 10% 未満の場合、CLI は警告を表示します。選択肢：

- シートを即座に取得したい場合は `--accept-partial-epoch` で承認
- フルエポックのカバレッジを得るために次のエポックまで待つ

### 「Amount is below the current price」

`pay` コマンドは、最低エポック価格（メトロ基本 + デバイスプレミアム）に対して金額を検証します。`shreds price` で現在の価格を確認し、金額を増やしてください。

### 「Multicast user already exists」

別のパスを通じてアクティブなサブスクリプションが既に存在します。まず `doublezero disconnect` で切断してから、`shreds pay` を再試行してください。