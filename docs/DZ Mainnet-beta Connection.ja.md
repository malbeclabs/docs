---
description: Solanaバリデーター（mainnet-betaまたはtestnet）と最大3台のバックアップをIBRLモードでDoubleZeroに接続します。IDの証明と接続リクエストの手順を含みます。
---

# IBRLモードでのバリデーター接続

!!! warning "DoubleZeroに接続することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意します"

??? warning "DoubleZero testnetに接続することにより、以下に記載される評価契約の条件に同意します（クリックして展開）"
    <span style="font-size:14px;">DoubleZero Testnet</span>
    評価契約

    ソリューション（以下に定義）にアクセスまたは使用することにより、お客様は当該アクセスの最初の日付（以下「**発効日**」）をもって、本評価契約（以下「**本契約**」）がDoubleZero Foundation（以下「**DZF**」）がお客様（以下「**ユーザー**」または「**お客様**」）に評価目的でソリューションへのアクセスを提供する条件を定めるものであることに同意するものとします。本契約における相互の約束を考慮し、お客様は以下のとおり同意するものとします：

    <span style="font-size:14px;">1. 定義</span>

    <span style="font-size:14px;">1.1 「**機密情報**」</span>とは、いずれかの当事者が相手方に開示した情報であって、機密として指定されたもの、またはその他機密として理解されるべきもののすべてを意味し、ソリューション、製品計画、事業計画、営業秘密、技術、またはその他の専有情報を含みますがこれらに限定されません。

    <span style="font-size:14px;">1.2 「**ソリューション**」</span>とは、web3プロジェクト向けDoubleZero高性能ネットワークインフラストラクチャのtestnetバージョン（以下「**Testnet**」）および統合帯域幅を備えた関連エッジフィルタリングサービス（以下「**情報サービス**」）、DZソフトウェア（以下に定義）、DZソフトウェアに関連してDZFが提供するすべての資料（以下「**ドキュメント**」）、およびDZFが本契約に基づきユーザーに提供するその他の資料を意味します。

    <span style="font-size:14px;">2. アクセス</span>

    <span style="font-size:14px;">2.1 ^^ソリューションへのアクセス^^。</span>本契約の条件に従い、DZFはインターネットを通じてユーザーにソリューションへのアクセスを提供します。ユーザーのアクセスは、情報サービスのみを評価するためのソリューションの非独占的、譲渡不可、限定的な使用です。ソリューションを構成するソフトウェア（以下「**DZソフトウェア**」）に関して、DZFは本契約により、評価期間中、ドキュメントに記載された目的のためにのみ、当該DZソフトウェアをコピー、ダウンロード、合理的な数のコピーの作成、実行、および（該当する場合）デプロイするための限定的かつ取消可能なライセンスをユーザーに付与します。

    <span style="font-size:14px;">2.2 ^^制限^^。</span>ユーザーは、発効日からDZFにより終了されるまで（以下「**評価期間**」）、本契約に従ってソリューションを使用することができます。ユーザーは、評価期間を超えてソリューションを使用する権利は、料金の支払いを含む、当事者間の別途商業契約に従うものであることを理解します。ユーザーは、第三者に対して以下を行わず、また許可しないものとします：(i) ソリューションまたはその一部に基づく派生物の変更または作成；(ii) 本契約で明示的に許可された場合を除くソリューションの複製；(iii) スタンドアロンベースではなく、ユーザーのプラットフォームまたは製品を通じて、またはそれに関連して情報サービスの提供としての場合を除く、ソリューションの全部または一部のサブライセンス、配布、販売、貸出、賃貸、リース、譲渡、もしくは権利の付与、またはサービスビューローベースその他の方法で第三者にソリューションへのアクセスを提供すること；または(iv) 本契約に定める以外のソリューションの使用。

    <span style="font-size:14px;">2.3 ^^所有権^^。</span>DZFは、ソリューションに関するすべての権利、権原および利益（知的財産権を含む）を保持します。

    <span style="font-size:14px;">3 フィードバック</span>
    DZFは、ユーザーにソリューションの使用、操作、および機能に関するフィードバック（以下「フィードバック」）の提供を定期的に要請する場合があり、ユーザーはDZFにフィードバックを提供することに同意します。ユーザーは、DZFに対し、フィードバックを製品およびサービスに使用および組み込み、当該製品およびサービスを製造、使用、販売、販売の申出、輸入、およびその他の方法で利用し、その他フィードバックを制限なく使用、コピー、配布、およびその他の方法で利用するための非独占的、全世界的、永久的、取消不能、ロイヤリティフリー、全額支払済み、完全にサブライセンス可能かつ譲渡可能な権利およびライセンスを付与します。

    <span style="font-size:14px;">4. 期間および終了</span>

    <span style="font-size:14px;">4.1 ^^期間^^。</span>本契約は発効日に開始し、評価期間中完全に有効であるものとします。いずれの当事者も、理由の有無にかかわらず、相手方への書面による通知（電子メールで足りる）をもって、本契約を直ちに便宜上終了することができます。

    <span style="font-size:14px;">4.1 ^^終了の効果^^。</span>理由の如何を問わず本契約が終了した場合：(i) 本契約に基づきユーザーに付与された権利は直ちに終了します；(ii) ユーザーはソリューションの使用を直ちに中止し、管理下にあるすべてのドキュメントおよびDZソフトウェアを返却または破棄するものとします；(iii) 各当事者は、相手方のすべての機密情報および財産を速やかに返却または破棄するものとします；(iv) 第2.2条、第2.3条、第3条、第4.2条、および第5条から第8条は存続するものとします。

    <span style="font-size:14px;">5. 機密保持</span>
    各当事者は、相手方の機密情報を本契約に基づく義務の履行および権利の行使のためにのみ使用し、本契約で別途許可される場合を除き、これを開示せず、また開示を許可しないことに同意します。ただし、いずれの当事者も、知る必要があり本契約に定めるものと同等以上の機密保持義務に拘束される自社の人員、弁護士、およびその他の代理人に対して機密情報を開示することができます。また、法律により要求される場合（その場合、受領当事者は開示当事者に事前通知およびかかる開示に異議を申し立てる機会を提供し、適用法により許可される範囲でかかる開示を最小限に抑えるものとします）にも開示できます。本第5条における機密保持義務は、以下の情報には適用されないものとします：(a) 受領当事者の過失によらず一般に知られまたは公に利用可能となった情報；(b) 開示当事者による開示前に、制限なく受領当事者が適切に知っていた情報；(c) 法的権限を有する他の者により、制限なく受領当事者に適切に開示された情報；または(d) 開示当事者の機密情報の使用または参照なく受領当事者が独自に開発した情報。各当事者は、相手方の機密情報を不正使用および開示から保護するために相当の注意を払うことに同意します。本条の規定または本契約に含まれるライセンスに対する実際のまたは脅かされた違反が発生した場合、違反していない当事者は、利用可能な他の権利または救済を放棄することなく、即時の差止命令およびその他の衡平法上の救済を求める権利を有するものとします。ユーザーは、ソリューションおよびソリューションへのアクセスを提供するパスワード、シードフレーズ、またはコードの秘密をDZFの機密情報として維持する責任を負います。本契約のいかなる条項も、ソリューションのパフォーマンス、可用性、使用状況、整合性、およびセキュリティに関するデータを使用するDZFの権利または能力を制限するものではありません。いずれかの当事者が本第5条の規定に違反し、または違反する恐れがある場合、各当事者は、違反していない当事者が法律上適切な救済を有さず、したがって保証金なしに、実際の金銭的損害を示す必要なく、即時の差止命令およびその他の衡平法上の救済を受ける権利を有することに同意します。

    <span style="font-size:14px;">6. 保証の免責；責任の制限</span>

    <span style="font-size:14px;">6.1 ^^保証の免責^^。</span>ソリューションは、いかなる種類の保証もなく「現状のまま」提供されます。DZFは、ソリューションおよびドキュメントに関して、その状態、表現または説明への適合性を含め、明示、黙示、法定またはその他を問わず、いかなる保証も行わず、DZFは、商品性、特定目的への適合性、権原、および非侵害のすべての黙示の保証を明示的に否認します。

    <span style="font-size:14px;">6.2 ^^責任の制限^^。</span>
    第2.1条、第2.2条、および第5条の違反を除き、いかなる場合においても、いずれの当事者も、契約、不法行為、またはその他の行為における本契約に起因するまたは関連する間接的、付随的、特別またはその他の結果的損害（利益の損失もしくは使用の損失、またはデータの損失に対する損害を含みますがこれらに限定されません）について、相手方がかかる損害の可能性を知らされていた場合であっても、お客様またはいかなる第三者に対しても責任を負わないものとします。いかなる場合においても、本契約に起因するまたは関連するDZFの累積責任は、契約、不法行為、またはその他の行為にかかわらず、100米ドル（$100）を超えないものとします。**上記の制限は、本契約における限定的救済の本質的目的が達成されない場合であっても適用されるものとします。** 当事者は、上記の制限が本契約の下での合理的なリスク配分を表すことに同意します。

    <span style="font-size:14px;">7. 準拠法</span>
    本契約およびそれに起因するまたは関連するすべての事項は、ケイマン諸島の法律に従って準拠、解釈および構築されるものとします。本契約に起因するまたは関連する論争、紛争または請求（以下「紛争」）が生じた場合、適切な関連当事者は、かかる紛争について相手方当事者に30日前の通知（以下「紛争通知」）を行わなければなりません。紛争通知の送達後30日の満了時に紛争が解決されない場合、関連当事者は本契約に定める仲裁手続を開始することができます。紛争通知の送達後30日の満了時に紛争が残っている場合、紛争はケイマン国際調停仲裁センター（CI-MAC）が管理する仲裁により、本契約の日付時点で有効なCI-MAC仲裁規則（以下「仲裁規則」）に従って解決されるものとし、当該仲裁規則は本条に参照により組み込まれたものとみなされ、仲裁法（改正版）に準拠するものとします。仲裁はケイマン諸島グランドケイマン、ジョージタウンを仲裁地とし、ケイマン諸島法に準拠するものとします。仲裁の言語は英語とします。仲裁は、仲裁規則に従って選任される単独仲裁人により判断されるものとします。仲裁人が下した裁定または決定は書面によるものとし、上訴権なく当事者に対して最終的かつ拘束力を有するものとし、かかる裁定に基づく判決は、管轄権を有するいかなる裁判所においても登録または執行することができるものとします。本契約に起因するまたは関連する請求に基づく法律上または衡平法上のいかなる訴訟も、いかなる法域のいかなる裁判所にも提起されないものとします。本契約の条件を執行するために訴訟または仲裁が必要な場合、勝訴当事者は弁護士費用を相手方当事者に負担させる権利を有するものとします。各当事者は、不便宜法廷の法理を主張し、かかる仲裁または裁判所の管轄に服さないと主張し、または本契約に従って手続が提起される範囲で管轄地に異議を申し立てる権利を放棄するものとします。</span>

    <span style="font-size:14px;">8. 一般条項</span>
    本契約は、DZFの事前の書面による同意なく、ユーザーにより譲渡または移転することはできません。DZFは本契約を自由に譲渡することができます。本契約に基づき送付が必要なすべての通知は電子メール（DZF宛：legal@doublezero.xyz）により送付されるものとし、送信の翌日（送信が確認された場合）に受領されたものとみなされます。本契約のいずれかの条項が無効または執行不能であると判断された場合、本契約の残りの条項は完全に有効であるものとします。いずれかの当事者による本契約の不履行または違反の放棄は、他のまたはその後の不履行または違反の放棄を構成するものではありません。いずれの当事者も、天災、地震、物資の不足、輸送上の困難、労働争議、暴動、戦争、火災、伝染病、およびその管理を超えた類似の事象（予見可能であるか否かを問わず）による履行の遅延または不履行について責任を負わないものとします。本契約は、添付書類とともに、当事者間の完全な合意を構成し、本契約の主題に関するすべての先行または同時の合意または表明（書面または口頭を問わず）に優先するものとします。本契約は、各当事者の正当な権限を有する代表者が署名した書面によってのみ変更または修正することができます。

お使いのSolanaクラスターに一致するDoubleZeroネットワークを選択してください：`mainnet-beta`または`testnet`。[セットアップ](setup.md)で対応するパッケージをインストールし、以下のすべてのコマンドで同じネットワークを使用してください。

!!! Note inline end
    IBRLモードでは、既存のパブリックIPアドレスを使用するため、バリデータークライアントの再起動は不要です。

Solanaバリデーターは、このページの手順に従ってIBRLモードでDoubleZeroに接続します。

各Solanaバリデーターには独自の**IDキーペア**があり、そこから**ノードID**と呼ばれる公開鍵を抽出します。これはSolanaネットワーク上でのバリデーターの一意のフィンガープリントです。

DoubleZeroIDとノードIDが特定されたら、マシンの所有権を証明します。これはバリデーターのIDキーで署名されたDoubleZeroIDを含むメッセージを作成することで行われます。結果として得られる暗号署名は、バリデーターを管理していることの検証可能な証拠となります。

最後に、**DoubleZeroへの接続リクエスト**を提出します。このリクエストは次のことを伝えます：*「こちらが私のID、こちらが所有権の証明、そしてこちらが接続方法です。」* DoubleZeroはこの情報を検証し、証明を受理し、DoubleZero上でバリデーターのネットワークアクセスをプロビジョニングします。

このガイドでは、1台のプライマリバリデーターの登録と、同時に最大3台のバックアップ/フェイルオーバーマシンの登録が可能です。

## 前提条件 {#prerequisites}

- Solana CLIがインストールされ、$PATHに設定されていること
- バリデーターの場合：solユーザーの下でバリデーターIDキーペアファイル（例：validator-keypair.json）にアクセスする権限があること
- バリデーターの場合：接続するSolanaバリデーターのIDキーに最低1 SOLが存在することを確認すること
- ファイアウォールルールがDoubleZeroおよびSolana RPCに必要なアウトバウンド接続を許可していること（GRE（ip proto 47）およびBGP（169.254.0.0/16のtcp/179）を含む）

!!! info
    バリデーターIDはSolana gossipと照合され、ターゲットIPが決定されます。ターゲットIPとDoubleZero IDは、マシンとターゲットDoubleZeroデバイス間のGREトンネルを開く際に使用されます。

    注意：ジャンクIDとプライマリIDが同じIPにある場合、マシン登録にはプライマリIDのみが使用されます。これは、ジャンクIDがgossipに表示されず、ターゲットマシンのIPの検証に使用できないためです。

## 1. クライアントネットワークの確認 {#1-confirm-the-client-network}

先に進む前に、[セットアップ](setup.md)の手順に従ってください。**mainnet-beta**または**testnet**用のパッケージをインストールしてください。異なるパッケージリポジトリを使用します。

セットアップの最後のステップはネットワークからの切断でした。これは、マシン上でDoubleZeroへのトンネルが1つだけ開かれ、そのトンネルが正しいネットワーク上にあることを確認するためです。

クライアントが選択したネットワーク上にあることを確認します：

```bash
doublezero status
```

`Network`列は`mainnet-beta`または`testnet`であり、Solanaクラスターと一致している必要があります。間違っている場合、または間違ったパッケージをインストールした場合は、[トラブルシューティング](troubleshooting.md#issue-wrong-doublezero-environment)のコピー＆ペーストによる切り替え手順を使用してください。

約30秒後に利用可能なDoubleZeroデバイスが表示されます：

```bash
doublezero latency
```

出力例（mainnet-beta；testnetも同じ形式ですがデバイス数が少なくなります）：

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

## 2. ポート44880の開放 {#2-open-port-44880}

一部の[ルーティング機能](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md)を利用するために、ポート44880を開放する必要があります。

ポート44880を開放するには、以下のようにIPテーブルを更新できます：

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```


`-i doublezero0`、`-o doublezero0`フラグにより、このルールはDoubleZeroインターフェースのみに制限されます

またはUFWを使用する場合：

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```


`in on doublezero0`、`out on doublezero0`フラグにより、このルールはDoubleZeroインターフェースのみに制限されます

## 3. バリデーター所有権の証明 {#3-attest-validator-ownership}

!!! note "ネットワークフラグ"
    以下のPassportコマンドは`-u mainnet-beta`を使用しています。testnetの場合は、代わりに`-u testnet`（または`-ut`）を使用してください。

DoubleZero環境が設定されたので、次はバリデーターの所有権を証明します。

プライマリバリデーターの[セットアップ](setup.md)で作成したDoubleZero IDは、すべてのバックアップマシンで使用する必要があります。

プライマリマシンのIDは`doublezero address`で確認できます。同じIDがクラスター内のすべてのマシンの`~/.config/doublezero/id.json`に存在する必要があります。

これを実行するために、まずコマンドを実行しているマシンが**プライマリバリデーター**であることを以下のコマンドで確認します：

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
    1台のマシンのみを登録する場合は、このページのすべてのコマンドから引数 "--backup-validator-ids" または "backup_ids=" を除外してください。

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
この出力は期待どおりです。バックアップノードはパス作成時にリーダースケジュールに入ることはできません。

**プライマリバリデーター**の投票アカウントとIDを使用する予定のある**すべてのバックアップマシン**でこのコマンドを実行します。


### 接続の準備 {#prepare-the-connection}

**プライマリバリデーター**マシンで以下のコマンドを実行します。これは、アクティブなステークがあり、リーダースケジュールに入っていて、コマンドを実行しているマシン上のsolana gossipにプライマリバリデーターIDが存在するマシンです：

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
このコマンドの最後の出力に注目してください。これは次のステップの構造です。


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


## 5. DoubleZeroでの接続リクエストの開始 {#5-initiate-a-connection-request-in-doublezero}

`request-validator-access`コマンドを使用して、接続リクエスト用のSolana上のアカウントを作成します。DoubleZero Sentinelエージェントが新しいアカウントを検出し、そのIDと署名を検証し、サーバーが接続を確立できるようにDoubleZeroでアクセスパスを作成します。


ノードID、DoubleZeroID、および署名を使用します。

!!! note inline end
      この例では、バリデーターIDを見つけるために`-k /home/user/.config/solana/id.json`を使用しています。お使いのローカルデプロイメントに適切なパスを使用してください。

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**出力：**

この出力はSolanaエクスプローラーでトランザクションを確認するために使用できます。クラスターに合わせてエクスプローラーをmainnet-betaまたはtestnetに設定してください。この検証は任意です。

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

成功すると、DoubleZeroはプライマリとそのバックアップを登録します。アクセスパスに登録されたIP間でフェイルオーバーが可能になります。DoubleZeroは、この方法で登録されたバックアップノードに切り替える際、自動的に接続を維持します。


## 6. IBRLモードでの接続 {#6-connect-in-ibrl-mode}

サーバー上で、DoubleZeroに接続するユーザーで`connect`コマンドを実行し、DoubleZeroへの接続を確立します。

```
doublezero connect ibrl
```

以下のようなプロビジョニングを示す出力が表示されるはずです：

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.184.101.183 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
🔍  Provisioning User for IP: 137.184.101.183
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
✅  User Provisioned
```
GREトンネルのセットアップが完了するまで1分間お待ちください。GREトンネルのセットアップが完了するまで、ステータス出力は「down」または「Unknown」を返す場合があります。

接続を確認します：

```bash
doublezero status
```

**出力：**
!!! note inline end
    この出力を確認してください。`Tunnel src`と`DoubleZero IP`がマシンのパブリックIPv4アドレスと一致していることに注目してください。
    <!--`Tunnel dst`は接続先のDZデバイスのアドレスです。-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```

（testnetで接続した場合、`Network`には`testnet`と表示されます。）

ステータスが`up`であれば、接続は正常に確立されています。

DoubleZero上の他のユーザーによって伝播されたルートは、以下のコマンドで確認できます：

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


### 次のステップ：マルチキャストによるシュレッドの配信 {#up-next-publishing-shreds-via-multicast}

このセットアップが完了し、マルチキャストによるシュレッドの配信を計画している場合は、[次のページ](Validator%20Multicast%20Connection.md)に進んでください。