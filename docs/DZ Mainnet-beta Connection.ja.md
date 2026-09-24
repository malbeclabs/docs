---
description: Solana バリデーター（mainnet-beta または testnet）と最大3台のバックアップを IBRL モードで DoubleZero に接続します。ID の証明と接続リクエストの手順を含みます。
---

# IBRL モードでのバリデーター接続

!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意します"

??? warning "DoubleZero テストネットに接続することにより、以下に定める評価契約の条項に同意します（クリックで展開）"
    <span style="font-size:14px;">DoubleZero Testnet</span>
    Evaluation Agreement

    By accessing or using the Solution (defined below), you agree as of the
    first date of such access (the "**Effective Date**") that this
    Evaluation Agreement (the "**Agreement**") sets forth the terms and
    conditions under which DoubleZero Foundation ("**DZF**") will provide
    you ("**User**" or "**you**") access to the Solution on an evaluation
    basis. In consideration of the mutual promises herein, you agree as
    follows:

    <span style="font-size:14px;">1. DEFINITIONS.</span>

    <span style="font-size:14px;">1.1 "**Confidential Information**"</span> means any and all information disclosed by either party to the other which is designated as confidential, or which should otherwise be understood to be confidential, including but not limited to, the Solution, product plans, business plans, trade secrets, technology, or any other proprietary information.

    <span style="font-size:14px;">1.2 "**Solution**" </span> means the testnet version of the DoubleZero high-performance network infrastructure for web3 projects ("**Testnet**") and related edge filtering service with integrated bandwidth ("**Information Service**") the DZ Software (defined below), any and all materials provided by DZF relating to the DZ Software ("**Documentation**"), and other materials that DZF provides to User hereunder.

    <span style="font-size:14px;">2. ACCESS. </span>

    <span style="font-size:14px;">2.1 ^^Access to Solution^^.</span> Subject to the terms and conditions of this Agreement, DZF will provide User access to the Solution through the Internet. User's access is a non-exclusive, non-transferable, limited use of the Solution to enable User to evaluate the Information Service only. With respect to any software comprising the Solution ("**DZ Software**"), DZF hereby grants User a limited, revocable license, during the Evaluation Period, to copy, download, make a reasonable number of copies of, run, and deploy (as applicable) such DZ Software solely as contemplated by the Documentation.

    <span style="font-size:14px;">2.2 ^^Restrictions^^. </span>User may use the Solution in accordance with this Agreement from the Effective Date until terminated by DZF (the "**Evaluation Period**"). User understands that any rights to use the Solution beyond the Evaluation Period will be subject to a separate commercial agreement between the parties with respect thereto, including the payment of fees. User shall not, and shall not permit any third party to: (i) modify or create any derivative works based on the Solution or any portion thereof; (ii) reproduce the Solution except as expressly permitted by this Agreement; (iii) sublicense, distribute, sell, lend, rent, lease, transfer, or grant any rights in or to all or any portion of the Solution or provide access to the Solution to third parties, on a service bureau basis or otherwise, except as an offering of the Information Services through or in connection with User's platform or product and not on a standalone basis; or (iv) use the Solution other than as provided herein.

    <span style="font-size:14px;">2.3 ^^Ownership^^.</span> DZF retains all right, title and interest, including intellectual property rights, in and to the Solution.

    <span style="font-size:14px;">3 FEEDBACK.</span>
    DZF may periodically request that User provide, and User agrees to provide to DZF, feedback regarding the use, operation, and functionality of the Solution ("Feedback"). User hereby grants DZF a non-exclusive, worldwide, perpetual, irrevocable, royalty-free, fully paid-up, fully sublicensable and transferable right and license to use and incorporate Feedback into any products and services, to make, use, sell, offer for sale, import, and otherwise exploit such products and services, and to otherwise use, copy, distribute, and otherwise exploit the Feedback without restriction.

    <span style="font-size:14px;">4. TERM AND TERMINATION.</span>

    <span style="font-size:14px;">4.1 ^^Term^^.</span> This Agreement will commence as of the Effective Date and will remain in full force and effect for the Evaluation Period. Either party may terminate this Agreement immediately for convenience, for any reason or no reason, upon written notice to the other party (email to suffice).

    <span style="font-size:14px;">4.1 ^^Effects of Termination^^.</span> Upon termination of this Agreement for any reason: (i) the rights granted to User hereunder will immediately terminate; (ii) User shall immediately discontinue any use of the Solution and shall return or destroy all Documentation and any DZ Software under its control; (iii) each party shall promptly return or destroy all Confidential Information and property of the other party; and (iv) Sections 2.2, 2.3, 3, 4.2, and 5 through 8 will survive.

    <span style="font-size:14px;">5. CONFIDENTIALITY.</span>
    Each party agrees that it will use the Confidential Information of the other party solely to perform its obligations and exercise its rights under this Agreement and it will not disclose, or permit to be disclosed, the same, except as otherwise permitted hereunder. However, either party may disclose Confidential Information to its personnel, attorneys, and other representatives who have a need to know and are bound by confidentiality obligations no less protective than those set forth in this Agreement; and as required by law (in which case the receiving party will provide the disclosing party with prior notice thereof and opportunity to contest such disclosure, and will minimize such disclosure to the extent permitted by applicable law). The obligations of confidentiality in this Section 5 shall not apply to information that: (a) is or becomes generally known or publicly available through no fault of the receiving party; (b) was properly known to the receiving party, without restriction, prior to disclosure by the disclosing party; (c) was properly disclosed to the receiving party, without restriction, by another person with the legal authority to do so; or (d) is independently developed by the receiving party without use of or reference to the disclosing party's Confidential Information. Each party agrees to exercise due care in protecting the Confidential Information of the other party from unauthorized use and disclosure. In the event of actual or threatened breach of the provisions of this Section or the licenses contained herein, the non-breaching party will be entitled to seek immediate injunctive and other equitable relief, without waiving any other rights or remedies available to it. User is responsible for maintaining the Solution and the secrecy of any passwords, seed phrases, or codes that provide access to the Solution as the Confidential Information of DZF. Nothing herein limits or restricts DZF's right or ability to use data regarding the performance, availability, usage, integrity and security of the Solution. If either party breaches, or threatens to breach the provisions of this Section 5, each party agrees that the non-breaching party will have no adequate remedy at law and is therefore entitled to immediate injunctive and other equitable relief, without bond and without the necessity of showing actual money damages.

    <span style="font-size:14px;">6. WARRANTY DISCLAIMER; LIMITATION OF LIABILITY.</span>

    <span style="font-size:14px;">6.1 ^^WARRANTY DISCLAIMER^^.</span> THE SOLUTION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. DZF MAKES NO WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE WITH RESPECT TO THE SOLUTION AND DOCUMENTATION INCLUDING THEIR CONDITION, CONFORMITY TO ANY REPRESENTATION OR DESCRIPTION, AND DZF SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.

    <span style="font-size:14px;">6.2 ^^LIMITATION OF LIABILITY^^.</span>
    EXCEPT FOR A BREACH OF SECTIONS 2.1, 2.2, AND 5, IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER FOR INDIRECT, INCIDENTAL, SPECIAL OR OTHER CONSEQUENTIAL DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS OR USE OR LOSS OF DATA, INCURRED BY YOU OR ANY THIRD PARTY, ARISING OUT OF OR RELATED TO THIS AGREEMENT WHETHER IN AN ACTION IN CONTRACT, TORT, OR OTHERWISE, EVEN IF THE OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL DZF'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED ONE HUNDRED DOLLARS (\$100), WHETHER AN ACTION IN CONTRACT, TORT, OR OTHERWISE. **THE FOREGOING LIMITATIONS WILL APPLY NOTWITHSTANDING THE FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY HEREIN.** THE PARTIES AGREE THAT THE FOREGOING LIMITATIONS REPRESENT A REASONABLE ALLOCATION OF RISK UNDER THIS AGREEMENT.

    <span style="font-size:14px;">7. GOVERNING LAW.</span>
    This Agreement and all matters arising out of or relating to this Agreement shall be governed, interpreted and constructed in accordance with the laws of the Cayman Islands. Should a controversy, dispute or claim arise out of or in relation to this Agreement ("Dispute"), the relevant party as appropriate, must give 30 days' notice of such Dispute to the other parties (the "Notice of Dispute"). Should the Dispute not be resolved at the expiration of 30 days after service of the Notice of Dispute, the relevant party may commence arbitration proceedings as provided herein. Should the Dispute remain at the expiration of 30 days after service of the Notice of Dispute, the Dispute shall be settled by arbitration administered by the Cayman International Mediation & Arbitration Centre (CI-MAC) in accordance with the CI-MAC Arbitration Rules (the "Arbitration Rules") in force as at the date of this Agreement, which Arbitration Rules are deemed to be incorporated by reference to this clause, and governed by the Arbitration Act (as amended). The arbitration shall be seated in George Town, Grand Cayman, Cayman Islands and governed by Cayman Islands law. The language of the arbitration shall be English. The arbitration shall be determined by a sole arbitrator to be appointed in accordance with the Arbitration Rules. Any award or decision made by the arbitrator shall be in writing and shall be final and binding on the parties without any right of appeal, and judgment upon any award thus obtained may be entered in or enforced by any court having jurisdiction thereof. No action at law or in equity based upon any claim arising out of or related to this Agreement shall be instituted in any court of any jurisdiction. If any litigation or arbitration is necessary to enforce the terms of this Agreement, the prevailing party will be entitled to have their attorney fees paid by the other party. Each party waives any right it may have to assert the doctrine of forum non conveniens, to assert that it is not subject to the jurisdiction of such arbitration or courts or to object to venue to the extent any proceeding is brought in accordance herewith. </span>

    <span style="font-size:14px;">8. GENERAL PROVISIONS.</span>
    This Agreement may not be transferred or assigned by User without the prior written consent of DZF. DZF may freely assign this Agreement. All notices required to be sent hereunder shall be sent by email (to DZF: legal@doublezero.xyz) and deemed received the day after sending (with transmission confirmed). If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions of this Agreement will remain in full force and effect. The waiver by either party of any default or breach of this Agreement shall not constitute a waiver of any other or subsequent default or breach. Neither party shall be liable for any delay or failure in performance due to acts of God, earthquakes, shortages of supplies, transportation difficulties, labor disputes, riots, war, fire, epidemics, and similar occurrences beyond its control, whether or not foreseeable. This Agreement together with any attachments constitutes the complete agreement between the parties and supersedes all prior or contemporaneous agreements or representations, written or oral, concerning the subject matter herein. This Agreement may not be modified or amended except in writing signed by a duly authorized representative of each party.

Solana クラスターに合った DoubleZero ネットワークを選択してください：`mainnet-beta` または `testnet`。[セットアップ](setup.md)で対応するパッケージをインストールし、以下のすべてのコマンドで同じネットワークを使用してください。

!!! Note inline end
    IBRL モードでは、既存のパブリック IP アドレスを使用するため、バリデータークライアントの再起動は不要です。

Solana バリデーターは、このページの手順に従って IBRL モードで DoubleZero に接続します。

各 Solana バリデーターには固有の**ID キーペア**があり、そこから**ノード ID** として知られる公開鍵を抽出します。これは Solana ネットワーク上でのバリデーターの一意の識別子です。

DoubleZeroID とノード ID を特定したら、マシンの所有権を証明します。これは、バリデーターの ID キーで署名された DoubleZeroID を含むメッセージを作成することで行われます。生成された暗号署名は、あなたがバリデーターを管理していることの検証可能な証拠として機能します。

最後に、**DoubleZero への接続リクエスト**を送信します。このリクエストは次のことを伝えます：*「これが私の ID であり、所有権の証明であり、接続方法です。」* DoubleZero はこの情報を検証し、証明を受け入れ、DoubleZero 上でバリデーターへのネットワークアクセスをプロビジョニングします。

このガイドでは、1 台のプライマリバリデーターの登録と、最大 3 台のバックアップ/フェイルオーバーマシンの同時登録が可能です。

## 前提条件

- Solana CLI がインストールされ $PATH に設定されていること
- バリデーターの場合：sol ユーザーでバリデーター ID キーペアファイル（例：validator-keypair.json）にアクセスする権限があること
- バリデーターの場合：接続する Solana バリデーターの ID キーに少なくとも 1 SOL があることを確認すること
- ファイアウォールルールが DoubleZero および Solana RPC に必要なアウトバウンド接続を許可していること（
 GRE（ip proto 47）および BGP（169.254.0.0/16 の tcp/179）を含む）

!!! info
    バリデーター ID は Solana gossip と照合され、ターゲット IP が決定されます。ターゲット IP と DoubleZero ID は、マシンとターゲットの DoubleZero デバイス間で GRE トンネルを開く際に使用されます。

    注意：ジャンク ID とプライマリ ID が同じ IP にある場合、マシンの登録にはプライマリ ID のみが使用されます。これは、ジャンク ID が gossip に表示されず、ターゲットマシンの IP の検証に使用できないためです。

## 1. クライアントネットワークの確認

先に進む前に、[セットアップ](setup.md)の手順に従ってください。**mainnet-beta** または **testnet** 用のパッケージをインストールしてください。それぞれ異なるパッケージリポジトリを使用します。

セットアップの最後のステップは、ネットワークからの切断でした。これは、マシン上で DoubleZero へのトンネルが 1 つだけ開かれ、そのトンネルが正しいネットワーク上にあることを確認するためです。

クライアントが選択したネットワーク上にあることを確認します：

```bash
doublezero status
```

`Network` 列が `mainnet-beta` または `testnet` であり、Solana クラスターと一致していることを確認してください。間違っている場合、または間違ったパッケージをインストールした場合は、[トラブルシューティング](troubleshooting.md#issue-wrong-doublezero-environment)のコピー＆ペースト切り替えを使用してください。

約 30 秒後に、利用可能な DoubleZero デバイスが表示されます：

```bash
doublezero latency
```

出力例（mainnet-beta の場合。testnet も同様ですがデバイス数が少なくなります）：

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

## 2. ポート 44880 の開放

一部の[ルーティング機能](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md)を利用するには、ポート 44880 を開放する必要があります。

ポート 44880 を開放するには、以下のように IP テーブルを更新できます：

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```


`-i doublezero0`、`-o doublezero0` フラグにより、このルールは DoubleZero インターフェースのみに制限されることに注意してください

または UFW の場合：

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```


`in on doublezero0`、`out on doublezero0` フラグにより、このルールは DoubleZero インターフェースのみに制限されることに注意してください

## 3. バリデーター所有権の証明

!!! note "ネットワークフラグ"
    以下の Passport コマンドは `-u mainnet-beta` を使用しています。テストネットの場合は、代わりに `-u testnet`（または `-ut`）を使用してください。

DoubleZero 環境が設定されたので、バリデーターの所有権を証明する段階です。

プライマリバリデーターの[セットアップ](setup.md)で作成した DoubleZero ID は、すべてのバックアップマシンで使用する必要があります。

プライマリマシンの ID は `doublezero address` で確認できます。同じ ID がクラスター内のすべてのマシンの `~/.config/doublezero/id.json` に存在する必要があります。

これを行うには、まずコマンドを実行しているマシンが**プライマリバリデーター**であることを確認します：

```
doublezero-solana passport find-validator -u mainnet-beta
```

これにより、バリデーターが gossip に登録されており、リーダースケジュールに含まれていることが確認されます。

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
    1 台でも複数台でも同じワークフローが使用されます。
    1 台のマシンのみを登録する場合は、このページのすべてのコマンドから "--backup-validator-ids" または "backup_ids=" 引数を除外してください。

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
この出力は想定通りです。バックアップノードはパス作成時にリーダースケジュールに含まれていてはいけません。

**プライマリバリデーター**の投票アカウントと ID を使用する予定の**すべてのバックアップマシン**でこのコマンドを実行します。


### 接続の準備

以下のコマンドを**プライマリバリデーター**マシンで実行します。これは、アクティブステークがあり、リーダースケジュールに含まれており、コマンドを実行しているマシン上の solana gossip にプライマリバリデーター ID が存在するマシンです：

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
このコマンドの末尾の出力に注意してください。これは次のステップの構造になります。


## 4. 署名の生成

前のステップの最後に、`solana sign-offchain-message` 用のフォーマット済み出力を受け取りました。

上記の出力から、**プライマリバリデーター**マシンで以下のコマンドを実行します。

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**出力：**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```


## 5. DoubleZero への接続リクエストの開始

`request-validator-access` コマンドを使用して、接続リクエスト用の Solana アカウントを作成します。DoubleZero Sentinel エージェントが新しいアカウントを検出し、ID と署名を検証し、DoubleZero にアクセスパスを作成してサーバーが接続を確立できるようにします。


ノード ID、DoubleZeroID、および署名を使用します。

!!! note inline end
      この例では、バリデーター ID を見つけるために `-k /home/user/.config/solana/id.json` を使用しています。ローカルデプロイメントに適したパスを使用してください。

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**出力：**

この出力は Solana エクスプローラーでトランザクションを確認するために使用できます。クラスターに合わせてエクスプローラーを mainnet-beta または testnet に設定してください。この確認はオプションです。

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

成功すると、DoubleZero はプライマリとそのバックアップを登録します。アクセスパスに登録された IP 間でフェイルオーバーが可能になります。この方法で登録されたバックアップノードに切り替える際、DoubleZero は自動的に接続を維持します。


## 6. IBRL モードでの接続

サーバー上で、DoubleZero に接続するユーザーとして `connect` コマンドを実行し、DoubleZero への接続を確立します。

```
doublezero connect ibrl
```

以下のようなプロビジョニングを示す出力が表示されます：

```
DoubleZero Service