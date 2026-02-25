# Other Multicast
!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Service](https://doublezero.xyz/terms-protocol)"
 

|Use Case | First Step | When Approve, connect via:| 
|---------|------------|---------------------------| 
|Subscribe to Jito Shredstream | Contact Jito for approval. | ```doublezero connect multicast --subscribe jito-shredstream``` |

Detailed connection information: 

### 1. DoubleZero Client Installation
Please follow the [setup](setup.md) instructions to Install and configure the DoubleZero client.

### 2. Connection Instructions 

Connect to DoubleZero in Multicast Mode
As a publisher: 

```doublezero connect multicast --publish <feed name>```

or as a subscriber: 

```doublezero connect multicast --subscribe <feed name>```

or to publish and subscribe: 

```doublezero connect multicast --publish <feed name> --subscribe <feed name>```

To publish or subscribe to multiple feeds you can include multiple feed names space separated.
This can also be use to publish and subscribe to publish feeds.
For example 
```doublezero connect multicast --subscribe feed1 feed2 feed3```

You should see output similar to the following:
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
### 3. Verify your active multicast connection. 
Wait for 60 seconds and then run

```
doublezero status
```
Expected result:
- BGP Session Up on the correct DoubleZero Network 
- If you are a publisher, your DoubleZero IP will be different than your Tunnel Src IP. This is expected. 
- If you are a subscriber only, your DoubleZero IP will be the same as your Tunnel Src IP. 

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

Verify the groups you're connected to: 
```
doublezero user list --client-ip <your ip>
```

|account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
|wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan|