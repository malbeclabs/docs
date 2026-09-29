---
description: 멀티캐스트 모드로 DoubleZero에 연결하여 하나 이상의 피드를 게시하거나 구독합니다.
---

# 기타 멀티캐스트 연결
!!! warning "DoubleZero에 연결함으로써 [DoubleZero 서비스 약관](https://doublezero.xyz/terms-protocol)에 동의합니다"
 
상세 연결 정보: 

### 1. DoubleZero 클라이언트 설치
[설정](setup.md) 안내에 따라 DoubleZero 클라이언트를 설치하고 구성하세요.

### 2. 연결 안내 

멀티캐스트 모드로 DoubleZero에 연결
게시자로서: 

```doublezero connect multicast --publish <feed name>```

또는 구독자로서: 

```doublezero connect multicast --subscribe <feed name>```

또는 게시와 구독을 동시에: 

```doublezero connect multicast --publish <feed name> --subscribe <feed name>```

여러 피드를 게시하거나 구독하려면 공백으로 구분된 여러 피드 이름을 포함할 수 있습니다.
이를 사용하여 게시 피드에 대해 게시와 구독을 동시에 할 수도 있습니다.
예시 
```doublezero connect multicast --subscribe feed1 feed2 feed3```

다음과 유사한 출력이 표시됩니다:
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
### 3. 활성 멀티캐스트 연결 확인 
60초 동안 기다린 후 다음을 실행하세요

```
doublezero status
```
예상 결과:
- 올바른 DoubleZero 네트워크에서 BGP 세션 활성화 
- 게시자인 경우, DoubleZero IP가 Tunnel Src IP와 다릅니다. 이는 정상적인 동작입니다. 
- 구독자만인 경우, DoubleZero IP가 Tunnel Src IP와 동일합니다. 

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

연결된 그룹을 확인하세요: 
```
doublezero user list --client-ip <your ip>
```

|account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
|wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan|