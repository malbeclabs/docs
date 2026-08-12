# ShelbyテストネットユーザーのIBRLモードでのDoubleZero接続
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "DoubleZeroに接続することで、[DoubleZeroサービス利用規約](https://doublezero.xyz/terms-protocol)に同意します"

<div data-wizard-step="rpc-onboarding" markdown>

### DoubleZeroIDの取得

`DoubleZeroID`と`公開IPv4アドレス`をこちらの[フォーム](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)で提供する必要があります。


- 将来的にPermissionedユーザーの使用に手数料が発生する場合があります。
- フォーム送信後、主要なTelegram連絡先を監視してください。
- 現時点でShelbyはDoubleZeroテストネットにのみ接続可能です。

</div>

### IBRLモードでのテストネット接続

ShelbyのPermissionedユーザーはDoubleZeroテストネットへの接続を完了します。詳細はこのページに記載されています。

## 1. 環境設定

続行する前に[セットアップ](setup.md)手順に従ってください。

セットアップの最後のステップはネットワークから切断することでした。これにより、マシン上のDoubleZeroへのトンネルが1つだけ開いており、そのトンネルが正しいネットワーク上にあることを確認します。

DoubleZero上のShelbyテナントに接続するようにDoubleZeroクライアントCLI（`doublezero`）を設定するには：
```bash
doublezero config set --tenant shelby
```

Shelby固有の追加ファイアウォールルールを適用します：

iptables:
```
sudo iptables -A INPUT -i doublezero0 -p tcp --dport 39431 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 39431 -j DROP
```

UFW:
```
sudo ufw allow in on doublezero0 to any port 39431 proto tcp
sudo ufw deny in to any port 39431 proto tcp
```

## 2. DoubleZero Foundationへの連絡

DoubleZero Foundationに連絡します。接続元の`DoubleZeroID`と`公開IPv4アドレス`を提供する必要があります。


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
