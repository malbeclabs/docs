# Troubleshooting

This guide will cover a variety of issues, and is ongoing. If you complete the guide you can seek further support in the [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701) discord.


## Common Commands and Outputs

To begin troubleshooting examine the output of the following commands, and their expected output.
These will assist you in more detailed troubleshooting. If you open a ticket, you will be asked for their output.
#### 1. Check Version
Command: 

`doublezero --version`

Output:
```
DoubleZero 0.6.3
```
[comment]: # (when repo is public add this link to check https://github.com/malbeclabs/doublezero)

#### 2. Check DoubleZero Address
Command: 

`doublezero address`

Output:
```
DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
```
[comment]: # ()

#### 3. Check Allow List
Command: 

`doublezero access-pass list | awk 'NR==1 || /C6Gi3JDE8FVeBMYuLKA9s5bZuGQ4N3TkYffJ6ErNiDiW/'`

Output:
```

doublezero access-pass list | awk 'NR==1 || /C6Gi3JDE8FVeBMYuLKA9s5bZuGQ4N3TkYffJ6ErNiDiW/'
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 149.28.33.124   | C6Gi3JDE8FVeBMYuLKA9s5bZuGQ4N3TkYffJ6ErNiDiW | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
```
[comment]: # ()
#### 4. Check Double Zero Credits
Command: 

`doublezero balance`

Output:
```
0.78 Credits
```
[comment]: # ()

#### 5. Check Firewall
Command: 

`sudo ufw status`

!!! note inline end
    Your firewall settings could differ. However, in this example notice rule: 
    179/tcp (v6)               ALLOW       Anywhere (v6)
which permits bgp (tcp 179) above the rules which to block traffic to 169.254.0.0/16. This is required.


Sample Output:
```
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
8899/tcp                   ALLOW       Anywhere
8000:10000/tcp             ALLOW       Anywhere
8000:10000/udp             ALLOW       Anywhere
11200:11300/udp            ALLOW       Anywhere
11200:11300/tcp            ALLOW       Anywhere
22/tcp (v6)                ALLOW       Anywhere (v6)
8899/tcp (v6)              ALLOW       Anywhere (v6)
8000:10000/tcp (v6)        ALLOW       Anywhere (v6)
8000:10000/udp (v6)        ALLOW       Anywhere (v6)
11200:11300/udp (v6)       ALLOW       Anywhere (v6)
11200:11300/tcp (v6)       ALLOW       Anywhere (v6)
179/tcp (v6)               ALLOW       Anywhere (v6)

To                         Action      From
--                         ------      ----
10.0.0.0/8                 DENY OUT    Anywhere
172.16.0.0/12              DENY OUT    Anywhere
192.168.0.0/16             DENY OUT    Anywhere
100.64.0.0/10              DENY OUT    Anywhere
198.18.0.0/15              DENY OUT    Anywhere
169.254.0.0/16             DENY OUT    Anywhere
```
[comment]: # ()

#### 6. Check Connection Status
Command: 

`doublezero status`

Output:
```
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type 
 up            | 2025-09-03 16:07:57 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL
```

#### 7. Check Latency
Command: 

`doublezero latency`

Output:
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

# Trouble shooting Examples
Now that we have examined basic outputs, and what is expected ina healthy deployment we can examine some common troubleshooting examples.
## Issue: Firedancer Behind on Slots

**Symptoms:**
- The user is running FireDancer
- DoubleZero is connected and healthy.

    `doublezero status`

    Returns output:
    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type 
    up            | 2025-09-03 16:07:57 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL
    ```
- -`up`- signifies a healthy connection.

- Firedancer is falling behind on slots.

**Solution:**
- Reload the Firedancer Client after connecting to DoubleZero

#### Issue: ❌ Error creating user

This issue is generally related to a mismatch between the expected pubkey/IP pairing and the pubkey/IP pairing the user is trying to access DoubleZero with.

**Symptoms:**
- When connecting with `doublezero connect ibrl` the user encounters `❌ Error creating user`

**Solutions:**
1. Check 

    `doublezero address`

    Output:
    ```
    DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
    ```
2. verify that this address is allow listed: 

    `doublezero access-pass list | awk 'NR==1 || /C6Gi3JDE8FVeBMYuLKA9s5bZuGQ4N3TkYffJ6ErNiDiW/'`

    Output:
    ```

    doublezero access-pass list | awk 'NR==1 || /C6Gi3JDE8FVeBMYuLKA9s5bZuGQ4N3TkYffJ6ErNiDiW/'
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 149.28.33.124   | C6Gi3JDE8FVeBMYuLKA9s5bZuGQ4N3TkYffJ6ErNiDiW | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
    ```
    The address and IP from the Access Pass must match your local machine.

4. ensure `doublezero address` is in config/doublezero following the instructions in [step 6 here](https://docs.malbeclabs.com/setup/)
4. Contact support in [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)  if credentials are correct but access is denied.

### Performance Issues

#### Issue: ❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
This error signifies that a device is already connected to DoubleZero.

**Symptoms:**
- User connects to DoubleZero
- `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time` is encountered.

**Solutions:**
1. Check
    `doublezero status`

    Output:
    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type 
     up            | 2025-09-03 16:07:57 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL
    ```
2. -`up`- signifies a healthy connection.
