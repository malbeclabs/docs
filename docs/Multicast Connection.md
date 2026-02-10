# How to connect to DoubleZero in Multicast Mode
!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Service](https://doublezero.xyz/terms-protocol)"
### 1. Connect Multicast Mode
DoubleZero Multicast Mode enables development teams like Anza, Firedancer and Jito to bring multicast publishers and subscribers on to the DoubleZero. Multicast mode has both a `publisher` and a `subscriber` role. The publisher sends out packets across the network and subscribers are those who receive packets originating from the publisher.

Please follow the [setup](setup.md) instructions before proceeding.

!!! note inline end
    As of v0.2.0, only a single tunnel can be provisioned at a time. In addition, a user can be only a subscriber or a publisher. If you want to switch between publisher or subscriber, you'll have to disconnect and reconnect.

#### Publisher

```
 doublezero --keypair $SOLANA_KEYPAIR connect multicast publisher <multicast_group> --client-ip <client_ip>
```

You should see output similar to the following:
```

🔗  Start Provisioning User...
    Using Public IP: <Your public IP>
🔍  Provisioning User for IP: <Your public IP>
    Creating an account for the IP: <Your public IP>
    The Device has been selected: <selected DoubleZero device IP>
|  Waiting for user activation..
    User activated with dz_ip: <Your public IP>
    Provisioning: status: ok
/  Connected
```

You should also notice the `publishers` column count increase by one.

```
doublezero multicast group list
```

```
 account                                      | code | multicast_ip | max_bandwidth | publishers | subscribers | status    | owner
 52ieY9ydcJsms5rYMdsYtH6SnpMvWT2GcvAa8UydRdgi | mg01 | <multicast_ip> | 10Gbps        | 1          | 0           | activated | Dc3LFdWwKGJvJcVkXhAr14kh1HS6pN7oCWrvHfQtsHGe
```

#### Subscriber

```
  doublezero --keypair $SOLANA_KEYPAIR connect multicast subscriber <multicast_group> --client-ip <client_ip>
```

You should see output similar to the following:

```
🔗  Start Provisioning User...
    Using Public IP: <Your public IP>
🔍  Provisioning User for IP: <Your public IP>
    Creating an account for the IP: <Your public IP>
    The Device has been selected: <selected DoubleZero device IP>
|  Waiting for user activation...
    User activated with dz_ip: <Your public IP>
    Provisioning: status: ok
/  Connected
```

You should also see the number of `subscribers` increase by one.

```
doublezero multicast group list
```

```
account                                      | code | multicast_ip   | max_bandwidth | publishers | subscribers | status    | owner
52ieY9ydcJsms5rYMdsYtH6SnpMvWT2GcvAa8UydRdgi | mg01 | <multicast_ip> | 10Gbps        | 0          | 1           | activated | Dc3LFdWwKGJvJcVkXhAr14kh1HS6pN7oCWrvHfQtsHGe
```


Congratulations, your DoubleZero connection is up and running! We hope. Let's run a few more commands to make sure everything is working.

### 2. Verify doublezero tunnel

#### Publisher
```
doublezero status
```

Expected result:

```
 Tunnel status | Last Session Update | Tunnel Name | Tunnel src       | Tunnel dst      | Doublezero IP     | User Type
 up            | <Timestamp>         | doublezero1 | <Your public IP> | <Doublezero IP> | <Your public IP>  | Multicast
```


#### Subscriber
```
doublezero status
```

Expected result:

```
 Tunnel status | Last Session Update | Tunnel Name | Tunnel src       | Tunnel dst      | Doublezero IP | User Type
 up            | <Timestamp>         | doublezero1 | <Your public IP> | <Doublezero IP> |               | Multicast
```

### 3. Verify routing link address in routing table

In multicast mode, you should see a single 169.254/31 route, plus a static route for the multicast group you are connected to.

#### Publisher
```
$ ip route show dev doublezero1
```

```
169.254.0.0/31 proto kernel scope link src 169.254.0.1
<multicast_ip> via 169.254.0.0 proto static src 64.86.249.81
```

#### Subscriber

```
$ ip route show dev doublezero1
```

```
169.254.0.0/31 proto kernel scope link src 169.254.0.1
<multicast_ip> via 169.254.0.0 proto static
```
