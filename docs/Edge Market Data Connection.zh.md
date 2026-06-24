---
description: 运行 doublezero-edge-connect 将 Solana shred 重新转发到本地 UDP 端口，并通过本地 WebSocket 消费标准化的 Edge 市场数据。
---

# Edge 连接

!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。数据仅供内部使用，不得转播（见第 2(e) 条）。"

`doublezero-edge-connect` 是一个桥接工具，它接入 **DoubleZero Edge 二进制组播**，并在本地以两种数据源的形式重新提供服务：

1. **Solana shred 转发** — 去重（可选签名验证）的 shred 分发到一个或多个本地 UDP 目的地，可直接供验证节点或 RPC 使用。
2. **标准化市场数据** — Edge 交易所数据源经过解码、精度校正，并通过 `ws://host:8081` 上的单一 JSON WebSocket 重新提供服务。

两者运行在同一个容器中，使用相同的一行安装命令。根据您的链上授权启用所需的数据源。

```
                                        ┌─ UDP datagrams ──▶  validator / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binary)             (dedup · decode · normalize)  └─ WebSocket (JSON) ──▶  trading engine
                                                          ws://host:8081
```

---

## 系统要求

- **Linux/amd64** 主机，具有在链上已授权目标环境的公共 IPv4 地址。
- **Docker**（一行安装命令会在缺失时自动安装）。
- **GRE 连接** — 在云服务商处允许 IP 协议 47；在 AWS 上需禁用 ENI 源/目标检查。
- **DoubleZero 访问密钥**：一个 `DZ_` 前缀的 base64 令牌或密钥对文件路径，通过 [DoubleZero 入驻流程](setup.md)获取。

---

## 步骤 1：安装并运行

一条命令即可准备主机并启动桥接容器。它会加入 DoubleZero 网络，并启动您的授权所涵盖的所有数据源 — shred 转发和/或 `:8081` 上的市场数据 WebSocket：

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

脚本执行内容：

1. 检查主机是否为 Linux/amd64，确认 Docker 已安装（缺失时提示安装）。
2. 为 GRE 隧道准备主机内核：加载 `tun`/`ip_gre`，提高 `net.core.rmem_max`，提醒防火墙和云服务商规则。
3. 加载您的访问密钥（如未设置 `DZ_SECRET`，会提示输入一次）。
4. 运行桥接容器（`--network host`、`NET_ADMIN`/`NET_RAW`、`/dev/net/tun`）并执行 `doublezero connect multicast`。

!!! tip "非交互式安装"
    在管道命令前设置 `DZ_SECRET=DZ_…` 即可完全无人值守运行 — 无需任何确认提示。

---

## 步骤 2：配置

所有配置均通过**管道命令前设置的环境变量**完成，没有配置文件。

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### 安装程序变量

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `DZ_SECRET` | *(交互式提示)* | `DZ_` 前缀的 base64 令牌**或**密钥对文件路径。令牌注入容器且不写入磁盘；文件以只读方式挂载。 |
| `DZ_ENV` | 取决于脚本 | `mainnet-beta` \| `testnet` \| `devnet`。 |
| `DZ_IMAGE` | 取决于脚本 | 覆盖容器镜像。 |
| `DZ_NAME` | `doublezero-edge-connect` | 容器名称。 |
| `DZ_FEEDS` | *(全部)* | 以逗号分隔的交易所列表，用于缩小市场数据摄入范围（例如 `VenueA,VenueB`）。不影响 Solana shred 转发。 |
| `DZ_ASSUME_YES` | `0` | 跳过确认提示（例如 Docker 安装提示）。 |
| `DZ_GHCR_TOKEN` | — | **仅限 Devnet** — 具有 `read:packages` 权限的 GHCR 令牌（devnet 镜像为私有）。 |
| `DZ_GHCR_USER` | `malbeclabs` | **仅限 Devnet** — 用于登录的 GHCR 用户名。 |

### 桥接变量

安装程序会将**任何非空的**桥接变量直接传递到容器中。常用变量：

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `DZ_IFACE` | `doublezero1` | 监听的网络接口。 |
| `DZ_RECV_BUF` | — | UDP 接收缓冲区覆盖值（字节）。 |
| `METRICS_BIND` | *(空 / 关闭)* | 启用 Prometheus `/metrics` 端点（例如 `127.0.0.1:9090`）。 |
| `RUST_LOG` | `info` | 日志级别（`debug`、`warn` 等）。 |
| `DZ_SHRED_FORWARD` | — | 转发 shred 的本地 UDP 目的地 — 参见 [Solana Shred 转发](#solana-shred-转发)。 |
| `WS_BIND` | `0.0.0.0:8081` | 市场数据 WebSocket 绑定地址 — 参见[市场数据 WebSocket](#市场数据-websocket)。 |
| `WS_MAX_CLIENTS` | `64` | 最大并发 WebSocket 客户端数。 |
| `WS_INPUT_COINS` | *(空 / 关闭)* | 为列出的交易对启用公共 WebSocket 后备源（例如 `BTC,ETH`）。 |

**示例：**

```bash
# 将 shred 转发到本地验证节点/RPC：
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# 非交互式，testnet：
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# 缩小市场数据到特定交易所，详细日志，非默认 WS 端口：
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# 启用指标和公共 WS 后备源：
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    由于安装程序只转发**非空**值，您无法通过一行安装命令传递空覆盖值（例如 `WS_BIND=""` 以禁用 WebSocket 输出）。此类场景请使用手写的 `docker run` — 参见[自托管](#高级自托管)。

---

## Solana Shred 转发

桥接工具加入 `edge-solana-*` shred 组播组，并将每个数据报分发到一个或多个本地 UDP 目的地 — 直接从 Edge 网络为您的验证节点或 RPC 提供数据。当您的授权中存在这些组播组时，它会在发现时自动激活。

```bash
# 默认（仅去重，转发到本地端口 20000）：
DZ_SHRED_FORWARD=127.0.0.1:20000 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# 带签名验证：
DZ_SHRED_DEDUP_MODE=sigverify \
  DZ_SHRED_RPC_URL=https://api.mainnet-beta.solana.com \
  DZ_SHRED_FORWARD=127.0.0.1:20000 \
  DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | 转发 shred 的目的地（可重复设置）。 |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup`（每个 shred 一份副本）、`sigverify`（+ ed25519 验证）、`none`（所有数据报）。 |
| `DZ_SHRED_RPC_URL` | — | Solana RPC 端点；`sigverify` 模式必需。 |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | 去重窗口大小。 |

详见 [Shred 转发](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md)了解完整管道和注意事项。

---

## 市场数据 WebSocket

打开到 `ws://<host>:8081` 的 WebSocket 连接并读取 JSON 帧。您将接收所有已授权交易所的数据。可通过可选的 `subscribe` 消息将流缩小到特定交易所和交易对。

任何支持 WebSocket + JSON 的引擎只需一个轻量级（约 50–100 行）适配器即可消费数据。二进制组播、每个交易所的双端口拆分以及清单/精度握手都保留在桥接内部；消费者唯一需要对接的接口就是 WebSocket JSON。

### 连接生命周期

每次新连接时，桥接会：

1. **重放当前合约定义** — 每个已知交易对一条 `instrument` 消息 — 确保消费者在收到首个报价前已获得精度信息。
2. **重放每个交易对的最新深度快照**（如果逐笔委托数据源处于活跃状态）。
3. **流式推送** `quote` / `trade` / `midpoint` / `depth` 消息，到达后分发给所有已连接的消费者。

```
connect → instrument (×N) → depth (×M, latest books) → quote → trade → depth → …
```

### 消息类型

每条消息都是一个带有 `type` 字段标签的 JSON 对象：

| `type` | 含义 |
|--------|------|
| `instrument` | 合约/精度定义。 |
| `quote` | 最优买卖更新（完整状态）。 |
| `trade` | 成交记录（最新成交）。 |
| `midpoint` | 衍生中间价。 |
| `depth` | 完整订单簿深度快照。 |
| `status` | 交易所级别的数据源健康状态变化。 |

消费者**必须忽略未知的 `type` 值和未知字段**（前向兼容性）。

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

在连接时发送，定义变更时也会发送。`price_exponent` 和 `qty_exponent` 以十的幂次表示交易所的最小价格变动和最小数量步长。

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
  venue book      wire arrival      post-decode    WS hand-off
```

`0` 是"不可用"的哨兵值 — 将其视为缺失值，而非 1970 年。

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

当交易所的报价组播静默时发出（`state:"down"`），恢复时发出（`state:"ok"`）。用于在 UI 中将交易所置灰。报价推送不受状态限制 — 数据源在下一条报价时自动恢复。

### 订阅

默认情况下您会接收所有数据。发送控制消息以缩小流范围：

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

省略某个字段将匹配任意值（`{"symbol":"SOL"}` = 所有交易所的 SOL）。`venue` 匹配不区分大小写。

**服务器确认：**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

错误返回 `{"channel":"error","error":"<reason>"}`。

### 心跳与活性检测

- 服务器每 20 秒发送一次 **WebSocket Ping**；合规客户端自动回复 Pong。
- 60 秒无活动的客户端将被关闭并清理。
- 应用层保活：`{"method":"ping"}` → `{"channel":"pong"}`。

### 消费者代码骨架

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

### 输入源与 WebSocket 后备机制

Edge 组播数据源始终在线。可选的**公共 WebSocket 后备源**可在 Edge 数据源中断时填补缺口：

```bash
# 为 BTC 和 ETH 启用后备源：
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

两个数据源在共享仲裁器内按 `(venue, symbol, source_ts)` 逐 tick 竞争。在稳态下 Edge 源获胜（亚毫秒 vs. 互联网上的数十毫秒）；当 Edge 出现间隙时，公共副本进行填补。无论某次更新由哪个源送达，WebSocket 输出都是一致的。

---

## 管理容器

```bash
# 查看实时日志
sudo docker logs -f doublezero-edge-connect

# 检查隧道状态
sudo docker exec -it doublezero-edge-connect doublezero status

# 检查设备延迟
sudo docker exec -it doublezero-edge-connect doublezero latency

# 停止并移除
sudo docker stop doublezero-edge-connect && sudo docker rm doublezero-edge-connect
```

!!! note "无 TLS"
    桥接工具面向可信/本地网络。如果对外暴露 WebSocket 端点，请在反向代理处终止 TLS。

---

## 监控（Prometheus 指标）

指标端点**默认关闭**。使用 `METRICS_BIND` 启用：

```bash
METRICS_BIND=127.0.0.1:9090 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

然后抓取：

```bash
curl -s localhost:9090/metrics | grep '^dz_'
```

关键指标：

| 指标 | 追踪内容 |
|------|----------|
| `dz_feed_up{venue}` | 该交易所组播在线时为 `1`，静默时为 `0`。 |
| `dz_datagrams_received_total{venue}` | 每个交易所的摄入量。 |
| `dz_emit_total{venue,kind}` | 去重后按类型广播的消息数。 |
| `dz_quotes_dropped_total{venue}` | 被抑制的过期/重复报价数。 |
| `dz_ws_clients` | 当前已连接的 WebSocket 客户端数。 |
| `dz_ws_messages_sent_total{kind}` | 转发给客户端的消息数。 |
| `dz_ws_client_lagged_total` | 为保护数据源而淘汰慢速客户端的次数。 |

同一绑定地址上还提供 `GET /healthz` 存活探针。

---

## 高级：自托管

容器可在 GHCR 上获取：

| 环境 | 镜像 | 标签 |
|------|------|------|
| Mainnet-beta | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:mainnet-beta` |
| Testnet | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:testnet` |
| Devnet（私有） | `ghcr.io/malbeclabs/doublezero-edge-connect-devnet` | `:latest` |

手动运行（适用于安装程序无法转发的选项，如 `WS_BIND=""`）：

```bash
docker run --rm --network host --cap-add NET_ADMIN --device /dev/net/tun \
  -e DZ_SECRET=DZ_… \
  -e DZ_SHRED_FORWARD=127.0.0.1:20000 \
  -e WS_BIND=0.0.0.0:8081 \
  -e METRICS_BIND=127.0.0.1:9090 \
  ghcr.io/malbeclabs/doublezero-edge-connect:mainnet-beta
```

**从源码构建：**

```bash
git clone https://github.com/malbeclabs/doublezero-edge-connect
cd doublezero-edge-connect
cargo build --release
cargo test

./target/release/doublezero-edge-connect \
  --iface doublezero1 \
  --ws-bind 0.0.0.0:8081
```

建议为突发数据源设置更大的内核接收缓冲区：

```bash
sudo sysctl -w net.core.rmem_max=268435456
```

---

## 限制与背压

| 限制 | 默认值 | 超出时的行为 |
|------|--------|------------|
| 并发客户端数 (`WS_MAX_CLIENTS`) | 64 | 新连接被拒绝。 |
| 每个客户端的订阅数 (`WS_MAX_SUBS`) | 256 | `subscribe` 被拒绝并返回错误。 |
| 每客户端每分钟入站控制消息数 (`WS_MAX_INBOUND_PER_MIN`) | 600 | 客户端被断开连接。 |
| 广播缓冲区 (`WS_BROADCAST_CAPACITY`) | 4096 | 慢速客户端**丢弃最旧的消息**（永远不会阻塞数据源）。 |

由于每条 `quote` 和 `depth` 都是完整状态，消费者在背压下丢失消息后会在下一条消息时自动恢复 — 无需重新同步握手。

---

## 故障排除

### 本地端口未收到 shred

- 确认您的访问已在链上获得 `edge-solana-*` shred 组的授权。
- 验证隧道是否正常：`sudo docker exec -it doublezero-edge-connect doublezero status`
- 检查日志中的加入错误：`sudo docker logs -f doublezero-edge-connect`
- 确认 `DZ_SHRED_FORWARD` 指向一个可达的本地 UDP 目的地。

### 未收到某个交易所的消息

- 验证隧道是否正常：`sudo docker exec -it doublezero-edge-connect doublezero status`
- 检查日志中的加入错误：`sudo docker logs -f doublezero-edge-connect`
- 确认您的访问已在链上获得该交易所的授权。
- 使用 `DZ_FEEDS=<VenueName>` 缩小摄入范围以隔离问题。

### WebSocket 已连接但未收到报价

- `instrument` 消息始终先到达；报价在参考数据握手完成后才会跟进。连接后请等待 10–20 秒再判断数据是否缺失。
- 检查指标中的 `dz_feed_up{venue}` — `0` 表示组播在您的主机上处于静默状态。
- 验证防火墙规则是否允许 `doublezero1` 接口上的组播 UDP。

### `dz_ws_client_lagged_total` 值过高

您的消费者读取速度慢于桥接发布速度。请使用 `WS_BROADCAST_CAPACITY` 增大广播缓冲区，减少每条消息的处理时间，或添加专用读取线程。

### 容器立即退出

- 桥接工具需要 `--network host` 和 `/dev/net/tun` 设备；没有这些标志的普通 `docker run` 会失败。
- 请使用一行安装命令或[自托管](#高级自托管)中展示的完整 `docker run` 命令。

### GRE 隧道无法建立

请参阅[故障排除](troubleshooting.md)，并确保在云服务商处已允许 IP 协议 47。在 AWS 上，需为主机禁用 ENI 源/目标检查。