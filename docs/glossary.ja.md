---
description: ドキュメント全体で使用されるDoubleZero固有の用語の定義。
---

# 用語集

このページでは、ドキュメント全体で使用されるDoubleZero固有の用語を定義します。

---

## ネットワークインフラストラクチャ

### DZD (DoubleZero Device)
DoubleZeroリンクを終端し、DoubleZero Agentソフトウェアを実行する物理ネットワークスイッチングハードウェア。DZDはデータセンターに展開され、ルーティング、パケット処理、およびユーザー接続サービスを提供します。各DZDには特定の[ハードウェア仕様](contribute.md#dzd-network-hardware)が必要であり、[Config Agent](#config-agent)と[Telemetry Agent](#telemetry-agent)の両方を実行します。

### DZX (DoubleZero Exchange)
メッシュネットワーク内の相互接続ポイントで、異なる[コントリビューター](#contributor)のリンクがブリッジされます。DZXは、ネットワークの交差点が発生する主要な都市圏（例：NYC、LON、TYO）に設置されています。ネットワークコントリビューターは、最寄りのDZXで自身のリンクをより広範なDoubleZeroメッシュにクロスコネクトする必要があります。Internet Exchange (IX) と概念的に類似しています。

### WAN Link
**同じ**コントリビューターが運用する2つの[DZD](#dzd-doublezero-device)間のWide Area Networkリンク。WANリンクは、単一のコントリビューターのインフラストラクチャ内でバックボーン接続を提供します。

### DZX Link
[DZX](#dzx-doublezero-exchange)で確立される、**異なる**コントリビューターが運用する[DZD](#dzd-doublezero-device)間のリンク。DZXリンクは双方の明示的な承諾が必要です。

### DZ Prefix
オーバーレイネットワークアドレッシングのために[DZD](#dzd-doublezero-device)に割り当てられるCIDR形式のIPアドレス割り当て。[デバイス作成](contribute-provisioning.md#step-32-create-your-device-onchain)時に`--dz-prefixes`パラメータを使用して指定されます。

---

## デバイスタイプ

### Edge Device
DoubleZeroネットワークへのユーザー接続を提供する[DZD](#dzd-doublezero-device)。Edgeデバイスは[CYOA](#cyoa-choose-your-own-adventure)インターフェースを活用して、ユーザー（バリデーター、RPCオペレーター）を終端し、ネットワークに接続します。

### Transit Device
DoubleZeroネットワーク内でバックボーン接続を提供する[DZD](#dzd-doublezero-device)。Transitデバイスは、DZD間のトラフィックを移動させますが、ユーザー接続を直接終端しません。

### Hybrid Device
[Edge](#edge-device)と[Transit](#transit-device)の両方の機能を組み合わせた[DZD](#dzd-doublezero-device)で、ユーザー接続とバックボーンルーティングの両方を提供します。

---

## 接続性

### CYOA (Choose Your Own Adventure)
[コントリビューター](#contributor)がDoubleZeroネットワークにユーザーを接続するための接続オプションを登録できるインターフェースタイプ。CYOAインターフェースには、[DIA](#dia-direct-internet-access)、GREトンネル、プライベートピアリングなどのさまざまな方法が含まれます。設定の詳細については[CYOAインターフェースの作成](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)を参照してください。

### DIA (Direct Internet Access)
パブリックインターネット経由で提供される接続の標準的なネットワーキング用語。DoubleZeroでは、DIAはユーザー（バリデーター、RPCオペレーター）が既存のインターネット接続を介して[DZD](#dzd-doublezero-device)に接続する[CYOA](#cyoa-choose-your-own-adventure)インターフェースタイプです。

### IBRL (Increase Bandwidth Reduce Latency)
バリデーターやRPCノードがブロックチェーンクライアントを再起動せずにDoubleZeroに接続できる接続モード。IBRLは既存のパブリックIPアドレスを使用し、最寄りの[DZD](#dzd-doublezero-device)へのオーバーレイトンネルを確立します。セットアップ手順については[Mainnet-Beta接続](DZ%20Mainnet-beta%20Connection.md)を参照してください。

### Multicast
DoubleZeroがサポートする1対多のパケット配信方式。Multicastモードには2つの役割があります：**パブリッシャー**（ネットワーク全体にパケットを送信）と**サブスクライバー**（パブリッシャーからパケットを受信）。開発チームによる効率的なデータ配信に使用されます。接続の詳細については[その他のMulticast接続](Other%20Multicast%20Connection.md)を参照してください。

---

## ソフトウェアコンポーネント

### doublezerod
ユーザーサーバー（バリデーター、RPCノード）上で実行されるDoubleZeroデーモンサービス。DoubleZeroネットワークへの接続を管理し、トンネルの確立を処理し、[DZD](#dzd-doublezero-device)への接続を維持します。systemdを介して設定され、[`doublezero`](#doublezero-cli) CLIを通じて制御されます。

### doublezero (CLI)
DoubleZeroネットワークとやり取りするためのコマンドラインインターフェース。接続、ID管理、ステータス確認、管理操作に使用されます。[`doublezerod`](#doublezerod)デーモンと通信します。

### Config Agent
[DZD](#dzd-doublezero-device)上で実行され、デバイス設定を管理するソフトウェアエージェント。[Controller](#controller)サービスから設定を読み取り、デバイスに変更を適用します。セットアップについては[Config Agentのインストール](contribute-provisioning.md#step-44-install-config-agent)を参照してください。

### Telemetry Agent
[DZD](#dzd-doublezero-device)上で実行され、パフォーマンスメトリクス（レイテンシー、ジッター、パケットロス）を収集してDoubleZero台帳に送信するソフトウェアエージェント。セットアップについては[Telemetry Agentのインストール](contribute-provisioning.md#step-45-install-telemetry-agent)を参照してください。

### Controller
[DZD](#dzd-doublezero-device)エージェントに設定を提供するサービス。ControllerはDoubleZero台帳上の[オンチェーン](#onchain)状態からデバイス設定を導出します。

---

## リンク状態

### Activated
リンクの通常の運用状態。トラフィックはリンクを通過し、ルーティング判断に参加します。

### Soft-Drained
特定のリンクでトラフィックが抑制されるメンテナンス状態。グレースフルなメンテナンスウィンドウに使用されます。[activated](#activated)または[hard-drained](#hard-drained)に遷移できます。

### Hard-Drained
リンクがサービスから完全に除外されるメンテナンス状態。トラフィックはリンクを通過しません。[activated](#activated)に戻るには、事前に[soft-drained](#soft-drained)に遷移する必要があります。

---

## 組織 & トークン

### DZF (DoubleZero Foundation)
DoubleZero Foundationは、DoubleZeroネットワークの開発、分散化、セキュリティ、および普及を支援するために設立されたメンバーレスの非営利ケイマン諸島財団法人です。

### 2Z Token
DoubleZeroネットワークのネイティブトークン。バリデーター手数料の支払いに使用され、[コントリビューター](#contributor)への報酬として配布されます。バリデーターはオンチェーンスワッププログラムを介して2Zで手数料を支払うことができます。[SOLから2Zへのスワップ](Swapping-sol-to-2z.md)を参照してください。

### Contributor
DoubleZeroネットワークに帯域幅とハードウェアを提供するネットワークインフラストラクチャプロバイダー。コントリビューターは[DZD](#dzd-doublezero-device)を運用し、[WAN](#wan-link)および[DZX](#dzx-link)リンクを提供し、その貢献に対して[2Z](#2z-token)トークンインセンティブを受け取ります。開始するには[コントリビュータードキュメント](contribute-overview.md)を参照してください。

---

## ネットワーキングの概念

### MTU (Maximum Transmission Unit)
ネットワークリンク上で送信可能な最大パケットサイズ（バイト単位）。DoubleZero WANリンクは通常、効率性のためにMTU 9000（ジャンボフレーム）を使用します。

### VRF (Virtual Routing and Forwarding)
同じ物理ルーター上に複数の分離されたルーティングテーブルを存在させることを可能にする技術。コントリビューターは、スイッチ管理トラフィックを本番トラフィックから分離するために、別の管理VRFを使用することがよくあります。

### GRE (Generic Routing Encapsulation)
ネットワークパケットをIPパケット内にカプセル化するトンネリングプロトコル。[IBRL](#ibrl-increase-bandwidth-reduce-latency)および[CYOA](#cyoa-choose-your-own-adventure)接続で、ユーザーとDZD間にオーバーレイトンネルを作成するために使用されます。

### BGP (Border Gateway Protocol)
インターネット上のネットワーク間でルーティング情報を交換するために使用されるルーティングプロトコル。DoubleZeroは内部的にASN 65342でBGPを使用します。

### ASN (Autonomous System Number)
BGPルーティングのためにネットワークに割り当てられる一意の識別子。すべてのDoubleZeroデバイスは内部BGPプロセスに**ASN 65342**を使用します。

### Loopback Interface
管理およびルーティング目的で使用されるルーター/スイッチ上の仮想ネットワークインターフェース。DZDは内部ルーティングにLoopback255（VPNv4）とLoopback256（IPv4）を使用します。

### CIDR (Classless Inter-Domain Routing)
IPアドレス範囲を指定するための表記法。形式は`IP/prefix-length`で、プレフィックス長はネットワークサイズを示します（例：`/29` = 8アドレス、`/24` = 256アドレス）。

### Jitter
時間の経過に伴うパケットレイテンシーの変動。低ジッターはリアルタイムアプリケーションにとって重要です。

### RTT (Round-Trip Time)
パケットが送信元から宛先に到達し、戻ってくるまでの時間。デバイス間のネットワークレイテンシーを測定するために使用されます。

### TWAMP (Two-Way Active Measurement Protocol)
レイテンシーやパケットロスなどのネットワークパフォーマンスメトリクスを測定するためのプロトコル。[Telemetry Agent](#telemetry-agent)はDZD間のメトリクス収集にTWAMPを使用します。

### IS-IS (Intermediate System to Intermediate System)
DoubleZeroネットワーク内部で使用されるリンクステートルーティングプロトコル。IS-ISメトリクスは[リンクドレイニング](#soft-drained)操作時に調整されます。

---

## ジオロケーション

### Geolocation
レイテンシー測定を使用してデバイスの物理的な位置を検証するDoubleZeroサービス。既知の場所にあるインフラストラクチャ（[DZD](#dzd-doublezero-device)）とターゲットデバイス間の[RTT](#rtt-round-trip-time)測定により、デバイスが基準点から一定の距離内にあることの暗号署名付き証明を提供します。測定のオンチェーン記録は将来のリリースで計画されています。ユーザードキュメントについては[ジオロケーション](geolocation.md)を参照してください。

### geoProbe
[ジオロケーション](#geolocation)システムにおけるレイテンシー測定の仲介役として機能するベアメタルサーバー。geoProbeは[DZD](#dzd-doublezero-device)から約1ms以内の場所に配置され、親DZDから署名付きLocationOffsetを受信し、[TWAMP](#twamp-two-way-active-measurement-protocol)、署名付きTWAMP、またはICMP echoを介してターゲットデバイスへの[RTT](#rtt-round-trip-time)を測定します。各geoProbeは[オンチェーン](#onchain)に登録され、1つ以上の親DZDに紐づけられます。コントリビュータードキュメントについては[Geoprobeのデプロイ](contribute-geolocation.md)を参照してください。

### LocationOffset
[DZD](#dzd-doublezero-device)の地理的位置（緯度と経度）およびエンティティ間のレイテンシー関係チェーン（DZD↔Probe または Probe↔Target）を含む署名付きデータ構造。LocationOffsetはEd25519で署名され、測定チェーンを通じてUDPで送信されます。複合オフセットには以前の測定への参照が含まれ、監査可能なトレイルを作成します。

---

## ブロックチェーン & 鍵

### Onchain
DoubleZeroの文脈では、onchainはDoubleZero台帳に記録されるデータと操作を指します。デバイスやリンクの設定が集中管理システムに存在する従来のネットワークとは異なり、DoubleZeroはデバイスの登録、リンクの設定、テレメトリーの送信をオンチェーンに記録し、ネットワーク状態をすべての参加者にとって透明で検証可能にしています。

### Service Key
CLI操作を認証するために使用される暗号鍵ペア。これはDoubleZeroスマートコントラクトとやり取りするためのコントリビューターIDです。`~/.config/solana/id.json`に保存されます。

### Metrics Publisher Key
[Telemetry Agent](#telemetry-agent)がブロックチェーンへのメトリクス送信に署名するために使用する暗号鍵ペア。セキュリティ分離のためにService Keyとは別になっています。`~/.config/doublezero/metrics-publisher.json`に保存されます。

---

## ハードウェア & ソフトウェア

### EOS (Extensible Operating System)
DZDスイッチ上で実行されるAristaのネットワークオペレーティングシステム。コントリビューターは[Config Agent](#config-agent)と[Telemetry Agent](#telemetry-agent)をEOS拡張としてインストールします。

### EOS Extension
Arista EOSスイッチにインストールできるソフトウェアパッケージ。DZエージェントは`.rpm`ファイルとして配布され、`extension`コマンドを介してインストールされます。