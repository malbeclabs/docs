---
description: 运行 doublezero-edge-connect 将 Solana shreds 重新转发至本地 UDP 端口，并通过本地 WebSocket 消费标准化的 Edge 市场数据。
---

# Edge 连接

!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。数据仅供您内部使用，不得重新传输（参见第 2(e) 条）。"

`doublezero-edge-connect` 是一个桥接工具，它加入 **DoubleZero Edge 二进制多播**，并在本地以两种数据源重新提供服务：

1. **Solana shred 转发** — 去重（可选签名验证）的 shreds 扇出到一个或多个本地 UDP 目标，可直接供您的验证器或 RPC 使用。
2. **标准化市场数据** — Edge 交易所数据源经过解码、精度校正后，以单一 JSON WebSocket 在 `ws://host:8081` 上重新提供服务。

两者都从同一个容器运行，使用同一行安装命令。根据您的链上授权启用所需的数据源。

```
                                        ┌─ UDP datagrams ──▶  validator / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binary)             (dedup · decode · normalize)  └─ WebSocket (JSON) ──▶  trading engine
                                                          ws://host:8081
```

---

## 系统要求

- **Linux/amd64** 主机，具有在链上为目标环境授权的公共 IPv4 地址。
- **Docker**（一行命令安装脚本在缺失时会自动安装）。
- **GRE 连通性** — 在您的云服务商处允许 IP 协议 47；在 AWS 上需禁用 ENI 的源/目标检查。
- **DoubleZero 访问密钥**：一个 `DZ_` 前缀的 base64 令牌或密钥对文件路径，从 [DoubleZero 入门引导](setup.md) 流程获取。

---

## 步骤 1：安装并运行

一条命令即可准备主机并启动桥接容器。它会加入 DoubleZero 网络，并启动您的授权所允许的所有数据源 — shred 转发和/或 `:8081` 上的市场数据 WebSocket：

=== "Mainnet-beta"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect | bash
    ```

=== "Testnet"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect-testnet | bash
    ```

=== "Devnet（私有）"

    ```bash
    # 需要具有 read:packages 权限的 GHCR 令牌
    DZ_GHCR_TOKEN=<your-token> curl -fsSL https://get.doublezero.xyz/connect-devnet | bash
    ```

脚本执行的操作：

1. 检查主机是否为 Linux/amd64。
2. 加载您的访问密钥（如未设置 `DZ_SECRET` 则提示输入一次），并**在安装任何内容之前在链上验证其访问通行证** — 这是一个纯主机端检查，通过账本的公共 JSON-RPC 进行。如果通行证绑定的 IP 与主机 IP 不同，当 IP 是通过 `DZ_CLIENT_IP` 显式指定时会中止；当 IP 仅是自动检测到的（NAT 后可能不准确）时会发出警告并继续，将真正的检查留给 `doublezero connect`。
3. 确保 Docker 已安装（提供安装选项），并为 GRE 隧道准备主机内核：加载 `tun`/`ip_gre`，提高 `net.core.rmem_max`，提示防火墙和云服务商规则。
4. 运行桥接容器（`--network host`、`NET_ADMIN`/`NET_RAW`、`/dev/net/tun`）并执行 `doublezero connect multicast`。

!!! tip "非交互式安装"
    在管道命令之前设置 `DZ_SECRET=DZ_…` 即可完全无人值守运行 — 不会有任何提示。

---

## 步骤 2：配置

所有配置均通过**在管道命令之前设置环境变量**完成。没有配置文件。

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### 安装器变量

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `DZ_SECRET` | *(提示输入)* | `DZ_` 前缀的 base64 令牌**或**密钥对文件路径。令牌会注入容器且不会写入磁盘；文件以只读方式绑定挂载。 |
| `DZ_ENV` | 按脚本 | `mainnet-beta` \| `testnet` \| `devnet`。 |
| `DZ_IMAGE` | 按脚本 | 覆盖容器镜像。 |
| `DZ_NAME` | `doublezero-edge-connect` | 容器名称。 |
| `DZ_FEEDS` | *(全部)* | 逗号分隔的交易所名称，用于缩小市场数据摄取范围（例如 `VenueA,VenueB`）。不影响 Solana shred 转发。 |
| `DZ_CLIENT_IP` | *(自动检测)* | 覆盖链上访问通行证预检查使用的公共 IPv4。当自动检测不准确时设置此项（例如在 NAT 后面），以便预检查能确认而非仅发出警告。 |
| `DZ_LEDGER_RPC_URL` | 按环境 | 覆盖预检查使用的 DoubleZero 账本 RPC 端点。 |
| `DZ_ASSUME_YES` | `0` | 跳过确认提示（例如 Docker 安装提示）。 |
| `DZ_GHCR_TOKEN` | — | **仅限 Devnet** — 具有 `read:packages` 权限的 GHCR 令牌（devnet 镜像为私有）。 |
| `DZ_GHCR_USER` | `malbeclabs` | **仅限 Devnet** — 用于登录的 GHCR 用户名。 |

### 桥接变量

安装器会将**任何非空**的桥接变量直接传递到容器。常用变量：

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `DZ_IFACE` | `doublezero1` | 监听的网络接口。 |
| `DZ_RECV_BUF` | `8388608` | UDP 接收缓冲区覆盖值（字节；默认 8 MiB）。 |
| `METRICS_BIND` | *(空 / 关闭)* | 启用 Prometheus `/metrics` 端点（例如 `127.0.0.1:9090`）。 |
| `RUST_LOG` | `warn,doublezero_edge_connect=info` | 日志级别（`debug`、`warn` 等）。 |
| `DZ_SHRED_FORWARD` | — | 转发 shreds 的本地 UDP 目标 — 参见 [Solana Shred 转发](#solana-shred-转发)。 |
| `WS_BIND` | `0.0.0.0:8081` | 市场数据 WebSocket 绑定地址 — 参见 [市场数据 WebSocket](#市场数据-websocket)。 |
| `WS_MAX_CLIENTS` | `64` | 最大并发 WebSocket 客户端数。 |
| `WS_INPUT_COINS` | *(空 / 关闭)* | 为已上线的交易对启用 Hyperliquid 公共 WebSocket 备用源（例如 `BTC,ETH`）— 参见 [输入源与 WebSocket 备用机制](#输入源与-websocket-备用机制)。 |
| `WS_INPUT_URL` | `wss://api.hyperliquid.xyz/ws` | 备用机制使用的 Hyperliquid 公共 WebSocket URL。 |
| `PHOENIX_WS_INPUT_MARKETS` | *(空 / 关闭)* | 为已上线的交易对启用 Phoenix 公共 WebSocket 备用源（仅交易数据）（例如 `SOL,BTC`）。 |
| `PHOENIX_WS_INPUT_URL` | `wss://perp-api.phoenix.trade/v1/ws` | 备用机制使用的 Phoenix 公共 WebSocket URL。 |

**示例：**

```bash
# 将 shreds 转发到本地验证器/RPC：
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# 非交互式，testnet：
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# 缩小市场数据至特定交易所，启用详细日志，使用非默认 WS 端口：
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# 启用指标和公共 WS 备用源：
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    安装器仅转发**非空**值，有一个例外：`WS_BIND` 即使设置为空也会被转发，因此 `WS_BIND=""` **确实会**通过一行命令禁用 WebSocket 输出。对于任何其他变量，空值覆盖无法通过管道传递 — 请使用手动编写的 `docker run`（参见 [自托管](#高级自托管)）。

---

## Solana Shred 转发

桥接工具加入 `edge-solana-*` shred 多播组，并将每个数据报扇出到一个或多个本地 UDP 目标 — 使您的验证器或 RPC 直接从 Edge 网络获取数据。当这些组存在于您的授权中时，它会在发现时自动激活。

```bash
# 默认（仅去重，转发到本地端口 20000）：
DZ_SHRED_FORWARD=127.0.0.1:20000 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# 启用签名验证：
DZ_SHRED_DEDUP_MODE=sigverify \
  DZ_SHRED_RPC_URL=https://api.mainnet-beta.solana.com \
  DZ_SHRED_FORWARD=127.0.0.1:20000 \
  DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | 转发 shreds 的目标地址（可重复设置）。 |
| `DZ_SHRED_DISABLE` | `0` | 主开关关闭（`--shred-forward-disable`）。无论您的授权允许什么都保持转发器关闭 — 当没有本地消费者在监听时设置此项，以避免将 shred 全量数据转发到无处而浪费 CPU。 |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup`（每个 shred 一份）、`sigverify`（+ ed25519 验证）、`none`（所有数据报）。 |
| `DZ_SHRED_RPC_URL` | — | Solana RPC 端点；`sigverify` 模式必需。 |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | 去重窗口大小。 |

参见 [Shred 转发](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md) 了解完整管道和注意事项。

---

## 市场数据 WebSocket

打开一个连接到 `ws://<host>:8081` 的 WebSocket 并读取 JSON 帧。您会收到所有已授权交易所的数据。可选的 `subscribe` 消息可将数据流缩小到特定交易所和交易对。

任何支持 WebSocket + JSON 的引擎都可以通过一个简单的（约 50–100 行）适配器来消费数据。二进制多播、每个交易所的双端口分离以及清单/精度握手都封装在桥接内部；消费者需要编码对接的唯一契约就是 WebSocket JSON。

!!! note
    WebSocket 输出仅在您的授权中至少有一个市场数据源处于活跃状态时才会启动 — 仅有 shreds 的主机不提供 WebSocket。激活由链上订阅协调器驱动，每 30 秒刷新一次（`--subscription-refresh-secs`）；`--subscription-gating-disable` 可选择退出此门控。

### 连接生命周期

每个新连接建立时，桥接会：

1. **重放当前的品种定义** — 每个已知交易对一条 `instrument` 消息 — 使消费者在收到第一个报价之前就具备精度信息。
2. **重放每个交易对的最新深度快照**（如果逐笔委托行情源处于活跃状态）。
3. **流式推送** `quote` / `trade` / `midpoint` / `depth` 消息，扇出到所有已连接的消费者。

```
connect → instrument (×N) → depth (×M, latest books) → quote → trade → depth → …
```

### 消息类型

每条消息都是一个通过 `type` 字段标识的 JSON 对象：

| `type` | 含义 |
|--------|------|
| `instrument` | 品种/精度定义。 |
| `quote` | 最优买卖价更新（完整状态）。 |
| `trade` | 成交记录（最近成交）。 |
| `midpoint` | 推导的中间价。 |
| `depth` | 完整订单簿深度快照。 |
| `status` | 交易所级别的数据源健康状态转换。 |

消费者**必须忽略未知的 `type` 值和未知字段**（前向兼容性）。

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

在连接时发送，以及定义变更时发送。`price_exponent` 和 `qty_exponent` 以十的幂次表示交易所的最小价格变动和最小数量步长。

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

每条 `quote` 都是**完整状态** — 丢失的消息会在下一条报价时自动恢复，无需重新同步。四个时间戳分解了端到端延迟：

```
source_ts_ns → kernel_rx_ts_ns → recv_ts_ns → ws_send_ts_ns → (consumer recv)
  交易所订单簿    网络到达           解码后        WS 移交
```

`0` 是"不可用"的哨兵值 — 将其视为缺失，而非 1970 年。

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

`aggressor_side` 为 `"buy"`、`"sell"` 或 `"unknown"`。成交记录是时间点事件，重新连接时不会重放。

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

`bids` 按价格从高到低排序；`asks` 按价格从低到高排序。每条 `depth` 都是**完整快照** — 直接替换，不要合并。

#### `status`

```json
{"type":"status","venue":"ExampleVenue","state":"down","stale_ms":30000,"ts_ns":...}
```

当交易所的报价多播静默时（`state:"down"`）或恢复时（`state:"ok"`）在边缘端发出。可用于在您的 UI 中将该交易所置灰。报价推送不受状态门控 — 数据源会在下一条报价时自动恢复。

### 订阅

默认情况下您会收到所有数据。发送控制消息以缩小数据流：

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

省略某个字段表示匹配任何值（`{"symbol":"SOL"}` = 所有交易所上的 SOL）。`venue` 匹配不区分大小写。

**服务器确认：**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

错误返回 `{"channel":"error","error":"<reason>"}`。

### 心跳和活跃性检测

- 服务器每 20 秒发送一个 **WebSocket Ping**；合规的客户端会自动回复 Pong。
- 60 秒内无活动的客户端会被关闭并回收。
- 应用层保活：`{"method":"ping"}` → `{"channel":"pong"}`。

### 消费者骨架代码

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
    # 未知类型：静默忽略（前向兼容性）

ws = websocket.WebSocketApp("ws://localhost:8081", on_message=on_message)
ws.run_forever()
```

### 输入源与 WebSocket 备用机制

Edge 多播数据源始终在线。可选的**公共 WebSocket 备用源**可在 Edge 数据源停滞时填补缺口。目前提供两种备用源，默认均关闭，可按交易所独立启用：

| 备用源 | 启用方式 | 覆盖范围 | 默认 URL |
|--------|----------|----------|----------|
| **Hyperliquid** | `WS_INPUT_COINS`（例如 `BTC,ETH`） | 报价 + 成交 | `wss://api.hyperliquid.xyz/ws`（`WS_INPUT_URL`） |
| **Phoenix** | `PHOENIX_WS_INPUT_MARKETS`（交易对代码，例如 `SOL,BTC`） | **仅成交** | `wss://perp-api.phoenix.trade/v1/ws`（`PHOENIX_WS_INPUT_URL`） |

```bash
# 为 BTC 和 ETH 启用 Hyperliquid 备用源：
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# 为 SOL 启用 Phoenix 成交备用源：
PHOENIX_WS_INPUT_MARKETS=SOL DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

对于每个 `(venue, symbol, source_ts)` tick，Edge 和公共源在共享仲裁器中竞争。在稳定状态下 Edge 源胜出（亚毫秒级 vs. 互联网上的数十毫秒）；当 Edge 出现间隙时，公共副本会填补。无论哪个源提供了给定更新，WebSocket 输出都是相同的。（Phoenix 备用源仅覆盖成交 — Edge 仍然是 Phoenix 报价的唯一来源。）

---

## 管理容器

```bash
# 实时查看日志
sudo docker logs -f doublezero-edge-connect

# 检查隧道状态
sudo docker exec -it doublezero-edge-connect doublezero status

# 检查设备延迟
sudo docker exec -it doublezero-edge-connect doublezero latency

# 停止并移除
sudo docker stop doublezero-edge-connect && sudo docker rm doublezero-edge-connect
```

!!! note "无 TLS"
    桥接工具面向可信/本地网络。如果您要将 WebSocket 端点暴露到外部，请在反向代理处终止 TLS。

---

## 监控（Prometheus 指标）

指标端点**默认关闭**。通过 `METRICS_BIND` 启用：

```bash
METRICS_BIND=127.0.0.1:9090 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

然后抓取：

```bash
curl -s localhost:9090/metrics | grep '^dz_'
```

关键指标：

| 指标 | 跟踪内容 |
|------|----------|
| `dz_feed_up{venue}` | 该交易所的多播在线时为 `1`，静默时为 `0`。 |
| `dz_datagrams_received_total{venue}` | 每个交易所的摄取量。 |
| `dz_emit_total{venue,kind}` | 去重后广播的消息数，按类型分类。 |
| `dz_quotes_admitted_total{venue,publisher}` | 仲裁器接受的报价数，归因于获胜来源。`publisher="public"` 上升表示备用源正在填补 Edge 间隙（稳定状态下为 `publisher="edge"`）。 |
| `dz_quotes_dropped_total{venue}` | 被抑制的过时/重复报价数。 |
| `dz_ws_clients` | 当前连接的 WebSocket 客户端数。 |
| `dz_ws_messages_sent_total{kind}` | 转发给客户端的消息数。 |
| `dz_ws_client_lagged_total` | 为保护数据源而断开慢速客户端的次数。 |

同一绑定地址上还提供了 `GET /healthz` 活跃性探针。

---

## 高级：自托管

容器可在 GHCR 上获取：

| 环境 | 镜像 | 标签 |
|------|------|------|
| Mainnet-beta | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:mainnet-beta` |
| Testnet | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:testnet` |
| Devnet（私有） | `ghcr.io/malbeclabs/doublezero-edge-connect-devnet` | `:latest` |

手动运行（适用于安装器无法转发的选项，例如 `WS_BIND=""`）：

```bash
docker run --rm --network host --cap-add NET_ADMIN --device /dev/net/tun \
  -e DZ_SECRET=DZ_… \
  -e DZ_SHRED_FORWARD=127.0.0.1:20000 \
  -e WS_BIND=0.0.0.0:8081 \
  -e METRICS_BIND=127.0.0.1:9090 \
  ghcr.io/malbeclabs/doublezero-edge-connect:mainnet-beta
```

**从源代码构建：**

```bash
git clone https://github.com/malbeclabs/doublezero-edge-connect
cd doublezero-edge-connect
cargo build --release
cargo test

./target/release/doublezero-edge-connect \
  --iface doublezero1 \
  --ws-bind 0.0.0.0:8081
```

对于突发性数据源，建议增大内核接收缓冲区：

```bash
sudo sysctl -w net.core.rmem_max=268435456
```

---

## 限制与背压

| 限制 | 默认值 | 超出时的行为 |
|------|--------|------------|
| 并发客户端数（`WS_MAX_CLIENTS`） | 64 | 新连接被拒绝。 |
| 每客户端订阅数（`WS_MAX_SUBS`） | 256 | `subscribe` 请求被拒绝并返回错误。 |
| 每客户端每分钟入站控制消息数（`WS_MAX_INBOUND_PER_MIN`） | 600 | 客户端被断开连接。 |
| 广播缓冲区（`WS_BROADCAST_CAPACITY`） | 4096 | 慢速客户端**丢弃最旧的消息**（绝不会阻塞数据源）。 |

由于每条 `quote` 和 `depth` 都是完整状态，在背压下丢失消息的消费者会在下一条消息时自动恢复 — 无需重新同步握手。

---

## 故障排查

### 本地端口没有收到 shreds

- 确认您的访问已在链上为 `edge-solana-*` shred 组授权。
- 验证隧道是否建立：`sudo docker exec -it doublezero-edge-connect doublezero status`
- 检查日志中的加入错误：`sudo docker logs -f doublezero-edge-connect`
- 确认 `DZ_SHRED_FORWARD` 指向可达的本地 UDP 目标。

### 没有收到某个交易所的消息

- 验证隧道