---
description: ドキュメント全体で使用されるDoubleZero固有の用語の定義。
---

# 用語集

このページでは、ドキュメント全体で使用されるDoubleZero固有の用語を定義します。

---

## ネットワークインフラストラクチャ

### DZD (DoubleZero Device) {#dzd-doublezero-device}
DoubleZeroリンクを終端し、DoubleZero Agentソフトウェアを実行する物理ネットワークスイッチングハードウェア。DZDはデータセンターに展開され、ルーティング、パケット処理、およびユーザー接続サービスを提供します。各DZDには特定の[ハードウェア仕様](../contributors/requirements.md#dzd-network-hardware)が必要であり、[Config Agent](#config-agent)と[Telemetry Agent](#telemetry-agent)の両方を実行します。

### DZX (DoubleZero Exchange) {#dzx-doublezero-exchange}
メッシュネットワーク内の相互接続ポイントで、異なる[コントリビューター](#contributor)のリンクがブリッジされます。DZXは、ネットワークの交差点が発生する主要な大都市圏（例：NYC、LON、TYO）に設置されています。ネットワークコントリビューターは、最寄りのDZXでより広いDoubleZeroメッシュにリンクをクロスコネクトする必要があります。概念的にはInternet Exchange（IX）に類似しています。

### WANリンク {#wan-link}
**同一の**コントリビューターが運用する2つの[DZD](#dzd-doublezero-device)間のWide Area Networkリンク。WANリンクは、単一のコントリビューターのインフラストラクチャ内でバックボーン接続を提供します。

### DZXリンク {#dzx-link}
**異なる**コントリビューターが運用する[DZD](#dzd-doublezero-device)間のリンクで、[DZX](#dzx-doublezero-exchange)で確立されます。DZXリンクは双方の明示的な承認が必要です。

### DZプレフィックス
オーバーレイネットワークアドレッシングのために[DZD](#dzd-doublezero-device)に割り当てられたCIDR形式のIPアドレス割り当て。[デバイス作成](../contributors/provisioning.md#step-32-create-your-device-onchain)時に`--dz-prefixes`パラメータを使用して指定します。

---

## デバイスタイプ

### エッジデバイス {#edge-device}
DoubleZeroネットワークへのユーザー接続を提供する[DZD](#dzd-doublezero-device)。エッジデバイスは[CYOA](#cyoa-choose-your-own-adventure)インターフェースを活用して、ユーザー（バリデーター、RPCオペレーター）を終端し、ネットワークに接続します。

### トランジットデバイス {#transit-device}
DoubleZeroネットワーク内でバックボーン接続を提供する[DZD](#dzd-doublezero-device)。トランジットデバイスはDZD間のトラフィックを転送しますが、ユーザー接続を直接終端しません。

### ハイブリッドデバイス
[エッジ](#edge-device)と[トランジット](#transit-device)の両方の機能を兼ね備えた[DZD](#dzd-doublezero-device)で、ユーザー接続とバックボーンルーティングの両方を提供します。

---

## 接続性

### CYOA (Choose Your Own Adventure) {#cyoa-choose-your-own-adventure}
[コントリビューター](#contributor)がDoubleZeroネットワークにユーザーが接続するための接続オプションを登録できるインターフェースタイプ。CYOAインターフェースには、[DIA](#dia-direct-internet-access)、GREトンネル、プライベートピアリングなど、さまざまな方法が含まれます。設定の詳細については、[CYOAインターフェースの作成](../contributors/provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)を参照してください。

### DIA (Direct Internet Access) {#dia-direct-internet-access}
パブリックインターネット経由で提供される接続を表す標準的なネットワーキング用語。DoubleZeroでは、DIAは[CYOA](#cyoa-choose-your-own-adventure)インターフェースタイプの一種であり、ユーザー（バリデーター、RPCオペレーター）が既存のインターネット接続を介して[DZD](#dzd-doublezero-device)に接続します。

### IBRL (Increase Bandwidth Reduce Latency) {#ibrl-increase-bandwidth-reduce-latency}
バリデーターやRPCノードがブロックチェーンクライアントを再起動せずにDoubleZeroに接続できる接続モード。IBRLは既存のパブリックIPアドレスを使用し、最寄りの[DZD](#dzd-doublezero-device)へのオーバーレイトンネルを確立します。セットアップ手順については、[Mainnet-Beta接続](../solana/ibrl/publish.md)を参照してください。

### マルチキャスト
DoubleZeroがサポートする1対多のパケット配信方式。マルチキャストモードには、**パブリッシャー**（ネットワーク全体にパケットを送信）と**サブスクライバー**（パブリッシャーからパケットを受信）の2つの役割があります。開発チームが効率的なデータ配信に使用します。接続の詳細については、[その他のマルチキャスト接続](other-multicast.md)を参照してください。

---

## ソフトウェアコンポーネント

### doublezerod {#doublezerod}
ユーザーサーバー（バリデーター、RPCノード）上で実行されるDoubleZeroデーモンサービス。DoubleZeroネットワークへの接続を管理し、トンネルの確立を処理し、[DZD](#dzd-doublezero-device)への接続を維持します。systemdを介して設定され、[`doublezero`](#doublezero-cli) CLIで制御されます。

### doublezero (CLI) {#doublezero-cli}
DoubleZeroネットワークとやり取りするためのコマンドラインインターフェース。接続、ID管理、ステータス確認、および管理操作に使用されます。[`doublezerod`](#doublezerod)デーモンと通信します。

### Config Agent {#config-agent}
[DZD](#dzd-doublezero-device)上で実行され、デバイス設定を管理するソフトウェアエージェント。[Controller](#controller)サービスから設定を読み取り、デバイスに変更を適用します。セットアップについては、[Config Agentのインストール](../contributors/provisioning.md#step-44-install-config-agent)を参照してください。

### Telemetry Agent {#telemetry-agent}
[DZD](#dzd-doublezero-device)上で実行され、パフォーマンスメトリクス（レイテンシ、ジッター、パケットロス）を収集し、DoubleZero台帳に送信するソフトウェアエージェント。セットアップについては、[Telemetry Agentのインストール](../contributors/provisioning.md#step-45-install-telemetry-agent)を参照してください。

### Controller {#controller}
[DZD](#dzd-doublezero-device)エージェントに設定を提供するサービス。ControllerはDoubleZero台帳上の[オンチェーン](#onchain)状態からデバイス設定を導出します。

---

## リンクの状態

### アクティブ {#activated}
リンクの通常の運用状態。トラフィックがリンクを通過し、ルーティング決定に参加します。

### ソフトドレイン {#soft-drained}
特定のリンクでトラフィックが抑制されるメンテナンス状態。グレースフルなメンテナンスウィンドウに使用されます。[アクティブ](#activated)または[ハードドレイン](#hard-drained)に遷移できます。

### ハードドレイン {#hard-drained}
リンクがサービスから完全に除外されるメンテナンス状態。トラフィックはリンクを通過しません。[アクティブ](#activated)に戻るには、まず[ソフトドレイン](#soft-drained)に遷移する必要があります。

---

## 組織とトークン

### DZF (DoubleZero Foundation) {#dzf-doublezero-foundation}
DoubleZero Foundationは、DoubleZeroネットワークの開発、分散化、セキュリティ、および普及を支援するために設立された、メンバーのないケイマン諸島の非営利財団法人です。

### 2Zトークン {#2z-token}
DoubleZeroネットワークのネイティブトークン。バリデーター手数料の支払いに使用され、[コントリビューター](#contributor)への報酬として配布されます。バリデーターはオンチェーンスワッププログラムを介して2Zで手数料を支払うことができます。[SOLから2Zへのスワップ](../Swapping-sol-to-2z.md)を参照してください。

### コントリビューター {#contributor}
DoubleZeroネットワークに帯域幅とハードウェアを提供するネットワークインフラストラクチャプロバイダー。コントリビューターは[DZD](#dzd-doublezero-device)を運用し、[WAN](#wan-link)および[DZX](#dzx-link)リンクを提供し、貢献に対して[2Z](#2z-token)トークンのインセンティブを受け取ります。開始するには、[コントリビュータードキュメント](../contributors/index.md)を参照してください。

---

## ネットワーキングの概念

### MTU (Maximum Transmission Unit)
ネットワークリンク上で送信可能な最大パケットサイズ（バイト単位）。DoubleZeroのWANリンクは通常、効率性のためにMTU 9000（ジャンボフレーム）を使用します。

### VRF (Virtual Routing and Forwarding)
同一の物理ルーター上に複数の分離されたルーティングテーブルを存在させる技術。コントリビューターは通常、スイッチ管理トラフィックを本番トラフィックから分離するために別の管理VRFを使用します。

### GRE (Generic Routing Encapsulation)
ネットワークパケットをIPパケット内にカプセル化するトンネリングプロトコル。ユーザーとDZD間のオーバーレイトンネルを作成するために、[IBRL](#ibrl-increase-bandwidth-reduce-latency)および[CYOA](#cyoa-choose-your-own-adventure)接続で使用されます。

### BGP (Border Gateway Protocol)
インターネット上のネットワーク間でルーティング情報を交換するために使用されるルーティングプロトコル。DoubleZeroはASN 65342で内部的にBGPを使用します。

### ASN (Autonomous System Number)
BGPルーティングのためにネットワークに割り当てられる一意の識別子。すべてのDoubleZeroデバイスは内部BGPプロセスに**ASN 65342**を使用します。

### ループバックインターフェース
管理およびルーティング目的で使用されるルーター/スイッチ上の仮想ネットワークインターフェース。DZDは内部ルーティングにLoopback255（VPNv4）とLoopback256（IPv4）を使用します。

### CIDR (Classless Inter-Domain Routing)
IPアドレス範囲を指定するための表記法。形式は`IP/プレフィックス長`で、プレフィックス長はネットワークサイズを示します（例：`/29` = 8アドレス、`/24` = 256アドレス）。

### ジッター
時間経過に伴うパケットレイテンシの変動。リアルタイムアプリケーションにおいて低ジッターは非常に重要です。

### RTT (Round-Trip Time) {#rtt-round-trip-time}
パケットが送信元から宛先に到達し、戻ってくるまでの時間。デバイス間のネットワークレイテンシの測定に使用されます。

### TWAMP (Two-Way Active Measurement Protocol) {#twamp-two-way-active-measurement-protocol}
レイテンシやパケットロスなどのネットワークパフォーマンスメトリクスを測定するためのプロトコル。[Telemetry Agent](#telemetry-agent)はTWAMPを使用してDZD間のメトリクスを収集します。

### IS-IS (Intermediate System to Intermediate System)
DoubleZeroネットワーク内部で使用されるリンクステートルーティングプロトコル。IS-ISメトリクスは[リンクドレイン](#soft-drained)操作中に調整されます。

---

## ジオロケーション {#geolocation}

### ジオロケーション
レイテンシ測定を使用してデバイスの物理的な位置を検証するDoubleZeroサービス。既知の場所にあるインフラストラクチャ（[DZD](#dzd-doublezero-device)）とターゲットデバイス間の[RTT](#rtt-round-trip-time)測定により、デバイスが基準点から一定の距離内にあることの暗号学的に署名された証明を提供します。測定のオンチェーン記録は将来のリリースで計画されています。ユーザードキュメントについては、[ジオロケーション](geolocation.md)を参照してください。

### geoProbe
[ジオロケーション](#geolocation)システムにおけるレイテンシ測定の仲介役として機能するベアメタルサーバー。geoProbeは[DZD](#dzd-doublezero-device)から約1ms以内の場所に設置され、親DZDから署名されたLocationOffsetを受信し、[TWAMP](#twamp-two-way-active-measurement-protocol)、署名付きTWAMP、またはICMPエコーを介してターゲットデバイスへの[RTT](#rtt-round-trip-time)を測定します。各geoProbeは[オンチェーン](#onchain)に登録され、1つ以上の親DZDにリンクされます。コントリビュータードキュメントについては、[Geoprobeのデプロイ](../contributors/geolocation.md)を参照してください。

### LocationOffset
[DZD](#dzd-doublezero-device)の地理的位置（緯度と経度）およびエンティティ間のレイテンシ関係のチェーン（DZD↔Probe または Probe↔Target）を含む署名付きデータ構造。LocationOffsetはEd25519で署名され、測定チェーンを通じてUDP経由で送信されます。複合オフセットには以前の測定への参照が含まれ、監査可能なトレイルを作成します。

---

## ブロックチェーンと鍵

### オンチェーン {#onchain}
DoubleZeroの文脈では、オンチェーンとはDoubleZero台帳に記録されたデータと操作を指します。デバイスやリンクの設定が集中管理システムに存在する従来のネットワークとは異なり、DoubleZeroではデバイス登録、リンク設定、テレメトリ送信をオンチェーンに記録し、ネットワーク状態をすべての参加者にとって透明で検証可能にしています。

### サービスキー
CLI操作の認証に使用される暗号鍵ペア。DoubleZeroスマートコントラクトとやり取りするためのコントリビューターIDです。`~/.config/solana/id.json`に保存されます。

### メトリクスパブリッシャーキー
[Telemetry Agent](#telemetry-agent)がブロックチェーンへのメトリクス送信に署名するために使用する暗号鍵ペア。セキュリティの分離のためにサービスキーとは別になっています。`~/.config/doublezero/metrics-publisher.json`に保存されます。

---

## ハードウェアとソフトウェア

### EOS (Extensible Operating System)
DZDスイッチ上で動作するAristaのネットワークオペレーティングシステム。コントリビューターは[Config Agent](#config-agent)と[Telemetry Agent](#telemetry-agent)をEOS拡張機能としてインストールします。

### EOS拡張機能
Arista EOSスイッチにインストールできるソフトウェアパッケージ。DZエージェントは`.rpm`ファイルとして配布され、`extension`コマンドを介してインストールされます。