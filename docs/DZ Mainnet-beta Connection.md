# How to connect to DoubleZero in IBRL Mode - for Mainnet-Beta Users
!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Service](https://doublezero.xyz/terms-protocol)"



###  Connecting to Mainnet-Beta in IBRL Mode

Solana Mainnet Validators will complete connection to DoubleZero Mainnet-beta, which is detailed on this page.
!!! Note inline end
    IBRL mode does not require restarting validator clients, because it uses your existing public IP address. 

This is because your existing public IP is advertised to DoubleZero so that other users on DoubleZero will route via the DoubleZero network when sending to your validator. Likewise, the routes received from DoubleZero and installed in the kernel routing table cause your validator to send to other DoubleZero-enabled validators over the DoubleZero network.

## 1. Environment Configuration

Please follow the [setup](setup.md) instructions before proceeding.

The last step in setup was to disconnect from the network. This is to ensure that only one tunnel is open on your machine to DoubleZero, and that tunnel is on the correct network.


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

You should see the following output:
```
✅ doublezerod configured for environment mainnet-beta
```

After about 30 seconds you will see the DoubleZero devices available:

```bash
doublezero latency
```
Example output (Mainnet-Beta)
```bash
 pubkey                                       | code          | ip              | min      | max      | avg      | reachable 
 2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.74ms   | 1.92ms   | 1.84ms   | true      
 ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.88ms   | 4.39ms   | 2.72ms   | true      
 8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.45ms   | 3.30ms   | 2.74ms   | true      
 8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.88ms   | 5.13ms   | 3.02ms   | true      
 uzyg9iYw2FEbtdTHaDb5HoeEWYAPRPQgvsgyd873qPS  | nyc001-dz002  | 4.42.212.122    | 3.17ms   | 3.63ms   | 3.33ms   | true      
 FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.33ms   | 5.46ms   | 3.39ms   | true      
 9oKLaL6Hwno5TyAFutTbbkNrzxm1fw9fhzkiUHgsxgGx | dz-dc10-sw01  | 137.239.200.186 | 6.84ms   | 7.01ms   | 6.91ms   | true      
 DESzDP8GkSTpQLkrUegLkt4S2ynGfZX5bTDzZf3sEE58 | was001-dz002  | 38.88.214.133   | 7.39ms   | 7.44ms   | 7.41ms   | true      
 HHNCpqB7CwHVLxAiB1S86ko6gJRzLCtw78K1tc7ZpT5P | was001-dz001  | 66.198.11.74    | 7.67ms   | 7.85ms   | 7.76ms   | true      
 9LFtjDzohKvCBzSquQD4YtL3HwuvkKBDE7KSzb8ztV2b | dz-mtl11-sw01 | 134.195.161.10  | 9.88ms   | 10.01ms  | 9.95ms   | true      
 9M7FfYYyjM4wGinKPofZRNmQFcCjCKRbXscGBUiXvXnG | dz-tor1-sw01  | 209.42.165.10   | 14.52ms  | 14.53ms  | 14.52ms  | true           
```
Testnet output will be identical in structure, but with fewer devices.
</details>


## 2. Attest Validator Ownership

With your DoubleZero Enviroment set, it is now time to attest to your Validator Ownership.

In order to accomplish this you will first determine the Solana Validator ID, then use the Solana Validator ID, together with the DoubleZero ID created during setup, to sign an off-chain transaction.
This process only verifies ownership of the validator specified in the command.


### Switching to the `sol` User

Before generating the validator ownership signature, you must switch to the `sol` user (or the user you normally use to run the validator):

```bash
sudo su - sol
```

This is required because the validator's Identity key (`validator-keypair.json`) is usually stored under the `sol` user account. Running the command as `sol` ensures:

- You have permissions to access to the `validator-keypair.json`.
- The signature is generated using the appropriate key that your Solana validator uses.

This step **only requires you to sign a message with your validator Identity** to prove ownership.

### Identify the Pubkey from your validator Identity

You may only create an access pass for the Validator Identity which is in gossip on the server requesting the access pass.
To connect your primary server, use the Validator Identity of your main validator. To connect a backup server, use the Validator Identity configured on the backup server.


<figure markdown="span">
  ![Image title](images/ConnectingMainnet.png){ width="800" }
  <figcaption>Figure 1: Connecting to DoubleZero Mainnet-Beta</figcaption>
</figure>

<figure markdown="span">
  ![Image title](images/ConnectingBackup.png){ width="800" }
  <figcaption>Figure 2: Connecting a backup node to DoubleZero</figcaption>
</figure>

```bash
solana address -k path/to/validator-keypair.json
```
!!! note inline end
      Save the output of this Signature for step 6


**Output:**
```bash
ValidatorIdentity111111111111111111111111111
```

Use the `sign-offchain-message` command to prove you are the owner of the validator.

```bash
solana sign-offchain-message -k path/to/validator-keypair.json service_key=YourDoubleZeroAddress11111111111111111111111111111
```

**Output:**
```bash
Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```

### Exit the Validator User

Exit the `sol` user session (or the user used to run the validator):

```bash
exit
```

## 3. Initiate a Connection Request in DoubleZero

Use the `request-validator-access` command to create an account on Solana for the connection request. The DoubleZero Sentinel agent detects the new account, validates its identity and signature, and creates the access pass in DoubleZero so the server can establish a connection.

The example is for Solana Mainnet-beta. For Solana Testnet, change the `mainnet-beta` flag to `testnet`

Check your Solana Balance

```bash
solana balance -u mainnet-beta
```

Use the node ID, DoubleZeroID, and signature.

!!! note inline end
      In this example we use   `-k /home/user/.config/solana/id.json` to find the validator Identity. Use the appropriate location for your local deployment.

```bash
doublezero-solana passport request-validator-access -u mainnet-beta \
  -k /home/user/.config/solana/id.json \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111

```

**Output:**
```bash
Request Solana validator access: Signature2222222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp 
```

## Maintaing DoubleZero connection with your Primary Vote Account and Validator ID across failover/ backup nodes

Now that you have created an access pass for your primary server consider the following fact so that you may use DoubleZero when you failover to backup machines.

when any of the these 3 elements are changed a new pass must be made:
```
DoubleZero ID  
Validator ID  
IP
```

For example you have 2 machines:
```
DoubleZero ID 1.2  
Validator ID 123  
IP 1.1.1.1  
```

When you failover to your backup you will have:
```
DoubleZero ID 1.2  
Validator ID 123  
IP 2.2.2.2  
```
The element changed is the IP. This will require you to complete steps 1-3 on this page again.


when you return to:
```
DoubleZero ID 1.2  
Validator ID 123  
IP 1.1.1.1  
```
You will have already created a pass with this combination, so a new one will not be required for you to initiate connection to doublezero with `doublezero connect ibrl`


## 4. Connect in IBRL Mode

On the server, with the user which will connect to DoubleZero, run the `connect` command to establish the connection to DoubleZero.

```bash
doublezero connect ibrl
```

You should see output indicating provisioning, such as:

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.184.101.183 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
🔍  Provisioning User for IP: 137.184.101.183
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
✅  User Provisioned
```
Wait one minute for the tunnel to complete. Until the tunnel is completed, your status output may return "down" or "Unknown" 

Verify your connection:

```bash
doublezero status
```

**Output:**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
A status of `up` means you are successfully connected.

You will be able to view routes propagated by other users on DoubleZero by running:

```
ip route
```


```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100 
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
...
```
