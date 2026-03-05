# IBRLモードでのDoubleZeroへの非バリデーターPermissioned接続
!!! warning "DoubleZeroに接続することで、[DoubleZeroサービス利用規約](https://doublezero.xyz/terms-protocol)に同意します"

<div data-wizard-step="rpc-onboarding" markdown>

### Permissionedユーザーオンボーディングの概要

現在、非バリデーターとRPCのユーザーオンボーディングはPermissionedされています。Permissionedフローを開始するには、[このフォーム](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)に記入してください。このプロセス中に予想されることは以下の通りです：

- 将来的にPermissionedユーザーの使用に手数料が発生する場合があります。
- フォーム送信後、主要なTelegram連絡先を監視してください。

</div>

### IBRLモードでのメインネットベータおよびテストネット接続

!!! Note inline end
    IBRLモードは既存のパブリックIPアドレスを使用するため、バリデータークライアントの再起動が不要です。

Permissionedユーザーはこのページで詳述するDoubleZeroメインネットベータへの接続を完了します。

## 1. 環境設定

続行する前に[セットアップ](setup.md)手順に従ってください。

セットアップの最後のステップはネットワークから切断することでした。これにより、マシン上のDoubleZeroへのトンネルが1つだけ開いており、そのトンネルが正しいネットワーク上にあることを確認します。

DoubleZeroクライアントCLI（`doublezero`）とデーモン（`doublezerod`）を**DoubleZeroテストネット**に接続するように設定するには：
```bash
DESIRED_DOUBLEZERO_ENV=testnet \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```
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
```
✅ doublezerod configured for environment mainnet-beta
```
次の出力が表示されるはずです：
`
✅ doublezerod configured for environment testnet
`

約30秒後に利用可能なDoubleZeroデバイスが表示されます：

```bash
doublezero latency
```
テストネットの出力例：
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
テストネットの出力は構造が同じですが、利用可能なデバイスが多くなります。


## 2. DoubleZero Foundationへの連絡

DoubleZero Foundationに連絡します。接続元の`DoubleZeroID`、`バリデーターID`（ノードID）、`公開IPv4アドレス`を提供する必要があります。


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. IBRLモードでの接続

DoubleZeroに接続するユーザーで、サーバー上で`connect`コマンドを実行してDoubleZeroへの接続を確立します。

```bash
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
トンネルが完了するまで1分待ちます。トンネルが完了するまで、ステータス出力が「down」または「Unknown」を返す場合があります。

接続を確認します：

```bash
doublezero status
```

**出力：**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
`up`のステータスは正常に接続されていることを意味します。

次のコマンドを実行することでDoubleZero上の他のユーザーによって伝搬されたルートを確認できます：

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

このセットアップを完了してマルチキャストを使用する予定の場合は、[次のページ](Other%20Multicast%20Connection.md)に進んでください。
