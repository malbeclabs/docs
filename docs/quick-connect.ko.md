# 빠른 연결
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


몇 가지 질문에 답하면 설정에 맞는 정확한 단계와 명령이 포함된 맞춤형 연결 가이드를 생성해 드립니다.

!!! note "간소화된 가이드"
    이 마법사는 최대한 빠르게 연결할 수 있도록 전체 문서의 핵심 내용을 제공합니다. 전체 세부 정보는 [설정](setup.md) 및 [테넌트](tenant.md) 가이드를 참조하세요.

<div id="wizard-container">

<div id="wiz-q-network" class="wizard-question">
<h3>어떤 네트워크에 연결하고 있나요?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="network" data-value="mainnet-beta">
<span class="wizard-card-title">Mainnet-Beta</span>
<span class="wizard-card-desc">활성 검증자 및 RPC 운영자를 위한 프로덕션 네트워크</span>
</button>
<button class="wizard-card" data-question="network" data-value="testnet">
<span class="wizard-card-title">Testnet</span>
<span class="wizard-card-desc">테스트 및 개발 네트워크</span>
</button>
</div>
</div>

<div id="wiz-q-os" class="wizard-question wizard-hidden">
<h3>서버에서 실행 중인 운영 체제는 무엇인가요?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="os" data-value="deb">
<span class="wizard-card-title">Ubuntu / Debian</span>
<span class="wizard-card-desc">Ubuntu 22.04+ 또는 Debian 11+</span>
</button>
<button class="wizard-card" data-question="os" data-value="rpm">
<span class="wizard-card-title">Rocky Linux / RHEL</span>
<span class="wizard-card-desc">Rocky Linux 또는 RHEL 8+</span>
</button>
</div>
</div>

<div id="wiz-q-tenant" class="wizard-question wizard-hidden">
<h3>어떤 에코시스템인가요?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="tenant" data-value="solana">
<span class="wizard-card-title">Solana</span>
<span class="wizard-card-desc">Solana의 검증자 및 RPC 운영자</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="shelby" title="Testnet only">
<span class="wizard-card-title">Shelby</span>
<span class="wizard-card-desc">Shelby의 RPC 및 스토리지 노드 (테스트넷 전용)</span>
</button>
<button class="wizard-card" data-question="tenant" data-value="new-tenant">
<span class="wizard-card-title">새 테넌트</span>
<span class="wizard-card-desc">기타 에코시스템</span>
</button>
</div>
</div>

<div id="wiz-q-firewall" class="wizard-question wizard-hidden">
<h3>어떤 방화벽 도구를 사용하나요?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="firewall" data-value="iptables">
<span class="wizard-card-title">iptables</span>
<span class="wizard-card-desc">직접 iptables 규칙</span>
</button>
<button class="wizard-card" data-question="firewall" data-value="ufw">
<span class="wizard-card-title">UFW</span>
<span class="wizard-card-desc">Uncomplicated Firewall</span>
</button>
</div>
</div>

<div id="wiz-q-usertype" class="wizard-question wizard-hidden">
<h3>어떤 유형의 노드를 실행하고 있나요?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="usertype" data-value="validator">
<span class="wizard-card-title">검증자</span>
<span class="wizard-card-desc">아이덴티티 키쌍이 있는 리더 스케줄된 Solana 검증자</span>
</button>
<button class="wizard-card" data-question="usertype" data-value="rpc">
<span class="wizard-card-title">비검증자 (RPC)</span>
<span class="wizard-card-desc">RPC 노드 또는 MEV 인프라</span>
</button>
</div>
</div>

<div id="wiz-q-connection" class="wizard-question wizard-hidden">
<h3>어떤 연결 모드가 필요한가요?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="connection" data-value="unicast">
<span class="wizard-card-title">유니캐스트 (IBRL)</span>
<span class="wizard-card-desc">표준 지점간 연결</span>
</button>
<button class="wizard-card" data-question="connection" data-value="multicast">
<span class="wizard-card-title">멀티캐스트</span>
<span class="wizard-card-desc">일대다 패킷 전달 (발행자/구독자)</span>
</button>
<button class="wizard-card" data-question="connection" data-value="both">
<span class="wizard-card-title">둘 다</span>
<span class="wizard-card-desc">유니캐스트 및 멀티캐스트 터널 동시 사용</span>
</button>
</div>
</div>

<div id="wiz-q-multicastrole" class="wizard-question wizard-hidden">
<h3>멀티캐스트 역할은 무엇인가요?</h3>
<div class="wizard-options">
<button class="wizard-card" data-question="multicastrole" data-value="publisher">
<span class="wizard-card-title">발행자</span>
<span class="wizard-card-desc">멀티캐스트 그룹에 데이터 전송 (예: 블록 생성자)</span>
</button>
<button class="wizard-card" data-question="multicastrole" data-value="subscriber">
<span class="wizard-card-title">구독자</span>
<span class="wizard-card-desc">멀티캐스트 그룹에서 데이터 수신</span>
</button>
</div>
</div>

</div>

<div id="wizard-summary" class="wizard-hidden"></div>

<div id="wizard-output" class="wizard-hidden"></div>
