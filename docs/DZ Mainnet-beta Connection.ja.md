---
description: Solanaバリデーター（mainnet-betaまたはtestnet）と最大3台のバックアップをIBRLモードでDoubleZeroに接続します。IDの証明と接続リクエストを含みます。
---

# IBRLモードでのバリデーター接続

!!! warning "DoubleZeroに接続することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意するものとします"

??? warning "DoubleZero testnetに接続することにより、以下に記載される評価契約の条件に同意するものとします（クリックして展開）"
    <span style="font-size:14px;">DoubleZero Testnet</span>
    評価契約

    ソリューション（以下に定義）にアクセスまたは使用することにより、お客様は最初のアクセス日（以下「**発効日**」）をもって、本評価契約（以下「**本契約**」）がDoubleZero Foundation（以下「**DZF**」）がお客様（以下「**ユーザー**」または「**お客様**」）に評価目的でソリューションへのアクセスを提供する条件を定めるものであることに同意するものとします。本契約における相互の約束を考慮し、お客様は以下のとおり同意します：

    <span style="font-size:14px;">1. 定義</span>

    <span style="font-size:14px;">1.1 「**機密情報**」</span>とは、いずれかの当事者が他方の当事者に開示した情報のうち、機密として指定されたもの、またはその他の理由により機密として理解されるべきものを意味し、ソリューション、製品計画、事業計画、営業秘密、技術、またはその他の独占的情報を含みますが、これらに限定されません。

    <span style="font-size:14px;">1.2 「**ソリューション**」</span>とは、web3プロジェクト向けDoubleZero高性能ネットワークインフラストラクチャのtestnetバージョン（以下「**Testnet**」）および統合帯域幅を備えた関連エッジフィルタリングサービス（以下「**情報サービス**」）、DZソフトウェア（以下に定義）、DZFがDZソフトウェアに関して提供するすべての資料（以下「**ドキュメント**」）、およびDZFが本契約に基づきユーザーに提供するその他の資料を意味します。

    <span style="font-size:14px;">2. アクセス</span>

    <span style="font-size:14px;">2.1 ^^ソリューションへのアクセス^^。</span>本契約の条件に従い、DZFはインターネットを通じてユーザーにソリューションへのアクセスを提供します。ユーザーのアクセスは、ユーザーが情報サービスのみを評価できるようにするためのソリューションの非独占的、譲渡不能、限定的な使用です。ソリューションを構成するソフトウェア（以下「**DZソフトウェア**」）に関して、DZFは本契約により、評価期間中、ドキュメントで想定されるとおりにのみ当該DZソフトウェアをコピー、ダウンロード、合理的な数のコピーを作成、実行、およびデプロイ（該当する場合）するための限定的、取消可能なライセンスをユーザーに付与します。

    <span style="font-size:14px;">2.2 ^^制限^^。</span>ユーザーは、発効日からDZFにより終了されるまで（以下「**評価期間**」）、本契約に従ってソリューションを使用できます。ユーザーは、評価期間を超えてソリューションを使用する権利は、当事者間の別途の商業契約（手数料の支払いを含む）に従うものであることを理解します。ユーザーは、第三者に許可することも含め、以下を行ってはなりません：(i) ソリューションまたはその一部に基づいて派生物を修正または作成すること；(ii) 本契約で明示的に許可されている場合を除き、ソリューションを複製すること；(iii) ソリューションの全部または一部をサブライセンス、配布、販売、貸与、賃貸、リース、譲渡すること、またはサービスビューロー方式その他の方法で第三者にソリューションへのアクセスを提供すること（ただし、ユーザーのプラットフォームまたは製品を通じて、またはそれに関連して情報サービスを提供する場合を除き、スタンドアロンベースでは不可）；または(iv) 本契約で規定されている以外の方法でソリューションを使用すること。

    <span style="font-size:14px;">2.3 ^^所有権^^。</span>DZFは、ソリューションに関する知的財産権を含むすべての権利、権原、および利益を保持します。

    <span style="font-size:14px;">3 フィードバック</span>
    DZFは定期的にユーザーにソリューションの使用、運用、および機能に関するフィードバック（以下「フィードバック」）の提供を求めることがあり、ユーザーはDZFにフィードバックを提供することに同意します。ユーザーは本契約により、DZFに対し、フィードバックを製品およびサービスに使用および組み込み、当該製品およびサービスを製造、使用、販売、販売申し出、輸入、その他利用し、フィードバックを制限なく使用、コピー、配布、その他利用するための、非独占的、全世界的、永続的、取消不能、ロイヤリティフリー、全額支払済み、完全にサブライセンス可能かつ譲渡可能な権利およびライセンスを付与します。

    <span style="font-size:14px;">4. 期間および終了</span>

    <span style="font-size:14px;">4.1 ^^期間^^。</span>本契約は発効日をもって開始し、評価期間中完全に有効であり続けます。いずれの当事者も、理由の有無にかかわらず、相手方当事者への書面による通知（電子メールで足りる）をもって、本契約を便宜上直ちに終了することができます。

    <span style="font-size:14px;">4.1 ^^終了の効果^^。</span>理由を問わず本契約が終了した場合：(i) 本契約に基づきユーザーに付与された権利は直ちに終了するものとします；(ii) ユーザーはソリューションの使用を直ちに中止し、管理下にあるすべてのドキュメントおよびDZソフトウェアを返却または破棄するものとします；(iii) 各当事者は、相手方当事者のすべての機密情報および財産を速やかに返却または破棄するものとします；および(iv) 第2.2条、第2.3条、第3条、第4.2条、および第5条から第8条は存続するものとします。

    <span style="font-size:14px;">5. 機密保持</span>
    各当事者は、相手方当事者の機密情報を本契約に基づく義務の履行および権利の行使のためにのみ使用し、本契約で別途許可されている場合を除き、同情報を開示または開示を許可しないことに同意します。ただし、いずれの当事者も、知る必要があり、本契約に定めるものと同等以上の機密保持義務に拘束される自社の人員、弁護士、およびその他の代理人に対して機密情報を開示することができます。また、法律で要求される場合（その場合、受領当事者は開示当事者に事前に通知し、当該開示に異議を申し立てる機会を与え、適用法で許容される範囲で当該開示を最小限にするものとします）にも開示できます。本第5条の機密保持義務は、以下の情報には適用されないものとします：(a) 受領当事者の過失によらず一般に知られている、または公に入手可能な情報；(b) 開示当事者による開示前に、制限なく受領当事者が適切に知っていた情報；(c) 法的権限を有する他の者により、制限なく受領当事者に適切に開示された情報；または(d) 開示当事者の機密情報を使用または参照することなく受領当事者が独自に開発した情報。各当事者は、相手方当事者の機密情報を不正使用および開示から保護するために相当の注意を払うことに同意します。本条または本契約に含まれるライセンスの規定の実際のまたはおそれのある違反が発生した場合、違反していない当事者は、他の権利または救済を放棄することなく、直ちに差止命令およびその他の衡平法上の救済を求める権利を有するものとします。ユーザーは、ソリューションおよびソリューションへのアクセスを提供するパスワード、シードフレーズ、またはコードの秘密を、DZFの機密情報として維持する責任を負います。本契約のいかなる規定も、ソリューションのパフォーマンス、可用性、使用状況、完全性、およびセキュリティに関するデータを使用するDZFの権利または能力を制限するものではありません。いずれかの当事者が本第5条の規定に違反した場合、またはそのおそれがある場合、各当事者は、違反していない当事者が法的に適切な救済手段を持たず、したがって、保証金なしに、また実際の金銭的損害を示す必要なしに、直ちに差止命令およびその他の衡平法上の救済を受ける権利があることに同意します。

    <span style="font-size:14px;">6. 保証の免責；責任の制限</span>

    <span style="font-size:14px;">6.1 ^^保証の免責^^。</span>ソリューションは、いかなる種類の保証もなく「現状のまま」で提供されます。DZFは、ソリューションおよびドキュメントに関して、その状態、表明または説明への適合性を含め、明示、黙示、法定またはその他を問わず、いかなる保証も行わず、DZFは商品性、特定目的への適合性、権原、および非侵害のすべての黙示的保証を明確に否認します。

    <span style="font-size:14px;">6.2 ^^責任の制限^^。</span>
    第2.1条、第2.2条、および第5条の違反を除き、いかなる場合においても、いずれの当事者も、利益の損失もしくは使用の損失またはデータの損失に対する損害を含むがこれに限定されない、間接的、付随的、特別、またはその他の結果的損害について、お客様またはいかなる第三者が被ったものであっても、本契約に起因するまたは関連する、契約、不法行為、またはその他の訴訟において、たとえ相手方当事者がかかる損害の可能性を告知されていた場合であっても、相手方当事者に対して責任を負わないものとします。いかなる場合においても、本契約に起因するまたは関連するDZFの累積責任は、契約、不法行為、またはその他の訴訟であるかを問わず、100ドル（$100）を超えないものとします。**前述の制限は、本契約における限定的救済の本質的目的の不達成にかかわらず適用されるものとします。**当事者は、前述の制限が本契約に基づくリスクの合理的な配分を表すことに同意します。

    <span style="font-size:14px;">7. 準拠法</span>
    本契約および本契約に起因するまたは関連するすべての事項は、ケイマン諸島の法律に従って準拠、解釈、および構築されるものとします。本契約に起因するまたは関連する論争、紛争、または請求が生じた場合（以下「紛争」）、該当する当事者は、適宜、当該紛争について他の当事者に30日前に通知しなければなりません（以下「紛争通知」）。紛争通知の送達後30日の経過時に紛争が解決されない場合、該当当事者は本契約に定めるとおり仲裁手続きを開始することができます。紛争通知の送達後30日の経過時に紛争が残っている場合、紛争はケイマン国際調停仲裁センター（CI-MAC）が管理する仲裁により、本契約の日付時点で有効なCI-MAC仲裁規則（以下「仲裁規則」）に従って解決されるものとし、当該仲裁規則は本条項への参照により組み込まれたものとみなされ、仲裁法（改正後）に準拠するものとします。仲裁は、ケイマン諸島グランドケイマンのジョージタウンを仲裁地とし、ケイマン諸島法に準拠するものとします。仲裁の言語は英語とします。仲裁は、仲裁規則に従って選任される単独の仲裁人により決定されるものとします。仲裁人が下した裁定または決定は書面によるものとし、上訴の権利なく当事者に対して最終的かつ拘束力を有するものとし、かかる裁定に基づく判決は、管轄権を有するいかなる裁判所においても記録または執行することができるものとします。本契約に起因するまたは関連する請求に基づく法律上または衡平法上の訴訟は、いかなる管轄区域のいかなる裁判所においても提起されないものとします。本契約の条件を執行するために訴訟または仲裁が必要な場合、勝訴当事者は、敗訴当事者から弁護士費用を支払ってもらう権利を有するものとします。各当事者は、フォーラム・ノン・コンビニエンスの法理を主張する権利、かかる仲裁もしくは裁判所の管轄に服さないことを主張する権利、または本契約に従って手続きが提起される限りにおいて裁判地に異議を申し立てる権利を放棄します。</span>

    <span style="font-size:14px;">8. 一般条項</span>
    本契約は、DZFの事前の書面による同意なくユーザーが譲渡または移転することはできません。DZFは本契約を自由に譲渡することができます。本契約に基づき送付が必要なすべての通知は、電子メール（DZF宛：legal@doublezero.xyz）で送付され、送信翌日（送信が確認された場合）に受領されたものとみなされます。本契約のいずれかの規定が無効または執行不能と判断された場合、本契約の残りの規定は完全に有効であり続けるものとします。いずれかの当事者による本契約の不履行または違反の放棄は、その他のまたはその後の不履行または違反の放棄を構成するものではありません。いずれの当事者も、天災、地震、供給不足、輸送上の困難、労働争議、暴動、戦争、火災、伝染病、および予見可能か否かを問わず、その管理を超える類似の事象による履行の遅延または不履行について責任を負わないものとします。本契約は、添付書類とともに当事者間の完全な合意を構成し、本契約の主題に関する過去または同時期のすべての合意または表明（書面または口頭を問わず）に優先します。本契約は、各当事者の正当に授権された代表者が署名した書面によらない限り、修正または変更することはできません。

Solanaクラスターに一致するDoubleZeroネットワークを選択してください：`mainnet-beta`または`testnet`。[セットアップ](setup.md)で対応するパッケージをインストールし、以下のすべてのコマンドで同じネットワークを使用してください。

!!! Note inline end
    IBRLモードでは、既存のパブリックIPアドレスを使用するため、バリデータークライアントの再起動は不要です。

Solanaバリデーターは、このページの手順を使用してIBRLモードでDoubleZeroに接続します。

各Solanaバリデーターは独自の**IDキーペア**を持っています。ここから、**ノードID**として知られる公開鍵を抽出します。これはSolanaネットワーク上のバリデーターの一意なフィンガープリントです。

DoubleZeroIDとノードIDが特定できたら、マシンの所有権を証明します。これは、バリデーターのIDキーで署名されたDoubleZeroIDを含むメッセージを作成することで行われます。結果として得られる暗号署名は、お客様がバリデーターを制御していることの検証可能な証拠として機能します。

最後に、**DoubleZeroへの接続リクエスト**を送信します。このリクエストは次のことを伝えます：*「これが私のIDであり、これが所有権の証明であり、これが接続方法です。」* DoubleZeroはこの情報を検証し、証明を受け入れ、DoubleZero上でバリデーターのネットワークアクセスをプロビジョニングします。

このガイドでは、1台のプライマリバリデーターの登録と、同時に最大3台のバックアップ/フェイルオーバーマシンの登録が可能です。

## 前提条件 {#prerequisites}

- Solana CLIがインストールされ、$PATHに設定されていること
- バリデーターの場合：solユーザーでバリデーターIDキーペアファイル（例：validator-keypair.json）にアクセスする権限があること
- バリデーターの場合：接続するSolanaバリデーターのIDキーに少なくとも1 SOLがあることを確認すること
- ファイアウォールルールが、GRE（ipプロトコル47）およびBGP（169.254.0.0/16のtcp/179）を含む、DoubleZeroおよびSolana RPCに必要なアウトバウンド接続を許可していること

!!! info
    バリデーターIDはSolana gossipに対してチェックされ、ターゲットIPが決定されます。ターゲットIPとDoubleZero IDは、マシンとターゲットDoubleZeroデバイス間のGREトンネルを開く際に使用されます。

    注意：同じIPにジャンクIDとプライマリIDがある場合、マシンの登録にはプライマリIDのみが使用されます。これは、ジャンクIDがgossipに表示されないため、ターゲットマシンのIPを確認するために使用できないためです。

## 1. クライアントネットワークの確認 {#1-confirm-the-client-network}

続行する前に、[セットアップ](setup.md)の手順に従ってください。**mainnet-beta**または**testnet**用のパッケージをインストールしてください。異なるパッケージリポジトリを使用します。

セットアップの最後のステップでは、ネットワークから切断しました。これは、マシン上でDoubleZeroへのトンネルが1つだけ開いていること、およびそのトンネルが正しいネットワーク上にあることを確認するためです。

クライアントが選択したネットワーク上にあることを確認してください：

```bash
doublezero status
```

`Network`列が`mainnet-beta`または`testnet`となっており、Solanaクラスターと一致している必要があります。間違っている場合、または誤ったパッケージをインストールした場合は、[トラブルシューティング](troubleshooting.md#issue-wrong-doublezero-environment)のコピー＆ペーストによる切り替えを使用してください。

約30秒後に、利用可能なDoubleZeroデバイスが表示されます：

```bash
doublezero latency
```

出力例（mainnet-beta；testnetも同じですがデバイス数が少なくなります）：

```bash
 pubkey                                       | code          | ip              | min      | max      | avg      | reachable
 2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.74ms   | 1.92ms   | 1.84ms   | true
 ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.88ms   | 4.39ms   | 2.72ms   | true
 8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.45ms   | 3.30ms   | 2.74ms   | true
 8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.88ms   | 5.13ms   | 3.02ms   | true
 uzyg9iYw2FEbtdTHaDb5HoeEWYAPRPQgvsgyd873qPS  | nyc001-dz002  | 4.42.212.122    | 3.17ms   | 3.63ms   | 3.33ms   | true
 FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.33ms   | 5.46ms   | 3.39ms   | true
 9oKLaL6Hwno5TyAFutTbbkNrzxm1fw9fhzkiUHgsxgGx | dz-dc10-sw01  | 137.239.200.186 | 6.84ms   | 7.01ms   | 6.91ms   | true
 DESzDP8GkSTpQLkrUegLkt4S2ynGfZX5bTDzZf3sEE58 | was001-dz002  | 38.88.214.133   | 7.39ms   | 7.44ms   | 7.41ms   | true
 HHNCpqB7CwHVLxAiB1S86ko6gJRzLCtw78K1tc7ZpT5P | was001-dz001  | 66.198.11.74    | 7.67ms   | 7.85ms   | 7.76ms   | true
 9LFtjDzohKvCBzSquQD4YtL3HwuvkKBDE7KSzb8ztV2b | dz-mtl11-sw01 | 134.195.161.10  | 9.88ms   | 10.01ms  | 9.95ms   | true
 9M7FfYYyjM4wGinKPofZRNmQFcCjCKRbXscGBUiXvXnG | dz-tor1-sw01  | 209.42.165.10   | 14.52ms  | 14.53ms  | 14.52ms  | true
```

## 2. ポート44880を開く {#2-open-port-44880}

ユーザーは一部の[ルーティング機能](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md)を利用するためにポート44880を開く必要があります。

ポート44880を開くには、IPテーブルを次のように更新できます：

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```


`-i doublezero0`、`-o doublezero0`フラグに注意してください。このルールはDoubleZeroインターフェースにのみ制限されます

またはUFWの場合：

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```


`in on doublezero0`、`out on doublezero0`フラグに注意してください。このルールはDoubleZeroインターフェースにのみ制限されます

## 3. バリデーター所有権の証明 {#3-attest-validator-ownership}

!!! note "ネットワークフラグ"
    以下のPassportコマンドは`-u mainnet-beta`を使用します。testnetの場合は、代わりに`-u testnet`（または`-ut`）を使用してください。

DoubleZero環境が設定されたので、バリデーターの所有権を証明する準備が整いました。

プライマリバリデーターの[セットアップ](setup.md)で作成したDoubleZero IDは、すべてのバックアップマシンで使用する必要があります。

プライマリマシン上のIDは`doublezero address`で確認できます。同じIDが、クラスター内のすべてのマシンの`~/.config/doublezero/id.json`に存在する必要があります。

これを実現するために、まずコマンドを実行しているマシンが**プライマリバリデーター**であることを確認します：

```
doublezero-solana passport find-validator -u mainnet-beta
```

これにより、バリデーターがgossipに登録されており、リーダースケジュールに表示されていることが確認されます。

期待される出力：

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 11.11.11.111
Validator ID: ValidatorIdentity111111111111111111111111111
Gossip IP: 11.11.11.111
In Leader scheduler
✅ This validator can connect as a primary in DoubleZero 🖥️  💎. It is a leader scheduled validator.
```

!!! info
    1台でも複数台でも同じワークフローを使用します。
    1台のマシンを登録する場合は、このページのコマンドから引数「--backup-validator-ids」または「backup_ids=」を除外してください。

次に、**プライマリバリデーター**を実行する予定のすべてのバックアップマシンで以下を実行します：
```
doublezero-solana passport find-validator -u mainnet-beta
```

期待される出力：

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
この出力は期待どおりです。パス作成時にバックアップノードがリーダースケジュールに含まれることはできません。

次に、**プライマリバリデーター**のvoteアカウントとIDを使用する予定の**すべてのバックアップマシン**でこのコマンドを実行します。


### 接続の準備 {#prepare-the-connection}

**プライマリバリデーター**マシンで以下のコマンドを実行します。これは、アクティブステークがあり、リーダースケジュールに含まれており、コマンドを実行しているマシン上のSolana gossipにプライマリバリデーターIDが登録されているマシンです：

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


出力例：

```
DoubleZero Passport - Prepare Validator Access Request
Connected to Solana: mainnet-beta

Primary validator 🖥️  💎:
  ID: ValidatorIdentity111111111111111111111111111
  Gossip: ✅ OK 11.11.11.111)
  Leader scheduler: ✅ OK (Stake: 1,050,000.00 SOL)

Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity222222222222222222222222222
  Gossip: ✅ OK (22.22.22.222)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity333333333333333333333333333
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


  Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity444444444444444444444444444
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)

  To request access, sign the following message with your validator's identity key:

  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>

```
このコマンドの最後の出力に注意してください。これは次のステップの構造です。


## 4. 署名の生成 {#4-generate-signature}

前のステップの最後に、`solana sign-offchain-message`のフォーマット済み出力を受け取りました。

上記の出力から、**プライマリバリデーター**マシンでこのコマンドを実行します。

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**出力：**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```


## 5. DoubleZeroへの接続リクエストの開始 {#5-initiate-a-connection-request-in-doublezero}

`request-validator-access`コマンドを使用して、接続リクエスト用のSolanaアカウントを作成します。DoubleZero Sentinelエージェントが新しいアカウントを検出し、IDと署名を検証し、サーバーが接続を確立できるようにDoubleZeroでアクセスパスを作成します。


ノードID、DoubleZeroID、および署名を使用します。

!!! note inline end
      この例では、バリデーターIDを見つけるために`-k /home/user/.config/solana/id.json`を使用しています。ローカルデプロイメントに適した場所を使用してください。

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**出力：**

この出力は、Solanaエクスプローラーでトランザクションを確認するために使用できます。クラスターに合わせて、エクスプローラーをmainnet-betaまたはtestnetに設定してください。この確認はオプションです。

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

成功すると、DoubleZeroはプライマリとそのバックアップを登録します。アクセスパスに登録されたIP間でフェイルオーバーを行うことができます。この方法で登録されたバックアップノードに切り替える際、DoubleZeroは自動的に接続を維持します。


## 6. IBRLモードで接続 {#6-connect-in-ibrl-mode}

サーバー上で、DoubleZeroに接続するユーザーとして`connect`コマンドを実行し、DoubleZeroへの接続を確立します。

```
doublezero connect ibrl
```

プロビジョニングを示す次のような出力が表示されるはずです：

```
⚡  Connecting to mainnet-beta...
    DoubleZero ID: <your DoubleZero ID>
⚡  Provisioning for IP: <your public ip>
    Device selected: <the doublezero device you are connecting to>
✅  User Provisioned
```
GREトンネルのセットアップが完了するまで1分間お待ちください。GREトンネルのセットアップが完了するまで、ステータス出力は「down」または「Unknown」を返す場合があります。

接続を確認します：

```bash
doublezero status
```

**出力：**
!!! note inline end
    この出力を確認してください。`Tunnel src`と`DoubleZero IP`がマシンのパブリックIPv4アドレスと一致していることに注意してください。
    <!--`Tunnel dst`は接続しているDZデバイスのアドレスです。-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```

（testnetで接続した場合、`Network`には`testnet`と表示されます。）

ステータスが`up`であれば、正常に接続されています。

DoubleZero上の他のユーザーによって伝播されたルートは、以下を実行して確認できます：

```
ip route
```


```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```


### 次のステップ：マルチキャストによるシュレッドの公開 {#up-next-publishing-shreds-via-multicast}

このセットアップが完了し、マルチキャストによるシュレッドの公開を予定している場合は、[次のページ](Validator%20Multicast%20Connection.md)に進んでください。