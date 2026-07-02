---
description: doublezero-edge-connect を実行して Solana シュレッドをローカル UDP ポートに再転送し、正規化された Edge マーケットデータをローカル WebSocket 経由で受信します。
---

# Edge 接続

!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます。データは内部利用目的に限り、再送信は禁止されています（セクション 2(e) を参照）。"

`doublezero-edge-connect` は **DoubleZero Edge バイナリマルチキャスト** に参加し、ローカルで以下の 2 つのフィードとして再配信するブリッジです：

1. **Solana シュレッド転送** — 重複排除（オプションで署名検証）されたシュレッドを 1 つ以上のローカル UDP 宛先にファンアウトし、バリデーターや RPC に直接供給します。
2. **正規化マーケットデータ** — Edge のベニューフィードをデコード・精度補正し、単一の JSON WebSocket として `ws://host:8081` で再配信します。

どちらも同じコンテナ、同じワンライナーインストールで実行されます。オンチェーン認可で許可されたフィードを有効にしてください。

```
                                        ┌─ UDP datagrams ──▶  validator / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binary)             (dedup · decode · normalize)  └─ WebSocket (JSON) ──▶  trading engine
                                                          ws://host:8081
```

---

## 要件

- 対象環境でオンチェーン認可されたパブリック IPv4 アドレスを持つ **Linux/amd64** ホスト。
- **Docker**（ワンライナーが未インストールの場合は自動でインストールします）。
- **GRE 接続** — クラウドプロバイダーで IP プロトコル 47 を許可してください。AWS の場合は ENI のソース/デストチェックを無効にしてください。
- **DoubleZero アクセスシークレット**：`DZ_` プレフィックス付き base64 トークン、またはキーペアファイルへのパス。[DoubleZero オンボーディング](setup.md)プロセスから取得します。

---

## ステップ 1：インストールと実行

1 つのコマンドでホストの準備とブリッジコンテナの起動を行います。DoubleZero ネットワークに参加し、認可で許可されたすべてのフィード（シュレッド転送や `:8081` のマーケットデータ WebSocket）を開始します：

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

1. ホストが Linux/amd64 であることを確認します。
2. アクセスシークレットを読み込み（`DZ_SECRET` が未設定の場合は一度だけプロンプト表示）、**何かをインストールする前にオンチェーンでアクセスパスを検証します** — レジャーの公開 JSON-RPC に対する純粋なホスト側チェックです。パスがホストと異なる IP にバインドされている場合、（`DZ_CLIENT_IP` で IP が明示的に指定された場合は）中断し、（IP が自動検出のみの場合は NAT 背後で誤検出の可能性があるため）警告して続行します。実際のチェックは `doublezero connect` が行います。
3. Docker が存在することを確認し（インストールを提案）、GRE トンネル用にホストカーネルを準備します：`tun`/`ip_gre` の読み込み、`net.core.rmem_max` の引き上げ、ファイアウォールやクラウドプロバイダーのルールに関する警告を行います。
4. ブリッジコンテナを実行し（`--network host`、`NET_ADMIN`/`NET_RAW`、`/dev/net/tun`）、`doublezero connect multicast` を実行します。

!!! tip "非対話型インストール"
    パイプの前に `DZ_SECRET=DZ_…` を設定すると、プロンプトなしで完全に自動実行されます。

---

## ステップ 2：設定

すべての設定は**パイプの前に設定する環境変数**で行います。設定ファイルはありません。

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### インストーラー変数

| 変数 | デフォルト | 用途 |
|------|-----------|------|
| `DZ_SECRET` | *(プロンプト表示)* | `DZ_` プレフィックス付き base64 トークン **または** キーペアファイルへのパス。トークンはコンテナに注入されディスクには書き込まれません。ファイルは読み取り専用でバインドマウントされます。 |
| `DZ_ENV` | スクリプトごと | `mainnet-beta` \| `testnet` \| `devnet`。 |
| `DZ_IMAGE` | スクリプトごと | コンテナイメージのオーバーライド。 |
| `DZ_NAME` | `doublezero-edge-connect` | コンテナ名。 |
| `DZ_FEEDS` | *(すべて)* | マーケットデータ取り込みを絞り込むカンマ区切りのベニュー（例：`VenueA,VenueB`）。Solana シュレッド転送には影響しません。 |
| `DZ_CLIENT_IP` | *(自動検出)* | オンチェーンアクセスパスの事前チェックで使用するパブリック IPv4 のオーバーライド。自動検出が誤っている場合（例：NAT 背後）に設定すると、事前チェックが警告だけでなく確認できるようになります。 |
| `DZ_LEDGER_RPC_URL` | 環境ごと | 事前チェックで使用する DoubleZero レジャー RPC エンドポイントのオーバーライド。 |
| `DZ_ASSUME_YES` | `0` | 確認プロンプトをスキップします（例：Docker インストールプロンプト）。 |
| `DZ_GHCR_TOKEN` | — | **Devnet のみ** — `read:packages` 権限を持つ GHCR トークン（devnet イメージはプライベートです）。 |
| `DZ_GHCR_USER` | `malbeclabs` | **Devnet のみ** — ログイン用の GHCR ユーザー名。 |

### ブリッジ変数

インストーラーは **空でない** ブリッジ変数をすべてそのままコンテナに転送します。主なものは以下の通りです：

| 変数 | デフォルト | 用途 |
|------|-----------|------|
| `DZ_IFACE` | `doublezero1` | リッスンするネットワークインターフェース。 |
| `DZ_RECV_BUF` | `8388608` | UDP 受信バッファのオーバーライド（バイト単位、デフォルト 8 MiB）。 |
| `METRICS_BIND` | *(空 / 無効)* | Prometheus `/metrics` エンドポイントの有効化（例：`127.0.0.1:9090`）。 |
| `RUST_LOG` | `warn,doublezero_edge_connect=info` | ログレベル（`debug`、`warn` など）。 |
| `DZ_SHRED_FORWARD` | — | 転送シュレッドのローカル UDP 宛先 — [Solana シュレッド転送](#solana-シュレッド転送)を参照。 |
| `WS_BIND` | `0.0.0.0:8081` | マーケットデータ WebSocket のバインドアドレス — [マーケットデータ WebSocket](#マーケットデータ-websocket)を参照。 |
| `WS_MAX_CLIENTS` | `64` | 同時接続 WebSocket クライアントの最大数。 |
| `WS_INPUT_COINS` | *(空 / 無効)* | 上場シンボルに対する Hyperliquid パブリック WebSocket バックストップの有効化（例：`BTC,ETH`） — [入力ソース](#入力ソースと-websocket-バックストップ)を参照。 |
| `WS_INPUT_URL` | `wss://api.hyperliquid.xyz/ws` | バックストップ用の Hyperliquid パブリック WebSocket URL。 |
| `PHOENIX_WS_INPUT_MARKETS` | *(空 / 無効)* | 上場ティッカーに対する Phoenix パブリック WebSocket バックストップ（トレードのみ）の有効化（例：`SOL,BTC`）。 |
| `PHOENIX_WS_INPUT_URL` | `wss://perp-api.phoenix.trade/v1/ws` | バックストップ用の Phoenix パブリック WebSocket URL。 |

**例：**

```bash
# ローカルバリデーター/RPC にシュレッドを転送：
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# 非対話型、テストネット：
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# 特定のベニューに絞り込み、詳細ログ、デフォルト以外の WS ポート：
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# メトリクスとパブリック WS バックストップを有効化：
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    インストーラーは**空でない**値のみを転送しますが、1 つだけ例外があります：`WS_BIND` は空に設定した場合でも転送されるため、`WS_BIND=""` でワンライナーを通じて WebSocket シンクを**無効化できます**。その他の変数については、空のオーバーライドはパイプを通じて渡せません — その場合は手動で `docker run` を記述してください（[セルフホスティング](#上級-セルフホスティング)を参照）。

---

## Solana シュレッド転送

ブリッジは `edge-solana-*` シュレッドマルチキャストグループに参加し、各データグラムを 1 つ以上のローカル UDP 宛先にファンアウトします — Edge ネットワークから直接バリデーターや RPC にフィードします。認可にこれらのグループが含まれている場合、検出時に自動的にアクティベートされます。

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
|------|-----------|------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | 転送シュレッドの宛先（繰り返し指定可能）。 |
| `DZ_SHRED_DISABLE` | `0` | マスターオプトアウト（`--shred-forward-disable`）。認可で許可されていても転送を無効にします — ローカルコンシューマーがリッスンしていない場合に設定して、シュレッドファイアホースを宛先なしに転送する CPU 消費を防ぎます。 |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup`（シュレッドごとに 1 コピー）、`sigverify`（+ ed25519 検証）、`none`（全データグラム）。 |
| `DZ_SHRED_RPC_URL` | — | Solana RPC エンドポイント。`sigverify` モードで必要です。 |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | 重複排除ウィンドウのサイズ。 |

完全なパイプラインと注意事項については[シュレッド転送](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md)を参照してください。

---

## マーケットデータ WebSocket

`ws://<host>:8081` に WebSocket 接続を開き、JSON フレームを読み取ります。認可されているすべてのベニューを受信します。オプションの `subscribe` メッセージでストリームを特定のベニューやシンボルに絞り込めます。

WebSocket + JSON に対応するエンジンであれば、薄い（約 50〜100 行の）アダプターで利用できます。バイナリマルチキャスト、ベニューごとの 2 ポート分割、マニフェスト/精度ハンドシェイクはすべてブリッジ内部に閉じており、コンシューマーがコーディングする唯一のコントラクトは WebSocket JSON です。

!!! note
    WebSocket シンクは、認可に対して少なくとも 1 つのマーケットデータフィードがアクティブな場合にのみ起動します — シュレッドのみのホストでは WebSocket は提供されません。アクティベーションはオンチェーンサブスクリプションリコンサイラーによって駆動され、30 秒ごとに更新されます（`--subscription-refresh-secs`）。`--subscription-gating-disable` でゲーティングをオプトアウトできます。

### 接続ライフサイクル

新しい接続ごとにブリッジは以下を実行します：

1. **現在のインストゥルメント定義をリプレイ** — 既知のシンボルごとに 1 つの `instrument` メッセージ — コンシューマーが最初のクオートの前に精度情報を取得できるようにします。
2. **シンボルごとの最新デプススナップショットをリプレイ**（Market-by-Order フィードがアクティブな場合）。
3. `quote` / `trade` / `midpoint` / `depth` メッセージが到着次第**ストリーミング**し、接続されたすべてのコンシューマーにファンアウトします。

```
connect → instrument (×N) → depth (×M, latest books) → quote → trade → depth → …
```

### メッセージタイプ

すべてのメッセージは `type` フィールドでタグ付けされた JSON オブジェクトです：

| `type` | 意味 |
|--------|------|
| `instrument` | インストゥルメント/精度の定義。 |
| `quote` | ベストビッド・オファーの更新（完全な状態）。 |
| `trade` | 約定情報（直近の取引）。 |
| `midpoint` | 派生ミッド価格。 |
| `depth` | フルオーダーブックのデプススナップショット。 |
| `status` | ベニューレベルのフィードヘルス遷移。 |

コンシューマーは**未知の `type` 値および未知のフィールドを無視しなければなりません**（前方互換性）。

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

接続時および定義が変更されたときに送信されます。`price_exponent` と `qty_exponent` はベニューのティックサイズとサイズステップを 10 のべき乗で表します。

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

すべての `quote` は**完全な状態**です — メッセージをドロップしても次のクオートで自己回復するため、再同期は不要です。4 つのタイムスタンプでエンドツーエンドのレイテンシを分解できます：

```
source_ts_ns → kernel_rx_ts_ns → recv_ts_ns → ws_send_ts_ns → (consumer recv)
  venue book      wire arrival      post-decode    WS hand-off
```

`0` は「利用不可」を示すセンチネル値です — 1970 年ではなく、欠損として扱ってください。

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

`aggressor_side` は `"buy"`、`"sell"`、または `"unknown"` です。トレードはポイントインタイムのイベントであり、再接続時にリプレイされません。

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

`bids` は価格の高い順、`asks` は価格の低い順にソートされています。各 `depth` は**完全なスナップショット**です — マージではなく置換してください。

#### `status`

```json
{"type":"status","venue":"ExampleVenue","state":"down","stale_ms":30000,"ts_ns":...}
```

ベニューのクオートマルチキャストが無音になった場合（`state:"down"`）または回復した場合（`state:"ok"`）にエッジで発行されます。UI でベニューをグレーアウトするために使用してください。クオート配信はステータスでゲートされません — フィードは次のクオートで自己回復します。

### サブスクリプション

デフォルトではすべてを受信します。ストリームを絞り込むにはコントロールメッセージを送信してください：

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

フィールドを省略すると任意の値にマッチします（`{"symbol":"SOL"}` = すべてのベニューの SOL）。`venue` は大文字小文字を区別せずにマッチングされます。

**サーバー確認応答：**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

エラーの場合は `{"channel":"error","error":"<reason>"}` が返されます。

### ハートビートとライブネス

- サーバーは 20 秒ごとに **WebSocket Ping** を送信します。準拠クライアントは自動的に Pong を返します。
- 60 秒間無通信のクライアントは切断され、回収されます。
- アプリケーションレベルのキープアライブ：`{"method":"ping"}` → `{"channel":"pong"}`。

### コンシューマースケルトン

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

Edge マルチキャストフィードは常時稼働です。オプションの**パブリック WebSocket バックストップ**で、Edge フィードが停止した際のギャップを埋めることができます。2 つのバックストップが利用可能で、それぞれデフォルトでは無効、ベニューごとに独立して有効化されます：

| バックストップ | 有効化方法 | カバー範囲 | デフォルト URL |
|---------------|-----------|-----------|---------------|
| **Hyperliquid** | `WS_INPUT_COINS`（例：`BTC,ETH`） | クオート + トレード | `wss://api.hyperliquid.xyz/ws`（`WS_INPUT_URL`） |
| **Phoenix** | `PHOENIX_WS_INPUT_MARKETS`（ティッカー、例：`SOL,BTC`） | **トレードのみ** | `wss://perp-api.phoenix.trade/v1/ws`（`PHOENIX_WS_INPUT_URL`） |

```bash
# Hyperliquid バックストップを BTC と ETH で有効化：
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# Phoenix トレードバックストップを SOL で有効化：
PHOENIX_WS_INPUT_MARKETS=SOL DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

各 `(venue, symbol, source_ts)` ティックに対して、Edge とパブリックソースが共有アービターの中で競合します。定常状態では Edge ソースが勝ちます（サブミリ秒 vs. インターネット経由の数十ミリ秒）。Edge にギャップが生じた場合、パブリックコピーが補完します。WebSocket の出力は、どのソースが更新を配信したかに関係なく同一です。（Phoenix バックストップはトレードのみをカバーします — Phoenix のクオートについては Edge が唯一のソースのままです。）

---

## コンテナの管理

```bash
# ログをストリーミング
sudo docker logs -f doublezero-edge-connect

# トンネルの状態を確認
sudo docker exec -it doublezero-edge-connect doublezero status

# デバイスレイテンシを確認
sudo docker exec -it doublezero-edge-connect doublezero latency

# 停止と削除
sudo docker stop doublezero-edge-connect && sudo docker rm doublezero-edge-connect
```

!!! note "TLS なし"
    ブリッジは信頼された / ローカルネットワークを対象としています。WebSocket エンドポイントを外部に公開する場合は、リバースプロキシで TLS を終端してください。

---

## 監視（Prometheus メトリクス）

メトリクスエンドポイントは**デフォルトで無効**です。`METRICS_BIND` で有効化してください：

```bash
METRICS_BIND=127.0.0.1:9090 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

スクレイピング：

```bash
curl -s localhost:9090/metrics | grep '^dz_'
```

主要メトリクス：

| メトリクス | 追跡内容 |
|-----------|---------|
| `dz_feed_up{venue}` | そのベニューのマルチキャストがライブの間は `1`、無音の間は `0`。 |
| `dz_datagrams_received_total{venue}` | ベニューごとの取り込みボリューム。 |
| `dz_emit_total{venue,kind}` | 重複排除後にブロードキャストされたメッセージ（タイプ別）。 |
| `dz_quotes_admitted_total{venue,publisher}` | アービターによって採用されたクオート（勝利ソース別に帰属）。`publisher="public"` の上昇は、バックストップが Edge のギャップを埋めていることを意味します（定常状態では `publisher="edge"`）。 |
| `dz_quotes_dropped_total{venue}` | 抑制された古い/重複クオート。 |
| `dz_ws_clients` | 現在接続中の WebSocket クライアント数。 |
| `dz_ws_messages_sent_total{kind}` | クライアントに転送されたメッセージ。 |
| `dz_ws_client_lagged_total` | フィードを保護するために低速クライアントが切断された回数。 |

同じバインドアドレスで `GET /healthz` ライブネスプローブも提供されます。

---

## 上級：セルフホスティング

コンテナは GHCR で利用可能です：

| 環境 | イメージ | タグ |
|------|---------|-----|
| Mainnet-beta | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:mainnet-beta` |
| Testnet | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:testnet` |
| Devnet (プライベート) | `ghcr.io/malbeclabs/doublezero-edge-connect-devnet` | `:latest` |

手動で実行します（インストーラーが転送できないオプション、例えば `WS_BIND=""` が必要な場合）：

```bash
docker run --rm --network host --cap-add NET_ADMIN --