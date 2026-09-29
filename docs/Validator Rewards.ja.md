---
description: DoubleZero Edge にシュレッドをパブリッシュするバリデーターが各エポックで報酬を受け取れるよう、バリデーターパブリッシャー報酬を登録・設定します。
---

# バリデーター報酬
!!! warning "DoubleZero に接続することにより、[DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol) に同意したものとみなされます"

## 仕組み

DoubleZero Edge にリーダーシュレッドをパブリッシュするバリデーターは、各エポックで報酬を獲得します。報酬が支払われる前に、各バリデーターは Solana 上で `ValidatorPublisherRewards` アカウントを設定し、報酬の送付先を登録する必要があります。このアカウントには以下が保存されます：

- **rewards mint** — 報酬が支払われるトークン（手動で変更しない限り 2z）
- **rewards owner** — 報酬を受け取る Associated Token Account（ATA）を所有するウォレット

`configure` コマンドでこれらのフィールドを設定すると、以降エポックごとに自動的に支払いが行われます。後から `configure` を再実行して、いずれかのフィールドを変更することも可能です。

!!! info "[Setup](setup.md)、[Validator Mainnet-Beta Connection](DZ%20Mainnet-beta%20Connection.md)、および [Validator Multicast Connection](Validator%20Multicast%20Connection.md) をまだ完了していない場合は、先にそちらを完了してください。"

## 前提条件

- リーダーシュレッドをパブリッシュしているバリデーター - [Validator Multicast Connection](Validator%20Multicast%20Connection.md) を参照。
- 最新の `doublezero-solana` CLI：`sudo apt update && sudo apt install doublezero-solana`、最低バージョン `0.5.6`。
- **バリデーター ID キーペア**へのアクセス（同一マシン上にあるか、メッセージ署名が可能なオフライン環境で保管されているもの）。
- 報酬 ATA を所有する宛先ウォレットの公開鍵。


---

## 1. 報酬を受け取るための設定

バリデーター ID キーペアを `-k` として指定し、`configure` を実行します。

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
`Configured validator publisher rewards: ` にはブロックエクスプローラーで確認できるトランザクションが出力されます。

| フラグ | 説明 |
|---|---|
| `--node-id` | バリデーターノードの ID 公開鍵。 |
| `--rewards-token-owner` | 受取用 ATA を所有するウォレット。 |
| `--rewards-token-mint` | 報酬を受け取るウォレットトークン（`2z`）。`usdc` および `wsol` もサポートされています。 |
| `-k` | バリデーター ID キーペアのパス。ダイレクトパスでは、キーペアの公開鍵が `--node-id` と一致する必要があります。一致しない場合、コマンドはエラーを返し、オフチェーンパスへの切り替えを指示します。 |

ATA がまだ存在しない場合、同じトランザクション内で自動的に初期化されます。


!!! note "エラーが返された場合"
    `-k` の公開鍵が `--node-id` と一致しない場合

    渡した手数料支払者のキーペアがバリデーター ID ではありません。バリデーター ID キーペアを `-k` として渡すか、[オフチェーンパス](#apendix-offchain-path-alternative)に切り替えてください。
---

## 2. 設定の確認

```bash
doublezero-solana shreds publisher-rewards show --node-id <NODE_ID>
```

このコマンドは `Node ID`、`Rewards owner`、`Rewards mint`、解決された ATA アドレス、および ATA ステータスを表示します。**Resolved ATA** は rewards owner + rewards mint から導出される決定論的なアドレスであり、各エポックで報酬がここに入金されます。

---

## 付録：オフチェーンパスによる代替手順 {#apendix-offchain-path-alternative}

3つのサブステップ：準備、署名、設定。

### 1. オフチェーンメッセージの準備

このコマンドはどこでも実行可能です — 読み取り専用であり、バリデーター ID キーペアは不要です。署名する hex ブロブと、署名が期限切れとなる絶対スロットが表示されます。

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
| `--node-id` | バリデーターノードの ID 公開鍵。 |
| `--rewards-token-owner` | 受取用 ATA を所有するウォレット。 |
| `--rewards-token-mint` | 報酬を受け取るウォレットトークン（`2z`）。`usdc` および `wsol` もサポートされています。 |
| `--valid-for` | 現在のスロットからの相対的な署名の有効期間。`<n>s`、`<n>m`、または `<n>h` を指定できます。デフォルト：`1h`。 |
| `--deadline-slot` | `--valid-for` の代替：認可が期限切れとなる絶対スロット。`--valid-for` とは排他的です。 |
| `--json` | 人間向けのサマリーではなく JSON（`{ hex, deadline_slot }`）を出力します。 |

このコマンドは、hex エンコードされた認証メッセージ、解決されたデッドラインスロット、および次の 2 つのステップですぐに実行できるシェルスニペットを表示します。

### 2. メッセージに署名する

バリデーター ID キーペアが保管されているマシンで：

```bash
solana sign-offchain-message <123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3> \
--keypair <path-to-validator-identity-keypair.json>
```

base58 形式の署名が表示されます。

出力例

```bash
SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp
```

### 3. `configure` を送信する

手数料支払者ウォレットがあるマシンに戻り：

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --signature <SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp> \
    --deadline-slot <DEADLINE_SLOT>
```

`--signature` と `--deadline-slot` は一緒に渡す必要があります。値はステップ 2b.i および 2b.ii で生成されたものと一致している必要があります。

ATA がまだ存在しない場合、同じトランザクション内で自動的に初期化されます。

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
    各オフチェーン署名にはデッドラインスロットがあります。`prepare-offchain-message` から `configure` までの間に時間が経ちすぎると、`prepare-offchain-message` を再実行し、再署名して、再送信する必要があります。デフォルトの有効期間は 1 時間です — オフライン署名フローでより多くの時間が必要な場合は、`--valid-for 4h` などで延長してください。