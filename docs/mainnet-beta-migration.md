# Onboarding a Solana Validator into DoubleZero

## Abstract

This guide explains how to onboard a Solana validator to DoubleZero. You will create a server identity (service_key), prove validator ownership by signing a message with the validator's identity keypair (node ID), submit a connection request on Solana that DoubleZero validates, and finally establish an IBRL connection from your server. Follow steps 1–6 to install packages, generate identities, attest ownership, request access, and verify the tunnel is up.

## Prerequisites

- Supported OS: Ubuntu 20.04+ or Debian 11+, or Rocky Linux / RHEL 8+
- Root or sudo privileges on the server where DoubleZero will run
- Solana CLI installed and on PATH
- Access to the validator identity keypair file (e.g., validator-keypair.json) under the sol user
- Outbound network egress to DoubleZero endpoints and Solana RPC for the chosen cluster
- Firewall allows outbound connections for DoubleZero and Solana RPC as needed
- Optional but useful: jq and curl for debugging

## Connecting a Solana Validator to DoubleZero

When onboarding a Solana validator into DoubleZero, start by establishing identities on both sides. On your server, generate a **DoubleZero identity**, represented by a public key called the **service_key**. This key is how DoubleZero recognizes your server.

Next, focus on the validator itself. Each Solana validator has its own **identity keypair**; from this, extract the public key known as the **node ID**. This is the validator's unique fingerprint on the Solana network.

With the service_key and node ID identified, prove ownership. Create a message that includes the service_key and sign it with the validator's keypair. The resulting cryptographic signature serves as verifiable proof that you control the validator.

Finally, submit a **connection request to DoubleZero**. This request communicates: *"Here is my identity, here is proof of ownership, and here is how I intend to connect."* DoubleZero validates the information, accepts the proof, and provisions your validator for network access. From that moment, your validator is fully recognized and authenticated as part of the DoubleZero ecosystem.

## 1. Install DoubleZero Packages

Follow these steps depending on your operating system:

### Ubuntu / Debian

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero=0.6.3-1
```

### Rocky Linux / RHEL

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero-0.6.3
```

After installation, verify the daemon is running:

```bash
sudo systemctl status doublezerod
sudo journalctl -u doublezerod
```

## 2. Create New DoubleZero Identity

Create a DoubleZero identity on your server with the following command:

```bash
doublezero keygen
```

## 3. Retrieve the server's DoubleZero identity

Read your new identity (service_key). This identity will be used to activate your validator on Solana and then create your connection on your server.

```bash
doublezero address
```

**Output:**
```
YourServiceKey11111111111111111111111111111
```

## 4. Attest Validator Ownership

Determine the identity of the Solana validator and create a method to verify ownership. Use the identity keypair together with the standard Solana command to sign an off-chain transaction. This process only verifies ownership of the validator specified in the command.

### Switching to the `sol` User

Before generating the validator ownership signature, you must switch to the `sol` user (or whichever user you normally use to run the validator):

```bash
sudo su - sol
```

This is required because the validator's identity keypair (`validator-keypair.json`) is usually stored under the `sol` user account. Running the command as `sol` ensures:

- You have access to the validator identity keypair without permission errors.
- The signature is generated using the correct keys that your Solana validator actually uses.

In other words, this step is **only needed to sign with your validator identity** and prove ownership.

### Extract the Pubkey from your identity

```bash
solana address -k path/to/validator-keypair.json
```

**Output:**
```
ValidatorIdentity111111111111111111111111111
```

Use the `sign-offchain-message` command to create a way to validate that you are the owner of the validator.

```bash
solana sign-offchain-message -k path/to/validator-keypair.json service_key=YourServiceKey11111111111111111111111111111
```

**Output:**
```
2rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7TFLdLBGsVPmqCH
```

### Exit the Validator User

Exit the `sol` user session (or the user you used for the validator):

```bash
exit
```

## 5. Initiate a Connection Request in DoubleZero

Use the `request-solana-validator-access` command to create an account on Solana for the connection request. The Sentinel agent detects the new account, validates its identity and signature, and creates the access pass in DoubleZero so the server can establish the connection.

Use the node ID, service_key, and signature.

```bash
doublezero-solana passport request-solana-validator-access -u t -v \
  --node-id ValidatorIdentity111111111111111111111111111 \
  --signature kftWCu7rCtVaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEaypn2EJgWAsJ \
  YourServiceKey11111111111111111111111111111
```

**Output:**
```
Raw message: service_key=YourServiceKey11111111111111111111111111111
Signature recovers node ID: ValidatorIdentity111111111111111111111111111 
Request Solana validator access: kftWCu7rCtVaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEaypn2EJgWAsJ 

Url: https://api.testnet.solana.com/
Signer: 7xNwQDtyxmqaZ6VTJ9q4fM15WeScyo8FyeNjBCV9CK9V

Transaction details for 2Xe5U56CUaDooxwiS3ykkU15fi8PhnamvgHERqMxTXWXkzRPbFSqgEhdgUdqhJaHzksho4PzbvA3vREfFyNQ1YAR
  Fee (lamports): 5000
  Compute units: 10366
  Cost units: 11729

  Program logs:
    Program dzpt2dM8g9qsLxpdddnVvKfjkCLVXd82jrrQVJigCPV invoke [1]
    Program log: Initiate access request
    Program 11111111111111111111111111111111 invoke [2]
    Program 11111111111111111111111111111111 success
    Program log: Initialized user access request DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan
    Program dzpt2dM8g9qsLxpdddnVvKfjkCLVXd82jrrQVJigCPV consumed 10216 of 13000 compute units
    Program dzpt2dM8g9qsLxpdddnVvKfjkCLVXd82jrrQVJigCPV success
    Program ComputeBudget111111111111111111111111111111 invoke [1]
    Program ComputeBudget111111111111111111111111111111 success
```

## 6. Connect in IBRL Mode

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

Verify your connection:

```bash
doublezero status
```

**Output:**
```
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
