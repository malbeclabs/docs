---
description: 逐步指南：配置 DoubleZero 设备 (DZD) 并在链上注册其接口和角色。
---

# 设备配置指南

本指南将带您从头到尾完成 DoubleZero 设备 (DZD) 的配置。每个阶段对应[上线清单](contribute-overview.md#onboarding-checklist)中的相应步骤。

---

## 整体架构概览

本指南将引导您在链上注册基础设施，以便 DoubleZero 网络能够通过您的设备路由流量。设备注册得越完整，它对网络的价值就越大。完整的链上设备表示能够实现更好的故障排查、容量规划，并让控制器做出更明智的决策。随着时间推移，目标是让控制器承担更多的配置责任。

### 核心概念

**接口**

DZD 上的接口有多种形式：以太网端口、端口通道（由多个以太网端口组成的 LAG）和环回接口。每个在网络中发挥作用的接口都需要在链上注册，并设置适当的标志，以便协议了解其功能。

以太网端口和端口通道可以承担以下角色：

| 标志 | 含义 |
|------|------|
| `--interface-dia dia` | 将接口标记为直接互联网接入上行链路 |
| `--interface-cyoa <subtype>` | 声明用户如何通过该接口建立 GRE 隧道（例如通过公共互联网、通过私有对等链路） |
| `--user-tunnel-endpoint true` | 该接口承载用户终止 GRE 隧道所用的公共 IP |

用于 WAN 或 DZX 链路的接口不需要特定标志，只需注册其带宽，然后在创建链路时引用即可。

环回接口有多种用途：

| 环回接口 | 含义 |
|----------|------|
| **Loopback100 / 101** | 承载用户终止 GRE 隧道所用的公共 IP。使用 `--user-tunnel-endpoint true` 注册。 |
| **Loopback255** (`vpnv4`) | 注册后控制器可以分配用于 BGP 路由器 ID、VPN-IPv4 对等（单播）、IS-IS 身份和段路由的 IP |
| **Loopback256** (`ipv4`) | 注册后控制器可以分配用于 IPv4 BGP 对等（组播）和 MSDP 会话的 IP |

**链路**

链路与接口分开注册，且接口必须先在链上存在，链路才能引用它们。创建 WAN 或 DZX 链路时，您需要指定一个已注册的接口作为链路的物理端点。并非所有接口都与链路关联：DIA、CYOA 和环回接口不连接到链路。

| 术语 | 含义 |
|------|------|
| **WAN 链路** | 您自己的两个 DZD 之间的链路 |
| **DZX 链路** | 您的 DZD 与另一个贡献者的 DZD 之间的链路 |

### 架构概览

```mermaid
flowchart TB
    subgraph Onchain
        SC[DoubleZero 账本]
    end

    subgraph Your Infrastructure
        MGMT[管理服务器<br/>DoubleZero CLI]
        subgraph DZD[您的 DZD]
            CYOA["DIA · CYOA 接口<br/>(面向用户的上行链路)"]
            WAN_INTF["WAN 链路接口"]
            DZX_INTF["DZX 链路接口"]
            LO100["Loopback100/101<br/>(用户隧道端点)"]
        end
        DZD2[您的另一个 DZD]
    end

    subgraph Other Contributor
        OtherDZD[对方的 DZD]
    end

    USERS["用户"]

    MGMT -.->|注册设备、<br/>链路、接口| SC
    WAN_INTF ---|WAN 链路| DZD2
    DZX_INTF ---|DZX 链路| OtherDZD
    USERS -.|GRE 隧道|.-> CYOA
    CYOA ---|路由至| LO100
```

---

## 阶段 1：前提条件

在配置设备之前，您需要先完成物理硬件安装并分配一些 IP 地址。

### 准备事项

| 要求 | 原因 |
|------|------|
| **DZD 硬件** | Arista 7280CR3A 交换机（参见[硬件规格](contribute.md#hardware-requirements)） |
| **机柜空间** | 每个 DZD 需要 1U，确保良好的气流。参见[机柜与电源](contribute.md#rack-power-requirements) |
| **电源** | 两路独立供电，每路都能独立承担全部负载。参见[机柜与电源](contribute.md#rack-power-requirements) |
| **管理访问** | 通过 SSH/控制台访问来配置交换机 |
| **互联网连接** | 用于发布指标数据和从控制器获取配置 |
| **公共 IPv4 地址块** | DZ 前缀池至少需要 /29（见下文） |

### 安装 DoubleZero CLI

DoubleZero CLI (`doublezero`) 在整个配置过程中用于注册设备、创建链路和管理您的贡献。它应安装在**管理服务器或虚拟机**上——而不是 DZD 交换机上。交换机只运行配置代理和遥测代理（在[阶段 4](#phase-4-link-establishment-agent-installation) 中安装）。

**Ubuntu / Debian：**
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

**Rocky Linux / RHEL：**
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

验证守护进程正在运行：
```bash
sudo systemctl status doublezerod
```

### 了解您的 DZ 前缀

DZ 前缀是 DoubleZero 协议用于 IP 分配管理的一组公共 IP 地址。

```mermaid
flowchart LR
    subgraph "您的 /29 地址块（8 个 IP）"
        IP1["第一个 IP<br/>为您的设备<br/>预留"]
        IP2["IP 2"]
        IP3["IP 3"]
        IP4["..."]
        IP8["IP 8"]
    end

    IP1 -->|分配给| LO[Loopback100<br/>在您的 DZD 上]
    IP2 -->|分配给| U1[用户 1]
    IP3 -->|分配给| U2[用户 2]
```

**DZ 前缀的使用方式：**

- **第一个 IP**：为您的设备预留（分配给 Loopback100 接口）
- **剩余 IP**：分配给连接到您 DZD 的特定用户类型：
    - `IBRLWithAllocatedIP` 用户
    - `EdgeFiltering` 用户（未来用例）
- **IBRL 用户**：不消耗此池中的地址（他们使用自己的公共 IP）

!!! warning "DZ 前缀规则"
    **您不能将这些地址用于：**

    - 您自己的网络设备
    - DIA 接口上的点对点链路
    - 管理接口
    - DZ 协议之外的任何基础设施

    **要求：**

    - 必须是**全球可路由（公共）**的 IPv4 地址
    - 私有 IP 范围（10.x、172.16-31.x、192.168.x）会被智能合约拒绝
    - **最小大小：/29**（8 个地址），推荐更大的前缀（例如 /28、/27）
    - 整个地址块必须可用——不要预先分配任何地址

    如果您需要为自己的设备分配地址（DIA 接口 IP、管理等），请使用**单独的地址池**。

---

## 阶段 2：账户设置

在此阶段，您将创建用于在网络上标识您和您设备的加密密钥，并指定奖励支付地址。

此阶段将生成三个密钥：服务密钥、指标发布密钥和奖励管理密钥。请在[步骤 2.4](#step-24-submit-keys-to-dzf) 中将这三个密钥的公钥一并提交给 DZF。[奖励管理](contribute-rewards.md)详细介绍了奖励相关内容。

### CLI 运行位置

!!! warning "请勿在交换机上安装 CLI"
    DoubleZero CLI (`doublezero`) 应安装在**管理服务器或虚拟机**上，而不是 Arista 交换机上。

    ```mermaid
    flowchart LR
        subgraph "管理服务器/虚拟机"
            CLI[DoubleZero CLI]
            KEYS[您的密钥对]
        end

        subgraph "您的 DZD 交换机"
            CA[配置代理]
            TA[遥测代理]
        end

        CLI -->|创建设备、链路| BC[区块链]
        CA -->|拉取配置| CTRL[控制器]
        TA -->|提交指标| BC
    ```

    | 安装在管理服务器上 | 安装在交换机上 |
    |--------------------|----------------|
    | `doublezero` CLI | 配置代理 |
    | 您的服务密钥对 | 遥测代理 |
    | 您的指标发布密钥对 | 指标发布密钥对（副本） |

### 什么是密钥？

可以将密钥理解为安全登录凭据：

- **服务密钥**：您的贡献者身份——用于运行 CLI 命令
- **指标发布密钥**：您设备提交遥测数据的身份标识
- **奖励管理密钥**：控制哪些钱包接收您的奖励——参见[奖励管理](contribute-rewards.md)

三者都是加密密钥对（一个用于共享的公钥和一个需要保密的私钥）。

```mermaid
flowchart LR
    subgraph "您的密钥"
        SK[服务密钥<br/>~/.config/solana/id.json]
        MK[指标发布密钥<br/>~/.config/doublezero/metrics-publisher.json]
        RK[奖励管理密钥<br/>离线保管]
    end

    SK -->|用于| CLI[CLI 命令<br/>doublezero device create<br/>doublezero link create]
    MK -->|用于| TEL[遥测代理<br/>在链上提交指标]
    RK -->|用于| REW[奖励门户<br/>设置接收钱包]
```

!!! note "单独保管奖励管理密钥"
    服务密钥和指标发布密钥存放在您的管理服务器和交换机上。奖励管理密钥控制您的资金去向，因此请将其存放在这些机器之外。只有在更改接收钱包时才需要使用它。

### 步骤 2.1：生成您的服务密钥

这是您与 DoubleZero 交互的主要身份标识。

```bash
doublezero keygen
```

这会在默认位置创建一个密钥对。输出会显示您的**公钥**——这是您需要与 DZF 共享的内容。

### 步骤 2.2：生成您的指标发布密钥

此密钥由遥测代理用于签名指标提交。

```bash
doublezero keygen -o ~/.config/doublezero/metrics-publisher.json
```

### 步骤 2.3：创建您的奖励管理钱包

这是第三个密钥。它控制哪些钱包接收您的奖励，但它本身不持有奖励。

创建一个您能控制和签名的 Solana 钱包，然后充入约 0.01 SOL 以支付交易手续费。硬件钱包是一个不错的选择。不要重复使用您的服务密钥。

目前您只需要准备好钱包。在 DZF 注册此密钥后，您将在[步骤 2.7](#step-27-set-your-reward-recipients) 中设置实际接收奖励的钱包。

### 步骤 2.4：向 DZF 提交密钥

联系 DoubleZero Foundation 或 Malbec Labs，提供以下信息：

1. 您的**服务密钥公钥**
2. 您的**奖励管理公钥**（来自步骤 2.3）
3. 您的 **GitHub 用户名**（用于获取仓库访问权限）

请一并发送所有三项。DZF 会通过单独的链上交易注册服务密钥和奖励管理密钥，因此同时发送可以减少一次往返。

!!! danger "仅提供公钥"
    切勿向任何人发送私钥或密钥对文件，包括 DZF。DZF 只需要您的公钥。

他们将：

- 在链上创建您的**贡献者账户**
- 将您的**奖励管理密钥**与服务密钥关联注册
- 授予您访问私有**贡献者仓库**的权限

### 步骤 2.5：验证您的账户

确认后，验证您的贡献者账户是否存在：

```bash
doublezero contributor list
```

您应该在列表中看到您的贡献者代码。

同时检查您的奖励管理密钥是否已注册：

```bash
doublezero-solana revenue-distribution fetch contributor-rewards \
    --service-key <YourServiceKeyPublicKey> -u mainnet-beta
```

`manager` 列应显示您的奖励管理公钥。如果为空，请要求 DZF 完成该步骤。

### 步骤 2.6：访问贡献者仓库

[malbeclabs/contributors](https://github.com/malbeclabs/contributors) 仓库包含：

- 基础设备配置
- TCAM 配置文件
- ACL 配置
- 额外的设置说明

请按照其中的说明进行设备特定的配置。

### 步骤 2.7：设置您的奖励接收方

现在指定哪些钱包接收您的奖励，以及各自的比例。请在您的设备开始承载流量之前完成此操作。奖励从您的链路上线那一刻就开始累积，但在您指定接收钱包之前，协议无法进行支付。

使用您的奖励管理钱包登录 [doublezero.xyz/rewards](https://doublezero.xyz/rewards)，选择您的服务密钥，然后输入每个接收钱包及其百分比。百分比之和必须为 100。

!!! warning "每个接收方都需要 2Z 代币账户"
    协议通过普通代币转账发送 2Z，不会为您创建代币账户。如果接收钱包没有 2Z 代币账户，会导致该纪元的支付失败。

参见[奖励管理](contribute-rewards.md)获取完整操作指南，包括 CLI 替代方式、如何检查代币账户以及如何验证结果。

---

## 阶段 3：设备配置

现在您将在区块链上注册您的物理设备并配置其接口。

### 了解设备类型

**边缘设备（Edge）** — 仅接受用户连接

```mermaid
flowchart LR
    subgraph EDZD[边缘 DZD]
        E_CYOA["DIA · CYOA 接口"]
        E_TUN["Loopback100/101
        (用户隧道端点)"]
        E_DZX["DZX 链路接口"]
        E_CYOA --- E_TUN
    end
    EU["用户"] -.|GRE 隧道|.-> E_CYOA
    E_DZX <-->|DZX 链路| ED["DZD（不同贡献者）"]
```

**中转设备（Transit）** — 在设备间转发流量，无用户连接

```mermaid
flowchart LR
    subgraph TDZD[中转 DZD]
        T_WAN["WAN 链路接口"]
        T_DZX["DZX 链路接口"]
    end
    T_WAN <-->|WAN 链路| T2["DZD（同一贡献者）"]
    T_DZX <-->|DZX 链路| TD["DZD（不同贡献者）"]
```

**混合设备（Hybrid）** — 用户连接和骨干传输兼备，最常见

```mermaid
flowchart LR
    subgraph HDZD[混合 DZD]
        H_CYOA["DIA · CYOA 接口"]
        H_TUN["Loopback100/101
        (用户隧道端点)"]
        H_WAN["WAN 链路接口"]
        H_DZX["DZX 链路接口"]
        H_CYOA --- H_TUN
    end
    HU["用户"] -.|GRE 隧道|.-> H_CYOA
    H_WAN <-->|WAN 链路| H2["DZD（同一贡献者）"]
    H_DZX <-->|DZX 链路| HD["DZD（不同贡献者）"]
```

| 类型 | 功能 | 适用场景 |
|------|------|----------|
| **边缘（Edge）** | 仅接受用户连接 | 单一位置，仅面向用户 |
| **中转（Transit）** | 在设备间转发流量 | 骨干连接，无用户 |
| **混合（Hybrid）** | 兼具用户连接和骨干功能 | 最常见——全能型 |

### 步骤 3.1：查找您的位置和交换点

在创建设备之前，查找您的数据中心位置和最近交换点的代码：

```bash
# 列出可用位置（数据中心）
doublezero location list

# 列出可用交换点（互联点）
doublezero exchange list
```

### 步骤 3.2：在链上创建您的设备

在区块链上注册您的设备：

```bash
doublezero device create \
  --code <YOUR_DEVICE_CODE> \
  --contributor <YOUR_CONTRIBUTOR_CODE> \
  --device-type hybrid \
  --location <LOCATION_CODE> \
  --exchange <EXCHANGE_CODE> \
  --public-ip <DEVICE_PUBLIC_IP> \
  --dz-prefixes <YOUR_DZ_PREFIX>
```

**示例：**

```bash
doublezero device create \
  --code nyc-dz001 \
  --contributor acme \
  --device-type hybrid \
  --location EQX-NY5 \
  --exchange nyc \
  --public-ip "203.0.113.10" \
  --dz-prefixes "198.51.100.0/28"
```

**预期输出：**

```
Signature: 4vKz8H...truncated...7xPq2
```

验证您的设备是否已创建：

```bash
doublezero device list | grep nyc-dz001
```

**参数说明：**

| 参数 | 含义 |
|------|------|
| `--code` | 您设备的唯一名称（例如 `nyc-dz001`） |
| `--contributor` | 您的贡献者代码（由 DZF 提供） |
| `--device-type` | `hybrid`、`transit` 或 `edge` |
| `--location` | 从 `location list` 获取的数据中心代码 |
| `--exchange` | 从 `exchange list` 获取的最近交换点代码 |
| `--public-ip` | 用户通过互联网连接到您设备的公共 IP |
| `--dz-prefixes` | 为用户分配的 IP 地址块 |

### 步骤 3.3：创建必需的环回接口

每个设备都需要两个用于内部路由的环回接口：

```bash
# VPNv4 环回
doublezero device interface create <DEVICE_CODE> Loopback255 --loopback-type vpnv4

# IPv4 环回
doublezero device interface create <DEVICE_CODE> Loopback256 --loopback-type ipv4
```

**预期输出（每条命令）：**

```
Signature: 3mNx9K...truncated...8wRt5
```

### 步骤 3.4：创建物理接口

注册将用于 WAN 或 DZX 链路的物理接口。这些接口必须先在链上存在，然后才能创建引用它们的链路。在此步骤中，您只需注册接口及其带宽，链路将在后续步骤中创建。

```bash
doublezero device interface create <DEVICE_CODE> <INTERFACE_NAME> \
  --bandwidth <PORT_SPEED>
```

**示例：**

```bash
doublezero device interface create nyc-dz001 Ethernet1/1 \
  --bandwidth 10Gbps
```

**预期输出：**

```
Signature: 7pQw2R...truncated...4xKm9
```

对每个将用作 WAN 或 DZX 链路端点的接口重复此操作。CYOA 和 DIA 接口将在下一步骤中单独注册。

### 步骤 3.5：创建 CYOA 接口（适用于边缘/混合设备）

混合和边缘 DZD 需要**两个公共 IP 地址**供用户终止其 GRE 隧道。用户可以通过单播、组播或两者同时连接，哪个 IP 服务于哪个用途会按用户轮换。

两个 IP 都必须以 `--user-tunnel-endpoint true` 注册，可以在物理接口或环回接口上。这包括您在设备创建时提供的 IP——该 IP 仍需在此处显式注册。

如果您的 IP 资源紧张，可以使用 DZ 前缀的第一个 `/32` 作为两个 IP 之一。

#### CYOA 和 DIA

| 类型 | 标志 | 用途 |
|------|------|------|
| DIA | `--interface-dia dia` | 将端口标记为直接互联网接入 |
| CYOA | `--interface-cyoa <subtype>` | 声明用户如何将 GRE 隧道连接到您的设备 |

CYOA 标志始终设置在**物理接口**（以太网端口或端口通道）上，不能设置在环回接口上。

| CYOA 子类型 | 使用场景 |
|-------------|----------|
| `gre-over-dia` | 用户通过公共互联网连接。最常见。 |
| `gre-over-private-peering` | 用户通过直连交叉连接或专用线路连接 |
| `gre-over-public-peering` | 用户在互联网交换中心 (IX) 与您对等 |
| `gre-over-fabric` | 用户同地部署，通过本地交换网络连接 |
| `gre-over-cable` | 直接线缆连接到单个专用用户 |

#### 场景 A：单物理接口

一条连接到 ISP 的物理上行链路。Ethernet1/1 是 CYOA 和 DIA 接口，承载两个公共 IP 之一。Loopback100 承载第二个公共 IP。

```mermaid
flowchart LR
    USERS(["终端用户"])

    subgraph DZD["DZD"]
        E1["Eth1/1
        203.0.113.1/30
        CYOA · DIA · 用户隧道端点"]
        LO["Loopback100
        198.51.100.1/32\n        用户隧道端点"]
        E1 --- LO
    end

    ISP["ISP 路由器
    203.0.113.2/30"]

    ISP -- "10GbE" --- E1
    USERS -. "GRE 隧道" .-> E1
    USERS -. "GRE 隧道" .-> LO
```

| 接口 | `--interface-cyoa` | `--interface-dia` | `--ip-net` | `--bandwidth` | `--cir` | `--routing-mode` | `--user-tunnel-endpoint` |
|------|-------------------|------------------|------------|---------------|---------|-----------------|--------------------------|
| Ethernet1/1 | `gre-over-dia` | `dia` | 贡献者分配的 IP/子网 | 端口速率 | 承诺速率 | `bgp` 或 `static` | `true` |
| Loopback100 | — | — | 您的公共 /32 | `0bps` | — | — | `true` |

基于场景 A 执行的命令示例：
```bash
doublezero device interface create mydzd-nyc01 Ethernet1/1 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --ip-net 203.0.113.1/30 \
  --bandwidth 10Gbps \
  --cir 1Gbps \
  --routing-mode bgp \
  --user-tunnel-endpoint true

doublezero device interface create mydzd-nyc01 Loopback100 \
  --ip-net 198.51.100.1/32 \
  --bandwidth 0bps \
  --user-tunnel-endpoint true
```

#### 场景 B：端口通道（LAG）

DZD 通过带有 IP 的端口通道连接到上游设备。端口通道承载一个公共 IP，作为 CYOA 端点。Loopback100 承载第二个公共 IP。

```mermaid
flowchart LR
    USERS(["终端用户"])

    subgraph SW["上游路由器/交换机"]
        SWPC(["bond0
        203.0.113.2/30"])
    end

    subgraph DZD["DZD"]
        subgraph PC["Port-Channel1 · 203.0.113.1/30 · CYOA · DIA · 用户隧道端点"]
            E1["Eth1/1"]
            E2["Eth2/1"]
        end
        LO["Loopback100
        198.51.100.1/32\n        用户隧道端点"]
        PC --- LO
    end

    SWPC -- "2x 10GbE" --- PC
    USERS -. "GRE 隧道" .-> PC
    USERS -. "GRE 隧道" .-> LO
```

| 接口 | `--interface-cyoa` | `--interface-dia` | `--ip-net` | `--bandwidth` | `--cir` | `--routing-mode` | `--user-tunnel-endpoint` |
|------|-------------------|------------------|------------|---------------|---------|-----------------|--------------------------|
| Port-Channel1 | `gre-over-dia` | `dia` | 贡献者分配的 IP/子网 | LAG 组合速率 | 承诺速率 | `bgp` 或 `static` | `true` |
| Loopback100 | — | —