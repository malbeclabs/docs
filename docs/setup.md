# How to set up DoubleZero

!!! info "Terminology"
    New to DoubleZero? See the [Glossary](glossary.md) for definitions of terms like [doublezerod](glossary.md#doublezerod), [IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency), and [DZD](glossary.md#dzd-doublezero-device).

!!! warning "By connecting to the DoubleZero I agree to the [DoubleZero Terms of Service](https://doublezero.xyz/terms-protocol)"


## Prerequisites
!!! warning inline end
    For validators: DoubleZero needs to be installed directly on your validator host, not in a container.
- Internet connectivity with a public IP address (no NAT)
- x86_64 server
- Supported OS: Ubuntu 22.04+ or Debian 11+, or Rocky Linux / RHEL 8+
- Root or sudo privileges on the server where DoubleZero will run
- Optional but useful: jq and curl for debugging

## Connecting to DoubleZero

DoubleZero Testnet and DoubleZero Mainnet-Beta are physically distinct networks. Please choose the appropriate network during install.

When onboarding to DoubleZero you will establish a **DoubleZero identity**, represented by a public key called the **DoubleZero ID**. This key is pat of how DoubleZero recognizes your machine.

## 1. Install DoubleZero Packages

<div data-wizard-step="install-version-info" markdown>

!!! info "Current Versions"
    | Package | Mainnet-Beta | Testnet |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |

</div>

Follow these steps depending on your operating system:

### Ubuntu / Debian

<div data-wizard-step="install-deb-mainnet-beta" markdown>

The current recommended deployment for Mainnet-Beta is:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

<div data-wizard-step="install-deb-testnet" markdown>

The current recommended deployment for Testnet is:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

### Rocky Linux / RHEL

<div data-wizard-step="install-rpm-mainnet-beta" markdown>

The current recommended deployment for Mainnet-Beta is:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-rpm-testnet" markdown>

The current recommended deployment for Testnet is:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-network-warning" markdown>

??? info "Changing packege from *Testnet to Mainnet-Beta*, or *Mainnet-Beta to Testnet*"
    When you install from one of the package repositories above it is specific to DoubleZero **Testnet** or **DoubleZero Mainnet Beta**. If you swap networks at any point you will need to remove the previously installed package repositories and update to the target repo.

    This example will walk through Testnet to Mainnet-Beta Migration

    The same steps may be completed to move from Mainnet-Beta to Testnet, by replacing the step 3 with the the install command for Testnet above.


    1. Find Old Repository Files

        First, locate any existing DoubleZero repository configuration files on your system:

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. Remove Old Repository Files

        Remove the old repository files found in the previous step, for example

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. Install from New Repository

        Add the new Mainnet-Beta repository and install the latest package:

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<current_recomended_version_above>
        ```


</div>

<div data-wizard-step="install-verify-daemon" markdown>

#### Check the status of `doublezerod`

After the package is installed, a new systemd unit is installed, activated and started. To see the status you may run:
```
sudo systemctl status doublezerod
```

</div>

### Configure Firewall for GRE and BGP

DoubleZero uses GRE tunneling (IP protocol 47) and BGP routing (tcp/179 on link-local addresses). Ensure your firewall allows these protocols:

Allow GRE and BGP through iptables:

<div data-wizard-step="firewall-gre-bgp-iptables" markdown>

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```

</div>

Or allow GRE and BGP through UFW:

<div data-wizard-step="firewall-gre-bgp-ufw" markdown>

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```

</div>

## 2. Create New DoubleZero Identity

Create a DoubleZero Identity on your server with the following command:

```bash
doublezero keygen
```

!!! info
    If you have an existing ID you would like to use, you may follow these optional steps.

    Create doublezero config directory

    ```
    mkdir -p ~/.config/doublezero
    ```

    Copy or link the `id.json` you want to use with DoubleZero to the doublezero config directory.

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```
## 3. Retrieve the server's DoubleZero identity

Review your DoubleZero Identity. This identity will be used to create the connection between your machine and DoubleZero

```bash
doublezero address
```

**Output:**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. Check that doublezerod has discovered DZ devices

Before connecting, be sure `doublezerod` has discovered and pinged each of the available DZ testnet switches:

```
doublezero latency
```

Sample output:

```
$ doublezero latency
 pubkey                                       | name      | ip             | min      | max      | avg      | reachable
 96AfeBT6UqUmREmPeFZxw6PbLrbfET51NxBFCCsVAnek | la2-dz01  | 207.45.216.134 |   0.38ms |   0.45ms |   0.42ms | true
 CCTSmqMkxJh3Zpa9gQ8rCzhY7GiTqK7KnSLBYrRriuan | ny5-dz01  | 64.86.249.22   |  68.81ms |  68.87ms |  68.85ms | true
 BX6DYCzJt3XKRc1Z3N8AMSSqctV6aDdJryFMGThNSxDn | ty2-dz01  | 180.87.154.78  | 112.16ms | 112.25ms | 112.22ms | true
 55tfaZ1kRGxugv7MAuinXP4rHATcGTbNyEKrNsbuVLx2 | ld4-dz01  | 195.219.120.66 | 138.15ms | 138.21ms | 138.17ms | true
 3uGKPEjinn74vd9LHtC4VJvAMAZZgU9qX9rPxtc6pF2k | ams-dz001 | 195.219.138.50 | 141.84ms | 141.97ms | 141.91ms | true
 65DqsEiFucoFWPLHnwbVHY1mp3d7MNM2gNjDTgtYZtFQ | frk-dz01  | 195.219.220.58 | 143.52ms | 143.62ms | 143.58ms | true
 9uhh2D5c14WJjbwgM7BudztdoPZYCjbvqcTPgEKtTMZE | sg1-dz01  | 180.87.102.98  | 176.66ms | 176.76ms | 176.72ms | true
```

If no devices are returned in the output, wait 10-20 seconds and retry.

## 5. Disconnect from DoubleZero

In the next sections you will set your DoubleZero Environment. In order to ensure success, disconnect the current session. This will avoid issues related to multiple tunnels open on your machine.

Check

```bash
doublezero status
```

if it is `up` run:

```bash
doublezero disconnect
```

### Up Next: Tenant

Connection to DoubleZero will differ based on your use case. On DoubleZero, Tenants are groups which have similiar user profiles. Examples include Blockchains, Data Transfer Layers, etc.

### [Proceed to chose your tenant here](tenant.md)


# Optional: Enable Prometheus Metrics

Operators familiar with Prometheus metrics may want to enable them for DoubleZero monitoring. This provides visibility into DoubleZero client performance, connection status, and operational health.

## What Metrics Are Available

DoubleZero exposes several key metrics:
- **Build Information**: Version, commit hash, and build date
- **Session Status**: Whether the DoubleZero session is active
- **Connection Metrics**: Latency and connectivity information
- **Performance Data**: Throughput and error rates

## Enable Prometheus Metrics

To enable Prometheus metrics on the DoubleZero client follow these steps:

### 1. Modify the doublezerod systemd service startup command

Create or edit the systemd override configuration:

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

Replace with this configuration:

Note that the `-env` flag needs to point to either `testnet` or `mainnet-beta` depending on which network you would like to gather data from. In the sample block `testnet` is used. You may swap this out for `mainnet-beta` if needed.

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env testnet -metrics-enable -metrics-addr localhost:2113
```

### 2. Reload and restart the service

```bash
sudo systemctl daemon-reload
sudo systemctl restart doublezerod
sudo systemctl status doublezerod
```

### 3. Verify metrics are available

Test that the metrics endpoint is responding:

```bash
curl -s localhost:2113/metrics | grep doublezero
```

Expected output:

```
# HELP doublezero_build_info Build information of the client
# TYPE doublezero_build_info gauge
doublezero_build_info{commit="0d684e1b",date="2025-09-10T16:30:25Z",version="0.6.4"} 1
# HELP doublezero_session_is_up Status of session to doublezero
# TYPE doublezero_session_is_up gauge
doublezero_session_is_up 0
```
## Troubleshooting

If metrics are not appearing:

1. **Check service status**: `sudo systemctl status doublezerod`
2. **Verify configuration**: `sudo systemctl cat doublezerod`
3. **Check logs**: `sudo journalctl -u doublezerod -f`
4. **Test endpoint**: `curl -v localhost:2113/metrics`
5. **Verify port**: `netstat -tlnp | grep 2113`


## Configure Prometheus Server

Configuration, and security are beyond the scope of this documentation.
Grafana is an excellent option for visualization, and has documentation available [here](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/) detailing how to collect Prometheus metrics.

## Grafana Dashboard (Optional)

For visualization, you can create a Grafana dashboard using the DoubleZero metrics. Common panels include:
- Session status over time
- Build information
- Connection latency trends
- Error rate monitoring
