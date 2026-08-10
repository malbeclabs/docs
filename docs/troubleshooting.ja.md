---
description: DoubleZero の一般的な接続問題を診断するためのリファレンスコマンド、期待される出力、およびさらなるサポートの入手先について説明します。
---

# トラブルシューティング

このガイドではさまざまな問題を取り上げており、随時更新されます。ガイドを最後まで確認しても問題が解決しない場合は、[DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701) Discord でさらなるサポートを受けることができます。


## よく使うコマンドと出力

まず、以下のコマンドの出力と期待される出力を確認してください。これらはより詳細なトラブルシューティングに役立ちます。
チケットを作成した場合、これらの出力を求められることがあります。

#### 1. バージョンの確認
コマンド：

`doublezero --version`

出力例：
```
DoubleZero 0.6.3
```
[comment]: # (when repo is public add this link to check https://github.com/malbeclabs/doublezero)

#### 2. DoubleZero アドレスの確認
コマンド：

`doublezero address`

出力例：
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```
[comment]: # ()

#### 3. アクセスパスの確認

公開鍵の例：`MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` コマンド実行時にはご自身の公開鍵に置き換えてください。

コマンド：

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

出力：[この出力でヘッダーを表示するために `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'` を使用しています]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
```
[comment]: # ()
#### 4. DoubleZero 台帳クレジットの確認
コマンド：

`doublezero balance`

出力例：
```
0.78 Credits
```
[comment]: # (add section linked later for 0 balance mainnet/testnet)

#### 5. 接続状態の確認
コマンド：

`doublezero status`

出力例：

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```
[comment]: # (in next iteration add "up" "unknown" and "down" explainers, which then link to a sectino below for troubleshooting undesired states.)


#### 6. レイテンシの確認
コマンド：

`doublezero latency`

出力例：
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
[comment]: # ()

# トラブルシューティングの例
基本的な出力と正常なデプロイメントで期待される内容を確認したので、一般的なトラブルシューティングの例を見ていきましょう。

### 問題：❌ Error creating user

この問題は一般的に、期待される公開鍵/IPの組み合わせと、ユーザーが DoubleZero にアクセスしようとしている際の公開鍵/IPの組み合わせが一致しないことに関連しています。

**症状：**
- `doublezero connect ibrl` で接続しようとすると `❌ Error creating user` が発生する


**解決方法：**
1. 確認

    `doublezero address`

    出力例：
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. このアドレスが許可リストに登録されていることを確認：

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    出力例：
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
    ```
     `doublezero address` の公開鍵は user_payer の公開鍵と一致する必要があり、接続元の IP アドレスはアクセスパスの ip と一致する必要があります。
    `doublezero address` はデフォルトで ~/.config/doublezero/ にある id.json ファイルから取得されます。[こちらのステップ6](<setup.md>)を参照してください。
    
3. 上記が正しいにもかかわらず接続時にエラーが発生する場合、または上記のマッピングが正しくない場合は、[DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701) でサポートにお問い合わせください。

### 問題：❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
このエラーは、デバイスが既に DoubleZero に接続されていることを意味します。

**症状：**
- ユーザーが DoubleZero に接続しようとする
- `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time` が発生する

**解決方法：**
1. 確認
    `doublezero status`

    出力：
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. -`up`- は正常な接続を示します。
3. このエラーは、特定の DoubleZero IP を使用した DoubleZero へのトンネルがこのマシン上で既にアクティブであるために表示されます。

    このエラーは DoubleZero クライアントのアップグレード後によく発生します。DoubleZero のアップグレードは doublezerod サービスを自動的に再起動し、サービス再起動前に接続していた場合は再接続します。


### 問題：DoubleZero のステータスが unknown または down
この問題は、サーバーと DoubleZero デバイス間で GRE トンネルは正常に確立されたものの、ファイアウォールが BGP セッションの確立を妨げていることに関連していることが多いです。このため、ネットワークからルートを受信できず、DoubleZero 経由でトラフィックを送信できません。

**症状：**
- `doublezero connect ibrl` は成功した。しかし、`doublezero status` が `down` または `unknown` を返す
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

**解決方法：**
1. ファイアウォールルールを確認してください！

   DoubleZero はマシンと DoubleZero デバイス間の GRE トンネルインターフェースにリンクローカルアドレス空間 169.254.0.0/16 を使用します。169.254.0.0/16 は通常「ルーティング不可」な空間であり、適切なセキュリティプラクティスではこの空間との通信をブロックすることが推奨されます。ファイアウォールで src 169.254.0.0/16 から dst 169.254.0.0/16 への tcp ポート 179 での通信を許可するルールを追加する必要があります。このルールは 169.254.0.0/16 へのトラフィックを拒否するルールよりも上に配置する必要があります。

    ufw のようなファイアウォールでは `sudo ufw status` を実行してファイアウォールルールを確認できます。

    Solana バリデーターが使用するような設定の出力例：
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

    上記の出力では、指定されたポートを除く 169.254.0.0/16 へのすべてのトラフィックが拒否されています。
    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179` でルールを <N> の位置に挿入します。例えば N = 1 の場合、このルールは最初のルールとして挿入されます。
    `sudo ufw status numbered` でルールの番号順を確認できます。
    
### 問題：最寄りの DoubleZero デバイスが変更された

これはエラーではありませんが、最適化の機会です。以下は、時折実行するか自動化できるベストプラクティスです。

**解決方法：**

1. 最寄りのデバイスへのレイテンシを確認
    - `doublezero latency` を実行

        出力
        ```
         pubkey                                       | code          | ip              | min      | max      | avg      | reachable 
         2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.80ms   | 1.90ms   | 1.84ms   | true      
         ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.83ms   | 2.10ms   | 1.92ms   | true      
         8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.87ms   | 2.66ms   | 2.15ms   | true      
         8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.33ms   | 2.39ms   | 2.37ms   | true      
         FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.29ms   | 2.59ms   | 2.40ms   | true   
        ```
        上記で最寄りのデバイスは `dz-ny7-sw01` です

        このデバイスに接続します：

2. 対象デバイスに既に接続しているか確認
    - `doublezero user list --env testnet | grep 111.11.11.11` を実行します。`111.11.11.11` を DoubleZero に接続しているデバイスのパブリック IPv4 アドレスに置き換えてください。バリデーター ID や DoubleZero ID を使用することもできます。

        出力
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        この例では、既に最寄りのデバイスに接続されています。これ以上の手順は不要です。ここで終了できます。


        代わりに以下のような出力だった場合を考えてみましょう
         ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | fra-dz-001-x     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        これは最適でない接続です。再接続が必要かどうか検討しましょう。

        接続する前に、デバイスに利用可能なユーザートンネルがあるか確認します。

3. オプション：ネットワーク上の利用可能なデバイスを確認

    学習目的で、まず以下を実行します：
    - `doublezero device list` でデバイスの完全なリストを表示します。出力を説明するために2つのデバイスを例として抜粋しています。

        出力：
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner                                        
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp 
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        上記で `ams001-dz002` は 69 ユーザーで、最大 128 ユーザーです。このデバイスはあと 59 ユーザーを追加できます。

        しかし、`dz-fr5-sw01` は 0 ユーザーで、最大ユーザー数も 0 です。このデバイスには接続できません。最大ユーザー数が 0 のため、デバイスは接続を受け付けていません。

        では、最寄りのデバイスへの接続に戻りましょう。

4. 対象デバイスに利用可能な接続があるか確認
    - `doublezero device list | grep dz-ny7-sw01` を実行します。`dz-ny7-sw01` を対象デバイスに置き換えてください。

        出力
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        ここで `dz-ny7-sw01` に接続可能な空きがあることが確認できます。

5. 最寄りの DoubleZero デバイスに接続

    切断してから DoubleZero に再接続します。

    まず以下を実行
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
    次にステータスを確認して切断を確認します
    - `doublezero status`

    出力

    ```
    Tunnel status | Last Session Update | Tunnel Name | Tunnel src | Tunnel dst | Doublezero IP | User Type 
    disconnected  | no session data     |             |            |            |               |    
    ```
    最後に再接続します
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
    上記の出力で `Connected to device: dz-ny7-sw01` に接続したことに注目してください。これはステップ1の初期調査で `dz-ny7-sw01` が最も低レイテンシのデバイスであると判明した結果から期待される結果です。

### 問題：`doublezero status` の一部のフィールドが N/A を返す

この問題は一般的に、現在のデーモンとクライアントと、接続中の DZ トンネルが確立された時点のデーモンとクライアントとの間の不一致に関連しています。

**症状：**
- `doublezero status` を実行すると、一部のフィールドに `N/A` が表示される




**解決方法：**
1. 実行
`doublezero status`

    例：

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro | Network
    up            | 2025-10-20 20:06:18 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | N/A            | ✅ dz-ny7-sw01        | N/A   | mainnet-beta
    ```

    上記の出力例で、`Tunnel status` が `up` であることに注目してください。`Network` は `mainnet-beta` です。しかし、`Current Device` と `Metro` が `N/A` になっています。

    これは、現在の環境にないオープンなトンネルがマシン上に存在することを示しています。
    この場合、`up` のステータスと、`mainnet-beta` 上で `Current Device` が見つからないことから、トンネルが testnet 上にあることがわかります！
 
2. 環境を変更する

    不一致を修正するには、`N/A` を返している環境とは反対の環境に変更します。

    ```bash
    DESIRED_DOUBLEZERO_ENV=testnet \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

    DoubleZero クライアント CLI（`doublezero`）とデーモン（`doublezerod`）を **DoubleZero mainnet-beta** に接続するよう設定するには：

    ```bash
    DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```
    
3. ステータスを確認

    環境を切り替えた後、以下を実行します：

    ```
    doublezero status
    ```

    期待される出力は以下のようになるはずです：

    ``` 
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro    | Network 
    up            | 2025-10-21 12:32:12 UTC |