# How to connect to DoubleZero - for testnet Users
## Prerequisites
- x86_64 server running Ubuntu or Rocky (doublezero uses minimal system resources and should run with no issue on any modern bare metal machine)
- Internet connectivity with a public IP address (no NAT)
- Your host firewall must allow inbound GRE (IP protocol 47) and BGP (TCP port 179).
- Solana CLI (optional)
- A Solana account for use with DoubleZero, with a balance of at least 1 SOL - refer to Solana docs

## Steps
### 1. Set up apt repo
DoubleZero is an open source project hosted on GitHub. Releases are built into binaries that are pushed to Cloudsmith.io, which distributes the binaries for both Debian-flavor and RedHat-flavor Linux systems. Add the repository to your system using the appropriate commands below for your operating system:

Ubuntu / Debian:
```
curl -1sLf \
  https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh \
  | sudo -E bash
```
Rocky / Redhat:
```
curl -1sLf \
  https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh \
  | sudo -E bash
```

### 2. Install doublezero
!!! note inline end
    After this step you can perform doublezero read operations, such as `doublezero device list`.

Now that we have the repo set up, we can install DoubleZero and start the DoubleZero daemon process (doublezerod) using the appropriate commands below for your operating system:

Ubuntu / Debian:
```
sudo apt-get install doublezero=0.0.19-1
```
Rocky / Redhat:
```
sudo yum install doublezero-0.0.19
```

After the package is installed, a new systemd unit is installed, activated and started.  To see the status:

```
sudo systemctl status doublezerod
```

To see the doublezerod logs, look in the journal:
```
sudo journalctl -u doublezerod
```


### 3. Create doublezero config directory
!!! note inline end
    Replace [MY_CLIENT_IP] with your server's publicly routable IP address
```
mkdir -p ~/.config/doublezero --client-ip [MY_CLIENT_IP]
```

### 4. Copy your Solana id.json to the doublezero config directory.
The smart contract program for DoubleZero testnet is installed on Solana devnet.  The DoubleZero command line interface expects that you have a Solana devnet wallet with >= 1 SOL.

Copy the `id.json` associated with your devnet wallet to the config directory.
```
cp </path/to/id.json> ~/.config/doublezero 
```

### 5. Verify that doublezero is talking to the correct Solana cluster
```
doublezero config get

```

Expected result:
```
Config File: /home/ubuntu/.config/doublezero/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com
Keypair Path: "/home/ubuntu/.config/doublezero/id.json" 
```

### 6. Connect
This step signs a doublezero smart contract and connects the system to the lowest-latency doublezero node available.
```
doublezero connect
```

Congratulaions, your DoubleZero connection is up and running! We hope. Let's run a few more commands to make sure everything is working.

### 7. Verify tunnel interface
!!! note end inline
    This will be replaced by a `doublezero status` CLI command.
```
ip link show doublezero0
```
Expected result: Interface details like IP address

Error result: `Device "doublezero0" does not exist`

### 8. Verify routing link address in routing table
!!! note end inline
    This will be replaced by a `doublezero status` CLI command.
```
ip route show dev doublezero0
```
Expected result: `169.254.0.12/31 proto kernel scope link src 169.254.0.13`
