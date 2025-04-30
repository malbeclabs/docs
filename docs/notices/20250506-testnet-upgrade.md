## Background

On May 6, 2025 at approximately 15:00 UTC the DoubleZero testnet-beta network will undergo service-impacting maintenance to provide new functionality to users.  We generally aim to conduct maintenance without impacting user traffic.  However, since this maintenance will cause all DoubleZero users to change their IP address, there is no practical way to make this change without a brief outage.

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

Connecting in IBRL mode does not require restarting the Jito or Agave clients because your public IP is now be advertised to DoubleZero so that other users on DoubleZero will route via the DoubleZero network when sending to your validator.  Likewise, the routes received from DoubleZero and installed in the kernel routing table cause your validator to send to other DoubleZero-enabled validators over the DoubleZero network.

Confirm connectivity by running:

- `doublezero status` : “Tunnel status: up”
- `ip route` : should now contain several /32 routes for other DoubleZero users


### Need help?

Please reach out to the DoubleZero team via Slack with any questions.