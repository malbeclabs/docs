# 快速连接

回答几个问题，我们将为您的设置生成包含确切步骤和命令的个性化连接指南。

!!! note "简化指南"
    本向导提供完整文档中的关键片段，帮助您尽快完成连接。完整详情请参阅[设置](setup.md)和[租户](tenant.md)指南。

<div id="wizard-container">

<div id="wiz-q-network" class="wizard-question">
<h3>您要连接哪个网络？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="network" data-value="mainnet-beta">
<span class="wizard-card-title">主网Beta</span>
<span class="wizard-card-desc">适用于活跃验证器和RPC运营商的生产网络</span>
</button>
<button class="wizard-card" data-question="network" data-value="testnet">
<span class="wizard-card-title">测试网</span>
<span class="wizard-card-desc">测试和开发网络</span>
</button>
</div>
</div>

<div id="wiz-q-os" class="wizard-question wizard-hidden">
<h3>您的服务器运行什么操作系统？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="os" data-value="deb">
<span class="wizard-card-title">Ubuntu / Debian</span>
<span class="wizard-card-desc">Ubuntu 22.04+ 或 Debian 11+</span>
</button>
<button class="wizard-card" data-question="os" data-value="rpm">
<span class="wizard-card-title">Rocky Linux / RHEL</span>
<span class="wizard-card-desc">Rocky Linux 或 RHEL 8+</span>
</button>
</div>
</div>

<div id="wiz-q-tenant" class="wizard-question wizard-hidden">
<h3>哪个生态系统？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="tenant" data-value="solana">
<span class="wizard-card-title">Solana</span>
<span class="wizard-card-desc">Solana上的验证器和RPC运营商</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="shelby" title="仅限测试网">
<span class="wizard-card-title">Shelby</span>
<span class="wizard-card-desc">Shelby上的RPC和存储节点（仅限测试网）</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="new-tenant">
<span class="wizard-card-title">新租户</span>
<span class="wizard-card-desc">其他生态系统</span>
</button>
</div>
</div>

<div id="wiz-q-firewall" class="wizard-question wizard-hidden">
<h3>您使用哪种防火墙工具？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="firewall" data-value="iptables">
<span class="wizard-card-title">iptables</span>
<span class="wizard-card-desc">直接iptables规则</span>
</button>
<button class="wizard-card" data-question="firewall" data-value="ufw">
<span class="wizard-card-title">UFW</span>
<span class="wizard-card-desc">简单防火墙</span>
</button>
</div>
</div>

<div id="wiz-q-usertype" class="wizard-question wizard-hidden">
<h3>您运行什么类型的节点？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="usertype" data-value="validator">
<span class="wizard-card-title">验证器</span>
<span class="wizard-card-desc">具有身份密钥对的领导者调度Solana验证器</span>
</button>
<button class="wizard-card" data-question="usertype" data-value="rpc">
<span class="wizard-card-title">非验证器（RPC）</span>
<span class="wizard-card-desc">RPC节点或MEV基础设施</span>
</button>
</div>
</div>

<div id="wiz-q-connection" class="wizard-question wizard-hidden">
<h3>您需要什么连接模式？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="connection" data-value="unicast">
<span class="wizard-card-title">单播（IBRL）</span>
<span class="wizard-card-desc">标准点对点连接</span>
</button>
<button class="wizard-card" data-question="connection" data-value="multicast">
<span class="wizard-card-title">多播</span>
<span class="wizard-card-desc">一对多数据包传送（发布者/订阅者）</span>
</button>
<button class="wizard-card" data-question="connection" data-value="both">
<span class="wizard-card-title">两者</span>
<span class="wizard-card-desc">同时使用单播和多播隧道</span>
</button>
</div>
</div>

<div id="wiz-q-multicastrole" class="wizard-question wizard-hidden">
<h3>您的多播角色是什么？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="multicastrole" data-value="publisher">
<span class="wizard-card-title">发布者</span>
<span class="wizard-card-desc">向多播组发送数据（如区块生产者）</span>
</button>
<button class="wizard-card" data-question="multicastrole" data-value="subscriber">
<span class="wizard-card-title">订阅者</span>
<span class="wizard-card-desc">从多播组接收数据</span>
</button>
</div>
</div>

</div>

<div id="wizard-summary" class="wizard-hidden"></div>

<div id="wizard-output" class="wizard-hidden"></div>
