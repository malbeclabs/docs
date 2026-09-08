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
メッシュネットワーク内の相互接続ポイントで、異なる[コントリビューター](#contributor)のリンクがブリッジされる場所です。DZXは、ネットワークの交差点が発生する主要な都市圏（例：NYC、LON、TYO）に設置されています。ネットワークコントリビューターは、最寄りのDZXで自身のリンクをより広範なDoubleZeroメッシュにクロスコネクトする必要があります。Internet Exchange (IX) と同様の概念です。

### WANリンク
**同一の**コントリビューターによって運用される2つの[DZD](#dzd-doublezero-device)間のWide Area Networkリンク。WANリンクは、単一のコントリビューターのインフラストラクチャ内でバックボーン接続を提供します。

### DZXリンク
[DZX](#dzx-doublezero-exchange)で確立される、**異なる**コントリビューターによって運用される[DZD](#dzd-doublezero-device)間のリンク。DZXリンクは双方の明示的な承認が必要です。

### DZプレフィックス
オーバーレイネットワークアドレッシングのために[DZD](#dzd-doublezero-device)に割り当てられたCIDR形式のIPアドレス割り当て。[デバイス作成](contribute-provisioning.md#step-32-create-your-device-onchain)時に`--dz-prefixes`パラメータを使用して指定します。

---

## デバイスタイプ

### エッジデバイス
DoubleZeroネットワークへのユーザー接続を提供する[DZD](#dzd-doublezero-device)。エッジデバイスは[CYOA](#cyoa-choose-your-own-adventure)インターフェースを活用してユーザー（バリデーター、RPCオペレーター）を終端し、ネットワークに接続します。

### トランジットデバイス
DoubleZeroネットワーク内でバックボーン接続を提供する[DZD](#dzd-doublezero-device)。トランジットデバイスはDZD間のトラフィックを転送しますが、ユーザー接続を直接終端することはありません。

### ハイブリッドデバイス
[エッジ](#edge-device)と[トランジット](#transit-device)の両方の機能を兼ね備えた[DZD](#dzd-doublezero-device)で、ユーザー接続とバックボーンルーティングの両方を提供します。

---

## 接続性

### CYOA (Choose Your Own Adventure)
[コントリビューター](#contributor)がユーザーのDoubleZeroネットワークへの接続オプションを登録できるインターフェースタイプ。CYOAインターフェースには、[DIA](#dia-direct-internet-access)、GREトンネル、プライベートピアリングなど、さまざまな方法が含まれます。設定の詳細については[CYOAインターフェースの作成](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)を参照してください。

### DIA (Direct Internet Access)
パブリックインターネット経由で提供される接続に関する標準的なネットワーキング用語。DoubleZeroでは、DIAはユーザー（バリデーター、RPCオペレーター）が既存のインターネット接続を通じて[DZD](#dzd-doublezero-device)に接続する[CYOA](#cyoa-choose-your-own-adventure)インターフェースタイプです。

### IBRL (Increase Bandwidth Reduce Latency)
バリデーターやRPCノードがブロックチェーンクライアントを再起動せずにDoubleZeroに接続できる接続モード。IBRLは既存のパブリックIPアドレスを使用し、最寄りの[DZD](#dzd-doublezero-device)へのオーバーレイトンネルを確立します。セットアップ手順については[Mainnet-Beta接続](DZ%20Mainnet-beta%20Connection.md)を参照してください。

### マルチキャスト
DoubleZeroがサポートする1対多のパケット配信方式。マルチキャストモードには、**パブリッシャー**（ネットワーク全体にパケットを送信）と**サブスクライバー**（パブリッシャーからパケットを受信）の2つの役割があります。開発チームが効率的なデータ配信に使用します。接続の詳細については[その他のマルチキャスト接続](Other%20Multicast%20Connection.md)を参照してください。

---

## ソフトウェアコンポーネント

### doublezerod
ユーザーサーバー（バリデーター、RPCノード）上で実行されるDoubleZeroデーモンサービス。DoubleZeroネットワークへの接続を管理し、トンネルの確立を処理し、[DZD](#dzd-doublezero-device)への接続性を維持します。systemdを介して設定され、[`doublezero`](#doublezero-cli) CLIを通じて制御されます。

### doublezero (CLI)
DoubleZeroネットワークとやり取りするためのコマンドラインインターフェース。接続、アイデンティティの管理、ステータスの確認、および管理操作に使用されます。[`doublezerod`](#doublezerod)デーモンと通信します。

### Config Agent
[DZD](#dzd-doublezero-device)上で実行されるソフトウェアエージェントで、デバイス設定を管理します。[Controller](#controller)サービスから設定を読み取り、デバイスに変更を適用します。セットアップについては[Config Agentのインストール](contribute-provisioning.md#step-44-install-config-agent)を参照してください。

### Telemetry Agent
[DZD](#dzd-doublezero-device)上で実行されるソフトウェアエージェントで、パフォーマンスメトリクス（レイテンシ、ジッター、パケットロス）を収集し、DoubleZero台帳に送信します。セットアップについては[Telemetry Agentのインストール](contribute-provisioning.md#step-45-install-telemetry-agent)を参照してください。

### Controller
[DZD](#dzd-doublezero-device)エージェントに設定を提供するサービス。ControllerはDoubleZero台帳上の[オンチェーン](#onchain)状態からデバイス設定を導出します。

---

## リンク状態

### アクティベート済み
リンクの通常の運用状態。トラフィックがリンクを通過し、ルーティング決定に参加します。

### ソフトドレイン
特定のリンクでトラフィックが抑制されるメンテナンス状態。グレースフルなメンテナンスウィンドウに使用されます。[アクティベート済み](#activated)または[ハードドレイン](#hard-drained)に移行できます。

### ハードドレイン
リンクがサービスから完全に除外されるメンテナンス状態。リンクを通過するトラフィックはありません。[アクティベート済み](#activated)に戻る前に[ソフトドレイン](#soft-drained)に移行する必要があります。

---

## 組織とトークン

### DZF (DoubleZero Foundation)
DoubleZero Foundationは、DoubleZeroネットワークの開発、分散化、セキュリティ、および普及を支援するために設立された、メンバーを持たないケイマン諸島の非営利財団法人です。

### 2Zトークン
DoubleZeroネットワークのネイティブトークン。バリデーター手数料の支払いに使用され、[コントリビューター](#contributor)への報酬として配布されます。バリデーターはオンチェーンスワッププログラムを通じて2Zで手数料を支払うことができます。[SOLから2Zへのスワップ](Swapping-sol-to-2z.md)を参照してください。

### コントリビューター
DoubleZeroネットワークに帯域幅とハードウェアを提供するネットワークインフラストラクチャプロバイダー。コントリビューターは[DZD](#dzd-doublezero-device)を運用し、[WAN](#wanリンク)および[DZX](#dzxリンク)リンクを提供し、その貢献に対して[2Z](#2zトークン)トークンインセンティブを受け取ります。開始するには[コントリビュータードキュメント](contribute-overview.md)を参照してください。

---

## ネットワーキング概念

### MTU (Maximum Transmission Unit)
ネットワークリンク上で送信可能な最大パケットサイズ（バイト単位）。DoubleZeroのWANリンクは通常、効率性のためにMTU 9000（ジャンボフレーム）を使用します。

### VRF (Virtual Routing and Forwarding)
同一の物理ルーター上に複数の分離されたルーティングテーブルを存在させる技術。コントリビューターは多くの場合、スイッチ管理トラフィックを本番トラフィックから分離するために別の管理VRFを使用します。

### GRE (Generic Routing Encapsulation)
ネットワークパケットをIPパケット内にカプセル化するトンネリングプロトコル。[IBRL](#ibrl-increase-bandwidth-reduce-latency)および[CYOA](#cyoa-choose-your-own-adventure)接続で、ユーザーとDZD間のオーバーレイトンネルを作成するために使用されます。

### BGP (Border Gateway Protocol)
インターネット上のネットワーク間でルーティング情報を交換するために使用されるルーティングプロトコル。DoubleZeroは内部的にASN 65342でBGPを使用しています。

### ASN (Autonomous System Number)
BGPルーティングのためにネットワークに割り当てられる一意の識別子。すべてのDoubleZeroデバイスは内部BGPプロセスに**ASN 65342**を使用します。

### ループバックインターフェース
管理およびルーティング目的でルーター/スイッチ上に設定される仮想ネットワークインターフェース。DZDは内部ルーティングにLoopback255（VPNv4）およびLoopback256（IPv4）を使用します。

### CIDR (Classless Inter-Domain Routing)
IPアドレス範囲を指定するための表記法。形式は`IP/prefix-length`で、プレフィックス長はネットワークサイズを示します（例：`/29` = 8アドレス、`/24` = 256アドレス）。

### ジッター
時間の経過に伴うパケットレイテンシの変動。リアルタイムアプリケーションにとって低ジッターは極めて重要です。

### RTT (Round-Trip Time)
パケットが送信元から宛先に到達し、戻ってくるまでの時間。デバイス間のネットワークレイテンシの測定に使用されます。

### TWAMP (Two-Way Active Measurement Protocol)
レイテンシやパケットロスなどのネットワークパフォーマンスメトリクスを測定するためのプロトコル。[Telemetry Agent](#telemetry-agent)はTWAMPを使用してDZD間のメトリクスを収集します。

### IS-IS (Intermediate System to Intermediate System)
DoubleZeroネットワーク内部で使用されるリンクステートルーティングプロトコル。IS-ISメトリクスは[リンクドレイン](#soft-drained)操作中に調整されます。

---

## ジオロケーション

### ジオロケーション
レイテンシ測定を使用してデバイスの物理的な位置を検証するDoubleZeroサービス。既知の位置のインフラストラクチャ（[DZD](#dzd-doublezero-device)）とターゲットデバイス間の[RTT](#rtt-round-trip-time)測定により、デバイスが基準点から一定の距離内にあることの暗号学的に署名された証明が提供されます。測定のオンチェーン記録は将来のリリースで予定されています。ユーザードキュメントについては[ジオロケーション](geolocation.md)を参照してください。

### geoProbe
[ジオロケーション](#ジオロケーション)システムにおけるレイテンシ測定の仲介役として機能するベアメタルサーバー。geoProbeは[DZD](#dzd-doublezero-device)から約1ms以内の場所に設置され、親DZDから署名されたLocationOffsetを受信し、[TWAMP](#twamp-two-way-active-measurement-protocol)、署名付きTWAMP、またはICMPエコーを介してターゲットデバイスへの[RTT](#rtt-round-trip-time)を測定します。各geoProbeは[オンチェーン](#onchain)に登録され、1つ以上の親DZDにリンクされています。コントリビュータードキュメントについては[geoProbeのデプロイ](contribute-geolocation.md)を参照してください。

### LocationOffset
[DZD](#dzd-doublezero-device)の地理的位置（緯度と経度）およびエンティティ間のレイテンシ関係チェーン（DZD↔Probe または Probe↔Target）を含む署名されたデータ構造。LocationOffsetはEd25519で署名され、測定チェーンを通じてUDP経由で送信されます。複合オフセットには以前の測定への参照が含まれ、監査可能なトレイルを作成します。

---

## ブロックチェーンと鍵

### オンチェーン
DoubleZeroの文脈では、オンチェーンとはDoubleZero台帳上に記録されるデータおよび操作を指します。デバイスやリンクの設定が集中管理システムに存在する従来のネットワークとは異なり、DoubleZeroはデバイス登録、リンク設定、テレメトリ送信をオンチェーンに記録し、ネットワーク状態をすべての参加者が透明かつ検証可能な形で利用できるようにします。

### サービスキー
CLI操作の認証に使用される暗号鍵ペア。DoubleZeroスマートコントラクトとやり取りするためのコントリビューターのアイデンティティです。`~/.config/solana/id.json`に保存されます。

### メトリクスパブリッシャーキー
[Telemetry Agent](#telemetry-agent)がブロックチェーンへのメトリクス送信に署名するために使用する暗号鍵ペア。セキュリティ分離のためにサービスキーとは分離されています。`~/.config/doublezero/metrics-publisher.json`に保存されます。

### リワードマネージャーキー
コントリビューターの報酬の支払い先を制御する暗号鍵ペア。受取ウォレットリストの変更に署名しますが、報酬自体を保持することはありません。[DZF](#dzf-doublezero-foundation)によってコントリビューターの[サービスキー](#サービスキー)に対して登録されます。[報酬管理](contribute-rewards.md)を参照してください。

---

## ハードウェアとソフトウェア

### EOS (Extensible Operating System)
DZDスイッチ上で動作するAristaのネットワークオペレーティングシステム。コントリビューターは[Config Agent](#config-agent)と[Telemetry Agent](#telemetry-agent)をEOS拡張としてインストールします。

### EOS拡張
Arista EOSスイッチにインストールできるソフトウェアパッケージ。DZエージェントは`.rpm`ファイルとして配布され、`extension`コマンドを介してインストールされます。