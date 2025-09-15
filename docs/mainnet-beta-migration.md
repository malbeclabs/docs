# Onboarding a Solana Validator into DoubleZero

## Abstract

This guide explains how to onboard a Solana validator to DoubleZero. You will create a server identity (DoubleZeroID), prove validator ownership by signing a message with the validator's identity keypair (node ID), submit a connection request on Solana that DoubleZero validates, and finally establish an IBRL connection from your server. Follow steps 1–6 to install packages, generate identities, attest ownership, request access, and verify the tunnel is up.

## Prerequisites

- Supported OS: Ubuntu 22.04+ or Debian 11+, or Rocky Linux / RHEL 8+
- Root or sudo privileges on the server where DoubleZero will run
- Solana CLI installed and on $PATH
- Access to the validator identity keypair file (e.g., validator-keypair.json) under the sol user
- Firewall allows outbound connections for DoubleZero and Solana RPC as needed\
 GRE (ip proto 47) and BGP (169.254.0.0/16 on tcp/179)
- Optional but useful: jq and curl for debugging
- Ensure the Solana ValidatorID you are connecting has at least 1 sol on it

[comment]: # (We need to link the firewall troubleshooting guide to explain the firewall rules)

## Connecting a Solana Validator to DoubleZero

When onboarding a Solana validator into DoubleZero, start by establishing identities on both sides. On your server, generate a **DoubleZero identity**, represented by a public key called the **DoubleZero ID**. This key is how DoubleZero recognizes your server.

Next, focus on the validator itself. Each Solana validator has its own **identity keypair**; from this, extract the public key known as the **node ID**. This is the validator's unique fingerprint on the Solana network.

With the DoubleZeroID and node ID identified, prove ownership. Create a message that includes the DoubleZeroID and sign it with the validator's keypair. The resulting cryptographic signature serves as verifiable proof that you control the validator.

Finally, submit a **connection request to DoubleZero**. This request communicates: *"Here is my identity, here is proof of ownership, and here is how I intend to connect."* DoubleZero validates the information, accepts the proof, and provisions your validator for network access. From that moment, your validator is fully recognized and authenticated as part of the DoubleZero ecosystem.

## 1. Install or Upgrade DoubleZero Packages

Follow these steps depending on your operating system:

### Ubuntu / Debian

For a new install:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero=0.6.4-1
```
To upgrade:
```
apt-get install --only-upgrade doublezero
```

### Rocky Linux / RHEL
For a new install:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero-0.6.4
```

After installation, verify the daemon is running:

```bash
sudo systemctl status doublezerod
sudo journalctl -u doublezerod
```
To upgrade:
```bash
sudo yum --only-upgrade doublezero
```

## 2. Create New DoubleZero Identity


!!! note inline end
    If you have an existing DoubleZero Identity skip to step 3





Create a DoubleZero identity on your server with the following command:


```bash
doublezero keygen
```

## 3. Retrieve the server's DoubleZero identity

Read your new identity (DoubleZeroID). This identity will be used to activate your validator on Solana and then create your connection on your server.

```bash
doublezero address
```

**Output:**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. Disconnect from DoubleZero

Check 
```bash
doublezero status
``` 
if it is `up` run:

```bash
doublezero disconnect
```

## 5. Attest Validator Ownership

Determine the identity of the Solana validator and create a method to verify ownership. Use the identity keypair together with the standard Solana command to sign an off-chain transaction. This process only verifies ownership of the validator specified in the command.

### Switching to the `sol` User

Before generating the validator ownership signature, you must switch to the `sol` user (or whichever user you normally use to run the validator):

```bash
sudo su - sol
```

This is required because the validator's identity keypair (`validator-keypair.json`) is usually stored under the `sol` user account. Running the command as `sol` ensures:

- You have access to the validator identity keypair without permission errors.
- The signature is generated using the correct keys that your Solana validator actually uses.

In other words, this step **only requires you to sign a message with your validator identity** to prove ownership.

### Extract the Pubkey from your identity

```bash
solana address -k path/to/validator-keypair.json
```
!!! note inline end
      Save the output of this Signature for step 6

**Output:**
```bash
ValidatorIdentity111111111111111111111111111
```

Use the `sign-offchain-message` command to create a way to validate that you are the owner of the validator.

```bash
solana sign-offchain-message -k path/to/validator-keypair.json service_key=YourDoubleZeroAddress11111111111111111111111111111
```

**Output:**
```bash
Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```

### Exit the Validator User

Exit the `sol` user session (or the user you used for the validator):

```bash
exit
```

## 6. Initiate a Connection Request in DoubleZero

Use the `request-solana-validator-access` command to create an account on Solana for the connection request. The Sentinel agent detects the new account, validates its identity and signature, and creates the access pass in DoubleZero so the server can establish the connection.

The examples are for Solana Testnet. For Solana Mainnet-beta, change `testnet` flag for `mainnet-beta`

Check your Solana Balance

```bash
solana balance -u mainnet-beta
```

Use the node ID, DoubleZeroID, and signature.

!!! note inline end
      In this example we use   `-k /home/user/.config/solana/id.json` to find the SolanaID. Use the appropriate location for your local deployment.

```bash
doublezero-solana passport request-solana-validator-access -u mainnet-beta \
  -k /home/user/.config/solana/id.json
  --node-id ValidatorIdentity111111111111111111111111111 \
  --signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 \
  YourDoubleZeroAddress11111111111111111111111111111

```

**Sample Output:**
```bash
Request Solana validator access: Signature2222222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp 
```

## 7. Environment Verification

Solana Testnet Validators should connect to DoubleZero Testnet. Testnet users can skip to step 8.


<details>
  <summary>Solana Mainnet Validators will connect to DoubleZero Mainnet-Beta; expand this section to continue.</summary>
 
Configure the DoubleZero Client to point to Mainnet-Beta
```bash
doublezero config set --env mainnet-beta
```

```bash
sudo systemctl edit doublezerod
```
In this file add:
```bash
[Service]
ExecStart=
ExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env mainnet-beta
```
Reload the daemon
```bash
sudo systemctl daemon-reload
```
Restart DoubleZero
```bash
sudo systemctl restart doublezerod
```

After about 30 seconds you can check available network connections with:

```bash
doublezero latency
```
Testnet Output
```bash
doublezero latency
 pubkey                                       | code         | ip             | min      | max      | avg      | reachable 
 6E1fuqbDBG5ejhYEGKHNkWG5mSTczjy4R77XCKEdUtpb | nyc-dz001    | 64.86.249.22   | 2.44ms   | 2.63ms   | 2.50ms   | true      
 CT8mP6RUoRcAB67HjKV9am7SBTCpxaJEwfQrSjVLdZfD | lax-dz001    | 207.45.216.134 | 71.97ms  | 72.01ms  | 71.99ms  | true
 Cpt3doj17dCF6bEhvc7VeAuZbXLD88a1EboTyE8uj6ZL | lon-dz001    | 195.219.120.66 | 71.94ms  | 72.08ms  | 72.00ms  | true
 4Wr7PQr5kyqCNJo3RKa8675K7ZtQ6fBUeorcexgp49Zp | ams-dz001    | 195.219.138.50 | 76.55ms  | 76.65ms  | 76.61ms  | true
 29ghthsKeH2ZCUmN2sUvhJtpEXn2ZxqAuq4sZFBFZmEs | fra-dz001    | 195.219.220.58 | 83.01ms  | 83.10ms  | 83.05ms  | true
 hWffRFpLrsZoF5r9qJS6AL2D9TEmSvPUBEbDrLc111Y  | fra-dz-001-x | 195.12.227.250 | 84.87ms  | 84.91ms  | 84.89ms  | true
 8jyamHfu3rumSEJt9YhtYw3J4a7aKeiztdqux17irGSj | prg-dz-001-x | 195.12.228.250 | 95.27ms  | 95.30ms  | 95.29ms  | true
 5tqXoiQtZmuL6CjhgAC6vA49JRUsgB9Gsqh4fNjEhftU | tyo-dz001    | 180.87.154.78  | 180.96ms | 181.08ms | 181.02ms | true
 D3ZjDiLzvrGi5NJGzmM7b3YZg6e2DrUcBCQznJr3KfC8 | sin-dz001    | 180.87.102.98  | 220.87ms | 221.14ms | 220.97ms | true
```
Mainnet output will be identical in structure, but with over 40 connections!
</details>

## 8. Connect in IBRL Mode

On the server, with the user that accesses DoubleZero, run the `connect` command to establish the connection to DoubleZero.

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
Wait one minute for the tunnel to form. Until the tunnel is formed you may return "down" or "Unknown" 

Then verify your connection:

```bash
doublezero status
```

**Output:**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
