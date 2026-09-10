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
メッシュネットワーク内の相互接続ポイントで、異なる[コントリビューター](#contributor)のリンクがブリッジされます。DZXは、ネットワークの交差点が発生する主要な大都市圏（例：NYC、LON、TYO）に配置されています。ネットワークコントリビューターは、最寄りのDZXで自身のリンクをより広範なDoubleZeroメッシュにクロスコネクトする必要があります。Internet Exchange（IX）と類似した概念です。

### WANリンク
**同一の**コントリビューターが運用する2つの[DZD](#dzd-doublezero-device)間のWide Area Networkリンク。WANリンクは、単一のコントリビューターのインフラストラクチャ内でバックボーン接続を提供します。

### DZXリンク
[DZX](#dzx-doublezero-exchange)において、**異なる**コントリビューターが運用する[DZD](#dzd-doublezero-device)間で確立されるリンク。DZXリンクは、双方による明示的な承認が必要です。

### DZプレフィックス
オーバーレイネットワークアドレッシングのために[DZD](#dzd-doublezero-device)に割り当てられるCIDR形式のIPアドレス割り当て。[デバイス作成](contribute-provisioning.md#step-32-create-your-device-onchain)時に`--dz-prefixes`パラメータを使用して指定します。

---

## デバイスタイプ

### エッジデバイス
DoubleZeroネットワークへのユーザー接続を提供する[DZD](#dzd-doublezero-device)。エッジデバイスは[CYOA](#cyoa-choose-your-own-adventure)インターフェースを活用してユーザー（バリデーター、RPCオペレーター）を終端し、ネットワークに接続します。

### トランジットデバイス
DoubleZeroネットワーク内でバックボーン接続を提供する[DZD](#dzd-doublezero-device)。トランジットデバイスはDZD間のトラフィックを転送しますが、ユーザー接続を直接終端することはありません。

### ハイブリッドデバイス
[エッジ](#エッジデバイス)と[トランジット](#トランジットデバイス)の両方の機能を組み合わせた[DZD](#dzd-doublezero-device)で、ユーザー接続とバックボーンルーティングの両方を提供します。

---

## 接続性

### CYOA (Choose Your Own Adventure)
[コントリビューター](#contributor)がDoubleZeroネットワークへのユーザー接続オプションを登録できるインターフェースタイプ。CYOAインターフェースには、[DIA](#dia-direct-internet-access)、GREトンネル、プライベートピアリングなど、さまざまな方法が含まれます。設定の詳細は[CYOAインターフェースの作成](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)を参照してください。

### DIA (Direct Internet Access)
パブリックインターネット経由で提供される接続を指す標準的なネットワーク用語。DoubleZeroでは、DIAはユーザー（バリデーター、RPCオペレーター）が既存のインターネット接続を通じて[DZD](#dzd-doublezero-device)に接続する[CYOA](#cyoa-choose-your-own-adventure)インターフェースタイプです。

### IBRL (Increase Bandwidth Reduce Latency)
バリデーターやRPCノードがブロックチェーンクライアントを再起動せずにDoubleZeroに接続できる接続モード。IBRLは既存のパブリックIPアドレスを使用し、最寄りの[DZD](#dzd-doublezero-device)へのオーバーレイトンネルを確立します。セットアップ手順は[Mainnet-Beta接続](DZ%20Mainnet-beta%20Connection.md)を参照してください。

### マルチキャスト
DoubleZeroがサポートする1対多のパケット配信方式。マルチキャストモードには2つの役割があります：**パブリッシャー**（ネットワーク全体にパケットを送信）と**サブスクライバー**（パブリッシャーからパケットを受信）。開発チームによる効率的なデータ配信に使用されます。接続の詳細は[その他のマルチキャスト接続](Other%20Multicast%20Connection.md)を参照してください。

---

## ソフトウェアコンポーネント

### doublezerod
ユーザーサーバー（バリデーター、RPCノード）上で実行されるDoubleZeroデーモンサービス。DoubleZeroネットワークへの接続を管理し、トンネルの確立を処理し、[DZD](#dzd-doublezero-device)への接続を維持します。systemdを介して設定され、[`doublezero`](#doublezero-cli) CLIを通じて制御されます。

### doublezero (CLI)
DoubleZeroネットワークと対話するためのコマンドラインインターフェース。接続、ID管理、ステータス確認、管理操作に使用されます。[`doublezerod`](#doublezerod)デーモンと通信します。

### Config Agent
[DZD](#dzd-doublezero-device)上で実行されるソフトウェアエージェントで、デバイス設定を管理します。[Controller](#controller)サービスから設定を読み取り、デバイスに変更を適用します。セットアップについては[Config Agentのインストール](contribute-provisioning.md#step-44-install-config-agent)を参照してください。

### Telemetry Agent
[DZD](#dzd-doublezero-device)上で実行されるソフトウェアエージェントで、パフォーマンスメトリクス（レイテンシ、ジッター、パケットロス）を収集し、DoubleZero台帳に送信します。セットアップについては[Telemetry Agentのインストール](contribute-provisioning.md#step-45-install-telemetry-agent)を参照してください。

### Controller
[DZD](#dzd-doublezero-device)エージェントに設定を提供するサービス。ControllerはDoubleZero台帳上の[オンチェーン](#onchain)状態からデバイス設定を導出します。

---

## リンク状態

### アクティベート済み
リンクの通常の動作状態。トラフィックがリンクを通過し、ルーティング決定に参加します。

### ソフトドレイン
特定のリンクでトラフィックが抑制されるメンテナンス状態。計画的なメンテナンスウィンドウに使用されます。[アクティベート済み](#アクティベート済み)または[ハードドレイン](#ハードドレイン)に遷移できます。

### ハードドレイン
リンクが完全にサービスから除外されるメンテナンス状態。トラフィックはリンクを通過しません。[アクティベート済み](#アクティベート済み)に戻るには、先に[ソフトドレイン](#ソフトドレイン)に遷移する必要があります。

---

## 組織とトークン

### DZF (DoubleZero Foundation)
DoubleZero Foundationは、DoubleZeroネットワークの開発、分散化、セキュリティ、普及を支援するために設立された、会員を持たないケイマン諸島の非営利財団法人です。

### 2Zトークン
DoubleZeroネットワークのネイティブトークン。バリデーター手数料の支払いに使用され、[コントリビューター](#contributor)への報酬として分配されます。バリデーターはオンチェーンスワッププログラムを介して2Zで手数料を支払うことができます。[SOLから2Zへのスワップ](Swapping-sol-to-2z.md)を参照してください。

### コントリビューター
DoubleZeroネットワークに帯域幅とハードウェアを提供するネットワークインフラストラクチャプロバイダー。コントリビューターは[DZD](#dzd-doublezero-device)を運用し、[WAN](#wanリンク)および[DZX](#dzxリンク)リンクを提供し、その貢献に対して[2Z](#2zトークン)トークンのインセンティブを受け取ります。開始するには[コントリビュータードキュメント](contribute-overview.md)を参照してください。

---

## ネットワーキング概念

### MTU (Maximum Transmission Unit)
ネットワークリンクを介して送信できる最大パケットサイズ（バイト単位）。DoubleZeroのWANリンクは通常、効率性のためにMTU 9000（ジャンボフレーム）を使用します。

### VRF (Virtual Routing and Forwarding)
同一の物理ルーター上に複数の分離されたルーティングテーブルを共存させる技術。コントリビューターは通常、スイッチ管理トラフィックを本番トラフィックから分離するために、別の管理VRFを使用します。

### GRE (Generic Routing Encapsulation)
ネットワークパケットをIPパケット内にカプセル化するトンネリングプロトコル。[IBRL](#ibrl-increase-bandwidth-reduce-latency)および[CYOA](#cyoa-choose-your-own-adventure)接続で、ユーザーとDZD間のオーバーレイトンネルを作成するために使用されます。

### BGP (Border Gateway Protocol)
インターネット上のネットワーク間でルーティング情報を交換するために使用されるルーティングプロトコル。DoubleZeroは内部的にASN 65342でBGPを使用します。

### ASN (Autonomous System Number)
BGPルーティングのためにネットワークに割り当てられる一意の識別子。すべてのDoubleZeroデバイスは内部BGPプロセスに**ASN 65342**を使用します。

### ループバックインターフェース
管理およびルーティング目的で使用されるルーター/スイッチ上の仮想ネットワークインターフェース。DZDは内部ルーティングにLoopback255（VPNv4）とLoopback256（IPv4）を使用します。

### CIDR (Classless Inter-Domain Routing)
IPアドレス範囲を指定するための表記法。形式は`IP/プレフィックス長`で、プレフィックス長はネットワークサイズを示します（例：`/29` = 8アドレス、`/24` = 256アドレス）。

### ジッター
時間経過に伴うパケットレイテンシのばらつき。リアルタイムアプリケーションにとって低ジッターは重要です。

### RTT (Round-Trip Time)
パケットが送信元から宛先へ移動し、戻ってくるまでの時間。デバイス間のネットワークレイテンシを測定するために使用されます。

### TWAMP (Two-Way Active Measurement Protocol)
レイテンシやパケットロスなどのネットワークパフォーマンスメトリクスを測定するためのプロトコル。[Telemetry Agent](#telemetry-agent)はDZD間のメトリクスを収集するためにTWAMPを使用します。

### IS-IS (Intermediate System to Intermediate System)
DoubleZeroネットワーク内部で使用されるリンクステートルーティングプロトコル。IS-ISメトリクスは[リンクドレイン](#ソフトドレイン)操作時に調整されます。

---

## ジオロケーション

### ジオロケーション
レイテンシ測定を使用してデバイスの物理的な位置を検証するDoubleZeroサービス。既知の場所にあるインフラストラクチャ（[DZD](#dzd-doublezero-device)）とターゲットデバイス間の[RTT](#rtt-round-trip-time)測定により、デバイスが基準点から一定の距離内にあることの暗号署名付き証明を提供します。測定のオンチェーン記録は将来のリリースで計画されています。ユーザードキュメントについては[ジオロケーション](geolocation.md)を参照してください。

### geoProbe
[ジオロケーション](#ジオロケーション)システムにおけるレイテンシ測定の仲介役として機能するベアメタルサーバー。geoProbeは[DZD](#dzd-doublezero-device)から約1ms以内の場所に配置され、親DZDから署名済みLocationOffsetを受信し、[TWAMP](#twamp-two-way-active-measurement-protocol)、署名済みTWAMP、またはICMPエコーを介してターゲットデバイスへの[RTT](#rtt-round-trip-time)を測定します。各geoProbeは[オンチェーン](#onchain)で登録され、1つ以上の親DZDにリンクされます。コントリビュータードキュメントについては[geoProbeのデプロイ](contribute-geolocation.md)を参照してください。

### LocationOffset
[DZD](#dzd-doublezero-device)の地理的位置（緯度と経度）とエンティティ間のレイテンシ関係のチェーン（DZD↔Probe または Probe↔Target）を含む署名済みデータ構造。LocationOffsetはEd25519で署名され、測定チェーンを通じてUDPで送信されます。複合オフセットには以前の測定への参照が含まれ、監査可能なトレイルを作成します。

---

## ブロックチェーンと鍵

### オンチェーン
DoubleZeroの文脈では、オンチェーンとはDoubleZero台帳に記録されるデータと操作を指します。デバイスやリンクの設定が集中管理システムに存在する従来のネットワークとは異なり、DoubleZeroはデバイス登録、リンク設定、テレメトリ送信をオンチェーンに記録し、ネットワーク状態をすべての参加者が透過的かつ検証可能にします。

### サービスキー
CLI操作の認証に使用される暗号鍵ペア。これはDoubleZeroスマートコントラクトと対話するためのコントリビューターIDです。`~/.config/solana/id.json`に保存されます。

### メトリクスパブリッシャーキー
[Telemetry Agent](#telemetry-agent)がブロックチェーンへのメトリクス送信に署名するために使用する暗号鍵ペア。セキュリティ分離のためにサービスキーとは別に管理されます。`~/.config/doublezero/metrics-publisher.json`に保存されます。

### リワードマネージャーキー
コントリビューターの報酬の支払先を制御する暗号鍵ペア。受取ウォレットリストの変更に署名しますが、報酬自体を保持することはありません。[サービスキー](#サービスキー)とは別に管理されます。コントリビューターリポジトリの[報酬管理](https://github.com/malbeclabs/contributors#rewards-management)を参照してください。

---

## ハードウェアとソフトウェア

### EOS (Extensible Operating System)
DZDスイッチ上で動作するAristaのネットワークオペレーティングシステム。コントリビューターはEOS拡張機能として[Config Agent](#config-agent)と[Telemetry Agent](#telemetry-agent)をインストールします。

### EOS拡張機能
Arista EOSスイッチにインストールできるソフトウェアパッケージ。DZエージェントは`.rpm`ファイルとして配布され、`extension`コマンドを介してインストールされます。