---
description: doublezero-edge-connect を実行して Solana shred をローカル UDP ポートに再転送し、正規化された Edge マーケットデータをローカル WebSocket 経由で受信します。
---

# Edge 接続

!!! warning "DoubleZero に接続することで、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データは内部目的でのみ使用可能であり、再送信は禁止されています（セクション 2(e) を参照）。"

`doublezero-edge-connect` は **DoubleZero Edge バイナリマルチキャスト** に参加し、以下の 2 つのフィードとしてローカルに再配信するブリッジです：

1. **Solana shred 転送** — 重複排除済み（オプションで署名検証済み）の shred を 1 つ以上のローカル UDP 宛先にファンアウトし、バリデーターまたは RPC に直接配信します。
2. **正規化マーケットデータ** — Edge 取引所フィードをデコード・精度補正し、`ws://host:8081` 上の単一 JSON WebSocket として再配信します。

どちらも同じコンテナと同じワンライナーインストールで動作します。オンチェーン認可で許可されたフィードを有効にしてください。

```
                                        ┌─ UDP datagrams ──▶  validator / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binary)             (dedup · decode · normalize)  └─ WebSocket (JSON) ──▶  trading engine
                                                          ws://host:8081
```

---

## 要件

- ターゲット環境向けにオンチェーンで認可されたパブリック IPv4 アドレスを持つ **Linux/amd64** ホスト。
- **Docker**（ワンライナーが未インストールの場合は自動インストールします）。
- **GRE 接続** — クラウドプロバイダーで IP プロトコル 47 を許可してください。AWS では ENI のソース/宛先チェックを無効にしてください。
- **DoubleZero アクセスシークレット**: `DZ_` プレフィックス付き base64 トークン、またはキーペアファイルのパス。[DoubleZero オンボーディング](setup.md)プロセスから取得します。

---

## ステップ 1: インストールと実行

1 つのコマンドでホストを準備し、ブリッジコンテナを起動します。DoubleZero ネットワークに参加し、認可で許可されたすべてのフィード（shred 転送および/または `:8081` のマーケットデータ WebSocket）を開始します：

=== "Mainnet-beta"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect | bash
    ```

=== "Testnet"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect-testnet | bash
    ```

=== "Devnet (プライベート)"

    ```bash
    # read:packages 権限を持つ GHCR トークンが必要です
    DZ_GHCR_TOKEN=<your-token> curl -fsSL https://get.doublezero.xyz/connect-devnet | bash
    ```

スクリプトが実行する内容：

1. ホストが Linux/amd64 であることを確認し、Docker の存在を確認します（未インストールの場合はインストールを提案）。
2. GRE トンネル用にホストカーネルを準備します：`tun`/`ip_gre` をロードし、`net.core.rmem_max` を引き上げ、ファイアウォールとクラウドプロバイダーのルールについて警告します。
3. アクセスシークレットを読み込みます（`DZ_SECRET` が未設定の場合は一度だけプロンプト表示）。
4. ブリッジコンテナ（`--network host`、`NET_ADMIN`/`NET_RAW`、`/dev/net/tun`）を実行し、`doublezero connect multicast` を実行します。

!!! tip "非対話式インストール"
    パイプの前に `DZ_SECRET=DZ_…` を設定すると、プロンプトなしで完全に無人実行できます。

---

## ステップ 2: 設定

すべての設定は**パイプの前に設定する環境変数**で行います。設定ファイルはありません。

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### インストーラー変数

| 変数 | デフォルト | 用途 |
|----------|---------|---------|
| `DZ_SECRET` | *（プロンプト表示）* | `DZ_` プレフィックス付き base64 トークン**または**キーペアファイルのパス。トークンはコンテナに注入されディスクには書き込まれません。ファイルは読み取り専用でバインドマウントされます。 |
| `DZ_ENV` | スクリプトごと | `mainnet-beta` \| `testnet` \| `devnet`。 |
| `DZ_IMAGE` | スクリプトごと | コンテナイメージのオーバーライド。 |
| `DZ_NAME` | `doublezero-edge-connect` | コンテナ名。 |
| `DZ_FEEDS` | *（すべて）* | マーケットデータ取り込みを絞り込むカンマ区切りの取引所名（例: `VenueA,VenueB`）。Solana shred 転送には影響しません。 |
| `DZ_ASSUME_YES` | `0` | 確認プロンプトをスキップします（例: Docker インストールプロンプト）。 |
| `DZ_GHCR_TOKEN` | — | **Devnet 限定** — `read:packages` 権限を持つ GHCR トークン（devnet イメージはプライベートです）。 |
| `DZ_GHCR_USER` | `malbeclabs` | **Devnet 限定** — ログイン用の GHCR ユーザー名。 |

### ブリッジ変数

インストーラーは**空でない**ブリッジ変数をすべてコンテナにそのまま転送します。主要なものは以下の通りです：

| 変数 | デフォルト | 用途 |
|----------|---------|---------|
| `DZ_IFACE` | `doublezero1` | リッスンするネットワークインターフェース。 |
| `DZ_RECV_BUF` | — | UDP 受信バッファのオーバーライド（バイト）。 |
| `METRICS_BIND` | *（空 / 無効）* | Prometheus `/metrics` エンドポイントを有効にします（例: `127.0.0.1:9090`）。 |
| `RUST_LOG` | `info` | ログレベル（`debug`、`warn` など）。 |
| `DZ_SHRED_FORWARD` | — | 転送 shred のローカル UDP 宛先 — [Solana Shred 転送](#solana-shred-転送)を参照。 |
| `WS_BIND` | `0.0.0.0:8081` | マーケットデータ WebSocket のバインドアドレス — [マーケットデータ WebSocket](#マーケットデータ-websocket) を参照。 |
| `WS_MAX_CLIENTS` | `64` | WebSocket の最大同時接続クライアント数。 |
| `WS_INPUT_COINS` | *（空 / 無効）* | 指定シンボルのパブリック WebSocket バックストップを有効にします（例: `BTC,ETH`）。 |

**例：**

```bash
# ローカルのバリデーター/RPC に shred を転送：
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# 非対話式、testnet：
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# 特定の取引所に絞り込み、詳細ログ、デフォルト以外の WS ポート：
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# メトリクスとパブリック WS バックストップを有効化：
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    インストーラーは**空でない**値のみを転送するため、ワンライナーで空のオーバーライド（例: WebSocket シンクを無効にする `WS_BIND=""`）を渡すことはできません。その場合は手動の `docker run` を使用してください — [セルフホスティング](#上級-セルフホスティング)を参照。

---

## Solana Shred 転送

ブリッジは `edge-solana-*` shred マルチキャストグループに参加し、各データグラムを 1 つ以上のローカル UDP 宛先にファンアウトします。Edge ネットワークからバリデーターまたは RPC に直接フィードします。認可にこれらのグループが含まれている場合、検出時に自動的にアクティブになります。

```bash
# デフォルト（重複排除のみ、ローカルポート 20000 に転送）：
DZ_SHRED_FORWARD=127.0.0.1:20000 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# 署名検証付き：
DZ_SHRED_DEDUP_MODE=sigverify \
  DZ_SHRED_RPC_URL=https://api.mainnet-beta.solana.com \
  DZ_SHRED_FORWARD=127.0.0.1:20000 \
  DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

| 変数 | デフォルト | 用途 |
|----------|---------|---------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | 転送 shred の宛先（繰り返し指定可能）。 |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup`（shred ごとに 1 コピー）、`sigverify`（+ ed25519 検証）、`none`（全データグラム）。 |
| `DZ_SHRED_RPC_URL` | — | Solana RPC エンドポイント。`sigverify` モードで必須。 |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | 重複排除ウィンドウのサイズ。 |

完全なパイプラインと注意事項については [Shred forwarding](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md) を参照してください。

---

## マーケットデータ WebSocket

`ws://<host>:8081` に WebSocket 接続を開き、JSON フレームを読み取ります。認可された取引所のデータをすべて受信します。オプションの `subscribe` メッセージでストリームを特定の取引所やシンボルに絞り込めます。

WebSocket + JSON に対応する任意のエンジンが、薄い（〜50–100 行の）アダプターで消費できます。バイナリマルチキャスト、取引所ごとの 2 ポート分割、マニフェスト/精度ハンドシェイクはすべてブリッジ内に留まります。コンシューマーがコーディングする唯一の契約は WebSocket JSON です。

### 接続ライフサイクル

新しい接続ごとにブリッジは以下を行います：

1. **現在のインストゥルメント定義をリプレイ** — 既知のシンボルごとに 1 つの `instrument` メッセージ — コンシューマーが最初の気配値の前に精度情報を得られるようにします。
2. **シンボルごとの最新板情報スナップショットをリプレイ**（Market-by-Order フィードがアクティブな場合）。
3. `quote` / `trade` / `midpoint` / `depth` メッセージが到着次第、接続済みのすべてのコンシューマーに**ストリーミング**します。

```
connect → instrument (×N) → depth (×M, latest books) → quote → trade → depth → …
```

### メッセージタイプ

すべてのメッセージは `type` フィールドでタグ付けされた JSON オブジェクトです：

| `type` | 意味 |
|--------|---------|
| `instrument` | インストゥルメント/精度定義。 |
| `quote` | 最良気配値の更新（フルステート）。 |
| `trade` | 約定プリント（直近の取引）。 |
| `midpoint` | 算出されたミッド価格。 |
| `depth` | フルオーダーブック板情報スナップショット。 |
| `status` | 取引所レベルのフィードヘルス遷移。 |

コンシューマーは**未知の `type` 値および未知のフィールドを無視しなければなりません**（前方互換性）。

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

接続時および定義変更時に送信されます。`price_exponent` と `qty_exponent` は取引所のティックサイズとサイズステップを 10 のべき乗で表します。

#### `quote`

```json
{
  "type": "quote",
  "venue": "ExampleVenue",
  "symbol": "SOL",
  "bid": 184.20, "ask": 184.21,
  "bid_size": 12.5, "ask_size": 8.0,
  "bid_n": 3, "ask_n": 2,
  "source_ts_ns": 1781019263715344015,
  "recv_ts_ns":   1781019263715501230,
  "kernel_rx_ts_ns": 1781019263715300010,
  "ws_send_ts_ns":   1781019263715600440
}
```

すべての `quote` は**フルステート**です — メッセージが欠落しても次の quote で自動復旧し、再同期は不要です。4 つのタイムスタンプでエンドツーエンドのレイテンシを分解できます：

```
source_ts_ns → kernel_rx_ts_ns → recv_ts_ns → ws_send_ts_ns → (consumer recv)
  venue book      wire arrival      post-decode    WS hand-off
```

`0` は「利用不可」のセンチネル値です — 1970 年ではなく欠損として扱ってください。

#### `trade`

```json
{
  "type": "trade",
  "venue": "ExampleVenue", "symbol": "SOL",
  "price": 184.20, "size": 3.5,
  "aggressor_side": "buy",
  "trade_id": 987654, "cumulative_volume": 12500.0,
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

`aggressor_side` は `"buy"`、`"sell"`、または `"unknown"` です。約定はポイントインタイムのイベントであり、再接続時にはリプレイされません。

#### `depth`

```json
{
  "type": "depth",
  "venue": "MboVenue", "symbol": "SOL",
  "bids": [[184.20, 12.5], [184.19, 4.0]],
  "asks": [[184.21, 8.0], [184.22, 6.5]],
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

`bids` は価格の高い順にソート、`asks` は価格の低い順にソートされています。各 `depth` は**フルスナップショット**です — マージではなく置換してください。

#### `status`

```json
{"type":"status","venue":"ExampleVenue","state":"down","stale_ms":30000,"ts_ns":...}
```

取引所の quote マルチキャストが沈黙（`state:"down"`）または回復（`state:"ok"`）した際に Edge 上で発行されます。UI で取引所をグレーアウト表示するのに使用してください。Quote の配信は status に依存しません — フィードは次の quote で自動復旧します。

### サブスクリプション

デフォルトではすべてを受信します。ストリームを絞り込むにはコントロールメッセージを送信します：

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

フィールドを省略すると任意の値にマッチします（`{"symbol":"SOL"}` = すべての取引所の SOL）。`venue` は大文字小文字を区別しません。

**サーバー応答：**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

エラーは `{"channel":"error","error":"<reason>"}` を返します。

### ハートビートと生存確認

- サーバーは 20 秒ごとに **WebSocket Ping** を送信します。準拠クライアントは自動で Pong を返します。
- 60 秒間無応答のクライアントは切断・解放されます。
- アプリケーションレベルのキープアライブ：`{"method":"ping"}` → `{"channel":"pong"}`。

### コンシューマーのスケルトン

```python
import json, websocket

def on_message(ws, frame):
    msg = json.loads(frame)
    t = msg.get("type")
    if t == "instrument":
        register_instrument(msg["venue"], msg["symbol"],
                            msg["price_exponent"], msg["qty_exponent"])
    elif t == "quote":
        on_top_of_book(msg["venue"], msg["symbol"],
                       msg["bid"], msg["ask"],
                       msg["bid_size"], msg["ask_size"])
    elif t == "trade":
        on_trade(msg["venue"], msg["symbol"],
                 msg["price"], msg["size"], msg["aggressor_side"])
    elif t == "depth":
        replace_book(msg["venue"], msg["symbol"],
                     msg["bids"], msg["asks"])
    # unknown types: silently ignore (forward compatibility)

ws = websocket.WebSocketApp("ws://localhost:8081", on_message=on_message)
ws.run_forever()
```

### 入力ソースと WebSocket バックストップ

Edge マルチキャストフィードは常時オンです。オプションの**パブリック WebSocket バックストップ**は、Edge フィードが停止した際にギャップを補います：

```bash
# BTC と ETH のバックストップを有効化：
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

2 つのソースは共有アービターの中で `(venue, symbol, source_ts)` ティックごとに競争します。定常状態では Edge ソースが勝利します（インターネット経由の数十 ms に対してサブ ms）。Edge にギャップが生じた場合、パブリックコピーが補完します。どのソースが更新を配信したかに関わらず、WebSocket 出力は同一です。

---

## コンテナの管理

```bash
# ログをストリーミング
sudo docker logs -f doublezero-edge-connect

# トンネル状態を確認
sudo docker exec -it doublezero-edge-connect doublezero status

# デバイスレイテンシを確認
sudo docker exec -it doublezero-edge-connect doublezero latency

# 停止と削除
sudo docker stop doublezero-edge-connect && sudo docker rm doublezero-edge-connect
```

!!! note "TLS なし"
    ブリッジは信頼済み/ローカルネットワークを対象としています。WebSocket エンドポイントを外部に公開する場合は、リバースプロキシで TLS を終端してください。

---

## モニタリング（Prometheus メトリクス）

メトリクスエンドポイントは**デフォルトで無効**です。`METRICS_BIND` で有効にします：

```bash
METRICS_BIND=127.0.0.1:9090 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

スクレイプ：

```bash
curl -s localhost:9090/metrics | grep '^dz_'
```

主要メトリクス：

| メトリクス | 追跡内容 |
|--------|---------------|
| `dz_feed_up{venue}` | 取引所のマルチキャストがライブの間 `1`、沈黙中は `0`。 |
| `dz_datagrams_received_total{venue}` | 取引所ごとの取り込み量。 |
| `dz_emit_total{venue,kind}` | 重複排除後にブロードキャストされたメッセージ（タイプ別）。 |
| `dz_quotes_dropped_total{venue}` | 抑制された古い/重複 quote。 |
| `dz_ws_clients` | 現在接続中の WebSocket クライアント数。 |
| `dz_ws_messages_sent_total{kind}` | クライアントに転送されたメッセージ。 |
| `dz_ws_client_lagged_total` | フィードを保護するために遅延クライアントが切断された回数。 |

`GET /healthz` 生存確認プローブも同じバインドアドレスで提供されます。

---

## 上級: セルフホスティング

コンテナは GHCR で利用可能です：

| 環境 | イメージ | タグ |
|-------------|-------|-----|
| Mainnet-beta | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:mainnet-beta` |
| Testnet | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:testnet` |
| Devnet (プライベート) | `ghcr.io/malbeclabs/doublezero-edge-connect-devnet` | `:latest` |

手動で実行します（インストーラーが転送できないオプション、例えば `WS_BIND=""` が必要な場合）：

```bash
docker run --rm --network host --cap-add NET_ADMIN --device /dev/net/tun \
  -e DZ_SECRET=DZ_… \
  -e DZ_SHRED_FORWARD=127.0.0.1:20000 \
  -e WS_BIND=0.0.0.0:8081 \
  -e METRICS_BIND=127.0.0.1:9090 \
  ghcr.io/malbeclabs/doublezero-edge-connect:mainnet-beta
```

**ソースからビルド：**

```bash
git clone https://github.com/malbeclabs/doublezero-edge-connect
cd doublezero-edge-connect
cargo build --release
cargo test

./target/release/doublezero-edge-connect \
  --iface doublezero1 \
  --ws-bind 0.0.0.0:8081
```

バースト性の高いフィードには、より大きなカーネル受信バッファを推奨します：

```bash
sudo sysctl -w net.core.rmem_max=268435456
```

---

## 制限とバックプレッシャー

| 制限 | デフォルト | 超過時の動作 |
|-------|---------|------------------------|
| 同時接続クライアント数 (`WS_MAX_CLIENTS`) | 64 | 新しい接続が拒否されます。 |
| クライアントごとのサブスクリプション数 (`WS_MAX_SUBS`) | 256 | `subscribe` がエラーで拒否されます。 |
| クライアントごとの受信制御メッセージ数/分 (`WS_MAX_INBOUND_PER_MIN`) | 600 | クライアントが切断されます。 |
| ブロードキャストバッファ (`WS_BROADCAST_CAPACITY`) | 4096 | 遅延クライアントは**最も古いメッセージをドロップ**します（フィードを停止させることはありません）。 |

すべての `quote` と `depth` はフルステートであるため、バックプレッシャーでメッセージをドロップしたコンシューマーは次のメッセージで自動復旧します — 再同期ハンドシェイクは不要です。

---

## トラブルシューティング

### ローカルポートに shred が到着しない

- オンチェーンで `edge-solana-*` shred グループへのアクセスが認可されていることを確認してください。
- トンネルが稼働中か確認してください：`sudo docker exec -it doublezero-edge-connect doublezero status`
- 参加エラーのログを確認してください：`sudo docker logs -f doublezero-edge-connect`
- `DZ_SHRED_FORWARD` が到達可能なローカル UDP 宛先を指していることを確認してください。

### 取引所からメッセージが来ない

- トンネルが稼働中か確認してください：`sudo docker exec -it doublezero-edge-connect doublezero status`
- 参加エラーのログを確認してください：`sudo docker logs -f doublezero-edge-connect`
- オンチェーンでその取引所へのアクセスが認可されていることを確認してください。
- 問題を切り分けるため、`DZ_FEEDS=<VenueName>` でその取引所に取り込みを絞り込んでください。

### WebSocket は接続するが quote が到着しない

- `instrument` メッセージが常に最初に到着します。リファレンスデータのハンドシェイクが完了すると quote が続きます。データが欠落していると判断する前に、接続後 10〜20 秒待ってください。
- メトリクスの `dz_feed_up{venue}` を確認してください — `0` はホスト上でマルチキャストが沈黙していることを意味します。
- ファイアウォールルールが `doublezero1` インターフェース上のマルチキャスト UDP を許可していることを確認してください。

### `dz_ws_client_lagged_total` が高い

コンシューマーの読み取り速度がブリッジの配信速度より遅くなっています。`WS_BROADCAST_CAPACITY` でブロードキャストバッファを増やすか、メッセージごとの処理時間を短縮するか、専用のリーダースレッドを追加してください。

### コンテナが即座に終了する

- ブリッジには `--network host` と `/dev/net/tun` デバイスが必要です。これらのフラグなしの通常の `docker run` は失敗します。
- インストーラーのワンライナーまたは[セルフホスティング](#上級-セルフホスティング)に記載されている正確な `docker run` コマンドを使用してください。

### GRE トンネルが確立されない