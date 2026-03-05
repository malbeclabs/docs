# 검증자 멀티캐스트 연결
!!! warning "DoubleZero에 연결함으로써 [DoubleZero 서비스 약관](https://doublezero.xyz/terms-protocol)에 동의합니다"

아직 DoubleZero에 연결되지 않았다면 [설정](setup.md) 및 [Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) 검증자 연결 문서를 완료하세요.

이미 DoubleZero에 연결된 검증자라면 이 가이드를 계속 진행할 수 있습니다.

#### Jito-Agave (버전 3.1.9 이상)

1. 검증자 시작 스크립트에 다음을 추가하세요: `--shred-receiver-address 233.84.178.1:7733`

    Jito와 `bebop` 그룹에 동시에 보낼 수 있습니다.

    예시:

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...나머지 설정...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. 검증자를 재시작하세요.

3. DoubleZero 멀티캐스트 그룹 `bebop`에 발행자로 연결하세요:
   `doublezero connect multicast --publish bebop`



#### Frankendancer

1. `config.toml`에 다음을 추가하세요:
   ```toml
   [tiles.shred]
   additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
   ```
2. 검증자를 재시작하세요.

3. DoubleZero 멀티캐스트 그룹 `bebop`에 발행자로 연결하세요:
   `doublezero connect multicast --publish bebop`



!!! note inline end
    XDP 드라이버 모드의 Frankendancer 사용자는 tcpdump를 사용할 수 없습니다. 현재 발행 중인지 확인할 방법이 없지만 곧 해결책이 제공될 예정입니다.

#### 발행 중인지 확인

다음 리더 슬롯에서 `tcpdump`를 사용하여 멀티캐스트 그룹에 발행 중인지 확인하세요. 발행 중인지 확인하기 위해 10초마다 하트비트가 표시되어야 합니다.

실행: `sudo tcpdump -vv -c5 -ni doublezero1 port 7733 or port 5765`

발행 중일 때의 예시 출력:

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
