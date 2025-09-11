# Troubleshooting

This guide will cover a variety of issues, and is ongoing. If you complete the guide you can seek further support in the [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701) discord.


## Common Commands and Outputs

To begin examine the output of the following commands, and their expected output. These will assist you in more detailed troubleshooting. 
If you open a ticket, you may be asked for their output.

#### 1. Check Version
Command: 

`doublezero --version`

Sample Output:
```
DoubleZero 0.6.3
```
[comment]: # (when repo is public add this link to check https://github.com/malbeclabs/doublezero)

#### 2. Check DoubleZero Address
Command: 

`doublezero address`

Sample Output:
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```
[comment]: # ()

#### 3. Verify your Access Pass

Sample pubkey: `MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` replace this with your pubkey when running command.

Command: 

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

Output: [note we use `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'` to show you the header now in this output]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
```
[comment]: # ()
#### 4. Check DoubleZero Ledger Credits
Command: 

`doublezero balance`

Sample Output:
```
0.78 Credits
```
[comment]: # (add section linked later for 0 balance mainnet/testnet)

#### 5. Check Connection Status
Command: 

`doublezero status`

Sample Output:
```
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type 
 up            | 2025-09-03 16:07:57 UTC | doublezero0 | 141.14.14.14 | 64.86.249.22 | 141.14.14.14  | IBRL
```
[comment]: # (in next iteration add "up" "unknown" and "down" explainers, which then link to a sectino below for troubleshooting undesired states.)


#### 6. Check Latency
Command: 

`doublezero latency`

Sample Output:
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

# Troubleshooting Examples
Now that we have examined basic outputs, and what is expected ina healthy deployment we can examine some common troubleshooting examples.

### Issue: ❌ Error creating user

This issue is generally related to a mismatch between the expected pubkey/IP pairing and the pubkey/IP pairing the user is trying to access DoubleZero with.

**Symptoms:**
- When connecting with `doublezero connect ibrl` the user encounters `❌ Error creating user`


**Solutions:**
1. Check 

    `doublezero address`

    Sample Output:
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. verify that this address is allow listed: 

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    Sample Output:
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
    ```
    The pubkey from `doublezero address` must match the user_payer pubkey and the IP Address you are trying to connect from must match the ip in the Access-Pass. 
    `doublezero address` is sourced from the id.json file in in ~/.config/doublezero/ by default. See the [step 6 here](https://docs.malbeclabs.com/setup/)

3. If the above looks correct and you are getting an error while connecting or if the above mapping is incorrect please contact support in [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)

### Issue: ❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
This error signifies that a device is already connected to DoubleZero.

**Symptoms:**
- User tries to connect to DoubleZero
- `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time` is encountered.

**Solutions:**
1. Check
    `doublezero status`

    Output:
    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type 
     up            | 2025-09-03 16:07:57 UTC | doublezero0 | 141.14.14.14 | 64.86.249.22 | 141.14.14.14  | IBRL
    ```
2. -`up`- signifies a healthy connection.
3. The error appears because a tunnel to DoubleZero with the specific DoubleZero IP is already active on this machine. 

    This error is often encountered after a DoubleZero client upgrade. DoubleZero upgrades automatically restart the doublezerod service and will reconnect you if you were connected prior to the service restart.


### Issue: DoubleZero Status is unknown, or down
This issue is often related to the GRE tunnel being successfully activated between the server and the DoubleZero Device, but a firewall preventing BGP session establishment. Because of this you are not receiving routes from the network or sending traffic over DoubleZero.

**Symptoms:**
- `doublezero connect ibrl` was successsful. However, `doublezero status` returns `down` or `unknown`
    ```
    doublezero connect ibrl                                                                                                                                                                                                                                                                                                                                  
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 149.28.38.64 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 149.28.38.64
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
    ✅  User Provisioned
    ```

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type 
    unknown            | 1970-01-01 00:00:00 UTC | doublezero0 | 141.14.14.14 | 64.86.249.22 | 141.14.14.14  | IBRL
    ```

**Solutions:**
1. Check your firewall rules!

   DoubleZero uses link local address space: 169.254.0.0/16 for the GRE tunnel interfaces between your machine and the DoubleZero Device. 169.254.0.0/16 is typically "non-routable" space and thus good security practices will recommend you blocking communications to/from this space. You will need to permit a rule in your firewall which enables src 169.254.0.0/16 to communicate with dst 169.254.0.0/16 on tcp port 179. That rule will need to be place above any rules that Deny traffic to 169.254.0.0/16. 

In a firewall like ufw you can run `sudo ufw status` to view the firewalls rules and 

Sample Output which may be something similar to what a Solana validator would have. 
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

In the above output you see all traffic to 169.254.0.0/16, except for the ports specified, is denied. 
`sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179` to insert the rule in the <N> position. ie. if N = 1 then you will insert this rules as the first rule.
`sudo ufw status numbered` will show you the numerical ordering of rules.
