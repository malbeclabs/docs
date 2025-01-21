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