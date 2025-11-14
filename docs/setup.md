# How to set up DoubleZero
!!! warning "By connecting to the DoubleZero I agree to the [DoubleZero Terms of Service](https://doublezero.xyz/terms-protocol)"


## Prerequisites
!!! warning inline end
    DoubleZero needs to be installed directly on your validator host, not in a container.
- Internet connectivity with a public IP address (no NAT)
- x86_64 server 
- Supported OS: Ubuntu 22.04+ or Debian 11+, or Rocky Linux / RHEL 8+
- Root or sudo privileges on the server where DoubleZero will run
- Solana CLI installed and on $PATH
- Permission to access to the validator identity keypair file (e.g., validator-keypair.json) under the sol user
- Verify the Identity key of Solana validator being connected has at least 1 SOL on it
- Firewall rules permit outbound connections for DoubleZero and Solana RPC as needed including 
 GRE (ip proto 47) and BGP (169.254.0.0/16 on tcp/179)
- Optional but useful: jq and curl for debugging


## Steps
## Connecting a Solana Validator to DoubleZero

When onboarding a Solana validator onto DoubleZero, start by establishing identities. On your server, generate a **DoubleZero identity**, represented by a public key called the **DoubleZero ID**. This key is how DoubleZero recognizes your server.

Next, focus on the validator itself. Each Solana validator has its own **identity keypair**; from this, extract the public key known as the **node ID**. This is the validator's unique fingerprint on the Solana network.

With the DoubleZeroID and node ID identified, prove ownership. Create a message that includes the DoubleZeroID and sign it with the validator's identity key. The resulting cryptographic signature serves as verifiable proof that you control the validator.

Finally, submit a **connection request to DoubleZero**. This request communicates: *"Here is my identity, here is proof of ownership, and here is how I intend to connect."* DoubleZero validates this information, accepts the proof, and provisions network access for the validator on DoubleZero.

## 1. Install or Upgrade DoubleZero Packages

Follow these steps depending on your operating system:

### Ubuntu / Debian

The current recomended deployment for Mainnet-Beta is:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero=0.6.9-1
```

The current recomended deployment for Testnet is:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero=0.7.0-1
```

To upgrade either Mainnet-Beta or Testnet:
```
sudo apt-get install --only-upgrade doublezero
```

### Rocky Linux / RHEL

The current recomended deployment for Mainnet-Beta is:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero-0.6.9
```

The current recomended deployment for Testnet is:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero-0.7.0
```

After installation, verify the daemon is running:

```bash
sudo systemctl status doublezerod
sudo journalctl -u doublezerod
```

To upgrade:
```bash
sudo yum upgrade doublezero
```

#### Check the status of `doublezerod`

After the package is installed, a new systemd unit is installed, activated and started.  To see the status:
```
sudo systemctl status doublezerod
```
To see the doublezerod logs, look in the journal:
```
sudo journalctl -u doublezerod
```

#### Create doublezero config directory

```
mkdir -p ~/.config/doublezero
```

####Add your Solana id.json to the doublezero config directory and check balance

Copy or link the `id.json` you want to use with DoubleZero to the doublezero config directory.

```
sudo cp </path/to/id.json> ~/.config/doublezero/
```

## 2. Create New DoubleZero Identity


!!! note inline end
    If you have an existing DoubleZero Identity skip to step 3





Create a DoubleZero Identity on your server with the following command:


```bash
doublezero keygen
```

## 3. Retrieve the server's DoubleZero identity

Review your DoubleZero Identity. This identity will be used to create the connection between your validator and DoubleZero

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

In the next sections you will set your DoubleZero Enviroment. In order to ensure success, disconnect the current session. This will avoid issues related to multiple tunnels open on your machine.

Check 

```bash
doublezero status
``` 

if it is `up` run:

```bash
doublezero disconnect
```


### Up Next: Enviroment and Connection

You may proceed to connecting to DoubleZero [Testnet](DZ%20Testnet%20Connection.md), [Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) or [multicast mode](connect-multicast.md). It may take up to one minute for the tunnel to connect, and you will need to complete some steps to register your validator on the DoubleZero Network.

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
