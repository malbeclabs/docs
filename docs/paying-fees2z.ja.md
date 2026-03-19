**コードまたは関連資料にアクセスまたは使用する前に免責事項を確認してください。**
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


<!-- https://github.com/doublezerofoundation/doublezero-offchain/pull/159 -->

??? warning "免責事項"

    このドキュメントおよび関連コードは、情報提供および技術的目的のみのために提供されています。ここで説明されているトークン変換機能はノンカストディアル（非保管型）です。ユーザーは基礎となるスマートコントラクトと直接対話し、常に自分の資産を完全に制御します。

    このシステムは、開発者や発行者によって開発、管理、またはレビューされていないサードパーティのコード、データソース、または価格および手数料メカニズム（例：スマートコントラクト、API、または分散型取引所）に依存または対話する場合があります。サードパーティコンポーネントの精度、機能、またはセキュリティについて表明や保証はなされません。
    このコードの開発者と発行者は、その精度、完全性、または継続的な可用性を保証しません。コードと関連資料は「現状のまま」（AS IS）で提供され、バグ、エラー、または脆弱性が含まれる場合があります。使用はすべてご自身のリスクでお行いください。
    開発者と発行者はこれらのコントラクトの使用に関連していかなる手数料も受け取りません。コードまたは関連ドキュメントのメンテナンス、更新、またはサポートの義務はありません。

    このドキュメントはトークン変換、スワップまたはその他のトランザクションへの参加を売り込む、買い求める、または推奨するものではありません。法的、財務的、または投資上のアドバイスは提供されません。
    ユーザーは自分の活動の合法性を判断する責任を単独で負います。コードを使用したり変換に参加したりする前に、管轄区域に適用される法律と規制を確認し、独立した顧問に相談する必要があります。制裁対象の個人や組織、または制限区域での使用を含む、違法となる場所での使用は禁止されています。

    法律で許可される最大限の範囲で、開発者と発行者は、コードの使用または変換への参加に起因するまたは関連するすべての損失、損害、または請求に対する一切の責任を否認します。

    このドキュメントおよび関連コードのレビューと使用は、[ウェブサイト利用規約](https://doublezero.xyz/terms)および[プロトコル利用規約](https://doublezero.xyz/terms-protocol)に従います。

バリデーターはオンチェーンの[スワッププログラム](https://github.com/doublezerofoundation/doublezero-offchain/tree/main/crates/solana-interface/sol-conversion)を通じて2Zで手数料を支払うことができます。スワップは2ZをSOLとスワップすることで実行されます。デポジットアカウントのSOL残高はスワップに応じて更新されます。


このプロセスは**常に**1 SOLの増分を使用します。このスワップの結果は**常に**デポジットアカウントに直接預け入れられます。これは一方通行であり、このトランザクションから2ZまたはSOLを取り戻すことはできません。オンチェーンの配分モジュールに送られます。


#### ステップ1
まず現在の変換レートを確認します


```
doublezero-solana revenue-distribution fetch sol-conversion
```


出力：
```
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 800.86265341  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 797.75530631  | Includes 0.38800000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```


#### ステップ2
指値注文を出します。このスワップはご自身のリスクで実行します。リスクプロファイルについて推奨はせず、ここで提供される例は教育目的のものです。


##### 指値注文の組み立て方法
上記の例に基づいて、見積もり価格より5%高い指値注文を出します。
797.76 * 1.05 = 837.65


この例では、デポジットアカウントに0 SOLあると仮定します。


```
doublezero-solana revenue-distribution --convert-2z-limit-price 837.65 --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 --fund 1
```
上記コマンドの`--fund 1`はデポジットアカウントに明示的に1 SOLを資金調達します。


1以外の数値を選択するとエラーが発生し、誤った金額が通知されます：
```
Error: SOL amount must be 1.000000000 for 2Z -> SOL conversion. Got 1.500000000
```


トランザクションの確認を求められます：


```
⚠️  By specifying --convert-2z-limit-price, you are funding 1.000000000 SOL to your deposit account. Proceed? [y/N]
```


出力：
```
2Z token balance: 987241.76579348
Converted 2Z to SOL: 2iaBzd4vgEeDnpfSCD9aYFMWZ3UoVzrJfUjSMhsDhfSQ6isPZKkKe3ZWQ6b5aWvV3h8Vsk8Mmde6wmCiidD4Qc6s
Converted 837.65 2Z tokens to 1.000000000 SOL
```
スワップが成功すると、`Balance:`が1 SOLに更新されていることに注意してください。


指定した範囲外の価格の場合は、次のようなエラーが発生します：
```
Error: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x177f; 10 log messages:
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs invoke [1]
 Program log: Instruction: BuySol
 Program log: Signature verified successfully
 Program log: Timestamp verified successfully
 Program log: Bid price 79500000000
 Program log: Ask price 79862251144
 Program data: 1fxoRNOEulcAypo7AAAAAAC7kYISAAAAiD4pmBIAAAAsk/ZoAAAAAA4PxjWjgr+ERO7jDdvoOmT/WpgDFLfY+FGKKDdOw4PMAAAAAAAAAAA=
 Program log: AnchorError thrown in on-chain/programs/converter-program/src/buy_sol.rs:142. Error Code: BidTooLow. Error Number: 6015. Error Message: Provided bid is too low.
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs consumed 50754 of 90000 compute units
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs failed: custom program error: 0x177f
```
