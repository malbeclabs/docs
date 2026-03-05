# Conexión Rápida

Responda algunas preguntas y generaremos una guía de conexión personalizada con los pasos y comandos exactos para su configuración.

!!! note "Guía Simplificada"
    Este asistente proporciona fragmentos clave de la documentación completa para conectarle lo más rápidamente posible. Para más detalles, consulte las guías de [Configuración](setup.md) e [Inquilinos](tenant.md).

<div id="wizard-container">

<div id="wiz-q-network" class="wizard-question">
<h3>¿A qué red se está conectando?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="network" data-value="mainnet-beta">
<span class="wizard-card-title">Mainnet-Beta</span>
<span class="wizard-card-desc">Red de producción para validadores activos y operadores RPC</span>
</button>
<button class="wizard-card" data-question="network" data-value="testnet">
<span class="wizard-card-title">Testnet</span>
<span class="wizard-card-desc">Red de pruebas y desarrollo</span>
</button>
</div>
</div>

<div id="wiz-q-os" class="wizard-question wizard-hidden">
<h3>¿Qué sistema operativo usa su servidor?</h3>
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
<h3>¿Qué ecosistema?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="tenant" data-value="solana">
<span class="wizard-card-title">Solana</span>
<span class="wizard-card-desc">Validadores y operadores RPC en Solana</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="shelby" title="Solo Testnet">
<span class="wizard-card-title">Shelby</span>
<span class="wizard-card-desc">RPCs y Nodos de Almacenamiento en Shelby (solo Testnet)</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="new-tenant">
<span class="wizard-card-title">Nuevo Inquilino</span>
<span class="wizard-card-desc">Otros ecosistemas</span>
</button>
</div>
</div>

<div id="wiz-q-firewall" class="wizard-question wizard-hidden">
<h3>¿Qué herramienta de firewall utiliza?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="firewall" data-value="iptables">
<span class="wizard-card-title">iptables</span>
<span class="wizard-card-desc">Reglas directas de iptables</span>
</button>
<button class="wizard-card" data-question="firewall" data-value="ufw">
<span class="wizard-card-title">UFW</span>
<span class="wizard-card-desc">Firewall sin complicaciones (Uncomplicated Firewall)</span>
</button>
</div>
</div>

<div id="wiz-q-usertype" class="wizard-question wizard-hidden">
<h3>¿Qué tipo de nodo está ejecutando?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="usertype" data-value="validator">
<span class="wizard-card-title">Validador</span>
<span class="wizard-card-desc">Validador Solana programado como líder con keypair de identidad</span>
</button>
<button class="wizard-card" data-question="usertype" data-value="rpc">
<span class="wizard-card-title">No validador (RPC)</span>
<span class="wizard-card-desc">Nodo RPC o infraestructura MEV</span>
</button>
</div>
</div>

<div id="wiz-q-connection" class="wizard-question wizard-hidden">
<h3>¿Qué modo de conexión necesita?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="connection" data-value="unicast">
<span class="wizard-card-title">Unicast (IBRL)</span>
<span class="wizard-card-desc">Conexión punto a punto estándar</span>
</button>
<button class="wizard-card" data-question="connection" data-value="multicast">
<span class="wizard-card-title">Multicast</span>
<span class="wizard-card-desc">Entrega de paquetes de uno a muchos (publicador/suscriptor)</span>
</button>
<button class="wizard-card" data-question="connection" data-value="both">
<span class="wizard-card-title">Ambos</span>
<span class="wizard-card-desc">Túneles unicast y multicast simultáneos</span>
</button>
</div>
</div>

<div id="wiz-q-multicastrole" class="wizard-question wizard-hidden">
<h3>¿Cuál es su rol en multicast?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="multicastrole" data-value="publisher">
<span class="wizard-card-title">Publicador</span>
<span class="wizard-card-desc">Enviar datos a un grupo multicast (por ejemplo, productor de bloques)</span>
</button>
<button class="wizard-card" data-question="multicastrole" data-value="subscriber">
<span class="wizard-card-title">Suscriptor</span>
<span class="wizard-card-desc">Recibir datos de un grupo multicast</span>
</button>
</div>
</div>

</div>

<div id="wizard-summary" class="wizard-hidden"></div>

<div id="wizard-output" class="wizard-hidden"></div>
