# Conexão Rápida
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


Responda algumas perguntas e geraremos um guia de conexão personalizado com as etapas e comandos exatos para sua configuração.

!!! note "Guia Simplificado"
    Este assistente fornece trechos principais da documentação completa para conectá-lo o mais rápido possível. Para detalhes completos, consulte os guias de [Configuração](setup.md) e [Tenant](tenant.md).

<div id="wizard-container">

<div id="wiz-q-network" class="wizard-question">
<h3>A qual rede você está se conectando?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="network" data-value="mainnet-beta">
<span class="wizard-card-title">Mainnet-Beta</span>
<span class="wizard-card-desc">Rede de produção para validadores ativos e operadores de RPC</span>
</button>
<button class="wizard-card" data-question="network" data-value="testnet">
<span class="wizard-card-title">Testnet</span>
<span class="wizard-card-desc">Rede de teste e desenvolvimento</span>
</button>
</div>
</div>

<div id="wiz-q-os" class="wizard-question wizard-hidden">
<h3>Qual sistema operacional seu servidor está executando?</h3>
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
<h3>Qual ecossistema?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="tenant" data-value="solana">
<span class="wizard-card-title">Solana</span>
<span class="wizard-card-desc">Validadores e operadores de RPC na Solana</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="shelby" title="Testnet only">
<span class="wizard-card-title">Shelby</span>
<span class="wizard-card-desc">RPCs e Nós de Armazenamento no Shelby (apenas Testnet)</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="new-tenant">
<span class="wizard-card-title">Novo Tenant</span>
<span class="wizard-card-desc">Outros ecossistemas</span>
</button>
</div>
</div>

<div id="wiz-q-firewall" class="wizard-question wizard-hidden">
<h3>Qual ferramenta de firewall você usa?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="firewall" data-value="iptables">
<span class="wizard-card-title">iptables</span>
<span class="wizard-card-desc">Regras diretas de iptables</span>
</button>
<button class="wizard-card" data-question="firewall" data-value="ufw">
<span class="wizard-card-title">UFW</span>
<span class="wizard-card-desc">Uncomplicated Firewall</span>
</button>
</div>
</div>

<div id="wiz-q-usertype" class="wizard-question wizard-hidden">
<h3>Que tipo de nó você está executando?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="usertype" data-value="validator">
<span class="wizard-card-title">Validador</span>
<span class="wizard-card-desc">Validador Solana com agendamento de líder e keypair de identidade</span>
</button>
<button class="wizard-card" data-question="usertype" data-value="rpc">
<span class="wizard-card-title">Não-validador (RPC)</span>
<span class="wizard-card-desc">Nó RPC ou infraestrutura MEV</span>
</button>
</div>
</div>

<div id="wiz-q-connection" class="wizard-question wizard-hidden">
<h3>Qual modo de conexão você precisa?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="connection" data-value="unicast">
<span class="wizard-card-title">Unicast (IBRL)</span>
<span class="wizard-card-desc">Conexão ponto a ponto padrão</span>
</button>
<button class="wizard-card" data-question="connection" data-value="multicast">
<span class="wizard-card-title">Multicast</span>
<span class="wizard-card-desc">Entrega de pacotes um-para-muitos (publicador/assinante)</span>
</button>
<button class="wizard-card" data-question="connection" data-value="both">
<span class="wizard-card-title">Ambos</span>
<span class="wizard-card-desc">Túneis unicast e multicast simultâneos</span>
</button>
</div>
</div>

<div id="wiz-q-multicastrole" class="wizard-question wizard-hidden">
<h3>Qual é o seu papel no multicast?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="multicastrole" data-value="publisher">
<span class="wizard-card-title">Publicador</span>
<span class="wizard-card-desc">Enviar dados para um grupo multicast (por exemplo, produtor de bloco)</span>
</button>
<button class="wizard-card" data-question="multicastrole" data-value="subscriber">
<span class="wizard-card-title">Assinante</span>
<span class="wizard-card-desc">Receber dados de um grupo multicast</span>
</button>
</div>
</div>

</div>

<div id="wizard-summary" class="wizard-hidden"></div>

<div id="wizard-output" class="wizard-hidden"></div>
