**コードまたは関連資料にアクセスまたは使用する前に免責事項を確認してください。**

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

DoubleZeroプロトコルはバリデーターユーザーからSOL建ての収益を収集しますが、コントリビューターには2Z建ての報酬を配布します。そのため、SOLを2Zに変換する必要があります。

**そのために、適格な参加者はDoubleZeroスワップコントラクトに対してトレードし、コントラクトからSOLを購入して2Zを売ることができます。価格設定はPythプライスフィードとプログラマティックディスカウントメカニズムに基づいています。**

このガイドではプログラムの使用方法を説明します。

***このドキュメントおよび関連コードにアクセスまたは使用する前に、ドキュメントの最後にある免責事項を確認してください。***

---

## プログラム設計

スワッププログラムは実質的に、1取引あたり1 SOLの固定バッチサイズでSOLを販売する片側流動性プールです。適格な参加者はPythのオラクル価格とダイナミックディスカウントによって決定される価格で、2Zを預け入れてプログラムからSOLを引き出すことができます。時間の経過とともに、これはプログラムのネイティブトークンを2Zに変換するというゴールを実行します。

利用するには、トレーダーは2つの最新のPyth価格（SOL/USDおよび2Z/USD）と2Zの数量を提供する必要があります。プログラムはその後、暗示されたSOL/2Z価格に基づいてその1 SOLを購入するために必要な2Zを計算します。その後いくつかの追加ステップを実行します：

- Pyth価格が十分に新しいかを確認します。つまり、最大5秒以上古くないかを確認します。
- 2つの価格の信頼区間が十分に小さいかを確認します。つまり、2つの価格のLaplaceの標準偏差（Pyth価格のパラメーター`conf`）の合計は、それらのレベルで正規化された場合、30ベーシスポイント以下でなければなりません。
- ダイナミックディスカウント（Pyth価格のパーセントで表現）でSOL/2Z価格を調整します。このディスカウントは最後の取引からの時間の関数です。以下の式はディスカウントを指定しており、最後の取引がスロット$s_{\text{last}}$で行われ、現在のスロットが$s_{\text{now}}$であると仮定します。（例えば、最後の取引から200スロットが経過した場合、ディスカウントは40ベーシスポイントです。）

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

この時点で、トレーダーがこの計算された価格（ディスカウントを含む）でトランザクションを実行するのに十分な2Zを提供した場合、この計算された価格で実行されます。トレーダーには購入したSOLと余分な2Zが返されます。

コントラクトはその後、そのスロットでのトレードをこれ以上許可しません。これは、既存のフィルターが捉えないほどPyth価格が任意の時点で真の価格から大きく離れている場合に、コントラクトが過度に高いスリッページを支払わないようにするためです。

---

## ガスレスアトミック実行

このセクションでは`harvest-dz`コマンドの使用方法を説明します。このコマンドは2つのアクションをアトミックに実行します。
1. コマンドはJupiterにネイティブのSOL <> 2Z変換プログラムに対するクォートを要求します。
2. JupiterルートがネイティブのSOL変換プログラムが必要とするよりも多くの2Z/SOLを生成する場合、`harvest-2z`はスワップを実行し、1 SOLと2Zの差額をウォレットに返します。

### 2Zのハーベスト

実行するには、次のコマンドを実行します：
```
doublezero-solana revenue-distribution harvest-2z
```
出力は次のようになります：
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
コマンドは`--dry-run`引数でシミュレーションすることもできます。ドライランはプログラムログと次のような出力を生成します：

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## プロトコル変換

このセクションでは、変換レートの確認と`doublezero-solana` CLIを使用した変換の実行について説明します。また最後に、DoubleZeroスワップコントラクトとのカスタムビルド統合のインターフェースについて説明します。

### `doublezero-solana`を通じてSOL/2Z変換価格を確認する方法

メインネットベータのSOL/2Z変換レートを確認するには、次のコマンドを実行します：

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

表示される出力は次のようになります：

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

Journal Balanceは、Revenue DistributionスマートコントラクトにどれだけのSOL流動性があるかをユーザーに通知します。Journal Balanceが固定取引サイズの1 SOLを超える限り、ユーザーは取引できます。

最初の行はオフチェーンオラクルによる「真の」SOL/2Z変換価格を表示します。2行目はスワップにオンチェーンで使用される変換価格で、アルゴリズムディスカウントのために真の価格を調整したものです。

### `doublezero-solana`を通じて2ZをSOLに変換する方法

2Zトークンをマルチに変換するには、次のコマンドを実行します：

```bash
doublezero-solana revenue-distribution convert-2z
```

デフォルトでは、十分なSOL流動性があり、ATAにスワップを実行するのに十分な2Zがある場合、このトランザクションは成功します。次の引数を指定することで、スワップをより細かく調整できます：

```bash
      --limit-price <DECIMAL>                    指値価格はデフォルトで現在のSOL/2Zオラクル価格
      --source-2z-account <PUBKEY>               トークンアカウントはサイナーが所有する必要があります。指定しない場合はサイナーATAがデフォルト
      --checked-sol-amount <SOL>                 SOL金額を明示的に確認します。指定した場合、この金額は固定フィル数量に対して確認されます
```

指定された指値価格は、SOL/2Z変換を実行する際に受け入れる最悪のケースの価格を決定します。例えば、SOLのディスカウント2Z価格が800（1 SOLに対して800 2Zトークン）だとします。指値価格を790に指定した場合、1 SOLに対して最大790 2Zトークンしかスワップしたくないため、スワップを実行しようとしません。しかし810を指定した場合、最大810 2Zトークム（この場合、このトランザクションで800 2Zトークンのみスワップ）を喜んでスワップするので、取引は通ります。

ソース2Zトークンアカウントは、このデフォルトのATAをサイナーをこの2Z ATAの所有者として使用するよりも上書きします。しかし、スワップを実行するために使用したい別のトークンアカウントがある場合は、この引数でその公開鍵を提供してください。

オプションとして、確認したいSOL金額を標準のフィルサイズ（起動時に1 SOLに設定）に指定できます。プログラムのフィルサイズと一致しない場合、スワップは失敗します。これにより、プログラムのフィルサイズが変わり気づかないというリスクを軽減します。

### SOLを購入するインターフェース

インターフェースと`doublezero-solana` CLIは[このリポジトリ](https://github.com/doublezerofoundation/doublezero-offchain)にあります。DoubleZeroスワップコントラクトインターフェースのソースコードは[こちら](https://github.com/doublezerofoundation/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09)にあります。プログラムIDは`9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`です。

buy SOL命令に必要なアカウントを生成する便利な方法は、`new`メソッド（*instruction/account.rs*にある）を使用することです。

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

`fill_registry_key`は`ProgramState`から取得できます

```rust
pub struct ProgramState {
    pub admin_key: Pubkey,
    pub fills_registry_key: Pubkey, // このキー
    pub is_paused: bool,
    pub configuration_registry_bump: u8,
    pub program_state_bump: u8,
    pub deny_list_registry_bump: u8,
    pub withdraw_authority_bump: u8,
    pub last_trade_slot: u64,
    pub deny_list_authority: Pubkey,
}
```

あるいは、Solana RPCを通じてディスクリミネーターで`getProgramAccounts`を呼び出すこともできます。しかし、この公開鍵は決して変わらないのでキャッシュすることを推奨します。

`user_key`はbuy SOL命令のサイナーであり、`user_token_account_key`の所有者でなければなりません。上記のように、これはATAである必要はありません。2Zトークンアカウントが`user_key`によって所有されている限り、この命令は成功します。

`BuySolAccounts`構造体は`Into<Vec<AccountMeta>>`を実装しているため、命令を構築するために必要なすべてのアカウントメタを生成できます。

命令データは

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

この命令データはBorshシリアライズされており、8バイトのAnchorセレクターがあり、`BorshSerialize::serialize`を使用するとすべてシリアライズされます。

オラクル価格データはこのパブリックエンドポイントから取得できます：[https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate)。データは*oracle.rs*にあるOraclePriceData構造体を使用してserdeでデシリアライズ可能です。

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

[reqwestクレート](https://docs.rs/reqwest/latest/reqwest/)を使用した取得の例：

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

プログラムID、アカウント、命令データを使用して、DoubleZeroスワップコントラクトからSOLを購入する命令を構築できるはずです。
