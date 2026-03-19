# 用語集
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


このページでは、ドキュメント全体で使用されるDoubleZero固有の用語を定義します。

---

## ネットワークインフラ

### DZD（DoubleZeroデバイス）
DoubleZeroリンクを終端し、DoubleZeroエージェントソフトウェアを実行する物理ネットワークスイッチングハードウェアです。DZDはデータセンターに配備され、ルーティング、パケット処理、ユーザー接続サービスを提供します。各DZDは特定の[ハードウェア仕様](contribute.md#dzd-network-hardware)を必要とし、[Config Agent](#config-agent)と[Telemetry Agent](#telemetry-agent)の両方を実行します。

### DZX（DoubleZero Exchange）
異なる[コントリビューター](#contributor)リンクが橋渡しされるメッシュネットワークの相互接続点です。DZXはネットワーク交差が発生する主要な大都市圏（NYC、LON、TYOなど）に位置しています。ネットワークコントリビューターは、最寄りのDZXでより広いDoubleZeroメッシュにリンクをクロスコネクトする必要があります。概念的にはインターネットエクスチェンジ（IX）に類似しています。

### WANリンク
**同一**コントリビューターが運用する2つの[DZD](#dzd-doublezero-device)間のワイドエリアネットワークリンクです。WANリンクは、単一コントリビューターのインフラ内でバックボーン接続を提供します。

### DZXリンク
[DZX](#dzx-doublezero-exchange)において**異なる**コントリビューターが運用する[DZD](#dzd-doublezero-device)間に確立されるリンクです。DZXリンクは双方の明示的な承認が必要です。

### DZプレフィックス
オーバーレイネットワークアドレッシングのために[DZD](#dzd-doublezero-device)に割り当てられるCIDR形式のIPアドレス割り当てです。`--dz-prefixes`パラメーターを使用して[デバイス作成](contribute-provisioning.md#step-32-create-your-device-onchain)時に指定します。

---

## デバイスタイプ

### エッジデバイス
ユーザーにDoubleZeroネットワークへの接続を提供する[DZD](#dzd-doublezero-device)です。エッジデバイスは[CYOA](#cyoa-choose-your-own-adventure)インターフェースを活用してユーザー（バリデーター、RPCオペレーター）を終端し、ネットワークに接続します。

### トランジットデバイス
DoubleZeroネットワーク内でバックボーン接続を提供する[DZD](#dzd-doublezero-device)です。トランジットデバイスはDZD間でトラフィックを移動しますが、ユーザー接続を直接終端しません。

### ハイブリッドデバイス
[エッジ](#edge-device)と[トランジット](#transit-device)の両機能を組み合わせ、ユーザー接続とバックボーンルーティングの両方を提供する[DZD](#dzd-doublezero-device)です。

---

## 接続性

### CYOA（Choose Your Own Adventure）
[コントリビューター](#contributor)がユーザーのDoubleZeroネットワーク接続オプションを登録できるインターフェースタイプです。CYOAインターフェースには、[DIA](#dia-direct-internet-access)、GREトンネル、プライベートピアリングなどのさまざまな方式が含まれます。設定の詳細は[CYOAインターフェースの作成](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)を参照してください。

### DIA（Direct Internet Access）
パブリックインターネット経由で提供される接続の標準ネットワーク用語です。DoubleZeroでは、DIAはユーザー（バリデーター、RPCオペレーター）が既存のインターネット接続を通じて[DZD](#dzd-doublezero-device)に接続する[CYOA](#cyoa-choose-your-own-adventure)インターフェースタイプです。

### IBRL（Increase Bandwidth Reduce Latency）
バリデーターとRPCノードがブロックチェーンクライアントを再起動せずにDoubleZeroに接続できる接続モードです。IBRLは既存のパブリックIPアドレスを使用し、最寄りの[DZD](#dzd-doublezero-device)へのオーバーレイトンネルを確立します。セットアップ手順は[メインネットベータ接続](DZ%20Mainnet-beta%20Connection.md)を参照してください。

### マルチキャスト
DoubleZeroがサポートする1対多パケット配信方式です。マルチキャストモードには2つの役割があります：**パブリッシャー**（ネットワーク全体にパケットを送信）と**サブスクライバー**（パブリッシャーからパケットを受信）。開発チームが効率的なデータ配信に使用します。接続の詳細は[その他のマルチキャスト接続](Other%20Multicast%20Connection.md)を参照してください。

---

## ソフトウェアコンポーネント

### doublezerod
ユーザーサーバー（バリデーター、RPCノード）で実行されるDoubleZeroデーモンサービスです。DoubleZeroネットワークへの接続を管理し、トンネル確立を処理し、[DZD](#dzd-doublezero-device)への接続を維持します。systemdで設定され、[`doublezero`](#doublezero-cli) CLIを通じて制御されます。

### doublezero（CLI）
DoubleZeroネットワークと対話するためのコマンドラインインターフェースです。接続、アイデンティティ管理、ステータス確認、管理操作に使用されます。[`doublezerod`](#doublezerod)デーモンと通信します。

### Config Agent
[DZD](#dzd-doublezero-device)上で実行されるデバイス設定管理ソフトウェアエージェントです。[コントローラー](#controller)サービスから設定を読み込み、デバイスに変更を適用します。セットアップは[Config Agentのインストール](contribute-provisioning.md#step-44-install-config-agent)を参照してください。

### Telemetry Agent
[DZD](#dzd-doublezero-device)上で実行されるパフォーマンスメトリクス（レイテンシ、ジッター、パケットロス）を収集し、DoubleZeroレジャーに送信するソフトウェアエージェントです。セットアップは[Telemetry Agentのインストール](contribute-provisioning.md#step-45-install-telemetry-agent)を参照してください。

### コントローラー
[DZD](#dzd-doublezero-device)エージェントに設定を提供するサービスです。コントローラーはDoubleZeroレジャーの[オンチェーン](#onchain)状態からデバイス設定を導出します。

---

## リンク状態

### アクティベート済み
リンクの通常の動作状態です。トラフィックがリンクを通じて流れ、ルーティング決定に参加します。

### ソフトドレイン済み
特定のリンクでトラフィックが抑制されるメンテナンス状態です。グレースフルなメンテナンスウィンドウに使用されます。[アクティベート済み](#activated)または[ハードドレイン済み](#hard-drained)に移行できます。

### ハードドレイン済み
リンクが完全にサービスから除外されるメンテナンス状態です。リンクを通じてトラフィックは流れません。[アクティベート済み](#activated)に戻る前に[ソフトドレイン済み](#soft-drained)に移行する必要があります。

---

## 組織・トークン

### DZF（DoubleZero Foundation）
DoubleZero Foundationは、DoubleZeroネットワークの開発、分散化、セキュリティ、および普及を支援するために設立されたケイマン諸島のメンバーなし非営利財団会社です。

### 2Zトークン
DoubleZeroネットワークのネイティブトークンです。バリデーター手数料の支払いに使用され、[コントリビューター](#contributor)への報酬として配布されます。バリデーターはオンチェーンスワッププログラムを通じて2Zで手数料を支払うことができます。[2Zでの手数料支払い](paying-fees2z.md)と[SOLから2Zへのスワップ](Swapping-sol-to-2z.md)を参照してください。

### コントリビューター
DoubleZeroネットワークに帯域幅とハードウェアを提供するネットワークインフラプロバイダーです。コントリビューターは[DZD](#dzd-doublezero-device)を運用し、[WAN](#wan-link)および[DZX](#dzx-link)リンクを提供し、その貢献に対して[2Z](#2z-token)トークンインセンティブを受け取ります。開始するには[コントリビューターのドキュメント](contribute-overview.md)を参照してください。

---

## ネットワーキングの概念

### MTU（Maximum Transmission Unit）
ネットワークリンクで送信できる最大パケットサイズ（バイト単位）です。DoubleZero WANリンクは通常、効率化のためにMTU 9000（ジャンボフレーム）を使用します。

### VRF（Virtual Routing and Forwarding）
同一の物理ルーター上に複数の独立したルーティングテーブルを共存させる技術です。コントリビューターは、スイッチ管理トラフィックを本番トラフィックから分離するために、独立した管理VRFを使用することが多いです。

### GRE（Generic Routing Encapsulation）
IPパケット内にネットワークパケットをカプセル化するトンネリングプロトコルです。[IBRL](#ibrl-increase-bandwidth-reduce-latency)および[CYOA](#cyoa-choose-your-own-adventure)接続がユーザーとDZD間のオーバーレイトンネルを作成するために使用します。

### BGP（Border Gateway Protocol）
インターネット上のネットワーク間でルーティング情報を交換するために使用されるルーティングプロトコルです。DoubleZeroはASN 65342を使用して内部的にBGPを使用します。

### ASN（Autonomous System Number）
BGPルーティングのためにネットワークに割り当てられる一意の識別子です。すべてのDoubleZeroデバイスは内部BGPプロセスに**ASN 65342**を使用します。

### ループバックインターフェース
管理とルーティングの目的でルーター/スイッチ上に存在する仮想ネットワークインターフェースです。DZDは内部ルーティングにLoopback255（VPNv4）とLoopback256（IPv4）を使用します。

### CIDR（Classless Inter-Domain Routing）
IPアドレス範囲を指定するための表記法です。形式は`IP/プレフィックス長`で、プレフィックス長はネットワークサイズを示します（例：`/29` = 8アドレス、`/24` = 256アドレス）。

### ジッター
時間経過によるパケットレイテンシの変動です。低ジッターはリアルタイムアプリケーションに重要です。

### RTT（Round-Trip Time）
パケットが送信元から宛先へ、そして戻るまでの時間です。デバイス間のネットワークレイテンシを測定するために使用されます。

### TWAMP（Two-Way Active Measurement Protocol）
レイテンシやパケットロスなどのネットワークパフォーマンスメトリクスを測定するプロトコルです。[Telemetry Agent](#telemetry-agent)はDZD間のメトリクス収集にTWAMPを使用します。

### IS-IS（Intermediate System to Intermediate System）
DoubleZeroネットワーク内部で使用されるリンクステートルーティングプロトコルです。IS-ISメトリクスは[リンクドレイン](#soft-drained)操作中に調整されます。

---

## ブロックチェーン・キー

### オンチェーン
DoubleZeroのコンテキストでは、オンチェーンとはDoubleZeroレジャーに記録されたデータと操作を指します。デバイスとリンクの設定が中央集権的な管理システムに存在する従来のネットワークとは異なり、DoubleZeroはデバイス登録、リンク設定、テレメトリ送信をオンチェーンに記録します。これにより、ネットワーク状態がすべての参加者に対して透明で検証可能になります。

### サービスキー
CLI操作を認証するために使用される暗号鍵ペアです。これはDoubleZeroスマートコントラクトと対話するためのコントリビューターアイデンティティです。`~/.config/solana/id.json`に保存されます。

### メトリクスパブリッシャーキー
[Telemetry Agent](#telemetry-agent)がブロックチェーンへのメトリクス送信に署名するために使用する暗号鍵ペアです。セキュリティの分離のためにサービスキーとは別です。`~/.config/doublezero/metrics-publisher.json`に保存されます。

---

## ハードウェア・ソフトウェア

### EOS（Extensible Operating System）
DZDスイッチ上で実行されるAristaのネットワークオペレーティングシステムです。コントリビューターは[Config Agent](#config-agent)と[Telemetry Agent](#telemetry-agent)をEOS拡張機能としてインストールします。

### EOS拡張機能
Arista EOSスイッチにインストールできるソフトウェアパッケージです。DZエージェントは`.rpm`ファイルとして配布され、`extension`コマンドを通じてインストールされます。
