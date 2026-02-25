# Validator Mainnet-Beta Connection in IBRL Mode
!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Service](https://doublezero.xyz/terms-protocol)"



###  Connecting to Mainnet-Beta in IBRL Mode

!!! Note inline end
    IBRL mode does not require restarting validator clients, because it uses your existing public IP address.

Solana Mainnet Validators will complete connection to DoubleZero Mainnet-beta, which is detailed on this page.

Each Solana validator has its own **identity keypair**; from this, extract the public key known as the **node ID**. This is the validator's unique fingerprint on the Solana network.

With the DoubleZeroID and node ID identified, you will prove ownership of your machine. This is done by creating a message which includes the DoubleZeroID signed with the validator's identity key. The resulting cryptographic signature serves as verifiable proof that you control the validator.

Finally, you will submit a **connection request to DoubleZero**. This request communicates: *"Here is my identity, here is proof of ownership, and here is how I intend to connect."* DoubleZero validates this information, accepts the proof, and provisions network access for the validator on DoubleZero.

This guide allows for 1 Primary Validator to register itself, and up to 3 backup/failover machines at the same time.

## Prerequisites

- Solana CLI installed and on $PATH
- For validators: Permission to access to the validator identity keypair file (e.g., validator-keypair.json) under the sol user
- For validators: Verify the Identity key of Solana validator being connected has at least 1 SOL on it
- Firewall rules permit outbound connections for DoubleZero and Solana RPC as needed including
 GRE (ip proto 47) and BGP (169.254.0.0/16 on tcp/179)

!!! info
    The Validator ID will be checked against Solana gossip to determine the target IP. The target IP, and the DoubleZero ID will then be used when opening a GRE tunnel between your machine and the target DoubleZero Device.

    Consider: In the case where you have a junk ID and Primary ID on at the same IP, only the Primary ID will be used in registration of the machine. This is because the junk ID will not appear in gossip, and therefore cannot be used to verify the IP of the target machine.

## 1. Environment Configuration

Please follow the [setup](setup.md) instructions before proceeding.

The last step in setup was to disconnect from the network. This is to ensure that only one tunnel is open on your machine to DoubleZero, and that tunnel is on the correct network.

<div data-wizard-step="mainnet-env-config" markdown>

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
`
✅ doublezerod configured for environment mainnet-beta
`

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

</div>

## 2. Open port 44880

Users need to open port 44880 to utilize some [routing features](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

To open port 44880 you could update IP tables such as:

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

note the `-i doublezero0`, `-o doublezero0` flags which restrict this rule to only the DoubleZero interface

Or UFW such as:

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

note the `in on doublezero0`, `out on doublezero0` flags which restrict this rule to only the DoubleZero interface

## 3. Attest Validator Ownership

<div data-wizard-step="mainnet-find-validator" markdown>

With your DoubleZero Environment set, it is now time to attest to your Validator Ownership.

The DoubleZero ID you created in the [setup](setup.md) of your primary validator must be used on all backup machines.

The ID on your primary machine can be found with `doublezero address` The same ID must be in `~/.config/doublezero/id.json` on all machines in the cluster.

In order to accomplish this you will first verify the machine you are running the commands from is your **Primary Validator** with:

```
doublezero-solana passport find-validator -u mainnet-beta
```

This verifies that the validator is registered in gossip and appears in the leader schedule.

Expected output:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 11.11.11.111
Validator ID: ValidatorIdentity111111111111111111111111111
Gossip IP: 11.11.11.111
In Leader scheduler
✅ This validator can connect as a primary in DoubleZero 🖥️  💎. It is a leader scheduled validator.
```

!!! info
    The same workflow is used for one, or many machines.
    To register one machine exclude the arguments "--backup-validator-ids" or "backup_ids=" from any commands on this page.

Now, on all backup machines you intend to run your **Primary Validator** on execute the following:
```
doublezero-solana passport find-validator -u mainnet-beta
```

Expected output:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
This output is expected. The backup node cannot be in the leader schedule at time of pass creation.

You will now run this command on **all backup machines** you plan to use your **Primary Validator** vote account, and identity on.

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### Prepare the Connection

Run the following command on the **Primary Validator** machine. This is the machine you have active stake on, that is in the leader schedule with your primary validator ID in solana gossip on the machine you are running the command from:

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


Example output:

```
DoubleZero Passport - Prepare Validator Access Request
Connected to Solana: mainnet-beta

Primary validator 🖥️  💎:
  ID: ValidatorIdentity111111111111111111111111111
  Gossip: ✅ OK 11.11.11.111)
  Leader scheduler: ✅ OK (Stake: 1,050,000.00 SOL)

Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity222222222222222222222222222
  Gossip: ✅ OK (22.22.22.222)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity333333333333333333333333333
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


  Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity444444444444444444444444444
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)

  To request access, sign the following message with your validator's identity key:

  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>

```
Note the output at the end of this command. It is the structure for the next step.

</div>

## 4. Generate Signature

<div data-wizard-step="mainnet-sign-message" markdown>

At the end of the last step, we received a pre-formatted output for `solana sign-offchain-message`

From the above output we will run this command on the **Primary Validator** machine.

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**Output:**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```

</div>

## 5. Initiate a Connection Request in DoubleZero

<div data-wizard-step="mainnet-request-access" markdown>

Use the `request-validator-access` command to create an account on Solana for the connection request. The DoubleZero Sentinel agent detects the new account, validates its identity and signature, and creates the access pass in DoubleZero so the server can establish a connection.


Use the node ID, DoubleZeroID, and signature.

!!! note inline end
      In this example we use   `-k /home/user/.config/solana/id.json` to find the validator Identity. Use the appropriate location for your local deployment.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**Output:**

This output can be used to see the transaction on a Solana explorer. Be sure to change the explorer to mainnet. This verification is optional.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

If successful, DoubleZero will register the primary with its backups. You may now failover between the IPs registered in the access pass. DoubleZero will maintain connectivity automatically when switching to backup nodes registered in this way.

</div>

## 6. Connect in IBRL Mode

<div data-wizard-step="mainnet-connect-ibrl" markdown>

On the server, with the user which will connect to DoubleZero, run the `connect` command to establish the connection to DoubleZero.

```
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
Wait one minute for the GRE tunnel to finish setting up. Until the GRE tunnel is done setting up, your status output may return "down" or "Unknown"

Verify your connection:

```bash
doublezero status
```

**Output:**
!!! note inline end
    Examine this output. Notice that the `Tunnel src`, and the `DoubleZero IP` match the public ipv4 address on your machine.
    <!--`Tunnel dst` is the address of the DZ device you are connected to.-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
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

</div>

### Up Next: Publishing Shreds via Multicast

If you have completed this setup and plan publishing shreds via multicast, proceed to the [next page](ValidatorShredPublishing.md).
