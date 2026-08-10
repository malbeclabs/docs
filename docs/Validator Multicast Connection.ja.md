---
description: 接続済みのバリデーターを設定し、リーダーシュレッドを DoubleZero マルチキャストエッジフィードにパブリッシュします。
---

# バリデーター マルチキャスト接続
!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます"

!!! note inline end "トレーディング企業およびビジネス"
    トレーディング企業やビジネスを運営しており、フィードの購読をご希望の場合は、[こちら](https://doublezero.xyz/edge-form)から詳細情報の取得にご登録ください。

まだ DoubleZero に接続していない場合は、[セットアップ](<setup.md>)および [Mainnet-Beta](<DZ Mainnet-beta Connection.md>) バリデーター接続のドキュメントを完了してください。

すでに DoubleZero に接続済みのバリデーターの方は、このガイドを続行してください。

## 1. クライアント設定

### Jito-Agave (v3.1.9+) および Harmonic (3.1.11+)

1. バリデーターの起動スクリプトに以下を追加してください: `--shred-receiver-address 233.84.178.1:7733`

    Jito と `edge-solana-shreds` グループに同時に送信することが可能です。

    例:

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...The rest of your config...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. バリデーターを再起動してください。
3. DoubleZero マルチキャストグループ `edge-solana-shreds` にパブリッシャーとして接続してください: `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

### Frankendancer

1. `config.toml` に以下を追加してください:

    ```toml
    [tiles.shred]
    additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
    ```

2. バリデーターを再起動してください。
3. DoubleZero マルチキャストグループ `edge-solana-shreds` にパブリッシャーとして接続してください: `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

## 2. リーダーシュレッドをパブリッシュしていることの確認

接続後、[このダッシュボード](https://data.doublezero.xyz/dz/publisher-check)でシュレッドをパブリッシュしていることを確認できます。少なくとも1スロット分のリーダーシュレッドをパブリッシュするまで、確認は表示されません。

## マルチキャストエンドポイント（IP とポート）

シュレッドトラフィックでは、**IP アドレス**がマルチキャストフィードを選択し、**ポート**が UDP サービスを選択します。
以下のすべてのフィードは UDP ポート `7733` を使用します。

現在のグループ IP は以下のコマンドで確認できます:

```bash
doublezero multicast group list
```

- `edge-solana-shreds`（リーダー）: `233.84.178.1:7733`
- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`

API リファレンスおよび機械可読データエンドポイントについては、[https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs) を参照してください。

## 3. バリデーター報酬

バリデーターがリーダーシュレッドをパブリッシュした各エポックにおいて、サブスクリプションに基づいた貢献度に比例して報酬が支払われます。このシステムの詳細は後日発表および公開される予定です。

## トラブルシューティング

### リーダーシュレッドがパブリッシュされない場合:

シュレッドが送信されない最も一般的な原因は、クライアントのバージョンです:

Jito-Agave 3.1.9+、JitoBam 3.1.9+、Frankendancer、または Harmonic 3.1.11+ を実行している必要があります。その他のクライアントバージョンでは動作しません。

### リトランスミットしている場合:

1. シュレッドのリトランスミットの一般的な原因は、単純な設定ミスです。起動スクリプトでリトランスミットシュレッドを送信するフラグが有効になっている可能性があります。これを無効にする必要があります。

    Jito-Agave で削除すべきフラグは: `--shred-retransmit-receiver-address` です。

1. [パブリッシャーダッシュボード](https://data.doublezero.xyz/dz/publisher-check)を確認し、リトランスミットされたシュレッドがないか確認してください。テーブルの **No Retransmit Shreds** 列を確認してください。赤い X が表示されている場合、リトランスミットしています。

    !!! note "エポック表示"
        パブリッシャーダッシュボードの表示には異なる時間ウィンドウがあります。**2 エポック表示**でリトランスミットが確認されたが、最近変更を行った場合は、**最近のスロット**表示に切り替えてみてください。


    ![パブリッシャーチェックダッシュボード](images/publisher-check-dashboard.png)

2. クライアント IP を見つけ、[DoubleZero Data](https://data.doublezero.xyz/dz/users) でユーザーを検索してください。

    ![DoubleZero Data ユーザー](images/doublezero-data-users.png)

3. **Multicast** をクリックしてマルチキャストビューを開いてください。

    以下のスクリーンショットは、**リトランスミット中**（望ましくない状態）を示しています。リーダースロットのパターンがなく、一定のアウトバウンドトラフィックが見られます。

    ![ユーザーマルチキャストビュー - リトランスミットの例](images/user-multicast-view-retransmit.png)

    以下のスクリーンショットは、**正常な状態**（リーダーシュレッドのみをパブリッシュ）を示しています。アウトバウンドトラフィックがスパイク状に発生し、リーダースロットに合致するノコギリ歯パターンとして知られる形状になっています。

    ![ユーザーマルチキャストビュー - 正常なパブリッシャーの例](images/user-multicast-view-healthy.png)

このチャートは、リーダーシュレッドのみを送信しているかどうかを示します。トラフィックのスパイクは、リーダースロットを持っているタイミングと一致するはずです。リーダースロットがない場合はトラフィックがないはずです。リトランスミットしている場合は、スロットに合致したスパイクではなく、一定のトラフィックフローが表示されます。