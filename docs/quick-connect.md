# Quick Connect

Answer a few questions and we'll generate a personalized connection guide with the exact steps and commands for your setup.

!!! note "Simplified Guide"
    This wizard provides key snippets from the full documentation to get you connected as quickly as possible. For complete details, see the [Setup](setup.md) and [Tenant](tenant.md) guides.

<div id="wizard-container">

<div id="wiz-q-network" class="wizard-question">
<h3>Which network are you connecting to?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="network" data-value="mainnet-beta">
<span class="wizard-card-title">Mainnet-Beta</span>
<span class="wizard-card-desc">Production network for active validators and RPC operators</span>
</button>
<button class="wizard-card" data-question="network" data-value="testnet">
<span class="wizard-card-title">Testnet</span>
<span class="wizard-card-desc">Testing and development network</span>
</button>
</div>
</div>

<div id="wiz-q-os" class="wizard-question wizard-hidden">
<h3>What operating system is your server running?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="os" data-value="deb">
<span class="wizard-card-title">Ubuntu / Debian</span>
<span class="wizard-card-desc">Ubuntu 22.04+ or Debian 11+</span>
</button>
<button class="wizard-card" data-question="os" data-value="rpm">
<span class="wizard-card-title">Rocky Linux / RHEL</span>
<span class="wizard-card-desc">Rocky Linux or RHEL 8+</span>
</button>
</div>
</div>

<div id="wiz-q-tenant" class="wizard-question wizard-hidden">
<h3>Which ecosystem?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="tenant" data-value="solana">
<span class="wizard-card-title">Solana</span>
<span class="wizard-card-desc">Validators and RPC operators on Solana</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="shelby" title="Testnet only">
<span class="wizard-card-title">Shelby</span>
<span class="wizard-card-desc">RPCs and Storage Nodes on Shelby (Testnet only)</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="new-tenant">
<span class="wizard-card-title">New Tenant</span>
<span class="wizard-card-desc">Other ecosystems</span>
</button>
</div>
</div>

<div id="wiz-q-firewall" class="wizard-question wizard-hidden">
<h3>Which firewall tool do you use?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="firewall" data-value="iptables">
<span class="wizard-card-title">iptables</span>
<span class="wizard-card-desc">Direct iptables rules</span>
</button>
<button class="wizard-card" data-question="firewall" data-value="ufw">
<span class="wizard-card-title">UFW</span>
<span class="wizard-card-desc">Uncomplicated Firewall</span>
</button>
</div>
</div>

<div id="wiz-q-usertype" class="wizard-question wizard-hidden">
<h3>What type of node are you running?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="usertype" data-value="validator">
<span class="wizard-card-title">Validator</span>
<span class="wizard-card-desc">Leader-scheduled Solana validator with identity keypair</span>
</button>
<button class="wizard-card" data-question="usertype" data-value="rpc">
<span class="wizard-card-title">Non-validator (RPC)</span>
<span class="wizard-card-desc">RPC node or MEV infrastructure</span>
</button>
</div>
</div>

<div id="wiz-q-connection" class="wizard-question wizard-hidden">
<h3>What connection mode do you need?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="connection" data-value="unicast">
<span class="wizard-card-title">Unicast (IBRL)</span>
<span class="wizard-card-desc">Standard point-to-point connection</span>
</button>
<button class="wizard-card" data-question="connection" data-value="multicast">
<span class="wizard-card-title">Multicast</span>
<span class="wizard-card-desc">One-to-many packet delivery (publisher/subscriber)</span>
</button>
<button class="wizard-card" data-question="connection" data-value="both">
<span class="wizard-card-title">Both</span>
<span class="wizard-card-desc">Simultaneous unicast and multicast tunnels</span>
</button>
</div>
</div>

<div id="wiz-q-multicastrole" class="wizard-question wizard-hidden">
<h3>What is your multicast role?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="multicastrole" data-value="publisher">
<span class="wizard-card-title">Publisher</span>
<span class="wizard-card-desc">Send data to a multicast group (e.g., block producer)</span>
</button>
<button class="wizard-card" data-question="multicastrole" data-value="subscriber">
<span class="wizard-card-title">Subscriber</span>
<span class="wizard-card-desc">Receive data from a multicast group</span>
</button>
</div>
</div>

</div>

<div id="wizard-summary" class="wizard-hidden"></div>

<div id="wizard-output" class="wizard-hidden"></div>
