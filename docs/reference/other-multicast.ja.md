---
description: マルチキャストモードで DoubleZero に接続し、1つ以上のフィードをパブリッシュまたはサブスクライブします。
---

# その他のマルチキャスト接続
!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます"
 
詳細な接続情報: 

### 1. DoubleZero クライアントのインストール
[セットアップ](../setup.md)手順に従って、DoubleZero クライアントをインストールおよび設定してください。

### 2. 接続手順 

マルチキャストモードで DoubleZero に接続します。
パブリッシャーとして: 

```doublezero connect multicast --publish <feed name>```

またはサブスクライバーとして: 

```doublezero connect multicast --subscribe <feed name>```

またはパブリッシュとサブスクライブの両方を行う場合: 

```doublezero connect multicast --publish <feed name> --subscribe <feed name>```

複数のフィードをパブリッシュまたはサブスクライブするには、複数のフィード名をスペース区切りで指定できます。
これは、パブリッシュフィードへのパブリッシュとサブスクライブにも使用できます。
例: 
```doublezero connect multicast --subscribe feed1 feed2 feed3```

以下のような出力が表示されるはずです:
```
⚡  Connecting to devnet...
    DoubleZero ID: <your DoubleZero ID>
⚡  Provisioning for IP: <your public ip>
    Creating account for IP: <your public ip>
    Device selected: <the doublezero device you are connecting to>
✅  User Provisioned
```
### 3. アクティブなマルチキャスト接続を確認します。 
60秒待ってから、以下を実行してください。

```
doublezero status
```
期待される結果:
- 正しい DoubleZero ネットワーク上で BGP セッションが Up であること 
- パブリッシャーの場合、DoubleZero IP は Tunnel Src IP と異なります。これは想定どおりです。
- サブスクライバーのみの場合、`doublezero status` では DoubleZero IP は空白になります。`doublezero user list` で確認できます。

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

接続しているグループを確認します: 
```
doublezero user list --client-ip <your ip>
```

|account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
|wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan|