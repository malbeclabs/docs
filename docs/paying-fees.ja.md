# バリデーターの料金体系
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


**Solanaバリデーター向けのシンプルで公平な料金設定**

手数料はエポック859から開始し、東部時間10月4日（土）午前4時から始まります。ブロック署名報酬とプライオリティ手数料に対して一律5%の手数料が徴収されます。

手数料はDoubleZeroを可能にするインフラに直接充当されます。物理的な光ファイバーケーブルやデータセンターの機器などが含まれます。

手数料が存在する理由とバリデーターの料金モデルの詳細は[こちら](https://doublezero.xyz/fees)をご覧ください。

***このガイドは技術的な観点から手数料の支払い方法に焦点を当てています。***

## **決済モデル**

- 手数料はSOL建てで、エポックごとに決済されます
- バリデーターの負債は収益配分プログラムによってオンチェーンで計算されます
- 各バリデーターには支払い用のデポジットアカウント（PDA）があります
- 資金調達ウィンドウ：手数料は発生した次のSolanaエポック中に預け入れられます。例えば、エポック860中に蓄積された手数料は、エポック861に支払う必要があります。

- 先払いに対応しています。残高は複数のエポックにわたって引き落とされます。

---

# **手数料の見積もり**

過去の見積もりと公開鍵ごとのデータは[手数料見積もりリポジトリ](http://github.com/doublezerofoundation/fees)で確認できます。このリポジトリはオンチェーンデータの代替ではありません。オンチェーンの残高はあなた自身の責任であり、このリポジトリの残高ではありません。

ご質問はNihar Shah（nihar@doublezero.us）までお問い合わせください。

# 開発者向け詳細

### コマンドラインインターフェース
DoubleZero CLIは、バリデーターのデポジットを管理し、残高を監視するコマンドを提供します。
これらのコマンドを実行するアカウントにガス代としてSOLが必要です。

<div data-wizard-step="fee-check" markdown>

### ステップ1：未払い負債の確認

特定のアドレスの負債を表示するには、次の形式を使用します：
```
doublezero-solana revenue-distribution fetch validator-debts --node-id ValidatorIdentity111111111111111111111111111
```
以下に出力例を示します：

```
| node_id                                      |    total_amount | deposit_balance | note                   |
|----------------------------------------------|-----------------|-----------------|------------------------|
| ValidatorIdentity111111111111111111111111111 | 0.632736605 SOL | 0.000220966 SOL | 0.632515639 SOL needed |
| ValidatorIdentity111111111111111111111111111 | 24.520162479 SOL| 0.000000000 SOL | Not funded             |
```
サンプル出力には`note`列に2種類の出力が表示される場合があります。`Not funded`はアカウントへの資金調達がされていないことを意味します。例の`0.632515639 SOL needed`は、対象バリデーターIDに関連する現在の未払い負債全額を支払うために必要な未払いSOL額です。

</div>

<div data-wizard-step="fee-pay" markdown>

### ステップ2：未払い負債の支払い

!!! note inline end
      このコマンドを定期的な間隔で実行するようにスケジュールできます。

未払い負債を支払うには、次のコマンドを使用します。これにより、`$HOME/.config/solana/id.json`のデフォルトキーペアが自動的に使用されます。

コマンドの末尾に`-k path/to/keypair.json`引数を追加することで、負債の支払いに使用するキーペアを指定できます。

```
doublezero-solana revenue-distribution validator-deposit --fund-outstanding-debt --node-id ValidatorIdentity111111111111111111111111111
```
以下に出力例を示します。

```
Solana validator deposit: DZ_PDA_MvFTgPku3dUrw2W3dbeK5dhxmXYKKYETDUK1V
Funded: TransactionHashHVxSobvdY2r14CkEwsBDhwf2dBmFatyeftisrdfSocMM2tXPjFvXPRmVs1xagiqKSX4b92fgt
Node ID: ValidatorIdentity111111111111111111111111111
Balance: 0.309294915 SOL
```

`Solana validator deposit:` は資金が投入されたデポジットアカウントを返します

`Funded:` はトランザクションハッシュを返します。お好みのSolanaエクスプローラーで確認できます

`Node ID:` は支払いが行われたバリデーターIDを返します

`Balance:` は転送完了後のデポジットアカウントのSOL残高を返します

</div>
