**コードまたは関連資料にアクセスまたは使用する前に、免責事項を確認してください。**

<!-- https://github.com/malbeclabs/doublezero-offchain/pull/159 -->

??? warning "免責事項"
    
    本文書および関連コードは、情報提供および技術的な目的のためにのみ提供されています。本書に記載されているトークン変換機能はノンカストディアルであり、ユーザーは基盤となるスマートコントラクトと直接やり取りし、常に自身の資産を完全に管理します。

    本システムは、開発者または公開者が開発、管理、またはレビューしていないサードパーティのコード、データソース、または価格設定および手数料メカニズム（例：スマートコントラクト、API、または分散型取引所）に依存または連携する場合があります。サードパーティのコンポーネントの正確性、機能性、またはセキュリティについて、いかなる表明または保証も行いません。
    本コードの開発者および公開者は、その正確性、完全性、または継続的な利用可能性を保証しません。コードおよび関連資料は「現状のまま」提供され、バグ、エラー、または脆弱性を含む可能性があります。使用は完全にご自身のリスクで行ってください。
    開発者および公開者は、これらのコントラクトの使用に関連していかなる手数料も受け取りません。コードまたは関連ドキュメントの保守、更新、またはサポートを行う義務はありません。

    本文書は、トークン変換、スワップ、またはその他の取引への売却の申し出、購入の勧誘、または参加の推奨を構成するものではありません。法的、財務的、または投資に関するアドバイスは提供されません。
    ユーザーは、自身の活動の合法性を判断する責任を単独で負います。コードの使用または変換への参加前に、管轄区域で適用される法律および規制を確認し、独立したアドバイザーに相談する必要があります。制裁対象者もしくは団体、または制限された管轄区域においてなど、違法となる場合の使用は禁止されています。

    法律で許容される最大限の範囲において、開発者および公開者は、コードの使用または変換への参加に起因または関連して生じるいかなる損失、損害、または請求についても、一切の責任を否認します。

    本文書および関連コードの確認および使用は、[ウェブサイト利用規約](https://doublezero.xyz/terms)および[プロトコル利用規約](https://doublezero.xyz/terms-protocol)に従うものとします。

DoubleZeroプロトコルは、バリデーターユーザーからSOL建ての収益を徴収しますが、コントリビューターには2Z建ての報酬を分配します。そのため、SOLを2Zに変換する必要があります。

**これを行うために、適格な参加者はDoubleZeroのスワップコントラクトに対して取引を行い、コントラクトからSOLを購入して2Zを売却できます。価格設定はPythの価格フィードに基づき、プログラマティックなディスカウントメカニズムが適用されます。**

この短いガイドでは、プログラムの使用方法を説明します。

***コードまたは関連資料にアクセスまたは使用する前に、本文書末尾の免責事項を確認してください。***

---

## プログラム設計

スワッププログラムは、実質的に1取引あたり1 SOLの固定バッチサイズでSOLを販売する片側流動性プールです。適格な参加者は誰でも、Pythからのオラクル価格と動的ディスカウントによって決定される価格で、2Zを預け入れることによりプログラムからSOLを引き出すことができます。時間の経過とともに、これによりネイティブトークンを2Zに変換するというプログラムの目標が実行されます。

利用するには、トレーダーは2つの最新のPyth価格（SOL/USDおよび2Z/USD）と2Zの数量を提供する必要があります。プログラムは、暗示されるSOL/2Z価格に基づいて1 SOLを購入するために必要な2Zを計算します。その後、いくつかの追加ステップを実行します：

- Pyth価格が十分に新鮮であること、つまり5秒以上古くないことを確認します。
- 2つの価格の信頼区間が十分に小さいことを確認します。具体的には、2つの価格のラプラシアン標準偏差（つまり、Pyth価格のパラメータ `conf`）の合計を、それぞれの水準で正規化した値が30ベーシスポイント以下でなければなりません。
- SOL/2Z価格を、Pyth価格のパーセントとして表される動的ディスカウントで調整します。このディスカウントは、前回の取引からの経過時間の関数です。以下の式は、前回の取引がスロット $s_{\text{last}}$ で行われ、現在のスロットが $s_{\text{now}}$ であると仮定した場合のディスカウントを示しています。（例えば、前回の取引から200スロット経過した場合、ディスカウントは40ベーシスポイントです。）

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

この時点で、トレーダーがこの計算された価格（ディスカウント込み）で取引を実行するのに十分な2Zを提供している場合、この計算された価格で実行されます。購入されたSOLの数量と余剰の2Zがトレーダーに返却されます。

コントラクトはその後、そのスロットでのさらなる取引を許可しません。これは、既存のフィルターでは問題を検出できない形で、任意の時点でPyth価格が真の価格から大きく乖離している場合に、コントラクトが過度に高いスリッページを支払うことを防ぐためです。

---

## ガスレスアトミック実行

このセクションでは、`harvest-dz` コマンドの使用方法を詳しく説明します。このコマンドは2つのアクションをアトミックに実行します。
1. コマンドはJupiterとネイティブのSOL <> 2Z変換プログラムから見積もりを要求します。
2. JupiterルートがネイティブのV変換プログラムが要求するよりも1 SOLあたり多くの2Zを提供する場合、`harvest-2z` はスワップを実行し、ウォレットに1 SOLと2Zの差額を返します。

### Harvest 2Z

実行するには、以下を実行してください：
```
doublezero-solana revenue-distribution harvest-2z
```
出力は以下のようになります：
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
このコマンドは `--dry-run` 引数でシミュレーションすることもできます。ドライランはプログラムログと以下のような出力を生成します：

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## プロトコル変換

このセクションでは、`doublezero-solana` CLIを使用した変換レートの確認と変換の実行について説明します。最後に、DoubleZeroスワップコントラクトとのカスタムビルド統合用のインターフェースについて説明します。

### `doublezero-solana` を使用してSOL/2Z変換価格を確認する方法

mainnet-betaでSOL/2Z変換レートを確認するには、以下のコマンドを実行してください：

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

表示される出力は以下のようになります：

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

Journal Balanceは、Revenue DistributionスマートコントラクトにどれだけのSOL流動性があるかをユーザーに通知します。Journal Balanceが固定取引サイズの1 SOLを超えている限り、ユーザーは取引を行うことができます。

最初の行は、オフチェーンオラクルによる「真の」SOL/2Z変換価格を表示します。2番目の行は、スワップでオンチェーンで使用される変換価格であり、アルゴリズムによるディスカウントで真の価格を調整したものです。

### `doublezero-solana` を使用して2ZをSOLに変換する方法

2ZトークンをSOLに変換するには、以下のコマンドを実行してください：

```bash
doublezero-solana revenue-distribution convert-2z
```

デフォルトでは、十分なSOL流動性があり、ATAにスワップを実行するのに十分な2Zがある場合、このトランザクションは成功します。以下の引数を指定することで、スワップをより細かく調整できます：

```bash
      --limit-price <DECIMAL>                    Limit price defaults to the current SOL/2Z oracle price
      --source-2z-account <PUBKEY>               Token account must be owned by the signer. Defaults to signer ATA if not specified
      --checked-sol-amount <SOL>                 Explicitly check SOL amount. When specified, this amount will be checked against the fixed fill quantity
```

指定されたリミット価格は、SOL/2Z変換を実行する際に受け入れる最悪のケースの価格を決定します。例えば、SOLのディスカウント後の2Z価格が800、つまり1 SOLに対して800 2Zトークンだとしましょう。リミット価格を790に指定した場合、最大790 2Zトークンでのみ1 SOLとのスワップを要求しているため、スワップを実行しません。しかし、810を指定した場合、最大810 2Zトークンでのスワップを許容しているため、取引は成立します（この場合、実際にはこのトランザクションで800 2Zトークンのみをスワップすることになります）。

ソース2Zトークンアカウントは、署名者をこの2Z ATAの所有者として使用するデフォルトのATAを上書きします。ただし、スワップに使用したい別のトークンアカウントがある場合は、この引数でそのpubkeyを指定してください。

オプションで、チェック対象のSOL金額を標準フィルサイズ（ローンチ時は1 SOLに設定）に指定できます。プログラムのフィルサイズと一致しない場合、スワップは失敗します。これにより、プログラムのフィルサイズが変更され、気づかないリスクを軽減します。

### SOL購入のインターフェース

インターフェースと `doublezero-solana` CLIは[このリポジトリ](https://github.com/malbeclabs/doublezero-offchain)にあります。DoubleZeroスワップコントラクトインターフェースのソースコードは[こちら](https://github.com/malbeclabs/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09)で見つけることができます。プログラムIDは `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs` です。

SOL購入命令に必要なアカウントを生成する便利な方法は、`new` メソッド（*instruction/account.rs* にあります）を使用することです。

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

`fill_registry_key` は `ProgramState` から取得できます。

```rust
pub struct ProgramState {
    pub admin_key: Pubkey,
    pub fills_registry_key: Pubkey, // this key
    pub is_paused: bool,
    pub configuration_registry_bump: u8,
    pub program_state_bump: u8,
    pub deny_list_registry_bump: u8,
    pub withdraw_authority_bump: u8,
    pub last_trade_slot: u64,
    pub deny_list_authority: Pubkey,
}
```

あるいは、Solana RPCを介してディスクリミネーターを使用して `getProgramAccounts` を呼び出すこともできます。ただし、このpubkeyは変更されることがないため、キャッシュすることをお勧めします。

`user_key` はSOL購入命令の署名者であり、`user_token_account_key` の所有者でなければなりません。上記で説明したように、これはATAである必要はありません。2ZトークンアカウントがB `user_key` によって所有されている限り、この命令は成功します。

`BuySolAccounts` 構造体は `Into<Vec<AccountMeta>>` を実装しているため、命令を構築するために必要なすべてのアカウントメタを生成できます。

命令データは以下の通りです：

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

この命令データはBorshシリアライズされ、8バイトのAnchorセレクターを持ちます。`BorshSerialize::serialize` を使用するとすべてシリアライズされます。

オラクル価格データは、このパブリックエンドポイントから取得できます：[https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate)。データは *oracle.rs* にある OraclePriceData 構造体を使用してserdeデシリアライズ可能です。

```rust
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default, PartialEq, Eq)]
#[cfg_attr(
    feature = "serde",
    derive(serde::Deserialize),
    serde(rename_all = "camelCase")
)]
pub struct OraclePriceData {
    pub swap_rate: u64,
    pub timestamp: i64,
    pub signature: String,
}
```

[reqwest クレート](https://docs.rs/reqwest/latest/reqwest/)を使用した取得の例：

```rust
use anyhow::{Context, Result};

pub async fn try_request_oracle_conversion_price(oracle_endpoint: &str) -> Result<OraclePriceData> {
    reqwest::Client::new()
        .get(oracle_endpoint)
        .header("User-Agent", "SOL buyoooooooor")
        .send()
        .await?
        .json()
        .await
        .with_context(|| format!("Failed to request SOL/2Z price from {oracle_endpoint}"))
}
```

プログラムID、アカウント、および命令データがあれば、DoubleZeroスワップコントラクトからSOLを購入するための命令を構築できるはずです。