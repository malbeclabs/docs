# 验证器多播连接
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "通过连接到DoubleZero，我同意[DoubleZero服务条款](https://doublezero.xyz/terms-protocol)"

如果您尚未连接到DoubleZero，请先完成[设置](setup.md)和[主网Beta](DZ%20Mainnet-beta%20Connection.md)验证器连接文档。

如果您是已连接到DoubleZero的验证器，可以继续阅读本指南。

#### Jito-Agave（3.1.9或更高版本）

1. 在您的验证器启动脚本中，添加：`--shred-receiver-address 233.84.178.1:7733`

    您可以同时向Jito和`bebop`组发送数据。

    示例：

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...The rest of your config...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. 重启您的验证器。

3. 以发布者身份连接到DoubleZero多播组`bebop`：
   `doublezero connect multicast --publish bebop`



#### Frankendancer

1. 在`config.toml`中，添加：
   ```toml
   [tiles.shred]
   additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
   ```
2. 重启您的验证器。

3. 以发布者身份连接到DoubleZero多播组`bebop`：
   `doublezero connect multicast --publish bebop`



!!! note inline end
    在XDP驱动模式下的Frankendancer用户无法使用tcpdump。目前没有方法确认您正在发布，但解决方案即将推出。

#### 确认您正在发布

在您的下一个领导者槽位期间，使用`tcpdump`确认您正在向多播组发布。您应该每10秒看到一次心跳以验证您正在发布碎片。

运行：`sudo tcpdump -vv -c5 -ni doublezero1 port 7733 or port 5765`

发布时的示例输出：

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
