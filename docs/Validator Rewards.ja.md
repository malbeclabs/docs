# バリデーターリワード
!!! warning "DoubleZeroに接続することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます"

リーダーシュレッドをDoubleZero Edgeにパブリッシュするバリデーターは、各エポックごとにリワードを獲得します。リワードが支払われる前に、各バリデーターはSolana上で`ValidatorPublisherRewards`アカウントを設定し、リワードの送付先を登録する必要があります。このアカウントには以下の情報が保存されます：

- **rewards mint** — リワードが支払われるトークン（手動で変更しない限り2z）
- **rewards owner** — リワードを受け取るAssociated Token Account（ATA）を所有するウォレット

`configure`コマンドでこれらのフィールドを設定すると、以降はエポックごとに自動的に支払いが行われます。後から`configure`を再実行して、いずれかのフィールドを変更することも可能です。

!!! info "[セットアップ](setup.md)、[バリデーター Mainnet-Beta 接続](DZ%20Mainnet-beta%20Connection.md)、および[バリデーターマルチキャスト接続](Validator%20Multicast%20Connection.md)をまだ完了していない場合は、先にそちらを行ってください。"

## 前提条件

- リーダーシュレッドをパブリッシュしているバリデーター - [バリデーターマルチキャスト接続](Validator%20Multicast%20Connection.md)を参照。
- 最新の`doublezero-solana` CLI：`sudo apt update && sudo apt install doublezero-solana`、最低バージョン`0.5.6`。
- **バリデーターIDキーペア**へのアクセス。同一マシン上にあるか、オフラインで保管しメッセージへの署名が可能な状態であること。
- リワードATAを所有する宛先ウォレットの公開鍵。

---

## 1. 認証パスの選択

リワードアカウントの設定には、バリデーターIDキーによる認証が必要です。認証を提供する方法は2つあります：

| パス | 使用するタイミング |
|---|---|
| **ダイレクト** | コマンドを実行するマシン上にバリデーターIDキーペアがある場合。|
| **オフチェーン** | バリデーターIDキーペアがオフラインまたはfee-payerウォレットとは別のマシンに保管されている場合。 |

---

## 2a. ダイレクトパス

バリデーターIDキーペアを`-k`に指定して`configure`を実行します。

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    -k <path-to-validator-identity-keypair.json>
```
出力例
```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         direct
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```
`Configured validator publisher rewards: `はブロックエクスプローラーで確認できるトランザクションを出力します。

| フラグ | 説明 |
|---|---|
| `--node-id` | バリデーターノードIDの公開鍵。 |
| `--rewards-token-owner` | 受取用ATAを所有するウォレット。 |
| `--rewards-token-mint` | リワードを受け取るウォレットトークン `2z`。サポートされているトークンには`usdc`と`wsol`も含まれます。 |
| `-k` | バリデーターIDキーペアへのパス。ダイレクトパスでは、キーペアの公開鍵が`--node-id`と一致する必要があります。一致しない場合、コマンドはエラーとなり、オフチェーンパスへの切り替えを求められます。 |

ATAがまだ存在しない場合は、同一トランザクション内で自動的に初期化されます。

[ステップ3](#3-設定の確認)に進んでください。

---

## 2b. オフチェーンパス

3つのサブステップ：準備、署名、設定。

### 2b.i. オフチェーンメッセージの準備

このコマンドはどこでも実行可能です — 読み取り専用であり、バリデーターIDキーペアは不要です。署名対象のhexブロブと、署名の有効期限となる絶対スロットを出力します。

```bash
doublezero-solana shreds publisher-rewards prepare-offchain-message \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --valid-for 1h
```
出力例

```bash
Hex message:    123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3
Deadline slot:  422954444

Sign with:
  solana sign-offchain-message 123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3 --keypair <validator-identity>

Then submit:
  doublezero-solana shreds publisher-rewards configure \
    --node-id ValidatorIdentity111111111111111111111111111 --rewards-token-mint J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd --rewards-token-owner Wallet567Identity111111111111111111111111111 \
    --deadline-slot 422954444 --signature <BASE58>
```


| フラグ | 説明 |
|---|---|
| `--node-id` | バリデーターノードIDの公開鍵。 |
| `--rewards-token-owner` | 受取用ATAを所有するウォレット。 |
| `--rewards-token-mint` | リワードを受け取るウォレットトークン `2z`。サポートされているトークンには`usdc`と`wsol`も含まれます。 |
| `--valid-for` | 現在のスロットを基準とした署名の有効期間。`<n>s`、`<n>m`、または`<n>h`を指定可能。デフォルト：`1h`。 |
| `--deadline-slot` | `--valid-for`の代替：認証が期限切れとなる絶対スロット。`--valid-for`とは排他的です。 |
| `--json` | 人間向けのサマリーの代わりにJSON（`{ hex, deadline_slot }`）を出力します。 |

このコマンドは、hexエンコードされた認証メッセージ、解決済みのデッドラインスロット、および次の2つのステップ用のすぐに実行可能なシェルスニペットを出力します。

### 2b.ii. メッセージへの署名

バリデーターIDキーペアを保持するマシン上で：

```bash
solana sign-offchain-message <123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3> \
--keypair <path-to-validator-identity-keypair.json>
```

base58署名が出力されます。

出力例

```bash
SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp
```

### 2b.iii. `configure`の送信

fee-payerウォレットがあるマシンに戻って：

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --signature <SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp> \
    --deadline-slot <DEADLINE_SLOT>
```

`--signature`と`--deadline-slot`は一緒に指定する必要があります。値はステップ2b.iおよび2b.iiで生成されたものと一致している必要があります。

ATAがまだ存在しない場合は、同一トランザクション内で自動的に初期化されます。


出力例

```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         offchain
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```

---

## 3. 設定の確認

```bash
doublezero-solana shreds publisher-rewards show --node-id <NODE_ID>
```

このコマンドは、`Node ID`、`Rewards owner`、`Rewards mint`、解決済みのATAアドレス、およびATAステータスを出力します。**Resolved ATA**は、rewards owner + rewards mintから導出される決定論的アドレスであり、各エポックでリワードが入金される場所です。

---

## トラブルシューティング

### ダイレクトパス：`-k`の公開鍵が`--node-id`と一致しない

渡したfee-payerキーペアがバリデーターIDではありません。バリデーターIDキーペアを`-k`として渡すか、[オフチェーンパス](#2b-オフチェーンパス)に切り替えてください。

### 署名の期限切れ

各オフチェーン署名にはデッドラインスロットがあります。`prepare-offchain-message`と`configure`の間に時間がかかりすぎた場合は、`prepare-offchain-message`を再実行し、再署名して、再送信してください。デフォルトの有効期間は1時間です — オフライン署名フローにより多くの時間が必要な場合は、`--valid-for 4h`などで延長してください。