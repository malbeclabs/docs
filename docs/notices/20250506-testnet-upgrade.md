## Background

On May 6, 2025 at approximately 15:00 UTC, Malbec Labs will perform service-impacting maintenance on the DoubleZero testnet-beta network so we can bring new functionality to users.  We generally aim to conduct maintenance without impacting user traffic.  However, since this maintenance will cause all DoubleZero users to change their IP addresses and move all of the smart contract components to a new private cluster, there is no practical way to make this change without a brief outage.


## What's changing?

1. We are moving our smart contract programs from Solana devnet to a private cluster running a Solana fork that we will refer to as the DoubleZero ledger.  As a result we will be transferring SOL from the DoubleZero ledger to all of the addresses that are presently in the user allowlist.  Please continue to use the same keypair you've been using on Solana devnet to interact with the new DoubleZero ledger.
2. We are updating the DoubleZero client and CLI to target the new cluster by default.  The client release also contains several bugfixes that have been identified since our launch.
3. Network contributors will redefine their devices and links on the DoubleZero ledger.  Previously this was done with centrally owned keys.
4. The Controller component is being upgraded to render configuration that enables IBRL mode.  When connecting with IBRL mode, validator operators will be able to user their existing public IP on both the public internet and on DoubleZero.
5. The Activator component is being upgraded to allow address assignment from multiple IP prefixes when users request a new IP to be allocated.
6. Network contributors will add the necessary protocol configuration to support multicast testing on testnet.


## Upgrade procedure

In order to minimize downtime to your Solana testnet and/or Solana mainnet-beta validator nodes that are currently connected to DoubleZero, please follow the steps below.  Most of the work can happen at any point before the maintenance event.


### Reconfigure your validator to use the public IP assigned by your hosting provider

At any time between reading this notice and 2025-05-06 15:00:00 UTC:
- Reconfigure your validator to bind to your hosting provider’s public IP (usually this is on bond0).

In Jito and Agave:

- Remove any specific `--bind-address` or `--gossip-host` config parameters that reference your current DoubleZero IP address
- Restart the validator and confirm it is using the correct IP address for both TPU and gossip.


### Disconnect from DoubleZero testnet-beta
!!! note inline end
    If you do not manually disconnect, you will be force-disconnected prior to the maintenance starting and any attempts to generate new user contracts will be rejected.

Using doublezero package version 0.0.22, disconnect your user tunnel any time prior to 2025-05-06 15:00:00 UTC

```
doublezero disconnect
```

### &#x1F6A7; Stop here until after maintenance concludes

At this point, your validator should be up and running on the public internet.  Once the maintenance concludes, you will be notified by the DoubleZero Foundation to proceed with the client side upgrade and reconnection.


### Upgrade the DoubleZero client and CLI

After receiving notice from DoubleZero Foundation that the maintenance has concluded, please upgrade your `doublezero` package.

Update apt cache:
```
sudo apt-get update
```

Upgrade doublezero package to `0.1.0`:
```
sudo apt-get install doublezero=0.1.0-1
```

### Restart doublezerod

Restart doublezerod:
```
sudo systemctl restart doublezerod.service
```

### Check that you have SOL in your account on the DoubleZero ledger

In order to interact on the DoubleZero ledger, you need SOL for transaction fees.  If your balance is 0, contact the DoubleZero Foundation.

```
doublezero balance
```

Sample output:
```
$ doublezero balance
1.9981754 SOL
```

### Reconnect to DoubleZero testnet-beta
!!! note inline end
	The command to connect has changed to reflect a new mode of operation known as IBRL mode.

After receiving notice from DoubleZero Foundation that the maintenance has concluded, please reconnect to DoubleZero.  

Reconnect to DZ testnet using `doublezero connect ibrl`

```
doublezero connect ibrl
```

This will cause your host to connect to the closest DZ testnet switch and establish a BGP session to receive routes from DoubleZero which will be installed into the main kernel routing table

Sample output:
```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
    Get your Public IP: 137.174.145.147 (If you want to specify a particular address, use the argument --client-ip x.x.x.x)
🔍  Provisioning User for IP: 137.174.145.147
    Creating an account for the IP: 137.174.145.147
    The Device has been selected: chi-dn-dzd3 
    User activated with dz_ip: 137.174.145.147
Provisioning: status: ok
/  Connected  
```

Connecting in IBRL mode does not require restarting the Jito or Agave clients because your public IP will now be advertised to DoubleZero so that other users on DoubleZero will route via the DoubleZero network when sending to your validator.  Likewise, the routes received from DoubleZero and installed in the kernel routing table cause your validator to send to other DoubleZero-enabled validators over the DoubleZero network.

Confirm connectivity by running:

- `doublezero status` : “Tunnel status: up”
- `ip route` : should now contain several /32 routes for other DoubleZero users


### Need help?

Please reach out to the DoubleZero team via Slack with any questions.