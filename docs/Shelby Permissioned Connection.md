# Connection to DoubleZero in IBRL Mode - for Permissioned Users
!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Service](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### Permissioned User Onboarding Overview

Shelby user onboarding is currently permissioned. To begin the permissioned flow, please fill out [this form](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z). Here is what to expect during this process:

- There may be fees associated with Permissioned User usage in the future.
- After form submission monitor your primary Telegram contact.
- At this moment Shelby is only able to connect to DoubleZero Testnet.

</div>

###  Connecting to Testnet in IBRL Mode

Shelby permissioned users will complete connection to DoubleZero Testnet, which is detailed on this page.

## 1. Environment Configuration

Please follow the [setup](setup.md) instructions before proceeding.

The last step in setup was to disconnect from the network. This is to ensure that only one tunnel is open on your machine to DoubleZero, and that tunnel is on the correct network.

To configure the DoubleZero Client CLI (`doublezero`) to connect to the Shelby tenant on DoubleZero :
```bash
doublezero config set --tenant shelby
```

Apply additional Firewall rules specific to Shelby:

iptables:
```
sudo iptables -A INPUT -i doublezero0 -p tcp --dport 39431 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 39431 -j DROP
```

UFW:
```
sudo ufw allow in on doublezero0 to any port 39431 proto tcp
sudo ufw deny in to any port 39431 proto tcp
```

## 2. Contact the DoubleZero Foundation

The DoubleZero foundation. You will need to provide your `DoubleZeroID`, and the `public ipv4 address` you will be connecting from.


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. Connect in IBRL Mode

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
Output:

```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```


</div>
