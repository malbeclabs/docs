---
description: 回答几个问题，生成适合您配置的个性化 DoubleZero 连接指南，包含确切的步骤和命令。
---

# 快速连接

回答几个问题，我们将为您生成一份个性化的连接指南，包含适合您配置的确切步骤和命令。

!!! note "简化指南"
    此向导提供了完整文档中的关键片段，帮助您尽快完成连接。如需完整详情，请参阅 [设置](setup.md) 和 [租户](tenant.md) 指南。

<div id="wizard-container">

<div id="wiz-q-network" class="wizard-question">
<h3>您要连接到哪个网络？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="network" data-value="mainnet-beta">
<span class="wizard-card-title">Mainnet-Beta</span>
<span class="wizard-card-desc">用于活跃验证者和 RPC 运营商的生产网络</span>
</button>
<button class="wizard-card" data-question="network" data-value="testnet">
<span class="wizard-card-title">Testnet</span>
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
<span class="wizard-card-desc">Rocky Linux 或 RHEL 9+</span>
</button>
</div>
</div>

<div id="wiz-q-tenant" class="wizard-question wizard-hidden">
<h3>哪个生态系统？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="tenant" data-value="solana">
<span class="wizard-card-title">Solana</span>
<span class="wizard-card-desc">Solana 上的验证者和 RPC 运营商</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="shelby" title="仅限 Testnet">
<span class="wizard-card-title">Shelby</span>
<span class="wizard-card-desc">Shelby 上的 RPC 和存储节点（仅限 Testnet）</span>
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
<span class="wizard-card-desc">直接使用 iptables 规则</span>
</button>
<button class="wizard-card" data-question="firewall" data-value="ufw">
<span class="wizard-card-title">UFW</span>
<span class="wizard-card-desc">简单防火墙（Uncomplicated Firewall）</span>
</button>
</div>
</div>

<div id="wiz-q-usertype" class="wizard-question wizard-hidden">
<h3>您运行的是什么类型的节点？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="usertype" data-value="validator">
<span class="wizard-card-title">验证者</span>
<span class="wizard-card-desc">具有身份密钥对的 Leader 调度 Solana 验证者</span>
</button>
<button class="wizard-card" data-question="usertype" data-value="rpc">
<span class="wizard-card-title">非验证者 (RPC)</span>
<span class="wizard-card-desc">RPC 节点或 MEV 基础设施</span>
</button>
</div>
</div>

<div id="wiz-q-connection" class="wizard-question wizard-hidden">
<h3>您需要什么连接模式？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="connection" data-value="unicast">
<span class="wizard-card-title">单播 (IBRL)</span>
<span class="wizard-card-desc">标准点对点连接</span>
</button>
<button class="wizard-card" data-question="connection" data-value="multicast">
<span class="wizard-card-title">组播</span>
<span class="wizard-card-desc">一对多数据包传输（发布者/订阅者）</span>
</button>
<button class="wizard-card" data-question="connection" data-value="both">
<span class="wizard-card-title">两者都需要</span>
<span class="wizard-card-desc">同时使用单播和组播隧道</span>
</button>
</div>
</div>

<div id="wiz-q-multicastrole" class="wizard-question wizard-hidden">
<h3>您的组播角色是什么？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="multicastrole" data-value="publisher">
<span class="wizard-card-title">发布者</span>
<span class="wizard-card-desc">向组播组发送数据（例如，出块者）</span>
</button>
<button class="wizard-card" data-question="multicastrole" data-value="subscriber">
<span class="wizard-card-title">订阅者</span>
<span class="wizard-card-desc">从组播组接收数据</span>
</button>
</div>
</div>

</div>

<div id="wizard-summary" class="wizard-hidden"></div>

<div id="wizard-output" class="wizard-hidden"></div>