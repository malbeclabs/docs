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

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
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
Now that we have examined basic outputs, and what is expected in a healthy deployment we can examine some common troubleshooting examples.

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
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. -`up`- signifies a healthy connection.
3. The error appears because a tunnel to DoubleZero with the specific DoubleZero IP is already active on this machine. 

    This error is often encountered after a DoubleZero client upgrade. DoubleZero upgrades automatically restart the doublezerod service and will reconnect you if you were connected prior to the service restart.


### Issue: DoubleZero Status is unknown, or down
This issue is often related to the GRE tunnel being successfully activated between the server and the DoubleZero Device, but a firewall preventing BGP session establishment. Because of this you are not receiving routes from the network or sending traffic over DoubleZero.

**Symptoms:**
- `doublezero connect ibrl` was successful. However, `doublezero status` returns `down` or `unknown`
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
    
    ---

    Additionally users are able to open port 44880 to utalize some [routing features](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

    To open port 44880 you could update IP tables such as:
    ```
    sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
    sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
    ```
    note the `-i doublezero0`, `-o doublezero0` flags which restrict this rule to only the DoubleZero interface 

    Or UFW such as:
    ```
    sudo ufw allow in on dobulezero0 to any port 44880 proto udp
    sudo ufw allow out on doublezero0 to any port 44880 proto udp
    ```
    note the `in on dobulezero0`, `out on doublezero0` flags which restrict this rule to only the DoubleZero interface 


### Issue: Nearest DoubleZero device has changed

This is not an error, but can be an optimization. Below is a best practice which can be run from time to time, or automated.

**Solutions:**

1. Check latency to the nearest device
    - run `doublezero latency` 

        output
        ```
         pubkey                                       | code          | ip              | min      | max      | avg      | reachable 
         2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.80ms   | 1.90ms   | 1.84ms   | true      
         ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.83ms   | 2.10ms   | 1.92ms   | true      
         8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.87ms   | 2.66ms   | 2.15ms   | true      
         8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.33ms   | 2.39ms   | 2.37ms   | true      
         FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.29ms   | 2.59ms   | 2.40ms   | true   
        ```
        note above the nearest device is `dz-ny7-sw01 `

        We want to connect to this device. :

2. Determine if you are already connected to the target device
    - run `doublezero user list --env testnet | grep 111.11.11.11` replace `111.11.11.11` with your devices public ipv4 address which is connected to DoubleZero. You may also use your validator ID, or doublezero ID.

        output
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        In this example, we are already connected to the nearest device. No more steps are needed, we can stop here.


        Let us consider instead if the output was 
         ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | fra-dz-001-x     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        This would be a sub-optimal connection. Let us consider if reconnection is needed.

        Prior to connection, we will check if the device has available user tunnels.

3. Optional: examine the network for available devices

    For educational purposes we will first: 
    - run `doublezero device list` for a full list of devices. We have pulled 2 devices as an example to explain the output.

        output:
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner                                        
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp 
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        Note above that `ams001-dz002` has 69 users, and 128 max users. This device is able to add 59 users. 

        However, `dz-fr5-sw01` has 0 users, and 0 max users. You will not be able to connect to this device. With a max users of 0, the device is not accepting any connections.

        Now let us return to connecting to our nearest device.

4. Determine if the target device has an available connection
    - run `doublezero device list | grep dz-ny7-sw01` replace `dz-ny7-sw01` with your target device

        output
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        here we can see that `dz-ny7-sw01` has available space for connection.

5. Connect to the nearest DoubleZero Device

    We will disconnect, and then reconnect to doublezero.

    First run
    - `doublezero disconnect`

      output

        ```
        DoubleZero Service Provisioning
        🔍  Decommissioning User
        Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
        \ [00:00:00] [##########>-----------------------------] 1/4 deleting user       account...                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     🔍  Deleting User Account for: 6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW
        🔍  User Account deleted
        ✅  Deprovisioning Complete
        ```
    now we check the status to confirm our disconnection with
    - `doublezero status`

    output

    ```
    Tunnel status | Last Session Update | Tunnel Name | Tunnel src | Tunnel dst | Doublezero IP | User Type 
    disconnected  | no session data     |             |            |            |               |    
    ```
    Last we will reconnect with
    - `doublezero connect ibrl`

    output
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
    notice in the above output that we `Connected to device: dz-ny7-sw01` this is the desired result from our initial investigation in step 1, where we discovered that `dz-ny7-sw01` was the device with the lowest latency.

### Issue: `doublezero status` returns some fields with N/A

This issue is generally related to a mismatch between the current daemon and client, vs the daemon and client the connected DZ tunnel was established in.

**Symptoms:**
- When running `doublezero status` the user encounters `N/A` in some fields




**Solutions:**
1. Run
`doublezero status`

    Example:

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro | Network
    up            | 2025-10-20 20:06:18 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | N/A            | ✅ dz-ny7-sw01        | N/A   | mainnet-beta
    ```

    Notice in our example output above that the `Tunnel status` is `up`. Our `Network` is `mainnet-beta` However, `Current Device` and `Metro` are `N/A`

    This is indicative of an open tunnel on your machine which is not in your current environment.
    In this case the `up` status, with no found `Current Device` on `mainnet-beta` reveals to us that our tunnel is on testnet!
 
2. Change your environment.

    In order to rectify the mismatch you will change your environment to the opposite of the environment returning the `N/A`

    ```bash
    DESIRED_DOUBLEZERO_ENV=testnet \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

    To configure the DoubleZero Client CLI (`doublezero`) and daemon (`doublezerod`) to connect to **DoubleZero mainnet-beta**:

    ```bash
    DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```
    
3. Check your status

    After switching environments run:

    ```
    doublezero status
    ```

    The expected output should be similar to:

    ``` 
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro    | Network 
    up            | 2025-10-21 12:32:12 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | nyc-dz001      | ✅ nyc-dz001          | New York | testnet 
    ```
With all fields populated you are now in the correct environment.