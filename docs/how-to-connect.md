# How to connect to DoubleZero - for testnet Users
[TOC]
# Prerequisites
TODO: Make this look less ugly 

- x86_64 server running Ubuntu or Rocky (doublezero uses minimal system resources and should run with no issue on any modern bare metal machine)
- Public IP address (no NAT) (MY_PUBLIC_IP below)
- Your host firewall must allow inbound BGP traffic (TCP port 179)
- Solana CLI (optional)
- A Solana account for use with DoubleZero  a balance of at least 1 SOL - refer to Solana docs

# Steps
### 1. Set up apt repo###
DoubleZero is an open source project hosted on GitHub. Releases are built into binaries that are pushed to Cloudsmith.io, which distributes the binaries for both Debian-flavor and RedHat-flavor Linux systems. Add the repository to your system using the appropriate commands below for your operating system:

Ubuntu / Debian:
```
curl -1sLf \
  https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh' \
  | sudo -E bash
```
Rocky / Redhat:
```
curl -1sLf \
  https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh' \
  | sudo -E bash
```

### 2. Install doublezero ###
Now that we have the repo set up, we can install DoubleZero and start the DoubleZero daemon process (doublezerod) using the appropriate commands below for your operating system:

Ubuntu / Debian:
```
sudo apt-get install doublezero
```
Rocky / Redhat:
```
sudo yum install doublezero
```
NOTE: You can already perform doublezero read operations, such as running `doublezero device list`, at this point.

### 3. Create doublezero config directory ###
```
mdkir -p ~/.config/doublezero
```

### 4. Copy your Solana id.json to the doublezero config directory. ###
```
cp </path/to/id.json> ~/.config/doublezerro 
```

### 5. Verify that doublezero is talking to the correct Solana cluster ###
```
doublezero config get

```
### 6. Connect ###
This step signs a doublezero smart contract and connects the system to the lowest-latency doublezero node available. (replace MY_PUBLIC_IP)
```
doublezero connect --client-ip MY_PUBLIC_IP
```

Congratulaions, your DoubleZero connection is up and running! We hope. Let's run a few more commands to make sure everything is working.

> [!NOTE]
> Update this when we have built a cli command for viewing status

### 7. Verify tunnel interface ###
```
ip link show doublezero01
```
Expected result: Interface details like IP address
Error result: `Device "doublezero01" does not exist`

### 8. Verify routing link address in routing table ###
```
ip route show dev doublezero01
```
Expected result: `169.254.0.12/31 proto kernel scope link src 169.254.0.13`

### 9. Verify BGP session ###
```
???
```
Expected result: ???

# Frequently Asked Questions (FAQs)
## FAQ 1. How can I update to the latest version of doublezero?
Ubuntu / Debian:
```
sudo apt-get upgrade doublezero
```
Rocky / Redhat:
```
sudo yum upgrade doublezero
```

## FAQ 2. How can I uninstall doublezero from my system?
Ubuntu / Debian:
```
sudo apt-get reomve doublezero
```
Rocky / Redhat:
```
sudo yum remove doublezero
```

## FAQ 3. What happens under the hood when I run `doublezero connect`? 
1. [doublezero CLI] doublezero connect adds the user account on smartcontract in pending status and waits
1. [activator] activatord will assign IPs and change the status to activated
1. [doublezero CLI] The CLI will detect the activation, collects the network info
1. [doublezero CLI] The CLI calls doublezerod /provision over socket
1. [doublezerod] doublezerod collects the info from the smart contract provisions the server's network resources - rules, routes, tunnels, neighbors
1. [controller] controller polls the smartcontract every 10s and updates its config cache
1. [eosagent] eosagents on all switches poll controller and deploy any new config every 5 seconds

## 4. How can I connect to a specific doublezero node instead of letting the system pick the closest one?
???