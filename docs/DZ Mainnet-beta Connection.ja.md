---
description: Solana Mainnet-Beta バリデーターと最大3台のバックアップを IBRL モードで DoubleZero に接続する方法（ID証明と接続リクエストを含む）。
---

# バリデーター Mainnet-Beta 接続（IBRL モード）
!!! warning "DoubleZero に接続することで、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます"



###  Mainnet-Beta への IBRL モード接続

!!! Note inline end
    IBRL モードでは、既存のパブリック IP アドレスを使用するため、バリデータークライアントの再起動は不要です。

Solana Mainnet バリデーターは、このページで詳述する DoubleZero Mainnet-beta への接続を完了します。

各 Solana バリデーターは固有の **identity keypair** を持っています。ここから **ノード ID** として知られる公開鍵を抽出します。これは Solana ネットワーク上でのバリデーターの一意な識別子です。

DoubleZeroID とノード ID を特定したら、マシンの所有権を証明します。これは、バリデーターの identity key で署名された DoubleZeroID を含むメッセージを作成することで行います。生成された暗号署名は、バリデーターを管理していることの検証可能な証明として機能します。

最後に、**DoubleZero への接続リクエスト** を送信します。このリクエストは次のことを伝えます：*「これが私の ID であり、これが所有権の証明であり、これが接続方法です。」* DoubleZero はこの情報を検証し、証明を受け入れ、DoubleZero 上でバリデーターのネットワークアクセスをプロビジョニングします。

このガイドでは、1台のプライマリバリデーターの登録と、同時に最大3台のバックアップ/フェイルオーバーマシンの登録が可能です。

## 前提条件

- Solana CLI がインストールされ、$PATH に設定されていること
- バリデーターの場合：sol ユーザーでバリデーター identity keypair ファイル（例：validator-keypair.json）にアクセスする権限があること
- バリデーターの場合：接続する Solana バリデーターの Identity key に少なくとも 1 SOL があることを確認すること
- ファイアウォールルールで、DoubleZero および Solana RPC に必要なアウトバウンド接続が許可されていること。
 GRE (ip proto 47) および BGP (169.254.0.0/16 on tcp/179) を含む

!!! info
    バリデーター ID は Solana gossip と照合され、ターゲット IP が決定されます。ターゲット IP と DoubleZero ID は、マシンとターゲット DoubleZero デバイス間の GRE トンネルを開く際に使用されます。

    注意：同じ IP にジャンク ID とプライマリ ID がある場合、マシンの登録にはプライマリ ID のみが使用されます。これは、ジャンク ID が gossip に表示されないため、ターゲットマシンの IP の検証に使用できないためです。

## 1. クライアントネットワークの確認

先に進む前に、[セットアップ](setup.md)の手順に従ってください。**Mainnet-Beta** パッケージをインストールしてください — Testnet と Mainnet-Beta は異なるパッケージリポジトリを使用します。

セットアップの最後のステップはネットワークからの切断でした。これは、マシン上で DoubleZero へのトンネルが1つだけ開かれ、そのトンネルが正しいネットワーク上にあることを確認するためです。

クライアントが mainnet-beta 上にあることを確認します：

```bash
doublezero status
```

`Network` 列が `mainnet-beta` であることを確認してください。`testnet` の場合、または誤ったパッケージをインストールした場合は、[トラブルシューティング](troubleshooting.md#issue-wrong-doublezero-environment)のコピーペースト切り替え手順を使用してください。

約30秒後に、利用可能な DoubleZero デバイスが表示されます：

```bash
doublezero latency
```
出力例（Mainnet-Beta）
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
Testnet の出力も構造は同じですが、デバイス数が少なくなります。

## 2. ポート 44880 の開放

一部の[ルーティング機能](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md)を利用するには、ポート 44880 を開放する必要があります。

ポート 44880 を開放するには、IP テーブルを以下のように更新します：

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

`-i doublezero0`、`-o doublezero0` フラグにより、このルールは DoubleZero インターフェースにのみ制限されることに注意してください。

または UFW を使用する場合：

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

`in on doublezero0`、`out on doublezero0` フラグにより、このルールは DoubleZero インターフェースにのみ制限されることに注意してください。

## 3. バリデーター所有権の証明

<div data-wizard-step="mainnet-find-validator" markdown>

DoubleZero 環境が設定されたので、バリデーターの所有権を証明します。

プライマリバリデーターの[セットアップ](setup.md)で作成した DoubleZero ID は、すべてのバックアップマシンで使用する必要があります。

プライマリマシンの ID は `doublezero address` で確認できます。同じ ID がクラスター内のすべてのマシンの `~/.config/doublezero/id.json` に存在している必要があります。

これを行うには、まずコマンドを実行しているマシンが**プライマリバリデーター**であることを確認します：

```
doublezero-solana passport find-validator -u mainnet-beta
```

これにより、バリデーターが gossip に登録されており、リーダースケジュールに表示されていることが検証されます。

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
    1台でも複数台でも同じワークフローを使用します。
    1台のマシンのみを登録する場合は、このページのすべてのコマンドから引数 "--backup-validator-ids" または "backup_ids=" を除外してください。

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
この出力は想定通りです。バックアップノードはパス作成時にリーダースケジュールに含まれていてはなりません。

**プライマリバリデーター**の投票アカウントと identity を使用する予定の**すべてのバックアップマシン**でこのコマンドを実行してください。

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### 接続の準備

**プライマリバリデーター**マシンで以下のコマンドを実行します。これは、アクティブなステークを持ち、リーダースケジュールに含まれ、コマンドを実行しているマシン上の solana gossip にプライマリバリデーター ID が存在するマシンです：

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
このコマンドの最後に出力される内容に注目してください。これが次のステップの構造になります。

</div>

## 4. 署名の生成

<div data-wizard-step="mainnet-sign-message" markdown>

前のステップの最後に、`solana sign-offchain-message` のフォーマット済み出力を受け取りました。

上記の出力を使用して、**プライマリバリデーター**マシンでこのコマンドを実行します。

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

## 5. DoubleZero への接続リクエストの開始

<div data-wizard-step="mainnet-request-access" markdown>

`request-validator-access` コマンドを使用して、接続リクエスト用のアカウントを Solana 上に作成します。DoubleZero Sentinel エージェントが新しいアカウントを検出し、ID と署名を検証し、サーバーが接続を確立できるように DoubleZero 内にアクセスパスを作成します。


ノード ID、DoubleZeroID、および署名を使用します。

!!! note inline end
      この例では、バリデーター Identity を見つけるために `-k /home/user/.config/solana/id.json` を使用しています。ローカルデプロイメントに適切なパスを使用してください。

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**出力：**

この出力は、Solana エクスプローラーでトランザクションを確認するために使用できます。エクスプローラーを mainnet に切り替えてください。この検証は任意です。

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

成功すると、DoubleZero はプライマリとそのバックアップを登録します。アクセスパスに登録された IP 間でフェイルオーバーが可能になります。この方法で登録されたバックアップノードに切り替える際、DoubleZero は自動的に接続を維持します。

</div>

## 6. IBRL モードでの接続

<div data-wizard-step="mainnet-connect-ibrl" markdown>

サーバー上で、DoubleZero に接続するユーザーとして `connect` コマンドを実行し、DoubleZero への接続を確立します。

```
doublezero connect ibrl
```

以下のようなプロビジョニングを示す出力が表示されるはずです：

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
GRE トンネルのセットアップが完了するまで1分間お待ちください。GRE トンネルのセットアップが完了するまで、ステータス出力が "down" または "Unknown" を返す場合があります。

接続を確認します：

```bash
doublezero status
```

**出力：**
!!! note inline end
    この出力を確認してください。`Tunnel src` と `DoubleZero IP` がマシンのパブリック IPv4 アドレスと一致していることに注目してください。
    <!--`Tunnel dst` は接続先の DZ デバイスのアドレスです。-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```
ステータスが `up` であれば、正常に接続されています。

DoubleZero 上の他のユーザーによって伝播されたルートを以下のコマンドで確認できます：

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

### 次のステップ：マルチキャストによるシュレッドの配信

このセットアップが完了し、マルチキャストによるシュレッドの配信を計画している場合は、[次のページ](Validator%20Multicast%20Connection.md)に進んでください。