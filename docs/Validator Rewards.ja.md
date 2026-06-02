# バリデーター報酬
!!! warning "DoubleZeroに接続することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます"

## 仕組み

DoubleZero Edgeにリーダーシュレッドを公開するバリデーターは、各エポックごとに報酬を獲得します。報酬が支払われる前に、各バリデーターはSolana上で`ValidatorPublisherRewards`アカウントを設定し、報酬の送信先を登録する必要があります。このアカウントには以下が保存されます：

- **報酬ミント** — 報酬が支払われるトークン（手動で変更しない限り2z）
- **報酬オーナー** — 報酬を受け取るAssociated Token Account（ATA）を所有するウォレット

`configure`コマンドでこれらのフィールドを設定すると、以降はエポックごとに自動的に支払いが行われます。いずれかのフィールドを変更するために、後から`configure`を再実行することも可能です。

!!! info "[セットアップ](setup.md)、[バリデーター Mainnet-Beta 接続](DZ%20Mainnet-beta%20Connection.md)、および[バリデーター マルチキャスト接続](Validator%20Multicast%20Connection.md)をまだ完了していない場合は、先にそちらを完了してください。"

## 前提条件

- リーダーシュレッドを公開しているバリデーター — [バリデーター マルチキャスト接続](Validator%20Multicast%20Connection.md)を参照。
- 最新の`doublezero-solana` CLI：`sudo apt update && sudo apt install doublezero-solana`、最低`0.5.6`以上。
- **バリデーターIDキーペア**へのアクセス（同一マシン上にあるか、オフラインで保管しメッセージ署名が可能な状態）。
- 報酬ATAを所有する送信先ウォレットの公開鍵。


---

## 1. 報酬請求の設定

`-k`にバリデーターIDキーペアを指定して`configure`を実行します。

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
| `--node-id` | バリデーターノードのID公開鍵。 |
| `--rewards-token-owner` | 受取用ATAを所有するウォレット。 |
| `--rewards-token-mint` | 報酬を受け取るウォレットトークン（`2z`）。サポートされるトークンには`usdc`と`wsol`も含まれます。 |
| `-k` | バリデーターIDキーペアへのパス。ダイレクトパスでは、キーペアの公開鍵が`--node-id`と一致する必要があります。一致しない場合、コマンドはエラーを返し、オフチェーンパスへの切り替えを促します。 |

ATAがまだ存在しない場合、同じトランザクション内で自動的に初期化されます。


!!! note "エラーが返された場合"
    `-k`の公開鍵が`--node-id`と一致しない場合

    渡した手数料支払者のキーペアがバリデーターIDではありません。バリデーターIDキーペアを`-k`として渡すか、[オフチェーンパス](#apendix-offchain-path-alternative)に切り替えてください。
---

## 2. 設定の確認

```bash
doublezero-solana shreds publisher-rewards show --node-id <NODE_ID>
```

このコマンドは`Node ID`、`Rewards owner`、`Rewards mint`、解決されたATAアドレス、およびATAのステータスを表示します。**Resolved ATA**は、報酬オーナー＋報酬ミントから導出される決定論的アドレスであり、各エポックで報酬が入金される場所です。

---

## 付録：オフチェーンパスの代替方法

3つのサブステップ：準備、署名、設定。

### 1. オフチェーンメッセージの準備

これはどこでも実行可能です — 読み取り専用であり、バリデーターIDキーペアは不要です。署名するhexブロブと、署名が期限切れとなる絶対スロットが表示されます。

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
| `--node-id` | バリデーターノードのID公開鍵。 |
| `--rewards-token-owner` | 受取用ATAを所有するウォレット。 |
| `--rewards-token-mint` | 報酬を受け取るウォレットトークン（`2z`）。サポートされるトークンには`usdc`と`wsol`も含まれます。 |
| `--valid-for` | 現在のスロットからの相対的な署名有効期間。`<n>s`、`<n>m`、または`<n>h`を指定可能。デフォルト：`1h`。 |
| `--deadline-slot` | `--valid-for`の代替：認証が期限切れとなる絶対スロット。`--valid-for`とは排他的です。 |
| `--json` | 人間向けのサマリーの代わりにJSON（`{ hex, deadline_slot }`）を出力します。 |

このコマンドは、hexエンコードされた認証メッセージ、解決されたデッドラインスロット、および次の2つのステップ用のすぐに実行可能なシェルスニペットを表示します。

### 2. メッセージの署名

バリデーターIDキーペアが保管されているマシンで実行します：

```bash
solana sign-offchain-message <123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3> \
--keypair <path-to-validator-identity-keypair.json>
```

base58形式の署名が表示されます。

出力例

```bash
SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp
```

### 3. `configure`の送信

手数料支払者ウォレットがあるマシンに戻って実行します：

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --signature <SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp> \
    --deadline-slot <DEADLINE_SLOT>
```

`--signature`と`--deadline-slot`は一緒に渡す必要があります。値はステップ2b.iおよび2b.iiで生成されたものと一致する必要があります。

ATAがまだ存在しない場合、同じトランザクション内で自動的に初期化されます。

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

!!! note "注意：署名が期限切れの場合"
    各オフチェーン署名にはデッドラインスロットがあります。`prepare-offchain-message`と`configure`の間に時間が経ちすぎた場合は、`prepare-offchain-message`を再実行し、再署名して、再送信してください。デフォルトの有効期間は1時間です — オフライン署名フローにより多くの時間が必要な場合は、`--valid-for 4h`などで延長してください。