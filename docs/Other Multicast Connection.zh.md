---
description: 以多播模式连接到 DoubleZero，以发布或订阅一个或多个 feed。
---

# 其他多播连接
!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 服务条款](https://doublezero.xyz/terms-protocol)"
 
详细连接信息：

### 1. DoubleZero 客户端安装
请按照[设置](setup.md)说明安装和配置 DoubleZero 客户端。

### 2. 连接说明

以多播模式连接到 DoubleZero
作为发布者：

```doublezero connect multicast --publish <feed name>```

或作为订阅者：

```doublezero connect multicast --subscribe <feed name>```

或同时发布和订阅：

```doublezero connect multicast --publish <feed name> --subscribe <feed name>```

要发布或订阅多个 feed，您可以包含多个以空格分隔的 feed 名称。
这也可以用于发布和订阅发布 feed。
例如
```doublezero connect multicast --subscribe feed1 feed2 feed3```

您应该看到类似以下的输出：
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
### 3. 验证您的活跃多播连接。
等待 60 秒，然后运行

```
doublezero status
```
预期结果：
- BGP 会话在正确的 DoubleZero 网络上处于 Up 状态
- 如果您是发布者，您的 DoubleZero IP 将与您的 Tunnel Src IP 不同。这是预期行为。
- 如果您仅是订阅者，您的 DoubleZero IP 将与您的 Tunnel Src IP 相同。

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

验证您连接的组：
```
doublezero user list --client-ip <your ip>
```

|account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
|wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan|