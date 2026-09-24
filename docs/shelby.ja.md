---
description: IBRLモードでDoubleZeroに接続するShelbyテストネットユーザー向けの許可制接続ガイド。
---

# Shelby
!!! warning "DoubleZeroに接続することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます"

### DoubleZeroIDの取得

`DoubleZeroID`と`public ipv4 address`をこちらの[フォーム](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)で提出する必要があります。


- 将来的に許可制ユーザーの利用に料金が発生する可能性があります。
- フォーム送信後、主要なTelegram連絡先を確認してください。
- 現時点では、ShelbyはDoubleZeroテストネットにのみ接続可能です。


### テストネットへのIBRLモードでの接続

Shelby許可制ユーザーは、このページで詳細に説明されているDoubleZeroテストネットへの接続を完了します。

## 1. 環境設定

続行する前に、[セットアップ](setup.md)手順に従ってください。

セットアップの最後のステップはネットワークからの切断でした。これは、DoubleZeroへのトンネルがマシン上で1つだけ開かれ、そのトンネルが正しいネットワーク上にあることを確認するためです。

DoubleZeroクライアントCLI（`doublezero`）をDoubleZero上のShelbyテナントに接続するように設定するには：
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

DoubleZero Foundationに連絡してください。接続元の`DoubleZeroID`と`public ipv4 address`を提供する必要があります。


## 3. IBRLモードでの接続

サーバー上で、DoubleZeroに接続するユーザーとして`connect`コマンドを実行し、DoubleZeroへの接続を確立します。

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
トンネルが完了するまで1分間お待ちください。トンネルが完了するまで、ステータス出力が「down」または「Unknown」を返す場合があります。

接続を確認します：

```bash
doublezero status
```

**出力：**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
ステータスが`up`であれば、正常に接続されています。

DoubleZero上の他のユーザーによって伝播されたルートを確認するには、以下を実行します：

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