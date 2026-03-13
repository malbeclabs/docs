# クイックコネクト
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


いくつかの質問に回答すると、セットアップに合わせた正確な手順とコマンドを含むパーソナライズされた接続ガイドを生成します。

!!! note "簡略ガイド"
    このウィザードは、できるだけ早く接続できるようにするために、完全なドキュメントから重要なスニペットを提供します。完全な詳細については、[セットアップ](setup.md)と[テナント](tenant.md)ガイドをご覧ください。

<div id="wizard-container">

<div id="wiz-q-network" class="wizard-question">
<h3>どのネットワークに接続しますか？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="network" data-value="mainnet-beta">
<span class="wizard-card-title">Mainnet-Beta</span>
<span class="wizard-card-desc">アクティブなバリデーターおよびRPCオペレーター向けの本番ネットワーク</span>
</button>
<button class="wizard-card" data-question="network" data-value="testnet">
<span class="wizard-card-title">Testnet</span>
<span class="wizard-card-desc">テストおよび開発ネットワーク</span>
</button>
</div>
</div>

<div id="wiz-q-os" class="wizard-question wizard-hidden">
<h3>サーバーのOSは？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="os" data-value="deb">
<span class="wizard-card-title">Ubuntu / Debian</span>
<span class="wizard-card-desc">Ubuntu 22.04+ または Debian 11+</span>
</button>
<button class="wizard-card" data-question="os" data-value="rpm">
<span class="wizard-card-title">Rocky Linux / RHEL</span>
<span class="wizard-card-desc">Rocky Linux または RHEL 8+</span>
</button>
</div>
</div>

<div id="wiz-q-tenant" class="wizard-question wizard-hidden">
<h3>どのエコシステムですか？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="tenant" data-value="solana">
<span class="wizard-card-title">Solana</span>
<span class="wizard-card-desc">Solanaのバリデーターおよびオペレーター</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="shelby" title="Testnet only">
<span class="wizard-card-title">Shelby</span>
<span class="wizard-card-desc">ShelbyのRPCとストレージノード（テストネットのみ）</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="new-tenant">
<span class="wizard-card-title">新規テナント</span>
<span class="wizard-card-desc">その他のエコシステム</span>
</button>
</div>
</div>

<div id="wiz-q-firewall" class="wizard-question wizard-hidden">
<h3>使用しているファイアウォールツールは？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="firewall" data-value="iptables">
<span class="wizard-card-title">iptables</span>
<span class="wizard-card-desc">直接iptablesルール</span>
</button>
<button class="wizard-card" data-question="firewall" data-value="ufw">
<span class="wizard-card-title">UFW</span>
<span class="wizard-card-desc">Uncomplicated Firewall</span>
</button>
</div>
</div>

<div id="wiz-q-usertype" class="wizard-question wizard-hidden">
<h3>実行しているノードのタイプは？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="usertype" data-value="validator">
<span class="wizard-card-title">バリデーター</span>
<span class="wizard-card-desc">IDキーペアを持つリーダースケジュールSolanaバリデーター</span>
</button>
<button class="wizard-card" data-question="usertype" data-value="rpc">
<span class="wizard-card-title">非バリデーター（RPC）</span>
<span class="wizard-card-desc">RPCノードまたはMEVインフラ</span>
</button>
</div>
</div>

<div id="wiz-q-connection" class="wizard-question wizard-hidden">
<h3>必要な接続モードは？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="connection" data-value="unicast">
<span class="wizard-card-title">ユニキャスト（IBRL）</span>
<span class="wizard-card-desc">標準のポイントツーポイント接続</span>
</button>
<button class="wizard-card" data-question="connection" data-value="multicast">
<span class="wizard-card-title">マルチキャスト</span>
<span class="wizard-card-desc">1対多パケット配信（パブリッシャー/サブスクライバー）</span>
</button>
<button class="wizard-card" data-question="connection" data-value="both">
<span class="wizard-card-title">両方</span>
<span class="wizard-card-desc">ユニキャストとマルチキャストの同時トンネル</span>
</button>
</div>
</div>

<div id="wiz-q-multicastrole" class="wizard-question wizard-hidden">
<h3>マルチキャストの役割は？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="multicastrole" data-value="publisher">
<span class="wizard-card-title">パブリッシャー</span>
<span class="wizard-card-desc">マルチキャストグループにデータを送信（例：ブロックプロデューサー）</span>
</button>
<button class="wizard-card" data-question="multicastrole" data-value="subscriber">
<span class="wizard-card-title">サブスクライバー</span>
<span class="wizard-card-desc">マルチキャストグループからデータを受信</span>
</button>
</div>
</div>

</div>

<div id="wizard-summary" class="wizard-hidden"></div>

<div id="wizard-output" class="wizard-hidden"></div>
