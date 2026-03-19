# Connexion Rapide
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


Répondez à quelques questions et nous générerons un guide de connexion personnalisé avec les étapes et commandes exactes pour votre configuration.

!!! note "Guide Simplifié"
    Cet assistant fournit des extraits clés de la documentation complète pour vous connecter aussi rapidement que possible. Pour des détails complets, consultez les guides [Configuration](setup.md) et [Tenant](tenant.md).

<div id="wizard-container">

<div id="wiz-q-network" class="wizard-question">
<h3>À quel réseau vous connectez-vous ?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="network" data-value="mainnet-beta">
<span class="wizard-card-title">Mainnet-Beta</span>
<span class="wizard-card-desc">Réseau de production pour les validateurs actifs et les opérateurs RPC</span>
</button>
<button class="wizard-card" data-question="network" data-value="testnet">
<span class="wizard-card-title">Testnet</span>
<span class="wizard-card-desc">Réseau de test et de développement</span>
</button>
</div>
</div>

<div id="wiz-q-os" class="wizard-question wizard-hidden">
<h3>Quel système d'exploitation votre serveur utilise-t-il ?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="os" data-value="deb">
<span class="wizard-card-title">Ubuntu / Debian</span>
<span class="wizard-card-desc">Ubuntu 22.04+ ou Debian 11+</span>
</button>
<button class="wizard-card" data-question="os" data-value="rpm">
<span class="wizard-card-title">Rocky Linux / RHEL</span>
<span class="wizard-card-desc">Rocky Linux ou RHEL 8+</span>
</button>
</div>
</div>

<div id="wiz-q-tenant" class="wizard-question wizard-hidden">
<h3>Quel écosystème ?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="tenant" data-value="solana">
<span class="wizard-card-title">Solana</span>
<span class="wizard-card-desc">Validateurs et opérateurs RPC sur Solana</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="shelby" title="Testnet only">
<span class="wizard-card-title">Shelby</span>
<span class="wizard-card-desc">RPC et Nœuds de Stockage sur Shelby (Testnet uniquement)</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="new-tenant">
<span class="wizard-card-title">Nouveau Tenant</span>
<span class="wizard-card-desc">Autres écosystèmes</span>
</button>
</div>
</div>

<div id="wiz-q-firewall" class="wizard-question wizard-hidden">
<h3>Quel outil de pare-feu utilisez-vous ?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="firewall" data-value="iptables">
<span class="wizard-card-title">iptables</span>
<span class="wizard-card-desc">Règles iptables directes</span>
</button>
<button class="wizard-card" data-question="firewall" data-value="ufw">
<span class="wizard-card-title">UFW</span>
<span class="wizard-card-desc">Uncomplicated Firewall</span>
</button>
</div>
</div>

<div id="wiz-q-usertype" class="wizard-question wizard-hidden">
<h3>Quel type de nœud exécutez-vous ?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="usertype" data-value="validator">
<span class="wizard-card-title">Validateur</span>
<span class="wizard-card-desc">Validateur Solana planifié par leader avec keypair d'identité</span>
</button>
<button class="wizard-card" data-question="usertype" data-value="rpc">
<span class="wizard-card-title">Non-validateur (RPC)</span>
<span class="wizard-card-desc">Nœud RPC ou infrastructure MEV</span>
</button>
</div>
</div>

<div id="wiz-q-connection" class="wizard-question wizard-hidden">
<h3>De quel mode de connexion avez-vous besoin ?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="connection" data-value="unicast">
<span class="wizard-card-title">Unicast (IBRL)</span>
<span class="wizard-card-desc">Connexion point à point standard</span>
</button>
<button class="wizard-card" data-question="connection" data-value="multicast">
<span class="wizard-card-title">Multicast</span>
<span class="wizard-card-desc">Livraison de paquets un-vers-plusieurs (éditeur/abonné)</span>
</button>
<button class="wizard-card" data-question="connection" data-value="both">
<span class="wizard-card-title">Les deux</span>
<span class="wizard-card-desc">Tunnels unicast et multicast simultanés</span>
</button>
</div>
</div>

<div id="wiz-q-multicastrole" class="wizard-question wizard-hidden">
<h3>Quel est votre rôle multicast ?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="multicastrole" data-value="publisher">
<span class="wizard-card-title">Éditeur</span>
<span class="wizard-card-desc">Envoyer des données à un groupe multicast (p. ex., producteur de blocs)</span>
</button>
<button class="wizard-card" data-question="multicastrole" data-value="subscriber">
<span class="wizard-card-title">Abonné</span>
<span class="wizard-card-desc">Recevoir des données d'un groupe multicast</span>
</button>
</div>
</div>

</div>

<div id="wizard-summary" class="wizard-hidden"></div>

<div id="wizard-output" class="wizard-hidden"></div>
