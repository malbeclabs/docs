---
description: 部署和配置 geoProbe 代理，执行 DoubleZero 地理定位服务背后的延迟测量。
---

# Geoprobe 部署

本指南介绍如何部署和配置 **geoProbe 代理** — 为 DoubleZero [地理定位](../reference/geolocation.md)服务执行延迟测量的服务器。

geoProbe 位于三层测量链中 [DZD](../reference/glossary.md#dzd-doublezero-device) 和目标设备之间。它从父级 DZD 接收签名的 LocationOffset，并通过 [TWAMP](../reference/glossary.md#twamp-two-way-active-measurement-protocol)、签名 TWAMP 或 ICMP echo 测量到已注册目标的 [RTT](../reference/glossary.md#rtt-round-trip-time)。每个 geoProbe 都在链上注册并关联到一个或多个父级 DZD。

有关地理定位架构和测量流程的概述，请参阅[地理定位用户指南](../reference/geolocation.md)。

---

## 前置条件 {#prerequisites}

!!! warning "DZD 遥测代理版本"
    父级 DZD 必须运行 **设备遥测代理版本 0.17.0 或更新版本** 才能支持地理定位服务。早期版本不包含地理定位所需的探针发现、TWAMP ping 和偏移量发布扩展。在部署探针之前请验证代理版本 — 与旧版 DZD 配对的探针将无法接收偏移量。

在部署 geoProbe 之前，请确保您具备以下条件：

- **裸金属 Linux 服务器** — VPS 也可以使用，但不太理想。
- **与 DZD 的网络邻近性** — 探针与其父级 DZD 之间的 RTT 小于 1ms。理想情况下为 0.1ms 或更低。
- 代理进程具备 **`CAP_NET_RAW` 能力**（使用原始套接字进行 ICMP echo 探测所需）
- 用于探针签名身份的 **Ed25519 密钥对**
- **基金会授权** — 探针注册目前由基金会控制；请在操作前与 [DZF](../reference/glossary.md#dzf-doublezero-foundation) 协调
- 运行遥测代理 v0.17.0+ 的 **父级 DZD**

---

## 安装 {#installation}

安装代理守护进程和 doublezero CLI：

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt install doublezero-geoprobe-agent doublezero
```

| 软件包 | 用途 |
|---------|---------|
| `doublezero-geoprobe-agent` | 运行在探针服务器上的代理守护进程，执行延迟测量并生成签名偏移量 |
| `doublezero` | 用于探针注册和管理命令的 CLI 工具 |

---

## 链上注册 {#onchain-registration}

探针注册需要基金会授权。请在操作前与 DZF 协调。

### 步骤 1：注册探针 {#step-1-register-the-probe}

```bash
doublezero geolocation probe create \
  --code <probe-code> \
  --exchange <exchange-pubkey> \
  --public-ip <probe-ip> \
  --signing-pubkey <signing-key-pubkey>
```

| 参数 | 描述 |
|-----------|-------------|
| `--code` | 探针的唯一标识符（例如 `ams-tn-gp1`）— 最多 32 个字符 |
| `--exchange` | 此探针关联的 Serviceability Exchange 账户的公钥 |
| `--public-ip` | 探针监听的公共 IPv4 地址 |
| `--signing-pubkey` | 用于签署偏移量和遥测数据的公钥 |

### 步骤 2：关联父级 DZD {#step-2-link-parent-dzds}

```bash
doublezero geolocation probe add-parent \
  --probe <probe-code> \
  --device <dzd-code>
```

每个父级 DZD 必须是 Serviceability Program 中已激活的设备。DZD 每 60 秒自动发现子探针 — 一旦关联，DZD 将自动开始 TWAMP 测量和偏移量生成。

---

## 运行代理 {#running-the-agent}

```bash
doublezero-geoprobe-agent \
  --env mainnet-beta \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey>
```

### 必需标志 {#required-flags}

| 标志 | 描述 |
|------|-------------|
| `--keypair` | 用于签署偏移量的 Ed25519 密钥对文件路径 |
| `--geoprobe-pubkey` | 探针的[链上](../reference/glossary.md#onchain)公钥（来自 `probe create`） |
| `--env` | 网络环境：`testnet`、`devnet` 或 `mainnet-beta`（设置账本 RPC URL） |

或者，使用 `--ledger-rpc-url` 代替 `--env` 来指定自定义 Solana RPC 端点。

### 可选标志 {#optional-flags}

| 标志 | 默认值 | 描述 |
|------|---------|-------------|
| `--twamp-listen-port` | 8925 | 用于接收来自父级 DZD 的 TWAMP 测量的端口 |
| `--signed-twamp-port` | 8924 | 用于接收来自入站目标的签名 TWAMP 探测的端口 |
| `--udp-listen-port` | 8923 | 用于接收来自 DZD 的 LocationOffset 数据报的端口 |
| `--probe-interval` | 30s | 测量每个目标的频率 |
| `--max-offset-age` | 1h | 缓存的 DZD 偏移量被丢弃前的最大存留时间 |
| `--verify-interval` | 29s | 从账本重新验证目标分配的频率 |
| `--verbose` | false | 启用详细日志记录 |
| `--metrics-enable` | false | 启用 Prometheus 指标端点 |
| `--metrics-addr` | — | Prometheus 指标端点的地址（例如 `0.0.0.0:9090`） |

---

## 端口和防火墙 {#ports-and-firewall}

geoprobe 代理需要开放以下端口：

| 端口 | 协议 | 方向 | 用途 |
|------|----------|-----------|---------|
| 8923/udp | UDP | 来自 DZD 的入站 | 接收签名的 LocationOffset 数据报 |
| 8924/udp | UDP | 来自目标的入站 | 签名 TWAMP 反射器（入站探测流） |
| 8925/udp | UDP | 来自 DZD 的入站 | 来自父级 DZD 的 TWAMP 测量 |
| ICMP | ICMP | 到目标的出站 | 用于 OutboundIcmp 目标的 ICMP echo 请求 |

!!! note
    代理还需要到目标的出站 UDP，用于 TWAMP 探测（出站流）以及向目标传送签名的 LocationOffset 结果。

---

## 监控 {#monitoring}

启用 Prometheus 指标端点以获得运营可见性：

```bash
doublezero-geoprobe-agent \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey> \
  --env testnet \
  --metrics-enable \
  --metrics-addr 0.0.0.0:9090
```

需要监控的关键指标：

- **探针可用性** — 代理进程的运行时间
- **DZD 到探针的延迟** — 应小于 1ms；更高的值表明存在部署位置问题
- **活跃目标数** — 探针当前正在测量的目标数量
- **签名验证失败** — 非零值可能表示密钥配置错误或数据包被篡改
- **偏移量缓存命中率** — 低命中率意味着探针频繁等待新的 DZD 偏移量

有关 DoubleZero 代理中使用的 Prometheus 抓取和告警模式的一般指导，请参阅[运维指南](operations.md#monitoring)。

---

## 探针管理命令 {#probe-management-commands}

`doublezero geolocation` CLI 提供以下子命令用于管理探针：

| 子命令 | 描述 |
|------------|-------------|
| `probe create` | 在链上注册新的 geoProbe |
| `probe get` | 按代码获取特定探针的详细信息 |
| `probe list` | 列出所有已注册的探针 |
| `probe update` | 更新探针配置（IP、端口、签名密钥） |
| `probe delete` | 删除探针（要求没有活跃的目标引用） |
| `probe add-parent` | 将父级 DZD 关联到探针 |
| `probe remove-parent` | 从探针移除父级 DZD |

所有子命令接受 `--env` 或 `--rpc-url` 来选择网络。写操作（`create`、`update`、`delete`、`add-parent`、`remove-parent`）需要 `--keypair`。

??? note "示例：列出探针"

    ```bash
    doublezero geolocation probe list
    ```

    返回所有已注册的探针及其代码、公共 IP、父级 DZD 和当前状态。