# Connessione Rapida

Rispondi ad alcune domande e genereremo una guida di connessione personalizzata con i passaggi esatti e i comandi per la tua configurazione.

!!! note "Guida Semplificata"
    Questo wizard fornisce snippet chiave dalla documentazione completa per connetterti il più rapidamente possibile. Per dettagli completi, consulta le guide [Setup](setup.md) e [Tenant](tenant.md).

<div id="wizard-container">

<div id="wiz-q-network" class="wizard-question">
<h3>A quale rete ti stai connettendo?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="network" data-value="mainnet-beta">
<span class="wizard-card-title">Mainnet-Beta</span>
<span class="wizard-card-desc">Rete di produzione per validatori attivi e operatori RPC</span>
</button>
<button class="wizard-card" data-question="network" data-value="testnet">
<span class="wizard-card-title">Testnet</span>
<span class="wizard-card-desc">Rete di test e sviluppo</span>
</button>
</div>
</div>

<div id="wiz-q-os" class="wizard-question wizard-hidden">
<h3>Quale sistema operativo utilizza il tuo server?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="os" data-value="deb">
<span class="wizard-card-title">Ubuntu / Debian</span>
<span class="wizard-card-desc">Ubuntu 22.04+ o Debian 11+</span>
</button>
<button class="wizard-card" data-question="os" data-value="rpm">
<span class="wizard-card-title">Rocky Linux / RHEL</span>
<span class="wizard-card-desc">Rocky Linux o RHEL 8+</span>
</button>
</div>
</div>

<div id="wiz-q-tenant" class="wizard-question wizard-hidden">
<h3>Quale ecosistema?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="tenant" data-value="solana">
<span class="wizard-card-title">Solana</span>
<span class="wizard-card-desc">Validatori e operatori RPC su Solana</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="shelby" title="Solo Testnet">
<span class="wizard-card-title">Shelby</span>
<span class="wizard-card-desc">RPC e Nodi di Storage su Shelby (solo Testnet)</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="new-tenant">
<span class="wizard-card-title">Nuovo Tenant</span>
<span class="wizard-card-desc">Altri ecosistemi</span>
</button>
</div>
</div>

<div id="wiz-q-firewall" class="wizard-question wizard-hidden">
<h3>Quale strumento firewall utilizzi?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="firewall" data-value="iptables">
<span class="wizard-card-title">iptables</span>
<span class="wizard-card-desc">Regole iptables dirette</span>
</button>
<button class="wizard-card" data-question="firewall" data-value="ufw">
<span class="wizard-card-title">UFW</span>
<span class="wizard-card-desc">Uncomplicated Firewall</span>
</button>
</div>
</div>

<div id="wiz-q-usertype" class="wizard-question wizard-hidden">
<h3>Che tipo di nodo stai eseguendo?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="usertype" data-value="validator">
<span class="wizard-card-title">Validatore</span>
<span class="wizard-card-desc">Validatore Solana con pianificazione leader e keypair di identità</span>
</button>
<button class="wizard-card" data-question="usertype" data-value="rpc">
<span class="wizard-card-title">Non-validatore (RPC)</span>
<span class="wizard-card-desc">Nodo RPC o infrastruttura MEV</span>
</button>
</div>
</div>

<div id="wiz-q-connection" class="wizard-question wizard-hidden">
<h3>Di quale modalità di connessione hai bisogno?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="connection" data-value="unicast">
<span class="wizard-card-title">Unicast (IBRL)</span>
<span class="wizard-card-desc">Connessione punto-a-punto standard</span>
</button>
<button class="wizard-card" data-question="connection" data-value="multicast">
<span class="wizard-card-title">Multicast</span>
<span class="wizard-card-desc">Consegna di pacchetti one-to-many (publisher/subscriber)</span>
</button>
<button class="wizard-card" data-question="connection" data-value="both">
<span class="wizard-card-title">Entrambe</span>
<span class="wizard-card-desc">Tunnel unicast e multicast simultanei</span>
</button>
</div>
</div>

<div id="wiz-q-multicastrole" class="wizard-question wizard-hidden">
<h3>Qual è il tuo ruolo multicast?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="multicastrole" data-value="publisher">
<span class="wizard-card-title">Publisher</span>
<span class="wizard-card-desc">Invia dati a un gruppo multicast (es. produttore di blocchi)</span>
</button>
<button class="wizard-card" data-question="multicastrole" data-value="subscriber">
<span class="wizard-card-title">Subscriber</span>
<span class="wizard-card-desc">Ricevi dati da un gruppo multicast</span>
</button>
</div>
</div>

</div>

<div id="wizard-summary" class="wizard-hidden"></div>

<div id="wizard-output" class="wizard-hidden"></div>
