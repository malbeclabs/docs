---
description: DoubleZero 文档中使用的特定术语定义。
---

# 术语表

本页定义了文档中使用的 DoubleZero 特定术语。

---

## 网络基础设施

### DZD（DoubleZero Device，DoubleZero 设备）
终结 DoubleZero 链路并运行 DoubleZero Agent 软件的物理网络交换硬件。DZD 部署在数据中心，提供路由、数据包处理和用户连接服务。每个 DZD 需要满足特定的[硬件规格](contribute.md#dzd-network-hardware)，并同时运行 [Config Agent](#config-agent) 和 [Telemetry Agent](#telemetry-agent)。

### DZX（DoubleZero Exchange，DoubleZero 交换点）
网状网络中的互联点，不同[贡献者](#contributor)的链路在此桥接。DZX 位于主要大都市区域（如纽约、伦敦、东京），即网络交汇处。网络贡献者必须在最近的 DZX 将其链路交叉连接到更广泛的 DoubleZero 网状网络中。概念上类似于互联网交换点（IX）。

### WAN Link（广域网链路）
由**同一**贡献者运营的两个 [DZD](#dzd-doublezero-device) 之间的广域网链路。WAN 链路在单个贡献者的基础设施内提供骨干连接。

### DZX Link（DZX 链路）
由**不同**贡献者运营的 [DZD](#dzd-doublezero-device) 之间在 [DZX](#dzx-doublezero-exchange) 处建立的链路。DZX 链路需要双方明确接受。

### DZ Prefix（DZ 前缀）
以 CIDR 格式分配给 [DZD](#dzd-doublezero-device) 的 IP 地址，用于覆盖网络寻址。在[设备创建](contribute-provisioning.md#step-32-create-your-device-onchain)时通过 `--dz-prefixes` 参数指定。

---

## 设备类型

### Edge Device（边缘设备）
为用户提供 DoubleZero 网络连接的 [DZD](#dzd-doublezero-device)。边缘设备利用 [CYOA](#cyoa-choose-your-own-adventure) 接口来终结用户（验证者、RPC 运营者）并将其连接到网络。

### Transit Device（中转设备）
在 DoubleZero 网络内提供骨干连接的 [DZD](#dzd-doublezero-device)。中转设备在 DZD 之间转发流量，但不直接终结用户连接。

### Hybrid Device（混合设备）
同时具备[边缘](#edge-device)和[中转](#transit-device)功能的 [DZD](#dzd-doublezero-device)，既提供用户连接又提供骨干路由。

---

## 连接方式

### CYOA（Choose Your Own Adventure，自选连接方式）
允许[贡献者](#contributor)注册连接选项的接口类型，供用户连接到 DoubleZero 网络。CYOA 接口包括 [DIA](#dia-direct-internet-access)、GRE 隧道和私有对等互联等多种方式。配置详情请参阅[创建 CYOA 接口](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)。

### DIA（Direct Internet Access，直接互联网接入）
通过公共互联网提供连接的标准网络术语。在 DoubleZero 中，DIA 是一种 [CYOA](#cyoa-choose-your-own-adventure) 接口类型，用户（验证者、RPC 运营者）通过其现有的互联网连接接入 [DZD](#dzd-doublezero-device)。

### IBRL（Increase Bandwidth Reduce Latency，增加带宽降低延迟）
一种连接模式，允许验证者和 RPC 节点无需重启区块链客户端即可连接到 DoubleZero。IBRL 使用现有的公网 IP 地址，并与最近的 [DZD](#dzd-doublezero-device) 建立覆盖隧道。设置说明请参阅[主网测试版连接](DZ%20Mainnet-beta%20Connection.md)。

### Multicast（组播）
DoubleZero 支持的一对多数据包传递方式。组播模式有两种角色：**发布者**（publisher，通过网络发送数据包）和**订阅者**（subscriber，从发布者接收数据包）。开发团队用于高效的数据分发。连接详情请参阅[其他组播连接](Other%20Multicast%20Connection.md)。

---

## 软件组件

### doublezerod
运行在用户服务器（验证者、RPC 节点）上的 DoubleZero 守护进程服务。它管理与 DoubleZero 网络的连接，处理隧道建立，并维持与 [DZD](#dzd-doublezero-device) 的连接。通过 systemd 配置，并通过 [`doublezero`](#doublezero-cli) CLI 控制。

### doublezero (CLI)
与 DoubleZero 网络交互的命令行界面。用于连接、管理身份、检查状态和管理操作。与 [`doublezerod`](#doublezerod) 守护进程通信。

### Config Agent（配置代理）
运行在 [DZD](#dzd-doublezero-device) 上的软件代理，管理设备配置。从 [Controller](#controller) 服务读取配置并将更改应用到设备。设置请参阅 [Config Agent 安装](contribute-provisioning.md#step-44-install-config-agent)。

### Telemetry Agent（遥测代理）
运行在 [DZD](#dzd-doublezero-device) 上的软件代理，收集性能指标（延迟、抖动、丢包率）并提交到 DoubleZero 账本。设置请参阅 [Telemetry Agent 安装](contribute-provisioning.md#step-45-install-telemetry-agent)。

### Controller（控制器）
为 [DZD](#dzd-doublezero-device) 代理提供配置的服务。Controller 从 DoubleZero 账本上的[链上](#onchain)状态派生设备配置。

---

## 链路状态

### Activated（已激活）
链路的正常运行状态。流量通过该链路传输，并参与路由决策。

### Soft-Drained（软排空）
一种维护状态，流量将被引导远离特定链路。用于优雅的维护窗口。可以转换为[已激活](#activated)或[硬排空](#hard-drained)状态。

### Hard-Drained（硬排空）
一种维护状态，链路完全从服务中移除。没有流量通过该链路。必须先转换为[软排空](#soft-drained)状态才能恢复到[已激活](#activated)状态。

---

## 组织与代币

### DZF（DoubleZero Foundation，DoubleZero 基金会）
DoubleZero 基金会是一家无会员制的开曼群岛非营利性基金会公司，成立旨在支持 DoubleZero 网络的开发、去中心化、安全性和推广。

### 2Z Token（2Z 代币）
DoubleZero 网络的原生代币。用于支付验证者费用并作为奖励分发给[贡献者](#contributor)。验证者可以通过链上兑换程序使用 2Z 支付费用。请参阅[将 SOL 兑换为 2Z](Swapping-sol-to-2z.md)。

### Contributor（贡献者）
为 DoubleZero 网络贡献带宽和硬件的网络基础设施提供者。贡献者运营 [DZD](#dzd-doublezero-device)，提供 [WAN](#wan-link) 和 [DZX](#dzx-link) 链路，并因其贡献获得 [2Z](#2z-token) 代币激励。入门请参阅[贡献者文档](contribute-overview.md)。

---

## 网络概念

### MTU（Maximum Transmission Unit，最大传输单元）
可以通过网络链路传输的最大数据包大小（以字节为单位）。DoubleZero WAN 链路通常使用 MTU 9000（巨型帧）以提高效率。

### VRF（Virtual Routing and Forwarding，虚拟路由和转发）
一种允许同一物理路由器上存在多个隔离路由表的技术。贡献者通常使用单独的管理 VRF 将交换机管理流量与生产流量隔离。

### GRE（Generic Routing Encapsulation，通用路由封装）
一种将网络数据包封装在 IP 数据包内的隧道协议。被 [IBRL](#ibrl-increase-bandwidth-reduce-latency) 和 [CYOA](#cyoa-choose-your-own-adventure) 连接用于在用户和 DZD 之间创建覆盖隧道。

### BGP（Border Gateway Protocol，边界网关协议）
用于在互联网上的网络之间交换路由信息的路由协议。DoubleZero 内部使用 BGP，ASN 为 65342。

### ASN（Autonomous System Number，自治系统号）
分配给网络用于 BGP 路由的唯一标识符。所有 DoubleZero 设备的内部 BGP 进程使用 **ASN 65342**。

### Loopback Interface（环回接口）
路由器/交换机上用于管理和路由目的的虚拟网络接口。DZD 使用 Loopback255（VPNv4）和 Loopback256（IPv4）进行内部路由。

### CIDR（Classless Inter-Domain Routing，无类别域间路由）
用于指定 IP 地址范围的表示法。格式为 `IP/prefix-length`，其中前缀长度表示网络大小（例如，`/29` = 8 个地址，`/24` = 256 个地址）。

### Jitter（抖动）
数据包延迟随时间的变化。低抖动对实时应用至关重要。

### RTT（Round-Trip Time，往返时间）
数据包从源到目的地再返回所需的时间。用于测量设备之间的网络延迟。

### TWAMP（Two-Way Active Measurement Protocol，双向主动测量协议）
一种用于测量延迟和丢包率等网络性能指标的协议。[Telemetry Agent](#telemetry-agent) 使用 TWAMP 在 DZD 之间收集指标。

### IS-IS（Intermediate System to Intermediate System，中间系统到中间系统）
DoubleZero 网络内部使用的链路状态路由协议。在[链路排空](#soft-drained)操作期间会调整 IS-IS 指标。

---

## 地理定位

### Geolocation（地理定位）
DoubleZero 的一项服务，通过延迟测量验证设备的物理位置。已知位置的基础设施（[DZD](#dzd-doublezero-device)）与目标设备之间的 [RTT](#rtt-round-trip-time) 测量提供加密签名的证明，证明设备在参考点的一定距离范围内。测量数据的链上记录计划在未来版本中实现。用户文档请参阅[地理定位](geolocation.md)。

### geoProbe（地理探针）
在[地理定位](#geolocation)系统中充当延迟测量中介的裸机服务器。geoProbe 位于 [DZD](#dzd-doublezero-device) ~1ms 范围内，从父级 DZD 接收签名的 LocationOffset，并通过 [TWAMP](#twamp-two-way-active-measurement-protocol)、签名 TWAMP 或 ICMP echo 测量到目标设备的 [RTT](#rtt-round-trip-time)。每个 geoProbe 在[链上](#onchain)注册并关联到一个或多个父级 DZD。贡献者文档请参阅 [Geoprobe 部署](contribute-geolocation.md)。

### LocationOffset（位置偏移）
一种签名数据结构，包含 [DZD](#dzd-doublezero-device) 的地理位置（经纬度）以及实体之间的延迟关系链（DZD↔Probe 或 Probe↔Target）。LocationOffset 使用 Ed25519 签名，并通过 UDP 在测量链中发送。组合偏移包含对先前测量的引用，形成可审计的追踪链。

---

## 区块链与密钥

### Onchain（链上）
在 DoubleZero 的语境中，链上指的是记录在 DoubleZero 账本上的数据和操作。与传统网络中设备和链路配置存储在集中管理系统中不同，DoubleZero 将设备注册、链路配置和遥测提交记录在链上——使网络状态对所有参与者透明且可验证。

### Service Key（服务密钥）
用于验证 CLI 操作的加密密钥对。这是您与 DoubleZero 智能合约交互的贡献者身份。存储在 `~/.config/solana/id.json`。

### Metrics Publisher Key（指标发布密钥）
[Telemetry Agent](#telemetry-agent) 用于签名向区块链提交指标的加密密钥对。出于安全隔离的目的，与服务密钥分开。存储在 `~/.config/doublezero/metrics-publisher.json`。

---

## 硬件与软件

### EOS（Extensible Operating System，可扩展操作系统）
Arista 的网络操作系统，运行在 DZD 交换机上。贡献者将 [Config Agent](#config-agent) 和 [Telemetry Agent](#telemetry-agent) 作为 EOS 扩展安装。

### EOS Extension（EOS 扩展）
可以安装在 Arista EOS 交换机上的软件包。DZ 代理以 `.rpm` 文件形式分发，通过 `extension` 命令安装。