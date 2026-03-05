# その他のマルチキャスト接続
!!! warning "DoubleZeroに接続することで、[DoubleZeroサービス利用規約](https://doublezero.xyz/terms-protocol)に同意します"


|ユースケース | 最初のステップ | 承認後の接続方法：|
|---------|------------|---------------------------|
|Jitoシュレッドストリームをサブスクライブ | 承認のためJitoに連絡 | ```doublezero connect multicast --subscribe jito-shredstream``` |

詳細な接続情報：

### 1. DoubleZeroクライアントのインストール
DoubleZeroクライアントのインストールと設定については、[セットアップ](setup.md)手順に従ってください。

### 2. 接続手順

マルチキャストモードでDoubleZeroに接続します。
パブリッシャーとして：

```doublezero connect multicast --publish <フィード名>```

またはサブスクライバーとして：

```doublezero connect multicast --subscribe <フィード名>```

またはパブリッシュとサブスクライブの両方：

```doublezero connect multicast --publish <フィード名> --subscribe <フィード名>```

複数のフィードをパブリッシュまたはサブスクライブするには、スペースで区切って複数のフィード名を含めることができます。
これを使ってパブリッシュフィードのパブリッシュとサブスクライブにも使用できます。
例：
```doublezero connect multicast --subscribe feed1 feed2 feed3```

以下のような出力が表示されるはずです：
```
DoubleZero Service Provisioning
🔗  Start Provisioning User to devnet...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <your dz_id>
🔍  Provisioning User for IP: <your public ip>
    Creating an account for the IP: <your public ip>
    The Device has been selected: <the doublezero device you are connecting to>
    Service provisioned with status: ok
✅  User Provisioned
```

### 3. アクティブなマルチキャスト接続の確認
60秒待ってから実行します：

```
doublezero status
```
期待される結果：
- 正しいDoubleZeroネットワーク上でBGPセッションが稼働中
- パブリッシャーの場合、DoubleZero IPはTunnel Src IPと異なります。これは正常です。
- サブスクライバーのみの場合、DoubleZero IPはTunnel Src IPと同じになります。

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

接続しているグループを確認します：
```
doublezero user list --client-ip <your ip>
```

|account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
|wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan|
