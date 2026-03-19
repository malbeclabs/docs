# バリデーターマルチキャスト接続
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "DoubleZeroに接続することで、[DoubleZeroサービス利用規約](https://doublezero.xyz/terms-protocol)に同意します"

まだDoubleZeroに接続していない場合は、[セットアップ](setup.md)と[メインネットベータ](DZ%20Mainnet-beta%20Connection.md)バリデーター接続ドキュメントを完了してください。

既にDoubleZeroに接続しているバリデーターは、このガイドを続けることができます。

#### Jito-Agave（バージョン3.1.9以上）

1. バリデーターの起動スクリプトに以下を追加します：`--shred-receiver-address 233.84.178.1:7733`

    JitoとBebopグループに同時に送信できます。

    例：

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...その他の設定...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. バリデーターを再起動します。

3. パブリッシャーとしてDoubleZeroマルチキャストグループ`bebop`に接続します：
   `doublezero connect multicast --publish bebop`



#### Frankendancer

1. `config.toml`に以下を追加します：
   ```toml
   [tiles.shred]
   additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
   ```
2. バリデーターを再起動します。

3. パブリッシャーとしてDoubleZeroマルチキャストグループ`bebop`に接続します：
   `doublezero connect multicast --publish bebop`



!!! note inline end
    XDPドライバーモードのFrankendancerユーザーはtcpdumpを使用できません。現在、公開中を確認する方法はありませんが、近いうちにソリューションが提供される予定です。

#### 公開中の確認

次のリーダースロット中に`tcpdump`を使用してマルチキャストグループに公開していることを確認します。シュレッドを公開していることを確認するために10秒ごとにハートビートが表示されるはずです。

実行：`sudo tcpdump -vv -c5 -ni doublezero1 port 7733 or port 5765`

公開中の出力例：

```
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
tcpdump: verbose output suppressed, use -v[v]... for full protocol decodetcpdump -vv -c5 -ni doublezero1 port 7733 or port 5765
tcpdump: listening on doublezero1, link-type LINUX_SLL (Linux cooked v1), snapshot length 262144 bytes
21:53:11.018243 IP (tos 0x0, ttl 32, id 47109, offset 0, flags [DF], proto UDP (17), length 32)
    148.51.120.2.38319 > 233.84.178.1.5765: [bad udp cksum 0xa7a9 -> 0x67ba!] UDP, length 4
21:53:21.018217 IP (tos 0x0, ttl 32, id 47558, offset 0, flags [DF], proto UDP (17), length 32)
    148.51.120.2.38319 > 233.84.178.1.5765: [bad udp cksum 0xa7a9 -> 0x67ba!] UDP, length 4
21:53:31.018042 IP (tos 0x0, ttl 32, id 47919, offset 0, flags [DF], proto UDP (17), length 32)
    148.51.120.2.38319 > 233.84.178.1.5765: [bad udp cksum 0xa7a9 -> 0x67ba!] UDP, length 4
21:53:32.822061 IP (tos 0x0, ttl 64, id 5721, offset 0, flags [DF], proto UDP (17), length 1231)
    148.51.120.2.57512 > 233.84.178.1.7733: [bad udp cksum 0xac58 -> 0xadfc!] UDP, length 1203
21:53:32.822110 IP (tos 0x0, ttl 64, id 5722, offset 0, flags [DF], proto UDP (17), length 1231)
    148.51.120.2.57512 > 233.84.178.1.7733: [bad udp cksum 0xac58 -> 0x9e62!] UDP, length 1203
5 packets captured
204 packets received by filter
0 packets dropped by kernel
```
