---
description: 接続済みのバリデーターを設定して、リーダーシュレッドをDoubleZeroマルチキャストエッジフィードにパブリッシュします。
---

# バリデーターマルチキャスト接続
!!! warning "DoubleZeroに接続することで、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます"

!!! note inline end "トレーディング企業およびビジネス"
    トレーディング企業やビジネスを運営しており、フィードの購読をご検討の方は、[こちら](https://doublezero.xyz/edge-form)から詳細情報のリクエストをご登録ください。

まだDoubleZeroに接続していない場合は、[セットアップ](<setup.md>)および[Mainnet-Beta](<DZ Mainnet-beta Connection.md>)バリデーター接続のドキュメントを完了してください。

すでにDoubleZeroに接続済みのバリデーターの方は、このガイドを続行してください。

## 1. クライアント設定

### Jito-Agave (v3.1.9+) および Harmonic (3.1.11+)

1. バリデーターの起動スクリプトに以下を追加します: `--shred-receiver-address 233.84.178.1:7733`

    Jitoと`edge-solana-shreds`グループに同時に送信することが可能です。

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

2. バリデーターを再起動します。
3. DoubleZeroマルチキャストグループ`edge-solana-shreds`にパブリッシャーとして接続します: `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

### Frankendancer

1. `config.toml`に以下を追加します:

    ```toml
    [tiles.shred]
    additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
    ```

2. バリデーターを再起動します。
3. DoubleZeroマルチキャストグループ`edge-solana-shreds`にパブリッシャーとして接続します: `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

## 2. リーダーシュレッドのパブリッシュを確認する

接続が完了したら、[このダッシュボード](https://data.doublezero.xyz/dz/publisher-check)でシュレッドがパブリッシュされていることを確認できます。少なくとも1スロット分のリーダーシュレッドをパブリッシュするまで、確認は表示されません。

## マルチキャストエンドポイント（IP対ポート）

シュレッドトラフィックでは、**IPアドレス**がマルチキャストフィードを選択し、**ポート**がUDPサービスを選択します。  
以下のすべてのフィードはUDPポート`7733`を使用します。

現在のグループIPは以下のコマンドで確認できます:

```bash
doublezero multicast group list
```

- `edge-solana-shreds`（リーダー）: `233.84.178.1:7733`
- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`

APIリファレンスおよび機械可読データエンドポイントについては、[https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)を参照してください。

## 3. バリデーター報酬

バリデーターがリーダーシュレッドをパブリッシュした各エポックにおいて、サブスクリプションに基づいた貢献度に応じて比例配分で報酬が付与されます。このシステムの詳細については、後日発表および公開される予定です。

## トラブルシューティング

### リーダーシュレッドがパブリッシュされない場合:

シュレッドが送信されない最も一般的な原因は、クライアントのバージョンです:

Jito-Agave 3.1.9+、JitoBam 3.1.9+、Frankendancer、またはHarmonic 3.1.11+を実行している必要があります。その他のクライアントバージョンでは動作しません。

### 再送信（リトランスミット）している場合:

1. シュレッド再送信の一般的な原因は、シンプルな設定ミスです。起動スクリプトで再送信シュレッドを送信するフラグが有効になっている可能性があります。これを無効にする必要があります。

    Jito-Agaveで削除すべきフラグは: `--shred-retransmit-receiver-address`です。

1. [パブリッシャーダッシュボード](https://data.doublezero.xyz/dz/publisher-check)を確認し、再送信されたシュレッドがないか確認してください。テーブルの**No Retransmit Shreds**列を確認し、赤いXが表示されている場合は再送信が行われています。

    !!! note "エポックビュー"
        パブリッシャーダッシュボードには異なる時間ウィンドウがあります。**2エポックビュー**で再送信が表示されていても、最近変更を行った場合は、**最近のスロット**ビューに切り替えてみてください。


    ![パブリッシャーチェックダッシュボード](images/publisher-check-dashboard.png)

2. クライアントIPを確認し、[DoubleZero Data](https://data.doublezero.xyz/dz/users)でユーザーを検索してください。

    ![DoubleZero Dataユーザー](images/doublezero-data-users.png)

3. **Multicast**をクリックしてマルチキャストビューを開きます。

    以下のスクリーンショットは: **再送信中**（望ましくない状態）— リーダースロットのパターンがなく、一定のアウトバウンドトラフィックが表示されています。

    ![ユーザーマルチキャストビュー - 再送信の例](images/user-multicast-view-retransmit.png)

    以下のスクリーンショットは: **正常な状態**（リーダーシュレッドのみをパブリッシュ）— リーダースロットに合わせてスパイク状（ノコギリ波パターン）のアウトバウンドトラフィックが表示されています。

    ![ユーザーマルチキャストビュー - 正常なパブリッシャーの例](images/user-multicast-view-healthy.png)

このチャートは、リーダーシュレッドのみを送信しているかどうかを示しています。トラフィックスパイクは、リーダースロットを持つタイミングと一致するはずです。リーダースロットがない場合、トラフィックは発生しないはずです。再送信している場合は、スロットに合わせたスパイクではなく、一定のトラフィックフローが表示されます。