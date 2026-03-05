# IBRLモードでのバリデーターメインネットベータ接続
!!! warning "DoubleZeroに接続することで、[DoubleZeroサービス利用規約](https://doublezero.xyz/terms-protocol)に同意します"



### IBRLモードでのメインネットベータ接続

!!! Note inline end
    IBRLモードは既存のパブリックIPアドレスを使用するため、バリデータークライアントの再起動が不要です。

SolanaメインネットバリデーターはDoubleZeroメインネットベータへの接続を完了します。詳細はこのページに記載されています。

各Solanaバリデーターには独自の**アイデンティティキーペア**があります。そこから**ノードID**として知られる公開鍵を抽出します。これはSolanaネットワーク上のバリデーターの一意のフィンガープリントです。

DoubleZeroIDとノードIDが特定されると、マシンの所有権を証明します。これは、DoubleZeroIDを含むメッセージをバリデーターのアイデンティティキーで署名することによって行われます。生成された暗号署名は、バリデーターを制御していることの検証可能な証明として機能します。

最後に、**DoubleZeroへの接続リクエストを送信**します。このリクエストは「*こちらが私のアイデンティティ、こちらが所有権の証明、そしてこちらが接続方法です。*」というメッセージを伝えます。DoubleZeroはこの情報を検証し、証明を受け入れ、DoubleZero上のバリデーターのネットワークアクセスをプロビジョニングします。

このガイドでは、1台のプライマリバリデーターが自身を登録し、同時に最大3台のバックアップ/フェイルオーバーマシンを登録できます。

## 前提条件

- Solana CLIがインストールされ、$PATHに設定されていること
- バリデーターの場合：solユーザー下のバリデーターアイデンティティキーペアファイル（例：validator-keypair.json）にアクセスする権限
- バリデーターの場合：接続するSolanaバリデーターのアイデンティティキーに少なくとも1 SOLがあることを確認
- ファイアウォールルールがDoubleZeroとSolana RPCのアウトバウンド接続を許可していること（GRE（ipプロト47）とBGP（169.254.0.0/16のtcp/179）を含む）

!!! info
    バリデーターIDはSolanaゴシップに対して確認され、ターゲットIPが決定されます。ターゲットIPとDoubleZero IDは、マシンとターゲットDoubleZeroデバイス間のGREトンネルを開く際に使用されます。

    注意：同じIPにジャンクIDとプライマリIDがある場合、マシンの登録にはプライマリIDのみが使用されます。これはジャンクIDがゴシップに表示されず、ターゲットマシンのIPを確認するために使用できないためです。

## 1. 環境設定

続行する前に[セットアップ](setup.md)手順に従ってください。

セットアップの最後のステップはネットワークから切断することでした。これにより、マシン上のDoubleZeroへのトンネルが1つだけ開いており、そのトンネルが正しいネットワーク上にあることを確認します。

<div data-wizard-step="mainnet-env-config" markdown>

DoubleZeroクライアントCLI（`doublezero`）とデーモン（`doublezerod`）を**DoubleZeroメインネットベータ**に接続するように設定するには：
```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

次の出力が表示されるはずです：
`
✅ doublezerod configured for environment mainnet-beta
`

約30秒後に利用可能なDoubleZeroデバイスが表示されます：

```bash
doublezero latency
```
メインネットベータの出力例：
```bash
 pubkey                                       | code          | ip              | min      | max      | avg      | reachable
 2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.74ms   | 1.92ms   | 1.84ms   | true
 ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.88ms   | 4.39ms   | 2.72ms   | true
 8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.45ms   | 3.30ms   | 2.74ms   | true
 8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.88ms   | 5.13ms   | 3.02ms   | true
 uzyg9iYw2FEbtdTHaDb5HoeEWYAPRPQgvsgyd873qPS  | nyc001-dz002  | 4.42.212.122    | 3.17ms   | 3.63ms   | 3.33ms   | true
 FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.33ms   | 5.46ms   | 3.39ms   | true
 9oKLaL6Hwno5TyAFutTbbkNrzxm1fw9fhzkiUHgsxgGx | dz-dc10-sw01  | 137.239.200.186 | 6.84ms   | 7.01ms   | 6.91ms   | true
 DESzDP8GkSTpQLkrUegLkt4S2ynGfZX5bTDzZf3sEE58 | was001-dz002  | 38.88.214.133   | 7.39ms   | 7.44ms   | 7.41ms   | true
 HHNCpqB7CwHVLxAiB1S86ko6gJRzLCtw78K1tc7ZpT5P | was001-dz001  | 66.198.11.74    | 7.67ms   | 7.85ms   | 7.76ms   | true
 9LFtjDzohKvCBzSquQD4YtL3HwuvkKBDE7KSzb8ztV2b | dz-mtl11-sw01 | 134.195.161.10  | 9.88ms   | 10.01ms  | 9.95ms   | true
 9M7FfYYyjM4wGinKPofZRNmQFcCjCKRbXscGBUiXvXnG | dz-tor1-sw01  | 209.42.165.10   | 14.52ms  | 14.53ms  | 14.52ms  | true
```
テストネットの出力は構造が同じですが、デバイス数が少なくなります。

</div>

## 2. ポート44880を開く

一部の[ルーティング機能](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md)を利用するには、ユーザーはポート44880を開く必要があります。

ポート44880を開くには、例えば次のようにIPテーブルを更新できます：

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

このルールをDoubleZeroインターフェースのみに制限する`-i doublezero0`、`-o doublezero0`フラグに注意してください。

またはUFWの場合：

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

このルールをDoubleZeroインターフェースのみに制限する`in on doublezero0`、`out on doublezero0`フラグに注意してください。

## 3. バリデーター所有権の証明

<div data-wizard-step="mainnet-find-validator" markdown>

DoubleZero環境が設定されたので、バリデーター所有権の証明を行います。

プライマリバリデーターの[セットアップ](setup.md)で作成したDoubleZero IDをすべてのバックアップマシンで使用する必要があります。

プライマリマシンのIDは`doublezero address`で確認できます。同じIDがクラスター内のすべてのマシンの`~/.config/doublezero/id.json`に必要です。

これを実現するために、まずコマンドを実行しているマシンが**プライマリバリデーター**であることを次のコマンドで確認します：

```
doublezero-solana passport find-validator -u mainnet-beta
```

これにより、バリデーターがゴシップに登録され、リーダースケジュールに表示されることを確認します。

期待される出力：

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 11.11.11.111
Validator ID: ValidatorIdentity111111111111111111111111111
Gossip IP: 11.11.11.111
In Leader scheduler
✅ This validator can connect as a primary in DoubleZero 🖥️  💎. It is a leader scheduled validator.
```

!!! info
    同じワークフローが1台でも複数台のマシンでも使用されます。
    1台のマシンを登録する場合は、このページのコマンドから"--backup-validator-ids"または"backup_ids="引数を除外してください。

次に、**プライマリバリデーター**を実行する予定のすべてのバックアップマシンで以下を実行します：
```
doublezero-solana passport find-validator -u mainnet-beta
```

期待される出力：

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
この出力は正常です。バックアップノードはパス作成時にリーダースケジュールに含まれることができません。

次に、**プライマリバリデーター**の投票アカウントとアイデンティティを使用する予定の**すべてのバックアップマシン**でこのコマンドを実行します。

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### 接続の準備

**プライマリバリデーター**マシンで次のコマンドを実行します。これはコマンドを実行しているマシンのSolanaゴシップに、プライマリバリデーターIDを持つアクティブなステークがあり、リーダースケジュールに含まれているマシンです：

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


出力例：

```
DoubleZero Passport - Prepare Validator Access Request
Connected to Solana: mainnet-beta

Primary validator 🖥️  💎:
  ID: ValidatorIdentity111111111111111111111111111
  Gossip: ✅ OK 11.11.11.111)
  Leader scheduler: ✅ OK (Stake: 1,050,000.00 SOL)

Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity222222222222222222222222222
  Gossip: ✅ OK (22.22.22.222)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity333333333333333333333333333
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


  Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity444444444444444444444444444
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)

  To request access, sign the following message with your validator's identity key:

  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>

```
このコマンドの最後の出力に注意してください。次のステップの構造になっています。

</div>

## 4. 署名の生成

<div data-wizard-step="mainnet-sign-message" markdown>

前のステップの最後に、`solana sign-offchain-message`のための事前フォーマットされた出力を受け取りました。

上記の出力から**プライマリバリデーター**マシンでこのコマンドを実行します。

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**出力：**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```

</div>

## 5. DoubleZeroでの接続リクエストの開始

<div data-wizard-step="mainnet-request-access" markdown>

`request-validator-access`コマンドを使用して、接続リクエストのためにSolana上にアカウントを作成します。DoubleZero Sentinelエージェントが新しいアカウントを検出し、アイデンティティと署名を検証し、サーバーが接続を確立できるようにDoubleZeroにアクセスパスを作成します。


ノードID、DoubleZeroID、署名を使用します。

!!! note inline end
      この例では`-k /home/user/.config/solana/id.json`を使用してバリデーターアイデンティティを見つけます。ローカルデプロイメントの適切な場所を使用してください。

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**出力：**

この出力はSolanaエクスプローラーでトランザクションを確認するために使用できます。エクスプローラーをメインネットに変更することを忘れずに。この確認はオプションです。

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

成功した場合、DoubleZeroはプライマリをバックアップとともに登録します。アクセスパスに登録されたIPの間でフェイルオーバーできるようになります。DoubleZeroはこのように登録されたバックアップノードへの切り替え時に接続を自動的に維持します。

</div>

## 6. IBRLモードでの接続

<div data-wizard-step="mainnet-connect-ibrl" markdown>

DoubleZeroに接続するユーザーで、サーバー上で`connect`コマンドを実行してDoubleZeroへの接続を確立します。

```
doublezero connect ibrl
```

以下のようなプロビジョニングを示す出力が表示されます：

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.184.101.183 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
🔍  Provisioning User for IP: 137.184.101.183
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
✅  User Provisioned
```
GREトンネルのセットアップが完了するまで1分待ちます。GREトンネルのセットアップが完了するまで、ステータス出力が「down」または「Unknown」を返す場合があります。

接続を確認します：

```bash
doublezero status
```

**出力：**
!!! note inline end
    この出力を確認してください。`Tunnel src`と`DoubleZero IP`がマシンのパブリックIPv4アドレスと一致していることに注意してください。

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```
`up`のステータスは正常に接続されていることを意味します。

次のコマンドを実行することでDoubleZero上の他のユーザーによって伝搬されたルートを確認できます：

```
ip route
```


```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```

</div>

### 次のステップ：マルチキャストによるシュレッドの公開

このセットアップを完了してマルチキャストでシュレッドを公開する予定の場合は、[次のページ](Validator%20Multicast%20Connection.md)に進んでください。
