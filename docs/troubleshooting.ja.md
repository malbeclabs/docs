# トラブルシューティング

このガイドではさまざまな問題を取り上げており、継続的に更新されています。ガイドを完了した後にさらなるサポートが必要な場合は、[DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701) Discordにてご支援を求めることができます。


## 共通コマンドと出力

まず、以下のコマンドの出力と期待される出力を確認してください。これらは詳細なトラブルシューティングに役立ちます。
サポートチケットを開いた場合、これらの出力を求められる場合があります。

#### 1. バージョンの確認
コマンド：

`doublezero --version`

サンプル出力：
```
DoubleZero 0.6.3
```

#### 2. DoubleZeroアドレスの確認
コマンド：

`doublezero address`

サンプル出力：
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```

#### 3. アクセスパスの確認

サンプル公開鍵：`MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` コマンド実行時はこれをあなたの公開鍵に置き換えてください。

コマンド：

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

出力：[この出力ではヘッダーを表示するために`doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`を使用しています]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
```

#### 4. DoubleZeroレジャークレジットの確認
コマンド：

`doublezero balance`

サンプル出力：
```
0.78 Credits
```

#### 5. 接続ステータスの確認
コマンド：

`doublezero status`

サンプル出力：

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```


#### 6. レイテンシの確認
コマンド：

`doublezero latency`

サンプル出力：
```
 pubkey                                       | code         | ip             | min      | max      | avg      | reachable
 6E1fuqbDBG5ejhYEGKHNkWG5mSTczjy4R77XCKEdUtpb | nyc-dz001    | 64.86.249.22   | 2.49ms   | 2.61ms   | 2.56ms   | true
 Cpt3doj17dCF6bEhvc7VeAuZbXLD88a1EboTyE8uj6ZL | lon-dz001    | 195.219.120.66 | 71.94ms  | 72.11ms  | 72.02ms  | true
 CT8mP6RUoRcAB67HjKV9am7SBTCpxaJEwfQrSjVLdZfD | lax-dz001    | 207.45.216.134 | 72.42ms  | 72.51ms  | 72.45ms  | true
 4Wr7PQr5kyqCNJo3RKa8675K7ZtQ6fBUeorcexgp49Zp | ams-dz001    | 195.219.138.50 | 76.50ms  | 76.71ms  | 76.60ms  | true
 29ghthsKeH2ZCUmN2sUvhJtpEXn2ZxqAuq4sZFBFZmEs | fra-dz001    | 195.219.220.58 | 83.00ms  | 83.14ms  | 83.08ms  | true
 hWffRFpLrsZoF5r9qJS6AL2D9TEmSvPUBEbDrLc111Y  | fra-dz-001-x | 195.12.227.250 | 84.81ms  | 84.89ms  | 84.85ms  | true
 8jyamHfu3rumSEJt9YhtYw3J4a7aKeiztdqux17irGSj | prg-dz-001-x | 195.12.228.250 | 104.81ms | 104.83ms | 104.82ms | true
 5tqXoiQtZmuL6CjhgAC6vA49JRUsgB9Gsqh4fNjEhftU | tyo-dz001    | 180.87.154.78  | 178.04ms | 178.23ms | 178.13ms | true
 D3ZjDiLzvrGi5NJGzmM7b3YZg6e2DrUcBCQznJr3KfC8 | sin-dz001    | 180.87.102.98  | 227.67ms | 227.85ms | 227.75ms | true
```

# トラブルシューティングの例
基本的な出力と正常なデプロイメントで期待される内容を確認したところで、一般的なトラブルシューティングの例を見ていきましょう。

### 問題：❌ Error creating user

この問題は一般的に、期待される公開鍵/IPのペアリングとユーザーがDoubleZeroへのアクセスを試みている公開鍵/IPのペアリングの不一致に関連しています。

**症状：**
- `doublezero connect ibrl`で接続する際に`❌ Error creating user`が表示される


**解決策：**
1. 確認

    `doublezero address`

    サンプル出力：
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. このアドレスが許可リストに登録されているか確認します：

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    サンプル出力：
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
    ```
     `doublezero address`の公開鍵はuser_payerの公開鍵と一致し、接続しようとしているIPアドレスはアクセスパスのIPと一致する必要があります。
    `doublezero address`はデフォルトで`~/.config/doublezero/`のid.jsonファイルから取得されます。[ステップ6](https://docs.malbeclabs.com/setup/)を参照してください。

3. 上記が正しく、接続中にエラーが発生している場合、またはマッピングが間違っている場合は、[DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)でサポートにお問い合わせください。

### 問題：❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
このエラーは、デバイスがすでにDoubleZeroに接続されていることを示します。

**症状：**
- ユーザーがDoubleZeroへの接続を試みる
- `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time`が表示される

**解決策：**
1. 確認
    `doublezero status`

    出力：
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. `up`は正常な接続を示します。
3. このエラーは、特定のDoubleZero IPを持つDoubleZeroへのトンネルがこのマシンですでにアクティブであるために表示されます。

    このエラーはDoubleZeroクライアントのアップグレード後によく発生します。DoubleZeroのアップグレードはdoublezerodサービスを自動的に再起動し、サービス再起動前に接続していた場合は再接続されます。


### 問題：DoubleZeroのステータスがunknownまたはdown

この問題は、サーバーとDoubleZeroデバイス間でGREトンネルが正常にアクティブ化されたが、ファイアウォールがBGPセッションの確立を妨げていることに関連することが多いです。そのため、ネットワークからルートを受信せず、DoubleZero上でトラフィックを送信していません。

**症状：**
- `doublezero connect ibrl`は成功しました。ただし、`doublezero status`が`down`または`unknown`を返す
    ```
    doublezero connect ibrl
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
    ✅  User Provisioned
    ```

    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```

**解決策：**
1. ファイアウォールルールを確認してください！

   DoubleZeroはGREトンネルインターフェース用にリンクローカルアドレス空間169.254.0.0/16をマシンとDoubleZeroデバイス間で使用します。169.254.0.0/16は通常「非ルーティング可能」な空間であり、優れたセキュリティプラクティスではこの空間との通信をブロックすることが推奨されます。169.254.0.0/16を送信元とする通信がtcpポート179の169.254.0.0/16宛先と通信できるファイアウォールルールを許可する必要があります。そのルールは169.254.0.0/16へのトラフィックを拒否するルールより上に配置する必要があります。

    UFWなどのファイアウォールでは`sudo ufw status`を実行してファイアウォールルールを確認できます。

    Solanaバリデーターが持つような設定に類似したサンプル出力：
    ```
    To                         Action      From
    --                         ------      ----
    22/tcp                     ALLOW       Anywhere
    8899/tcp                   ALLOW       Anywhere
    8000:10000/tcp             ALLOW       Anywhere
    8000:10000/udp             ALLOW       Anywhere
    11200:11300/udp            ALLOW       Anywhere
    11200:11300/tcp            ALLOW       Anywhere

    To                         Action      From
    --                         ------      ----
    10.0.0.0/8                 DENY OUT    Anywhere
    169.254.0.0/16             DENY OUT    Anywhere
    172.16.0.0/12              DENY OUT    Anywhere
    192.168.0.0/16             DENY OUT    Anywhere
    ```

    上記の出力では、指定されたポート以外の169.254.0.0/16へのすべてのトラフィックが拒否されています。
    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179`でルールを<N>番目の位置に挿入します。例：N=1の場合、このルールを最初のルールとして挿入します。
    `sudo ufw status numbered`でルールの番号順序を確認できます。

### 問題：最寄りのDoubleZeroデバイスが変わった

これはエラーではありませんが、最適化できる場合があります。以下は時折実行、または自動化できるベストプラクティスです。

**解決策：**

1. 最寄りのデバイスへのレイテンシを確認する
    - `doublezero latency`を実行

        出力
        ```
         pubkey                                       | code          | ip              | min      | max      | avg      | reachable
         2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.80ms   | 1.90ms   | 1.84ms   | true
         ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.83ms   | 2.10ms   | 1.92ms   | true
         8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.87ms   | 2.66ms   | 2.15ms   | true
         8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.33ms   | 2.39ms   | 2.37ms   | true
         FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.29ms   | 2.59ms   | 2.40ms   | true
        ```
        上記では最寄りのデバイスが`dz-ny7-sw01`です

        このデバイスに接続したいとします。

2. 対象デバイスに既に接続されているか確認する
    - `doublezero user list --env testnet | grep 111.11.11.11`を実行。`111.11.11.11`をDoubleZeroに接続されているデバイスの公開IPv4アドレスに置き換えてください。バリデーターIDまたはDoubleZero IDも使用できます。

        出力
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
        ```
        この例では、既に最寄りのデバイスに接続されています。これ以上のステップは不要で、ここで止めることができます。


        代わりに出力が次のようだった場合を考えてみましょう：
         ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | fra-dz-001-x     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
        ```
        これは最適でない接続です。再接続が必要かどうか検討しましょう。

        接続の前に、デバイスに利用可能なユーザートンネルがあるか確認します。

3. オプション：利用可能なデバイスのネットワークを調べる

    教育目的で、最初に：
    - `doublezero device list`を実行して全デバイスリストを取得します。出力を説明するために2台のデバイスを例として示します。

        出力：
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp
        ```
        `ams001-dz002`は69ユーザーいて、最大128ユーザーまで対応できます。このデバイスは59人のユーザーを追加できます。

        一方、`dz-fr5-sw01`は0ユーザーで最大0ユーザーです。このデバイスには接続できません。最大ユーザーが0の場合、デバイスは接続を受け付けていません。

        最寄りのデバイスへの接続に戻りましょう。

4. 対象デバイスに利用可能な接続があるか確認する
    - `doublezero device list | grep dz-ny7-sw01`を実行。`dz-ny7-sw01`を対象デバイスに置き換えてください

        出力
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp
        ```
        `dz-ny7-sw01`に接続可能なスペースがあることがわかります。

5. 最寄りのDoubleZeroデバイスに接続する

    切断してからDoubleZeroに再接続します。

    まず実行：
    - `doublezero disconnect`

      出力

        ```
        DoubleZero Service Provisioning
        🔍  Decommissioning User
        Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
        \ [00:00:00] [##########>-----------------------------] 1/4 deleting user       account...                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     🔍  Deleting User Account for: 6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW
        🔍  User Account deleted
        ✅  Deprovisioning Complete
        ```
    次に切断確認のためステータスを確認します：
    - `doublezero status`

    出力

    ```
    Tunnel status | Last Session Update | Tunnel Name | Tunnel src | Tunnel dst | Doublezero IP | User Type
    disconnected  | no session data     |             |            |            |               |
    ```
    最後に再接続します：
    - `doublezero connect ibrl`

    出力
    ```
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: dz-ny7-sw01
    Service provisioned with status: ok
    ✅  User Provisioned
    ```
    上記の出力で`Connected to device: dz-ny7-sw01`が表示されています。これはステップ1の最初の調査で`dz-ny7-sw01`が最も低いレイテンシのデバイスであると判明したことから、望ましい結果です。

### 問題：`doublezero status`で一部のフィールドにN/Aが表示される

この問題は一般的に、現在のデーモンとクライアントと、接続されたDZトンネルが確立されたデーモンとクライアントの不一致に関連しています。

**症状：**
- `doublezero status`を実行すると一部のフィールドに`N/A`が表示される




**解決策：**
1. 実行
`doublezero status`

    例：

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro | Network
    up            | 2025-10-20 20:06:18 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | N/A            | ✅ dz-ny7-sw01        | N/A   | mainnet-beta
    ```

    上記の出力例で、`Tunnel status`が`up`であることに注意してください。`Network`は`mainnet-beta`ですが、`Current Device`と`Metro`は`N/A`です。

    これは、マシン上のオープントンネルが現在の環境にないことを示しています。
    この場合、`mainnet-beta`で`Current Device`が見つからない`up`ステータスは、トンネルがテストネット上にあることを示しています！

2. 環境を変更する

    不一致を解消するには、`N/A`を返す環境の反対の環境に変更します。

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

3. ステータスを確認する

    環境の切り替え後に実行：

    ```
    doublezero status
    ```

    期待される出力は次のようになります：

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro    | Network
    up            | 2025-10-21 12:32:12 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | nyc-dz001      | ✅ nyc-dz001          | New York | testnet
    ```
すべてのフィールドが入力されており、正しい環境にいることを示しています。
