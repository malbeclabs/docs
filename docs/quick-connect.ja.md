# クイックコネクト

いくつかの質問に答えるだけで、お使いの環境に合わせた正確な手順とコマンドを含むパーソナライズされた接続ガイドを生成します。

!!! note "簡易ガイド"
    このウィザードでは、できるだけ早く接続できるよう、完全なドキュメントから主要なスニペットを提供します。詳細については、[セットアップ](setup.md)および[テナント](tenant.md)ガイドをご覧ください。

<div id="wizard-container">

<div id="wiz-q-network" class="wizard-question">
<h3>接続するネットワークはどれですか？</h3>
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
<h3>サーバーのオペレーティングシステムは何ですか？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="os" data-value="deb">
<span class="wizard-card-title">Ubuntu / Debian</span>
<span class="wizard-card-desc">Ubuntu 22.04+ または Debian 11+</span>
</button>
<button class="wizard-card" data-question="os" data-value="rpm">
<span class="wizard-card-title">Rocky Linux / RHEL</span>
<span class="wizard-card-desc">Rocky Linux または RHEL 9+</span>
</button>
</div>
</div>

<div id="wiz-q-tenant" class="wizard-question wizard-hidden">
<h3>どのエコシステムですか？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="tenant" data-value="solana">
<span class="wizard-card-title">Solana</span>
<span class="wizard-card-desc">Solana上のバリデーターおよびRPCオペレーター</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="shelby" title="Testnet only">
<span class="wizard-card-title">Shelby</span>
<span class="wizard-card-desc">Shelby上のRPCおよびストレージノード（Testnetのみ）</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="new-tenant">
<span class="wizard-card-title">新規テナント</span>
<span class="wizard-card-desc">その他のエコシステム</span>
</button>
</div>
</div>

<div id="wiz-q-firewall" class="wizard-question wizard-hidden">
<h3>使用しているファイアウォールツールはどれですか？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="firewall" data-value="iptables">
<span class="wizard-card-title">iptables</span>
<span class="wizard-card-desc">iptablesルールを直接設定</span>
</button>
<button class="wizard-card" data-question="firewall" data-value="ufw">
<span class="wizard-card-title">UFW</span>
<span class="wizard-card-desc">Uncomplicated Firewall</span>
</button>
</div>
</div>

<div id="wiz-q-usertype" class="wizard-question wizard-hidden">
<h3>実行しているノードの種類は何ですか？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="usertype" data-value="validator">
<span class="wizard-card-title">バリデーター</span>
<span class="wizard-card-desc">IDキーペアを持つリーダースケジュールされたSolanaバリデーター</span>
</button>
<button class="wizard-card" data-question="usertype" data-value="rpc">
<span class="wizard-card-title">非バリデーター（RPC）</span>
<span class="wizard-card-desc">RPCノードまたはMEVインフラストラクチャ</span>
</button>
</div>
</div>

<div id="wiz-q-connection" class="wizard-question wizard-hidden">
<h3>必要な接続モードは何ですか？</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="connection" data-value="unicast">
<span class="wizard-card-title">ユニキャスト（IBRL）</span>
<span class="wizard-card-desc">標準的なポイントツーポイント接続</span>
</button>
<button class="wizard-card" data-question="connection" data-value="multicast">
<span class="wizard-card-title">マルチキャスト</span>
<span class="wizard-card-desc">1対多のパケット配信（パブリッシャー/サブスクライバー）</span>
</button>
<button class="wizard-card" data-question="connection" data-value="both">
<span class="wizard-card-title">両方</span>
<span class="wizard-card-desc">ユニキャストとマルチキャストのトンネルを同時使用</span>
</button>
</div>
</div>

<div id="wiz-q-multicastrole" class="wizard-question wizard-hidden">
<h3>マルチキャストでの役割は何ですか？</h3>
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