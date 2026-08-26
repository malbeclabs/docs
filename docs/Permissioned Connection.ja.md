---
description: IBRL モードで DoubleZero Mainnet-Beta および Testnet に接続する非バリデーターおよび RPC 向けの許可制オンボーディング。
---

# IBRL モードでの非バリデーター許可制 DoubleZero 接続
!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます"

<div data-wizard-step="rpc-onboarding" markdown>

### 許可制ユーザーオンボーディングの概要

現在、非バリデーターおよび RPC のユーザーオンボーディングは許可制となっています。許可制フローを開始するには、[こちらのフォーム](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)にご記入ください。このプロセスで予想される事項は以下の通りです：

- 将来、許可制ユーザーの利用に料金が発生する場合があります。
- フォーム送信後、主要な Telegram 連絡先をご確認ください。

</div>

### IBRL モードでの Mainnet-Beta および Testnet への接続

!!! Note inline end
    IBRL モードでは、既存のパブリック IP アドレスを使用するため、バリデータークライアントの再起動は不要です。

許可制ユーザーは、このページで詳述される DoubleZero Mainnet-beta への接続を完了します。

## 1. クライアントネットワークの確認

先に進む前に、[セットアップ](setup.md)の手順に従ってください。接続したいネットワーク向けの Mainnet-Beta または Testnet パッケージをインストールしてください — それぞれ異なるパッケージリポジトリを使用します。

セットアップの最後のステップはネットワークからの切断でした。これは、マシン上で DoubleZero へのトンネルが1つだけ開いており、そのトンネルが正しいネットワークに接続されていることを確認するためです。

以下のコマンドで確認してください：

```bash
doublezero status
```

`Network` 列が参加予定のネットワークと一致していることを確認してください。一致しない場合は、[トラブルシューティング](troubleshooting.md#issue-wrong-doublezero-environment)のコピー＆ペースト切り替えを使用してください。

約30秒後に、利用可能な DoubleZero デバイスが表示されます：

```bash
doublezero latency
```
出力例（Testnet）
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
Testnet の出力は構造的には同一ですが、利用可能なデバイスがさらに多く表示されます。

## 2. DoubleZero Foundation への連絡

DoubleZero Foundation に連絡してください。`DoubleZeroID`、`Validator ID`（ノード ID）、および接続元の `public ipv4 address` を提供する必要があります。


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. IBRL モードで接続

サーバー上で、DoubleZero に接続するユーザーとして `connect` コマンドを実行し、DoubleZero への接続を確立します。

```bash
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
トンネルが完了するまで1分間お待ちください。トンネルが完了するまで、ステータス出力は「down」または「Unknown」を返す場合があります。

接続を確認してください：

```bash
doublezero status
```

**出力：**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
ステータスが `up` であれば、正常に接続されています。

以下のコマンドを実行することで、DoubleZero 上の他のユーザーによって伝播されたルートを確認できます：

```
ip route
```
出力：

```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100 
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
...
```

</div>

### 次のステップ：マルチキャスト

このセットアップが完了し、マルチキャストの使用を予定している場合は、[次のページ](Other%20Multicast%20Connection.md)に進んでください。